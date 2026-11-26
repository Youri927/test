/* Deviner une odeur sans la sentir : la famille (avec sa couleur), le moment où on la porte, et les parfums proches
   du catalogue (mêmes familles, mêmes notes). */
import {normal} from '@/lib/regles';

type P = {id: number; nom: string; famille: string; notes: string; genre: string};

/* la couleur de la famille, la même que dans le formulaire de vente */
export function classeFamille(famille: string) {
  const f = normal(famille);
  if (/hesper|aquat|aromat|frai|agrume|marin|vert/.test(f)) return 'fam-fraiche';
  if (/gourm|ambr|musq|orient|epic|vanill/.test(f)) return 'fam-chaude';
  if (/bois|cuir|chypr|fougere|oud|tabac/.test(f)) return 'fam-boisee';
  if (/flor|fruit/.test(f)) return 'fam-florale';
  return 'fam-boisee';
}

/* quand on le porte, d'après sa famille : une indication, pas une règle */
export function moment(famille: string) {
  const c = classeFamille(famille);
  return {
    'fam-fraiche': 'Le printemps et l\'été, la journée',
    'fam-florale': 'Le printemps, la journée comme le soir',
    'fam-chaude': 'L\'automne et l\'hiver, plutôt le soir',
    'fam-boisee': 'Toute l\'année, plutôt l\'automne',
  }[c];
}

const mots = (s: string) => normal(s).split(/[,\s]+/).filter((m) => m.length > 2);
const notes = (s: string) => normal(s).split(',').map((x) => x.trim()).filter(Boolean);

/* les parfums les plus proches : familles en commun, notes en commun (qui comptent double) */
export function proches<T extends P>(p: P, tous: T[], n = 3): T[] {
  const f = new Set(mots(p.famille));
  const no = new Set(notes(p.notes));
  return tous
    .filter((x) => x.id !== p.id)
    .map((x) => ({x, s: mots(x.famille).filter((m) => f.has(m)).length + 2 * notes(x.notes).filter((m) => no.has(m)).length + (x.genre === p.genre ? 0.5 : 0)}))
    .filter((r) => r.s >= 1.5)
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((r) => r.x);
}
