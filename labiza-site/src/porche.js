/* Le porche de la ferme : un portail charretier en pierre calcaire, comme on en voit à l'entrée des
   fermes fortifiées du Soissonnais. Un mur de moellons irréguliers, un arc en plein cintre fait de
   claveaux autour d'une clé, des piédroits harpés, des chasse-roues, du lierre, et un passage voûté
   au bout duquel on aperçoit le parc. Dessin de 400 × 500 unités, rendu une fois à la bonne taille. */
window.BizaPorche = (function () {
  'use strict';
  const TAU = Math.PI * 2;
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rgb = (c, a = 1) => `rgba(${c.map((v) => Math.round(Math.max(0, Math.min(255, v)))).join(',')},${a})`;
  const shade = (c, k) => c.map((v) => v * k);

  // la géométrie du porche
  const C = {x: 200, y: 250}; // centre de l'arc
  const R1 = 100; // intrados
  const ENTRY = 'M100 500 V250 A100 100 0 0 1 300 250 V500 Z';
  const EXIT = {x: 206, y: 264, r: 86, floor: 482}; // le bout du passage, plus petit et un peu décalé
  const exitPath = () => new Path2D(`M${EXIT.x - EXIT.r} ${EXIT.floor} V${EXIT.y} A${EXIT.r} ${EXIT.r} 0 0 1 ${EXIT.x + EXIT.r} ${EXIT.y} V${EXIT.floor} Z`);
  // le mur : plus haut au-dessus du porche, avec son chaperon
  const WALL = 'M-10 500 V78 H58 V30 H342 V78 H410 V500 Z';
  const MORTAR = [184, 175, 155];
  const STONES = [[208, 198, 176], [198, 188, 166], [214, 205, 186], [190, 180, 160], [202, 190, 164], [196, 190, 176], [186, 174, 150]];
  const DRESSED = [222, 213, 192];

  // une pierre, éclairée d'en haut à droite : son ombre portée dans le joint, son volume, ses arêtes
  function stone(ctx, path, box, col) {
    // l'ombre de la pierre sur le joint, en dessous (la lumière vient d'en haut à droite)
    ctx.save();
    ctx.translate(-0.5, 1.1);
    ctx.fillStyle = 'rgba(80,66,46,.3)';
    ctx.fill(path);
    ctx.restore();
    const g = ctx.createLinearGradient(box[2], box[1], box[0], box[3]);
    g.addColorStop(0, rgb(shade(col, 1.04)));
    g.addColorStop(0.6, rgb(col));
    g.addColorStop(1, rgb(shade(col, 0.92)));
    ctx.fillStyle = g;
    ctx.fill(path);
    ctx.save();
    ctx.clip(path);
    ctx.lineWidth = 1.2;
    ctx.translate(-0.6, 0.7);
    ctx.strokeStyle = 'rgba(255,251,240,.28)';
    ctx.stroke(path);
    ctx.translate(1.2, -1.4);
    ctx.strokeStyle = 'rgba(90,74,52,.22)';
    ctx.stroke(path);
    ctx.restore();
  }
  // un contour irrégulier, aux angles adoucis, à partir de points
  function rough(pts) {
    const p = new Path2D();
    const n = pts.length;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(pts[n - 1], pts[0]);
    p.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) {
      const m = mid(pts[i], pts[(i + 1) % n]);
      p.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]);
    }
    p.closePath();
    return p;
  }
  const bbox = (pts) => pts.reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [1e9, 1e9, -1e9, -1e9]);
  // un moellon : un bloc grossièrement équarri, aux arêtes droites mais irrégulières
  function rubble(ctx, r, x, y, w, h) {
    const g = 0.9 + r() * 0.9;
    const j = (m = 1) => (r() - 0.5) * Math.min(4, h * 0.22) * m;
    const x0 = x + g, x1 = x + w - g, y0 = y + g, y1 = y + h - g;
    const pts = [[x0 + j(), y0 + j()], [x0 + (x1 - x0) * (0.3 + r() * 0.4) + j(), y0 + j(0.6)], [x1 + j(), y0 + j()], [x1 + j(0.6), y0 + (y1 - y0) * (0.3 + r() * 0.4)], [x1 + j(), y1 + j()], [x0 + (x1 - x0) * (0.3 + r() * 0.4) + j(), y1 + j(0.6)], [x0 + j(), y1 + j()]];
    if (r() < 0.5) pts.splice(1 + ((r() * 3) | 0) * 2, 1);
    const p = new Path2D();
    pts.forEach(([px, py], i) => (i ? p.lineTo(px, py) : p.moveTo(px, py)));
    p.closePath();
    const base = STONES[(r() * STONES.length) | 0];
    const l = 0.94 + r() * 0.12;
    stone(ctx, p, bbox(pts), base.map((v) => v * l + (r() - 0.5) * 6));
  }
  // une assise : des moellons de hauteurs inégales, calés par de petites pierres
  function course(ctx, r, y, hh) {
    for (let x = -14 - r() * 18; x < 410;) {
      const ww = r() < 0.14 ? 42 + r() * 20 : 12 + r() * 30;
      const sh = hh * (0.72 + r() * 0.28);
      const top = r() < 0.5;
      rubble(ctx, r, x, top ? y : y + hh - sh, ww, sh);
      const rest = hh - sh;
      if (rest > 5 && r() < 0.6) { const cw = Math.min(ww * 0.6, 6 + r() * 12); rubble(ctx, r, x + r() * (ww - cw), top ? y + sh : y, cw, rest); }
      x += ww;
    }
  }
  // une pierre de taille : arêtes nettes, à peine adoucies
  function dressed(ctx, r, pts, tone = 1) {
    const p = new Path2D();
    pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
    p.closePath();
    ctx.save();
    ctx.fillStyle = rgb(MORTAR);
    ctx.strokeStyle = rgb(MORTAR);
    ctx.lineWidth = 4;
    ctx.fill(p); ctx.stroke(p);
    ctx.restore();
    // retrait du joint, vers le centre de la pierre
    const cx = pts.reduce((s, q) => s + q[0], 0) / pts.length, cy = pts.reduce((s, q) => s + q[1], 0) / pts.length;
    const inset = pts.map(([x, y]) => { const dx = cx - x, dy = cy - y, d = Math.hypot(dx, dy) || 1; return [x + (dx / d) * 1.3, y + (dy / d) * 1.3]; });
    const q = new Path2D();
    inset.forEach(([x, y], i) => (i ? q.lineTo(x, y) : q.moveTo(x, y)));
    q.closePath();
    stone(ctx, q, bbox(inset), DRESSED.map((v) => (v + (r() - 0.5) * 12) * tone));
  }

  function gate(cv, {w, h, dpr, zoom = 1}) {
    const f = Math.min(dpr * zoom, 3.2);
    cv.width = Math.round(w * f); cv.height = Math.round(h * f);
    const ctx = cv.getContext('2d');
    const k = (w * f) / 400;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.clearRect(0, 0, 400, 500);
    ctx.lineJoin = 'round';
    const r = rng(23);
    const wall = new Path2D(WALL);

    // 1. le mur de moellons, assise par assise
    ctx.save();
    ctx.clip(wall);
    ctx.fillStyle = rgb(MORTAR);
    ctx.fillRect(-10, 0, 420, 500);
    for (let y = 26; y < 500;) {
      const hh = 11 + r() * 15;
      course(ctx, r, y, hh);
      y += hh;
    }
    ctx.restore();

    // 2. les chaînes d'angle du porche et le chaperon
    for (const x0 of [58, 342 - 30]) {
      for (let y = 34, i = 0; y < 78; i++) { const hh = 15 + r() * 4; dressed(ctx, r, [[x0 + (i % 2 && x0 > 200 ? -6 : 0), y], [x0 + 30 + (i % 2 && x0 < 200 ? 6 : 0), y], [x0 + 30 + (i % 2 && x0 < 200 ? 6 : 0), y + hh], [x0 + (i % 2 && x0 > 200 ? -6 : 0), y + hh]]); y += hh; }
    }
    const coping = (x0, x1, y) => {
      for (let x = x0; x < x1;) { const ww = Math.min(x1 - x, 30 + r() * 22); dressed(ctx, r, [[x - 1, y], [x + ww + 1, y], [x + ww + 3, y + 10], [x - 3, y + 10]], 1.02); x += ww; }
    };
    coping(52, 348, 22);
    coping(-14, 58, 70);
    coping(342, 414, 70);

    // 3. les claveaux de l'arc, longs et courts en alternance, autour de la clé
    const N = 17;
    for (let i = 0; i < N; i++) {
      const a0 = Math.PI + (i / N) * Math.PI, a1 = Math.PI + ((i + 1) / N) * Math.PI;
      const key = i === (N - 1) / 2;
      const r2 = key ? 146 : i % 2 ? 128 : 138;
      const spread = key ? 0.012 : 0;
      const pts = [];
      for (const [a, rr] of [[a0 - spread, R1], [a1 + spread, R1], [a1 + spread, r2], [a0 - spread, r2]]) pts.push([C.x + Math.cos(a) * rr, C.y + Math.sin(a) * rr]);
      if (key) { pts[2][1] -= 2; pts[3][1] -= 2; }
      dressed(ctx, r, pts, key ? 1.03 : 1);
    }
    // les impostes, où l'arc prend appui
    dressed(ctx, r, [[60, 250], [104, 250], [104, 262], [64, 262]], 1.04);
    dressed(ctx, r, [[296, 250], [340, 250], [336, 262], [296, 262]], 1.04);
    // les piédroits, harpés dans le mur
    for (const side of [-1, 1]) {
      const edge = side < 0 ? 100 : 300;
      for (let y = 262, i = 0; y < 500; i++) {
        const hh = Math.min(500 - y, 34 + r() * 8);
        const ww = i % 2 ? 26 : 42;
        const xo = edge + side * ww;
        dressed(ctx, r, [[edge, y], [xo, y], [xo, y + hh], [edge, y + hh]]);
        y += hh;
      }
    }

    // 4. le passage voûté : on l'efface, puis on y dessine l'intérieur, dans l'ombre
    const entry = new Path2D(ENTRY);
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fill(entry);
    ctx.restore();
    ctx.save();
    ctx.clip(entry);
    const ig = ctx.createLinearGradient(0, 150, 0, 500);
    ig.addColorStop(0, 'rgb(62,54,44)');
    ig.addColorStop(0.6, 'rgb(84,74,60)');
    ig.addColorStop(1, 'rgb(104,94,78)');
    ctx.fillStyle = ig;
    ctx.fillRect(90, 140, 220, 370);
    // le sol pavé, qui file vers la lumière
    const fl = ctx.createLinearGradient(0, 500, 0, EXIT.floor);
    fl.addColorStop(0, 'rgb(96,86,72)');
    fl.addColorStop(1, 'rgb(150,138,116)');
    ctx.fillStyle = fl;
    ctx.beginPath(); ctx.moveTo(100, 500); ctx.lineTo(300, 500); ctx.lineTo(EXIT.x + EXIT.r, EXIT.floor); ctx.lineTo(EXIT.x - EXIT.r, EXIT.floor); ctx.closePath(); ctx.fill();
    for (let j = 0; j < 6; j++) {
      const t0 = j / 6, t1 = (j + 1) / 6;
      const ya = 500 - (500 - EXIT.floor) * t0, yb = 500 - (500 - EXIT.floor) * t1;
      const xl = 100 + (EXIT.x - EXIT.r - 100) * t0, xr = 300 + (EXIT.x + EXIT.r - 300) * t0;
      const n = 12;
      for (let i = 0; i < n; i++) {
        const xa = xl + ((xr - xl) * (i + (j % 2) * 0.5)) / n;
        const cw = ((xr - xl) / n) * 0.82;
        ctx.fillStyle = `rgba(${170 + r() * 30},${158 + r() * 26},${132 + r() * 22},${0.35 + t0 * 0.25})`;
        ctx.beginPath(); ctx.ellipse(xa + cw / 2, (ya + yb) / 2, cw / 2, (ya - yb) * 0.4, 0, 0, TAU); ctx.fill();
      }
    }
    // la voûte : ses assises et ses joints filent vers le bout du passage
    ctx.lineWidth = 0.8;
    for (let i = 1; i < 3; i++) {
      const t = i / 3;
      const cx = C.x + (EXIT.x - C.x) * t, cy = C.y + (EXIT.y - C.y) * t, rr = R1 + (EXIT.r - R1) * t;
      ctx.strokeStyle = `rgba(30,24,18,${0.22 - t * 0.1})`;
      ctx.beginPath(); ctx.arc(cx, cy, rr, Math.PI, TAU);
      ctx.lineTo(cx + rr, 500); ctx.moveTo(cx - rr, cy); ctx.lineTo(cx - rr, 500);
      ctx.stroke();
    }
    for (let i = 1; i < N; i++) {
      const a = Math.PI + (i / N) * Math.PI;
      ctx.strokeStyle = 'rgba(30,24,18,.2)';
      ctx.beginPath();
      ctx.moveTo(C.x + Math.cos(a) * R1, C.y + Math.sin(a) * R1);
      ctx.lineTo(EXIT.x + Math.cos(a) * EXIT.r, EXIT.y + Math.sin(a) * EXIT.r);
      ctx.stroke();
    }
    for (const side of [-1, 1]) {
      for (let y = 262; y < 500; y += 36) {
        const t = (y - 250) / 250;
        ctx.strokeStyle = 'rgba(30,24,18,.18)';
        ctx.beginPath();
        ctx.moveTo(side < 0 ? 100 : 300, y);
        ctx.lineTo(side < 0 ? EXIT.x - EXIT.r : EXIT.x + EXIT.r, EXIT.y + (EXIT.floor - EXIT.y) * t);
        ctx.stroke();
      }
    }
    // la lumière du parc entre par le bout du passage
    const glow = ctx.createRadialGradient(EXIT.x, EXIT.y + 60, 20, EXIT.x, EXIT.y + 60, 190);
    glow.addColorStop(0, 'rgba(255,246,222,.32)');
    glow.addColorStop(1, 'rgba(255,246,222,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(90, 140, 220, 370);
    ctx.restore();
    // le bout du passage s'ouvre sur le parc
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fill(exitPath());
    ctx.restore();

    // 5. les chasse-roues, au pied des piédroits
    for (const [x, dir] of [[100, 1], [300, -1]]) {
      const p = new Path2D();
      p.moveTo(x, 500); p.lineTo(x, 466); p.quadraticCurveTo(x + dir * 16, 468, x + dir * 18, 500); p.closePath();
      stone(ctx, p, dir > 0 ? [x, 466, x + 18, 500] : [x - 18, 466, x, 500], [206, 196, 174]);
    }

    // 6. le temps qui passe : grain de la pierre, coulures sous le chaperon, humidité au pied
    ctx.save();
    ctx.clip(wall);
    ctx.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 9000; i++) {
      const x = r() * 400, y = 20 + r() * 480, s = 0.35 + r() * 0.9;
      ctx.fillStyle = r() < 0.55 ? `rgba(60,48,32,${0.05 + r() * 0.12})` : `rgba(255,250,238,${0.05 + r() * 0.12})`;
      ctx.fillRect(x, y, s, s);
    }
    for (let i = 0; i < 12; i++) {
      const x = r() * 400, y0 = r() < 0.5 ? 32 : 80, len = 30 + r() * 80, wd = 8 + r() * 14;
      ctx.save();
      ctx.translate(x, y0); ctx.scale(wd, len);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, 'rgba(80,72,58,.12)'); g.addColorStop(1, 'rgba(80,72,58,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, 1, 0, TAU); ctx.fill();
      ctx.restore();
    }
    for (let i = 0; i < 320; i++) {
      const x = r() * 400, y = 30 + r() * 470, rr = i < 40 ? 14 + r() * 40 : 3 + r() * 10;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      const v = r(), c = v < 0.4 ? '96,90,70' : v < 0.7 ? '150,128,92' : '240,234,216';
      g.addColorStop(0, `rgba(${c},${0.06 + r() * 0.08})`); g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    const damp = ctx.createLinearGradient(0, 430, 0, 500);
    damp.addColorStop(0, 'rgba(78,84,62,0)'); damp.addColorStop(1, 'rgba(78,84,62,.32)');
    ctx.fillStyle = damp;
    ctx.fillRect(-10, 430, 420, 70);
    ctx.restore();

    // 7. le lierre, qui grimpe sur la droite du porche et retombe du chaperon
    ivy(ctx, r, [[392, 500], [378, 420], [386, 330], [372, 250], [380, 160], [366, 96], [372, 60]], 1);
    ivy(ctx, r, [[356, 500], [344, 440], [352, 380], [338, 330]], 0.7);
    ivy(ctx, r, [[408, 360], [396, 300], [404, 220], [394, 150]], 0.8);
    ivy(ctx, r, [[60, 30], [70, 40], [66, 64], [76, 92]], 0.55, true);
    // des herbes au pied du mur
    for (let x = -10; x < 410; x += 1.2 + r() * 2.2) {
      if (x > 112 && x < 288) continue;
      const hh = 3 + r() * 9, lean = (r() - 0.5) * 5;
      ctx.fillStyle = r() < 0.5 ? 'rgba(62,82,52,.9)' : 'rgba(92,110,70,.9)';
      ctx.beginPath(); ctx.moveTo(x - 0.6, 500); ctx.lineTo(x + lean, 500 - hh); ctx.lineTo(x + 0.6, 500); ctx.fill();
    }
  }

  // un pied de lierre : des tiges, et des feuilles plus denses en bas, éclairées d'en haut à droite
  function ivy(ctx, r, pts, density, hanging = false) {
    const TONES = [[44, 60, 42], [58, 80, 52], [76, 98, 62], [98, 118, 74]];
    const along = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2);
      for (let j = 0; j < n; j++) { const t = j / n; along.push([x0 + (x1 - x0) * t + Math.sin((i * n + j) * 0.3) * 3, y0 + (y1 - y0) * t]); }
    }
    ctx.strokeStyle = 'rgba(74,62,44,.8)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    along.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    const leaves = [];
    along.forEach(([x, y], i) => {
      const q = i / along.length; // 0 au pied, 1 en haut
      const n = Math.round((hanging ? 4 : 7 * (1 - q * 0.6)) * density);
      for (let j = 0; j < n; j++) {
        if (r() > 0.5) continue;
        const spread = (hanging ? 14 : 22 * (1 - q * 0.5)) * density;
        leaves.push([x + (r() - 0.5) * spread * 2, y + (r() - 0.5) * 10, 2.4 + r() * 2.6, r() * TAU]);
      }
    });
    // l'ombre portée des feuilles sur la pierre, puis les feuilles
    for (const [x, y, s] of leaves) { ctx.fillStyle = 'rgba(40,34,24,.22)'; ctx.beginPath(); ctx.arc(x - 1.2, y + 1.6, s, 0, TAU); ctx.fill(); }
    leaves.sort((a, b) => (a[0] - a[1]) - (b[0] - b[1]));
    for (const [x, y, s, a] of leaves) {
      const lit = (x - 380) * 0.02 - (y - 300) * 0.004 + (r() - 0.5) * 1.6;
      const c = TONES[Math.max(0, Math.min(3, Math.round(1.2 + lit)))];
      ctx.fillStyle = rgb(c);
      ctx.save();
      ctx.translate(x, y); ctx.rotate(a);
      // une feuille de lierre : trois lobes
      ctx.beginPath();
      ctx.arc(0, -s * 0.45, s * 0.55, 0, TAU);
      ctx.arc(-s * 0.48, s * 0.15, s * 0.5, 0, TAU);
      ctx.arc(s * 0.48, s * 0.15, s * 0.5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(230,236,200,.18)';
      ctx.beginPath(); ctx.arc(s * 0.2, -s * 0.5, s * 0.3, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }

  /* Ce qu'on aperçoit au bout du passage : la pelouse du parc, tondue en bandes, l'ombre des
     arbres, et les arbres (pal : les couleurs du paysage à l'heure dite ; trees : la ligne d'arbres) */
  const HORIZON = 340;
  function view(cv, {w, h, dpr, pal, trees}) {
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const ctx = cv.getContext('2d');
    const k = (w * dpr) / 400;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.clearRect(0, 0, 400, 500);
    const H = HORIZON;
    const g = ctx.createLinearGradient(0, H, 0, 500);
    g.addColorStop(0, pal.far);
    g.addColorStop(1, pal.near);
    ctx.fillStyle = g;
    ctx.fillRect(0, H - 1, 400, 502 - H);
    // l'herbe : de fines touches, plus petites au loin
    const r = rng(7);
    for (let i = 0; i < 1400; i++) {
      const q = Math.pow(r(), 1.6), y = H + 2 + q * (500 - H), len = 1 + q * 7;
      ctx.fillStyle = r() < 0.5 ? 'rgba(255,255,230,.08)' : 'rgba(20,40,24,.08)';
      ctx.fillRect(r() * 400, y, len, 0.4 + q * 0.9);
    }
    // l'ombre des arbres sur la pelouse, au pied du bois
    const sh = ctx.createLinearGradient(0, H, 0, H + 14);
    sh.addColorStop(0, 'rgba(20,34,26,.38)'); sh.addColorStop(1, 'rgba(20,34,26,0)');
    ctx.fillStyle = sh;
    ctx.fillRect(0, H, 400, 14);
    if (trees) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(trees.out, 0, Math.round(H * k - trees.out.height + 1.5 * dpr));
      ctx.setTransform(k, 0, 0, k, 0, 0);
    }
    // une brume légère au pied des arbres
    const hz = ctx.createLinearGradient(0, H - 18, 0, H + 6);
    hz.addColorStop(0, pal.haze.replace(/[\d.]+\)$/, '0)'));
    hz.addColorStop(0.7, pal.haze);
    hz.addColorStop(1, pal.haze.replace(/[\d.]+\)$/, '0)'));
    ctx.fillStyle = hz;
    ctx.fillRect(0, H - 18, 400, 24);
  }

  return {gate, view, horizon: HORIZON};
})();
