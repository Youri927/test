// Planches de présentation (boards/*.jpg, 1600 px de large), composées en HTML avec les polices et le logo du site, à
// partir des captures de tools/shots.mjs (o-*, 1440-*, 768-*, m-*) et de l'image de partage (web/og.jpg).
//   node tools/boards.mjs <dossier des captures> [dossier de sortie, boards par défaut]
import {createRequire} from 'node:module';
import {mkdirSync, writeFileSync, rmSync, copyFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {markSvg} from './mark.mjs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const here = (p) => resolve(dirname(fileURLToPath(import.meta.url)), '..', p);
const src = resolve(process.argv[2] || 'shots');
const out = resolve(process.argv[3] || here('boards'));
mkdirSync(out, {recursive: true});
copyFileSync(here('web/og.jpg'), `${src}/og.jpg`);
const font = (f) => `url("file://${here('vendor/fonts/' + f)}") format("woff2")`;
const css = `
@font-face { font-family: Petrona; src: ${font('Petrona.woff2')}; font-weight: 200 500; }
@font-face { font-family: Gantari; src: ${font('Gantari.woff2')}; font-weight: 400 700; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #F3F4F2; color: #1E1F21; font-family: Gantari, sans-serif; }
main { padding: 52px 40px 56px; }
.brand { display: flex; align-items: center; gap: 14px; margin: 0 0 30px; color: #5D6065; font: 500 16px/1 Gantari; letter-spacing: 0.02em; }
.brand svg { width: 104px; height: auto; }
.brand span { padding-left: 14px; border-left: 1px solid #D3D5D2; }
h1 { margin: 0; font: 300 62px/1.02 Petrona; letter-spacing: -0.028em; max-width: 22em; }
.sub { margin: 20px 0 38px; font-size: 19px; line-height: 1.6; color: #5D6065; max-width: 66em; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 34px; }
figure { margin: 0; }
img { width: 100%; display: block; border: 1px solid #D3D5D2; background: #fff; }
figcaption { margin-top: 12px; font-size: 16px; line-height: 1.45; color: #5D6065; }
figcaption strong { color: #1E1F21; font-weight: 600; }
`;
// les espaces insécables du français : pas de guillemet ni de deux-points seul en début de ligne
const fr = (t) => t.replace(/« /g, '«\u00a0').replace(/ (»|:|;|\?|!)/g, '\u00a0$1');
const page = ({title, sub, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body><main><p class="brand">${markSvg()}<span>Custom Homes</span></p><h1>${fr(title)}</h1><p class="sub">${fr(sub)}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${fr(cap)}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const three = (items) => ({cols: 'repeat(3, 1fr)', items});
const four = (items) => ({cols: 'repeat(4, 1fr)', items});
const five = (items) => ({cols: 'repeat(5, 1fr)', items});
const BOARDS = {
  'l-accueil-lot-home': {
    title: 'Lot + Home : l’accueil se recolle',
    sub: 'NIAN ne vend pas seulement une maison : tout commence par le terrain. Le site s’ouvre donc sur une addition. « Lot » et « Home » en très grand, et sous chaque mot sa moitié d’une de leurs photos : le jardin d’Oakes Estate à gauche, la maison à droite, écartées autour d’un « + » bordeaux, la couleur du toit de leur logo. À l’arrivée, les mots montent et les deux moitiés s’ouvrent depuis le « + ». Au défilement, elles se rapprochent, le « + » s’efface, et la photo redevient une, en plein cadre : une maison NIAN sur son terrain. Le geste suit la molette, dans les deux sens.',
    rows: [
      three([['o-d-150.png', '<strong>L’arrivée.</strong> Les deux moitiés s’ouvrent depuis le « + »…'], ['o-d-450.png', '<strong>… jusqu’aux bords de leur boîte,</strong> pendant que la phrase et le bouton apparaissent.'], ['1440-hero.png', '<strong>Au repos.</strong> Le titre, la phrase, le bouton de la consultation gratuite et le téléphone, sans défiler.']]),
      three([['1440-join-30.png', '<strong>Au défilement,</strong> la photo grandit par-dessus les mots, qui s’effacent.'], ['1440-join-62.png', '<strong>L’écart se referme.</strong>'], ['1440-joined.png', '<strong>Recollée, en plein cadre.</strong> La légende paraît : « Oakes Estate Home ».']]),
      five([['m-hero.png', '<strong>Au téléphone,</strong> le « + » descend dans l’écart ; à gauche le tonneau et les fleurs, à droite la maison.'], ['m-join.png', '<strong>La jonction,</strong> au doigt.'], ['m-joined.png', '<strong>Recollée,</strong> en bande au format 4:5.'], ['768-hero.png', '<strong>Sur tablette,</strong> tenue droite.'], ['og.jpg', '<strong>L’image de partage</strong> (1200 × 630) reprend l’addition.']]),
    ],
  },
  'les-six-maisons': {
    title: 'Six homes. No two alike.',
    sub: 'Leur galerie actuelle est une grille de vignettes dans d’anciens cadres Wix. Ici, les six noms restent toujours visibles, avec leur style (leurs mots, sans leurs fautes) ; le chevron du logo glisse devant la maison choisie, et la scène change en fondu : la grande photo, sa légende, son rang, ses vignettes. Une photo s’ouvre en grand dans la visionneuse (flèches, clavier, doigt), et « Ask about a home like this one » reprend la maison dans la demande. Au téléphone, un accordéon : chaque maison a son « + ». Six numéros de maison ont été effacés des photos, et aucune métadonnée n’est gardée.',
    rows: [
      two([['1440-homes.png', '<strong>The Park Modern Home,</strong> ouverte au départ.'], ['1440-homes-villa.png', '<strong>Villa Estate Home :</strong> la vignette 2 montre la piscine sous les arcades.']]),
      two([['1440-homes-gates.png', '<strong>Gates Custom Home.</strong> Le chevron a suivi.'], ['1440-viewer.png', '<strong>La visionneuse,</strong> nommée par la maison, jamais plus grande que la photo.']]),
      four([['m-homes.png', '<strong>Au téléphone,</strong> les six noms et leurs « + ».'], ['m-homes-open.png', '<strong>Oakes Estate</strong> ouverte sous son nom ; les vignettes défilent au doigt.'], ['m-viewer.png', '<strong>La visionneuse</strong> au doigt.'], ['m-intro.png', '<strong>Leur phrase,</strong> avant les maisons, avec la licence liée au registre.']]),
    ],
  },
  'le-choix-terrain-maison': {
    title: 'Start where you are.',
    sub: 'Plus bas, le visiteur compose sa propre addition : son terrain (un de leurs lots dans le comté de Collier, le sien, ou celui qu’ils l’aident à trouver avec Sun Realty) + sa maison (dessinée de zéro, un de leurs plans éprouvés, ou ses propres plans). Chaque réponse vient de leur page Services. Le grand « + » se trace à l’entrée dans l’écran ; le résumé se compose, et « Ask about this starting point » remplit la demande, qui brille un instant là où elle a changé. Puis « Then, every selection » : leur conseil en design, sur quatre de leurs intérieurs.',
    rows: [
      two([['1440-how.png', '<strong>Les deux questions,</strong> de chaque côté du « + ».'], ['1440-how-picked.png', '<strong>Le résumé :</strong> « a lot we help you find + a home designed from scratch ».']]),
      two([['1440-ask-filled.png', '<strong>La demande remplie</strong> par le bouton : le sujet, le terrain, la maison.'], ['1440-finish.png', '<strong>« Then, every selection. »</strong> Meubles, plans, carrelage et robinets, à la même hauteur.']]),
      four([['m-how.png', '<strong>Au téléphone,</strong> une colonne : le terrain…'], ['m-how-picked.png', '<strong>… puis la maison,</strong> et le résumé.'], ['m-finish.png', '<strong>Les finitions</strong> défilent au doigt.'], ['m-ask.png', '<strong>La demande,</strong> le téléphone en grand.']]),
    ],
  },
  'packages-agents-entreprise': {
    title: 'Packages, agents, l’entreprise et la demande',
    sub: 'Une bande bordeaux pour les Lot + Home packages (avec l’allée qui traverse les pins jusqu’à la maison) et la rénovation, chacun avec son bouton qui ouvre la demande au bon sujet. Pour les agents immobiliers, leur offre en grand : 4 % sur toute construction neuve, la moitié à la signature, l’autre au certificat d’occupation, et leur ligne. L’entreprise : familiale, dans l’immobilier du sud-ouest de la Floride depuis 2006, la licence CBC1260134 liée à sa fiche, le bureau et sa salle d’exposition, la succursale. Puis la consultation gratuite : un formulaire court qui écrit l’e-mail, des erreurs qui disent quoi corriger.',
    rows: [
      two([['1440-packages.png', '<strong>Lot + Home packages</strong> et rénovation.'], ['1440-realtors.png', '<strong>For realtors :</strong> 4 %, et la barre des deux versements.']]),
      three([['1440-about.png', '<strong>L’entreprise,</strong> la licence et les deux adresses.'], ['1440-ask-errors.png', '<strong>Les erreurs,</strong> reliées à leur champ ; le focus va au premier.'], ['1440-ask-sent.png', '<strong>Après l’envoi :</strong> la messagerie s’ouvre avec la demande écrite ; une note redonne l’e-mail et le téléphone.']]),
      five([['m-packages.png', '<strong>Les packages.</strong>'], ['m-realtors.png', '<strong>Les agents.</strong>'], ['m-about.png', '<strong>L’entreprise.</strong>'], ['m-menu.png', '<strong>Le menu.</strong>'], ['m-foot.png', '<strong>Le pied de page.</strong>']]),
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
