/* Prestige Pools of Wilmington : l'interrupteur des lumières (de jour, de nuit, et tout seul au coucher du soleil à Wilmington),
   défilement doux, en-tête, menu, étapes qui s'allument, galerie filtrable et visionneuse, couleurs des projecteurs, formulaire. */
(() => {
  const doc = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = 'IntersectionObserver' in window;
  const ppw = window.ppw || {sun: () => null, auto: false, forced: false};
  const store = {
    get: () => {
      try { return localStorage.getItem('ppw-lights'); } catch (_) { return null; }
    },
    set: (v) => {
      try { localStorage.setItem('ppw-lights', v); } catch (_) { /* navigation privée : le choix ne sera pas gardé */ }
    },
  };

  /* ——— Défilement doux (les ancres tiennent compte de l'en-tête) ——— */
  let lenis = null;
  if (!still && window.Lenis) lenis = new window.Lenis({autoRaf: true, anchors: {offset: 0}, lerp: 0.11});

  /* ——— L'heure du soleil à Wilmington ——— */
  const clock = (d) =>
    new Intl.DateTimeFormat('en-US', {timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit'})
      .format(d)
      .replace(/\s?([AP])M/, (m, x) => ` ${x.toLowerCase()}m`);
  const sunLine = $('[data-sunset]');
  const sayTheSun = () => {
    const s = ppw.sun(new Date());
    if (!s || !sunLine) return;
    const now = Date.now();
    if (now < s.rise.getTime()) sunLine.textContent = `Sunrise in Wilmington: ${clock(s.rise)}.`;
    else if (now < s.set.getTime()) sunLine.textContent = `Sunset in Wilmington today: ${clock(s.set)}.`;
    else sunLine.textContent = `The sun set at ${clock(s.set)} in Wilmington.`;
  };
  sayTheSun();

  /* ——— Les lumières ——— */
  const switches = $$('[data-lights]');
  const heroDay = $('.hero__day');
  const heroNight = $('.hero__night');
  const heroState = $('.hero__state');
  const visitDay = $('.visit__day');
  const visitNight = $('.visit__night');
  const themeColor = $('#theme-color');
  const ALT = {
    heroDay: heroDay.alt,
    heroNight: 'The same pool the same evening, with its pool lights on and the water glowing blue.',
    visitDay: visitDay.alt,
    visitNight: 'Prestige display pools lit up blue at night at Monkey Junction.',
  };
  // seule la photo visible est décrite aux lecteurs d'écran
  const show = (on, off, alt) => {
    on.alt = alt;
    on.removeAttribute('aria-hidden');
    off.alt = '';
    off.setAttribute('aria-hidden', 'true');
  };
  let switching = 0;
  const lights = (night, {animate = true, remember = false} = {}) => {
    if (animate && !still && night !== doc.classList.contains('night')) {
      clearTimeout(switching);
      doc.classList.remove('to-night', 'to-day');
      void doc.offsetWidth;
      doc.classList.add(night ? 'to-night' : 'to-day');
      switching = setTimeout(() => doc.classList.remove('to-night', 'to-day'), 1400);
    }
    doc.classList.toggle('night', night);
    switches.forEach((b) => b.setAttribute('aria-pressed', String(night)));
    if (night) {
      show(heroNight, heroDay, ALT.heroNight);
      show(visitNight, visitDay, ALT.visitNight);
    } else {
      show(heroDay, heroNight, ALT.heroDay);
      show(visitDay, visitNight, ALT.visitDay);
    }
    heroState.textContent = night ? 'Same pool, same evening, lights on.' : 'A Prestige pool at dusk.';
    themeColor.content = night ? '#0A1430' : '#E4EBEF';
    if (remember) store.set(night ? 'on' : 'off');
    arrange();
  };
  switches.forEach((b) => b.addEventListener('click', () => lights(!doc.classList.contains('night'), {remember: !ppw.forced})));

  // sans choix du visiteur, les lumières suivent le soleil de Wilmington, même si la page reste ouverte
  setInterval(() => {
    sayTheSun();
    if (store.get() || ppw.forced) return;
    const s = ppw.sun(new Date());
    if (!s) return;
    const t = Date.now();
    const night = t > s.set.getTime() + 12e5 || t < s.rise.getTime() - 12e5;
    if (night !== doc.classList.contains('night')) lights(night);
  }, 60e3);

  /* ——— En-tête : bordure dès qu'on défile, s'efface en descendant, revient en remontant ——— */
  const top = $('.top');
  let lastY = window.scrollY;
  const onScroll = (y) => {
    top.classList.toggle('is-scrolled', y > 8);
    if (doc.classList.contains('menu-open') || y < 560 || y < lastY - 3) top.classList.remove('is-away');
    else if (y > lastY + 3 && !top.contains(document.activeElement)) top.classList.add('is-away');
    lastY = y;
  };
  if (lenis) lenis.on('scroll', ({scroll}) => onScroll(scroll));
  window.addEventListener('scroll', () => onScroll(window.scrollY), {passive: true});
  top.addEventListener('focusin', () => top.classList.remove('is-away'));
  onScroll(window.scrollY);

  /* ——— Menu sur petit écran ——— */
  const menuBtn = $('.menu-btn');
  const menu = $('#menu');
  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    menu.hidden = !open;
    doc.classList.toggle('menu-open', open);
    // la page sous le menu ouvert ne reçoit plus le focus
    for (const el of $$('main, footer')) el.inert = open;
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && doc.classList.contains('menu-open')) {
      setMenu(false);
      menuBtn.focus();
    }
  });
  matchMedia('(min-width: 1181px)').addEventListener('change', (e) => e.matches && setMenu(false));

  // le lien de la section à l'écran
  if (io) {
    const links = new Map($$('.nav a').map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const a = links.get(e.target.id);
          if (a && e.isIntersecting) {
            links.forEach((l) => {
              l.classList.remove('is-here');
              l.removeAttribute('aria-current');
            });
            a.classList.add('is-here');
            a.setAttribute('aria-current', 'true');
          }
        }
      },
      {rootMargin: '-45% 0px -50% 0px'},
    );
    links.forEach((a, id) => {
      const s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ——— Une fois, quand l'élément arrive à l'écran ——— */
  const once = (els, fn, options) => {
    if (still || !io) return els.forEach(fn);
    const o = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          fn(e.target);
          o.unobserve(e.target);
        }
      }
    }, options);
    els.forEach((el) => o.observe(el));
  };
  // les grandes photos se découvrent ; les étapes s'allument l'une après l'autre, comme des projecteurs
  once($$('.reveal'), (el) => el.classList.add('is-in'), {threshold: 0.25});
  once($$('.steps li'), (el) => el.classList.add('is-lit'), {rootMargin: '0px 0px -30% 0px', threshold: 0.9});

  /* ——— Entrée du titre ——— */
  const ready = () => doc.classList.add('is-ready');
  if (still) ready();
  else {
    const font = document.fonts ? document.fonts.load('700 16px "Syne"').catch(() => {}) : Promise.resolve();
    // au plus 500 ms comptées depuis le début du chargement, pas depuis l'exécution de ce script
    const cap = new Promise((r) => setTimeout(r, Math.max(0, 500 - performance.now())));
    Promise.race([font, cap]).then(() => requestAnimationFrame(() => requestAnimationFrame(ready)));
  }

  /* ——— Galerie : filtres, la nuit d'abord quand les lumières sont allumées, visionneuse ——— */
  const grid = $('[data-grid]');
  const items = $$('li', grid);
  items.forEach((li, i) => (li.dataset.i = i));
  const filterBtns = $$('[data-filter]');
  const countEl = $('[data-count]');
  const moreBtn = $('[data-more]');
  // sur ordinateur, une grande photo toutes les six (trois rangées pleines), à gauche puis à droite ; sur téléphone, toutes les cinq
  const small = matchMedia('(max-width: 760px)');
  const LIMIT = () => (small.matches ? 10 : 18);
  const NAMES = {all: 'photos', rect: 'rectangular pools', free: 'freeform pools', spa: 'pools with a spa', water: 'pools by the water', night: 'pools after dark'};
  let filter = 'all';
  const visible = () => items.filter((li) => !li.hidden).sort((a, b) => a.compareDocumentPosition(b) & 4 ? -1 : 1);
  function arrange() {
    // de nuit, les photos de nuit passent en premier
    const night = doc.classList.contains('night') && filter === 'all';
    const order = [...items].sort((a, b) => (night ? (b.dataset.tags.includes('night') ? 1 : 0) - (a.dataset.tags.includes('night') ? 1 : 0) : 0) || a.dataset.i - b.dataset.i);
    order.forEach((li) => grid.appendChild(li));
    const vis = visible();
    const period = small.matches ? 5 : 6;
    vis.forEach((li, k) => {
      li.classList.toggle('is-wide', k % period === 0);
      li.classList.toggle('is-right', k % (period * 2) === period);
      li.classList.toggle('is-extra', k >= LIMIT());
    });
    moreBtn.hidden = grid.classList.contains('is-all') || vis.length <= LIMIT();
    moreBtn.textContent = `Show all ${vis.length} photos`;
  }
  small.addEventListener('change', arrange);
  filterBtns.forEach((b) =>
    b.addEventListener('click', () => {
      filter = b.dataset.filter;
      filterBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      items.forEach((li) => (li.hidden = !(filter === 'all' || li.dataset.tags.split(' ').includes(filter))));
      arrange();
      const n = visible().length;
      countEl.textContent = `${n} ${n === 1 ? NAMES[filter].replace('pools', 'pool').replace('photos', 'photo') : NAMES[filter]}`;
      if (!still) visible().forEach((li, k) => li.animate([{opacity: 0, transform: 'translateY(10px)'}, {opacity: 1, transform: 'none'}], {duration: 500, delay: Math.min(k, 12) * 28, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'}));
    }),
  );
  moreBtn.addEventListener('click', () => {
    grid.classList.add('is-all');
    moreBtn.hidden = true;
    const next = visible()[LIMIT()];
    if (next) $('button', next).focus({preventScroll: true});
  });

  const box = $('[data-box]');
  const boxImg = $('[data-box-img]');
  const boxCap = $('[data-box-cap]');
  const boxN = $('[data-box-n]');
  let shown = [];
  let at = 0;
  let opener = null;
  const showAt = (i) => {
    at = (i + shown.length) % shown.length;
    const img = $('img', shown[at]);
    // la photo entière, pas la version réduite choisie pour la vignette
    boxImg.src = img.getAttribute('src');
    boxImg.alt = img.alt;
    boxCap.textContent = img.alt;
    boxN.textContent = `${at + 1} of ${shown.length}`;
    if (!still) boxImg.animate([{opacity: 0.4}, {opacity: 1}], {duration: 300});
  };
  items.forEach((li) =>
    $('button', li).addEventListener('click', (e) => {
      shown = visible();
      opener = e.currentTarget;
      showAt(shown.indexOf(li));
      box.showModal();
      if (lenis) lenis.stop();
    }),
  );
  box.addEventListener('close', () => {
    if (lenis) lenis.start();
    if (opener) opener.focus();
  });
  $('[data-box-prev]').addEventListener('click', () => showAt(at - 1));
  $('[data-box-next]').addEventListener('click', () => showAt(at + 1));
  $('[data-box-close]').addEventListener('click', () => box.close());
  box.addEventListener('click', (e) => {
    if (e.target === box || e.target.classList.contains('box__fig')) box.close();
  });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showAt(at - 1);
    if (e.key === 'ArrowRight') showAt(at + 1);
  });
  let startX = null;
  box.addEventListener('pointerdown', (e) => (startX = e.clientX));
  box.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 60) showAt(at + (dx < 0 ? 1 : -1));
  });

  /* ——— La couleur des projecteurs ——— */
  const hueImgs = $$('[data-hue]');
  const pickHue = (v) =>
    hueImgs.forEach((img) => {
      const on = img.dataset.hue === v;
      img.classList.toggle('is-on', on);
      img.toggleAttribute('aria-hidden', !on);
      if (on) img.loading = 'eager';
    });
  $$('input[name="hue"]').forEach((r) => r.addEventListener('change', () => r.checked && pickHue(r.value)));
  pickHue($('input[name="hue"]:checked').value);
  // les deux autres couleurs se chargent dès que la bande de nuit approche, pour que le changement soit instantané
  once([$('.dark')], () => hueImgs.forEach((img) => (img.loading = 'eager')), {rootMargin: '600px 0px'});

  /* ——— Formulaire : vérifie, puis prépare le courriel (ventes, ou service pour une piscine déjà posée) ——— */
  const form = $('[data-form]');
  const err = $('#f-error');
  const note = $('[data-note]');
  const TOPICS = {
    pool: ['sales.ppow@gmail.com', 'New pool request', 'A new pool'],
    spa: ['sales.ppow@gmail.com', 'Spa or hot tub request', 'A spa or hot tub'],
    outdoor: ['sales.ppow@gmail.com', 'Outdoor living request', 'Outdoor living'],
    service: ['service.ppow@gmail.com', 'Service request', 'Service for my Prestige pool'],
  };
  const topic = () => form.elements.topic.value;
  const sayWhere = () => (note.textContent = `Opens your email app with the request written out, ready to send to ${TOPICS[topic()][0]}.`);
  $$('input[name="topic"]', form).forEach((r) => r.addEventListener('change', sayWhere));
  $$('[data-topic]').forEach((a) =>
    a.addEventListener('click', () => {
      const r = form.querySelector(`input[name="topic"][value="${a.dataset.topic}"]`);
      if (r) {
        r.checked = true;
        sayWhere();
      }
    }),
  );
  const and = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (n) => form.elements[n].value.trim();
    const checks = [
      ['first', () => v('first') !== '', 'your first name'],
      ['last', () => v('last') !== '', 'your last name'],
      ['email', () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')), 'a valid email address'],
      ['phone', () => v('phone').replace(/\D/g, '').length >= 10, 'a phone number with its area code'],
    ];
    const bad = checks.filter(([n, ok]) => {
      const fail = !ok();
      const el = form.elements[n];
      el.setAttribute('aria-invalid', String(fail));
      // le champ en erreur renvoie au message qui dit quoi corriger
      if (fail) el.setAttribute('aria-describedby', 'f-error');
      else el.removeAttribute('aria-describedby');
      return fail;
    });
    if (bad.length) {
      err.textContent = `To send your request, add ${and(bad.map((b) => b[2]))}.`;
      err.hidden = false;
      form.elements[bad[0][0]].focus();
      return;
    }
    err.hidden = true;
    const [to, subject, label] = TOPICS[topic()];
    const lines = [`Name: ${v('first')} ${v('last')}`, `Email: ${v('email')}`, `Phone: ${v('phone')}`, `Planning: ${label}`, v('where') ? `Where: ${v('where')}` : ''].filter(Boolean);
    if (v('msg')) lines.push('', v('msg'));
    // un vrai lien cliqué : la messagerie s'ouvre comme pour n'importe quel lien mailto
    const a = document.createElement('a');
    a.href = `mailto:${to}?subject=${encodeURIComponent(`${subject} from ${v('first')} ${v('last')}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
    a.hidden = true;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') {
      e.target.removeAttribute('aria-invalid');
      e.target.removeAttribute('aria-describedby');
    }
  });

  /* ——— Ouvert ou fermé, à l'heure de Wilmington ——— */
  const openEl = $('[data-open]');
  try {
    const parts = new Intl.DateTimeFormat('en-US', {timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'}).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const mins = (Number(get('hour')) % 24) * 60 + Number(get('minute'));
    const day = get('weekday');
    const open = (day === 'Sat' && mins >= 600 && mins < 840) || (!['Sat', 'Sun'].includes(day) && mins >= 480 && mins < 1020);
    openEl.textContent = open ? 'Open now' : 'Closed now';
    openEl.classList.toggle('is-open', open);
  } catch (_) {
    /* sans fuseau horaire, on n'affiche rien */
  }

  lights(doc.classList.contains('night'), {animate: false});
})();
