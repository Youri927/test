/* La Cote Respray : ce que vaut un parfum d'occasion. Partagée entre le serveur (annonces, pages parfum, placard) et
   le navigateur (la suggestion de prix du formulaire de vente).
   - Avec au moins 3 annonces de ce parfum (en ligne ou vendues), la cote suit leur prix médian au millilitre.
   - Sinon, elle part du prix neuf indicatif : environ 72 % du neuf pour un flacon jamais ouvert, 62 % pour un flacon
     entamé, au prorata de ce qu'il reste. C'est une estimation, et elle le dit. */
export type Formats = {ml: number; neuf?: number}[];
export type Cote = {bas: number; haut: number; milieu: number; source: 'annonces' | 'neuf'; n: number};

/* le prix neuf d'un format : celui du catalogue s'il existe, sinon le prix au ml du format le plus proche */
export function prixNeuf(formats: Formats, ml: number): number | null {
  const f = formats.filter((x) => x.neuf);
  if (!f.length || !ml) return null;
  const exact = f.find((x) => x.ml === ml);
  if (exact) return exact.neuf!;
  const proche = [...f].sort((a, b) => Math.abs(a.ml - ml) - Math.abs(b.ml - ml))[0];
  return Math.round((proche.neuf! / proche.ml) * ml);
}

export const mlRestants = (ml: number, niveau: number) => Math.max(1, (ml * niveau) / 100);
const mediane = (l: number[]) => {
  const s = [...l].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const arrondi = (x: number) => (x >= 100 ? Math.round(x / 5) * 5 : Math.round(x));

export function estimer({formats, ml, niveau, etat, occMl = []}: {formats: Formats; ml: number; niveau: number; etat: 'neuf' | 'entame'; occMl?: number[]}): Cote | null {
  if (!ml) return null;
  const reste = mlRestants(ml, etat === 'neuf' ? 100 : niveau);
  let milieu: number | null = null;
  let source: Cote['source'] = 'neuf';
  if (occMl.length >= 3) {
    milieu = mediane(occMl) * reste;
    source = 'annonces';
  } else {
    const n = prixNeuf(formats, ml);
    if (n) milieu = n * (etat === 'neuf' ? 0.72 : 0.62) * (reste / ml);
  }
  if (!milieu) return null;
  return {bas: Math.max(3, arrondi(milieu * 0.88)), haut: arrondi(milieu * 1.12), milieu: Math.max(3, arrondi(milieu)), source, n: occMl.length};
}

/* combien moins cher qu'en neuf, au millilitre (null si ce n'est pas moins cher ou si on ne sait pas) */
export function remise(formats: Formats, a: {prix: number; ml: number; niveau: number}) {
  const n = prixNeuf(formats, a.ml);
  if (!n) return null;
  const neufMl = n / a.ml;
  const occMl = a.prix / mlRestants(a.ml, a.niveau);
  const r = Math.round((1 - occMl / neufMl) * 100);
  return r >= 5 ? {pct: r, neuf: n, neufMl, occMl} : null;
}
