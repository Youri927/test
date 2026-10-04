/* Les sept formes de bassin, dessinées en plan comme sur une planche d'architecte (repère 800 × 560).
   Chaque plan rend : la terrasse, ce qui passe sous le bassin, la margelle, l'eau, les détails et les légendes. */
window.PoolPlans = (function () {
  'use strict';

  const f = (n) => Math.round(n * 10) / 10;
  const rect = (x, y, w, h, r = 0) => (r
    ? `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
    : `M${x} ${y}H${x + w}V${y + h}H${x}Z`);
  const circle = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}A${r} ${r} 0 1 0 ${f(cx + r)} ${f(cy)}A${r} ${r} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;

  // courbe lisse passant par les points (Catmull-Rom convertie en Bézier)
  function spline(pts, closed = true) {
    const n = pts.length;
    const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return closed ? d + 'Z' : d;
  }

  // arbre en plan, comme au tire-ligne : couronne légèrement irrégulière, festons peu marqués, tronc au centre
  function tree(cx, cy, r) {
    const n = Math.max(9, Math.round(r / 2.4));
    const pts = Array.from({length: n}, (_, i) => {
      const a = (i / n) * Math.PI * 2 + r * 0.7;
      const k = 1 + 0.07 * Math.sin(i * 2.3 + r) + 0.04 * Math.cos(i * 5.1);
      return [cx + r * k * Math.cos(a), cy + r * k * Math.sin(a)];
    });
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % n];
      const rr = Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.62;
      d += `A${f(rr)} ${f(rr)} 0 0 1 ${f(q[0])} ${f(q[1])}`;
    });
    return `${d}Z${circle(cx, cy, Math.max(1.4, r * 0.06))}`;
  }

  // chaise longue vue de dessus
  const lounger = (x, y, w = 22, h = 46) => `${rect(x, y, w, h, 3)}M${x} ${y + h * 0.34}H${x + w}`;

  // parasol vu de dessus : octogone et baleines
  function umbrella(cx, cy, r) {
    const pts = Array.from({length: 8}, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    });
    return `M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}Z` + pts.map((p) => `M${cx} ${cy}L${f(p[0])} ${f(p[1])}`).join('');
  }

  const T = (d, c = 'pl-detail') => ({d, c});

  return {
    // ——— 01 · Débordement : le bord côté vue disparaît, l'eau tombe dans un bac
    infinity: () => ({
      deck: rect(88, 58, 576, 272, 4),
      under: [T(rect(146, 330, 470, 34), 'pl-stone')],
      coping: ['M150 330V150H612V330', rect(470, 104, 102, 102)],
      water: [rect(150, 150, 462, 180), rect(470, 104, 102, 102), rect(150, 340, 462, 16)],
      over: [
        T('M168 150V244M187 150V244M206 150V244M150 244H206', 'pl-detail pl-detail--thin'),
        T('M494 211v10M502 211v10M510 211v10M518 211v10M526 211v10M534 211v10M542 211v10M550 211v10', 'pl-detail pl-detail--thin'),
        T(spline([[64, 398], [250, 410], [420, 402], [600, 416], [736, 406]], false), 'pl-dash'),
        T(spline([[56, 440], [240, 454], [430, 444], [610, 460], [744, 450]], false), 'pl-dash'),
        T(spline([[48, 488], [230, 502], [440, 490], [620, 508], [752, 496]], false), 'pl-dash'),
        T(spline([[40, 536], [226, 550], [446, 538], [630, 556], [760, 544]], false), 'pl-dash'),
        T('M381 392V474M374 464l7 12 7-12', 'pl-detail'),
        T(lounger(232, 74) + lounger(266, 74) + lounger(300, 74), 'pl-detail pl-detail--thin'),
        T(tree(118, 92, 22) + tree(121, 296, 17) + tree(638, 268, 16), 'pl-tree'),
      ],
      labels: [
        {at: [300, 336], to: [226, 400], text: 'Vanishing edge', anchor: 'end'},
        {at: [520, 350], to: [596, 400], text: 'Catch basin', anchor: 'start'},
        {at: [521, 155], to: [640, 120], text: 'Spa', anchor: 'start'},
        {at: [187, 200], to: [112, 200], text: 'Steps', anchor: 'end'},
        {at: [381, 440], to: [392, 440], text: 'View', anchor: 'start', bare: true},
      ],
    }),

    // ——— 02 · Acrylique : une paroi transparente, et un salon en contrebas pour voir sous l'eau
    acrylic: () => ({
      deck: rect(96, 62, 588, 300, 4),
      under: [T(rect(232, 334, 296, 108, 2), 'pl-room')],
      coping: [rect(168, 140, 424, 180)],
      water: [rect(168, 140, 424, 180)],
      over: [
        T(rect(250, 318, 260, 14, 1), 'pl-glass'),
        T('M188 140V214M207 140V214M226 140V214M168 214H226', 'pl-detail pl-detail--thin'),
        T(spline([[262, 420], [300, 404], [380, 398], [460, 404], [498, 420]], false) + spline([[262, 432], [300, 416], [380, 410], [460, 416], [498, 432]], false), 'pl-detail'),
        T('M380 392L292 196M380 392L380 178M380 392L468 196', 'pl-dash'),
        T(lounger(236, 78) + lounger(270, 78) + lounger(304, 78), 'pl-detail pl-detail--thin'),
        T(tree(130, 96, 22) + tree(650, 104, 20) + tree(134, 322, 16) + tree(648, 322, 18), 'pl-tree'),
      ],
      labels: [
        {at: [462, 325], to: [580, 404], text: 'Acrylic panel', anchor: 'start'},
        {at: [380, 392], to: [380, 476], text: 'Underwater view', anchor: 'middle'},
        {at: [207, 178], to: [134, 178], text: 'Steps', anchor: 'end'},
      ],
    }),

    // ——— 03 · Couloir de nage : long, étroit, une ligne d'eau au fond
    lap: () => ({
      deck: rect(68, 168, 664, 212, 4),
      under: [],
      coping: [rect(110, 232, 580, 92)],
      water: [rect(110, 232, 580, 92)],
      over: [
        T('M174 278H628M174 264V292M628 264V292', 'pl-lane'),
        T('M684 270v16M678 278h12M116 270v16M110 278h12', 'pl-detail pl-detail--thin'),
        T('M128 232V324M146 232V324', 'pl-detail pl-detail--thin'),
        T(lounger(262, 176, 22, 42) + lounger(294, 176, 22, 42) + lounger(326, 176, 22, 42) + lounger(358, 176, 22, 42), 'pl-detail pl-detail--thin'),
        T(rect(150, 344, 500, 24, 12), 'pl-detail pl-detail--thin'),
        T(tree(200, 356, 12) + tree(275, 356, 10) + tree(350, 356, 12) + tree(425, 356, 10) + tree(500, 356, 12) + tree(575, 356, 10), 'pl-tree'),
        T(tree(96, 120, 26) + tree(700, 452, 28) + tree(120, 452, 18), 'pl-tree'),
      ],
      labels: [
        {at: [440, 278], to: [440, 130], text: 'Swim lane', anchor: 'middle'},
        {at: [137, 300], to: [137, 424], text: 'Steps', anchor: 'middle'},
        {at: [500, 356], to: [560, 424], text: 'Planting', anchor: 'start'},
      ],
    }),

    // ——— 04 · Classique enterré : rectangle à marches romaines, fondu dans le jardin
    inground: () => {
      const pool = 'M250 170H590V370H250V330A60 60 0 0 1 250 210Z';
      return {
        deck: rect(150, 112, 500, 316, 4),
        under: [],
        coping: [pool],
        water: [pool],
        over: [
          T('M250 210V330M250 226A44 44 0 0 0 250 314M250 242A28 28 0 0 0 250 298', 'pl-detail pl-detail--thin'),
          T(lounger(612, 196, 22, 44) + lounger(612, 254, 22, 44), 'pl-detail pl-detail--thin'),
          T(tree(100, 160, 34) + tree(92, 300, 22) + tree(108, 430, 30) + tree(704, 210, 28) + tree(696, 388, 36) + tree(306, 494, 24) + tree(414, 484, 20) + tree(530, 496, 30) + tree(200, 74, 18) + tree(560, 70, 22), 'pl-tree'),
        ],
        labels: [
          {at: [206, 296], to: [206, 500], text: 'Roman steps', anchor: 'middle'},
          {at: [420, 159], to: [420, 70], text: 'Coping', anchor: 'middle'},
          {at: [696, 388], to: [696, 486], text: 'Planting', anchor: 'middle'},
        ],
      };
    },

    // ——— 05 · Hors-sol : un bassin rond posé, une paroi, une terrasse en bois
    above: () => {
      const cx = 330, cy = 290;
      const boards = Array.from({length: 14}, (_, i) => `M${454 + i * 14} 172V408`).join('');
      return {
        deck: '',
        under: [
          T(circle(cx, cy, 174), 'pl-dash'),
          T(rect(440, 170, 220, 240, 2), 'pl-wood'),
          T(boards, 'pl-detail pl-detail--thin'),
          T(`${rect(566, 410, 76, 42, 1)}M566 424H642M566 438H642`, 'pl-detail pl-detail--thin'),
        ],
        coping: [],
        water: [circle(cx, cy, 140)],
        over: [
          T(`${circle(cx, cy, 152)}${circle(cx, cy, 140)}`, 'pl-wall'),
          T('M458 276H504M458 304H504M466 276V304M481 276V304M496 276V304', 'pl-detail'),
          T(tree(110, 118, 30) + tree(118, 470, 26) + tree(694, 132, 24) + tree(722, 482, 30) + tree(236, 516, 16), 'pl-tree'),
        ],
        labels: [
          {at: [184, 290], to: [104, 290], text: 'Wall', anchor: 'end'},
          {at: [610, 236], to: [700, 236], text: 'Deck', anchor: 'start'},
          {at: [490, 290], to: [560, 118], text: 'Ladder', anchor: 'start'},
        ],
      };
    },

    // ——— 06 · Bassin de trempage : compact, dans une cour, avec banquette
    plunge: () => {
      const pavers = [];
      for (let x = 248; x < 590; x += 38) pavers.push(`M${x} 110V450`);
      for (let y = 148; y < 450; y += 38) pavers.push(`M210 ${y}H590`);
      return {
        deck: rect(210, 110, 380, 340),
        under: [T(pavers.join(''), 'pl-pavers')],
        coping: [rect(310, 190, 180, 128)],
        water: [rect(310, 190, 180, 128)],
        over: [
          T('M196 464V96H604V464H440V450H590V110H210V450H360V464Z', 'pl-wall'),
          T('M360 450V372M360 372A78 78 0 0 1 438 450', 'pl-detail pl-detail--thin'),
          T('M310 210H490', 'pl-detail'),
          T('M468 318A22 22 0 0 1 490 296M450 318A40 40 0 0 1 490 278', 'pl-detail pl-detail--thin'),
          T(lounger(366, 352, 24, 48) + lounger(400, 352, 24, 48), 'pl-detail pl-detail--thin'),
          T(tree(252, 152, 30) + tree(552, 410, 22) + tree(556, 150, 14), 'pl-tree'),
        ],
        labels: [
          {at: [400, 210], to: [400, 64], text: 'Bench seat', anchor: 'middle'},
          {at: [476, 306], to: [664, 306], text: 'Steps', anchor: 'start'},
          {at: [203, 300], to: [116, 300], text: 'Courtyard', anchor: 'end'},
        ],
      };
    },

    // ——— 07 · Sur mesure : forme libre, plage immergée, rochers en cascade, vasque de feu
    custom: () => {
      const pts = [[178, 252], [214, 166], [300, 128], [392, 150], [452, 204], [522, 172], [604, 176], [652, 242], [640, 332], [568, 394], [462, 404], [382, 368], [300, 394], [214, 372], [170, 312]];
      const c = [410, 272];
      const deckPts = pts.map(([x, y], i) => [c[0] + (x - c[0]) * (1.22 + 0.05 * Math.sin(i * 1.7)), c[1] + (y - c[1]) * (1.34 + 0.06 * Math.cos(i * 1.3))]);
      const rock = (p) => `M${p.map((q) => q.join(' ')).join('L')}Z`;
      return {
        deck: spline(deckPts),
        under: [],
        coping: [spline(pts)],
        water: [spline(pts)],
        over: [
          T(spline([[268, 138], [254, 204], [250, 270], [256, 334], [268, 390]], false), 'pl-dash'),
          T(umbrella(212, 228, 22) + umbrella(214, 318, 22), 'pl-detail pl-detail--thin'),
          T(rock([[512, 168], [522, 142], [548, 134], [566, 150], [560, 170], [536, 176]]) + rock([[556, 172], [566, 150], [592, 146], [610, 162], [600, 182], [574, 186]]) + rock([[600, 184], [612, 162], [636, 170], [644, 196], [626, 206], [606, 200]]), 'pl-rock'),
          T('M534 186q5 8 0 16M556 192q5 8 0 16M578 196q5 8 0 16M600 206q5 8 0 16', 'pl-detail pl-detail--thin'),
          T(`${circle(626, 376, 15)}${circle(626, 376, 8)}`, 'pl-wall'),
          T('M626 370v12M620 376h12', 'pl-detail pl-detail--thin'),
          T(tree(92, 106, 26) + tree(712, 132, 26) + tree(84, 474, 30) + tree(746, 510, 24) + tree(410, 516, 20), 'pl-tree'),
        ],
        labels: [
          {at: [213, 273], to: [122, 273], text: 'Baja shelf', anchor: 'end'},
          {at: [552, 156], to: [520, 62], text: 'Rock waterfall', anchor: 'end'},
          {at: [626, 376], to: [690, 446], text: 'Fire bowl', anchor: 'start'},
        ],
      };
    },
  };
})();
