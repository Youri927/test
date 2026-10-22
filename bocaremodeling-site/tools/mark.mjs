// Le logo : leurs deux toits, redessinés à plat d'après le logo de l'entreprise (un grand toit avec sa fenêtre
// cintrée, une cheminée, un petit toit derrière). Repère sur 64 × 40. Le petit toit et la cheminée passent derrière
// le grand : un masque les en sépare d'un filet de 1,7.
export const ROOF_BIG = 'M2 30 26 7l24 23h-7.2L26 13.9 9.2 30z';
export const ROOF_SMALL = 'M33.5 30 46 18l12.5 12h-6.1L46 23.9 39.6 30z';
export const CHIMNEY = 'M37 9h4.6v8.6L37 13.2z';
export const DOOR = 'M22.2 30v-7.3a3.8 3.8 0 0 1 7.6 0V30z';
export const gapMask = (id) =>
  `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="40"><rect width="64" height="40" fill="#fff"/><path d="${ROOF_BIG}" fill="#000" stroke="#000" stroke-width="3.4" stroke-linejoin="round"/></mask>`;
// le logo en SVG autonome, aux couleurs données
export const markSvg = ({roof = '#1BA2E6', door = '#10233A', attrs = ''} = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"${attrs}><defs>${gapMask('g')}</defs><path d="${ROOF_SMALL}" mask="url(#g)" fill="${roof}"/><path d="${CHIMNEY}" mask="url(#g)" fill="${roof}"/><path d="${ROOF_BIG}" fill="${roof}"/><path d="${DOOR}" fill="${door}"/></svg>`;
