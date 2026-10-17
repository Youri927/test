// Planches de présentation (boards/*.jpg, 1600 px de large), composées en HTML avec les polices et l'emblème du site,
// à partir des captures de tools/shots.mjs (o-*, 1440-*, m-*) et de l'image de partage (web/og.jpg).
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
const EMBLEM = `<svg viewBox="0 0 ${logo.w} ${logo.h}" aria-hidden="true"><path d="${logo.ringBold}" fill="#2E5AB2" fill-rule="evenodd"/><path d="${logo.landBold}" fill="#2E5AB2" fill-rule="evenodd"/></svg>`;
const font = (f) => `url("file://${resolve('vendor/fonts/' + f)}") format("woff2")`;
const css = `
@font-face { font-family: "Gloock"; src: ${font('Gloock.woff2')}; }
@font-face { font-family: "Albert Sans"; src: ${font('AlbertSans.woff2')}; font-weight: 400 700; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #dde4e2; color: #18213a; font-family: "Albert Sans", sans-serif; }
main { padding: 52px 40px 52px; }
.mark { display: flex; align-items: center; gap: 12px; margin: 0 0 30px; font: 400 24px/1 "Gloock"; }
.mark svg { width: 40px; height: auto; }
h1 { margin: 0; font: 400 58px/1.02 "Gloock"; letter-spacing: -0.012em; }
.sub { margin: 16px 0 38px; font-size: 20px; line-height: 1.55; color: #4e5a6c; max-width: 64em; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 36px; }
figure { margin: 0; }
img { width: 100%; display: block; border: 1px solid #c4ccca; background: #fff; }
figcaption { margin-top: 12px; font-size: 16.5px; line-height: 1.45; color: #4e5a6c; }
figcaption strong { color: #18213a; font-weight: 700; }
`;
const page = ({title, sub, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body><main><p class="mark">${EMBLEM}Florida South Construction</p><h1>${title}</h1><p class="sub">${sub}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${cap}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const three = (items) => ({cols: 'repeat(3, 1fr)', items});
const four = (items) => ({cols: 'repeat(4, 1fr)', items});
const five = (items) => ({cols: 'repeat(5, 1fr)', items});
const six = (items) => ({cols: 'repeat(6, 1fr)', items});
const BOARDS = {
  'la-liste': {
    title: 'L’ouverture : « Give us your list »',
    sub: 'Leur phrase, mise en scène : une liste de travaux écrite sur le ciel de leur photo, de plus en plus grand, du trou à reboucher à la maison à construire. Les lignes se barrent une à une, puis « Consider it done. » s’écrit dans le même sens. 2,9 s, une fois ; avec « réduire les animations » ou sans JavaScript, tout est barré et visible d’emblée. Le ciel de la page est celui de la photo, relevé pixel par pixel : on ne voit pas où elle commence.',
    rows: [
      three([['o-d-0300.png', '<strong>0,3 s.</strong> La liste, entière, avant les traits ; le titre et les boutons sont déjà là.'], ['o-d-1000.png', '<strong>1 s.</strong> Les premières lignes se barrent.'], ['o-d-1700.png', '<strong>1,7 s.</strong> Le trait suit la taille de la ligne : plus épais pour les grands chantiers.']]),
      three([['o-d-2000.png', '<strong>2 s.</strong> « Build the house. » est barrée.'], ['o-d-2400.png', '<strong>2,4 s.</strong> « Consider it done. » s’écrit de gauche à droite.'], ['o-d-3200.png', '<strong>3 s.</strong> Plus rien ne bouge seul ; les débords blancs montent du bas.']]),
      four([['o-m-0300.png', '<strong>Téléphone, 0,3 s.</strong> « Call » en haut de l’écran.'], ['o-m-1300.png', '<strong>1,3 s.</strong> Les traits.'], ['o-m-2400.png', '<strong>2,4 s.</strong> La phrase.'], ['o-m-3200.png', '<strong>Fin.</strong> La photo recadrée sur l’angle du débord.']]),
    ],
  },
  'les-cadres': {
    title: 'La taille des cadres suit celle du chantier',
    sub: '« No job is too small. » : trois rangées, pas trois cartes. La petite photo d’un étrier pour l’entretien, la photo moyenne d’une ossature pour la rénovation, puis la maison, dont le cadre s’ouvre jusqu’aux bords de l’écran en défilant. La photo ne bouge pas et ne zoome pas : seul son cadre s’ouvre. Toutes les photos du site arrivent ainsi, plus ou moins selon leur taille.',
    rows: [
      two([['1440-work.png', '<strong>Entretien et réparations.</strong> Leur texte (« from patching holes to replacing fixtures »), la plus petite photo.'], ['1440-remodel.png', '<strong>Rénovation.</strong> Leur liste, composée comme celle de l’accueil ; les rénovations « artistiques ».']]),
      two([['1440-house-mid.png', '<strong>La maison, à mi-ouverture.</strong> Fermé, le cadre a la largeur du texte.'], ['1440-house-open.png', '<strong>Ouvert,</strong> il a celle de l’écran.']]),
    ],
  },
  'deux-maisons': {
    title: '« Another quality home. »',
    sub: 'Ce qu’écrit le panneau de leur chantier. Deux maisons, deux mosaïques écrites pour leurs photos (une photo donne la hauteur de chaque rangée, les autres se recadrent au centre), chaque photo légendée pour ce qu’elle montre. Un clic, ou Entrée : la photo grandit depuis sa vignette jusqu’au plein écran ; flèches, doigt, Échap pour revenir.',
    rows: [
      two([['1440-houses.png', '<strong>La maison sur pilotis, 2015.</strong> Débords blancs, panneau du chantier.'], ['1440-raised.png', '<strong>La suite :</strong> palmiers royaux, bardage, porche.']]),
      two([['1440-block.png', '<strong>La maison en blocs dans les pins, 2016,</strong> avant les plaques de plâtre.'], ['1440-viewer-grow.png', '<strong>La visionneuse grandit</strong> depuis la vignette touchée (0,15 s).']]),
      two([['1440-viewer.png', '<strong>Ouverte :</strong> la photo entière, sa légende, la maison et l’année, « 2 of 15 ».'], ['m-viewer.png', '<strong>Au téléphone,</strong> on passe d’une photo à l’autre du doigt.']]),
    ],
  },
  confiance: {
    title: 'Judson, la licence, les avis',
    sub: 'Qui est derrière : Judson White, nommé et montré, son message mot pour mot, leurs trois engagements. La licence de l’État en carte, avec le lien pour la vérifier. Les deux avis, en grand, signés du prénom et de l’initiale : les mots passent du gris à l’encre au fil de la lecture.',
    rows: [
      two([['1440-judson.png', '<strong>Judson White, president.</strong> Le portrait, son message.'], ['1440-promises.png', '<strong>Leurs engagements,</strong> à côté de Judson et d’un membre de l’équipe.']]),
      two([['1440-license.png', '<strong>CGC1515532.</strong> Certified General Contractor depuis le 2 juin 2008, actif jusqu’au 31 août 2028.'], ['1440-reviews.png', '<strong>Les avis, à mi-lecture :</strong> le second s’allume à son tour.']]),
    ],
  },
  demande: {
    title: '« Send us your list. »',
    sub: 'Le ciel referme la page. Une demande courte : le nom, un téléphone ou un e-mail, la ville, la liste (sur un champ réglé comme une feuille) et leur question, « Who sent you our way? ». Le bouton prépare l’e-mail ; si l’application ne s’ouvre pas, la demande se copie en un clic.',
    rows: [
      two([['1440-estimate.png', '<strong>La demande.</strong> Téléphone, fax, e-mail et bureau à côté du formulaire.'], ['1440-form-errors.png', '<strong>Les erreurs :</strong> chacune dit quoi faire ; le focus va au premier champ à corriger.']]),
      two([['1440-form-ready.png', '<strong>La liste prête,</strong> une ligne par travail.'], ['1440-foot.png', '<strong>Le pied de page,</strong> à l’encre : l’emblème redessiné, le bureau, la licence, Lee et Collier.']]),
      two([['og.jpg', '<strong>L’image de partage</strong> (1200 × 630), pour un lien envoyé par texto ou sur Facebook.'], ['m-form.png', '<strong>Au téléphone,</strong> les champs l’un sous l’autre.']]),
    ],
  },
  telephone: {
    title: 'Sur téléphone',
    sub: 'La même page, recomposée pour une main : l’emblème, « Call » et le menu en haut, des boutons de 44 px au moins, la liste et la phrase sur deux lignes, la photo de l’accueil recadrée sur l’angle du débord. Captures à 390 × 844.',
    rows: [
      six([['m-hero.png', '<strong>L’accueil.</strong>'], ['m-menu.png', '<strong>Le menu.</strong>'], ['m-work.png', '<strong>Ce qu’ils font.</strong>'], ['m-jobs.png', '<strong>La rénovation.</strong>'], ['m-house.png', '<strong>La maison.</strong>'], ['m-raised.png', '<strong>Les deux maisons.</strong>']]),
      six([['m-judson.png', '<strong>Judson.</strong>'], ['m-license.png', '<strong>La licence.</strong>'], ['m-reviews.png', '<strong>Les avis.</strong>'], ['m-estimate.png', '<strong>La demande.</strong>'], ['m-viewer.png', '<strong>La visionneuse.</strong>'], ['m-foot.png', '<strong>Le pied de page.</strong>']]),
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
