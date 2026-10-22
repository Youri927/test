// Le logo : leur monogramme, redessiné à plat d'après le fichier du site actuel (230 × 208 px). Un crochet orange,
// ouvert à droite, et deux « B » noirs très gras, aux contre-formes rectangulaires, aux angles droits coupés et à la
// taille pincée ; le second B sort du crochet. Repère sur 230 × 208, mesuré sur l'original.
export const FRAME = 'M0 0H200V45H179V21H21V187H179V163H200V208H0Z';
const b = (x) =>
  `M${x} 57H${x + 74}L${x + 85} 68V96L${x + 77} 104L${x + 85} 112V140L${x + 74} 151H${x}Z` +
  `M${x + 19} 75V95H${x + 66}V75Z` +
  `M${x + 19} 113V132H${x + 66}V113Z`;
export const LETTERS = b(39) + b(137);
export const ORANGE = '#EA8A12';
// le logo en SVG autonome, aux couleurs données
export const markSvg = ({frame = ORANGE, ink = '#191A1B', attrs = ''} = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 208"${attrs}><path d="${FRAME}" fill="${frame}"/><path d="${LETTERS}" fill="${ink}" fill-rule="evenodd"/></svg>`;
