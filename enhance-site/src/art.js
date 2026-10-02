/* Enhance® : dessins au trait (calques du visage, glyphes des spécialités).
   Tout est généré en SVG, sans image : net à toutes les tailles, léger, animable. */
(function () {
  'use strict';

  // Ovale du visage, vue de face (viewBox 400 × 500, axe médian x = 200)
  const FACE = 'M200 16C281 16 347 70 356 160C364 228 358 280 346 322C334 370 308 416 270 448C246 468 224 480 200 482C176 480 154 468 130 448C92 416 66 370 54 322C42 280 36 228 44 160C53 70 119 16 200 16Z';
  // Repères : tiers du visage (lisière, glabelle, sous-nasal, menton)
  const THIRDS = [16, 168, 322, 482];
  // demi-largeur de l'ovale sur les lignes des tiers (mesurée sur le tracé)
  const THIRD_HALF = {168: 152, 322: 140};
  const EYES = [[140, 206], [260, 206]];
  const MOUTH = [200, 366];

  const mirror = (pts) => pts.map(([x, y]) => [400 - x, y]);
  const r = (n) => Math.round(n * 10) / 10;


  const defs = (id, inner) => `<defs><clipPath id="${id}-clip"><path d="${FACE}"/></clipPath>${inner || ''}</defs>`;

  /* ——— 01 Surface : la peau, et les marques du chirurgien ——— */
  const surface = (id) => {
    const marks = [];
    // axe médian
    marks.push(`<path class="mk mk--dash" d="M200 30V470"/>`);
    // tiers du visage, bornés par l'ovale
    THIRDS.slice(1, 3).forEach((y) => {
      const w = THIRD_HALF[y] - 10;
      marks.push(`<path class="mk mk--dash" d="M${r(200 - w)} ${y}H${r(200 + w)}"/>`);
      marks.push(`<path class="mk" d="M${r(200 - w)} ${y - 5}v10M${r(200 + w)} ${y - 5}v10"/>`);
    });
    // contour de la mâchoire (la « V-line »)
    marks.push(`<path class="mk mk--dash" d="M76 300C88 372 122 424 168 452C180 459 190 462 200 462C210 462 220 459 232 452C278 424 312 372 324 300"/>`);
    // points de repère : yeux, pointe du nez, commissures
    [...EYES, [200, 300], [168, 366], [232, 366]].forEach(([x, y]) => {
      marks.push(`<path class="mk" d="M${x - 5} ${y}h10M${x} ${y - 5}v10"/>`);
    });
    return `<svg viewBox="0 0 400 500" aria-hidden="true">${defs(id, `
      <radialGradient id="${id}-skin" cx=".46" cy=".36" r=".78">
        <stop offset="0" stop-color="#FFFDFB"/><stop offset=".55" stop-color="#F6EEE7"/><stop offset="1" stop-color="#E8D9CE"/>
      </radialGradient>
      <radialGradient id="${id}-sheen" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>`)}
      <path d="${FACE}" fill="url(#${id}-skin)"/>
      <g clip-path="url(#${id}-clip)"><ellipse class="sheen" cx="150" cy="150" rx="150" ry="120" fill="url(#${id}-sheen)"/></g>
      <path class="edge" d="${FACE}"/>
      <mask id="${id}-reveal" maskUnits="userSpaceOnUse" x="-20" y="-20" width="440" height="540">${marks.map((m, i) => m.replace(/class="[^"]*"/, `class="mk-reveal" pathLength="1" style="transition-delay:${(0.15 + i * 0.09).toFixed(2)}s"`)).join('')}</mask>
      <g class="marks" mask="url(#${id}-reveal)">${marks.join('')}</g>
    </svg>`;
  };

  /* ——— 02 Volume : les compartiments de graisse ——— */
  const volume = (id) => {
    const pads = [
      [200, 92, 112, 44], [80, 166, 32, 54], [140, 240, 42, 12], [118, 278, 60, 42],
      [150, 342, 24, 40], [200, 368, 38, 15], [100, 396, 40, 32], [200, 440, 46, 24],
    ];
    const all = pads.flatMap((p) => (p[0] === 200 ? [p] : [p, [400 - p[0], p[1], p[2], p[3]]]));
    return `<svg viewBox="0 0 400 500" aria-hidden="true">${defs(id, `
      <radialGradient id="${id}-pad"><stop offset="0" stop-color="#E2B49C" stop-opacity=".9"/><stop offset=".6" stop-color="#E8C3AF" stop-opacity=".45"/><stop offset="1" stop-color="#EBCBB9" stop-opacity="0"/></radialGradient>`)}
      <path class="fill" d="${FACE}" fill="#F3E7DE"/>
      <g clip-path="url(#${id}-clip)">${all.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id}-pad)"/>`).join('')}</g>
      <path class="edge" d="${FACE}"/>
    </svg>`;
  };

  /* ——— 03 Motion : les muscles de l'expression ——— */
  const motion = (id) => {
    const l = [];
    // frontal : fibres verticales, en éventail
    for (let x = 108; x <= 292; x += 8) {
      const k = (x - 200) / 92;
      l.push(`M${x} ${r(40 + Math.abs(k) * 26)}C${r(x + k * 6)} 90 ${r(x + k * 4)} 130 ${r(x + k * 2)} 160`);
    }
    // orbiculaires des yeux et de la bouche
    EYES.forEach(([cx, cy]) => [46, 38, 30, 22].forEach((rx, i) => l.push(ellipse(cx, cy, rx, [28, 23, 18, 13][i]))));
    [58, 48, 38].forEach((rx, i) => l.push(ellipse(MOUTH[0], MOUTH[1], rx, [27, 21, 15][i])));
    // zygomatiques : de la pommette à la commissure
    for (let i = 0; i < 4; i++) {
      const a = [[96 + i * 7, 248 + i * 3], [150 + i * 5, 352 + i * 2]];
      l.push(`M${a[0][0]} ${a[0][1]}L${a[1][0]} ${a[1][1]}`);
      const b = mirror(a);
      l.push(`M${b[0][0]} ${b[0][1]}L${b[1][0]} ${b[1][1]}`);
    }
    // masséters : le muscle que cible le BOTOX® de la mâchoire
    const mass = [];
    for (let i = 0; i < 7; i++) {
      const a = [[66 + i * 7, 282 + i * 2], [86 + i * 8, 404 - i * 4]];
      mass.push(`M${a[0][0]} ${a[0][1]}C${a[0][0] + 4} 330 ${a[1][0] - 6} 370 ${a[1][0]} ${a[1][1]}`);
      const b = mirror(a);
      mass.push(`M${b[0][0]} ${b[0][1]}C${b[0][0] - 4} 330 ${b[1][0] + 6} 370 ${b[1][0]} ${b[1][1]}`);
    }
    return `<svg viewBox="0 0 400 500" aria-hidden="true">${defs(id)}
      <path class="fill" d="${FACE}" fill="#F1E0DA"/>
      <g clip-path="url(#${id}-clip)">
        <path class="fiber" d="${l.join('')}"/>
        <path class="fiber fiber--mass" d="${mass.join('')}"/>
      </g>
      <path class="edge" d="${FACE}"/>
    </svg>`;
  };

  /* ——— 04 Support : le réseau de soutien, les ligaments, les vecteurs de lifting ——— */
  const support = (id) => {
    const mesh = [];
    const tan = Math.tan((34 * Math.PI) / 180);
    for (let c = -520; c <= 520; c += 15) {
      mesh.push(`M${c} 0L${r(c + 500 * tan)} 500`);
      mesh.push(`M${400 - c} 0L${r(400 - c - 500 * tan)} 500`);
    }
    const ligs = [[124, 188], [104, 252], [86, 344], [126, 432]].flatMap((p) => [p, [400 - p[0], p[1]]]);
    const vec = (x1, y1, x2, y2) => {
      const a = Math.atan2(y2 - y1, x2 - x1);
      const h = (s) => `${r(x2 - 9 * Math.cos(a + s))} ${r(y2 - 9 * Math.sin(a + s))}`;
      return `M${x1} ${y1}L${x2} ${y2}M${h(0.45)}L${x2} ${y2}L${h(-0.45)}`;
    };
    const vectors = [vec(118, 352, 84, 262), vec(282, 352, 316, 262), vec(150, 420, 118, 362), vec(250, 420, 282, 362), vec(170, 120, 160, 72), vec(230, 120, 240, 72)];
    return `<svg viewBox="0 0 400 500" aria-hidden="true">${defs(id)}
      <path class="fill" d="${FACE}" fill="#ECE4E1"/>
      <g clip-path="url(#${id}-clip)"><path class="mesh" d="${mesh.join('')}"/></g>
      ${ligs.map(([x, y]) => `<circle class="lig" cx="${x}" cy="${y}" r="3.2"/>`).join('')}
      <path class="mk vec" d="${vectors.join('')}"/>
      <path class="edge" d="${FACE}"/>
    </svg>`;
  };

  /* ——— 05 Structure : cartilage et os, en courbes de niveau ——— */
  const structure = (id) => {
    const rings = [0.9, 0.79, 0.68, 0.57].map((k) => `<path class="topo" d="${FACE}" transform="translate(200 250) scale(${k} ${k * 0.97}) translate(-200 -250)"/>`);
    const orbits = EYES.map(([cx, cy]) => [44, 35, 26].map((rx, i) => `<path class="topo" d="${ellipse(cx, cy + 2, rx, [33, 26, 19][i])}"/>`).join('')).join('');
    const nose = `<path class="topo" d="M200 262C214 270 226 294 222 318C219 332 208 338 200 334C192 338 181 332 178 318C174 294 186 270 200 262Z"/><path class="topo" d="M194 206L190 258M206 206L210 258"/>`;
    const arches = `<path class="topo" d="M96 236C82 236 62 246 50 262M304 236C318 236 338 246 350 262"/>`;
    const jaw = `<path class="topo" d="M68 300C80 376 118 430 166 458C178 465 190 468 200 468C210 468 222 465 234 458C282 430 320 376 332 300"/>`;
    const reduce = `<path class="mk mk--dash" d="M58 318C66 362 82 396 104 420M342 318C334 362 318 396 296 420M88 244C78 250 70 260 64 272M312 244C322 250 330 260 336 272"/>`;
    return `<svg viewBox="0 0 400 500" aria-hidden="true">${defs(id)}
      <path class="fill" d="${FACE}" fill="#E8DFD2"/>
      <g clip-path="url(#${id}-clip)">${rings.join('')}${orbits}${nose}${arches}${jaw}</g>
      ${reduce}
      <path class="edge" d="${FACE}"/>
    </svg>`;
  };

  function ellipse(cx, cy, rx, ry) {
    return `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
  }

  const PLANES = [surface, volume, motion, support, structure];

  /* ——— Glyphes des spécialités (viewBox 400 × 300) ——— */
  const GLYPHS = {
    // la mâchoire : contour du bas du visage, ligne de réduction, fibres du masséter
    jaw: `<svg viewBox="0 0 400 300" aria-hidden="true">
      <path class="g-line" d="M58 26C58 120 96 214 200 262C304 214 342 120 342 26"/>
      <path class="g-line g-thin" d="M150 270C170 279 186 283 200 283C214 283 230 279 250 270"/>
      <path class="g-mark g-dash" d="M86 58C94 146 128 206 200 236C272 206 306 146 314 58"/>
      <path class="g-line g-thin" d="M70 70C78 110 86 150 102 182M80 66C88 108 96 146 112 178M90 62C98 104 106 142 122 174M100 60C108 100 116 138 132 170"/>
      <path class="g-mark" d="M60 196l22-12M82 184l-4 10M82 184l-10 -2M340 196l-22-12M318 184l4 10M318 184l10 -2"/>
    </svg>`,
    // l'œil : paupières, iris, et le pli dessiné au marqueur
    eye: `<svg viewBox="0 0 400 300" aria-hidden="true">
      <path class="g-line" d="M44 168C108 92 292 92 356 168"/>
      <path class="g-line" d="M44 168C112 220 288 220 356 168"/>
      <circle class="g-line" cx="200" cy="158" r="50"/>
      <circle class="g-line g-thin" cx="200" cy="158" r="20"/>
      <path class="g-mark g-dash" d="M70 126C128 64 272 60 332 122"/>
      <path class="g-line g-thin" d="M62 64C140 26 262 26 340 58"/>
    </svg>`,
    // le nez de profil, et l'air qui le traverse
    nose: `<svg viewBox="0 0 400 300" aria-hidden="true">
      <path class="g-line" d="M146 8C150 30 156 46 160 58C172 106 196 162 230 200C244 216 250 234 240 246C230 258 210 258 196 252C188 249 182 251 178 258C175 266 177 278 186 290"/>
      <path class="g-line g-thin" d="M216 238C208 226 190 224 182 236C178 244 184 251 194 252"/>
      <path class="g-mark g-dot" d="M276 292C248 280 222 266 204 250C190 230 186 194 170 136"/>
      <path class="g-mark g-dot" d="M290 276C262 266 236 254 218 240C204 222 200 188 186 134"/>
    </svg>`,
    // le lifting endoscopique : petites incisions à la lisière, vecteur de lifting
    lift: `<svg viewBox="0 0 400 300" aria-hidden="true">
      <path class="g-line" d="${FACE}" transform="translate(80 4) scale(.6)" vector-effect="non-scaling-stroke"/>
      <path class="g-mark g-dash" d="M128 72C148 42 174 30 200 30C226 30 252 42 272 72"/>
      <circle class="g-mark" cx="138" cy="58" r="5"/><circle class="g-mark" cx="200" cy="30" r="5"/><circle class="g-mark" cx="262" cy="58" r="5"/>
      <path class="g-mark" d="M154 214C136 194 130 166 134 136M134 136l-9 11M134 136l11 7M246 214C264 194 270 166 266 136M266 136l9 11M266 136l-11 7"/>
    </svg>`,
  };

  // silhouette du corps, très abstraite : deux courbes, la taille et les hanches
  GLYPHS.contour = `<svg viewBox="0 0 400 300" aria-hidden="true">
      <path class="g-line" d="M146 4C152 56 174 104 170 146C166 192 124 236 122 296"/>
      <path class="g-line" d="M254 4C248 56 226 104 230 146C234 192 276 236 278 296"/>
      <path class="g-mark g-dash" d="M150 112C142 136 142 160 152 184M250 112C258 136 258 160 248 184M128 226C122 248 122 268 126 290M272 226C278 248 278 268 274 290"/>
    </svg>`;

  // les pommettes : arcs de remodelage sur le zygoma
  GLYPHS.cheek = `<svg viewBox="0 0 400 300" aria-hidden="true">
      <path class="g-line" d="${FACE}" transform="translate(80 4) scale(.6)" vector-effect="non-scaling-stroke"/>
      <path class="g-line g-thin" d="M140 128C150 122 164 122 172 128M228 128C236 122 250 122 260 128"/>
      <path class="g-mark g-dash" d="M114 118C104 140 106 164 120 182M286 118C296 140 294 164 280 182"/>
      <path class="g-mark" d="M92 150h16M102 144l6 6-6 6M308 150h-16M298 144l-6 6 6 6"/>
    </svg>`;
  // le menton de profil, et sa projection
  GLYPHS.chin = `<svg viewBox="0 0 400 300" aria-hidden="true">
      <path class="g-line" d="M176 8C182 30 196 46 212 56C220 62 216 74 206 78C214 84 216 96 206 104C196 112 188 124 192 152C196 184 192 206 172 216C146 228 112 232 76 250"/>
      <path class="g-mark g-dash" d="M192 146C214 168 218 200 190 220"/>
      <path class="g-mark" d="M212 186h22M226 180l8 6-8 6"/>
    </svg>`;

  window.EnhanceArt = {
    FACE,
    plane: (i, id) => PLANES[i](id),
    glyph: (name) => GLYPHS[name],
  };
})();
