/* La Ferme de la Biza : une journée au bord de l'Aisne.
   Le défilement fait avancer l'heure : le ciel, le soleil, la lune, les étoiles, l'Aisne et les couleurs
   de la page suivent. Puis l'arche s'ouvre, l'îlot, le préau se dessine, la guirlande et le gîte s'allument. */
(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);

  /* hasard reproductible : mêmes arbres, mêmes étoiles à chaque visite */
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /* ——— Défilement doux ——— */
  let lenis = null;
  if (!reduce && window.Lenis && G) {
    lenis = new window.Lenis({lerp: 0.1, smoothWheel: true});
    lenis.on('scroll', () => ST && ST.update());
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const scrollToY = (y) => (lenis ? lenis.scrollTo(y, {duration: 1.4}) : window.scrollTo({top: y, behavior: reduce ? 'auto' : 'smooth'}));

  /* ——— Les couleurs du ciel, heure par heure : haut du ciel, bas du ciel, terre ——— */
  const KEYS = [
    [15, '#8FBAC3', '#E8EEE3', '#2E4A3E'],
    [17, '#9DBCBA', '#EFE4CB', '#38493B'],
    [18.8, '#C79C6C', '#F1CD98', '#4A3B2C'],
    [20.4, '#80688F', '#E3937B', '#3A2B33'],
    [21.5, '#38427A', '#9A6E8C', '#221D33'],
    [23, '#121836', '#272C54', '#0E1022'],
    [25.6, '#070A18', '#131935', '#06070F'],
    [29.3, '#272C54', '#605079', '#141329'],
    [31.5, '#E6BC98', '#F5E5D2', '#4D4A3A'],
    [33, '#B6D1D3', '#EEF0E6', '#2E4A3E'],
  ];
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const K = KEYS.map(([t, a, b, c]) => [t, hex(a), hex(b), hex(c)]);
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const css = (c, a = 1) => `rgba(${c.map((v) => Math.round(v)).join(',')},${a})`;
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const DARK = [22, 32, 28], LIGHT = [244, 238, 227];
  const state = {t: 15, top: K[0][1], bot: K[0][2], land: K[0][3], night: 0, sun: {x: 0, y: 0, a: 1}, moon: {x: 0, y: 0, a: 0}};

  function skyAt(t) {
    let i = 0;
    while (i < K.length - 2 && t > K[i + 1][0]) i++;
    const a = K[i], b = K[i + 1];
    const k = smooth(0, 1, clamp((t - a[0]) / (b[0] - a[0])));
    return {top: mix(a[1], b[1], k), bot: mix(a[2], b[2], k), land: mix(a[3], b[3], k)};
  }

  const sunEl = $('[data-sun]');
  const moonEl = $('[data-moon]');
  const clockTime = $('[data-clock-time]');
  const clockLabel = $('[data-clock-label]');
  const clockHand = $('[data-clock-hand]');
  const clockEl = $('.clock');
  const metaTheme = $('meta[name="theme-color"]');
  let lastLabel = '';

  function paint(t) {
    state.t = t;
    const s = skyAt(t);
    state.top = s.top; state.bot = s.bot; state.land = s.land;
    const L = 0.45 * lum(s.top) + 0.55 * lum(s.bot);
    const day = smooth(0.17, 0.32, L); // 1 = texte sombre, 0 = texte clair
    state.night = 1 - smooth(0.05, 0.2, L);
    const ink = mix(LIGHT, DARK, day);
    const st = root.style;
    st.setProperty('--sky-top', css(s.top));
    st.setProperty('--sky-bot', css(s.bot));
    st.setProperty('--land', css(s.land));
    st.setProperty('--ink', css(ink));
    st.setProperty('--ink-2', css(ink, 0.74));
    st.setProperty('--ink-3', css(ink, 0.5));
    st.setProperty('--line', css(ink, 0.18));
    st.setProperty('--glass', day > 0.5 ? css([255, 255, 255], 0.34) : css([10, 14, 32], 0.42));
    st.setProperty('--accent', css(mix([243, 211, 156], [31, 61, 51], day)));
    st.setProperty('--on-accent', css(mix([26, 24, 34], [244, 238, 227], day)));
    st.setProperty('--night', state.night.toFixed(3));
    if (metaTheme) metaTheme.content = css(s.top);
    inkCss = css(ink);
    if (heroRiver && Math.abs(t - preppedAt) > 0.2) prepTitle(heroRiver);

    // le soleil : levé vers 6 h, couché vers 21 h 50
    const h = ((t % 24) + 24) % 24;
    const W = innerWidth, H = innerHeight;
    const sa = Math.sin(Math.PI * clamp((h - 6) / 15.8));
    const sx = lerp(0.1, 0.9, clamp((h - 6) / 15.8));
    state.sun = {x: sx * W, y: H * (0.72 - 0.6 * sa), a: h > 5.5 && h < 22 ? smooth(0, 0.08, sa) : 0};
    sunEl.style.transform = `translate(${state.sun.x}px, ${state.sun.y}px)`;
    sunEl.style.opacity = state.sun.a.toFixed(3);
    const warm = 1 - smooth(0.15, 0.6, sa);
    st.setProperty('--sun-core', css(mix([255, 247, 227], [255, 196, 120], warm)));
    st.setProperty('--sun-halo', css(mix([255, 236, 196], [255, 150, 90], warm), 0.55));
    // la lune : de 21 h 30 à 6 h
    const mt = (t - 21.5) / 8.5;
    const ma = mt > 0 && mt < 1 ? Math.sin(Math.PI * mt) : 0;
    state.moon = {x: lerp(0.86, 0.2, clamp(mt)) * W, y: H * (0.7 - 0.52 * ma), a: smooth(0, 0.15, ma) * state.night};
    moonEl.style.transform = `translate(${state.moon.x}px, ${state.moon.y}px)`;
    moonEl.style.opacity = state.moon.a.toFixed(3);

    // l'horloge
    const hh = Math.floor(h), mm = Math.floor((h - hh) * 60 / 10) * 10;
    clockTime.textContent = `${hh} h ${String(mm).padStart(2, '0')}`;
    clockHand.style.setProperty('--hand', `${(h % 12) * 30}deg`);
    clockEl.classList.toggle('is-off', t > 32.4);
    const label = t >= 29 ? 'Le lendemain' : 'Une journée à la Biza';
    if (label !== lastLabel) { clockLabel.textContent = label; lastLabel = label; }
    drawStars();
  }

  /* ——— L'heure, d'après le défilement : chaque partie porte son heure (data-time) ——— */
  const stops = $$('[data-time]');
  let marks = [];
  const measure = () => {
    marks = stops.map((el) => {
      const r = el.getBoundingClientRect();
      return [r.top + scrollY + r.height * 0.5, Number(el.dataset.time)];
    });
  };
  const timeAt = (y) => {
    const v = y + innerHeight * 0.55;
    if (v <= marks[0][0]) return marks[0][1];
    for (let i = 1; i < marks.length; i++) {
      if (v <= marks[i][0]) {
        const [y0, t0] = marks[i - 1], [y1, t1] = marks[i];
        return lerp(t0, t1, (v - y0) / (y1 - y0));
      }
    }
    return marks[marks.length - 1][1];
  };
  let lastT = -1;
  const onScroll = () => {
    const t = timeAt(scrollY);
    if (Math.abs(t - lastT) > 0.002) { lastT = t; paint(t); }
    nav.classList.toggle('is-scrolled', scrollY > 30);
  };

  /* ——— Les étoiles ——— */
  const stars = $('[data-stars]');
  const sctx = stars.getContext('2d');
  let starList = [];
  let starNow = 0;
  const sizeStars = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    stars.width = innerWidth * dpr; stars.height = innerHeight * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const r = rng(11);
    starList = Array.from({length: Math.round(innerWidth * innerHeight / 5200)}, () => ({x: r() * innerWidth, y: Math.pow(r(), 1.6) * innerHeight * 0.75, s: 0.4 + r() * 1.3, p: r() * 6.28}));
  };
  function drawStars() {
    if (state.night < 0.02) { if (starNow) { sctx.clearRect(0, 0, innerWidth, innerHeight); starNow = 0; } return; }
    starNow = 1;
    const time = performance.now() / 1000;
    sctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const s of starList) {
      const tw = reduce ? 0.8 : 0.55 + 0.45 * Math.sin(time * 1.3 + s.p);
      sctx.fillStyle = `rgba(255, 248, 232, ${(0.35 + 0.65 * tw) * 0.9})`;
      sctx.beginPath();
      sctx.arc(s.x, s.y, s.s, 0, 6.283);
      sctx.fill();
    }
  }

  /* ——— Une ligne d'arbres, pour l'horizon du domaine ——— */
  const treePath = (seed, w, h, base) => {
    const r = rng(seed);
    let x = 0;
    let d = `M0 ${h} L0 ${base}`;
    while (x < w) {
      const cw = 30 + r() * 70;
      const ch = base - (14 + r() * (h * 0.7));
      d += ` Q${(x + cw * 0.5).toFixed(1)} ${(ch - 10 * r()).toFixed(1)} ${(x + cw).toFixed(1)} ${(base - r() * 10).toFixed(1)}`;
      x += cw * (0.7 + r() * 0.2);
    }
    return d + ` L${w} ${h} Z`;
  };
  $('[data-trees]').setAttribute('d', treePath(4, 1600, 120, 118));

  // la rive et l'îlot
  const bankPath = () => {
    const r = rng(9);
    let d = 'M0 200 L0 120';
    let x = 0;
    while (x < 1600) {
      const cw = 40 + r() * 80;
      const top = x < 560 ? 40 : x > 1120 ? 70 : 120;
      d += ` Q${(x + cw / 2).toFixed(1)} ${(top - r() * 30).toFixed(1)} ${(x + cw).toFixed(1)} ${(top + 30 + r() * 30).toFixed(1)}`;
      x += cw * 0.75;
    }
    return d + ' L1600 200 Z';
  };
  const islandPath = () => {
    const r = rng(17);
    let d = 'M610 262';
    let x = 610;
    while (x < 990) {
      const cw = 26 + r() * 40;
      d += ` Q${x + cw / 2} ${170 - r() * 60} ${x + cw} ${200 - r() * 30}`;
      x += cw * 0.8;
    }
    return d + ' L1010 262 C 900 276, 720 276, 610 262 Z';
  };
  $('[data-bank]').setAttribute('d', 'M0 420 L0 398 C 400 380, 1200 382, 1600 398 L1600 420 Z');
  $('[data-island]').setAttribute('d', islandPath());
  // le bois du parc, sur l'autre rive
  const isleSvg = $('.isle__land');
  const far = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  far.setAttribute('d', bankPath());
  far.setAttribute('class', 'isle__bank');
  far.style.opacity = '.78';
  isleSvg.insertBefore(far, isleSvg.firstChild);
  const farShape = new Path2D(far.getAttribute('d'));
  const islandShape = new Path2D($('[data-island]').getAttribute('d'));

  /* ——— L'Aisne : l'eau reflète le ciel, le soleil, et le nom du domaine ——— */
  const rivers = $$('[data-river]').map((cv) => ({cv, ctx: cv.getContext('2d'), kind: cv.dataset.river, on: false, w: 0, h: 0}));
  const title = $('[data-title]');
  const titleText = title.querySelector('[aria-hidden]');
  let rise = reduce ? 1 : 0;
  root.style.setProperty('--rise', rise);
  const buf = document.createElement('canvas');
  const bctx = buf.getContext('2d');
  const tbuf = document.createElement('canvas');
  const tctx = tbuf.getContext('2d');
  const treeShape = new Path2D($('[data-trees]').getAttribute('d'));
  let bufReady = false;
  let heroRiver = null;
  let inkCss = '#16201C';
  let preppedAt = -99;

  function sizeRiver(r) {
    const rect = r.cv.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    r.w = rect.width; r.h = rect.height; r.dpr = dpr;
    r.cv.width = Math.round(r.w * dpr); r.cv.height = Math.round(r.h * dpr);
    r.top = rect.top + scrollY;
    if (r.kind === 'hero') prepTitle(r);
  }
  // le nom et les arbres, dessinés une fois dans un tampon, pour leur reflet
  function prepTitle(r) {
    heroRiver = r;
    const cs = getComputedStyle(title);
    const tr = titleText.getBoundingClientRect();
    const fs = parseFloat(cs.fontSize);
    const dpr = r.dpr;
    const w = r.w, hgt = Math.round(fs * 0.9);
    // le nom : sa ligne de base est posée sur l'horizon
    buf.width = Math.round(w * dpr); buf.height = Math.round(hgt * dpr);
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.clearRect(0, 0, w, hgt);
    bctx.font = `600 ${fs}px "Bodoni Moda"`;
    try { bctx.letterSpacing = `${(-0.035 * fs).toFixed(1)}px`; } catch (e) { /* navigateurs anciens */ }
    bctx.textAlign = 'center';
    bctx.textBaseline = 'alphabetic';
    bctx.fillStyle = inkCss;
    bctx.fillText('La Biza', tr.left + tr.width / 2 - r.cv.getBoundingClientRect().left, hgt - fs * 0.035);
    // la ligne d'arbres
    const th = $('.trees').getBoundingClientRect().height;
    tbuf.width = Math.round(w * dpr); tbuf.height = Math.round(th * dpr);
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tctx.clearRect(0, 0, w, th);
    tctx.scale(w / 1600, th / 120);
    tctx.fillStyle = css(state.land);
    tctx.fill(treeShape);
    bufReady = true;
    preppedAt = state.t;
  }

  function drawRiver(r, now) {
    const {ctx, w, h, dpr} = r;
    const time = reduce ? 0 : now / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // l'eau : le ciel renversé, un peu plus sombre
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, css(mix(state.bot, state.top, 0.35).map((v) => v * 0.86)));
    g.addColorStop(1, css(state.top.map((v) => v * 0.6)));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // reflet du nom (et de la ligne d'arbres) dans l'eau, qui ondule
    if (r.kind === 'hero' && bufReady) {
      const wave = (y, k) => (reduce ? 0 : Math.sin(y * 0.11 + time * 1.7) * (1.5 + k * 9) + Math.sin(y * 0.031 - time * 0.8) * k * 6);
      ctx.save();
      // les arbres
      const th = tbuf.height / dpr;
      for (let y = 0; y < th; y += 2) {
        const k = y / th;
        ctx.globalAlpha = 0.5 * (1 - k);
        ctx.drawImage(tbuf, 0, (th - 2 - y) * dpr, tbuf.width, 2 * dpr, wave(y, k) * 0.6, y, w, 2);
      }
      // le nom, qui ondule (et ne se reflète qu'une fois sorti de l'horizon)
      const bh = buf.height / dpr;
      const lift = (1 - rise) * bh;
      const rows = Math.min(h, bh * 0.95);
      for (let y = 0; y < rows; y += 2) {
        const src = bh - 2 - y + lift;
        if (src < 0 || src >= bh - 1) continue;
        const k = y / rows;
        ctx.globalAlpha = 0.42 * (1 - k) * (1 - k * 0.4);
        ctx.drawImage(buf, 0, src * dpr, buf.width, 2 * dpr, wave(y, k), y, w, 2);
      }
      ctx.restore();
    }

    // reflet du soleil (ou de la lune) : une colonne de petits éclats
    const light = state.sun.a > 0.05 ? state.sun : state.moon.a > 0.05 ? state.moon : null;
    if (light) {
      const warm = light === state.sun ? [255, 230, 180] : [240, 236, 222];
      for (let i = 0; i < 70; i++) {
        const k = i / 70;
        const y = Math.pow(k, 1.6) * h;
        const spread = 10 + k * 70;
        const x = light.x + Math.sin(i * 12.9898 + time * (1.2 + (i % 5) * 0.2)) * spread;
        const len = 8 + (1 - k) * 34 * (0.5 + 0.5 * Math.sin(i * 3.1 + time * 2));
        ctx.fillStyle = css(warm, 0.5 * light.a * (1 - k * 0.6));
        ctx.fillRect(x - len / 2, y, len, 1.4);
      }
    }
    // petites rides qui passent
    ctx.fillStyle = css(mix(state.bot, [255, 255, 255], 0.5), 0.22 + 0.1 * (1 - state.night));
    const rr = rng(5);
    for (let i = 0; i < 46; i++) {
      const y = Math.pow(rr(), 1.4) * h;
      const len = 20 + rr() * 90 * (0.4 + y / h);
      const x = ((rr() * (w + 200) + time * (8 + rr() * 14)) % (w + 200)) - 100;
      ctx.fillRect(x, y, len, 1);
    }
    // l'îlot et le bois de l'autre rive se reflètent dans l'eau
    if (r.kind === 'isle') {
      const sh = r.h / 0.54; // hauteur de la scène (l'eau en occupe 54 %)
      const k = sh / 420; // le dessin est mis à l'échelle sur la hauteur (preserveAspectRatio slice)
      const ox = (w - 1600 * k) / 2;
      const top = sh * 0.46;
      ctx.save();
      ctx.fillStyle = css(state.land, 0.3);
      ctx.setTransform(dpr * k, 0, 0, -dpr * k * 0.7, dpr * ox, dpr * (200 * k - top));
      ctx.translate(0, -200);
      ctx.fill(farShape);
      ctx.restore();
      ctx.save();
      ctx.fillStyle = css(state.land, 0.38);
      ctx.setTransform(dpr * k, 0, 0, -dpr * k * 0.75, dpr * ox, dpr * (268 * k - top));
      ctx.translate(0, -268);
      ctx.fill(islandShape);
      ctx.restore();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    // la nuit : les lumières de la fête se reflètent sous l'îlot
    if (r.kind === 'isle' && state.night > 0.05) {
      for (let i = 0; i < 12; i++) {
        const x = w * (0.4 + i * 0.018);
        ctx.fillStyle = `rgba(255, 213, 154, ${0.25 * state.night})`;
        ctx.fillRect(x + Math.sin(time * 2 + i) * 3, h * 0.1 + i % 3 * 6, 10, 1.5);
      }
    }
  }

  /* ——— Une seule boucle : les rivières visibles, les étoiles, la guirlande ——— */
  const loops = new Set();
  const tick = (fn) => loops.add(fn);
  let lastStar = 0;
  const frame = (now) => {
    for (const r of rivers) if (r.on) drawRiver(r, now);
    if (!reduce && state.night > 0.02 && now - lastStar > 60) { drawStars(); lastStar = now; }
    loops.forEach((fn) => fn(now));
  };
  if (G) G.ticker.add(() => frame(performance.now()));
  else (function raf(n) { frame(n); requestAnimationFrame(raf); })(performance.now());
  rivers.forEach((r) => {
    new IntersectionObserver(([e]) => { r.on = e.isIntersecting; if (r.on) drawRiver(r, performance.now()); }, {rootMargin: '80px'}).observe(r.cv);
  });

  /* ——— L'arche de pierre : elle s'ouvre sur le ciel ——— */
  const arch = $('[data-arch]');
  let archHole = null;
  if (arch) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 400 500');
    svg.innerHTML = '<defs><mask id="archmask"><rect width="400" height="500" fill="#fff"/><path id="archhole" fill="#000"/></mask></defs><g mask="url(#archmask)" id="archstones"></g>';
    arch.appendChild(svg);
    const g = svg.querySelector('#archstones');
    const r = rng(23);
    let out = '';
    for (let y = 0, row = 0; y < 500; row++) {
      const hgt = 26 + r() * 22;
      let x = row % 2 ? -30 * r() : -60 * r();
      while (x < 400) {
        const wdt = 42 + r() * 70;
        const tone = 0.78 + r() * 0.18;
        out += `<rect x="${(x + 2).toFixed(1)}" y="${(y + 2).toFixed(1)}" width="${(wdt - 4).toFixed(1)}" height="${(hgt - 4).toFixed(1)}" rx="${(3 + r() * 6).toFixed(1)}" fill="rgb(${Math.round(214 * tone)},${Math.round(203 * tone)},${Math.round(184 * tone)})"/>`;
        x += wdt;
      }
      y += hgt;
    }
    g.innerHTML = `<rect width="400" height="500" fill="#9C9078"/>${out}`;
    archHole = svg.querySelector('#archhole');
    const setHole = (o) => {
      const w = lerp(40, 250, o), h = lerp(70, 380, o);
      const x0 = 200 - w / 2, x1 = 200 + w / 2, yb = 500, yt = 500 - h;
      archHole.setAttribute('d', `M${x0} ${yb} V${yt + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x1} ${yt + w / 2} V${yb} Z`);
    };
    setHole(reduce ? 1 : 0.25);
    if (G && ST && !reduce) {
      const o = {v: 0.25};
      G.to(o, {v: 1, ease: 'none', onUpdate: () => setHole(o.v), scrollTrigger: {trigger: arch, start: 'top 85%', end: 'center 40%', scrub: true}});
    }
  }

  /* ——— Le préau se dessine ——— */
  const draw = $('[data-draw]');
  if (draw && G && !reduce) {
    const paths = $$('.drawing__line path, .drawing__dim path', draw);
    paths.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    G.to(paths, {strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.12, scrollTrigger: {trigger: draw, start: 'top 75%'}});
    G.from('.drawing__dim text', {opacity: 0, duration: 0.8, delay: 1.4, scrollTrigger: {trigger: draw, start: 'top 75%'}});
  }

  /* ——— La carte des menus penche sous la souris ——— */
  const carte = $('.carte');
  if (carte && !reduce && matchMedia('(hover: hover)').matches) {
    carte.addEventListener('pointermove', (e) => {
      const r = carte.getBoundingClientRect();
      carte.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`);
      carte.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -8}deg`);
    });
    carte.addEventListener('pointerleave', () => { carte.style.setProperty('--rx', '0deg'); carte.style.setProperty('--ry', '0deg'); });
  }

  /* ——— La guirlande de la fête : les ampoules s'allument une à une ——— */
  const garland = $('[data-garland]');
  const bulbs = [];
  if (garland) {
    const NS = 'http://www.w3.org/2000/svg';
    const strands = [[0, 20, 1600, 34, 150], [0, 96, 1600, 78, 110]];
    let html = '';
    strands.forEach(([x0, y0, x1, y1, sag], s) => {
      const pt = (u) => [lerp(x0, x1, u), lerp(y0, y1, u) + sag * 4 * u * (1 - u)];
      let d = `M${x0} ${y0}`;
      for (let u = 0.02; u <= 1.001; u += 0.02) { const [x, y] = pt(u); d += ` L${x.toFixed(1)} ${y.toFixed(1)}`; }
      html += `<path class="wire" d="${d}"/>`;
      const n = s ? 19 : 23;
      for (let i = 1; i < n; i++) {
        const [x, y] = pt(i / n);
        html += `<g data-b="${(i / n).toFixed(3)}"><line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y + 12).toFixed(1)}" stroke="currentColor" stroke-opacity=".4"/><circle class="glow" cx="${x.toFixed(1)}" cy="${(y + 20).toFixed(1)}" r="22"/><circle class="bulb" cx="${x.toFixed(1)}" cy="${(y + 20).toFixed(1)}" r="7"/></g>`;
      }
    });
    garland.innerHTML = `<defs><radialGradient id="gl"><stop offset="0" stop-color="#FFE3B0" stop-opacity=".9"/><stop offset="1" stop-color="#FFD59A" stop-opacity="0"/></radialGradient></defs>${html}`;
    $$('g[data-b]', garland).forEach((g) => { g.querySelector('.glow').setAttribute('fill', 'url(#gl)'); bulbs.push({g, u: Number(g.dataset.b), bulb: g.querySelector('.bulb'), glow: g.querySelector('.glow'), on: false, f: Math.random() * 6}); });
    garland.style.color = 'var(--ink)';
    let lit = reduce ? 1 : 0;
    const light = (p) => {
      lit = p;
      bulbs.forEach((b) => {
        const on = b.u < p * 1.05;
        if (on !== b.on) { b.on = on; b.bulb.style.fill = on ? '#FFE7BC' : ''; b.glow.style.opacity = on ? 1 : 0; }
      });
    };
    light(lit);
    if (G && ST && !reduce) ST.create({trigger: '#fete', start: 'top 70%', end: 'center 45%', scrub: true, onUpdate: (s) => light(s.progress)});
    // un léger scintillement, et les ampoules proches de la souris brillent plus fort
    let mx = -999, my = -999;
    const fete = $('#fete');
    fete.addEventListener('pointermove', (e) => { const r = garland.getBoundingClientRect(); mx = ((e.clientX - r.left) / r.width) * 1600; my = ((e.clientY - r.top) / r.height) * 260; });
    fete.addEventListener('pointerleave', () => { mx = my = -999; });
    if (!reduce) tick((now) => {
      if (!lit) return;
      const time = now / 1000;
      for (const b of bulbs) {
        if (!b.on) continue;
        const cx = Number(b.bulb.getAttribute('cx')), cy = Number(b.bulb.getAttribute('cy'));
        const near = Math.max(0, 1 - Math.hypot(cx - mx, (cy - my) * 3) / 260);
        b.glow.style.opacity = (0.75 + 0.18 * Math.sin(time * 3 + b.f) + near * 0.5).toFixed(2);
        b.glow.setAttribute('r', (22 + near * 18).toFixed(1));
      }
    });
  }

  /* ——— Le gîte : cinq chambres qui s'allument ——— */
  const house = $('[data-house]');
  if (house) {
    const wins = $$('.house__win rect', house);
    const count = $('[data-rooms]');
    const setRooms = (p) => {
      const n = Math.min(5, Math.floor(p * 6));
      wins.forEach((w, i) => w.classList.toggle('on', i < n));
      count.textContent = n;
    };
    setRooms(reduce ? 1 : 0);
    if (G && ST && !reduce) ST.create({trigger: house, start: 'top 75%', end: 'center 40%', scrub: true, onUpdate: (s) => setRooms(s.progress)});
    else setRooms(1);
  }

  /* ——— Navigation ——— */
  const nav = $('[data-nav]');
  const burger = $('[data-burger]');
  const menu = $('[data-menu]');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open && G && !reduce) G.from($$('.menu__links a, .menu__foot'), {y: 30, opacity: 0, duration: 0.7, stagger: 0.04, ease: 'power3.out'});
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    if (!menu.hidden) setMenu(false);
    scrollToY(id === '#top' ? 0 : target.getBoundingClientRect().top + scrollY - 40);
  }));
  $$('.nav__links a').forEach((l) => {
    const sec = $(l.getAttribute('href'));
    if (sec && ST) ST.create({trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => l.classList.toggle('is-on', s.isActive)});
  });

  /* ——— Apparitions ——— */
  if (G && !reduce) {
    // le nom sort de l'horizon, comme un soleil qui se lève
    const r = {v: 0};
    G.timeline({delay: 0.2})
      .to(r, {v: 1, duration: 1.8, ease: 'expo.out', onUpdate: () => { rise = r.v; root.style.setProperty('--rise', r.v.toFixed(4)); }})
      .from('[data-in]', {y: 26, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out'}, 0.5)
      .from('.nav', {opacity: 0, duration: 0.8}, 0.6)
      .from('.clock', {opacity: 0, duration: 0.8}, 1.2);
    $$('main .h2').forEach((h) => {
      G.fromTo(h, {clipPath: 'inset(-20% 0 120% 0)', y: 40}, {clipPath: 'inset(-20% 0 -20% 0)', y: 0, duration: 1.3, ease: 'expo.out', clearProps: 'clipPath', scrollTrigger: {trigger: h, start: 'top 86%'}});
    });
    [['.moment__lede'], ['.registry li', 0.1], ['.pins li', 0.12], ['.isle__more'], ['.specs > div', 0.08], ['.carte'], ['.gite__list li', 0.06], ['.door', 0.12], ['.note, .scores, .awards', 0.1], ['.facts > div', 0.06], ['.map']].forEach(([sel, stagger]) => {
      const els = $$(sel);
      els.forEach((el, i) => G.from(el, {y: 36, opacity: 0, duration: 1.1, ease: 'power3.out', delay: stagger ? (i % 4) * stagger : 0, scrollTrigger: {trigger: el, start: 'top 90%'}}));
    });
    // les routes de la carte se tracent
    const routes = $$('.map__routes path');
    routes.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = `${L}`; p.style.strokeDashoffset = `${L}`; });
    G.to(routes, {strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.15, scrollTrigger: {trigger: '.map', start: 'top 75%'}, onComplete: () => routes.forEach((p) => { p.style.strokeDasharray = '3 6'; p.style.strokeDashoffset = '0'; })});
  }

  // la note et les barres
  const scores = $('[data-scores]');
  const count = $('[data-count]');
  if (G && ST && !reduce) {
    ST.create({trigger: scores, start: 'top 85%', once: true, onEnter: () => scores.classList.add('is-in')});
    const v = {n: 0};
    ST.create({trigger: count, start: 'top 85%', once: true, onEnter: () => G.to(v, {n: Number(count.dataset.count), duration: 1.6, ease: 'power3.out', onUpdate: () => { count.textContent = v.n.toFixed(1).replace('.', ','); }})});
    count.textContent = '0,0';
  } else scores.classList.add('is-in');

  /* ——— Mise en place ——— */
  const layout = () => {
    measure();
    sizeStars();
    rivers.forEach(sizeRiver);
    lastT = -1;
    onScroll();
  };
  window.addEventListener('scroll', onScroll, {passive: true});
  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); ST && ST.refresh(); }, 150); });
  layout();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { rivers.forEach(sizeRiver); });
  window.addEventListener('load', () => { ST && ST.refresh(); layout(); });
})();
