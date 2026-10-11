// D's Pool Care : l'eau verte qui s'éclaircit à l'ouverture, puis le reste du site.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const seg = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
  const smooth = (t) => t * t * (3 - 2 * t);
  const mix = (a, b, t) => a + (b - a) * t;
  let lenis = null;

  document.documentElement.classList.add('js');

  /* ——— L'ouverture : on fait défiler, l'eau passe du vert au laiteux puis au limpide ———
     Le fond du bassin (les lettres et la lumière du soleil) est toujours là ; au-dessus, une copie floue
     (l'eau trouble ne laisse rien voir de net) et le voile vert, qui s'effacent l'un après l'autre. */
  function pool(section) {
    if (!section) return Object.assign(() => {}, {measure() {}});
    const stage = $('.pool__stage', section);
    const murk = $('.pool__murk', section);
    const milk = $('.pool__milk', section);
    const clouds = $('.pool__clouds', section);
    const specks = $('.pool__specks', section);
    const haze = $('.pool__haze', section);
    const lights = $$('.pool__light', section);
    const question = $('.pool__question', section);
    const hint = $('.pool__hint', section);
    const LIGHT = [0.8, 0.28];
    let pinned = true;
    let range = 1;
    let last = -1;
    const measure = () => {
      pinned = getComputedStyle(stage).position === 'sticky';
      range = Math.max(1, section.offsetHeight - stage.offsetHeight);
      last = -1;
    };
    measure();
    new IntersectionObserver(([en]) => section.classList.toggle('is-off', !en.isIntersecting)).observe(section);

    const render = (top) => {
      // l'eau est limpide aux trois quarts du parcours épinglé, et le reste encore un moment
      const p = pinned ? clamp(-top / (range * 0.76), 0, 1) : 1;
      if (Math.abs(p - last) < 0.0004) return;
      last = p;
      // vert, puis laiteux (fondu entre deux couches), puis limpide ; au début, on devine à peine les lettres
      const toMilk = smooth(seg(p, 0.04, 0.5));
      milk.style.opacity = toMilk.toFixed(3);
      murk.style.opacity = (mix(0.9, 0.8, toMilk) * (1 - smooth(seg(p, 0.42, 0.9)))).toFixed(3);
      clouds.style.opacity = (1 - smooth(seg(p, 0.08, 0.55))).toFixed(3);
      specks.style.opacity = (1 - smooth(seg(p, 0.15, 0.5))).toFixed(3);
      haze.style.opacity = (1 - smooth(seg(p, 0.48, 0.92))).toFixed(3);
      const light = smooth(seg(p, 0.42, 1));
      lights.forEach((l, i) => { l.style.opacity = (light * LIGHT[i]).toFixed(3); });
      const q = smooth(seg(p, 0.1, 0.4));
      question.style.opacity = (1 - q).toFixed(3);
      question.style.transform = `translate3d(0, ${(-q * 28).toFixed(1)}px, 0)`;
      hint.style.opacity = (1 - seg(p, 0, 0.05)).toFixed(3);
      // les nuages et les particules ne bougent plus quand ils ont disparu, la lumière ne bouge pas sous l'eau verte
      section.classList.toggle('is-murky', light === 0);
      section.classList.toggle('is-clear', p >= 0.56);
    };
    render.measure = measure;
    return render;
  }

  /* ——— Les coches de l'entretien : elles se tracent quand on arrive à la ligne, l'une après l'autre ——— */
  function visits(list) {
    if (!list) return;
    const items = $$('.visit__item', list);
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach((i) => i.classList.add('is-done'));
      return;
    }
    let next = 0;
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        io.unobserve(en.target);
        const now = performance.now();
        next = Math.max(now, next + 170);
        setTimeout(() => en.target.classList.add('is-done'), next - now);
      }
    }, {rootMargin: '0px 0px -26% 0px'});
    items.forEach((i) => io.observe(i));
  }

  /* ——— La liste des prix : chaque ligne s'ouvre sur sa paire avant/après ——— */
  function fixes() {
    for (const li of $$('[data-fix]')) {
      const btn = $('.fix__row', li);
      const eager = () => $$('img', li).forEach((img) => { img.loading = 'eager'; });
      btn.addEventListener('pointerenter', eager, {once: true});
      btn.addEventListener('focus', eager, {once: true});
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        li.classList.toggle('is-open', open);
      });
    }
  }

  /* ——— Les rénovations : neuf chantiers ; on maintient la photo (ou le bouton) pour voir l'avant ——— */
  function viewer(root) {
    if (!root) return;
    const stage = $('[data-stage]', root);
    const shots = $$('[data-shot]', root);
    const picks = $$('.viewer__pick', root);
    const count = $('[data-count]', root);
    const tag = $('[data-tag]', root);
    const hold = $('[data-hold]', root);
    let cur = 0;
    let timer = 0;
    const load = (i) => $$('img', shots[i]).forEach((img) => { img.loading = 'eager'; });
    const before = (on) => {
      clearTimeout(timer);
      root.classList.toggle('is-before', on);
      hold.setAttribute('aria-pressed', String(on));
      tag.textContent = on ? 'Before' : 'After';
    };
    const show = (i) => {
      if (i === cur) return;
      before(false);
      shots[cur].classList.remove('is-on');
      cur = i;
      load(i);
      shots[i].classList.add('is-on');
      picks.forEach((p, j) => p.setAttribute('aria-pressed', String(j === i)));
      count.textContent = `Remodel ${i + 1} of ${shots.length}`;
    };
    picks.forEach((p, i) => {
      p.addEventListener('click', () => show(i));
      p.addEventListener('pointerenter', () => load(i), {once: true});
    });
    stage.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      // au doigt, un court délai : un simple défilement de la page ne montre pas l'avant
      if (e.pointerType === 'mouse') before(true);
      else timer = setTimeout(() => before(true), 140);
    });
    const release = () => before(false);
    for (const t of ['pointerup', 'pointercancel', 'pointerleave']) stage.addEventListener(t, release);
    stage.addEventListener('contextmenu', (e) => e.preventDefault());
    hold.addEventListener('keydown', (e) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      if (!e.repeat) before(true);
    });
    hold.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') release(); });
    hold.addEventListener('blur', release);
    hold.addEventListener('click', (e) => e.preventDefault());
    // une seule démonstration, quand la photo arrive à l'écran
    if (reduce || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      setTimeout(() => {
        if (root.classList.contains('is-before')) return;
        before(true);
        timer = setTimeout(release, 1400);
      }, 650);
    }, {threshold: 0.6});
    io.observe(stage);
  }

  /* ——— Ouvert ou fermé, à l'heure du Texas ——— */
  function openNow() {
    const parts = new Intl.DateTimeFormat('en-US', {timeZone: 'America/Chicago', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false}).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const day = get('weekday');
    const h = (Number(get('hour')) % 24) + Number(get('minute')) / 60;
    const weekday = !['Sat', 'Sun'].includes(day);
    const open = weekday && h >= 9 && h < 17;
    let text;
    if (open) text = 'Open now, until 5 PM Central Time.';
    else if (weekday && h < 9) text = 'Closed now, opens at 9 AM Central Time.';
    else if (day === 'Fri' || day === 'Sat' || day === 'Sun') text = 'Closed now, opens Monday at 9 AM Central Time.';
    else text = 'Closed now, opens tomorrow at 9 AM Central Time.';
    for (const el of $$('[data-open]')) {
      el.textContent = text;
      el.classList.toggle('is-open', open);
      el.classList.toggle('is-closed', !open);
    }
  }

  /* ——— Le formulaire : vérifié ici, puis envoyé par la messagerie du visiteur ——— */
  function form(f) {
    if (!f) return;
    const note = $('[data-form-note]', f);
    const rules = {
      name: (v) => v.trim().length > 1,
      phone: (v) => v.replace(/\D/g, '').length >= 10,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      zip: (v) => /^\d{5}(-?\d{4})?$/.test(v.trim()),
    };
    const check = (input) => {
      const ok = rules[input.name](input.value);
      input.setAttribute('aria-invalid', String(!ok));
      const err = input.parentElement.querySelector('.field__err');
      err.hidden = ok;
      if (!err.id) err.id = `err-${input.name}`;
      if (ok) input.removeAttribute('aria-describedby');
      else input.setAttribute('aria-describedby', err.id);
      return ok;
    };
    for (const name of Object.keys(rules)) {
      const input = f.elements[name];
      input.addEventListener('blur', () => { if (input.value) check(input); });
      input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') check(input); });
    }
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = Object.keys(rules).map((n) => f.elements[n]).filter((i) => !check(i));
      note.classList.remove('is-done', 'is-error');
      if (bad.length) {
        bad[0].focus();
        note.textContent = bad.length === 1 ? 'One field needs a fix before your email can be written.' : `${bad.length} fields need a fix before your email can be written.`;
        note.classList.add('is-error');
        return;
      }
      const d = Object.fromEntries(new FormData(f));
      const body = [`I need: ${d.need}`, '', d.message || '', '', `Name: ${d.name}`, `Phone: ${d.phone}`, `Email: ${d.email}`, `ZIP code: ${d.zip}`].join('\n');
      location.href = `mailto:Dallasdodson77@wecleanpools.com?subject=${encodeURIComponent(`Free estimate request: ${d.need}`)}&body=${encodeURIComponent(body)}`;
      note.textContent = 'Your email app should open with your request ready to send. If nothing opens, call (817) 845-3533 or write to Dallasdodson77@wecleanpools.com.';
      note.classList.add('is-done');
    });
    // « Ask about Pool School », « Get a free estimate » : le bon choix est déjà coché
    for (const a of $$('[data-need]')) {
      a.addEventListener('click', () => {
        const r = $$('input[name="need"]', f).find((i) => i.value === a.dataset.need);
        if (r) r.checked = true;
      });
    }
  }

  /* ——— Le menu du téléphone ——— */
  function menu() {
    const panel = $('[data-menu]');
    const openBtn = $('[data-menu-open]');
    const closeBtn = $('[data-menu-close]');
    if (!panel || !openBtn) return;
    const focusables = () => $$('a, button', panel);
    const close = (back = true) => {
      panel.hidden = true;
      openBtn.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      lenis?.start();
      if (back) openBtn.focus();
    };
    openBtn.addEventListener('click', () => {
      panel.hidden = false;
      openBtn.setAttribute('aria-expanded', 'true');
      document.documentElement.style.overflow = 'hidden';
      lenis?.stop();
      closeBtn.focus();
    });
    closeBtn.addEventListener('click', () => close());
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (e.shiftKey && document.activeElement === f[0]) { f[f.length - 1].focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { f[0].focus(); e.preventDefault(); }
    });
    for (const a of $$('a', panel)) a.addEventListener('click', () => close(false));
  }

  /* ——— La page de navigation courante, dans l'en-tête ——— */
  function current() {
    const links = new Map($$('[data-nav] a').map((a) => [a.getAttribute('href').slice(1), a]));
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        links.forEach((l) => l.removeAttribute('aria-current'));
        links.get(en.target.id)?.setAttribute('aria-current', 'true');
      }
    }, {rootMargin: '-45% 0px -50% 0px'});
    links.forEach((a, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  menu();

  /* ——— Défilement doux ——— */
  if (!reduce && window.Lenis) {
    lenis = new Lenis({lerp: 0.1});
    const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    // les liens internes passent par Lenis, en tenant compte de l'en-tête
    for (const a of $$('a[href^="#"]')) {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const target = id === '#top' ? 0 : $(id);
        if (target === null) return;
        e.preventDefault();
        // Lenis tient déjà compte du scroll-padding-top (la hauteur de l'en-tête), défini dans la feuille de styles
        lenis.scrollTo(target, {duration: 1.4, force: true});
        if (id !== '#top' && target.focus) {
          if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
          target.focus({preventScroll: true});
        }
      });
    }
  }

  /* ——— À chaque image du défilement : l'eau, l'en-tête et les boutons du bas ——— */
  const poolEl = $('[data-pool]');
  const estimate = $('#estimate');
  const hd = $('[data-hd]');
  const dock = $('[data-dock]');
  const renderPool = pool(poolEl);
  // les grandes photos : l'image glisse de quelques pour cent dans son cadre pendant qu'il traverse l'écran
  const drifts = reduce ? [] : $$('[data-drift]').map((fig) => ({fig, img: $('img', fig), top: 0, h: 1, last: NaN}));
  // les positions sont mesurées une fois (et de nouveau si la page change de taille) ; à chaque image du défilement,
  // on ne lit que scrollY : aucune mesure forcée de la mise en page pendant qu'on fait défiler
  const at = {poolTop: 0, poolH: 1, estTop: 0};
  const measure = () => {
    const y = scrollY;
    at.poolTop = poolEl.getBoundingClientRect().top + y;
    at.poolH = poolEl.offsetHeight;
    at.estTop = estimate.getBoundingClientRect().top + y;
    for (const d of drifts) {
      const r = d.fig.getBoundingClientRect();
      d.top = r.top + y;
      d.h = r.height;
      d.last = NaN;
    }
    renderPool.measure();
  };
  const frame = () => {
    const y = scrollY;
    const vh = innerHeight;
    const poolTop = at.poolTop - y;
    renderPool(poolTop);
    hd.classList.toggle('is-scrolled', y > 4);
    dock.classList.toggle('is-on', poolTop + at.poolH < vh * 0.35 && at.estTop - y > vh * 0.85);
    for (const d of drifts) {
      const top = d.top - y;
      if (top + d.h < -40 || top > vh + 40) continue;
      const t = clamp((top + d.h / 2 - vh / 2) / (vh / 2 + d.h / 2), -1, 1);
      if (Math.abs(t - d.last) < 0.002) continue;
      d.last = t;
      d.img.style.transform = `translate3d(0, ${(t * 4).toFixed(2)}%, 0) scale(1.1)`;
    }
  };
  if (lenis) lenis.on('scroll', frame);
  else {
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; frame(); });
    }, {passive: true});
  }
  const remeasure = () => { measure(); frame(); };
  addEventListener('resize', remeasure);
  // une ligne de prix qui s'ouvre, la police qui arrive : la page change de hauteur, on remesure
  if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(document.body);
  remeasure();

  const estLight = $('.estimate__light');
  if (estLight) new IntersectionObserver(([en]) => estimate.classList.toggle('is-off', !en.isIntersecting)).observe(estimate);

  visits($('[data-visit]'));
  fixes();
  viewer($('[data-viewer]'));
  openNow();
  setInterval(openNow, 60000);
  form($('[data-form]'));
  current();
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
