/* Brunet Brothers Construction : les deux langues, l'ouverture de la planche de l'accueil (une paroi de verre qui
   traverse les six photos), les apparitions, la visionneuse, les témoignages et la demande de visite. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  root.classList.add('js');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 1024px)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const inOut3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ——— les deux langues ———
     L'anglais est dans la page ; l'espagnol vient du dictionnaire intégré (src/es.json, les légendes, les titres des
     groupes). Chaque texte traduisible porte data-t (son contenu) ou data-ta (un attribut : « aria-label:clé »). */
  const I18N = JSON.parse($('#i18n').textContent);
  const EN = {...I18N.en, 'q.less': 'Show fewer'};
  const collect = (r) => {
    for (const el of r.querySelectorAll('[data-t]')) if (!(el.dataset.t in EN)) EN[el.dataset.t] = el.innerHTML;
    for (const el of r.querySelectorAll('[data-ta]'))
      for (const pair of el.dataset.ta.split(';')) {
        const [attr, k] = pair.split(':');
        if (!(k in EN)) EN[k] = el.getAttribute(attr) ?? '';
      }
  };
  collect(document);
  for (const t of $$('template')) collect(t.content);
  let lang = root.classList.contains('lang-es') ? 'es' : 'en';
  const tr = (k) => (lang === 'es' ? I18N.es[k] : EN[k]) ?? EN[k] ?? '';
  const apply = (r = document) => {
    for (const el of r.querySelectorAll('[data-t]')) {
      const v = tr(el.dataset.t);
      if (el.innerHTML !== v) el.innerHTML = v;
    }
    for (const el of r.querySelectorAll('[data-ta]'))
      for (const pair of el.dataset.ta.split(';')) {
        const [attr, k] = pair.split(':');
        el.setAttribute(attr, tr(k));
      }
  };
  // les messages écrits par le script (la visionneuse, le formulaire)
  const MSG = {
    en: {
      of: 'of',
      name: 'Enter your name.',
      reach: 'Enter a phone number or an email, so we can reach you.',
      phone: 'Check the phone number: it should have 10 digits, like 561-555-0142.',
      email: 'Check the email address: it should look like name@example.com.',
      subject: 'Free estimate request',
      lName: 'Name', lPhone: 'Phone', lEmail: 'Email', lCity: 'City', lWhat: 'Project', lCall: 'Call me in',
      none: 'not said yet', nodetails: '(No details yet.)', en: 'English', es: 'Spanish',
    },
    es: {
      of: 'de',
      name: 'Escriba su nombre.',
      reach: 'Escriba un teléfono o un correo, para poder contactarle.',
      phone: 'Revise el teléfono: debe tener 10 dígitos, como 561-555-0142.',
      email: 'Revise el correo: debe parecerse a nombre@ejemplo.com.',
      subject: 'Solicitud de presupuesto gratis',
      lName: 'Nombre', lPhone: 'Teléfono', lEmail: 'Correo', lCity: 'Ciudad', lWhat: 'Proyecto', lCall: 'Llamarme en',
      none: 'sin indicar', nodetails: '(Sin detalles por ahora.)', en: 'inglés', es: 'español',
    },
  };
  const msg = (k) => MSG[lang][k];
  const onLang = [];
  const setLang = (l, animate = true) => {
    const run = () => {
      lang = l;
      root.lang = l;
      root.classList.toggle('lang-es', l === 'es');
      for (const f of onLang) f('before');
      apply();
      for (const b of $$('.langs__btn')) b.setAttribute('aria-pressed', String(b.dataset.lang === l));
      try {
        localStorage.setItem('bb-lang', l);
      } catch (e) {}
      const u = new URL(location.href);
      if (l === 'es') u.searchParams.set('lang', 'es');
      else u.searchParams.delete('lang');
      history.replaceState(history.state, '', u);
      for (const f of onLang) f('after');
    };
    if (!animate || still.matches) return run();
    root.classList.add('lang-swap');
    setTimeout(() => {
      run();
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('lang-swap')));
    }, 150);
  };
  for (const b of $$('.langs__btn')) b.addEventListener('click', () => b.dataset.lang !== lang && setLang(b.dataset.lang));

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
      history.replaceState(history.state, '', `${location.search}${id === 'main' ? '' : `#${id}`}` || location.pathname);
    });
  }

  /* ——— l'en-tête : il s'efface quand on descend, revient quand on remonte (jamais sur l'accueil) ——— */
  const hero = $('.hero');
  let lastY = window.scrollY;
  let heroEnd = Infinity;
  let topH = headH();
  const measure = () => {
    topH = headH();
    heroEnd = hero.getBoundingClientRect().bottom + window.scrollY;
  };
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
  addEventListener('resize', measure);
  addEventListener('load', measure);
  document.fonts?.ready.then(measure);
  measure();
  top.addEventListener('focusin', () => top.classList.remove('is-hidden'));

  /* ——— la section où l'on est, marquée dans le menu ——— */
  const navLinks = $$('.nav__list a[href^="#"]');
  const here = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const id = e.target.dataset.nav || e.target.id;
        for (const a of navLinks) {
          if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        }
      }
    },
    {rootMargin: '-45% 0px -50% 0px'},
  );
  for (const s of $$('main > section')) {
    // dehors et la construction neuve font partie du travail
    if (s.id === 'outside' || s.id === 'build') s.dataset.nav = 'work';
    if (s.classList.contains('hero') || s.id === 'estimate') s.dataset.nav = 'none';
    here.observe(s);
  }

  /* ——— le menu du téléphone ——— */
  const menuBtn = $('.menu-btn');
  const nav = $('.nav');
  nav.id = 'menu';
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

  /* ——— la planche de l'accueil : la ligne sous la planche dit ce que montre la photo survolée ou choisie ——— */
  const heroPlate = $('.plate--hero');
  const heroCells = $$('.ph', heroPlate);
  const heroCap = $('.hero__cap-text');
  const capOf = (ph) => document.getElementById(ph.getAttribute('aria-labelledby').split(' ')[0])?.textContent || '';
  let capFor = null;
  const showCap = (ph) => {
    capFor = ph;
    heroCap.textContent = ph ? capOf(ph) : tr('hero.platecap');
  };
  for (const ph of heroCells) {
    ph.addEventListener('pointerenter', () => showCap(ph));
    ph.addEventListener('focus', () => showCap(ph));
    ph.addEventListener('pointerleave', () => capFor === ph && showCap(null));
    ph.addEventListener('blur', () => capFor === ph && showCap(null));
  }
  onLang.push((when) => when === 'after' && showCap(capFor));

  /* ——— l'ouverture : une paroi de verre dépoli traverse les six photos de gauche à droite ———
     Chaque photo est nette jusqu'au bord de la paroi (--x, de 0 à 100 %) ; le trait blanc est la tranche du verre. */
  const openHero = async () => {
    if (!root.classList.contains('intro')) return;
    const imgs = heroCells.map((c) => c.querySelector('img'));
    await Promise.race([Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : null))), wait(900)]);
    if (!root.classList.contains('intro')) return;
    for (const c of heroCells) c.style.setProperty('--x', '0%');
    root.classList.replace('intro', 'intro-run');
    const line = document.createElement('span');
    line.className = 'sweep';
    line.setAttribute('aria-hidden', 'true');
    heroPlate.append(line);
    const W = heroPlate.offsetWidth;
    const cells = heroCells.map((el) => ({el, x: el.offsetLeft, w: el.offsetWidth}));
    const D = 1500;
    const t0 = performance.now() + 140;
    const frame = (now) => {
      const t = clamp((now - t0) / D);
      const X = -30 + (W + 60) * inOut3(t);
      for (const c of cells) c.el.style.setProperty('--x', `${(clamp((X - c.x) / c.w) * 100).toFixed(2)}%`);
      line.style.transform = `translate3d(${clamp(X, 0, W - 2).toFixed(1)}px, 0, 0)`;
      line.style.opacity = String(Math.min(clamp(t / 0.06), clamp((1 - t) / 0.1)));
      if (t < 1) return requestAnimationFrame(frame);
      for (const c of cells) c.el.style.removeProperty('--x');
      line.remove();
      root.classList.remove('intro-run');
    };
    requestAnimationFrame(frame);
  };
  openHero();

  /* ——— les apparitions, une fois chacune : les titres de section montent ligne à ligne derrière leur cache ; les
     photos apparaissent derrière la paroi de verre qui glisse ——— */
  const running = new Set();
  onLang.push((when) => {
    if (when !== 'before') return;
    for (const restore of running) restore();
    running.clear();
  });
  if (!still.matches && 'IntersectionObserver' in window) {
    const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const mask = (t, i) => `<span class="ln"><span class="ln__in" style="--i:${i}">${esc(t)}</span></span>`;
    // un titre coupé en lignes, telles que la page les affiche (mesurées au moment où il apparaît)
    const split = (el) => {
      const html = el.innerHTML;
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
      return {n: rows.length, restore: () => (el.innerHTML = html)};
    };
    const rise = (el) => {
      const {n, restore} = split(el);
      const done = () => {
        if (!running.has(done)) return;
        running.delete(done);
        restore();
        el.classList.remove('is-in');
      };
      running.add(done);
      el.classList.replace('rv-wait', 'is-in');
      setTimeout(done, 1150 + n * 90);
    };
    // les photos : une file, dans l'ordre où elles arrivent, au moins 140 ms entre deux ; une photo déjà sortie de
    // l'écran quand vient son tour (on est passé vite, par un lien du menu) apparaît sans attendre, et ne retarde pas
    // celles qu'on regarde
    const onScreen = (el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < innerHeight;
    };
    const finish = (ph) => {
      ph.classList.remove('gw', 'is-in');
      ph.querySelector('.ph__edge')?.remove();
    };
    const queue = [];
    let busy = false;
    const pump = () => {
      if (busy) return;
      const ph = queue.shift();
      if (!ph) return;
      if (!onScreen(ph)) {
        finish(ph);
        return pump();
      }
      busy = true;
      ph.classList.add('is-in');
      setTimeout(() => finish(ph), 1250);
      setTimeout(() => {
        busy = false;
        pump();
      }, 140);
    };
    const unveil = (ph) => {
      const img = ph.querySelector('img');
      let started = false;
      const go = () => {
        if (started) return;
        started = true;
        queue.push(ph);
        pump();
      };
      if (img.complete && img.naturalWidth) return go();
      img.loading = 'eager';
      img.addEventListener('load', go, {once: true});
      img.addEventListener('error', go, {once: true});
      setTimeout(go, 2500);
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
    for (const el of $$('main .h2')) {
      el.classList.add('rv-wait');
      seen.observe(el);
    }
    for (const ph of $$('main .ph').filter((p) => !heroPlate.contains(p))) {
      ph.classList.add('gw');
      ph.insertAdjacentHTML('beforeend', '<span class="ph__edge" aria-hidden="true"></span>');
      seen.observe(ph);
    }
  }

  /* ——— la visionneuse : les photos d'un groupe ; la vignette devient la photo (transition de vue) ——— */
  const viewer = $('.viewer');
  const vList = $('.viewer__list');
  const vTitle = $('.viewer__title');
  const vCount = $('.viewer__count');
  const vPrev = $('.viewer__prev');
  const vNext = $('.viewer__next');
  const vClose = $('.viewer__close');
  let vIndex = 0;
  let vTotal = 0;
  // pendant un défilement voulu (flèches, Début, Fin), le compteur ne suit pas les photos qu'on traverse
  let vTarget = null;
  let vSet = null;
  let opener = null;
  const vState = () => {
    vCount.textContent = `${vIndex + 1} ${msg('of')} ${vTotal}`;
    vPrev.disabled = vIndex === 0;
    vNext.disabled = vIndex === vTotal - 1;
  };
  const vShow = (i, smooth = true) => {
    vIndex = clamp(i, 0, vTotal - 1);
    const li = vList.children[vIndex];
    if (li) {
      vTarget = smooth && !still.matches ? li.offsetLeft : null;
      vList.scrollTo({left: li.offsetLeft, behavior: vTarget === null ? 'auto' : 'smooth'});
    }
    const near = vList.children[vIndex + 1]?.querySelector('img');
    if (near) near.loading = 'eager';
    vState();
  };
  const vOpen = async (set, from = null, at = 0) => {
    const tpl = document.getElementById(`set-${set}`);
    if (!tpl) return;
    opener = from;
    vSet = set;
    vList.replaceChildren(tpl.content.cloneNode(true));
    apply(vList);
    vTitle.textContent = tr(`set.${set}`);
    vTotal = vList.children.length;
    vIndex = clamp(at, 0, vTotal - 1);
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
    await Promise.race([first.decode().catch(() => {}), wait(350)]);
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
  onLang.push((when) => {
    if (when !== 'after' || !viewer.open) return;
    apply(vList);
    vTitle.textContent = tr(`set.${vSet}`);
    vState();
  });
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
        if (vTarget !== null && Math.abs(vList.scrollLeft - vTarget) > 2) return;
        vTarget = null;
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
  for (const b of $$('.ph[data-set]')) b.addEventListener('click', () => vOpen(b.dataset.set, b, +(b.dataset.at || 0)));

  /* ——— les témoignages : les douze autres, derrière un bouton ——— */
  const qBtn = $('.quotes__btn');
  const qMore = $('#quotes-more');
  qBtn.addEventListener('click', () => {
    const open = qMore.hidden;
    qMore.hidden = !open;
    qBtn.setAttribute('aria-expanded', String(open));
    qBtn.dataset.t = open ? 'q.less' : 'q.more';
    qBtn.innerHTML = tr(qBtn.dataset.t);
    if (open) $('.q', qMore)?.setAttribute('tabindex', '-1');
  });

  /* ——— la demande de visite : vérifiée ici, puis écrite dans un e-mail adressé à l'entreprise ——— */
  const form = $('#estimate-form');
  const done = $('.form__done');
  const errOf = (input) => document.getElementById(`e-${input.name}`);
  const fail = (input, key) => {
    const err = errOf(input);
    input.setAttribute('aria-invalid', 'true');
    err.dataset.k = key;
    err.textContent = msg(key);
    err.hidden = false;
  };
  const ok = (input) => {
    input.removeAttribute('aria-invalid');
    errOf(input).hidden = true;
  };
  // la langue de rappel suit celle de la page, tant qu'on ne l'a pas choisie
  let callinTouched = false;
  const callin = () => {
    if (!callinTouched) form.elements.callin.value = lang === 'es' ? 'Spanish' : 'English';
  };
  for (const r of $$('input[name="callin"]', form)) r.addEventListener('change', () => (callinTouched = true));
  callin();
  onLang.push((when) => {
    if (when !== 'after') return;
    callin();
    for (const err of $$('.field__err', form)) if (!err.hidden && err.dataset.k) err.textContent = msg(err.dataset.k);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements;
    const name = f.name.value.trim();
    const phone = f.phone.value.trim();
    const mail = f.email.value.trim();
    let first = null;
    if (!name) (fail(f.name, 'name'), (first = first || f.name));
    else ok(f.name);
    ok(f.phone);
    ok(f.email);
    if (!phone && !mail) {
      fail(f.phone, 'reach');
      first = first || f.phone;
    } else {
      if (phone && phone.replace(/\D/g, '').length < 10) (fail(f.phone, 'phone'), (first = first || f.phone));
      if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) (fail(f.email, 'email'), (first = first || f.email));
    }
    if (first) return first.focus();
    const what = $$('input[name="what"]:checked', form).map((x) => (lang === 'es' ? x.dataset.es : x.value));
    const lines = [`${msg('lName')}: ${name}`];
    if (phone) lines.push(`${msg('lPhone')}: ${phone}`);
    if (mail) lines.push(`${msg('lEmail')}: ${mail}`);
    if (f.city.value.trim()) lines.push(`${msg('lCity')}: ${f.city.value.trim()}`);
    lines.push(`${msg('lWhat')}: ${what.length ? what.join(', ') : msg('none')}`);
    lines.push(`${msg('lCall')}: ${f.callin.value === 'Spanish' ? msg('es') : msg('en')}`);
    lines.push('', f.details.value.trim() || msg('nodetails'));
    const subject = `${msg('subject')}${what.length ? `: ${what.join(', ')}` : ''}`;
    const url = `mailto:brunetbrothersconstruction@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    // l'adresse de l'e-mail écrit reste lisible dans la page (les essais la vérifient)
    done.dataset.mailto = url;
    location.href = url;
    done.hidden = false;
    done.setAttribute('tabindex', '-1');
    done.focus();
  });
  for (const input of [form.elements.name, form.elements.phone, form.elements.email]) input.addEventListener('input', () => input.getAttribute('aria-invalid') && ok(input));

  /* ——— la langue de départ : l'espagnol si on l'a choisi, demandé (?lang=es) ou si le navigateur le préfère ——— */
  if (lang === 'es') setLang('es', false);
  root.classList.add('i18n-ready');
})();
