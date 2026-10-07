/* Frontline Pools : interactions de la page.
 * Défilement doux (Lenis) et animations au défilement (GSAP + ScrollTrigger).
 * Tout le mouvement passe par des transformations et des opacités ; la mosaïque d'ouverture est dessinée une fois dans un canvas.
 */
(function () {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  G.registerPlugin(ST);
  ST.config({ignoreMobileResize: true});
  if (reduce) root.classList.add('no-motion');
  const mobile = () => innerWidth <= 760;
  const hdH = () => parseFloat(getComputedStyle(root).getPropertyValue('--hd')) || 72;

  /* ——— Défilement doux ——— */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({duration: 1.15, smoothWheel: true});
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const goTo = (el, extra = 0) => {
    const off = -hdH() + 1 + extra;
    if (lenis) lenis.scrollTo(el.id === 'top' ? 0 : el, {offset: off, duration: 1.5});
    else scrollTo({top: el.id === 'top' ? 0 : el.getBoundingClientRect().top + scrollY + off, behavior: reduce ? 'auto' : 'smooth'});
  };
  const lock = (on) => {
    root.classList.toggle('is-locked', on);
    if (lenis) on ? lenis.stop() : lenis.start();
  };

  /* ——— En-tête : ombre, masqué en descendant, rubrique en cours ——— */
  const hd = $('[data-hd]');
  const menu = $('#menu');
  const menuBtn = $('[data-menu]');
  const dock = $('[data-dock]');
  let lastY = scrollY;
  let heroOn = true;
  let estOn = false;
  const onScroll = () => {
    const y = scrollY;
    hd.classList.toggle('is-scrolled', y > 8);
    if (y > lastY + 3 && y > 500 && menu.hidden) hd.classList.add('is-hidden');
    else if (y < lastY - 3 || y <= 500) hd.classList.remove('is-hidden');
    lastY = y;
    dock.classList.toggle('is-on', !heroOn && !estOn && menu.hidden);
  };
  addEventListener('scroll', onScroll, {passive: true});
  new IntersectionObserver(([en]) => { heroOn = en.isIntersecting; onScroll(); }, {rootMargin: '0px 0px -30% 0px'}).observe($('.hero__cta'));
  new IntersectionObserver(([en]) => { estOn = en.isIntersecting; onScroll(); }, {rootMargin: '0px 0px -20% 0px'}).observe($('#estimate'));

  const navLinks = $$('.hd__nav a');
  const navIO = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === '#' + en.target.id));
  }), {rootMargin: '-45% 0px -50% 0px'});
  $$('main > section').forEach((s) => navIO.observe(s));

  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    lock(open);
    if (open && !reduce) G.fromTo($$('nav a, .menu__foot', menu), {opacity: 0, y: 18}, {opacity: 1, y: 0, duration: 0.6, stagger: 0.035, ease: 'power3.out'});
    onScroll();
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id.length > 1 && document.getElementById(id.slice(1));
    if (!el) return;
    e.preventDefault();
    if (!menu.hidden) setMenu(false);
    if (a.dataset.toReview) { openReview(a.dataset.toReview); return; }
    goTo(el);
  }));

  /* ——— Ouvert / fermé, à l'heure de Tampa ——— */
  const fmt = new Intl.DateTimeFormat('en-US', {timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false});
  const paintStatus = () => {
    const parts = fmt.formatToParts(new Date());
    const get = (t) => (parts.find((p) => p.type === t) || {}).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    const min = (+get('hour') % 24) * 60 + +get('minute');
    const weekday = day >= 1 && day <= 5;
    const open = weekday && min >= 480 && min < 1020;
    let text = 'Open now · until 5 pm';
    if (!open) {
      if (weekday && min < 480) text = 'Closed · opens at 8 am';
      else if (day >= 1 && day <= 4) text = 'Closed · opens tomorrow, 8 am';
      else text = 'Closed · opens Monday, 8 am';
    }
    $$('[data-status]').forEach((el) => {
      el.classList.toggle('is-open', open);
      $('span', el).textContent = text;
      el.title = 'Monday to Friday, 8 am to 5 pm (Tampa time)';
    });
    $$('[data-status-text]').forEach((el) => { el.textContent = text; });
  };
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ——— Titres : découpe en lignes réelles ——— */
  function splitLines(el) {
    if (!el.dataset.src) el.dataset.src = el.innerHTML;
    el.innerHTML = el.dataset.src;
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.textContent = part;
            frag.appendChild(w);
            words.push(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    const lines = [];
    let top = null;
    words.forEach((w) => {
      const t = w.getBoundingClientRect().top;
      if (top === null || Math.abs(t - top) > 6) { lines.push([]); top = t; }
      lines[lines.length - 1].push(w);
    });
    el.innerHTML = '';
    lines.forEach((ws, i) => {
      const line = document.createElement('span');
      line.className = 'ln';
      line.style.setProperty('--i', i);
      const inner = document.createElement('span');
      ws.forEach((w, j) => { inner.appendChild(document.createTextNode(w.textContent)); if (j < ws.length - 1) inner.appendChild(document.createTextNode(' ')); });
      line.appendChild(inner);
      el.appendChild(line);
    });
  }
  const splits = $$('[data-lines]');

  /* ——— Le titre d'accueil occupe toute la largeur ——— */
  const title = $('.hero__title');
  const textWidth = (el) => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect().width; };
  function fitHero() {
    const box = title.parentNode;
    box.style.setProperty('--fit', '100px');
    const cs = getComputedStyle(box);
    const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const spans = $$('.ln > span', title);
    let w;
    if (innerWidth <= 1080) w = Math.max(...spans.map(textWidth));
    else w = textWidth($('.hero__l1', title));
    box.style.setProperty('--fit', `${Math.floor((100 * avail) / w * (mobile() ? 0.97 : 0.985))}px`);
  }
  $$('.ln', title).forEach((l, i) => l.style.setProperty('--i', i));

  /* ——— Le grand mot du pied de page ——— */
  const ftBig = $('[data-fit-big]');
  const ftWord = $('span', ftBig);
  ftWord.innerHTML = ftWord.textContent.split('').map((c) => `<span class="ch">${c}</span>`).join('');
  function fitBig() {
    ftBig.style.setProperty('--big', '100px');
    const w = textWidth(ftWord);
    ftBig.style.setProperty('--big', `${(100 * innerWidth * 0.97) / w}px`);
  }

  /* ——— La mosaïque : la photo se pose carreau par carreau, puis les joints se referment ——— */
  function mosaic(fig, {delay = 0, tile = 52} = {}) {
    const img = $('img', fig);
    const host = img.parentNode;
    return (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => new Promise((done) => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h || !img.naturalWidth) { fig.classList.add('is-done'); done(); return; }
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const cv = document.createElement('canvas');
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.setAttribute('aria-hidden', 'true');
      host.appendChild(cv);
      const ctx = cv.getContext('2d');
      // l'image telle que la page l'affiche (object-fit: cover et object-position), à la taille du canvas
      const pre = document.createElement('canvas');
      pre.width = cv.width;
      pre.height = cv.height;
      const cs = getComputedStyle(img);
      const pos = cs.objectPosition.split(' ').map((v) => parseFloat(v) / 100);
      const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      pre.getContext('2d').drawImage(img, (w - dw) * (pos[0] || 0.5) * dpr, (h - dh) * (pos[1] ?? 0.5) * dpr, dw * dpr, dh * dpr);
      img.style.opacity = '0';
      const cols = Math.max(6, Math.round(w / tile));
      const T = w / cols;
      const rows = Math.ceil(h / T);
      const tiles = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // en diagonale, du bas à gauche vers le haut à droite, avec un léger désordre
          const d = (c / cols) * 0.62 + ((rows - 1 - r) / rows) * 0.38 + Math.random() * 0.1;
          tiles.push({x: c * T * dpr, y: r * T * dpr, d});
        }
      }
      const S = T * dpr;
      const SPAN = 1.05;
      const DUR = 0.55;
      const GROUT = 0.4;
      const gap0 = Math.max(1.5, 2 * dpr);
      const out = (k) => 1 - Math.pow(1 - k, 3);
      let t0 = null;
      const frame = (now) => {
        if (t0 === null) t0 = now + delay * 1000;
        const t = (now - t0) / 1000;
        ctx.clearRect(0, 0, cv.width, cv.height);
        const g = t > SPAN + DUR ? gap0 * (1 - out(Math.min(1, (t - SPAN - DUR) / GROUT))) : gap0;
        for (const p of tiles) {
          const k = Math.min(1, Math.max(0, (t - p.d * SPAN) / DUR));
          if (k <= 0) continue;
          const e = out(k);
          const sc = 0.62 + 0.38 * e;
          const size = (S - g) * sc;
          const ox = p.x + (S - size) / 2;
          const oy = p.y + (S - size) / 2;
          ctx.globalAlpha = Math.min(1, k * 1.8);
          // le carreau reprend exactement son morceau d'image, réduit autour de son centre
          ctx.drawImage(pre, p.x + g / 2, p.y + g / 2, S - g, S - g, ox, oy, size, size);
        }
        ctx.globalAlpha = 1;
        if (t < SPAN + DUR + GROUT) requestAnimationFrame(frame);
        else {
          img.style.opacity = '';
          fig.classList.add('is-done');
          requestAnimationFrame(() => { cv.remove(); done(); });
        }
      };
      requestAnimationFrame(frame);
    }));
  }

  /* ——— Ouverture ——— */
  function intro() {
    const hero = $('[data-mosaic]');
    root.classList.add('is-ready');
    if (reduce) { hero.classList.add('is-done'); return; }
    mosaic(hero, {delay: 0.35, tile: mobile() ? 44 : 54});
  }

  /* ——— Apparitions ——— */
  function reveals() {
    let batch = 0;
    let batchT = 0;
    $$('[data-reveal-group]').forEach((g) => $$('[data-reveal]', g).forEach((el, i) => el.style.setProperty('--d', `${i * 80}ms`)));
    $$('.step').forEach((el, i) => el.style.setProperty('--d', `${i * 150}ms`));
    const show = (el) => {
      const now = performance.now();
      if (now - batchT > 140) { batch = 0; batchT = now; }
      if (el.matches('.rev') && !el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${Math.min(batch++, 5) * 70}ms`);
      el.classList.add('is-in');
      $$('[data-count]', el).concat(el.matches('[data-count]') ? [el] : []).forEach(count);
    };
    const obs = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      obs.unobserve(en.target);
      show(en.target);
    }), {rootMargin: '0px 0px -8% 0px'});
    [...splits, ...$$('[data-reveal], .step, [data-weeks], .lic__num, .rev-stat__text, .rev')].forEach((el) => obs.observe(el));
  }

  /* ——— Les chiffres comptent jusqu'à leur valeur ——— */
  function count(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const to = parseFloat(el.dataset.count);
    const dec = +(el.dataset.dec || 0);
    const paint = (v) => {
      let s = v.toFixed(dec);
      if (el.hasAttribute('data-sep')) s = Math.round(v).toLocaleString('en-US');
      el.textContent = s;
    };
    if (reduce) { paint(to); return; }
    const o = {v: 0};
    paint(0);
    G.to(o, {v: to, duration: to > 1000 ? 1.8 : 1.4, ease: 'power3.out', delay: 0.15, onUpdate: () => paint(o.v), onComplete: () => paint(to)});
  }

  /* ——— La citation de John s'allume mot à mot ——— */
  function words() {
    $$('[data-words]').forEach((el) => {
      el.innerHTML = el.textContent.split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
      if (reduce) return;
      G.to($$('.w', el), {opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: {trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.4}});
    });
  }

  /* ——— Barre de lecture, dérive de la photo d'accueil ——— */
  function scrubs() {
    if (reduce) { $('[data-progress]').hidden = true; return; }
    G.to('[data-progress]', {scaleX: 1, ease: 'none', scrollTrigger: {trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3}});
    const media = $('.hero__media');
    G.to('[data-hero-drift]', {y: () => media.offsetHeight * 0.085, ease: 'none', scrollTrigger: {trigger: media, start: 'top top+=60', end: 'bottom top', scrub: true, invalidateOnRefresh: true}});
    G.to('.hero__title', {y: -30, ease: 'none', scrollTrigger: {trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true}});
  }

  /* ——— La visite guidée : la caméra s'approche de chaque partie du bassin ——— */
  function tour() {
    const frame = $('[data-tour-frame]');
    const cam = $('[data-tour-cam]');
    const eq = $('[data-tour-eq]');
    const aim = $('[data-tour-aim]');
    const ring = $('circle', aim);
    const cross = $('path', aim);
    const label = $('[data-tour-label]');
    const ticks = $$('.tour__ticks li', frame);
    const chaps = $$('.chap');
    const img = $('img', cam);
    const IW = +img.getAttribute('width');
    const IH = +img.getAttribute('height');
    let L = null;
    let cur = -2;
    const layout = () => {
      const fw = frame.clientWidth;
      const fh = frame.clientHeight;
      const s0 = Math.max(fw / IW, fh / IH);
      L = {fw, fh, cw: IW * s0, ch: IH * s0};
      G.set(cam, {width: L.cw, height: L.ch});
      const e = Math.max(fw, fh);
      G.set(eq, {width: e, height: e, left: (fw - e) / 2, top: (fh - e) / 2});
    };
    // la position de la caméra pour un chapitre : le point visé au centre, sans jamais montrer le bord de la photo
    const view = (i) => {
      const c = chaps[i];
      if (i < 0 || !c || c.hasAttribute('data-eq')) {
        return {x: (L.fw - L.cw) / 2, y: (L.fh - L.ch) / 2, s: 1, ax: 0, ay: 0};
      }
      const s = +c.dataset.s * (mobile() ? 0.92 : 1);
      const px = +c.dataset.x * L.cw;
      const py = +c.dataset.y * L.ch;
      const x = Math.min(0, Math.max(L.fw - L.cw * s, L.fw / 2 - px * s));
      const y = Math.min(0, Math.max(L.fh - L.ch * s, L.fh / 2 - py * s));
      return {x, y, s, ax: x + px * s - L.fw / 2, ay: y + py * s - L.fh / 2};
    };
    const go = (i, instant = false) => {
      if (i === cur && !instant) return;
      cur = i;
      chaps.forEach((c, k) => c.classList.toggle('is-on', k === i));
      ticks.forEach((t, k) => t.classList.toggle('is-on', k <= i));
      const v = view(i);
      const isEq = i >= 0 && chaps[i].hasAttribute('data-eq');
      const text = i < 0 ? 'Scroll to look closer' : chaps[i].dataset.label;
      const d = instant || reduce ? 0 : 1.35;
      G.to(cam, {x: v.x, y: v.y, scale: v.s, duration: d, ease: 'power3.inOut', overwrite: true});
      G.to(eq, {opacity: isEq ? 1 : 0, scale: isEq ? 1 : 1.1, duration: d ? 0.9 : 0, ease: 'power2.inOut', overwrite: true});
      if (!d) {
        G.set(aim, {x: v.ax, y: v.ay});
        G.set(ring, {strokeDashoffset: i < 0 ? 1 : 0});
        G.set(cross, {opacity: i < 0 ? 0 : 1});
        label.textContent = text;
        return;
      }
      G.timeline({overwrite: true})
        .to([ring, cross, label], {opacity: 0, duration: 0.25, ease: 'power1.out'}, 0)
        .to(aim, {x: v.ax, y: v.ay, duration: d, ease: 'power3.inOut'}, 0)
        .add(() => { label.textContent = text; }, 0.3)
        .set(ring, {strokeDashoffset: 1, opacity: 1}, d - 0.25)
        .to(ring, {strokeDashoffset: i < 0 ? 1 : 0, duration: 0.8, ease: 'power2.out'}, d - 0.25)
        .to(cross, {opacity: i < 0 ? 0 : 1, duration: 0.4}, d)
        .fromTo(label, {opacity: 0, x: -8}, {opacity: 1, x: 0, duration: 0.5, ease: 'power3.out'}, d - 0.1);
    };
    G.set(cam, {transformOrigin: '0 0'});
    layout();
    go(-1, true);
    G.set(label, {opacity: 1});
    chaps.forEach((c, i) => ST.create({
      trigger: c,
      start: () => (mobile() ? 'top 60%' : 'top 58%'),
      end: () => (mobile() ? 'bottom 60%' : 'bottom 58%'),
      onToggle: (self) => { if (self.isActive) go(i); },
      onLeaveBack: () => { if (i === 0) go(-1); },
      invalidateOnRefresh: true,
    }));
    addEventListener('resize', () => { const i = cur; layout(); cur = -2; go(i, true); });
  }

  /* ——— Les chantiers : les fiches s'empilent ——— */
  function sheets() {
    const list = $$('[data-sheet]');
    list.forEach((s) => { const sh = document.createElement('i'); sh.className = 'sheet__shade'; $('.sheet__in', s).appendChild(sh); });
    if (reduce) return;
    list.forEach((s, i) => {
      const img = $('.sheet__media img', s);
      G.fromTo(img, {yPercent: -4}, {yPercent: 4, ease: 'none', scrollTrigger: {trigger: s, start: 'top bottom', end: 'bottom top', scrub: true}});
      const next = list[i + 1];
      if (!next) return;
      const tl = G.timeline({scrollTrigger: {trigger: next, start: 'top bottom', end: () => `top top+=${hdH()}`, scrub: true, invalidateOnRefresh: true}});
      tl.to($('.sheet__in', s), {scale: 0.92, ease: 'none'}, 0).to($('.sheet__shade', s), {opacity: 0.55, ease: 'none'}, 0);
    });
  }

  /* ——— Les photos des chantiers : bande à faire glisser et visionneuse ——— */
  function strip() {
    const el = $('[data-strip]');
    const prev = $('[data-more-prev]');
    const next = $('[data-more-next]');
    const step = () => el.clientWidth * 0.7;
    const upd = () => {
      prev.disabled = el.scrollLeft < 8;
      next.disabled = el.scrollLeft > el.scrollWidth - el.clientWidth - 8;
    };
    prev.addEventListener('click', () => el.scrollBy({left: -step(), behavior: reduce ? 'auto' : 'smooth'}));
    next.addEventListener('click', () => el.scrollBy({left: step(), behavior: reduce ? 'auto' : 'smooth'}));
    el.addEventListener('scroll', upd, {passive: true});
    upd();

    const lb = $('[data-lb]');
    const lbImg = $('[data-lb-img]', lb);
    const cap = $('[data-lb-cap]', lb);
    const shots = $$('[data-shot] img', el);
    let at = 0;
    const show = (i) => {
      at = (i + shots.length) % shots.length;
      lbImg.src = shots[at].src;
      lbImg.alt = shots[at].alt;
      cap.textContent = `${at + 1} / ${shots.length} · ${shots[at].alt}`;
      if (!reduce) G.fromTo(lbImg, {opacity: 0, scale: 0.97}, {opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out'});
    };
    $$('[data-shot]', el).forEach((b, i) => b.addEventListener('click', () => { show(i); lb.showModal(); lock(true); }));
    lb.addEventListener('close', () => lock(false));
    $('[data-lb-close]', lb).addEventListener('click', () => lb.close());
    $('[data-lb-prev]', lb).addEventListener('click', () => show(at - 1));
    $('[data-lb-next]', lb).addEventListener('click', () => show(at + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(at - 1); if (e.key === 'ArrowRight') show(at + 1); });
    let sx = null;
    lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, {passive: true});
    lb.addEventListener('touchend', (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* ——— Local technique : l'« après » monte derrière une ligne d'eau ——— */
  function befores() {
    if (reduce) return;
    $$('[data-ba]').forEach((ba) => {
      const box = $('.ba__box', ba);
      const tl = G.timeline({scrollTrigger: {trigger: box, start: () => (mobile() ? 'top 82%' : 'top 78%'), end: () => (mobile() ? 'center 38%' : 'top 22%'), scrub: 0.6, invalidateOnRefresh: true}});
      tl.fromTo($('.ba__after', ba), {yPercent: 100}, {yPercent: 0, ease: 'none'}, 0)
        .fromTo($('.ba__after-in', ba), {yPercent: -100}, {yPercent: 0, ease: 'none'}, 0);
    });
  }

  /* ——— Les marques défilent, plus vite et dans le sens du défilement ——— */
  function marquee() {
    const track = $('.brands__track');
    if (reduce) return;
    let x = 0;
    let dir = -1;
    let boost = 0;
    let half = track.scrollWidth / 2;
    addEventListener('resize', () => { half = track.scrollWidth / 2; });
    if (lenis) lenis.on('scroll', ({velocity}) => { if (Math.abs(velocity) > 0.2) dir = velocity > 0 ? -1 : 1; boost = Math.min(Math.abs(velocity) * 1.4, 24); });
    let inView = false;
    new IntersectionObserver(([en]) => { inView = en.isIntersecting; }).observe(track.parentNode);
    G.ticker.add((t, dt) => {
      if (!inView) return;
      boost *= 0.92;
      x += dir * (1 + boost) * (dt / 16.7);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    });
  }

  /* ——— Avis : tout afficher, aller à l'avis de John ——— */
  const revs = $('[data-revs]');
  const more = $('[data-revs-more]');
  const setAll = (on) => {
    revs.classList.toggle('is-all', on);
    more.setAttribute('aria-expanded', String(on));
    $('span', more).textContent = on ? 'Show fewer reviews' : 'Show all 33 reviews';
    $$('.rev', revs).forEach((r) => r.classList.add('is-in'));
    ST.refresh();
  };
  more.addEventListener('click', () => {
    const on = !revs.classList.contains('is-all');
    setAll(on);
    if (!on) goTo($('#reviews'));
  });
  function openReview(key) {
    const card = $(`#rev-${key}`);
    if (!card) return;
    if (getComputedStyle(card).display === 'none') setAll(true);
    goTo(card, -24);
    card.classList.add('is-pointed');
    setTimeout(() => card.classList.remove('is-pointed'), 2400);
  }

  /* ——— La licence défile comme un compteur ——— */
  function odometer() {
    const odo = $('.odo');
    const digits = odo.dataset.digits.split('');
    odo.innerHTML = digits.map((d) => `<span class="odo__d"><span class="odo__s">${'01234567890123456789'.split('').map((n) => `<span>${n}</span>`).join('')}</span></span>`).join('');
    const cols = $$('.odo__s', odo);
    if (reduce) { cols.forEach((c, i) => { c.style.transform = `translateY(-${digits[i]}em)`; }); return; }
    const obs = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      obs.disconnect();
      cols.forEach((c, i) => G.fromTo(c, {y: 0}, {y: () => -(10 + +digits[i]) * c.firstElementChild.offsetHeight, duration: 1.6 + i * 0.12, ease: 'power4.out', delay: 0.1 + i * 0.06}));
    }, {rootMargin: '0px 0px -12% 0px'});
    obs.observe(odo);
  }

  /* ——— Questions : ouverture en douceur ——— */
  function faq() {
    $$('.qa').forEach((d) => {
      const sum = $('summary', d);
      const body = $('.qa__a', d);
      sum.addEventListener('click', (e) => {
        if (reduce) return;
        e.preventDefault();
        if (d.open) {
          G.to(body, {height: 0, duration: 0.45, ease: 'power3.inOut', onComplete: () => { d.open = false; G.set(body, {clearProps: 'height'}); ST.refresh(); }});
        } else {
          d.open = true;
          G.fromTo(body, {height: 0}, {height: body.scrollHeight, duration: 0.55, ease: 'power3.out', onComplete: () => { G.set(body, {clearProps: 'height'}); ST.refresh(); }});
        }
      });
    });
  }

  /* ——— Secteurs : la liste, la carte et la fiche se répondent ——— */
  const PROOF = {
    'davis-islands': {job: ['Renovation & automation upgrade', 'job-davis'], q: [['Jacob and Matthew delivered everything they promised, and in a shorter time than anticipated, all in about 6-8 weeks.', 'John']]},
    'south-tampa': {job: ['Resurfacing & decorative concrete deck', 'job-south'], q: [['Frontline pools did a fantastic job resurfacing my pool. It looks incredible.', 'Hank']]},
    'plant-city': {job: ['Walden Lake: complete renovation', 'job-walden'], q: [['They came on time everyday and we had zero problems.', 'Amy'], ['Their work ethic was incredible, early hours, late evening, they put the work in.', 'David']]},
    'citrus-park': {job: ['StoneScapes, tile & equipment', 'job-citrus'], q: [['Matt, Jacob, and the whole team were incredibly professional, diligent, and a joy to work with throughout the entirety of the project.', 'Vincent']]},
    carrollwood: {q: [['It’s came out better that could have imagined! A true work of art.', 'Tim'], ['Mathew, Jacob, and the whole crew were professional, kind, and kept us informed throughout the process.', 'Cyndy']]},
    'new-tampa': {q: [['The new pool equipment is running beautifully, and I’m very pleased with the overall workmanship.', 'AJ'], ['Communication was great and my pool looks fantastic.', 'Jerry']]},
    valrico: {q: [['They took the time before to go over our options and help us pick what was best.', 'Kaitlyn']]},
    hudson: {q: [['Jacob & Matt completely refurbished our pool from swampland disaster to absolutely beautiful.', 'Sandy & Glen']]},
  };
  function areas() {
    const map = $('[data-map]');
    const card = $('[data-acard]');
    const place = $('[data-acard-place]', card);
    const body = $('[data-acard-body]', card);
    const btns = $$('[data-alist] button');
    const dots = $$('.m-area', map);
    dots.forEach((d) => d.classList.toggle('has-proof', !!PROOF[d.dataset.area]));
    let cur = null;
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const set = (key) => {
      if (key === cur) return;
      cur = key;
      const btn = btns.find((b) => b.dataset.area === key);
      btns.forEach((b) => b.classList.toggle('is-on', b === btn));
      dots.forEach((d) => d.classList.toggle('is-on', d.dataset.area === key));
      const p = PROOF[key];
      place.textContent = $('span', btn).textContent;
      let html = '';
      if (p && p.job) html += `<p class="acard__job">Project: <a href="#${p.job[1]}">${esc(p.job[0])}</a></p>`;
      if (p) html += p.q.map(([q, who]) => `<p>“${esc(q)}”<cite>${esc(who)}</cite></p>`).join('');
      else html = '<p>On our service list. Tell us about your pool and we’ll come out for a free on-site estimate.</p><p><a href="#estimate">Request an estimate</a></p>';
      body.innerHTML = html;
      $$('a[href^="#"]', body).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goTo(document.getElementById(a.getAttribute('href').slice(1))); }));
      if (!reduce) G.fromTo([place, ...body.children], {opacity: 0, y: 10}, {opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power3.out', overwrite: true});
    };
    btns.forEach((b) => {
      b.addEventListener('click', () => set(b.dataset.area));
      b.addEventListener('focus', () => set(b.dataset.area));
      if (matchMedia('(hover: hover)').matches) b.addEventListener('pointerenter', () => set(b.dataset.area));
    });
    dots.forEach((d) => {
      d.addEventListener('click', () => set(d.dataset.area));
      if (matchMedia('(hover: hover)').matches) d.addEventListener('pointerenter', () => set(d.dataset.area));
    });
    if (reduce) return;
    // à l'arrivée, les points se posent sur la carte, du port vers l'extérieur
    const base = $('.m-base', map);
    G.set(dots, {opacity: 0});
    const obs = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      obs.disconnect();
      const bb = base.getBBox();
      const bx = bb.x + bb.width / 2;
      const by = bb.y + bb.height / 2;
      const dist = (d) => { const m = d.transform.baseVal.consolidate().matrix; return Math.hypot(m.e - bx, m.f - by); };
      const order = [...dots].sort((a, b) => dist(a) - dist(b));
      G.fromTo(base, {opacity: 0}, {opacity: 1, duration: 0.6});
      G.to(order, {opacity: 1, duration: 0.5, stagger: 0.07, delay: 0.3, ease: 'power2.out'});
    }, {rootMargin: '0px 0px -20% 0px'});
    obs.observe(map);
  }

  /* ——— Formulaire (non relié : il vérifie les champs et affiche un remerciement) ——— */
  function form() {
    const f = $('[data-form]');
    const done = $('[data-form-done]', f);
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      let first = null;
      $$('[required]', f).forEach((el) => {
        const v = el.value.trim();
        const fmtBad = (el.type === 'email' && v && !email.test(v)) || (el.type === 'tel' && v && v.replace(/\D/g, '').length < 10);
        const bad = !v || fmtBad;
        const field = el.closest('.field');
        field.classList.toggle('is-bad', bad);
        field.classList.toggle('is-format', !!fmtBad);
        el.toggleAttribute('aria-invalid', bad);
        if (bad && !first) first = el;
      });
      if (first) { first.focus(); return; }
      $('[data-form-name]', f).textContent = f.name.value.trim().split(/\s+/)[0];
      done.hidden = false;
      done.setAttribute('tabindex', '-1');
      done.focus({preventScroll: true});
      if (!reduce) G.fromTo(done.children, {opacity: 0, y: 16}, {opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out'});
    });
    $$('[required]', f).forEach((el) => el.addEventListener('input', () => { el.closest('.field').classList.remove('is-bad', 'is-format'); el.removeAttribute('aria-invalid'); }));
  }

  /* ——— Le grand mot du pied de page monte lettre par lettre ——— */
  function footer() {
    if (reduce) return;
    G.fromTo($$('.ch', ftBig), {yPercent: 100}, {yPercent: 0, stagger: 0.05, ease: 'power3.out', duration: 1.1, scrollTrigger: {trigger: ftBig, start: 'top 95%'}});
    const late = $('[data-mosaic-late]');
    if (late && getComputedStyle(late).display !== 'none') {
      const obs = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        obs.disconnect();
        mosaic(late, {tile: 40});
      }, {rootMargin: '0px 0px -25% 0px'});
      obs.observe(late);
    }
  }

  /* ——— Démarrage ——— */
  const start = () => {
    fitHero();
    fitBig();
    splits.forEach(splitLines);
    words();
    odometer();
    intro();
    reveals();
    scrubs();
    tour();
    sheets();
    strip();
    befores();
    marquee();
    faq();
    areas();
    form();
    footer();
    ST.refresh();
    let rw = innerWidth;
    let rt;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        fitHero();
        fitBig();
        if (innerWidth !== rw) { rw = innerWidth; splits.forEach(splitLines); splits.forEach((s) => s.classList.add('is-in')); }
        ST.refresh();
      }, 150);
    });
    addEventListener('load', () => ST.refresh());
  };
  const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
  fontsReady.then(() => requestAnimationFrame(start));
})();
