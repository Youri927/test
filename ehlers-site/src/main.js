/* Ehlers Contracting : défilement doux, menu, repères de l'accueil, la cuisine détail par détail, la cote du projet,
   les chantiers du registre et le formulaire. Le site reste lisible et utilisable sans ce script. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const topH = () => $('[data-top]').offsetHeight;

  /* ——— défilement doux (Lenis), sauf avec « moins d'animations » ——— */
  let lenis = null;
  if (!still && window.Lenis) {
    lenis = new window.Lenis({duration: 1.05, easing: (t) => 1 - Math.pow(1 - t, 3)});
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    root.classList.add('lenis');
  }
  const go = (target, focus) => {
    const y = target.getBoundingClientRect().top + scrollY - topH() - 16;
    if (lenis) lenis.scrollTo(Math.max(0, y), {duration: 1.1});
    else scrollTo({top: Math.max(0, y), behavior: still ? 'auto' : 'smooth'});
    if (focus) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({preventScroll: true});
    }
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = id === 'top' ? document.body : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    closeMenu(false);
    if (id === 'top') {
      if (lenis) lenis.scrollTo(0, {duration: 1.1});
      else scrollTo({top: 0, behavior: still ? 'auto' : 'smooth'});
    } else go(target, true);
    history.replaceState(null, '', `#${id}`);
  });

  /* ——— en-tête : un filet dès qu'on a quitté le haut de la page ——— */
  const top = $('[data-top]');
  const onScroll = () => top.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, {passive: true});
  onScroll();

  /* ——— le menu du téléphone ——— */
  const menu = $('[data-menu]');
  const openBtn = $('[data-menu-open]');
  let lastFocus = null;
  function openMenu() {
    lastFocus = document.activeElement;
    menu.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    $('main').inert = true;
    $('.foot').inert = true;
    top.inert = true;
    if (lenis) lenis.stop();
    $('[data-menu-close]', menu).focus();
  }
  function closeMenu(restore = true) {
    if (menu.hidden) return;
    menu.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
    $('main').inert = false;
    $('.foot').inert = false;
    top.inert = false;
    if (lenis) lenis.start();
    if (restore && lastFocus) lastFocus.focus();
  }
  openBtn.addEventListener('click', openMenu);
  $('[data-menu-close]', menu).addEventListener('click', () => closeMenu());
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
    if (e.key !== 'Tab') return;
    const f = $$('a, button', menu);
    if (e.shiftKey && document.activeElement === f[0]) {
      e.preventDefault();
      f[f.length - 1].focus();
    } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
      e.preventDefault();
      f[0].focus();
    }
  });
  matchMedia('(min-width: 861px)').addEventListener('change', (e) => e.matches && closeMenu(false));

  /* ——— les repères de l'accueil : posés sur la photo, quel que soit le cadrage ——— */
  const heroBox = $('.hero__media');
  const heroImg = $('.hero__img');
  const pins = $$('.pin', heroBox);
  const placePins = () => {
    const iw = heroImg.naturalWidth;
    const ih = heroImg.naturalHeight;
    if (!iw || !ih) return;
    // la photo en hauteur (téléphone) est plus haute que large
    const tall = ih > iw;
    const W = heroBox.clientWidth;
    const H = heroBox.clientHeight;
    const s = Math.max(W / iw, H / ih);
    const dw = iw * s;
    const dh = ih * s;
    // object-position: 50% 40%
    const ox = (W - dw) * 0.5;
    const oy = (H - dh) * 0.4;
    for (const p of pins) {
      const fx = parseFloat(tall ? p.dataset.mx : p.dataset.x);
      const fy = parseFloat(tall ? p.dataset.my : p.dataset.y);
      const x = ox + dw * fx;
      const y = oy + dh * fy;
      // un repère sans position pour ce cadrage, ou trop près d'un bord pour son étiquette, n'est pas montré
      const out = Number.isNaN(fx) || x < 24 || x > W - 24 || y < 24 || y > H - 40;
      p.classList.toggle('is-out', out);
      p.style.left = `${x.toFixed(1)}px`;
      p.style.top = `${y.toFixed(1)}px`;
      if (out) continue;
      // l'étiquette va à droite du point ; s'il n'y a pas la place, à gauche ; sinon elle passe à la ligne du côté
      // le plus large (texte agrandi ou espacé)
      const label = p.querySelector('.pin__label');
      p.classList.remove('pin--wrap');
      label.style.maxWidth = '';
      const lw = label.offsetWidth;
      const right = W - 12 - (x + 30);
      const left = x - 30 - 12;
      const wrap = lw > right && lw > left;
      p.classList.toggle('pin--left', wrap ? left > right : lw > right);
      p.classList.toggle('pin--wrap', wrap);
      if (wrap) label.style.maxWidth = `${Math.floor(Math.max(left, right))}px`;
    }
  };
  if (heroImg.complete) placePins();
  heroImg.addEventListener('load', placePins);
  // le cadre change de taille, ou les étiquettes (police chargée, texte agrandi) : les repères se replacent
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => requestAnimationFrame(placePins));
    ro.observe(heroBox);
    pins.forEach((p) => ro.observe(p.querySelector('.pin__label')));
  } else addEventListener('resize', placePins, {passive: true});

  /* ——— vu une fois : la cote du projet, la fourchette de prix, le plan des cages, les titres ——— */
  const once = $$('[data-span], [data-range], [data-plan]');
  const titles = $$('.reveal');
  if ('IntersectionObserver' in window && !still) {
    const tio = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          tio.unobserve(e.target);
        }),
      {rootMargin: '0px 0px -12% 0px'},
    );
    titles.forEach((t) => tio.observe(t));
  } else titles.forEach((t) => t.classList.add('is-in'));
  if ('IntersectionObserver' in window && !still) {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-drawn');
          io.unobserve(e.target);
        }),
      {rootMargin: '0px 0px -18% 0px', threshold: 0.2},
    );
    once.forEach((el) => io.observe(el));
  } else once.forEach((el) => el.classList.add('is-drawn'));

  /* ——— la cuisine, détail par détail : le détail sur la ligne de lecture est cadré sur la photo. La ligne est au
     milieu de l'écran ; au téléphone, où la photo reste en haut, au milieu de ce qui reste visible dessous ——— */
  const read = $('[data-read]');
  if (read) {
    const items = $$('[data-detail]', read);
    const rects = $$('[data-box]', read);
    const hole = $('[data-hole]', read);
    const rpins = $$('[data-pin]', read);
    let current = null;
    const show = (item) => {
      if (item === current) return;
      current = item;
      const [x, y, w, h] = item.dataset.rect.split(' ');
      for (const r of [...rects, hole]) {
        r.setAttribute('x', x);
        r.setAttribute('y', y);
        r.setAttribute('width', w);
        r.setAttribute('height', h);
      }
      items.forEach((it) => it.classList.toggle('is-on', it === item));
      rpins.forEach((p) => p.classList.toggle('is-on', p.dataset.pin === item.dataset.detail));
    };
    show(items[0]);
    read.classList.add('is-live');
    const media = $('.read__media', read);
    const stacked = matchMedia('(max-width: 860px)');
    let ticking = false;
    const pick = () => {
      ticking = false;
      const line = stacked.matches ? (Math.max(media.getBoundingClientRect().bottom, 0) + innerHeight) / 2 : innerHeight / 2;
      const last = items[items.length - 1];
      let hit = items.find((it) => {
        const r = it.getBoundingClientRect();
        return r.top <= line && r.bottom > line;
      });
      if (!hit) hit = last.getBoundingClientRect().bottom <= line ? last : items[0].getBoundingClientRect().top > line ? items[0] : null;
      if (hit) show(hit);
    };
    const later = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(pick);
    };
    addEventListener('scroll', later, {passive: true});
    addEventListener('resize', later, {passive: true});
    pick();
  }

  /* ——— les chantiers du registre : huit d'abord, filtrés par type ——— */
  const filters = $$('[data-filters] .chip');
  const ledger = $$('[data-ledger] li');
  const status = $('[data-ledger-status]');
  const more = $('[data-ledger-more]');
  const FIRST = 8;
  let kind = 'all';
  let all = false;
  const apply = (animate, from = 0) => {
    let n = 0;
    let shown = 0;
    for (const li of ledger) {
      const match = kind === 'all' || li.dataset.k === kind;
      const on = match && (kind !== 'all' || all || n < FIRST);
      if (match) n++;
      li.hidden = !on;
      li.classList.remove('is-in');
      if (on) {
        if (animate && shown >= from) {
          void li.offsetWidth;
          li.style.setProperty('--n', shown - from);
          li.classList.add('is-in');
        }
        shown++;
      }
    }
    more.hidden = kind !== 'all' || all;
    return n;
  };
  apply(false);
  filters.forEach((b) =>
    b.addEventListener('click', () => {
      kind = b.dataset.k;
      filters.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const n = apply(true);
      const label = b.firstChild.textContent.trim().toLowerCase();
      status.textContent = `${n} ${n === 1 ? 'job' : 'jobs'}${kind === 'all' ? '' : `: ${label}`}.`;
    }),
  );
  more.addEventListener('click', () => {
    all = true;
    apply(true, FIRST);
    // le clavier repart du premier chantier ajouté
    const first = ledger[FIRST];
    first.setAttribute('tabindex', '-1');
    first.focus({preventScroll: true});
    status.textContent = `${ledger.length} jobs.`;
  });

  /* ——— le formulaire : vérifié, puis rédigé dans la messagerie du visiteur ——— */
  const form = $('[data-form]');
  if (form) {
    const fields = {
      name: {el: $('#f-name'), err: $('#f-name-err'), ok: (v) => v.trim().length > 1},
      email: {el: $('#f-email'), err: $('#f-email-err'), ok: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())},
      message: {el: $('#f-msg'), err: $('#f-msg-err'), ok: (v) => v.trim().length > 4},
    };
    const check = (f) => {
      const good = f.ok(f.el.value);
      f.el.setAttribute('aria-invalid', String(!good));
      f.err.hidden = good;
      return good;
    };
    Object.values(fields).forEach((f) => {
      f.el.addEventListener('blur', () => {
        if (f.el.value || f.el.getAttribute('aria-invalid') === 'true') check(f);
      });
      // une erreur corrigée s'efface pendant la frappe
      f.el.addEventListener('input', () => {
        if (f.el.getAttribute('aria-invalid') === 'true' && f.ok(f.el.value)) check(f);
      });
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = Object.values(fields).filter((f) => !check(f));
      if (bad.length) {
        bad[0].el.focus();
        return;
      }
      const v = (n) => form.elements[n].value.trim();
      const body = [
        v('message'),
        '',
        `Name: ${v('name')}`,
        `Email: ${v('email')}`,
        v('phone') ? `Phone: ${v('phone')}` : null,
        `Project: ${v('type')}`,
      ]
        .filter((l) => l !== null)
        .join('\n');
      // un lien mailto cliqué : la messagerie du visiteur s'ouvre avec le message rédigé
      const a = document.createElement('a');
      a.href = `mailto:EhlersContracting@gmail.com?subject=${encodeURIComponent(`${v('type')} project: ${v('name')}`)}&body=${encodeURIComponent(body)}`;
      a.hidden = true;
      document.body.append(a);
      a.click();
      a.remove();
    });
  }
})();
