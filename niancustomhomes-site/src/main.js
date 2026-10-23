/* NIAN Custom Homes : défilement, l'accueil qui se recolle, les six maisons, le choix terrain + maison, la visionneuse,
   la demande de consultation. */
(() => {
  'use strict';
  const d = document;
  const root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const motion = root.classList.contains('motion');
  const DATA = JSON.parse($('#site-data').textContent);
  const homeById = (id) => DATA.homes.find((h) => h.id === id);

  /* ——— les photos ———
     Fichier unique : chaque photo est intégrée une fois (window.__IMG) et posée ici partout où elle sert.
     En ligne : les fichiers, en plusieurs largeurs. */
  const IMG = window.__IMG || null;
  if (IMG) {
    for (const s of $$('source[data-k]')) s.srcset = IMG[s.dataset.k] || '';
    for (const i of $$('img[data-k]')) i.src = IMG[i.dataset.k] || '';
  }
  const setPhoto = (img, name, sizes) => {
    const p = DATA.photos[name];
    if (p.k) img.src = IMG[p.k] || '';
    else {
      img.sizes = sizes;
      img.srcset = p.srcset;
      img.src = p.src;
    }
    img.width = p.w;
    img.height = p.h;
    img.alt = '';
    img.decoding = 'async';
    return p;
  };
  const whenReady = (img) => Promise.race([(img.decode ? img.decode() : Promise.resolve()).catch(() => {}), new Promise((r) => setTimeout(r, 1500))]);

  /* ——— le défilement doux ——— */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({lerp: 0.1, smoothWheel: true});
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
  const top = $('.top');
  const headH = () => top.offsetHeight;
  const scrollY0 = () => window.scrollY || root.scrollTop;
  const goTo = (el) => {
    if (!el) return;
    // Lenis tient compte du scroll-padding-top de la page (la hauteur de l'en-tête)
    if (lenis) lenis.scrollTo(el, {duration: 1.3});
    else window.scrollTo({top: el.getBoundingClientRect().top + scrollY0() - headH(), behavior: motion ? 'smooth' : 'auto'});
  };
  const goTop = () => (lenis ? lenis.scrollTo(0, {duration: 1.3}) : window.scrollTo({top: 0, behavior: motion ? 'smooth' : 'auto'}));

  /* ——— le menu (jusqu'à 1 099 px) ——— */
  const menuBtn = $('.menu-btn');
  const nav = $('#menu');
  const outside = [$('#main'), $('.foot')];
  const menuOpen = () => nav.classList.contains('is-open');
  const openMenu = () => {
    nav.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    top.classList.remove('is-up');
    outside.forEach((el) => (el.inert = true));
    root.classList.add('is-locked');
    lenis?.stop();
  };
  const closeMenu = () => {
    if (!menuOpen()) return;
    nav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    outside.forEach((el) => (el.inert = false));
    root.classList.remove('is-locked');
    lenis?.start();
  };
  menuBtn.addEventListener('click', () => (menuOpen() ? closeMenu() : openMenu()));
  d.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen()) {
      closeMenu();
      menuBtn.focus();
    }
  });
  matchMedia('(max-width: 1099px)').addEventListener('change', closeMenu);

  // les liens de la page : un défilement doux, et au clavier le focus suit
  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || a.classList.contains('skip')) return;
    const id = a.getAttribute('href');
    const el = id === '#top' ? null : $(id);
    if (id !== '#top' && !el) return;
    e.preventDefault();
    closeMenu();
    if (id === '#top') goTop();
    else goTo(el);
    if (e.detail === 0 && el) {
      const h = $('h2', el) || el;
      h.setAttribute('tabindex', '-1');
      h.focus({preventScroll: true});
    }
  });

  /* ——— l'en-tête : il s'efface en descendant, revient en remontant ——— */
  let lastY = scrollY0();
  const onHeader = (y) => {
    top.classList.toggle('is-scrolled', y > 8);
    if (Math.abs(y - lastY) < 6) return;
    if (!menuOpen() && !top.contains(d.activeElement)) top.classList.toggle('is-up', y > lastY && y > 160);
    lastY = y;
  };
  top.addEventListener('focusin', () => top.classList.remove('is-up'));

  /* ——— l'accueil : Lot + Home ———
     Deux copies de la même photo. Chacune est dimensionnée pour couvrir le cadre final (toute la scène sur un grand
     écran, une bande 4:5 au téléphone), puis réduite, déplacée et découpée pour n'en montrer qu'une moitié dans la boîte
     de la grille, écartée de l'autre. e : le défilement (0 séparées, 1 recollées) ; o : l'ouverture depuis le « + ». */
  const hero = $('.hero');
  const stage = $('.hero__stage', hero);
  const box = $('.hero__box', hero);
  const [halfL, halfR] = $$('.hero__half', hero);
  const heroImg = $('img', halfL);
  const heroCap = $('.hero__cap', hero);
  let pinned = false;
  let run = 1;
  let E = 0;
  let O = hero.classList.contains('is-pre') ? 0 : 1;
  let geo = null;
  const lerp = (a, b, t) => a + (b - a) * t;
  const measure = () => {
    const s = stage.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    const W = s.width;
    const H = s.height;
    const phone = W < 700;
    // le cadre final
    const fh = phone ? Math.min(W * 1.25, H - headH() - 32) : H;
    const fy = (H - fh) / 2;
    // la photo couvre le cadre
    const ar = +heroImg.getAttribute('width') / +heroImg.getAttribute('height') || 1.95;
    const Lw = Math.max(W, fh * ar);
    const Lh = Lw / ar;
    const bx = {x0: b.left - s.left, y0: b.top - s.top, x1: b.right - s.left, y1: b.bottom - s.top};
    const bw = bx.x1 - bx.x0;
    const bh = bx.y1 - bx.y0;
    // la part de la largeur de la photo vue dans la boîte au départ : sur un écran en hauteur (téléphone, tablette tenue
    // droite), assez pour garder le jardin à gauche et la maison à droite (62 %) ; sur un écran en largeur, la photo n'est
    // pas réduite
    const want = phone || H > W ? 0.62 : bw / Lw;
    const s0 = Math.min(1, Math.max(bw / (want * Lw), bh / Lh));
    hero.style.removeProperty('--g');
    const g0 = parseFloat(getComputedStyle(box).columnGap) || 0;
    geo = {W, fy, fh, Lw, Lh, bx, s0, g0, cyF: fy + fh / 2, cyB: (bx.y0 + bx.y1) / 2};
    for (const h of [halfL, halfR]) {
      h.style.width = `${Lw}px`;
      h.style.height = `${Lh}px`;
      h.style.left = `${(W - Lw) / 2}px`;
      h.style.top = `${geo.cyF - Lh / 2}px`;
    }
    heroCap.style.bottom = phone ? `${Math.round(H - (fy + fh) + 12)}px` : '';
    hero.style.setProperty('--box-mid', `${Math.round((bx.y0 + bx.y1) / 2)}px`);
    render();
    hero.classList.add('is-ready');
  };
  const render = () => {
    if (!geo) return;
    const {W, fy, fh, Lw, Lh, bx, s0, g0, cyF, cyB} = geo;
    const s = lerp(s0, 1, E);
    const g = g0 * (1 - E);
    const cy = lerp(cyB, cyF, E);
    const mid = W / 2;
    // la fenêtre, à l'écran : de la boîte au cadre final ; à l'arrivée elle s'ouvre depuis le milieu
    const x0 = lerp(mid - g / 2, lerp(bx.x0, 0, E), O);
    const x1 = lerp(mid + g / 2, lerp(bx.x1, W, E), O);
    const y0 = lerp(bx.y0, fy, E);
    const y1 = lerp(bx.y1, fy + fh, E);
    // puis dans le repère de chaque copie (avant sa réduction et son déplacement)
    const ly = (y) => (y - cy) / s + Lh / 2;
    const top = Math.max(0, ly(y0)).toFixed(2);
    const bottom = Math.max(0, Lh - ly(y1)).toFixed(2);
    const left = Math.max(0, (x0 - (mid - g / 2)) / s + Lw / 2).toFixed(2);
    const right = Math.max(0, Lw - ((x1 - (mid + g / 2)) / s + Lw / 2)).toFixed(2);
    const dy = (cy - cyF).toFixed(2);
    halfL.style.transform = `translate3d(${(-g / 2).toFixed(2)}px, ${dy}px, 0) scale(${s.toFixed(4)})`;
    halfL.style.clipPath = `inset(${top}px ${(Lw / 2).toFixed(2)}px ${bottom}px ${left}px)`;
    halfR.style.transform = `translate3d(${(g / 2).toFixed(2)}px, ${dy}px, 0) scale(${s.toFixed(4)})`;
    halfR.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${(Lw / 2 - 1).toFixed(2)}px)`;
  };
  const setPin = () => {
    pinned = motion && innerHeight >= 500;
    hero.classList.toggle('is-pinned', pinned);
    run = Math.max(1, hero.offsetHeight - stage.offsetHeight);
  };
  const ease = (p) => 0.5 - 0.5 * Math.cos(Math.PI * p);
  const onHero = (y) => {
    const e = pinned ? Math.round(ease(Math.min(1, Math.max(0, (y - hero.offsetTop) / run))) * 1000) / 1000 : 0;
    if (e === E) return;
    E = e;
    hero.style.setProperty('--e', e);
    render();
  };
  // l'arrivée : les mots montent et le « + » se trace tout de suite ; les deux moitiés s'ouvrent depuis le « + » dès que
  // la photo est prête
  const intro = () => {
    if (!hero.classList.contains('is-pre')) return;
    hero.classList.add('is-in');
    hero.classList.remove('is-pre');
    whenReady(heroImg).then(() => {
      const t0 = performance.now();
      const D = 1250;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / D);
        O = 1 - Math.pow(1 - p, 4);
        render();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };

  /* ——— les six maisons ——— */
  const grid = $('[data-homes]');
  const heads = $$('.home__btn', grid);
  const panels = $$('.home__panel', grid);
  const marker = $('.homes__marker', grid);
  const wide = matchMedia('(min-width: 1000px)');
  const shown = {};
  const placeMarker = () => {
    const btn = heads.find((b) => b.getAttribute('aria-expanded') === 'true');
    if (!btn || !wide.matches) return;
    const name = $('.home__name', btn);
    const y = btn.offsetTop + name.offsetTop + name.offsetHeight / 2 - marker.getBoundingClientRect().height / 2 - 2;
    grid.style.setProperty('--my', `${Math.round(y)}px`);
  };
  const openHome = (i) => {
    heads.forEach((b, k) => b.setAttribute('aria-expanded', String(k === i)));
    panels.forEach((p, k) => {
      p.classList.toggle('is-open', k === i);
      p.inert = k !== i;
    });
    placeMarker();
  };
  heads.forEach((b, i) =>
    b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') === 'true';
      if (open && wide.matches) return;
      if (open) {
        b.setAttribute('aria-expanded', 'false');
        panels[i].classList.remove('is-open');
        panels[i].inert = true;
        return;
      }
      openHome(i);
      // au téléphone, la maison ouverte reste sous les yeux (celle d'au-dessus vient de se refermer)
      if (!wide.matches) {
        const r = b.getBoundingClientRect();
        if (r.top < headH() || r.top > innerHeight * 0.55) goTo(b.closest('h3'));
      }
    }),
  );
  panels.forEach((p, k) => (p.inert = !p.classList.contains('is-open')));
  wide.addEventListener('change', () => {
    if (wide.matches && !heads.some((b) => b.getAttribute('aria-expanded') === 'true')) openHome(0);
    placeMarker();
  });

  // une scène : la photo, sa légende, son rang, les vignettes
  const scenes = {};
  panels.forEach((panel) => {
    const id = panel.dataset.home;
    const home = homeById(id);
    const photo = $('.home__photo', panel);
    const cap = $('[data-cap]', panel);
    const count = $('[data-count]', panel);
    const thumbs = $$('.thumb', panel);
    shown[id] = 0;
    const show = (at) => {
      if (at === shown[id]) return;
      shown[id] = at;
      const old = $$('img', photo);
      const img = new Image();
      const p = setPhoto(img, home.photos[at], '(min-width: 1000px) 58vw, 100vw');
      img.className = `is-${p.fit} is-new`;
      photo.append(img);
      whenReady(img).then(() =>
        requestAnimationFrame(() => {
          img.classList.remove('is-new');
          setTimeout(() => old.forEach((o) => o.remove()), 600);
        }),
      );
      cap.textContent = p.cap;
      count.textContent = `${at + 1} of ${home.photos.length}`;
      thumbs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === at)));
    };
    scenes[id] = show;
    thumbs.forEach((t, k) => t.addEventListener('click', () => show(k)));
    photo.addEventListener('click', () => openViewer(id, shown[id], photo));
  });
  $$('.fig__photo').forEach((b) => b.addEventListener('click', () => openViewer(b.dataset.home, +b.dataset.at, b)));

  /* ——— la visionneuse ——— */
  const viewer = $('#viewer');
  const vFrame = $('.viewer__frame', viewer);
  const vCap = $('.viewer__cap', viewer);
  const vTitle = $('#viewer-title');
  const vCount = $('.viewer__count', viewer);
  let vHome = null;
  let vAt = 0;
  let vFrom = null;
  const vShow = (at) => {
    const list = vHome.photos;
    vAt = (at + list.length) % list.length;
    const old = $$('img', vFrame);
    const img = new Image();
    const p = setPhoto(img, list[vAt], '(min-width: 1000px) 84vw, 100vw');
    // jamais plus grande que son fichier
    img.style.maxWidth = `min(100%, ${p.w}px)`;
    img.style.maxHeight = `min(100%, ${p.h}px)`;
    img.draggable = false;
    img.classList.add('is-new');
    vFrame.append(img);
    whenReady(img).then(() =>
      requestAnimationFrame(() => {
        img.classList.remove('is-new');
        old.forEach((o) => {
          o.classList.add('is-new');
          setTimeout(() => o.remove(), 400);
        });
      }),
    );
    vCap.textContent = p.cap;
    vCount.textContent = `${vAt + 1} of ${list.length}`;
  };
  const openViewer = (id, at, from) => {
    vHome = homeById(id);
    vFrom = from;
    vTitle.textContent = vHome.name;
    vFrame.textContent = '';
    vShow(at);
    viewer.showModal();
    root.classList.add('is-locked');
    lenis?.stop();
  };
  viewer.addEventListener('close', () => {
    root.classList.remove('is-locked');
    lenis?.start();
    vFrame.textContent = '';
    // la scène de la maison reprend la dernière photo vue
    if (vFrom && vFrom.classList.contains('home__photo')) scenes[vHome.id](vAt);
    vFrom?.focus({preventScroll: true});
  });
  $('[data-close]', viewer).addEventListener('click', () => viewer.close());
  $$('[data-step]', viewer).forEach((b) => b.addEventListener('click', () => vShow(vAt + +b.dataset.step)));
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      vShow(vAt + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let x0 = null;
  vFrame.addEventListener('pointerdown', (e) => (x0 = e.clientX));
  vFrame.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) vShow(vAt + (dx < 0 ? 1 : -1));
  });
  vFrame.addEventListener('pointercancel', () => (x0 = null));

  /* ——— le choix : votre terrain + votre maison ——— */
  const choose = $('.choose');
  const LOT = {lots: 'one of our lots', land: 'your own land', find: 'a lot we help you find'};
  const PLAN = {scratch: 'a home designed from scratch', plans: 'one of our proven plans', own: 'your own design'};
  const sum = $('#choose-sum');
  const start = $('[data-start]');
  const picked = (n) => $(`input[name="${n}"]:checked`, choose)?.value || '';
  choose.addEventListener('change', () => {
    const lot = picked('lot');
    const plan = picked('plan');
    sum.innerHTML = `Your starting point: <b>${lot ? LOT[lot] : 'a lot to choose'}</b> + <b>${plan ? PLAN[plan] : 'a plan to choose'}</b>.`;
    start.textContent = 'Ask about this starting point';
  });
  if (motion && 'IntersectionObserver' in window) {
    choose.classList.add('is-pre');
    const io = new IntersectionObserver(
      (es) => {
        if (!es.some((x) => x.isIntersecting)) return;
        choose.classList.add('is-in');
        choose.classList.remove('is-pre');
        io.disconnect();
      },
      {threshold: 0.6},
    );
    io.observe($('.choose__plus', choose));
  }

  /* ——— les apparitions ——— */
  if (motion && 'IntersectionObserver' in window) {
    const rv = $$('[data-rv]');
    for (const el of rv) {
      if (el.dataset.rv === 'title') el.innerHTML = `<span class="rv__in">${el.innerHTML}</span>`;
      el.classList.add('rv-pre');
    }
    const seen = new IntersectionObserver(
      (list) => {
        for (const x of list) {
          if (!x.isIntersecting) continue;
          x.target.classList.add('rv-in');
          x.target.classList.remove('rv-pre');
          seen.unobserve(x.target);
        }
      },
      {rootMargin: '0px 0px -10% 0px'},
    );
    rv.forEach((el) => seen.observe(el));
  }

  /* ——— la demande de consultation ——— */
  const form = $('#form');
  const F = form.elements;
  const TOPIC = {home: 'a custom home', package: 'a Lot + Home package', remodel: 'a remodel', realtor: 'the realtor program'};
  const TO = {realtor: 'sales@niancorp.com'};
  const note = $('.form__note', form);
  const topic = () => $('input[name="topic"]:checked', form).value;
  const syncTopic = () => {
    const t = topic();
    $$('[data-for]', form).forEach((f) => (f.hidden = !f.dataset.for.split(' ').includes(t)));
    note.textContent = `This opens your email app with your request, addressed to ${TO[t] || 'contact@niancustomhomes.com'}.`;
  };
  syncTopic();
  form.addEventListener('change', (e) => e.target.name === 'topic' && syncTopic());
  // ce que le bouton a rempli brille un instant
  const flash = (el) => {
    el.classList.remove('is-set');
    void el.offsetWidth;
    el.classList.add('is-set');
  };
  const setTopic = (t) => {
    const r = $(`input[name="topic"][value="${t}"]`, form);
    if (r && !r.checked) {
      r.checked = true;
      flash(r.nextElementSibling);
    }
    syncTopic();
  };
  const setField = (el, v) => {
    if (el.value === v) return;
    el.value = v;
    flash(el);
  };
  const toForm = (e, fill) => {
    e.preventDefault();
    closeMenu();
    fill();
    goTo($('#consultation'));
    if (e.detail === 0) setTimeout(() => F.name.focus({preventScroll: true}), 700);
  };
  start.addEventListener('click', (e) =>
    toForm(e, () => {
      setTopic('home');
      setField(F.lot, picked('lot'));
      setField(F.plan, picked('plan'));
    }),
  );
  $$('[data-topic]').forEach((a) => a.addEventListener('click', (e) => toForm(e, () => setTopic(a.dataset.topic))));
  $$('[data-liked]').forEach((a) =>
    a.addEventListener('click', (e) =>
      toForm(e, () => {
        setTopic('home');
        setField(F.liked, a.dataset.liked);
      }),
    ),
  );

  const RULES = {
    name: (v) => (v ? '' : 'Enter your name.'),
    email: (v) => (!v ? 'Enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Check your email address. It should look like name@example.com.'),
  };
  const validate = (input) => {
    const msg = RULES[input.name](input.value.trim());
    const out = $(`#e-${input.name}`, form);
    input.setAttribute('aria-invalid', String(!!msg));
    out.textContent = msg;
    out.hidden = !msg;
    return !msg;
  };
  form.addEventListener('input', (e) => {
    if (RULES[e.target.name] && e.target.getAttribute('aria-invalid') === 'true') validate(e.target);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = [F.name, F.email].filter((i) => !validate(i));
    if (bad.length) {
      bad[0].focus();
      return;
    }
    const t = topic();
    const text = (el) => el.selectedOptions[0].text;
    const val = (el) => el.value.trim();
    const lines = [`About: ${TOPIC[t]}`];
    if (t === 'home') lines.push(`My lot: ${text(F.lot)}`, `My home: ${text(F.plan)}`);
    if ((t === 'home' || t === 'package') && F.liked.value) lines.push(`A home I liked: ${text(F.liked)}`);
    lines.push('', `Name: ${val(F.name)}`, `Email: ${val(F.email)}`);
    if (val(F.phone)) lines.push(`Phone: ${val(F.phone)}`);
    if (val(F.time)) lines.push(`Best time to reach me: ${val(F.time)}`);
    if (val(F.message)) lines.push('', val(F.message));
    const subject = t === 'realtor' ? 'Realtor program' : `Free consultation: ${TOPIC[t]}`;
    const href = `mailto:${TO[t] || 'contact@niancustomhomes.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    const sent = $('#form-sent');
    sent.dataset.mailto = href;
    sent.hidden = false;
    sent.focus();
    window.location.href = href;
  });

  /* ——— le défilement ——— */
  const onScroll = () => {
    const y = scrollY0();
    onHeader(y);
    onHero(y);
  };
  if (lenis) lenis.on('scroll', onScroll);
  else window.addEventListener('scroll', onScroll, {passive: true});
  const layout = () => {
    measure();
    setPin();
    placeMarker();
    onScroll();
  };
  layout();
  let rt = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(rt);
    rt = requestAnimationFrame(layout);
  });
  d.fonts?.ready.then(layout);
  intro();
})();
