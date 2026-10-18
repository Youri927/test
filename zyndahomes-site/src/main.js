/* Zynda : l'ouverture en Z, le défilement, le cadran de l'année (et la vraie date du jour), les photos qui s'ouvrent,
   la visionneuse, la fenêtre d'absence et la demande. */
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 1100px)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ——— le défilement : Lenis, sauf en mouvement réduit ——— */
  let lenis = null;
  if (!still.matches && typeof Lenis === 'function') {
    lenis = new Lenis({lerp: 0.1, wheelMultiplier: 0.95, anchors: false});
    const raf = (t) => (lenis.raf(t), requestAnimationFrame(raf));
    requestAnimationFrame(raf);
  }
  const lock = (on) => {
    if (lenis) on ? lenis.stop() : lenis.start();
    root.style.overflow = on ? 'hidden' : '';
  };
  const top = $('[data-top]');
  const go = (target) => {
    const y = target === document.body ? 0 : target.getBoundingClientRect().top + window.scrollY - top.offsetHeight - 8;
    if (lenis) lenis.scrollTo(Math.max(0, y), {duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 3)});
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
    go(id === 'top' ? document.body : target);
    history.replaceState(null, '', id === 'top' ? location.pathname : `#${id}`);
    // le focus suit le lien, sans faire sauter la page
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
  });

  /* ——— l'en-tête : il se range quand on descend, revient quand on remonte ——— */
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    top.classList.toggle('is-scrolled', y > 8);
    const busy = !panel.hidden || top.contains(document.activeElement);
    if (y > lastY + 6 && y > 240 && !busy) top.classList.add('is-hidden');
    else if (y < lastY - 6 || y < 240) top.classList.remove('is-hidden');
    if (Math.abs(y - lastY) > 6) lastY = y;
    dial.update();
  };
  addEventListener('scroll', () => {
    if (!ticking) (ticking = true), requestAnimationFrame(onScroll);
  }, {passive: true});
  top.addEventListener('focusin', () => top.classList.remove('is-hidden'));

  // la partie courante dans le menu
  const links = $$('.nav a');
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

  /* ——— le menu du téléphone et de la tablette ——— */
  const menuBtn = $('[data-menu]');
  const panel = $('[data-panel]');
  function closeMenu() {
    if (panel.hidden) return;
    panel.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = 'Menu';
    lock(false);
  }
  menuBtn.addEventListener('click', () => {
    if (!panel.hidden) return (closeMenu(), menuBtn.focus());
    panel.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.textContent = 'Close';
    top.classList.remove('is-hidden');
    lock(true);
    $('a', panel).focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) (closeMenu(), menuBtn.focus());
  });
  addEventListener('resize', () => {
    if (innerWidth >= 1100) closeMenu();
  });

  /* ——— l'ouverture : quand les polices sont là (ou au bout de 0,7 s) ——— */
  const hero = $('[data-hero]');
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  // les polices de secours ont la même chasse : on n'attend pas plus de 0,7 s les vraies
  const ready = Promise.race([fonts, new Promise((r) => setTimeout(r, 700))]);
  if (still.matches || window.scrollY > innerHeight * 0.6) hero.classList.add('is-in');
  else ready.then(() => requestAnimationFrame(() => hero.classList.add('is-in')));

  /* ——— les titres de section : leurs lignes montent une fois de leur masque ——— */
  const titles = $$('[data-lines]');
  const split = (el) => {
    if (!el.dataset.text) el.dataset.text = el.textContent.trim().replace(/\s+/g, ' ');
    const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const words = el.dataset.text.split(' ');
    el.innerHTML = words.map((w) => `<span class="wd">${esc(w)}</span>`).join(' ');
    const lines = [];
    let y = null;
    for (const s of el.querySelectorAll('.wd')) {
      if (s.offsetTop !== y) (y = s.offsetTop), lines.push([]);
      lines[lines.length - 1].push(s.textContent);
    }
    // une espace entre les lignes : le texte lu reste le même pendant l'animation
    el.innerHTML = lines.map((l, i) => `<span class="mask"><span style="transition-delay:${i * 90}ms">${esc(l.join(' '))}</span></span>`).join(' ');
  };
  const unsplit = (el) => {
    el.textContent = el.dataset.text;
    el.classList.remove('is-split');
  };
  if (!still.matches) {
    ready.then(() => {
      const io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            if (!en.isIntersecting) continue;
            const el = en.target;
            io.unobserve(el);
            el.classList.add('is-in');
            // une fois montées, les lignes redeviennent un texte ordinaire (il se recompose si la fenêtre change)
            setTimeout(() => unsplit(el), 1400 + el.querySelectorAll('.mask').length * 90);
          }
        },
        {rootMargin: '0px 0px -12% 0px'},
      );
      for (const el of titles) {
        if (el.getBoundingClientRect().top < innerHeight * 0.88) continue; // déjà à l'écran : on ne cache rien
        split(el);
        el.classList.add('is-split');
        io.observe(el);
      }
      let w = innerWidth;
      addEventListener('resize', () => {
        if (innerWidth === w) return;
        w = innerWidth;
        for (const el of titles) if (el.classList.contains('is-split') && !el.classList.contains('is-in')) split(el);
      });
    });
  }

  /* ——— les grandes photos s'ouvrent une fois, de bas en haut ——— */
  if (!still.matches) {
    const big = $$('.work .ph, .family__ph .frame, .step__ph .frame');
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      },
      {rootMargin: '0px 0px -8% 0px', threshold: 0.01},
    );
    for (const el of big) {
      if (el.getBoundingClientRect().top < innerHeight) continue;
      el.classList.add('reveal');
      io.observe(el);
    }
  }

  /* ——— le cadran de l'année ———
     365 jours, le 1er janvier en haut, dans le sens des aiguilles d'une montre. La saison des condos va du 1er mai au
     1er octobre. Sur ordinateur, un repère avance au fil des quatre temps de l'année (de novembre au 1er octobre),
     la date s'affiche au centre ; ailleurs (téléphone, tablette, mouvement réduit), le cadran montre la saison entière. */
  const dial = (() => {
    const svg = $('[data-dial] svg');
    const steps = $$('[data-step]');
    const g = svg.dataset;
    const CX = +g.cx;
    const CY = +g.cy;
    const R = +g.r;
    const RT = +g.rt;
    const START = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const MAY1 = 120;
    const OCT1 = 273;
    const ang = (d) => ((d % 365) / 365) * Math.PI * 2 - Math.PI / 2;
    const pt = (d, r) => [CX + r * Math.cos(ang(d)), CY + r * Math.sin(ang(d))];
    const arc = (d0, d1, r) => {
      if (d1 - d0 < 0.05) return '';
      const [x0, y0] = pt(d0, r);
      const [x1, y1] = pt(d1, r);
      return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${d1 - d0 > 182.5 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    };
    const name = (d) => {
      const n = ((Math.round(d) % 365) + 365) % 365;
      let m = 11;
      while (START[m] > n) m--;
      return `${MON[m]} ${n - START[m] + 1}`;
    };
    const fill = $('[data-fill]', svg);
    const trail = $('[data-trail]', svg);
    const marker = $('[data-marker]', svg);
    const date = $('[data-date]', svg);
    const label = $('[data-label]', svg);
    // les quatre temps : de novembre à fin avril, mai, de juin à fin septembre, le 1er octobre (jours comptés depuis le
    // 1er janvier de l'année où l'on prépare)
    const RANGES = [
      [304, 365 + 119],
      [365 + MAY1, 365 + 150],
      [365 + 151, 365 + 272],
      [365 + 272, 365 + OCT1],
    ];
    const LABELS = ['You’re here', 'We start', 'On site, every day', 'You’re home'];
    let live = false;
    let last = '';

    const setStatic = () => {
      fill.setAttribute('d', '');
      trail.setAttribute('d', '');
      marker.style.display = 'none';
      date.textContent = 'May–Oct 1';
      label.textContent = 'The condo season';
      last = '';
    };
    const update = () => {
      if (!live) return;
      const c = innerHeight * 0.5;
      let i = 0;
      let t = 0;
      const first = steps[0].getBoundingClientRect();
      const lastBox = steps[steps.length - 1].getBoundingClientRect();
      if (c < first.top) (i = 0), (t = 0);
      else if (c >= lastBox.bottom) (i = steps.length - 1), (t = 1);
      else
        for (let k = 0; k < steps.length; k++) {
          const b = steps[k].getBoundingClientRect();
          if (c >= b.top && c < b.bottom) {
            i = k;
            t = (c - b.top) / b.height;
            break;
          }
        }
      // le dernier temps : le repère se pose sur le 1er octobre au premier tiers, puis y reste
      if (i === 3) t = clamp(t / 0.35, 0, 1);
      const [a, b] = RANGES[i];
      const d = a + (b - a) * clamp(t, 0, 1);
      const key = `${i}:${d.toFixed(1)}`;
      if (key === last) return;
      last = key;
      trail.setAttribute('d', arc(304, Math.min(d, 365 + MAY1), RT));
      fill.setAttribute('d', d > 365 + MAY1 ? arc(365 + MAY1, d, RT) : '');
      const [x, y] = pt(d, RT);
      marker.setAttribute('cx', x.toFixed(1));
      marker.setAttribute('cy', y.toFixed(1));
      marker.style.display = '';
      date.textContent = name(d);
      label.textContent = LABELS[i];
    };
    const mode = () => {
      live = wide.matches && !still.matches;
      if (live) (last = ''), update();
      else setStatic();
    };
    wide.addEventListener('change', mode);
    still.addEventListener('change', mode);
    mode();

    // aujourd'hui : un repère hors du cadran, et une ligne utile dessous
    const now = new Date();
    const doy = START[now.getMonth()] + now.getDate() - 1;
    const mark = $('[data-today-mark]', svg);
    const a = ang(doy + 0.5);
    const tri = (r0, r1, w) => {
      const [px, py] = [CX + r0 * Math.cos(a), CY + r0 * Math.sin(a)];
      const [qx, qy] = [CX + r1 * Math.cos(a - w), CY + r1 * Math.sin(a - w)];
      const [sx, sy] = [CX + r1 * Math.cos(a + w), CY + r1 * Math.sin(a + w)];
      return `M${px.toFixed(1)} ${py.toFixed(1)}L${qx.toFixed(1)} ${qy.toFixed(1)}L${sx.toFixed(1)} ${sy.toFixed(1)}Z`;
    };
    $('path', mark).setAttribute('d', tri(R + 4, R + 18, 0.03));
    const txt = $('text', mark);
    const cos = Math.cos(a);
    // près du 1er octobre, l'étiquette passe de l'autre côté pour ne pas couvrir « Oct 1 »
    const nearOct = Math.abs(doy - OCT1) < 14;
    const lr = R + 30 + (nearOct ? 22 : 0);
    txt.setAttribute('x', (CX + lr * cos).toFixed(1));
    txt.setAttribute('y', (CY + lr * Math.sin(a) + 5).toFixed(1));
    txt.setAttribute('text-anchor', cos > 0.25 ? 'start' : cos < -0.25 ? 'end' : 'middle');
    mark.removeAttribute('visibility');

    const today = $('[data-today]');
    const fmt = now.toLocaleDateString('en-US', {month: 'long', day: 'numeric'});
    const season = doy >= MAY1 && doy < OCT1;
    if (season) {
      const oct = new Date(now.getFullYear(), 9, 1);
      const days = Math.round((oct - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
      today.textContent = `Today is ${fmt}: condo season is under way, ${days} ${days === 1 ? 'day' : 'days'} until October 1st.`;
    } else {
      today.textContent = `Today is ${fmt}. The next condo season starts in May, and the earlier we plan, the sooner we start.`;
    }
    today.hidden = false;
    return {update};
  })();

  /* ——— la visionneuse : les photos des pièces, et les gros plans qui y mènent ——— */
  const viewer = $('[data-viewer]');
  const vimg = $('[data-vimg]');
  const vcap = $('[data-vcap]');
  const vcount = $('[data-vcount]');
  const vprev = $('[data-vprev]');
  const vnext = $('[data-vnext]');
  const gallery = $$('[data-gallery] .ph img');
  let index = 0;
  let opener = null;
  let single = null;
  const capOf = (img) => {
    const fig = img.closest('figure');
    const cap = fig && $('figcaption', fig);
    return cap ? cap.textContent : img.alt;
  };
  const srcOf = (img) => img.dataset.full || img.currentSrc || img.src;
  const show = (img) => {
    vimg.src = srcOf(img);
    vimg.alt = img.alt;
    vcap.textContent = capOf(img);
  };
  const render = () => {
    if (single) {
      show(single);
      vcount.textContent = '';
    } else {
      show(gallery[index]);
      vcount.textContent = `${index + 1} of ${gallery.length}`;
    }
    vprev.hidden = vnext.hidden = !!single;
  };
  const open = (img, from) => {
    opener = from;
    const i = gallery.indexOf(img);
    single = i < 0 ? img : null;
    index = Math.max(0, i);
    render();
    viewer.showModal();
    lock(true);
    $('[data-vclose]').focus();
  };
  viewer.addEventListener('close', () => {
    lock(false);
    if (opener) opener.focus();
  });
  const step = (n) => {
    if (single) return;
    index = (index + n + gallery.length) % gallery.length;
    render();
  };
  vprev.addEventListener('click', () => step(-1));
  vnext.addEventListener('click', () => step(1));
  $('[data-vclose]').addEventListener('click', () => viewer.close());
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  // au doigt : glisser vers la gauche ou la droite
  let sx = null;
  vimg.addEventListener('pointerdown', (e) => (sx = e.clientX));
  vimg.addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx;
    sx = null;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
  });
  // un clic sur le fond referme
  viewer.addEventListener('click', (e) => {
    if (e.target === viewer || e.target.classList.contains('viewer__in')) viewer.close();
  });
  for (const img of gallery) img.closest('.ph').addEventListener('click', (e) => open(img, e.currentTarget));
  for (const b of $$('[data-open]')) {
    b.addEventListener('click', () => {
      const target = document.getElementById(b.dataset.open);
      if (target) open(target, b);
    });
  }

  /* ——— la fenêtre d'absence : deux mois dessinent votre fenêtre sur l'année ——— */
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const leave = $('[data-leave]');
  const back = $('[data-back]');
  const win = $('[data-win]');
  const note = $('[data-note]');
  const awayText = () => {
    const L = leave.value === '' ? null : +leave.value;
    const B = back.value === '' ? null : +back.value;
    if (L === null && B === null) return '';
    if (L === null) return `Back in ${MONTHS[B]}.`;
    if (B === null) return `Leaving in ${MONTHS[L]}.`;
    return `Away from ${MONTHS[L]} to ${MONTHS[B]}.`;
  };
  const drawAway = () => {
    const L = leave.value === '' ? null : +leave.value;
    const B = back.value === '' ? null : +back.value;
    if (L === null || B === null || B === L) {
      win.classList.remove('is-on');
      note.textContent =
        L === null && B === null
          ? 'The band shows the condo season, May to October 1st.'
          : L !== null && B !== null
            ? `${awayText()} Pick the month you leave and the month you’re back.`
            : `${awayText()} Add the other month to see your window.`;
      return;
    }
    // de début du mois de départ au début du mois de retour ; un hiver passé ailleurs se lit de décembre à mars
    const from = L;
    const to = B > L ? B : B + 12;
    const span = to - from;
    win.style.left = `${(from / 12) * 100}%`;
    win.style.width = `${(Math.min(span, 12 - from) / 12) * 100}%`;
    win.classList.add('is-on');
    let tail = '';
    if (B > L && L <= 4 && B >= 9) tail = ' That covers the whole condo season.';
    else if (B > L && L < 9 && B > 4) tail = ' Condo work runs May to October 1st; we’ll plan it around your dates.';
    else tail = ' That’s outside the condo season, which runs May to October 1st.';
    note.textContent = awayText() + tail;
  };
  leave.addEventListener('change', drawAway);
  back.addEventListener('change', drawAway);

  /* ——— la demande : vérifiée ici, puis écrite dans un e-mail adressé à Zynda ——— */
  const form = $('[data-form]');
  const done = $('[data-done]');
  const fail = (input, msg) => {
    const err = document.getElementById(input.getAttribute('aria-describedby'));
    input.setAttribute('aria-invalid', 'true');
    err.textContent = msg;
    err.hidden = false;
  };
  const ok = (input) => {
    const err = document.getElementById(input.getAttribute('aria-describedby'));
    input.removeAttribute('aria-invalid');
    err.hidden = true;
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name;
    const email = form.elements.email;
    let first = null;
    if (!name.value.trim()) (fail(name, 'Enter your name.'), (first = first || name));
    else ok(name);
    const mail = email.value.trim();
    if (!mail) (fail(email, 'Enter your email so we can reply.'), (first = first || email));
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) (fail(email, 'Check the email address: it should look like name@example.com.'), (first = first || email));
    else ok(email);
    if (first) return first.focus();
    const f = form.elements;
    const lines = [`Name: ${f.name.value.trim()}`, `Email: ${mail}`];
    if (f.phone.value.trim()) lines.push(`Phone: ${f.phone.value.trim()}`);
    lines.push(`Project: ${f.kind.value}`);
    if (f.where.value.trim()) lines.push(`Building or neighborhood: ${f.where.value.trim()}`);
    if (awayText()) lines.push(`When I’m away: ${awayText()}`);
    lines.push('', f.message.value.trim() || '(No details yet.)');
    const subject = `Consultation request: ${f.kind.value}${f.where.value.trim() ? `, ${f.where.value.trim()}` : ''}`;
    location.href = `mailto:Zyndacustomhomes@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    done.textContent = 'Your email app should open with your request written out. If it didn’t, email Zyndacustomhomes@gmail.com or call (239) 213-1314.';
    done.hidden = false;
    done.focus();
  });
  for (const input of [form.elements.name, form.elements.email]) input.addEventListener('input', () => input.getAttribute('aria-invalid') && ok(input));

  const yearNow = $('[data-year-now]');
  if (yearNow) yearNow.textContent = String(new Date().getFullYear());
})();
