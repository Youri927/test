/* Scottsdale Pool Resurfacing : interactions de la page.
 * Défilement doux (Lenis), apparitions (GSAP + ScrollTrigger), trois scènes d'eau (water.js) :
 * l'accueil qui se remplit, le choix des finitions et le déroulé d'un chantier.
 */
(function () {
  const root = document.documentElement;
  root.classList.add('js');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  G.registerPlugin(ST);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* ——— Défilement doux ——— */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({duration: 1.1, smoothWheel: true});
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const goTo = (el) => {
    const off = el.id === 'top' ? 0 : -(parseFloat(getComputedStyle(root).getPropertyValue('--nav')) || 64) + 1;
    if (lenis) lenis.scrollTo(el, {offset: off, duration: 1.4});
    else window.scrollTo({top: el.getBoundingClientRect().top + scrollY + off, behavior: reduce ? 'auto' : 'smooth'});
  };

  /* ——— En-tête et menu ——— */
  const nav = $('[data-nav]');
  const hero = $('[data-hero]');
  const menuBtn = $('[data-menu]');
  const drawer = $('[data-drawer]');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    const past = y > hero.offsetHeight - 80;
    nav.classList.toggle('is-solid', past);
    nav.classList.toggle('is-hidden', y > lastY && y > 260 && !drawer.hasAttribute('data-open'));
    lastY = y;
  };
  addEventListener('scroll', onScroll, {passive: true});
  const setDrawer = (open) => {
    menuBtn.setAttribute('aria-expanded', open);
    if (open) {
      drawer.hidden = false;
      drawer.setAttribute('data-open', '');
      lenis && lenis.stop();
      G.fromTo(drawer.querySelectorAll('nav a, .btn'), {y: 24, opacity: 0}, {y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: 'expo.out'});
    } else {
      drawer.hidden = true;
      drawer.removeAttribute('data-open');
      lenis && lenis.start();
    }
  };
  menuBtn.addEventListener('click', () => setDrawer(menuBtn.getAttribute('aria-expanded') !== 'true'));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.hasAttribute('data-open')) setDrawer(false); });
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id.length > 1 && document.getElementById(id.slice(1));
    if (!el) return;
    e.preventDefault();
    if (drawer.hasAttribute('data-open')) setDrawer(false);
    goTo(el);
  }));

  /* ——— Lignes de titre : découpe en lignes réelles, masquées, qui montent ——— */
  function splitLines(el) {
    if (!el.dataset.src) el.dataset.src = el.innerHTML;
    el.innerHTML = el.dataset.src;
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
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
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    };
    walk(el);
    // regroupe les mots par hauteur de ligne
    const lines = [];
    let top = null;
    words.forEach((w) => {
      const t = w.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; }
      lines[lines.length - 1].push(w);
    });
    el.innerHTML = '';
    lines.forEach((ws) => {
      const line = document.createElement('span');
      line.className = 'line';
      const inner = document.createElement('span');
      ws.forEach((w, i) => { inner.appendChild(w); if (i < ws.length - 1) inner.appendChild(document.createTextNode(' ')); });
      line.appendChild(inner);
      el.appendChild(line);
    });
    el.classList.add('is-split');
    return $$('.line > span', el);
  }

  const splits = $$('[data-split-lines]');
  const showLines = (el, delay = 0) => {
    const inners = $$('.line > span', el);
    el.dataset.shown = '1';
    if (reduce) { G.set(inners, {yPercent: 0}); return; }
    G.fromTo(inners, {yPercent: 108}, {yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.085, delay});
  };
  const resplit = () => splits.forEach((el) => {
    const inners = splitLines(el);
    G.set(inners, {yPercent: el.dataset.shown ? 0 : 108});
  });

  /* ——— Apparitions ——— */
  function reveals() {
    splits.forEach((el) => {
      if (el.closest('.hero')) return;
      ST.create({trigger: el, start: 'top 88%', once: true, onEnter: () => showLines(el)});
    });
    $$('[data-reveal]').forEach((el) => {
      ST.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => G.to(el, {opacity: 1, y: 0, duration: reduce ? 0 : 1.1, ease: 'expo.out', delay: el.closest('.trust') ? 0.2 : 0}),
      });
    });
  }

  /* ——— Données des finitions (textes du site actuel) ——— */
  const FIN = {
    'plaster': {name: 'Conventional plaster',
      desc: 'Still the most commonly requested resurfacing material, and found in many older pools. Cost-effective and extremely durable.',
      rows: [['Feel', 'Smooth'], ['Lasts', 'Up to 10 years when skillfully applied'], ['Good to know', 'Sensitive to stains and discoloring']]},
    'quartz': {name: 'Quartz & plaster',
      desc: 'A plaster-based quartz finish: an improvement on traditional plaster, with calcium carbonate added for a glimmering finish.',
      rows: [['Feel', 'Smooth'], ['After install', 'Acid wash by specialized crew']]},
    'diamond-brite': {name: 'Diamond Brite',
      desc: 'A blend of aggregate and natural quartz in polymer-modified cement. Affordable, sturdy and looks great, in 17 colors. It can be drained without the worries of a plaster pool.',
      rows: [['Feel', 'Smooth, lightly textured'], ['Lasts', 'A little over a decade, with a single acid wash'], ['Good to know', 'Lighter shades make the water look aqua-blue']]},
    'pebble-fina': {name: 'Pebble Fina',
      desc: 'A blend of cement and silica stone: the midpoint between conventional plaster and branded pebble finishes. Durable and resilient, with a shimmering color.',
      rows: [['Feel', 'Fine texture'], ['After install', 'Acid wash by specialized crew']]},
    'pebble-tec': {name: 'Pebble Tec',
      desc: 'Small river pebbles mixed with Portland cement and dye, in colors from white to dark blue and even black. Natural and non-slip, because it is made of stones. No two pools look alike.',
      rows: [['Feel', 'Textured, non-slip'], ['Lasts', 'Up to 20 years if maintained properly'], ['After install', 'Acid wash by specialized crew']]},
    'pebble-sheen': {name: 'Pebble Sheen',
      desc: 'Smaller pebbles, about 1 to 2 mm across, fused in a highly polished, dense sheen.',
      rows: [['Feel', 'Polished'], ['Lasts', 'Up to 20 years if maintained properly'], ['After install', 'Acid wash by specialized crew']]},
    'hydrazzo': {name: 'Hydrazzo',
      desc: 'The pick for those who prefer a shiny, smooth surface: an exquisite, durable finish in several shades.',
      rows: [['Feel', 'Shiny and smooth'], ['After install', 'Acid wash by specialized crew']]},
    'beadcrete': {name: 'Bead Crete',
      desc: 'A pebble-aggregate finish made with glass beads instead of stone. Like quartz and pebble finishes, it gets an acid wash after it goes on.',
      rows: [['Feel', 'Lightly textured'], ['After install', 'Acid wash by specialized crew']]},
    'glass-tile': {name: 'Glass tile',
      desc: 'The most popular option for many homeowners, for its durability and exceptional beauty. Glass goes anywhere: edges, steps, the waterline, water walls, sun shelves.',
      rows: [['Feel', 'Glossy'], ['Lasts', 'The most durable of all finishes'], ['Good to know', 'The most expensive option']]},
  };
  const KEYS = Object.keys(FIN);

  const decode = (img) => (img.complete && img.naturalWidth ? Promise.resolve() : (img.decode ? img.decode() : new Promise((ok) => { img.onload = ok; }))).catch(() => {});

  /* ——— Accueil : le même bassin, avant et après ——— */
  function startHero() {
    const title = $('.hero__title');
    const ins = $$('[data-hero-in]');
    const fig = $('[data-compare]');
    const range = $('.compare__range', fig);
    const pos = {v: 50};
    const set = (v) => {
      pos.v = clamp(v, 0, 100);
      fig.style.setProperty('--pos', pos.v.toFixed(2) + '%');
      fig.style.setProperty('--pos-n', pos.v.toFixed(1));
      range.value = Math.round(pos.v);
    };
    // glisser à la souris ou au doigt ; au doigt, un geste vertical reste un défilement (touch-action: pan-y)
    let drag = false;
    const at = (e) => { const r = fig.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };
    fig.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      drag = true;
      G.killTweensOf(pos);
      fig.classList.add('is-drag');
      try { fig.setPointerCapture(e.pointerId); } catch (_) {}
      if (e.pointerType === 'mouse') set(at(e));
    });
    fig.addEventListener('pointermove', (e) => { if (drag) set(at(e)); });
    const end = () => { drag = false; fig.classList.remove('is-drag'); };
    fig.addEventListener('pointerup', end);
    fig.addEventListener('pointercancel', end);
    range.addEventListener('input', () => { G.killTweensOf(pos); set(+range.value); });
    if (reduce) { set(50); G.set(ins, {opacity: 1, y: 0}); showLines(title); return; }
    set(100);
    const tl = G.timeline({delay: 0.1});
    tl.fromTo(fig, {clipPath: 'inset(6% 6% 6% 6% round 28px)', opacity: 0}, {clipPath: 'inset(0% 0% 0% 0% round 28px)', opacity: 1, duration: 1.3, ease: 'expo.out', clearProps: 'clipPath'}, 0);
    tl.fromTo($$('img', fig), {scale: 1.1}, {scale: 1, duration: 2.2, ease: 'expo.out', clearProps: 'transform'}, 0);
    tl.call(() => showLines(title), null, 0.2);
    tl.to(ins, {opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07}, 0.6);
    // une passe de lisseuse : l'ancien fond s'efface jusqu'au milieu
    tl.to(pos, {v: 50, duration: 1.7, ease: 'power3.inOut', onUpdate: () => set(pos.v)}, 0.95);
  }

  /* ——— 02 Finitions ——— */
  let current = 'diamond-brite';
  function startFinishes() {
    const view = $('[data-fin-view]');
    const ring = $('.fv-ring', view);
    const btns = $$('[data-fin]');
    const project = $('[data-project]');
    let base = $('.fv', view);
    let anim = null;
    const srcOf = (key) => $(`img[data-fin-src="${key}"]`).src;
    // la nouvelle finition s'ouvre en cercle depuis le centre, bordée d'un reflet
    const reveal = (key) => {
      if (anim) anim.progress(1);
      const img = new Image();
      img.className = 'fv';
      img.alt = `${FIN[key].name} finish under water (illustration)`;
      img.src = srcOf(key);
      view.insertBefore(img, ring);
      const far = Math.hypot(view.clientWidth, view.clientHeight) / 2 + 30;
      const p = {r: 0};
      const draw = () => {
        img.style.clipPath = `circle(${p.r.toFixed(1)}px at 50% 50%)`;
        ring.style.width = ring.style.height = (p.r * 2).toFixed(1) + 'px';
        ring.style.opacity = p.r > 4 ? Math.min(1, (far - p.r) / 80) : 0;
      };
      draw();
      anim = G.to(p, {
        r: far, duration: reduce ? 0 : 1.1, ease: 'power2.inOut', onUpdate: draw,
        onComplete: () => { base.remove(); base = img; img.style.clipPath = ''; ring.style.opacity = 0; anim = null; },
      });
    };
    const show = (key, animate) => {
      const f = FIN[key];
      btns.forEach((b) => b.setAttribute('aria-selected', b.dataset.fin === key));
      $('[data-fin-index]').textContent = String(KEYS.indexOf(key) + 1).padStart(2, '0');
      $('[data-fin-label]').textContent = f.name;
      $('[data-spec-name]').textContent = f.name;
      $('[data-spec-desc]').textContent = f.desc;
      $('[data-spec-rows]').innerHTML = f.rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
      if (animate) {
        reveal(key);
        if (!reduce) G.fromTo('[data-spec] > *', {opacity: 0, y: 10}, {opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'expo.out'});
      }
      current = key;
    };
    btns.forEach((b) => b.addEventListener('click', () => { if (b.dataset.fin !== current) show(b.dataset.fin, true); }));
    show(current, false);
    $('[data-spec-ask]').addEventListener('click', () => {
      const line = `I’m interested in a ${FIN[current].name} finish.`;
      if (!project.value.trim() || /^I’m interested in a .* finish\.$/.test(project.value.trim())) project.value = line;
    });
  }

  /* ——— 04 Déroulé : vidange, préparation, finition, remplissage ——— */
  const STATES = ['Drained', 'Stripped and sandblasted', 'Tile and masonry', 'Plumbing sealed', 'New finish', 'Filling', 'Balanced water'];
  // demi-plan (1 - x) + y <= d dans le carré unité : l'eau arrive du coin haut droit (le grand bain)
  function water(d) {
    const sq = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const f = ([x, y]) => 1 - x + y - d;
    const out = [];
    sq.forEach((a, k) => {
      const b = sq[(k + 1) % 4];
      const fa = f(a), fb = f(b);
      if (fa <= 0) out.push(a);
      if ((fa <= 0) !== (fb <= 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    });
    if (out.length < 3) return 'polygon(0 0, 0 0, 0 0)';
    return `polygon(${out.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(', ')})`;
  }
  // passe de lisseuse : bord légèrement irrégulier, de gauche à droite
  function wipe(c) {
    const pts = [];
    for (let k = 0; k <= 24; k++) {
      const y = k / 24;
      const x = c * 1.08 - 0.04 + 0.008 * Math.sin(y * 23 + 1.7) + 0.006 * Math.sin(y * 61) + 0.003 * Math.sin(y * 140 + 2);
      pts.push(`${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`);
    }
    return `polygon(0% 0%, ${pts.join(', ')}, 0% 100%)`;
  }
  function startProcess() {
    const view = $('[data-proc]');
    const layers = Object.fromEntries($$('[data-layer]', view).map((el) => [el.dataset.layer, el]));
    const wet = $('.proc-wet', view);
    const shore = $('.proc-shore', view);
    const steps = $$('[data-step]');
    const gauge = $('.gauge');
    const label = $('[data-state]');
    let active = -1;
    const apply = (i, seg) => {
      let bottom, top = null, clip = null, op = 1, level = 0, lvl = null;
      if (i === 0) { bottom = 'drained'; top = 'old'; level = lvl = 1 - smooth(0.25, 0.85, seg); }
      else if (i === 1) { bottom = 'drained'; top = 'stripped'; clip = wipe(smooth(0.15, 0.85, seg)); }
      else if (i < 4) { bottom = 'stripped'; }
      else if (i === 4) { bottom = 'stripped'; top = 'finish'; clip = wipe(smooth(0.15, 0.85, seg)); }
      else if (i === 5) { bottom = 'finish'; top = 'cloudy'; level = lvl = smooth(0.15, 0.85, seg); }
      else { bottom = 'cloudy'; top = 'clear'; op = smooth(0.1, 0.8, seg); level = 1; }
      if (lvl !== null) clip = water(lvl * 2.02);
      for (const [name, el] of Object.entries(layers)) {
        const on = name === bottom || name === top;
        el.style.opacity = on ? (name === top ? op : 1) : 0;
        el.style.zIndex = name === top ? 4 : 1;
        el.style.clipPath = name === top && clip ? clip : '';
      }
      // la ligne d'eau : un reflet clair au bord, le fond encore mouillé juste au-delà
      const edge = lvl !== null && lvl > 0.001 && lvl < 0.999;
      wet.style.opacity = shore.style.opacity = edge ? 1 : 0;
      if (edge) { wet.style.clipPath = water(lvl * 2.02 + 0.045); shore.style.clipPath = water(lvl * 2.02 + 0.007); }
      wet.style.zIndex = 2;
      shore.style.zIndex = 3;
      gauge.style.setProperty('--level', level.toFixed(3));
      if (i !== active) {
        steps.forEach((s, j) => s.classList.toggle('is-on', j === i));
        active = i;
      }
      label.textContent = i === 0 ? (seg < 0.25 ? 'Old surface' : seg < 0.85 ? 'Draining' : 'Drained') : i === 5 && seg > 0.85 ? 'Full, still cloudy' : STATES[i];
    };
    apply(0, 0);
    // chaque étape pilote l'aperçu tant qu'elle passe sur la ligne de lecture
    // sur mobile l'aperçu occupe le haut de l'écran : la ligne de lecture est plus bas
    const line = () => (innerWidth <= 900 ? '80%' : '58%');
    steps.forEach((s, j) => ST.create({
      trigger: s, start: () => `top ${line()}`, end: () => `bottom ${line()}`,
      onUpdate: (self) => self.isActive && apply(j, self.progress),
      onToggle: (self) => self.isActive && apply(j, self.progress),
      onLeave: () => j === steps.length - 1 && apply(j, 1),
      onLeaveBack: () => j === 0 && apply(0, 0),
    }));
  }

  /* ——— 01 Signes : la liste et la coupe se répondent ——— */
  function startSigns() {
    const items = $$('[data-sign]');
    const pins = $$('[data-pin]');
    const count = $('[data-sign-count]');
    const msg = $('[data-sign-msg]');
    const drawing = $('.section');
    const MSG = ['Resurfaces usually last 10 to 20+ years.', 'Worth a free look.', 'Worth a free look.', 'Time to talk about resurfacing.'];
    const parts = (id) => [$(`[data-sign="${id}"]`), $(`[data-pin="${id}"]`), $(`[data-def="${id}"]`)].filter(Boolean);
    const update = () => {
      const n = items.filter((b) => b.getAttribute('aria-pressed') === 'true').length;
      count.textContent = n;
      msg.textContent = MSG[Math.min(3, n)];
      items.forEach((b) => {
        const on = b.getAttribute('aria-pressed') === 'true';
        parts(b.dataset.sign).slice(1).forEach((el) => el.classList.toggle('is-on', on));
      });
    };
    const toggle = (id) => { const b = $(`[data-sign="${id}"]`); b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); update(); };
    const hot = (id, on) => parts(id).forEach((el) => el.classList.toggle('is-hot', on));
    items.forEach((b) => {
      b.addEventListener('click', () => toggle(b.dataset.sign));
      b.addEventListener('pointerenter', () => hot(b.dataset.sign, true));
      b.addEventListener('pointerleave', () => hot(b.dataset.sign, false));
      b.addEventListener('focus', () => hot(b.dataset.sign, true));
      b.addEventListener('blur', () => hot(b.dataset.sign, false));
    });
    pins.forEach((p, k) => {
      p.style.setProperty('--d', (k * 0.08).toFixed(2) + 's');
      p.addEventListener('click', () => toggle(p.dataset.pin));
      p.addEventListener('pointerenter', () => hot(p.dataset.pin, true));
      p.addEventListener('pointerleave', () => hot(p.dataset.pin, false));
    });
    // le dessin se trace une fois, à l'arrivée dans l'écran
    if (reduce) drawing.classList.add('is-drawn');
    else ST.create({trigger: drawing, start: 'top 80%', once: true, onEnter: () => drawing.classList.add('is-drawn')});
  }

  /* ——— 03 Services : les cartes s'empilent ——— */
  function startCards() {
    const cards = $$('[data-card]');
    cards.forEach((c, i) => c.style.setProperty('--i', i));
    G.matchMedia().add('(min-width: 901px)', () => {
      if (reduce) return;
      cards.slice(0, -1).forEach((c, i) => {
        G.to(c, {scale: 0.94, '--dim': 0.18, ease: 'none', scrollTrigger: {trigger: cards[i + 1], start: 'top bottom', end: 'top 30%', scrub: true}});
      });
      cards.forEach((c) => {
        const img = $('img', c);
        G.fromTo(img, {scale: 1.12}, {scale: 1, ease: 'none', scrollTrigger: {trigger: c, start: 'top bottom', end: 'top 20%', scrub: true}});
      });
    });
  }

  /* ——— Réalisations : léger décalage au défilement ——— */
  function startWork() {
    if (reduce) return;
    G.matchMedia().add('(min-width: 901px)', () => {
      $$('[data-parallax]').forEach((el) => {
        const v = parseFloat(el.dataset.parallax);
        G.fromTo(el, {yPercent: v * 100}, {yPercent: -v * 100, ease: 'none', scrollTrigger: {trigger: el, start: 'top bottom', end: 'bottom top', scrub: true}});
      });
    });
  }

  /* ——— Avis : colonnes qui défilent en boucle ——— */
  function startWall() {
    $$('.wall__col').forEach((col) => {
      [...col.children].forEach((c) => { const d = c.cloneNode(true); d.classList.add('is-dup'); d.setAttribute('aria-hidden', 'true'); col.appendChild(d); });
    });
  }

  /* ——— Questions : ouverture en douceur ——— */
  function startFaq() {
    $$('[data-faq] details').forEach((d) => {
      const s = $('summary', d);
      const body = $('div', d);
      s.addEventListener('click', (e) => {
        if (reduce) return;
        e.preventDefault();
        if (d.open) {
          G.to(body, {height: 0, duration: 0.5, ease: 'expo.out', onComplete: () => { d.open = false; G.set(body, {clearProps: 'height'}); }});
        } else {
          d.open = true;
          G.fromTo(body, {height: 0}, {height: body.scrollHeight, duration: 0.7, ease: 'expo.out', onComplete: () => G.set(body, {clearProps: 'height'})});
        }
      });
    });
  }

  /* ——— Formulaire (maquette : rien n'est envoyé) ——— */
  function startForm() {
    const form = $('[data-form]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      $$('[required]', form).forEach((f) => {
        const bad = !f.value.trim();
        f.closest('.field').classList.toggle('is-bad', bad);
        if (bad && ok) { f.focus(); ok = false; }
      });
      if (!ok) return;
      const done = $('[data-done]', form);
      done.hidden = false;
      if (!reduce) G.fromTo(done.children, {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'expo.out'});
    });
    $$('[required]', form).forEach((f) => f.addEventListener('input', () => f.closest('.field').classList.remove('is-bad')));
  }

  /* ——— Démarrage ——— */
  async function start() {
    await document.fonts.ready.catch(() => {});
    splits.forEach((el) => G.set(splitLines(el), {yPercent: 108}));
    await Promise.all($$('.compare img').map(decode));
    startHero();
    startSigns();
    startFinishes();
    startCards();
    startProcess();
    startWork();
    startWall();
    startFaq();
    startForm();
    reveals();
    let w0 = innerWidth;
    let rt;
    addEventListener('resize', () => {
      if (innerWidth === w0) return;
      w0 = innerWidth;
      clearTimeout(rt);
      rt = setTimeout(() => { resplit(); ST.refresh(); }, 200);
    });
    onScroll();
    ST.refresh();
    root.classList.add('is-ready');
  }
  start();
})();
