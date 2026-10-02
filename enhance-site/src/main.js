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
    el.innerHTML = `<i>0${i + 1}</i>${name}`;
    stack.appendChild(el);
    return el;
  });
  const FIGS = {jaw: 'Jaw contour', eye: 'Upper eyelid crease', nose: 'Nasal profile and airflow', lift: 'Endoscopic access points'};
  $$('[data-glyph]').forEach((el) => {
    el.innerHTML = A.glyph(el.dataset.glyph);
  });
  $$('.sig__glyph').forEach((el, i) => {
    el.dataset.fig = `Fig. 0${i + 1}  ${FIGS[el.dataset.glyph] || ''}`;
  });

  /* ═════════ Boutons : texte qui roule ═════════ */
  $$('.btn__roll').forEach((el) => {
    const t = el.dataset.text || el.textContent;
    el.innerHTML = `<span>${t}</span><span aria-hidden="true">${t}</span>`;
  });

  /* ═════════ Scène : état de la pile ═════════ */
  const S = {explode: 0, active: -1, fty: 0};
  const focus = planes.map(() => ({dz: 0, o: 1}));
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
    stage.style.setProperty('--no', clamp(1 - p * 3).toFixed(3));
    stage.style.setProperty('--do', clamp((p - 0.55) * 2.4).toFixed(3));
    planes.forEach((el, i) => {
      const base = i === 0 ? 1 : clamp((p - 0.04) * 4);
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
    depthNow.textContent = a < 0 ? 'All layers' : `0${a + 1} ${NAMES[a]}`;
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

  /* ═════════ Découpes de texte ═════════ */
  const splitWords = (el, cls) => {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
            else {
              const w = document.createElement('span');
              w.className = cls;
              if (cls === 'w') w.innerHTML = `<span>${part}</span>`;
              else w.textContent = part;
              frag.appendChild(w);
            }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
  };
  $$('[data-words]').forEach((el) => splitWords(el, 'word'));
  $$('[data-split]').forEach((el) => splitWords(el, 'w'));

  /* ═════════ Compteurs ═════════ */
  const fmt = (v, el) => {
    const d = Number(el.dataset.decimals || 0);
    const n = d ? v.toFixed(d) : String(Math.round(v));
    return el.dataset.format === 'comma' ? Number(n).toLocaleString('en-US') : n;
  };

  /* ═════════ Sans GSAP ou mouvement réduit : état final, lisible ═════════ */
  if (!gsap || !ST || reduce) {
    root.classList.add('is-static');
    $$('.hero__title .line > span, [data-hero-in], .nav, .stage__3d, .note').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    $$('.word').forEach((w) => { w.style.opacity = 1; });
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
    $$('.path__step').forEach((el) => el.classList.add('is-on'));
    initBrief();
    return;
  }

  /* ═════════ Entrée ═════════ */
  const intro = gsap.timeline({delay: 0.15});
  intro
    .to('.nav', {opacity: 1, duration: 1, ease: 'power2.out'}, 0)
    .to('.hero__title .line > span', {y: 0, yPercent: 0, duration: 1.5, stagger: 0.12, ease: 'expo.out'}, 0.1)
    .to('.stage__3d', {opacity: 1, duration: 1.6, ease: 'power2.out'}, 0.2)
    .add(() => stage.classList.add('is-drawn'), 0.55)
    .to('[data-hero-in]', {opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out'}, 0.55)
    .to('.note', {opacity: 1, duration: 0.9, stagger: 0.12, ease: 'power2.out'}, 1.3);
  gsap.set('.hero__title .line > span', {yPercent: 105, y: 0});

  // compteurs du hero, à l'entrée
  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const o = {v: 0};
    el.textContent = fmt(0, el);
    ST.create({
      trigger: el, start: 'top bottom', once: true,
      onEnter: () => gsap.to(o, {v: end, duration: 2, delay: el.closest('.hero') ? 0.9 : 0, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v, el); }}),
    });
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

  // manifeste et citations : les mots s'allument au fil du scroll
  $$('[data-words]').forEach((el) => {
    gsap.to($$('.word', el), {
      opacity: 1, ease: 'none', stagger: 0.08,
      scrollTrigger: {trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: 0.6},
    });
  });

  // titres : les mots montent depuis leur ligne
  $$('[data-split]').forEach((el) => {
    gsap.from($$('.w > span', el), {
      yPercent: 108, rotate: 2.5, duration: 1.3, ease: 'expo.out', stagger: 0.045,
      scrollTrigger: {trigger: el, start: 'top 86%', once: true},
    });
  });

  // apparitions douces des blocs
  const rise = (sel, opts = {}) => $$(sel).forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: opts.y ?? 36, duration: 1.3, ease: 'expo.out',
      scrollTrigger: {trigger: el, start: opts.start || 'top 88%', once: true},
    });
  });
  rise('.layer__head');
  rise('.tx-list > li', {y: 22, start: 'top 94%'});
  rise('.layer__fact');
  rise('.manifesto__note');
  rise('.manifesto__index');
  rise('.sig__text');
  rise('.surgeon__lede');
  rise('.plate');
  rise('.body-sec__lede');
  rise('.gal', {y: 50});
  rise('.rating');
  rise('.quote--small');
  rise('.journal__list li', {y: 24});
  rise('.brief', {y: 60});
  rise('.info__block', {y: 24});

  /* ═════════ Chapitre sombre ═════════ */
  ST.create({
    trigger: '#signature',
    start: 'top 55%',
    end: 'bottom 45%',
    toggleClass: {targets: root, className: 'is-dark'},
  });

  // glyphes : les traits se dessinent avec le scroll
  $$('[data-sig]').forEach((sig) => {
    const svg = $('svg', sig);
    const solid = $$('.g-line, .g-mark:not(.g-dash):not(.g-dot)', svg);
    const dashed = $$('.g-dash, .g-dot', svg);
    solid.forEach((p) => {
      p.setAttribute('pathLength', '1');
      p.style.strokeDasharray = '1';
      p.style.strokeDashoffset = '1';
    });
    dashed.forEach((p) => { p.style.opacity = 0; });
    const tl = gsap.timeline({scrollTrigger: {trigger: sig, start: 'top 78%', end: 'center 52%', scrub: 0.8}});
    tl.to(solid, {strokeDashoffset: 0, duration: 1, stagger: 0.12, ease: 'none'}, 0)
      .to(dashed, {opacity: 1, duration: 0.4, stagger: 0.1, ease: 'none'}, 0.55);
  });

  /* ═════════ Le parcours du chirurgien ═════════ */
  const path = $('[data-path]');
  const fill = document.createElement('span');
  fill.className = 'path__fill';
  path.prepend(fill);
  ST.create({
    trigger: path, start: 'top 65%', end: 'bottom 65%', scrub: 0.6,
    onUpdate: (self) => path.style.setProperty('--pf', self.progress.toFixed(3)),
  });
  $$('.path__step').forEach((el) => {
    ST.create({trigger: el, start: 'top 66%', onEnter: () => el.classList.add('is-on'), onLeaveBack: () => el.classList.remove('is-on')});
    gsap.from(el, {opacity: 0.25, x: 18, duration: 1.1, ease: 'expo.out', scrollTrigger: {trigger: el, start: 'top 80%', once: true}});
  });

  /* ═════════ Le contour du corps ═════════ */
  const contour = $('[data-contour] .contour__line');
  if (contour) {
    contour.setAttribute('pathLength', '1');
    gsap.fromTo(contour, {strokeDasharray: 1, strokeDashoffset: 1}, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: {trigger: '.body-sec__wrap', start: 'top 75%', end: 'bottom 70%', scrub: 0.8},
    });
    gsap.from('[data-contour] .contour__mark', {opacity: 0, scrollTrigger: {trigger: '.body-sec__wrap', start: 'center 70%', end: 'bottom 70%', scrub: true}});
  }

  /* ═════════ Pied de page : le mot se dédouble en couches ═════════ */
  gsap.to('.foot', {'--spread': 1, ease: 'none', scrollTrigger: {trigger: '.foot', start: 'top 95%', end: 'bottom bottom', scrub: 0.8}});

  /* ═════════ Boutons magnétiques et curseur ═════════ */
  if (fine) {
    $$('[data-magnetic]').forEach((el) => {
      const qx = gsap.quickTo(el, 'x', {duration: 0.6, ease: 'power3.out'});
      const qy = gsap.quickTo(el, 'y', {duration: 0.6, ease: 'power3.out'});
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        qx((e.clientX - r.left - r.width / 2) * 0.18);
        qy((e.clientY - r.top - r.height / 2) * 0.3);
      });
      el.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });

    const cursor = $('.cursor');
    const dot = $('.cursor__dot', cursor);
    const ring = $('.cursor__ring', cursor);
    const label = $('.cursor__label', cursor);
    const dx = gsap.quickTo(dot, 'x', {duration: 0.12, ease: 'power3.out'});
    const dy = gsap.quickTo(dot, 'y', {duration: 0.12, ease: 'power3.out'});
    const rx = gsap.quickTo(ring, 'x', {duration: 0.55, ease: 'power3.out'});
    const ry = gsap.quickTo(ring, 'y', {duration: 0.55, ease: 'power3.out'});
    gsap.set([dot, ring], {xPercent: -50, yPercent: -50});
    window.addEventListener('pointermove', (e) => { cursor.classList.remove('is-hidden'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, {passive: true});
    document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('.tx, .tx-chip, .gal, a, button, input');
      cursor.classList.remove('is-link', 'is-label');
      if (!t || t.matches('input')) return;
      if (t.matches('.tx, .tx-chip')) {
        label.textContent = t.getAttribute('aria-pressed') === 'true' ? 'Remove' : 'Add';
        cursor.classList.add('is-label');
      } else if (t.matches('.gal')) {
        label.textContent = 'View';
        cursor.classList.add('is-label');
      } else cursor.classList.add('is-link');
    });
  }

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
      const lab = $('.cursor__label');
      if (lab && $('.cursor').classList.contains('is-label')) lab.textContent = picked.has(t) ? 'Remove' : 'Add';
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
      const roll = $('.btn__roll', copy);
      try {
        await navigator.clipboard.writeText(message());
        roll.firstChild.textContent = 'Copied';
      } catch (err) {
        roll.firstChild.textContent = 'Select and copy';
      }
      setTimeout(() => { roll.firstChild.textContent = 'Copy message'; }, 1800);
    });
    basket.addEventListener('click', () => scrollToEl(document.getElementById('visit')));
    sync();
  }
})();
