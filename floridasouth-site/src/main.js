/* Florida South Construction : la liste qui se barre, le défilement, les cadres qui s'ouvrent, les avis qui se lisent,
   la visionneuse et la demande. */
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  // les courbes des réponses aux gestes, les mêmes que --ease dans styles.css
  const EASE = 'cubic-bezier(0.2, 0.7, 0.1, 1)';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ——— l'ouverture : quand la police est là (ou au bout de 1,2 s), les cinq lignes se barrent l'une après l'autre,
         puis « Consider it done. » s'écrit dans le même sens ——— */
  const todo = $('[data-todo]');
  const done = $('[data-done]');
  const finish = () => {
    todo.classList.add('is-done');
    done.classList.add('is-in');
  };
  // mouvement réduit, ou page rouverte plus bas : tout est déjà en place
  if (still.matches || window.scrollY > innerHeight * 0.5) finish();
  else {
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 1200))]).then(() => {
      const items = [...todo.children];
      const START = 380;
      const STEP = 270;
      items.forEach((li, i) => setTimeout(() => li.classList.add('is-struck'), START + i * STEP));
      setTimeout(() => done.classList.add('is-in'), START + (items.length - 1) * STEP + 420);
    });
  }

  /* ——— le défilement : Lenis, sauf en mouvement réduit ——— */
  let lenis = null;
  if (!still.matches && typeof Lenis === 'function') {
    lenis = new Lenis({lerp: 0.11, wheelMultiplier: 0.95, anchors: false});
    const raf = (t) => (lenis.raf(t), requestAnimationFrame(raf));
    requestAnimationFrame(raf);
  }
  // la page ne défile plus derrière le menu ou la visionneuse
  const lock = (on) => {
    if (lenis) on ? lenis.stop() : lenis.start();
    root.style.overflow = on ? 'hidden' : '';
  };
  const top = $('[data-top]');
  const go = (target) => {
    const y = target.getBoundingClientRect().top + window.scrollY - top.offsetHeight - 12;
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
      if (lenis) lenis.scrollTo(0, {duration: 1.1});
      else window.scrollTo({top: 0, behavior: still.matches ? 'auto' : 'smooth'});
    } else go(target);
    history.replaceState(null, '', `#${id}`);
    // le focus suit le lien, sans faire sauter la page
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
  });

  /* ——— l'en-tête : la partie courante dans le menu ——— */
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
    lock(true);
    $('a', panel).focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) (closeMenu(), menuBtn.focus());
  });
  addEventListener('resize', () => {
    if (innerWidth >= 1100) closeMenu();
  });

  /* ——— les cadres s'ouvrent en entrant à l'écran, à la mesure du chantier ; les avis se lisent mot à mot ——— */
  const moving = !still.matches;
  const frames = moving ? $$('[data-frame] .frame, .ph img, .judson__portrait img, .judson__team img').map((el) => ({el, last: ''})) : [];
  const quotes = moving
    ? $$('[data-read]').map((fig) => {
        // chaque mot dans son élément, pour qu'il passe du gris à l'encre à son tour (le texte reste le même)
        const p = $('blockquote p', fig);
        const parts = p.textContent.split(/(\s+)/);
        p.textContent = '';
        let n = 0;
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) p.append(part);
          else {
            const w = document.createElement('span');
            w.className = 'w';
            w.style.setProperty('--i', n++);
            w.textContent = part;
            p.append(w);
          }
        }
        return {fig, n, last: ''};
      })
    : [];
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    for (const f of frames) {
      const r = f.el.getBoundingClientRect();
      // loin de l'écran : rien à recalculer (déjà ouvert au-dessus, encore fermé en dessous)
      if ((r.bottom < -200 && f.last === '0.0000') || (r.top > vh + 200 && f.last === '1.0000')) continue;
      // fermé quand le haut du cadre entre par le bas de l'écran, ouvert quand il arrive au tiers du haut
      const p = clamp((vh - r.top) / (vh * 0.68), 0, 1);
      const c = (1 - p * p * (3 - 2 * p)).toFixed(4);
      if (c !== f.last) (f.el.style.setProperty('--c', c), (f.last = c));
    }
    for (const q of quotes) {
      const r = q.fig.getBoundingClientRect();
      // le premier mot quand la citation entre à 90 % de l'écran, le dernier quand son bas arrive aux trois quarts
      const p = clamp((vh * 0.9 - r.top) / (vh * 0.16 + r.height), 0, 1);
      const lit = (p * (q.n + 1.5) - 1).toFixed(2);
      if (lit !== q.last) (q.fig.style.setProperty('--lit', lit), (q.last = lit));
    }
  };
  let ticking = false;
  const request = () => {
    if (!ticking) (ticking = true), requestAnimationFrame(update);
  };
  if (moving) {
    addEventListener('scroll', request, {passive: true});
    addEventListener('resize', request);
    update();
  }

  /* ——— la visionneuse : la photo grandit depuis sa vignette, et y retourne ——— */
  const viewer = $('[data-viewer]');
  const vimg = $('[data-vimg]', viewer);
  const stage = $('[data-stage]', viewer);
  const bar = $('.viewer__bar', viewer);
  const BG = 'rgba(13, 18, 33, 0.96)';
  const BG0 = 'rgba(13, 18, 33, 0)';
  const items = $$('[data-gallery]').flatMap((ul) =>
    $$('li', ul).map((li) => ({btn: $('.ph', li), img: $('img', li), cap: $('.cap', li).textContent, where: ul.dataset.gallery})),
  );
  let index = 0;
  let busy = false;
  // la taille de la photo, calculée (contenue dans la scène, jamais plus de 1 800 px de large : la taille du fichier)
  const fit = () => {
    const it = items[index];
    const a = (it.img.naturalWidth || +it.img.getAttribute('width') || 3) / (it.img.naturalHeight || +it.img.getAttribute('height') || 2);
    const cs = getComputedStyle(stage);
    const sw = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const sh = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const w = Math.min(sw, sh * a, 1800);
    vimg.style.width = `${Math.round(w)}px`;
    vimg.style.height = `${Math.round(w / a)}px`;
  };
  addEventListener('resize', () => viewer.open && fit());
  const show = (i, dir = 0) => {
    index = (i + items.length) % items.length;
    const it = items[index];
    $('[data-vcap]', viewer).textContent = it.cap;
    $('[data-vwhere]', viewer).textContent = it.where;
    $('[data-vcount]', viewer).textContent = `${index + 1} of ${items.length}`;
    vimg.alt = it.img.alt;
    if (viewer.open) fit();
    // d'abord l'image déjà chargée de la vignette, puis la grande dès qu'elle est prête
    const quick = it.img.currentSrc || it.img.src;
    const big = it.img.dataset.full || quick;
    vimg.src = quick;
    if (big !== quick) {
      const pre = new Image();
      pre.src = big;
      pre.decode().then(() => items[index] === it && (vimg.src = big), () => {});
    }
    if (dir && !still.matches) vimg.animate([{opacity: 0, transform: `translateX(${dir * 28}px)`}, {opacity: 1, transform: 'none'}], {duration: 340, easing: EASE});
  };
  // la partie de la photo que montre la vignette (recadrée au centre), dans le repère de la grande image
  const crop = (thumb, to) => {
    const ta = thumb.width / thumb.height;
    let w = to.width;
    let h = to.height;
    if (ta > to.width / to.height) h = to.width / ta;
    else w = to.height * ta;
    return {x: (to.width - w) / 2, y: (to.height - h) / 2, w, h};
  };
  const flip = (thumb, to, back) => {
    const v = crop(thumb, to);
    const s = thumb.width / v.w;
    const from = {
      transform: `translate(${thumb.left - to.left - s * v.x}px, ${thumb.top - to.top - s * v.y}px) scale(${s})`,
      clipPath: `inset(${v.y}px ${to.width - v.x - v.w}px ${to.height - v.y - v.h}px ${v.x}px)`,
    };
    const at = {transform: 'none', clipPath: 'inset(0px 0px 0px 0px)'};
    return vimg.animate(back ? [at, from] : [from, at], {duration: 480, easing: EASE, fill: back ? 'forwards' : 'none'});
  };
  const open = async (i) => {
    if (busy) return;
    show(i);
    const thumb = items[index].btn.getBoundingClientRect();
    viewer.showModal();
    fit();
    lock(true);
    $('[data-vclose]', viewer).focus();
    if (still.matches) return;
    busy = true;
    vimg.style.opacity = '0';
    try {
      await vimg.decode();
    } catch {}
    vimg.style.opacity = '';
    flip(thumb, vimg.getBoundingClientRect(), false);
    viewer.animate([{backgroundColor: BG0}, {backgroundColor: BG}], {duration: 420, easing: EASE});
    bar.animate([{opacity: 0}, {opacity: 1}], {duration: 300, delay: 200, easing: EASE, fill: 'backwards'});
    setTimeout(() => (busy = false), 480);
  };
  const close = () => {
    if (!viewer.open || busy) return;
    const it = items[index];
    const end = () => {
      viewer.close();
      lock(false);
      it.btn.focus({preventScroll: true});
    };
    if (still.matches) return end();
    busy = true;
    const thumb = it.btn.getBoundingClientRect();
    const seenNow = thumb.bottom > 0 && thumb.top < innerHeight;
    const anims = [
      viewer.animate([{backgroundColor: BG}, {backgroundColor: BG0}], {duration: 420, easing: EASE, fill: 'forwards'}),
      bar.animate([{opacity: 1}, {opacity: 0}], {duration: 160, fill: 'forwards'}),
      seenNow ? flip(thumb, vimg.getBoundingClientRect(), true) : vimg.animate([{opacity: 1}, {opacity: 0}], {duration: 260, fill: 'forwards'}),
    ];
    anims[2].finished.then(() => {
      end();
      anims.forEach((a) => a.cancel());
      busy = false;
    });
  };
  items.forEach((it, i) => it.btn.addEventListener('click', () => open(i)));
  $('[data-vprev]', viewer).addEventListener('click', () => show(index - 1, -1));
  $('[data-vnext]', viewer).addEventListener('click', () => show(index + 1, 1));
  $('[data-vclose]', viewer).addEventListener('click', close);
  viewer.addEventListener('cancel', (e) => (e.preventDefault(), close()));
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1, -1);
    if (e.key === 'ArrowRight') show(index + 1, 1);
  });
  // un clic à côté de la photo referme
  stage.addEventListener('click', (e) => e.target === stage && close());
  // au doigt : glisser pour passer à la suivante
  let sx = null;
  let sy = 0;
  let dx = 0;
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || busy) return;
    sx = e.clientX;
    sy = e.clientY;
    dx = 0;
  });
  stage.addEventListener('pointermove', (e) => {
    if (sx === null) return;
    dx = e.clientX - sx;
    if (Math.abs(dx) > Math.abs(e.clientY - sy)) vimg.style.transform = `translateX(${dx * 0.6}px)`;
  });
  const release = () => {
    if (sx === null) return;
    vimg.style.transform = '';
    if (Math.abs(dx) > 48) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    sx = null;
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);

  /* ——— la demande : elle écrit l'e-mail, avec la liste ——— */
  const TO = 'Jwhite@floridasouth.us';
  const form = $('[data-form]');
  const field = (n) => form.elements[n];
  const value = (n) => (field(n) ? field(n).value.trim() : '');
  const setError = (which, on) => {
    const err = $(`#err-${which}`, form);
    if (err) err.hidden = !on;
    const targets = which === 'reach' ? [field('phone'), field('email')] : [field(which)];
    targets.forEach((el) => el && (on ? el.setAttribute('aria-invalid', 'true') : el.removeAttribute('aria-invalid')));
  };
  field('name').addEventListener('input', () => value('name') && setError('name', false));
  field('list').addEventListener('input', () => value('list') && setError('list', false));
  ['phone', 'email'].forEach((n) => field(n).addEventListener('input', () => (value('phone') || value('email')) && setError('reach', false)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = [];
    const name = value('name');
    const phone = value('phone');
    const email = value('email');
    const jobs = value('list')
      .split(/\n+/)
      .map((l) => l.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean);
    const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name) (setError('name', true), bad.push(field('name')));
    if ((!phone && !email) || !emailOk) {
      $('#err-reach', form).textContent = emailOk
        ? 'Enter a phone number or an email address, so we can reach you.'
        : 'Check the email address: it should look like name@example.com.';
      setError('reach', true);
      bad.push(emailOk ? field('phone') : field('email'));
    }
    if (!jobs.length) (setError('list', true), bad.push(field('list')));
    if (bad.length) return bad[0].focus();
    const where = value('where');
    const who = value('who');
    const subject = `My list for Florida South Construction${where ? `, ${where}` : ''}`;
    const text = [
      'Hello Judson,',
      '',
      'Here is my list:',
      ...jobs.map((j) => `- ${j}`),
      '',
      where ? `Where: ${where}` : null,
      `Name: ${name}`,
      phone ? `Phone: ${phone}` : null,
      email ? `Email: ${email}` : null,
      who ? `Sent your way by: ${who}` : null,
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
    window.location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  });
  $('[data-copy]', form).addEventListener('click', async () => {
    const out = $('[data-copied]', form);
    try {
      await navigator.clipboard.writeText($('[data-ready-text]', form).textContent);
      out.textContent = `Copied. Paste it into an email to ${TO}.`;
    } catch {
      const range = document.createRange();
      range.selectNodeContents($('[data-ready-text]', form));
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      out.textContent = /Mac/.test(navigator.platform) ? 'Selected. Press Cmd+C to copy.' : 'Selected. Press Ctrl+C to copy.';
    }
  });
})();
