/* Enhance® : interactions et mouvements.
   Principe : le contenu est complet sans JavaScript ; le script ajoute la scène 3D,
   les apparitions au scroll, et l'outil « Your consultation ». */
(function () {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mobileQ = window.matchMedia('(max-width: 960px)');
  const A = window.EnhanceArt;
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  if (gsap && ST) gsap.registerPlugin(ST);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ═════════ Dessins ═════════ */
  const NAMES = ['Surface', 'Volume', 'Motion', 'Support', 'Structure'];
  const stage = $('[data-stage]');
  const stack = $('[data-stack]');
  const planes = NAMES.map((name, i) => {
    const el = document.createElement('div');
    el.className = `plane plane--${name.toLowerCase()}`;
    el.style.setProperty('--k', 4 - i);
    el.innerHTML = A.plane(i, `p${i}`);
    stack.appendChild(el);
    return el;
  });
  const tags = NAMES.map((name, i) => {
    const el = document.createElement('div');
    el.className = 'tag';
    el.style.setProperty('--k', 4 - i);
    el.innerHTML = `<i>${i + 1}</i>${name}`;
    stack.appendChild(el);
    return el;
  });
  const FIGS = {jaw: 'the jaw, bone and masseter muscle', eye: 'the upper eyelid', nose: 'the nasal bones', lift: 'the support layer, lift vectors'};
  $$('[data-detail]').forEach((el, i) => {
    el.innerHTML = A.detail(el.dataset.detail, `fig${i}`);
    el.dataset.fig = `Fig. ${i + 1}, ${FIGS[el.dataset.detail]}`;
  });

  /* ═════════ Scène : état de la pile ═════════ */
  const S = {explode: 0, active: -1, fty: 0};
  const focus = planes.map(() => ({dz: 0, o: 1}));
  // en vue de face, une seule couche est visible : la peau, ou celle que l'on survole dans le hero
  const peek = planes.map((_, i) => ({o: i === 0 ? 1 : 0}));
  const geo = {gap: 96, rx: 62, rz: -32, scale: 1};

  function fit() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const mob = mobileQ.matches;
    // vue de face : l'ovale (400 × 500) occupe ~70 % de la hauteur utile
    const s = mob ? Math.min(w / 560, (h - 80) / 560) : Math.min(w / 600, (h - 110) / 610);
    geo.scale = clamp(s, 0.4, 1.2);
    geo.gap = mob ? 90 : 96;
    // scène étroite : la pile se décale à gauche pour laisser la place aux étiquettes
    stage.style.setProperty('--cx', mob ? '44%' : w < 640 ? '42%' : '50%');
  }

  function render() {
    const p = S.explode;
    // éclatée, la pile prend plus de place : elle rétrécit un peu et descend pour rester centrée
    const s = geo.scale * (1 - 0.2 * p);
    const lift = 2 * geo.gap * Math.sin((geo.rx * Math.PI) / 180) * p * s;
    stage.style.setProperty('--s', s.toFixed(3));
    stack.style.setProperty('--rx', (geo.rx * p).toFixed(2));
    stack.style.setProperty('--rz', (geo.rz * p).toFixed(2));
    stack.style.setProperty('--gap', (geo.gap * p).toFixed(2));
    stage.style.setProperty('--ty', (-6 + lift * 0.9 + S.fty * p).toFixed(1));
    stage.style.setProperty('--no', (clamp(1 - p * 3) * peek[0].o).toFixed(3));
    stage.style.setProperty('--do', clamp((p - 0.55) * 2.4).toFixed(3));
    planes.forEach((el, i) => {
      const open = clamp((p - 0.04) * 4);
      const base = peek[i].o + (1 - peek[i].o) * open;
      el.style.setProperty('--o', (base * focus[i].o).toFixed(3));
      el.style.setProperty('--dz', focus[i].dz.toFixed(1));
      tags[i].style.setProperty('--dz', focus[i].dz.toFixed(1));
      tags[i].style.setProperty('--to', (clamp((p - 0.6) * 2.5) * (focus[i].o < 0.2 ? 0 : 1)).toFixed(3));
    });
  }

  const depthFill = $('[data-depth-fill]');
  const depthNow = $('[data-depth-now]');
  function setActive(a) {
    if (S.active === a) return;
    S.active = a;
    planes.forEach((el, i) => {
      const f = a < 0 ? {dz: 0, o: 1} : i < a ? {dz: 170, o: 0.04} : i === a ? {dz: 22, o: 1} : {dz: 0, o: 0.42};
      if (gsap && !reduce) gsap.to(focus[i], {...f, duration: 1.1, ease: 'expo.out', onUpdate: render, overwrite: true});
      else Object.assign(focus[i], f);
      el.classList.toggle('is-active', i === a);
      tags[i].classList.toggle('is-active', i === a);
    });
    // la caméra suit : la couche active revient au centre de la scène
    const s = geo.scale * 0.8;
    const fty = a < 0 ? 0 : (4 - a - 2) * geo.gap * Math.sin((geo.rx * Math.PI) / 180) * s * 0.8;
    if (gsap && !reduce) gsap.to(S, {fty, duration: 1.3, ease: 'expo.out', onUpdate: render, overwrite: true});
    else S.fty = fty;
    if (!gsap || reduce) render();
    depthFill.parentElement.parentElement.style.setProperty('--df', a < 0 ? 0 : (a + 1) / 5);
    depthNow.textContent = a < 0 ? 'All layers' : NAMES[a];
  }

  fit();
  render();
  window.addEventListener('resize', () => { fit(); render(); });
  mobileQ.addEventListener?.('change', () => { fit(); render(); });

  /* ═════════ Défilement doux ═════════ */
  let lenis = null;
  if (!reduce && window.Lenis && gsap && ST) {
    lenis = new window.Lenis({lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.95});
    lenis.on('scroll', ST.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, {offset: el.id === 'visit' ? 0 : -10, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4)});
    else el.scrollIntoView({behavior: reduce ? 'auto' : 'smooth'});
  };
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      e.preventDefault();
      closeMenu();
      scrollToEl(el);
      history.replaceState(null, '', `#${id}`);
    });
  });

  /* ═════════ Navigation ═════════ */
  const nav = $('[data-nav]');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, {passive: true});
  onScroll();

  const burger = $('[data-burger]');
  const menu = $('[data-menu]');
  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  }
  burger.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    if (lenis) (open ? lenis.stop() : lenis.start());
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ═════════ Sans GSAP ou mouvement réduit : état final, lisible ═════════ */
  if (!gsap || !ST || reduce) {
    root.classList.add('is-static');
    $$('[data-hero-in], .nav, .stage__3d, .note').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    stage.classList.add('is-drawn');
    S.explode = mobileQ.matches ? 1 : 0;
    render();
    // les couches réagissent quand même à la lecture, sans animation
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          if (en.target.dataset.layer !== undefined) { S.explode = 1; render(); setActive(Number(en.target.dataset.layer)); }
          else if (en.target.matches('[data-explode]')) { S.explode = 1; setActive(-1); render(); }
        }
      });
    }, {rootMargin: '-45% 0px -45% 0px'});
    $$('.layer, [data-explode]').forEach((el) => io.observe(el));
    $$('.cv li').forEach((el) => el.classList.add('is-on'));
    initBrief();
    return;
  }

  /* ═════════ Entrée ═════════ */
  const intro = gsap.timeline({delay: 0.15});
  intro
    .to('.nav', {opacity: 1, duration: 0.9, ease: 'power2.out'}, 0)
    .to('[data-hero-in]', {opacity: 1, y: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out'}, 0.1)
    .to('.stage__3d', {opacity: 1, duration: 1.4, ease: 'power2.out'}, 0.25)
    .add(() => stage.classList.add('is-drawn'), 0.6)
    .to('.note', {opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power2.out'}, 1.3);

  // survoler un mot montre sa couche sur le visage (tant que la pile n'est pas éclatée)
  const strata = $$('[data-peek]');
  const showPeek = (n) => {
    strata.forEach((el, i) => el.classList.toggle('is-peek', i === n && n > 0));
    peek.forEach((pk, i) => gsap.to(pk, {o: i === n ? 1 : 0, duration: 0.55, ease: 'power2.out', overwrite: true, onUpdate: render}));
  };
  strata.forEach((el) => {
    const n = Number(el.dataset.peek);
    el.addEventListener('pointerenter', () => showPeek(n));
    el.addEventListener('focus', () => showPeek(n));
    el.addEventListener('pointerleave', () => showPeek(0));
    el.addEventListener('blur', () => showPeek(0));
  });

  /* ═════════ La pile : vue de face → éclatée → couche par couche ═════════ */
  ST.create({
    trigger: '[data-explode]',
    start: () => (mobileQ.matches ? 'top 92%' : 'top 88%'),
    end: () => (mobileQ.matches ? 'top 40%' : 'top 18%'),
    scrub: 0.8,
    invalidateOnRefresh: true,
    onUpdate: (self) => { S.explode = self.progress; render(); },
  });
  $$('.layer').forEach((el, i, all) => {
    ST.create({
      trigger: el,
      start: 'top 58%',
      end: 'bottom 58%',
      onEnter: () => setActive(i),
      onEnterBack: () => setActive(i),
      onLeaveBack: () => { if (i === 0) setActive(-1); },
      onLeave: () => { if (i === all.length - 1) setActive(-1); },
    });
  });

  /* ═════════ Sections sombres : la navigation passe en clair ═════════ */
  const darkSecs = $$('.signature');
  let navTick = 0;
  const navTheme = () => {
    navTick = 0;
    const y = nav.offsetHeight / 2;
    nav.classList.toggle('on-dark', darkSecs.some((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom >= y; }));
  };
  window.addEventListener('scroll', () => { if (!navTick) navTick = requestAnimationFrame(navTheme); }, {passive: true});
  navTheme();

  /* ═════════ Le parcours du chirurgien : chaque étape s'allume à la lecture ═════════ */
  $$('.cv li').forEach((el) => {
    ST.create({trigger: el, start: 'top 70%', onEnter: () => el.classList.add('is-on'), onLeaveBack: () => el.classList.remove('is-on')});
  });

  // la pile s'incline très légèrement vers la souris
  if (fine) {
    const tilt = {x: 0, y: 0};
    const apply = () => { stack.style.setProperty('--px', tilt.x.toFixed(2)); stack.style.setProperty('--py', tilt.y.toFixed(2)); };
    window.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const nx = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1);
      const ny = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2), -1, 1);
      gsap.to(tilt, {x: -ny * 4, y: nx * 6, duration: 1.4, ease: 'power3.out', overwrite: true, onUpdate: apply});
    }, {passive: true});
  }

  initBrief();

  // les polices et la mise en page finale changent les hauteurs : on recalcule
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ST.refresh());
  window.addEventListener('load', () => ST.refresh());

  /* ═════════ « Your consultation » ═════════ */
  function initBrief() {
    const KEY = 'enhance-consult';
    const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
    const write = () => { try { localStorage.setItem(KEY, JSON.stringify([...picked])); } catch (e) { /* stockage indisponible */ } };
    const picked = new Set(read());
    const areas = new Set();
    let pref = 'text';

    const basket = $('[data-basket]');
    const count = $('[data-basket-count]');
    const chips = $('[data-chips]');
    const hint = $('[data-brief-hint]');
    const msgEl = $('[data-brief-msg]');
    const send = $('[data-brief-send]');
    const copy = $('[data-brief-copy]');
    const form = $('[data-brief]');
    const toastEl = $('[data-toast]');
    let toastT = 0;

    const toast = (text) => {
      toastEl.textContent = text;
      toastEl.classList.add('is-on');
      clearTimeout(toastT);
      toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2200);
    };

    const message = () => {
      const name = form.elements.name.value.trim();
      const phone = form.elements.phone.value.trim();
      const topics = [...picked, ...areas];
      let m = 'Hello Enhance,';
      m += name ? ` my name is ${name}.` : '';
      m += ' I would like to book a complimentary consultation';
      m += topics.length ? ` about: ${topics.join(', ')}.` : '.';
      m += pref === 'call' ? ' Please call me' : ' Please text me';
      m += phone ? ` at ${phone}.` : '.';
      m += ' Thank you!';
      return m;
    };

    function sync(bump) {
      $$('[data-tx]').forEach((b) => b.setAttribute('aria-pressed', String(picked.has(b.dataset.tx))));
      const n = picked.size;
      count.textContent = n;
      basket.hidden = n === 0;
      if (bump && n) { basket.classList.remove('bump'); void basket.offsetWidth; basket.classList.add('bump'); }
      chips.innerHTML = '';
      picked.forEach((t) => {
        const c = document.createElement('button');
        c.type = 'button';
        c.className = 'chip chip--picked';
        c.textContent = t;
        c.setAttribute('aria-label', `Remove ${t}`);
        c.addEventListener('click', () => { picked.delete(t); write(); sync(); });
        chips.appendChild(c);
      });
      hint.hidden = n > 0;
      const m = message();
      msgEl.textContent = m;
      send.href = `sms:+13107795488?&body=${encodeURIComponent(m)}`;
    }

    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tx]');
      if (!b) return;
      const t = b.dataset.tx;
      if (picked.has(t)) { picked.delete(t); toast(`${t} removed from your consultation`); }
      else { picked.add(t); toast(`${t} added to your consultation`); }
      write();
      sync(true);
    });
    $$('[data-area]').forEach((c) => c.addEventListener('click', () => {
      const a = c.dataset.area;
      areas.has(a) ? areas.delete(a) : areas.add(a);
      c.setAttribute('aria-pressed', String(areas.has(a)));
      sync();
    }));
    $$('[data-pref]').forEach((c) => c.addEventListener('click', () => {
      pref = c.dataset.pref;
      $$('[data-pref]').forEach((x) => { x.classList.toggle('is-on', x === c); x.setAttribute('aria-checked', String(x === c)); });
      sync();
    }));
    form.addEventListener('input', () => sync());
    form.addEventListener('submit', (e) => e.preventDefault());
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(message());
        copy.textContent = 'Message copied';
      } catch (err) {
        copy.textContent = 'Copy unavailable, select the text';
      }
      setTimeout(() => { copy.textContent = 'Copy message'; }, 2000);
    });
    basket.addEventListener('click', () => scrollToEl(document.getElementById('visit')));
    sync();
  }
})();
