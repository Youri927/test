// Planches de présentation (boards/*.jpg, 1600 px de large), composées en HTML avec la police et le logo du site, à
// partir des captures de tools/shots.mjs (o-*, draw-*, roofs-*, 1440-*, m-*) et de l'image de partage (web/og.jpg).
//   node tools/boards.mjs <dossier des captures> [dossier de sortie, boards par défaut]
import {createRequire} from 'node:module';
import {mkdirSync, writeFileSync, rmSync, copyFileSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const src = resolve(process.argv[2] || 'shots');
const out = resolve(process.argv[3] || 'boards');
mkdirSync(out, {recursive: true});
copyFileSync(resolve('web/og.jpg'), `${src}/og.jpg`);
const logo = JSON.parse(readFileSync(resolve('data/logo.json'), 'utf8'));
const GOLD = '#C3A046';
const STAR =
  `<svg viewBox="0 6 100 88" aria-hidden="true"><path d="${logo.mark.roof}" fill="#1C1E21" fill-rule="evenodd"/><path d="${logo.mark.bar}" fill="${GOLD}"/>` +
  `<path d="${logo.mark.right}" fill="#1C1E21" fill-rule="evenodd"/><path d="${logo.mark.left}" fill="${GOLD}" fill-rule="evenodd"/>` +
  `<path d="${logo.mark.five}" fill="${GOLD}" stroke="#E9EAE6" stroke-width="2.2" paint-order="stroke" stroke-linejoin="round"/></svg>`;

const css = `
@font-face { font-family: "Saira"; src: url("file://${resolve('vendor/fonts/Saira.woff2')}") format("woff2"); font-weight: 400 800; font-stretch: 62.5% 125%; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #e9eae6; color: #1c1e21; font-family: "Saira", sans-serif; }
main { padding: 52px 40px 52px; }
.mark { display: flex; align-items: center; gap: 12px; margin: 0 0 30px; font: 640 22px/1 "Saira"; font-stretch: 125%; letter-spacing: 0.01em; }
.mark svg { width: 34px; height: 30px; }
h1 { margin: 0; font: 760 56px/1.02 "Saira"; font-stretch: 70%; letter-spacing: -0.004em; }
.sub { margin: 16px 0 38px; font-size: 20px; line-height: 1.55; color: #596068; max-width: 64em; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 36px; }
figure { margin: 0; }
img { width: 100%; display: block; border: 1px solid #c9cbc5; background: #fff; }
figcaption { margin-top: 12px; font-size: 16.5px; line-height: 1.45; color: #596068; }
figcaption strong { color: #1c1e21; font-weight: 700; }
`;

// une planche : des rangées de figures ; cols = gabarit CSS des colonnes de la rangée
const page = ({title, sub, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body><main><p class="mark">${STAR}FIVE POINTS ROOFING</p><h1>${title}</h1><p class="sub">${sub}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${cap}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const three = (items) => ({cols: 'repeat(3, 1fr)', items});
const four = (items) => ({cols: 'repeat(4, 1fr)', items});
const five = (items) => ({cols: 'repeat(5, 1fr)', items});
const BOARDS = {
  'le-toit': {
    title: 'L’ouverture : un toit de mots',
    sub: 'Leur phrase, « Roofing is in our blood », écrite sur les deux pentes d’un toit à 6/12, et l’étoile de leur logo au faîte (la pointe du haut de leur étoile est déjà un toit). Le titre, sous le toit, est là tout de suite ; les rampants se tracent des avant-toits au faîte, les mots montent la pente jusqu’à leur place, l’étoile se pose en tournant d’une pointe. 1,9 s, une fois ; avec « réduire les animations », tout est en place d’emblée.',
    rows: [
      three([['o-d-0000.png', '<strong>0 s.</strong> Le titre, la phrase d’accueil et les boutons, sans attendre.'], ['o-d-0250.png', '<strong>0,25 s.</strong> Les rampants partent des avant-toits.'], ['o-d-0500.png', '<strong>0,5 s.</strong> Les mots montent la pente.']]),
      three([['o-d-0750.png', '<strong>0,75 s.</strong> Les mots sont posés sur le toit.'], ['o-d-1000.png', '<strong>1 s.</strong> L’étoile arrive au faîte en tournant.'], ['o-d-1900.png', '<strong>1,9 s.</strong> Plus rien ne bouge seul.']]),
      four([['o-m-0000.png', '<strong>Téléphone, 0 s.</strong> Le titre et les boutons.'], ['o-m-0500.png', '<strong>0,5 s.</strong> Les mots montent.'], ['o-m-1000.png', '<strong>1 s.</strong> L’étoile.'], ['o-m-1900.png', '<strong>Fin.</strong>']]),
    ],
  },
  'les-toits': {
    title: 'Trois toits, une seule ligne',
    sub: 'Une maison, un mobile-home, un bâtiment commercial : la même ligne de toit dorée passe des deux pignons de la maison au toit bas du mobile-home, puis au toit plat entre ses acrotères, et le bâtiment se transforme avec elle. Sur chaque dessin, les endroits où ce toit-là fuit, d’après leurs propres textes, reliés à la liste. La première fois qu’on arrive, le dessin se trace.',
    rows: [
      four([['draw-0450.png', '<strong>Le tracé, 0,45 s.</strong> La ligne de toit part de l’avant-toit.'], ['draw-0900.png', '<strong>0,9 s.</strong> La maison apparaît sous elle.'], ['draw-1300.png', '<strong>1,3 s.</strong> Les repères arrivent un à un.'], ['draw-2000.png', '<strong>2 s.</strong> Les quatre endroits à surveiller.']]),
      two([['roofs-home.png', '<strong>Homes.</strong> Les solins des tuyaux, de la cheminée, le puits de lumière, la noue entre les deux pignons.'], ['roofs-morph.png', '<strong>À mi-chemin.</strong> L’indicateur de l’onglet s’étire vers le suivant ; la ligne de toit et la maison se transforment ensemble.']]),
      two([['roofs-mobile.png', '<strong>Mobile homes.</strong> Les tuyaux, l’aération, les joints de la membrane, la tache au plafond.'], ['roofs-commercial.png', '<strong>Commercial.</strong> L’eau qui stagne, les joints, les solins contre les murs et le groupe de climatisation, la gargouille.']]),
      two([['roofs-hover.png', '<strong>Relié à la liste :</strong> survoler « Wall and chimney flashing » allume le repère 2 sur le dessin, et l’inverse.'], ['wipe.png', '<strong>Les photos se découvrent à la pente du toit :</strong> un bord en biais (6/12) qui monte, une photo après l’autre.']]),
    ],
  },
  sections: {
    title: 'Les parties du site',
    sub: 'Une seule page, dans l’ordre des questions d’un propriétaire du comté de Polk : quel toit, que faire après une tempête, réparer ou remplacer, qu’est-ce qui est garanti, qui sont-ils, que disent les clients, viennent-ils chez moi, comment les joindre. Captures à la taille d’un écran d’ordinateur (1440 × 900).',
    rows: [
      two([['1440-hero.png', '<strong>L’accueil.</strong> Le toit de mots, le titre dessous, la photo d’une inspection, la licence, la garantie, le délai.'], ['1440-storm.png', '<strong>Après une tempête.</strong> Quatre étapes, « 5 days or less », et ce qu’on trouve sous les bardeaux.']]),
      two([['1440-replace.png', '<strong>Réparer, recouvrir, remplacer.</strong> Les trois réponses, et quand chacune convient.'], ['1440-job.png', '<strong>Sur leurs chantiers.</strong> La dépose, la sous-couche, les bardeaux, le toit fini ; ce que comprend un toit neuf.']]),
      two([['1440-warranty.png', '<strong>Les garanties</strong> sur une règle graduée en années : 10 ans, 20 ans, de 30 ans à vie.'], ['1440-family.png', '<strong>La famille.</strong> 1955, trois générations, 2021 ; la licence de l’État en plaque, vérifiable en un clic.']]),
      two([['1440-reviews.png', '<strong>Les avis.</strong> Les sept, mot pour mot ; le premier en grand.'], ['1440-area.png', '<strong>La zone.</strong> Le bureau de Lakeland, les horaires, les neuf villes.']]),
    ],
  },
  details: {
    title: 'Les détails qui comptent',
    sub: 'En dehors de l’ouverture, rien ne bouge seul : tout répond au défilement ou à un geste. Les questions s’ouvrent en glissant ; le formulaire dit quoi corriger, puis prépare l’e-mail ; le pied de page reprend le toit de l’accueil, avec le numéro dessous.',
    rows: [
      two([['1440-faq.png', '<strong>Les questions</strong> de leur blog, réunies et balisées pour les moteurs et les assistants.'], ['1440-estimate.png', '<strong>L’estimation.</strong> Le téléphone et l’e-mail en grand, ce qui se passe ensuite, et un formulaire court.']]),
      two([['1440-form-errors.png', '<strong>Les erreurs :</strong> chacune dit quoi faire, sous son champ ; le focus va au premier à corriger.'], ['1440-form-ready.png', '<strong>La demande prête :</strong> l’application d’e-mail s’ouvre avec elle ; sinon, on la copie en un clic.']]),
      two([['og.jpg', '<strong>L’image de partage</strong> (1200 × 630), pour un lien envoyé par texto ou sur Facebook.'], ['1440-foot.png', '<strong>Le pied de page :</strong> le toit de l’accueil revient, le numéro dessous ; le bureau, les coordonnées, la licence.']]),
    ],
  },
  telephone: {
    title: 'Sur téléphone',
    sub: 'La même page, recomposée pour une main : le logo, « Call » et le menu en haut, des onglets et des boutons de 44 px au moins, des repères lisibles sur le dessin, la rangée de photos qui défile du doigt. Captures à 390 × 844.',
    rows: [
      five([['m-hero.png', '<strong>L’accueil.</strong>'], ['m-menu.png', '<strong>Le menu,</strong> avec l’appel.'], ['m-roofs.png', '<strong>Les toits.</strong>'], ['m-storm.png', '<strong>La tempête.</strong>'], ['m-job.png', '<strong>Les chantiers,</strong> au doigt.']]),
      five([['m-warranty.png', '<strong>Les garanties.</strong>'], ['m-license.png', '<strong>La licence.</strong>'], ['m-form.png', '<strong>Le formulaire.</strong>'], ['m-foot.png', '<strong>Le pied de page.</strong>'], ['o-m-1900.png', '<strong>Le toit de mots,</strong> en entier.']]),
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
