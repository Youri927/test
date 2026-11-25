# Respray : le vrai site

Le prototype (`alternative-perfumee/`) montre l'idée. Ce dossier est le vrai site : de vrais comptes, de vraies
annonces avec les photos des vendeurs, et le travail de l'équipe dans une vraie base de données.

- Next.js 15 (App Router, actions serveur), TypeScript
- Postgres, via Drizzle (`src/db/schema.ts`)
- Comptes : mot de passe haché (bcrypt), session dans un cookie httpOnly
- Photos : un dossier en local (`PHOTOS_DOSSIER`) ; un stockage d'objets en ligne (à brancher dans `src/lib/photos.ts`)
- Le catalogue des maisons et parfums est importé (`src/db/catalogue.json`) ; aucune annonce n'est inventée

Le plan de lancement (réseaux sans visage, communautés, créateurs) est dans `LANCEMENT.md`.

## Lancer en local

```bash
cp .env.example .env        # puis remplissez DATABASE_URL, EQUIPE_EMAIL, EQUIPE_MOT_DE_PASSE
npm install
npx drizzle-kit push        # crée les tables
npm run db:seed             # le catalogue et le premier compte de l'équipe
npm run dev
```

## Où en est-on

1. Fondations : comptes, catalogue, accueil branché sur les vraies annonces, liste d'attente : **fait**
2. Vendre (formulaire, vraies photos) et vérification par l'équipe (publier, demander une photo, refuser, retirer ;
   maisons et parfums proposés ; membres ; journal) : **fait**
3. Recherche et filtres, page annonce, favoris : **fait**
4. Paiement bloqué (Stripe Connect), envois (Mondial Relay), 7 jours, litiges, versements, e-mails : à faire ; il
   faut les comptes Stripe et Mondial Relay de la société

## Les pages

| Adresse | Ce qu'on y fait |
|---|---|
| `/` | Les dernières annonces publiées ; tant qu'il y en a peu, « les premières annonces arrivent » et la liste d'attente |
| `/parfums` | Toutes les annonces en ligne : recherche, maison, genre, état, prix maximum, tri (récentes, prix, prix au ml) ; les mises en avant passent devant |
| `/annonces/:id` | Les photos du vendeur, ce qu'il a déclaré, le prix et la protection acheteur |
| `/vendre` | Le formulaire en six blocs, avec l'aperçu de l'annonce ; les photos sont réduites dans le navigateur avant l'envoi |
| `/compte` | Mes annonces et leur statut (avec l'envoi d'une photo quand l'équipe en demande une), mes favoris |
| `/inscription`, `/connexion` | Les comptes |
| `/parfum/:lien`, `/maison/:lien` | Une page par parfum et par maison : la fiche, les annonces en ligne, le prix d'occasion au ml comparé au neuf (pour Google) |
| `/guides` | Reconnaître un faux, trouver le code lot, photographier, fixer son prix, conserver un parfum |
| `/fondateurs` | La candidature « vendeur fondateur » (badge, 5 mises en avant, vérification prioritaire) |
| `/r/:code` | Le lien de parrainage : la première annonce publiée de l'invité rapporte une mise en avant à chacun |
| `/sitemap.xml`, `/robots.txt` | Le plan du site pour les moteurs de recherche |
| `/equipe` | La file de vérification, les annonces en ligne, les maisons et parfums proposés, les vendeurs fondateurs, les membres, le journal (comptes `equipe` seulement) |
