/* Cameron Dental Studio : interactions de la page.
 * Défilement doux (Lenis) et animations au défilement (GSAP + ScrollTrigger).
 * Les apparitions sont des classes posées à l'entrée dans l'écran ; le mouvement est en CSS (transformations, opacité, découpes).
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
  ST.config({ignoreMobileResize: true});
  const TEL = '(239) 422-7924';

  /* ——— Défilement doux ——— */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({duration: 1.15, smoothWheel: true});
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const goTo = (el) => {
    if (lenis) lenis.scrollTo(el, {offset: 0, duration: 1.6});
    else window.scrollTo({top: el.getBoundingClientRect().top + scrollY, behavior: reduce ? 'auto' : 'smooth'});
  };
  const lock = (on) => {
    root.classList.toggle('is-locked', on);
    if (lenis) on ? lenis.stop() : lenis.start();
  };

  /* ——— En-tête : fond au défilement, masqué en descendant, folio de la rubrique en cours ——— */
  const hd = $('[data-hd]');
  const drawer = $('[data-drawer]');
  const menuBtn = $('[data-menu]');
  const mbar = $('[data-mbar]');
  let lastY = scrollY;
  let coverSeen = true;
  let visitSeen = false;
  const onScroll = () => {
    const y = scrollY;
    hd.classList.toggle('is-solid', y > 30 || !drawer.hidden);
    if (y > lastY + 2 && y > 500 && drawer.hidden) hd.classList.add('is-hidden');
    else if (y < lastY - 2 || y <= 500) hd.classList.remove('is-hidden');
    lastY = y;
    mbar.classList.toggle('is-on', !coverSeen && !visitSeen && drawer.hidden);
  };
  addEventListener('scroll', onScroll, {passive: true});
  new IntersectionObserver(([en]) => { coverSeen = en.isIntersecting; onScroll(); }, {rootMargin: '0px 0px -55% 0px'}).observe($('#cover'));
  new IntersectionObserver(([en]) => { visitSeen = en.isIntersecting; onScroll(); }, {rootMargin: '0px 0px -25% 0px'}).observe($('#visit'));

  const folioN = $('[data-folio-n]');
  const folioT = $('[data-folio-t]');
  let folio = '01';
  const setFolio = (n, t) => {
    if (n === folio) return;
    folio = n;
    if (reduce) { folioN.textContent = n; folioT.textContent = t; return; }
    G.timeline()
      .to([folioN, folioT], {yPercent: -110, opacity: 0, duration: 0.25, ease: 'power2.in', stagger: 0.03})
      .add(() => { folioN.textContent = n; folioT.textContent = t; })
      .fromTo([folioN, folioT], {yPercent: 110, opacity: 0}, {yPercent: 0, opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.04});
  };
  const folioIO = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const [n, t] = en.target.dataset.folioOf.split('|');
    setFolio(n, t);
  }), {rootMargin: '-40% 0px -55% 0px'});
  $$('[data-folio-of]').forEach((el) => folioIO.observe(el));

  /* ——— Menu (tablette et téléphone) ——— */
  const setDrawer = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      drawer.hidden = false;
      lock(true);
      if (!reduce) G.fromTo($$('.menu__t, .menu nav a, .menu__foot', drawer), {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.8, stagger: 0.04, ease: 'expo.out'});
    } else {
      drawer.hidden = true;
      lock(false);
    }
    onScroll();
  };
  menuBtn.addEventListener('click', () => setDrawer(menuBtn.getAttribute('aria-expanded') !== 'true'));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.hidden) { setDrawer(false); menuBtn.focus(); } });

  // liens internes : défilement doux ; un lien « data-topic » présélectionne le sujet du formulaire
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id.length > 1 && document.getElementById(id.slice(1));
    if (!el) return;
    e.preventDefault();
    if (!drawer.hidden) setDrawer(false);
    if (a.dataset.topic) {
      const r = $$('input[name="topic"]').find((i) => i.value === a.dataset.topic);
      if (r) r.checked = true;
    }
    goTo(el);
  }));

  /* ——— Ouvert / fermé, à l'heure de Naples ——— */
  const fmt = new Intl.DateTimeFormat('en-US', {timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false});
  const paintStatus = () => {
    const parts = fmt.formatToParts(new Date());
    const get = (t) => (parts.find((p) => p.type === t) || {}).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    const min = (+get('hour') % 24) * 60 + +get('minute');
    const weekday = day >= 1 && day <= 5;
    const open = weekday && min >= 420 && min < 1020;
    let text = 'Open now · until 5 PM';
    if (!open) {
      if (weekday && min < 420) text = 'Closed · opens at 7 AM';
      else if (day >= 1 && day <= 4) text = 'Closed · opens tomorrow, 7 AM';
      else text = 'Closed · opens Monday, 7 AM';
    }
    $$('[data-status]').forEach((el) => {
      el.classList.toggle('is-open', open);
      el.querySelector('span').textContent = text;
      el.title = 'Monday to Friday, 7 AM to 5 PM (Naples time)';
    });
  };
  paintStatus();
  setInterval(paintStatus, 60000);
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ——— Titres : découpe en lignes réelles (l'italique est conservé mot par mot) ——— */
  function splitLines(el) {
    if (!el.dataset.src) el.dataset.src = el.innerHTML;
    el.innerHTML = el.dataset.src;
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          const inner = n.parentNode !== el ? n.parentNode : null;
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement(inner ? inner.tagName.toLowerCase() : 'span');
            if (inner && inner.className) w.className = inner.className;
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
      const t = w.getBoundingClientRect().top;
      if (top === null || Math.abs(t - top) > 6) { lines.push([]); top = t; }
      lines[lines.length - 1].push(w);
    });
    el.innerHTML = '';
    lines.forEach((ws, i) => {
      const line = document.createElement('span');
      line.className = 'ln';
      line.style.setProperty('--i', i);
      const inner = document.createElement('span');
      ws.forEach((w, j) => { inner.appendChild(w); if (j < ws.length - 1) inner.appendChild(document.createTextNode(' ')); });
      line.appendChild(inner);
      el.appendChild(line);
    });
    el.classList.add('is-split');
  }
  const splits = $$('[data-split]');

  /* ——— Titre de couverture et pied de page : le mot « Cameron » remplit la largeur ——— */
  const mastWord = $('[data-mast]');
  const ftMast = $('[data-ft-mast]');
  mastWord.innerHTML = [...mastWord.textContent].map((c) => `<span class="ch">${c}</span>`).join('');
  const fit = (el, avail) => {
    el.style.fontSize = '100px';
    const w = el.scrollWidth;
    if (w) el.style.fontSize = `${(100 * avail) / w}px`;
  };
  const fitMasts = () => {
    const mast = mastWord.parentNode;
    const cs = getComputedStyle(mast);
    const sub = $('.mast__sub');
    const avail = mast.clientWidth - (cs.flexDirection === 'column' ? 0 : sub.offsetWidth + parseFloat(cs.columnGap || 0));
    fit(mastWord, Math.min(avail, innerHeight * 1.6));
    mast.parentNode.style.setProperty('--mast-h', `${mastWord.offsetHeight}px`);
    const ft = getComputedStyle(ftMast.parentNode);
    fit(ftMast, ftMast.parentNode.clientWidth - parseFloat(ft.paddingLeft) - parseFloat(ft.paddingRight));
  };

  /* ——— Ouverture : couverture ——— */
  const coverFrame = $('[data-cover-frame]');
  const coverImg = $('[data-cover-img]');
  function intro() {
    const ins = $$('#cover [data-in]');
    const head = $('#cover [data-split]');
    if (reduce) {
      head.classList.add('is-in');
      return;
    }
    mastWord.style.clipPath = 'inset(-20% -5% -.04em -5%)';
    G.timeline({defaults: {ease: 'expo.out'}})
      .fromTo($$('.ch', mastWord), {yPercent: 108}, {yPercent: 0, duration: 1.5, stagger: 0.055, onComplete: () => { mastWord.style.clipPath = ''; }}, 0.1)
      .fromTo(coverFrame, {clipPath: 'inset(100% 0% 0% 0%)'}, {clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'expo.inOut'}, 0.25)
      .fromTo(coverImg, {scale: 1.35}, {scale: 1.1, duration: 2.4}, 0.25)
      .fromTo(ins, {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 1.1, stagger: 0.06}, 0.9)
      .add(() => head.classList.add('is-in'), 1.05);
    // en défilant, la photo glisse un peu moins vite que la page
    G.to(coverImg, {yPercent: 3.5, ease: 'none', scrollTrigger: {trigger: '#cover', start: 'top top', end: 'bottom top', scrub: true}});
  }

  /* ——— Apparitions ——— */
  const drifts = $$('img[data-drift]');
  function reveals() {
    let batch = 0;
    let batchT = 0;
    const show = (el) => {
      const now = performance.now();
      if (now - batchT > 140) { batch = 0; batchT = now; }
      if (el.matches('[data-reveal], .shot') && !el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${Math.min(batch++, 7) * 75}ms`);
      el.classList.add('is-in');
      const img = el.matches('.plate') && $('img[data-drift]', el);
      if (img && !reduce) G.fromTo(img, {scale: 1.14}, {scale: 1, duration: 1.9, ease: 'expo.out'});
    };
    const obs = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      obs.unobserve(en.target);
      show(en.target);
    }), {rootMargin: '0px 0px -10% 0px'});
    [...splits.filter((el) => !el.closest('#cover')), ...$$('[data-reveal], .rh[data-rule], .plate[data-plate], .shot, [data-ft-mast]')].forEach((el) => obs.observe(el));
  }

  /* ——— Mouvements liés au défilement ——— */
  function scrubs() {
    if (reduce) return;
    // photos dans leur cadre
    drifts.forEach((img) => {
      img.style.transition = 'none';
      G.set(img, {scale: 1.14});
      G.fromTo(img, {yPercent: -4.5}, {yPercent: 4.5, ease: 'none', scrollTrigger: {trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true}});
    });
    // la photo « avant » du cas vedette remonte un peu plus vite que l'« après »
    G.fromTo('.lead__before', {y: 70}, {y: -50, ease: 'none', scrollTrigger: {trigger: '.lead__faces', start: 'top bottom', end: 'bottom top', scrub: true}});
    // les couvertures de magazines s'ouvrent en éventail
    G.fromTo('[data-covers]', {'--spread': 0, '--tilt': 0.15}, {'--spread': 1.1, '--tilt': 1, ease: 'none',
      scrollTrigger: {trigger: '[data-covers]', start: 'top 95%', end: 'center 45%', scrub: 0.6}});
  }

  /* ——— Planche des 18 sourires : avant / après en vague ——— */
  function startSheet() {
    const sheet = $('[data-sheet]');
    const flip = $('.flip');
    const btns = $$('[data-flip]', flip);
    const shots = $$('.shot', sheet);
    let clearT;
    const set = (before) => {
      if (sheet.classList.contains('is-before') === before) return;
      const cols = getComputedStyle(sheet).gridTemplateColumns.split(' ').length;
      shots.forEach((li, i) => {
        const d = reduce ? 0 : ((i % cols) + Math.floor(i / cols)) * 55;
        li.style.setProperty('--wd', `${d}ms`);
        const label = $('[data-state]', li);
        setTimeout(() => { label.textContent = before ? 'Before' : 'After'; }, d + 200);
      });
      sheet.classList.toggle('is-before', before);
      flip.classList.toggle('is-after', !before);
      btns.forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.flip === 'before') === before)));
      clearTimeout(clearT);
      clearT = setTimeout(() => shots.forEach((li) => li.style.removeProperty('--wd')), 1800);
    };
    btns.forEach((b) => b.addEventListener('click', () => set(b.dataset.flip === 'before')));
    return shots;
  }

  /* ——— Visionneuse d'un cas : visages, puis gros plan « appuyer pour voir avant » ——— */
  function startCase(shots) {
    const dlg = $('[data-case]');
    const imgs = {};
    $$('[data-case-img]', dlg).forEach((img) => { imgs[img.dataset.caseImg] = img; });
    const hold = $('[data-hold]', dlg);
    const tag = $('[data-hold-tag]', dlg);
    let cur = 0;
    let opener = null;
    const fill = (i) => {
      cur = (i + shots.length) % shots.length;
      const li = shots[cur];
      imgs.fa.src = $('.shot__a', li).src;
      imgs.fb.src = $('.shot__b', li).src;
      imgs.cb.src = $('img[data-cb]', li).src;
      imgs.ca.src = $('img[data-ca]', li).src;
      const n = String(cur + 1).padStart(2, '0');
      imgs.fb.alt = `Smile no. ${n}, before treatment`;
      imgs.fa.alt = `Smile no. ${n}, after treatment`;
      imgs.ca.alt = `Smile no. ${n}, close-up after treatment`;
      imgs.cb.alt = `Smile no. ${n}, close-up before treatment`;
      $('[data-case-n]', dlg).textContent = `No. ${n}`;
      $('[data-case-of]', dlg).textContent = `of ${shots.length}`;
    };
    const anim = (dir) => {
      if (reduce) return;
      G.fromTo($$('.case__faces figure, .case__close-up', dlg), {opacity: 0, x: 30 * dir}, {opacity: 1, x: 0, duration: 0.8, stagger: 0.05, ease: 'expo.out'});
    };
    const open = (i, from) => {
      opener = from;
      fill(i);
      dlg.hidden = false;
      lock(true);
      if (!reduce) {
        G.fromTo(dlg, {opacity: 0}, {opacity: 1, duration: 0.4, ease: 'power2.out'});
        G.fromTo($$('.case__head, .case__faces figure, .case__close-up, .case__nav', dlg), {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 1, stagger: 0.06, ease: 'expo.out', delay: 0.05});
      }
      $('[data-case-close]', dlg).focus();
    };
    const close = () => {
      setDown(false);
      const done = () => { dlg.hidden = true; lock(false); if (opener) opener.focus({preventScroll: true}); };
      if (reduce) done();
      else G.to(dlg, {opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: done});
    };
    const step = (d) => { fill(cur + d); anim(d); };
    shots.forEach((li, i) => $('.shot__btn', li).addEventListener('click', (e) => open(i, e.currentTarget)));
    $('[data-case-close]', dlg).addEventListener('click', close);
    $('[data-case-prev]', dlg).addEventListener('click', () => step(-1));
    $('[data-case-next]', dlg).addEventListener('click', () => step(1));

    const setDown = (on) => {
      hold.classList.toggle('is-down', on);
      tag.textContent = on ? 'Before' : 'After';
    };
    hold.addEventListener('pointerdown', (e) => { e.preventDefault(); hold.setPointerCapture?.(e.pointerId); setDown(true); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => hold.addEventListener(t, () => setDown(false)));
    hold.addEventListener('contextmenu', (e) => e.preventDefault());
    hold.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); setDown(true); } });
    hold.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') setDown(false); });
    hold.addEventListener('blur', () => setDown(false));

    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Tab') {
        const f = $$('button', dlg).filter((b) => b.offsetParent !== null);
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ——— Onglets (soins) et thèmes (courrier) : tabindex mobile, flèches du clavier ——— */
  function roving(list, items, onPick) {
    items.forEach((b, i) => {
      b.addEventListener('click', () => onPick(b, true));
      b.addEventListener('keydown', (e) => {
        const d = {ArrowRight: 1, ArrowLeft: -1, Home: -i, End: items.length - 1 - i}[e.key];
        if (d === undefined) return;
        e.preventDefault();
        const n = items[(i + d + items.length) % items.length];
        n.focus();
        onPick(n, true);
      });
    });
  }
  const enter = (el) => { el.classList.remove('is-enter'); void el.offsetWidth; el.classList.add('is-enter'); };
  let refreshT;
  const refreshSoon = () => { clearTimeout(refreshT); refreshT = setTimeout(() => ST.refresh(), 120); };

  function startTabs() {
    const list = $('[data-tabs]');
    const tabs = $$('[role="tab"]', list);
    const bar = $('.tabs__bar', list);
    const place = () => {
      const t = tabs.find((b) => b.getAttribute('aria-selected') === 'true');
      bar.style.setProperty('--x', `${t.offsetLeft}px`);
      bar.style.setProperty('--w', `${t.offsetWidth}px`);
    };
    roving(list, tabs, (tab, user) => {
      tabs.forEach((b) => {
        const on = b === tab;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
        const p = document.getElementById(b.getAttribute('aria-controls'));
        if (on && p.hidden) { p.hidden = false; if (user) enter(p); }
        else if (!on) p.hidden = true;
      });
      place();
      if (list.scrollWidth > list.clientWidth) list.scrollTo({left: tab.offsetLeft - 24, behavior: reduce ? 'auto' : 'smooth'});
      refreshSoon();
    });
    place();
    return place;
  }

  function startLetters() {
    const list = $('[data-themes]');
    const chips = $$('[data-theme]', list);
    const sets = $$('[data-set]');
    roving(list, chips, (chip) => {
      chips.forEach((c) => { c.setAttribute('aria-selected', String(c === chip)); c.tabIndex = c === chip ? 0 : -1; });
      sets.forEach((s) => {
        const on = s.dataset.set === chip.dataset.theme;
        if (on && s.hidden) { s.hidden = false; enter(s); }
        else if (!on) s.hidden = true;
      });
      refreshSoon();
    });
  }

  /* ——— Curseur « How do you feel about the dentist? » ——— */
  function startDial() {
    const input = $('[data-dial-in]');
    const opts = $$('[data-opt]');
    const marks = $$('.dial__marks span');
    const words = ['I’m fine', 'A little nervous', 'Really anxious'];
    const set = (v, user) => {
      input.style.setProperty('--fill', `${v * 50}%`);
      input.setAttribute('aria-valuetext', words[v]);
      marks.forEach((m, i) => m.classList.toggle('is-on', i === v));
      opts.forEach((o) => {
        const on = +o.dataset.opt === v;
        if (on && o.hidden) { o.hidden = false; if (user) enter(o); }
        else if (!on) o.hidden = true;
      });
    };
    input.addEventListener('input', () => set(+input.value, true));
    marks.forEach((m, i) => {
      m.style.cursor = 'pointer';
      m.addEventListener('click', () => { input.value = i; set(i, true); });
    });
    set(+input.value, false);
  }

  /* ——— Dentistes : biographie dépliable ——— */
  function startDoctors() {
    $$('[data-doc]').forEach((btn) => btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      const bio = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        bio.hidden = false;
        if (!reduce) G.fromTo(bio, {height: 0, opacity: 0}, {height: 'auto', opacity: 1, duration: 0.7, ease: 'expo.out', clearProps: 'height', onComplete: refreshSoon});
      } else if (reduce) {
        bio.hidden = true;
      } else {
        G.to(bio, {height: 0, opacity: 0, duration: 0.45, ease: 'power3.inOut', onComplete: () => { bio.hidden = true; G.set(bio, {clearProps: 'height,opacity'}); refreshSoon(); }});
      }
      refreshSoon();
    }));
  }

  /* ——— Assurances : la liste du site, filtrée à la frappe ——— */
  function startInsurance() {
    const PPO = ['Aetna', 'Altus Dental', 'Assurant', 'Ameritas', 'Allegiance', 'BlueDental Choice', 'BlueDental Choice Plus',
      'BlueOptions Health & Dental', 'Careington', 'Cigna', 'Connection Dental Network', 'Delta', 'Dental Network of America (DNOA)',
      'Dentegra', 'DenteMax', 'GEHA', 'Guardian', 'Humana', 'Medicare Advantage', 'MetLife', 'Mutual of Omaha', 'Principal',
      'Sun Life', 'UnitedHealthcare', 'United Concordia'];
    const DISCOUNT = ['American Dental Group', 'Aetna Dental Access', 'Careington Dental Discount Plan', 'Cigna Dental Savings Plan',
      'Dentegra Dental Discount', 'Dentegra Discount for AARP members'];
    // autres façons courantes d'écrire le même nom
    const ALIAS = {'Delta': ['delta dental'], 'UnitedHealthcare': ['united healthcare', 'uhc'], 'MetLife': ['met life'],
      'Dental Network of America (DNOA)': ['dnoa'], 'Medicare Advantage': ['medicare'], 'BlueDental Choice': ['florida blue'],
      'BlueDental Choice Plus': ['florida blue'], 'BlueOptions Health & Dental': ['florida blue']};
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
    const box = $('[data-ins]');
    const q = $('[data-ins-q]');
    const res = $('[data-ins-res]');
    const items = [];
    const render = (names, kind) => {
      const ul = $(`[data-ins-list="${kind}"]`);
      names.forEach((name) => {
        const li = document.createElement('li');
        li.textContent = name;
        ul.appendChild(li);
        items.push({li, name, kind, keys: [name, ...(ALIAS[name] || [])].map(norm)});
      });
    };
    render(PPO, 'ppo');
    render(DISCOUNT, 'discount');
    const initial = res.innerHTML;
    const list = (arr) => arr.map((m) => `<b>${m.name.replace(/&/g, '&amp;')}</b>`).join(', ');
    q.addEventListener('input', () => {
      const v = norm(q.value);
      box.classList.toggle('is-filter', v.length > 0);
      if (!v) { items.forEach((m) => m.li.classList.remove('is-match')); res.innerHTML = initial; return; }
      const hits = items.filter((m) => m.keys.some((k) => k.includes(v) || (k.length > 3 && v.includes(k))));
      items.forEach((m) => m.li.classList.toggle('is-match', hits.includes(m)));
      const ppo = hits.filter((m) => m.kind === 'ppo');
      const disc = hits.filter((m) => m.kind === 'discount');
      if (!hits.length) res.innerHTML = `Not on our list yet. Call us at <a href="tel:+12394227924">${TEL}</a> and we’ll check for you.`;
      else if (ppo.length) res.innerHTML = `Yes, we’re in network with ${list(ppo)}${disc.length ? `, and accept ${list(disc)}` : ''}.`;
      else res.innerHTML = `We accept the discount plan ${list(disc)}.`;
    });
  }

  /* ——— Formulaire de rendez-vous ——— */
  function startForm() {
    const form = $('[data-form]');
    const done = $('[data-done]', form);
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let first = null;
      $$('[required]', form).forEach((f) => {
        const bad = !f.value.trim() || (f.type === 'email' && !email.test(f.value.trim())) || (f.type === 'tel' && f.value.replace(/\D/g, '').length < 7);
        f.closest('.field').classList.toggle('is-bad', bad);
        f.toggleAttribute('aria-invalid', bad);
        if (bad && !first) first = f;
      });
      if (first) { first.focus(); return; }
      done.hidden = false;
      done.setAttribute('tabindex', '-1');
      done.focus({preventScroll: true});
      if (!reduce) G.fromTo(done, {clipPath: 'inset(100% 0% 0% 0%)'}, {clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut'});
    });
    $$('[required]', form).forEach((f) => f.addEventListener('input', () => { f.closest('.field').classList.remove('is-bad'); f.removeAttribute('aria-invalid'); }));
  }

  /* ——— Démarrage ——— */
  const decode = (img) => (img.complete && img.naturalWidth ? Promise.resolve() : (img.decode ? img.decode() : new Promise((ok) => { img.onload = ok; }))).catch(() => {});
  async function start() {
    await document.fonts.ready.catch(() => {});
    fitMasts();
    splits.forEach(splitLines);
    await decode(coverImg);
    intro();
    const shots = startSheet();
    startCase(shots);
    const placeBar = startTabs();
    startLetters();
    startDial();
    startDoctors();
    startInsurance();
    startForm();
    scrubs();
    reveals();
    let w0 = innerWidth;
    let rt;
    addEventListener('resize', () => {
      if (innerWidth === w0) return;
      w0 = innerWidth;
      clearTimeout(rt);
      rt = setTimeout(() => {
        fitMasts();
        splits.forEach((el) => { const was = el.classList.contains('is-in'); splitLines(el); if (was) el.classList.add('is-in'); });
        placeBar();
        ST.refresh();
      }, 200);
    });
    ST.refresh();
    onScroll();
    root.classList.add('is-ready');
  }
  start();
})();
