import 'server-only';
/* L'activité d'un membre (envie arrivée, favori, offre, message…), et le masquage des coordonnées dans les messages. */
import {and, eq, sql} from 'drizzle-orm';
import {db, schema} from '@/db';
import {emailActivite} from '@/lib/email';

export async function notifier(membreId: number, type: string, texte: string, lien = '') {
  await db.insert(schema.notifications).values({membreId, type, texte, lien});
  // l'e-mail part sans faire attendre la page ; une erreur d'envoi n'empêche jamais l'action
  void emailActivite(membreId, type, texte, lien).catch((e) => console.error('E-mail d\'activité :', (e as Error).message));
}

/* Ce qui ferait sortir la vente de Respray (et de la protection) : adresse email, numéro de téléphone, IBAN, et les
   applis de paiement ou de messagerie. Remplacé par « ••• ». */
const MOTIFS: RegExp[] = [
  /[\w.+-]+@[\w-]+\.[\w.]+/gi,
  /(?:\+|00)\s?\d{2,3}(?:[\s.-]?\d){8,10}/g,
  /\b0[1-9](?:[\s.-]?\d{2}){4}\b/g,
  /\bFR\d{2}(?:\s?[\dA-Z]{4}){5,6}\b/gi,
  /\b(?:paypal|lydia|wero|paylib|iban|rib|virement|western\s?union|whats\s?app|telegram|snap(?:chat)?|insta(?:gram)?|messenger|leboncoin|vinted)\b/gi,
];
export function masquer(texte: string) {
  let t = texte;
  for (const m of MOTIFS) t = t.replace(m, '•••');
  return {texte: t, masque: t !== texte};
}

/* (pas des actions serveur : appelées seulement par les pages, pour la personne connectée) */
export async function toutLu(membreId: number) {
  await db.update(schema.notifications).set({lue: true}).where(and(eq(schema.notifications.membreId, membreId), eq(schema.notifications.lue, false)));
}
export async function nonLues(membreId: number) {
  const [r] = await db.select({n: sql<number>`count(*)::int`}).from(schema.notifications).where(and(eq(schema.notifications.membreId, membreId), eq(schema.notifications.lue, false)));
  return r?.n ?? 0;
}
