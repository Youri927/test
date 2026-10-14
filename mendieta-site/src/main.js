/* Mendieta Roofing Corp. — couche par couche */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');
  // fichier unique : une photo répétée reprend l'image déjà intégrée plus haut dans la page
  $$('img[data-same]').forEach((img) => (img.src = $(`img[data-name="${img.dataset.same}"]`).src));

  /* ——— défilement doux (Lenis), sauf si le visiteur a demandé moins de mouvement ——— */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({duration: 1.05, easing: (t) => 1 - Math.pow(1 - t, 3.4), wheelMultiplier: 0.95});
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  /* ——— l'en-tête ——— */
  const top = $('[data-top]');
  const onTop = () => top.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onTop, {passive: true});
  onTop();

  /* ——— le menu (téléphone et tablette) ——— */
  const menu = $('[data-menu]');
  const openBtn = $('[data-menu-open]');
  const outside = [$('main'), $('.foot'), top, $('[data-callbar]')];
  const trap = (e) => {
    if (e.key === 'Escape') return closeMenu(true);
    if (e.key !== 'Tab') return;
    const f = $$('a, button', menu);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
    else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
  };
  const openMenu = () => {
    menu.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    outside.forEach((el) => el && (el.inert = true));
    lenis && lenis.stop();
    document.body.style.overflow = 'hidden';
    $('[data-menu-close]').focus();
    document.addEventListener('keydown', trap);
  };
  function closeMenu(refocus) {
    if (menu.hidden) return;
    menu.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
    outside.forEach((el) => el && (el.inert = false));
    lenis && lenis.start();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trap);
    if (refocus) openBtn.focus();
  }
  openBtn.addEventListener('click', openMenu);
  $('[data-menu-close]').addEventListener('click', () => closeMenu(true));

  /* ——— les liens internes : défilement doux, puis le focus sur la partie atteinte ——— */
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id.length > 1 && document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      closeMenu(false);
      const done = () => {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({preventScroll: true});
      };
      // Lenis tient compte de scroll-padding-top (la hauteur de l'en-tête)
      if (lenis) lenis.scrollTo(id === '#top' ? 0 : target, {onComplete: done});
      else (target.scrollIntoView(), done());
      history.replaceState(null, '', id);
    }),
  );

  /* ——— couche par couche : la coupe se monte au fil du défilement ——— */
  const layers = $('[data-layers]');
  const drawing = $('[data-drawing]');
  const svg = $('svg', drawing);
  const LEN = +svg.dataset.len;
  const clipUnder = $('[data-clip="under"]', svg);
  const tiles = $$('.xs__tile', svg);
  const labels = $$('.xs__lab', svg);
  // les étiquettes apparaissent avec leur couche ; celle de l'étape en cours est mise en avant
  const SHOWN = {1: ['deck'], 2: ['deck', 'under', 'drip'], 3: ['deck', 'under', 'drip', 'tile'], 4: ['deck', 'under', 'drip', 'tile']};
  const CURRENT = {1: ['deck'], 2: ['under', 'drip'], 3: ['tile'], 4: []};
  const photos = $$('[data-photos] figure');
  const steps = $$('[data-steps] li');
  const wide = matchMedia('(min-width: 1000px)');
  // au téléphone, les étiquettes sont cachées : on recadre la coupe sur le toit, sans leur colonne
  const VB = svg.getAttribute('viewBox');
  const frameSvg = () => svg.setAttribute('viewBox', wide.matches ? VB : '252 112 712 488');
  wide.addEventListener('change', frameSvg);
  frameSvg();
  let last = '';
  // étape 1 à 4 ; t = avancement dans l'étape (0 à 1)
  const show = (step, t) => {
    // étape 1 : l'ancien toit s'en va et laisse le voligeage ; 2 : bavette et sous-couche ; 3 : les tuiles ; 4 : terminé
    const off = step > 1 ? 1 : ease(clamp((t - 0.15) / 0.5));
    const under = step > 2 ? 1 : step === 2 ? ease(clamp(t / 0.7)) : 0;
    const set = step > 3 ? tiles.length : step === 3 ? Math.floor(clamp(t / 0.8) * (tiles.length + 0.999)) : 0;
    const key = `${step}|${off.toFixed(3)}|${under.toFixed(3)}|${set}`;
    if (key === last) return;
    last = key;
    svg.style.setProperty('--off', off.toFixed(3));
    clipUnder.setAttribute('width', (under * (LEN + 8)).toFixed(1));
    tiles.forEach((el, i) => el.classList.toggle('is-set', i < set));
    if (drawing.dataset.stage !== String(step)) {
      drawing.dataset.stage = step;
      labels.forEach((g) => {
        g.classList.toggle('is-shown', SHOWN[step].includes(g.dataset.layer));
        g.classList.toggle('is-current', CURRENT[step].includes(g.dataset.layer));
      });
      photos.forEach((f) => f.classList.toggle('is-on', +f.dataset.step === step));
      steps.forEach((li) => {
        const n = +li.dataset.step;
        li.classList.toggle('is-on', n === step);
        li.classList.toggle('is-done', n < step);
        if (n === step) li.setAttribute('aria-current', 'step');
        else li.removeAttribute('aria-current');
      });
    }
  };
  let ticking = false;
  const layersTick = () => {
    ticking = false;
    if (wide.matches) {
      // sur ordinateur : la partie est épinglée, l'avancement vient du défilement dans la partie
      const r = layers.getBoundingClientRect();
      const p = clamp(-r.top / (layers.offsetHeight - innerHeight));
      const step = Math.min(4, 1 + Math.floor(p * 4));
      show(step, p * 4 - (step - 1));
    } else {
      // au téléphone : la coupe reste en haut ; l'étape lue est celle qui passe sous la ligne de lecture
      const band = $('.layers__stage').getBoundingClientRect().bottom;
      const line = band + (innerHeight - band) * 0.42;
      let step = 1, t = 0;
      steps.forEach((li) => {
        const r = li.getBoundingClientRect();
        if (r.top <= line) (step = +li.dataset.step, t = clamp((line - r.top) / Math.max(1, r.height * 0.8)));
      });
      if (steps[0].getBoundingClientRect().top > line) t = 0;
      show(step, t);
    }
  };
  const later = () => {
    if (!ticking) (ticking = true, requestAnimationFrame(layersTick));
  };
  if (reduce) {
    // sans mouvement : la coupe complète, toutes les étapes lisibles
    show(4, 1);
  } else {
    addEventListener('scroll', later, {passive: true});
    addEventListener('resize', later, {passive: true});
    later(); // la première lecture au prochain rafraîchissement, pas pendant le chargement
  }

  /* ——— les photos des toits : filtre et apparition ——— */
  const tabs = $$('[data-tabs] [role="tab"]');
  const items = $$('[data-work] li');
  const status = $('[data-tabs-status]');
  const NAMES = {all: 'photos', tile: 'tile roof photos', shingle: 'shingle roof photos', job: 'photos taken during the job'};
  const work = $('[data-work]');
  const columns = () => getComputedStyle(work).gridTemplateColumns.split(' ').length;
  // sur grand écran, les rangs alternent n photos et n − 1 décalées d'une demi-photo ; sur téléphone, des rangs de deux
  // et la dernière photo seule au milieu. Sans filtre, la feuille de styles s'en charge ; avec un filtre, le décalage
  // suit les photos qui restent.
  const numberCols = () => {
    const n = columns() / 2;
    const shown = items.filter((li) => !li.hidden);
    shown.forEach((li, i) => {
      const q = n > 2 ? i % (2 * n - 1) : i % 2;
      const shift = n > 2 ? q === n : i === shown.length - 1 && q === 0;
      li.classList.toggle('is-shift', shift);
      li.style.setProperty('--c', q < n ? q : q - n);
    });
  };
  const select = (tab, focus) => {
    const k = tab.dataset.k;
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
    });
    let n = 0;
    items.forEach((li) => {
      const show = k === 'all' || li.dataset.k.split(' ').includes(k);
      li.hidden = !show;
      if (show) n++;
      li.classList.remove('is-in');
    });
    work.toggleAttribute('data-filtered', k !== 'all');
    numberCols();
    requestAnimationFrame(() => items.forEach((li) => !li.hidden && li.classList.add('is-in')));
    status.textContent = `Showing ${n} ${NAMES[k]}.`;
    $('#work').setAttribute('aria-labelledby', tab.id);
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const go = {ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1}[e.key];
      if (go === undefined) return;
      e.preventDefault();
      select(tabs[(go + tabs.length) % tabs.length], true);
    });
  });
  requestAnimationFrame(numberCols);
  addEventListener('resize', numberCols, {passive: true});
  // chaque rangée se découvre de bas en haut quand elle arrive à l'écran
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('is-in'), io.unobserve(e.target))),
      {rootMargin: '0px 0px -8% 0px'},
    );
    items.forEach((li) => io.observe(li));
  } else items.forEach((li) => li.classList.add('is-in'));

  /* ——— la visionneuse ——— */
  const lb = $('[data-lb]');
  const lbImg = $('[data-lb-img]');
  const lbCap = $('[data-lb-cap]');
  const lbCount = $('[data-lb-count]');
  let list = [], at = 0, opener = null;
  const paint = () => {
    const b = list[at];
    const img = $('img', b);
    lbImg.src = b.dataset.full || img.currentSrc || img.src;
    lbImg.width = +b.dataset.w;
    lbImg.height = +b.dataset.h;
    lbImg.style.maxWidth = `min(${b.dataset.w}px, 100%)`; // jamais plus grande que la photo d'origine
    lbImg.alt = img.alt;
    lbCap.textContent = b.parentElement.querySelector('p').textContent;
    lbCount.textContent = `${at + 1} of ${list.length}`;
  };
  $$('[data-work] .ph').forEach((b) =>
    b.addEventListener('click', () => {
      list = $$('[data-work] li:not([hidden]) .ph');
      at = list.indexOf(b);
      opener = b;
      paint();
      lb.showModal();
      lenis && lenis.stop();
      $('[data-lb-close]').focus();
    }),
  );
  const step = (d) => ((at = (at + d + list.length) % list.length), paint());
  $('[data-lb-prev]').addEventListener('click', () => step(-1));
  $('[data-lb-next]').addEventListener('click', () => step(1));
  $('[data-lb-close]').addEventListener('click', () => lb.close());
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  lb.addEventListener('click', (e) => e.target === lb || e.target.classList.contains('lb__in') ? lb.close() : 0);
  lb.addEventListener('close', () => {
    lenis && lenis.start();
    opener && opener.focus();
  });

  /* ——— le secteur : la carte et « Check your city » ——— */
  const area = $('[data-area]');
  const cities = $$('.map__city', area);
  const labs = $$('.map__lab', area);
  const lis = $$('.counties li', area);
  const out = $('[data-check-out]');
  const NAMES_ON = cities.map((c) => c.dataset.city);
  const norm = (s) => s.toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\bft\b/g, 'fort').replace(/\s+/g, ' ').trim();
  const ALIAS = {
    'lake worth beach': 'Lake Worth', 'dania beach': 'Dania', 'loxahatchee groves': 'Loxahatchee', 'west palm': 'West Palm Beach',
    'wpb': 'West Palm Beach', 'pbg': 'Palm Beach Gardens', 'boca': 'Boca Raton', 'fort lauderdale beach': 'Fort Lauderdale',
  };
  const find = (q) => {
    const n = norm(q);
    if (!n) return null;
    if (ALIAS[n]) return ALIAS[n];
    return NAMES_ON.find((c) => norm(c) === n) || null;
  };
  const county = (name) => (lis.find((li) => li.textContent === name)?.parentElement.dataset.county || '');
  const hit = (name) => {
    cities.forEach((c) => c.classList.toggle('is-hit', c.dataset.city === name));
    labs.forEach((l) => l.classList.toggle('is-hit', l.dataset.city === name));
    lis.forEach((li) => li.classList.toggle('is-hit', li.textContent === name));
  };
  $('[data-check]').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#city').value.trim();
    const name = find(q);
    hit(name);
    if (!q) out.textContent = 'Type the name of your city.';
    else if (name) out.innerHTML = `Yes, <b>${name}</b> is on our list, in ${county(name)} County.`;
    else out.textContent = `${q} is not on our list of 25 cities. Call the office at (561) 797-5457 to ask.`;
  });
  // survol d'un nom de la liste : la ville s'allume sur la carte (pour la souris ; au clavier, la recherche)
  lis.forEach((li) => {
    li.addEventListener('mouseenter', () => hit(li.textContent));
    li.addEventListener('mouseleave', () => hit(null));
  });
  cities.forEach((c) => {
    c.addEventListener('mouseenter', () => hit(c.dataset.city));
    c.addEventListener('mouseleave', () => hit(null));
  });
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (area.classList.add('is-in'), io.disconnect())), {threshold: 0.2});
    io.observe(area);
  } else area.classList.add('is-in');

  /* ——— le devis : le formulaire rédige le SMS ——— */
  const form = $('[data-form]');
  const ready = $('[data-ready]');
  const msgBox = $('[data-msg]');
  const CELL = '+15615436287';
  const RULES = {
    name: (v) => (v ? '' : 'Enter your name.'),
    phone: (v) => (v.replace(/\D/g, '').length >= 10 ? '' : 'Enter a phone number with the area code, like (561) 555-0123.'),
    city: (v) => (v ? '' : 'Enter the city where the roof is.'),
  };
  const check = (input) => {
    const err = RULES[input.name](input.value.trim());
    const p = document.getElementById(input.getAttribute('aria-describedby'));
    p.textContent = err;
    input.setAttribute('aria-invalid', err ? 'true' : 'false');
    return !err;
  };
  Object.keys(RULES).forEach((n) => {
    const input = form.elements[n];
    input.addEventListener('blur', () => input.value.trim() && check(input));
    input.addEventListener('input', () => input.getAttribute('aria-invalid') === 'true' && check(input));
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = Object.keys(RULES).map((n) => form.elements[n]).filter((i) => !check(i));
    if (bad.length) return bad[0].focus();
    const v = (n) => form.elements[n].value.trim();
    const roof = (form.querySelector('[name="roof"]:checked') || {}).value || 'Not sure';
    const need = (form.querySelector('[name="need"]:checked') || {}).value || 'Not sure yet';
    const text = [
      `Hi Mendieta Roofing, this is ${v('name')}. I'd like a free estimate.`,
      `Roof: ${roof}. I need: ${need}.`,
      `City: ${v('city')}. My number: ${v('phone')}.`,
      v('msg'),
    ].filter(Boolean).join('\n');
    msgBox.textContent = text;
    ready.hidden = false;
    if (matchMedia('(pointer: coarse)').matches) {
      // au téléphone : la messagerie s'ouvre avec le texte, adressé au portable
      const a = document.createElement('a');
      a.href = `sms:${CELL}?&body=${encodeURIComponent(text)}`;
      a.hidden = true;
      document.body.append(a);
      a.click();
      a.remove();
    } else ready.focus();
  });
  $('[data-copy]').addEventListener('click', async (e) => {
    try {
      await navigator.clipboard.writeText(msgBox.textContent);
      e.target.textContent = 'Copied';
    } catch {
      const r = document.createRange();
      r.selectNodeContents(msgBox);
      getSelection().removeAllRanges();
      getSelection().addRange(r);
      e.target.textContent = `Selected: press ${/Mac|iPhone|iPad/.test(navigator.userAgent) ? 'Cmd' : 'Ctrl'}+C`;
    }
  });

  /* ——— la barre d'appel du téléphone : après l'accueil, jamais sur le devis ni le pied de page ——— */
  const bar = $('[data-callbar]');
  if ('IntersectionObserver' in window) {
    const seen = new Map();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => seen.set(e.target, e.isIntersecting));
      const [hero, est, foot] = [$('.hero'), $('#estimate'), $('.foot')].map((el) => seen.get(el));
      bar.classList.toggle('is-on', hero === false && !est && !foot);
    });
    [$('.hero'), $('#estimate'), $('.foot')].forEach((el) => io.observe(el));
  }
})();
