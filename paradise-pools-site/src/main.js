/* Paradise Pools of Tampa Bay : interactions de la maquette.
   GSAP + ScrollTrigger pour les scènes pilotées par le défilement, Lenis pour le défilement fluide.
   Seules les transformations et l'opacité s'animent. */
(() => {
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  G.registerPlugin(ST);
  const root = document.documentElement;
  const motion = !root.classList.contains('no-motion');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const inOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const out = (t) => 1 - Math.pow(1 - t, 3);
  const hdH = () => $('[data-hd]').offsetHeight;

  /* ---------- défilement fluide ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({lerp: .1, smoothWheel: true});
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const scrollTo = (target) => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - (el.id === 'top' ? 0 : hdH() * .4);
    if (lenis) lenis.scrollTo(Math.max(0, y), {duration: 1.4});
    else window.scrollTo({top: y, behavior: motion ? 'smooth' : 'auto'});
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const el = $(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollTo(el);
  });

  /* ---------- en-tête ---------- */
  const hd = $('[data-hd]');
  let lastY = 0;
  const onScrollHeader = () => {
    const y = window.scrollY;
    hd.classList.toggle('is-scrolled', y > 8);
    const menuOpen = root.classList.contains('menu-open');
    if (!menuOpen) hd.classList.toggle('is-hidden', y > lastY && y > innerHeight * .9);
    lastY = y;
  };
  window.addEventListener('scroll', onScrollHeader, {passive: true});
  const navLinks = $$('.hd__nav a');
  navLinks.forEach((a) => {
    const sec = $(a.getAttribute('href'));
    if (!sec) return;
    ST.create({trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => a.classList.toggle('is-on', s.isActive)});
  });

  /* ---------- menu mobile ---------- */
  const menu = $('[data-menu]');
  const menuBtn = $('[data-menu-btn]');
  function closeMenu() {
    if (menu.hidden) return;
    menuBtn.setAttribute('aria-expanded', 'false');
    root.classList.remove('menu-open');
    lenis && lenis.start();
    G.to(menu, {opacity: 0, duration: .3, onComplete: () => { menu.hidden = true; }});
  }
  menuBtn.addEventListener('click', () => {
    if (!menu.hidden) return closeMenu();
    menu.hidden = false;
    root.classList.add('menu-open');
    hd.classList.remove('is-hidden');
    menuBtn.setAttribute('aria-expanded', 'true');
    lenis && lenis.stop();
    G.fromTo(menu, {opacity: 0}, {opacity: 1, duration: .35});
    G.fromTo($$('nav a', menu), {yPercent: 100, opacity: 0}, {yPercent: 0, opacity: 1, duration: .8, stagger: .05, ease: 'expo.out'});
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- ouvert ou fermé, à l'heure de Tampa ---------- */
  const status = () => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false})
      .formatToParts(new Date()).map((p) => [p.type, p.value]));
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    const h = (+parts.hour % 24) + (+parts.minute) / 60;
    const hours = (d) => (d >= 1 && d <= 5 ? [9, 18] : d === 6 ? [9, 13] : null);
    const today = hours(day);
    const open = today && h >= today[0] && h < today[1];
    let text;
    if (open) text = `Open now, until ${today[1] === 18 ? '6pm' : '1pm'}`;
    else {
      let d = day;
      let label = 'today';
      if (!today || h >= today[1]) {
        for (let i = 1; i <= 7; i++) { d = (day + i) % 7; if (hours(d)) break; }
        label = d === (day + 1) % 7 ? 'tomorrow' : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d];
      }
      text = `Closed, opens ${label} at 9am`;
    }
    $$('[data-status]').forEach((el) => {
      el.classList.toggle('is-open', !!open);
      $('[data-status-text]', el).textContent = text;
    });
  };
  status();
  setInterval(status, 60000);

  /* ---------- titres découpés en lignes ---------- */
  const splitLines = (el) => {
    if (!el.dataset.src) el.dataset.src = el.textContent.trim();
    const words = el.dataset.src.split(/\s+/);
    el.textContent = '';
    const spans = words.map((w, i) => {
      const s = document.createElement('span');
      s.textContent = w + (i < words.length - 1 ? ' ' : '');
      el.appendChild(s);
      return s;
    });
    const lines = [];
    let top = null;
    spans.forEach((s) => {
      if (s.offsetTop !== top) { lines.push([]); top = s.offsetTop; }
      lines[lines.length - 1].push(s.textContent);
    });
    el.innerHTML = lines.map((l, i) => `<span class="ln" style="--i:${i}"><span>${l.join('').trim()}</span></span>`).join('');
    el.setAttribute('aria-label', el.dataset.src);
    $$('.ln', el).forEach((l) => l.setAttribute('aria-hidden', 'true'));
  };
  const linesEls = $$('[data-lines]');
  const doSplit = () => linesEls.forEach(splitLines);

  /* ---------- apparitions ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
      if (en.target.matches('.lender')) counters(en.target);
    });
  }, {rootMargin: '0px 0px -12% 0px'});

  /* ---------- compteurs (financement) ---------- */
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  function counters(scope) {
    $$('[data-count]', scope).forEach((el) => {
      const end = +el.dataset.count;
      const pre = el.dataset.prefix || '';
      if (!motion) { el.textContent = pre + fmt(end); return; }
      const o = {v: 0};
      G.to(o, {v: end, duration: 1.8, ease: 'expo.out', delay: .15, onUpdate: () => { el.textContent = pre + fmt(o.v); }});
    });
  }

  /* ---------- ouverture ---------- */
  const hero = {
    sec: $('[data-hero]'), pin: $('[data-hero-pin]'), slot: $('[data-hero-slot]'), win: $('[data-hero-win]'),
    pic: $('[data-hero-pic]'), img: $('[data-hero-img]'), wipe: $('[data-hero-wipe]'), eye: $('[data-hero-eye]'),
    note: $('[data-hero-note]'), plan: $('.hero__plan'), tags: $$('.tag'), title: $('.hero__title'), side: $('.hero__side'),
  };
  hero.tags.forEach((t) => { t.innerHTML = `<i></i><b>${t.textContent}</b>`; });
  const IMG_W = 2048;
  const IMG_H = 1152;
  const FOCUS = [1010 / IMG_W, 560 / IMG_H]; // le centre du bassin, vers lequel on « descend »
  let geo = null;
  let heroP = 0;
  let introDone = !motion;

  // le titre remplit la largeur : « built in your backyard » sur ordinateur, le plus long des deux morceaux sur mobile
  function fitHero() {
    const t = hero.title;
    t.style.setProperty('--fs', '100px');
    const inner = $('.hero__l2 > span', t);
    const w = inner.getBoundingClientRect().width;
    const avail = hero.pin.clientWidth - 2 * parseFloat(getComputedStyle(hero.pin).paddingLeft);
    const fs = Math.min(100 * avail / w * .995, innerHeight * .24);
    t.style.setProperty('--fs', fs.toFixed(2) + 'px');
    // le texte d'accompagnement s'aligne sur le bas de « Paradise, » ; s'il ne tient pas à côté, il passe dessous
    hero.sec.classList.remove('hero--stack');
    if (getComputedStyle(hero.side).position === 'absolute') {
      const l1 = $('.hero__l1', t);
      const bottom = l1.offsetTop + l1.offsetHeight * .92;
      const room = parseFloat(getComputedStyle(hero.pin).paddingTop) - hdH() - 6;
      const top = bottom - hero.side.offsetHeight;
      const l1Right = $('span', l1).getBoundingClientRect().right;
      if (top < -room || hero.side.getBoundingClientRect().left < l1Right + 32) hero.sec.classList.add('hero--stack');
      else hero.side.style.setProperty('--side-top', top + 'px');
    }
  }

  function measure() {
    const vw = hero.pin.clientWidth;
    const vh = hero.pin.clientHeight;
    const r = {x: hero.slot.offsetLeft, y: hero.slot.offsetTop, w: hero.slot.offsetWidth, h: hero.slot.offsetHeight};
    const ri = IMG_W / IMG_H;
    const picW = vw / vh > ri ? vw : vh * ri;
    const picH = picW / ri;
    hero.pic.style.width = picW + 'px';
    hero.pic.style.height = picH + 'px';
    geo = {vw, vh, r, picW, picH};
    drawHero(heroP);
  }

  function drawHero(p) {
    if (!geo) return;
    const {vw, vh, r, picW, picH} = geo;
    const e = inOut(clamp(p / .4));
    const z = 1 + .32 * inOut(clamp((p - .36) / .32));
    const X = lerp(r.x, 0, e);
    const Y = lerp(r.y, 0, e);
    const W = lerp(r.w, vw, e);
    const H = lerp(r.h, vh, e);
    const u = Math.max(W / picW, H / picH);
    const uz = u * z;
    const netX = X + (W - picW * u) / 2 - (z - 1) * u * picW * FOCUS[0];
    const netY = Y + (H - picH * u) * .5 - (z - 1) * u * picH * FOCUS[1];
    hero.win.style.width = W + 'px';
    hero.win.style.height = H + 'px';
    hero.win.style.transform = `translate(${X}px,${Y}px)`;
    hero.pic.style.transform = `translate(${netX - X}px,${netY - Y}px) scale(${uz})`;
    const k = uz * picW / IMG_W; // pixels d'écran par pixel de la photo
    hero.plan.style.setProperty('--sw', (1.7 / k).toFixed(2));
    // les repères suivent les points de la photo
    hero.tags.forEach((t) => {
      const [ix, iy] = t.dataset.pt.split(',').map(Number);
      t.style.transform = `translate(${netX + ix * k}px,${netY + iy * k}px)`;
    });
    if (introDone) {
      const tagA = 1 - clamp(p / .05);
      hero.tags.forEach((t) => { t.style.opacity = tagA; });
      hero.plan.style.opacity = 1 - clamp((p - .03) / .1);
    }
    const ea = clamp((p - .44) / .2);
    hero.eye.style.opacity = ea;
    hero.eye.style.visibility = ea > 0 ? 'visible' : 'hidden';
    hero.eye.style.transform = `scale(${1.14 - .14 * out(clamp((p - .44) / .34))})`;
    const nt = out(clamp((p - .68) / .16));
    hero.note.style.transform = `translateY(calc(${(1 - nt) * 100}% + ${(1 - nt) * 80}px))`;
  }

  // l'image redevient nette à l'arrêt : sans l'indice will-change, le navigateur la redessine à sa taille du moment
  let crispT = 0;
  const crisp = () => {
    hero.pic.style.willChange = 'transform';
    clearTimeout(crispT);
    crispT = setTimeout(() => { hero.pic.style.willChange = 'auto'; }, 180);
  };

  function heroIntro() {
    const tl = G.timeline({delay: .15, onComplete: () => { introDone = true; drawHero(heroP); }});
    tl.to($$('.hero__title .ln > span'), {y: 0, yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: .09}, 0)
      .fromTo(hero.wipe, {yPercent: 0}, {yPercent: -101, duration: 1.4, ease: 'expo.inOut'}, .25)
      .fromTo(hero.img, {scale: 1.22}, {scale: 1, duration: 2.2, ease: 'expo.out'}, .35)
      .fromTo(hero.side, {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 1, ease: 'expo.out'}, .7)
      .to($$('.hero__plan rect, .hero__plan path:not(.dash)'), {strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', stagger: .18}, 1.15)
      .to($('.hero__plan .dash'), {opacity: 1, duration: .6}, 1.9)
      // les repères ont leur position dans transform : leur glissement passe par la variable --ty (propriété translate)
      .fromTo(hero.tags, {opacity: 0, '--ty': '12px'}, {opacity: 1, '--ty': '0px', duration: .8, ease: 'expo.out', stagger: .12}, 1.7);
  }

  function heroScroll() {
    ST.create({
      trigger: hero.sec, pin: hero.pin, start: 'top top', end: () => '+=' + Math.round(innerHeight * 2.3),
      anticipatePin: 1, scrub: true, invalidateOnRefresh: true,
      onUpdate: (s) => { heroP = s.progress; drawHero(heroP); crisp(); },
      onRefresh: (s) => { heroP = s.progress; measure(); },
    });
  }

  /* ---------- parallaxe légère des photos ---------- */
  function parallax() {
    $$('[data-par]').forEach((fig) => {
      G.fromTo($('img', fig), {yPercent: -7}, {yPercent: 7, ease: 'none', scrollTrigger: {trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true}});
    });
  }

  /* ---------- piscines neuves : la photo de chaque étape se dévoile ---------- */
  function steps() {
    const pics = $$('[data-step-pic]');
    const items = $$('[data-step]');
    let cur = 0;
    const d = motion ? 1.15 : 0;
    const show = (k) => {
      if (k === cur) return;
      cur = k;
      items.forEach((it, i) => it.classList.toggle('is-on', i === k));
      pics.forEach((pic, i) => {
        if (i === 0) return;
        const on = i <= k;
        G.to(pic, {yPercent: on ? 0 : 101, duration: d, ease: 'expo.inOut', overwrite: true});
        G.to($('img', pic), {yPercent: on ? 0 : -60, scale: on ? 1 : 1.15, duration: d, ease: 'expo.inOut', overwrite: true});
      });
    };
    pics.forEach((pic, i) => { if (i) { G.set(pic, {y: 0, yPercent: 101}); G.set($('img', pic), {y: 0, yPercent: -60, scale: 1.15}); } });
    items.forEach((it, i) => ST.create({trigger: it, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => { if (s.isActive) show(i); }}));
    G.to('[data-steps-bar]', {scaleX: 1, ease: 'none', scrollTrigger: {trigger: '.steps__list', start: 'top 55%', end: 'bottom 55%', scrub: true}});
  }

  /* ---------- rénovation : survol, focus ou toucher ---------- */
  function remodels() {
    const rows = $$('[data-remo-row]');
    const pics = $$('[data-remo-pic]');
    const desktop = matchMedia('(min-width: 761px)');
    const set = (key) => {
      rows.forEach((r) => {
        const on = r.dataset.remoRow === key;
        r.classList.toggle('is-on', on);
        $('button', r).setAttribute('aria-expanded', on);
      });
      pics.forEach((p) => p.classList.toggle('is-on', p.dataset.remoPic === key));
    };
    rows.forEach((r) => {
      const b = $('button', r);
      b.addEventListener('mouseenter', () => { if (desktop.matches) set(r.dataset.remoRow); });
      b.addEventListener('focus', () => { if (desktop.matches) set(r.dataset.remoRow); });
      b.addEventListener('click', () => {
        if (!desktop.matches && r.classList.contains('is-on')) {
          r.classList.remove('is-on');
          b.setAttribute('aria-expanded', 'false');
        } else set(r.dataset.remoRow);
        setTimeout(() => ST.refresh(), 600);
      });
    });
  }

  /* ---------- chantiers : défilement horizontal (ordinateur) ---------- */
  function work() {
    const pin = $('[data-work-pin]');
    const track = $('[data-work-track]');
    const mm = G.matchMedia();
    mm.add('(min-width: 761px) and (min-height: 560px)', () => {
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tween = G.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {trigger: pin, pin: true, start: 'top top', end: () => '+=' + dist(), scrub: true, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (s) => G.set('[data-work-bar]', {scaleX: s.progress})},
      });
      $$('.job').forEach((job) => {
        const img = $('.job__main img', job);
        G.fromTo(img, {xPercent: -4}, {xPercent: 4, ease: 'none', scrollTrigger: {trigger: job, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true}});
        G.fromTo($$('.job__text > *, .job__side button', job), {opacity: 0, x: 60}, {opacity: 1, x: 0, duration: 1, ease: 'expo.out', stagger: .06,
          scrollTrigger: {trigger: job, containerAnimation: tween, start: 'left 72%', toggleActions: 'play none none reverse'}});
      });
      return () => G.set(track, {x: 0});
    });
  }

  /* ---------- visionneuse ---------- */
  const lb = $('[data-lb]');
  const lbImg = $('[data-lb-img]');
  let lbList = [];
  let lbI = 0;
  const lbShow = (i, dir = 0) => {
    lbI = (i + lbList.length) % lbList.length;
    const src = lbList[lbI];
    lbImg.src = src.src;
    lbImg.alt = src.alt;
    $('[data-lb-cap]').textContent = src.alt;
    $('[data-lb-n]').textContent = `${lbI + 1} / ${lbList.length}`;
    if (motion) G.fromTo(lbImg, {opacity: 0, x: dir * 40, scale: dir ? 1 : .96}, {opacity: 1, x: 0, scale: 1, duration: .6, ease: 'expo.out'});
  };
  const lbOpen = (list, i) => {
    lbList = list;
    lb.showModal();
    lenis && lenis.stop();
    lbShow(i);
    $('[data-lb-x]').focus();
  };
  lb.addEventListener('close', () => { lenis && lenis.start(); });
  $('[data-lb-x]').addEventListener('click', () => lb.close());
  $('[data-lb-prev]').addEventListener('click', () => lbShow(lbI - 1, -1));
  $('[data-lb-next]').addEventListener('click', () => lbShow(lbI + 1, 1));
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') lbShow(lbI - 1, -1);
    if (e.key === 'ArrowRight') lbShow(lbI + 1, 1);
  });
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  let sx = null;
  lb.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  lb.addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx;
    sx = null;
    if (Math.abs(dx) > 50) lbShow(lbI + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
  const imgOf = (name) => $(`.g[data-name="${name}"] img`);

  // les photos d'un chantier
  $$('[data-job-open]').forEach((b) => {
    b.addEventListener('click', () => {
      const names = b.dataset.jobOpen.split(' ');
      const start = +(b.dataset.start || 0);
      lbOpen(names.map((n) => imgOf(n)).filter(Boolean).map((im) => ({src: im.src, alt: im.alt})), start);
    });
  });

  /* ---------- galerie : filtres et dépliage ---------- */
  function gallery() {
    const grid = $('[data-gal-grid]');
    const items = $$('.g', grid);
    const chips = $$('.chip');
    const more = $('[data-gal-more]');
    const cols = () => getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    let tag = 'all';
    let open = false;
    const visible = () => items.filter((it) => !it.classList.contains('is-off'));
    const apply = (animate) => {
      const first = new Map(items.map((it) => [it, it.getBoundingClientRect()]));
      const match = items.filter((it) => tag === 'all' || it.dataset.tags.split(' ').includes(tag));
      const limit = open ? Infinity : cols() * 3;
      items.forEach((it) => it.classList.add('is-off'));
      match.slice(0, limit).forEach((it) => it.classList.remove('is-off'));
      more.parentElement.hidden = match.length <= limit;
      $('[data-gal-count]').textContent = match.length;
      if (!animate || !motion) { ST.refresh(); return; }
      visible().forEach((it, i) => {
        const a = first.get(it);
        const b = it.getBoundingClientRect();
        if (a.width && a.top < innerHeight + 200) {
          G.fromTo(it, {x: a.left - b.left, y: a.top - b.top}, {x: 0, y: 0, duration: .8, ease: 'expo.inOut', clearProps: 'transform'});
        } else {
          G.fromTo(it, {opacity: 0, scale: .92}, {opacity: 1, scale: 1, duration: .7, ease: 'expo.out', delay: Math.min(i, 12) * .025, clearProps: 'transform,opacity'});
        }
      });
      ST.refresh();
    };
    chips.forEach((c) => c.addEventListener('click', () => {
      tag = c.dataset.tag;
      chips.forEach((x) => x.setAttribute('aria-pressed', x === c));
      apply(true);
    }));
    more.addEventListener('click', () => {
      open = true;
      apply(true);
    });
    items.forEach((it) => it.addEventListener('click', () => {
      const list = visible();
      lbOpen(list.map((x) => ({src: $('img', x).src, alt: $('img', x).alt})), list.indexOf(it));
    }));
    let lastCols = cols();
    window.addEventListener('resize', () => { if (cols() !== lastCols) { lastCols = cols(); apply(false); } });
    apply(false);
  }

  /* ---------- carte des comtés ---------- */
  function areas() {
    const area = $('[data-area]');
    const btns = $$('[data-counties] button');
    const paths = $$('.m-county', area);
    const hot = (key) => {
      paths.forEach((p) => p.classList.toggle('is-hot', p.dataset.county === key));
      btns.forEach((b) => b.classList.toggle('is-hot', b.dataset.county === key));
    };
    btns.forEach((b) => {
      b.addEventListener('mouseenter', () => hot(b.dataset.county));
      b.addEventListener('focus', () => hot(b.dataset.county));
      b.addEventListener('click', () => hot(b.dataset.county));
      b.addEventListener('mouseleave', () => hot(null));
      b.addEventListener('blur', () => hot(null));
    });
    paths.forEach((p) => {
      p.addEventListener('mouseenter', () => hot(p.dataset.county));
      p.addEventListener('mouseleave', () => hot(null));
    });
    io.observe(area);
  }

  /* ---------- formulaire de devis ---------- */
  function form() {
    const f = $('[data-form]');
    const opts = $$('.pick__opt', f);
    opts.forEach((o) => $('input', o).addEventListener('change', () => {
      opts.forEach((x) => x.classList.toggle('is-on', $('input', x).checked));
      $('[data-err="interest"]', f).hidden = true;
    }));
    $$('.field input', f).forEach((i) => i.addEventListener('input', () => i.closest('.field').classList.remove('is-bad')));
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      let bad = null;
      if (!f.interest.value) { $('[data-err="interest"]', f).hidden = false; bad = bad || $('input[name=interest]', f); }
      ['first', 'last', 'phone', 'email'].forEach((n) => {
        const i = f[n];
        const ok = i.value.trim() && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim())) && (n !== 'phone' || i.value.replace(/\D/g, '').length >= 10);
        i.closest('.field').classList.toggle('is-bad', !ok);
        if (!ok) bad = bad || i;
      });
      if (bad) { bad.focus({preventScroll: true}); scrollTo(bad.closest('.field, .pick')); return; }
      $('[data-done-name]', f).textContent = `, ${f.first.value.trim()}`;
      f.classList.add('is-sent');
      $('[data-done]', f).hidden = false;
      $('[data-done]', f).focus({preventScroll: true});
      if (motion) G.fromTo($$('[data-done] > *', f), {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: .8, stagger: .08, ease: 'expo.out'});
      ST.refresh();
    });
  }

  /* ---------- pied de page : le nom en très grand ---------- */
  function footer() {
    const big = $('[data-big]');
    $$('span', big).forEach((s) => { s.innerHTML = [...s.textContent].map((c) => `<i>${c}</i>`).join(''); });
    const spans = $$('span', big);
    const fit = () => {
      big.style.setProperty('--big', '100px');
      const w = spans[spans.length - 1].getBoundingClientRect().right - spans[0].getBoundingClientRect().left;
      big.style.setProperty('--big', (100 * big.clientWidth / w * .995).toFixed(2) + 'px');
    };
    fit();
    window.addEventListener('resize', fit);
    if (motion) {
      G.fromTo($$('i', big), {yPercent: 105}, {yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: .035, scrollTrigger: {trigger: big, start: 'top 92%'}});
    }
  }

  /* ---------- barre mobile ---------- */
  function dock() {
    const d = $('[data-dock]');
    const q = $('#quote');
    const set = () => {
      const r = q.getBoundingClientRect();
      d.classList.toggle('is-on', window.scrollY > innerHeight * 1.2 && !(r.top < innerHeight && r.bottom > 0));
    };
    window.addEventListener('scroll', set, {passive: true});
    set();
  }

  /* ---------- démarrage ---------- */
  const start = () => {
    fitHero();
    doSplit();
    measure();
    linesEls.forEach((el) => io.observe(el));
    $$('.rv, .lender').forEach((el) => io.observe(el));
    if (motion) {
      heroIntro();
      heroScroll();
      parallax();
    } else {
      $$('.lender').forEach(counters);
    }
    steps();
    remodels();
    work();
    gallery();
    areas();
    form();
    footer();
    dock();
    onScrollHeader();
    let lastW = innerWidth;
    window.addEventListener('resize', () => {
      fitHero();
      measure();
      if (innerWidth !== lastW) {
        lastW = innerWidth;
        doSplit();
        linesEls.forEach((el) => el.classList.add('is-in'));
      }
    });
    root.classList.add('is-ready');
    ST.refresh();
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else window.addEventListener('load', start);
})();
