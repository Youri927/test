/* L'Antre 2 Jeux — interactions et animations */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  root.classList.add(reduce ? 'reduce' : 'motion');

  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  const hasGsap = Boolean(gsap && ST);
  if (hasGsap) {
    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
  }

  const escapeHTML = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const whenVisible = (el, onIn, onOut, threshold = 0.01) => {
    if (!el || !('IntersectionObserver' in window)) { onIn && onIn(); return; }
    new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? onIn && onIn() : onOut && onOut()));
    }, { threshold }).observe(el);
  };

  /* ——— Défilement fluide ——— */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.095, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ST.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ——— Toast ——— */
  const toastEl = $('[data-toast]');
  let toastTimer = 0;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
  };

  /* ——— Navigation ——— */
  const nav = $('[data-nav]');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('[data-burger]');
  const menu = $('[data-menu]');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    root.classList.toggle('menu-open', open);
    if (lenis) (open ? lenis.stop() : lenis.start());
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); }
  });

  // Ancres : on arrive sur une salle porte ouverte
  const roomTriggers = new Map();
  const navHeight = () => nav.getBoundingClientRect().height;
  const goTo = (hash) => {
    const target = document.getElementById(hash.slice(1));
    if (!target) return false;
    const st = roomTriggers.get(target.id);
    let y;
    if (st && st.pin) y = st.start + (st.end - st.start) * 0.66;
    else if (target.id === 'haut') y = 0;
    else y = target.getBoundingClientRect().top + window.scrollY - (target.matches('.room, .exit, .rooms') ? 0 : navHeight() * 0.6);
    if (lenis) lenis.scrollTo(y, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    return true;
  };
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const hash = a.getAttribute('href');
    if (hash.length < 2) return;
    if (goTo(hash)) { e.preventDefault(); setMenu(false); }
  }));

  /* ——— Boutons : la lumière suit le curseur ——— */
  $$('[data-glow]').forEach((el) => el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  /* ——— 1. Hero : la lampe torche ——— */
  const hero = $('[data-hero]');
  if (hero && !reduce) initTorch();

  function initTorch() {
    const heroInner = $('[data-hero-inner]');
    const lit = $('[data-hero-lit]');
    const hint = $('[data-hint]');
    const canvas = $('[data-dust]');
    const ctx = canvas.getContext('2d');

    // Copie exacte du contenu, éclairée, révélée par le masque de la torche
    const clone = heroInner.cloneNode(true);
    clone.removeAttribute('data-hero-inner');
    clone.classList.add('hero__inner--lit');
    clone.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    clone.querySelectorAll('a, button').forEach((n) => n.setAttribute('tabindex', '-1'));
    const h1 = clone.querySelector('h1');
    const div = document.createElement('div');
    div.className = h1.className;
    div.innerHTML = h1.innerHTML;
    h1.replaceWith(div);
    lit.insertBefore(clone, lit.querySelector('.clues'));

    const T = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 0, mode: 'intro', w: 0, h: 0, R: 220 };
    const title = heroInner.querySelector('.hero__l1');
    let box = { x: 0, y: 0, w: 1, h: 1 };
    let motes = [];
    let dpr = 1;

    const measure = () => {
      const hr = hero.getBoundingClientRect();
      const tr = title.getBoundingClientRect();
      T.w = hr.width;
      T.h = hr.height;
      box = { x: tr.left - hr.left, y: tr.top - hr.top, w: tr.width, h: tr.height };
      T.R = Math.max(130, Math.min(390, Math.min(T.w, T.h) * (T.w < 700 ? 0.44 : 0.31)));
      if (T.mode !== 'intro') T.tr = T.R;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(T.w * dpr);
      canvas.height = Math.round(T.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = T.w < 700 ? 46 : 96;
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * T.w,
        y: Math.random() * T.h,
        vx: (Math.random() - 0.5) * 0.14,
        vy: -(Math.random() * 0.18 + 0.03),
        s: Math.random() * 1.5 + 0.45,
        a: Math.random() * 0.55 + 0.3,
        p: Math.random() * Math.PI * 2,
      }));
    };
    measure();
    window.addEventListener('resize', measure);
    if (document.fonts) document.fonts.ready.then(measure);

    // Intro : la torche s'allume en grésillant puis balaie le titre
    const start = performance.now() + 500;
    const FLICKER = [[0, 0], [0.05, 0.5], [0.09, 0.04], [0.14, 0.78], [0.19, 0.26], [0.26, 1]];
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const INTRO = 2300;

    let idleTimer = 0;
    let dragging = false;
    let hintShown = false;
    const hideHint = () => hint.classList.remove('is-visible');
    const follow = (e) => {
      if (T.mode === 'intro') return;
      clearTimeout(idleTimer);
      const r = hero.getBoundingClientRect();
      T.tx = e.clientX - r.left;
      T.ty = e.clientY - r.top;
      T.mode = 'follow';
      hideHint();
    };
    hero.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch' || dragging) follow(e); });
    hero.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') { dragging = true; follow(e); } });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      idleTimer = setTimeout(() => { T.mode = 'wander'; }, 2400);
    };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    hero.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse') idleTimer = setTimeout(() => { T.mode = 'wander'; }, 1400);
    });

    let running = true;
    whenVisible(hero, () => { running = true; }, () => { running = false; });

    const drawDust = (now) => {
      ctx.clearRect(0, 0, T.w, T.h);
      if (T.r < 6) return;
      ctx.globalCompositeOperation = 'lighter';
      for (const m of motes) {
        m.x += m.vx + Math.sin(now / 1800 + m.p) * 0.07;
        m.y += m.vy;
        if (m.y < -6) { m.y = T.h + 6; m.x = Math.random() * T.w; }
        if (m.x < -6) m.x = T.w + 6; else if (m.x > T.w + 6) m.x = -6;
        const dx = m.x - T.x;
        const dy = m.y - T.y;
        const d = Math.sqrt(dx * dx + dy * dy) / T.r;
        if (d >= 1) continue;
        const fall = (1 - d) * (1 - d);
        const tw = 0.6 + 0.4 * Math.sin(now / 420 + m.p * 3);
        ctx.fillStyle = `rgba(255, 226, 178, ${(m.a * fall * tw).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.s, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = (now) => {
      requestAnimationFrame(tick);
      if (!running) return;
      if (T.mode === 'intro') {
        const k = Math.max(0, now - start) / INTRO;
        // grésillement
        let rf = 1;
        for (let i = FLICKER.length - 1; i >= 0; i--) { if (k >= FLICKER[i][0]) { rf = FLICKER[i][1]; break; } }
        T.r = T.R * rf;
        T.tr = T.R;
        // balayage
        const s = easeInOut(Math.min(1, Math.max(0, (k - 0.2) / 0.8)));
        T.x = box.x + box.w * (0.06 + 0.84 * s);
        T.y = box.y + box.h * (0.62 - 0.28 * Math.sin(s * Math.PI));
        T.tx = T.x;
        T.ty = T.y;
        if (k >= 1) {
          T.mode = finePointer ? 'rest' : 'wander';
          if (!hintShown) {
            hintShown = true;
            hint.classList.add('is-visible');
            if (!finePointer) setTimeout(hideHint, 4200);
          }
        }
      } else {
        if (T.mode === 'wander') {
          const t = now / 1000;
          T.tx = box.x + box.w * (0.5 + 0.4 * Math.sin(t * 0.38));
          T.ty = box.y + box.h * (0.5 + 0.5 * Math.sin(t * 0.76 + 1.1));
        }
        const ease = T.mode === 'follow' ? 0.14 : 0.05;
        T.x += (T.tx - T.x) * ease;
        T.y += (T.ty - T.y) * ease;
        T.r += (T.tr - T.r) * 0.12;
      }
      hero.style.setProperty('--tx', `${T.x.toFixed(1)}px`);
      hero.style.setProperty('--ty', `${T.y.toFixed(1)}px`);
      hero.style.setProperty('--tr', `${T.r.toFixed(1)}px`);
      drawDust(now);
    };
    requestAnimationFrame(tick);
  }

  /* ——— 2. Manifeste : les mots s'allument ——— */
  const words = $('[data-words]');
  if (words) {
    const parts = words.textContent.trim().split(/(\s+)/);
    words.innerHTML = parts.map((p) => (/^\s+$/.test(p) ? p : `<span class="w">${escapeHTML(p)}</span>`)).join('');
    if (hasGsap && !reduce) {
      gsap.fromTo($$('.w', words), { opacity: 0.13 }, {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: words, start: 'top 82%', end: 'bottom 46%', scrub: 0.6 },
      });
    }
  }

  /* ——— 3. Salles ——— */
  // Route 66 : les lettres du titre s'allument une à une, comme un néon
  $$('.room--r66 [data-title]').forEach((t) => {
    const txt = t.textContent.trim();
    t.innerHTML = `<span class="visually-hidden">${escapeHTML(txt)}</span>` + [...txt].map((c) => (c === ' '
      ? ' '
      : `<span class="ch" aria-hidden="true" style="--d:${(Math.random() * 0.55).toFixed(2)}s">${escapeHTML(c)}</span>`)).join('');
  });

  // Étoiles du désert
  const stars = $('[data-stars]');
  const paintStars = () => {
    if (!stars) return;
    const art = stars.parentElement;
    const w = art.clientWidth;
    const h = art.clientHeight;
    const pts = [];
    for (let i = 0; i < 170; i++) {
      const x = Math.round(Math.random() * w);
      const y = Math.round(Math.random() * h * 0.62);
      const a = (Math.random() * 0.65 + 0.15).toFixed(2);
      const s = Math.random() < 0.12 ? 1 : 0;
      pts.push(`${x}px ${y}px 0 ${s}px rgba(242, 234, 223, ${a})`);
    }
    stars.style.boxShadow = pts.join(',');
  };
  paintStars();
  let starsTimer = 0;
  window.addEventListener('resize', () => { clearTimeout(starsTimer); starsTimer = setTimeout(paintStars, 200); });

  // Portes : chaque salle s'ouvre au scroll
  const rooms = $$('[data-room]');
  const buildRoom = (room, desk) => {
    const stage = $('[data-stage]', room);
    const scene = $('[data-scene]', room);
    const art = $('[data-art]', room);
    const slit = $('.room__slit', room);
    const content = $('.room__content', room);
    const clipEl = desk ? scene : art;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: desk
        ? {
          trigger: room,
          start: 'top top',
          end: '+=130%',
          pin: stage,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (s) => room.classList.toggle('is-open', s.progress > 0.3),
        }
        : {
          trigger: art,
          start: 'top 90%',
          end: 'top 20%',
          scrub: 0.8,
          onUpdate: (s) => room.classList.toggle('is-open', s.progress > 0.55),
        },
    });
    tl.fromTo(clipEl, { clipPath: 'inset(0% 49.85% 0% 49.85%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'power3.inOut' }, 0)
      .fromTo(slit, { opacity: 1 }, { opacity: 0, duration: 0.18 }, 0.08);
    if (desk) {
      tl.fromTo(art, { scale: 1.22 }, { scale: 1, duration: 0.85, ease: 'power2.out' }, 0)
        .fromTo(content, { y: 70 }, { y: 0, duration: 0.6, ease: 'power2.out' }, 0.14)
        .to({}, { duration: 0.35 });
    }
    roomTriggers.set(room.id, tl.scrollTrigger);
    if (room === rooms[0]) roomTriggers.set('salles', tl.scrollTrigger);
    return tl;
  };

  // Sortie : la dernière porte s'ouvre sur la lumière
  const buildExit = (desk) => {
    const exit = $('[data-exit]');
    const stage = $('[data-exit-stage]');
    const light = $('[data-exit-light]');
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: desk
        ? { trigger: exit, start: 'top top', end: '+=110%', pin: stage, scrub: 0.8, anticipatePin: 1 }
        : { trigger: stage, start: 'top 85%', end: 'top 12%', scrub: 0.8 },
    });
    tl.fromTo(light, { clipPath: 'inset(0% 49.8% 0% 49.8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.inOut' }, 0)
      .fromTo($('.exit__slit', exit), { opacity: 1 }, { opacity: 0, duration: 0.2 }, 0.14)
      .fromTo($('.exit__inner', exit), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.42, ease: 'power2.out' }, 0.26);
    if (desk) tl.to({}, { duration: 0.3 });
    roomTriggers.set('reserver', tl.scrollTrigger);
    const st = tl.scrollTrigger;
    ST.create({
      trigger: exit,
      start: desk ? () => st.start + (st.end - st.start) * 0.4 : 'top top+=64',
      end: () => `bottom top+=${navHeight()}`,
      onToggle: (self) => nav.classList.toggle('on-light', self.isActive),
    });
  };

  if (hasGsap && !reduce) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      rooms.forEach((room) => buildRoom(room, true));
      buildExit(true);
      const blinds = $('[data-blinds]');
      if (blinds) gsap.fromTo(blinds, { yPercent: 4 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: blinds.closest('.room'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    mm.add('(max-width: 899px)', () => {
      rooms.forEach((room) => buildRoom(room, false));
      buildExit(false);
    });
  } else {
    rooms.forEach((r) => r.classList.add('is-open'));
    // Sans animations : la navigation passe en clair au-dessus de la section lumineuse
    const light = $('[data-exit-light]');
    const navOnLight = () => {
      const r = light.getBoundingClientRect();
      const h = navHeight();
      nav.classList.toggle('on-light', r.top <= h && r.bottom >= h);
    };
    window.addEventListener('scroll', navOnLight, { passive: true });
    navOnLight();
  }

  // Compte à rebours d'Alerte Rouge (durée réelle : 75 min)
  const clock = $('[data-countdown]');
  if (clock) {
    let secs = Number(clock.dataset.countdown);
    let timer = 0;
    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    whenVisible(clock.closest('.room'), () => {
      if (reduce || timer) return;
      timer = setInterval(() => { secs = Math.max(0, secs - 1); clock.textContent = fmt(secs); }, 1000);
    }, () => { clearInterval(timer); timer = 0; });
  }

  // Le diamant des Corleone, taillé en brillant, dessiné en 3D
  const diamondCanvas = $('[data-diamond]');
  if (diamondCanvas) {
    const d = createDiamond(diamondCanvas);
    let on = false;
    let raf = 0;
    const loop = (t) => { d.draw(t / 1000); if (on) raf = requestAnimationFrame(loop); };
    whenVisible(diamondCanvas.closest('.room'), () => {
      if (reduce) { d.draw(2.2); return; }
      if (!on) { on = true; raf = requestAnimationFrame(loop); }
    }, () => { on = false; cancelAnimationFrame(raf); });
    window.addEventListener('resize', () => { d.resize(); if (!on) d.draw(2.2); });
  }

  function createDiamond(canvas) {
    const ctx = canvas.getContext('2d');
    const verts = [];
    const add = (x, y, z) => verts.push([x, y, z]) - 1;
    const ring = (n, r, y, off = 0) => Array.from({ length: n }, (_, i) => {
      const a = ((i + off) / n) * Math.PI * 2;
      return add(Math.cos(a) * r, y, Math.sin(a) * r);
    });
    // Taille brillant simplifiée : table, couronne, rondiste, pavillon
    const T = ring(8, 0.55, 0.42);
    const G = ring(16, 1, 0);
    const B = ring(16, 1, -0.05);
    const R = ring(16, 0.52, -0.5, 0.5);
    const C = add(0, -1.05, 0);
    const faces = [T.slice()];
    for (let i = 0; i < 8; i++) {
      const t0 = T[i]; const t1 = T[(i + 1) % 8];
      const g0 = G[2 * i]; const g1 = G[2 * i + 1]; const g2 = G[(2 * i + 2) % 16];
      faces.push([t0, t1, g1], [t0, g1, g0], [t1, g2, g1]);
    }
    for (let j = 0; j < 16; j++) {
      const j1 = (j + 1) % 16;
      faces.push([G[j], G[j1], B[j1], B[j]]);
      faces.push([B[j], B[j1], R[j]], [B[j1], R[j1], R[j]]);
      faces.push([R[j], R[j1], C]);
    }

    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
    const center = [0, -0.2, 0];
    const normals = faces.map((f) => {
      const p = f.map((i) => verts[i]);
      let n = norm(cross(sub(p[1], p[0]), sub(p[2], p[0])));
      const c = p.reduce((acc, v) => [acc[0] + v[0] / p.length, acc[1] + v[1] / p.length, acc[2] + v[2] / p.length], [0, 0, 0]);
      if (dot(n, sub(c, center)) < 0) n = [-n[0], -n[1], -n[2]];
      return n;
    });
    const key = norm([-0.55, 0.65, 0.55]);
    const rim = norm([0.85, 0.05, 0.35]);
    const hKey = norm([key[0], key[1], key[2] + 1]);
    const hRim = norm([rim[0], rim[1], rim[2] + 1]);

    let size = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = r.width;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // dégradé : ombre chaude → gris perle → blanc
    const ramp = (b) => {
      const stops = [[0, [24, 20, 16]], [0.45, [128, 114, 92]], [0.75, [226, 212, 186]], [1, [255, 252, 244]]];
      for (let k = 1; k < stops.length; k++) {
        if (b <= stops[k][0]) {
          const [p0, c0] = stops[k - 1]; const [p1, c1] = stops[k];
          const t = (b - p0) / (p1 - p0);
          return c0.map((v, i) => Math.round(v + (c1[i] - v) * t));
        }
      }
      return stops[stops.length - 1][1];
    };
    const FIRE = [[255, 220, 160], [214, 238, 255], [255, 236, 200]];

    const draw = (t) => {
      if (!size) resize();
      const w = size;
      const cx0 = w / 2;
      const cy0 = w * 0.47 + Math.sin(t * 0.9) * w * 0.012;
      const scale = w * 0.33;
      ctx.clearRect(0, 0, w, w);

      const glow = ctx.createRadialGradient(cx0, cy0, 0, cx0, cy0, w * 0.5);
      glow.addColorStop(0, 'rgba(255, 214, 140, 0.26)');
      glow.addColorStop(0.5, 'rgba(226, 174, 82, 0.08)');
      glow.addColorStop(1, 'rgba(226, 174, 82, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, w);

      const ry = t * 0.42;
      const tilt = 0.3;
      const cy = Math.cos(ry); const sy = Math.sin(ry);
      const cx = Math.cos(tilt); const sx = Math.sin(tilt);
      const rot = (v) => {
        const X = v[0] * cy + v[2] * sy;
        const Z = -v[0] * sy + v[2] * cy;
        return [X, v[1] * cx - Z * sx, v[1] * sx + Z * cx];
      };
      const P = verts.map((v) => {
        const r = rot(v);
        const k = 4.5 / (4.5 - r[2]);
        return [cx0 + r[0] * scale * k, cy0 - r[1] * scale * k, r[2]];
      });
      const list = faces.map((f, i) => {
        const n = rot(normals[i]);
        const z = f.reduce((a, idx) => a + P[idx][2], 0) / f.length;
        return { f, n, z, i };
      }).sort((a, b) => a.z - b.z);

      ctx.lineJoin = 'round';
      for (const { f, n, i } of list) {
        if (n[2] <= 0.02) continue;
        const lam = Math.max(0, dot(n, key));
        const sKey = Math.pow(Math.max(0, dot(n, hKey)), 38);
        const sRim = Math.pow(Math.max(0, dot(n, hRim)), 24);
        const pattern = ((i * 37) % 7) / 6;
        const fire = Math.pow(Math.max(0, Math.sin(t * 1.5 + i * 2.17)), 18);
        let b = 0.06 + 0.42 * lam + 0.32 * pattern * (0.4 + lam) + 1.35 * sKey + 0.55 * sRim + 0.45 * fire;
        b = Math.max(0, Math.min(1, b));
        let col = ramp(b);
        if (fire > 0.2) {
          const fc = FIRE[i % 3];
          const m = Math.min(0.35, fire * 0.4);
          col = col.map((v, k) => Math.round(v + (fc[k] - v) * m));
        }
        ctx.beginPath();
        f.forEach((idx, k) => (k ? ctx.lineTo(P[idx][0], P[idx][1]) : ctx.moveTo(P[idx][0], P[idx][1])));
        ctx.closePath();
        ctx.fillStyle = `rgb(${col[0]}, ${col[1]}, ${col[2]})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 246, 225, ${0.18 + 0.4 * b})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
        const glint = sKey + 0.6 * fire;
        if (glint > 0.55) {
          const c = f.reduce((a, idx) => [a[0] + P[idx][0] / f.length, a[1] + P[idx][1] / f.length], [0, 0]);
          const s = Math.min(1.4, glint) * w * 0.05;
          ctx.fillStyle = 'rgba(255, 253, 245, 0.95)';
          ctx.beginPath();
          ctx.moveTo(c[0], c[1] - s); ctx.lineTo(c[0] + s * 0.14, c[1] - s * 0.14); ctx.lineTo(c[0] + s, c[1]);
          ctx.lineTo(c[0] + s * 0.14, c[1] + s * 0.14); ctx.lineTo(c[0], c[1] + s); ctx.lineTo(c[0] - s * 0.14, c[1] + s * 0.14);
          ctx.lineTo(c[0] - s, c[1]); ctx.lineTo(c[0] - s * 0.14, c[1] - s * 0.14);
          ctx.closePath();
          ctx.fill();
        }
      }
    };
    return { draw, resize };
  }

  /* ——— 4. Verdict ——— */
  const DIGITS = '0123456789'.split('').map((d) => `<span>${d}</span>`).join('');
  const verdict = $('.verdict');
  if (verdict) {
    const rolls = $$('[data-roll]', verdict);
    const bars = $$('.scores__bar', verdict);
    if (!reduce) {
      rolls.forEach((el) => {
        el.classList.add('roll');
        el.innerHTML = `<span class="roll__col">${DIGITS}</span>`;
      });
      bars.forEach((b) => b.style.setProperty('--fill', '0'));
      whenVisible(verdict, () => {
        rolls.forEach((el, i) => setTimeout(() => {
          el.firstElementChild.style.transform = `translateY(${-Number(el.dataset.roll)}em)`;
        }, i * 140));
        bars.forEach((b, i) => setTimeout(() => b.style.setProperty('--fill', '1'), 200 + i * 120));
      }, null, 0.35);
    }
  }

  /* ——— 5. Tarifs : le cadenas à code ——— */
  const PRICES = { 3: 29, 4: 25, 5: 23, 6: 21 };
  const pricing = $('[data-pricing]');
  if (pricing) {
    const cyl = $('[data-cyl]', pricing);
    const drum = $('[data-drum]', pricing);
    const radios = $$('input[name="team"]', pricing);
    const steps = $$('[data-step]', pricing);
    const rows = $$('[data-row]', pricing);
    const teamEl = $('[data-team]', pricing);
    drum.setAttribute('data-lenis-prevent', '');

    const odometer = (el) => {
      let current = '';
      return (value) => {
        const str = String(value);
        if (reduce) { el.textContent = str; return; }
        if (str.length !== current.length) {
          el.innerHTML = `<span class="visually-hidden" data-sr></span><span aria-hidden="true" data-vis>${str.split('').map(() => `<span class="roll"><span class="roll__col">${DIGITS}</span></span>`).join('')}</span>`;
          void el.offsetWidth;
        }
        $('[data-sr]', el).textContent = str;
        $$('.roll__col', el).forEach((col, i) => { col.style.transform = `translateY(${-Number(str[i])}em)`; });
        current = str;
      };
    };
    const setPrice = odometer($('[data-price]', pricing));
    const setTotal = odometer($('[data-total]', pricing));

    let team = 0;
    const setTeam = (n) => {
      n = Math.max(3, Math.min(6, n));
      if (n === team) return;
      team = n;
      cyl.style.setProperty('--sel', String(n - 3));
      $$('span', cyl).forEach((sp, i) => { const d = Math.abs(i - (n - 3)); sp.style.opacity = d === 0 ? '1' : d === 1 ? '.22' : '.06'; });
      radios.forEach((r) => { r.checked = Number(r.value) === n; });
      rows.forEach((r) => r.classList.toggle('is-active', Number(r.dataset.row) === n));
      steps[0].disabled = n === 3;
      steps[1].disabled = n === 6;
      setPrice(PRICES[n]);
      setTotal(PRICES[n] * n);
      teamEl.textContent = String(n);
    };
    setTeam(4);

    steps.forEach((b) => b.addEventListener('click', () => setTeam(team + Number(b.dataset.step))));
    radios.forEach((r) => r.addEventListener('change', () => setTeam(Number(r.value))));

    let lastY = null;
    let acc = 0;
    drum.addEventListener('pointerdown', (e) => { lastY = e.clientY; acc = 0; drum.setPointerCapture(e.pointerId); });
    drum.addEventListener('pointermove', (e) => {
      if (lastY === null) return;
      acc += e.clientY - lastY;
      lastY = e.clientY;
      const step = 38;
      while (acc <= -step) { acc += step; setTeam(team + 1); }
      while (acc >= step) { acc -= step; setTeam(team - 1); }
    });
    const end = () => { lastY = null; };
    drum.addEventListener('pointerup', end);
    drum.addEventListener('pointercancel', end);
    let wheelAcc = 0;
    let wheelLock = 0;
    drum.addEventListener('wheel', (e) => {
      e.preventDefault();
      const now = performance.now();
      wheelAcc += e.deltaY;
      if (Math.abs(wheelAcc) > 40 && now > wheelLock) {
        setTeam(team + Math.sign(wheelAcc));
        wheelAcc = 0;
        wheelLock = now + 180;
      }
    }, { passive: false });
  }

  /* ——— 6. Copier le numéro ——— */
  $$('[data-copy]').forEach((btn) => btn.addEventListener('click', () => {
    const text = btn.dataset.copy;
    const fallback = () => {
      const target = $('[data-phone]');
      const range = document.createRange();
      range.selectNodeContents(target);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      toast('Numéro sélectionné : copiez-le avec Ctrl+C');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast('Numéro copié'), fallback);
    } else fallback();
  }));

  /* ——— Recalcul une fois les polices chargées ——— */
  if (hasGsap) {
    if (document.fonts) document.fonts.ready.then(() => ST.refresh());
    window.addEventListener('load', () => ST.refresh());
  }
})();
