// Planches de présentation (boards/*.jpg, 1600 px de large), composées en HTML avec les polices et le monogramme du
// site, à partir des captures de tools/shots.mjs (o-*, 1440-*, 768-*, m-*) et de l'image de partage (web/og.jpg).
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
@font-face { font-family: Chivo; src: ${font('Chivo.woff2')}; font-weight: 300 900; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #EEEFED; color: #191A1B; font-family: Chivo, sans-serif; }
main { padding: 52px 40px 56px; }
.brand { display: flex; align-items: center; gap: 12px; margin: 0 0 30px; font: 800 21px/1 Chivo; letter-spacing: -0.015em; }
.brand svg { width: 44px; height: auto; }
.brand b { font-weight: 500; }
h1 { margin: 0; font: 850 62px/0.98 Chivo; letter-spacing: -0.035em; max-width: 22em; }
.sub { margin: 20px 0 38px; font-size: 19px; line-height: 1.6; color: #45494D; max-width: 66em; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 34px; }
figure { margin: 0; }
img { width: 100%; display: block; border: 1px solid #C9CDCF; background: #fff; }
figcaption { margin-top: 12px; font-size: 16px; line-height: 1.45; color: #5B5F63; }
figcaption strong { color: #191A1B; font-weight: 700; }
`;
const page = ({title, sub, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body><main><p class="brand">${markSvg()}<span>Brunet Brothers <b>Construction</b></span></p><h1>${title}</h1><p class="sub">${sub}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${cap}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const three = (items) => ({cols: 'repeat(3, 1fr)', items});
const four = (items) => ({cols: 'repeat(4, 1fr)', items});
const five = (items) => ({cols: 'repeat(5, 1fr)', items});
const BOARDS = {
  'l-accueil': {
    title: 'Masters of consistency and quality.',
    sub: 'Le site s’ouvre sur six de leurs photos posées en planche, au même format : trois douches au-dessus de trois cuisines. À l’arrivée, une paroi de verre dépoli glisse de gauche à droite, et chaque photo devient nette au passage de sa tranche blanche : 1,5 s, une seule fois, puis plus rien ne bouge. À gauche, la devise de leur site actuel, ce qu’ils font et depuis quand, le bouton de la visite gratuite et leurs deux lignes, en anglais et en espagnol, sans avoir à défiler.',
    rows: [
      four([['o-d-036.png', '<strong>0,5 s.</strong> La paroi traverse la première colonne : derrière elle la photo est nette, devant elle encore sous le verre.'], ['o-d-050.png', '<strong>0,75 s.</strong> Elle passe la deuxième colonne.'], ['o-d-062.png', '<strong>0,9 s.</strong> Puis la troisième.'], ['1440-hero.png', '<strong>Fin de l’ouverture.</strong> Six photos nettes, le bouton et les deux numéros.']]),
      four([['1440-hover.png', '<strong>Au survol,</strong> la ligne sous la planche dit ce que montre la photo.'], ['o-m-050.png', '<strong>Au téléphone,</strong> la planche passe sous le texte ; la paroi la traverse de la même façon.'], ['m-hero.png', '<strong>Le premier écran du téléphone :</strong> le titre, le bouton et les deux lignes.'], ['og.jpg', '<strong>L’image de partage</strong> (1200 × 630) arrête le même geste à mi-course.']]),
    ],
  },
  'la-serie': {
    title: 'La série : une rangée par type de pièce',
    sub: 'Leur galerie actuelle est une mosaïque muette de 63 photos. Ici, leurs propres photos sont rangées comme des planches de typologie : une rangée par type de pièce (douches, vasques, baignoires et toilettes d’invités, cuisines, rangements, bureau et séjour), toutes au même format, chacune avec une légende qui dit ce qu’on voit. On compare d’un regard, et la régularité devient la preuve de leur devise. Chaque photo apparaît une fois, derrière la même paroi de verre que l’accueil, l’une après l’autre, et ouvre la visionneuse de sa rangée.',
    rows: [
      two([['1440-work.png', '<strong>« Interior remodeling »</strong> : leur texte, raccourci, un témoignage cité mot pour mot, puis les douches.'], ['1440-vanities.png', '<strong>Les vasques, puis les baignoires et les toilettes d’invités,</strong> au même format, chacune légendée.']]),
      three([['1440-reveal-0.png', '<strong>L’apparition :</strong> la paroi glisse sur la première vasque…'], ['1440-reveal-1.png', '<strong>… puis sur les suivantes,</strong> l’une après l’autre.'], ['1440-kitchens.png', '<strong>Les cuisines,</strong> en format paysage.']]),
      two([['1440-viewer.png', '<strong>La visionneuse,</strong> ouverte sur la photo touchée : « 3 of 6 », les flèches, la légende.'], ['1440-rooms.png', '<strong>Rangements, bureau et séjour,</strong> sous la fin des cuisines.']]),
      four([['m-work.png', '<strong>Au téléphone :</strong> le texte et le témoignage.'], ['m-showers.png', '<strong>Deux photos par ligne,</strong> la légende dessous.'], ['m-kitchens.png', '<strong>Les cuisines.</strong>'], ['m-viewer.png', '<strong>La visionneuse :</strong> on glisse d’une photo à l’autre.']]),
    ],
  },
  'dehors-le-neuf-l-entreprise': {
    title: 'Dehors, le neuf, et l’entreprise',
    sub: 'Après les intérieurs : leur jardin (la cuisine d’été sous la pergola, le foyer dans le sable, la piscine), puis la construction neuve (la charpente sur les murs en blocs, un salon de coiffure). Une bande sombre pour l’entreprise : familiale, à Lake Worth depuis 2008, leurs camionnettes, et les quatre licences de l’État, chacune liée à sa fiche du registre ; leur site actuel n’en cite aucune. Leur FAQ devient le déroulé d’un chantier, et les 18 témoignages sont cités mot pour mot : 6 visibles, 12 à déplier.',
    rows: [
      two([['1440-outside-2.png', '<strong>« Exterior remodeling »</strong> : un seul jardin, trois photos.'], ['1440-build.png', '<strong>« New construction »</strong> : leur phrase, la charpente, le salon.']]),
      two([['1440-company.png', '<strong>L’entreprise :</strong> les quatre numéros ouvrent leur fiche sur le registre de l’État.'], ['1440-process.png', '<strong>« From the first visit to the last payment. »</strong> Leurs six questions, dans l’ordre d’un chantier.']]),
      two([['1440-clients.png', '<strong>Leurs clients,</strong> mot pour mot, sans nom ajouté : leur site les publie sans signature.'], ['1440-clients-more.png', '<strong>Les 12 autres,</strong> dépliés.']]),
      four([['m-company.png', '<strong>Au téléphone :</strong> l’entreprise.'], ['m-licenses.png', '<strong>Les licences.</strong>'], ['m-process.png', '<strong>Le déroulé.</strong>'], ['m-clients.png', '<strong>Les témoignages.</strong>']]),
    ],
  },
  'deux-langues-et-la-visite': {
    title: 'Deux langues, et la visite gratuite',
    sub: 'Ils répondent en anglais et en espagnol, mais leur site n’a pas un mot d’espagnol. Le bouton EN / ES traduit toute la page : titres, textes, légendes, FAQ, formulaire, erreurs et visionneuse. Le choix est gardé d’une visite à l’autre, il se partage par l’adresse (?lang=es), et un téléphone réglé en espagnol reçoit l’espagnol. Les témoignages restent en anglais, mot pour mot. Puis la demande de visite : un formulaire court qui écrit l’e-mail, les sujets à cocher, la langue du rappel, des erreurs qui disent quoi corriger, et les deux numéros partout.',
    rows: [
      three([['1440-es-hero.png', '<strong>« Maestros de la constancia y la calidad. »</strong>'], ['1440-es-company.png', '<strong>L’entreprise et les licences,</strong> en espagnol.'], ['1440-es-process.png', '<strong>Leur FAQ,</strong> en espagnol.']]),
      two([['1440-estimate.png', '<strong>« Free in-home estimate. »</strong> Les deux lignes, l’e-mail et la zone, à côté du formulaire.'], ['1440-errors.png', '<strong>Les erreurs,</strong> reliées à leur champ ; le focus va au premier.']]),
      three([['1440-sent.png', '<strong>Après l’envoi :</strong> la messagerie s’ouvre avec la demande écrite ; une note redonne les deux numéros.'], ['1440-es-errors.png', '<strong>Les mêmes erreurs en espagnol.</strong> La langue du rappel suit celle de la page.'], ['1440-foot.png', '<strong>Le pied de page :</strong> contact, licences, réseaux et langue.']]),
      five([['m-menu.png', '<strong>Le menu.</strong>'], ['m-es-hero.png', '<strong>En espagnol,</strong> au téléphone.'], ['m-es-process.png', '<strong>Le déroulé,</strong> en espagnol.'], ['m-form.png', '<strong>Le formulaire.</strong>'], ['m-foot.png', '<strong>Le pied de page.</strong>']]),
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
