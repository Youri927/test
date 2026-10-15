/* Five Points Roofing : l'ouverture, le défilement, les trois toits, la règle des garanties et le formulaire. */
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  // les courbes des réponses aux gestes, les mêmes que --ease et --ease-io dans styles.css
  const EASE = 'cubic-bezier(0.2, 0.7, 0.1, 1)';

  /* ——— l'ouverture : quand la police est là (ou au bout de 1,2 s), les rampants, les mots, l'étoile ——— */
  const ready = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')));
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1200))]).then(ready);

  /* ——— le défilement : Lenis, sauf en mouvement réduit ——— */
  let lenis = null;
  if (!still.matches && typeof Lenis === 'function') {
    lenis = new Lenis({lerp: 0.11, wheelMultiplier: 0.95, anchors: false});
    const raf = (t) => (lenis.raf(t), requestAnimationFrame(raf));
    requestAnimationFrame(raf);
  }
  const top = $('[data-top]');
  const topH = () => top.offsetHeight;
  const go = (target) => {
    const y = target.getBoundingClientRect().top + window.scrollY - topH() - 12;
    if (lenis) lenis.scrollTo(Math.max(0, y), {duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3)});
    else window.scrollTo({top: Math.max(0, y), behavior: still.matches ? 'auto' : 'smooth'});
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    closeMenu();
    if (id === 'top') {
      lenis ? lenis.scrollTo(0, {duration: 1.1}) : window.scrollTo({top: 0, behavior: still.matches ? 'auto' : 'smooth'});
    } else go(target);
    history.replaceState(null, '', `#${id}`);
    // le focus suit le lien, sans faire sauter la page
    if (id !== 'top') {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({preventScroll: true});
    }
  });

  /* ——— l'en-tête : un filet sous lui dès qu'on a quitté le haut ; la partie courante dans le menu ——— */
  const onScroll = () => top.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, {passive: true});
  onScroll();
  const links = $$('.nav a');
  // toutes les parties : sur l'accueil, la zone ou le formulaire, aucun lien du menu n'est allumé
  const seen = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        for (const a of links) {
          if (a.hash === `#${en.target.id}`) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        }
      }
    },
    {rootMargin: '-45% 0px -50% 0px'},
  );
  $$('main > section[id]').forEach((s) => seen.observe(s));

  /* ——— le menu du téléphone ——— */
  const menuBtn = $('[data-menu]');
  const panel = $('[data-panel]');
  function closeMenu() {
    if (panel.hidden) return;
    panel.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = 'Menu';
  }
  menuBtn.addEventListener('click', () => {
    const open = panel.hidden;
    panel.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    if (open) $('a', panel).focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) (closeMenu(), menuBtn.focus());
  });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== menuBtn) closeMenu();
  });

  /* ——— trois sortes de toits : une seule ligne de toit, qui passe des deux pignons d'une maison au toit bas d'un
         mobile-home puis au toit plat d'un bâtiment commercial ——— */
  const ROOFS = {
    home: [[90, 250], [230, 180], [300, 215], [470, 130], [590, 190], [650, 220], [710, 250]],
    mobile: [[70, 232], [180, 229], [290, 227], [400, 226], [510, 227], [620, 229], [730, 232]],
    commercial: [[60, 196], [84, 196], [84, 224], [400, 224], [716, 224], [716, 196], [740, 196]],
  };
  // les endroits où chaque toit fuit, dans l'ordre de la liste : la pastille (x, y), puis l'endroit montré (x, y)
  const SPOTS = {
    home: [[380, 104, 380, 146], [642, 130, 603, 191], [512, 92, 519, 146], [300, 160, 300, 209]],
    mobile: [[270, 166, 270, 203], [532, 166, 532, 206], [400, 166, 400, 219], [476, 292, 431, 255]],
    commercial: [[263, 150, 263, 207], [400, 166, 400, 217], [652, 150, 599, 216], [776, 300, 753, 249]],
  };
  const tablist = $('[data-tabs]');
  const tabs = $$('[role="tab"]', tablist);
  const bar = $('[data-bar]', tablist);
  const profile = $('[data-profile]');
  const roofPath = $('[data-roof]');
  const bodyPath = $('[data-body]');
  // les murs de chaque bâtiment : gauche, droite, bas (le mobile-home est posé sur sa jupe)
  const WALLS = {home: [130, 670, 360], mobile: [96, 704, 334], commercial: [60, 740, 360]};
  const dots = $('[data-dots]');
  const keyOf = (tab) => tab.id.replace('tab-', '');
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (name, attrs) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  let current = 0;
  let key = 'home';

  // les repères du toit affiché, reliés à la liste : survoler l'un allume l'autre
  const spotItems = () => $$('.spots li', $(`[data-panel-of="${key}"]`));
  const hot = (i, on) => {
    const li = spotItems()[i];
    if (li) li.classList.toggle('is-hot', on);
    const g = $(`[data-dot="${i}"]`, dots);
    if (g) g.classList.toggle('is-hot', on);
  };
  // les pastilles gardent au moins 13 px de rayon à l'écran : plus grandes dans le dessin quand il est petit
  const radius = () => Math.min(30, Math.max(17, 13 / Math.max(0.01, profile.getBoundingClientRect().width / 784)));
  let r = 17;
  const drawSpots = (k) => {
    r = radius();
    dots.replaceChildren(
      ...SPOTS[k].map(([cx, cy, tx, ty], i) => {
        const g = svg('g', {class: 'dot', 'data-dot': i});
        const dx = tx - cx;
        const dy = ty - cy;
        const len = Math.hypot(dx, dy);
        const n = svg('text', {x: cx, y: cy + 1});
        n.textContent = String(i + 1);
        n.style.fontSize = `${(r * 1.18).toFixed(1)}px`;
        g.append(
          svg('line', {x1: (cx + (dx / len) * r).toFixed(1), y1: (cy + (dy / len) * r).toFixed(1), x2: tx, y2: ty}),
          svg('circle', {class: 'dot__at', cx: tx, cy: ty, r: (r * 0.21).toFixed(1)}),
          svg('circle', {class: 'dot__n', cx, cy, r: r.toFixed(1)}),
          n,
        );
        g.addEventListener('pointerenter', () => hot(i, true));
        g.addEventListener('pointerleave', () => hot(i, false));
        return g;
      }),
    );
  };
  $$('.spots').forEach((list) =>
    $$('li', list).forEach((li, i) => {
      li.addEventListener('pointerenter', () => hot(i, true));
      li.addEventListener('pointerleave', () => hot(i, false));
    }),
  );

  // la ligne de toit se transforme point par point (les sept points restent dans l'ordre, rien ne se croise) ; le
  // corps du bâtiment la suit, entre ses murs
  let pts = ROOFS.home.map((p) => p.slice());
  let walls = WALLS.home.slice();
  const toD = (p) => 'M' + p.map(([x, y]) => `${+x.toFixed(1)} ${+y.toFixed(1)}`).join(' L');
  const yAt = (p, x) => {
    for (let i = 1; i < p.length; i++) {
      const [x0, y0] = p[i - 1];
      const [x1, y1] = p[i];
      if (x >= x0 && x <= x1) return x1 === x0 ? Math.min(y0, y1) : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
    return p[x < p[0][0] ? 0 : p.length - 1][1];
  };
  const bodyD = (p, [xl, xr, yb]) =>
    toD([[xl, yb], [xl, yAt(p, xl)], ...p.filter(([x]) => x > xl + 0.01 && x < xr - 0.01), [xr, yAt(p, xr)], [xr, yb]]) + ' Z';
  const paint = () => {
    roofPath.setAttribute('d', toD(pts));
    bodyPath.setAttribute('d', bodyD(pts, walls));
  };
  const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let frame = 0;
  const morph = (k, done) => {
    cancelAnimationFrame(frame);
    const from = pts.map((p) => p.slice());
    const to = ROOFS[k];
    const wFrom = walls.slice();
    const wTo = WALLS[k];
    if (still.matches) {
      pts = to.map((p) => p.slice());
      walls = wTo.slice();
      paint();
      done();
      return;
    }
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / 780);
      const e = inOut(t);
      pts = from.map(([x, y], i) => [x + (to[i][0] - x) * e, y + (to[i][1] - y) * e]);
      walls = wFrom.map((v, i) => v + (wTo[i] - v) * e);
      paint();
      if (t < 1) frame = requestAnimationFrame(step);
      else done();
    };
    frame = requestAnimationFrame(step);
  };

  // l'indicateur de l'onglet choisi s'étire jusqu'au nouvel onglet, puis le rejoint
  const box = (tab) => ({left: tab.offsetLeft, top: tab.offsetTop, width: tab.offsetWidth, height: tab.offsetHeight});
  const px = (b) => ({left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, height: `${b.height}px`});
  const setBar = (from, to, animate) => {
    const a = box(tabs[from]);
    const b = box(tabs[to]);
    bar.getAnimations().forEach((x) => x.cancel());
    Object.assign(bar.style, px(b));
    if (!animate || still.matches || from === to || a.top !== b.top) return;
    const mid = b.left > a.left ? {...a, width: b.left + b.width - a.left} : {...b, width: a.left + a.width - b.left};
    bar.animate(
      [
        {...px(a), easing: 'cubic-bezier(0.3, 0, 0.2, 1)'},
        {...px(mid), offset: 0.45, easing: 'cubic-bezier(0.5, 0, 0.1, 1)'},
        px(b),
      ],
      {duration: 600},
    );
  };
  const placeBar = () => setBar(current, current, false);
  new ResizeObserver(placeBar).observe(tablist);
  if (document.fonts) document.fonts.ready.then(placeBar);

  const select = (i, focus = false) => {
    if (focus) tabs[i].focus();
    if (i === current) return;
    finishDraw();
    setBar(current, i, true);
    current = i;
    key = keyOf(tabs[i]);
    tabs.forEach((t, n) => {
      const on = n === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $(`#${t.getAttribute('aria-controls')}`).hidden = !on;
    });
    const shown = $(`[data-panel-of="${key}"]`);
    if (!still.matches) shown.animate([{opacity: 0}, {opacity: 1}], {duration: 380, easing: 'ease-out'});
    $$('[data-set]').forEach((g) => g.classList.toggle('is-on', g.dataset.set === key && !g.hasAttribute('data-late')));
    dots.classList.add('is-out');
    morph(key, () => {
      drawSpots(key);
      $$(`[data-late][data-set="${key}"]`).forEach((g) => g.classList.add('is-on'));
      dots.classList.remove('is-out');
    });
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
  tablist.addEventListener('keydown', (e) => {
    const n = tabs.length;
    const i = {ArrowRight: (current + 1) % n, ArrowLeft: (current - 1 + n) % n, Home: 0, End: n - 1}[e.key];
    if (i === undefined) return;
    e.preventDefault();
    select(i, true);
  });
  drawSpots(key);
  new ResizeObserver(() => {
    if (Math.abs(radius() - r) > 0.5) drawSpots(key);
  }).observe(profile);

  // la première fois qu'on le voit, le dessin se trace : la ligne de toit des avant-toits au faîte, la maison, puis
  // les repères un à un
  let drawing = [];
  let drawn = still.matches;
  const homeSet = $('[data-set="home"]');
  function finishDraw() {
    if (drawn) return;
    drawn = true;
    // les styles posés pour l'attente, puis les animations (qui gardent leur état final tant qu'on ne les annule pas)
    roofPath.style.strokeDasharray = '';
    roofPath.style.strokeDashoffset = '';
    homeSet.style.opacity = '';
    bodyPath.style.opacity = '';
    dots.style.opacity = '';
    drawing.forEach((a) => a.cancel());
  }
  if (!drawn) {
    const len = roofPath.getTotalLength();
    roofPath.style.strokeDasharray = `${len}`;
    roofPath.style.strokeDashoffset = `${len}`;
    homeSet.style.opacity = '0';
    bodyPath.style.opacity = '0';
    dots.style.opacity = '0';
    new IntersectionObserver(
      (entries, ob) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        ob.disconnect();
        if (drawn) return;
        const roof = roofPath.animate([{strokeDashoffset: len}, {strokeDashoffset: 0}], {duration: 1300, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'forwards'});
        const house = [homeSet, bodyPath].map((el) => el.animate([{opacity: 0}, {opacity: 1}], {duration: 700, delay: 500, easing: 'ease-out', fill: 'forwards'}));
        dots.style.opacity = '';
        const pins = $$('.dot', dots).map((g, n) =>
          g.animate([{opacity: 0, transform: 'translateY(-8px)'}, {opacity: 1, transform: 'none'}], {duration: 420, delay: 1050 + n * 130, easing: EASE, fill: 'backwards'}),
        );
        drawing = [roof, ...house, ...pins];
        Promise.all(drawing.map((a) => a.finished)).then(finishDraw, () => null);
      },
      {threshold: 0.35},
    ).observe(profile);
  }

  /* ——— les photos qui se découvrent, la ligne du temps, le toit du pied de page : une fois, quand on y arrive ——— */
  const once = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        const el = en.target;
        once.unobserve(el);
        const img = el.matches('.shot--wipe') ? $('img', el) : null;
        if (!img) {
          el.classList.add('is-in');
          continue;
        }
        // le biais suit la pente du toit à la taille affichée ; la photo ne se découvre qu'une fois décodée
        if (img.clientHeight) el.style.setProperty('--k', `${((50 * img.clientWidth) / img.clientHeight).toFixed(1)}%`);
        img.loading = 'eager';
        (img.decode ? img.decode() : Promise.resolve()).catch(() => null).then(() => el.classList.add('is-in'));
      }
    },
    {rootMargin: '0px 0px -12% 0px', threshold: 0.15},
  );
  $$('.shot--wipe, [data-line], [data-call]').forEach((el) => once.observe(el));
  // une photo entièrement masquée n'est jamais chargée par le navigateur (chargement différé) : on la demande un
  // peu avant qu'elle arrive à l'écran
  const near = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        near.unobserve(en.target);
        $('img', en.target).loading = 'eager';
      }
    },
    {rootMargin: '900px 0px'},
  );
  $$('.shot--wipe').forEach((el) => near.observe(el));

  // la rangée de photos se fait défiler du doigt au téléphone : elle prend alors le focus du clavier
  const job = $('.job');
  new ResizeObserver(() => {
    if (job.scrollWidth > job.clientWidth + 1) job.setAttribute('tabindex', '0');
    else job.removeAttribute('tabindex');
  }).observe(job);

  /* ——— les questions s'ouvrent et se ferment en douceur ——— */
  $$('.faq details').forEach((d) => {
    const sum = $('summary', d);
    let anim = null;
    sum.addEventListener('click', (e) => {
      if (still.matches) return;
      e.preventDefault();
      const opening = !d.open || d.classList.contains('is-closing');
      const from = d.getBoundingClientRect().height;
      if (anim) anim.cancel();
      d.classList.toggle('is-closing', !opening);
      if (opening) d.open = true;
      const to = opening ? d.getBoundingClientRect().height : sum.getBoundingClientRect().height + parseFloat(getComputedStyle(d).borderTopWidth);
      d.style.overflow = 'hidden';
      anim = d.animate({height: [`${from}px`, `${to}px`]}, {duration: 420, easing: EASE});
      if (opening) $('p', d).animate([{opacity: 0}, {opacity: 1}], {duration: 380, delay: 90, easing: 'ease-out', fill: 'backwards'});
      anim.onfinish = () => {
        anim = null;
        d.style.overflow = '';
        if (d.classList.contains('is-closing')) {
          d.classList.remove('is-closing');
          d.open = false;
        }
      };
    });
  });

  /* ——— les garanties : les barres s'allongent jusqu'à leur durée, une fois ——— */
  const ruler = $('[data-ruler]');
  new IntersectionObserver(
    (entries, ob) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      ruler.classList.add('is-in');
      ob.disconnect();
    },
    {rootMargin: '0px 0px -20% 0px', threshold: 0.2},
  ).observe(ruler);

  /* ——— le formulaire : il écrit l'e-mail de la demande ——— */
  const TO = 'fivepointsroofingfl@gmail.com';
  const form = $('[data-form]');
  const field = (n) => form.elements[n];
  function setError(which, on) {
    const err = $(`#err-${which}`, form);
    if (err) err.hidden = !on;
    const targets = which === 'reach' ? [field('phone'), field('email')] : which === 'kind' ? [] : [field(which)];
    targets.forEach((el) => el && el.setAttribute('aria-invalid', String(on)));
  }
  form.addEventListener('change', (e) => {
    if (e.target.name === 'kind') setError('kind', false);
  });
  ['address', 'name', 'phone', 'email'].forEach((n) =>
    field(n).addEventListener('input', () => {
      if ((n === 'address' || n === 'name') && field(n).value.trim()) setError(n, false);
      if ((n === 'phone' || n === 'email') && (field('phone').value.trim() || field('email').value.trim())) setError('reach', false);
    }),
  );
  const value = (n) => {
    const el = field(n);
    if (!el) return '';
    return (el instanceof RadioNodeList ? el.value : el.value || '').trim();
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = [];
    const kind = value('kind');
    const address = value('address');
    const name = value('name');
    const phone = value('phone');
    const email = value('email');
    const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!kind) (setError('kind', true), bad.push(form.querySelector('input[name="kind"]')));
    if (!address) (setError('address', true), bad.push(field('address')));
    if (!name) (setError('name', true), bad.push(field('name')));
    if ((!phone && !email) || !emailOk) {
      const err = $('#err-reach', form);
      err.textContent = emailOk
        ? 'Enter a phone number or an email address, so we can reach you.'
        : 'Check the email address: it should look like name@example.com.';
      setError('reach', true);
      bad.push(emailOk ? field('phone') : field('email'));
    }
    if (bad.length) {
      bad[0].focus();
      return;
    }
    const need = value('need');
    const message = value('message');
    const subject = `Free estimate request: ${(need || 'roof').toLowerCase()}, ${kind.toLowerCase()}`;
    const text = [
      'Hello,',
      '',
      'I would like a free estimate for a roof.',
      '',
      `Property: ${kind}`,
      need ? `Need: ${need}` : null,
      `Address: ${address}`,
      `Name: ${name}`,
      phone ? `Phone: ${phone}` : null,
      email ? `Email: ${email}` : null,
      message ? `\nAbout the roof:\n${message}` : null,
      '',
      'Thank you,',
      name,
    ]
      .filter((l) => l !== null)
      .join('\n');
    const sheet = $('[data-ready]', form);
    $('[data-ready-text]', sheet).textContent = `To: ${TO}\nSubject: ${subject}\n\n${text}`;
    $('[data-copied]', sheet).textContent = '';
    sheet.hidden = false;
    sheet.focus({preventScroll: true});
    go(sheet);
    // la demande arrive en montant un peu (après le calcul du défilement, qui mesure sa place sans ce décalage)
    if (!still.matches) sheet.animate([{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 500, easing: EASE});
    window.location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  });
  $('[data-copy]', form).addEventListener('click', async () => {
    const out = $('[data-copied]', form);
    const all = $('[data-ready-text]', form).textContent;
    try {
      await navigator.clipboard.writeText(all);
      out.textContent = `Copied. Paste it into an email to ${TO}.`;
    } catch {
      const range = document.createRange();
      range.selectNodeContents($('[data-ready-text]', form));
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      out.textContent = navigator.platform.includes('Mac') ? 'Selected. Press Cmd+C to copy.' : 'Selected. Press Ctrl+C to copy.';
    }
  });
})();
