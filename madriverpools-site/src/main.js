/* Mad River Pools : défilement doux, ouverture du plan, graphique « dig to deck », formes à l'échelle,
   rénovation, galerie filtrable et visionneuse, formulaire qui prépare le courriel. */
(() => {
  const doc = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = 'IntersectionObserver' in window;

  /* ——— Défilement doux (les ancres tiennent compte de scroll-padding) ——— */
  let lenis = null;
  if (!still && window.Lenis) {
    lenis = new window.Lenis({autoRaf: true, anchors: {offset: 0}, lerp: 0.11});
  }

  /* ——— En-tête : fond dès qu'on défile, s'efface en descendant, revient en remontant ——— */
  const top = $('[data-top]');
  const hero = $('.hero');
  const dock = $('[data-dock]');
  let lastY = window.scrollY;
  let atVisit = false;
  let heroH = hero.offsetHeight;
  window.addEventListener('resize', () => (heroH = hero.offsetHeight));
  const spa = $('.plan__spa');
  const poolImg = $('.plan__pool img');
  const onScroll = (y) => {
    top.classList.toggle('is-solid', y > 8);
    if (doc.classList.contains('menu-open') || y < 520 || y < lastY - 3) top.classList.remove('is-away');
    else if (y > lastY + 3 && !top.contains(document.activeElement)) top.classList.add('is-away');
    lastY = y;
    if (dock) dock.classList.toggle('is-on', y > heroH * 0.7 && !atVisit);
    // le spa remonte un peu plus vite que le bassin
    if (!still && y < window.innerHeight * 1.3) {
      spa.style.translate = `0 ${(-y * 0.07).toFixed(1)}px`;
      poolImg.style.translate = `0 ${(y * 0.04).toFixed(1)}px`;
    }
  };
  if (lenis) lenis.on('scroll', ({scroll}) => onScroll(scroll));
  window.addEventListener('scroll', () => onScroll(window.scrollY), {passive: true});
  top.addEventListener('focusin', () => top.classList.remove('is-away'));

  /* ——— Menu sur petit écran ——— */
  const menu = $('[data-menu]');
  const setMenu = (open) => {
    menu.setAttribute('aria-expanded', String(open));
    doc.classList.toggle('menu-open', open);
    // la page sous le menu ouvert ne reçoit plus le focus
    for (const el of $$('body > :not(header, script)')) el.inert = open;
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  $$('#nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && doc.classList.contains('menu-open')) {
      setMenu(false);
      menu.focus();
    }
  });
  matchMedia('(min-width: 1181px)').addEventListener('change', (e) => e.matches && setMenu(false));

  /* le lien du menu de la section à l'écran */
  if (io) {
    const links = new Map($$('#nav ul a').map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const a = links.get(e.target.id);
          if (a && e.isIntersecting) {
            links.forEach((l) => l.removeAttribute('aria-current'));
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

  /* ——— Traits des plans : 1,5 px à l'écran quelle que soit l'échelle du dessin ——— */
  const planSvgs = $$('.plan__line, .shape svg');
  const setScale = () =>
    planSvgs.forEach((svg) => {
      const m = svg.getScreenCTM();
      if (m && m.a) svg.style.setProperty('--u', (1 / m.a).toFixed(5));
    });
  setScale();
  window.addEventListener('resize', setScale);

  /* ——— Ouverture : le cordeau se trace, les photos remplissent le plan, le slogan s'élargit ——— */
  // le slogan et le cordeau partent dès que la police est là (au plus tard après 0,6 s) ;
  // chaque photo remplit le plan dès qu'elle est chargée, jamais avant 0,45 s de tracé
  const plan = $('[data-plan]');
  const fill = () => plan.classList.add('is-filled');
  const ready = () => doc.classList.add('is-ready');
  const later = (ms) => new Promise((r) => setTimeout(r, ms));
  if (still) {
    ready();
    fill();
  } else {
    const font = document.fonts ? document.fonts.load('800 16px "Mona Sans"').catch(() => {}) : Promise.resolve();
    Promise.race([font, later(600)]).then(() => {
      requestAnimationFrame(() => requestAnimationFrame(ready));
      const photos = Promise.all($$('.plan img').map((i) => i.decode().catch(() => {})));
      Promise.all([photos, later(450)]).then(fill);
    });
  }
  onScroll(window.scrollY);

  /* ——— Révélations, une fois, quand la section arrive ——— */
  const once = (el, fn, threshold = 0.3) => {
    if (!el) return;
    if (still || !io) return fn(el);
    const o = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          fn(el);
          o.disconnect();
        }
      },
      {threshold},
    );
    o.observe(el);
  };
  const on = (el) => el.classList.add('is-on');
  once($('[data-dig]'), on, 0.45);
  $$('.shape').forEach((b, i) => b.style.setProperty('--i', i));
  once($('.shapes'), on, 0.18);
  $$('.onecall__text span').forEach((s, i) => s.style.setProperty('--i', i));
  once($('.onecall'), on, 0.5);

  /* ——— Les formes : la forme choisie montre la photo du vrai bassin ——— */
  const shapeBtns = $$('[data-shape]');
  const shapePhotos = $$('[data-shape-photo]');
  const shapeName = $('[data-shape-name]');
  const shapeSize = $('[data-shape-size]');
  const pickShape = (btn) => {
    shapeBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    shapePhotos.forEach((p) => {
      const on = p.dataset.shapePhoto === btn.dataset.shape;
      p.classList.toggle('is-on', on);
      // seule la photo visible est lue par les lecteurs d'écran
      p.setAttribute('aria-hidden', String(!on));
    });
    shapeName.textContent = btn.dataset.name;
    shapeSize.textContent = btn.dataset.size;
  };
  shapeBtns.forEach((b) => b.addEventListener('click', () => pickShape(b)));
  const firstShape = shapeBtns.find((b) => b.getAttribute('aria-pressed') === 'true');
  if (firstShape) pickShape(firstShape);

  /* ——— Rénovation : onglets, et l'après qui se dévoile à côté de l'avant ——— */
  const showPair = (pair) => {
    if (!pair) return;
    pair.classList.remove('is-shown');
    void pair.offsetWidth;
    requestAnimationFrame(() => pair.classList.add('is-shown'));
  };
  const revealPanel = (panel) => showPair(panel.querySelector('.ba__pair:not([hidden])'));
  const tabs = $$('.reno [role="tab"]');
  const showTab = (tab, focus) => {
    tabs.forEach((t) => {
      const sel = t === tab;
      t.setAttribute('aria-selected', String(sel));
      t.tabIndex = sel ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !sel;
      if (sel) revealPanel(panel);
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => showTab(t));
    t.addEventListener('keydown', (e) => {
      const step = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[e.key];
      let next = null;
      if (step) next = tabs[(i + step + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        showTab(next, true);
      }
    });
  });
  $$('[data-ba]').forEach((ba) => {
    const pairs = $$('[data-pair]', ba);
    const btns = $$('.ba__pick button', ba);
    btns.forEach((b, i) =>
      b.addEventListener('click', () => {
        btns.forEach((x, j) => x.setAttribute('aria-pressed', String(i === j)));
        pairs.forEach((p, j) => (p.hidden = i !== j));
        showPair(pairs[i]);
      }),
    );
  });
  once($('.reno'), () => revealPanel($('.reno [role="tabpanel"]:not([hidden])')), 0.25);

  /* ——— Galerie : filtres (les photos glissent à leur nouvelle place) et visionneuse ——— */
  const tiles = $$('[data-grid] .tile');
  const filterBtns = $$('[data-filter]');
  filterBtns.forEach((b) =>
    b.addEventListener('click', () => {
      const f = b.dataset.filter;
      filterBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const before = new Map(tiles.filter((t) => !t.hidden).map((t) => [t, t.getBoundingClientRect()]));
      tiles.forEach((t) => (t.hidden = !(f === 'all' || t.dataset.cat.split(' ').includes(f))));
      if (still) return;
      tiles
        .filter((t) => !t.hidden)
        .forEach((t, k) => {
          const a = before.get(t);
          const z = t.getBoundingClientRect();
          if (a) {
            const dx = a.left - z.left;
            const dy = a.top - z.top;
            if (dx || dy) t.animate([{transform: `translate(${dx}px, ${dy}px)`}, {transform: 'none'}], {duration: 650, easing: 'cubic-bezier(.22,1,.36,1)'});
          } else {
            t.animate([{opacity: 0, transform: 'scale(.94)'}, {opacity: 1, transform: 'none'}], {duration: 500, delay: k * 18, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'});
          }
        });
    }),
  );

  const lb = $('[data-lightbox]');
  const lbImg = $('[data-lightbox-img]');
  const lbCap = $('[data-lightbox-cap]');
  const lbCount = $('[data-lightbox-count]');
  let shown = [];
  let at = 0;
  let opener = null;
  const showAt = (i) => {
    at = (i + shown.length) % shown.length;
    const img = $('img', shown[at]);
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt;
    lbCount.textContent = `${at + 1} of ${shown.length}`;
    lbImg.style.animation = 'none';
    void lbImg.offsetWidth;
    lbImg.style.animation = '';
  };
  tiles.forEach((t) =>
    $('button', t).addEventListener('click', (e) => {
      shown = tiles.filter((x) => !x.hidden);
      opener = e.currentTarget;
      showAt(shown.indexOf(t));
      lb.showModal();
      if (lenis) lenis.stop();
    }),
  );
  lb.addEventListener('close', () => {
    if (lenis) lenis.start();
    if (opener) opener.focus();
  });
  $('[data-lightbox-prev]').addEventListener('click', () => showAt(at - 1));
  $('[data-lightbox-next]').addEventListener('click', () => showAt(at + 1));
  $('[data-lightbox-close]').addEventListener('click', () => lb.close());
  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target.classList.contains('lightbox__figure')) lb.close();
  });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showAt(at - 1);
    if (e.key === 'ArrowRight') showAt(at + 1);
  });
  let startX = null;
  lb.addEventListener('pointerdown', (e) => (startX = e.clientX));
  lb.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 60) showAt(at + (dx < 0 ? 1 : -1));
  });

  /* ——— Formulaire : vérifie, puis prépare le courriel ——— */
  const form = $('[data-form]');
  const err = $('[data-error]');
  const msg = $('#f-msg');
  const count = $('#f-count');
  msg.addEventListener('input', () => (count.textContent = `${msg.value.length} of 600 characters`));
  $$('[data-interest]').forEach((a) =>
    a.addEventListener('click', () => {
      const box = form.querySelector(`input[name="interest"][value="${a.dataset.interest}"]`);
      if (box) box.checked = true;
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
      form.elements[n].setAttribute('aria-invalid', String(fail));
      // le champ en erreur renvoie au message qui dit quoi corriger
      form.elements[n].toggleAttribute('aria-describedby', fail);
      if (fail) form.elements[n].setAttribute('aria-describedby', 'f-error');
      return fail;
    });
    if (bad.length) {
      err.textContent = `To send your request, add ${and(bad.map((b) => b[2]))}.`;
      err.hidden = false;
      form.elements[bad[0][0]].focus();
      return;
    }
    err.hidden = true;
    const interests = $$('input[name="interest"]:checked', form).map((i) => i.value);
    const lines = [
      `Name: ${v('first')} ${v('last')}`,
      `Email: ${v('email')}`,
      `Phone: ${v('phone')}`,
      v('address') ? `Address: ${v('address')}` : '',
      v('city') ? `City: ${v('city')}` : '',
      interests.length ? `Interested in: ${interests.join(', ')}` : '',
    ].filter(Boolean);
    if (v('message')) lines.push('', v('message'));
    const subject = `Free home visit request from ${v('first')} ${v('last')}`;
    window.location.href = `mailto:madriverpool@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  });
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') {
      e.target.removeAttribute('aria-invalid');
      e.target.removeAttribute('aria-describedby');
    }
  });

  /* ——— Ouvert ou fermé, à l'heure de Maitland ——— */
  const openEl = $('[data-open]');
  try {
    const parts = new Intl.DateTimeFormat('en-US', {timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'}).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const mins = (Number(get('hour')) % 24) * 60 + Number(get('minute'));
    const open = !['Sat', 'Sun'].includes(get('weekday')) && mins >= 540 && mins < 1020;
    openEl.textContent = open ? 'Open now' : 'Closed now';
    openEl.classList.toggle('is-closed', !open);
    openEl.hidden = false;
  } catch (_) {
    /* sans fuseau horaire, on n'affiche rien */
  }

  /* la barre d'appel s'efface quand le formulaire est à l'écran */
  if (dock && io) {
    new IntersectionObserver(
      ([e]) => {
        atVisit = e.isIntersecting;
        onScroll(window.scrollY);
      },
      {threshold: 0.12},
    ).observe($('#visit'));
  }

  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
