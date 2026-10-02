/* Escape TV : le labyrinthe, vu d'en haut, comme sur les écrans de la régie.
   Un labyrinthe parfait généré (graine fixe), une équipe qui avance dans les couloirs,
   le Minotaure qui rôde (tache de chaleur) et le trésor au centre. Tout est dessiné sur canvas. */
(function () {
  'use strict';

  const rng = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /** Labyrinthe parfait (exploration en profondeur), avec une salle ouverte au centre pour le trésor */
  function build(cols, rows, seed) {
    const rand = rng(seed);
    // murs : bit 1 = nord, 2 = est, 4 = sud, 8 = ouest (1 = mur présent)
    const cells = new Uint8Array(cols * rows).fill(15);
    const seen = new Uint8Array(cols * rows);
    const idx = (x, y) => y * cols + x;
    const D = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];
    const stack = [[0, rows - 1]];
    seen[idx(0, rows - 1)] = 1;
    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      const opts = D.filter(([dx, dy]) => {
        const nx = x + dx, ny = y + dy;
        return nx >= 0 && ny >= 0 && nx < cols && ny < rows && !seen[idx(nx, ny)];
      });
      if (!opts.length) { stack.pop(); continue; }
      const [dx, dy, a, b] = opts[Math.floor(rand() * opts.length)];
      const nx = x + dx, ny = y + dy;
      cells[idx(x, y)] &= ~a;
      cells[idx(nx, ny)] &= ~b;
      seen[idx(nx, ny)] = 1;
      stack.push([nx, ny]);
    }
    // quelques boucles, pour que la poursuite ait plusieurs chemins
    for (let k = 0; k < cols * rows * 0.08; k++) {
      const x = 1 + Math.floor(rand() * (cols - 2));
      const y = 1 + Math.floor(rand() * (rows - 2));
      const [dx, dy, a, b] = D[Math.floor(rand() * 4)];
      cells[idx(x, y)] &= ~a;
      cells[idx(x + dx, y + dy)] &= ~b;
    }
    // la salle du trésor : 3 × 3 cases ouvertes au centre
    const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
    for (let y = cy - 1; y <= cy + 1; y++) {
      for (let x = cx - 1; x <= cx + 1; x++) {
        if (y > cy - 1) { cells[idx(x, y)] &= ~1; cells[idx(x, y - 1)] &= ~4; }
        if (x > cx - 1) { cells[idx(x, y)] &= ~8; cells[idx(x - 1, y)] &= ~2; }
      }
    }
    return {cols, rows, cells, idx, center: [cx, cy], entrance: [0, rows - 1], rand};
  }

  /** Plus court chemin (en largeur) d'une case à une autre */
  function path(m, from, to) {
    const {cols, rows, cells, idx} = m;
    const prev = new Int32Array(cols * rows).fill(-1);
    const start = idx(from[0], from[1]);
    const goal = idx(to[0], to[1]);
    const q = [start];
    prev[start] = start;
    const D = [[0, -1, 1], [1, 0, 2], [0, 1, 4], [-1, 0, 8]];
    while (q.length) {
      const c = q.shift();
      if (c === goal) break;
      const x = c % cols, y = (c / cols) | 0;
      for (const [dx, dy, w] of D) {
        if (cells[c] & w) continue;
        const n = idx(x + dx, y + dy);
        if (prev[n] !== -1) continue;
        prev[n] = c;
        q.push(n);
      }
    }
    const out = [];
    for (let c = goal; c !== start; c = prev[c]) { if (c < 0) return [from]; out.push([c % cols, (c / cols) | 0]); }
    out.push(from);
    return out.reverse();
  }

  /** Un marcheur qui suit des chemins dans le labyrinthe */
  function walker(m, start, speed) {
    return {pos: [start[0] + 0.5, start[1] + 0.5], route: [], i: 0, speed, cell: start.slice()};
  }
  function step(m, w, dt, pickTarget) {
    if (w.i >= w.route.length - 1) {
      w.route = path(m, w.cell, pickTarget(w));
      w.i = 0;
    }
    let move = w.speed * dt;
    while (move > 0 && w.i < w.route.length - 1) {
      const n = w.route[w.i + 1];
      const tx = n[0] + 0.5, ty = n[1] + 0.5;
      const dx = tx - w.pos[0], dy = ty - w.pos[1];
      const d = Math.hypot(dx, dy);
      if (d <= move) { w.pos = [tx, ty]; w.cell = n.slice(); w.i++; move -= d; }
      else { w.pos = [w.pos[0] + (dx / d) * move, w.pos[1] + (dy / d) * move]; move = 0; }
    }
  }

  const randomCell = (m) => [Math.floor(m.rand() * m.cols), Math.floor(m.rand() * m.rows)];

  /**
   * Crée un écran de régie.
   * opts : cols, rows, seed, mode ('plan' | 'cinema' | 'tv' | 'game' | 'stage'), interactive
   */
  function create(canvas, opts = {}) {
    const m = build(opts.cols || 25, opts.rows || 15, opts.seed || 7);
    const ctx = canvas.getContext('2d');
    const team = walker(m, m.entrance, 1.6);
    const beast = walker(m, [m.cols - 1, 0], 1.25);
    let tStart = performance.now();
    let last = tStart;
    let running = false;
    let raf = 0;
    const state = {
      mode: opts.mode || 'plan',
      cam: {x: 0.5, y: 0.5, z: 1},
      camTo: {x: 0.5, y: 0.5, z: 1},
      hue: 0,
      grade: 0,
      reduce: !!opts.reduce,
    };
    let goalTreasure = true;
    const pickTeam = () => {
      if (goalTreasure) { goalTreasure = false; return m.center; }
      return randomCell(m);
    };
    const pickBeast = () => (m.rand() < 0.55 ? team.cell.slice() : randomCell(m));

    let W = 0, H = 0, dpr = 1;
    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }

    function draw(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - tStart) / 1000;
      if (!state.reduce) {
        step(m, team, dt, pickTeam);
        step(m, beast, dt, pickBeast);
      }
      // caméra : glisse doucement vers sa cible
      const k = 1 - Math.pow(0.04, dt);
      for (const key of ['x', 'y', 'z']) state.cam[key] += (state.camTo[key] - state.cam[key]) * k;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // le labyrinthe remplit l'écran (en largeur ou en hauteur) avec une marge
      const cell = Math.max(W / (m.cols + 2), H / (m.rows + 1.4)) * state.cam.z;
      const mw = m.cols * cell, mh = m.rows * cell;
      // le cadre reste dans le labyrinthe (une demi-case de marge), sauf s'il est plus grand que lui
      const keep = (v, half, edge) => (half >= 0.5 - edge ? 0.5 : Math.min(1 - half + edge, Math.max(half - edge, v)));
      const camX = keep(state.cam.x, W / 2 / mw, cell * 0.5 / mw);
      const camY = keep(state.cam.y, H / 2 / mh, cell * 0.5 / mh);
      const ox = W / 2 - camX * mw;
      const oy = H / 2 - camY * mh;
      const P = (x, y) => [ox + x * cell, oy + y * cell];

      // sol : légère vignette chaude
      const g = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
      g.addColorStop(0, 'rgba(48, 40, 30, 0.55)');
      g.addColorStop(1, 'rgba(12, 11, 10, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // le trésor, au centre
      const [tx, ty] = P(m.center[0] + 0.5, m.center[1] + 0.5);
      const pulse = 0.75 + 0.25 * Math.sin(t * 2.2);
      const tg = ctx.createRadialGradient(tx, ty, 0, tx, ty, cell * 2.6);
      tg.addColorStop(0, `rgba(226, 181, 94, ${0.55 * pulse})`);
      tg.addColorStop(1, 'rgba(226, 181, 94, 0)');
      ctx.fillStyle = tg;
      ctx.fillRect(tx - cell * 3, ty - cell * 3, cell * 6, cell * 6);
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#E2B55E';
      const s = cell * 0.22;
      ctx.fillRect(-s, -s, s * 2, s * 2);
      ctx.restore();

      // le Minotaure : une tache de chaleur
      const [bx, by] = P(beast.pos[0], beast.pos[1]);
      const br = cell * (2.1 + 0.15 * Math.sin(t * 5));
      const bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      bg.addColorStop(0, 'rgba(255, 214, 140, 0.95)');
      bg.addColorStop(0.25, 'rgba(255, 112, 60, 0.75)');
      bg.addColorStop(0.6, 'rgba(176, 40, 30, 0.28)');
      bg.addColorStop(1, 'rgba(120, 20, 20, 0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = bg;
      ctx.fillRect(bx - br, by - br, br * 2, br * 2);
      ctx.globalCompositeOperation = 'source-over';

      // les murs
      ctx.beginPath();
      const {cols, rows, cells} = m;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const c = cells[y * cols + x];
          const [x0, y0] = P(x, y);
          if (c & 1) { ctx.moveTo(x0, y0); ctx.lineTo(x0 + cell, y0); }
          if (c & 8) { ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + cell); }
          if (y === rows - 1 && c & 4) { ctx.moveTo(x0, y0 + cell); ctx.lineTo(x0 + cell, y0 + cell); }
          if (x === cols - 1 && c & 2) { ctx.moveTo(x0 + cell, y0); ctx.lineTo(x0 + cell, y0 + cell); }
        }
      }
      ctx.lineCap = 'square';
      ctx.lineWidth = Math.max(1, Math.min(cell * 0.07, 4.5));
      ctx.strokeStyle = state.mode === 'stage' ? `hsla(${state.hue}, 70%, 70%, 0.75)` : 'rgba(237, 230, 218, 0.62)';
      ctx.stroke();

      // l'équipe : quatre points serrés qui avancent ensemble
      const [px, py] = P(team.pos[0], team.pos[1]);
      ctx.fillStyle = '#EDE6DA';
      for (let i = 0; i < 4; i++) {
        const a = t * 1.8 + i * 1.57;
        ctx.beginPath();
        const orbit = Math.min(cell * 0.16, 9);
        ctx.arc(px + Math.cos(a) * orbit, py + Math.sin(a) * orbit, Math.max(1.4, Math.min(cell * 0.07, 3.6)), 0, Math.PI * 2);
        ctx.fill();
      }

      // modes de la régie
      if (state.mode === 'plan') {
        // repères d'énigmes sur quelques carrefours
        ctx.strokeStyle = 'rgba(226, 181, 94, 0.7)';
        ctx.lineWidth = 1.2;
        for (const [x, y] of [[3, 2], [9, 10], [18, 4], [21, 12], [6, 7]]) {
          const [cx, cy] = P(x + 0.5, y + 0.5);
          ctx.beginPath();
          ctx.arc(cx, cy, cell * 0.24, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      if (state.mode === 'stage') {
        // lumières de scène qui changent de couleur
        state.hue = (state.hue + dt * 30) % 360;
        const lg = ctx.createRadialGradient(px, py, 0, px, py, cell * 5);
        lg.addColorStop(0, `hsla(${state.hue}, 90%, 60%, 0.35)`);
        lg.addColorStop(1, `hsla(${state.hue}, 90%, 50%, 0)`);
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = lg;
        ctx.fillRect(px - cell * 5, py - cell * 5, cell * 10, cell * 10);
        ctx.globalCompositeOperation = 'source-over';
      }
      if (state.mode === 'cinema') {
        // étalonnage chaud et bandes cinémascope
        ctx.fillStyle = 'rgba(70, 40, 10, 0.18)';
        ctx.fillRect(0, 0, W, H);
        const bar = Math.max(0, (H - W / 2.39) / 2);
        ctx.fillStyle = '#060504';
        ctx.fillRect(0, 0, W, bar);
        ctx.fillRect(0, H - bar, W, bar);
      }

      if (running) raf = requestAnimationFrame(draw);
    }

    const ctrl = {
      maze: m,
      start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(draw); },
      stop() { running = false; cancelAnimationFrame(raf); },
      frame() { draw(performance.now()); },
      resize() { resize(); if (!running) draw(performance.now()); },
      setMode(mode) { state.mode = mode; },
      look(x, y, z, now = false) {
        state.camTo = {x, y, z};
        if (now) state.cam = {x, y, z};
      },
      /** Position actuelle des personnages, en fractions du labyrinthe (pour les étiquettes) */
      where() { return {team: [team.pos[0] / m.cols, team.pos[1] / m.rows], beast: [beast.pos[0] / m.cols, beast.pos[1] / m.rows]}; },
      set reduce(v) { state.reduce = v; },
    };
    resize();
    return ctrl;
  }

  /* ——— Caméra thermique : la chaleur du Minotaure qui se rapproche de vous ——— */
  function thermal(canvas, opts = {}) {
    const ctx = canvas.getContext('2d');
    const low = document.createElement('canvas');
    const lw = 160, lh = 100;
    low.width = lw; low.height = lh;
    const lctx = low.getContext('2d');
    const img = lctx.createImageData(lw, lh);
    // palette thermique : nuit, violet, rouge, orange, jaune, blanc
    const stops = [[0, [8, 8, 30]], [0.25, [60, 16, 96]], [0.45, [170, 30, 70]], [0.62, [235, 90, 30]], [0.8, [255, 190, 60]], [1, [255, 250, 220]]];
    const lut = new Uint8Array(256 * 3);
    for (let i = 0; i < 256; i++) {
      const v = i / 255;
      let a = stops[0], b = stops[stops.length - 1];
      for (let s = 1; s < stops.length; s++) if (v <= stops[s][0]) { a = stops[s - 1]; b = stops[s]; break; }
      const k = (v - a[0]) / (b[0] - a[0] || 1);
      for (let c = 0; c < 3; c++) lut[i * 3 + c] = Math.round(a[1][c] + (b[1][c] - a[1][c]) * k);
    }
    const you = {x: 0.3, y: 0.6, tx: 0.3, ty: 0.6};
    const beast = {x: 0.85, y: 0.25};
    let running = false, raf = 0, last = performance.now(), t0 = last, auto = true;
    let W = 0, H = 0, dpr = 1;
    const maze = build(16, 10, 21);

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    }
    function draw(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      if (auto) { you.tx = 0.5 + Math.cos(t * 0.31) * 0.3; you.ty = 0.55 + Math.sin(t * 0.47) * 0.25; }
      you.x += (you.tx - you.x) * (1 - Math.pow(0.02, dt));
      you.y += (you.ty - you.y) * (1 - Math.pow(0.02, dt));
      // il vous cherche : il avance vers vous, lentement, et hésite
      const dx = you.x - beast.x, dy = you.y - beast.y;
      const d = Math.hypot(dx, dy) || 1;
      const sp = opts.reduce ? 0 : 0.07 + 0.02 * Math.sin(t * 1.3);
      if (d > 0.12) { beast.x += (dx / d) * sp * dt; beast.y += (dy / d) * sp * dt; }
      beast.x += Math.sin(t * 2.1) * 0.0006; beast.y += Math.cos(t * 1.7) * 0.0006;

      // distances en pixels, rapportées au petit côté : la tache garde la même taille sur mobile
      const S = Math.min(W, H);
      const sx = W / S, sy = H / S;
      const data = img.data;
      for (let y = 0; y < lh; y++) {
        for (let x = 0; x < lw; x++) {
          const u = x / lw, v = y / lh;
          const ux = (u - you.x) * sx, uy = (v - you.y) * sy;
          const bx = (u - beast.x) * sx, by = (v - beast.y) * sy;
          let h = 0.16 + 0.04 * Math.sin(u * 12 + t) * Math.cos(v * 9 - t * 0.7);
          h += 0.55 * Math.exp(-(ux * ux + uy * uy) / 0.004);
          h += 0.95 * Math.exp(-(bx * bx + by * by) / 0.012);
          h += 0.25 * Math.exp(-(bx * bx + by * by) / 0.06);
          const i = Math.max(0, Math.min(255, Math.round(h * 255)));
          const o = (y * lw + x) * 4;
          data[o] = lut[i * 3]; data[o + 1] = lut[i * 3 + 1]; data[o + 2] = lut[i * 3 + 2]; data[o + 3] = 255;
        }
      }
      lctx.putImageData(img, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(low, 0, 0, W, H);
      // les murs, froids
      const cell = Math.max(W / maze.cols, H / maze.rows);
      const ox = (W - maze.cols * cell) / 2, oy = (H - maze.rows * cell) / 2;
      ctx.beginPath();
      for (let y = 0; y < maze.rows; y++) for (let x = 0; x < maze.cols; x++) {
        const c = maze.cells[y * maze.cols + x];
        const x0 = ox + x * cell, y0 = oy + y * cell;
        if (c & 1) { ctx.moveTo(x0, y0); ctx.lineTo(x0 + cell, y0); }
        if (c & 8) { ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + cell); }
      }
      ctx.strokeStyle = 'rgba(120, 140, 255, 0.22)';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (opts.onFrame) opts.onFrame({you, beast, dist: d});
      if (running) raf = requestAnimationFrame(draw);
    }
    const ctrl = {
      start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(draw); },
      stop() { running = false; cancelAnimationFrame(raf); },
      resize() { resize(); if (!running) draw(performance.now()); },
      point(x, y) { auto = false; you.tx = x; you.ty = y; },
      release() { auto = true; },
    };
    resize();
    return ctrl;
  }

  window.EscapeLab = {create, thermal};
})();
