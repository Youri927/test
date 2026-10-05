/* WAVE Pool Remodeling Scottsdale AZ : interactions de la page.
 * Défilement doux (Lenis) et animations au défilement (GSAP + ScrollTrigger).
 * Rien n'est calculé en continu : des découpes CSS (arches), des transformations et une couleur de fond.
 */
(function () {
  const root = document.documentElement;
  root.classList.add('js');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desk = matchMedia('(min-width: 961px)');
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  G.registerPlugin(ST);
  ST.config({ignoreMobileResize: true});
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ——— Défilement doux ——— */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({duration: 1.15, smoothWheel: true});
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const goTo = (el) => {
    const off = el.id === 'top' ? 0 : -(parseFloat(getComputedStyle(root).getPropertyValue('--hd')) || 64) + 1;
    if (lenis) lenis.scrollTo(el, {offset: el.id === 'top' ? 0 : off, duration: 1.5});
    else window.scrollTo({top: el.getBoundingClientRect().top + scrollY + off, behavior: reduce ? 'auto' : 'smooth'});
  };

  /* ——— Le ciel : la couleur du fond suit la journée (mélange OKLab) ——— */
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
  const toLab = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  };
  const toHex = ([L, A, B]) => {
    const l = Math.pow(L + 0.3963377774 * A + 0.2158037573 * B, 3);
    const m = Math.pow(L - 0.1055613458 * A - 0.0638541728 * B, 3);
    const s = Math.pow(L - 0.0894841775 * A - 1.291485548 * B, 3);
    return '#' + [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
      .map((v) => Math.round(clamp(gam(clamp(v, 0, 1)), 0, 1) * 255).toString(16).padStart(2, '0')).join('');
  };
  const skyCss = getComputedStyle(root);
  const SKY = {};
  ['noon', 'afternoon', 'golden', 'sunset', 'dusk', 'night'].forEach((k) => { SKY[k] = toLab(skyCss.getPropertyValue('--' + k).trim()); });
  const INK = toLab(skyCss.getPropertyValue('--ink').trim());
  const SAND = toLab(skyCss.getPropertyValue('--sand').trim());
  const metaTheme = $('meta[name="theme-color"]');
  let anchors = [];
  let lastSky = '';
  const measureSky = () => {
    anchors = $$('[data-sky]').map((el) => ({top: el.getBoundingClientRect().top + scrollY, lab: SKY[el.dataset.sky]}))
      .sort((a, b) => a.top - b.top);
  };
  const paintSky = () => {
    if (!anchors.length) return;
    const zone = innerHeight * 0.4;
    const y = scrollY + innerHeight * 0.5;
    let i = 0;
    while (i + 1 < anchors.length && anchors[i + 1].top - zone / 2 <= y) i++;
    let lab = anchors[i].lab;
    if (i > 0) {
      const t = clamp((y - (anchors[i].top - zone / 2)) / zone, 0, 1);
      const a = anchors[i - 1].lab;
      const e = easeInOut(t);
      lab = [lerp(a[0], lab[0], e), lerp(a[1], lab[1], e), lerp(a[2], lab[2], e)];
    }
    const hex = toHex(lab);
    if (hex === lastSky) return;
    lastSky = hex;
    // le texte passe du marine au sable quand le ciel s'assombrit
    const f = easeInOut(clamp((0.68 - lab[0]) / 0.18, 0, 1));
    root.style.setProperty('--sky', hex);
    root.style.setProperty('--fg', toHex([lerp(INK[0], SAND[0], f), lerp(INK[1], SAND[1], f), lerp(INK[2], SAND[2], f)]));
    root.classList.toggle('is-dark', lab[0] < 0.6);
    metaTheme.setAttribute('content', hex);
  };

  /* ——— En-tête, menu et barre d'appel ——— */
  const hd = $('[data-hd]');
  const menuBtn = $('[data-menu]');
  const drawer = $('[data-drawer]');
  const mbar = $('[data-mbar]');
  const hero = $('[data-hero]');
  let lastY = 0;
  let contactSeen = false;
  const onScroll = () => {
    const y = scrollY;
    hd.classList.toggle('is-solid', y > 40);
    hd.classList.toggle('is-hidden', y > lastY + 2 && y > 240 && !drawer.hasAttribute('data-open'));
    if (y < lastY - 2) hd.classList.remove('is-hidden');
    mbar.classList.toggle('is-on', y > hero.offsetHeight * 0.7 && !contactSeen && !drawer.hasAttribute('data-open'));
    lastY = y;
    paintSky();
  };
  addEventListener('scroll', onScroll, {passive: true});
  const setDrawer = (open) => {
    menuBtn.setAttribute('aria-expanded', open);
    if (open) {
      drawer.hidden = false;
      drawer.setAttribute('data-open', '');
      root.classList.add('menu-open');
      lenis && lenis.stop();
      if (!reduce) {
        G.fromTo(drawer, {clipPath: 'inset(0 0 100% 0 round 0 0 40vw 40vw)'}, {clipPath: 'inset(0 0 0% 0 round 0 0 0vw 0vw)', duration: 0.9, ease: 'expo.out'});
        G.fromTo(drawer.querySelectorAll('nav a, .menu__foot > *'), {y: 30, opacity: 0}, {y: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: 'expo.out', delay: 0.12});
      }
    } else {
      drawer.hidden = true;
      drawer.removeAttribute('data-open');
      root.classList.remove('menu-open');
      lenis && lenis.start();
    }
    onScroll();
  };
  menuBtn.addEventListener('click', () => setDrawer(menuBtn.getAttribute('aria-expanded') !== 'true'));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.hasAttribute('data-open')) { setDrawer(false); menuBtn.focus(); } });
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id.length > 1 && document.getElementById(id.slice(1));
    if (!el) return;
    e.preventDefault();
    if (drawer.hasAttribute('data-open')) setDrawer(false);
    if (a.dataset.project) pickProject(a.dataset.project);
    goTo(el);
  }));
  // la rubrique en cours est soulignée dans le menu
  const navLinks = $$('.hd__nav a');
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + en.target.id));
  }), {rootMargin: '-45% 0px -50% 0px'});
  ['services', 'cost', 'work', 'season', 'areas', 'journal', 'estimate'].forEach((id) => io.observe(document.getElementById(id)));
  new IntersectionObserver(([en]) => { contactSeen = en.isIntersecting; onScroll(); }, {rootMargin: '0px 0px -30% 0px'}).observe($('#estimate'));

  /* ——— Ouvert / fermé, à l'heure de l'Arizona (pas d'heure d'été là-bas) ——— */
  const fmt = new Intl.DateTimeFormat('en-US', {timeZone: 'America/Phoenix', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false, month: 'numeric'});
  const azNow = () => {
    const parts = fmt.formatToParts(new Date());
    const get = (t) => (parts.find((p) => p.type === t) || {}).value;
    const h = +get('hour') % 24;
    return {day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')), min: h * 60 + +get('minute'), month: +get('month') - 1};
  };
  const paintStatus = () => {
    const {day, min} = azNow();
    const weekday = day >= 1 && day <= 5;
    const open = weekday && min >= 420 && min < 1020;
    let text = 'Open now · until 5 PM';
    if (!open) {
      if (weekday && min < 420) text = 'Closed · opens at 7 AM';
      else if (day >= 1 && day <= 4) text = 'Closed · opens tomorrow at 7 AM';
      else text = 'Closed · opens Monday at 7 AM';
    }
    $$('[data-status]').forEach((el) => {
      el.classList.toggle('is-open', open);
      el.querySelector('span').textContent = text;
      el.title = 'Monday to Friday, 7 AM to 5 PM, Arizona time';
    });
  };
  paintStatus();
  setInterval(paintStatus, 60000);
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ——— Lignes de titre : découpe en lignes réelles ——— */
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
    const lines = [];
    let top = null;
    words.forEach((w) => {
      const t = w.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { lines.push([]); top = t; }
      lines[lines.length - 1].push(w);
    });
    el.innerHTML = '';
    lines.forEach((ws, i) => {
      const line = document.createElement('span');
      line.className = 'line';
      line.style.setProperty('--i', i);
      const inner = document.createElement('span');
      ws.forEach((w, j) => { inner.appendChild(w); if (j < ws.length - 1) inner.appendChild(document.createTextNode(' ')); });
      line.appendChild(inner);
      el.appendChild(line);
    });
    el.classList.add('is-split');
  }
  const splits = $$('[data-split-lines]');

  /* ——— Apparitions : une classe posée à l'entrée dans l'écran, le reste en CSS ——— */
  const arches = new Set();
  function reveals() {
    let batch = 0;
    let batchT = 0;
    const show = (el) => {
      const now = performance.now();
      if (now - batchT > 120) { batch = 0; batchT = now; }
      if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${Math.min(batch++, 6) * 80}ms`);
      el.classList.add('is-in');
      if (el.hasAttribute('data-count')) count(el);
      $$('[data-count]', el).forEach(count);
    };
    const obs = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      obs.unobserve(en.target);
      if (arches.has(en.target)) riseArch(en.target);
      else show(en.target);
    }), {rootMargin: '0px 0px -12% 0px'});
    [...splits.filter((el) => !el.closest('.hero')), ...$$('[data-reveal], [data-life], [data-scale], [data-temps], [data-ft-mark]')].forEach((el) => obs.observe(el));
    $$('.arch[data-arch]').forEach((el) => { arches.add(el); obs.observe(el); });
  }

  /* ——— Compteurs ——— */
  const counted = new WeakSet();
  function count(el) {
    if (counted.has(el) || reduce) return;
    counted.add(el);
    const end = +el.dataset.count;
    const o = {v: 0};
    G.to(o, {v: end, duration: 1.6, ease: 'expo.out', delay: 0.15, onUpdate: () => { el.textContent = Math.round(o.v); }});
  }

  /* ——— L'arche qui monte comme un dôme ——— */
  const dome = (el, q, final) => {
    // q : part visible (0 → 1). Le haut reste un demi-cercle, ou une ellipse tant que la hauteur visible est faible.
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const vis = h * q;
    const rx = w / 2;
    const ry = Math.min(vis, final(w, h));
    el.style.clipPath = `inset(${(h - vis).toFixed(1)}px 0 0 0 round ${rx}px ${rx}px 0 0 / ${ry.toFixed(1)}px ${ry.toFixed(1)}px 0 0)`;
  };
  function riseArch(el) {
    if (reduce) { el.style.clipPath = 'none'; return; }
    const img = $('img', el);
    const wide = el.classList.contains('arch--wide');
    const final = wide ? (w, h) => h * 0.34 : (w) => w / 2;
    const o = {q: 0};
    G.fromTo(img, {scale: 1.16}, {scale: 1, duration: 1.8, ease: 'expo.out'});
    G.to(o, {q: 1, duration: 1.5, ease: 'expo.out', onUpdate: () => dome(el, o.q, final), onComplete: () => { el.style.clipPath = 'none'; }});
  }
  function parallax() {
    if (reduce) return;
    $$('img[data-parallax]').forEach((img) => {
      G.fromTo(img, {yPercent: -6}, {yPercent: 6, ease: 'none', scrollTrigger: {trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true}});
    });
  }

  /* ——— Accueil : l'arche monte, puis s'ouvre en plein écran au défilement ——— */
  function startHero() {
    const stage = $('[data-hero-stage]');
    const win = $('[data-hero-win]');
    const img = $('[data-hero-img]');
    const slot = $('[data-hero-slot]');
    const copy = $('[data-hero-copy]');
    const facts = $('.hero__facts');
    const over = $$('[data-hero-over] span');
    const title = $('.hero__title');
    const st = {rise: 0, open: 0};
    let box = null;
    const measure = () => {
      const s = stage.getBoundingClientRect();
      const r = slot.getBoundingClientRect();
      box = {t: r.top - s.top, l: r.left - s.left, r: s.right - r.right, b: s.bottom - r.bottom, w: r.width, h: r.height};
      // téléphone : la fenêtre commence au haut de l'arche, pour que la photo y soit cadrée
      if (desk.matches) { win.style.top = ''; } else { win.style.top = `${box.t}px`; box.t = 0; }
    };
    const paint = () => {
      if (!box) return;
      const {t, l, r, b, w, h} = box;
      const o = st.open;
      const vis = h * st.rise;
      const k = 1 - o;
      const top = desk.matches ? (t + h - vis) * k : t + h - vis;
      const rad = (w / 2) * k;
      const ry = Math.min(vis, w / 2) * k;
      win.style.clipPath = `inset(${top.toFixed(1)}px ${(r * k).toFixed(1)}px ${(b * k).toFixed(1)}px ${(l * k).toFixed(1)}px round ${rad.toFixed(1)}px ${rad.toFixed(1)}px 0 0 / ${ry.toFixed(1)}px ${ry.toFixed(1)}px 0 0)`;
    };
    measure();
    paint();

    const intro = $$('[data-intro]', stage);
    if (reduce) {
      st.rise = 1;
      paint();
      G.set(intro, {opacity: 1});
      title.classList.add('is-in');
    } else {
      G.set(img, {scale: 1.16});
      G.to(st, {rise: 1, duration: 1.7, ease: 'expo.out', delay: 0.15, onUpdate: paint});
      G.to(img, {scale: 1.06, duration: 2.2, ease: 'expo.out', delay: 0.15});
      title.style.setProperty('--d', '250ms');
      title.classList.add('is-in');
      G.fromTo(intro, {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.09, delay: 0.55});
      G.fromTo(hd, {yPercent: -100}, {yPercent: 0, duration: 1.1, ease: 'expo.out', delay: 0.3, clearProps: 'transform'});
    }

    let tl = null;
    const build = () => {
      if (tl) { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); tl = null; }
      G.set([copy, facts], {clearProps: 'opacity,transform'});
      G.set(over, {opacity: 0, y: 40});
      win.style.setProperty('--shade', 0);
      st.open = 0;
      measure();
      paint();
      if (reduce) return;
      if (desk.matches) {
        tl = G.timeline({scrollTrigger: {trigger: hero, start: 'top top', end: '+=120%', pin: stage, scrub: true, anticipatePin: 1}});
        tl.to(st, {open: 1, ease: 'power2.inOut', duration: 1, onUpdate: paint}, 0)
          .to(copy, {y: -90, opacity: 0, ease: 'power1.in', duration: 0.45}, 0)
          .to(facts, {y: 30, opacity: 0, ease: 'power1.in', duration: 0.35}, 0)
          .fromTo(img, {scale: 1.06}, {scale: 1, ease: 'none', duration: 1}, 0)
          .to(win, {'--shade': 1, ease: 'none', duration: 0.4}, 0.55)
          .to(over, {y: 0, opacity: 1, ease: 'expo.out', stagger: 0.08, duration: 0.35}, 0.72)
          .to({}, {duration: 0.25});
      } else {
        tl = G.timeline({scrollTrigger: {trigger: hero, start: 'top top', end: 'bottom 35%', scrub: true}});
        tl.to(st, {open: 1, ease: 'none', onUpdate: paint}, 0);
      }
    };
    build();
    return {build, measure: () => { measure(); paint(); }};
  }

  /* ——— L'entreprise : le texte s'allume mot à mot ——— */
  function startWords() {
    const el = $('[data-words]');
    const text = el.textContent.trim();
    el.innerHTML = text.split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    const words = $$('.w', el);
    if (reduce) { words.forEach((w) => w.classList.add('is-lit')); return; }
    let lit = 0;
    ST.create({
      trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: true,
      onUpdate: (self) => {
        const n = Math.round(self.progress * words.length);
        if (n === lit) return;
        const [a, b] = n > lit ? [lit, n] : [n, lit];
        for (let i = a; i < b; i++) words[i].classList.toggle('is-lit', n > lit);
        lit = n;
      },
    });
  }

  /* ——— Les chantiers : chaque photo monte comme une vague (ordinateur), défilement latéral (téléphone) ——— */
  function startWork() {
    const shots = $$('[data-shot]');
    const n = shots.length;
    const btns = $$('[data-go]');
    const now = $('[data-work-now]');
    const stage = $('[data-work-stage]');
    $('[data-work-total]').textContent = String(n).padStart(2, '0');
    let cur = -1;
    let still = false; // mouvement réduit sur ordinateur : une photo à la fois, sans défilement épinglé
    const setCur = (i) => {
      if (i === cur) return;
      cur = i;
      shots.forEach((s, j) => s.classList.toggle('is-on', j === i));
      btns.forEach((b, j) => b.classList.toggle('is-on', j === i));
      now.textContent = String(i + 1).padStart(2, '0');
      if (still) frames.forEach((f, j) => { f.style.clipPath = j === i ? 'none' : 'inset(100% 0 0 0)'; });
    };
    const frames = shots.map((s) => $('.shot__btn', s));
    setCur(0);
    const imgs = shots.map((s) => $('img', s));
    const paint = (k) => {
      frames.forEach((f, j) => {
        if (j === 0) return;
        const q = clamp(k - (j - 1), 0, 1);
        if (q <= 0) { f.style.clipPath = 'inset(100% 0 0 0)'; G.set(imgs[j], {yPercent: 12}); return; }
        if (q >= 1) { f.style.clipPath = 'none'; G.set(imgs[j], {yPercent: 0}); return; }
        const w = f.offsetWidth;
        const h = f.offsetHeight;
        const vis = h * q;
        const rx = (w / 2) * (1 - q);
        const ry = Math.min(vis, w / 2) * (1 - q);
        f.style.clipPath = `inset(${(h - vis).toFixed(1)}px 0 0 0 round ${rx.toFixed(1)}px ${rx.toFixed(1)}px 0 0 / ${ry.toFixed(1)}px ${ry.toFixed(1)}px 0 0)`;
        G.set(imgs[j], {yPercent: 12 * (1 - q)});
      });
      imgs.forEach((im, j) => {
        if (j === n - 1) return;
        const q = clamp(k - j, 0, 1);
        if (q > 0 && q < 1) G.set(im, {yPercent: -5 * q});
      });
      setCur(clamp(Math.round(k), 0, n - 1));
    };
    let trig = null;
    const build = () => {
      if (trig) { trig.kill(); trig = null; }
      still = false;
      frames.forEach((f) => { f.style.clipPath = ''; });
      G.set(imgs, {clearProps: 'transform'});
      if (desk.matches && !reduce) {
        paint(0);
        trig = ST.create({
          trigger: $('[data-work]'), start: 'top top', end: `+=${(n - 1) * 62}%`, pin: $('[data-work-pin]'), scrub: true, anticipatePin: 1,
          onUpdate: (self) => paint(self.progress * (n - 1)),
        });
      } else {
        still = desk.matches;
        frames.forEach((f, j) => { f.style.clipPath = !still || j === cur ? 'none' : 'inset(100% 0 0 0)'; });
      }
    };
    build();
    btns.forEach((b, i) => b.addEventListener('click', () => {
      if (still) { setCur(i); return; }
      if (!trig) return;
      const y = trig.start + (trig.end - trig.start) * (i / (n - 1)) + 2;
      if (lenis) lenis.scrollTo(y, {duration: 1.2}); else window.scrollTo({top: y, behavior: reduce ? 'auto' : 'smooth'});
    }));
    // téléphone : le compteur suit le défilement latéral
    stage.addEventListener('scroll', () => {
      if (desk.matches) return;
      const w = shots[0].offsetWidth + 12;
      setCur(clamp(Math.round(stage.scrollLeft / w), 0, n - 1));
    }, {passive: true});
    return {build};
  }

  /* ——— Visionneuse plein écran ——— */
  function startViewer() {
    const v = $('[data-viewer]');
    const frame = $('[data-viewer-frame]');
    const img = $('[data-viewer-img]');
    const cap = $('[data-viewer-cap]');
    const shots = $$('[data-shot]');
    let i = 0;
    let back = null;
    const show = (k, dir = 0) => {
      i = (k + shots.length) % shots.length;
      const src = $('img', shots[i]);
      img.src = src.currentSrc || src.src;
      img.alt = src.alt;
      const fc = $('figcaption', shots[i]);
      cap.innerHTML = `${fc.childNodes[1].textContent.trim()}<span>${String(i + 1).padStart(2, '0')} / ${String(shots.length).padStart(2, '0')}</span>`;
      if (!reduce && dir) G.fromTo(img, {x: dir * 40, opacity: 0}, {x: 0, opacity: 1, duration: 0.6, ease: 'expo.out'});
    };
    const open = (k) => {
      back = document.activeElement;
      v.hidden = false;
      show(k);
      lenis && lenis.stop();
      document.body.style.overflow = 'hidden';
      if (!reduce) {
        G.fromTo(v, {opacity: 0}, {opacity: 1, duration: 0.4, ease: 'power2.out'});
        G.fromTo(frame, {scale: 0.96, y: 20}, {scale: 1, y: 0, duration: 0.8, ease: 'expo.out'});
      }
      $('[data-viewer-close]').focus();
    };
    const close = () => {
      v.hidden = true;
      document.body.style.overflow = '';
      lenis && lenis.start();
      back && back.focus();
    };
    $$('[data-view]').forEach((b) => b.addEventListener('click', () => open(+b.dataset.view)));
    $('[data-viewer-close]').addEventListener('click', close);
    $('[data-viewer-prev]').addEventListener('click', () => show(i - 1, -1));
    $('[data-viewer-next]').addEventListener('click', () => show(i + 1, 1));
    v.addEventListener('click', (e) => { if (e.target === v || e.target === frame) close(); });
    addEventListener('keydown', (e) => {
      if (v.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(i - 1, -1);
      if (e.key === 'ArrowRight') show(i + 1, 1);
      if (e.key === 'Tab') {
        const f = $$('button', v);
        const k = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    let x0 = null;
    frame.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    frame.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    });
  }

  /* ——— La saison : normales NOAA 1991-2020, aéroport de Scottsdale (USW00003192) ——— */
  const NORMALS = [[66.5, 43.4], [68.7, 46.0], [75.7, 51.7], [82.8, 58.3], [91.8, 66.7], [102.0, 76.2],
    [104.1, 82.6], [102.9, 81.8], [98.2, 75.3], [87.3, 62.7], [74.8, 50.6], [64.6, 42.5]];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function startSeason() {
    const list = $('[data-months]');
    const {month} = azNow();
    list.innerHTML = NORMALS.map(([hi, lo], m) => `<li class="${hi >= 100 ? 'is-hot' : ''}${m === month ? ' is-now' : ''}" style="--hi:${hi};--lo:${lo};--d:${m * 55}ms">`
      + `<span class="temps__cap" aria-hidden="true"></span><span class="temps__hi" aria-hidden="true">${Math.round(hi)}°</span>`
      + `<span class="temps__m" aria-hidden="true">${MONTHS[m].slice(0, 3)}</span>`
      + `<span class="sr">${MONTHS[m]}: normal high ${hi}°F, low ${lo}°F.</span></li>`).join('');
    const name = MONTHS[month];
    let msg;
    if (month >= 9 || month <= 1) msg = `It’s ${name}: the off-season is here, a good time to get started.`;
    else if (month === 2) msg = `It’s ${name}: the off-season is wrapping up. Schedule early to lock in your project.`;
    else if (month === 8) msg = `It’s ${name}: the off-season starts late this month.`;
    else msg = `It’s ${name}: plan now, and start when it cools down in late September.`;
    $('[data-season-now]').textContent = msg;
  }

  /* ——— La carte : les lignes se tracent, les villes s'allument ——— */
  function startMap() {
    const map = $('.map');
    if (!map) return;
    const cities = $$('.m-city', map);
    const labels = $$('.m-label', map);
    const dot = $('.m-dot', map);
    const items = $$('[data-areas] [data-area]');
    const on = (key) => {
      cities.forEach((c) => c.classList.toggle('is-on', c.dataset.area === key));
      labels.forEach((l) => l.classList.toggle('is-on', l.dataset.area === key));
      items.forEach((b) => b.classList.toggle('is-on', b.dataset.area === key));
      if (dot) dot.style.fill = key === 'desert-mountain' ? 'var(--lime)' : '';
    };
    items.forEach((b) => {
      const k = b.dataset.area;
      b.addEventListener('mouseenter', () => on(k));
      b.addEventListener('focus', () => on(k));
      b.addEventListener('click', () => on(k));
    });
    cities.forEach((c) => c.addEventListener('mouseenter', () => on(c.dataset.area)));
    const rings = $$('.m-rings circle', map);
    const late = $$('.m-labels, .m-shields, .m-water-label, .m-office, .m-dot, .m-rings text', map);
    if (reduce) { map.style.setProperty('--draw', 0); on('scottsdale'); return; }
    G.set(late, {opacity: 0});
    G.set(rings, {opacity: 0});
    ST.create({
      trigger: map, start: 'top 75%', once: true,
      onEnter: () => {
        G.to(map, {'--draw': 0, duration: 2.4, ease: 'power2.inOut'});
        rings.forEach((c, i) => {
          const r = +c.getAttribute('r');
          G.fromTo(c, {attr: {r: r * 0.6}, opacity: 0}, {attr: {r}, opacity: 1, duration: 1.6, ease: 'expo.out', delay: 0.5 + i * 0.12});
        });
        G.to(late, {opacity: 1, duration: 0.9, ease: 'power2.out', stagger: 0.06, delay: 1.3});
        G.delayedCall(1.9, () => { if (!items.some((b) => b.classList.contains('is-on'))) on('scottsdale'); });
      },
    });
  }

  /* ——— Formulaire (maquette : rien n'est envoyé) ——— */
  function pickProject(value) {
    const r = $(`.form__chips input[value="${value}"]`);
    if (r) r.checked = true;
  }
  function startForm() {
    const form = $('[data-form]');
    const okEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let first = null;
      $$('[required]', form).forEach((f) => {
        const bad = !f.value.trim() || (f.type === 'email' && !okEmail(f.value.trim()));
        f.closest('.field').classList.toggle('is-bad', bad);
        f.setAttribute('aria-invalid', bad);
        if (bad && !first) first = f;
      });
      if (first) { first.focus(); return; }
      const done = $('[data-done]', form);
      done.hidden = false;
      if (!reduce) G.fromTo(done.children, {opacity: 0, y: 16}, {opacity: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'expo.out'});
    });
    $$('[required]', form).forEach((f) => f.addEventListener('input', () => { f.closest('.field').classList.remove('is-bad'); f.removeAttribute('aria-invalid'); }));
  }

  /* ——— Démarrage ——— */
  const decode = (img) => (img.complete && img.naturalWidth ? Promise.resolve() : (img.decode ? img.decode() : new Promise((ok) => { img.onload = ok; }))).catch(() => {});
  async function start() {
    await document.fonts.ready.catch(() => {});
    splits.forEach(splitLines);
    await decode($('[data-hero-img]'));
    root.classList.add('sky');
    startSeason();
    const heroCtl = startHero();
    startWords();
    const workCtl = startWork();
    startViewer();
    startMap();
    startForm();
    parallax();
    reveals();
    let w0 = innerWidth;
    let rt;
    addEventListener('resize', () => {
      if (innerWidth === w0) { heroCtl.measure(); return; }
      w0 = innerWidth;
      clearTimeout(rt);
      rt = setTimeout(() => {
        splits.forEach((el) => { const was = el.classList.contains('is-in'); splitLines(el); if (was) el.classList.add('is-in'); });
        heroCtl.build();
        workCtl.build();
        ST.refresh();
      }, 200);
    });
    desk.addEventListener('change', () => { heroCtl.build(); workCtl.build(); ST.refresh(); });
    ST.addEventListener('refresh', () => { measureSky(); heroCtl.measure(); paintSky(); });
    ST.refresh();
    measureSky();
    onScroll();
    root.classList.add('is-ready');
  }
  start();
})();
