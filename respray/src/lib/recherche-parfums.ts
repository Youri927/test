import 'server-only';
/* La recherche de parfums (placard, vente) : d'abord notre catalogue, puis Scento pour ceux qu'on n'a pas encore.
   Scento autorise un outil qui interroge son API au fil des recherches, pas une copie de tout son catalogue : on
   n'ajoute chez nous que le parfum qu'un membre choisit vraiment, et seulement après avoir vérifié chez Scento qu'il
   existe sous ce nom et cette maison. Les réponses sont gardées une journée en mémoire (pas de surcharge). */
import {eq, ilike, or, asc} from 'drizzle-orm';
import {db, schema} from '@/db';
import {normal} from '@/lib/regles';

const API = 'https://www.scento.com/api/perfume/v1';
export type Trouve = {id?: number; nom: string; maison: string; formats?: {ml: number; neuf?: number}[]; source: 'catalogue' | 'scento'};

const cache = new Map<string, {le: number; r: {nom: string; maison: string}[]}>();

async function scento(q: string): Promise<{nom: string; maison: string}[]> {
  const k = normal(q);
  const c = cache.get(k);
  if (c && Date.now() - c.le < 864e5) return c.r;
  const r = await fetch(`${API}/perfumes?q=${encodeURIComponent(q)}&lang=fr`, {headers: {'User-Agent': 'Respray (respray.fr)', Accept: 'application/json'}, signal: AbortSignal.timeout(4000), cache: 'no-store'}).catch(() => null);
  if (!r?.ok) return [];
  const j = await r.json().catch(() => null);
  const liste = ((j?.detail?.matches ?? []) as {kind?: string; name?: string; house?: string}[])
    .filter((m) => m.kind !== 'house' && m.name && m.house)
    .map((m) => ({nom: m.name!.trim(), maison: m.house!.trim()}));
  if (cache.size > 2000) cache.clear();
  cache.set(k, {le: Date.now(), r: liste});
  return liste;
}

/* jusqu'à 8 parfums du catalogue (nom ou maison), puis jusqu'à 8 de Scento qu'on n'a pas */
export async function chercher(q: string): Promise<Trouve[]> {
  const t = q.trim().slice(0, 60);
  if (t.length < 2) return [];
  const motif = `%${t.replace(/[%_]/g, '')}%`;
  const locaux = await db
    .select({id: schema.parfums.id, nom: schema.parfums.nom, maison: schema.maisons.nom, formats: schema.parfums.formats})
    .from(schema.parfums)
    .innerJoin(schema.maisons, eq(schema.parfums.maisonId, schema.maisons.id))
    .where(or(ilike(schema.parfums.nom, motif), ilike(schema.maisons.nom, motif)))
    .orderBy(asc(schema.maisons.nom), asc(schema.parfums.nom))
    .limit(8);
  const deja = new Set(locaux.map((p) => normal(`${p.maison}|${p.nom}`)));
  const distants = t.length >= 3 ? (await scento(t)).filter((p) => !deja.has(normal(`${p.maison}|${p.nom}`))).slice(0, 8) : [];
  return [...locaux.map((p) => ({...p, source: 'catalogue' as const})), ...distants.map((p) => ({...p, source: 'scento' as const}))];
}

/* le parfum choisi dans les résultats Scento : vérifié chez Scento, puis ajouté au catalogue (maison comprise) */
export async function depuisScento(nom: string, maison: string): Promise<number | null> {
  const n = nom.trim().slice(0, 80), m = maison.trim().slice(0, 80);
  if (!n || !m) return null;
  const confirme = (await scento(n)).find((p) => normal(p.nom) === normal(n) && normal(p.maison) === normal(m));
  if (!confirme) return null;
  const maisons = await db.select().from(schema.maisons);
  let mid = maisons.find((x) => normal(x.nom) === normal(confirme.maison))?.id;
  if (!mid) {
    const [x] = await db.insert(schema.maisons).values({nom: confirme.maison}).onConflictDoNothing().returning({id: schema.maisons.id});
    mid = x?.id ?? (await db.query.maisons.findFirst({where: eq(schema.maisons.nom, confirme.maison)}))?.id;
  }
  if (!mid) return null;
  const existant = (await db.select().from(schema.parfums).where(eq(schema.parfums.maisonId, mid))).find((p) => normal(p.nom) === normal(confirme.nom));
  if (existant) return existant.id;
  const [p] = await db.insert(schema.parfums).values({maisonId: mid, nom: confirme.nom}).returning({id: schema.parfums.id});
  return p.id;
}
