import {POOLS, type Model} from './Pool';

export type Placed = {model: Model; drawing: string; lft: number; wft: number; x: number; y: number; w: number; h: number; row: number; k: number};

/**
 * La gamme entière, à la même échelle : les 23 coques dans l'ordre du comparateur du site,
 * en rangées équilibrées (chaque rangée prend sa part de la longueur totale), alignées par le bas.
 * Coordonnées en px, dans le cadre (left, top, width) ; `gap` en pieds entre deux bassins, `rowGap` en px entre les rangées.
 */
export const lineup = ({left, top, width, rows, gap = 3.2, rowGap = 56}: {left: number; top: number; width: number; rows: number; gap?: number; rowGap?: number}) => {
  const items = POOLS.map((m) => {
    const s = m.sizes[0];
    return {model: m, drawing: s.drawing ?? m.drawing, lft: s.l / 12, wft: s.w / 12};
  });
  const total = items.reduce((n, it) => n + it.lft, 0) + gap * (items.length - rows);
  const target = total / rows;
  // rangées : on coupe quand la rangée dépasse sa part (au plus près)
  const groups: (typeof items)[] = [[]];
  let acc = 0;
  for (const it of items) {
    const g = groups[groups.length - 1];
    const add = (g.length ? gap : 0) + it.lft;
    if (g.length && groups.length < rows && acc + add / 2 > target) {
      groups.push([it]);
      acc = it.lft;
    } else {
      g.push(it);
      acc += add;
    }
  }
  const longest = Math.max(...groups.map((g) => g.reduce((n, it) => n + it.lft, 0) + gap * (g.length - 1)));
  const ppf = width / longest;
  const rowH = Math.max(...items.map((it) => it.wft)) * ppf;
  const placed: Placed[] = [];
  let k = 0;
  groups.forEach((g, r) => {
    const len = (g.reduce((n, it) => n + it.lft, 0) + gap * (g.length - 1)) * ppf;
    let x = left + (width - len) / 2;
    const base = top + r * (rowH + rowGap) + rowH;
    for (const it of g) {
      const w = it.lft * ppf;
      const h = it.wft * ppf;
      placed.push({...it, x, y: base - h, w, h, row: r, k: k++});
      x += w + gap * ppf;
    }
  });
  return {placed, ppf, rowH, height: rows * rowH + (rows - 1) * rowGap};
};
