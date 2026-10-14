// Planches de présentation (boards/*.jpg, 1600 px de large), composées en HTML avec la police du site, à partir des
// captures de tools/shots.mjs (o-*, 1440-*, m-*) et de l'image de partage (web/og.jpg).
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
@font-face { font-family: "Encode Sans"; src: url("file://${resolve('vendor/fonts/EncodeSans.woff2')}") format("woff2"); font-weight: 100 900; font-stretch: 75% 125%; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #eaf1fa; color: #0b1b4d; font-family: "Encode Sans", sans-serif; }
main { padding: 52px 40px 52px; }
.mark { display: flex; align-items: center; gap: 12px; margin: 0 0 30px; }
.mark img { width: 52px; height: auto; border: 0; background: none; }
.mark b { font-weight: 780; font-stretch: 112%; font-size: 24px; }
.mark span { font-size: 24px; font-weight: 420; }
h1 { margin: 0; font-weight: 790; font-stretch: 125%; font-size: 46px; line-height: 1.04; letter-spacing: -0.02em; }
.sub { margin: 16px 0 38px; font-size: 20px; line-height: 1.5; color: #3d4b6e; max-width: 62em; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 36px; }
figure { margin: 0; }
img { width: 100%; display: block; border: 1px solid #d3dcea; background: #fff; }
figcaption { margin-top: 12px; font-size: 16.5px; line-height: 1.4; color: #3d4b6e; }
figcaption strong { color: #0b1b4d; font-weight: 680; }
`;

// une planche : des rangées de figures ; cols = gabarit CSS des colonnes de la rangée
const page = ({title, sub, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body><main><p class="mark"><img src="file://${resolve('src/img/crest.avif')}" alt=""><b>Mendieta</b><span>Roofing Corp.</span></p><h1>${title}</h1><p class="sub">${sub}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${cap}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const three = (items) => ({cols: 'repeat(3, 1fr)', items});
const four = (items) => ({cols: 'repeat(4, 1fr)', items});
const BOARDS = {
  ouverture: {
    title: 'L’ouverture',
    sub: 'Le titre monte ligne par ligne depuis sa ligne de base, puis la photo se découvre du bas vers le haut, comme un toit qui se couvre depuis l’égout. Le texte, les boutons et la licence suivent, puis la légende. 1,9 s, une fois, au chargement ; rien ne se décale, la photo n’est pas zoomée.',
    rows: [
      three([['o-d-0200.png', '<strong>0,2 s.</strong> Les trois lignes du titre montent, à 0,08 s d’écart.'], ['o-d-0400.png', '<strong>0,4 s.</strong> Le titre est presque en place ; la photo commence à se découvrir.'], ['o-d-0600.png', '<strong>0,6 s.</strong> Le texte, les boutons et la licence apparaissent.']]),
      three([['o-d-1000.png', '<strong>1 s.</strong> La photo continue de se découvrir vers le haut.'], ['o-d-1300.png', '<strong>1,3 s.</strong> La photo est entière ; la légende arrive.'], ['o-d-1900.png', '<strong>1,9 s.</strong> Plus rien ne bouge.']]),
      four([['o-m-0200.png', '<strong>Téléphone, 0,2 s.</strong> Le titre monte.'], ['o-m-0600.png', '<strong>0,6 s.</strong> Le texte et les boutons.'], ['o-m-1000.png', '<strong>1 s.</strong> La photo en hauteur se découvre.'], ['o-m-1900.png', '<strong>Fin.</strong> Le titre, les boutons, la licence.']]),
    ],
  },
  'couche-par-couche': {
    title: 'Couche par couche',
    sub: 'La coupe d’un toit de tuiles se monte au fil du défilement, en quatre étapes, et chaque étape est montrée sur une vraie photo d’un de leurs chantiers, au même stade. Sur ordinateur, la partie reste épinglée pendant un peu plus de quatre hauteurs d’écran ; au téléphone, la coupe reste en haut et suit l’étape qu’on lit dessous.',
    rows: [
      two([['1440-layers-1.png', '<strong>Étape 1, au début.</strong> L’ancien toit (sous-couche et tuiles, en pointillés) est encore là.'], ['1440-layers-2.png', '<strong>Étape 1, fin.</strong> Il est parti : il reste le voligeage, mis en avant. La photo : un toit déposé jusqu’au bois.']]),
      two([['1440-layers-3.png', '<strong>Étape 2.</strong> La bavette et la sous-couche se déroulent depuis l’égout. La photo : la sous-couche posée, leur panneau sur la pelouse.'], ['1440-layers-4.png', '<strong>Étape 3.</strong> Les tuiles se posent une à une, du bas vers le haut. La photo : les tuiles montées sur le toit en piles.']]),
      two([['1440-layers-5.png', '<strong>Étape 4.</strong> La coupe est complète ; les maisons des étapes 1 et 2, pendant et après, en tuile blanche et en terre cuite.'], ['1440-roofs.png', '<strong>Les trois types de toit,</strong> dans le même langage : tuile, bardeau, toit plat.']]),
      four([['m-layers-1.png', '<strong>Téléphone, étape 1.</strong> La coupe reste en haut, recadrée sur le toit.'], ['m-layers-2.png', '<strong>Étape 2.</strong> Elle suit l’étape lue dessous.'], ['m-layers-3.png', '<strong>Étape 3.</strong> Les tuiles posées.'], ['m-layers-4.png', '<strong>Étape 4.</strong> Pendant et après.']]),
    ],
  },
  sections: {
    title: 'Les parties du site',
    sub: 'Une seule page, dans l’ordre des questions d’un propriétaire : comment travaillent-ils, l’ont-ils déjà fait, sont-ils sérieux, viennent-ils chez moi, comment les joindre. Captures à la taille d’un écran d’ordinateur (1440 × 900).',
    rows: [
      two([['1440-hero.png', '<strong>L’accueil.</strong> Leur métier, leur ville et 1988 en très grand, une vraie photo de leur travail, le devis et le téléphone.'], ['1440-work.png', '<strong>Les photos.</strong> 21 photos de chantiers posées comme des rangs de tuiles : quatre, puis trois décalées d’une demi-photo.']]),
      two([['1440-reviews.png', '<strong>Les avis.</strong> 16 avis sur leur site, tous à cinq étoiles ; sept cités, signés d’un prénom et d’une initiale.'], ['1440-license.png', '<strong>La licence.</strong> CCC1328504 en grand, son titulaire, sa date et son statut, et le lien vers le registre de l’État.']]),
      two([['1440-area.png', '<strong>Le secteur.</strong> Les 25 villes sur la vraie carte (limites du Census), par comté, avec « Check your city ».'], ['1440-estimate.png', '<strong>Le devis.</strong> Le bureau et le portable en grand, et un formulaire qui rédige le texto.']]),
    ],
  },
  details: {
    title: 'Les détails qui comptent',
    sub: 'En dehors de l’ouverture, rien ne bouge tout seul : tout répond au défilement ou à un geste. Les filtres gardent le décalage des rangs, la visionneuse montre chaque photo à sa vraie taille, la carte répond à une ville, le formulaire dit quoi corriger, puis prépare le message.',
    rows: [
      two([['1440-work-tile.png', '<strong>Un filtre :</strong> les 10 photos de toits en tuiles, toujours en rangs décalés ; le nombre est annoncé aux lecteurs d’écran.'], ['1440-lightbox.png', '<strong>La visionneuse :</strong> la photo à sa taille d’origine, jamais agrandie, avec sa légende et sa place (3 sur 21).']]),
      two([['1440-area-check.png', '<strong>« Check your city » :</strong> la ville s’allume sur la carte, et la réponse dit dans quel comté elle est.'], ['1440-estimate-errors.png', '<strong>Le formulaire :</strong> chaque erreur dit quoi faire ; le focus va au premier champ à corriger.']]),
      two([['1440-estimate-ready.png', '<strong>Le message prêt :</strong> sur ordinateur, le texte à copier et à envoyer au portable ; au téléphone, la messagerie s’ouvre avec lui.'], ['og.jpg', '<strong>L’image de partage</strong> (1200 × 630), pour un lien envoyé par texto, WhatsApp ou Facebook.']]),
    ],
  },
  telephone: {
    title: 'Sur téléphone',
    sub: 'Testé de 320 à 999 px : pas de défilement de côté, cibles de 44 px, la photo de l’accueil cadrée en hauteur, la coupe qui reste en haut pendant qu’on lit, les photos deux par deux, une barre d’appel après l’accueil et un menu qui garde le focus.',
    rows: [
      four([['m-hero.png', '<strong>L’accueil.</strong>'], ['m-layers-2.png', '<strong>Couche par couche.</strong>'], ['m-work.png', '<strong>Les photos,</strong> deux par deux.'], ['m-reviews.png', '<strong>Les avis.</strong>']]),
      four([['m-license.png', '<strong>La licence.</strong>'], ['m-area.png', '<strong>La carte des 25 villes.</strong>'], ['m-estimate.png', '<strong>Le devis.</strong>'], ['m-menu.png', '<strong>Le menu.</strong> La page dessous devient inerte.']]),
    ],
  },
};

const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 1600, height: 400}});
for (const [name, def] of Object.entries(BOARDS)) {
  const html = `${src}/_board-${name}.html`;
  writeFileSync(html, page(def));
  await p.goto('file://' + html, {waitUntil: 'load'});
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({path: `${out}/${name}.jpg`, type: 'jpeg', quality: 84, fullPage: true});
  rmSync(html);
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  console.log(`${name}.jpg : 1600 × ${h}`);
}
await b.close();
rmSync(`${src}/og.jpg`);
