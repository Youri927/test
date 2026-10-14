// Planches de présentation (boards/*.jpg, 1600 px de large), composées en HTML avec les polices du site, à partir des
// captures de tools/shots.mjs (o-*, name-*, story-*, 1440-*, m-*) et de l'image de partage (web/og.jpg).
//   node tools/boards.mjs <dossier des captures> [dossier de sortie, boards par défaut]
import {createRequire} from 'node:module';
import {mkdirSync, writeFileSync, rmSync, copyFileSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const src = resolve(process.argv[2] || 'shots');
const out = resolve(process.argv[3] || 'boards');
mkdirSync(out, {recursive: true});
copyFileSync(resolve('web/og.jpg'), `${src}/og.jpg`);

const css = `
@font-face { font-family: "Besley"; src: url("file://${resolve('vendor/fonts/Besley.woff2')}") format("woff2"); font-weight: 400 900; }
@font-face { font-family: "Rethink Sans"; src: url("file://${resolve('vendor/fonts/RethinkSans.woff2')}") format("woff2"); font-weight: 400 800; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #e9eae6; color: #17212e; font-family: "Rethink Sans", sans-serif; }
main { padding: 52px 40px 52px; }
.mark { display: flex; align-items: center; gap: 12px; margin: 0 0 30px; font: 700 24px/1 "Besley", serif; }
.mark svg { width: 26px; height: 31px; fill: none; stroke: #0253a0; stroke-width: 2.6; stroke-linejoin: round; }
h1 { margin: 0; font: 700 50px/1.04 "Besley", serif; letter-spacing: -0.018em; }
.sub { margin: 16px 0 38px; font-size: 20px; line-height: 1.55; color: #565d66; max-width: 62em; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 36px; }
figure { margin: 0; }
img { width: 100%; display: block; border: 1px solid #c9cbc5; background: #fff; }
figcaption { margin-top: 12px; font-size: 16.5px; line-height: 1.45; color: #565d66; }
figcaption strong { color: #17212e; font-weight: 700; }
`;
const MARK = `<svg viewBox="0 0 40 48" aria-hidden="true"><path d="M3 46V21a17 17 0 0 1 34 0v25z"/><path d="M3 21h34M20 4v42M11.5 21v25M28.5 21v25M3 29.5h34M3 38h34M20 21 8 9M20 21 32 9"/></svg>`;

// une planche : des rangées de figures ; cols = gabarit CSS des colonnes de la rangée
const page = ({title, sub, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body><main><p class="mark">${MARK}Skoda Construction</p><h1>${title}</h1><p class="sub">${sub}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${cap}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const three = (items) => ({cols: 'repeat(3, 1fr)', items});
const four = (items) => ({cols: 'repeat(4, 1fr)', items});
const BOARDS = {
  'le-nom': {
    title: 'Un Skoda derrière chaque chantier',
    sub: 'Le nom « Skoda », en très grand et dans le bleu de leur logo, reste en place pendant qu’on fait défiler ; leurs chantiers passent devant lui, photo après photo : le terrain nu, la coque en blocs, la maison finie, la cuisine, la maison refaite après la tempête, le studio de fitness. Puis la phrase qui donne la clé : « All our jobs are owner supervised. A Skoda is on every one of them. » Tout est en CSS (position sticky) : rien ne flotte, rien n’est recalculé.',
    rows: [
      three([['name-d-0.png', '<strong>L’accueil.</strong> Qui, quoi, où, et le nom en grand. Les deux boutons : la consultation et le téléphone.'], ['name-d-420.png', '<strong>On défile.</strong> Le nom reste ; le terrain nu et la coque en blocs passent devant.'], ['name-d-840.png', '<strong>La maison finie</strong> couvre le milieu du nom.']]),
      three([['name-d-1260.png', '<strong>Une cuisine, la maison restaurée</strong> : neuf et rénovation, devant le même nom.'], ['name-d-1680.png', '<strong>Trois niveaux, verre et bois.</strong> Chaque photo a sa légende, ce qu’elle montre, sans ville inventée.'], ['name-d-2100.png', '<strong>Le commercial</strong> aussi : un studio de fitness.']]),
      four([['name-m-0.png', '<strong>Téléphone.</strong> Le titre, les boutons, puis le nom.'], ['name-m-520.png', '<strong>Le nom reste</strong> au milieu de l’écran.'], ['name-m-1040.png', '<strong>Les chantiers passent devant,</strong> un par un.'], ['name-m-1560.png', '<strong>Toujours le même nom</strong> derrière.']]),
    ],
  },
  ouverture: {
    title: 'L’ouverture',
    sub: 'Le titre, le texte et les boutons sont là tout de suite. Puis les cinq lettres du nom montent une à une derrière leur ligne de base, et la première photo entre par le bas. 1,65 s, une fois, quand les polices sont là ; rien ne se décale. Avec « réduire les animations », tout est en place d’emblée.',
    rows: [
      three([['o-d-0000.png', '<strong>0 s.</strong> Le titre et les boutons, sans attendre.'], ['o-d-0300.png', '<strong>0,3 s.</strong> Les premières lettres montent.'], ['o-d-0600.png', '<strong>0,6 s.</strong> Le nom se lève, lettre après lettre.']]),
      three([['o-d-0800.png', '<strong>0,8 s.</strong> La première photo, le terrain nu, commence à entrer.'], ['o-d-1300.png', '<strong>1,3 s.</strong> Le nom est en place.'], ['o-d-1650.png', '<strong>1,65 s.</strong> Plus rien ne bouge seul.']]),
      four([['o-m-0000.png', '<strong>Téléphone, 0 s.</strong> Le titre et les boutons.'], ['o-m-0450.png', '<strong>0,45 s.</strong> Les lettres montent.'], ['o-m-0800.png', '<strong>0,8 s.</strong> Le nom se lève.'], ['o-m-1650.png', '<strong>Fin.</strong>']]),
    ],
  },
  'better-than-new': {
    title: 'Better than new',
    sub: 'La seule histoire complète de leurs photos : une maison abîmée par la tempête en novembre 2022, séchée murs ouverts, puis refaite en décembre 2023. Sur ordinateur, la partie reste en place pendant qu’on fait défiler, et la barre du temps avance de novembre 2022 à décembre 2023. Au téléphone, les trois étapes se lisent l’une sous l’autre.',
    rows: [
      two([['story-d-head.png', '<strong>L’entrée de la partie.</strong> Leur formule en titre, ce qu’ils font en dessous : ils accordent les finitions neuves à ce qui a survécu.'], ['story-d-12.png', '<strong>Novembre 2022.</strong> La maison après la tempête : les débris devant, le rez-de-chaussée dévasté.']]),
      two([['story-d-50.png', '<strong>Le séchage.</strong> Les murs ouverts en bas, les ventilateurs et les déshumidificateurs à chaque étage.'], ['story-d-92.png', '<strong>Décembre 2023.</strong> La même maison, refaite : le bardage, les fenêtres en arc, les rampes blanches.']]),
      three([['story-m-1.png', '<strong>Téléphone.</strong> Les dégâts.'], ['story-m-2.png', '<strong>Le séchage.</strong>'], ['story-m-3.png', '<strong>La maison refaite.</strong>']]),
    ],
  },
  sections: {
    title: 'Les parties du site',
    sub: 'Une seule page, dans l’ordre des questions d’un propriétaire : que construisent-ils, et chez moi une rénovation, et après un ouragan, et pour mon entreprise, qui sont-ils, viennent-ils chez moi, comment les joindre. Captures à la taille d’un écran d’ordinateur (1440 × 900).',
    rows: [
      two([['1440-homes.png', '<strong>Les maisons neuves.</strong> Ce qu’ils vérifient sur votre terrain avant de dessiner quoi que ce soit.'], ['1440-steps.png', '<strong>Du terrain à la maison.</strong> Trois chantiers, trois étapes : chaque photo se découvre quand elle arrive.']]),
      two([['1440-remodels.png', '<strong>Les rénovations.</strong> Six métiers, de la salle de bain à la maison entière.'], ['1440-rooms.png', '<strong>Les pièces.</strong> Douze photos de leurs intérieurs, en rangs de hauteur fixe ; un clic les ouvre en grand.']]),
      two([['1440-commercial.png', '<strong>Le commercial.</strong> Sept types de projets, et le travail planifié autour des heures d’ouverture.'], ['1440-family.png', '<strong>La famille.</strong> 1950, 1985, 2014, 2023 sur une ligne qui se trace une fois ; Chris et Mike, leurs mots.']]),
      two([['1440-area.png', '<strong>Le secteur.</strong> Les onze villes sur la vraie carte de la côte (limites du Census), par comté.'], ['1440-consultation.png', '<strong>La consultation.</strong> Le téléphone et l’e-mail en grand, la licence vérifiable, et un formulaire qui écrit l’e-mail.']]),
    ],
  },
  details: {
    title: 'Les détails qui comptent',
    sub: 'En dehors de l’ouverture, rien ne bouge seul : tout répond au défilement ou à un geste. La visionneuse montre chaque pièce en grand, jamais agrandie au-delà de l’original ; le formulaire reprend leurs propres fourchettes de budget, dit quoi corriger, puis prépare l’e-mail.',
    rows: [
      two([['1440-viewer.png', '<strong>La visionneuse :</strong> la photo, sa légende et sa place (2 of 12) ; flèches du clavier, Échap pour fermer.'], ['1440-form-errors.png', '<strong>Les erreurs :</strong> chacune dit quoi faire, sous son champ ; le focus va au premier à corriger.']]),
      two([['1440-form-budget.png', '<strong>Le budget :</strong> les fourchettes de leur site, qui changent selon qu’il s’agit d’une maison neuve ou d’une rénovation.'], ['1440-form-ready.png', '<strong>La demande prête :</strong> l’application d’e-mail s’ouvre avec elle ; sinon, on la copie en un clic.']]),
      two([['og.jpg', '<strong>L’image de partage</strong> (1200 × 630), pour un lien envoyé par texto ou sur Facebook.'], ['1440-foot.png', '<strong>Le pied de page :</strong> les deux bureaux, les coordonnées, la licence et les parties de la page.']]),
    ],
  },
  telephone: {
    title: 'Sur téléphone',
    sub: 'La même page, recomposée pour une main : le nom et le menu en haut, des cibles de 44 px, des photos jamais agrandies, la maison restaurée en trois étapes l’une sous l’autre. Captures à 390 × 844.',
    rows: [
      four([['m-hero.png', '<strong>L’accueil.</strong>'], ['m-menu.png', '<strong>Le menu,</strong> avec la consultation et l’appel.'], ['m-steps.png', '<strong>Du terrain à la maison.</strong>'], ['m-rooms.png', '<strong>Les pièces.</strong>']]),
      four([['m-storm.png', '<strong>Better than new.</strong>'], ['m-family.png', '<strong>La famille.</strong>'], ['m-area.png', '<strong>La carte.</strong>'], ['m-form.png', '<strong>Le formulaire.</strong>']]),
    ],
  },
};

const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1600, height: 1000}, deviceScaleFactor: 1});
for (const [name, board] of Object.entries(BOARDS)) {
  const tmp = `${src}/_board.html`;
  writeFileSync(tmp, page(board));
  await p.goto('file://' + tmp, {waitUntil: 'load'});
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({path: `${out}/${name}.jpg`, type: 'jpeg', quality: 84, fullPage: true});
  rmSync(tmp);
  console.log(`${out}/${name}.jpg`);
}
await b.close();
