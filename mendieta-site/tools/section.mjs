// Les dessins techniques du site, au trait, d'après la construction courante en Floride.
//
// 1. La coupe de toiture au bord du toit (l'égout) : une ferme en bois posée sur un mur en blocs de béton et son
//    chaînage, la planche de rive et le sous-face ; puis le voligeage (contreplaqué de 5/8 po), l'ancien toit (qui
//    s'en va à l'étape 1), la bavette d'égout et la sous-couche (étape 2, épaissie pour rester visible), et des tuiles
//    plates de 16,5 po posées avec 3 po de recouvrement, du bas vers le haut (étape 3). Pente de 5/12, 1 po = 19 unités.
//    Écrit src/section.svg.
// 2. Trois petites coupes pour les types de toit (tuile, bardeau, toit plat), dans le même dessin.
//    Écrit src/kind-tile.svg, src/kind-shingle.svg, src/kind-flat.svg.
// Les fichiers sont insérés dans la page par build.mjs.
//   node tools/section.mjs
import {writeFileSync} from 'node:fs';

const f = (n) => Math.round(n * 10) / 10;
const pt = ([x, y]) => `${f(x)} ${f(y)}`;
const poly = (pts) => 'M' + pts.map(pt).join(' L') + 'Z';
const line = (pts) => 'M' + pts.map(pt).join(' L');

// un repère de pente : s le long de la pente (vers le faîtage), t perpendiculaire (vers le ciel), à partir de E
const frame = (E, rise, run) => {
  const th = Math.atan2(rise, run), C = Math.cos(th), S = Math.sin(th);
  const P = (s, t) => [E[0] + s * C - t * S, E[1] - s * S - t * C];
  const sAtX = (x, t) => (x - E[0] + t * S) / C;
  return {th, deg: (th * 180) / Math.PI, C, S, P, sAtX, yAt: (x, t) => P(sAtX(x, t), t)[1]};
};
const band = (P, t0, t1, s0, s1) => poly([P(s0, t0), P(s1, t0), P(s1, t1), P(s0, t1)]);
// une rangée de tuiles posées en recouvrement : chacune repose en tête sur la sous-couche et en pied sur la tête de la
// précédente, d'où une pente un peu plus forte que celle du toit ; le nez est arrondi
const courses = (P, {base, len, expo, over, thick, nose, end}) => {
  const out = [];
  for (let i = 0; ; i++) {
    const s0 = over + i * expo;
    if (s0 > end - expo * 0.2) break;
    const s1 = Math.min(s0 + len, end);
    const lift = (s) => thick * (1 - (s - s0) / len);
    const a = P(s0, base + lift(s0)), b = P(s1, base + lift(s1));
    const c = P(s1, base + lift(s1) + thick), d = P(s0, base + lift(s0) + thick);
    const n = P(s0 - nose, base + lift(s0) + thick * 0.5);
    out.push(`M${pt(a)} L${pt(b)} L${pt(c)} L${pt(d)} Q${pt(n)} ${pt(a)}Z`);
  }
  return out;
};
const zig = (P, C, S, s, t0, t1, w = 7) => {
  const a = P(s, t0), b = P(s, t1), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return line([a, [m[0] + w * C, m[1] - w * S], [m[0] - w * C, m[1] + w * S], b]);
};
const write = (name, svg) => writeFileSync(new URL(`../src/${name}`, import.meta.url), svg);

/* ———————————————— 1. la grande coupe ———————————————— */
{
  const K = 19;
  const E = [300, 420]; // coin extérieur haut de la planche de rive : le bas du toit
  const {deg, C, S, P, sAtX, yAt} = frame(E, 5, 12);
  const L = sAtX(936, 0); // longueur dessinée le long de la pente, jusqu'à la coupure
  const DECK = 0.625 * K, UND = 4, TILE = 0.75 * K;
  const T_UND = DECK, T_TILE = DECK + UND, CHORD = 3.5 * K;

  // la structure
  const fx0 = E[0], fx1 = E[0] + 0.75 * K, fBottom = E[1] + 5.5 * K; // planche de rive de 3/4 po × 5,5 po
  const fascia = poly([[fx0, E[1]], [fx1, yAt(fx1, 0)], [fx1, fBottom], [fx0, fBottom]]);
  const wallX = fx1 + 20 * K; // débord de 20 po
  const STUCCO = 0.75 * K, BLOCK = 8 * K;
  const chord = poly([[fx1, yAt(fx1, 0)], P(L, 0), P(L, -CHORD), [fx1, yAt(fx1, -CHORD)]]); // membrure supérieure
  const heelX = wallX + 0.5 * K; // la membrure inférieure rejoint la supérieure au talon, au-dessus du mur
  const bcTop = yAt(heelX, -CHORD), bcBottom = bcTop + 3.5 * K, xEnd = P(L, -CHORD)[0];
  const bottomChord = poly([[heelX, bcTop], [xEnd, bcTop], [xEnd, bcBottom], [heelX, bcBottom]]);
  const wallTop = bcBottom, beamBottom = wallTop + 8 * K, wallBottom = 600;
  const stucco = poly([[wallX - STUCCO, wallTop], [wallX, wallTop], [wallX, wallBottom], [wallX - STUCCO, wallBottom]]);
  const beam = poly([[wallX, wallTop], [wallX + BLOCK, wallTop], [wallX + BLOCK, beamBottom], [wallX, beamBottom]]);
  const block = poly([[wallX, beamBottom], [wallX + BLOCK, beamBottom], [wallX + BLOCK, wallBottom], [wallX, wallBottom]]);
  const soffit = poly([[fx1, fBottom - 0.5 * K], [wallX - STUCCO, fBottom - 0.5 * K], [wallX - STUCCO, fBottom], [fx1, fBottom]]);

  // les couches
  const deck = band(P, 0, DECK, 0, L);
  const under = band(P, T_UND, T_UND + UND, 0, L);
  const d0 = P(2 * K, DECK), d1 = P(0, DECK), d2 = [d1[0] - 3, d1[1] + 4];
  const drip = line([d0, d1, d2, [d2[0], d2[1] + 1.4 * K], [d2[0] + 5, d2[1] + 1.4 * K + 4]]);
  const LEN = 16.5 * K, EXPO = 13.5 * K, OVER = -1.5 * K;
  const tiles = courses(P, {base: T_TILE, len: LEN, expo: EXPO, over: OVER, thick: TILE, nose: 0.35 * K, end: L});
  const closure = band(P, T_TILE, T_TILE + TILE - 1, OVER + 1.4 * K, OVER + 3.6 * K);
  // l'ancien toit : sa sous-couche et ses tuiles, usées, en pointillé ; elles s'en vont à l'étape 1
  const oldUnder = band(P, T_UND, T_UND + UND, 0, L);
  const oldTiles = courses(P, {base: T_TILE, len: LEN, expo: EXPO, over: OVER + 0.8 * K, thick: TILE, nose: 0.3 * K, end: L});
  const brk = zig(P, C, S, L, -CHORD - 8, T_TILE + TILE * 2 + 10);

  // les étiquettes, à gauche de l'égout, chacune apparaît avec sa couche
  const LABELS = [
    {layer: 'tile', text: 'Tile', at: P(OVER + 2.2 * K, T_TILE + TILE * 1.6), y: 300},
    {layer: 'under', text: 'Underlayment', at: P(0.6 * K, T_UND + UND / 2), y: 346},
    {layer: 'deck', text: 'Wood deck', at: P(1.6 * K, DECK / 2), y: 392},
    {layer: 'drip', text: 'Drip edge', at: [d2[0], d2[1] + 0.7 * K], y: 438},
  ];
  const LX = 196; // bout droit des mots
  const labels = LABELS.map(({layer, text, at, y}) => {
    const knee = [LX + 14, y - 5];
    return `<g class="xs__lab" data-layer="${layer}"><path d="M${pt(knee)} L${f(Math.min(at[0] - 26, LX + 46))} ${f(y - 5)} L${pt(at)}"/><circle cx="${f(at[0])}" cy="${f(at[1])}" r="3"/><text x="${LX}" y="${y}" text-anchor="end">${text}</text></g>`;
  });

  const svg = `<svg class="xs" viewBox="84 108 880 492" role="img" aria-labelledby="xs-t" focusable="false" data-len="${f(L + 20)}">
<title id="xs-t">Cross-section of a tile roof at the eave. The old roof comes off down to the wood deck, underlayment and a drip edge go on, then the tiles are set course by course from the bottom edge up.</title>
<defs>
<pattern id="h-wood" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(${f(45 - deg)})"><path d="M0 0V8" class="xs__h"/></pattern>
<pattern id="h-block" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V10" class="xs__h"/></pattern>
<pattern id="h-conc" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="4" cy="5" r="1.1" class="xs__dot"/><circle cx="13" cy="12" r="1.4" class="xs__dot"/><path d="M11 2l2.4 3.6h-4.8z" class="xs__dot"/><path d="M3 13l2 3h-4z" class="xs__dot"/></pattern>
<clipPath id="cp-under"><rect class="xs__clip" data-clip="under" x="${f(E[0] - 12)}" y="${f(E[1] - 80)}" width="0" height="120" transform="rotate(${f(-deg)} ${f(E[0])} ${f(E[1])})"/></clipPath>
</defs>
<g class="xs__struct">
<path class="xs__pat" d="${block}" fill="url(#h-block)"/><path class="xs__pat" d="${beam}" fill="url(#h-conc)"/>
<path d="${block}"/><path d="${beam}"/><path d="${stucco}"/>
<path d="${bottomChord}"/><path d="${chord}"/>
<path d="${soffit}"/><path d="${fascia}"/>
</g>
<g class="xs__deck"><path class="xs__fill" d="${deck}"/><path class="xs__pat" d="${deck}" fill="url(#h-wood)"/><path class="xs__edge" d="${deck}"/></g>
<g class="xs__old"><path class="xs__old-u" d="${oldUnder}"/>
${oldTiles.map((d) => `<path d="${d}"/>`).join('\n')}
</g>
<path class="xs__drip" d="${drip}"/>
<g class="xs__under" clip-path="url(#cp-under)"><path d="${under}"/></g>
<g class="xs__tiles"><path class="xs__closure" d="${closure}"/>
${tiles.map((d, i) => `<path class="xs__tile" style="--i:${i}" d="${d}"/>`).join('\n')}
</g>
<path class="xs__break" d="${brk}"/>
<g class="xs__labels">
${labels.join('\n')}
</g>
</svg>
`;
  write('section.svg', svg);
  console.log(`src/section.svg : ${tiles.length} tuiles, ${svg.length} octets`);
}

/* ———————————————— 2. les petites coupes des types de toit ———————————————— */
{
  const mini = (name, body) =>
    write(`kind-${name}.svg`, `<svg class="kind__sw" viewBox="0 0 240 92" aria-hidden="true" focusable="false">${body}</svg>\n`);
  const wood = (id, deg) => `<defs><pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(${f(45 - deg)})"><path d="M0 0V5" class="kind__h"/></pattern></defs>`;

  // tuile : voligeage, sous-couche, tuiles épaisses en recouvrement
  {
    const {deg, C, S, P, sAtX} = frame([18, 80], 5, 12);
    const end = sAtX(226, 0), DECK = 5, UND = 2.4, TILE = 6.5;
    const deck = band(P, 0, DECK, 0, end);
    const t = courses(P, {base: DECK + UND, len: 86, expo: 70, over: -6, thick: TILE, nose: 2.4, end});
    mini('tile', `${wood('kw-t', deg)}<path class="kind__pat" d="${deck}" fill="url(#kw-t)"/><path d="${deck}"/><path class="kind__u" d="${band(P, DECK, DECK + UND, 0, end)}"/>${t.map((d) => `<path class="kind__c" d="${d}"/>`).join('')}<path d="${zig(P, C, S, end, -2, DECK + UND + TILE * 2 + 4, 4)}"/>`);
  }
  // bardeau : voligeage, sous-couche, bardeaux fins posés serrés (exposition de 5 5/8 po pour 12 po de long)
  {
    const {deg, C, S, P, sAtX} = frame([18, 80], 5, 12);
    const end = sAtX(226, 0), DECK = 5, UND = 2.4, SH = 2.6;
    const deck = band(P, 0, DECK, 0, end);
    const t = courses(P, {base: DECK + UND, len: 56, expo: 26, over: -3, thick: SH, nose: 0.8, end});
    mini('shingle', `${wood('kw-s', deg)}<path class="kind__pat" d="${deck}" fill="url(#kw-s)"/><path d="${deck}"/><path class="kind__u" d="${band(P, DECK, DECK + UND, 0, end)}"/>${t.map((d) => `<path class="kind__c" d="${d}"/>`).join('')}<path d="${zig(P, C, S, end, -2, DECK + UND + SH * 3 + 4, 4)}"/>`);
  }
  // toit plat : le voligeage presque à plat, la mousse projetée qui enveloppe le bord, et son revêtement
  {
    const {deg, P, sAtX} = frame([30, 66], 0.25, 12);
    const end = sAtX(232, 0), DECK = 5, FOAM = 13;
    const deck = band(P, 0, DECK, 0, end);
    const a = P(0, DECK), b = P(end, DECK), c = P(end, DECK + FOAM), d = P(14, DECK + FOAM);
    const foam = `M${pt(b)} L${pt(c)} L${pt(d)} Q${pt(P(-4, DECK + FOAM))} ${pt(P(-5, DECK + 2))} Q${pt(P(-5, 0))} ${pt(P(-1, -3))} L${pt(a)}Z`;
    const coat = `M${pt(c)} L${pt(d)} Q${pt(P(-4, DECK + FOAM))} ${pt(P(-5, DECK + 2))}`;
    mini('flat', `${wood('kw-f', deg)}<path class="kind__pat" d="${deck}" fill="url(#kw-f)"/><path d="${deck}"/><path class="kind__c kind__foam" d="${foam}"/><path class="kind__coat" d="${coat}"/>`);
  }
  console.log('src/kind-*.svg : 3 petites coupes');
}
