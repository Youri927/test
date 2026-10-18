# Audit SEO + GEO : zyndahomes.com (18 octobre 2026)

Site actuel, Squarespace. Origine normalisée : `https://zyndahomes.com/` redirige vers `https://www.zyndahomes.com/`.
Requêtes une par une, avec l'agent descriptif `maquinable-geo/0.1`. Lecture seule : rien n'a été modifié.

## Résumé
- Pages contrôlées : 50 (sur 387 adresses du sitemap : les 8 pages et 42 articles), plus un échantillon de 20 pages de
  mots-clés et de catégories pour leur statut
- Problèmes critiques : 2
- Avertissements : 6
- Opportunités : 4

## CRITIQUE (à corriger tout de suite)

1. **Le même titre sur toutes les pages** : les 45 pages qui répondent portent exactement le titre « Naples Remodeling
   Contractor & Custom Homes | Zynda Custom Homes » (65 signes, au-dessus des 60 conseillés), articles compris. Pour un
   moteur, 45 pages qui disent la même chose se concurrencent entre elles. → Un titre par page dans les réglages SEO de
   Squarespace (ex. « Condo Renovations in Naples & Marco Island | Zynda »), et laisser les articles reprendre leur
   propre titre.
2. **Cinq adresses du sitemap renvoient une erreur 404** :
   `/blog/blog/gulf-shore-boulevard-naples-condo-remodeling`, `/blog/best-countertop-materials-florida-homes`,
   `/blog/naples-master-bathroom-remodel`, `/blog/naples-master-bathroom-remodel-before-after`,
   `/blog/naples-florida-bathroom-remodeling-transform-your-space`. → Rediriger chacune (Paramètres › Redirections
   d'URL) vers l'article ou la page la plus proche, ou les republier.

## AVERTISSEMENTS

3. **Plusieurs h1 sur chaque page** : de 5 (contact) à 26 (blog) ; l'accueil en a 7, la page des propriétaires 20. Le
   pied de page à lui seul en ajoute quatre (nom, adresse, téléphone, e-mail). → Un seul h1 par page, le reste en h2/h3
   ou en paragraphes.
4. **Descriptions** : absentes sur 12 articles (dont « May Is in Full Swing », « Renovate While You Vacate »), hors de
   la plage 100-160 signes sur 19 pages (la page des zones en a 293, un article 357). → Une description de 120 à 155
   signes par page.
5. **Image de partage** : absente sur 9 pages (dont `/contactus` et `/areas-we-serve`), le logo sur 5 (dont l'accueil
   et les services). Un partage sur Facebook ou par message montre un logo au lieu d'une maison. → Une vraie photo
   (1200 × 630) par page importante.
6. **Sitemap gonflé** : sur 387 adresses, 234 pages de mots-clés et 103 pages de catégories du blog (pages sans contenu
   propre, presque identiques entre elles), plus `/home`, doublon de l'accueil. → Réduire fortement les mots-clés et
   catégories (Squarespace les publie tous dans le sitemap), retirer les doublons.
7. **Données structurées incohérentes** : le code postal est 34116 dans le JSON-LD (`Organization`, `LocalBusiness`)
   mais 34104 partout ailleurs et au registre de l'État ; les horaires finissent par deux valeurs vides
   (« Fr 09:00-16:00, , ») ; le type est `LocalBusiness` générique, sans téléphone ni licence. → Corriger l'adresse dans
   « Informations sur l'entreprise » ; idéalement un `GeneralContractor` avec le numéro de licence.
8. **37 images sans texte de remplacement** sur 280 (7 sur la page des zones), et des noms de fichiers qui deviennent
   des textes de remplacement peu utiles (« kitchen WOW.png »). → Décrire chaque photo en une phrase.

## GAINS RAPIDES (fort effet, peu d'effort)
- Les titres et descriptions par page (points 1 et 4) : une heure de travail dans Squarespace.
- Les cinq redirections des 404 (point 2) : quelques minutes.
- Le code postal du JSON-LD (point 7) : un champ à corriger.
- Une photo de partage sur l'accueil (point 5).

## OPPORTUNITÉS GEO
- **robots.txt : rien à corriger.** 13 robots (moteurs : Googlebot, Bingbot ; assistants : GPTBot, OAI-SearchBot,
  ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User ; entraînement :
  Google-Extended, CCBot, Bytespider) testés sur 16 adresses publiques : aucune bloquée, et les deux analyseurs
  (`urllib.robotparser` et `protego`, qui applique la règle du préfixe le plus long) donnent les mêmes verdicts. Le
  fichier liste bien le sitemap.
- **`/llms.txt` absent** (404). C'est une proposition, pas une norme, et les assistants la lisent inégalement ; un
  fichier court (qui ils sont, licence, zones, prestations, contact) ne coûte rien. Le nouveau site en fournit un.
- **Faits contradictoires**, que les assistants reprennent tels quels : « since 2001 », « over 20+ years », « over 25
  years » selon les pages. → Une seule formule partout (« since 2001 »).
- **Articles** : 37 sur 37 ont un balisage `Article` valide, mais ce sont surtout des textes promotionnels répétitifs ;
  les questions que posent vraiment les propriétaires (quand commencer un chantier de condo, quelles approbations, que
  se passe-t-il pendant l'été) n'y ont pas de réponse directe. Un résumé en tête et une courte FAQ sur les deux ou trois
  articles les plus lus les rendraient citables (`geo-optimize` ajoute le résumé et la FAQ à un article).

## Ce que corrige le nouveau site
Une seule page (le site actuel n'a que huit pages utiles), un titre et une description propres, un seul h1, une image de
partage (la maison neuve), des textes de remplacement sur chaque photo, un JSON-LD `GeneralContractor` avec l'adresse
juste (34104), les horaires, la licence CGC056812 (avec le lien vers la fiche de l'État), les zones et les sept avis tels
qu'ils sont publiés, un `llms.txt`, un sitemap d'une adresse, et les redirections des anciennes pages et des articles
vers les sections correspondantes (fichiers `web/_redirects` et `web/vercel.json`).

## NON VÉRIFIÉ
- Performance et mobile du site actuel : pas de clé PageSpeed Insights. (Le nouveau site, mesuré avec Lighthouse en
  local : 100 sur ordinateur, 95 sur téléphone.)
- La fiche Houzz (derrière une vérification Cloudflare) et la fiche Google de l'entreprise.

Maquinable propose un diagnostic payant avec le score de citabilité IA et le plan de corrections priorisé (voir le README du plugin).
