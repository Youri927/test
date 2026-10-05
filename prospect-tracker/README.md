# Prospect Tracker pour Gmail : v3.2

Suivi des mails envoyés depuis Gmail, façon Mailsuite. Chaque mail suivi indique **s'il a été ouvert, combien de fois, quand, et quels liens ont été cliqués**. Vos propres lectures, les doublons et les robots sont écartés.

- `extension/` : l'extension Chrome.
- `supabase/` : le serveur, une fonction Supabase et ses tables.

## Ce qui n'allait pas dans la v2.4, et ce qui a changé

| Problème constaté | Cause | Correction |
| --- | --- | --- |
| Un clic était compté pour un **ancien** mail | Les liens déjà suivis (réponse dans un fil, mail recopié, modèle) gardaient l'identifiant de l'ancien mail : l'extension ne réécrivait que les liens « neufs » | À l'envoi, chaque lien est ramené à son adresse d'origine, puis suivi pour le nouveau mail. C'est aussi le cas des liens cités et de ceux passés par la redirection de Google |
| Ouvrir un nouveau mail comptait comme une ouverture d'un ancien | Le pixel de l'ancien mail, recopié ou cité, restait dans le nouveau | Les anciens pixels sont retirés à l'envoi. Un seul pixel reste, celui du nouveau mail, placé en tête : jamais dans la citation ni dans la signature, que Gmail replie |
| Un clic ne passait pas le mail en « ouvert » | L'affichage ne regardait que le pixel | Un clic compte aussi comme une ouverture, côté serveur et côté affichage |
| Statut d'un autre mail au même objet | Le statut était retrouvé par l'objet seul : en prospection, le même objet part à plusieurs personnes | Dans un fil, chaque message affiche son propre statut, lu dans son propre pixel. Dans les listes, il faut le même objet **et** le même destinataire, sinon rien n'est affiché |
| Coche accrochée à la mauvaise ligne | Gmail réutilise les lignes de la liste d'une page à l'autre | Chaque ligne est réévaluée à chaque changement |
| Réponses tapées dans le fil jamais suivies | Seules les fenêtres de rédaction étaient détectées | Toute zone de rédaction qui a un bouton Envoyer est suivie : fenêtre, plein écran, réponse dans le fil |
| Fausse ouverture au moment de l'envoi | Le pixel se chargeait dans votre propre Gmail pendant la rédaction | L'extension empêche ce chargement chez vous seulement |
| Vos relectures comptées comme des ouvertures | Votre Gmail affiche vos mails envoyés en chargeant le pixel, comme celui du destinataire | Quand vous affichez ou cliquez votre propre mail, l'extension prévient le serveur, qui ne compte pas ces 30 secondes. Un autre compte (un test vers vous-même) est compté normalement |
| Clics fantômes | Les antivirus d'entreprise ouvrent tous les liens dès la réception | Non comptés : clic moins de 10 s après l'envoi, plusieurs liens en moins de 2 s, robots connus, requêtes HEAD |
| Ouvertures en double | Gmail recharge parfois l'image | Deux chargements à moins d'une minute d'écart comptent pour une seule ouverture. Au-delà, c'est une ré-ouverture |
| Envoi perdu si le réseau hésite | L'envoi se signalait en un seul essai | L'identifiant est demandé dès l'ouverture de la rédaction. L'envoi est mis en file d'attente et réessayé |

## Dans Gmail

| Où | Ce qui s'affiche |
| --- | --- |
| **Listes** (Envoyés, boîte de réception…) | Devant l'objet : ✓ gris = envoyé et suivi, pas encore ouvert. ✓✓ vert = ouvert. Petit lien bleu = au moins un lien cliqué |
| **Survol d'une coche** | Une carte : « Ouvert 3 fois », dernière ouverture, destinataire, les 4 derniers gestes (ouvert, ré-ouvert, lien cliqué) et « Voir toute l'activité » |
| **Message ouvert** | À côté de la date, une puce « Ouvert 2 fois · 1 clic », lue dans le pixel de CE message. Si le message est replié, la puce passe à côté de l'objet du fil. Dans votre mail, chaque lien cliqué porte une pastille avec son nombre de clics |
| **Rédaction** | À droite du bouton Envoyer : **✓✓ ▾** ouvre les options du mail, l'**interrupteur** coupe ou remet le suivi (vert = suivi, gris = sans suivi, rouge = serveur injoignable) |
| **Mail reçu** | Une puce « Suivi · HubSpot » (Mailtrack, Mailchimp…) quand l'expéditeur y a mis un pixel de suivi |
| **Bouton ✓✓ dans la barre du haut de Gmail** (à gauche de la grille des applications, comme Mailsuite) | Le volet de suivi. Un compteur rouge signale les nouvelles activités depuis votre dernière visite. Si Gmail n’affiche pas sa barre, le bouton revient en onglet sur le bord droit |

### Les liens, comme dans Mailtrack

Par défaut, tous les liens d'un mail suivi sont suivis (réglage « Suivre les clics sur les liens »). Pour en exclure un, ou en ajouter un si le réglage est coupé :
- **menu ✓✓ ▾ de la rédaction** : la liste des liens du mail, chacun avec son interrupteur ;
- **bulle « Accéder au lien » de Gmail** (quand le curseur est sur un lien) : une ligne « Suivi des clics » ;
- **fenêtre « Modifier le lien »** : « Suivre les clics sur ce lien », appliqué à l'adresse saisie quand vous cliquez OK.

Un lien non suivi part avec son adresse d'origine. La bulle et la fenêtre dépendent de la présentation de Gmail : si Gmail la change, le menu ✓✓ ▾ reste le moyen sûr.

Pour lire les clics :
- **détail d'un mail** : chaque lien du mail, avec son nombre de clics et le dernier, « Pas encore cliqué » ou « Non suivi ». La liste des liens est notée sur cet ordinateur au moment de l'envoi ;
- **onglet Clics du volet** : chaque lien cliqué, par qui, combien de fois, quand ;
- **votre mail affiché dans Gmail** : une pastille à côté de chaque lien cliqué.

### Le volet

- **Activité** : vos chiffres (suivis, ouverts, cliqués, taux d'ouverture), les **pistes** (mails lus plusieurs fois, mails à relancer), puis le fil des derniers gestes, jour par jour : « Claire Martin a ouvert », « a ré-ouvert (3e fois) », « a cliqué un lien ». Les noms sont ceux que Gmail affiche.
- **Mails suivis** : la recherche (nom, adresse, objet) et les filtres Tous, Ouverts, Pas ouverts, Cliqués, Lus plusieurs fois, À relancer.
- **Clics** : le rapport des liens cliqués.

Un clic sur un mail, une coche ou une notification ouvre son détail : le statut, l'envoi, la première et la dernière ouverture, le dernier clic, les liens, la chronologie, les signaux ignorés (vous-même, doublons, robots) et le bouton **Ouvrir dans Gmail**.

### Les alertes (notifications de Chrome)

| Alerte | Quand |
| --- | --- |
| E-mail ouvert, ré-ouvert (Ne fois) | À chaque ouverture comptée |
| Lien cliqué | Avec le lien cliqué |
| Lu plusieurs fois | 3 ouvertures en 24 h : bon moment pour relancer |
| Ré-ouvert après N jours | Un mail ré-ouvert après une semaine sans ouverture |
| Pas encore ouvert | Au bout du délai choisi (3 jours par défaut), une seule fois. Plusieurs mails d'un coup sont regroupés |
| Votre récap du jour | Chaque matin à partir de 9 h : ouverts et cliqués depuis la veille, mails à relancer |

Toutes se règlent dans l'icône de l'extension → réglages. L'ouverture, le clic et le délai de relance se règlent aussi mail par mail, dans le menu ✓✓ ▾ de la rédaction.

L'icône de l'extension, dans la barre de Chrome, donne vos chiffres, les derniers mails (un clic les retrouve dans Gmail) et les réglages.

## Installation

### 1. Les tables (une fois)

Dans Supabase : **SQL Editor → New query**, collez `supabase/migrations/20261004120000_prospect_tracker_v3.sql`, puis cliquez **Run**.

### 2. La fonction serveur

Elle remplace l'actuelle `mail-tracker`, à la même adresse : les liens des mails déjà envoyés continuent de fonctionner.

- **Avec le tableau de bord**
  1. Allez dans **Edge Functions → mail-tracker → Code**, puis remplacez le contenu par `supabase/mail-tracker.un-seul-fichier.ts`.
  2. Cliquez **Deploy**.
  3. Dans **Details**, vérifiez que **Verify JWT** (ou « Enforce JWT Verification ») est désactivé.
  4. Dans **Edge Functions → Secrets**, ajoutez `TRACKER_TOKEN` avec la valeur du jeton de l'extension.
- **Ou en ligne de commande**, depuis ce dossier :
  ```
  supabase functions deploy mail-tracker --no-verify-jwt
  supabase secrets set TRACKER_TOKEN=<le jeton de l'extension>
  ```

### 3. L'extension

1. Ouvrez `chrome://extensions` et supprimez l'ancienne version.
2. Activez le **Mode développeur**, cliquez **Charger l'extension non empaquetée**, puis choisissez le dossier `extension`.
3. Rechargez Gmail.
4. Si le jeton n'est pas prérempli : icône de l'extension → **Réglages** → collez le jeton → **Enregistrer**.

## Tester sans se tromper

1. Envoyez un mail suivi à **une autre adresse**.
2. Ouvrez-le depuis ce compte-là : sur votre téléphone, dans un autre profil Chrome, ou dans un autre compte Gmail du même navigateur.
3. Ouvrez-le, cliquez un lien, attendez une minute, puis rouvrez-le. Le volet affiche « Ouvert », « Lien cliqué », puis « Ré-ouvert (2e fois) ».

Vos propres lectures, depuis le compte qui a envoyé, ne comptent pas, et c'est voulu. Elles apparaissent dans « signaux ignorés ».

## Limites, propres à tout suivi par pixel

- **Images bloquées chez le destinataire** : aucune ouverture n'est visible tant qu'il ne clique pas. Un clic rattrape l'ouverture.
- **Apple Mail** (protection de la vie privée) : les images peuvent se charger automatiquement à la réception. Ces ouvertures sont signalées « Apple Mail · peut être automatique ».
- **Antivirus d'entreprise** : écartés au mieux (voir ci-dessus), sans garantie absolue.
- **Vos lectures depuis l'application Gmail du téléphone** ne peuvent pas être reconnues : l'extension n'y tourne pas. Elles peuvent être comptées.
- **Historique** : les mails suivis avec l'ancienne version n'apparaissent plus dans la liste. Leurs nouveaux signaux sont tout de même enregistrés. Pour les reprendre, voir la fin du fichier SQL (noms de tables à adapter).

## Développement

```
node --experimental-strip-types --test tests/server.test.ts   # règles du serveur
node --test tests/background.test.mjs                         # service de l'extension
node tests/content.test.mjs                                   # script Gmail, sur un Gmail simulé (Playwright)
node tools/bundle.mjs                                         # fonction en un seul fichier
```
