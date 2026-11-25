# Respray : le vrai site

Le prototype (`alternative-perfumee/`) montre l'idée. Ce dossier est le vrai site : de vrais comptes, de vraies
annonces avec les photos des vendeurs, et le travail de l'équipe dans une vraie base de données.

- Next.js 15 (App Router, actions serveur), TypeScript
- Postgres, via Drizzle (`src/db/schema.ts`)
- Comptes : mot de passe haché (bcrypt), session dans un cookie httpOnly
- Photos : un dossier en local (`PHOTOS_DOSSIER`) ; un stockage d'objets en ligne (à brancher dans `src/lib/photos.ts`)
- Le catalogue des maisons et parfums est importé (`src/db/catalogue.json`) ; aucune annonce n'est inventée

## Lancer en local

```bash
cp .env.example .env        # puis remplissez DATABASE_URL, EQUIPE_EMAIL, EQUIPE_MOT_DE_PASSE
npm install
npx drizzle-kit push        # crée les tables
npm run db:seed             # le catalogue et le premier compte de l'équipe
npm run dev
```

## Où en est-on

1. Fondations : comptes, catalogue, accueil branché sur les vraies annonces, liste d'attente : fait
2. Vendre (formulaire, vraies photos) et vérification par l'équipe : en cours
3. Recherche, page annonce, favoris
4. Paiement bloqué (Stripe Connect), envois, litiges, versements, e-mails
