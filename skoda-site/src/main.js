/* Skoda Construction : l'ouverture, le défilement, l'histoire de la maison restaurée, la visionneuse et le formulaire. */
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 1000px)');
  // la courbe des réponses aux gestes, la même que --ease dans styles.css
  const EASE = 'cubic-bezier(0.2, 0.7, 0.1, 1)';

  /* ——— l'ouverture : quand les polices sont là (ou au bout de 1,2 s), le titre puis les lettres du nom ——— */
  const ready = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')));
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1200))]).then(ready);

  /* ——— le défilement : Lenis, sauf en mouvement réduit ——— */
  let lenis = null;
  if (!still.matches && typeof Lenis === 'function') {
    lenis = new Lenis({lerp: 0.11, wheelMultiplier: 0.95, anchors: false});
    const raf = (t) => (lenis.raf(t), requestAnimationFrame(raf));
    requestAnimationFrame(raf);
  }
  const topH = () => $('[data-top]').offsetHeight;
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
      target.setAttribute('tabindex', '-1');
      target.focus({preventScroll: true});
    }
  });

  /* ——— l'en-tête : un filet sous lui dès qu'on a quitté le haut ; la partie courante dans le menu ——— */
  const top = $('[data-top]');
  const onScroll = () => top.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, {passive: true});
  onScroll();
  const links = $$('.nav a');
  // toutes les parties : sur l'accueil, la carte ou le formulaire, aucun lien du menu n'est allumé
  const sections = $$('main > section[id]');
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
  sections.forEach((s) => seen.observe(s));

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

  /* ——— le terrain, la coque, la maison : chaque photo se découvre quand elle arrive ; la ligne de la famille ——— */
  const once = new IntersectionObserver(
    (entries) => {
      for (const en of entries) if (en.isIntersecting) (en.target.classList.add('is-in'), once.unobserve(en.target));
    },
    {rootMargin: '0px 0px -18% 0px'},
  );
  $$('[data-reveal], [data-line]').forEach((el) => once.observe(el));

  /* ——— « Better than new » : sur ordinateur, le défilement fait passer le temps de novembre 2022 à décembre 2023 ——— */
  const story = $('[data-story]');
  const steps = $$('.story__step', story);
  const bar = $('[data-bar]', story);
  let shown = -1;
  const show = (i) => {
    if (i === shown) return;
    shown = i;
    steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
  };
  const tick = () => {
    if (!wide.matches || still.matches) {
      steps.forEach((s) => s.classList.remove('is-on'));
      shown = -1;
      return;
    }
    const r = story.getBoundingClientRect();
    const run = story.offsetHeight - (window.innerHeight - topH());
    const p = Math.min(1, Math.max(0, (topH() - r.top) / Math.max(1, run)));
    story.style.setProperty('--p', p.toFixed(4));
    show(p < 0.34 ? 0 : p < 0.67 ? 1 : 2);
  };
  window.addEventListener('scroll', tick, {passive: true});
  window.addEventListener('resize', tick);
  wide.addEventListener('change', tick);
  tick();

  /* ——— la visionneuse des pièces ——— */
  const viewer = $('[data-viewer]');
  const vImg = $('[data-viewer-img]', viewer);
  const vCap = $('[data-viewer-cap]', viewer);
  const vCount = $('[data-viewer-count]', viewer);
  const items = $$('.rooms__grid .ph');
  let at = 0;
  let opener = null;
  let seq = 0;
  // `dir` : −1 précédente, 1 suivante, 0 à l'ouverture. La photo reste cachée jusqu'à ce qu'elle soit prête (jamais
  // l'ancienne ni une image à moitié chargée), puis elle arrive en fondu, un peu glissée du côté où l'on va. D'une photo
  // à l'autre, l'ancienne reste par-dessus, en calque, et s'efface pendant ce temps : un fondu enchaîné, sans trou noir.
  const load = (i, dir = 0) => {
    if (dir && !still.matches && vImg.complete && vImg.naturalWidth) {
      const r = vImg.getBoundingClientRect();
      const from = Number(getComputedStyle(vImg).opacity);
      const ghost = vImg.cloneNode();
      ghost.removeAttribute('data-viewer-img');
      ghost.alt = '';
      ghost.className = 'viewer__ghost';
      Object.assign(ghost.style, {left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`});
      viewer.prepend(ghost);
      const gone = () => ghost.remove();
      ghost.animate([{opacity: from}, {opacity: 0, transform: `translateX(${-dir * 20}px)`}], {duration: 300, easing: EASE}).finished.then(gone, gone);
    }
    at = (i + items.length) % items.length;
    const btn = items[at];
    const img = $('img', btn);
    vImg.src = btn.dataset.full || img.currentSrc || img.src;
    vImg.alt = img.alt;
    vCap.textContent = btn.parentElement.querySelector('p').textContent;
    vCount.textContent = `${at + 1} of ${items.length}`;
    if (still.matches) return;
    vImg.getAnimations().forEach((a) => a.cancel());
    const fade = vImg.animate(
      [{opacity: 0, transform: `translateX(${dir * 20}px)`}, {opacity: 1, transform: 'none'}],
      {duration: 380, easing: EASE},
    );
    fade.pause();
    const n = ++seq;
    vImg.decode().catch(() => null).then(() => n === seq && fade.play());
  };
  items.forEach((btn, i) =>
    btn.addEventListener('click', () => {
      opener = btn;
      load(i);
      viewer.showModal();
      if (lenis) lenis.stop();
    }),
  );
  $('[data-prev]', viewer).addEventListener('click', () => load(at - 1, -1));
  $('[data-next]', viewer).addEventListener('click', () => load(at + 1, 1));
  $('[data-close]', viewer).addEventListener('click', () => viewer.close());
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') load(at - 1, -1);
    if (e.key === 'ArrowRight') load(at + 1, 1);
  });
  viewer.addEventListener('click', (e) => {
    if (e.target === viewer) viewer.close();
  });
  viewer.addEventListener('close', () => {
    $$('.viewer__ghost', viewer).forEach((g) => g.remove());
    if (lenis) lenis.start();
    if (opener) opener.focus();
  });

  /* ——— le formulaire : il écrit l'e-mail de la demande ——— */
  const form = $('[data-form]');
  const budgetBox = $('[data-budget]', form);
  const budgetList = $('[data-budget-list]', form);
  const BUDGETS = {
    home: ['$1 million to $5 million', '$5 million to $10 million', '$10 million or more', 'Not sure yet'],
    remodel: ['$250,000 to $500,000', '$500,000 to $1 million', '$1 million or more', 'Not sure yet'],
  };
  const KIND = {'New custom home': 'home', 'Building on my lot': 'home', Remodel: 'remodel'};
  let kind = null;
  let moving = [];
  // Le budget arrive sans à-coup : la suite du formulaire glisse de son ancienne place à la nouvelle (mesurées avant et
  // après, animées en transform seulement), puis les fourchettes apparaissent en fondu. Rien de tout ça en mouvement réduit.
  const setBudget = (k) => {
    const after = [...form.children].slice([...form.children].indexOf(budgetBox) + 1);
    const was = after.map((el) => el.getBoundingClientRect().top);
    moving.forEach((a) => a.cancel());
    budgetBox.hidden = !k;
    budgetList.innerHTML = k
      ? BUDGETS[k].map((b) => `<label><input type="radio" name="budget" value="${b}"><span>${b}</span></label>`).join('')
      : '';
    if (still.matches) return;
    moving = after.flatMap((el, i) => {
      const dy = was[i] - el.getBoundingClientRect().top;
      return Math.abs(dy) < 0.5 ? [] : [el.animate([{transform: `translateY(${dy}px)`}, {transform: 'none'}], {duration: 450, easing: EASE})];
    });
    if (k) moving.push(budgetBox.animate([{opacity: 0}, {opacity: 1}], {duration: 320, delay: 140, easing: 'ease-out', fill: 'backwards'}));
  };
  form.addEventListener('change', (e) => {
    if (e.target.name === 'project') {
      const k = KIND[e.target.value] || null;
      setError('project', false);
      if (k === kind) return;
      kind = k;
      setBudget(k);
    }
  });
  const field = (n) => form.elements[n];
  function setError(which, on) {
    const err = $(`#err-${which}`, form);
    if (err) err.hidden = !on;
    const targets = which === 'reach' ? [field('phone'), field('email')] : which === 'project' ? [] : [field(which)];
    targets.forEach((el) => el && el.setAttribute('aria-invalid', String(on)));
  }
  ['name', 'phone', 'email'].forEach((n) =>
    field(n).addEventListener('input', () => {
      if (n === 'name' && field('name').value.trim()) setError('name', false);
      if (n !== 'name' && (field('phone').value.trim() || field('email').value.trim())) setError('reach', false);
    }),
  );
  const value = (n) => {
    const el = field(n);
    if (!el) return '';
    return (el instanceof RadioNodeList ? el.value : el.value || '').trim();
  };
  let text = '';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = [];
    const project = value('project');
    const name = value('name');
    const phone = value('phone');
    const email = value('email');
    const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!project) (setError('project', true), bad.push(form.querySelector('input[name="project"]')));
    if (!name) (setError('name', true), bad.push(field('name')));
    if ((!phone && !email) || !emailOk) {
      const err = $('#err-reach', form);
      err.textContent = emailOk ? 'Enter a phone number or an email address, so we can reach you.' : 'Check the email address: it should look like name@example.com.';
      setError('reach', true);
      bad.push(emailOk ? field('phone') : field('email'));
    }
    if (bad.length) {
      bad[0].focus();
      return;
    }
    const where = value('where');
    const budget = value('budget');
    const reach = value('reach');
    const message = value('message');
    const subject = `Consultation request: ${project.toLowerCase()}${where ? ` in ${where}` : ''}`;
    text = [
      'Hello Chris and Mike,',
      '',
      `I would like to schedule a consultation.`,
      '',
      `Project: ${project}`,
      budget ? `Budget: ${budget}` : null,
      where ? `Where: ${where}` : null,
      `Name: ${name}`,
      phone ? `Phone: ${phone}` : null,
      email ? `Email: ${email}` : null,
      `Best way to reach me: ${reach || 'Either'}`,
      message ? `\nAbout the project:\n${message}` : null,
      '',
      'Thank you,',
      name,
    ]
      .filter((l) => l !== null)
      .join('\n');
    const box = $('[data-ready]', form);
    $('[data-ready-text]', box).textContent = `To: skodabuilding@gmail.com\nSubject: ${subject}\n\n${text}`;
    $('[data-copied]', box).textContent = '';
    box.hidden = false;
    box.focus({preventScroll: true});
    go(box);
    // la demande arrive en montant un peu (après le calcul du défilement, qui mesure sa place sans ce décalage)
    if (!still.matches) box.animate([{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 500, easing: EASE});
    window.location.href = `mailto:skodabuilding@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  });
  $('[data-copy]', form).addEventListener('click', async () => {
    const out = $('[data-copied]', form);
    const all = $('[data-ready-text]', form).textContent;
    try {
      await navigator.clipboard.writeText(all);
      out.textContent = 'Copied. Paste it into an email to skodabuilding@gmail.com.';
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
