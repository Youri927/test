/* Scottsdale Pool Patio & Landscape Design — maquette de refonte.
   L'accroche : la photo apparaît dans un cercle, comme un soleil qui se lève sur le titre,
   puis le cercle s'ouvre au défilement jusqu'à remplir l'écran. */
(function () {
  'use strict';

  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;

  if (!G || !ST) { root.classList.remove('js'); return; }
  G.registerPlugin(ST);
  ST.config({ignoreMobileResize: true});

  // position d'un élément dans un ancêtre, sans tenir compte des transformations en cours
  const offsetIn = (el, anc) => {
    let x = 0, y = 0;
    for (let n = el; n && n !== anc; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
    return {x, y};
  };

  /* ——— Défilement doux ——— */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95});
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const scrollToTarget = (target) => {
    if (lenis) return lenis.scrollTo(target, {duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4)});
    const y = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({top: y, behavior: reduce ? 'auto' : 'smooth'});
  };

  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ——— En-tête : transparent sur l'accroche, puis givré ; s'efface quand on descend ——— */
  const hd = $('[data-hd]');
  const menuBtn = $('.menu-btn');
  const menu = $('#menu');
  let menuOpen = false;
  let heroOut = 0; // défilement où l'accroche a fini de passer sous l'en-tête
  let heroDark = false;
  let heroCover = false;
  let lastY = window.scrollY;
  const darkZones = [];

  function paintHeader() {
    hd.classList.toggle('is-dark', menuOpen || heroDark || darkZones.some((t) => t.isActive));
  }
  // sur la photo ouverte en grand, l'en-tête passe en clair, jusqu'à ce que l'accroche soit passée
  function heroUnderHeader() {
    const d = heroCover && window.scrollY < heroOut + hd.offsetHeight / 2;
    if (d !== heroDark) { heroDark = d; paintHeader(); }
  }
  function headerOnScroll() {
    const y = window.scrollY;
    hd.classList.toggle('is-solid', y > heroOut && !menuOpen);
    if (menuOpen || y < heroOut + 200 || y < lastY - 4) hd.classList.remove('is-hidden');
    else if (y > lastY + 4) hd.classList.add('is-hidden');
    lastY = y;
    heroUnderHeader();
  }
  window.addEventListener('scroll', headerOnScroll, {passive: true});

  function setMenu(open) {
    menuOpen = open;
    menuBtn.setAttribute('aria-expanded', String(open));
    $('.menu-btn__text', menuBtn).textContent = open ? 'Close' : 'Menu';
    hd.classList.toggle('is-menu', open);
    if (open) {
      menu.hidden = false;
      if (lenis) lenis.stop();
      G.fromTo(menu, {clipPath: 'inset(0% 0% 100% 0%)'}, {clipPath: 'inset(0% 0% 0% 0%)', duration: reduce ? 0 : 0.8, ease: 'expo.inOut'});
      G.fromTo($$('.menu__nav a, .menu__tel', menu), {yPercent: 70, opacity: 0}, {yPercent: 0, opacity: 1, duration: reduce ? 0 : 0.9, ease: 'expo.out', stagger: 0.045, delay: reduce ? 0 : 0.28});
    } else {
      if (lenis) lenis.start();
      G.to(menu, {clipPath: 'inset(0% 0% 100% 0%)', duration: reduce ? 0 : 0.6, ease: 'expo.inOut', onComplete: () => { if (!menuOpen) menu.hidden = true; }});
    }
    paintHeader();
    headerOnScroll();
  }
  menuBtn.addEventListener('click', () => setMenu(!menuOpen));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus(); } });

  // liens internes : défilement doux, menu refermé
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('skip')) return;
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : id.length > 1 ? $(id) : null;
    if (target === null) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    scrollToTarget(target);
  });

  /* ——— Découpe des textes en mots et en lignes (l'italique est conservé) ——— */
  function splitWords(el) {
    const words = [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            w.textContent = part;
            frag.appendChild(w);
            words.push(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return words;
  }

  function splitLines(el) {
    const html = el.innerHTML;
    const words = splitWords(el);
    const rows = [];
    let top = null;
    words.forEach((w) => {
      w._em = !!w.parentElement.closest('em');
      const t = w.offsetTop;
      if (top === null || Math.abs(t - top) > 3) { rows.push([]); top = t; }
      rows[rows.length - 1].push(w);
    });
    el.textContent = '';
    const lines = rows.map((ws) => {
      const mask = document.createElement('span');
      mask.className = 'line-mask';
      const line = document.createElement('span');
      line.className = 'line';
      let em = null;
      ws.forEach((w, i) => {
        if (w._em) {
          if (!em) { em = document.createElement('em'); line.appendChild(em); } else em.appendChild(document.createTextNode(' '));
          em.appendChild(w);
        } else {
          if (i) line.appendChild(document.createTextNode(' '));
          em = null;
          line.appendChild(w);
        }
        if (w._em && i && !ws[i - 1]._em) em.before(document.createTextNode(' '));
      });
      mask.appendChild(line);
      el.appendChild(mask);
      return line;
    });
    return {lines, restore: () => { el.innerHTML = html; }};
  }

  /* ——— Accroche ——— */
  const hero = $('[data-hero]');
  const heroImg = $('.hero__sun img', hero);
  const titles = $('.hero__titles', hero);
  const kicker = $('.hero__kicker', hero);
  const foot = $('.hero__foot', hero);
  const facts = $('.hero__facts', hero);
  const after = $('.hero__after', hero);
  const FOCAL = [0.52, 0.73]; // le spa et le foyer, dans la photo
  const H = {q: reduce ? 1 : 0, p: 0};
  let geo = null;
  $('h1.hero__title', hero).classList.add('hero__title--dark-mask');

  function measureHero() {
    const W = hero.clientWidth;
    const Hh = hero.clientHeight;
    const hdH = hd.offsetHeight || 76;
    const t = offsetIn(titles, hero);
    let cx, cy, r0;
    if (W <= 680) {
      // téléphone : entre le titre et les boutons
      const titleBottom = t.y + titles.offsetHeight;
      const footTop = offsetIn(foot, hero).y;
      cx = W / 2;
      cy = (titleBottom + footTop) / 2;
      r0 = Math.min(W * 0.4, (footTop - titleBottom) / 2 - 16);
    } else if (W / Hh < 0.9) {
      // tablette en hauteur : sous le texte, calé à droite
      const footBottom = offsetIn(foot, hero).y + foot.offsetHeight;
      const factsTop = offsetIn(facts, hero).y;
      r0 = Math.min(W * 0.34, (factsTop - footBottom) / 2 - 26);
      cx = W - parseFloat(getComputedStyle(titles.parentElement).paddingRight) - r0 * 0.92;
      cy = (footBottom + factsTop) / 2;
    } else {
      const factsTop = offsetIn(facts, hero).y;
      cx = W * 0.735;
      cy = (hdH + factsTop) / 2;
      r0 = Math.min(W * 0.235, (factsTop - hdH) / 2 - 26);
    }
    r0 = Math.max(r0, 70);
    const rMax = Math.hypot(Math.max(cx, W - cx), Math.max(cy, Hh - cy)) + 4;
    // la photo couvre l'accroche (cover, cadrée à 50 % 62 %) : où tombe le point focal ?
    const nw = heroImg.naturalWidth || 1920;
    const nh = heroImg.naturalHeight || 1280;
    const s = Math.max(W / nw, Hh / nh);
    const fx = (W - nw * s) * 0.5 + FOCAL[0] * nw * s;
    const fy = (Hh - nh * s) * 0.62 + FOCAL[1] * nh * s;
    geo = {W, H: Hh, cx, cy, r0, rMax, fx, fy};
    hero.style.setProperty('--tx', `${t.x}px`);
    hero.style.setProperty('--ty', `${t.y}px`);
  }

  function renderHero() {
    if (!geo) return;
    const {W, cx, cy, r0, rMax, fx, fy} = geo;
    const q = H.q;
    const e = easeIO(clamp(H.p / 0.86));
    const r = Math.max(0.01, lerp(r0 * q, rMax, e));
    const ccy = cy + (1 - q) * 46 * (1 - e);
    // dans le petit cercle, la photo est agrandie et centrée sur le spa ; elle se remet à plat en s'ouvrant
    const Hh = geo.H;
    const is = lerp(1.22 + 0.1 * (1 - q), 1, e);
    let ix = lerp(cx, fx, e) - W / 2 - is * (fx - W / 2);
    let iy = lerp(ccy, fy, e) - Hh / 2 - is * (fy - Hh / 2);
    // sans jamais laisser voir le bord de la photo dans la partie visible du cercle
    ix = clamp(ix, Math.min(W, cx + r) - W / 2 - is * W / 2, Math.max(0, cx - r) - W / 2 + is * W / 2);
    iy = clamp(iy, Math.min(Hh, ccy + r) - Hh / 2 - is * Hh / 2, Math.max(0, ccy - r) - Hh / 2 + is * Hh / 2);
    const st = hero.style;
    st.setProperty('--r', `${r.toFixed(2)}px`);
    st.setProperty('--cx', `${cx.toFixed(2)}px`);
    st.setProperty('--cy', `${ccy.toFixed(2)}px`);
    st.setProperty('--ix', `${ix.toFixed(2)}px`);
    st.setProperty('--iy', `${iy.toFixed(2)}px`);
    st.setProperty('--is', is.toFixed(4));
    st.setProperty('--dark', clamp((H.p - 0.28) / 0.5).toFixed(3));
    const out = clamp(H.p / 0.3);
    const o = (1 - out).toFixed(3);
    kicker.style.opacity = o;
    foot.style.opacity = o;
    facts.style.opacity = o;
    foot.style.transform = `translate3d(0, ${(-out * 36).toFixed(1)}px, 0)`;
    facts.style.transform = `translate3d(0, ${(out * 20).toFixed(1)}px, 0)`;
    const a = clamp((H.p - 0.6) / 0.28);
    after.style.opacity = a.toFixed(3);
    after.style.transform = `translate3d(0, ${((1 - a) * 18).toFixed(1)}px, 0)`;
    // l'en-tête passe en clair quand le cercle couvre toute sa largeur
    heroCover = H.p > 0.2 && Math.hypot(cx, ccy) < r && Math.hypot(W - cx, ccy) < r;
    heroUnderHeader();
  }

  function heroIntro() {
    const lines = $$('.hero__line > span', hero);
    if (reduce) { renderHero(); return; }
    const tl = G.timeline({delay: 0.1});
    tl.to(H, {q: 1, duration: 2.1, ease: 'power3.inOut', onUpdate: renderHero}, 0)
      .fromTo(lines, {y: 0, yPercent: 115}, {yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: (i) => (i % 3) * 0.1}, 0.45)
      .fromTo($$('.hero__kicker > *', hero), {opacity: 0, y: 12}, {opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.07}, 0.9)
      .fromTo($$('.hero__foot > *', hero), {opacity: 0, y: 22}, {opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12}, 1.25)
      .fromTo($$('.hero__facts > li', hero), {opacity: 0, y: 16}, {opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08}, 1.4)
      .fromTo(hd, {opacity: 0}, {opacity: 1, duration: 1.2, ease: 'power2.out'}, 1.1);
  }

  function heroScroll() {
    if (reduce) {
      heroOut = hero.offsetHeight - hd.offsetHeight;
      return;
    }
    ST.create({
      trigger: hero,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * (window.innerWidth > 680 ? 1.2 : 0.9))}`,
      pin: true,
      anticipatePin: 1,
      refreshPriority: 3,
      onUpdate: (s) => { H.p = s.progress; renderHero(); },
      onRefresh: (s) => { heroOut = s.end + hero.offsetHeight - hd.offsetHeight; headerOnScroll(); },
    });
  }

  /* ——— Apparitions ——— */
  const pending = [];
  function revealLines(el, opts = {}) {
    const item = {el, split: splitLines(el), done: false};
    el.style.visibility = 'visible';
    if (reduce) { item.split.restore(); return; }
    G.set(item.split.lines, {yPercent: 110});
    pending.push(item);
    ST.create({
      trigger: el,
      start: opts.start || 'top 86%',
      once: true,
      onEnter: () => {
        item.done = true;
        G.to(item.split.lines, {yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: opts.delay || 0, onComplete: item.split.restore});
      },
    });
  }
  // si la largeur change avant l'apparition, on redécoupe
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    pending.forEach((item) => {
      if (item.done) return;
      item.split.restore();
      item.split = splitLines(item.el);
      G.set(item.split.lines, {yPercent: 110});
    });
  });

  function reveals() {
    $$('[data-lines]').forEach((el) => revealLines(el));
    const words = $$('[data-words]');
    words.forEach((el) => {
      const ws = splitWords(el);
      if (reduce) return;
      G.fromTo(ws, {opacity: 0.14}, {opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: {trigger: el, start: 'top 78%', end: 'bottom 48%', scrub: true}});
    });
    if (reduce) { $$('[data-rise]').forEach((el) => el.classList.add('is-in')); return; }
    ST.batch('[data-rise]', {
      start: 'top 90%',
      once: true,
      onEnter: (els) => els.forEach((el, i) => {
        el.style.transitionDelay = `${(i * 0.08).toFixed(2)}s`;
        el.classList.add('is-in');
      }),
    });
  }

  /* ——— Trois métiers : les volets s'ouvrent au survol ——— */
  function disciplines() {
    const panels = $$('[data-panel]');
    const set = (p) => panels.forEach((x) => x.classList.toggle('is-active', x === p));
    panels.forEach((p) => {
      p.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') set(p); });
      p.addEventListener('focus', () => set(p));
      p.addEventListener('click', () => set(p));
    });
    if (reduce) return;
    ST.batch(panels, {
      start: 'top 85%',
      once: true,
      onEnter: (els) => {
        G.fromTo(els, {clipPath: 'inset(100% 0% 0% 0% round 4px)'}, {clipPath: 'inset(0% 0% 0% 0% round 4px)', duration: 1.5, ease: 'expo.inOut', stagger: 0.12, clearProps: 'clipPath'});
        G.fromTo(els.map((el) => $('.panel__img', el)), {scale: 1.35}, {scale: 1, duration: 2, ease: 'expo.out', stagger: 0.12, delay: 0.25});
        G.fromTo(els.map((el) => $('.panel__body', el)), {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', stagger: 0.12, delay: 0.8});
      },
    });
  }

  /* ——— 25 prestations : la photo de l'élément survolé suit le pointeur, sous le texte ——— */
  function elements() {
    const sec = $('.elements');
    const rows = $$('.el', sec);
    if (!reduce) {
      ST.batch(rows, {
        start: 'top 90%',
        once: true,
        onEnter: (els) => G.fromTo(els, {opacity: 0, y: 40}, {opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08}),
      });
    }
    if (!fine) return;
    const fl = $('.el-float', sec);
    const inner = $('.el-float__inner', fl);
    const list = $('.el-list', sec);
    const imgs = rows.map((row) => {
      const im = $('.el__thumb img', row).cloneNode();
      im.alt = '';
      im.removeAttribute('loading');
      inner.appendChild(im);
      return im;
    });
    G.set(fl, {xPercent: -50, yPercent: -50});
    const dur = reduce ? 0.01 : 0.75;
    const xTo = G.quickTo(fl, 'x', {duration: dur, ease: 'power3'});
    const yTo = G.quickTo(fl, 'y', {duration: dur, ease: 'power3'});
    const rTo = G.quickTo(fl, 'rotation', {duration: 1, ease: 'power3'});
    let px = null;
    let still = null;
    sec.addEventListener('pointermove', (e) => {
      const r = sec.getBoundingClientRect();
      const lr = list.getBoundingClientRect();
      const w = fl.offsetWidth;
      const x = clamp(e.clientX, lr.left + w * 0.5, lr.right - w * 0.5) - r.left;
      if (px === null) { G.set(fl, {x, y: e.clientY - r.top}); }
      xTo(x);
      yTo(e.clientY - r.top);
      // la photo penche un peu dans le sens du mouvement, puis se redresse dès que le pointeur s'arrête
      if (px !== null) rTo(clamp((e.clientX - px) * 0.25, -3, 3));
      px = e.clientX;
      clearTimeout(still);
      still = setTimeout(() => rTo(0), 90);
    });
    rows.forEach((row, i) => row.addEventListener('pointerenter', () => {
      fl.classList.add('is-on');
      imgs.forEach((im, j) => im.classList.toggle('is-on', j === i));
    }));
    list.addEventListener('pointerleave', () => { fl.classList.remove('is-on'); rTo(0); });
  }

  /* ——— Formes de bassin : plan d'architecte dessiné à chaque choix ——— */
  function pools() {
    const NS = 'http://www.w3.org/2000/svg';
    const plan = $('[data-plan]');
    const svg = $('svg', plan);
    const shapes = $('.plan__shapes', svg);
    const nameEl = $('[data-plan-name]', plan);
    const tabs = $$('.type');
    const legend = document.createElement('ol');
    legend.className = 'plan__legend';
    $('.plan__caption', plan).after(legend);

    // deuxième nappe de reflets, plus grande et tournée : les deux se croisent comme au fond d'un bassin
    const defs = $('defs', svg);
    const c1 = $('#caustics', defs);
    const c2 = document.createElementNS(NS, 'pattern');
    c2.setAttribute('id', 'caustics-2');
    c2.setAttribute('href', '#caustics');
    defs.appendChild(c2);

    const add = (parent, tag, attrs) => {
      const n = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
      parent.appendChild(n);
      return n;
    };

    let current = null;
    function draw(type, animate) {
      const spec = window.PoolPlans[type]();
      const g = add(shapes, 'g', {class: 'plan__layer'});
      const deck = spec.deck ? add(g, 'path', {d: spec.deck, class: 'pl-deck'}) : null;
      const under = spec.under.map((t) => add(g, 'path', {d: t.d, class: t.c}));
      const copes = [];
      const waters = [];
      const caus = [];
      const edges = [];
      spec.water.forEach((d, i) => {
        const cd = spec.coping[i];
        if (cd) {
          copes.push(add(g, 'path', {d: cd, class: 'pl-cope-out', pathLength: 1}));
          copes.push(add(g, 'path', {d: cd, class: 'pl-cope-in', pathLength: 1}));
        }
        waters.push(add(g, 'path', {d, class: 'pl-water'}));
        caus.push(add(g, 'path', {d, class: 'pl-caustic'}));
        caus.push(add(g, 'path', {d, class: 'pl-caustic pl-caustic--2'}));
        edges.push(add(g, 'path', {d, class: 'pl-edge', pathLength: 1}));
      });
      const over = spec.over.map((t) => add(g, 'path', {d: t.d, class: t.c}));
      const labels = [];
      legend.textContent = '';
      let n = 0;
      spec.labels.forEach((l) => {
        const lg = add(g, 'g', {class: l.bare ? 'pl-note pl-note--bare' : 'pl-note'});
        const [ax, ay] = l.at;
        const [tx, ty] = l.to;
        if (!l.bare) {
          const pts = l.via ? [l.at, l.via, l.to] : [l.at, l.to];
          add(lg, 'polyline', {points: pts.map((p) => p.join(',')).join(' '), class: 'pl-leader'});
          add(lg, 'circle', {cx: ax, cy: ay, r: 3, class: 'pl-dot'});
        }
        const dx = l.anchor === 'start' ? 7 : l.anchor === 'end' ? -7 : 0;
        const dy = l.anchor === 'middle' ? (ty < ay ? -8 : 15) : 4;
        const text = add(lg, 'text', {x: tx + dx, y: ty + dy, 'text-anchor': l.anchor, class: 'pl-label'});
        text.textContent = l.text.toUpperCase();
        if (!l.bare) {
          n += 1;
          const m = add(lg, 'g', {class: 'pl-num', transform: `translate(${ax} ${ay})`});
          add(m, 'circle', {r: 15});
          add(m, 'text', {y: 6, 'text-anchor': 'middle'}).textContent = String(n);
          const li = document.createElement('li');
          li.textContent = l.text;
          legend.appendChild(li);
        }
        labels.push(lg);
      });

      if (current) {
        const old = current;
        if (animate) G.to(old, {opacity: 0, duration: 0.35, ease: 'power1.out', onComplete: () => old.remove()});
        else old.remove();
      }
      current = g;
      if (!animate) return;
      const tl = G.timeline();
      if (deck) tl.fromTo(deck, {opacity: 0}, {opacity: 1, duration: 0.7, ease: 'power1.out'}, 0.1);
      tl.fromTo(under, {opacity: 0}, {opacity: 1, duration: 0.7, ease: 'power1.out'}, 0.15)
        .fromTo(copes, {strokeDasharray: 1, strokeDashoffset: 1}, {strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset'}, 0.15)
        .fromTo(edges, {strokeDasharray: 1, strokeDashoffset: 1}, {strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset'}, 0.25)
        .fromTo(waters, {opacity: 0}, {opacity: 1, duration: 1, ease: 'power1.inOut'}, 0.75)
        .fromTo(caus, {opacity: 0}, {opacity: (i, el) => (el.classList.contains('pl-caustic--2') ? 0.32 : 0.5), duration: 1.4, ease: 'power1.inOut'}, 1)
        .fromTo(over, {opacity: 0}, {opacity: 1, duration: 0.6, ease: 'power1.out', stagger: 0.05}, 0.9)
        .fromTo(labels, {opacity: 0, y: 6}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.09}, 1.25);
    }

    function select(tab, focus) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) tab.focus();
      nameEl.textContent = $('.type__name', tab).textContent;
      draw(tab.dataset.type, !reduce);
    }
    tabs.forEach((t, i) => {
      t.id = `type-${t.dataset.type}`;
      t.tabIndex = i ? -1 : 0;
      t.addEventListener('click', () => { if (!t.classList.contains('is-active')) select(t); });
      t.addEventListener('keydown', (e) => {
        const k = e.key;
        let j = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') j = (i + 1) % tabs.length;
        else if (k === 'ArrowUp' || k === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
        else if (k === 'Home') j = 0;
        else if (k === 'End') j = tabs.length - 1;
        if (j === null) return;
        e.preventDefault();
        select(tabs[j], true);
      });
    });
    svg.setAttribute('aria-labelledby', 'plan-title');
    draw(tabs[0].dataset.type, false);
    const firstLayer = current;

    // premier dessin quand le plan arrive à l'écran
    if (!reduce) {
      G.set(firstLayer, {opacity: 0});
      ST.create({
        trigger: plan,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          if (current !== firstLayer) return;
          firstLayer.remove();
          current = null;
          draw($('.type.is-active').dataset.type, true);
        },
      });
    }

    // les reflets dérivent lentement, seulement quand le plan est visible
    let visible = false;
    let t = 0;
    ST.create({trigger: plan, start: 'top bottom', end: 'bottom top', onToggle: (s) => { visible = s.isActive; }});
    if (!reduce) {
      G.ticker.add((time, delta) => {
        if (!visible) return;
        t += delta / 1000;
        c1.setAttribute('patternTransform', `translate(${((t * 7) % 300).toFixed(2)} ${((t * 4) % 300).toFixed(2)})`);
        c2.setAttribute('patternTransform', `rotate(32) scale(1.45) translate(${(-(t * 5) % 300).toFixed(2)} ${((t * 3) % 300).toFixed(2)})`);
      });
    } else c2.setAttribute('patternTransform', 'rotate(32) scale(1.45)');
  }

  /* ——— Réalisations : défilement horizontal, légère parallaxe, visionneuse ——— */
  function work() {
    const sec = $('.work');
    const pinEl = $('[data-work]', sec);
    const track = $('[data-track]', sec);
    const bar = $('[data-work-progress]', sec);
    const shots = $$('.shot', track);
    const mm = G.matchMedia();
    if (!reduce) {
      mm.add('(min-width: 681px)', () => {
        const last = shots[shots.length - 1];
        const pad = () => parseFloat(getComputedStyle(track).paddingRight) || 0;
        const dist = () => Math.max(0, last.offsetLeft + last.offsetWidth + pad() - window.innerWidth);
        const tween = G.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: pinEl,
            start: 'top top',
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 2,
            onUpdate: (s) => { bar.style.transform = `scaleX(${s.progress.toFixed(4)})`; },
          },
        });
        shots.forEach((shot) => {
          const img = $('img', shot);
          G.fromTo(img, {'--px': '7%'}, {'--px': '-7%', ease: 'none', scrollTrigger: {trigger: shot, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true}});
          G.fromTo(shot, {opacity: 0.35}, {opacity: 1, ease: 'none', scrollTrigger: {trigger: shot, containerAnimation: tween, start: 'left 105%', end: 'left 70%', scrub: true}});
        });
      });
    } else sec.classList.add('is-static');

    // la visionneuse
    const lb = $('[data-lightbox]');
    const lbImg = $('[data-lb-img]', lb);
    const lbCap = $('[data-lb-cap]', lb);
    let li = 0;
    const caption = (i) => `${String(i + 1).padStart(2, '0')} / ${shots.length} · ${$('figcaption', shots[i]).textContent.replace(/^\d+/, '')}`;
    const fill = () => {
      const im = $('img', shots[li]);
      lbImg.src = im.currentSrc || im.src;
      lbImg.alt = im.alt;
      lbCap.textContent = caption(li);
    };
    const open = (i) => {
      li = i;
      fill();
      lb.showModal();
      if (lenis) lenis.stop();
      if (!reduce) {
        G.fromTo(lb, {opacity: 0}, {opacity: 1, duration: 0.45, ease: 'power2.out'});
        G.fromTo(lbImg, {opacity: 0, scale: 0.96}, {opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out', delay: 0.05});
      }
    };
    const go = (d) => {
      li = (li + d + shots.length) % shots.length;
      if (reduce) { fill(); return; }
      G.to(lbImg, {opacity: 0, x: -24 * d, duration: 0.2, ease: 'power2.in', onComplete: () => {
        fill();
        G.fromTo(lbImg, {opacity: 0, x: 24 * d}, {opacity: 1, x: 0, duration: 0.55, ease: 'power3.out'});
      }});
    };
    $$('[data-shot]', track).forEach((b) => b.addEventListener('click', () => open(Number(b.dataset.shot))));
    $('[data-lb-prev]', lb).addEventListener('click', () => go(-1));
    $('[data-lb-next]', lb).addEventListener('click', () => go(1));
    $('[data-lb-close]', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('close', () => { if (lenis) lenis.start(); });
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lightbox__fig')) lb.close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    });
    let sx = null;
    lb.addEventListener('pointerdown', (e) => { sx = e.clientX; });
    lb.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    });

    // au survol d'une photo, une pastille « Voir » suit le pointeur
    if (fine && !reduce) {
      const cur = document.createElement('div');
      cur.className = 'cursor';
      cur.setAttribute('aria-hidden', 'true');
      cur.innerHTML = '<span>View</span>';
      document.body.appendChild(cur);
      root.classList.add('has-cursor');
      const xTo = G.quickTo(cur, 'x', {duration: 0.45, ease: 'power3'});
      const yTo = G.quickTo(cur, 'y', {duration: 0.45, ease: 'power3'});
      window.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); }, {passive: true});
      $$('.shot__btn', track).forEach((b) => {
        b.addEventListener('pointerenter', () => cur.classList.add('is-on'));
        b.addEventListener('pointerleave', () => cur.classList.remove('is-on'));
      });
      window.addEventListener('scroll', () => { if (!$('.shot__btn:hover')) cur.classList.remove('is-on'); }, {passive: true});
    }
  }

  /* ——— Déroulé : l'étape au centre de l'écran s'allume, la photo suit ——— */
  function process() {
    const steps = $$('[data-step]');
    const imgs = $$('.process__frame img');
    const num = $('[data-step-n]');
    let cur = 0;
    const set = (i) => {
      if (i === cur) return;
      cur = i;
      steps.forEach((s, j) => s.classList.toggle('is-on', j <= i));
      imgs.forEach((im, j) => im.classList.toggle('is-on', j === i));
      num.textContent = String(i + 1).padStart(2, '0');
    };
    // l'étape en cours : la dernière dont le haut a passé 62 % de l'écran (robuste aux sauts d'ancre)
    const pick = () => {
      const y = window.innerHeight * 0.62;
      let i = 0;
      steps.forEach((s, j) => { if (s.getBoundingClientRect().top < y) i = j; });
      set(i);
    };
    ST.create({trigger: $('.steps'), start: 'top bottom', end: 'bottom top', onUpdate: pick, onRefresh: pick});
    const bars = $$('.timeline__bar');
    if (reduce) return;
    G.fromTo(bars, {scaleX: 0}, {scaleX: 1, duration: 1.6, ease: 'expo.out', stagger: 0.25, scrollTrigger: {trigger: '[data-timeline]', start: 'top 85%', once: true}});
  }

  /* ——— Avis : un à la fois, les lignes montent ——— */
  function reviews() {
    const box = $('[data-quotes]');
    const quotes = $$('.quote', box);
    const nEl = $('[data-q-n]', box);
    let qi = 0;
    let timer = null;
    let inView = false;
    let hover = false;
    let touched = false;
    const originals = quotes.map((q) => $('p', q).innerHTML);
    quotes.forEach((q, i) => { if (i) G.set(q, {autoAlpha: 0}); q.classList.add('is-on'); });
    const show = (n, dir) => {
      n = (n + quotes.length) % quotes.length;
      if (n === qi) return;
      const out = quotes[qi];
      const inn = quotes[n];
      qi = n;
      nEl.textContent = String(n + 1);
      if (reduce) { G.set(out, {autoAlpha: 0}); G.set(inn, {autoAlpha: 1}); return; }
      G.to(out, {autoAlpha: 0, y: -14 * dir, duration: 0.4, ease: 'power2.in'});
      const p = $('p', inn);
      p.innerHTML = originals[n];
      const split = splitLines(p);
      G.set(inn, {autoAlpha: 1, y: 0});
      G.fromTo(split.lines, {yPercent: 105}, {yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07, delay: 0.3, onComplete: split.restore});
      G.fromTo($('footer', inn), {opacity: 0, y: 10}, {opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.6});
    };
    const schedule = () => {
      clearTimeout(timer);
      if (touched || reduce || !inView || hover) return;
      timer = setTimeout(() => { show(qi + 1, 1); schedule(); }, 8000);
    };
    $('[data-q-prev]', box).addEventListener('click', () => { touched = true; show(qi - 1, -1); schedule(); });
    $('[data-q-next]', box).addEventListener('click', () => { touched = true; show(qi + 1, 1); schedule(); });
    box.addEventListener('pointerenter', () => { hover = true; schedule(); });
    box.addEventListener('pointerleave', () => { hover = false; schedule(); });
    box.addEventListener('focusin', () => { hover = true; schedule(); });
    box.addEventListener('focusout', () => { hover = false; schedule(); });
    let sx = null;
    box.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') sx = e.clientX; });
    box.addEventListener('pointerup', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 50) { touched = true; show(qi + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); }
    });
    ST.create({trigger: box, start: 'top 80%', end: 'bottom 20%', onToggle: (s) => { inView = s.isActive; schedule(); }});
    if (!reduce) {
      const score = $('.proof__score');
      G.fromTo($$('.proof__stars svg', score), {opacity: 0.2, scale: 0.6}, {opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(2)', stagger: 0.1, scrollTrigger: {trigger: score, start: 'top 80%', once: true}});
    }
  }

  /* ——— Questions : une réponse ouverte à la fois ——— */
  function faq() {
    const items = $$('.qa__item');
    let refreshTimer = null;
    const refresh = () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(() => ST.refresh(), 60); };
    const toggle = (item, open) => {
      const btn = $('.qa__q', item);
      const panel = $('.qa__a', item);
      if ((btn.getAttribute('aria-expanded') === 'true') === open) return;
      btn.setAttribute('aria-expanded', String(open));
      if (reduce) { panel.hidden = !open; refresh(); return; }
      G.killTweensOf(panel);
      if (open) {
        panel.hidden = false;
        G.fromTo(panel, {height: 0}, {height: 'auto', duration: 0.7, ease: 'expo.out', onComplete: () => { panel.style.height = ''; refresh(); }});
        G.fromTo(panel.firstElementChild, {opacity: 0, y: 10}, {opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.08});
      } else {
        G.to(panel, {height: 0, duration: 0.45, ease: 'power3.inOut', onComplete: () => { panel.hidden = true; panel.style.height = ''; refresh(); }});
      }
    };
    items.forEach((item, i) => {
      const btn = $('.qa__q', item);
      const panel = $('.qa__a', item);
      btn.id = `q-${i + 1}`;
      panel.id = `a-${i + 1}`;
      btn.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', btn.id);
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        items.forEach((other) => { if (other !== item) toggle(other, false); });
        toggle(item, open);
      });
    });
  }

  /* ——— Devis en trois étapes (maquette : rien n'est envoyé) ——— */
  function quoteForm() {
    const form = $('[data-form]');
    const steps = $$('[data-form-step]', form);
    const nEl = $('[data-form-n]', form);
    const bar = $('[data-form-bar]', form);
    const back = $('[data-form-back]', form);
    const nextLabel = $('[data-form-next-label]', form);
    const done = $('[data-form-done]', form);
    let s = 0;
    const error = (i, show) => { const p = $('[data-error]', steps[i]); if (p) p.hidden = !show; };
    const valid = (i) => {
      if (i === 0) {
        const ok = $$('input[name="project"]:checked', form).length > 0;
        error(0, !ok);
        if (!ok) $('input[name="project"]', form).focus();
        return ok;
      }
      if (i === 2) {
        const checks = [
          [form.elements.namedItem('name'), (v) => v.trim().length > 1],
          [form.elements.namedItem('email'), (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())],
          [form.elements.namedItem('phone'), (v) => v.replace(/\D/g, '').length >= 7],
        ];
        let first = null;
        checks.forEach(([input, test]) => {
          const ok = test(input.value);
          input.setAttribute('aria-invalid', String(!ok));
          if (!ok && !first) first = input;
        });
        error(2, !!first);
        if (first) first.focus();
        return !first;
      }
      return true;
    };
    const show = (i, dir) => {
      const prev = steps[s];
      s = i;
      prev.hidden = true;
      steps[i].hidden = false;
      steps.forEach((st, j) => st.classList.toggle('is-on', j === i));
      nEl.textContent = String(i + 1);
      bar.style.width = `${((i + 1) / steps.length) * 100}%`;
      back.hidden = i === 0;
      nextLabel.textContent = i === steps.length - 1 ? 'Send request' : 'Continue';
      if (!reduce) G.fromTo(steps[i], {opacity: 0, x: 24 * dir}, {opacity: 1, x: 0, duration: 0.6, ease: 'power3.out'});
      const focusable = $('input, select, textarea', steps[i]);
      if (focusable && dir > 0) focusable.focus({preventScroll: true});
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!valid(s)) return;
      if (s < steps.length - 1) { show(s + 1, 1); return; }
      form.classList.add('is-done');
      steps.forEach((st) => { st.hidden = true; });
      done.hidden = false;
      done.setAttribute('tabindex', '-1');
      done.focus({preventScroll: true});
      if (!reduce) G.fromTo(done.children, {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1});
    });
    back.addEventListener('click', () => { if (s > 0) show(s - 1, -1); });
    form.addEventListener('change', (e) => {
      if (e.target.name === 'project') error(0, false);
      if (e.target.getAttribute('aria-invalid') === 'true') e.target.setAttribute('aria-invalid', 'false');
    });
  }

  /* ——— Boutons principaux : léger effet d'aimant ——— */
  function magnets() {
    if (!fine || reduce) return;
    $$('.btn:not(.btn--sm)').forEach((b) => {
      const xTo = G.quickTo(b, 'x', {duration: 0.6, ease: 'power3'});
      const yTo = G.quickTo(b, 'y', {duration: 0.6, ease: 'power3'});
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.18);
        yTo((e.clientY - r.top - r.height / 2) * 0.28);
      });
      b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ——— Pied de page : le grand mot se remplit en arrivant en bas ——— */
  function footer() {
    const word = $('.ft__word');
    if (!word || reduce) return;
    G.fromTo(word, {'--fill': '0%'}, {'--fill': '100%', ease: 'none', scrollTrigger: {trigger: word, start: 'top 95%', end: 'bottom 70%', scrub: true}});
  }

  /* ——— Zones sombres sous l'en-tête, rubrique en cours (créées après les épinglages) ——— */
  function headerZones() {
    $$('.elements, .work, .proof, .quote-sec, .ft').forEach((el) => {
      darkZones.push(ST.create({trigger: el, start: 'top 38px', end: 'bottom 38px', onToggle: paintHeader}));
    });
    $$('.nav a').forEach((a) => {
      const t = $(a.getAttribute('href'));
      if (!t) return;
      ST.create({trigger: t, start: 'top 45%', end: 'bottom 45%', onToggle: (s) => a.classList.toggle('is-current', s.isActive)});
    });
    paintHeader();
  }

  /* ——— Démarrage : polices chargées et photo d'accroche décodée ——— */
  function start() {
    measureHero();
    renderHero();
    heroIntro();
    heroScroll();
    reveals();
    disciplines();
    elements();
    pools();
    work();
    process();
    reviews();
    faq();
    quoteForm();
    magnets();
    footer();
    headerZones();
    ST.addEventListener('refreshInit', () => { if (geo) measureHero(); });
    ST.addEventListener('refresh', renderHero);
    ST.refresh();
    headerOnScroll();
    root.classList.add('is-ready');
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const ready = Promise.all([
    document.fonts ? document.fonts.ready : null,
    heroImg.decode ? heroImg.decode().catch(() => null) : null,
  ]);
  Promise.race([ready, wait(2500)]).then(() => {
    try { start(); } catch (err) {
      root.classList.remove('js');
      G.set('.hd, .hero__line > span, .hero__kicker > *, .hero__foot > *, .hero__facts > li', {clearProps: 'all'});
      throw err;
    }
  });
})();
