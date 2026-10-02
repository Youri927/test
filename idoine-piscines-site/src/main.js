/* Idoine Piscines — interactions et animations */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  const hasGsap = Boolean(gsap && ST);
  if (hasGsap) {
    gsap.registerPlugin(ST);
    ST.config({ignoreMobileResize: true});
  }
  const SVGNS = 'http://www.w3.org/2000/svg';
  const W = window.IdoineWater;

  /* ——— Défilement fluide ——— */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({lerp: 0.09, smoothWheel: true});
    if (hasGsap) {
      lenis.on('scroll', ST.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ——— Navigation ——— */
  const nav = $('[data-nav]');
  const hero = $('[data-hero]');
  const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > hero.offsetHeight - nav.offsetHeight - 10);
  window.addEventListener('scroll', onScroll, {passive: true});
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
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id.length > 1 && document.getElementById(id.slice(1));
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    const y = id === '#haut' ? 0 : target.getBoundingClientRect().top + window.scrollY - (id === '#lieux' ? 0 : nav.offsetHeight * 0.6);
    if (lenis) lenis.scrollTo(y, {duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4)});
    else window.scrollTo({top: y, behavior: reduce ? 'auto' : 'smooth'});
  }));

  /* ——— Texture de reflets, partagée par tous les dessins ——— */
  const causticURL = W ? W.causticTile(192, 4, 11) : '';
  const defs = document.createElementNS(SVGNS, 'svg');
  defs.setAttribute('width', '0');
  defs.setAttribute('height', '0');
  defs.setAttribute('aria-hidden', 'true');
  defs.style.position = 'absolute';
  defs.innerHTML = `<defs>
    <linearGradient id="eau" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4DD8D0"/><stop offset=".55" stop-color="#1A9AA2"/><stop offset="1" stop-color="#0B6B74"/></linearGradient>
    <linearGradient id="eau-nuit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2FB8B6"/><stop offset="1" stop-color="#08515A"/></linearGradient>
    <pattern id="cau1" patternUnits="userSpaceOnUse" width="200" height="200"><image href="${causticURL}" width="200" height="200"/></pattern>
    <pattern id="cau2" patternUnits="userSpaceOnUse" width="310" height="310"><image href="${causticURL}" width="310" height="310"/></pattern>
    <pattern id="hatch" patternUnits="userSpaceOnUse" width="9" height="9" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="9" stroke="#0F2229" stroke-width=".9" stroke-opacity=".32"/></pattern>
    <pattern id="hatch-light" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#0F2229" stroke-width=".7" stroke-opacity=".16"/></pattern>
  </defs>`;
  document.body.prepend(defs);
  const cau = [$('#cau1', defs), $('#cau2', defs)];
  let causticOn = 0;
  let causticLast = 0;
  const causticLoop = (t) => {
    requestAnimationFrame(causticLoop);
    if (!causticOn || reduce || t - causticLast < 80) return;
    causticLast = t;
    const s = t / 1000;
    cau[0].setAttribute('patternTransform', `translate(${(s * 9) % 200} ${(s * 5) % 200})`);
    cau[1].setAttribute('patternTransform', `translate(${310 - ((s * 6) % 310)} ${(s * 8) % 310})`);
  };
  requestAnimationFrame(causticLoop);
  // les reflets ne bougent que lorsqu'un dessin avec de l'eau est à l'écran
  const watchWater = (el) => {
    if (!('IntersectionObserver' in window)) { causticOn += 1; return; }
    let on = false;
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting !== on) { on = en.isIntersecting; causticOn += on ? 1 : -1; }
    }).observe(el);
  };

  /* ——— 1. Hero : la ligne d'eau ——— */
  const titleBox = $('[data-titlebox]');
  const title = $('[data-split]');
  const under = $('[data-under]');
  const ripples = $('[data-ripples]');
  const levelMark = $('[data-level]');
  const TITLE = title.textContent.trim();
  title.setAttribute('aria-label', TITLE);

  // la surface : une houle très douce, deux périodes de large pour boucler sans raccord
  (() => {
    const svg = $('.hero__surface', hero);
    let d = '';
    for (let x = 0; x <= 2400; x += 20) {
      const y = 8 + Math.sin((x / 300) * Math.PI * 2) * 2.6 + Math.sin((x / 150) * Math.PI * 2 + 1.3) * 0.9;
      d += `${x ? 'L' : 'M'}${x} ${y.toFixed(2)}`;
    }
    $('.hero__surface-line', svg).setAttribute('d', d);
    $('.hero__surface-fill', svg).setAttribute('d', `${d}L2400 16L0 16Z`);
  })();

  // le titre en lignes (pour la révélation), recopié à l'identique sous la surface
  const splitLines = () => {
    title.innerHTML = TITLE.split(/\s+/).map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
    const lines = [];
    let top = null;
    $$('.w', title).forEach((w) => {
      if (w.offsetTop !== top) { lines.push([]); top = w.offsetTop; }
      lines[lines.length - 1].push(w.textContent);
    });
    title.innerHTML = lines.map((l) => `<span class="line" aria-hidden="true"><span>${l.join(' ')}</span></span>`).join('');
    under.innerHTML = title.innerHTML;
  };

  // la ligne d'eau traverse la dernière ligne du titre, un peu sous sa moitié
  let wlFinal = 0;
  let wlNow = null;
  const setWL = (y) => {
    wlNow = y;
    const top = titleBox.getBoundingClientRect().top - hero.getBoundingClientRect().top;
    hero.style.setProperty('--wl', `${y.toFixed(1)}px`);
    hero.style.setProperty('--wl-t', `${(y - top).toFixed(1)}px`);
  };
  const measureWL = () => {
    const lines = $$('.line', title);
    const last = lines[lines.length - 1] || title;
    const lr = last.getBoundingClientRect();
    wlFinal = lr.top - hero.getBoundingClientRect().top + lr.height * 0.58;
  };

  // une onde à la surface, à l'abscisse donnée
  let lastRipple = 0;
  const ripple = (x, big = false) => {
    if (reduce || wlNow === null) return;
    const r = document.createElement('span');
    r.className = big ? 'ripple ripple--big' : 'ripple';
    r.style.left = `${x}px`;
    r.style.top = `${wlNow}px`;
    r.addEventListener('animationend', () => r.remove());
    ripples.appendChild(r);
    while (ripples.children.length > 10) ripples.firstChild.remove();
  };
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const r = hero.getBoundingClientRect();
    const y = e.clientY - r.top;
    const now = performance.now();
    // la souris effleure l'eau quand elle passe près de la surface
    if (Math.abs(y - wlNow) < 110 && now - lastRipple > 160) {
      lastRipple = now;
      ripple(e.clientX - r.left);
    }
  });
  hero.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    ripple(e.clientX - hero.getBoundingClientRect().left, true);
  });
  // et de temps en temps, une onde naît d'elle-même
  if (!reduce) {
    const ambient = () => {
      if (!document.hidden && hero.getBoundingClientRect().bottom > 0) ripple(hero.offsetWidth * (0.2 + Math.random() * 0.6));
      setTimeout(ambient, 3800 + Math.random() * 3000);
    };
    setTimeout(ambient, 3200);
  }

  const layoutHero = (animate) => {
    splitLines();
    measureWL();
    if (!animate) { setWL(wlFinal); return; }
    // l'ouverture : le titre se pose, puis l'eau monte jusqu'à sa ligne
    setWL(hero.offsetHeight + 20);
    const wl = {y: hero.offsetHeight + 20};
    const tl = gsap.timeline({defaults: {ease: 'expo.out'}});
    tl.from($$('.line > span', titleBox), {yPercent: 108, duration: 1.25, stagger: 0.1}, 0.15)
      .to(wl, {y: wlFinal, duration: 1.9, ease: 'power3.out', onUpdate: () => setWL(wl.y)}, 0.7)
      .from(levelMark, {opacity: 0, duration: 0.8}, 1.9)
      .from($$('.hero__lede, .hero__actions', hero), {opacity: 0, y: 16, duration: 1, stagger: 0.12}, 1.5)
      .from('.nav__bar', {opacity: 0, y: -10, duration: 0.9}, 0.4)
      .add(() => ripple(hero.offsetWidth * 0.62, true), 2.1);
  };
  const startHero = () => layoutHero(hasGsap && !reduce);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(startHero); else startHero();
  let heroTimer = 0;
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    clearTimeout(heroTimer);
    heroTimer = setTimeout(() => {
      if (window.innerWidth !== lastW) { lastW = window.innerWidth; splitLines(); }
      measureWL();
      setWL(wlFinal);
    }, 120);
  });

  /* ——— 2. Paris, en coupe : le dessin ——— */
  const R = (x, y, w, h, cls = 'poche', extra = '') => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;
  const Ln = (x1, y1, x2, y2, cls = 'trait') => `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  const Pth = (d, cls = 'trait', extra = '') => `<path class="${cls}" d="${d}" ${extra}/>`;
  const Tx = (x, y, s, anchor = 'start') => `<text class="annot" x="${x}" y="${y}" text-anchor="${anchor}">${s}</text>`;
  // légende reliée à son point : texte calé à droite s'il est à gauche du point, et inversement
  const leader = (tx, ty, x2, y2, label) => {
    const left = tx < x2;
    return `${Tx(tx, ty, label, left ? 'end' : 'start')}${Pth(`M${left ? tx + 6 : tx - 6} ${ty - 5} L${x2} ${y2}`, 'annot-line')}<circle class="annot-dot" cx="${x2}" cy="${y2}" r="2.6"/>`;
  };

  // Les bassins : rectangle d'eau, reflets, ligne de surface ; le niveau se règle de 0 à 1
  const POOLS = {
    toit: {x: 210, y: 160, w: 280, h: 50},
    verriere: {x: 604, y: 330, w: 192, h: 40},
    hotel: {x: 618, y: 872, w: 164, h: 28},
    cave: {x: 240, y: 1226, w: 520, h: 64},
  };
  const poolSVG = (id, p) => `
    <clipPath id="clip-${id}"><rect data-clip="${id}" x="${p.x}" y="${p.y + p.h}" width="${p.w}" height="0"/></clipPath>
    <g data-pool="${id}">
      <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="url(#eau)" clip-path="url(#clip-${id})"/>
      <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="url(#cau1)" opacity=".75" clip-path="url(#clip-${id})"/>
      <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="url(#cau2)" opacity=".45" clip-path="url(#clip-${id})"/>
      <line class="eau-surface" data-surface="${id}" x1="${p.x}" x2="${p.x + p.w}" y1="${p.y + p.h}" y2="${p.y + p.h}" opacity="0"/>
    </g>`;

  // fenêtres : un mur coupé, percé à chaque étage
  const wall = (x, w, from, to, openings) => {
    let out = '';
    let y = from;
    openings.forEach(([a, b]) => {
      if (a > y) out += R(x, y, w, a - y);
      out += Ln(x + 3, a, x + 3, b, 'fin') + Ln(x + w - 3, a, x + w - 3, b, 'fin');
      y = b;
    });
    if (to > y) out += R(x, y, w, to - y);
    return out;
  };

  const drawCoupe = (svg) => {
    const glass = [];
    for (let i = 1; i < 5; i++) {
      const k = i / 5;
      glass.push(Ln(560 + 136 * k, 226 - 88 * k, 560 + 136 * k + 4, 226 - 88 * k + 6, 'fin'));
      glass.push(Ln(832 - 136 * k, 226 - 88 * k, 832 - 136 * k - 4, 226 - 88 * k + 6, 'fin'));
    }
    const posts = [];
    for (let x = 176; x <= 552; x += 28) posts.push(Ln(x, 132, x, 196, 'fin'));
    const slats = [];
    for (let x = 208; x < 328; x += 10) slats.push(Ln(x, 806, x, 898, 'bois'));
    const joints = [];
    for (let i = 1; i < 14; i++) {
      const t = i / 14;
      const mx = (1 - t) * (1 - t) * 168 + 2 * (1 - t) * t * 500 + t * t * 832;
      const my = (1 - t) * (1 - t) * 1180 + 2 * (1 - t) * t * 1000 + t * t * 1180;
      const nx = (1 - t) * (1 - t) * 182 + 2 * (1 - t) * t * 500 + t * t * 818;
      const ny = (1 - t) * (1 - t) * 1186 + 2 * (1 - t) * t * 1016 + t * t * 1186;
      joints.push(Ln(mx, my, nx, ny, 'fin'));
    }
    const bubbles = [];
    for (let i = 0; i < 9; i++) bubbles.push(`<circle class="bulle" cx="${632 + i * 17}" cy="${893 - (i % 3) * 6}" r="${1.6 + (i % 2)}" fill="#E9FFFC" opacity=".8" style="--d:${(i * 0.37) % 2.2}s"/>`);

    svg.innerHTML = `
      <!-- terre, sous la rue -->
      ${R(0, 1066, 1000, 290, 'terre')}
      ${R(168, 1066, 664, 224, '', 'fill="url(#hatch-light)"')}
      ${Pth('M182 1186 Q500 1016 818 1186 L818 1290 L182 1290 Z', '', 'fill="#E7EBE8"')}
      <!-- rue et cour -->
      ${Ln(0, 1050, 150, 1050)}${Ln(850, 1050, 1000, 1050)}
      ${Ln(70, 1050, 70, 905)}${Pth('M70 912 Q70 896 88 896', 'trait')}${R(83, 896, 12, 18, 'trait')}
      ${Ln(930, 1050, 930, 962)}${Pth('M930 975 C 880 980 872 920 905 905 C 900 870 950 860 965 885 C 1000 885 1000 940 970 955 C 960 975 940 975 930 975', 'fin')}
      <!-- murs de façade, percés de fenêtres -->
      ${wall(150, 18, 196, 1306, [[262, 330], [405, 475], [535, 605], [665, 735], [790, 872], [940, 1050]])}
      ${wall(832, 18, 226, 1306, [[262, 330], [405, 475], [535, 605], [665, 735], [790, 872], [935, 1020]])}
      ${Pth('M150 1050 L150 960 Q150 932 168 932', 'fin')}
      <!-- planchers -->
      ${R(150, 210, 410, 16)}${R(190, 226, 320, 12)}
      ${R(150, 370, 700, 12)}${R(150, 500, 700, 12)}${R(150, 630, 700, 12)}${R(150, 760, 700, 12)}${R(150, 900, 700, 12)}
      ${R(150, 1050, 700, 16)}${R(150, 1290, 700, 16)}
      <!-- balcons haussmanniens -->
      ${R(118, 900, 32, 6)}${Ln(122, 900, 122, 872, 'fin')}${Ln(118, 874, 150, 874, 'fin')}
      ${R(118, 500, 32, 6)}${Ln(122, 500, 122, 472, 'fin')}${Ln(118, 474, 150, 474, 'fin')}
      <!-- toit-terrasse : garde-corps, bassin, local technique -->
      ${Ln(168, 132, 556, 132)}${posts.join('')}
      ${R(200, 150, 10, 60)}${R(490, 150, 10, 60)}
      ${R(514, 164, 40, 46, 'trait')}${Ln(520, 176, 548, 176, 'fin')}${Ln(520, 184, 548, 184, 'fin')}
      <!-- verrière et loft -->
      ${Pth('M560 226 L696 138 L832 226', 'verre')}${Pth('M566 226 L696 144 L826 226', 'fin')}${glass.join('')}
      ${R(556, 226, 10, 144)}
      ${Ln(566, 318, 596, 318)}${Ln(804, 318, 832, 318)}
      ${R(596, 318, 8, 52)}${R(796, 318, 8, 52)}
      <!-- appartements -->
      ${R(214, 412, 80, 88, 'fin')}${Ln(214, 440, 294, 440, 'fin')}${Ln(214, 470, 294, 470, 'fin')}
      ${Ln(640, 382, 640, 420, 'fin')}${Pth('M626 432 L640 418 L654 432 Z', 'fin')}
      ${Pth('M560 500 L560 474 Q560 466 570 466 L712 466 Q722 466 722 474 L722 500', 'fin')}
      ${R(300, 548, 60, 42, 'fin')}
      ${Pth('M600 630 L600 590 L612 590 L612 606 L760 606 L760 630', 'fin')}
      ${Ln(470, 642, 470, 680, 'fin')}${Pth('M440 688 Q470 676 500 688', 'fin')}
      ${Ln(380, 724, 560, 724, 'fin')}${Ln(392, 724, 392, 760, 'fin')}${Ln(548, 724, 548, 760, 'fin')}
      ${R(724, 668, 44, 92, 'fin')}
      <!-- hall de l'hôtel -->
      ${R(600, 1010, 120, 40, 'fin')}${Ln(260, 912, 260, 960, 'fin')}${Pth('M240 968 Q260 954 280 968', 'fin')}
      <!-- étage bien-être : sauna, hammam, spa -->
      ${R(200, 804, 130, 96, 'trait')}${slats.join('')}${Ln(214, 868, 316, 868, 'trait')}
      ${Pth('M380 900 L380 852 Q380 812 470 812 Q560 812 560 852 L560 900', 'trait')}
      ${Ln(394, 878, 546, 878, 'trait')}
      ${Pth('M430 868 q6 -10 0 -18 q-6 -8 0 -18', 'vapeur')}${Pth('M470 864 q6 -10 0 -18 q-6 -8 0 -18', 'vapeur')}${Pth('M510 868 q6 -10 0 -18 q-6 -8 0 -18', 'vapeur')}
      ${R(610, 864, 8, 36)}${R(782, 864, 8, 36)}
      <!-- cave voûtée -->
      ${Pth('M168 1180 Q500 1000 832 1180 L818 1186 Q500 1016 182 1186 Z', 'poche')}${joints.join('')}
      ${R(232, 1214, 8, 76)}${R(760, 1214, 8, 76)}
      ${Ln(706, 1206, 706, 1262, 'fin')}${Ln(720, 1206, 720, 1262, 'fin')}${Ln(706, 1222, 720, 1222, 'fin')}${Ln(706, 1238, 720, 1238, 'fin')}${Ln(706, 1254, 720, 1254, 'fin')}
      ${R(780, 1196, 40, 52, 'trait')}${Ln(786, 1208, 814, 1208, 'fin')}${Ln(786, 1218, 814, 1218, 'fin')}${Ln(786, 1228, 814, 1228, 'fin')}${Pth('M800 1196 L800 1176 Q800 1160 784 1150', 'fin')}
      <!-- l'eau -->
      ${Object.entries(POOLS).map(([id, p]) => poolSVG(id, p)).join('')}
      <g class="bulles" data-bubbles opacity="0">${bubbles.join('')}</g>
      <!-- annotations -->
      <g class="annotations" data-annot="toit">
        ${leader(140, 124, 176, 134, 'Garde-corps')}
        ${leader(140, 178, 205, 184, 'Étanchéité')}
        ${leader(140, 250, 300, 233, 'Dalle renforcée')}
        ${Tx(534, 108, 'Local technique', 'middle')}${Pth('M534 114 L534 160', 'annot-line')}<circle class="annot-dot" cx="534" cy="162" r="2.6"/>
      </g>
      <g class="annotations" data-annot="verriere">
        ${leader(592, 160, 640, 192, 'Verrière')}
        ${Tx(700, 308, 'Bassin sous verrière', 'middle')}
      </g>
      <g class="annotations" data-annot="hotel">
        ${Tx(265, 796, 'Sauna', 'middle')}${Tx(470, 804, 'Hammam', 'middle')}${Tx(700, 856, 'Spa', 'middle')}
      </g>
      <g class="annotations" data-annot="cave">
        ${Tx(500, 1142, 'Voûte en pierre', 'middle')}
        ${Tx(772, 1190, 'Déshumidification', 'end')}
      </g>`;
  };

  const coupe = $('[data-coupe]');
  if (coupe) { coupe.classList.add('dessin'); drawCoupe(coupe); }

  // Caméra du dessin : on anime le viewBox (le trait reste net à tous les zooms)
  const STOPS = {
    full: {cx: 500, cy: 715, w: 1000},
    toit: {cx: 338, cy: 192, w: 600},
    verriere: {cx: 700, cy: 262, w: 440},
    hotel: {cx: 488, cy: 848, w: 660},
    cave: {cx: 500, cy: 1186, w: 760},
    end: {cx: 500, cy: 715, w: 1000},
  };
  const ORDER = ['toit', 'verriere', 'hotel', 'cave'];
  const level = {};
  const setLevel = (id, k) => {
    const p = POOLS[id];
    const clip = coupe.querySelector(`[data-clip="${id}"]`);
    const surf = coupe.querySelector(`[data-surface="${id}"]`);
    const y = p.y + p.h * (1 - k);
    clip.setAttribute('y', y.toFixed(2));
    clip.setAttribute('height', (p.h * k).toFixed(2));
    surf.setAttribute('y1', y.toFixed(2));
    surf.setAttribute('y2', y.toFixed(2));
    surf.setAttribute('opacity', k > 0.02 ? '0.9' : '0');
    if (id === 'hotel') coupe.querySelector('[data-bubbles]').setAttribute('opacity', String(Math.max(0, k * 1.2 - 0.2)));
    level[id] = k;
  };
  Object.keys(POOLS).forEach((id) => setLevel(id, 0));

  const frame = $('.lieux__frame');
  const cam = {cx: STOPS.full.cx, cy: STOPS.full.cy, w: STOPS.full.w};
  const applyCam = () => {
    const r = frame.getBoundingClientRect();
    const aspect = Math.max(0.4, r.width / Math.max(1, r.height));
    let w = cam.w;
    let h = w / aspect;
    // la vue d'ensemble doit montrer tout l'immeuble
    if (cam.w >= 1000 && h < 1290) { h = 1290; w = h * aspect; }
    coupe.setAttribute('viewBox', `${(cam.cx - w / 2).toFixed(1)} ${(cam.cy - h / 2).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
  };
  applyCam();
  window.addEventListener('resize', applyCam);
  watchWater(coupe);

  const progress = $$('[data-progress] li');
  let active = 'full';
  const goStop = (name) => {
    if (name === active) return;
    active = name;
    const s = STOPS[name];
    $$('.annotations', coupe).forEach((g) => g.classList.toggle('is-on', g.dataset.annot === name));
    progress.forEach((li, i) => li.classList.toggle('is-on', ORDER.indexOf(name) >= i || name === 'end'));
    const fills = name === 'end' ? ORDER : ORDER.slice(0, ORDER.indexOf(name) + 1);
    if (!hasGsap || reduce) {
      Object.assign(cam, s);
      applyCam();
      fills.forEach((id) => setLevel(id, 1));
      return;
    }
    gsap.to(cam, {cx: s.cx, cy: s.cy, w: s.w, duration: 1.5, ease: 'power3.inOut', overwrite: true, onUpdate: applyCam});
    fills.forEach((id, i) => {
      if (level[id] >= 1) return;
      const st = {k: level[id] || 0};
      gsap.to(st, {k: 1, duration: 1.6, delay: 0.55 + i * 0.12, ease: 'power2.inOut', onUpdate: () => setLevel(id, st.k)});
    });
  };
  if (hasGsap) {
    $$('[data-stop]').forEach((el, i, all) => {
      ST.create({
        trigger: el,
        start: () => (window.innerWidth < 900 ? 'top 82%' : 'top 55%'),
        end: () => (window.innerWidth < 900 ? 'bottom 82%' : 'bottom 55%'),
        onEnter: () => goStop(el.dataset.stop),
        onEnterBack: () => goStop(el.dataset.stop),
        onLeaveBack: () => { if (i === 0) goStop('full'); else goStop(all[i - 1].dataset.stop); },
      });
    });
    // le trait se dessine quand la coupe arrive
    if (!reduce) {
      gsap.from(coupe, {opacity: 0, y: 30, duration: 1.2, ease: 'power2.out', scrollTrigger: {trigger: '[data-lieux]', start: 'top 70%'}});
    }
  } else {
    ORDER.forEach((id) => setLevel(id, 1));
  }

  /* ——— 3. Le bord de l'eau ——— */
  const edgeDraw = {
    // [ligne de surface (x0, x1, y), corps de l'eau, éléments, chemin d'écoulement, légendes]
    debordement: () => `
      ${R(0, 160, 244, 40, 'terre')}${R(244, 196, 116, 4, 'terre')}
      ${R(0, 70, 230, 80, '', 'fill="url(#eau)"')}${R(0, 70, 230, 80, '', 'fill="url(#cau1)" opacity=".7"')}
      ${R(230, 70, 12, 130)}${R(0, 150, 230, 10)}
      ${R(242, 156, 106, 30, '', 'fill="url(#eau)"')}${R(348, 132, 12, 64)}${R(242, 186, 118, 10)}
      ${Pth('M196 72 Q234 66 242 74 Q250 98 262 150', 'flow', 'data-flow')}
      ${Tx(250, 58, 'Bord de débordement')}${Tx(262, 124, 'Bac caché')}`,
    goulotte: () => `
      ${R(0, 160, 236, 40, 'terre')}${R(248, 120, 112, 80, 'terre')}${R(296, 82, 64, 38, 'terre')}
      ${R(0, 70, 236, 80, '', 'fill="url(#eau)"')}${R(0, 70, 236, 80, '', 'fill="url(#cau1)" opacity=".7"')}
      ${R(236, 70, 12, 130)}${R(0, 150, 236, 10)}
      ${R(248, 84, 40, 26, '', 'fill="url(#eau)"')}${R(248, 110, 48, 10)}${R(288, 70, 8, 50)}${R(296, 70, 64, 12)}
      ${Pth('M248 71 L288 71', 'trait', 'stroke-dasharray="3 4"')}
      ${Pth('M200 71 Q238 66 246 74 Q256 84 266 100', 'flow', 'data-flow')}
      ${Tx(250, 58, 'Grille')}${Tx(304, 104, 'Goulotte')}`,
    reprise: () => `
      ${R(0, 160, 236, 40, 'terre')}${R(248, 62, 112, 138, 'terre')}
      ${R(0, 84, 236, 66, '', 'fill="url(#eau)"')}${R(0, 84, 236, 66, '', 'fill="url(#cau1)" opacity=".7"')}
      ${R(236, 62, 12, 138)}${R(0, 150, 236, 10)}${R(222, 52, 138, 10)}
      ${R(248, 80, 46, 44, '', 'fill="#E7EBE8" stroke="#0F2229" stroke-width="1.4"')}${R(236, 86, 12, 20, '', 'fill="url(#eau)"')}${R(248, 98, 46, 26, '', 'fill="url(#eau)"')}
      ${Pth('M150 87 Q210 84 236 92 Q250 96 266 104', 'flow', 'data-flow')}
      ${Tx(250, 44, 'Margelle')}${Tx(302, 112, 'Skimmer')}`,
  };
  const edgeWave = {debordement: [0, 236, 70], goulotte: [0, 240, 70], reprise: [0, 236, 84]};
  $$('[data-edge-svg]').forEach((svg) => {
    const kind = svg.dataset.edgeSvg;
    svg.classList.add('dessin', 'edge-svg');
    svg.innerHTML = `${edgeDraw[kind]()}<path class="flow-surface" data-wave fill="none" stroke="#E9FFFC" stroke-width="1.6"/>`;
    watchWater(svg);
  });
  const waves = $$('[data-edge-svg]').map((svg) => ({svg, path: $('[data-wave]', svg), flow: $('[data-flow]', svg), k: edgeWave[svg.dataset.edgeSvg], on: false}));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((ens) => ens.forEach((en) => {
      const w = waves.find((x) => x.svg === en.target);
      if (w) w.on = en.isIntersecting;
    }));
    waves.forEach((w) => io.observe(w.svg));
  } else waves.forEach((w) => { w.on = true; });
  const waveLoop = (t) => {
    requestAnimationFrame(waveLoop);
    const s = t / 1000;
    waves.forEach((w) => {
      if (!w.on && !reduce) return;
      const [x0, x1, y] = w.k;
      let d = '';
      for (let x = x0; x <= x1; x += 6) {
        const yy = y + Math.sin(x * 0.07 - s * 2.2) * 1.4 + Math.sin(x * 0.13 + s * 1.3) * 0.6;
        d += `${x === x0 ? 'M' : 'L'}${x} ${yy.toFixed(2)}`;
      }
      w.path.setAttribute('d', d);
      if (w.flow) w.flow.setAttribute('stroke-dashoffset', String(-((s * 26) % 40)));
    });
  };
  requestAnimationFrame(waveLoop);

  /* Le fond mobile */
  const floorSvg = $('[data-floor-svg]');
  const range = $('[data-floor-range]');
  const stateEl = $('[data-floor-state]');
  if (floorSvg && range) {
    floorSvg.classList.add('dessin');
    floorSvg.innerHTML = `
      ${R(0, 240, 720, 20, 'terre')}
      ${R(0, 50, 40, 14)}${R(680, 50, 40, 14)}
      ${R(40, 50, 12, 200)}${R(668, 50, 12, 200)}${R(40, 240, 640, 12)}
      <rect data-f-below x="52" y="62" width="616" height="178" fill="url(#eau-nuit)"/>
      <rect data-f-above x="52" y="62" width="616" height="178" fill="url(#eau)"/>
      <rect data-f-glints x="52" y="62" width="616" height="178" fill="url(#cau1)" opacity=".55"/>
      <g data-f-jacks>${[120, 250, 380, 510, 610].map((x) => `<rect class="jack" x="${x}" y="0" width="6" height="10" fill="#0F2229" opacity=".5"/>`).join('')}</g>
      <g data-f-plate>
        <rect x="52" y="0" width="616" height="14" fill="#0F2229"/>
        <rect x="52" y="-3" width="616" height="3" fill="#E7EBE8" opacity="0" data-f-deck/>
      </g>
      <line data-f-surface x1="52" x2="668" y1="62" y2="62" stroke="#E9FFFC" stroke-width="1.6"/>`;
    watchWater(floorSvg);
    const plate = $('[data-f-plate]', floorSvg);
    const jacks = $$('.jack', floorSvg);
    const deck = $('[data-f-deck]', floorSvg);
    const surface = $('[data-f-surface]', floorSvg);
    const above = $('[data-f-above]', floorSvg);
    const glints = $('[data-f-glints]', floorSvg);
    const STATES = [[0, 'Bassin de nage'], [30, 'Aquagym'], [60, 'Pataugeoire'], [90, 'Terrasse']];
    const setFloor = (v) => {
      const k = v / 100;
      const top = 226 - (226 - 50) * k; // haut du fond : de 226 (profond) à 50 (au niveau de la plage)
      plate.setAttribute('transform', `translate(0 ${top.toFixed(1)})`);
      jacks.forEach((j) => { j.setAttribute('y', (top + 14).toFixed(1)); j.setAttribute('height', Math.max(0, 240 - top - 14).toFixed(1)); });
      const hAbove = Math.max(0, top - 62);
      above.setAttribute('height', hAbove.toFixed(1));
      glints.setAttribute('height', hAbove.toFixed(1));
      deck.setAttribute('opacity', k > 0.97 ? '1' : '0');
      surface.setAttribute('opacity', k > 0.97 ? '0' : '1');
      let label = STATES[0][1];
      STATES.forEach(([at, l]) => { if (v >= at) label = l; });
      stateEl.textContent = label;
      range.style.setProperty('--p', `${v}%`);
    };
    let anim = null;
    range.addEventListener('input', () => { if (anim) anim.kill(); setFloor(Number(range.value)); });
    setFloor(Number(range.value));
    // une démonstration douce quand la section arrive, tant qu'on n'y a pas touché
    if (hasGsap && !reduce) {
      const demo = {v: Number(range.value)};
      ST.create({
        trigger: '[data-floor]',
        start: 'top 70%',
        once: true,
        onEnter: () => {
          anim = gsap.timeline()
            .to(demo, {v: 100, duration: 2.4, ease: 'power2.inOut', onUpdate: () => { range.value = demo.v; setFloor(demo.v); }})
            .to(demo, {v: 18, duration: 2, ease: 'power2.inOut', delay: 0.6, onUpdate: () => { range.value = demo.v; setFloor(demo.v); }});
        },
      });
    }
  }

  /* ——— 5. Références : la barre oblique ne termine jamais une ligne ——— */
  const refs = $$('[data-refs] li');
  const markEnds = () => {
    refs.forEach((li) => li.classList.remove('is-eol'));
    const tops = refs.map((li) => li.getBoundingClientRect().top);
    refs.forEach((li, i) => li.classList.toggle('is-eol', i === refs.length - 1 || Math.abs(tops[i + 1] - tops[i]) > 4));
  };
  markEnds();
  window.addEventListener('load', markEnds);
  let refsTimer = 0;
  window.addEventListener('resize', () => { clearTimeout(refsTimer); refsTimer = setTimeout(markEnds, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(markEnds);

  /* ——— 6. Le bureau d'étude : l'eau parcourt le tuyau ——— */
  const flow = $('[data-flow]', $('[data-etude]') || document);
  if (hasGsap && flow && !reduce) {
    gsap.to(flow, {scaleX: 1, ease: 'none', scrollTrigger: {trigger: '[data-etude]', start: 'top 70%', end: 'bottom 75%', scrub: 0.6}});
  } else if (flow) flow.style.transform = 'scaleX(1)';

  /* ——— 8. Le projet : un e-mail prêt à envoyer ——— */
  const brief = $('[data-brief]');
  if (brief) {
    const summary = $('[data-brief-summary]', brief);
    const read = () => {
      const lieu = (brief.querySelector('input[name="lieu"]:checked') || {}).value;
      const region = (brief.querySelector('input[name="region"]:checked') || {}).value;
      const quoi = $$('input[name="quoi"]:checked', brief).map((i) => i.value);
      return {lieu, region, quoi, nom: brief.nom.value.trim(), tel: brief.tel.value.trim(), message: brief.message.value.trim()};
    };
    const join = (list) => (list.length < 2 ? list.join('') : `${list.slice(0, -1).join(', ')} et ${list[list.length - 1]}`);
    const phrase = (d) => {
      const what = d.quoi.length ? join(d.quoi) : 'un projet';
      const where = d.lieu ? ` ${d.lieu}` : '';
      const region = d.region ? (d.region === 'ailleurs' ? ', hors de votre zone habituelle' : `, ${d.region === 'Paris' ? 'à Paris' : `en ${d.region}`}`) : '';
      return `${what.charAt(0).toUpperCase()}${what.slice(1)}${where}${region}.`;
    };
    const update = () => {
      const d = read();
      summary.textContent = d.lieu || d.quoi.length || d.region ? `Votre demande : ${phrase(d)}` : 'Répondez aux questions qui vous concernent, toutes sont facultatives.';
    };
    brief.addEventListener('change', update);
    update();
    brief.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = read();
      const subject = `Projet : ${phrase(d).replace(/\.$/, '')}`;
      const lines = [
        'Bonjour,',
        '',
        `Je souhaite vous parler de mon projet : ${phrase(d).charAt(0).toLowerCase()}${phrase(d).slice(1)}`,
        d.message ? `\n${d.message}` : '',
        '',
        d.nom ? d.nom : '',
        d.tel ? `Téléphone : ${d.tel}` : '',
      ].filter((l, i, a) => !(l === '' && a[i - 1] === ''));
      window.location.href = `mailto:info@idoine-piscines.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      summary.textContent = 'Votre messagerie s’ouvre avec le message prêt. Rien ne s’est ouvert ? Écrivez à info@idoine-piscines.com.';
    });
  }

  /* ——— Recalcul une fois les polices chargées ——— */
  if (hasGsap) {
    if (document.fonts) document.fonts.ready.then(() => ST.refresh());
    window.addEventListener('load', () => ST.refresh());
  }
})();
