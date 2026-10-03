/* Les bois du domaine : des arbres dessinés touche par touche (chênes, peupliers d'Italie, saules
   pleureurs, buissons, roseaux), en plans de plus en plus pâles avec la distance.
   Un paysage est rendu une seule fois, à la taille de l'écran, dans trois masques : la silhouette,
   le mélange avec le ciel (la distance, la brume) et la lumière du soleil. Il est ensuite recoloré
   à chaque heure de la journée, sans redessiner une seule feuille. */
window.BizaWoods = (function () {
  'use strict';
  const TAU = Math.PI * 2;
  const LX = 0.55, LY = -0.83; // la lumière vient d'en haut, à droite : le soleil de l'après-midi
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; };
  const disc = (p, x, y, r) => { p.moveTo(x + r, y); p.arc(x, y, r, 0, TAU); };

  /* Un paysage. o : w, h (taille de la scène en px CSS), dpr, s (px par unité de dessin), ox, oy
     (position de l'origine du dessin), box [x0, y0, x1, y1] (la zone dessinée, en unités), seed, dot
     (taille des touches de feuillage, en px) */
  function scene(o) {
    const {w, h, dpr, s = 1, ox = 0, oy = 0, seed = 1} = o;
    const box = o.box || [-ox / s, -oy / s, (w - ox) / s, (h - oy) / s];
    const left = Math.floor(Math.max(0, ox + box[0] * s)), right = Math.ceil(Math.min(w, ox + box[2] * s));
    const top = Math.floor(Math.max(0, oy + box[1] * s)), bottom = Math.ceil(Math.min(h, oy + box[3] * s));
    const cw = Math.round((right - left) * dpr), ch = Math.round((bottom - top) * dpr);
    const masks = {left, top, width: right - left, height: bottom - top, dpr, cover: canvas(cw, ch), mix: canvas(cw, ch), lit: canvas(cw, ch), glow: null, out: canvas(cw, ch)};
    const C = masks.cover.getContext('2d'), M = masks.mix.getContext('2d'), Lt = masks.lit.getContext('2d');
    // le plan en cours de dessin : sa silhouette (CL) et sa lumière (LL), fondues dans les masques à la fin du plan
    const cl = canvas(cw, ch), ll = canvas(cw, ch);
    const CL = cl.getContext('2d'), LL = ll.getContext('2d');
    let Gl = null;
    const setT = (c) => c.setTransform(dpr * s, 0, 0, dpr * s, dpr * (ox - left), dpr * (oy - top));
    [CL, LL].forEach((c) => { setT(c); c.fillStyle = '#000'; c.strokeStyle = '#000'; c.lineCap = 'round'; c.lineJoin = 'round'; });
    const glowCtx = () => {
      if (!Gl) { masks.glow = canvas(cw, ch); Gl = masks.glow.getContext('2d'); setT(Gl); Gl.fillStyle = '#000'; Gl.strokeStyle = '#000'; Gl.lineCap = 'round'; }
      return Gl;
    };
    const u = s; // px CSS par unité
    const rnd = rng(seed);
    const dot = o.dot || [0.7, 1.5];
    const vx0 = (left - ox) / s, vx1 = (right - ox) / s; // la partie visible, en unités

    // le plan en cours : son mélange avec le ciel (m), sa brume au pied, la force de sa lumière (k)
    // split : taille (px) au-delà de laquelle une masse se divise ; dots : nombre de feuilles par px de rayon
    let look = null;
    function layer({m = 0, k = 1, mist = null, split = 8, dots = 1.6}) {
      if (look) merge();
      let style = `rgba(0,0,0,${m})`;
      if (mist) {
        const g = CL.createLinearGradient(0, mist[0], 0, mist[1]);
        g.addColorStop(0, `rgba(0,0,0,${clamp(m + mist[2])})`);
        g.addColorStop(1, `rgba(0,0,0,${m})`);
        style = g;
      }
      look = {m, k, mixStyle: style, mixed: m > 0 || !!mist, split, dots};
    }
    // le plan passe devant les précédents : il les cache, et apporte son mélange avec le ciel et sa lumière
    function merge() {
      C.drawImage(cl, 0, 0);
      M.globalCompositeOperation = 'destination-out'; M.drawImage(cl, 0, 0);
      Lt.globalCompositeOperation = 'destination-out'; Lt.drawImage(cl, 0, 0);
      Lt.globalCompositeOperation = 'source-over'; Lt.globalAlpha = look.k; Lt.drawImage(ll, 0, 0); Lt.globalAlpha = 1;
      if (look.mixed) {
        CL.globalCompositeOperation = 'source-in';
        CL.fillStyle = look.mixStyle;
        CL.fillRect(box[0] - 10, box[1] - 10, box[2] - box[0] + 20, box[3] - box[1] + 20);
        CL.fillStyle = '#000';
        CL.globalCompositeOperation = 'source-over';
        M.globalCompositeOperation = 'source-over'; M.drawImage(cl, 0, 0);
      }
      for (const c of [CL, LL]) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, cw, ch); c.restore(); }
    }

    // un groupe de touches : la silhouette, qui cache la lumière des touches d'avant, puis sa propre lumière
    let P = null;
    const begin = () => { P = {base: new Path2D(), lit: new Path2D(), hasLit: false}; };
    const flush = () => {
      CL.fill(P.base);
      LL.globalCompositeOperation = 'destination-out'; LL.fill(P.base);
      LL.globalCompositeOperation = 'source-over';
      if (P.hasLit) LL.fill(P.lit);
    };
    const lit = (x, y, r) => { disc(P.lit, x, y, r); P.hasLit = true; };
    // côté soleil : 1 face à la lumière, -1 à l'ombre (la touche, puis l'arbre entier)
    const facing = (x, y, c) => 0.62 * ((x - c.x) * LX + (y - c.y) * LY) / c.r + 0.38 * ((x - c.cx) * LX + (y - c.cy) * LY) / c.cr;

    // une masse de feuillage, faite de masses plus petites, jusqu'aux feuilles
    function leaves(x, y, r, c, depth) {
      const rp = r * u;
      disc(P.base, x, y, r * 0.56);
      if (rp > look.split && depth < 3) {
        const n = 5 + (rnd() * 4 | 0);
        const a0 = rnd() * TAU;
        for (let i = 0; i < n; i++) {
          const a = a0 + (i / n) * TAU + (rnd() - 0.5) * 0.9;
          const d = r * (0.36 + rnd() * 0.34);
          leaves(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.86, r * (0.3 + rnd() * 0.22), c, depth + 1);
        }
        return;
      }
      if (facing(x, y, c) > 0.2 + rnd() * 0.4) lit(x, y, r * 0.56);
      // les feuilles, sur le pourtour de la masse : c'est là qu'elles dessinent la silhouette
      const n = Math.round(clamp(rp * look.dots, 3, 16));
      for (let i = 0; i < n; i++) {
        const a = rnd() * TAU, d = r * (0.5 + 0.5 * Math.sqrt(rnd()));
        const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
        const dr = (dot[0] + rnd() * (dot[1] - dot[0])) / u;
        disc(P.base, px, py, dr);
        if (facing(px, py, c) > 0.05 + rnd() * 0.5) lit(px, py, dr);
      }
    }
    // une couronne : des masses triées de l'ombre vers la lumière (les plus éclairées passent devant)
    function crown(list, cx, cy, cr) {
      list.sort((p, q) => (p[0] * LX + p[1] * LY) - (q[0] * LX + q[1] * LY));
      for (const [x, y, r] of list) { begin(); leaves(x, y, r, {x, y, r, cx, cy, cr}, 0); flush(); }
    }
    // une branche ou un tronc, effilé
    function limb(x0, y0, x1, y1, w0, w1, bend = 0) {
      const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const mx = (x0 + x1) / 2 + nx * bend, my = (y0 + y1) / 2 + ny * bend;
      const p = P.base;
      p.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2);
      p.quadraticCurveTo(mx + nx * (w0 + w1) / 4, my + ny * (w0 + w1) / 4, x1 + nx * w1 / 2, y1 + ny * w1 / 2);
      p.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2);
      p.quadraticCurveTo(mx - nx * (w0 + w1) / 4, my - ny * (w0 + w1) / 4, x0 - nx * w0 / 2, y0 - ny * w0 / 2);
      p.closePath();
    }
    const seen = (x, half) => x + half > vx0 && x - half < vx1;

    // un chêne (ou un frêne, un tilleul) : un tronc, quelques maîtresses branches, une couronne ronde
    function oak({x, y, h, w = 1, lean = 0, open = 0}) {
      const rx = h * 0.34 * w, ry = h * 0.34;
      if (!seen(x, rx * 1.3)) return;
      const cx = x + lean * h * 0.12, cy = y - h * 0.62;
      begin();
      const fork = cy + ry * 0.35;
      limb(x, y, cx, fork, h * 0.05, h * 0.032, lean * h * 0.03);
      const nl = 3 + (rnd() * 3 | 0);
      for (let i = 0; i < nl; i++) {
        const a = -Math.PI / 2 + (i / (nl - 1) - 0.5) * 2.3 + (rnd() - 0.5) * 0.4;
        limb(cx, fork, cx + Math.cos(a) * rx * 0.7, fork + Math.sin(a) * ry * 0.72, h * 0.026, h * 0.006, (rnd() - 0.5) * h * 0.05);
      }
      flush();
      const n = Math.round((7 + w * 6 + h * u / 45) * (1 - open * 0.45));
      const list = [];
      for (let i = 0; i < n; i++) {
        const a = rnd() * TAU, d = Math.pow(rnd(), 0.4) * 0.74;
        list.push([cx + Math.cos(a) * d * rx, cy + Math.sin(a) * d * ry, h * (0.13 + rnd() * 0.09) * (1 - open * 0.3)]);
      }
      crown(list, cx, cy, Math.max(rx, ry));
    }

    // un peuplier d'Italie : une colonne étroite, le long des rivières picardes
    function poplar({x, y, h, w = 1, lean = 0}) {
      const wv = h * 0.11 * w;
      if (!seen(x, wv * 1.5)) return;
      begin();
      limb(x, y, x + lean * h * 0.05, y - h * 0.9, h * 0.032, h * 0.006);
      flush();
      const n = Math.round(9 + h * u / 8);
      const list = [];
      for (let i = 0; i < n; i++) {
        const q = i / (n - 1);
        const W = wv * Math.pow(Math.sin(Math.PI * (0.17 + q * 0.81)), 0.62);
        list.push([x + (rnd() - 0.5) * W * 0.9 + lean * h * 0.05 * q, y - h * (0.13 + 0.85 * q), W * (0.56 + rnd() * 0.3)]);
      }
      crown(list, x, y - h * 0.55, h * 0.45);
    }

    // un saule pleureur : un tronc penché, un dôme, et un rideau de rameaux qui tombe vers l'eau
    function willow({x, y, h, w = 1, lean = 0.3}) {
      const rx = h * 0.44 * w, ry = h * 0.24;
      if (!seen(x, rx * 1.3)) return;
      const cx = x + lean * h * 0.2, cy = y - h * 0.74;
      begin();
      const fork = cy + ry * 0.7;
      limb(x, y, cx - lean * h * 0.05, fork, h * 0.075, h * 0.045, lean * h * 0.04);
      for (let i = 0; i < 4; i++) {
        const a = -Math.PI / 2 + (i / 3 - 0.5) * 2.4;
        limb(cx - lean * h * 0.05, fork, cx + Math.cos(a) * rx * 0.7, fork + Math.sin(a) * ry * 1.2, h * 0.03, h * 0.007, (rnd() - 0.5) * h * 0.04);
      }
      flush();
      // les rameaux, en rideaux : des grappes de longues tiges souples qui tombent vers l'eau
      const c = {x: cx, y: cy, r: rx, cx, cy, cr: rx};
      const nc = Math.round(rx * u * 0.24) + 5;
      for (let i = 0; i < nc; i++) {
        begin();
        const f = clamp(((i + rnd()) / nc) * 2 - 1, -0.97, 0.97);
        const x0 = cx + f * rx * 0.95;
        const y0 = cy - Math.sqrt(1 - f * f) * ry * 0.5 + rnd() * ry * 0.45;
        const full = (y - y0) * (0.5 + rnd() * 0.42) * (1 - Math.abs(f) * 0.25);
        const sway = (rnd() - 0.5) * h * 0.035, drift = f * h * 0.08;
        const ns = 3 + (rnd() * 5 | 0);
        for (let k2 = 0; k2 < ns; k2++) {
          const sx = x0 + (rnd() - 0.5) * 6 / u;
          const len = full * (0.72 + rnd() * 0.32);
          const steps = Math.max(3, Math.ceil(len * u / 2.2));
          const at = (q) => [sx + drift * q * q + sway * Math.sin(q * Math.PI), y0 + len * q];
          // la tige, fine et souple
          const pts = [];
          for (let j = 0; j <= steps; j++) pts.push(at(j / steps));
          const wt = 0.45 / u;
          P.base.moveTo(pts[0][0] - wt, pts[0][1]);
          for (const [px, py] of pts) P.base.lineTo(px - wt * 0.6, py);
          for (let j = pts.length - 1; j >= 0; j--) P.base.lineTo(pts[j][0] + wt * 0.6, pts[j][1]);
          P.base.closePath();
          // ses feuilles, de part et d'autre
          for (let j = 1; j <= steps; j++) {
            const qv = (j - rnd() * 0.5) / steps;
            const [px, py] = at(qv);
            const side = (j % 2 ? 1 : -1) * (0.5 + rnd() * 0.5) / u;
            const dr = (dot[0] + rnd() * (dot[1] - dot[0])) * (1.05 - qv * 0.45) / u;
            disc(P.base, px + side, py, dr);
            if (facing(px, py, c) > -0.1 + rnd() * 0.7) lit(px + side, py, dr);
          }
        }
        flush();
      }
      // le dôme
      const n = Math.round(6 + h * u / 30);
      const list = [];
      for (let i = 0; i < n; i++) {
        const a = -Math.PI * (0.08 + rnd() * 0.84), d = 0.35 + rnd() * 0.6;
        list.push([cx + Math.cos(a) * rx * 0.82 * d, cy + Math.sin(a) * ry * d + ry * 0.2, h * (0.08 + rnd() * 0.06)]);
      }
      crown(list, cx, cy, rx);
    }

    // des buissons au pied des arbres
    function bush({x, y, w, h}) {
      if (!seen(x, w)) return;
      const n = Math.max(1, Math.round(w / (h * 0.9)));
      const list = [];
      for (let i = 0; i < n; i++) {
        const r = h * (0.42 + rnd() * 0.3);
        list.push([x - w / 2 + ((i + 0.5) / n) * w + (rnd() - 0.5) * h * 0.4, y - r * 0.55, r]);
      }
      crown(list, x, y - h * 0.5, Math.max(w / 2, h));
    }

    // des roseaux, et quelques massettes
    function reeds({x, y, w, h, n = 20}) {
      if (!seen(x, w)) return;
      begin();
      for (let i = 0; i < n; i++) {
        const bx = x + (rnd() - 0.5) * w;
        const bh = h * (0.4 + rnd() * 0.6);
        const bend = (rnd() - 0.42) * bh * 0.4;
        const bw = (0.9 + rnd() * 0.8) / u;
        const p = P.base;
        p.moveTo(bx - bw / 2, y);
        p.quadraticCurveTo(bx - bw / 2 + bend * 0.2, y - bh * 0.6, bx + bend, y - bh);
        p.quadraticCurveTo(bx + bw / 2 + bend * 0.2, y - bh * 0.6, bx + bw / 2, y);
        p.closePath();
        if (rnd() < 0.12 && bh > h * 0.7) {
          const tx = bx + bend * 0.62, ty = y - bh * 0.8;
          p.moveTo(tx, ty - 2.6 / u); p.ellipse(tx, ty, 1.4 / u, 3 / u, bend / bh, 0, TAU);
        }
      }
      flush();
    }

    // de l'herbe le long d'une ligne (le bord d'un pré, d'une île)
    function grass({x0, x1, at, h = 3}) {
      begin();
      const step = 1.1 / u;
      for (let x = Math.max(x0, vx0); x < Math.min(x1, vx1); x += step * (0.6 + rnd() * 0.8)) {
        const y = at(x);
        const bh = (h * (0.35 + rnd() * 0.65)) / u;
        const lean = (rnd() - 0.5) * bh * 0.6;
        P.base.moveTo(x - 0.5 / u, y + 0.5 / u);
        P.base.lineTo(x + lean, y - bh);
        P.base.lineTo(x + 0.5 / u, y + 0.5 / u);
        P.base.closePath();
      }
      flush();
    }

    // une forme ou un trait, sur la silhouette (base), dans la lumière (lit) ou en clair (glow)
    function shape(d, {mask = 'base', stroke = 0, grad = null, alpha = 1} = {}) {
      const path = typeof d === 'string' ? new Path2D(d) : d;
      if (mask === 'base') {
        if (!stroke) { begin(); P.base = path; flush(); return; }
        CL.lineWidth = stroke; LL.lineWidth = stroke;
        CL.stroke(path);
        LL.globalCompositeOperation = 'destination-out'; LL.stroke(path); LL.globalCompositeOperation = 'source-over';
        return;
      }
      // la lumière (une pelouse au soleil) et les touches claires (chaises, fleurs) passent par-dessus
      const c = mask === 'lit' ? LL : glowCtx();
      if (grad) {
        const g = c.createLinearGradient(0, grad[0], 0, grad[1]);
        g.addColorStop(0, `rgba(0,0,0,${grad[2]})`); g.addColorStop(1, `rgba(0,0,0,${grad[3]})`);
        c.fillStyle = g;
      }
      c.globalAlpha = alpha;
      if (stroke) { c.lineWidth = stroke; c.stroke(path); } else c.fill(path);
      c.globalAlpha = 1;
      c.fillStyle = '#000';
    }
    // une ombre douce sur la lumière (sous un arbre, ou les variations d'une pelouse)
    function shadow(x, y, rx, ry, a = 0.6) {
      LL.save();
      LL.translate(x, y); LL.scale(rx, ry);
      const g = LL.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(0.55, `rgba(0,0,0,${a * 0.75})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      LL.globalCompositeOperation = 'destination-out';
      LL.fillStyle = g;
      LL.beginPath(); LL.arc(0, 0, 1, 0, TAU); LL.fill();
      LL.restore();
    }

    function done() {
      if (look) merge();
      look = null;
      cl.width = ll.width = 1;
      return masks;
    }

    return {layer, oak, poplar, willow, bush, reeds, grass, shape, shadow, rnd, u, vx0, vx1, done};
  }

  /* Recolore un paysage : la terre, mêlée au ciel selon la distance, puis la lumière du soleil
     et les touches claires (chaises, fleurs). Chaque masque est recoloré sur place (seule sa
     transparence compte), puis les masques sont empilés dans masks.out. */
  const recolor = (c, color) => {
    const x = c.getContext('2d');
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.globalAlpha = 1;
    x.fillStyle = color;
    x.fillRect(0, 0, c.width, c.height);
  };
  function tint(masks, {land, sky, light, lightA = 0, glow = null, glowA = 0}) {
    const {out} = masks;
    const o = out.getContext('2d');
    recolor(masks.cover, land);
    recolor(masks.mix, sky);
    o.globalCompositeOperation = 'source-over';
    o.globalAlpha = 1;
    o.clearRect(0, 0, out.width, out.height);
    o.drawImage(masks.cover, 0, 0);
    o.drawImage(masks.mix, 0, 0);
    if (lightA > 0.005) {
      recolor(masks.lit, light);
      o.globalAlpha = lightA;
      o.drawImage(masks.lit, 0, 0);
    }
    if (masks.glow && glow && glowA > 0.005) {
      recolor(masks.glow, glow);
      o.globalAlpha = glowA;
      o.drawImage(masks.glow, 0, 0);
    }
    o.globalAlpha = 1;
    return out;
  }

  const wave = (x, a, b) => 0.5 + 0.3 * Math.sin(x * 0.0042 + a) + 0.2 * Math.sin(x * 0.013 + b);

  /* Le parc, vu depuis l'eau : un dessin de 1600 × 420 unités, calé en bas de la scène et rogné sur
     les côtés (comme une image en « cover »). La rive d'en face touche l'eau à 204, l'îlot à 262. */
  const ISLE = {water: 204, isle: 262};
  function isle({w, h, dpr}) {
    const s = Math.max(w / 1600, h / 420), ox = (w - 1600 * s) / 2, oy = h - 420 * s;
    const Y = ISLE.water;

    // la rive d'en face : le lointain, le bois du parc, puis les saules et les roseaux du bord
    const k = scene({w, h, dpr, s, ox, oy, seed: 31, box: [-80, 0, 1680, Y + 6], dot: [0.65, 1.35]});
    const r = k.rnd;
    k.layer({m: 0.58, k: 0.2, mist: [Y, Y - 60, 0.25], split: 16, dots: 1.1});
    for (let x = -80; x < 1680; x += 10 + r() * 14) {
      if (x < 560) continue; // caché derrière le bois du parc
      const hh = (34 + r() * 24) * (0.7 + 0.6 * wave(x, 1.3, 4.1));
      if (r() < 0.1) k.poplar({x, y: Y - 1, h: hh * 1.7, w: 0.9 + r() * 0.3});
      else k.oak({x, y: Y - 1, h: hh, w: 0.9 + r() * 0.6, lean: (r() - 0.5) * 0.3});
    }
    k.layer({m: 0.3, k: 0.45, mist: [Y, Y - 110, 0.18], split: 9, dots: 1.5});
    // à gauche, le parc boisé : de grands arbres serrés, qui s'abaissent vers l'îlot
    for (let x = -80; x < 640; x += 26 + r() * 22) {
      const edge = 1 - Math.max(0, (x - 380) / 260) * 0.5;
      const hh = (112 + r() * 54) * edge * (0.9 + 0.2 * wave(x, 0.4, 2.2));
      if (r() < 0.22) k.oak({x, y: Y, h: hh * 1.12, w: 0.68 + r() * 0.15, open: 0.45, lean: (r() - 0.5) * 0.3});
      else k.oak({x, y: Y, h: hh, w: 0.95 + r() * 0.4, lean: (r() - 0.5) * 0.4});
    }
    // le sous-bois : de jeunes arbres et des taillis entre les troncs
    for (let x = -80; x < 600; x += 13 + r() * 16) k.oak({x, y: Y, h: 24 + r() * 26, w: 1.2 + r() * 0.5, lean: (r() - 0.5) * 0.5});
    // derrière l'îlot, une prairie bordée d'arbres plus bas
    for (let x = 650; x < 1130; x += 50 + r() * 60) {
      const n = 1 + (r() * 3 | 0);
      for (let i = 0; i < n; i++) k.oak({x: x + i * (14 + r() * 12), y: Y, h: (48 + r() * 40) * (i ? 0.8 : 1), w: 0.9 + r() * 0.7, lean: (r() - 0.5) * 0.4});
      k.bush({x: x + n * 8, y: Y + 0.5, w: 30 + n * 14, h: 10 + r() * 10});
    }
    // à droite, l'alignement de peupliers d'Italie de la vallée de l'Aisne
    for (let x = 1135; x < 1680; x += 24 + r() * 9) k.poplar({x, y: Y, h: 122 + r() * 30, w: 0.9 + r() * 0.25, lean: (r() - 0.5) * 0.12});
    k.oak({x: 1205, y: Y, h: 84, w: 1.2});
    k.oak({x: 1515, y: Y, h: 92, w: 1.15});
    for (let x = -80; x < 1680; x += 16 + r() * 14) k.bush({x, y: Y + 1, w: 22 + r() * 16, h: 8 + r() * 9});
    let shore = `M-80 ${Y + 6} L-80 ${Y + 2}`;
    for (let x = -80; x <= 1680; x += 20) shore += ` L${x} ${(Y + 1.6 + r() * 1.8).toFixed(1)}`;
    k.shape(`${shore} L1680 ${Y + 6} Z`);
    k.layer({m: 0.1, k: 1, split: 8, dots: 1.6});
    k.willow({x: 236, y: Y + 2, h: 120, w: 1.12, lean: 0.4});
    k.willow({x: 1392, y: Y + 2, h: 104, w: 1.05, lean: -0.35});
    // la végétation de la berge : des touffes basses et irrégulières, des herbes hautes
    for (const [x0, x1] of [[90, 440], [1240, 1530]]) {
      for (let x = x0; x < x1; x += 30 + r() * 46) {
        if (r() < 0.3) { k.reeds({x, y: Y + 3, w: 16 + r() * 20, h: 10 + r() * 12, n: 10}); continue; }
        k.bush({x, y: Y + 2.5, w: 14 + r() * 40, h: 5 + r() * 9});
      }
    }
    for (const [x, ww, hh] of [[330, 60, 22], [520, 40, 15], [1170, 52, 18], [1488, 72, 24], [40, 50, 20]]) k.reeds({x, y: Y + 3, w: ww, h: hh, n: Math.round(ww / 2.2)});
    const bank = k.done();

    // l'îlot : une pelouse vue d'un peu au-dessus de l'eau, sa berge, un saule qui penche vers l'eau,
    // quelques arbres, l'arche fleurie et les chaises blanches de part et d'autre de l'allée
    const j = scene({w, h, dpr, s, ox, oy, seed: 47, box: [520, 96, 1080, ISLE.isle + 4], dot: [0.7, 1.45]});
    const q = j.rnd;
    const back = (x) => 247 - 11 * Math.sqrt(Math.max(0, 1 - ((x - 800) / 252) ** 2));
    const front = (x) => 247 + 11 * Math.sqrt(Math.max(0, 1 - ((x - 800) / 252) ** 2));
    j.layer({m: 0, k: 1, split: 8, dots: 1.6});
    let berge = 'M548 247 A252 11 0 0 0 1052 247';
    for (let x = 1050; x >= 550; x -= 6) berge += ` L${x} ${(front(x) + 2.4 + q() * 1.6).toFixed(1)}`;
    j.shape(berge + ' Z');
    j.shape('M548 247 A252 11 0 0 1 1052 247 A252 11 0 0 1 548 247 Z');
    j.shape('M548 247 A252 11 0 0 1 1052 247 A252 11 0 0 1 548 247 Z', {mask: 'lit', grad: [236, 258, 0.72, 1]});
    // la pelouse : des nuances, et l'ombre des arbres, portée vers nous
    for (let i = 0; i < 60; i++) { const x = 560 + q() * 480, yy = back(x) + q() * (front(x) - back(x)); j.shadow(x, yy, 8 + q() * 22, 1.2 + q() * 1.6, 0.18 + q() * 0.14); }
    for (const [x, y, rx] of [[646, 250, 34], [600, 253, 15], [964, 249.5, 26], [1014, 253, 15], [800, 243, 10]]) j.shadow(x, y, rx, rx * 0.12 + 1.5, 0.62);
    j.grass({x0: 550, x1: 1050, at: (x) => back(x) + 0.6, h: 3});
    j.willow({x: 652, y: 247, h: 118, w: 1, lean: -0.28});
    j.oak({x: 598, y: 251, h: 56, w: 1.1});
    j.oak({x: 970, y: 246, h: 96, w: 1.05, lean: 0.1});
    j.oak({x: 1019, y: 251, h: 62, w: 0.95});
    j.bush({x: 562, y: 250, w: 20, h: 8});
    j.bush({x: 1040, y: 250, w: 16, h: 7});
    j.grass({x0: 552, x1: 1048, at: (x) => front(x) + 0.4, h: 2.2});
    j.reeds({x: 552, y: 252, w: 20, h: 14, n: 12});
    j.reeds({x: 1048, y: 252, w: 16, h: 12, n: 10});
    j.shape('M785 241 V209 A15 15 0 0 1 815 209 V241', {stroke: 2.6});
    const blot = (x, y, fr) => `M${(x + fr).toFixed(2)} ${y.toFixed(2)} a${fr.toFixed(2)} ${fr.toFixed(2)} 0 1 0 ${(-2 * fr).toFixed(2)} 0 a${fr.toFixed(2)} ${fr.toFixed(2)} 0 1 0 ${(2 * fr).toFixed(2)} 0 `;
    let flowers = '';
    for (let i = 0; i < 34; i++) {
      const a = Math.PI + (i / 33) * Math.PI, rr = 15 + (q() - 0.5) * 3.2;
      flowers += blot(800 + Math.cos(a) * rr, 209 + Math.sin(a) * rr, 0.9 + q() * 1.1);
    }
    for (const side of [785, 815]) for (let y = 212; y < 238; y += 3 + q() * 3) flowers += blot(side + (q() - 0.5) * 3, y, 0.7 + q() * 0.8);
    j.shape(flowers, {mask: 'glow'});
    // trois rangs alignés de part et d'autre de l'allée ; ceux du fond, plus loin, sont plus pâles
    [[244.5, 5.2, 0.5], [248, 5.8, 0.75], [251.5, 6.4, 1]].forEach(([base, ch, alpha], row) => {
      let chairs = '';
      for (let i = 0; i < 8 + row; i++) {
        for (const x of [772 - i * 8.5, 825.2 + i * 8.5]) chairs += `M${x} ${base} v${-ch} h2.8 v${ch} M${x} ${(base - ch * 0.42).toFixed(1)} h2.8 `;
      }
      j.shape(chairs, {mask: 'glow', stroke: 1.1, alpha});
    });
    return {bank, island: j.done(), s, ox, oy, water: oy + Y * s, isleWater: oy + ISLE.isle * s};
  }

  /* La ligne d'arbres de l'autre rive, à l'horizon du haut de page (en px) */
  function treeline({w, h, dpr}) {
    const k = scene({w, h, dpr, seed: 4, dot: [0.55, 1.2]});
    const r = k.rnd;
    k.layer({m: 0.5, k: 0.2, mist: [h, h * 0.45, 0.22], split: 16, dots: 1.1});
    for (let x = -20; x < w + 20; x += 7 + r() * 9) {
      const hh = h * (0.2 + r() * 0.18) * (0.75 + 0.5 * wave(x * 1.3, 2.1, 0.7));
      if (r() < 0.08) k.poplar({x, y: h, h: hh * 1.7, w: 0.9});
      else k.oak({x, y: h, h: hh, w: 1 + r() * 0.5});
    }
    k.layer({m: 0.05, k: 1, split: 9, dots: 1.5});
    // l'autre rive : des bosquets serrés, quelques peupliers et saules, rarement une trouée
    for (let x = -20; x < w + 20;) {
      const v = r();
      if (v < 0.07) { x += 30 + r() * 50; continue; }
      const grove = 2 + (r() * 4 | 0);
      const base = h * (0.32 + r() * 0.28) * (0.8 + 0.4 * wave(x, 0.2, 1.9));
      for (let i = 0; i < grove; i++) {
        const hh = base * (0.75 + r() * 0.4);
        const kind = r();
        if (kind < 0.14) k.poplar({x, y: h, h: Math.min(h * 0.96, hh * 1.9), w: 0.95});
        else if (kind < 0.2) k.willow({x, y: h, h: hh * 1.1, w: 1.1, lean: (r() - 0.5) * 0.6});
        else k.oak({x, y: h, h: hh, w: 1.05 + r() * 0.6, lean: (r() - 0.5) * 0.35});
        x += hh * (0.32 + r() * 0.3);
      }
      x += 6 + r() * 14;
    }
    for (let x = -20; x < w + 20; x += 10 + r() * 12) k.bush({x, y: h, w: 14 + r() * 16, h: h * (0.08 + r() * 0.1)});
    return k.done();
  }

  return {scene, tint, isle, treeline, ISLE};
})();
