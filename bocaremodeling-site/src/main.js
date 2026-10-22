/* Boca Remodeling Group : la scène de l'accueil (l'esquisse, la 3D, la pièce construite), la liste des camions, la
   visionneuse, les horaires du bureau et la demande de devis. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  root.classList.add('js');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 1024px)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const out3 = (t) => 1 - (1 - t) ** 3;
  const inOut3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

  /* ——— le défilement : Lenis, sauf en mouvement réduit ——— */
  let lenis = null;
  if (!still.matches && window.Lenis) {
    lenis = new window.Lenis({lerp: 0.1, wheelMultiplier: 0.9, smoothWheel: true});
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
  const top = $('.top');
  const headH = () => top.getBoundingClientRect().height;
  const scrollToY = (y, done) => {
    y = Math.max(0, y);
    if (lenis) lenis.scrollTo(y, {duration: 1.3, onComplete: done});
    else {
      window.scrollTo({top: y, behavior: still.matches ? 'auto' : 'smooth'});
      done?.();
    }
  };
  // les liens internes passent par Lenis ; le titre de la section visée prend le focus (clavier, lecteurs d'écran)
  for (const a of $$('a[href^="#"]')) {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      const y = id === 'main' ? 0 : el.getBoundingClientRect().top + window.scrollY - headH() + 1;
      scrollToY(y, () => {
        const h = id === 'main' ? $('h1') : el.querySelector('h2');
        if (h) {
          h.setAttribute('tabindex', '-1');
          h.focus({preventScroll: true});
        }
      });
      history.replaceState(null, '', id === 'main' ? location.pathname : `#${id}`);
    });
  }

  /* ——— l'en-tête : il s'efface quand on descend, revient quand on remonte (jamais pendant l'accueil) ——— */
  const hero = $('.hero');
  let lastY = window.scrollY;
  // la hauteur de l'en-tête et le bas de l'accueil sont mesurés avec la scène (measure), pas à chaque défilement
  let topH = headH();
  let heroEnd = Infinity;
  const onScroll = () => {
    const y = window.scrollY;
    top.classList.toggle('is-scrolled', y > 8);
    const inHero = y + topH < heroEnd;
    const open = top.classList.contains('is-open');
    if (!open && !inHero && !top.contains(document.activeElement) && y > lastY + 2) top.classList.add('is-hidden');
    if (y < lastY - 2 || inHero) top.classList.remove('is-hidden');
    lastY = y;
  };
  addEventListener('scroll', onScroll, {passive: true});
  top.addEventListener('focusin', () => top.classList.remove('is-hidden'));

  /* ——— la section où l'on est, marquée dans le menu ——— */
  const navLinks = $$('.nav__list a');
  const here = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        for (const a of navLinks) {
          if (a.getAttribute('href') === `#${e.target.id}`) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        }
      }
    },
    {rootMargin: '-45% 0px -50% 0px'},
  );
  for (const s of $$('main > section[id]')) here.observe(s);

  /* ——— le menu du téléphone ——— */
  const menuBtn = $('.menu-btn');
  const main = $('main');
  const foot = $('.foot');
  function closeMenu() {
    if (!top.classList.contains('is-open')) return;
    top.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    main.inert = false;
    foot.inert = false;
    root.style.overflow = '';
    lenis?.start();
  }
  menuBtn.addEventListener('click', () => {
    if (top.classList.contains('is-open')) return closeMenu();
    top.classList.add('is-open');
    top.classList.remove('is-hidden');
    menuBtn.setAttribute('aria-expanded', 'true');
    // la page ne défile plus et ne se lit plus derrière le menu ; le focus va au premier lien
    main.inert = true;
    foot.inert = true;
    root.style.overflow = 'hidden';
    lenis?.stop();
    $('.nav__list a').focus();
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && top.classList.contains('is-open')) {
      closeMenu();
      menuBtn.focus();
    }
  });
  wide.addEventListener('change', closeMenu);

  /* ——— la scène de l'accueil ———
     Trois calques : l'esquisse, la 3D, la pièce construite. Chaque image connaît le cadre de sa porte du fond
     (data-door, en fractions de l'image). Au repos, une image couvre la scène, cadrée sur sa porte. Pendant un passage,
     l'image suivante apparaît dans un rectangle qui part de sa porte et grandit jusqu'aux bords ; l'image précédente
     avance (de l'esquisse à la 3D) ou l'image suivante recule (de la 3D à la photo), de sorte que les deux portes
     coïncident : même axe, même ligne du sol, même hauteur. */
  const stage = $('.stage');
  const track = $('.hero__track');
  const pin = $('.hero__pin');
  const edge = $('.stage__edge');
  const steps = $('.steps');
  const copy = $('.hero__copy');
  const stepBtns = $$('.steps__btn');
  const layers = $$('.stage__layer', stage).map((el) => {
    const img = el.querySelector('img');
    const w = +img.getAttribute('width');
    const h = +img.getAttribute('height');
    const [x0, y0, x1, y1] = img.dataset.door.split(' ').map(Number);
    img.style.width = `${w}px`;
    img.style.height = `${h}px`;
    return {el, img, w, h, door: {x0: x0 * w, y0: y0 * h, x1: x1 * w, y1: y1 * h}};
  });
  let W = 0;
  let H = 0;
  let rests = [];
  const restOf = (L) => {
    const s = Math.max(W / L.w, H / L.h);
    const cx = (L.door.x0 + L.door.x1) / 2;
    const cy = (L.door.y0 + L.door.y1) / 2;
    return {
      s,
      tx: clamp(W / 2 - cx * s, W - L.w * s, 0),
      ty: clamp(H * 0.46 - cy * s, H - L.h * s, 0),
    };
  };
  // L calé sur T (posé en t) : les portes ont même axe, même ligne du sol et même hauteur
  const alignTo = (L, T, t) => {
    const s = (t.s * (T.door.y1 - T.door.y0)) / (L.door.y1 - L.door.y0);
    return {
      s,
      tx: t.tx + ((T.door.x0 + T.door.x1) / 2) * t.s - ((L.door.x0 + L.door.x1) / 2) * s,
      ty: t.ty + T.door.y1 * t.s - L.door.y1 * s,
    };
  };
  const mix = (a, b, k) => ({s: lerp(a.s, b.s, k), tx: lerp(a.tx, b.tx, k), ty: lerp(a.ty, b.ty, k)});
  const doorRect = (L, t) => ({x: t.tx + L.door.x0 * t.s, y: t.ty + L.door.y0 * t.s, w: (L.door.x1 - L.door.x0) * t.s, h: (L.door.y1 - L.door.y0) * t.s});
  const grow = (r, k) => ({x: lerp(r.x, 0, k), y: lerp(r.y, 0, k), w: lerp(r.w, W, k), h: lerp(r.h, H, k)});
  const place = (L, t) => {
    L.img.style.transform = `translate3d(${t.tx.toFixed(2)}px, ${t.ty.toFixed(2)}px, 0) scale(${t.s.toFixed(5)})`;
  };
  const clip = (L, r) => {
    if (!r) {
      L.el.style.clipPath = '';
      L.el.style.visibility = '';
      return;
    }
    if (r === 'none') {
      L.el.style.visibility = 'hidden';
      return;
    }
    L.el.style.visibility = '';
    L.el.style.clipPath = `inset(${r.y.toFixed(1)}px ${(W - r.x - r.w).toFixed(1)}px ${(H - r.y - r.h).toFixed(1)}px ${r.x.toFixed(1)}px)`;
  };
  const showEdge = (r) => {
    if (!r) {
      edge.style.opacity = '0';
      return;
    }
    edge.style.opacity = '1';
    edge.style.transform = `translate3d(${r.x.toFixed(1)}px, ${r.y.toFixed(1)}px, 0)`;
    edge.style.width = `${r.w.toFixed(1)}px`;
    edge.style.height = `${r.h.toFixed(1)}px`;
  };
  // l'ouverture (0 → 1) : l'esquisse s'ouvre depuis sa porte quand la page arrive
  let intro = root.classList.contains('intro') ? 0 : 1;
  let current = -1;
  const setStep = (i) => {
    if (i === current) return;
    current = i;
    stepBtns.forEach((b, k) => (k === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
  };
  // p : de 0 (l'esquisse) à 1 (la pièce construite)
  const draw = (p) => {
    if (!W) return;
    const [S, R, P] = layers;
    const [rS, rR, rP] = rests;
    const t1 = clamp((p - 0.04) / 0.4);
    const t2 = clamp((p - 0.52) / 0.4);
    // l'esquisse avance vers la porte de la 3D
    place(S, mix(rS, alignTo(S, R, rR), out3(t1)));
    place(R, rR);
    // la photo part de l'échelle de la 3D et recule jusqu'à son cadre
    const pAt = mix(alignTo(P, R, rR), rP, out3(t2));
    place(P, pAt);
    let line = null;
    if (t1 <= 0) clip(R, 'none');
    else if (t1 >= 1) clip(R, null);
    else clip(R, (line = grow(doorRect(R, rR), inOut3(t1))));
    if (t2 <= 0) clip(P, 'none');
    else if (t2 >= 1) clip(P, null);
    else clip(P, (line = grow(doorRect(P, pAt), inOut3(t2))));
    // pendant l'ouverture, l'esquisse apparaît dans un rectangle qui part de sa porte ; si l'on défile déjà, elle s'arrête
    if (intro < 1 && t1 > 0) intro = 1;
    if (intro < 1) clip(S, (line = grow(doorRect(S, rS), inOut3(intro))));
    else if (S.el.style.clipPath) clip(S, null);
    S.el.style.visibility = t1 >= 1 ? 'hidden' : '';
    showEdge(line);
    setStep(t2 >= 0.5 ? 2 : t1 >= 0.5 ? 1 : 0);
    steps.style.setProperty('--p', p.toFixed(4));
  };
  let isPinned = false;
  const pinned = () => isPinned;
  let trackTop = 0;
  let span = 1;
  let pinTop = 0;
  let still_p = 0;
  const measure = () => {
    // sur téléphone, la scène se fige sous l'en-tête : le texte d'introduction, au-dessus d'elle, est déjà passé
    if (!wide.matches && !still.matches) {
      const shift = stage.offsetTop - 12;
      pin.style.top = `${headH() - shift}px`;
      track.style.height = `${pin.offsetHeight + 1.6 * innerHeight}px`;
    } else {
      pin.style.top = '';
      track.style.height = '';
    }
    const r = stage.getBoundingClientRect();
    W = r.width;
    H = r.height;
    rests = layers.map(restOf);
    pinTop = parseFloat(getComputedStyle(pin).top) || 0;
    trackTop = track.getBoundingClientRect().top + window.scrollY;
    span = Math.max(1, track.offsetHeight - pin.offsetHeight);
    isPinned = !still.matches && getComputedStyle(pin).position === 'sticky';
    topH = headH();
    heroEnd = hero.getBoundingClientRect().bottom + window.scrollY;
    tick();
  };
  const progress = () => (pinned() ? clamp((window.scrollY + pinTop - trackTop) / span) : still_p);
  const tick = () => draw(progress());
  addEventListener('scroll', tick, {passive: true});
  new ResizeObserver(measure).observe(stage);
  addEventListener('resize', measure);
  still.addEventListener('change', measure);
  addEventListener('load', measure);
  document.fonts?.ready.then(measure);
  measure();
  /* ——— l'ouverture : le titre monte derrière son cache, l'esquisse s'ouvre depuis sa porte (le geste de toute la page),
     puis le texte et les étapes arrivent ——— */
  const openHero = async () => {
    await Promise.race([Promise.all([document.fonts?.ready, layers[0].img.decode?.()]).catch(() => {}), new Promise((r) => setTimeout(r, 600))]);
    if (intro >= 1) return root.classList.remove('intro');
    const parts = $$('.hero__title > span').map((el, i) => {
      const html = el.innerHTML;
      el.classList.add('ln');
      el.innerHTML = `<span class="ln__in" style="--i:${i}">${html}</span>`;
      return () => {
        el.classList.remove('ln');
        el.innerHTML = html;
      };
    });
    tick();
    root.classList.replace('intro', 'intro-run');
    setTimeout(() => {
      for (const restore of parts) restore();
      root.classList.remove('intro-run');
    }, 1900);
    const t0 = performance.now() + 200;
    const frame = (now) => {
      if (intro < 1) intro = clamp((now - t0) / 1100);
      tick();
      if (intro < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  if (intro < 1) openHero();
  // les étapes : on va à l'état choisi (en faisant défiler la scène, ou directement en mouvement réduit)
  const AT = [0, 0.48, 1];
  stepBtns.forEach((b, i) =>
    b.addEventListener('click', () => {
      if (pinned()) scrollToY(trackTop - pinTop + AT[i] * span + 1);
      else {
        still_p = AT[i];
        tick();
      }
    }),
  );

  /* ——— la liste des camions : chaque métier montre une photo, qui s'ouvre depuis son centre ——— */
  const trades = $$('.trade');
  $('.trades__hint').hidden = false;
  const imgs = Object.fromEntries($$('[data-trade-img]').map((i) => [i.dataset.tradeImg, i]));
  const cap = $('.trades__cap');
  const tEdge = $('.trades__edge');
  const CAPS = {
    trucks: 'The list on our truck doors, at a roof job.',
    kitchens: 'A kitchen going in: white cabinets, quartzite counters, a brass faucet.',
    bathrooms: 'A bath in blue-gray stone, with a freestanding tub and a brass floor faucet.',
    windows: 'Windows are on the list too: it’s painted on every truck door.',
    roofs: 'Our crew taking off an old tile roof. The new tiles went up by crane.',
    pools: 'A pool under its screen cage, by the golf course.',
  };
  const IMG_OF = {windows: 'trucks'};
  let shown = imgs.trucks;
  let chosen = 'trucks';
  const showTrade = (key) => {
    const next = imgs[IMG_OF[key] || key];
    cap.textContent = CAPS[key];
    if (next === shown) return;
    const prev = shown;
    shown = next;
    for (const i of Object.values(imgs)) i.classList.toggle('is-top', i === next);
    next.loading = 'eager';
    next.classList.remove('is-on');
    void next.offsetWidth;
    next.classList.add('is-on');
    tEdge.classList.remove('is-run');
    void tEdge.offsetWidth;
    if (!still.matches) tEdge.classList.add('is-run');
    setTimeout(() => {
      if (prev !== shown) prev.classList.remove('is-on');
    }, 820);
  };
  for (const b of trades) {
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      for (const x of trades) x.setAttribute('aria-pressed', String(on && x === b));
      chosen = on ? b.dataset.trade : 'trucks';
      showTrade(chosen);
    });
    // à la souris, le survol montre la photo ; en quittant la liste, on revient au métier choisi
    b.addEventListener('pointerenter', () => fine.matches && showTrade(b.dataset.trade));
  }
  $('.trades__title').addEventListener('pointerleave', () => fine.matches && showTrade(chosen));
  // les photos de la liste se chargent quand la section approche
  new IntersectionObserver(
    (entries, obs) => {
      if (!entries[0].isIntersecting) return;
      for (const i of Object.values(imgs)) i.loading = 'eager';
      obs.disconnect();
    },
    {rootMargin: '600px 0px'},
  ).observe($('.trades'));

  /* ——— la visionneuse : les photos d'un projet ; la vignette devient la photo (transition de vue) ——— */
  const viewer = $('.viewer');
  const vList = $('.viewer__list');
  const vTitle = $('.viewer__title');
  const vCount = $('.viewer__count');
  const vPrev = $('.viewer__prev');
  const vNext = $('.viewer__next');
  const vClose = $('.viewer__close');
  let vIndex = 0;
  let vTotal = 0;
  let opener = null;
  const vState = () => {
    vCount.textContent = `${vIndex + 1} of ${vTotal}`;
    vPrev.disabled = vIndex === 0;
    vNext.disabled = vIndex === vTotal - 1;
  };
  const vShow = (i, smooth = true) => {
    vIndex = clamp(i, 0, vTotal - 1);
    const li = vList.children[vIndex];
    if (li) vList.scrollTo({left: li.offsetLeft, behavior: smooth && !still.matches ? 'smooth' : 'auto'});
    const near = vList.children[vIndex + 1]?.querySelector('img');
    if (near) near.loading = 'eager';
    vState();
  };
  const vOpen = async (set, from = null, at = 0) => {
    const tpl = document.getElementById(`set-${set}`);
    if (!tpl) return;
    opener = from;
    vList.replaceChildren(tpl.content.cloneNode(true));
    vTitle.textContent = tpl.dataset.title;
    vTotal = vList.children.length;
    vIndex = clamp(at, 0, vTotal - 1);
    // la photo choisie : celle sur laquelle on a cliqué (ou la première du projet)
    const first = vList.children[vIndex]?.querySelector('img');
    if (first) first.loading = 'eager';
    const open = () => {
      viewer.showModal();
      lenis?.stop();
      root.style.overflow = 'hidden';
      vShow(vIndex, false);
      vClose.focus({preventScroll: true});
    };
    const thumb = from?.querySelector('img');
    if (!document.startViewTransition || still.matches || !thumb || !first) return open();
    // la photo d'arrivée doit être prête avant la prise de vue de la transition
    await Promise.race([first.decode().catch(() => {}), new Promise((r) => setTimeout(r, 350))]);
    thumb.style.viewTransitionName = 'photo';
    const vt = document.startViewTransition(() => {
      thumb.style.viewTransitionName = '';
      first.style.viewTransitionName = 'photo';
      open();
    });
    vt.finished.finally(() => {
      first.style.viewTransitionName = '';
    });
  };
  viewer.addEventListener('close', () => {
    lenis?.start();
    root.style.overflow = '';
    vList.replaceChildren();
    opener?.focus({preventScroll: true});
  });
  vClose.addEventListener('click', () => viewer.close());
  vPrev.addEventListener('click', () => vShow(vIndex - 1));
  vNext.addEventListener('click', () => vShow(vIndex + 1));
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') (e.preventDefault(), vShow(vIndex + 1));
    if (e.key === 'ArrowLeft') (e.preventDefault(), vShow(vIndex - 1));
    if (e.key === 'Home') (e.preventDefault(), vShow(0));
    if (e.key === 'End') (e.preventDefault(), vShow(vTotal - 1));
  });
  // au doigt, la photo arrêtée devient la photo en cours
  let settle = 0;
  vList.addEventListener(
    'scroll',
    () => {
      clearTimeout(settle);
      settle = setTimeout(() => {
        const i = Math.round(vList.scrollLeft / Math.max(1, vList.clientWidth));
        if (i !== vIndex) {
          vIndex = clamp(i, 0, vTotal - 1);
          vState();
        }
        const near = vList.children[vIndex + 1]?.querySelector('img');
        if (near) near.loading = 'eager';
      }, 90);
    },
    {passive: true},
  );
  // un clic sur le fond (hors photo) referme
  viewer.addEventListener('click', (e) => {
    if (e.target === viewer || e.target.tagName === 'LI') viewer.close();
  });
  for (const b of $$('[data-set]')) b.addEventListener('click', () => vOpen(b.dataset.set, b, +(b.dataset.at || 0)));

  /* ——— les apparitions, une fois chacune : les titres montent ligne à ligne derrière leur cache ; les photos des
     projets s'ouvrent depuis leur centre, avec le trait bleu, comme les pièces de l'accueil ——— */
  if (!still.matches && 'IntersectionObserver' in window) {
    const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const mask = (t, i) => `<span class="ln"><span class="ln__in" style="--i:${i}">${esc(t)}</span></span>`;
    // un titre coupé en lignes, telles que la page les affiche (mesurées au moment où il apparaît)
    const split = (el) => {
      const text = el.textContent.trim();
      el.innerHTML = text
        .split(/\s+/)
        .map((w) => `<span>${esc(w)}</span>`)
        .join(' ');
      const rows = [];
      let y = null;
      for (const w of el.children) {
        if (y === null || Math.abs(w.offsetTop - y) > 4) (rows.push([]), (y = w.offsetTop));
        rows.at(-1).push(w.textContent);
      }
      el.innerHTML = rows.map((r, i) => mask(r.join(' '), i)).join(' ');
      return {n: rows.length, restore: () => (el.textContent = text)};
    };
    // la liste des camions : un mot par ligne, chacun dans son bouton
    const splitTrades = (el) => {
      const words = $$('.trade', el).map((b) => [b, b.textContent]);
      for (const [i, [b, t]] of words.entries()) b.innerHTML = mask(t, i);
      return {n: words.length, restore: () => words.forEach(([b, t]) => (b.textContent = t))};
    };
    const rise = (el) => {
      const {n, restore} = el.classList.contains('trades__title') ? splitTrades(el) : split(el);
      el.classList.replace('rv-wait', 'is-in');
      setTimeout(() => {
        restore();
        el.classList.remove('is-in');
      }, 1150 + n * 90);
    };
    // les photos : dans l'ordre où elles arrivent, au moins 140 ms entre deux (les étapes d'une histoire, dans l'ordre)
    let nextAt = 0;
    const unveil = (ph) => {
      const img = ph.querySelector('img');
      let started = false;
      const go = () => {
        if (started) return;
        started = true;
        const now = performance.now();
        const wait = Math.max(0, nextAt - now);
        nextAt = now + wait + 140;
        setTimeout(() => {
          ph.classList.add('is-in');
          setTimeout(() => {
            ph.classList.remove('gw', 'is-in');
            ph.querySelector('.gw__edge')?.remove();
          }, 1100);
        }, wait);
      };
      if (img.complete) return go();
      img.loading = 'eager';
      img.addEventListener('load', go, {once: true});
      setTimeout(go, 1500);
    };
    const seen = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          seen.unobserve(e.target);
          if (e.target.classList.contains('gw')) unveil(e.target);
          else rise(e.target);
        }
      },
      {rootMargin: '0px 0px -10% 0px'},
    );
    for (const el of $$('.drawn .h2, .story__title, .trades__title, .work .h2, .office .h2, .office__street, .quote .h2')) {
      el.classList.add('rv-wait');
      seen.observe(el);
    }
    for (const ph of $$('.story .ph, .project__ph, .office__photo .ph')) {
      ph.classList.add('gw');
      ph.insertAdjacentHTML('beforeend', '<span class="gw__edge" aria-hidden="true"></span>');
      seen.observe(ph);
    }
  }

  /* ——— le bureau : ouvert ou fermé, à l'heure de Boca Raton ——— */
  const status = $('[data-status]');
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const setStatus = () => {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {timeZone: 'America/New_York', weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: false})
        .formatToParts(new Date())
        .map((x) => [x.type, x.value]),
    );
    const day = DAYS.indexOf(parts.weekday);
    const h = (+parts.hour % 24) + +parts.minute / 60;
    const workday = day >= 1 && day <= 5;
    let text;
    if (workday && h >= 9 && h < 17) text = 'Open now, until 5 pm.';
    else if (workday && h < 9) text = 'Closed now. We open today at 9 am.';
    else if (day >= 1 && day <= 4) text = 'Closed now. We open tomorrow at 9 am.';
    else text = 'Closed now. We open Monday at 9 am.';
    status.textContent = text;
    status.classList.toggle('is-open', text.startsWith('Open'));
    status.hidden = false;
  };
  setStatus();
  setInterval(setStatus, 60000);

  /* ——— la demande de devis : vérifiée ici, puis écrite dans un e-mail adressé à l'entreprise ——— */
  const form = $('#quote-form');
  const done = $('.form__done');
  const errOf = (input) => document.getElementById(`e-${input.name}`);
  const fail = (input, msg) => {
    const err = errOf(input);
    input.setAttribute('aria-invalid', 'true');
    err.textContent = msg;
    err.hidden = false;
  };
  const ok = (input) => {
    input.removeAttribute('aria-invalid');
    errOf(input).hidden = true;
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements;
    const name = f.name.value.trim();
    const phone = f.phone.value.trim();
    const mail = f.email.value.trim();
    let first = null;
    if (!name) (fail(f.name, 'Enter your name.'), (first = first || f.name));
    else ok(f.name);
    ok(f.phone);
    ok(f.email);
    if (!phone && !mail) {
      fail(f.phone, 'Enter a phone number or an email, so we can reach you.');
      first = first || f.phone;
    } else {
      if (phone && phone.replace(/\D/g, '').length < 10) (fail(f.phone, 'Check the phone number: it should have 10 digits, like 561-555-0142.'), (first = first || f.phone));
      if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) (fail(f.email, 'Check the email address: it should look like name@example.com.'), (first = first || f.email));
    }
    if (first) return first.focus();
    const what = $$('input[name="what"]:checked', form).map((x) => x.value);
    const lines = [`Name: ${name}`];
    if (phone) lines.push(`Phone: ${phone}`);
    if (mail) lines.push(`Email: ${mail}`);
    if (f.address.value.trim()) lines.push(`Address of the project: ${f.address.value.trim()}`);
    lines.push(`About: ${what.length ? what.join(', ') : 'not said yet'}`);
    lines.push('', f.details.value.trim() || '(No details yet.)');
    const subject = `Free quote request${what.length ? `: ${what.join(', ')}` : ''}`;
    location.href = `mailto:bocarcg@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    done.hidden = false;
    done.setAttribute('tabindex', '-1');
    done.focus();
  });
  for (const input of [form.elements.name, form.elements.phone, form.elements.email]) input.addEventListener('input', () => input.getAttribute('aria-invalid') && ok(input));
})();
