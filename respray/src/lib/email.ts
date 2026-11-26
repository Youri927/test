import 'server-only';
/* Les e-mails de Respray. Envoi par SMTP (Brevo, la messagerie Hostinger ou un autre service : SMTP_HOST, SMTP_PORT,
   SMTP_USER, SMTP_PASS). Sans SMTP_HOST (développement), rien ne part : l'e-mail est seulement noté comme « simulé ».
   Chaque e-mail laisse une ligne dans la table emails.

   Le modèle reprend la DA du site : fond crème, carte blanche, logo, une pastille d'état en couleur, la carte du parfum
   avec sa photo, le suivi de la commande, le récapitulatif, le bouclier, un bouton noir. Tableaux et styles en ligne :
   c'est ce que lisent Gmail, Outlook et Apple Mail. Les images sont servies par le site (public/email). */
import nodemailer, {type Transporter} from 'nodemailer';
import {and, eq, gt} from 'drizzle-orm';
import {db, schema} from '@/db';
import {SOCIETE} from '@/lib/legal';
import {eur, eur2} from '@/lib/regles';

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

const e = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (l: string) => (l.startsWith('http') ? l : SITE + l);

/* ——— le modèle ——— */
export type Ton = 'ok' | 'action' | 'alerte' | 'info';
export type CarteMail = {photo?: string | null; maison: string; nom: string; details: string; prix?: string};
export type Mail = {
  titre: string;
  texte: string; // paragraphes séparés par une ligne vide
  bouton?: string;
  lien?: string;
  pied: string;
  badge?: string;
  ton?: Ton;
  carte?: CarteMail | null;
  suivi?: {etapes: string[]; fait: number} | null; // fait : nombre d'étapes terminées
  lignes?: [string, string][];
  total?: [string, string];
  note?: string; // le bandeau vert, avec le bouclier
  points?: [string, string][]; // une petite liste « titre, explication » (bienvenue)
};

const POLICE = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const TONS: Record<Ton, [string, string]> = {ok: ['#1a7f4b', '#e6f4ec'], action: ['#8a4b0b', '#fbefe2'], alerte: ['#b3261e', '#fbe9e7'], info: ['#1d1d1f', '#efede8']};

function bloc(html: string, bas = 24) {
  return `<tr><td style="padding:0 0 ${bas}px 0">${html}</td></tr>`;
}

export function modele(m: Mail) {
  const url = m.lien ? abs(m.lien) : '';
  const [couleur, fond] = TONS[m.ton ?? 'info'];
  const paragraphes = m.texte.split(/\n\n+/).map((p) => `<p style="margin:0 0 14px 0">${e(p).replace(/\n/g, '<br>')}</p>`).join('');
  const preheader = m.texte.replace(/^Bonjour[^\n]*\n+/, '').split(/\n/)[0].slice(0, 140);

  const carte = m.carte
    ? bloc(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f2;border-radius:16px"><tr>
        ${m.carte.photo ? `<td width="96" style="padding:14px 0 14px 14px;vertical-align:top"><img src="${e(abs(m.carte.photo))}" width="82" height="102" alt="" style="display:block;width:82px;height:102px;object-fit:cover;border-radius:10px;background:#eceae5"></td>` : ''}
        <td style="padding:16px 18px;vertical-align:middle">
          <div style="font-size:12.5px;color:#6e6e73;letter-spacing:.2px">${e(m.carte.maison)}</div>
          <div style="font-size:17px;font-weight:700;color:#1d1d1f;letter-spacing:-.2px;padding:2px 0 4px">${e(m.carte.nom)}</div>
          <div style="font-size:13.5px;color:#6e6e73">${e(m.carte.details)}</div>
        </td>
        ${m.carte.prix ? `<td align="right" style="padding:16px 18px 16px 0;vertical-align:middle;font-size:18px;font-weight:700;color:#1d1d1f;white-space:nowrap">${e(m.carte.prix)}</td>` : ''}
      </tr></table>`)
    : '';

  const suivi = m.suivi
    ? bloc(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${m.suivi.etapes
        .map((t, i) => {
          const fait = i < m.suivi!.fait;
          const encours = i === m.suivi!.fait;
          const rond = fait
            ? `<div style="width:26px;height:26px;line-height:26px;border-radius:13px;background:#1a7f4b;color:#ffffff;font-size:14px;font-weight:700;text-align:center;margin:0 auto">&#10003;</div>`
            : `<div style="width:22px;height:22px;line-height:22px;border-radius:13px;border:2px solid ${encours ? '#b05a12' : '#dcd9d3'};color:${encours ? '#b05a12' : '#a19d96'};font-size:12px;font-weight:700;text-align:center;margin:0 auto">${i + 1}</div>`;
          return `<td width="${Math.floor(100 / m.suivi!.etapes.length)}%" align="center" style="vertical-align:top;padding:0 2px">${rond}<div style="font-size:11.5px;line-height:1.3;color:${fait || encours ? '#1d1d1f' : '#a19d96'};font-weight:${encours ? 700 : 500};padding-top:6px">${e(t)}</div></td>`;
        })
        .join('')}</tr></table>`)
    : '';

  const lignes = m.lignes?.length || m.total
    ? bloc(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14.5px">${(m.lignes ?? [])
        .map(([k, v]) => `<tr><td style="padding:6px 0;color:#6e6e73">${e(k)}</td><td align="right" style="padding:6px 0;color:#1d1d1f">${e(v)}</td></tr>`)
        .join('')}${m.total ? `<tr><td style="padding:12px 0 0;border-top:1px solid #e6e3dd;font-weight:700;color:#1d1d1f">${e(m.total[0])}</td><td align="right" style="padding:12px 0 0;border-top:1px solid #e6e3dd;font-weight:700;color:#1d1d1f;font-size:16px">${e(m.total[1])}</td></tr>` : ''}</table>`)
    : '';

  const points = m.points?.length
    ? bloc(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${m.points
        .map(([t, d], i) => `<tr><td width="34" style="vertical-align:top;padding:0 0 14px"><div style="width:26px;height:26px;line-height:26px;border-radius:13px;background:#e6f4ec;color:#1a7f4b;font-size:13px;font-weight:700;text-align:center">${i + 1}</div></td><td style="vertical-align:top;padding:2px 0 14px;font-size:14.5px;line-height:1.5;color:#3a3a3c"><strong style="color:#1d1d1f">${e(t)}</strong><br>${e(d)}</td></tr>`)
        .join('')}</table>`, 8)
    : '';

  const bouton = url
    ? bloc(`<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:999px;background:#1d1d1f"><a href="${e(url)}" style="display:inline-block;padding:14px 28px;font-family:${POLICE};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px">${e(m.bouton || 'Voir sur Respray')}</a></td></tr></table>`, m.note ? 24 : 4)
    : '';

  const note = m.note
    ? bloc(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e6f4ec;border-radius:14px"><tr><td width="56" style="padding:14px 0 14px 14px;vertical-align:middle"><img src="${abs('/email/bouclier.png')}" width="40" height="40" alt="" style="display:block"></td><td style="padding:14px 16px 14px 12px;font-size:13.5px;line-height:1.5;color:#14532d">${e(m.note)}</td></tr></table>`, 4)
    : '';

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${e(m.titre)}</title></head>
<body style="margin:0;padding:0;background:#f4f2ee;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f4f2ee">${e(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee"><tr><td align="center" style="padding:28px 14px 36px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:${POLICE};color:#1d1d1f">
    <tr><td style="padding:4px 8px 22px"><a href="${SITE}" style="text-decoration:none"><img src="${abs('/email/logo.png')}" width="124" height="34" alt="respray" style="display:block;border:0"></a></td></tr>
    <tr><td style="background:#ffffff;border-radius:24px;padding:34px 30px 30px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${m.badge ? bloc(`<span style="display:inline-block;padding:5px 11px;border-radius:999px;background:${fond};color:${couleur};font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase">${e(m.badge)}</span>`, 16) : ''}
        ${bloc(`<h1 style="margin:0;font-size:26px;line-height:1.18;font-weight:700;letter-spacing:-.6px;color:#1d1d1f">${e(m.titre)}</h1>`, 16)}
        ${bloc(`<div style="font-size:15.5px;line-height:1.6;color:#3a3a3c">${paragraphes}</div>`, 10)}
        ${carte}${suivi}${lignes}${points}${bouton}${note}
      </table>
    </td></tr>
    <tr><td style="padding:26px 10px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="30" style="vertical-align:top"><img src="${abs('/email/symbole.png')}" width="22" height="22" alt="" style="display:block;opacity:.85"></td>
        <td style="font-size:12.5px;line-height:1.6;color:#6e6e73">
          <strong style="color:#1d1d1f">Le parfum de seconde main, sans le doute.</strong><br>
          Vérifié avant d'être en ligne · 0 % de commission vendeur · 7 jours pour vérifier<br>
          <a href="${SITE}/commandes" style="color:#6e6e73">Mes commandes</a> &nbsp;·&nbsp; <a href="${SITE}/activite" style="color:#6e6e73">Activité</a> &nbsp;·&nbsp; <a href="${SITE}/comment-ca-marche" style="color:#6e6e73">Comment ça marche</a> &nbsp;·&nbsp; <a href="${SITE}/cgu" style="color:#6e6e73">Conditions</a><br>
          <span style="color:#9a968f">${e(m.pied)}<br>${e(SOCIETE.nom)} · ${e(SOCIETE.siege)}</span>
        </td>
      </tr></table>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;

  const brut = [
    m.titre,
    '',
    m.texte,
    m.carte ? `\n${m.carte.maison} · ${m.carte.nom} · ${m.carte.details}${m.carte.prix ? ` · ${m.carte.prix}` : ''}` : '',
    ...(m.lignes ?? []).map(([k, v]) => `${k} : ${v}`),
    m.total ? `${m.total[0]} : ${m.total[1]}` : '',
    ...(m.points ?? []).map(([t, d]) => `- ${t} : ${d}`),
    url ? `\n${m.bouton || 'Voir sur Respray'} : ${url}` : '',
    m.note ? `\n${m.note}` : '',
    `\n—\nRespray, le parfum de seconde main, sans le doute.\n${m.pied}\n${SOCIETE.nom} · ${SOCIETE.siege}`,
  ]
    .filter((x) => x !== '')
    .join('\n');
  return {html, texte: brut};
}

export async function envoyer({a, sujet, type, membreId, contenu}: {a: string; sujet: string; type: string; membreId?: number | null; contenu: {html: string; texte: string}}) {
  const t = transport();
  if (!t) {
    await db.insert(schema.emails).values({membreId: membreId ?? null, a, sujet, type, statut: 'simule'});
    return;
  }
  try {
    await t.sendMail({from: EXPEDITEUR, replyTo: REPONSE, to: a, subject: sujet, html: contenu.html, text: contenu.texte});
    if (process.env.SMTP_HOST === 'json') console.log('E-MAIL (test) :', JSON.stringify({to: a, subject: sujet, text: contenu.texte}));
    await db.insert(schema.emails).values({membreId: membreId ?? null, a, sujet, type, statut: 'envoye'});
  } catch (err) {
    console.error('E-mail non envoyé :', (err as Error).message);
    await db.insert(schema.emails).values({membreId: membreId ?? null, a, sujet, type, statut: 'echec', erreur: (err as Error).message.slice(0, 300)});
  }
}

/* ——— l'e-mail qui accompagne une notification de l'activité ———
   Le texte de la notification donne le message ; l'objet (annonce ou commande, tiré du lien) donne la carte du parfum,
   le suivi et le récapitulatif ; une table de règles donne le titre, la pastille et sa couleur. */
const ESSENTIELS = new Set(['achat', 'vente', 'litige', 'annonce']); // toujours envoyés
const TYPES = new Set(['achat', 'vente', 'litige', 'annonce', 'envie', 'offre', 'message']);

const REGLES: [RegExp, string, string, Ton][] = [
  // [motif du texte, titre, pastille, ton]
  [/^Paiement reçu/, 'Paiement reçu, merci', 'Commande payée', 'ok'],
  [/^Vendu/, 'Vendu ! Il ne reste qu\'à l\'envoyer', 'Vendu', 'ok'],
  [/^Pour recevoir vos/, 'Ajoutez votre IBAN pour être payé', 'À faire', 'action'],
  [/^Votre colis est parti/, 'Votre parfum est en route', 'Expédié', 'info'],
  [/^Votre colis est arrivé/, 'Votre colis vous attend', 'À vérifier', 'action'],
  [/^Le colis de la commande \d+ est arrivé/, 'Le colis est arrivé chez l\'acheteur', 'Livré', 'info'],
  [/versés pour la commande/, 'Vous avez été payé', 'Versement envoyé', 'ok'],
  [/annulée/, 'Commande annulée', 'Annulée', 'alerte'],
  [/^Litige de la commande \d+ : vous êtes remboursé/, 'Vous êtes remboursé', 'Remboursé', 'ok'],
  [/^Litige de la commande \d+ : l'acheteur est remboursé/, 'Litige : l\'acheteur est remboursé', 'Litige tranché', 'alerte'],
  [/^L'acheteur signale un problème/, 'L\'acheteur signale un problème', 'Litige ouvert', 'alerte'],
  [/conteste le paiement/, 'Contestation bancaire', 'Litige', 'alerte'],
  [/^(Litige|Contestation bancaire) sur la commande/, 'Un litige à trancher', 'Équipe', 'alerte'],
  [/^Votre paiement n'est pas passé/, 'Votre paiement n\'est pas passé', 'Paiement refusé', 'alerte'],
  [/^Le virement vers votre banque a échoué/, 'Le virement a échoué', 'À corriger', 'alerte'],
  [/^Vos versements sont prêts/, 'Vos versements sont prêts', 'Compte vérifié', 'ok'],
  [/^Stripe a besoin d'informations/, 'Stripe a besoin d\'une information', 'À faire', 'action'],
  [/est vérifié et en ligne/, 'Votre annonce est en ligne', 'Vérifiée', 'ok'],
  [/^Votre .* est en ligne\. Pour le mettre en avant/, 'Votre annonce est en ligne', 'Vérifiée', 'ok'],
  [/n'a pas été publié/, 'Votre annonce n\'a pas été publiée', 'Refusée', 'alerte'],
  [/^Une photo est à refaire/, 'Une photo est à refaire', 'À faire', 'action'],
  [/^Mise en avant active/, 'Votre annonce est mise en avant', 'Mise en avant', 'ok'],
  [/^Il est arrivé/, 'Il est arrivé', 'Votre envie', 'ok'],
  [/vous propose .* pour votre/, 'Vous avez reçu une offre', 'Offre', 'action'],
  [/^Offre acceptée/, 'Votre offre est acceptée', 'Offre acceptée', 'ok'],
  [/^Contre-offre du vendeur/, 'Le vendeur vous fait une contre-offre', 'Contre-offre', 'action'],
  [/a décliné votre offre/, 'Votre offre n\'a pas été retenue', 'Offre', 'info'],
  [/accepte votre contre-offre/, 'Contre-offre acceptée', 'Offre acceptée', 'ok'],
  [/n'a pas retenu votre contre-offre/, 'Contre-offre non retenue', 'Offre', 'info'],
  [/que vous avez en favori est à/, 'Un prix rien que pour vous', 'Prix proposé', 'ok'],
  [/^Message de/, 'Vous avez un nouveau message', 'Message', 'info'],
];
const BOUTONS: Record<string, string> = {message: 'Lire et répondre', offre: 'Voir l\'offre', envie: 'Voir l\'annonce'};
const SUIVI_RELAIS = ['Payée', 'Déposée', 'Arrivée', 'Vérifiée', 'Versée'];

async function contexte(lien: string, membreId: number): Promise<Partial<Mail>> {
  const cmd = lien.match(/^\/commandes\/(\d+)/);
  const ann = lien.match(/^\/annonces\/(\d+)|^\/messages\/(\d+)/);
  const annonceId = ann ? Number(ann[1] || ann[2]) : null;
  if (cmd) {
    const c = await db.query.commandes.findFirst({where: eq(schema.commandes.id, Number(cmd[1]))});
    if (!c) return {};
    const a = await db.query.annonces.findFirst({where: eq(schema.annonces.id, c.annonceId)});
    const ph = a ? await db.query.photos.findFirst({where: and(eq(schema.photos.annonceId, a.id), eq(schema.photos.vue, 'face'))}) : null;
    const acheteur = c.acheteurId === membreId;
    const fait = c.verseeLe ? 5 : c.confirmeeLe ? 4 : c.livreeLe ? 3 : c.expedieeLe ? 2 : c.payeeLe ? 1 : 0;
    const fini = ['annulee', 'remboursee'].includes(c.statut);
    return {
      carte: a ? {photo: ph ? `/photos/${ph.fichier}` : null, maison: a.maisonNom, nom: a.parfumNom, details: `${a.ml} ml · ${a.etat === 'neuf' ? 'neuf' : `reste ~${a.niveau} %`} · commande ${c.id}`, prix: eur(acheteur ? c.total : c.prix)} : null,
      suivi: !fini && c.mode === 'relais' ? {etapes: SUIVI_RELAIS, fait} : null,
      lignes: acheteur
        ? [['Parfum', eur2(c.prix)], ['Protection acheteur', c.protection ? eur2(c.protection) : 'offerte'], ['Livraison', eur2(c.envoi)], ...(c.assurance ? [['Envoi assuré', eur2(c.assurance)] as [string, string]] : []), ...(c.relais ? [['Point relais', `${c.relais.nom}, ${c.relais.cp}`] as [string, string]] : [])]
        : [['Commission Respray', '0,00 €'], ...(c.mode === 'relais' && c.etiquette ? [['Suivi', c.etiquette] as [string, string]] : [])],
      total: acheteur ? ['Payé', eur2(c.total)] : ['Pour vous', eur2(c.prix)],
      note: fini ? undefined : acheteur ? 'Votre argent reste bloqué jusqu\'à ce que vous ayez vérifié le parfum : 7 jours après la livraison. S\'il n\'est pas conforme à l\'annonce, vous êtes remboursé.' : 'Vos 6 photos, vérifiées par l\'équipe, font foi en cas de désaccord : elles prouvent l\'état du flacon avant l\'envoi.',
    };
  }
  if (annonceId) {
    const a = await db.query.annonces.findFirst({where: eq(schema.annonces.id, annonceId)});
    if (!a) return {};
    const ph = await db.query.photos.findFirst({where: and(eq(schema.photos.annonceId, a.id), eq(schema.photos.vue, 'face'))});
    return {carte: {photo: ph ? `/photos/${ph.fichier}` : null, maison: a.maisonNom, nom: a.parfumNom, details: `${a.ml} ml · ${a.etat === 'neuf' ? 'neuf' : `reste ~${a.niveau} %`}`, prix: eur(a.prix)}, note: a.vendeurId === membreId ? undefined : 'Vérifiée par l\'équipe avant d\'être en ligne. Votre paiement reste bloqué, et vous avez 7 jours pour vérifier.'};
  }
  return {};
}

export async function emailActivite(membreId: number, type: string, texte: string, lien: string) {
  if (!TYPES.has(type)) return; // les favoris restent dans l'activité, sans e-mail
  const m = await db.query.membres.findFirst({where: eq(schema.membres.id, membreId)});
  if (!m || m.statut === 'exclu') return;
  if (!ESSENTIELS.has(type) && !m.emailsActivite) return;
  // pas plus d'un e-mail de message toutes les 15 minutes : la conversation se lit sur le site
  if (type === 'message' && (await db.query.emails.findFirst({where: and(eq(schema.emails.membreId, m.id), eq(schema.emails.type, 'message'), gt(schema.emails.creeLe, new Date(Date.now() - 15 * 6e4)))}))) return;
  const r = REGLES.find(([re]) => re.test(texte));
  const titre = r?.[1] ?? 'Du nouveau sur Respray';
  const ctx = await contexte(lien || '', m.id);
  const sujet = type === 'envie' ? texte.split(/(?<=[.!?])\s/)[0].replace(/\.$/, '') : titre;
  await envoyer({
    a: m.email,
    sujet: sujet.slice(0, 110),
    type,
    membreId: m.id,
    contenu: modele({
      titre,
      badge: r?.[2],
      ton: r?.[3] ?? 'info',
      texte: `Bonjour ${m.prenom || m.pseudo},\n\n${texte}`,
      bouton: BOUTONS[type] ?? (lien.startsWith('/commandes') ? 'Voir ma commande' : 'Voir sur Respray'),
      lien: lien || '/activite',
      pied: ESSENTIELS.has(type) ? 'Vous recevez cet e-mail parce qu\'il concerne une de vos commandes ou annonces sur Respray.' : 'Vous recevez cet e-mail parce que vous l\'avez demandé sur Respray. Pour ne plus en recevoir : Mon compte, Mes e-mails.',
      ...ctx,
    }),
  });
}

/* ——— les aperçus (page équipe /equipe/emails) : chaque e-mail, avec l'exemple de démonstration ——— */
export function apercus(): {nom: string; sujet: string; contenu: {html: string; texte: string}}[] {
  const carte = (prix: string): CarteMail => ({photo: '/demo/a101-face.webp', maison: 'Maison Francis Kurkdjian', nom: 'Baccarat Rouge 540', details: '70 ml · reste ~85 % · commande 12', prix});
  const acheteur: Partial<Mail> = {carte: carte('210,82 €'), lignes: [['Parfum', '189,00 €'], ['Protection acheteur', '16,02 €'], ['Livraison', '4,90 €'], ['Point relais', 'Tabac Presse du Centre, 75011']], total: ['Payé', '210,82 €'], note: 'Votre argent reste bloqué jusqu\'à ce que vous ayez vérifié le parfum : 7 jours après la livraison. S\'il n\'est pas conforme à l\'annonce, vous êtes remboursé.'};
  const vendeur: Partial<Mail> = {carte: carte('189 €'), lignes: [['Commission Respray', '0,00 €'], ['Suivi', 'MR48213977']], total: ['Pour vous', '189,00 €'], note: 'Vos 6 photos, vérifiées par l\'équipe, font foi en cas de désaccord : elles prouvent l\'état du flacon avant l\'envoi.'};
  const annonce: Partial<Mail> = {carte: {photo: '/demo/a101-face.webp', maison: 'Maison Francis Kurkdjian', nom: 'Baccarat Rouge 540', details: '70 ml · reste ~85 %', prix: '189 €'}};
  const exemples: [string, string, string, Partial<Mail>][] = [
    ['Achat payé', 'achat', 'Paiement reçu pour Baccarat Rouge 540. L\'argent reste bloqué jusqu\'à ce que vous ayez vérifié le parfum.', {...acheteur, suivi: {etapes: SUIVI_RELAIS, fait: 1}}],
    ['Vente', 'vente', 'Vendu : Baccarat Rouge 540, 189 € pour vous. Imprimez l\'étiquette et déposez le colis en point relais sous 5 jours.', {...vendeur, suivi: {etapes: SUIVI_RELAIS, fait: 1}}],
    ['Colis en route', 'achat', 'Votre colis est parti (suivi MR48213977). Vous serez prévenu à son arrivée au point relais.', {...acheteur, suivi: {etapes: SUIVI_RELAIS, fait: 2}}],
    ['Colis arrivé', 'achat', 'Votre colis est arrivé chez Tabac Presse du Centre. Vous avez 7 jours pour vérifier le parfum : confirmez, ou signalez un problème.', {...acheteur, suivi: {etapes: SUIVI_RELAIS, fait: 3}}],
    ['Versement', 'vente', '189 € versés pour la commande 12. Ils arrivent sur votre compte bancaire sous quelques jours.', {...vendeur, suivi: {etapes: SUIVI_RELAIS, fait: 5}, note: undefined}],
    ['Litige ouvert (vendeur)', 'vente', 'L\'acheteur signale un problème sur la commande 12 : Il en reste moins qu\'annoncé. L\'argent reste bloqué ; l\'équipe compare avec vos photos vérifiées et revient vers vous.', {...vendeur, suivi: {etapes: SUIVI_RELAIS, fait: 3}}],
    ['Remboursement', 'achat', 'Litige de la commande 12 : vous êtes remboursé en entier. La photo du niveau reçue montre environ 30 %, contre 85 % sur la photo vérifiée.', {carte: acheteur.carte, lignes: acheteur.lignes, total: ['Remboursé', '210,82 €']}],
    ['Annonce en ligne', 'annonce', 'Votre Baccarat Rouge 540 est vérifié et en ligne.', annonce],
    ['Annonce refusée', 'annonce', 'Votre Baccarat Rouge 540 n\'a pas été publié : La photo du dessous ne permet pas de lire le code lot.', annonce],
    ['Envie arrivée', 'envie', 'Il est arrivé : Baccarat Rouge 540 (Maison Francis Kurkdjian), 70 ml, 189 €. Vérifié par l\'équipe.', {...annonce, note: 'Vérifiée par l\'équipe avant d\'être en ligne. Votre paiement reste bloqué, et vous avez 7 jours pour vérifier.'}],
    ['Offre reçue', 'offre', '@lina vous propose 170 € pour votre Baccarat Rouge 540 (affiché 189 €). Répondez sous 48 heures.', annonce],
    ['Contre-offre', 'offre', 'Contre-offre du vendeur : Baccarat Rouge 540 à 180 € (vous proposiez 170 €).', annonce],
    ['Message', 'message', 'Message de @lina à propos de Baccarat Rouge 540 : « Bonjour, il tient bien sur la peau ? »', annonce],
  ];
  const liste = exemples.map(([nom, type, texte, ctx]) => {
    const r = REGLES.find(([re]) => re.test(texte));
    return {
      nom,
      sujet: type === 'envie' ? texte.split(/(?<=[.!?])\s/)[0].replace(/\.$/, '') : r?.[1] ?? '',
      contenu: modele({titre: r?.[1] ?? 'Du nouveau sur Respray', badge: r?.[2], ton: r?.[3], texte: `Bonjour Lina,\n\n${texte}`, bouton: BOUTONS[type] ?? 'Voir ma commande', lien: '/activite', pied: ESSENTIELS.has(type) ? 'Vous recevez cet e-mail parce qu\'il concerne une de vos commandes ou annonces sur Respray.' : 'Vous recevez cet e-mail parce que vous l\'avez demandé sur Respray. Pour ne plus en recevoir : Mon compte, Mes e-mails.', ...ctx}),
    };
  });
  liste.unshift(
    {nom: 'Bienvenue', sujet: 'Bienvenue sur Respray', contenu: modele({titre: 'Bienvenue, Lina', badge: 'Compte créé', ton: 'ok', texte: 'Votre compte Respray est prêt. Votre pseudo : @lina.', points: [['Vendre, sans commission', 'Six photos, l\'équipe vérifie l\'annonce, et vous touchez 100 % du prix.'], ['Acheter, sans le doute', 'Chaque annonce est vérifiée avant d\'être en ligne, et votre paiement reste bloqué.'], ['7 jours pour vérifier', 'Flacon en main : s\'il n\'est pas conforme à l\'annonce, vous êtes remboursé.']], bouton: 'Estimer mon placard', lien: '/placard', note: 'Respray vérifie chaque annonce avant de la publier : c\'est ce qui fait la différence.', pied: 'Vous recevez cet e-mail parce que vous venez de créer un compte sur Respray.'})},
    {nom: 'Mot de passe oublié', sujet: 'Choisir un nouveau mot de passe', contenu: modele({titre: 'Un nouveau mot de passe', badge: 'Sécurité', ton: 'info', texte: 'Bonjour Lina,\n\nVous avez demandé à changer le mot de passe de votre compte Respray. Ce lien est valable une heure, une seule fois.', bouton: 'Choisir un nouveau mot de passe', lien: '/nouveau-mot-de-passe', pied: 'Vous n\'avez rien demandé ? Ignorez cet e-mail : votre mot de passe ne change pas.'})},
  );
  return liste;
}
