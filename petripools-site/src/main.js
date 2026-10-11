// Petri Pools : la frise de ligne d'eau recarrelée à l'ouverture, puis le reste du site.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const out3 = (t) => 1 - Math.pow(1 - t, 3);

  // hasard reproductible : la même mosaïque à chaque visite
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (list, r) => {
    let x = r * list.reduce((n, [, w]) => n + w, 0);
    for (const [c, w] of list) if ((x -= w) <= 0) return c;
    return list[list.length - 1][0];
  };
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ——— La frise de ligne d'eau ———
     Une rangée de carreaux de céramique beige de 15 cm (le spa « avant » de leurs photos), remplacée carreau par carreau
     par une mosaïque de verre grise et bleutée (le spa « après »). Sous la ligne d'eau, les carreaux paraissent décalés,
     comme dans une vraie piscine. */
  // couleurs relevées sur leurs mosaïques : gris, bleu-gris, quelques reflets turquoise
  const GLASS = [['#2f3a42', 3], ['#3b4b56', 8], ['#4a6272', 14], ['#56707f', 14], ['#67818f', 13], ['#7d95a3', 12], ['#93a9b5', 10], ['#aabdc7', 8], ['#c6d4db', 5], ['#e2e9ec', 2], ['#4f8ea6', 5], ['#6fb2c7', 3]];
  const OLD = [['#dccfb8', 4], ['#d5c6ab', 4], ['#e1d6c2', 3], ['#d0c0a4', 2]];
  const SET = 0.34; // durée de pose d'un carreau (s)

  // le reflet d'un carreau de verre (plus clair en haut à gauche, un trait de lumière), dessiné une seule fois
  function glassSheen(s, g, dpr) {
    const c = document.createElement('canvas');
    c.width = c.height = Math.ceil(s * dpr);
    const x = c.getContext('2d');
    x.scale(dpr, dpr);
    roundRect(x, g / 2, g / 2, s - g, s - g, Math.max(1, s * 0.09));
    const lg = x.createLinearGradient(0, 0, s * 0.4, s);
    lg.addColorStop(0, 'rgba(255,255,255,.24)');
    lg.addColorStop(0.5, 'rgba(255,255,255,.03)');
    lg.addColorStop(1, 'rgba(0,0,0,.14)');
    x.fillStyle = lg;
    x.fill();
    x.fillStyle = 'rgba(255,255,255,.28)';
    x.fillRect(g / 2 + s * 0.12, g / 2 + s * 0.1, s * 0.22, Math.max(1, s * 0.05));
    return c;
  }

  function waterline(root) {
    const canvas = $('.waterline__tiles', root);
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, LW = 0, dpr = 1, s = 0, tiles = [], oldC, newC, mid, waterY = 0, t0 = 0, raf = 0, done = false;

    const layer = () => {
      const c = document.createElement('canvas');
      c.width = Math.round(LW * dpr);
      c.height = Math.round(H * dpr);
      const x = c.getContext('2d');
      x.scale(dpr, dpr);
      return [c, x];
    };

    function build() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      const rows = 8;
      s = H / rows;
      LW = W + s * 2;
      const cols = Math.ceil(LW / s);
      waterY = H * 0.56;
      const r = rng(2000);

      // le verre
      let x;
      [newC, x] = layer();
      x.fillStyle = '#c0c9cd';
      x.fillRect(0, 0, LW, H);
      const g = Math.max(1.2, s * 0.075);
      const sheen = glassSheen(s, g, dpr);
      tiles = [];
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const tx = i * s, ty = j * s;
          roundRect(x, tx + g / 2, ty + g / 2, s - g, s - g, Math.max(1, s * 0.09));
          x.fillStyle = pick(GLASS, r());
          x.fill();
          x.drawImage(sheen, tx, ty, s, s);
          tiles.push({i, j, t: 0, p: -1});
        }
      }

      // la céramique : des carreaux de 15 cm et un liseré brun en pied
      let y;
      [oldC, y] = layer();
      const trim = s * 0.9, big = H - trim, gb = Math.max(2, s * 0.1);
      y.fillStyle = '#bcae96';
      y.fillRect(0, 0, LW, H);
      for (let i = 0; i * big < LW; i++) {
        y.fillStyle = pick(OLD, r());
        y.fillRect(i * big + gb / 2, gb / 2, big - gb, big - gb);
        const lg = y.createLinearGradient(i * big, 0, i * big + big, big);
        lg.addColorStop(0, 'rgba(255,255,255,.2)');
        lg.addColorStop(0.6, 'rgba(255,255,255,0)');
        lg.addColorStop(1, 'rgba(90,70,40,.1)');
        y.fillStyle = lg;
        y.fillRect(i * big + gb / 2, gb / 2, big - gb, big - gb);
      }
      for (let i = 0; i * trim < LW; i++) {
        y.fillStyle = i % 2 ? '#7a6650' : '#6b5844';
        y.fillRect(i * trim + gb / 2, big + gb / 2, trim - gb, trim - gb);
      }

      // l'ordre de pose : de gauche à droite, avec un peu de hasard
      for (const t of tiles) t.t = ((t.i * s) / W) * 1.5 + r() * 0.3;
      [mid] = layer();
      mid.getContext('2d').drawImage(done ? newC : oldC, 0, 0);
      if (done) for (const t of tiles) t.p = 1;
      blit();
    }

    // sous la ligne d'eau, l'image est décalée (la réfraction)
    function blit() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const wy = Math.round(waterY * dpr), dx = Math.round(s * 0.3 * dpr), w = canvas.width;
      ctx.drawImage(mid, 0, 0, w, wy, 0, 0, w, wy);
      ctx.drawImage(mid, dx, wy, w, mid.height - wy, 0, wy, w, mid.height - wy);
    }

    function frame(now) {
      const e = (now - t0) / 1000;
      const m = mid.getContext('2d');
      const S = s * dpr;
      let left = 0;
      for (const t of tiles) {
        const p = clamp((e - t.t) / SET, 0, 1);
        if (p < 1) left++;
        if (p === t.p) continue;
        t.p = p;
        const sx = t.i * S, sy = t.j * S;
        m.drawImage(oldC, sx, sy, S, S, sx, sy, S, S);
        if (p > 0) {
          const k = 0.7 + 0.3 * out3(p), cw = S * k;
          m.globalAlpha = Math.min(1, p * 1.7);
          m.drawImage(newC, sx, sy, S, S, sx + (S - cw) / 2, sy + (S - cw) / 2, cw, cw);
          m.globalAlpha = 1;
        }
      }
      blit();
      if (left) raf = requestAnimationFrame(frame);
      else {
        done = true;
        m.drawImage(newC, 0, 0);
        blit();
        root.classList.add('is-set');
      }
    }

    build();
    let lastW = W;
    new ResizeObserver(() => {
      if (canvas.clientWidth === lastW && Math.round(canvas.clientHeight) === Math.round(H)) return;
      lastW = canvas.clientWidth;
      build();
    }).observe(canvas);

    return {
      lay(delay = 0) {
        if (reduce || done) {
          done = true;
          build();
          root.classList.add('is-set');
          return;
        }
        setTimeout(() => {
          t0 = performance.now();
          raf = requestAnimationFrame(frame);
        }, delay);
      },
    };
  }

  /* ——— Le fond du bassin : « PETRI » en mosaïque ———
     Un fond de petits carreaux bleu nuit ; les lettres en verre clair se posent quand le pied de page arrive à l'écran. */
  const FLOOR = [['#0c2a37', 10], ['#0f3241', 12], ['#123a4b', 10], ['#164455', 7], ['#0a2430', 6], ['#1b5064', 3]];
  const LETTER = [['#e4eef1', 6], ['#cfe6ee', 6], ['#a9dbea', 5], ['#7fcbe2', 4], ['#5cc0e3', 3], ['#f6f8f8', 3]];

  function inlay(canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, dpr, s, cols, rows, cells = [], base, lit, t0 = 0, done = reduce, started = false;
    function build() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      if (!W || !H) return;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      s = clamp(Math.round(W / 110), 8, 15);
      cols = Math.ceil(W / s);
      rows = Math.ceil(H / s);
      // les lettres, dessinées à la taille de la grille puis lues carreau par carreau
      const m = document.createElement('canvas');
      const k = 4;
      m.width = cols * k;
      m.height = rows * k;
      const mx = m.getContext('2d');
      mx.fillStyle = '#000';
      const size = Math.min(rows * k * 0.78, (cols * k) / 3.9);
      mx.font = `800 ${size}px Archivo, sans-serif`;
      if ('fontStretch' in mx) mx.fontStretch = 'expanded';
      mx.textAlign = 'center';
      mx.textBaseline = 'middle';
      mx.fillText('PETRI', (cols * k) / 2, (rows * k) / 2 + size * 0.04);
      const px = mx.getImageData(0, 0, m.width, m.height).data;
      const r = rng(617);
      cells = [];
      const g = Math.max(1, s * 0.09);
      const make = () => {
        const c = document.createElement('canvas');
        c.width = canvas.width;
        c.height = canvas.height;
        const x = c.getContext('2d');
        x.scale(dpr, dpr);
        x.fillStyle = '#081c25';
        x.fillRect(0, 0, W, H);
        return [c, x];
      };
      let bx, lx;
      [base, bx] = make();
      [lit, lx] = make();
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          let cover = 0;
          for (let y = 0; y < k; y++) for (let x = 0; x < k; x++) cover += px[((j * k + y) * m.width + i * k + x) * 4 + 3];
          const inside = cover / (k * k * 255) > 0.45;
          const floor = pick(FLOOR, r());
          const tile = (ctx2, col) => {
            roundRect(ctx2, i * s + g / 2, j * s + g / 2, s - g, s - g, Math.max(1, s * 0.12));
            ctx2.fillStyle = col;
            ctx2.fill();
          };
          tile(bx, floor);
          tile(lx, inside ? pick(LETTER, r()) : floor);
          if (inside) cells.push({i, j, t: (i / cols) * 1.4 + r() * 0.25, p: -1});
        }
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(done ? lit : base, 0, 0);
      if (done) for (const c of cells) c.p = 1;
    }
    function frame(now) {
      const e = (now - t0) / 1000;
      const S = s * dpr;
      let left = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      for (const c of cells) {
        const p = clamp((e - c.t) / SET, 0, 1);
        if (p < 1) left++;
        if (p === c.p) continue;
        c.p = p;
        const sx = c.i * S, sy = c.j * S;
        ctx.drawImage(base, sx, sy, S, S, sx, sy, S, S);
        if (p > 0) {
          const q = 0.6 + 0.4 * out3(p), w = S * q;
          ctx.globalAlpha = Math.min(1, p * 1.6);
          ctx.drawImage(lit, sx, sy, S, S, sx + (S - w) / 2, sy + (S - w) / 2, w, w);
          ctx.globalAlpha = 1;
        }
      }
      if (left) requestAnimationFrame(frame);
      else done = true;
    }
    const go = () => {
      if (started || done) return;
      started = true;
      t0 = performance.now();
      requestAnimationFrame(frame);
    };
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    new IntersectionObserver(([near], io0) => {
      if (!near.isIntersecting) return;
      io0.disconnect();
      ready.then(() => {
        build();
        let lastW = W;
        new ResizeObserver(() => {
          if (canvas.clientWidth === lastW) return;
          lastW = canvas.clientWidth;
          if (started && !done) done = true;
          build();
        }).observe(canvas);
        new IntersectionObserver(([en], io) => {
          if (en.isIntersecting) { go(); io.disconnect(); }
        }, {threshold: 0.35}).observe(canvas);
      });
    }, {rootMargin: '900px 0px'}).observe(canvas);
  }

  /* ——— L'avant/après : la ligne d'eau qu'on monte et qu'on descend ——— */
  function refill(root) {
    const frame = $('.refill__frame', root);
    const handle = $('[data-refill-handle]', root);
    let v = 50, touched = false;
    const set = (n) => {
      v = clamp(Math.round(n), 0, 100);
      root.style.setProperty('--v', v);
      handle.setAttribute('aria-valuenow', v);
      handle.setAttribute('aria-valuetext', v >= 98 ? 'All after' : v <= 2 ? 'All before' : v > 50 ? 'Mostly after' : v < 50 ? 'Mostly before' : 'Half after');
    };
    const fromY = (y) => {
      const b = frame.getBoundingClientRect();
      set(100 - ((y - b.top) / b.height) * 100);
    };
    let drag = false;
    const down = (e) => {
      touched = true;
      drag = true;
      frame.setPointerCapture?.(e.pointerId);
      fromY(e.clientY);
      e.preventDefault();
    };
    // à la souris, on attrape la ligne n'importe où sur la photo ; au doigt, seulement la poignée (la page défile ailleurs)
    frame.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' || handle.contains(e.target)) down(e);
    });
    frame.addEventListener('pointermove', (e) => { if (drag) fromY(e.clientY); });
    const up = () => { drag = false; };
    frame.addEventListener('pointerup', up);
    frame.addEventListener('pointercancel', up);
    handle.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 20 : 5;
      const keys = {ArrowUp: v + step, ArrowRight: v + step, ArrowDown: v - step, ArrowLeft: v - step, PageUp: v + 25, PageDown: v - 25, Home: 0, End: 100};
      if (e.key in keys) {
        touched = true;
        set(keys[e.key]);
        e.preventDefault();
      }
    });
    set(reduce ? 50 : 0);
    if (reduce) return;
    // la première fois qu'on la voit, l'eau monte jusqu'à mi-hauteur
    new IntersectionObserver(([en], io) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const run = (now) => {
        if (touched) return;
        const p = clamp((now - t0) / 1600, 0, 1);
        set(58 * out3(p));
        if (p < 1) requestAnimationFrame(run);
      };
      setTimeout(() => requestAnimationFrame(run), 250);
    }, {threshold: 0.6}).observe(frame);
  }

  /* ——— Les quatre changements : la photo suit le texte lu ——— */
  function changes(root) {
    const items = $$('[data-change]', root);
    const pics = $$('[data-pic]', root);
    const show = (id) => {
      for (const it of items) it.classList.toggle('is-on', it.dataset.change === id);
      for (const p of pics) p.classList.toggle('is-on', p.dataset.pic === id);
    };
    show(items[0].dataset.change);
    const io = new IntersectionObserver((ens) => {
      for (const en of ens) if (en.isIntersecting) show(en.target.dataset.change);
    }, {rootMargin: '-48% 0px -48% 0px'});
    items.forEach((it) => io.observe(it));
  }

  /* ——— Le local technique : un appareil choisi, le reste dans l'ombre ——— */
  const PARTS = {heater: [12.5, 66, 125], filter: [41, 47, 125], pumps: [61, 69, 110], automation: [82, 24, 110], electrical: [83, 56, 95]};
  function pad(root) {
    const pins = $$('[data-part]', root);
    const parts = $$('[data-detail]', root);
    const shade = $('.pad__shade', root);
    let current = null;
    const pickPart = (id) => {
      current = current === id ? null : id;
      root.classList.toggle('is-picked', !!current);
      for (const p of pins) p.setAttribute('aria-pressed', String(p.dataset.part === current));
      for (const d of parts) d.hidden = d.dataset.detail !== (current || 'all');
      if (current) {
        const [x, y, r] = PARTS[current];
        const k = shade.clientWidth / 900;
        shade.style.setProperty('--x', `${x}%`);
        shade.style.setProperty('--y', `${y}%`);
        shade.style.setProperty('--r', `${Math.round(r * k)}px`);
      }
    };
    for (const p of pins) p.addEventListener('click', () => pickPart(p.dataset.part));
    new IntersectionObserver(([en], io) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      root.classList.add('is-hint');
    }, {threshold: 0.6}).observe($('.pad__photo', root));
  }

  /* ——— Le déroulé : la ligne se remplit à mesure qu'on lit ——— */
  function steps(list) {
    if (reduce) {
      list.style.setProperty('--p', 1);
      return;
    }
    const update = () => {
      const b = list.getBoundingClientRect();
      const p = clamp((innerHeight * 0.6 - b.top) / b.height, 0, 1);
      list.style.setProperty('--p', p.toFixed(4));
    };
    addEventListener('scroll', update, {passive: true});
    addEventListener('resize', update);
    update();
  }

  /* ——— La carte des villes : les avis de la ville choisie ——— */
  function towns(root) {
    const panel = $('[data-towns-panel]', root);
    const map = $('[data-map]', root);
    const chips = $('[data-towns-chips]', root);
    const all = $$('[data-reviews] .rv');
    const onMap = $$('.town__btn', root);
    // sur téléphone, les villes se choisissent dans une rangée de puces ; la carte ne garde que les points
    for (const b of onMap) {
      const c = document.createElement('button');
      c.type = 'button';
      c.dataset.town = b.dataset.town;
      c.setAttribute('aria-pressed', 'false');
      const n = all.filter((r) => r.dataset.city === b.dataset.town).length;
      c.innerHTML = `${b.dataset.town} <b>${n}</b><span class="sr-only"> review${n > 1 ? 's' : ''}</span>`;
      chips.append(c);
    }
    const btns = [...onMap, ...$$('button', chips)];
    const mq = matchMedia('(max-width: 700px)');
    const mode = () => {
      for (const b of onMap) {
        b.tabIndex = mq.matches ? -1 : 0;
        b.toggleAttribute('aria-hidden', mq.matches);
      }
    };
    mq.addEventListener?.('change', mode);
    mode();
    // une étiquette qui sortirait de la carte passe de l'autre côté du point
    const fit = () => {
      const box = map.getBoundingClientRect();
      for (const b of onMap) {
        if (!b.offsetWidth) continue;
        const r = b.getBoundingClientRect();
        if (r.left < box.left + 4) b.parentElement.dataset.a = 'r';
        else if (r.right > box.right - 4) b.parentElement.dataset.a = 'l';
      }
    };
    const show = (name, every = false) => {
      for (const b of btns) b.setAttribute('aria-pressed', String(b.dataset.town === name));
      for (const b of onMap) b.parentElement.classList.toggle('is-on', b.dataset.town === name);
      const list = all.filter((r) => r.dataset.city === name);
      panel.innerHTML = '';
      const h = document.createElement('h4');
      h.className = 'h4';
      h.textContent = name;
      const n = document.createElement('small');
      n.textContent = list.length === 1 ? '1 review' : `${list.length} reviews`;
      h.append(n);
      panel.append(h);
      const shown = every ? list : list.slice(0, 2);
      for (const r of shown) panel.append(r.cloneNode(true));
      if (shown.length < list.length) {
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'towns__more';
        more.textContent = `Show ${list.length - shown.length} more from ${name}`;
        more.addEventListener('click', () => {
          show(name, true);
          panel.querySelectorAll('.rv')[2]?.setAttribute('tabindex', '-1');
          panel.querySelectorAll('.rv')[2]?.focus({preventScroll: true});
        });
        panel.append(more);
      }
      requestAnimationFrame(fit);
    };
    for (const b of btns) b.addEventListener('click', () => show(b.dataset.town));
    addEventListener('resize', fit);
    show('Lewisville');
  }

  /* ——— Ouvert ou fermé, à l'heure du Texas (Centre) ——— */
  function openNow() {
    const parts = new Intl.DateTimeFormat('en-US', {timeZone: 'America/Chicago', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false}).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const day = get('weekday');
    const h = Number(get('hour')) % 24 + Number(get('minute')) / 60;
    const weekday = !['Sat', 'Sun'].includes(day);
    const open = weekday && h >= 9 && h < 17;
    let text;
    if (open) text = 'Open now, until 5 PM Central Time.';
    else if (weekday && h < 9) text = 'Closed now, opens at 9 AM Central Time.';
    else if (day === 'Fri' || day === 'Sat' || day === 'Sun') text = 'Closed now, opens Monday at 9 AM Central Time.';
    else text = 'Closed now, opens tomorrow at 9 AM Central Time.';
    for (const el of $$('[data-open]')) {
      el.textContent = text;
      el.classList.toggle('is-open', open);
      el.classList.toggle('is-closed', !open);
    }
  }

  /* ——— Le formulaire : vérifié ici, puis envoyé par la messagerie du visiteur ——— */
  function form(f) {
    const note = $('[data-form-note]', f);
    const rules = {
      name: (v) => v.trim().length > 1,
      phone: (v) => v.replace(/\D/g, '').length >= 10,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      address: (v) => v.trim().length > 4,
    };
    const check = (input) => {
      const ok = rules[input.name](input.value);
      input.setAttribute('aria-invalid', String(!ok));
      const err = input.parentElement.querySelector('.field__err');
      err.hidden = ok;
      if (!err.id) err.id = `err-${input.name}`;
      if (ok) input.removeAttribute('aria-describedby');
      else input.setAttribute('aria-describedby', err.id);
      return ok;
    };
    for (const name of Object.keys(rules)) {
      const input = f.elements[name];
      input.addEventListener('blur', () => { if (input.value) check(input); });
      input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') check(input); });
    }
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = Object.keys(rules).map((n) => f.elements[n]).filter((i) => !check(i));
      if (bad.length) {
        bad[0].focus();
        note.textContent = bad.length === 1 ? 'One field needs a fix before your email can be written.' : `${bad.length} fields need a fix before your email can be written.`;
        note.classList.remove('is-done');
        return;
      }
      const d = Object.fromEntries(new FormData(f));
      const body = [`${d.need}`, '', d.message || '', '', `Name: ${d.name}`, `Phone: ${d.phone}`, `Email: ${d.email}`, `Pool address: ${d.address}`].join('\n');
      location.href = `mailto:petripools@gmail.com?subject=${encodeURIComponent(`Free estimate request: ${d.need.toLowerCase()}`)}&body=${encodeURIComponent(body)}`;
      note.textContent = 'Your email app should open with your request ready to send. If nothing opens, call (972) 219-8700 or write to petripools@gmail.com.';
      note.classList.add('is-done');
    });
  }

  /* ——— Le menu du téléphone ——— */
  function menu() {
    const panel = $('[data-menu]');
    const openBtn = $('[data-menu-open]');
    const closeBtn = $('[data-menu-close]');
    const focusables = () => $$('a, button', panel);
    const close = (back = true) => {
      panel.hidden = true;
      openBtn.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      lenis?.start();
      if (back) openBtn.focus();
    };
    openBtn.addEventListener('click', () => {
      panel.hidden = false;
      openBtn.setAttribute('aria-expanded', 'true');
      document.documentElement.style.overflow = 'hidden';
      lenis?.stop();
      closeBtn.focus();
    });
    closeBtn.addEventListener('click', () => close());
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (e.shiftKey && document.activeElement === f[0]) { f[f.length - 1].focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { f[0].focus(); e.preventDefault(); }
    });
    for (const a of $$('a', panel)) a.addEventListener('click', () => close(false));
  }

  /* ——— Défilement doux ——— */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({lerp: 0.1});
    const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    // les liens internes passent par Lenis, en tenant compte de l'en-tête
    for (const a of $$('a[href^="#"]')) {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const target = id === '#top' ? 0 : $(id);
        if (target === null) return;
        e.preventDefault();
        lenis.scrollTo(target, {offset: id === '#top' ? 0 : -76, duration: 1.2});
        if (id !== '#top' && target.focus) {
          target.setAttribute('tabindex', '-1');
          target.focus({preventScroll: true});
        }
      });
    }
  }

  /* ——— L'ouverture ——— */
  document.documentElement.classList.add('js');
  const wl = waterline($('[data-waterline]'));
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  // l'entrée du titre, des repères et de l'accroche (animations natives du navigateur)
  const rise = (sel, from, duration, delay, stagger, easing) =>
    $$(sel).forEach((el, i) => el.animate([from, {transform: 'none', opacity: 1}], {duration, delay: delay + i * stagger, easing, fill: 'backwards'}));
  fontsReady.then(() => {
    if (reduce || !Element.prototype.animate) {
      wl.lay();
      return;
    }
    rise('.hero__title .ln > span', {transform: 'translateY(106%)'}, 1100, 0, 90, 'cubic-bezier(.16, 1, .3, 1)');
    rise('.hero__facts li', {transform: 'translateY(10px)', opacity: 0}, 800, 500, 80, 'cubic-bezier(.22, 1, .36, 1)');
    rise('.hero__water .hero__grid > *', {transform: 'translateY(16px)', opacity: 0}, 900, 1500, 80, 'cubic-bezier(.22, 1, .36, 1)');
    wl.lay(380);
  });
  const wave = $('.waterline__wave');
  new IntersectionObserver(([en]) => { wave.style.animationPlayState = en.isIntersecting ? 'running' : 'paused'; }).observe($('[data-waterline]'));

  refill($('[data-refill]'));
  changes($('#remodel'));
  pad($('[data-pad]'));
  steps($('[data-steps]'));
  towns($('[data-towns]'));
  openNow();
  setInterval(openNow, 60000);
  form($('[data-form]'));
  menu();
  inlay($('[data-inlay]'));
  for (const el of $$('[data-year]')) el.textContent = new Date().getFullYear();
  // « Read all 43 reviews » devient « Hide the reviews » une fois la liste ouverte
  const all = $('[data-all]');
  const sum = $('summary', all);
  const closedLabel = sum.textContent;
  all.addEventListener('toggle', () => { sum.textContent = all.open ? sum.dataset.allLabel : closedLabel; });

  /* ——— En-tête, lien actif et barre du téléphone ——— */
  const hd = $('[data-hd]');
  const dock = $('[data-dock]');
  const hero = $('.hero');
  const estimate = $('#estimate');
  const links = $$('.hd__nav a');
  const sections = links.map((a) => $(a.getAttribute('href')));
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    if (y > 240 && y > lastY + 4) hd.classList.add('is-hidden');
    else if (y < lastY - 4 || y < 240) hd.classList.remove('is-hidden');
    lastY = y;
    const mid = innerHeight * 0.4;
    let on = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < mid) on = i; });
    links.forEach((a, i) => (i === on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    const est = estimate.getBoundingClientRect();
    dock.classList.toggle('is-on', hero.getBoundingClientRect().bottom < innerHeight * 0.4 && est.top > innerHeight * 0.6);
  };
  addEventListener('scroll', onScroll, {passive: true});
  onScroll();
})();
