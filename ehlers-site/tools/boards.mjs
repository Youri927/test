// Planches de présentation (boards/*.jpg, 1600 px de large), composées en HTML avec la police du site, à partir des
// captures de tools/shots.mjs (o-*, 1440-*, m-*).
//   node tools/boards.mjs <dossier des captures> [dossier de sortie, boards par défaut]
import {createRequire} from 'node:module';
import {mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const src = resolve(process.argv[2] || 'shots');
const out = resolve(process.argv[3] || 'boards');
mkdirSync(out, {recursive: true});

const css = `
@font-face { font-family: "Host Grotesk"; src: url("file://${resolve('vendor/fonts/HostGrotesk.woff2')}") format("woff2"); font-weight: 300 800; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #e6eeec; color: #12333a; font-family: "Host Grotesk", sans-serif; }
main { padding: 52px 40px 52px; }
.mark { display: flex; align-items: baseline; gap: 10px; margin: 0 0 30px; }
.mark b { font-weight: 640; font-size: 30px; letter-spacing: -0.045em; }
.mark span { font-size: 15px; color: #4d6168; }
h1 { margin: 0; font-weight: 560; font-size: 50px; line-height: 1.04; letter-spacing: -0.035em; }
.sub { margin: 16px 0 38px; font-size: 20px; line-height: 1.5; color: #4d6168; max-width: 62em; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 36px; }
figure { margin: 0; }
img { width: 100%; display: block; border: 1px solid #d3dcda; background: #fff; }
figcaption { margin-top: 12px; font-size: 16.5px; line-height: 1.4; color: #4d6168; }
figcaption strong { color: #12333a; font-weight: 600; }
`;

// une planche : des rangées de figures ; cols = gabarit CSS des colonnes de la rangée
const page = ({title, sub, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body><main><p class="mark"><b>Ehlers</b><span>Contracting Services, Inc.</span></p><h1>${title}</h1><p class="sub">${sub}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${cap}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const three = (items) => ({cols: 'repeat(3, 1fr)', items});
const four = (items) => ({cols: 'repeat(4, 1fr)', items});
const BOARDS = {
  ouverture: {
    title: 'L’ouverture : la ligne d’horizon',
    sub: 'Un trait d’encre se tend à travers la page, puis le séjour de Park Shore s’ouvre verticalement à partir de lui. Le trait est posé sur l’horizon de la baie, à 40 % de la hauteur de la photo, quel que soit l’écran. Le titre se découvre en même temps. 2,7 s, une fois, au chargement ; rien ne se décale, la photo n’est pas zoomée.',
    rows: [
      three([['o-d-0300.png', '<strong>0,3 s.</strong> La ligne d’horizon se tend depuis le milieu.'], ['o-d-0700.png', '<strong>0,7 s.</strong> Elle traverse la page ; le titre se découvre.'], ['o-d-0900.png', '<strong>0,9 s.</strong> La photo s’ouvre à partir de la ligne, sur l’horizon de la baie.']]),
      three([['o-d-1200.png', '<strong>1,2 s.</strong> La photo s’ouvre en haut et en bas ; le texte et les boutons suivent le titre.'], ['o-d-1800.png', '<strong>1,8 s.</strong> La ligne s’est effacée ; la photo est entière.'], ['o-d-2700.png', '<strong>2,7 s.</strong> La légende « Park Shore, Naples » ; plus rien ne bouge.']]),
      four([['o-m-0500.png', '<strong>Téléphone, 0,5 s.</strong> La ligne.'], ['o-m-0900.png', '<strong>0,9 s.</strong> La photo s’ouvre.'], ['o-m-1500.png', '<strong>1,5 s.</strong> La photo s’est ouverte, cadrée en hauteur.'], ['o-m-2700.png', '<strong>Fin.</strong> Le titre, le texte et les boutons.']]),
    ],
  },
  sections: {
    title: 'Les parties du site',
    sub: 'Une seule page, dans l’ordre des questions d’un propriétaire : qui est Rick, à quoi ressemble son travail, ce qu’il construit et combien ça coûte, s’il est en règle, comment le joindre. Captures à la taille d’un écran d’ordinateur (1440 × 900).',
    rows: [
      two([['1440-hero.png', '<strong>L’accueil.</strong> Leur métier et leur ville, une vraie photo de leur travail, le téléphone.'], ['1440-rick.png', '<strong>Rick.</strong> Son entreprise, sa licence, son ancrage à Naples, son portrait.']]),
      two([['1440-read-1.png', '<strong>Le travail.</strong> Une cuisine de Park Shore, lue détail par détail : la photo reste à l’écran, le détail lu est cadré.'], ['1440-services.png', '<strong>Les services.</strong> Un tableau : ce que couvre chaque service, et des exemples tirés de leurs permis.']]),
      two([['1440-record.png', '<strong>Le registre.</strong> La licence CBC1250125 en grand, son statut, le lien pour la vérifier sur le site de l’État.'], ['1440-contact.png', '<strong>Le contact.</strong> Le téléphone et le courriel en grand, et un formulaire qui rédige le courriel.']]),
      two([['1440-span.png', '<strong>Comment se passe un projet.</strong> Une ligne de cote : Rick, du concept à la fin du chantier, en cinq étapes.'], ['1440-foot.png', '<strong>Le pied de page.</strong> Un cartouche de plan : entrepreneur, licence, téléphone, courriel, ville.']]),
    ],
  },
  details: {
    title: 'Les détails qui comptent',
    sub: 'En dehors de l’ouverture, rien ne bouge tout seul : tout répond au défilement ou à un geste. Le cadre glisse vers le détail qu’on lit, le plan des cages se trace à l’échelle, les filtres trient les permis, le formulaire dit quoi corriger.',
    rows: [
      three([['1440-read-2.png', '<strong>Détail 2 :</strong> la suspension lanterne.'], ['1440-read-3.png', '<strong>Détail 3 :</strong> la crédence en mosaïque, éclairée sous les meubles.'], ['1440-read-5.png', '<strong>Détail 5 :</strong> le mur d’armoires autour du réfrigérateur.']]),
      two([['1440-plan.png', '<strong>Les cages moustiquaires</strong> d’Ave Maria, dessinées à la même échelle d’après les mesures de leurs permis (32 × 10 ft et 16 × 12,5 ft).'], ['1440-range.png', '<strong>La fourchette :</strong> de 10 000 $ pour une salle de bain à 500 000 $ pour un agrandissement, d’après leur profil Houzz.']]),
      two([['1440-ledger-commercial.png', '<strong>Un filtre :</strong> les quatre chantiers commerciaux, annoncés aux lecteurs d’écran.'], ['1440-contact-errors.png', '<strong>Le formulaire :</strong> chaque erreur dit quoi faire, sans rien décaler ; le focus va au premier champ à corriger.']]),
    ],
  },
  telephone: {
    title: 'Sur téléphone',
    sub: 'Testé de 320 à 860 px : pas de défilement de côté, cibles de 44 px, une photo de l’accueil cadrée en hauteur, la photo de la cuisine qui reste en haut pendant qu’on lit dessous, et un menu qui garde le focus.',
    rows: [
      four([['m-hero.png', '<strong>L’accueil.</strong>'], ['m-rick.png', '<strong>Rick.</strong>'], ['m-read-3.png', '<strong>La cuisine :</strong> le détail lu sous la photo est cadré.'], ['m-services.png', '<strong>Les services.</strong>']]),
      four([['m-plan.png', '<strong>Les cages à l’échelle.</strong>'], ['m-record.png', '<strong>La licence.</strong>'], ['m-ledger.png', '<strong>Les chantiers.</strong>'], ['m-menu.png', '<strong>Le menu.</strong> La page dessous devient inerte.']]),
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
