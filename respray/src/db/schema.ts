/* Le modèle de données de Respray.
   - membres : vendeurs, acheteurs et l'équipe (role) ; sessions : les connexions ouvertes.
   - maisons, parfums : le catalogue ; une maison ou un parfum proposé par un vendeur attend la validation de l'équipe
     (propositions), puis rejoint le catalogue.
   - annonces : tout ce que le vendeur déclare, et le statut de la vérification ; photos : les fichiers envoyés.
   - journal : chaque action de l'équipe, signée et datée.
   - attente : les personnes qui veulent être prévenues de l'ouverture. */
import {pgTable, serial, text, integer, boolean, timestamp, jsonb, real, uniqueIndex, index} from 'drizzle-orm/pg-core';

export const membres = pgTable(
  'membres',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    pseudo: text('pseudo').notNull(),
    prenom: text('prenom').notNull().default(''),
    nom: text('nom').notNull().default(''),
    ville: text('ville').notNull().default(''),
    motDePasse: text('mot_de_passe').notNull(),
    // l'identifiant Google (« sub ») quand le membre se connecte avec Google
    googleId: text('google_id'),
    role: text('role', {enum: ['membre', 'equipe']}).notNull().default('membre'),
    statut: text('statut', {enum: ['actif', 'suspendu', 'exclu']}).notNull().default('actif'),
    fondateur: boolean('fondateur').notNull().default(false),
    // le parrainage : son code à partager, qui l'a fait venir, et les mises en avant gagnées
    code: text('code'),
    parrainId: integer('parrain_id'),
    credits: integer('credits').notNull().default(0),
    // les versements : le compte Stripe Connect du vendeur, et s'il peut recevoir de l'argent
    stripeCompte: text('stripe_compte'),
    versementsOk: boolean('versements_ok').notNull().default(false),
    // les e-mails facultatifs (envies arrivées, offres, messages) ; les e-mails essentiels partent toujours
    emailsActivite: boolean('emails_activite').notNull().default(true),
    // l'adresse d'expéditeur du vendeur, imprimée sur l'étiquette Mondial Relay (jamais montrée à l'acheteur)
    expediteur: jsonb('expediteur').$type<{nom: string; rue: string; cp: string; ville: string; tel: string}>(),
    creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('membres_email').on(t.email), uniqueIndex('membres_pseudo').on(t.pseudo), uniqueIndex('membres_code').on(t.code), uniqueIndex('membres_google').on(t.googleId)],
);

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  membreId: integer('membre_id').notNull().references(() => membres.id, {onDelete: 'cascade'}),
  expire: timestamp('expire', {withTimezone: true}).notNull(),
});

export const maisons = pgTable('maisons', {
  id: serial('id').primaryKey(),
  nom: text('nom').notNull().unique(),
  ajouteeLe: timestamp('ajoutee_le', {withTimezone: true}).notNull().defaultNow(),
});

export const parfums = pgTable(
  'parfums',
  {
    id: serial('id').primaryKey(),
    maisonId: integer('maison_id').notNull().references(() => maisons.id),
    nom: text('nom').notNull(),
    conc: text('conc').notNull().default(''),
    genre: text('genre').notNull().default(''),
    famille: text('famille').notNull().default(''),
    notes: text('notes').notNull().default(''),
    annee: integer('annee'),
    formats: jsonb('formats').$type<{ml: number; neuf?: number}[]>().notNull().default([]),
    // les vraies notes (pyramide, famille, saisons, parfums proches), lues chez Scento et gardées 30 jours (lib/scento)
    senteur: jsonb('senteur'),
    senteurLe: timestamp('senteur_le', {withTimezone: true}),
  },
  (t) => [index('parfums_maison').on(t.maisonId)],
);

export const propositions = pgTable('propositions', {
  id: serial('id').primaryKey(),
  type: text('type', {enum: ['maison', 'parfum']}).notNull(),
  tape: text('tape').notNull(),
  maisonNom: text('maison_nom'),
  conc: text('conc'),
  membreId: integer('membre_id').references(() => membres.id),
  annonceId: integer('annonce_id'),
  statut: text('statut', {enum: ['attente', 'ajoutee', 'fusionnee', 'refusee']}).notNull().default('attente'),
  creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
});

export type Details = {
  format: string;
  visible: string;
  defauts: string[];
  annee: string;
  lieu: string;
  lumiere: string;
  chaleur: string;
  boite: string;
  familles: string[];
  genre: string;
  pourquoi?: string;
};

export const annonces = pgTable(
  'annonces',
  {
    id: serial('id').primaryKey(),
    vendeurId: integer('vendeur_id').notNull().references(() => membres.id),
    // le parfum : du catalogue (parfumId), ou proposé (maisonTapee, parfumTape)
    parfumId: integer('parfum_id').references(() => parfums.id),
    maisonNom: text('maison_nom').notNull(),
    parfumNom: text('parfum_nom').notNull(),
    conc: text('conc').notNull(),
    ml: real('ml').notNull(),
    etat: text('etat', {enum: ['neuf', 'entame']}).notNull(),
    niveau: integer('niveau').notNull(),
    lot: text('lot').notNull(),
    description: text('description').notNull().default(''),
    details: jsonb('details').$type<Details>().notNull(),
    prix: real('prix').notNull(),
    mainPropre: boolean('main_propre').notNull().default(false),
    ville: text('ville').notNull().default(''),
    miseEnAvant: text('mise_en_avant').notNull().default(''),
    statut: text('statut', {enum: ['attente', 'photo', 'publiee', 'refusee', 'retiree', 'reservee', 'vendue']}).notNull().default('attente'),
    // la mise en avant, une fois payée (ou offerte) : en tête des résultats jusqu'à cette date
    avantJusqua: timestamp('avant_jusqua', {withTimezone: true}),
    raison: text('raison').notNull().default(''),
    creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
    publieeLe: timestamp('publiee_le', {withTimezone: true}),
  },
  (t) => [index('annonces_statut').on(t.statut), index('annonces_vendeur').on(t.vendeurId)],
);

export const photos = pgTable(
  'photos',
  {
    id: serial('id').primaryKey(),
    annonceId: integer('annonce_id').notNull().references(() => annonces.id, {onDelete: 'cascade'}),
    vue: text('vue').notNull(),
    fichier: text('fichier').notNull(),
  },
  (t) => [index('photos_annonce').on(t.annonceId)],
);

export const journal = pgTable('journal', {
  id: serial('id').primaryKey(),
  membreId: integer('membre_id').references(() => membres.id),
  action: text('action').notNull(),
  cible: text('cible').notNull().default(''),
  texte: text('texte').notNull(),
  creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
});

export const attente = pgTable('attente', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  envie: text('envie', {enum: ['acheter', 'vendre']}).notNull().default('acheter'),
  creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
});

export const favoris = pgTable(
  'favoris',
  {
    membreId: integer('membre_id').notNull().references(() => membres.id, {onDelete: 'cascade'}),
    annonceId: integer('annonce_id').notNull().references(() => annonces.id, {onDelete: 'cascade'}),
  },
  (t) => [uniqueIndex('favoris_pk').on(t.membreId, t.annonceId)],
);

/* les candidatures « vendeur fondateur » : les premiers vendeurs, accompagnés par l'équipe */
export const candidatures = pgTable('candidatures', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  prenom: text('prenom').notNull().default(''),
  flacons: text('flacons').notNull().default(''),
  maisons: text('maisons').notNull().default(''),
  ou: text('ou').notNull().default(''),
  statut: text('statut', {enum: ['nouvelle', 'acceptee', 'refusee']}).notNull().default('nouvelle'),
  creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
});

/* la liste d'envies : un parfum du catalogue (ou un nom écrit, s'il n'y est pas), avec un prix maximum facultatif.
   Quand une annonce qui correspond est publiée, la personne est prévenue. Le nombre d'envies d'un parfum est aussi
   montré aux vendeurs : « 9 personnes l'attendent ». */
export const envies = pgTable(
  'envies',
  {
    id: serial('id').primaryKey(),
    membreId: integer('membre_id').notNull().references(() => membres.id, {onDelete: 'cascade'}),
    parfumId: integer('parfum_id').references(() => parfums.id),
    texte: text('texte').notNull().default(''),
    prixMax: real('prix_max'),
    creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [index('envies_parfum').on(t.parfumId), index('envies_membre').on(t.membreId)],
);

/* le placard : les flacons qu'une personne possède, pour voir ce qu'ils valent et les vendre en un geste */
export const placard = pgTable(
  'placard',
  {
    id: serial('id').primaryKey(),
    membreId: integer('membre_id').notNull().references(() => membres.id, {onDelete: 'cascade'}),
    parfumId: integer('parfum_id').notNull().references(() => parfums.id),
    ml: real('ml').notNull(),
    niveau: integer('niveau').notNull().default(100),
    creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [index('placard_membre').on(t.membreId)],
);

/* les offres : un acheteur propose un prix, le vendeur accepte, refuse ou fait une contre-offre ; ou bien le vendeur
   propose lui-même un prix aux personnes qui ont mis l'annonce en favori (deVendeur). Une offre vaut 48 heures. */
export const offres = pgTable(
  'offres',
  {
    id: serial('id').primaryKey(),
    annonceId: integer('annonce_id').notNull().references(() => annonces.id, {onDelete: 'cascade'}),
    acheteurId: integer('acheteur_id').notNull().references(() => membres.id, {onDelete: 'cascade'}),
    montant: real('montant').notNull(),
    contre: real('contre'),
    deVendeur: boolean('de_vendeur').notNull().default(false),
    statut: text('statut', {enum: ['attente', 'acceptee', 'refusee', 'contre', 'annulee']}).notNull().default('attente'),
    creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
    expire: timestamp('expire', {withTimezone: true}).notNull(),
  },
  (t) => [index('offres_annonce').on(t.annonceId), index('offres_acheteur').on(t.acheteurId)],
);

/* les messages : une conversation par annonce et par acheteur. Les coordonnées et les moyens de paiement hors
   Respray sont masqués avant l'enregistrement (masque = vrai) : la protection ne marche que si tout passe ici. */
export const messages = pgTable(
  'messages',
  {
    id: serial('id').primaryKey(),
    annonceId: integer('annonce_id').notNull().references(() => annonces.id, {onDelete: 'cascade'}),
    acheteurId: integer('acheteur_id').notNull().references(() => membres.id, {onDelete: 'cascade'}),
    auteurId: integer('auteur_id').notNull().references(() => membres.id, {onDelete: 'cascade'}),
    texte: text('texte').notNull(),
    masque: boolean('masque').notNull().default(false),
    lu: boolean('lu').notNull().default(false),
    creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [index('messages_conv').on(t.annonceId, t.acheteurId)],
);

/* l'activité : ce qui arrive à une personne (envie arrivée, favori, offre, message, annonce publiée…) */
export const notifications = pgTable(
  'notifications',
  {
    id: serial('id').primaryKey(),
    membreId: integer('membre_id').notNull().references(() => membres.id, {onDelete: 'cascade'}),
    type: text('type').notNull(),
    texte: text('texte').notNull(),
    lien: text('lien').notNull().default(''),
    lue: boolean('lue').notNull().default(false),
    creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [index('notifications_membre').on(t.membreId, t.lue)],
);

/* Les commandes. Respray ne touche jamais le colis : l'argent est encaissé par Respray (Stripe), gardé pendant
   l'envoi et les 7 jours de vérification, puis transféré au vendeur (Stripe Connect).
   attente_paiement → payee → expediee → livree → confirmee → versee, ou bien litige → remboursee / confirmee, ou annulee. */
export type Relais = {id: string; nom: string; adresse: string; cp: string; ville: string};
export type Litige = {raison: string; texte: string; le: string; decision?: string};
export const commandes = pgTable(
  'commandes',
  {
    id: serial('id').primaryKey(),
    annonceId: integer('annonce_id').notNull().references(() => annonces.id),
    acheteurId: integer('acheteur_id').notNull().references(() => membres.id),
    vendeurId: integer('vendeur_id').notNull().references(() => membres.id),
    offreId: integer('offre_id'),
    // les montants, en euros : ce que touche le vendeur (prix), et ce que garde Respray (protection, envoi, assurance)
    prix: real('prix').notNull(),
    protection: real('protection').notNull(),
    envoi: real('envoi').notNull(),
    assurance: real('assurance').notNull().default(0),
    total: real('total').notNull(),
    mode: text('mode', {enum: ['relais', 'main']}).notNull().default('relais'),
    relais: jsonb('relais').$type<Relais>(),
    statut: text('statut', {enum: ['attente_paiement', 'payee', 'expediee', 'livree', 'litige', 'confirmee', 'versee', 'remboursee', 'annulee']}).notNull().default('attente_paiement'),
    checkoutId: text('checkout_id'),
    paiementId: text('paiement_id'),
    chargeId: text('charge_id'),
    transfertId: text('transfert_id'),
    remboursementId: text('remboursement_id'),
    etiquette: text('etiquette'),
    etiquettePdf: text('etiquette_pdf'), // le PDF de l'étiquette chez Mondial Relay
    codeRemise: text('code_remise'),
    litige: jsonb('litige').$type<Litige>(),
    creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
    payeeLe: timestamp('payee_le', {withTimezone: true}),
    deposerAvant: timestamp('deposer_avant', {withTimezone: true}),
    expedieeLe: timestamp('expediee_le', {withTimezone: true}),
    livreeLe: timestamp('livree_le', {withTimezone: true}),
    finVerif: timestamp('fin_verif', {withTimezone: true}),
    confirmeeLe: timestamp('confirmee_le', {withTimezone: true}),
    verseeLe: timestamp('versee_le', {withTimezone: true}),
  },
  (t) => [index('commandes_acheteur').on(t.acheteurId), index('commandes_vendeur').on(t.vendeurId), index('commandes_statut').on(t.statut)],
);

/* les paiements du vendeur à Respray : la mise en avant */
export const paiements = pgTable('paiements', {
  id: serial('id').primaryKey(),
  membreId: integer('membre_id').notNull().references(() => membres.id),
  annonceId: integer('annonce_id').notNull().references(() => annonces.id),
  type: text('type').notNull().default('mise_en_avant'),
  montant: real('montant').notNull(),
  checkoutId: text('checkout_id'),
  statut: text('statut', {enum: ['attente', 'payee', 'annulee']}).notNull().default('attente'),
  creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
});

/* les événements Stripe déjà traités : un même événement renvoyé par Stripe ne fait le travail qu'une fois */
export const evenementsStripe = pgTable('evenements_stripe', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  recuLe: timestamp('recu_le', {withTimezone: true}).notNull().defaultNow(),
});

/* les e-mails envoyés (ou simulés en développement) : l'équipe voit ce qui est parti, et ce qui a échoué */
export const emails = pgTable(
  'emails',
  {
    id: serial('id').primaryKey(),
    membreId: integer('membre_id').references(() => membres.id, {onDelete: 'set null'}),
    a: text('a').notNull(),
    sujet: text('sujet').notNull(),
    type: text('type').notNull(),
    statut: text('statut', {enum: ['envoye', 'simule', 'echec']}).notNull(),
    erreur: text('erreur'),
    creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [index('emails_membre').on(t.membreId, t.type)],
);

/* les liens de réinitialisation du mot de passe : seul le haché du jeton est gardé, valable 1 heure, une seule fois */
export const jetons = pgTable('jetons', {
  hache: text('hache').primaryKey(),
  membreId: integer('membre_id').notNull().references(() => membres.id, {onDelete: 'cascade'}),
  expire: timestamp('expire', {withTimezone: true}).notNull(),
  utilise: boolean('utilise').notNull().default(false),
});

/* les avis : laissés par l'acheteur d'une commande terminée (un par commande), le vendeur peut répondre une fois,
   n'importe quel membre peut signaler un avis, l'équipe peut le masquer */
export const avis = pgTable(
  'avis',
  {
    id: serial('id').primaryKey(),
    commandeId: integer('commande_id').notNull().references(() => commandes.id),
    annonceId: integer('annonce_id').notNull(),
    vendeurId: integer('vendeur_id').notNull().references(() => membres.id),
    acheteurId: integer('acheteur_id').notNull().references(() => membres.id),
    note: integer('note').notNull(),
    texte: text('texte').notNull().default(''),
    reponse: text('reponse'),
    reponseLe: timestamp('reponse_le', {withTimezone: true}),
    signale: boolean('signale').notNull().default(false),
    masque: boolean('masque').notNull().default(false),
    creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('avis_commande').on(t.commandeId), index('avis_vendeur').on(t.vendeurId)],
);
