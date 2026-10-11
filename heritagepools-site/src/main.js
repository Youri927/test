/* Heritage Pools Texas : interactions de la page.
 * Défilement doux (Lenis) et animations au défilement (GSAP + ScrollTrigger) : le film de l'accueil, le chantier épinglé
 * dont la couleur suit le matériau, la visionneuse des photos, les deux couleurs de lumière, les horaires et le formulaire.
 * Si le visiteur a demandé moins d'animations : pas de film ni d'écran épinglé, tout est affiché d'emblée.
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

  /* ——— défilement doux, liens internes ——— */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({duration: 1.1, smoothWheel: true});
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const goTo = (target) => {
    // le chantier s'ouvre sur son écran épinglé : on s'arrête sur son titre, sous l'en-tête
    const y = target.id === 'top' ? 0 : target.getBoundingClientRect().top + scrollY - hdH() + 1;
    if (lenis) lenis.scrollTo(y, {duration: 1.4});
    else scrollTo({top: y, behavior: reduce ? 'auto' : 'smooth'});
  };
  const lock = (on) => {
    root.classList.toggle('is-locked', on);
    if (lenis) on ? lenis.stop() : lenis.start();
  };

  /* ——— menu (tablette et téléphone) ——— */
  const menu = $('#menu');
  const menuBtn = $('[data-menu]');
  const setMenu = (open) => {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('span').textContent = open ? 'Close' : 'Menu';
    hd.classList.toggle('is-menu', open);
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

  /* ——— en-tête : blanc dès qu'on descend, caché en descendant une fois l'accueil quitté ; barre d'appel ; rubrique en cours ——— */
  const dock = $('[data-dock]');
  let lastY = scrollY;
  let pastHero = false;
  let atContact = false;
  const onScroll = () => {
    const y = scrollY;
    hd.classList.toggle('is-solid', y > 40);
    if (menu.hidden && y > lastY + 4 && pastHero) hd.classList.add('is-hidden');
    else if (y < lastY - 4 || !pastHero) hd.classList.remove('is-hidden');
    lastY = y;
    dock.classList.toggle('is-on', pastHero && !atContact);
  };
  addEventListener('scroll', onScroll, {passive: true});
  onScroll();
  new IntersectionObserver(([en]) => { pastHero = !en.isIntersecting && en.boundingClientRect.top < 0; onScroll(); }).observe($('.hero__cta'));
  new IntersectionObserver(([en]) => { atContact = en.isIntersecting; onScroll(); }, {rootMargin: '0px 0px -25% 0px'}).observe($('#contact'));
  const navLinks = $$('.hd__nav a');
  const navIO = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === '#' + en.target.id));
  }), {rootMargin: '-45% 0px -50% 0px'});
  ['top', 'build', 'services', 'pools', 'night', 'team', 'contact'].forEach((id) => navIO.observe(document.getElementById(id)));

  /* ——— année du pied de page ——— */
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ——— le film de l'accueil : les onze photos du chantier, de la pelouse aux lumières ——— */
  const LAST_DAY = 41;
  const film = $('[data-film]');
  const frames = $$('.film__frame', film);
  const fDay = $('[data-film-day]', film);
  const fWhen = $('[data-film-when]', film);
  const fBar = $('.film__track span', film);
  const again = $('[data-again]', film);
  let frame = 0;
  const showFrame = (i) => {
    frame = i;
    frames.forEach((f, j) => f.classList.toggle('is-on', j === i));
    fDay.textContent = 'Day ' + frames[i].dataset.day;
    fWhen.textContent = frames[i].dataset.when;
    fBar.style.transform = `scaleX(${frames[i].dataset.day / LAST_DAY})`;
  };
  // en ligne, les photos 2 à 11 n'arrivent qu'une fois la page chargée (data-src) ; le film attend qu'elles soient prêtes
  const loadImg = (img) => {
    if (img.dataset.srcset && !img.getAttribute('srcset')) img.srcset = img.dataset.srcset;
    if (!img.getAttribute('src') && img.dataset.src) img.src = img.dataset.src;
    return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
  };
  let ready = null;
  const loadAll = () => ready || (ready = Promise.all(frames.map(loadImg)));
  // temps de pose de chaque photo (s) : la pelouse un peu plus longtemps, l'eau aussi, avant la nuit
  const HOLD = [0.55, 0.3, 0.3, 0.3, 0.3, 0.3, 0.34, 0.3, 0.3, 0.8];
  let tl = null;
  const play = () => {
    again.disabled = true;
    loadAll().then(() => {
      if (tl) tl.kill();
      tl = G.timeline({onComplete: () => { again.disabled = false; }});
      let t = 0;
      frames.forEach((f, i) => {
        tl.call(showFrame, [i], t);
        t += HOLD[i] || 0;
      });
    });
  };
  if (reduce) {
    // sans animation : la piscine terminée, directement
    const last = frames.length - 1;
    loadImg(frames[last]).then(() => showFrame(last));
  } else {
    again.addEventListener('click', play);
    // le film ne part qu'une fois la première image réellement affichée : c'est elle que le visiteur voit en premier
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
    // puis au premier geste du visiteur (clic, doigt, molette, clavier ; pas un simple mouvement de souris, que le navigateur
    // simule lui-même après chaque mise en page), ou au bout de deux secondes : le premier écran
    // garde toute la connexion pour lui, les photos 2 à 11 viennent ensuite
    const GESTURES = ['pointerdown', 'touchstart', 'wheel', 'keydown'];
    const start = () => afterFirstPaint(() => {
      let timer = 0;
      const kick = () => {
        clearTimeout(timer);
        GESTURES.forEach((t) => removeEventListener(t, kick));
        G.delayedCall(0.35, play);
      };
      timer = setTimeout(kick, 2200);
      GESTURES.forEach((t) => addEventListener(t, kick, {passive: true}));
    });
    if (document.readyState === 'complete') start();
    else addEventListener('load', start, {once: true});
  }

  /* ——— le chantier : la règle des jours (du 7 janvier au 17 février), une coche par jour, un point par photo ——— */
  const log = $('[data-log]');
  const entries = $$('.entry', log);
  const track = $('[data-track]', log);
  const now = $('.ruler__now', track);
  for (let d = 0; d <= LAST_DAY; d++) {
    const tick = document.createElement('i');
    tick.style.setProperty('--d', d);
    if (d % 7 === 0 || d === LAST_DAY) tick.className = 'is-week';
    track.insertBefore(tick, now);
  }
  const dots = entries.map((e) => {
    const dot = document.createElement('b');
    dot.className = 'ruler__dot';
    dot.style.setProperty('--d', e.dataset.day);
    track.insertBefore(dot, now);
    return dot;
  });
  let cur = -1;
  const setEntry = (i) => {
    if (i === cur) return;
    cur = i;
    entries.forEach((e, j) => e.classList.toggle('is-on', j === i));
    log.dataset.tone = entries[i].dataset.tone;
    now.style.setProperty('--d', entries[i].dataset.day);
    dots.forEach((dot, j) => dot.classList.toggle('is-past', j <= i));
  };

  /* ——— les lumières : bleu ou rouge ——— */
  const picks = $$('[data-light]');
  const lights = $$('.lights__img');
  picks.forEach((b) => b.addEventListener('click', () => {
    picks.forEach((p) => p.setAttribute('aria-pressed', String(p === b)));
    lights.forEach((img) => {
      const on = img.dataset.color === b.dataset.light;
      img.classList.toggle('is-on', on);
      if (on) img.removeAttribute('aria-hidden');
      else img.setAttribute('aria-hidden', 'true');
    });
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

  /* ——— ouvert maintenant ? (heure du Texas, fuseau du Centre) ——— */
  const openNow = $('[data-open]');
  try {
    const parts = new Intl.DateTimeFormat('en-US', {timeZone: 'America/Chicago', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'}).formatToParts(new Date());
    const part = (type) => (parts.find((p) => p.type === type) || {}).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(part('weekday'));
    const h = (Number(part('hour')) % 24) + Number(part('minute')) / 60;
    if (day >= 0 && !Number.isNaN(h)) {
      const weekday = day >= 1 && day <= 5;
      const open = weekday && h >= 8 && h < 16;
      openNow.textContent = open
        ? 'Open now, until 4 PM Central Time.'
        : weekday && h < 8
          ? 'Closed now. Opens today at 8 AM Central Time.'
          : day >= 1 && day <= 4
            ? 'Closed now. Opens tomorrow at 8 AM Central Time.'
            : 'Closed now. Opens Monday at 8 AM Central Time.';
      openNow.dataset.state = open ? 'open' : 'closed';
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

  /* ════════════ animations au défilement ════════════ */

  /* 1. l'accueil : le titre (lisible dès le premier affichage) monte un peu, le film aussi ; au défilement, le film glisse moins vite */
  G.from('.hero__title', {y: 30, duration: 1.3, ease: 'power3.out'});
  G.from('.film', {y: 40, duration: 1.3, ease: 'power3.out'});
  G.from(['.hero__lead', '.hero__cta'], {y: 24, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.35});
  G.to('.film', {yPercent: -8, ease: 'none', scrollTrigger: {trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true}});

  /* 2. les titres : chaque ligne monte de derrière son masque */
  $$('.title').forEach((t) => {
    if (!t.children.length) t.innerHTML = `<span>${t.innerHTML}</span>`;
    [...t.children].forEach((sp) => {
      sp.setAttribute('data-line', '');
      sp.innerHTML = `<span>${sp.innerHTML}</span>`;
    });
    G.from($$('[data-line] > span', t), {yPercent: 110, duration: 1.1, stagger: 0.09, ease: 'power4.out', scrollTrigger: {trigger: t, start: 'top 86%'}});
  });

  /* 3. le chantier : l'écran tient pendant les onze photos (grand écran seulement) */
  const mm = G.matchMedia();
  mm.add('(min-width: 900px) and (min-height: 600px)', () => {
    cur = -1;
    setEntry(0);
    const st = ST.create({
      trigger: log,
      start: 'top top',
      end: () => '+=' + Math.round(innerHeight * 0.5 * (entries.length - 1)),
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => setEntry(Math.min(entries.length - 1, Math.floor(self.progress * entries.length * 0.999))),
    });
    return () => {
      st.kill();
      entries.forEach((e) => e.classList.remove('is-on'));
      delete log.dataset.tone;
      cur = -1;
    };
  });

  /* 4. les services : le filet de chaque ligne se trace, le nom et la phrase suivent */
  $$('.svc li').forEach((li) => {
    const trigger = {trigger: li, start: 'top 90%'};
    G.fromTo(li, {'--rule': 0}, {'--rule': 1, duration: 1.1, ease: 'power3.inOut', scrollTrigger: trigger});
    G.from(li.children, {y: 18, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.15, scrollTrigger: {...trigger}});
  });

  /* 5. la nuit : la grande photo s'allume quand on arrive dessus */
  G.fromTo('.lights__imgs', {filter: 'brightness(0.2)'}, {filter: 'brightness(1)', duration: 1.6, ease: 'power2.out', scrollTrigger: {trigger: '.lights', start: 'top 72%'}});

  if (document.fonts) document.fonts.ready.then(() => ST.refresh());
  addEventListener('load', () => ST.refresh());
})();
