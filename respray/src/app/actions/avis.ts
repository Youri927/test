'use server';
/* Les avis : l'acheteur d'une commande terminée laisse une note et un mot (une fois), le vendeur répond (une fois),
   un membre peut signaler un avis, l'équipe peut le masquer ou le rétablir. */
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {and, eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre, exigerEquipe} from '@/lib/auth';
import {notifier, masquer} from '@/lib/activite';
import {noter} from '@/lib/journal';

// les coordonnées (téléphone, e-mail, réseaux) sont masquées, comme dans les messages
const propre = (t: string) => masquer(t).texte;

const num = (f: FormData, k: string) => Number(f.get(k)) || 0;
const texte = (f: FormData, k: string, max: number) => String(f.get(k) || '').trim().replace(/\s+/g, ' ').slice(0, max);

export async function laisserAvis(f: FormData) {
  const id = num(f, 'commandeId');
  const m = await exigerMembre(`/commandes/${id}`);
  const c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, id)});
  const note = Math.round(num(f, 'note'));
  if (!c || c.acheteurId !== m.id || !['confirmee', 'versee'].includes(c.statut) || note < 1 || note > 5) redirect(`/commandes/${id}`);
  const [a] = await db.insert(schema.avis).values({commandeId: c.id, annonceId: c.annonceId, vendeurId: c.vendeurId, acheteurId: m.id, note, texte: propre(texte(f, 'texte', 600))}).onConflictDoNothing().returning();
  if (a) {
    await notifier(c.vendeurId, 'vente', `Nouvel avis de @${m.pseudo} : ${'★'.repeat(note)}${a.texte ? ` « ${a.texte.slice(0, 120)}${a.texte.length > 120 ? '…' : ''} »` : ''}. Vous pouvez y répondre une fois.`, `/vendeur/${(await db.query.membres.findFirst({where: eq(schema.membres.id, c.vendeurId)}))?.pseudo}#avis-${a.id}`);
  }
  revalidatePath(`/commandes/${id}`);
  redirect(`/commandes/${id}#avis`);
}

export async function repondreAvis(f: FormData) {
  const id = num(f, 'avisId');
  const m = await exigerMembre();
  const a = await db.query.avis.findFirst({where: eq(schema.avis.id, id)});
  const r = propre(texte(f, 'reponse', 600));
  if (a && a.vendeurId === m.id && !a.reponse && r) await db.update(schema.avis).set({reponse: r, reponseLe: new Date()}).where(and(eq(schema.avis.id, id), eq(schema.avis.vendeurId, m.id)));
  revalidatePath(`/vendeur/${m.pseudo}`);
  redirect(`/vendeur/${m.pseudo}#avis-${id}`);
}

export async function signalerAvis(f: FormData) {
  const id = num(f, 'avisId');
  const m = await exigerMembre();
  const a = await db.query.avis.findFirst({where: eq(schema.avis.id, id)});
  if (a && !a.signale) {
    await db.update(schema.avis).set({signale: true}).where(eq(schema.avis.id, id));
    await noter(m.id, 'avis_signale', `avis:${id}`, `a signalé l'avis ${id}`);
    const equipe = await db.select({id: schema.membres.id}).from(schema.membres).where(eq(schema.membres.role, 'equipe'));
    for (const e of equipe) await notifier(e.id, 'litige', `Un avis a été signalé (avis ${id}).`, '/equipe/avis');
  }
  const v = a ? await db.query.membres.findFirst({where: eq(schema.membres.id, a.vendeurId)}) : null;
  redirect(v ? `/vendeur/${v.pseudo}?signale=1#avis-${id}` : '/');
}

export async function moderer(f: FormData) {
  const e = await exigerEquipe();
  const id = num(f, 'avisId');
  const action = String(f.get('action'));
  if (action === 'masquer') await db.update(schema.avis).set({masque: true, signale: false}).where(eq(schema.avis.id, id));
  if (action === 'garder') await db.update(schema.avis).set({signale: false}).where(eq(schema.avis.id, id));
  if (action === 'retablir') await db.update(schema.avis).set({masque: false}).where(eq(schema.avis.id, id));
  await noter(e.id, `avis_${action}`, `avis:${id}`, `avis ${id} : ${action}`);
  revalidatePath('/equipe/avis');
}
