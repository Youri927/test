import 'server-only';
/* Les e-mails de Respray. Envoi par SMTP (Brevo, la messagerie Hostinger ou un autre service : SMTP_HOST, SMTP_PORT,
   SMTP_USER, SMTP_PASS). Sans SMTP_HOST (développement), rien ne part : l'e-mail est seulement noté comme « simulé ».
   Chaque e-mail laisse une ligne dans la table emails. */
import nodemailer, {type Transporter} from 'nodemailer';
import {and, eq, gt} from 'drizzle-orm';
import {db, schema} from '@/db';
import {SOCIETE} from '@/lib/legal';

const SITE = process.env.SITE_URL || 'https://respray.fr';
const EXPEDITEUR = process.env.EMAIL_EXPEDITEUR || 'Respray <noreply@respray.fr>';
const REPONSE = process.env.EMAIL_REPONSE || 'contact@respray.fr';

const g = globalThis as unknown as {transport?: Transporter | null};
function transport() {
  if (g.transport !== undefined) return g.transport;
  const h = process.env.SMTP_HOST;
  g.transport = !h
    ? null
    : h === 'json' // pour les tests : l'e-mail est construit mais pas envoyé
      ? nodemailer.createTransport({jsonTransport: true})
      : nodemailer.createTransport({host: h, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465, auth: {user: process.env.SMTP_USER, pass: process.env.SMTP_PASS}});
  return g.transport;
}

const echapper = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* le modèle : sobre, lisible sur téléphone, en clair et en sombre ; texte brut à côté pour les messageries simples */
export function modele({titre, texte, bouton, lien, pied}: {titre: string; texte: string; bouton?: string; lien?: string; pied: string}) {
  const url = lien ? (lien.startsWith('http') ? lien : SITE + lien) : '';
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="light dark"><title>${echapper(titre)}</title></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:Inter,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#1d1d1f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;padding:32px 28px">
<tr><td style="font-size:22px;font-weight:700;letter-spacing:-0.5px;padding-bottom:24px">respray<span style="color:#1a7f4b">.</span></td></tr>
<tr><td style="font-size:22px;font-weight:650;line-height:1.25;letter-spacing:-0.3px;padding-bottom:12px">${echapper(titre)}</td></tr>
<tr><td style="font-size:15.5px;line-height:1.55;color:#3a3a3c;padding-bottom:${url ? 24 : 8}px">${echapper(texte).replace(/\n/g, '<br>')}</td></tr>
${url ? `<tr><td style="padding-bottom:8px"><a href="${echapper(url)}" style="display:inline-block;background:#1d1d1f;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 24px;border-radius:999px">${echapper(bouton || 'Voir sur Respray')}</a></td></tr>` : ''}
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px"><tr><td style="font-size:12.5px;line-height:1.5;color:#6e6e73;padding:18px 8px 0">${echapper(pied)}<br>Respray · le parfum de seconde main, sans le doute · ${echapper(SOCIETE.nom)}</td></tr></table>
</td></tr></table></body></html>`;
  const texteBrut = `${titre}\n\n${texte}${url ? `\n\n${bouton || 'Voir sur Respray'} : ${url}` : ''}\n\n—\n${pied}\nRespray`;
  return {html, texte: texteBrut};
}

export async function envoyer({a, sujet, type, membreId, contenu}: {a: string; sujet: string; type: string; membreId?: number | null; contenu: {html: string; texte: string}}) {
  const t = transport();
  if (!t) {
    await db.insert(schema.emails).values({membreId: membreId ?? null, a, sujet, type, statut: 'simule'});
    return;
  }
  try {
    const info = await t.sendMail({from: EXPEDITEUR, replyTo: REPONSE, to: a, subject: sujet, html: contenu.html, text: contenu.texte});
    if (process.env.SMTP_HOST === 'json') console.log('E-MAIL (test) :', JSON.stringify({to: a, subject: sujet, text: contenu.texte}), (info as {message?: unknown}).message ? '' : '');
    await db.insert(schema.emails).values({membreId: membreId ?? null, a, sujet, type, statut: 'envoye'});
  } catch (e) {
    console.error('E-mail non envoyé :', (e as Error).message);
    await db.insert(schema.emails).values({membreId: membreId ?? null, a, sujet, type, statut: 'echec', erreur: (e as Error).message.slice(0, 300)});
  }
}

/* l'e-mail qui accompagne une notification de l'activité */
const ESSENTIELS = new Set(['achat', 'vente', 'litige', 'annonce']); // toujours envoyés
const SUJETS: Record<string, string> = {achat: 'Votre achat', vente: 'Votre vente', litige: 'Un litige à traiter', annonce: 'Votre annonce', envie: 'Il est arrivé', offre: 'Une offre', message: 'Un nouveau message'};

export async function emailActivite(membreId: number, type: string, texte: string, lien: string) {
  if (!SUJETS[type]) return; // les favoris restent dans l'activité, sans e-mail
  const m = await db.query.membres.findFirst({where: eq(schema.membres.id, membreId)});
  if (!m || m.statut === 'exclu') return;
  if (!ESSENTIELS.has(type) && !m.emailsActivite) return;
  // pas plus d'un e-mail de message toutes les 15 minutes : la conversation se lit sur le site
  if (type === 'message' && (await db.query.emails.findFirst({where: and(eq(schema.emails.membreId, m.id), eq(schema.emails.type, 'message'), gt(schema.emails.creeLe, new Date(Date.now() - 15 * 6e4)))}))) return;
  const premiere = texte.split(/(?<=[.!?])\s/)[0];
  const sujet = type === 'envie' ? premiere.replace(/\.$/, '') : `${SUJETS[type]} sur Respray`;
  await envoyer({
    a: m.email,
    sujet: sujet.slice(0, 110),
    type,
    membreId: m.id,
    contenu: modele({
      titre: SUJETS[type],
      texte: `Bonjour ${m.prenom || m.pseudo},\n\n${texte}`,
      bouton: type === 'message' ? 'Lire et répondre' : 'Voir sur Respray',
      lien: lien || '/activite',
      pied: ESSENTIELS.has(type) ? 'Vous recevez cet e-mail parce qu\'il concerne une de vos commandes ou annonces sur Respray.' : `Vous recevez cet e-mail parce que vous l'avez demandé sur Respray. Pour ne plus en recevoir : ${SITE}/compte#notifications`,
    }),
  });
}
