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
  const hover = matchMedia('(hover: hover)').matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  G.registerPlugin(ST);
  ST.config({ignoreMobileResize: true});
  const TEL = '(239) 422-7924';

  /* ——— Défilement doux ——— */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({duration: 1.1, smoothWheel: true});
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const hdH = () => parseFloat(getComputedStyle(root).getPropertyValue('--hd')) || 72;
  const goTo = (el) => {
    const off = el.id === 'top' ? 0 : -hdH() + 1;
    if (lenis) lenis.scrollTo(el.id === 'top' ? 0 : el, {offset: off, duration: 1.4});
    else window.scrollTo({top: el.id === 'top' ? 0 : el.getBoundingClientRect().top + scrollY + off, behavior: reduce ? 'auto' : 'smooth'});
  };
  const lock = (on) => {
    root.classList.toggle('is-locked', on);
    if (lenis) on ? lenis.stop() : lenis.start();
  };

  /* ——— En-tête : ombre au défilement, masqué en descendant ——— */
  const hd = $('[data-hd]');
  const drawer = $('[data-drawer]');
  const menuBtn = $('[data-menu]');
  const mbar = $('[data-mbar]');
  let lastY = scrollY;
  let heroSeen = true;
  let visitSeen = false;
  const onScroll = () => {
    const y = scrollY;
    hd.classList.toggle('is-solid', y > 10);
    if (y > lastY + 2 && y > 600 && drawer.hidden) hd.classList.add('is-hidden');
    else if (y < lastY - 2 || y <= 600) hd.classList.remove('is-hidden');
    lastY = y;
    mbar.classList.toggle('is-on', !heroSeen && !visitSeen && drawer.hidden);
  };
  addEventListener('scroll', onScroll, {passive: true});
  new IntersectionObserver(([en]) => { heroSeen = en.isIntersecting; onScroll(); }, {rootMargin: '0px 0px -40% 0px'}).observe($('.hero__ctas'));
  new IntersectionObserver(([en]) => { visitSeen = en.isIntersecting; onScroll(); }, {rootMargin: '0px 0px -25% 0px'}).observe($('#visit'));

  // la rubrique en cours est soulignée dans le menu
  const navLinks = $$('.nav a');
  const navIO = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('is-here', a.getAttribute('href') === '#' + en.target.id));
  }), {rootMargin: '-45% 0px -50% 0px'});
  $$('main > section').forEach((s) => navIO.observe(s));

  /* ——— Menu (tablette et téléphone) ——— */
  const setDrawer = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    lock(open);
    if (open && !reduce) G.fromTo($$('.menu nav a, .menu__foot', drawer), {opacity: 0, y: 16}, {opacity: 1, y: 0, duration: 0.6, stagger: 0.035, ease: 'power3.out'});
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
    let short = 'Open now';
    if (!open) {
      short = 'Closed now';
      if (weekday && min < 420) text = 'Closed · opens at 7 AM';
      else if (day >= 1 && day <= 4) text = 'Closed · opens tomorrow, 7 AM';
      else text = 'Closed · opens Monday, 7 AM';
    }
    $$('[data-status]').forEach((el) => {
      el.classList.toggle('is-open', open);
      el.querySelector('span').textContent = el.closest('.hd__tel') ? short : text;
      el.title = 'Monday to Friday, 7 AM to 5 PM (Naples time)';
    });
  };
  paintStatus();
  setInterval(paintStatus, 60000);
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ——— Titres : découpe en lignes réelles ——— */
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
  const splits = $$('[data-lines]');

  /* ——— Le mur des sourires : avant au survol, en vague avec l'interrupteur, et quelques « coups d'œil » ——— */
  const wall = $('[data-wall]');
  const faces = $$('.face', wall);
  const flip = $('[data-flip]', wall);
  const visible = () => faces.filter((f) => f.offsetParent !== null);
  const cols = () => getComputedStyle($('[data-wall-grid]')).gridTemplateColumns.split(' ').length;
  function startWall() {
    let clearT;
    flip.addEventListener('click', () => {
      const before = flip.getAttribute('aria-checked') !== 'true';
      const c = cols();
      visible().forEach((f, i) => f.style.setProperty('--wd', reduce ? '0ms' : `${((i % c) + Math.floor(i / c)) * 70}ms`));
      flip.setAttribute('aria-checked', String(before));
      $('.switch__t', flip).textContent = before ? 'Show after' : 'Show before';
      wall.classList.toggle('is-before', before);
      clearTimeout(clearT);
      clearT = setTimeout(() => faces.forEach((f) => f.style.removeProperty('--wd')), 1600);
    });
    if (reduce) return;
    // de temps en temps, un sourire montre son « avant » une seconde
    let inView = true;
    let pointer = false;
    let last = -1;
    new IntersectionObserver(([en]) => { inView = en.isIntersecting; }).observe(wall);
    wall.addEventListener('pointerenter', () => { pointer = true; });
    wall.addEventListener('pointerleave', () => { pointer = false; });
    setInterval(() => {
      if (!inView || pointer || wall.classList.contains('is-before') || document.hidden) return;
      const list = visible();
      let i = Math.floor(Math.random() * list.length);
      if (i === last) i = (i + 1) % list.length;
      last = i;
      const f = list[i];
      f.classList.add('is-peek');
      setTimeout(() => f.classList.remove('is-peek'), 1700);
    }, 2600);
  }

  /* ——— Ouverture ——— */
  function intro() {
    const head = $('#hero-t');
    const ins = $$('[data-in]');
    const c = cols();
    visible().forEach((f, i) => f.style.setProperty('--fd', `${250 + ((i % c) + Math.floor(i / c)) * 90}ms`));
    if (reduce) { head.classList.add('is-in'); faces.forEach((f) => f.classList.add('is-in')); return; }
    requestAnimationFrame(() => {
      head.classList.add('is-in');
      faces.forEach((f) => f.classList.add('is-in'));
      G.fromTo(ins, {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out', delay: 0.45});
    });
  }

  /* ——— Apparitions ——— */
  function reveals() {
    let batch = 0;
    let batchT = 0;
    const show = (el) => {
      const now = performance.now();
      if (now - batchT > 140) { batch = 0; batchT = now; }
      if (el.matches('[data-reveal]') && !el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${Math.min(batch++, 6) * 70}ms`);
      el.classList.add('is-in');
      const img = el.matches('.pic') && $('img[data-drift]', el);
      if (img && !reduce) G.fromTo(img, {scale: 1.12}, {scale: 1, duration: 1.8, ease: 'expo.out'});
    };
    const obs = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      obs.unobserve(en.target);
      show(en.target);
    }), {rootMargin: '0px 0px -8% 0px'});
    [...splits.filter((el) => el.id !== 'hero-t'), ...$$('[data-reveal], .pic[data-pic]')].forEach((el) => obs.observe(el));
  }

  /* ——— Photos qui glissent dans leur cadre au défilement ——— */
  function drifts() {
    if (reduce) return;
    $$('img[data-drift]').forEach((img) => {
      G.set(img, {scale: 1.12});
      G.fromTo(img, {yPercent: -4}, {yPercent: 4, ease: 'none', scrollTrigger: {trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true}});
    });
  }

  /* ——— La photo d'équipe s'élargit jusqu'aux bords de l'écran ——— */
  function bleed() {
    if (reduce) return;
    const pic = $('[data-bleed]');
    const fig = pic.parentNode;
    const side = () => { const cs = getComputedStyle(fig.parentNode); return fig.parentNode.getBoundingClientRect().left + parseFloat(cs.paddingLeft); };
    G.fromTo(pic, {clipPath: () => `inset(0px ${side()}px 0px ${side()}px round 6px)`}, {clipPath: 'inset(0px 0px 0px 0px round 0px)', ease: 'none',
      scrollTrigger: {trigger: fig, start: 'top 88%', end: 'top 18%', scrub: 0.4, invalidateOnRefresh: true}});
  }

  /* ——— Visionneuse des 18 cas ——— */
  function startCase() {
    const store = $$('[data-case-i]');
    const dlg = $('[data-case]');
    const imgs = {};
    $$('[data-case-img]', dlg).forEach((img) => { imgs[img.dataset.caseImg] = img; });
    let cur = 0;
    let opener = null;
    const fill = (i) => {
      cur = (i + store.length) % store.length;
      const n = cur + 1;
      ['fb', 'fa', 'cb', 'ca'].forEach((k) => { imgs[k].src = $(`img[data-k="${k}"]`, store[cur]).src; });
      imgs.fb.alt = `Smile ${n}, before treatment`;
      imgs.fa.alt = `Smile ${n}, after treatment`;
      imgs.cb.alt = `Smile ${n}, teeth before treatment`;
      imgs.ca.alt = `Smile ${n}, teeth after treatment`;
      $('[data-case-n]', dlg).textContent = `Smile ${n}`;
      $('[data-case-of]', dlg).textContent = `of ${store.length}`;
    };
    const parts = () => $$('.case__col > img', dlg);
    const open = (i, from) => {
      opener = from;
      fill(i);
      dlg.hidden = false;
      lock(true);
      if (!reduce) {
        G.fromTo(dlg, {opacity: 0}, {opacity: 1, duration: 0.35, ease: 'power2.out'});
        G.fromTo(parts(), {opacity: 0, y: 24}, {opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out', delay: 0.05});
      }
      $('[data-case-close]', dlg).focus();
    };
    const close = () => {
      const done = () => { dlg.hidden = true; lock(false); if (opener) opener.focus({preventScroll: true}); };
      if (reduce) done();
      else G.to(dlg, {opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: done});
    };
    const step = (d) => {
      fill(cur + d);
      if (!reduce) G.fromTo(parts(), {opacity: 0, x: 20 * d}, {opacity: 1, x: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out'});
    };
    $$('[data-open-case]').forEach((b) => b.addEventListener('click', (e) => open(+b.dataset.openCase, e.currentTarget)));
    $('[data-case-close]', dlg).addEventListener('click', close);
    $('[data-case-prev]', dlg).addEventListener('click', () => step(-1));
    $('[data-case-next]', dlg).addEventListener('click', () => step(1));
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Tab') {
        const f = $$('button', dlg);
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    // balayage sur téléphone
    let x0 = null;
    dlg.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, {passive: true});
    dlg.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
      x0 = null;
    });
  }

  /* ——— Soins : accordéon ——— */
  let refreshT;
  const refreshSoon = () => { clearTimeout(refreshT); refreshT = setTimeout(() => ST.refresh(), 150); };
  function startAcc() {
    $$('.acc__btn').forEach((btn) => btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        panel.hidden = false;
        if (!reduce) {
          G.fromTo(panel, {height: 0}, {height: 'auto', duration: 0.7, ease: 'power3.inOut', clearProps: 'height', onComplete: refreshSoon});
          G.fromTo(panel.firstElementChild.children, {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', delay: 0.15});
        } else refreshSoon();
      } else if (reduce) {
        panel.hidden = true;
        refreshSoon();
      } else {
        G.to(panel, {height: 0, duration: 0.5, ease: 'power3.inOut', onComplete: () => { panel.hidden = true; G.set(panel, {clearProps: 'height'}); refreshSoon(); }});
      }
    }));
  }

  /* ——— Dentistes : biographie ——— */
  function startDoctors() {
    $$('[data-doc]').forEach((btn) => btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      const bio = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(open));
      btn.firstChild.textContent = open ? 'Close' : 'About';
      bio.hidden = !open;
      if (open && !reduce) G.fromTo(bio, {opacity: 0, y: -6}, {opacity: 1, y: 0, duration: 0.5, ease: 'power2.out'});
      refreshSoon();
    }));
  }

  /* ——— Assurances : la liste de leur page « finances », filtrée à la frappe ——— */
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
      if (!hits.length) res.innerHTML = `Not on our list. Call us at <a href="tel:+12394227924">${TEL}</a> and we’ll check for you.`;
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
      if (!reduce) G.fromTo(done.children, {opacity: 0, y: 16}, {opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out'});
    });
    $$('[required]', form).forEach((f) => f.addEventListener('input', () => { f.closest('.field').classList.remove('is-bad'); f.removeAttribute('aria-invalid'); }));
  }

  /* ——— Démarrage ——— */
  async function start() {
    await document.fonts.ready.catch(() => {});
    splits.forEach(splitLines);
    intro();
    startWall();
    startCase();
    startAcc();
    startDoctors();
    startInsurance();
    startForm();
    drifts();
    bleed();
    reveals();
    let w0 = innerWidth;
    let rt;
    addEventListener('resize', () => {
      if (innerWidth === w0) return;
      w0 = innerWidth;
      clearTimeout(rt);
      rt = setTimeout(() => {
        splits.forEach((el) => { const was = el.classList.contains('is-in'); splitLines(el); if (was) el.classList.add('is-in'); });
        ST.refresh();
      }, 200);
    });
    ST.refresh();
    onScroll();
    root.classList.add('is-ready');
  }
  start();
})();
