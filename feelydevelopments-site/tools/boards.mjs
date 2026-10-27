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
@font-face { font-family: Spectral; src: ${font('Spectral-200.woff2')}; font-weight: 200; }
@font-face { font-family: Spectral; src: ${font('Spectral-300.woff2')}; font-weight: 300; }
@font-face { font-family: Jost; src: ${font('Jost.woff2')}; font-weight: 400 600; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #F2F1EE; color: #1F201E; font-family: Jost, sans-serif; }
main { padding: 52px 40px 56px; }
.brand { display: flex; align-items: center; gap: 14px; margin: 0 0 30px; color: #5B5D59; font: 500 16px/1 Jost; letter-spacing: 0.02em; }
.brand svg { width: 112px; height: auto; }
.brand span { padding-left: 14px; border-left: 1px solid #D4D3CE; }
h1 { margin: 0; font: 200 64px/1.02 Spectral; letter-spacing: -0.025em; max-width: 22em; }
.sub { margin: 20px 0 38px; font-size: 19px; line-height: 1.6; color: #5B5D59; max-width: 66em; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 34px; }
figure { margin: 0; }
img { width: 100%; display: block; border: 1px solid #D4D3CE; background: #fff; }
figcaption { margin-top: 12px; font-size: 16px; line-height: 1.45; color: #5B5D59; }
figcaption strong { color: #1F201E; font-weight: 600; }
`;
// les espaces insécables du français : pas de guillemet ni de deux-points seul en début de ligne
const fr = (t) => t.replace(/« /g, '« ').replace(/ (»|:|;|\?|!)/g, ' $1');
const page = ({title, sub, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body><main><p class="brand">${markSvg()}<span>Developments</span></p><h1>${fr(title)}</h1><p class="sub">${fr(sub)}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${fr(cap)}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const three = (items) => ({cols: 'repeat(3, 1fr)', items});
const four = (items) => ({cols: 'repeat(4, 1fr)', items});
const five = (items) => ({cols: 'repeat(5, 1fr)', items});
const BOARDS = {
  'l-enfilade': {
    title: 'Design-Build-Live : l’enfilade',
    sub: 'Leur devise tient en trois mots reliés par deux traits d’union. Le site en fait sa structure : sur ordinateur, on traverse la maison de côté, pièce après pièce, comme une enfilade. Le trait d’union s’étire en une barre qui court d’un mot au suivant, à sa hauteur exacte dans la lettre. Chaque pièce a son mot, une de leurs photos en grand et une de leurs phrases. À l’arrivée, le mot monte de derrière sa ligne, la barre file vers la droite et la photo s’ouvre dans le sens de la marche. La molette, le pavé tactile, les flèches et la touche Tab font avancer. Sur un petit écran, un écran tactile, ou avec le réglage « réduire les animations », la même page se lit de haut en bas.',
    rows: [
      four([['o-d-150.png', '<strong>L’arrivée.</strong> Le mot est encore sous sa ligne, la photo commence à s’ouvrir…'], ['o-d-450.png', '<strong>… le mot monte,</strong> la barre part vers la droite…'], ['o-d-800.png', '<strong>… et la photo s’ouvre</strong> dans le sens de la marche.'], ['1440-design.png', '<strong>Au repos :</strong> leur promesse, « Meet with Ryan » et le téléphone, sans défiler.']]),
      three([['1440-seam.png', '<strong>Entre deux pièces,</strong> la barre de « Design » devient celle de « Build ».'], ['1440-build.png', '<strong>« Build » :</strong> la façade, leur phrase, et ce que leur site ne dit pas : leurs deux licences.'], ['1440-live.png', '<strong>« Live » :</strong> le séjour sous les poutres, « a luxury home you love to live in ».']]),
      five([['o-m-450.png', '<strong>Au téléphone,</strong> la même arrivée.'], ['m-top.png', '<strong>L’accueil,</strong> de haut en bas.'], ['m-menu.png', '<strong>Le menu :</strong> les pièces, le téléphone, l’e-mail.'], ['768-top.png', '<strong>Sur tablette.</strong>'], ['og.jpg', '<strong>L’image de partage</strong> (1200 × 630) : la frise en une ligne.']]),
    ],
  },
  'les-details': {
    title: 'Les détails de leurs maisons',
    sub: 'Leur site n’a que trois photos, et une galerie vide. Elles sont montrées en grand, sans jamais être agrandies, et chacune donne ses détails, recadrés dans l’original : les portes anciennes sur leur rail de fer, la brique blanchie, le chêne en chevrons ; les poutres de récupération, la cheminée dans le mur de chêne, la hotte en bois. Au survol d’un détail, son cadre se dessine sur la grande photo. Dans « Build », les cinq étapes de leur texte, de l’immobilier à l’emménagement, et les deux licences de l’État, liées à leur fiche du registre. Le numéro de la maison, lisible sur la plaque d’un pilier de leur photo de façade, est effacé.',
    rows: [
      two([['1440-detail-doors.png', '<strong>« Antique doors on an iron rail » :</strong> au survol, le cadre se pose sur la porte de droite.'], ['1440-detail-oak.png', '<strong>« Herringbone oak floor » :</strong> le cadre descend sur le parquet.']]),
      two([['1440-build-end.png', '<strong>De l’immobilier à l’emménagement,</strong> en cinq étapes, et les deux licences.'], ['1440-live-end.png', '<strong>Les détails du séjour :</strong> les poutres, la cheminée, la hotte.']]),
      four([['m-plate.png', '<strong>Au téléphone,</strong> la photo de l’entrée et sa légende.'], ['m-design-details.png', '<strong>Leur phrase,</strong> puis les détails, au doigt.'], ['m-steps.png', '<strong>Les étapes</strong> et les licences.'], ['m-live.png', '<strong>« Live ».</strong>']]),
    ],
  },
  'les-maisons-et-le-rendez-vous': {
    title: 'Available homes, puis le rendez-vous avec Ryan',
    sub: 'Leurs deux maisons étaient des petites annonces collées, avec des fautes. Palmer Avenue, la villa en construction, se tient sur un mur vert, comme le « green perimeter wall » de leur texte : le prix, la surface et le terrain en grand, et un bouton qui ouvre la demande sur la villa. Whipple Avenue, vendue, raconte ses deux étages. Puis « Meet with Ryan », leur vraie promesse : la page donne le jour de la réponse (cinq jours ouvrés, sans les week-ends ni les jours fériés américains), les erreurs disent quoi corriger, et le bouton écrit l’e-mail à Ryan. À la fin, leur logo, redessiné en vectoriel, termine la frise.',
    rows: [
      two([['1440-homes.png', '<strong>Palmer Avenue,</strong> sur son mur vert.'], ['1440-homes-end.png', '<strong>Whipple Avenue,</strong> vendue : l’étage et le rez-de-chaussée.']]),
      two([['1440-meet-palmer.png', '<strong>« Ask about Palmer Avenue » :</strong> la demande s’ouvre sur la villa, avec le jour de la réponse.'], ['1440-meet-errors.png', '<strong>Les erreurs,</strong> reliées à leur champ ; le focus va au premier.']]),
      two([['1440-meet-sent.png', '<strong>Après l’envoi :</strong> la messagerie s’ouvre avec la demande écrite ; une note redonne l’e-mail et le téléphone.'], ['1440-end.png', '<strong>La fin :</strong> le logo en grand, l’adresse, le téléphone, l’e-mail et les licences.']]),
      five([['m-homes.png', '<strong>Au téléphone,</strong> Palmer Avenue.'], ['m-whipple.png', '<strong>Whipple Avenue.</strong>'], ['m-meet.png', '<strong>Meet with Ryan.</strong>'], ['m-form.png', '<strong>La demande.</strong>'], ['m-end.png', '<strong>La fin.</strong>']]),
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
