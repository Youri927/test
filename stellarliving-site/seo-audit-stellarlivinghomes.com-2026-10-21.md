# Audit SEO + GEO : stellarlivinghomes.com (21 octobre 2026)

Site actuel, Wix. Origine : `https://www.stellarlivinghomes.com/`. Requêtes une par une, avec l'agent descriptif
`maquinable-geo/0.1`, au rythme d'une page toutes les deux minutes et demie : le site répond « 429, Checking Your
Request » dès qu'on va plus vite, et cette protection n'a jamais été contournée. Lecture seule : rien n'a été modifié.

## Résumé
- Pages contrôlées : 31 sur les 47 adresses du plan du site :
  - l'accueil, les pages About, Reviews, Contact et Screen Enclosures ;
  - les 16 pages de projets et les listes de projets ;
  - le blog et 3 de ses 9 articles ;
  - les pages oubliées (`/copy-of-reviews`, `/projects-old-hide`, `/talis-park-copy`, `/instagram`).
- Problèmes critiques : 2
- Avertissements : 7
- Opportunités : 4

## CRITIQUE (à corriger tout de suite)

1. **Six pages publiques portent le nom de familles clientes** (`/<nom>-residence`), et le plan du site les donne aux
   moteurs. Ce sont des noms de particuliers, liés à des chantiers chez eux. → Les retirer du site et du plan du site
   (ou, avec l'accord des clients, les rebaptiser par le lieu). Dans Wix : Pages, « Afficher dans les résultats de
   recherche » désactivé, puis suppression et redirection 301. Leurs adresses ne sont pas recopiées dans ce rapport.
2. **Les 16 pages de projets n'ont presque pas de texte.**
   - Ces pages sont le portfolio de l'entreprise, mais elles ne disent rien : pour un moteur, ce sont des pages
     minces et presque identiques.
   - Chacune compte environ 65 mots, menu et pied de page compris.
   - Le h1 ne donne que le quartier (« Pelican Bay »), et le titre aussi : « Pelican Bay | Stellar Living Homes »
     revient six fois, « Talis Park - Brightling » deux fois.
   - Aucune n'a de description ni d'image de partage.
   - Leurs galeries comptent 10 à 26 photos sans texte de remplacement.
   - Leurs données structurées se limitent à une `ImageObject` et à un bloc JSON-LD vide (`{}`).
   - → Pour chaque projet, il faut :
     - un titre (« Breakwater condo remodel, Pelican Bay, Naples | Stellar Living Homes ») ;
     - deux ou trois phrases sur ce qui a été fait et quand ;
     - une description et une photo de partage ;
     - un texte de remplacement par photo.

## AVERTISSEMENTS

3. **Des pages oubliées et des doublons, dans le plan du site** :
   - `/projects` (« Work », une ancienne liste de projets) ;
   - `/projects-old-hide`, titrée « Projects - OLD - Hide », sans h1 ;
   - `/copy-of-reviews`, mêmes avis et même titre que `/reviews`, chacune canonique vers elle-même ;
   - `/talis-park-copy`, `/talis-park-1`, `/talis-park-2`, `/copy-of-pelican-bay` ;
   - `/instagram`, une page vide (l'en-tête et le pied de page seulement, sans h1) ;
   - et la liste des projets s'appelle « Projects (List) - CMS ».
   - → Retirer ou rediriger ces pages, et renommer la liste (« Projects in Naples | Stellar Living Homes »).
4. **Descriptions** :
   - absentes sur 27 des 31 pages, dont About, Screen Enclosures, toutes les pages de projets et les articles ;
   - les quatre pages qui en ont une (l'accueil, Contact, Work, Reviews) partagent la même, longue de 296 signes
     (« Stellar Living Homes is a general contractor located in sunny Naples, FL with over 38 years… »).
   - → Une description de 120 à 155 signes par page, propre à la page.
5. **L'image de partage est une photo d'annonce immobilière.**
   - C'est la même image sur l'accueil et les pages principales : une photo de Talis Park avec le logo posé dessus,
     et le filigrane « SWFLAMLS » dans le coin.
   - Les 16 pages de projets n'en ont aucune.
   - → Une de leurs propres photos (1200 × 630), sans filigrane.
6. **Données structurées minimales**.
   - Sur l'accueil :
     - un `LocalBusiness` sans logo, sans `sameAs` (Instagram), sans la licence et sans les avis ;
     - son nom porte un point final (« Stellar Living Homes LLC. ») ;
     - son image est le fichier du logo de l'en-tête ;
     - `WebSite` est déclaré deux fois, dont une avec une recherche interne (`/search`), non vérifiée.
   - Les douze avis ne sont balisés nulle part.
   - → Un `GeneralContractor` complet : licence CGC1531679, téléphone, adresse, Instagram et avis. Le nouveau site en
     fournit un.
7. **336 images sans texte de remplacement** sur 466, réparties sur 20 pages :
   - les galeries de projets ;
   - 9 des 11 images de la page Screen Enclosures.
   - → Une phrase par photo : la pièce, ce qui a été fait.
8. **Titres** :
   - « Blog | Stellar Living Homes » (27 signes) et « Screen Enclosure Process » (24 signes) sont trop courts ;
   - les titres se terminent tantôt par « Stellar Living Homes », tantôt par « Stellar Living Homes LLC. ».
   - → Une formule unique : « [sujet] | Stellar Living Homes ».
9. **Le blog** : `/blog` n'a pas de h1.
   - Les 9 articles datent tous de mars 2023 et sont génériques (« 7 Signs Your Florida Home is Due for a Renovation »).
   - Leur balisage `BlogPosting` signe « dpalmeri100 », l'identifiant de l'e-mail, à la place d'un nom.
   - → Un h1 sur le blog, et un auteur présentable (le nom de l'entreprise suffit).

## GAINS RAPIDES (fort effet, peu d'effort)
- **Retirer les six pages au nom de clients et les pages oubliées** du plan du site (points 1 et 3) : quelques clics
  dans les réglages SEO des pages Wix.
- **Une description par page, et des titres complets** pour les projets (points 2, 4 et 8) : une heure de travail.
- **Une photo à eux comme image de partage** (point 5).
- **Les textes de remplacement des galeries** (point 7), en commençant par les cinq pages de Breakwater.

## OPPORTUNITÉS GEO
- **robots.txt : rien à corriger.**
  - 14 robots testés sur 48 adresses publiques (le plan du site et `/llms.txt`) :
    - moteurs : Googlebot, Bingbot ;
    - assistants : GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot,
      Perplexity-User ;
    - entraînement : Google-Extended, CCBot, Bytespider ;
    - plus PetalBot.
  - Aucune adresse n'est bloquée, sauf pour PetalBot (le moteur de Huawei), exclu par la règle par défaut de Wix :
    c'est un choix à confirmer, sans effet sur Google, Bing ou les assistants.
  - Les deux analyseurs (`urllib.robotparser` et `protego`, qui applique la règle du préfixe le plus long) donnent les
    mêmes verdicts.
  - Le fichier liste bien le plan du site.
- **`/llms.txt` existe, généré par Wix.**
  - Son format est valide : un titre, un résumé, puis des sections.
  - Mais il ne pointe que vers l'accueil, et le reste décrit l'accès aux outils de la plateforme Wix pour les agents.
    Rien sur les prestations, les chantiers, la licence ou les avis.
  - C'est une proposition, pas une norme, et les assistants la lisent inégalement. Un fichier écrit à la main ne coûte
    rien : le nouveau site en fournit un, avec ses liens vers chaque partie et les avis cités mot pour mot.
- **Des faits à accorder**, que les assistants reprennent tels quels :
  - « Founded 2014 » et « over 38 years », face à une licence de l'État délivrée en 2022 ;
  - la page About répète l'accueil mot pour mot ;
  - « ©2022 » dans le pied de page.
  - → Une phrase qui explique les 38 ans (le métier du dirigeant, la licence actuelle), et la même partout.
- **Les avis et les chantiers sont leurs meilleures sources de citation.**
  - Les douze avis sont précis : « on time and on budget » trois fois mot pour mot, les ouragans, « the customer's
    advocate ».
  - Leurs photos sont datées : par exemple, un condo entier de Breakwater photographié en sept minutes le 3 novembre
    2025.
  - Une page par chantier, avec ce qui a été fait, où et quand, se cite bien mieux que des articles génériques.
  - Sur les articles existants, `geo-optimize` peut ajouter un résumé en tête et une courte FAQ, mais réécrire deux ou
    trois articles à partir de leurs chantiers rapporterait davantage.

## Ce que corrige le nouveau site
- Une seule page, avec un titre et une description propres (55 et 160 signes), et un seul h1.
- Une image de partage faite de leur propre photo et d'un de leurs avis.
- Un texte de remplacement sur chacune des 156 images.
- Un JSON-LD `GeneralContractor` avec la licence CGC1531679 (et le lien vers la fiche de l'État), l'adresse, le
  téléphone, Instagram et les douze avis tels qu'ils sont publiés. Le texte des avis est vérifié contre la page à
  chaque construction.
- Un `llms.txt` écrit à la main et un plan du site d'une adresse.
- Les redirections des anciennes pages, des projets et des articles vers les parties correspondantes (fichiers
  `web/_redirects` et `web/vercel.json`).
- Ni nom de client, ni numéro de logement, ni photo d'annonce.

## NON VÉRIFIÉ
- **Performance et mobile du site actuel** : pas de clé PageSpeed Insights. Le nouveau site, mesuré avec Lighthouse en
  local, obtient 100 sur ordinateur et 96 sur téléphone.
- **16 adresses du plan du site n'ont pas été ouvertes** :
  - les six pages au nom de clients (volontairement) ;
  - `/talis-park` (trois réponses 429 de suite), `/talis-park-1`, `/talis-park-2`, `/copy-of-pelican-bay` ;
  - six des neuf articles, pour ménager le site.
- **Les réponses 429** : le site les a renvoyées à notre client, même à une page toutes les deux minutes et demie. Cela
  ne prouve pas que les robots des moteurs sont freinés. Les statistiques d'exploration de la Search Console le
  montreraient.
- **La fiche Google de l'entreprise** et les annuaires (Houzz, BBB).

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
