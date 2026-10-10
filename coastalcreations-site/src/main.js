/* Coastal Creations Pools and Lagoons : interactions de la page.
 * Défilement doux (Lenis) et animations au défilement (GSAP + ScrollTrigger). Le mouvement passe par des transformations,
 * des opacités et un masque SVG ; si le visiteur a demandé moins d'animations, tout est affiché d'emblée, sans écran épinglé.
 */
(function () {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  G.registerPlugin(ST);
  ST.config({ignoreMobileResize: true});
  root.classList.add(reduce ? 'no-motion' : 'motion');
  const wide = () => innerWidth >= 900;
  const hdH = () => parseFloat(getComputedStyle(root).getPropertyValue('--hd')) || 76;

  /* ——— défilement doux, liens internes ——— */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({duration: 1.1, smoothWheel: true});
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const goTo = (target) => {
    if (target.id === 'top' || target.id === 'main') return lenis ? lenis.scrollTo(0, {duration: 1.4}) : scrollTo({top: 0, behavior: reduce ? 'auto' : 'smooth'});
    const y = target.getBoundingClientRect().top + scrollY - hdH() + 1;
    if (lenis) lenis.scrollTo(y, {duration: 1.4});
    else scrollTo({top: y, behavior: reduce ? 'auto' : 'smooth'});
  };
  const lock = (on) => {
    root.classList.toggle('is-locked', on);
    document.body.style.overflow = on ? 'hidden' : '';
    if (lenis) on ? lenis.stop() : lenis.start();
  };

  /* ——— menu (tablette et téléphone) ——— */
  const menu = $('#menu');
  const menuBtn = $('[data-menu]');
  const setMenu = (open) => {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('span').textContent = open ? 'Close' : 'Menu';
    hd.classList.toggle('is-solid', open || pastHero);
    lock(open);
    if (open) $('a', menu).focus();
  };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    e.preventDefault();
    if (!menu.hidden) setMenu(false);
    goTo(target);
    // le clavier repart de la partie atteinte, comme avec une ancre classique
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
  });

  /* ——— en-tête : plein une fois l'accueil quitté, caché en descendant, rubrique en cours ——— */
  const hd = $('[data-hd]');
  const dock = $('[data-dock]');
  let lastY = scrollY;
  let pastHero = false;
  let atContact = false;
  const onScroll = () => {
    const y = scrollY;
    hd.classList.toggle('is-solid', pastHero || !menu.hidden);
    if (menu.hidden && y > lastY + 4 && pastHero) hd.classList.add('is-hidden');
    else if (y < lastY - 4 || !pastHero) hd.classList.remove('is-hidden');
    lastY = y;
    dock.classList.toggle('is-on', pastHero && !atContact);
  };
  addEventListener('scroll', onScroll, {passive: true});
  new IntersectionObserver(([en]) => { pastHero = !en.isIntersecting; onScroll(); }).observe($('.hero__copy'));
  new IntersectionObserver(([en]) => { atContact = en.isIntersecting; onScroll(); }, {rootMargin: '0px 0px -25% 0px'}).observe($('#contact'));
  const navLinks = $$('.hd__nav a');
  const navIO = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === '#' + en.target.id));
  }), {rootMargin: '-45% 0px -50% 0px'});
  ['build', 'renovate', 'leaks', 'storm', 'about'].forEach((id) => navIO.observe(document.getElementById(id)));

  /* ——— vidéos : elles ne tournent qu'à l'écran ; sans animation, elles attendent qu'on les lance ——— */
  $$('video').forEach((v) => {
    if (reduce) {
      v.controls = true;
      v.removeAttribute('autoplay');
      return;
    }
    // la source peut arriver après coup (fin du fichier) : on note si la vidéo est à l'écran
    new IntersectionObserver(([en]) => {
      v.dataset.visible = en.isIntersecting ? '1' : '';
      if (!en.isIntersecting) v.pause();
      else if (v.getAttribute('src')) v.play().catch(() => {});
    }).observe(v);
  });

  /* ——— année du pied de page ——— */
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ——— le calcul du prix de la détection de fuites ——— */
  const calc = $('[data-calc]');
  if (calc) {
    const PRICE = {pool: 350, spa: 450, feature: 50, head: 20};
    const MAX = {features: 10, heads: 40};
    const state = {spa: false, features: 0, heads: 0};
    const sum = $('[data-sum]', calc);
    const sumSr = $('[data-sum-sr]', calc);
    const shown = {v: PRICE.pool};
    const radios = $$('[role="radio"]', calc);
    const render = () => {
      radios.forEach((r) => {
        const on = (r.dataset.spa === '1') === state.spa;
        r.setAttribute('aria-checked', String(on));
        r.tabIndex = on ? 0 : -1;
      });
      for (const k of ['features', 'heads']) {
        $(`[data-out="${k}"]`, calc).textContent = state[k];
        $(`[data-step="${k}"][data-by="-1"]`, calc).disabled = state[k] === 0;
        $(`[data-step="${k}"][data-by="1"]`, calc).disabled = state[k] === MAX[k];
      }
      const total = (state.spa ? PRICE.spa : PRICE.pool) + state.features * PRICE.feature + state.heads * PRICE.head;
      sumSr.textContent = `Your leak detection price: $${total}`;
      G.to(shown, {v: total, duration: reduce ? 0 : 0.5, ease: 'power3.out', onUpdate: () => (sum.textContent = '$' + Math.round(shown.v))});
    };
    radios.forEach((r) => r.addEventListener('click', () => { state.spa = r.dataset.spa === '1'; render(); }));
    $('[role="radiogroup"]', calc).addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      state.spa = !state.spa;
      render();
      radios.find((r) => (r.dataset.spa === '1') === state.spa).focus();
    });
    $$('[data-step]', calc).forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.step;
      state[k] = Math.min(MAX[k], Math.max(0, state[k] + Number(b.dataset.by)));
      render();
    }));
    render();
  }

  /* ——— les enduits : un nom choisi, le nuancier change ——— */
  const pills = $$('[data-finish]');
  const swatches = $$('.finish__imgs img');
  const finishName = $('[data-finish-name]');
  pills.forEach((p, i) => p.addEventListener('click', () => {
    pills.forEach((q) => q.setAttribute('aria-pressed', String(q === p)));
    swatches.forEach((img, j) => {
      img.classList.toggle('is-on', j === i);
      img.alt = j === i ? `Stonescapes ${p.textContent} swatch: the color at the ledge, the first step, the shallow end and the deep end` : '';
    });
    finishName.textContent = 'Stonescapes ' + p.textContent;
  }));

  /* ——— construction : sur téléphone, chaque étape reçoit sa photo ——— */
  const stages = $$('.stage');
  const shots = $$('.shot');
  stages.forEach((s, i) => {
    const img = $('img', shots[i]).cloneNode();
    img.className = 'stage__photo';
    img.removeAttribute('data-img');
    s.prepend(img);
  });

  if (reduce) return;

  /* ════════════ animations au défilement ════════════ */

  /* 1. l'accueil : le mot CREATIONS laisse voir la piscine, puis s'ouvre jusqu'à ce qu'elle remplisse l'écran */
  const stage = $('.hero__stage');
  const svg = $('.hero__knock');
  const word = $('.knock__word');
  const text = $('.knock__text');
  const copy = $('.hero__copy');
  const caption = $('.hero__caption');
  const video = $('.hero__video');
  const knock = {ox: 0, oy: 0, max: 30};
  const layoutKnock = () => {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    $$('rect', svg).forEach((r) => { r.setAttribute('width', W); r.setAttribute('height', H); });
    $('#knock-mask').setAttribute('width', W);
    $('#knock-mask').setAttribute('height', H);
    text.setAttribute('font-size', 100);
    text.setAttribute('x', W / 2);
    text.setAttribute('y', H * (W < 760 ? 0.4 : 0.44));
    const len = text.getComputedTextLength() || 1;
    const size = Math.min((W * (W < 760 ? 0.92 : 0.9) * 100) / len, H * 0.42);
    text.setAttribute('font-size', size.toFixed(1));
    // le zoom part du milieu du I : un trait plein, qui finit par couvrir tout l'écran
    let box;
    try { box = text.getExtentOfChar(5); } catch (e) { box = null; }
    if (box) {
      knock.ox = box.x + box.width / 2;
      knock.oy = box.y + box.height * 0.52;
      const stemW = Math.max(4, box.width * 0.42);
      const stemH = Math.max(8, size * 0.7);
      knock.max = Math.max(W / stemW, H / stemH) * 1.35;
    } else {
      knock.ox = W / 2;
      knock.oy = H * 0.44;
      knock.max = 40;
    }
  };
  const setKnock = (p) => {
    const s = Math.pow(knock.max, Math.pow(p, 1.25));
    word.setAttribute('transform', `translate(${knock.ox} ${knock.oy}) scale(${s.toFixed(4)}) translate(${-knock.ox} ${-knock.oy})`);
    svg.style.visibility = p >= 0.995 ? 'hidden' : 'visible';
  };
  const heroTl = G.timeline({
    defaults: {ease: 'none'},
    scrollTrigger: {trigger: stage, start: 'top top', end: () => '+=' + Math.round(stage.clientHeight * 1.5), pin: true, scrub: 0.6, anticipatePin: 1},
  });
  const prog = {p: 0};
  heroTl
    .to(prog, {p: 1, duration: 1, onUpdate: () => setKnock(prog.p)}, 0)
    .to(copy, {autoAlpha: 0, y: -30, duration: 0.22}, 0)
    .fromTo(video, {scale: 1.12}, {scale: 1, duration: 1}, 0)
    .to(caption, {opacity: 1, duration: 0.15}, 0.85);
  const relayout = () => { layoutKnock(); setKnock(prog.p); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { relayout(); ST.refresh(); });
  relayout();
  addEventListener('resize', () => requestAnimationFrame(relayout));
  // à l'ouverture : le mot monte doucement
  G.from(word, {opacity: 0, duration: 1.4, ease: 'power2.out'});
  G.from(copy.children, {y: 40, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out', delay: 0.25});

  /* 2. les titres : chaque ligne monte de derrière son masque */
  $$('.title').forEach((t) => {
    const lines = t.children.length ? [...t.children] : [t];
    if (!t.children.length) t.innerHTML = `<span>${t.innerHTML}</span>`;
    const spans = t.children.length ? [...t.children] : lines;
    spans.forEach((sp) => {
      sp.setAttribute('data-line', '');
      sp.innerHTML = `<span>${sp.innerHTML}</span>`;
    });
    G.from($$('[data-line] > span', t), {yPercent: 110, duration: 1.1, stagger: 0.09, ease: 'power4.out', scrollTrigger: {trigger: t, start: 'top 86%'}});
  });

  /* 3. la phrase d'introduction s'allume mot à mot */
  $$('[data-words]').forEach((p) => {
    p.innerHTML = p.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    // les mots passent du gris-vert au bleu-vert profond (lisibles à chaque instant, contraste 3,4:1 au moins)
    G.to($$('.w', p), {color: '#052a30', stagger: 0.12, ease: 'none', scrollTrigger: {trigger: p, start: 'top 78%', end: 'bottom 42%', scrub: 0.5}});
  });

  /* 4. les chiffres comptent jusqu'à leur valeur */
  $$('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count);
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    const o = {v: 0};
    el.textContent = pre + '0' + suf;
    G.to(o, {v: to, duration: 1.6, ease: 'power3.out', scrollTrigger: {trigger: el, start: 'top 88%'}, onUpdate: () => (el.textContent = pre + Math.round(o.v) + suf)});
  });

  /* 5. les quatre cartes s'empilent : celle du dessous recule et s'assombrit quand la suivante arrive */
  const cards = $$('.card');
  cards.forEach((c, i) => {
    c.style.setProperty('--i', i);
    const shade = document.createElement('i');
    shade.className = 'card__shade';
    c.append(shade);
    const next = cards[i + 1];
    if (!next) return;
    G.timeline({scrollTrigger: {trigger: next, start: 'top bottom', end: () => `top ${hdH() + 20 + (i + 1) * 16}px`, scrub: true}})
      .to(c, {scale: 0.92, ease: 'none'}, 0)
      .to(shade, {opacity: 0.45, ease: 'none'}, 0);
    const img = $('.card__img', next);
    if (img) G.from(img, {scale: 1.15, ease: 'none', scrollTrigger: {trigger: next, start: 'top bottom', end: 'top top', scrub: true}});
  });

  /* 6. construction : l'écran tient pendant les sept temps du chantier (grand écran seulement) */
  const mm = G.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const num = $('[data-num]');
    const bar = $('.build__bar span');
    let cur = -1;
    const show = (i) => {
      if (i === cur) return;
      cur = i;
      stages.forEach((s, j) => s.classList.toggle('is-on', j === i));
      shots.forEach((s, j) => s.classList.toggle('is-on', j === i));
      num.textContent = stages[i].dataset.range;
    };
    show(0);
    const st = ST.create({
      trigger: '.build__pin',
      start: 'top top',
      end: () => '+=' + Math.round(innerHeight * 0.7 * (stages.length - 1)),
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        show(Math.min(stages.length - 1, Math.floor(self.progress * stages.length * 0.999)));
        G.set(bar, {scaleX: 0.06 + self.progress * 0.94});
      },
    });
    return () => { st.kill(); stages.forEach((s) => s.classList.add('is-on')); };
  });

  /* 7. rénovations : « Before. » et « After. » s'écartent ; l'après grandit, l'avant glisse plus lentement */
  G.to('.reno__before', {xPercent: -6, ease: 'none', scrollTrigger: {trigger: '.reno__head', start: 'top bottom', end: 'bottom top', scrub: true}});
  G.to('.reno__after', {xPercent: 8, ease: 'none', scrollTrigger: {trigger: '.reno__head', start: 'top bottom', end: 'bottom top', scrub: true}});
  $$('[data-grow]').forEach((f) => {
    G.fromTo(f, {clipPath: 'inset(12% 10% 12% 10% round 28px)'}, {clipPath: 'inset(0% 0% 0% 0% round 28px)', ease: 'none', scrollTrigger: {trigger: f, start: 'top 95%', end: 'top 35%', scrub: true}});
    G.fromTo($('img', f), {scale: 1.25}, {scale: 1, ease: 'none', scrollTrigger: {trigger: f, start: 'top bottom', end: 'bottom top', scrub: true}});
  });
  $$('[data-drift]').forEach((f) => {
    G.fromTo(f, {y: 70}, {y: -50, ease: 'none', scrollTrigger: {trigger: f, start: 'top bottom', end: 'bottom top', scrub: true}});
  });
  $$('.dates__row').forEach((row) => {
    G.from($$('[data-rise]', row), {y: 90, opacity: 0, duration: 1.1, stagger: 0.14, ease: 'power3.out', scrollTrigger: {trigger: row, start: 'top 82%'}});
  });
  G.from('.brandon__video', {y: 80, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: {trigger: '.brandon', start: 'top 80%'}});

  /* 8. enduits : la rangée de choix arrive, le nuancier se découvre */
  G.from('.finish__picker .pill', {y: 24, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', scrollTrigger: {trigger: '.finish__picker', start: 'top 88%'}});
  G.fromTo('.finish__imgs', {clipPath: 'inset(0% 0% 100% 0% round 28px)'}, {clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.3, ease: 'power3.inOut', scrollTrigger: {trigger: '.finish__swatch', start: 'top 80%'}});

  /* 9. fuites : le calcul monte ; les trois réponses arrivent l'une après l'autre */
  G.from('.calc', {y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: {trigger: '.calc', start: 'top 88%'}});
  G.from('.leaks__info > div', {y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', scrollTrigger: {trigger: '.leaks__info', start: 'top 85%'}});

  /* 10. tempêtes : les trois photos se découvrent de gauche à droite, du vert au bleu */
  G.fromTo('[data-wipe]', {clipPath: 'inset(0% 100% 0% 0%)'}, {clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, stagger: 0.28, ease: 'power3.inOut', scrollTrigger: {trigger: '.storm__row', start: 'top 78%'}});
  G.from('.surge .ticks li', {x: -20, opacity: 0, duration: 0.6, stagger: 0.07, ease: 'power2.out', scrollTrigger: {trigger: '.surge .ticks', start: 'top 88%'}});

  /* 11. à propos : les deux associés, la frise des années */
  G.from('.person', {y: 50, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out', scrollTrigger: {trigger: '.people', start: 'top 85%'}});
  G.from('.years li', {y: 30, opacity: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out', scrollTrigger: {trigger: '.years', start: 'top 88%'}});
  G.from('.licenses dl > div', {y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: {trigger: '.licenses', start: 'top 85%'}});

  /* 12. contact : les trois façons de les joindre ; le grand nom du pied de page glisse */
  G.from('.way', {y: 60, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out', scrollTrigger: {trigger: '.contact__ways', start: 'top 88%'}});
  G.fromTo('.ft__word', {xPercent: 6}, {xPercent: -4, ease: 'none', scrollTrigger: {trigger: '.ft', start: 'top bottom', end: 'bottom bottom', scrub: true}});

  addEventListener('load', () => ST.refresh());
})();
