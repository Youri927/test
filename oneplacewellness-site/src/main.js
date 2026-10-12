/* One Place Wellness : le défilement, le menu, la ligne du temps des soins, les cas de la galerie, la carte,
   la demande de consultation et la barre d'appel du téléphone. L'ouverture (la lumière) est en CSS. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

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

  /* ——— en-tête : une ombre douce sous l'en-tête dès qu'on a défilé ——— */
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

  document.addEventListener('click', (e) => {
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

  /* ——— la ligne du temps : un curseur la balaie une fois, de la séance à deux ans ———
     --p va de 0 à 1 ; la feuille de style en déduit ce que chaque trait montre et quand chaque point apparaît. */
  const tm = $('[data-tm]');
  if (tm && !still && 'IntersectionObserver' in window) {
    const rows = $('.tm__rows', tm);
    tm.style.setProperty('--p', '0');
    const sweep = () => {
      const D = 2800;
      let t0 = 0;
      tm.classList.add('is-sweeping');
      const step = (t) => {
        if (!t0) t0 = t;
        const k = Math.min(1, (t - t0) / D);
        // départ et arrivée en douceur (sinus)
        const p = (1 - Math.cos(Math.PI * k)) / 2;
        tm.style.setProperty('--p', p.toFixed(4));
        if (k < 1) requestAnimationFrame(step);
        else {
          tm.classList.remove('is-sweeping');
          tm.style.removeProperty('--p');
        }
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        sweep();
      },
      {threshold: 0.3},
    );
    io.observe(rows);
  }

  /* ——— un soin ouvert : son texte se déplie sous sa ligne ——— */
  for (const btn of $$('[data-open]')) {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) continue;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      if (still || !panel.animate) {
        panel.hidden = !open;
        return;
      }
      // une ouverture interrompue repart de la hauteur où elle en était
      const from = panel.hidden ? 0 : panel.getBoundingClientRect().height;
      panel.getAnimations().forEach((a) => a.cancel());
      panel.hidden = false;
      panel.style.overflow = 'hidden';
      const full = panel.scrollHeight;
      const a = panel.animate(
        [
          {height: `${from}px`, opacity: from ? 1 : 0},
          {height: `${open ? full : 0}px`, opacity: open ? 1 : 0},
        ],
        {duration: open ? 420 : 300, easing: EASE},
      );
      a.onfinish = () => {
        panel.style.overflow = '';
        if (!open) panel.hidden = true;
        a.cancel();
      };
    });
  }

  /* ——— les cas : un filtre par soin ; sans filtre, les six premiers, puis « Show all 16 cases » ——— */
  const filters = $('[data-filters]');
  if (filters) {
    const cases = $$('[data-ledger] .case');
    const count = $('[data-count]');
    const more = $('[data-more]');
    const FIRST = 6;
    let kind = 'all';
    let everything = false;
    const said = {all: ['case', 'cases'], fillers: ['filler case', 'filler cases'], botox: ['Botox or Xeomin case', 'Botox and Xeomin cases'], thread: ['threadlift case', 'threadlift cases'], laser: ['laser case', 'laser cases']};
    const render = (announce) => {
      let n = 0;
      cases.forEach((c, i) => {
        const show = kind === 'all' ? everything || i < FIRST : c.dataset.kind === kind;
        const was = !c.hidden;
        c.hidden = !show;
        c.classList.remove('is-in');
        if (!show) return;
        n++;
        // seules les lignes qui arrivent apparaissent en fondu ; celles qui restent ne bougent pas
        if (announce && !was && !still) {
          void c.offsetWidth;
          c.classList.add('is-in');
        }
      });
      if (more) more.hidden = kind !== 'all' || everything;
      if (announce) count.textContent = `Showing ${n} ${said[kind][n === 1 ? 0 : 1]}.`;
    };
    filters.addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]');
      if (!b || b.getAttribute('aria-pressed') === 'true') return;
      kind = b.dataset.filter;
      $$('[data-filter]', filters).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      render(true);
    });
    if (more) {
      more.addEventListener('click', () => {
        everything = true;
        render(true);
        // le bouton disparaît : le focus passe au premier des cas qui viennent d'apparaître
        const first = cases[FIRST];
        first.setAttribute('tabindex', '-1');
        first.focus({preventScroll: true});
      });
    }
    render(false);
  }

  /* ——— la carte : deux ondes partent du cabinet quand elle arrive à l'écran ——— */
  const map = $('.map');
  if (map && !still && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        map.classList.add('is-seen');
        io.disconnect();
      },
      {threshold: 0.6},
    );
    io.observe(map);
  }

  /* ——— la demande : le formulaire écrit l'e-mail, la messagerie du visiteur l'envoie ——— */
  const form = $('[data-form]');
  if (form) {
    const field = (n) => form.elements.namedItem(n);
    const done = $('[data-done]', form);
    const rules = {
      name: (v) => v.trim().length > 1,
      phone: (v) => v.replace(/\D/g, '').length >= 10,
      email: (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    };
    const check = (n) => {
      const input = field(n);
      const ok = rules[n](input.value);
      const err = $(`#e-${n}`, form);
      input.setAttribute('aria-invalid', String(!ok));
      if (ok) input.removeAttribute('aria-describedby');
      else input.setAttribute('aria-describedby', `e-${n}`);
      err.hidden = ok;
      return ok;
    };
    for (const n of Object.keys(rules)) {
      field(n).addEventListener('input', () => {
        if (field(n).getAttribute('aria-invalid') === 'true') check(n);
      });
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = Object.keys(rules).filter((n) => !check(n));
      if (bad.length) {
        field(bad[0]).focus();
        return;
      }
      const v = (n) => field(n).value.trim();
      const topic = form.querySelector('input[name="topic"]:checked').value;
      const body = [
        `About: ${topic}`,
        `Name: ${v('name')}`,
        `Phone: ${v('phone')}`,
        v('email') && `Email: ${v('email')}`,
        v('when') && `Best time: ${v('when')}`,
        v('note') && `\n${v('note')}`,
      ]
        .filter(Boolean)
        .join('\n');
      // un vrai lien cliqué : la messagerie s'ouvre comme pour n'importe quel lien mailto
      const a = document.createElement('a');
      a.href = `mailto:Oneplacewellness@gmail.com?subject=${encodeURIComponent(`Consultation request: ${topic}`)}&body=${encodeURIComponent(body)}`;
      a.hidden = true;
      document.body.append(a);
      a.click();
      a.remove();
      done.hidden = false;
    });
  }

  /* ——— téléphone : la barre d'appel apparaît après l'ouverture et se retire sur la section visite ——— */
  const dock = $('[data-dock]');
  if (dock && 'IntersectionObserver' in window) {
    let heroOut = false;
    let visitIn = false;
    const update = () => {
      const on = heroOut && !visitIn;
      dock.classList.toggle('is-on', on);
      dock.setAttribute('aria-hidden', String(!on));
      $$('a', dock).forEach((a) => (a.tabIndex = on ? 0 : -1));
    };
    new IntersectionObserver(([e]) => {
      heroOut = !e.isIntersecting;
      update();
    }).observe($('.hero'));
    new IntersectionObserver(
      ([e]) => {
        visitIn = e.isIntersecting;
        update();
      },
      {rootMargin: '0px 0px -25% 0px'},
    ).observe($('#visit'));
  }
})();
