// Planches de présentation (boards/*.jpg, 1600 px de large), composées en HTML avec les polices et le logo du site,
// à partir des captures de tools/shots.mjs (o-*, 1440-*, m-*) et de l'image de partage (web/og.jpg).
//   node tools/boards.mjs <dossier des captures> [dossier de sortie, boards par défaut]
import {createRequire} from 'node:module';
import {mkdirSync, writeFileSync, rmSync, copyFileSync, readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const here = (p) => resolve(dirname(fileURLToPath(import.meta.url)), '..', p);
const src = resolve(process.argv[2] || 'shots');
const out = resolve(process.argv[3] || here('boards'));
mkdirSync(out, {recursive: true});
copyFileSync(here('web/og.jpg'), `${src}/og.jpg`);
const logo = JSON.parse(readFileSync(here('data/logo.json'), 'utf8'));
const mark = `<svg class="mk" viewBox="0 0 ${logo.mark.w} ${logo.mark.h}" aria-hidden="true"><path d="${logo.mark.navy}" fill="#2a5472" fill-rule="evenodd"/><path d="${logo.mark.olive}" fill="#909c42" fill-rule="evenodd"/></svg>`;
const word = `<svg class="wd" viewBox="0 0 ${logo.word.w} ${logo.word.h}" aria-hidden="true"><path d="${logo.word.d}" fill="#2a5472" fill-rule="evenodd"/></svg>`;
const font = (f) => `url("file://${here('vendor/fonts/' + f)}") format("woff2")`;
const css = `
@font-face { font-family: "Imbue"; src: ${font('Imbue.woff2')}; font-weight: 150 500; }
@font-face { font-family: "Zalando Sans"; src: ${font('ZalandoSans.woff2')}; font-weight: 400 650; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #eef2f4; color: #2a5472; font-family: "Zalando Sans", sans-serif; }
main { padding: 52px 40px 52px; }
.brand { display: flex; align-items: center; gap: 12px; margin: 0 0 30px; }
.brand .mk { width: 46px; height: auto; } .brand .wd { width: 150px; height: auto; }
h1 { margin: 0; font: 270 66px/1 "Imbue"; font-optical-sizing: auto; }
.sub { margin: 18px 0 38px; font-size: 20px; line-height: 1.55; color: #55687a; max-width: 64em; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 36px; }
figure { margin: 0; }
img { width: 100%; display: block; border: 1px solid #c9d3dc; background: #fff; }
figcaption { margin-top: 12px; font-size: 16.5px; line-height: 1.45; color: #55687a; }
figcaption strong { color: #2a5472; font-weight: 600; }
`;
const page = ({title, sub, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body><main><p class="brand">${mark}${word}</p><h1>${title}</h1><p class="sub">${sub}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${cap}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const three = (items) => ({cols: 'repeat(3, 1fr)', items});
const four = (items) => ({cols: 'repeat(4, 1fr)', items});
const five = (items) => ({cols: 'repeat(5, 1fr)', items});
const BOARDS = {
  'l-ouverture': {
    title: 'L’ouverture : ce qui compte ressort',
    sub: 'Le site s’ouvre sur les mots d’un client, pas sur un slogan : l’avis de Scott D., en grand, tout en gris-bleu pâle. Puis, l’un après l’autre, les quatre passages qu’on retient passent à l’encre, le bleu de leur logo : « more than 5 stars », « attention to detail », « protect our floors », « cleaned everyday ». Lu seul, ce qui ressort résume l’entreprise. À côté, une de leurs cuisines de Breakwater, photographiée par eux. C’est le seul moment qui se joue sans qu’on fasse rien ; en mouvement réduit ou sans JavaScript, l’avis est déjà à l’encre.',
    rows: [
      three([['o-d-0100.png', '<strong>0,1 s.</strong> L’avis monte ligne par ligne ; la photo s’ouvre depuis le bas.'], ['o-d-0700.png', '<strong>0,7 s.</strong> Tout l’avis est là, en pâle : on peut déjà tout lire.'], ['o-d-1400.png', '<strong>1,4 s.</strong> « more than 5 stars. » passe à l’encre ; la phrase qui dit qui ils sont et le bouton arrivent.']]),
      three([['o-d-1800.png', '<strong>1,8 s.</strong> « attention to detail ».'], ['o-d-2200.png', '<strong>2,2 s.</strong> « protect our floors ».'], ['o-d-3400.png', '<strong>Fin.</strong> « cleaned everyday » : les quatre passages sont à l’encre.']]),
      four([['o-m-0200.png', '<strong>Téléphone, 0,2 s.</strong>'], ['o-m-1500.png', '<strong>1,5 s.</strong>'], ['o-m-3400.png', '<strong>Fin.</strong> Le bouton de demande visible sans défiler.'], ['og.jpg', '<strong>L’image de partage</strong> (1200 × 630) reprend la même idée.']]),
    ],
  },
  'la-visite': {
    title: 'Sept minutes dans un condo fini',
    sub: 'Leur preuve la plus forte : le 3 novembre 2025, ils ont photographié un condo entier de Breakwater pièce après pièce, entre 10 h 38 et 10 h 45. Les heures sont lues dans les fichiers. Sur ordinateur, la section se fige à l’écran et la rangée avance quand on descend : on visite l’appartement dans l’ordre. La grande heure change, la pièce en cours passe en blanc, les autres restent pâles. Chaque photo ouvre la visionneuse ; « See all 24 photos » ouvre tout le passage.',
    rows: [
      two([['1440-walk-0.png', '<strong>10:38, la cuisine.</strong> La section se fige à l’écran.'], ['1440-walk-1.png', '<strong>10:43, l’évier de l’îlot.</strong> La rangée avance au défilement.']]),
      two([['1440-walk-2.png', '<strong>10:44, la salle de bain.</strong> Après l’entrée et le lanai.'], ['1440-walk-3.png', '<strong>10:45, le sol de la douche.</strong> Puis la page reprend son cours.']]),
      four([['m-walk.png', '<strong>Au téléphone,</strong> la même rangée se parcourt au doigt, chaque photo avec son heure.'], ['m-viewer.png', '<strong>La visionneuse au téléphone :</strong> on glisse d’une photo à l’autre.'], ['1440-hero.png', '<strong>L’accueil</strong>, juste au-dessus.'], ['m-hero.png', '<strong>L’accueil au téléphone.</strong>']]),
    ],
  },
  'les-chantiers': {
    title: 'Leurs chantiers, dans l’ordre des photos',
    sub: 'Seulement leurs photos, jamais agrandies, prises au téléphone en faisant le tour des chantiers finis ; les photos d’annonces immobilières à filigrane de leur site actuel sont écartées. Six des projets de leur liste sont à Breakwater, dans Pelican Bay : cinq logements et le club-house, en cartes décalées. Puis « Across Naples » : Trieste, Hidden Lakes, Imperial Golf Club, Gulf Tower, Pistoia et les cages de piscine, chacun avec ce qui a été fait et sa date. Chaque reportage s’ouvre dans la visionneuse, dans l’ordre où les photos ont été prises, avec la pièce et l’heure.',
    rows: [
      two([['1440-work.png', '<strong>« Five homes at Breakwater, and the clubhouse. »</strong>'], ['1440-work-2.png', '<strong>Les trois autres</strong>, dont les toilettes d’invités au papier peint de palmiers et le club-house.']]),
      two([['1440-else.png', '<strong>« Across Naples »</strong> : photo et texte alternent.'], ['1440-else-2.png', '<strong>Imperial Golf Club</strong> : la douche et sa paroi de verre dépoli, avril 2023.']]),
      two([['1440-viewer.png', '<strong>La visionneuse :</strong> le lieu et la date en titre, la pièce et l’heure en légende, « 1 of 4 », flèches, clavier, doigt.'], ['m-else.png', '<strong>Au téléphone,</strong> chaque lieu sous sa photo.']]),
    ],
  },
  'les-avis': {
    title: 'Douze clients, dans leurs mots',
    sub: 'Les douze avis de leur site, mot pour mot, signés d’un prénom et d’une initiale. On choisit un sujet (le temps et le budget, le soin de la maison, les échanges, les conseils, les ouragans, ceux qui reviennent) : les passages qui en parlent passent à l’encre, soulignés d’olive, le reste pâlit, et une phrase compte les avis concernés. Les prestations renvoient à ces sujets : « Storm repairs » ouvre les deux avis sur les ouragans.',
    rows: [
      two([['1440-reviews.png', '<strong>Les douze avis</strong>, sur trois colonnes.'], ['1440-reviews-time.png', '<strong>« Time and budget »</strong> : « Five of the twelve reviews talk about time and budget. »']]),
      two([['1440-reviews-storm.png', '<strong>« Storm repairs »</strong> : les deux avis sur les ouragans, dont Irma.'], ['1440-services.png', '<strong>Les prestations</strong>, chacune avec sa preuve : la visite, un sujet des avis, les photos.']]),
      four([['m-reviews.png', '<strong>Au téléphone :</strong> « Care for the home ».'], ['m-services.png', '<strong>Les prestations.</strong>'], ['m-work.png', '<strong>Les cartes de Breakwater</strong>, en rangée.'], ['m-menu.png', '<strong>Le menu.</strong>']]),
    ],
  },
  'la-demande': {
    title: 'L’entreprise et la demande d’estimation',
    sub: 'Leurs faits, sans adjectifs : fondée en 2014, à Naples, la licence de l’État (CGC1531679, active jusqu’au 31 août 2028) vérifiable en un clic sur le registre officiel, le bureau, les lieux où ils ont travaillé. Puis la demande : leur « FREE estimate », un formulaire court qui écrit l’e-mail, des erreurs qui disent quoi corriger, et le téléphone en grand.',
    rows: [
      two([['1440-about.png', '<strong>« Founded in 2014. Based in Naples. »</strong> La phrase d’un client sur leurs sous-traitants, la licence, le bureau.'], ['1440-contact.png', '<strong>« Get a free estimate. »</strong>']]),
      two([['1440-errors.png', '<strong>Les erreurs</strong>, reliées à leur champ ; le focus va au premier.'], ['1440-sent.png', '<strong>Après le clic :</strong> la messagerie s’ouvre avec la demande écrite, et une note dit quoi faire si elle ne s’ouvre pas.']]),
      four([['1440-foot.png', '<strong>Le pied de page</strong>, leur logo vectorisé.'], ['m-about.png', '<strong>Au téléphone :</strong> l’entreprise.'], ['m-contact.png', '<strong>La demande.</strong>'], ['m-foot.png', '<strong>Le pied de page</strong>, des liens de 44 px.']]),
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
