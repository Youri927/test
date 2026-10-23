// Le logo : le chevron de toit bordeaux et les quatre lettres grises « NIAN », redessinés à plat d'après le plus grand
// fichier du site actuel (2 166 × 1 178 px), relevés ligne à ligne. Leurs particularités sont gardées : le toit un peu
// décalé vers la gauche, posé sur le N et le I ; le premier N plus haut que les autres lettres ; le A au sommet coupé.
// Repère : 1 958 × 736, origine au coin haut gauche du toit. Le bandeau « CUSTOM HOMES » n'est pas repris dans le dessin :
// la page l'écrit à côté, en texte.
export const VIEW = '0 0 1958 736';
export const ROOF = 'M385 0L793 339H630L395 148L181 339H0Z';
const N1 = 'M158 410H258L519 627V410H635V732H513L275 537V732H158Z';
const I = 'M698 468H816V732H698Z';
const A = 'M1065 468H1224L1430 732H1301L1249 667H1036L987 732H866ZM1140 532L1213 621H1072Z';
const N2 = 'M1501 468H1595L1840 635V468H1958V732H1845L1619 573V732H1501Z';
export const LETTERS = N1 + I + A + N2;
// l'icône : le toit sur le premier N, une maison (793 × 732)
export const ICON_VIEW = '0 0 793 732';
export const ICON_LETTER = N1;
export const MAROON = '#6B1D22';
export const GRAY = '#A9AAA8';
// le logo en SVG autonome, aux couleurs données
export const markSvg = ({roof = MAROON, ink = GRAY, attrs = ''} = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW}"${attrs}><path d="${ROOF}" fill="${roof}"/><path d="${LETTERS}" fill="${ink}" fill-rule="evenodd"/></svg>`;
export const iconSvg = ({roof = MAROON, ink = GRAY, attrs = ''} = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ICON_VIEW}"${attrs}><path d="${ROOF}" fill="${roof}"/><path d="${ICON_LETTER}" fill="${ink}"/></svg>`;
