/* Escape TV : la régie. Caméras du hero, zapping des cinq genres, caméra thermique,
   lecteurs du film souvenir, audimat et FAQ. */
(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const Lab = window.EscapeLab;
  const G = window.gsap;
  if (G && window.ScrollTrigger) G.registerPlugin(window.ScrollTrigger);
  const ST = window.ScrollTrigger;

  /* ——— Défilement doux ——— */
  let lenis = null;
  if (!reduce && window.Lenis && G) {
    lenis = new window.Lenis({lerp: 0.11, smoothWheel: true});
    lenis.on('scroll', () => ST && ST.update());
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const scrollToY = (y, opts = {}) => {
    if (lenis) lenis.scrollTo(y, {duration: opts.duration || 1.2, immediate: !!opts.immediate});
    else window.scrollTo({top: y, behavior: reduce || opts.immediate ? 'auto' : 'smooth'});
  };
  const pageY = (el) => el.getBoundingClientRect().top + window.scrollY;

  /* ——— Une seule boucle pour tout ce qui suit les personnages ——— */
  const tickers = new Set();
  const tick = (fn) => tickers.add(fn);
  const loop = () => {
    const now = performance.now();
    tickers.forEach((fn) => fn(now));
  };
  if (G) G.ticker.add(loop);
  else (function raf() { loop(); requestAnimationFrame(raf); })();

  /** Lance une fonction quand l'élément entre à l'écran, une autre quand il en sort */
  const onView = (el, enter, leave, margin = '60px') => {
    new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? enter() : leave && leave())), {rootMargin: margin}).observe(el);
  };
  /** Redimensionne un écran quand sa taille change */
  const fit = (el, ctrl) => {
    if (!window.ResizeObserver) return window.addEventListener('resize', () => ctrl.resize());
    let w = 0, h = 0;
    new ResizeObserver(([e]) => {
      const r = e.contentRect;
      if (Math.abs(r.width - w) < 1 && Math.abs(r.height - h) < 1) return;
      w = r.width; h = r.height;
      ctrl.resize();
    }).observe(el);
  };

  /* ——— Boutons : le libellé roule au survol ——— */
  $$('.btn').forEach((b) => {
    const t = document.createElement('span');
    t.className = 'btn__t';
    t.textContent = b.textContent;
    b.textContent = '';
    b.appendChild(t);
  });

  /* ——— Navigation ——— */
  const nav = $('[data-nav]');
  const burger = $('[data-burger]');
  const menu = $('[data-menu]');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, {passive: true});
  onScroll();

  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open && G && !reduce) G.from($$('.menu__links a, .menu__foot > *'), {y: 40, opacity: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out'});
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? document.body : $(id);
    if (!target) return;
    e.preventDefault();
    if (!menu.hidden) setMenu(false);
    scrollToY(id === '#top' ? 0 : pageY(target) - (id === '#concept' ? 0 : 10));
    history.replaceState(null, '', id);
  }));

  // le lien de la section visible s'allume
  const links = $$('.nav__links a');
  links.forEach((l) => {
    const sec = $(l.getAttribute('href'));
    if (!sec || !ST) return;
    ST.create({trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => l.classList.toggle('is-on', s.isActive)});
  });

  /* ——— HERO : la régie et ses caméras ——— */
  const feed = $('[data-feed]');
  const heroCanvas = $('[data-hero-canvas]');
  const flash = $('[data-flash]');
  const camEl = $('[data-cam]');
  const zoneEl = $('[data-zone]');
  const tcEl = $('[data-tc]');
  const hero = Lab.create(heroCanvas, {cols: 25, rows: 15, seed: 7, mode: 'plan', reduce});
  const center = [(hero.maze.center[0] + 0.5) / hero.maze.cols, (hero.maze.center[1] + 0.5) / hero.maze.rows];
  const CAMS = [
    {id: 'CAM 01', zone: 'Vue d’ensemble', mode: 'plan', at: [0.5, 0.5, 1]},
    {id: 'CAM 02', zone: 'L’équipe', mode: 'tv', follow: 'team', z: 2.4},
    {id: 'CAM 03', zone: 'Le Minotaure', mode: 'tv', follow: 'beast', z: 2.2},
    {id: 'CAM 04', zone: 'La salle du trésor', mode: 'tv', at: [center[0], center[1], 2.6]},
  ];

  /** Cadre une caméra sur un écran : position fixe ou personnage suivi */
  const aim = (ctrl, cam, now) => {
    if (cam.at) return ctrl.look(cam.at[0], cam.at[1], cam.at[2], now);
    const p = ctrl.where()[cam.follow];
    ctrl.look(p[0], p[1], cam.z, now);
  };

  let camIdx = 0;
  let heroOn = false;
  const cut = (i, quiet) => {
    camIdx = i;
    const cam = CAMS[i];
    hero.setMode(cam.mode);
    aim(hero, cam, true);
    camEl.textContent = cam.id;
    zoneEl.textContent = cam.zone;
    if (G && !reduce && !quiet) G.fromTo(flash, {opacity: 0.5}, {opacity: 0, duration: 0.45, ease: 'power2.out'});
  };
  cut(0, true);
  fit(heroCanvas, hero);
  tick(() => { if (heroOn && CAMS[camIdx].follow) aim(hero, CAMS[camIdx]); });
  let camTimer = 0;
  onView(feed, () => {
    heroOn = true;
    if (reduce) return hero.frame();
    hero.start();
    clearInterval(camTimer);
    camTimer = setInterval(() => cut((camIdx + 1) % CAMS.length), 4600);
  }, () => { heroOn = false; hero.stop(); clearInterval(camTimer); });

  // le temps de jeu qui décompte, comme sur les écrans de la régie
  const t0 = Date.now();
  const pad = (n) => String(n).padStart(2, '0');
  const mmss = (s) => `${pad(Math.floor(s / 60))}:${pad(Math.floor(s % 60))}`;
  setInterval(() => {
    const left = 3600 - (Math.floor((Date.now() - t0) / 1000) % 3600);
    tcEl.textContent = mmss(left);
  }, 1000);

  // le titre : chaque ligne en masque
  $$('.hero__title > span').forEach((s) => { s.innerHTML = `<span class="ln">${s.innerHTML}</span>`; });

  if (G && !reduce) {
    // l'écran s'allume : un point, une ligne, puis l'image
    const intro = G.timeline({defaults: {ease: 'power3.out'}});
    intro
      .set(flash, {opacity: 0.9})
      .fromTo(feed, {clipPath: 'inset(49.6% 50% 49.6% 50% round 6px)'}, {clipPath: 'inset(49.6% 0% 49.6% 0% round 6px)', duration: 0.42, ease: 'power2.inOut'})
      .to(feed, {clipPath: 'inset(0% 0% 0% 0% round 6px)', duration: 0.6, ease: 'expo.inOut'})
      .to(flash, {opacity: 0, duration: 0.7, ease: 'power2.out'}, '-=0.25')
      .from('.osd > *', {opacity: 0, duration: 0.4, stagger: 0.04}, '-=0.35')
      .from('.hero__where', {y: 20, opacity: 0, duration: 0.7}, '-=0.2')
      .from('.hero__title .ln', {yPercent: 108, duration: 1.1, stagger: 0.12, ease: 'expo.out'}, '-=0.55')
      .from('.hero__lede, .hero__cta', {y: 24, opacity: 0, duration: 0.8, stagger: 0.08}, '-=0.75')
      .from('.nav', {opacity: 0, duration: 0.6}, '<')
      .set(feed, {clearProps: 'clipPath'});

    // au défilement, l'écran recule dans la régie
    G.to(feed, {scale: 0.9, borderRadius: 14, ease: 'none', scrollTrigger: {trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true}});
    G.to('.hero__text', {y: -60, opacity: 0.2, ease: 'none', scrollTrigger: {trigger: '.hero', start: '20% top', end: 'bottom top', scrub: true}});
  }

  /* ——— LE JEU : les mots s'allument ——— */
  const words = $('[data-words]');
  if (words) {
    words.innerHTML = words.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    const ws = $$('.w', words);
    if (G && ST && !reduce) {
      G.to(ws, {opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: {trigger: words, start: 'top 80%', end: 'bottom 45%', scrub: true}});
    } else ws.forEach((w) => { w.style.opacity = 1; });
  }
  if (G && !reduce) {
    // la fiche défile comme un générique
    G.from('.guide__head, .guide__grid > div', {y: 50, opacity: 0, duration: 1, stagger: 0.07, ease: 'power3.out', scrollTrigger: {trigger: '.guide', start: 'top 82%'}});
  }

  /* ——— LE CONCEPT : cinq chaînes ——— */
  const zap = $('[data-zap]');
  const screen = $('[data-screen]');
  const tvCanvas = $('[data-tv-canvas]');
  const noise = $('[data-noise]');
  const chOsd = $('[data-ch-osd]');
  const chBtns = $$('[data-ch]', zap);
  const chTexts = $$('[data-text]', zap);
  const list = $('.zap__list');
  const applause = $('[data-applause]');
  const threat = $('[data-threat]');
  const skill = $('[data-skill]');
  const tv = Lab.create(tvCanvas, {cols: 21, rows: 13, seed: 11, mode: 'plan', reduce});
  const CH = [
    {mode: 'plan', at: [0.5, 0.5, 1]},
    {mode: 'cinema', follow: 'team', z: 2.3},
    {mode: 'tv', at: [0.5, 0.5, 1.15]},
    {mode: 'game', follow: 'team', z: 1.8},
    {mode: 'stage', follow: 'team', z: 1.5},
  ];
  fit(tvCanvas, tv);

  // la neige entre deux chaînes
  const nctx = noise.getContext('2d');
  noise.width = 120; noise.height = 76;
  const nimg = nctx.createImageData(120, 76);
  let noiseUntil = 0;
  const drawNoise = (now) => {
    if (now > noiseUntil) { noise.style.opacity = 0; return; }
    const d = nimg.data;
    for (let i = 0; i < d.length; i += 4) { const v = (Math.random() * 255) | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    nctx.putImageData(nimg, 0, 0);
    noise.style.opacity = String(clamp((noiseUntil - now) / 320, 0, 0.9));
  };

  let ch = -1;
  let zapOn = false;
  const setChannel = (i, quiet) => {
    if (i === ch) return;
    ch = i;
    chBtns.forEach((b, k) => { b.setAttribute('aria-pressed', String(k === i)); if (k !== i) b.style.setProperty('--p', 0); });
    chTexts.forEach((t, k) => t.classList.toggle('is-on', k === i));
    screen.dataset.ch = String(i);
    chOsd.textContent = `CH ${i + 1}`;
    tv.setMode(CH[i].mode);
    aim(tv, CH[i], true);
    if (!zapOn) tv.frame();
    if (!quiet && !reduce) {
      noiseUntil = performance.now() + 340;
      screen.classList.remove('is-zap');
      void screen.offsetWidth;
      screen.classList.add('is-zap');
    }
    // la pastille active reste visible dans la rangée (mobile)
    const b = chBtns[i];
    if (list.scrollWidth > list.clientWidth + 4) list.scrollTo({left: b.parentElement.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth'});
  };
  setChannel(0, true);

  let zapST = null;
  if (ST) {
    zapST = ST.create({
      trigger: zap,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate(s) {
        const f = s.progress * CH.length;
        const i = clamp(Math.floor(f), 0, CH.length - 1);
        setChannel(i);
        chBtns[i].style.setProperty('--p', clamp(f - i, 0, 1).toFixed(3));
      },
    });
  }
  chBtns.forEach((b, i) => b.addEventListener('click', () => {
    if (!zapST) return setChannel(i);
    const y = zapST.start + (zapST.end - zapST.start) * ((i + 0.08) / CH.length);
    scrollToY(y, {duration: 0.9 + Math.abs(i - ch) * 0.15});
  }));

  let skillAt = 0;
  tick((now) => {
    drawNoise(now);
    if (!zapOn) return;
    if (CH[ch].follow) aim(tv, CH[ch]);
    const t = now / 1000;
    if (ch === 2) applause.style.transform = `scaleX(${(0.62 + 0.22 * Math.sin(t * 2.3) + 0.12 * Math.sin(t * 7.1)).toFixed(3)})`;
    if (ch === 3) {
      const w = tv.where();
      const d = Math.hypot((w.team[0] - w.beast[0]) * 21, (w.team[1] - w.beast[1]) * 13);
      threat.style.transform = `scaleX(${clamp(1 - d / 14, 0.06, 1).toFixed(3)})`;
      if (now > skillAt) { skill.classList.toggle('is-on'); skillAt = now + (skill.classList.contains('is-on') ? 1900 : 2600); }
    }
  });
  onView(screen, () => { zapOn = true; if (reduce) tv.frame(); else tv.start(); }, () => { zapOn = false; tv.stop(); });

  /* ——— LE MINOTAURE : caméra thermique ——— */
  const beastSec = $('[data-beast]');
  const prox = $('[data-prox]');
  const youEl = $('[data-you]');
  const thermalCanvas = $('[data-thermal]');
  let bw = 1, bh = 1;
  const th = Lab.thermal(thermalCanvas, {
    reduce,
    onFrame({you, dist}) {
      const p = clamp(1 - (dist - 0.12) / 0.55, 0.04, 1);
      prox.style.transform = `scaleX(${p.toFixed(3)})`;
      beastSec.classList.toggle('is-close', p > 0.97);
      youEl.style.transform = `translate(${(you.x * bw).toFixed(1)}px, ${(you.y * bh).toFixed(1)}px)`;
    },
  });
  const measure = () => { const r = beastSec.getBoundingClientRect(); bw = r.width; bh = r.height; };
  fit(thermalCanvas, {resize() { measure(); th.resize(); }});
  measure();
  const point = (x, y) => {
    const r = beastSec.getBoundingClientRect();
    th.point(clamp((x - r.left) / r.width, 0, 1), clamp((y - r.top) / r.height, 0, 1));
  };
  beastSec.addEventListener('pointermove', (e) => point(e.clientX, e.clientY));
  beastSec.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') th.release(); });
  beastSec.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) point(t.clientX, t.clientY); }, {passive: true});
  beastSec.addEventListener('touchstart', (e) => { const t = e.touches[0]; if (t) point(t.clientX, t.clientY); }, {passive: true});
  onView(beastSec, () => { if (reduce) th.resize(); else th.start(); }, () => th.stop());

  /* ——— VOTRE FILM : deux lecteurs ——— */
  $$('.player').forEach((player, k) => {
    const cv = $('canvas', player);
    const frame = $('.player__frame', player);
    const prog = $('[data-prog]', player);
    const tcp = $('[data-ptc]', player);
    const total = Number(tcp.dataset.ptc);
    const wide = cv.dataset.film === 'cinema';
    const ctl = Lab.create(cv, {cols: 25, rows: 15, seed: wide ? 3 : 5, mode: wide ? 'cinema' : 'plan', reduce});
    const shots = wide
      ? [{at: [0.5, 0.5, 1.05]}, {follow: 'team', z: 2.4}, {follow: 'beast', z: 2.1}, {at: [center[0], center[1], 2.7]}]
      : [{follow: 'team', z: 1.25}, {follow: 'beast', z: 1.7}, {at: [center[0], center[1], 2.2]}, {follow: 'team', z: 2}];
    fit(cv, ctl);
    let shot = 0, visible = false, paused = reduce, played = 0, lastNow = 0, nextCut = 0;
    const show = (i, now) => {
      shot = i;
      aim(ctl, shots[i], true);
      if (now) { frame.classList.remove('cut'); void frame.offsetWidth; frame.classList.add('cut'); }
    };
    show(0);
    if (reduce) player.classList.add('is-paused');
    const render = () => {
      const s = played % total;
      prog.style.transform = `scaleX(${(s / total).toFixed(4)})`;
      tcp.textContent = `${mmss(s)} / ${mmss(total)}`;
    };
    render();
    tick((now) => {
      if (!visible || paused) { lastNow = now; return; }
      played += Math.min(0.1, (now - (lastNow || now)) / 1000);
      lastNow = now;
      if (now > nextCut) { if (nextCut) show((shot + 1) % shots.length, true); nextCut = now + (wide ? 3200 : 2400) + k * 300; }
      if (shots[shot].follow) aim(ctl, shots[shot]);
      render();
    });
    const play = () => { if (visible && !paused) ctl.start(); else ctl.stop(); };
    onView(frame, () => { visible = true; ctl.frame(); play(); }, () => { visible = false; play(); });
    frame.addEventListener('click', () => {
      paused = !paused;
      player.classList.toggle('is-paused', paused);
      play();
    });
    frame.setAttribute('role', 'button');
    frame.setAttribute('tabindex', '0');
    frame.setAttribute('aria-label', 'Lecture ou pause de l’aperçu');
    frame.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); frame.click(); } });
  });

  /* ——— L'AUDIENCE : l'audimat ——— */
  const bars = $('.bars');
  const count = $('[data-count]');
  if (G && !reduce) {
    onView(bars, () => bars.classList.add('is-in'), null, '-10% 0px');
    const v = {n: 0};
    ST.create({trigger: count, start: 'top 85%', once: true, onEnter: () => G.to(v, {n: Number(count.dataset.count), duration: 1.6, ease: 'power3.out', onUpdate: () => { count.textContent = v.n.toFixed(1).replace('.', ','); }})});
    count.textContent = '0,0';
  } else bars.classList.add('is-in');

  /* ——— Titres et blocs qui entrent ——— */
  if (G && !reduce) {
    $$('main .h2').forEach((h) => {
      G.fromTo(h, {clipPath: 'inset(-30% 0 130% 0)', y: 40}, {clipPath: 'inset(-30% 0 -30% 0)', y: 0, duration: 1.2, ease: 'expo.out', clearProps: 'clipPath', scrollTrigger: {trigger: h, start: 'top 86%'}});
    });
    [['.concept__lede, .film__head p'], ['.player', 0.12], ['.kit li', 0.08], ['.rating__src, .bars'], ['.stat, .audience__note', 0.1], ['.facts > div', 0.06], ['.faq details', 0.06], ['.final > *', 0.12]].forEach(([sel, stagger]) => {
      $$(sel).forEach((el) => {
        G.from(el, {y: 36, opacity: 0, duration: 1, ease: 'power3.out', delay: stagger ? $$(sel).indexOf(el) % 4 * stagger : 0, scrollTrigger: {trigger: el, start: 'top 90%'}});
      });
    });
  }

  /* ——— FAQ : ouverture en douceur ——— */
  $$('.faq details').forEach((d) => {
    const p = $('p', d);
    const body = document.createElement('div');
    body.className = 'faq__body';
    d.insertBefore(body, p);
    body.appendChild(p);
    $('summary', d).addEventListener('click', (e) => {
      if (!G || reduce) return;
      e.preventDefault();
      if (d.open) {
        G.to(body, {height: 0, opacity: 0, duration: 0.45, ease: 'power3.inOut', onComplete: () => { d.open = false; G.set(body, {clearProps: 'height,opacity'}); }});
      } else {
        d.open = true;
        G.fromTo(body, {height: 0, opacity: 0}, {height: 'auto', opacity: 1, duration: 0.55, ease: 'power3.out', onComplete: () => G.set(body, {clearProps: 'height'})});
      }
    });
  });

  window.addEventListener('load', () => ST && ST.refresh());
})();
