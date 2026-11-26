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

Les vraies notes des parfums (pyramide tête, cœur, fond ; saisons ; parfums proches) viennent de l'API gratuite de
[Scento](https://www.scento.com/developers/perfume-api) : chaque pyramide y est reprise de la liste publiée par la
maison. Une requête par parfum du catalogue, gardée 30 jours en base, avec un lien vers la page Scento à côté des notes
(leurs conditions, § 22 : pas de surcharge, pas de copie de toute leur base). `npm run senteurs` les charge pour tout
le catalogue d'un coup ; sinon chaque page parfum les demande à sa première visite. Un parfum absent chez Scento garde
les notes du catalogue. La traduction des notes en français est dans `src/lib/notes-fr.ts`.

## Où en est-on

1. Fondations : comptes, catalogue, accueil branché sur les vraies annonces, liste d'attente : **fait**
2. Vendre (formulaire, vraies photos) et vérification par l'équipe (publier, demander une photo, refuser, retirer ;
   maisons et parfums proposés ; membres ; journal) : **fait**
3. Recherche et filtres, page annonce, favoris : **fait**
3 bis. Ce qui fait revenir et aide à décider : liste d'envies et alertes, recherche vide qui compte la demande, placard
   et sa valeur, cote (prix neuf barré, prix au ml, suggestion de prix), offres et contre-offres, prix proposé aux
   favoris, messages qui masquent les coordonnées, activité, « pourquoi je le vends », chiffres de
   vérification publics, protection offerte aux invités : **fait**
4. Paiement bloqué (Stripe Checkout), envois, 7 jours de vérification, litiges, remboursements, versements aux
   vendeurs (Stripe Connect), mise en avant payante, tâches automatiques : **fait**, testé en mode test Stripe.
   Restent : les étiquettes et le suivi réels (contrat pro Mondial Relay ; simulés en attendant, `ENVOIS_SIMULES=1`),
   les e-mails, et le réglage « Profil de la plateforme » de Connect dans le tableau de bord Stripe (sans lui, Stripe
   refuse de créer les comptes de versement des vendeurs)

## L'argent : comment ça marche

1. L'acheteur paie sur Stripe Checkout (carte, Apple Pay, Google Pay), toujours en euros. L'annonce est réservée
   pendant le paiement (31 minutes au plus), puis vendue.
2. L'argent reste sur le compte Stripe de Respray. Le vendeur dépose le colis sous 5 jours (sinon : annulation et
   remboursement automatiques) ; l'acheteur a 7 jours après la livraison pour confirmer ou signaler un problème
   (sinon : confirmation automatique).
3. Confirmée : Respray transfère 100 % du prix au compte Stripe Connect du vendeur (compte « destinataire »,
   identité et IBAN vérifiés par Stripe). Respray garde la protection, l'envoi et l'assurance.
4. Litige : l'équipe compare avec les photos vérifiées, puis rembourse l'acheteur ou verse au vendeur
   (`/equipe/commandes`).
5. En main propre : l'acheteur paie sur le site, et donne au rendez-vous un code à 6 chiffres que le vendeur saisit.

Le paiement est enregistré par le webhook (`/api/stripe/webhook`, signature vérifiée) et au retour sur le site :
le premier arrivé fait le travail, une seule fois. Les délais sont appliqués par `/api/taches`, à appeler toutes les
15 minutes par le cron du serveur :

```bash
*/15 * * * * curl -s -H "Authorization: Bearer $TACHES_SECRET" https://respray.fr/api/taches
```

Dans le tableau de bord Stripe :
- Webhooks : ajouter `https://respray.fr/api/stripe/webhook` avec les événements `checkout.session.completed`,
  `checkout.session.async_payment_succeeded` et `checkout.session.expired` ; son secret va dans
  `STRIPE_WEBHOOK_SECRET`.
- Connect, « Profil de la plateforme » : marketplace, paiements encaissés par la plateforme puis transférés, pertes
  à la charge de la plateforme.

En développement, `npx tsx --conditions=react-server scripts/test-paiement.ts <commande>` paie une commande avec la
carte de test de Stripe (mode test uniquement), pour tester la suite sans remplir la page Checkout.

## Les pages

| Adresse | Ce qu'on y fait |
|---|---|
| `/` | Les dernières annonces publiées ; tant qu'il y en a peu, « les premières annonces arrivent » et la liste d'attente |
| `/parfums` | Toutes les annonces en ligne : recherche, maison, genre, état, prix maximum, tri (récentes, prix, prix au ml) ; les mises en avant passent devant |
| `/annonces/:id` | Les photos du vendeur, ce qu'il a déclaré (dont la conservation et pourquoi il le vend), le prix comparé au neuf au millilitre, la protection, « À quoi il ressemble » (famille, notes, moment, parfums proches), faire une offre, poser une question |
| `/acheter/:id` | Le mode de remise (point relais ou main propre), le point relais, l'envoi assuré au-dessus de 150 €, le total ; puis Stripe Checkout |
| `/commandes`, `/commandes/:id` | Mes achats et mes ventes ; pour chaque commande, où elle en est et ce qu'il y a à faire (déposer, vérifier, signaler, saisir le code) |
| `/compte/versements` | L'argent en cours, prêt à verser, versé ; l'inscription Stripe Connect du vendeur |
| `/equipe/commandes` | Les litiges à trancher (avec les photos vérifiées), toutes les commandes, ce qu'encaisse Respray |
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
