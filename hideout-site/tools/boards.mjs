// Planches de présentation (boards/*.jpg, 1600 px de large), composées en HTML avec la police et le logo du site,
// à partir des captures de tools/shots.mjs (o-*, 1440-*, m-*).
//   node tools/boards.mjs <dossier des captures> [dossier de sortie, boards par défaut]
import {createRequire} from 'node:module';
import {mkdirSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const src = resolve(process.argv[2] || 'shots');
const out = resolve(process.argv[3] || 'boards');
mkdirSync(out, {recursive: true});
const logo = readFileSync('src/logo-compact.svg', 'utf8');

const css = `
@font-face { font-family: "Archivo"; src: url("file://${resolve('vendor/fonts/Archivo.woff2')}") format("woff2"); font-weight: 100 900; font-stretch: 62% 125%; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #f4eee9; color: #221a16; font-family: "Archivo", sans-serif; }
main { padding: 56px 40px 52px; }
.mark { width: 190px; margin: 0 0 26px; color: #221a16; }
.mark svg { display: block; width: 100%; height: auto; }
h1 { margin: 0; font-weight: 300; font-stretch: 125%; font-size: 52px; line-height: 1.04; letter-spacing: -0.01em; }
.sub { margin: 16px 0 38px; font-size: 20px; line-height: 1.5; color: #6b5f58; max-width: 62em; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 36px; }
figure { margin: 0; }
img { width: 100%; display: block; border: 1px solid #e2d8d1; background: #fff; }
figcaption { margin-top: 12px; font-size: 16.5px; line-height: 1.4; color: #6b5f58; }
figcaption strong { color: #221a16; font-weight: 600; }
`;

// une planche : des rangées de figures ; cols = gabarit CSS des colonnes de la rangée
const page = ({title, sub, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body><main><div class="mark">${logo}</div><h1>${title}</h1><p class="sub">${sub}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${cap}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const three = (items) => ({cols: 'repeat(3, 1fr)', items});
const four = (items) => ({cols: 'repeat(4, 1fr)', items});
const BOARDS = {
  ouverture: {
    title: 'L’ouverture : le cadre du logo s’ouvre sur le cabinet',
    sub: 'Le logo de Hideout est un cadre doré ouvert sur les côtés. À l’ouverture, il apparaît tel quel ; son nom s’efface, une vraie photo du cabinet s’ouvre dedans comme un volet, puis le cadre s’agrandit jusqu’à devenir la fenêtre de l’accueil, pendant que le titre se découvre. 2 s, une fois, en haut de la page ; rien ne se décale, la photo n’est pas zoomée.',
    rows: [
      three([['o-d-0250.png', '<strong>0,25 s.</strong> Le logo se pose, son cadre se trace du milieu vers les coins.'], ['o-d-0700.png', '<strong>0,7 s.</strong> Le nom s’efface, le cadre reste seul.'], ['o-d-0900.png', '<strong>0,9 s.</strong> La photo s’est ouverte dans le cadre, à partir d’un trait à mi-hauteur.']]),
      three([['o-d-1250.png', '<strong>1,25 s.</strong> Le cadre s’agrandit, le titre commence à se découvrir.'], ['o-d-1500.png', '<strong>1,5 s.</strong> L’en-tête arrive, le texte suit le titre.'], ['o-d-2000.png', '<strong>2 s.</strong> Tout est en place ; plus rien ne bouge.']]),
      four([['o-m-0250.png', '<strong>Téléphone, 0,25 s.</strong>'], ['o-m-0900.png', '<strong>0,9 s.</strong> La photo dans le cadre du logo.'], ['o-m-1500.png', '<strong>1,5 s.</strong>'], ['o-m-2400.png', '<strong>Fin.</strong>']]),
    ],
  },
  sections: {
    title: 'Les sections',
    sub: 'Une seule page : l’accueil, les cinq familles de soins, les avant/après de leurs clientes, l’équipe et ses diplômes, les abonnements et leurs prix, la visite. Captures à la taille d’un écran d’ordinateur (1440 × 900).',
    rows: [
      two([['1440-hero.png', '<strong>L’accueil.</strong> Leur phrase, une vraie photo du cabinet dans le cadre du logo, « Book now ».'], ['1440-svc.png', '<strong>Les soins.</strong> 55 soins en cinq familles, ou à partir de ce qui gêne ; la photo de la famille dans le cadre.']]),
      two([['1440-res.png', '<strong>Les résultats.</strong> 38 avant/après de leurs clientes, chacun avec son soin et sa praticienne.'], ['1440-team.png', '<strong>L’équipe.</strong> Le cadre se trace autour de la photo de groupe quand elle arrive.']]),
      two([['1440-team-2.png', '<strong>Les responsables.</strong> Diplômes, Instagram et un avis de cliente pour chacune.'], ['1440-mem.png', '<strong>Les abonnements.</strong> Le Beauty Bank et son crédit qui s’accumule.']]),
      two([['1440-visit.png', '<strong>La visite.</strong> La carte dessinée d’après OpenStreetMap ; le cadre se pose sur leur adresse.'], ['1440-foot.png', '<strong>Le pied de page.</strong> Le logo entier, l’adresse, le téléphone, le courriel, les règles.']]),
    ],
  },
  details: {
    title: 'Les détails qui comptent',
    sub: 'En dehors de l’ouverture, rien ne bouge tout seul : tout répond à un geste. Les lettres d’une famille s’élargissent au survol et le cadre passe à sa photo ; une préoccupation souligne les soins concernés ; un filtre trie les résultats ; le curseur du Beauty Bank recalcule le crédit.',
    rows: [
      two([['1440-svc-hover.png', '<strong>Survol de « Injectables » :</strong> le nom s’élargit, le cadre passe à la photo de Lina avec l’échographe.'], ['1440-svc-open.png', '<strong>Une famille ouverte :</strong> ses soins et leurs faits (séance, éviction, séances), écrits pareil partout.']]),
      two([['1440-concern.png', '<strong>« Acne » :</strong> dix soins pour commencer, dans deux familles, et le rappel de la consultation.'], ['1440-res-pmu.png', '<strong>Un filtre :</strong> les neuf avant/après de maquillage permanent, annoncés aux lecteurs d’écran.']]),
      two([['1440-viewer.png', '<strong>La visionneuse :</strong> au clavier, flèches et Échap ; jamais plus grande que la photo d’origine.'], ['1440-mem-2.png', '<strong>Skin Health, Perfectly Bare, le financement :</strong> les prix tels que le cabinet les affiche.']]),
    ],
  },
  telephone: {
    title: 'Sur téléphone',
    sub: 'Testé de 320 à 820 px : pas de défilement de côté, boutons de 44 px, la photo de chaque famille dans son cadre quand on l’ouvre, la carte en hauteur, la barre « Book now / Call » qui se retire sur la visite.',
    rows: [
      four([['m-hero.png', '<strong>L’accueil.</strong>'], ['m-svc.png', '<strong>Les soins.</strong>'], ['m-svc-open.png', '<strong>Une famille ouverte,</strong> sa photo dans le cadre.'], ['m-res.png', '<strong>Les résultats.</strong>']]),
      four([['m-team-2.png', '<strong>L’équipe.</strong>'], ['m-mem-2.png', '<strong>Le Beauty Bank.</strong>'], ['m-visit.png', '<strong>La visite,</strong> la carte en hauteur.'], ['m-menu.png', '<strong>Le menu.</strong> La page dessous devient inerte.']]),
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
