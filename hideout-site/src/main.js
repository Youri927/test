/* Hideout Boutique : l'ouverture (le cadre du logo qui s'ouvre sur la photo), le défilement, le menu, la réservation
   Boulevard, la carte des soins, les résultats et leur visionneuse, Beauty Bank, les cadres qui se tracent, la barre
   du téléphone. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
  const OPEN = 'cubic-bezier(0.72, 0, 0.18, 1)'; // lent au départ, franc au milieu, posé à l'arrivée

  /* ——— défilement doux, et les liens vers les sections ——— */
  let lenis = null;
  if (!still && window.Lenis) {
    lenis = new window.Lenis({lerp: 0.12});
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
  // la place laissée sous l'en-tête vient du scroll-padding-top de la page, que Lenis et scrollIntoView respectent
  const go = (target) => {
    if (lenis) lenis.scrollTo(target, {duration: 1.1});
    else target.scrollIntoView({behavior: still ? 'auto' : 'smooth'});
  };

  /* ——— en-tête : un filet sous l'en-tête dès qu'on a défilé ——— */
  const top = $('[data-top]');
  const onScroll = () => top && top.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, {passive: true});
  onScroll();

  /* ——— menu du téléphone ——— */
  const menu = $('[data-menu]');
  const openBtn = $('[data-menu-open]');
  const closeBtn = $('[data-menu-close]');
  let lastFocus = null;
  // pendant que le menu est ouvert, le reste de la page ne prend ni le focus ni le lecteur d'écran
  const behind = () => $$('[data-top], main, .foot, [data-dock]');
  const openMenu = () => {
    lastFocus = document.activeElement;
    menu.hidden = false;
    behind().forEach((el) => (el.inert = true));
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    closeBtn.focus();
  };
  const closeMenu = (restore = true) => {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    behind().forEach((el) => (el.inert = false));
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    if (restore && lastFocus) lastFocus.focus();
  };
  if (menu) {
    openBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', () => closeMenu());
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
      if (e.key !== 'Tab') return;
      const items = $$('a, button', menu);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
    // le menu n'existe qu'au téléphone : s'il reste ouvert quand l'écran s'élargit, on le referme
    matchMedia('(min-width: 961px)').addEventListener('change', (e) => e.matches && closeMenu(false));
  }

  /* ——— la réservation : leur Boulevard ———
     Leur script ouvre sa fenêtre de réservation sur tout lien #book-now : par-dessus la page sur un ordinateur, dans
     un onglet sur un téléphone. Il n'est chargé que si l'on montre l'intention de réserver (survol ou focus d'un
     bouton « Book now »), et seulement sur un ordinateur : sur un téléphone, il ne ferait qu'ouvrir un onglet, ce que
     le bouton fait directement. Hors ligne (fichier ouvert en local) ou si le script ne vient pas, le bouton ouvre
     leur page Boulevard. */
  const BLVD_ID = '0ea549c5-d351-4e65-bc4a-8492e5fc065e';
  const BLVD_URL = 'https://www.joinblvd.com/b/hideout-boutique/widget';
  const online = /^https?:$/.test(location.protocol);
  // le même critère que leur script pour choisir l'onglet plutôt que la fenêtre
  const phoneLike = () => /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile|Silk|Kindle/i.test(navigator.userAgent) || innerWidth <= 800;
  let blvd = 'idle';
  const loadBlvd = () => {
    if (blvd !== 'idle' || !online || phoneLike()) return;
    blvd = 'loading';
    const s = document.createElement('script');
    s.src = 'https://static.joinboulevard.com/injector.min.js';
    s.async = true;
    s.onload = () => {
      try {
        // à la fin de son installation, leur script ouvre sa fenêtre si l'adresse est déjà sur #book-now
        window.blvd.init({businessId: BLVD_ID});
        blvd = 'ready';
      } catch {
        blvd = 'failed';
      }
    };
    s.onerror = () => {
      blvd = 'failed';
      // un clic attendait le script : on part sur leur page de réservation
      if (location.hash === '#book-now') location.assign(BLVD_URL);
    };
    document.head.append(s);
  };
  document.addEventListener('pointerover', (e) => e.target.closest?.('[data-book]') && loadBlvd(), {passive: true});
  document.addEventListener('focusin', (e) => e.target.closest?.('[data-book]') && loadBlvd());
  // la fenêtre Boulevard ouverte, la page dessous ne défile plus
  addEventListener('hashchange', () => {
    if (!lenis) return;
    if (location.hash === '#book-now') lenis.stop();
    else lenis.start();
  });

  document.addEventListener('click', (e) => {
    const book = e.target.closest('[data-book]');
    if (book) {
      closeMenu(false);
      if (blvd === 'idle') loadBlvd();
      // prêt ou en route : le lien met l'adresse sur #book-now, et Boulevard ouvre sa fenêtre dès qu'il est là
      if (blvd === 'ready' || blvd === 'loading') return;
      e.preventDefault();
      window.open(BLVD_URL, '_blank', 'noopener');
      return;
    }
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    closeMenu(false);
    go(target);
    history.replaceState(null, '', `#${id}`);
    // le focus suit le défilement : la touche Tab repart de la section, et le lien d'évitement mène bien au contenu
    if (!target.matches('a[href], button, input, textarea, select, [tabindex]')) target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
  });

  /* ——— l'ouverture ———
     Le logo se pose au centre et son cadre se trace depuis le milieu. Le nom s'efface, la photo s'ouvre dans le cadre
     resté seul, comme un volet, puis le cadre s'agrandit jusqu'à elle ; l'en-tête arrive, le titre et le texte se
     découvrent de gauche à droite. 2 s, une fois.
     Rien ne déplace la mise en page : le cadre est agrandi par transformation (son trait reste constant), la photo
     et le texte sont découverts par des masques. Une touche, un clic ou un défilement achèvent tout aussitôt. */
  const introDone = () => {
    root.classList.remove('intro');
    $('[data-intro-logo]')?.remove();
  };
  const intro = () => {
    const logo = $('[data-intro-logo]');
    const svg = logo && $('svg', logo);
    const media = $('[data-hero-media]');
    const photo = $('[data-hero-photo]');
    const frame = $('[data-hero-frame]');
    const path = frame && $('path', frame);
    const title = $('[data-hero-title]');
    const row = $('[data-hero-row]');
    const cap = $('.hero__cap');
    // (pas de zoom sur la photo : une image animée n'est comptée comme affichée qu'à la fin de son animation)
    if (!svg || !media || !photo || !frame || !path || !Element.prototype.animate) return introDone();

    // le cadre du logo dans la page : viewBox 120 119 870 321, cadre de x 195 à 913,5 et de y 123 à 435,5
    const s = svg.getBoundingClientRect();
    const m = media.getBoundingClientRect();
    const f = frame.getBoundingClientRect(); // sa place finale, autour de la photo
    const k = s.width / 870;
    const sx0 = s.left + (195 - 120) * k;
    const sy0 = s.top + (123 - 119) * k;
    const sw = 718.5 * k;
    const sh = 312.5 * k;
    const from = `translate(${(sx0 - f.left).toFixed(2)}px, ${(sy0 - f.top).toFixed(2)}px) scale(${(sw / f.width).toFixed(5)}, ${(sh / f.height).toFixed(5)})`;
    const bw = `${(8.5 * k).toFixed(2)}px`;
    // la photo se découvre à l'intérieur du cadre, à mesure qu'il s'ouvre
    const inset = (t, r, b, l) => `inset(${Math.max(0, t)}px ${Math.max(0, r)}px ${Math.max(0, b)}px ${Math.max(0, l)}px)`;
    const p = 8.5 * k + 2;
    const clip0 = inset(sy0 - m.top + p, m.right - (sx0 + sw) + p, m.bottom - (sy0 + sh) + p, sx0 - m.left + p);
    // avant : un trait à mi-hauteur du cadre du logo, d'où la photo s'ouvre comme un volet
    const mid = sy0 + sh / 2 - m.top;
    const line = inset(mid, m.right - (sx0 + sw) + p, m.height - mid, sx0 - m.left + p);

    const anims = [];
    const run = (el, kf, o) => {
      const a = el.animate(kf, {fill: 'both', ...o});
      anims.push(a);
      return a;
    };
    // 1. le logo se pose, son cadre se trace du milieu vers les coins
    run(logo, [{opacity: 0, transform: 'translate(-50%, -50%) scale(0.985)'}, {opacity: 1, transform: 'translate(-50%, -50%) scale(1)'}], {duration: 500, easing: EASE});
    run(frame, [{opacity: 1}, {opacity: 1}], {duration: 10});
    run(frame, [{clipPath: 'inset(-12px 50% -12px 50%)'}, {clipPath: 'inset(-12px -12px -12px -12px)'}], {duration: 600, delay: 80, easing: EASE});
    // 2. le nom s'efface, le cadre reste seul
    run(logo, [{opacity: 1}, {opacity: 0}], {duration: 220, delay: 600, easing: 'cubic-bezier(0.4, 0, 0.6, 1)', fill: 'forwards'});
    // 3. la photo s'ouvre dans le cadre (300 ms, à partir d'un trait à mi-hauteur), puis s'agrandit avec lui
    const T = 1000;
    run(
      photo,
      [
        {clipPath: line, easing: EASE},
        {clipPath: clip0, offset: 0.23, easing: OPEN},
        {clipPath: inset(0, 0, 0, 0)},
      ],
      {duration: 1300, delay: T - 300},
    );
    run(frame, [{transformOrigin: '0 0', transform: from}, {transformOrigin: '0 0', transform: 'none'}], {duration: 1000, delay: T, easing: OPEN});
    run(path, [{strokeWidth: bw}, {strokeWidth: '2px'}], {duration: 1000, delay: T, easing: OPEN});
    // 4. l'en-tête ; le titre, puis le texte et les boutons, puis la légende, se découvrent de gauche à droite
    // derrière un masque au bord adouci (ni fondu ni glissement : le texte compte comme affiché dès le départ, la
    // page ne bouge pas). Tout se pose avec le cadre, à 2 s.
    if (top) run(top, [{opacity: 0, transform: 'translateY(-8px)'}, {opacity: 1, transform: 'none'}], {duration: 550, delay: T + 450, easing: EASE});
    const wipe = 'linear-gradient(90deg, #000 0 40%, transparent 60% 100%)';
    const mask = (pos) => ({maskImage: wipe, webkitMaskImage: wipe, maskSize: '250% 100%', webkitMaskSize: '250% 100%', maskPosition: `${pos} 0`, webkitMaskPosition: `${pos} 0`});
    const W = 'cubic-bezier(0.35, 0.1, 0.2, 1)';
    if (title) run(title, [mask('100%'), mask('0%')], {duration: 900, delay: T + 100, easing: W});
    if (row) run(row, [mask('100%'), mask('0%')], {duration: 750, delay: T + 250, easing: W});
    if (cap) run(cap, [mask('100%'), mask('0%')], {duration: 600, delay: T + 400, easing: W});

    let over = false;
    const finish = () => {
      if (over) return;
      over = true;
      anims.forEach((a) => {
        try {
          a.finish();
        } catch {}
      });
      ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((t) => removeEventListener(t, finish));
      // l'état final reste celui de la feuille de style : on retire ce que l'ouverture a posé
      requestAnimationFrame(() => {
        introDone();
        anims.forEach((a) => a.cancel());
      });
    };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((t) => addEventListener(t, finish, {passive: true}));
    Promise.all(anims.map((a) => a.finished)).then(finish, finish);
  };
  // le logo est un dessin vectoriel : l'ouverture n'attend pas la police (le titre, masqué, ne se découvre qu'à 1,1 s)
  if (root.classList.contains('intro')) requestAnimationFrame(intro);

  /* ——— la carte des soins ——— */
  const svc = $('.svc');
  const view = $('[data-view]');
  const fams = $$('.fam');
  // les lettres de chaque famille, pour qu'elles s'élargissent l'une après l'autre ; le nom reste lisible d'un bloc
  for (const el of $$('[data-split]')) {
    const text = el.textContent.trim();
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = text;
    const vis = document.createElement('span');
    vis.setAttribute('aria-hidden', 'true');
    let i = 0;
    text.split(' ').forEach((word, n) => {
      if (n) vis.append(' ');
      const w = document.createElement('span');
      w.className = 'w';
      for (const ch of word) {
        const c = document.createElement('span');
        c.textContent = ch;
        c.style.setProperty('--i', i++);
        w.append(c);
      }
      vis.append(w);
    });
    el.replaceChildren(sr, vis);
  }
  // le cadre passe sur la photo de la famille montrée
  const frameView = view && $('.frame--view', view);
  let active = fams[0]?.dataset.fam;
  const setActive = (name) => {
    if (!name || name === active) return;
    active = name;
    fams.forEach((f) => f.classList.toggle('is-active', f.dataset.fam === name));
    if (!view) return;
    $$('[data-for]', view).forEach((el) => el.classList.toggle('is-on', el.dataset.for === name));
    if (frameView && !still) {
      frameView.classList.remove('is-focus');
      void frameView.offsetWidth;
      frameView.classList.add('is-focus');
    }
  };
  fams[0]?.classList.add('is-active');
  const toggle = (fam, open) => {
    const btn = $('[data-fam-btn]', fam);
    const panel = $('[data-fam-panel]', fam);
    btn.setAttribute('aria-expanded', String(open));
    if (open) setActive(fam.dataset.fam);
    if (still || !panel.animate) {
      panel.hidden = !open;
      return;
    }
    // une ouverture interrompue repart de la hauteur où elle en était
    const from = panel.hidden ? 0 : panel.getBoundingClientRect().height;
    panel.getAnimations().forEach((a) => a.cancel());
    panel.hidden = false;
    const to = open ? panel.scrollHeight : 0;
    const a = panel.animate([{height: `${from}px`}, {height: `${to}px`}], {duration: open ? 560 : 420, easing: EASE});
    a.onfinish = () => {
      if (!open) panel.hidden = true;
    };
  };
  for (const fam of fams) {
    const btn = $('[data-fam-btn]', fam);
    const panel = $('[data-fam-panel]', fam);
    panel.hidden = true;
    btn.addEventListener('click', () => toggle(fam, btn.getAttribute('aria-expanded') !== 'true'));
    btn.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && setActive(fam.dataset.fam));
    btn.addEventListener('focus', () => setActive(fam.dataset.fam));
    // au téléphone, la photo de la famille ouvre son panneau, dans le même cadre (une copie de l'image de la vue)
    const src = view && $(`img[data-for="${fam.dataset.fam}"]`, view);
    const capt = view && $(`.svc__cap [data-for="${fam.dataset.fam}"]`, view);
    if (src) {
      const fig = document.createElement('figure');
      fig.className = 'fam__shot';
      fig.setAttribute('aria-hidden', 'true');
      const box = document.createElement('div');
      box.className = 'fam__media';
      const im = src.cloneNode();
      im.className = 'svc__img';
      im.removeAttribute('data-for');
      box.append(im);
      box.insertAdjacentHTML('beforeend', '<svg class="frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 23.6V0H100V23.6M0 76.4V100H100V76.4"/></svg>');
      fig.append(box);
      if (capt) {
        const fc = document.createElement('figcaption');
        fc.textContent = capt.textContent;
        fig.append(fc);
      }
      panel.prepend(fig);
    }
  }

  // partir d'une préoccupation : leurs trois pages (rides, acné, taches), et les soins qu'elles conseillent
  const out = $('[data-concern-out]');
  const LABEL = {lines: 'lines and wrinkles', acne: 'acne', spots: 'dark spots and discoloration'};
  const NOTE = {acne: 'Care at home matters as much: we’ll set you up with medical-grade products.'};
  const chips = $$('[data-concern] .chip');
  const showConcern = (c) => {
    chips.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === c)));
    $$('.tx').forEach((t) => t.classList.toggle('is-match', !!c && (t.dataset.c || '').split(' ').includes(c)));
    svc.classList.toggle('has-concern', !!c);
    if (!c) {
      out.replaceChildren();
      return;
    }
    const hits = $$('.tx.is-match');
    const byFam = new Map();
    for (const t of hits) {
      const f = t.closest('.fam');
      if (!byFam.has(f)) byFam.set(f, []);
      byFam.get(f).push($('.tx__name', t).textContent);
    }
    const lead = document.createElement('p');
    lead.className = 'concern__lead';
    lead.textContent = `For ${LABEL[c]}: ${hits.length} treatments to start with.`;
    const ul = document.createElement('ul');
    ul.className = 'concern__fams';
    ul.setAttribute('role', 'list');
    for (const [f, names] of byFam) {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'concern__go';
      b.textContent = $('.fam__name .sr-only', f).textContent;
      b.addEventListener('click', () => {
        const btn = $('[data-fam-btn]', f);
        if (btn.getAttribute('aria-expanded') !== 'true') toggle(f, true);
        setActive(f.dataset.fam);
        go(f);
        btn.focus({preventScroll: true});
      });
      li.append(b, document.createTextNode(`: ${names.join(', ')}.`));
      ul.append(li);
    }
    const note = document.createElement('p');
    note.className = 'concern__note';
    note.textContent = `${NOTE[c] ? `${NOTE[c]} ` : ''}Not sure where to start? Every plan begins with a consultation.`;
    out.replaceChildren(lead, ul, note);
  };
  chips.forEach((b) => b.addEventListener('click', () => showConcern(b.getAttribute('aria-pressed') === 'true' ? null : b.dataset.c)));

  /* ——— les résultats : un filtre par famille, douze à la fois, et la visionneuse ——— */
  const grid = $('[data-res-grid]');
  if (grid) {
    const items = $$('.res__item', grid);
    const filters = $$('[data-res-filters] .chip');
    const more = $('[data-res-more]');
    const foot = more.parentElement;
    const status = $('[data-res-status]');
    const PAGE = 12;
    let kind = 'all';
    let all = false;
    const list = () => items.filter((it) => kind === 'all' || it.dataset.k === kind);
    const apply = (animate, from = 0) => {
      const l = list();
      const shown = all ? l : l.slice(0, PAGE);
      items.forEach((it) => (it.hidden = !shown.includes(it)));
      if (animate && !still)
        shown.slice(from).forEach((it, n) => {
          it.classList.remove('is-in');
          void it.offsetWidth;
          it.style.setProperty('--n', Math.min(n, 11));
          it.classList.add('is-in');
        });
      foot.hidden = all || l.length <= PAGE;
      more.textContent = `Show all ${l.length}`;
    };
    filters.forEach((b) =>
      b.addEventListener('click', () => {
        kind = b.dataset.k;
        all = false;
        filters.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        apply(true);
        const n = list().length;
        status.textContent = `${n} results${kind === 'all' ? '' : `: ${b.firstChild.textContent.trim().toLowerCase()}`}.`;
      }),
    );
    more.addEventListener('click', () => {
      all = true;
      apply(true, PAGE);
      // le clavier repart du premier résultat ajouté
      $('.res__open', list()[PAGE])?.focus();
    });
    apply(false);

    const dlg = $('[data-viewer]');
    const vImg = $('[data-viewer-img]', dlg);
    const vCap = $('[data-viewer-cap]', dlg);
    const vCount = $('[data-viewer-count]', dlg);
    let cur = [];
    let idx = 0;
    const show = () => {
      const it = cur[idx];
      const im = $('img', it);
      vImg.src = im.currentSrc || im.src;
      vImg.alt = im.alt;
      // jamais plus grande que sa taille d'origine
      vImg.style.setProperty('--nw', `${im.getAttribute('width') || 968}px`);
      const cap = $('.res__cap', it);
      vCap.replaceChildren(cap.firstChild.textContent, document.createElement('br'));
      const by = document.createElement('span');
      by.textContent = $('span', cap).textContent;
      vCap.append(by);
      vCount.textContent = `${idx + 1} of ${cur.length}`;
    };
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('.res__open');
      if (!b || !dlg.showModal) return;
      cur = list();
      idx = cur.indexOf(b.closest('.res__item'));
      show();
      dlg.showModal();
      if (lenis) lenis.stop();
    });
    const step = (d) => {
      idx = (idx + d + cur.length) % cur.length;
      show();
    };
    $('[data-viewer-prev]', dlg).addEventListener('click', () => step(-1));
    $('[data-viewer-next]', dlg).addEventListener('click', () => step(1));
    $('[data-viewer-close]', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
    // un clic dans le noir, hors de la photo et des boutons, referme
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg || e.target.classList.contains('viewer__in') || e.target.classList.contains('viewer__fig')) dlg.close();
    });
    dlg.addEventListener('close', () => lenis && lenis.start());
  }

  /* ——— Beauty Bank : le crédit qui s'accumule ——— */
  const range = $('[data-bank-range]');
  if (range) {
    const months = $('[data-bank-months]');
    const total = $('[data-bank-total]');
    const cells = $$('[data-bank-cells] li');
    const upd = () => {
      const n = +range.value;
      const sum = `$${(n * 99).toLocaleString('en-US')}`;
      months.value = `${n} months`;
      total.value = sum;
      range.setAttribute('aria-valuetext', `${n} months, ${sum} to spend`);
      cells.forEach((c, i) => c.classList.toggle('is-on', i < n));
    };
    range.addEventListener('input', upd);
    upd();
  }

  /* ——— les cadres qui se tracent : autour de la photo de groupe quand elle arrive, et sur l'adresse de la carte quand
     le cabinet lui-même est à l'écran (la carte est haute : à son arrivée, le cabinet est encore sous le bord) ——— */
  const draw = $$('[data-draw], [data-map]');
  if ('IntersectionObserver' in window && !still) {
    const seen = (host) => (es, io) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.closest(host).classList.add('is-drawn');
        io.unobserve(e.target);
      });
    const group = new IntersectionObserver(seen('[data-draw]'), {threshold: 0.35});
    $$('[data-draw]').forEach((el) => group.observe(el));
    // le cadre du cabinet, dans la carte affichée (large ou en hauteur), en entier et au-dessus du bas de l'écran
    const office = new IntersectionObserver(seen('[data-map]'), {threshold: 1, rootMargin: '0px 0px -15% 0px'});
    $$('[data-map] [data-frame]').forEach((el) => office.observe(el));
  } else draw.forEach((el) => el.classList.add('is-drawn'));

  /* ——— la barre du téléphone : après l'accueil, et pas sur la visite ni le pied de page ——— */
  const dock = $('[data-dock]');
  if (dock && 'IntersectionObserver' in window) {
    const seen = new Map();
    const watch = [$('.hero'), $('#visit'), $('.foot')].filter(Boolean);
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => seen.set(e.target, e.isIntersecting));
        const on = ![...seen.values()].some(Boolean);
        dock.classList.toggle('is-on', on);
        dock.setAttribute('aria-hidden', String(!on));
        $$('a', dock).forEach((a) => (a.tabIndex = on ? 0 : -1));
      },
      // l'accueil ne compte plus quand il ne reste que sous l'en-tête : seul le bas de l'écran (70 %) est regardé
      {threshold: 0, rootMargin: '-30% 0px 0px 0px'},
    );
    watch.forEach((el) => io.observe(el));
  }
})();
