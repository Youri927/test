// Planches de présentation (boards/*.jpg, 1600 px de large), composées en HTML avec les polices et le logo du site,
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
const svg = (k, cls) => `<svg class="${cls}" viewBox="0 0 ${logo[k].w} ${logo[k].h}" aria-hidden="true"><path d="${logo[k].d}" fill="#000" fill-rule="evenodd"/></svg>`;
const font = (f) => `url("file://${resolve('vendor/fonts/' + f)}") format("woff2")`;
const css = `
@font-face { font-family: "Montagu Slab"; src: ${font('MontaguSlab.woff2')}; font-weight: 200 500; }
@font-face { font-family: "Reddit Sans"; src: ${font('RedditSans.woff2')}; font-weight: 400 700; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #eef0f0; color: #000; font-family: "Reddit Sans", sans-serif; }
main { padding: 52px 40px 52px; }
.mark { display: flex; align-items: center; gap: 12px; margin: 0 0 30px; }
.mark .emblem { width: 40px; height: auto; } .mark .word { width: 98px; height: auto; }
h1 { margin: 0; font: 250 60px/1.02 "Montagu Slab"; letter-spacing: -0.02em; }
.sub { margin: 16px 0 38px; font-size: 20px; line-height: 1.55; color: #3d4345; max-width: 64em; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 36px; }
figure { margin: 0; }
img { width: 100%; display: block; border: 1px solid #c9cfcf; background: #fff; }
figcaption { margin-top: 12px; font-size: 16.5px; line-height: 1.45; color: #3d4345; }
figcaption strong { color: #000; font-weight: 700; }
`;
const page = ({title, sub, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body><main><p class="mark">${svg('emblem', 'emblem')}${svg('word', 'word')}</p><h1>${title}</h1><p class="sub">${sub}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${cap}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const three = (items) => ({cols: 'repeat(3, 1fr)', items});
const four = (items) => ({cols: 'repeat(4, 1fr)', items});
const six = (items) => ({cols: 'repeat(6, 1fr)', items});
const BOARDS = {
  'l-accueil': {
    title: 'L’accueil, lu en Z',
    sub: 'Leur phrase, « The people who show up. Every single day. », coupée par leur plus belle photo : la maison neuve au bord de l’eau et sa piscine, en bandeau d’un bord à l’autre de l’écran. On lit en Z, comme le monogramme de leur logo, sans qu’on dessine de Z. L’ouverture dure 2,2 s, une fois : la première ligne monte, le bandeau s’ouvre depuis sa ligne d’horizon, la fin de la phrase monte, puis le texte et le bouton apparaissent. En mouvement réduit ou sans JavaScript, tout est en place d’emblée.',
    rows: [
      three([['o-d-0150.png', '<strong>0,15 s.</strong> La première ligne monte de son masque ; l’en-tête et le métier sont déjà là.'], ['o-d-0500.png', '<strong>0,5 s.</strong> Le bandeau s’ouvre depuis sa ligne d’horizon.'], ['o-d-0900.png', '<strong>0,9 s.</strong> La photo se pose (elle passe de 1,06 à 1).']]),
      three([['o-d-1300.png', '<strong>1,3 s.</strong> « Every single day. » monte à droite.'], ['o-d-1800.png', '<strong>1,8 s.</strong> Le texte et le bouton à gauche : le Z est fermé.'], ['og.jpg', '<strong>L’image de partage</strong> (1200 × 630) reprend la même composition.']]),
      four([['o-m-0300.png', '<strong>Téléphone, 0,3 s.</strong>'], ['o-m-1000.png', '<strong>1 s.</strong> La photo en 4:3.'], ['o-m-1700.png', '<strong>1,7 s.</strong>'], ['o-m-2800.png', '<strong>Fin.</strong> Le bouton de demande pleine largeur.']]),
    ],
  },
  'l-annee': {
    title: 'Le cadran de l’année',
    sub: 'Ce qui distingue vraiment Zynda : ils préparent avec les propriétaires en hiver, commencent en mai, sont sur place chaque jour de l’été, et finissent le 1er octobre (« We start in May and finish October 1st! »). Un cadran rond comme leur emblème : les douze mois, 365 traits comme la minuterie d’une montre, l’hiver en pointillé, la saison des condos couleur d’eau de leur piscine. Sur ordinateur, il reste à l’écran pendant les quatre temps ; un repère avance, la date change au centre, l’arc se remplit, et un second repère marque la vraie date du jour.',
    rows: [
      two([['1440-dial-0.png', '<strong>L’hiver, « You’re here ».</strong> Le repère part de novembre ; la ligne du jour dit qu’en octobre, c’est le moment de préparer.'], ['1440-dial-1.png', '<strong>Mai, « We start ».</strong> Démolition, ossature, réseaux, finitions ; le chantier d’un condo face au golfe.']]),
      two([['1440-dial-2.png', '<strong>De juin à septembre, chaque jour sur place.</strong> L’arc de l’été se remplit ; l’avis sur les photos d’avancement.'], ['1440-dial-3.png', '<strong>Le 1er octobre, « You’re home ».</strong> Les deux avis sur les délais tenus.']]),
      four([['1440-year.png', '<strong>L’entrée de la section.</strong>'], ['1440-condo.png', '<strong>Les condos :</strong> approbations, règles de l’immeuble, parties communes, les immeubles cités.'], ['m-year.png', '<strong>Téléphone :</strong> le cadran entier, la saison et le jour.'], ['m-step.png', '<strong>Puis les quatre temps</strong>, l’un sous l’autre.']]),
    ],
  },
  'les-pieces': {
    title: 'Les pièces et les détails',
    sub: 'Seulement leurs vraies photos, jamais agrandies, triées une à une (les images d’IA et les photos d’annonces à filigrane de leur site actuel sont écartées). Une suite éditoriale, pas une grille de cartes ; une légende courte sous chaque photo, le lieu quand leur site le donne. Les avis sont posés entre les photos, là où ils parlent de la même chose. Puis leur devise, « Adding pop is what we do best. », sur un bandeau noir de gros plans : un clic ouvre la pièce entière.',
    rows: [
      two([['1440-work.png', '<strong>Le séjour à l’escalier de verre</strong>, et l’avis de Park Shore.'], ['1440-work-2.png', '<strong>Cuisine, vasque aux écailles vert d’eau.</strong>']]),
      two([['1440-work-3.png', '<strong>La cheminée en pierre bleue</strong>, la mosaïque de verre.'], ['1440-viewer.png', '<strong>La visionneuse :</strong> photo entière, légende, « 1 of 12 », flèches, doigt, Échap.']]),
      two([['1440-details.png', '<strong>« Adding pop is what we do best. »</strong> Leur devise, et l’avis de Marco Island sur les « BIG details ».'], ['1440-swatches.png', '<strong>Six gros plans</strong> pris dans leurs photos : la matière d’abord, la pièce au clic.']]),
    ],
  },
  'la-maison': {
    title: 'Ce qu’ils construisent, qui ils sont, où',
    sub: 'Sept prestations en lignes, leur texte raccourci ; au survol, la photo se découvre à sa place, sans suivre la souris. Leurs fourchettes (de 100 000 $ à plus de 7 000 000 $). La famille venue de Buffalo, depuis 2001, sans nommer personne, avec leur phrase sur les détails. Les quartiers et les immeubles où ils ont travaillé, en grand.',
    rows: [
      two([['1440-apart.png', '<strong>Juste après l’accueil :</strong> leur phrase « We intentionally take on only a few projects at a time. », leurs quatre engagements et la licence, vérifiable.'], ['1440-services.png', '<strong>Les prestations :</strong> « Kitchens » survolée.']]),
      two([['1440-family.png', '<strong>La famille.</strong> Leur portrait, Buffalo, 2001, leur citation, l’offre d’emploi.'], ['1440-areas.png', '<strong>Les quartiers</strong> en Montagu Slab ; les immeubles et Marco Island à côté.']]),
    ],
  },
  demande: {
    title: '« Plan a consultation »',
    sub: 'Une demande courte, qui pose la question qu’ils posent de toute façon : quand êtes-vous absent ? Deux mois dessinent la fenêtre sur une frise de l’année, à côté de la saison des condos, et une phrase la reformule. Le bouton écrit l’e-mail à Zynda ; les erreurs disent quoi corriger ; à côté, le téléphone, l’e-mail, le bureau, les horaires et la licence.',
    rows: [
      two([['1440-contact.png', '<strong>La demande.</strong>'], ['1440-away.png', '<strong>Absent de mai à octobre :</strong> « That covers the whole condo season. »']]),
      two([['1440-errors.png', '<strong>Les erreurs</strong>, reliées à leur champ ; le focus va au premier.'], ['1440-sent.png', '<strong>Après l’envoi :</strong> la note qui dit quoi faire si la messagerie ne s’ouvre pas.']]),
      two([['1440-foot.png', '<strong>Le pied de page</strong>, en noir : leur logo vectorisé au pixel près, le bureau, le contact, la licence.'], ['m-away.png', '<strong>Au téléphone,</strong> la frise et la phrase sous les deux mois.']]),
    ],
  },
  telephone: {
    title: 'Sur téléphone',
    sub: 'La même page, recomposée pour une main : le logo, le bouton de demande et le menu en haut, des cibles de 44 px au moins, la phrase d’accueil sur deux lignes autour de la photo, le cadran entier, les gros plans qui défilent au doigt. Captures à 390 × 844.',
    rows: [
      six([['m-hero.png', '<strong>L’accueil.</strong>'], ['m-menu.png', '<strong>Le menu.</strong>'], ['m-apart.png', '<strong>Les engagements.</strong>'], ['m-year.png', '<strong>Le cadran.</strong>'], ['m-work.png', '<strong>Les pièces.</strong>'], ['m-viewer.png', '<strong>La visionneuse.</strong>']]),
      six([['m-details.png', '<strong>Les détails.</strong>'], ['m-services.png', '<strong>Les prestations.</strong>'], ['m-family.png', '<strong>La famille.</strong>'], ['m-areas.png', '<strong>Les quartiers.</strong>'], ['m-contact.png', '<strong>La demande.</strong>'], ['m-foot.png', '<strong>Le pied de page.</strong>']]),
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
