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
3 bis. Ce qui fait revenir et aide à décider : liste d'envies et alertes, recherche vide qui compte la demande, placard
   et sa valeur, cote (prix neuf barré, prix au ml, suggestion de prix), offres et contre-offres, prix proposé aux
   favoris, messages qui masquent les coordonnées, activité, décants, « pourquoi je le vends », chiffres de
   vérification publics, protection offerte aux invités : **fait**
4. Paiement bloqué (Stripe Connect), envois (Mondial Relay), 7 jours, litiges, versements, e-mails : à faire ; il
   faut les comptes Stripe et Mondial Relay de la société

## Les pages

| Adresse | Ce qu'on y fait |
|---|---|
| `/` | Les dernières annonces publiées ; tant qu'il y en a peu, « les premières annonces arrivent » et la liste d'attente |
| `/parfums` | Toutes les annonces en ligne : recherche, maison, genre, état, prix maximum, tri (récentes, prix, prix au ml) ; les mises en avant passent devant |
| `/annonces/:id` | Les photos du vendeur, ce qu'il a déclaré (dont la conservation et pourquoi il le vend), le prix comparé au neuf au millilitre, la protection, « À quoi il ressemble » (famille, notes, moment, parfums proches), faire une offre, poser une question |
| `/placard` | Les flacons qu'on possède, la valeur de chacun d'après la cote, le total ; « Le vendre » ouvre le formulaire déjà rempli |
| `/cote` | La cote de tous les parfums : neuf, d'occasion jamais ouvert, entamé, et la demande |
| `/verification` | Les chiffres des 30 derniers jours : annonces examinées, publiées, refusées et pourquoi, photos redemandées, délai médian |
| `/activite` | Envies arrivées, favoris, offres (accepter, contre-offre, refuser), messages, suivi des annonces |
| `/messages`, `/messages/:annonce` | Les conversations par annonce ; e-mails, téléphones, IBAN et applis de paiement extérieures sont masqués |
| `/vendre` | Le formulaire en six blocs, avec l'aperçu de l'annonce et ce que le vendeur touche ; la cote propose un prix ; le nombre de personnes qui attendent ce parfum ; le brouillon est gardé sur l'appareil ; les photos sont réduites dans le navigateur avant l'envoi |
| `/compte` | Mes annonces et leur statut (avec l'envoi d'une photo quand l'équipe en demande une, et un prix à proposer aux personnes qui l'ont en favori), mes envies, mes favoris |
| `/inscription`, `/connexion` | Les comptes |
| `/parfum/:lien`, `/maison/:lien` | Une page par parfum et par maison : la fiche, les annonces en ligne, le prix d'occasion au ml comparé au neuf (pour Google) |
| `/guides` | Reconnaître un faux, trouver le code lot, photographier, fixer son prix, conserver un parfum |
| `/fondateurs` | La candidature « vendeur fondateur » (badge, 5 mises en avant, vérification prioritaire) |
| `/r/:code` | Le lien de parrainage : l'invité a la protection offerte sur son premier achat ; sa première annonce publiée rapporte une mise en avant à chacun |
| `/sitemap.xml`, `/robots.txt` | Le plan du site pour les moteurs de recherche |
| `/equipe` | La file de vérification, les annonces en ligne, les maisons et parfums proposés, les vendeurs fondateurs, les membres, le journal (comptes `equipe` seulement) |
