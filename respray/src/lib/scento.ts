import 'server-only';
/* Les vraies notes des parfums, d'après l'API gratuite de Scento (scento.com/developers/perfume-api) : chaque pyramide
   y est reprise de la liste publiée par la maison ou par un revendeur agréé.
   Leurs conditions (§ 22) : on peut construire un outil qui lit l'API ; on ne la surcharge pas, on ne la recopie pas en
   entier pour refaire un catalogue, et on ne présente pas ses réponses comme approuvées par une maison. D'où :
   - une requête par parfum, seulement pour ceux de notre catalogue, gardée 30 jours en base (parfums.senteur) ;
   - un lien vers la page Scento du parfum, à côté des notes. */
import {eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {normal} from '@/lib/regles';

const API = 'https://www.scento.com/api/perfume/v1';
const GARDE = 30 * 864e5;
const GARDE_ABSENT = 7 * 864e5;

export type Senteur = {
  absent?: boolean;
  page?: string;
  famille?: string;
  sousFamille?: string | null;
  tete?: string[];
  coeur?: string[];
  fond?: string[];
  notes?: string[];
  saisons?: string[];
  moments?: string[];
  proches?: {nom: string; maison: string; communes: string[]}[];
};

async function lire(chemin: string) {
  const r = await fetch(API + chemin, {headers: {'User-Agent': 'Respray (respray.fr)', Accept: 'application/json'}, signal: AbortSignal.timeout(5000), cache: 'no-store'});
  if (!r.ok) throw new Error(`Scento ${r.status}`);
  return r.json();
}
const unique = (l?: string[] | null) => [...new Set((l ?? []).map((x) => x.trim()).filter(Boolean))];

/* va chercher le parfum chez Scento (même nom, même maison), et l'enregistre */
export async function rafraichir(parfumId: number): Promise<Senteur | null> {
  const [r] = await db.select({p: schema.parfums, maison: schema.maisons.nom}).from(schema.parfums).innerJoin(schema.maisons, eq(schema.parfums.maisonId, schema.maisons.id)).where(eq(schema.parfums.id, parfumId));
  if (!r) return null;
  const recherche = await lire(`/perfumes?q=${encodeURIComponent(r.p.nom)}&lang=fr`);
  const trouve = (recherche?.detail?.matches ?? []).find((m: {kind?: string; name: string; house: string}) => m.kind !== 'house' && normal(m.name) === normal(r.p.nom) && normal(m.house) === normal(r.maison));
  let s: Senteur = {absent: true};
  if (trouve?.page) {
    const id = String(trouve.page).split('/').pop()!;
    const f = (await lire(`/perfumes/${id}?lang=fr`))?.detail;
    if (f?.name) {
      const voisins = await lire(`/perfumes/${id}/neighbours?lang=fr`).catch(() => null);
      s = {
        page: trouve.page,
        famille: f.family,
        sousFamille: f.subfamily,
        tete: unique(f.pyramid?.top),
        coeur: unique(f.pyramid?.heart),
        fond: unique(f.pyramid?.base),
        notes: unique(f.notes),
        saisons: f.wears?.seasons ?? [],
        moments: f.wears?.hours ?? [],
        proches: (voisins?.detail?.neighbours ?? []).filter((v: {house: string}) => normal(v.house) !== normal(r.maison)).slice(0, 4).map((v: {name: string; house: string; shared?: string[]}) => ({nom: v.name, maison: v.house, communes: (v.shared ?? []).slice(0, 4)})),
      };
    }
  }
  await db.update(schema.parfums).set({senteur: s, senteurLe: new Date()}).where(eq(schema.parfums.id, parfumId));
  return s;
}

/* les notes d'un parfum : celles en base si elles sont récentes, sinon on redemande à Scento (et en cas d'échec, on
   garde les anciennes) */
export async function senteurDe(p: {id: number; senteur: unknown; senteurLe: Date | null}): Promise<Senteur | null> {
  const s = p.senteur as Senteur | null;
  const age = p.senteurLe ? Date.now() - p.senteurLe.getTime() : Infinity;
  if (s && age < (s.absent ? GARDE_ABSENT : GARDE)) return s.absent ? null : s;
  try {
    const n = await rafraichir(p.id);
    return n && !n.absent ? n : null;
  } catch {
    return s && !s.absent ? s : null;
  }
}
