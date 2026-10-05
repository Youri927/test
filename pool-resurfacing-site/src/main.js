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
  const now = () => performance.now() / 1000;
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
    'plaster': {name: 'Conventional plaster', look: {deep: '#0b5566', trans: [0.27, 0.79, 0.89]},
      desc: 'Still the most commonly requested resurfacing material, and found in many older pools. Cost-effective and extremely durable.',
      rows: [['Feel', 'Smooth'], ['Lasts', 'Up to 10 years when skillfully applied'], ['Good to know', 'Sensitive to stains and discoloring']]},
    'quartz': {name: 'Quartz & plaster', look: {deep: '#0a4f60', trans: [0.26, 0.77, 0.88]},
      desc: 'A plaster-based quartz finish: an improvement on traditional plaster, with calcium carbonate added for a glimmering finish.',
      rows: [['Feel', 'Smooth'], ['After install', 'Acid wash by specialized crew']]},
    'diamond-brite': {name: 'Diamond Brite', look: {deep: '#0a4a62', trans: [0.24, 0.71, 0.87]},
      desc: 'A blend of aggregate and natural quartz in polymer-modified cement. Affordable, sturdy and looks great, in 17 colors. It can be drained without the worries of a plaster pool.',
      rows: [['Feel', 'Smooth, lightly textured'], ['Lasts', 'A little over a decade, with a single acid wash'], ['Good to know', 'Lighter shades make the water look aqua-blue']]},
    'pebble-fina': {name: 'Pebble Fina', look: {deep: '#0b4652', trans: [0.3, 0.72, 0.8]},
      desc: 'A blend of cement and silica stone: the midpoint between conventional plaster and branded pebble finishes. Durable and resilient, with a shimmering color.',
      rows: [['Feel', 'Fine texture'], ['After install', 'Acid wash by specialized crew']]},
    'pebble-tec': {name: 'Pebble Tec', look: {deep: '#073a4c', trans: [0.22, 0.62, 0.78]},
      desc: 'Small river pebbles mixed with Portland cement and dye, in colors from white to dark blue and even black. Natural and non-slip, because it is made of stones. No two pools look alike.',
      rows: [['Feel', 'Textured, non-slip'], ['Lasts', 'Up to 20 years if maintained properly'], ['After install', 'Acid wash by specialized crew']]},
    'pebble-sheen': {name: 'Pebble Sheen', look: {deep: '#083e50', trans: [0.24, 0.66, 0.8]},
      desc: 'Smaller pebbles, about 1 to 2 mm across, fused in a highly polished, dense sheen.',
      rows: [['Feel', 'Polished'], ['Lasts', 'Up to 20 years if maintained properly'], ['After install', 'Acid wash by specialized crew']]},
    'hydrazzo': {name: 'Hydrazzo', look: {deep: '#0a4a64', trans: [0.24, 0.72, 0.9]},
      desc: 'The pick for those who prefer a shiny, smooth surface: an exquisite, durable finish in several shades.',
      rows: [['Feel', 'Shiny and smooth'], ['After install', 'Acid wash by specialized crew']]},
    'beadcrete': {name: 'Bead Crete', look: {deep: '#08465e', trans: [0.24, 0.72, 0.9]},
      desc: 'A pebble-aggregate finish made with glass beads instead of stone. Like quartz and pebble finishes, it gets an acid wash after it goes on.',
      rows: [['Feel', 'Lightly textured'], ['After install', 'Acid wash by specialized crew']]},
    'glass-tile': {name: 'Glass tile', look: {deep: '#0a4a60', trans: [0.22, 0.7, 0.86], size: 1.5},
      desc: 'The most popular option for many homeowners, for its durability and exceptional beauty. Glass goes anywhere: edges, steps, the waterline, water walls, sun shelves.',
      rows: [['Feel', 'Glossy'], ['Lasts', 'The most durable of all finishes'], ['Good to know', 'The most expensive option']]},
  };
  const KEYS = Object.keys(FIN);
  const EXTRA = {worn: {deep: '#2c5047', trans: [0.46, 0.66, 0.55], size: 3.4}, stripped: {size: 1.4}};

  /* ——— Les scènes d'eau ——— */
  const scenes = [];
  let webgl = !!window.WebGL2RenderingContext && !!window.Water;
  const texImg = (name) => $(`img[data-tex="${name}"]`);
  const decode = (img) => (img.complete && img.naturalWidth ? Promise.resolve() : (img.decode ? img.decode() : new Promise((ok) => { img.onload = ok; }))).catch(() => {});
  function makeScene(canvas, opts, names) {
    if (!webgl) return null;
    let w;
    try { w = new Water(canvas, opts); } catch (e) { webgl = false; root.classList.add('no-webgl'); return null; }
    names.forEach((n) => w.texture(n, texImg(n), FIN[n] ? FIN[n].look : EXTRA[n]));
    const sc = {w, canvas, visible: false, dirty: true, tick: null};
    new IntersectionObserver(([e]) => { sc.visible = e.isIntersecting; sc.dirty = true; }, {rootMargin: '80px'}).observe(canvas);
    new ResizeObserver(() => { w.resize(); sc.dirty = true; }).observe(canvas);
    scenes.push(sc);
    return sc;
  }
  function loop() {
    const t = now();
    for (const sc of scenes) {
      if (!sc.visible) continue;
      if (sc.tick) sc.tick(t);
      // mouvement réduit : une image fixe, redessinée seulement quand l'état change
      if (reduce && !sc.dirty) continue;
      sc.w.render(reduce ? 2.4 : t);
      sc.dirty = false;
    }
  }

  /** Ronds dans l'eau sous le doigt ou la souris */
  function ripples(sc, el = sc.canvas) {
    let last = null;
    const pos = (e) => { const r = sc.canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const [x, y] = pos(e);
      const t = now();
      if (!last) { last = {x, y, t}; return; }
      const d = Math.hypot(x - last.x, y - last.y);
      if (d > 26) {
        const v = d / Math.max(0.016, t - last.t);
        sc.w.drop(x, y, clamp(0.16 + v * 0.00022, 0.16, 0.5));
        last = {x, y, t};
      }
    });
    el.addEventListener('pointerleave', () => { last = null; });
    el.addEventListener('pointerdown', (e) => { const [x, y] = pos(e); sc.w.drop(x, y, e.pointerType === 'mouse' ? 0.9 : 0.75); });
  }

  /* ——— Accueil : le bassin se remplit ——— */
  let heroSc = null;
  function startHero() {
    heroSc = makeScene($('[data-water="hero"]'), {tile: 330, depth: 1500, focus: 4}, ['quartz']);
    const title = $('.hero__title');
    const ins = $$('[data-hero-in]');
    const tl = G.timeline({delay: 0.1});
    if (heroSc) {
      const w = heroSc.w;
      w.set({a: 'quartz', level: reduce ? 1 : 0, fillDir: [-0.74, 0.67]});
      ripples(heroSc, hero);
      if (!reduce) {
        const st = {level: 0};
        tl.to(st, {level: 1, duration: 2.4, ease: 'power1.inOut', onUpdate: () => w.set({level: st.level})}, 0.05);
        tl.call(() => { const r = title.getBoundingClientRect(); w.drop(r.left + r.width * 0.62, r.top + r.height * 0.3, 1.1); }, null, 2.1);
        // de temps en temps, une goutte : la surface reste vivante quand personne n'y touche
        let seed = 11, next = 6;
        const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
        heroSc.tick = (t) => {
          if (t > next) { w.drop(w.w * (0.15 + rnd() * 0.7), w.h * (0.2 + rnd() * 0.6), 0.45 + rnd() * 0.3); next = t + 4 + rnd() * 3; }
        };
      }
    }
    if (reduce) {
      G.set(ins, {opacity: 1, y: 0});
      showLines(title);
    } else {
      tl.call(() => showLines(title), null, 0.75);
      tl.to(ins, {opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07}, 1.25);
    }
    // légère sortie au défilement
    if (!reduce) {
      G.to('.hero__inner', {yPercent: -10, opacity: 0.2, ease: 'none', scrollTrigger: {trigger: hero, start: 'top top', end: 'bottom top', scrub: true}});
    }
  }

  /* ——— 02 Finitions ——— */
  let current = 'diamond-brite';
  function startFinishes() {
    const view = $('.finishes__view');
    const sc = makeScene($('[data-water="finish"]'), {tile: 520, depth: 1100, focus: 3, seed: 3, wind: 0.9, spread: 4.2, blur: 0.5, tint: 0.62, view: 0.25}, KEYS);
    const btns = $$('[data-fin]');
    const still = $('.finishes__still');
    const project = $('[data-project]');
    if (sc) { sc.w.set({a: current}); ripples(sc, view); }
    const show = (key, from) => {
      const f = FIN[key];
      const i = KEYS.indexOf(key);
      btns.forEach((b) => b.setAttribute('aria-selected', b.dataset.fin === key));
      $('[data-fin-index]').textContent = String(i + 1).padStart(2, '0');
      $('[data-fin-label]').textContent = f.name;
      $('[data-spec-name]').textContent = f.name;
      $('[data-spec-desc]').textContent = f.desc;
      $('[data-spec-rows]').innerHTML = f.rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
      still.src = texImg(key).src;
      if (sc && from) {
        const r = sc.canvas.getBoundingClientRect();
        sc.w.swap(key, from[0] - r.left, from[1] - r.top, now());
        sc.dirty = true;
      }
      if (!reduce && from) G.fromTo('[data-spec] > *', {opacity: 0, y: 10}, {opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'expo.out'});
      current = key;
    };
    btns.forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.fin === current) return;
      // l'onde part du centre du bassin, ou de là où on a cliqué dans l'eau
      const r = view.getBoundingClientRect();
      show(b.dataset.fin, [r.left + r.width * 0.5, r.top + r.height * 0.5]);
    }));
    show(current);
    $('[data-spec-ask]').addEventListener('click', () => {
      const line = `I’m interested in a ${FIN[current].name} finish.`;
      if (!project.value.trim() || /^I’m interested in a .* finish\.$/.test(project.value.trim())) project.value = line;
    });
  }

  /* ——— 04 Déroulé : vidange, préparation, finition, remplissage ——— */
  const STATES = ['Drained', 'Stripped and sandblasted', 'Tile and masonry', 'Plumbing sealed', 'New finish', 'Filling', 'Balanced water'];
  function startProcess() {
    const sc = makeScene($('[data-water="process"]'), {tile: 300, depth: 1300, focus: 3.4, seed: 5, wind: 2.2}, ['worn', 'stripped', ...KEYS]);
    const steps = $$('[data-step]');
    const gauge = $('.gauge');
    const label = $('[data-state]');
    let active = -1;
    const apply = (i, seg) => {
      const fin = current;
      let st;
      if (i === 0) st = {a: 'worn', b: null, wipe: -1, level: 1 - smooth(0.25, 0.85, seg), clear: 1};
      else if (i === 1) st = {a: 'worn', b: 'stripped', wipe: smooth(0.15, 0.85, seg), level: 0, clear: 1};
      else if (i < 4) st = {a: 'stripped', b: null, wipe: -1, level: 0, clear: 1};
      else if (i === 4) st = {a: 'stripped', b: fin, wipe: smooth(0.15, 0.85, seg), level: 0, clear: 1};
      else if (i === 5) st = {a: fin, b: null, wipe: -1, level: smooth(0.15, 0.85, seg), clear: 0.3};
      else st = {a: fin, b: null, wipe: -1, level: 1, clear: 0.3 + 0.7 * smooth(0.1, 0.8, seg)};
      if (sc) { sc.w.set(st); sc.dirty = true; }
      gauge.style.setProperty('--level', st.level.toFixed(3));
      if (i !== active) {
        steps.forEach((s, j) => s.classList.toggle('is-on', j === i));
        if (sc && i === 6 && active === 5) { sc.w.drop(sc.w.w * 0.4, sc.w.h * 0.45, 1); sc.w.drop(sc.w.w * 0.66, sc.w.h * 0.62, 0.7, now() + 0.4); }
        active = i;
      }
      label.textContent = i === 0 ? (seg < 0.25 ? 'Old surface' : seg < 0.85 ? 'Draining' : 'Drained') : STATES[i];
    };
    if (sc) sc.w.set({fillDir: [-0.7, -0.71], wipeDir: [1, 0]});
    apply(0, 0);
    // chaque étape pilote l'aperçu tant qu'elle passe au milieu de l'écran
    // sur mobile l'aperçu occupe le haut de l'écran : la ligne de lecture est plus bas
    const line = () => (innerWidth <= 900 ? '80%' : '58%');
    steps.forEach((s, j) => ST.create({
      trigger: s, start: () => `top ${line()}`, end: () => `bottom ${line()}`,
      onUpdate: (self) => self.isActive && apply(j, self.progress),
      onToggle: (self) => self.isActive && apply(j, self.progress),
      onLeave: () => j === steps.length - 1 && apply(j, 1),
      onLeaveBack: () => j === 0 && apply(0, 0),
    }));
    // le panneau d'aperçu dit l'état seulement ; les étapes s'allument une à une
  }

  /* ——— 01 Signes ——— */
  function startSigns() {
    const items = $$('[data-sign]');
    const pins = $$('[data-pin]');
    const count = $('[data-sign-count]');
    const msg = $('[data-sign-msg]');
    const MSG = ['Resurfaces usually last 10 to 20+ years.', 'Worth a free look.', 'Worth a free look.', 'Time to talk about resurfacing.'];
    const update = () => {
      const n = items.filter((b) => b.getAttribute('aria-pressed') === 'true').length;
      count.textContent = n;
      msg.textContent = MSG[Math.min(3, n)];
      pins.forEach((p) => p.classList.toggle('is-on', $(`[data-sign="${p.dataset.pin}"]`).getAttribute('aria-pressed') === 'true'));
    };
    const toggle = (id) => { const b = $(`[data-sign="${id}"]`); b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); update(); };
    const hot = (id, on) => { $(`[data-pin="${id}"]`).classList.toggle('is-hot', on); $(`[data-sign="${id}"]`).classList.toggle('is-hot', on); };
    items.forEach((b) => {
      b.addEventListener('click', () => toggle(b.dataset.sign));
      b.addEventListener('pointerenter', () => hot(b.dataset.sign, true));
      b.addEventListener('pointerleave', () => hot(b.dataset.sign, false));
    });
    pins.forEach((p) => {
      p.addEventListener('click', () => toggle(p.dataset.pin));
      p.addEventListener('pointerenter', () => hot(p.dataset.pin, true));
      p.addEventListener('pointerleave', () => hot(p.dataset.pin, false));
    });
    if (!reduce) {
      ST.create({trigger: '.signs__img', start: 'top 75%', once: true, onEnter: () => G.fromTo(pins, {scale: 0, opacity: 0}, {scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(2)', stagger: 0.08, delay: 0.3, clearProps: 'transform'})});
    }
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
    if (!webgl) root.classList.add('no-webgl');
    await document.fonts.ready.catch(() => {});
    splits.forEach((el) => G.set(splitLines(el), {yPercent: 108}));
    await Promise.all($$('img[data-tex]').map(decode));
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
    G.ticker.add(loop);
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
