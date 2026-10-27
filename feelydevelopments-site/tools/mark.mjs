// Le logo : « FEELY » en lettres très larges, redessiné à plat d'après le seul fichier du site actuel (IMG_9102.jpeg,
// 1 320 × 277 px, la photo d'un logo imprimé, d'où son flou). Relevé ligne à ligne, au demi-pixel : les fûts (19,5) sont
// plus épais que les barres (16,7), les angles extérieurs sont arrondis, les barres du haut et du bas du F et des E se
// recourbent un peu à leur bout, et la barre du milieu de chaque E traverse le fût pour dépasser à gauche. Le pied du L
// vient buter contre le bras gauche du Y. Les légères courbures des barres du fichier (un défaut de la photo) ne sont pas
// reprises. Repère : 1 070 × 133,5, origine au coin haut gauche du F.
const X0 = 133.1;
const Y0 = 88.6;
const T = 88.6;
const B = 222.1;
const WV = 19.5; // fût
const WH = 16.7; // barre
const RO = 28; // angle extérieur
const RI = 16; // angle intérieur
const MT = 147.3; // barre du milieu, haut
const MB = MT + WH;
const CURL = 64; // longueur de la courbe au bout des barres
const DROP = 9; // et sa flèche

const n = (v) => +(v - 0).toFixed(1);
const p = (x, y) => `${n(x - X0)} ${n(y - Y0)}`;

// le bout recourbé d'une barre du haut (vers le bas) ou du bas (vers le haut), de gauche à droite puis retour
const topEnd = (xe) =>
  `L${p(xe - CURL, T)}Q${p(xe - CURL / 2, T)} ${p(xe, T + DROP)}L${p(xe, T + WH + DROP)}Q${p(xe - CURL / 2, T + WH)} ${p(xe - CURL, T + WH)}`;
const bottomEnd = (xe) =>
  `L${p(xe - CURL, B - WH)}Q${p(xe - CURL / 2, B - WH)} ${p(xe, B - WH - DROP)}L${p(xe, B - DROP)}Q${p(xe - CURL / 2, B)} ${p(xe - CURL, B)}`;
const arc = (r, sweep, x, y) => `A${r} ${r} 0 0 ${sweep} ${p(x, y)}`;

const F = (x0, xm, xe) =>
  `M${p(x0, B)}L${p(x0, T + RO)}${arc(RO, 1, x0 + RO, T)}${topEnd(xe)}L${p(x0 + WV + RI, T + WH)}${arc(RI, 0, x0 + WV, T + WH + RI)}` +
  `L${p(x0 + WV, MT)}L${p(xm, MT)}L${p(xm, MB)}L${p(x0 + WV, MB)}L${p(x0 + WV, B)}Z`;

const E = (x0, xl, xm, xe) =>
  `M${p(x0 + RO, T)}${topEnd(xe)}L${p(x0 + WV + RI, T + WH)}${arc(RI, 0, x0 + WV, T + WH + RI)}` +
  `L${p(x0 + WV, MT)}L${p(xm, MT)}L${p(xm, MB)}L${p(x0 + WV, MB)}L${p(x0 + WV, B - WH - RI)}${arc(RI, 0, x0 + WV + RI, B - WH)}` +
  `${bottomEnd(xe)}L${p(x0 + RO, B)}${arc(RO, 1, x0, B - RO)}L${p(x0, MB)}L${p(xl, MB)}L${p(xl, MT)}L${p(x0, MT)}L${p(x0, T + RO)}` +
  `${arc(RO, 1, x0 + RO, T)}Z`;

const L = (x0, xe) =>
  `M${p(x0, T)}L${p(x0 + WV, T)}L${p(x0 + WV, B - WH - RI)}${arc(RI, 0, x0 + WV + RI, B - WH)}L${p(xe, B - WH)}L${p(xe, B)}` +
  `L${p(x0 + RO, B)}${arc(RO, 1, x0, B - RO)}Z`;

// le Y : un U aux angles du bas arrondis, et une queue plus fine (17,1) au milieu
const Y = (xa, xb, xs0, xs1, jb) => {
  const jt = jb - WH;
  return (
    `M${p(xa, T)}L${p(xa + WV, T)}L${p(xa + WV, jt - RI)}${arc(RI, 0, xa + WV + RI, jt)}L${p(xb - WV - RI, jt)}` +
    `${arc(RI, 0, xb - WV, jt - RI)}L${p(xb - WV, T)}L${p(xb, T)}L${p(xb, jb - RO)}${arc(RO, 1, xb - RO, jb)}L${p(xs1, jb)}` +
    `L${p(xs1, B)}L${p(xs0, B)}L${p(xs0, jb)}L${p(xa + RO, jb)}${arc(RO, 1, xa, jb - RO)}Z`
  );
};

export const VIEW = '0 0 1070 133.5';
export const LETTERS =
  F(133.1, 287.6, 322.6) + E(385.8, 334.4, 540.4, 575.9) + E(637.6, 586.8, 792.1, 827.9) + L(874.2, 1010.4) + Y(1010.4, 1203, 1098.5, 1115.6, 165.8);
// l'icône : le premier E seul, avec sa barre qui dépasse (242 × 133,5, centré dans un carré)
export const ICON_VIEW = '-34 -88 296 296';
const ICON_SHIFT = 334.4 - X0; // le E commence à la barre du milieu
export const ICON = E(385.8 - ICON_SHIFT, 334.4 - ICON_SHIFT, 540.4 - ICON_SHIFT, 575.9 - ICON_SHIFT);
export const GREY = '#818181'; // le gris de leur logo
export const markSvg = ({ink = 'currentColor', attrs = ''} = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW}"${attrs}><path d="${LETTERS}" fill="${ink}"/></svg>`;
export const iconSvg = ({ink = 'currentColor', attrs = ''} = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ICON_VIEW}"${attrs}><path d="${ICON}" fill="${ink}"/></svg>`;
