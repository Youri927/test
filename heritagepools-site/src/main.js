/* Heritage Pools Texas : interactions de la page.
 * Défilement doux (Lenis) et animations au défilement (GSAP + ScrollTrigger).
 * L'ouverture déroule le chantier de 2018 : l'écran tient, le compteur des jours avance, la page prend la couleur
 * du matériau, l'eau monte au jour 30 et les lumières s'allument au jour 41 ; la règle des jours se fait glisser.
 * Puis : les services qui glissent, l'année-compteur de la galerie, la visionneuse, la nuit qui s'allume,
 * les valeurs mot à mot, les horaires et le formulaire.
 * Si le visiteur a demandé moins d'animations : rien d'épinglé, les onze photos se suivent, tout est affiché d'emblée.
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
  root.classList.toggle('motion', !reduce);
  root.classList.toggle('no-motion', reduce);
  const hd = $('[data-hd]');
  const hdH = () => hd.offsetHeight;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const smooth = (a, b, x) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };

  // l'ouverture : part du défilement pour passer du titre au compteur (I), part finale où les lumières s'allument (O),
  // et moment, dans chaque étape, où la photo suivante arrive (LAND)
  const I = 0.06;
  const O = 0.1;
  const LAND = 0.86;
  const open = {pinned: false, st: null, end: 0};

  /* ——— défilement doux, liens internes ——— */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({duration: 1.1, smoothWheel: true});
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const scrollToY = (y, opts = {}) => {
    if (lenis) lenis.scrollTo(y, opts.immediate ? {immediate: true} : {duration: opts.duration || 1.4});
    else scrollTo({top: y, behavior: opts.immediate || reduce ? 'auto' : 'smooth'});
  };
  const goTo = (target) => {
    if (target.id === 'top') return scrollToY(0);
    // « The build » : le début du chantier, dans l'écran épinglé
    if (target.id === 'build' && open.st) return scrollToY(open.st.start + (open.st.end - open.st.start) * (I + 0.004));
    scrollToY(target.getBoundingClientRect().top + scrollY - hdH() + 1);
  };
  const lock = (on) => {
    root.classList.toggle('is-locked', on);
    if (lenis) on ? lenis.stop() : lenis.start();
  };

  /* ——— menu (tablette et téléphone) ——— */
  const menu = $('#menu');
  const menuBtn = $('[data-menu]');
  const setMenu = (isOpen) => {
    menu.hidden = !isOpen;
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuBtn.querySelector('span').textContent = isOpen ? 'Close' : 'Menu';
    hd.classList.toggle('is-menu', isOpen);
    lock(isOpen);
    if (isOpen) $('a', menu).focus();
  };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      setMenu(false);
      menuBtn.focus();
    }
  });
  matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches && !menu.hidden) setMenu(false); });

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

  /* ——— en-tête : transparent pendant l'ouverture, blanc ensuite, caché en descendant ; barre d'appel ; rubrique en cours ——— */
  const dock = $('[data-dock]');
  let lastY = scrollY;
  let atContact = false;
  const onScroll = () => {
    const y = scrollY;
    const pastHero = y > innerHeight * 0.45;
    const inOpening = open.pinned && y < open.end - 2;
    hd.classList.toggle('is-solid', !inOpening && y > 40);
    if (menu.hidden && y > lastY + 4 && pastHero) hd.classList.add('is-hidden');
    else if (y < lastY - 4 || !pastHero) hd.classList.remove('is-hidden');
    lastY = y;
    dock.classList.toggle('is-on', pastHero && !atContact);
  };
  addEventListener('scroll', onScroll, {passive: true});
  new IntersectionObserver(([en]) => { atContact = en.isIntersecting; onScroll(); }, {rootMargin: '0px 0px -25% 0px'}).observe($('#contact'));
  const navLinks = $$('.hd__nav a');
  const navIO = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === '#' + en.target.id));
  }), {rootMargin: '-45% 0px -50% 0px'});
  ['services', 'pools', 'night', 'team', 'contact'].forEach((id) => navIO.observe(document.getElementById(id)));

  /* ——— année du pied de page ——— */
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ════════ l'ouverture : le chantier en 41 jours ════════ */
  const opening = $('[data-opening]');
  const stage = $('[data-stage]');
  const intro = $('[data-intro]');
  const info = $('[data-info]');
  const cue = $('[data-cue]');
  const endBox = $('[data-end]');
  const endBtn = $('a', endBox);
  const fill = $('.stage__fill', stage);
  const photo = $('[data-photo]');
  const frames = $$('.frame', stage);
  const numEl = $('[data-num]');
  const whenEl = $('[data-when]');
  const whatEl = $('[data-what]');
  const countEl = $('[data-count]');
  const ruler = $('[data-ruler]');
  const track = $('[data-track]');
  const needle = $('.ruler__now', track);
  const nowEl = $('[data-now]');
  // les onze étapes viennent de la liste (jour, matériau, date, légende)
  const STEPS = $$('.entry').map((e) => ({day: Number(e.dataset.day), tone: e.dataset.tone, when: $('time', e).textContent, what: $('.entry__what', e).textContent}));
  const N = STEPS.length;
  const LAST_DAY = STEPS[N - 1].day;
  const TONES = {grass: [76, 106, 46], clay: [143, 74, 40], gunite: [98, 103, 109], stone: [214, 196, 161], plaster: [65, 103, 159], water: [60, 195, 208], night: [8, 16, 51]};
  const INK = {stone: true, water: true};
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateOf = (d) => {
    const x = new Date(2018, 0, 7 + Math.floor(d));
    return MONTHS[x.getMonth()] + ' ' + x.getDate();
  };
  const mix = (a, b, t) => a.map((v, j) => Math.round(v + (b[j] - v) * t));
  const rgb = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

  // la règle : une coche par jour (plus grande chaque semaine), un point par photo
  for (let d = 0; d <= LAST_DAY; d++) {
    const tick = document.createElement('i');
    tick.style.setProperty('--d', d);
    if (d % 7 === 0 || d === LAST_DAY) tick.className = 'is-week';
    track.insertBefore(tick, needle);
  }
  const dots = STEPS.map((step) => {
    const dot = document.createElement('b');
    dot.className = 'ruler__dot';
    dot.style.setProperty('--d', step.day);
    track.insertBefore(dot, needle);
    return dot;
  });

  let shown = -1;
  let shownDay = -1;
  let fgInk = null;
  let endOn = false;
  const render = (p) => {
    // le titre laisse la place au compteur
    const a = smooth(0, I, p);
    intro.style.opacity = String(1 - a);
    intro.style.transform = `translate3d(0, ${(-36 * a).toFixed(1)}px, 0)`;
    intro.style.visibility = a > 0.98 ? 'hidden' : '';
    info.style.opacity = String(a);
    info.style.transform = `translate3d(0, ${(28 * (1 - a)).toFixed(1)}px, 0)`;
    cue.style.opacity = String(1 - smooth(0, I * 0.7, p));

    // l'étape en cours : de la photo i à la photo i + 1
    const s = clamp01((p - I) / (1 - I - O)) * (N - 1);
    const i = Math.min(N - 2, Math.floor(s));
    const t = s - i;
    const A = STEPS[i];
    const B = STEPS[i + 1];
    const k = t >= LAND ? i + 1 : i;
    const d = A.day + (B.day - A.day) * clamp01(t / LAND);

    // la couleur du matériau ; entre l'enduit et l'eau, l'eau monte
    let bg;
    let ink;
    if (A.tone === 'plaster' && B.tone === 'water') {
      const w = smooth(0.36, LAND, t);
      fill.style.transform = `translate3d(0, ${((1 - w) * 105).toFixed(2)}%, 0)`;
      bg = t >= LAND ? TONES.water : TONES.plaster;
      ink = w > 0.5;
    } else {
      fill.style.transform = 'translate3d(0, 105%, 0)';
      const c = smooth(0.6, LAND, t);
      bg = mix(TONES[A.tone], TONES[B.tone], c);
      ink = c < 0.5 ? !!INK[A.tone] : !!INK[B.tone];
    }
    opening.style.setProperty('--bg', rgb(bg));
    root.style.setProperty('--hd-bg', rgb(bg));
    if (ink !== fgInk) {
      fgInk = ink;
      stage.dataset.fg = ink ? 'ink' : 'white';
      root.style.setProperty('--hd-fg', ink ? '#0a1238' : '#fff');
    }

    // la photo, la date, la légende
    if (k !== shown) {
      shown = k;
      frames.forEach((f, j) => f.classList.toggle('is-on', j <= k));
      whenEl.textContent = STEPS[k].when;
      whatEl.textContent = STEPS[k].what;
      countEl.textContent = `Photo ${k + 1} of ${N}`;
      ruler.setAttribute('aria-valuetext', `Day ${STEPS[k].day}, ${STEPS[k].when}. ${STEPS[k].what}`);
    }
    // le compteur des jours et la règle
    const day = Math.floor(d + 1e-6);
    if (day !== shownDay) {
      shownDay = day;
      numEl.textContent = String(day);
      nowEl.textContent = dateOf(day);
      ruler.setAttribute('aria-valuenow', String(day));
      dots.forEach((dot, j) => dot.classList.toggle('is-past', STEPS[j].day <= day));
    }
    needle.style.setProperty('--d', d.toFixed(3));

    // jour 41 : les lumières s'allument, la lueur se répand, le bouton arrive
    const lit = smooth(1 - O, 1 - O * 0.2, p);
    frames[N - 1].style.filter = k === N - 1 && lit < 1 ? `brightness(${(0.3 + 0.7 * lit).toFixed(3)})` : '';
    photo.style.setProperty('--glow', (k === N - 1 ? lit : 0).toFixed(3));
    const on = lit > 0.55;
    if (on !== endOn) {
      endOn = on;
      endBox.classList.toggle('is-on', on);
      endBtn.tabIndex = on ? 0 : -1;
    }
  };
  const resetOpening = () => {
    [intro, info, cue, fill, frames[N - 1]].forEach((el) => el.removeAttribute('style'));
    frames.forEach((f, j) => f.classList.toggle('is-on', j === 0));
    opening.style.removeProperty('--bg');
    photo.style.removeProperty('--glow');
    ['--hd-fg', '--hd-bg'].forEach((v) => root.style.removeProperty(v));
    stage.dataset.fg = 'white';
    endBox.classList.remove('is-on');
    shown = -1;
    shownDay = -1;
    fgInk = null;
    endOn = false;
  };

  // les photos 2 à 11 ne se chargent qu'ensuite (data-src) : le premier écran garde la connexion pour lui
  const loadImg = (img) => {
    if (img.dataset.srcset && !img.getAttribute('srcset')) img.srcset = img.dataset.srcset;
    if (!img.getAttribute('src') && img.dataset.src) img.src = img.dataset.src;
    return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
  };
  let loading = null;
  const loadFrames = () => loading || (loading = Promise.all(frames.map(loadImg)));
  const afterFirstPaint = (fn) => {
    const painted = () => performance.getEntriesByType('paint').some((e) => e.name === 'first-contentful-paint');
    if (!window.PerformanceObserver || painted()) return fn();
    try {
      const po = new PerformanceObserver(() => {
        if (!painted()) return;
        po.disconnect();
        fn();
      });
      po.observe({type: 'paint', buffered: true});
    } catch (err) {
      fn();
    }
  };
  // au premier geste du visiteur (clic, doigt, molette, clavier, défilement ; pas un simple mouvement de souris, que le
  // navigateur simule lui-même après chaque mise en page) ; tout de suite si la page s'ouvre déjà défilée
  const GESTURES = ['pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll'];
  const onFirstGesture = (fn, timeout) => {
    let done = false;
    let timer = 0;
    const go = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      GESTURES.forEach((t) => removeEventListener(t, go));
      fn();
    };
    if (scrollY > 0) return go();
    if (timeout) timer = setTimeout(go, timeout);
    GESTURES.forEach((t) => addEventListener(t, go, {passive: true}));
  };
  const whenLoaded = new Promise((ok) => (document.readyState === 'complete' ? ok() : addEventListener('load', ok, {once: true})));
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  // les photos 2 à 11 : au premier geste, ou deux secondes après le premier affichage
  const armFrames = () => whenLoaded.then(() => afterFirstPaint(() => onFirstGesture(loadFrames, 2200)));

  // la règle se fait glisser (souris, doigt) ou se pilote au clavier : elle fait défiler la page jusqu'au jour choisi
  const progressOfDay = (d) => {
    for (let i = 0; i < N - 1; i++) {
      const a = STEPS[i].day;
      const b = STEPS[i + 1].day;
      if (d <= b) return I + ((i + (b === a ? LAND : (LAND * (d - a)) / (b - a))) / (N - 1)) * (1 - I - O);
    }
    return 1;
  };
  const progressOfStep = (k) => (k <= 0 ? I + 0.001 : k >= N - 1 ? 1 : I + ((k - 1 + LAND) / (N - 1)) * (1 - I - O) + 0.001);
  const toProgress = (p, opts) => {
    if (!open.st) return;
    loadFrames();
    scrollToY(open.st.start + (open.st.end - open.st.start) * p, opts);
  };
  const dayAt = (x) => clamp01((x - track.getBoundingClientRect().left) / track.offsetWidth) * LAST_DAY;
  let dragging = false;
  ruler.addEventListener('pointerdown', (e) => {
    if (!open.pinned) return;
    dragging = true;
    ruler.setPointerCapture(e.pointerId);
    toProgress(progressOfDay(dayAt(e.clientX)), {duration: 0.8});
  });
  ruler.addEventListener('pointermove', (e) => { if (dragging) toProgress(progressOfDay(dayAt(e.clientX)), {immediate: true}); });
  ['pointerup', 'pointercancel'].forEach((t) => ruler.addEventListener(t, () => { dragging = false; }));
  ruler.addEventListener('keydown', (e) => {
    if (!open.pinned) return;
    const step = {ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1}[e.key];
    if (step) toProgress(progressOfStep(Math.max(0, Math.min(N - 1, Math.max(shown, 0) + step))), {duration: 0.9});
    else if (e.key === 'Home') toProgress(progressOfStep(0), {duration: 1.2});
    else if (e.key === 'End') toProgress(1, {duration: 1.2});
    else return;
    e.preventDefault();
  });

  // l'écran ne tient que s'il est assez haut et si les animations sont permises ; sinon les onze photos se suivent
  const mm = G.matchMedia();
  mm.add('(min-height: 560px)', () => {
    if (reduce) return;
    open.pinned = true;
    const st = ST.create({
      trigger: stage,
      start: 'top top',
      end: () => '+=' + Math.round(innerHeight * 5.4),
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => {
        open.end = self.end;
        requestAnimationFrame(() => render(self.progress));
      },
    });
    open.st = st;
    open.end = st.end;
    render(st.progress);
    armFrames();
    return () => {
      st.kill();
      open.pinned = false;
      open.st = null;
      resetOpening();
    };
  });
  onScroll();

  /* ——— les lumières : bleu ou rouge, la lueur suit ——— */
  const picks = $$('[data-light]');
  const lights = $$('.lights__img');
  const glows = $$('.lights__glow i');
  picks.forEach((b) => b.addEventListener('click', () => {
    picks.forEach((p) => p.setAttribute('aria-pressed', String(p === b)));
    lights.forEach((img) => {
      const on = img.dataset.color === b.dataset.light;
      img.classList.toggle('is-on', on);
      if (on) img.removeAttribute('aria-hidden');
      else img.setAttribute('aria-hidden', 'true');
    });
    glows.forEach((g) => g.classList.toggle('is-on', g.dataset.color === b.dataset.light));
  }));

  /* ——— la visionneuse : une photo en grand, la précédente et la suivante, Échap pour fermer ——— */
  const lb = $('[data-lb]');
  const lbImg = $('img', lb);
  const lbCap = $('[data-lb-cap]', lb);
  const shots = $$('.shot');
  let at = 0;
  const showShot = (i) => {
    at = (i + shots.length) % shots.length;
    const img = $('img', shots[at]);
    img.loading = 'eager';
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    const when = document.createElement('b');
    when.textContent = shots[at].dataset.when + '. ';
    lbCap.replaceChildren(when, img.alt);
  };
  shots.forEach((s, i) => $('.shot__btn', s).addEventListener('click', () => {
    showShot(i);
    lb.showModal();
    lock(true);
  }));
  $('[data-lb-prev]', lb).addEventListener('click', () => showShot(at - 1));
  $('[data-lb-next]', lb).addEventListener('click', () => showShot(at + 1));
  $('[data-lb-close]', lb).addEventListener('click', () => lb.close());
  lb.addEventListener('close', () => {
    lock(false);
    $('.shot__btn', shots[at]).focus({preventScroll: true});
  });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); showShot(at - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); showShot(at + 1); }
  });
  // un clic sur le fond sombre ferme la visionneuse
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });

  /* ——— la galerie : l'année tourne comme un compteur quand on passe d'une année à l'autre ——— */
  const odo = $('[data-odo]');
  const odoCols = [];
  for (let j = 0; j < 4; j++) {
    const col = document.createElement('span');
    col.className = 'odo';
    const strip = document.createElement('span');
    for (let n = 0; n <= 9; n++) {
      const digit = document.createElement('i');
      digit.textContent = String(n);
      strip.append(digit);
    }
    col.append(strip);
    odo.append(col);
    odoCols.push(strip);
  }
  // chaque chiffre a sa largeur (Ultra n'a pas de chiffres à chasse fixe) : la colonne prend celle du chiffre affiché
  let digitW = null;
  let shownYear = '2018';
  const measureDigits = () => {
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
    odo.append(probe);
    const size = parseFloat(getComputedStyle(odo).fontSize);
    digitW = [...'0123456789'].map((n) => {
      probe.textContent = n;
      return probe.getBoundingClientRect().width / size;
    });
    probe.remove();
  };
  const setYear = (y) => {
    shownYear = String(y);
    [...shownYear].forEach((ch, j) => {
      odoCols[j].style.transform = `translateY(${-Number(ch)}em)`;
      if (digitW) odoCols[j].parentNode.style.setProperty('--w', digitW[Number(ch)].toFixed(3) + 'em');
    });
  };
  setYear(2018);
  if (document.fonts) document.fonts.ready.then(() => { measureDigits(); setYear(shownYear); });
  else { measureDigits(); setYear(shownYear); }
  const yearIO = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) setYear(en.target.dataset.gy); }), {rootMargin: '-35% 0px -60% 0px'});
  $$('.year').forEach((y) => yearIO.observe(y));

  /* ——— ouvert maintenant ? (heure du Texas, fuseau du Centre) ——— */
  const openNow = $('[data-open]');
  try {
    const parts = new Intl.DateTimeFormat('en-US', {timeZone: 'America/Chicago', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'}).formatToParts(new Date());
    const part = (type) => (parts.find((p) => p.type === type) || {}).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(part('weekday'));
    const h = (Number(part('hour')) % 24) + Number(part('minute')) / 60;
    if (day >= 0 && !Number.isNaN(h)) {
      const weekday = day >= 1 && day <= 5;
      const isOpen = weekday && h >= 8 && h < 16;
      openNow.textContent = isOpen
        ? 'Open now, until 4 PM Central Time.'
        : weekday && h < 8
          ? 'Closed now. Opens today at 8 AM Central Time.'
          : day >= 1 && day <= 4
            ? 'Closed now. Opens tomorrow at 8 AM Central Time.'
            : 'Closed now. Opens Monday at 8 AM Central Time.';
      openNow.dataset.state = isOpen ? 'open' : 'closed';
      openNow.hidden = false;
      $$('.hours li').forEach((li) => {
        const [a, b = a] = li.dataset.days.split('-').map(Number);
        li.classList.toggle('is-today', day >= a && day <= b);
      });
    }
  } catch (err) {
    // fuseau inconnu du navigateur : les horaires restent affichés, sans l'indication
  }

  /* ——— le formulaire : vérifie les champs, puis prépare le message dans la messagerie du visiteur ——— */
  const form = $('[data-form]');
  const note = $('[data-note]', form);
  const rules = {
    name: (v) => v.trim().length > 0,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    message: (v) => v.trim().length > 0,
  };
  const check = (el) => {
    const ok = rules[el.name](el.value);
    el.setAttribute('aria-invalid', String(!ok));
    document.getElementById(el.id + '-err').hidden = ok;
    return ok;
  };
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') check(e.target);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = Object.keys(rules).map((n) => form.elements[n]).filter((el) => !check(el));
    if (bad.length) {
      bad[0].focus();
      return;
    }
    const val = (n) => form.elements[n].value.trim();
    const lines = [`Name: ${val('name')}`, `Email: ${val('email')}`];
    if (val('phone')) lines.push(`Phone: ${val('phone')}`);
    lines.push('', val('message'));
    location.href = 'mailto:HeritagepoolsTexas@gmail.com?subject=' + encodeURIComponent('Appointment request from ' + val('name')) + '&body=' + encodeURIComponent(lines.join('\n'));
    note.textContent = 'Your email app should open with the message ready to send. If nothing opens, write to HeritagepoolsTexas@gmail.com or call 281-896-5061.';
  });

  if (reduce) return;

  /* ════════ animations ════════ */

  /* 1. l'arrivée : les lignes du titre montent de derrière leur masque, la photo se pose, les coches de la règle poussent */
  $$('.hero__title > span').forEach((line) => {
    line.setAttribute('data-line', '');
    line.innerHTML = `<span>${line.innerHTML}</span>`;
  });
  G.from('.hero__title [data-line] > span', {yPercent: 110, duration: 1.1, stagger: 0.1, ease: 'power4.out', delay: 0.1});
  G.from(['.hero__lead', '.hero__cta'], {y: 22, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.45});
  G.from('.stage__frames', {scale: 1.06, duration: 1.6, ease: 'power3.out'});
  G.from('.ruler__track i', {scaleY: 0, transformOrigin: '50% 100%', duration: 0.5, stagger: 0.012, ease: 'power2.out', delay: 0.5});
  G.from(['.ruler__now', '.ruler__labels'], {opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.9});

  // les parties suivantes sont loin sous l'ouverture : leurs animations se posent au premier geste du visiteur,
  // en petites étapes (le navigateur respire entre deux), et non au chargement
  const steps = [
    () => {
      // découpes du texte d'abord (écritures), les déclencheurs ensuite (lectures)
      $$('.title').forEach((t) => {
        if (!t.children.length) t.innerHTML = `<span>${t.innerHTML}</span>`;
        [...t.children].forEach((sp) => {
          sp.setAttribute('data-line', '');
          sp.innerHTML = `<span>${sp.innerHTML}</span>`;
        });
      });
      $$('[data-words]').forEach((p) => {
        p.innerHTML = p.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
      });
    },
    () => {
      /* 2. les titres : chaque ligne monte de derrière son masque */
      $$('.title').forEach((t) => {
        G.from($$('[data-line] > span', t), {yPercent: 110, duration: 1.1, stagger: 0.09, ease: 'power4.out', scrollTrigger: {trigger: t, start: 'top 86%'}});
      });
    },
    () => {
      /* 3. les services : chaque nom arrive en glissant, d'un côté puis de l'autre ; le filet se trace, la phrase suit */
      $$('.svc li').forEach((li, i) => {
        const dir = i % 2 ? 1 : -1;
        // une seule ligne de temps par service, liée au défilement : le nom glisse (0 → 0,75), le filet se trace, la phrase arrive (0,7 → 1)
        G.timeline({scrollTrigger: {trigger: li, start: 'top bottom', end: 'top 48%', scrub: true, invalidateOnRefresh: true}})
          .fromTo($('h3', li), {x: () => dir * innerWidth * 0.3}, {x: 0, ease: 'none', duration: 0.75}, 0)
          .fromTo(li, {'--rule': 0}, {'--rule': 1, ease: 'none', duration: 0.6}, 0.05)
          .fromTo($('p', li), {opacity: 0, y: 16}, {opacity: 1, y: 0, ease: 'none', duration: 0.3}, 0.7);
      });
    },
    () => {
      /* 4. la galerie : les photos de chaque chantier se découvrent l'une après l'autre */
      $$('.strip').forEach((strip) => {
        G.fromTo($$('.shot__btn', strip), {clipPath: 'inset(0% 0% 100% 0% round 8px)'}, {clipPath: 'inset(0% 0% 0% 0% round 8px)', duration: 1.1, stagger: 0.07, ease: 'power3.inOut', scrollTrigger: {trigger: strip, start: 'top 88%'}});
      });
    },
    () => {
      /* 5. la nuit : la grande photo s'allume à mesure qu'on arrive, sa lueur se répand */
      G.fromTo('.lights__imgs', {filter: 'brightness(0.16)'}, {filter: 'brightness(1)', ease: 'none', scrollTrigger: {trigger: '.lights', start: 'top 82%', end: 'top 24%', scrub: true}});
      G.fromTo('.lights__glow', {opacity: 0, scale: 0.85}, {opacity: 1, scale: 1, ease: 'none', scrollTrigger: {trigger: '.lights', start: 'top 62%', end: 'top 18%', scrub: true}});
      /* 6. les valeurs s'allument mot à mot, du bleu pâle au bleu roi (contraste de 3:1 au moins pour ce très grand texte) */
      $$('[data-words]').forEach((p) => {
        G.fromTo($$('.w', p), {color: '#7a8bd0'}, {color: '#0b2fb3', stagger: 0.14, ease: 'none', scrollTrigger: {trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: 0.4}});
      });
      /* 7. le pied de page : le nom monte en très grand */
      G.fromTo('.ft__word', {yPercent: 60}, {yPercent: 0, ease: 'none', scrollTrigger: {trigger: '.ft', start: 'top bottom', end: 'bottom bottom', scrub: true}});
    },
  ];
  const runSteps = () => {
    const step = steps.shift();
    if (!step) return;
    step();
    setTimeout(runSteps, 0);
  };
  Promise.all([fontsReady, whenLoaded]).then(() => onFirstGesture(runSteps));
  fontsReady.then(() => ST.refresh());
})();
