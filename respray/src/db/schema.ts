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
    role: text('role', {enum: ['membre', 'equipe']}).notNull().default('membre'),
    statut: text('statut', {enum: ['actif', 'suspendu', 'exclu']}).notNull().default('actif'),
    fondateur: boolean('fondateur').notNull().default(false),
    // le parrainage : son code à partager, qui l'a fait venir, et les mises en avant gagnées
    code: text('code'),
    parrainId: integer('parrain_id'),
    credits: integer('credits').notNull().default(0),
    creeLe: timestamp('cree_le', {withTimezone: true}).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('membres_email').on(t.email), uniqueIndex('membres_pseudo').on(t.pseudo), uniqueIndex('membres_code').on(t.code)],
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
    statut: text('statut', {enum: ['attente', 'photo', 'publiee', 'refusee', 'retiree', 'vendue']}).notNull().default('attente'),
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
