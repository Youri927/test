/* Feely Developments : l'enfilade (la maison avance de côté quand on défile), la frise, les détails montrés dans leur
   photo, le menu, la date de réponse, la demande de rendez-vous. */
(() => {
  'use strict';
  const d = document;
  const root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const motion = root.classList.contains('motion');

  /* ——— les photos du fichier unique : chacune est intégrée une fois (window.__IMG) et posée ici ——— */
  const IMG = window.__IMG || null;
  if (IMG) for (const i of $$('img[data-k]')) i.src = IMG[i.dataset.k] || '';

  const top = $('[data-top]');
  const stage = $('[data-stage]');
  const view = $('[data-view]');
  const track = $('[data-track]');
  const rooms = $$('[data-room]');
  const roomOf = (el) => (el && el.closest('[data-room]')) || null;

  /* ——— l'enfilade, ou la page de haut en bas ———
     L'enfilade : la page garde un défilement vertical natif (clavier, barre, recherche, lecteurs d'écran), sur une
     hauteur égale à la longueur de la maison ; la vue reste collée en haut, et la maison avance de côté d'autant. */
  const HQ = matchMedia(
    '(min-width: 1000px) and (min-height: 560px) and (min-aspect-ratio: 5/4) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  );
  let H = root.classList.contains('h');
  let maxX = 0;
  let x = 0;
  let plates = [];

  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({lerp: 0.09, smoothWheel: true, gestureOrientation: H ? 'both' : 'vertical'});
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
  const scrollY0 = () => window.scrollY || root.scrollTop;
  // pendant un trajet demandé (un lien), un report de la vue arrivé en retard ne doit pas l'interrompre
  let going = false;
  const jump = (y, smooth = true) => {
    const dist = Math.abs(y - scrollY0());
    if (lenis) {
      if (smooth) {
        going = true;
        lenis.scrollTo(y, {duration: clamp(0.8 + dist / 6000, 0.8, 2.2), onComplete: () => (going = false)});
      } else lenis.scrollTo(y, {immediate: true, force: true});
    } else window.scrollTo({top: y, behavior: smooth && motion ? 'smooth' : 'auto'});
  };

  // les grandes photos : leur place dans la maison, pour le léger décalage de l'image dans son cadre
  const measurePlates = () => {
    plates = $$('.plate').map((p) => {
      const frame = $('.plate__frame', p);
      const img = $('img', frame);
      return {p, frame, img, left: offsetIn(frame), w: frame.offsetWidth, ps: p.dataset.plate === 'house' ? 1.04 : 1.07};
    });
  };
  // la position d'un élément dans la maison (le long de l'enfilade)
  const offsetIn = (el) => {
    let l = 0;
    for (let e = el; e && e !== track; e = e.offsetParent) l += e.offsetLeft;
    return l;
  };

  const measure = () => {
    if (!H) return;
    const w = track.scrollWidth;
    maxX = Math.max(0, w - innerWidth);
    stage.style.setProperty('--stage-h', `${maxX + innerHeight}px`);
    measurePlates();
    measureLazy();
    render(scrollY0());
  };

  let lazy = [];
  const measureLazy = () => {
    lazy = $$('img[loading="lazy"]', track).map((img) => ({img, left: offsetIn(img)}));
  };
  const render = (y) => {
    if (!H) return;
    x = clamp(y, 0, maxX);
    track.style.transform = `translate3d(${-x}px,0,0)`;
    // les photos différées se chargent un écran et demi avant d'entrer (la vue les cache au navigateur)
    if (lazy.length) {
      const ahead = x + innerWidth * 2.5;
      lazy = lazy.filter((t) => (t.left < ahead ? ((t.img.loading = 'eager'), false) : true));
    }
    // l'image glisse un peu moins vite que son cadre
    const vw = innerWidth;
    for (const t of plates) {
      const c = t.left + t.w / 2 - x - vw / 2;
      if (Math.abs(c) > vw * 1.6) continue;
      const amp = ((t.ps - 1) / 2) * t.w;
      t.img.style.setProperty('--ps', t.ps);
      t.img.style.setProperty('--px', `${(clamp(-c / vw, -1, 1) * amp * 0.92).toFixed(1)}px`);
    }
    markFollow();
    current();
  };

  const onScroll = () => {
    const y = lenis ? lenis.scroll : scrollY0();
    if (H) render(y);
    else {
      hideTop(y);
      current();
    }
  };
  if (lenis) lenis.on('scroll', onScroll);
  else addEventListener('scroll', onScroll, {passive: true});

  // quand le navigateur fait défiler la vue de côté (le focus du clavier, la recherche dans la page), on reporte ce
  // décalage sur le défilement de la page, et la vue revient à zéro
  view.addEventListener('scroll', () => {
    if (!H) return;
    const dx = view.scrollLeft;
    const dy = view.scrollTop;
    if (!dx && !dy) return;
    view.scrollLeft = 0;
    view.scrollTop = 0;
    if (!going) jump(clamp(x + dx, 0, maxX), false);
  });

  // les flèches gauche et droite avancent aussi, sauf dans un champ
  addEventListener('keydown', (e) => {
    if (!H || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const t = e.target;
    if (t.closest && t.closest('input, textarea, select, [contenteditable]')) return;
    e.preventDefault();
    jump(clamp(x + (e.key === 'ArrowRight' ? 1 : -1) * innerWidth * 0.32, 0, maxX));
  });

  const setMode = (on) => {
    const here = currentRoom();
    H = on;
    root.classList.toggle('h', on);
    if (lenis) lenis.options.gestureOrientation = on ? 'both' : 'vertical';
    if (!on) {
      track.style.transform = '';
      stage.style.removeProperty('--stage-h');
      for (const t of plates) {
        t.img.style.removeProperty('--px');
        t.img.style.removeProperty('--ps');
      }
    }
    requestAnimationFrame(() => {
      measure();
      if (here) jump(targetOf(here), false);
      observe();
      if (on) checkFit();
    });
  };
  HQ.addEventListener('change', () => setMode(HQ.matches));
  let rT = 0;
  addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(() => {
      // une fenêtre agrandie peut de nouveau tenir l'enfilade
      if (!H && HQ.matches) return setMode(true);
      if (!H) return;
      const ratio = maxX ? x / maxX : 0;
      measure();
      jump(ratio * maxX, false);
    }, 120);
  });

  // si le texte grandit (zoom du texte, espacement élargi) au point de ne plus tenir dans la hauteur d'une pièce,
  // l'enfilade cède la place à la page de haut en bas : rien ne doit être coupé par le bas de l'écran
  const overflows = () => {
    const vh = innerHeight;
    return $$('.room *', track).some((el) => {
      if (el.closest('svg') || el.matches('.plate__mark') || !el.getClientRects().length) return false;
      const r = el.getBoundingClientRect();
      return r.height > 0 && r.bottom > vh + 1;
    });
  };
  let fitT = 0;
  const checkFit = () => {
    clearTimeout(fitT);
    fitT = setTimeout(() => {
      if (H && overflows()) setMode(false);
    }, 150);
  };
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(checkFit);
    for (const el of $$('.room :is(h1, h2, h3, p, li, dt, dd, label, legend, figcaption, form, .wall)', track)) ro.observe(el);
  }

  /* ——— aller à une pièce ——— */
  const targetOf = (el) => {
    const room = roomOf(el) || el;
    if (H) return room.id === 'design' ? 0 : clamp(room.offsetLeft, 0, maxX);
    if (room.id === 'design') return 0;
    return Math.max(0, el.getBoundingClientRect().top + scrollY0() - top.offsetHeight - 12);
  };
  const goTo = (el, focus) => {
    if (!el) return;
    jump(targetOf(el));
    if (focus) {
      // au clavier, le focus passe au titre de la pièce
      const h = el.matches('h1, h2, h3') ? el : $('h2, h1', roomOf(el) || el);
      if (h) {
        if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
        setTimeout(() => h.focus({preventScroll: true}), H ? 60 : 0);
      }
    }
  };

  d.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (id === 'main') return; // le lien d'évitement garde son comportement
    const t = id && d.getElementById(id);
    if (!t) return;
    e.preventDefault();
    if (menuOpen()) closeMenu(false);
    if (a.dataset.topic) pickTopic(a.dataset.topic);
    goTo(t, e.detail === 0);
    if (a.dataset.topic && e.detail === 0) setTimeout(() => $(`input[value="${a.dataset.topic}"]`).focus({preventScroll: true}), 80);
  });

  /* ——— la pièce en cours : la barre sous son nom, dans le menu ——— */
  const navLinks = $$('[data-nav]');
  const navBar = $('.top__bar');
  let curId = '';
  const currentRoom = () => {
    if (H) {
      const c = x + innerWidth * 0.5;
      return rooms.find((r) => r.offsetLeft <= c && r.offsetLeft + r.offsetWidth > c) || rooms[0];
    }
    const c = innerHeight * 0.45;
    return rooms.find((r) => {
      const b = r.getBoundingClientRect();
      return b.top <= c && b.bottom > c;
    });
  };
  // la barre se pose sous un lien du menu (la pièce en cours, ou celui que la souris survole)
  const barTo = (a) => {
    if (!navBar) return;
    if (a) {
      navBar.style.width = `${a.offsetWidth - 24}px`;
      navBar.style.transform = `translateX(${a.parentElement.offsetLeft + 12}px)`;
      navBar.classList.add('is-on');
    } else navBar.classList.remove('is-on');
  };
  let hovered = null;
  const current = () => {
    const r = currentRoom();
    const id = r ? r.id : '';
    if (id === curId) return;
    curId = id;
    for (const a of navLinks) {
      if (a.dataset.nav === id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    }
    if (!hovered) barTo($('[data-nav][aria-current]'));
  };
  for (const a of navLinks) {
    a.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      hovered = a;
      barTo(a);
    });
  }
  const navEl = $('.top__nav');
  if (navEl)
    navEl.addEventListener('pointerleave', () => {
      hovered = null;
      barTo($('[data-nav][aria-current]'));
    });

  /* ——— l'en-tête se range quand on descend (page de haut en bas) ——— */
  let lastY = 0;
  const hideTop = (y) => {
    const down = y > lastY + 4;
    const up = y < lastY - 4;
    if (down && y > 160 && !menuOpen() && !top.contains(d.activeElement)) top.classList.add('is-hidden');
    else if (up || y < 160) top.classList.remove('is-hidden');
    if (down || up) lastY = y;
  };
  top.addEventListener('focusin', () => top.classList.remove('is-hidden'));

  /* ——— le menu du téléphone ——— */
  const menuBtn = $('.menu-btn');
  const menu = $('#menu');
  const menuOpen = () => menuBtn.getAttribute('aria-expanded') === 'true';
  const closeMenu = (refocus = true) => {
    menuBtn.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    stage.inert = false;
    if (lenis) lenis.start();
    if (refocus) menuBtn.focus();
  };
  menuBtn.addEventListener('click', () => {
    if (menuOpen()) return closeMenu();
    menuBtn.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    stage.inert = true;
    top.classList.remove('is-hidden');
    if (lenis) lenis.stop();
    $('a', menu).focus();
  });
  d.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen()) closeMenu();
  });
  addEventListener('resize', () => {
    if (menuOpen() && innerWidth >= 760) closeMenu(false);
  });

  /* ——— la frise et les photos apparaissent une fois, en entrant dans l'écran ——— */
  let io = null;
  const observe = () => {
    if (!motion) return;
    if (io) io.disconnect();
    io = new IntersectionObserver(
      (entries) => {
        for (const en of entries)
          if (en.isIntersecting) {
            en.target.classList.add('is-seen');
            io.unobserve(en.target);
          }
      },
      {threshold: 0.12, rootMargin: H ? '0px -4% 0px 0px' : '0px 0px -8% 0px'},
    );
    for (const el of $$('.frieze, .meet__title, .plate, .details')) if (!el.classList.contains('is-seen')) io.observe(el);
  };
  // on attend les polices (une seconde au plus), pour que la frise ne monte pas dans la police de secours
  Promise.race([d.fonts ? d.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1000))]).then(() => {
    measure();
    current();
    observe();
    checkFit();
  });
  addEventListener('load', measure);

  /* ——— les détails : au survol, leur place dans la grande photo ——— */
  let marked = null;
  const placeMark = (li) => {
    const plate = $(`.plate[data-plate="${li.dataset.for}"]`);
    if (!plate) return;
    const frame = $('.plate__frame', plate);
    const mark = $('.plate__mark', frame);
    const [x0, y0, x1, y1] = li.dataset.place.split(',').map(Number);
    const w = frame.clientWidth;
    const h = frame.clientHeight;
    const img = $('img', frame);
    const ps = +(img.style.getPropertyValue('--ps') || 1);
    const px = parseFloat(img.style.getPropertyValue('--px')) || 0;
    // l'image est agrandie de ps autour de son centre et décalée de px : le cadre suit
    const ox = (w / 2) * (1 - ps) + px;
    const oy = (h / 2) * (1 - ps);
    mark.style.left = `${ox + x0 * ps * w}px`;
    mark.style.top = `${oy + y0 * ps * h}px`;
    mark.style.width = `${(x1 - x0) * ps * w}px`;
    mark.style.height = `${(y1 - y0) * ps * h}px`;
    mark.classList.add('is-on');
    marked = li;
  };
  const markFollow = () => {
    if (marked) placeMark(marked);
  };
  for (const li of $$('.details li[data-for]')) {
    li.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') placeMark(li);
    });
    li.addEventListener('pointerleave', () => {
      const plate = $(`.plate[data-plate="${li.dataset.for}"]`);
      if (plate) $('.plate__mark', plate).classList.remove('is-on');
      marked = null;
    });
  }

  /* ——— la date de réponse : cinq jours ouvrés, à l'heure de Winter Park ———
     Sans les samedis, les dimanches et les grands jours fériés (Nouvel An, Memorial Day, 4 Juillet, Labor Day,
     Thanksgiving, Noël, reportés au vendredi ou au lundi quand ils tombent un week-end). */
  const reply = $('[data-reply]');
  if (reply) {
    const nthWeekday = (y, m, wd, n) => {
      const first = new Date(Date.UTC(y, m, 1)).getUTCDay();
      return 1 + ((wd - first + 7) % 7) + (n - 1) * 7;
    };
    const lastWeekday = (y, m, wd) => {
      const last = new Date(Date.UTC(y, m + 1, 0));
      return last.getUTCDate() - ((last.getUTCDay() - wd + 7) % 7);
    };
    const observed = (y, m, day) => {
      const wd = new Date(Date.UTC(y, m, day)).getUTCDay();
      const dt = new Date(Date.UTC(y, m, day + (wd === 6 ? -1 : wd === 0 ? 1 : 0)));
      return dt.toISOString().slice(0, 10);
    };
    const holidays = (y) =>
      new Set([
        observed(y, 0, 1),
        new Date(Date.UTC(y, 4, lastWeekday(y, 4, 1))).toISOString().slice(0, 10),
        observed(y, 6, 4),
        new Date(Date.UTC(y, 8, nthWeekday(y, 8, 1, 1))).toISOString().slice(0, 10),
        new Date(Date.UTC(y, 10, nthWeekday(y, 10, 4, 4))).toISOString().slice(0, 10),
        observed(y, 11, 25),
        observed(y + 1, 0, 1), // le Nouvel An suivant peut tomber le 31 décembre
      ]);
    try {
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric'})
          .formatToParts(new Date())
          .map((p) => [p.type, p.value]),
      );
      const day = new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day));
      let n = 0;
      while (n < 5) {
        day.setUTCDate(day.getUTCDate() + 1);
        const wd = day.getUTCDay();
        if (wd !== 0 && wd !== 6 && !holidays(day.getUTCFullYear()).has(day.toISOString().slice(0, 10))) n++;
      }
      const opts = {timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric'};
      if (day.getUTCFullYear() !== +parts.year) opts.year = 'numeric';
      const when = new Intl.DateTimeFormat('en-US', opts).format(day);
      reply.textContent = 'Send it today and we’ll get back to you by ';
      const s = d.createElement('strong');
      s.textContent = when;
      reply.append(s, ', within five business days.');
    } catch (err) {
      /* la phrase d'origine reste : « within five business days » */
    }
  }

  /* ——— la demande de rendez-vous : elle s'écrit dans la messagerie du visiteur ——— */
  const form = $('[data-form]');
  const topics = $('[data-topics]');
  const sent = $('[data-sent]');
  const MAIL = 'FeelyDev@gmail.com';
  const TOPIC = {home: 'a custom home', remodel: 'a remodel', palmer: 'the villa on Palmer Avenue'};
  const pickTopic = (v) => {
    const r = $(`input[name="topic"][value="${v}"]`, form);
    if (!r) return;
    r.checked = true;
    topics.classList.remove('is-flash');
    void topics.offsetWidth;
    topics.classList.add('is-flash');
  };
  const RULES = {
    name: (v) => (v ? '' : 'Enter your name.'),
    email: (v) =>
      !v ? 'Enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Check your email address. It should look like name@example.com.',
  };
  const check = (name) => {
    const input = form.elements[name];
    const msg = RULES[name](input.value.trim());
    const err = $(`#e-${name}`);
    err.textContent = msg;
    err.hidden = !msg;
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    return !msg;
  };
  for (const name of Object.keys(RULES))
    form.elements[name].addEventListener('blur', () => {
      if (form.elements[name].hasAttribute('aria-invalid')) check(name);
    });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = Object.keys(RULES).filter((n) => !check(n));
    if (bad.length) {
      form.elements[bad[0]].focus();
      return;
    }
    const f = form.elements;
    const topic = TOPIC[f.topic.value] || TOPIC.home;
    const lines = [
      `Hello Ryan,`,
      ``,
      `I'd like to meet with you about ${topic}.`,
      f.message.value.trim() ? `\n${f.message.value.trim()}\n` : ``,
      `Name: ${f.name.value.trim()}`,
      `Email: ${f.email.value.trim()}`,
      f.phone.value.trim() ? `Phone: ${f.phone.value.trim()}` : ``,
    ].filter((l, i, a) => !(l === `` && a[i - 1] === ``));
    const subject = `Meeting request: ${topic}`;
    const href = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    sent.dataset.mailto = href;
    sent.innerHTML = '';
    sent.append(
      'Your email app should open with your message to Ryan. If nothing opens, write to ',
      Object.assign(d.createElement('a'), {href: `mailto:${MAIL}`, textContent: MAIL}),
      ' or call ',
      Object.assign(d.createElement('a'), {href: 'tel:+13216631433', textContent: '(321) 663-1433'}),
      '.',
    );
    sent.hidden = false;
    sent.focus({preventScroll: true});
    location.href = href;
  });
})();
