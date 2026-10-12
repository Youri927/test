/* Castor Dental Associates : le défilement, l'enseigne qui se pose sur la façade, le cas d'orthodontie, l'équipe,
   les mots expliqués et la demande de rendez-vous. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const top = $('[data-top]');
  const offset = () => (top ? top.offsetHeight : 0) + 12;
  // la place laissée sous l'en-tête vient du scroll-padding-top de la page, que Lenis et scrollIntoView respectent
  const go = (target) => {
    if (lenis) lenis.scrollTo(target, {duration: 1.1});
    else target.scrollIntoView({behavior: still ? 'auto' : 'smooth'});
  };

  /* ——— en-tête : un filet sous l'en-tête dès qu'on a défilé ——— */
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

  /* ——— l'ouverture : l'enseigne en vraies lettres recule et se pose sur celle de la façade ———
     Chaque ligne est posée sur ses lettres dans la photo (data-at, en pixels de la photo d'origine) : son encre (data-ink,
     mesurée dans la boîte de la ligne : gauche et droite en fraction de la largeur, haut des capitales et ligne de base
     en fraction du corps) prend la largeur des vraies lettres et se centre sur leur hauteur. La caméra (photo et lettres
     ensemble) part de l'enseigne en grand et recule jusqu'au cadrage final ; la photo apparaît pendant le recul.
     Dessous, la plaque (la façade sans ses lettres) évite que les deux enseignes se dédoublent ; elle s'efface avec
     l'enseigne à la fin, quand les lettres sont petites, et l'on retrouve la vraie. */
  const facade = $('[data-facade]');
  if (facade) {
    const frame = $('.facade__frame', facade);
    const cam = $('[data-cam]', facade);
    const photo = $('[data-photo]', facade);
    const img = $('img', facade);
    const plate = $('[data-plate]', facade);
    const sign = $('[data-sign]', facade);
    const lines = $$('span', sign);
    const F = 200; // corps des lignes dans la feuille de style, avant réduction
    // la version affichée (ordinateur ou téléphone) d'une image : la <source> si son media s'applique, sinon l'<img>
    const active = (pic) => {
      const src = $('source', pic);
      return src && matchMedia(src.media).matches ? src : $('img', pic);
    };
    const crop = () => (active(img.parentNode).dataset.box || '').split(' ').map(Number);
    const nums = (v) => v.split(' ').map(Number);
    const at = (el) => nums(el.dataset.at);

    const layout = () => {
      const [x0, y0, x1] = crop();
      const s = frame.clientWidth / (x1 - x0);
      for (const el of lines) {
        const [ax, ay, bx, by] = at(el);
        const [l, r, t, b] = nums(el.dataset.ink);
        const w = el.offsetWidth;
        const q = ((bx - ax) * s) / ((r - l) * w);
        const x = (ax - x0) * s - l * w * q;
        const y = ((ay + by) / 2 - y0) * s - ((t + b) / 2) * F * q;
        el.style.transform = `translate(${x.toFixed(3)}px, ${y.toFixed(3)}px) scale(${q.toFixed(5)})`;
      }
      if (plate) {
        const [ax, ay, bx, by] = at(active(plate));
        Object.assign(plate.style, {left: `${(ax - x0) * s}px`, top: `${(ay - y0) * s}px`, width: `${(bx - ax) * s}px`, height: `${(by - ay) * s}px`});
        // 12 px de la photo d'origine pour fondre les bords
        plate.style.setProperty('--fx', `${(1200 / (bx - ax)).toFixed(2)}%`);
        plate.style.setProperty('--fy', `${(1200 / (by - ay)).toFixed(2)}%`);
      }
      return s;
    };

    const reveal = () => facade.classList.add('is-shown');

    const intro = () => {
      const s = layout();
      const [x0, y0] = crop();
      const boxes = lines.map(at);
      const L = Math.min(...boxes.map((b) => b[0]));
      const R = Math.max(...boxes.map((b) => b[2]));
      const T = Math.min(...boxes.map((b) => b[1]));
      const B = Math.max(...boxes.map((b) => b[3]));
      const W = frame.clientWidth;
      const H = frame.clientHeight;
      const S = {x: ((L + R) / 2 - x0) * s, y: ((T + B) / 2 - y0) * s};
      const C = {x: W / 2, y: H / 2};
      const k0 = Math.min((W * 0.72) / ((R - L) * s), (H * 0.62) / ((B - T) * s));
      const frames = [];
      for (let i = 0; i <= 32; i++) {
        const t = i / 32;
        const e = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
        const k = Math.exp(Math.log(k0) * (1 - e));
        const cx = C.x + (S.x - C.x) * e;
        const cy = C.y + (S.y - C.y) * e;
        frames.push({offset: t, transform: `translate3d(${(cx - k * S.x).toFixed(2)}px, ${(cy - k * S.y).toFixed(2)}px, 0) scale(${k.toFixed(4)})`});
      }
      const timing = {duration: 2100, delay: 300, fill: 'both', easing: 'linear'};
      const out = [{opacity: 1}, {opacity: 1, offset: 0.66}, {opacity: 0}];
      const moves = [
        cam.animate(frames, timing),
        photo.animate([{opacity: 0.01}, {opacity: 0.01, offset: 0.1}, {opacity: 1, offset: 0.52}, {opacity: 1}], timing),
        sign.animate(out, timing),
        // à l'ombre du porche, les lettres de la photo sont presque noires : l'enseigne fonce pendant que la photo apparaît
        sign.animate([{filter: 'brightness(1)'}, {filter: 'brightness(1)', offset: 0.1}, {filter: 'brightness(0.34)', offset: 0.6}, {filter: 'brightness(0.34)'}], timing),
      ];
      if (plate) moves.push(plate.animate(out, timing));
      reveal();
      moves[0].finished
        .then(() => moves.forEach((m) => m.cancel()))
        .catch(() => {});
    };

    // l'ouverture ne se joue qu'en haut de la page, une fois la police et la photo prêtes ; sinon la photo s'affiche
    const atTop = scrollY < 40 && !location.hash.slice(1);
    if (still || !atTop || !cam.animate) {
      reveal();
    } else {
      let started = false;
      const fallback = setTimeout(() => {
        if (!started) reveal();
        started = true;
      }, 2600);
      const decode = (im) => (im && im.decode ? im.decode().catch(() => {}) : null);
      Promise.all([document.fonts ? document.fonts.ready : null, decode(img), decode(plate && $('img', plate))]).then(() => {
        if (started) return;
        started = true;
        clearTimeout(fallback);
        intro();
      });
    }
  }

  /* ——— le cas d'orthodontie : la ligne du temps se trace d'une étape à l'autre ——— */
  const kase = $('[data-case]');
  if (kase) {
    const steps = $$('.case__step', kase);
    steps.slice(0, -1).forEach((st) => {
      const line = document.createElement('span');
      line.className = 'case__line';
      $('figcaption', st).append(line);
    });
    const run = () => steps.forEach((st, i) => setTimeout(() => st.classList.add('is-on'), still ? 0 : 200 + i * 640));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (es) => {
          if (es.some((e) => e.isIntersecting)) {
            run();
            io.disconnect();
          }
        },
        {threshold: 0.45},
      );
      io.observe(kase);
    } else run();
  }

  /* ——— les soins : ouverture en douceur ——— */
  for (const d of $$('details.item')) {
    const sum = $('summary', d);
    const body = $('.item__body', d);
    sum.addEventListener('click', (e) => {
      if (still || !body.animate) return;
      e.preventDefault();
      const ease = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
      body.style.overflow = 'hidden';
      if (d.open) {
        const h = body.offsetHeight;
        const a = body.animate([{height: `${h}px`, opacity: 1}, {height: '0px', opacity: 0}], {duration: 260, easing: ease});
        a.onfinish = () => {
          d.open = false;
          body.style.overflow = '';
        };
      } else {
        d.open = true;
        const h = body.offsetHeight;
        const a = body.animate([{height: '0px', opacity: 0}, {height: `${h}px`, opacity: 1}], {duration: 340, easing: ease});
        a.onfinish = () => {
          body.style.overflow = '';
        };
      }
    });
  }

  /* ——— l'équipe : un visage, sa biographie ——— */
  const strip = $('[data-strip]');
  if (strip) {
    const faces = $$('.face', strip);
    const bios = $$('[data-bios] .bio');
    const pick = (name) => {
      faces.forEach((f) => f.setAttribute('aria-pressed', String(f.dataset.person === name)));
      bios.forEach((b) => b.classList.toggle('is-on', b.dataset.person === name));
    };
    faces.forEach((f) => f.addEventListener('click', () => pick(f.dataset.person)));
    pick('castor');
  }

  /* ——— les mots expliqués : la définition de leur dictionnaire dentaire ——— */
  const DEF = {
    lingual: 'The side of the tooth towards the tongue.',
    scaling: 'The action of cleaning teeth below the gumline.',
    prophylaxis: 'The procedure of teeth polishing. It also means the prevention of diseases.',
    composite: 'White filling.',
    fluoride: 'A compound of fluorine (an element) which [can] be put in different forms such as water, gels, and rinses to strengthen teeth.',
    sealant: 'A thin layer of plastic-like material covering the grooves and pits on a tooth to prevent [cavities].',
    'root canal treatment': 'A treatment for the root canal inside the tooth.',
    crown: 'A crown is almost like a “cap” on a tooth. It covers the tooth partially or totally above the gum to restore its function and outlook.',
    bridge: 'A prosthesis which is fixed inside the mouth to replace missing teeth.',
    veneer: 'A layer of tooth-colored material (can be porcelain, composite, or ceramics) that attaches to the front of the tooth. It is usually used to improve the appearance of the tooth.',
    bleaching: 'Whitening of teeth.',
    implant: 'A device (usually “screw-like”) put in the jaw bone to support a false tooth, a denture or a bridge.',
    impression: 'A mold taken by some jelly-like material loaded on a tray.',
    denture: 'An artificial object to replace missing teeth and their neighboring structures. There are many different types of denture to satisfy different treatment requirements and patient preferences.',
    radiograph: 'An x-ray picture.',
  };
  const pop = $('[data-def]');
  if (pop) {
    const popTerm = $('[data-def-term]', pop);
    const popText = $('[data-def-text]', pop);
    let current = null;
    let pinned = false;
    let hideTimer = 0;
    const place = (btn) => {
      const r = btn.getBoundingClientRect();
      const pw = pop.offsetWidth;
      const ph = pop.offsetHeight;
      const x = Math.max(16, Math.min(r.left + r.width / 2 - pw / 2, innerWidth - pw - 16));
      const above = r.top - ph - 10 > offset();
      pop.style.left = `${x + scrollX}px`;
      pop.style.top = `${(above ? r.top - ph - 10 : r.bottom + 10) + scrollY}px`;
    };
    const show = (btn) => {
      clearTimeout(hideTimer);
      if (current && current !== btn) current.removeAttribute('aria-describedby');
      current = btn;
      const key = btn.dataset.term;
      popTerm.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      popText.textContent = DEF[key] || '';
      pop.hidden = false;
      btn.setAttribute('aria-describedby', 'def');
      place(btn);
    };
    const hide = () => {
      if (!current) return;
      current.removeAttribute('aria-describedby');
      current = null;
      pinned = false;
      pop.hidden = true;
    };
    for (const b of $$('.term')) {
      b.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse' && !pinned) show(b);
      });
      b.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse' && !pinned) hideTimer = setTimeout(hide, 140);
      });
      b.addEventListener('focus', () => {
        if (!pinned) show(b);
      });
      b.addEventListener('blur', () => {
        if (!pinned) hide();
      });
      b.addEventListener('click', (e) => {
        e.preventDefault();
        if (pinned && current === b) hide();
        else {
          show(b);
          pinned = true;
        }
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hide();
    });
    document.addEventListener('pointerdown', (e) => {
      if (pinned && !e.target.closest('.term')) hide();
    });
    addEventListener('scroll', () => current && place(current), {passive: true});
    addEventListener('resize', hide);
  }

  /* ——— la demande : le formulaire écrit l'e-mail, la messagerie du visiteur l'envoie ——— */
  const form = $('[data-form]');
  if (form) {
    const field = (n) => form.elements.namedItem(n);
    const urgent = $('[data-urgent-note]', form);
    const done = $('[data-done]', form);
    form.addEventListener('change', (e) => {
      if (e.target.name === 'topic') urgent.hidden = !e.target.hasAttribute('data-urgent');
    });
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
      a.href = `mailto:Castordentalassociates@gmail.com?subject=${encodeURIComponent(`Appointment request: ${topic}`)}&body=${encodeURIComponent(body)}`;
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
