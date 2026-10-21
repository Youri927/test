/* Stellar Living Homes : l'ouverture, la visite, les avis par sujet, la visionneuse, la demande d'estimation. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  root.classList.add('js');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 1100px)');

  /* ——— le défilement : Lenis, sauf en mouvement réduit ——— */
  let lenis = null;
  if (!still.matches && window.Lenis) {
    lenis = new window.Lenis({lerp: 0.11, wheelMultiplier: 0.9, smoothWheel: true});
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
  const top = $('[data-top]');
  const headH = () => top.getBoundingClientRect().height;
  const goTo = (target, opts = {}) => {
    const el = typeof target === 'string' ? document.getElementById(target.replace('#', '')) : target;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - (el.id === 'top' ? 0 : opts.offset ?? 0);
    if (lenis) lenis.scrollTo(Math.max(0, y), {duration: 1.2, onComplete: opts.done});
    else {
      window.scrollTo({top: Math.max(0, y), behavior: still.matches ? 'auto' : 'smooth'});
      opts.done?.();
    }
  };
  // les liens internes passent par Lenis ; la cible prend le focus (clavier, lecteurs d'écran)
  for (const a of $$('a[href^="#"]')) {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      goTo(el, {
        done: () => {
          if (id === 'main' || id === 'top') return;
          const h = el.querySelector('h2, h1');
          if (h) {
            h.setAttribute('tabindex', '-1');
            h.focus({preventScroll: true});
          }
        },
      });
      history.replaceState(null, '', `#${id}`);
    });
  }

  /* ——— l'en-tête : il s'efface quand on descend, revient quand on remonte ——— */
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    top.classList.toggle('is-scrolled', y > 8);
    const menuOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    if (!menuOpen && !top.contains(document.activeElement)) top.classList.toggle('is-hidden', y > lastY && y > 240);
    if (y < lastY - 2 || y < 240) top.classList.remove('is-hidden');
    lastY = y;
  };
  addEventListener('scroll', onScroll, {passive: true});
  top.addEventListener('focusin', () => top.classList.remove('is-hidden'));

  /* ——— la partie de la page où l'on est, marquée dans le menu ——— */
  const navLinks = $$('.nav a');
  const NAV_OF = {walk: '#walk', work: '#walk', reviews: '#reviews', services: '#services', about: '#about'};
  const here = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const target = NAV_OF[e.target.id];
        for (const a of navLinks) {
          if (a.getAttribute('href') === target) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        }
      }
    },
    {rootMargin: '-45% 0px -50% 0px'},
  );
  for (const id of ['top', 'walk', 'work', 'reviews', 'services', 'about', 'contact']) here.observe(document.getElementById(id));

  /* ——— le menu du téléphone ——— */
  const menuBtn = $('[data-menu-btn]');
  const menu = $('[data-menu]');
  function closeMenu() {
    if (menuBtn.getAttribute('aria-expanded') !== 'true') return;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = 'Menu';
    menu.hidden = true;
    root.style.overflow = '';
    lenis?.start();
  }
  menuBtn.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') !== 'true';
    if (!open) return closeMenu();
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.textContent = 'Close';
    menu.hidden = false;
    top.classList.remove('is-hidden');
    // la page ne défile plus derrière le menu ; le focus va au premier lien
    root.style.overflow = 'hidden';
    lenis?.stop();
    menu.querySelector('a').focus();
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuBtn.focus();
    }
  });
  wide.addEventListener('change', closeMenu);

  /* ——— l'ouverture : la photo se découvre, l'avis paraît en pâle, quatre passages passent à l'encre ——— */
  const hero = $('.hero');
  const start = () => requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-in')));
  if (document.fonts && document.fonts.status !== 'loaded') Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(start);
  else start();

  /* ——— titres et grandes photos : une fois, en entrant à l'écran ——— */
  for (const r of $$('.rise')) {
    const inner = document.createElement('span');
    while (r.firstChild) inner.appendChild(r.firstChild);
    r.appendChild(inner);
  }
  const seen = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        seen.unobserve(e.target);
      }
    },
    {rootMargin: '0px 0px -12% 0px'},
  );
  for (const el of $$('.title, .reveal')) seen.observe(el);

  /* ——— la visite : sur ordinateur, la section se fige et la rangée avance quand on descend ——— */
  const walk = $('[data-walk]');
  const view = $('[data-walk-view]');
  const track = $('[data-walk-track]');
  const stops = $$('.stop', track);
  const nowTime = $('[data-now-time]');
  const nowRoom = $('[data-now-room]');
  let dist = 0;
  let current = -1;
  let walkTop = 0;
  const setCurrent = (i) => {
    if (i === current) return;
    current = i;
    stops.forEach((s, k) => s.classList.toggle('is-current', k === i));
    nowTime.textContent = stops[i].dataset.time;
    nowRoom.textContent = stops[i].dataset.room;
  };
  const measure = () => {
    const pin = !still.matches && wide.matches;
    walk.classList.toggle('is-pinned', pin);
    track.style.transform = '';
    if (!pin) {
      walk.style.removeProperty('--walk-dist');
      return;
    }
    // la rangée défile jusqu'à ce que la dernière photo arrive au bord gauche de la zone des photos
    const last = stops[stops.length - 1];
    dist = Math.max(0, last.offsetLeft + last.offsetWidth - view.clientWidth + 48);
    walk.style.setProperty('--walk-dist', `${dist}px`);
    walkTop = walk.getBoundingClientRect().top + window.scrollY;
    drawWalk();
  };
  const drawWalk = () => {
    if (!walk.classList.contains('is-pinned')) return;
    const p = Math.min(1, Math.max(0, (window.scrollY - walkTop) / (dist || 1)));
    const x = p * dist;
    track.style.transform = `translate3d(${(-x).toFixed(2)}px, 0, 0)`;
    // la pièce en cours : la plus proche d'un point qui glisse du bord gauche de la zone des photos (au début) vers son
    // bord droit (à la fin), pour que la première et la dernière photo soient chacune « en cours » à leur tour
    const focus = x + view.clientWidth * (0.18 + 0.64 * p);
    let i = 0;
    let best = Infinity;
    stops.forEach((s, k) => {
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - focus);
      if (d < best) (best = d), (i = k);
    });
    setCurrent(i);
  };
  setCurrent(0);
  addEventListener('scroll', drawWalk, {passive: true});
  addEventListener('resize', measure);
  wide.addEventListener('change', measure);
  still.addEventListener('change', measure);
  addEventListener('load', measure);
  measure();
  // sur téléphone, la rangée qu'on fait défiler au doigt garde la même pièce en cours
  track.addEventListener(
    'scroll',
    () => {
      if (walk.classList.contains('is-pinned')) return;
      const x = track.scrollLeft + 20;
      let i = 0;
      stops.forEach((s, k) => {
        if (s.offsetLeft - track.offsetLeft <= x) i = k;
      });
      setCurrent(i);
    },
    {passive: true},
  );

  /* ——— les avis : un sujet choisi fait ressortir les passages qui en parlent ——— */
  const TOPICS = {
    time: 'time and budget',
    care: 'care for the home',
    talk: 'communication',
    advice: 'advice and ideas',
    storm: 'storm repairs',
    again: 'hiring them again',
  };
  const NUM = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  const revs = $('[data-revs]');
  const items = $$('.rev', revs);
  const status = $('[data-status]');
  const buttons = $$('[data-topic]');
  const pick = (topic) => {
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.topic === topic));
    if (topic === 'all') {
      revs.classList.remove('is-on');
      for (const m of $$('mark', revs)) m.classList.remove('is-hit');
      for (const r of items) r.classList.remove('is-miss');
      status.textContent = 'All twelve reviews.';
      return;
    }
    let n = 0;
    for (const r of items) {
      let hit = false;
      for (const m of $$('mark', r)) {
        const on = m.dataset.t.split(' ').includes(topic);
        m.classList.toggle('is-hit', on);
        hit = hit || on;
      }
      r.classList.toggle('is-miss', !hit);
      if (hit) n += 1;
    }
    revs.classList.add('is-on');
    const word = NUM[n] ?? String(n);
    status.textContent = `${word[0].toUpperCase()}${word.slice(1)} of the twelve reviews ${n === 1 ? 'talks' : 'talk'} about ${TOPICS[topic]}.`;
  };
  for (const b of buttons) b.addEventListener('click', () => pick(b.dataset.topic));
  // depuis les prestations : on descend aux avis, le sujet déjà choisi
  for (const b of $$('[data-goto-topic]')) {
    b.addEventListener('click', () => {
      pick(b.dataset.gotoTopic);
      const target = $(`[data-topic="${b.dataset.gotoTopic}"]`);
      goTo($('#reviews .topics'), {offset: headH() + 24, done: () => target.focus({preventScroll: true})});
    });
  }

  /* ——— la visionneuse : les photos d'un reportage, dans l'ordre de prise de vue ——— */
  const viewer = $('[data-viewer]');
  const vTrack = $('[data-v-track]');
  const vTitle = $('[data-v-title]');
  const vCount = $('[data-v-count]');
  const vPrev = $('[data-v-prev]');
  const vNext = $('[data-v-next]');
  let vIndex = 0;
  let vTotal = 0;
  let opener = null;
  const vShow = (i, smooth = true) => {
    vIndex = Math.max(0, Math.min(vTotal - 1, i));
    const li = vTrack.children[vIndex];
    if (li) vTrack.scrollTo({left: li.offsetLeft, behavior: smooth && !still.matches ? 'smooth' : 'auto'});
    vCount.textContent = `${vIndex + 1} of ${vTotal}`;
    vPrev.disabled = vIndex === 0;
    vNext.disabled = vIndex === vTotal - 1;
  };
  const vOpen = (set, at = 1, from = null) => {
    const tpl = document.getElementById(`set-${set}`);
    if (!tpl) return;
    opener = from;
    vTrack.replaceChildren(tpl.content.cloneNode(true));
    vTitle.textContent = tpl.dataset.title;
    vTotal = vTrack.children.length;
    // les photos voisines se chargent d'abord
    $$('img', vTrack).forEach((img, k) => {
      if (Math.abs(k - (at - 1)) <= 1) img.loading = 'eager';
    });
    viewer.showModal();
    lenis?.stop();
    root.style.overflow = 'hidden';
    requestAnimationFrame(() => vShow(at - 1, false));
    $('[data-v-close]').focus({preventScroll: true});
  };
  viewer.addEventListener('close', () => {
    lenis?.start();
    root.style.overflow = '';
    vTrack.replaceChildren();
    opener?.focus({preventScroll: true});
  });
  $('[data-v-close]').addEventListener('click', () => viewer.close());
  vPrev.addEventListener('click', () => vShow(vIndex - 1));
  vNext.addEventListener('click', () => vShow(vIndex + 1));
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') (e.preventDefault(), vShow(vIndex + 1));
    if (e.key === 'ArrowLeft') (e.preventDefault(), vShow(vIndex - 1));
    if (e.key === 'Home') (e.preventDefault(), vShow(0));
    if (e.key === 'End') (e.preventDefault(), vShow(vTotal - 1));
  });
  // au doigt, la photo arrêtée devient la photo en cours
  let settle = 0;
  vTrack.addEventListener(
    'scroll',
    () => {
      clearTimeout(settle);
      settle = setTimeout(() => {
        const i = Math.round(vTrack.scrollLeft / Math.max(1, vTrack.clientWidth));
        if (i !== vIndex) {
          vIndex = i;
          vCount.textContent = `${vIndex + 1} of ${vTotal}`;
          vPrev.disabled = vIndex === 0;
          vNext.disabled = vIndex === vTotal - 1;
        }
        const next = vTrack.children[vIndex + 1]?.querySelector('img');
        if (next) next.loading = 'eager';
      }, 90);
    },
    {passive: true},
  );
  // un clic sur le fond (hors photo) referme
  viewer.addEventListener('click', (e) => {
    if (e.target === viewer || e.target.tagName === 'LI') viewer.close();
  });
  for (const b of $$('[data-set]')) b.addEventListener('click', () => vOpen(b.dataset.set, +(b.dataset.at || 1), b));

  /* ——— la demande : vérifiée ici, puis écrite dans un e-mail adressé à Stellar Living Homes ——— */
  const form = $('[data-form]');
  const done = $('[data-done]');
  const fail = (input, msg) => {
    const err = document.getElementById(input.getAttribute('aria-describedby'));
    input.setAttribute('aria-invalid', 'true');
    err.textContent = msg;
    err.hidden = false;
  };
  const ok = (input) => {
    const err = document.getElementById(input.getAttribute('aria-describedby'));
    input.removeAttribute('aria-invalid');
    err.hidden = true;
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements;
    const name = f.name.value.trim();
    const phone = f.phone.value.trim();
    const mail = f.email.value.trim();
    let first = null;
    if (!name) (fail(f.name, 'Enter your name.'), (first = first || f.name));
    else ok(f.name);
    ok(f.phone);
    ok(f.email);
    if (!phone && !mail) {
      fail(f.phone, 'Enter a phone number or an email, so we can reach you.');
      first = first || f.phone;
    } else {
      if (phone && phone.replace(/\D/g, '').length < 10) (fail(f.phone, 'Check the phone number: it should have 10 digits, like 239-555-0142.'), (first = first || f.phone));
      if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) (fail(f.email, 'Check the email address: it should look like name@example.com.'), (first = first || f.email));
    }
    if (first) return first.focus();
    const lines = [`Name: ${name}`];
    if (phone) lines.push(`Phone: ${phone}`);
    if (mail) lines.push(`Email: ${mail}`);
    lines.push(`Project: ${f.kind.value}`);
    if (f.where.value.trim()) lines.push(`Where: ${f.where.value.trim()}`);
    lines.push('', f.message.value.trim() || '(No details yet.)');
    const subject = `Free estimate request: ${f.kind.value}${f.where.value.trim() ? `, ${f.where.value.trim()}` : ''}`;
    location.href = `mailto:dpalmeri100@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    done.textContent = 'Your email app should open with your request written out. If it didn’t, email dpalmeri100@gmail.com or call 908-507-2088.';
    done.hidden = false;
    done.focus();
  });
  for (const input of [form.elements.name, form.elements.phone, form.elements.email]) input.addEventListener('input', () => input.getAttribute('aria-invalid') && ok(input));

  const yearNow = $('[data-year-now]');
  if (yearNow) yearNow.textContent = String(new Date().getFullYear());
})();
