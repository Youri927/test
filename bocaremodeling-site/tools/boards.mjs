// Planches de présentation (boards/*.jpg, 1600 px de large), composées en HTML avec les polices et le logo du site,
// à partir des captures de tools/shots.mjs (o-*, 1440-*, 768-*, m-*) et de l'image de partage (web/og.jpg).
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
@font-face { font-family: "Mozilla Headline"; src: ${font('MozillaHeadline.woff2')}; font-weight: 400 700; font-stretch: 75% 100%; }
@font-face { font-family: "Mozilla Text"; src: ${font('MozillaText.woff2')}; font-weight: 400 600; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #F4F6F7; color: #10233A; font-family: "Mozilla Text", sans-serif; }
main { padding: 52px 40px 52px; }
.brand { display: flex; align-items: center; gap: 12px; margin: 0 0 30px; font: 650 22px/1 "Mozilla Headline"; font-stretch: 84%; }
.brand svg { width: 44px; height: auto; }
h1 { margin: 0; font: 640 66px/0.95 "Mozilla Headline"; font-stretch: 80%; letter-spacing: -0.01em; }
.sub { margin: 18px 0 38px; font-size: 20px; line-height: 1.55; color: #56616C; max-width: 64em; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 36px; }
figure { margin: 0; }
img { width: 100%; display: block; border: 1px solid #CDD3D8; background: #fff; }
figcaption { margin-top: 12px; font-size: 16.5px; line-height: 1.45; color: #56616C; }
figcaption strong { color: #10233A; font-weight: 600; }
`;
const page = ({title, sub, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body><main><p class="brand">${markSvg()}Boca Remodeling Group</p><h1>${title}</h1><p class="sub">${sub}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${cap}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const three = (items) => ({cols: 'repeat(3, 1fr)', items});
const four = (items) => ({cols: 'repeat(4, 1fr)', items});
const BOARDS = {
  'l-accueil': {
    title: 'We draw it. Then we build it.',
    sub: 'Le site s’ouvre sur leur meilleure preuve, cachée jusqu’ici dans leurs galeries : la même salle de bain esquissée aux crayons de couleur, dessinée en 3D quinze jours plus tard, puis construite, vue du même endroit. À l’arrivée, le titre monte et l’esquisse s’ouvre depuis sa porte, dans un rectangle bordé de bleu. Puis, quand on fait défiler, la 3D sort de la porte dessinée, et la vraie pièce de la porte en 3D : les trois images sont calées sur la porte du fond. Les trois étapes à droite sont aussi des boutons.',
    rows: [
      four([['o-d-0150.png', '<strong>0,15 s.</strong> L’esquisse paraît dans le cadre de sa porte.'], ['o-d-0450.png', '<strong>0,45 s.</strong> Le titre monte derrière son cache, phrase par phrase.'], ['o-d-0800.png', '<strong>0,8 s.</strong> Le rectangle s’agrandit jusqu’aux bords de la scène.'], ['1440-hero.png', '<strong>Fin de l’ouverture.</strong> Le bouton de devis et le téléphone, visibles sans défiler.']]),
      four([['1440-scene-0.png', '<strong>On fait défiler :</strong> la 3D s’ouvre dans la porte de l’esquisse.'], ['1440-scene-1.png', '<strong>Drawn in 3D.</strong> Le fil bleu des étapes avance.'], ['1440-scene-2.png', '<strong>La vraie pièce</strong> s’ouvre dans la porte de la 3D, puis la caméra recule.'], ['1440-scene-3.png', '<strong>Built.</strong> Tout est là où l’esquisse l’avait mis.']]),
      four([['m-hero.png', '<strong>Au téléphone :</strong> le titre sur deux lignes, le bouton sans défiler.'], ['m-scene-3d.png', '<strong>La scène se fige sous l’en-tête</strong> ; seule la phrase de l’étape en cours s’affiche.'], ['m-scene-built.png', '<strong>Built.</strong>'], ['og.jpg', '<strong>L’image de partage</strong> (1200 × 630) arrête le même geste à mi-course.']]),
    ],
  },
  'dessine-puis-construit': {
    title: 'Deux autres pièces, dessinées d’abord',
    sub: 'Petit et à marge blanche, c’est dessiné ; grand et sans cadre, c’est construit. La cuisine aux deux îlots de quartzite : le plan et la 3D sur l’écran du bureau le même après-midi, le polissage de l’îlot deux mois plus tard, la cuisine finie deux semaines après ; la photo finie reste en vue pendant qu’on lit les étapes. La salle de bain à l’estrade descend en escalier. Les photos s’ouvrent une fois, dans l’ordre des étapes, avec le trait bleu de l’accueil, et chacune ouvre la visionneuse sur elle-même.',
    rows: [
      two([['1440-drawn.png', '<strong>« Two more rooms, drawn first. »</strong>'], ['1440-kitchen.png', '<strong>La cuisine :</strong> 1 et 2 en tirages, 3 sur le chantier, 4 finie.']]),
      two([['1440-reveal-0.png', '<strong>L’apparition, 0,3 s :</strong> le plan et la 3D s’ouvrent depuis leur centre.'], ['1440-reveal-1.png', '<strong>0,6 s :</strong> puis le chantier et la cuisine finie, dans l’ordre.']]),
      two([['1440-step.png', '<strong>La salle de bain à l’estrade :</strong> la 3D cotée, la douche, la pièce entière.'], ['1440-viewer.png', '<strong>La visionneuse,</strong> ouverte sur la photo touchée : « 5 of 5 ».']]),
      four([['m-drawn.png', '<strong>Au téléphone :</strong> les deux tirages côte à côte.'], ['m-kitchen.png', '<strong>Le chantier, puis la cuisine finie.</strong>'], ['768-hero.png', '<strong>Sur tablette,</strong> l’accueil.'], ['m-viewer.png', '<strong>La visionneuse au téléphone :</strong> on glisse d’une photo à l’autre.']]),
    ],
  },
  'la-liste-et-le-travail': {
    title: 'Kitchens, Bathrooms, Windows, Roofs, Pools.',
    sub: 'La liste peinte sur les portières de leurs camions devient le titre de la section. Chaque mot est un bouton : survolé ou choisi, il s’élargit (la chasse variable de Mozilla Headline) et montre un de leurs chantiers, qui s’ouvre avec le même rectangle bleu ; les autres mots pâlissent. « Windows » montre les camions, faute de photo de fenêtres. Puis huit projets en quinconce, chacun ouvrant sa visionneuse sur la photo de sa vignette.',
    rows: [
      three([['1440-trades.png', '<strong>La liste</strong>, et leurs camions sur un chantier de toit.'], ['1440-trades-pools.png', '<strong>Au survol de « Pools. »</strong> : la piscine sous sa cage, au bord du golf.'], ['1440-trades-kitchens.png', '<strong>« Kitchens, » choisi</strong> : le mot s’élargit, les autres pâlissent.']]),
      two([['1440-work.png', '<strong>« More of our work »</strong> : la salle de bain de l’accueil finie, la pierre bleu-gris.'], ['1440-work-2.png', '<strong>Plus bas</strong>, les toits, la piscine, les salles de bain, le séjour au piano.']]),
      four([['m-trades.png', '<strong>Au téléphone,</strong> la photo vient juste sous les mots : « Roofs, ».'], ['m-work.png', '<strong>Le travail</strong>, une photo par ligne.'], ['768-work.png', '<strong>Sur tablette,</strong> deux colonnes de vignettes carrées.'], ['m-menu.png', '<strong>Le menu.</strong>']]),
    ],
  },
  'le-bureau-et-le-devis': {
    title: 'Le bureau, et le devis gratuit',
    sub: 'Leurs faits, sans adjectifs : l’adresse du bureau en très grand, « Our customers are welcome to visit us », l’état du moment à l’heure de Boca Raton, l’itinéraire, la licence CGC1539814 vérifiable en un clic sur la fiche de l’État, plus de 30 ans dans la construction, la fiche Google. Puis leur « free quote » : un formulaire court qui écrit l’e-mail, des sujets à cocher, des erreurs qui disent quoi corriger, et le téléphone partout.',
    rows: [
      two([['1440-office.png', '<strong>« Come by the office. »</strong> « Closed now. We open today at 9 am. »'], ['1440-quote.png', '<strong>« Get a free quote. »</strong>']]),
      two([['1440-errors.png', '<strong>Les erreurs</strong>, reliées à leur champ ; le focus va au premier.'], ['1440-sent.png', '<strong>Après le clic :</strong> la messagerie s’ouvre avec la demande écrite, et une note dit quoi faire si elle ne s’ouvre pas.']]),
      four([['m-office.png', '<strong>Au téléphone :</strong> le bureau.'], ['m-quote.png', '<strong>Le devis.</strong>'], ['m-foot.png', '<strong>Le pied de page.</strong>'], ['1440-foot.png', '<strong>Le pied de page</strong>, avec leurs deux toits redessinés à plat.']]),
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
