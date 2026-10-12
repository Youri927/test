// Planches de présentation (boards/*.jpg, 1600 px de large), composées en HTML avec les polices du site,
// à partir des captures de tools/interact.mjs (i-*.png) et de tools/shots.mjs (s-*.jpg, p-*.png).
//   node tools/boards.mjs <dossier des captures> [dossier de sortie, boards par défaut]
import {createRequire} from 'node:module';
import {mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const src = resolve(process.argv[2] || 'shots');
const out = resolve(process.argv[3] || 'boards');
mkdirSync(out, {recursive: true});
const font = (f) => 'file://' + resolve(`vendor/fonts/${f}.woff2`);

const css = `
@font-face { font-family: Syne; src: url("${font('Syne')}") format("woff2"); font-weight: 400 800; }
@font-face { font-family: Onest; src: url("${font('Onest')}") format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #E4EBEF; color: #0C1838; font-family: Onest, sans-serif; }
body.dark { background: #0A1430; color: #EAF0F7; }
main { padding: 60px 40px 52px; }
h1 { font-family: Syne; font-weight: 700; font-size: 48px; line-height: 1; letter-spacing: -0.035em; margin: 0; }
.sub { margin: 16px 0 38px; font-size: 20px; line-height: 1.45; color: #46546B; max-width: 60em; }
.dark .sub { color: #A8B6CC; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 36px; }
figure { margin: 0; }
img { width: 100%; display: block; border-radius: 16px; border: 1px solid rgba(12, 24, 56, 0.14); }
.dark img { border-color: rgba(234, 240, 247, 0.16); }
figcaption { margin-top: 12px; font-size: 16.5px; line-height: 1.4; color: #46546B; }
figcaption strong { color: #0C1838; font-weight: 600; }
.dark figcaption { color: #A8B6CC; }
.dark figcaption strong { color: #EAF0F7; }
`;

// une planche : des rangées de figures ; cols = gabarit CSS des colonnes de la rangée
const page = ({title, sub, dark, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body${dark ? ' class="dark"' : ''}><main><h1>${title}</h1><p class="sub">${sub}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${cap}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const BOARDS = {
  accueil: {
    title: 'L’accueil, de jour et de nuit',
    sub: 'Un appui sur « Pool lights » allume la piscine : la photo devient la même piscine, le même soir, et tout le site passe de nuit. Au coucher du soleil à Wilmington, il le fait tout seul.',
    rows: [two([['i-hero-day.png', '<strong>Lumières éteintes.</strong> « A Prestige pool at dusk. », avec l’heure du coucher du soleil du jour.'], ['i-hero-night.png', '<strong>Lumières allumées.</strong> « Same pool, same evening, lights on. » Les deux photos sont recalées au pixel près.']])],
  },
  allumage: {
    title: 'L’allumage',
    sub: 'Le fond passe par une teinte de crépuscule avant la nuit, les textes suivent d’un seul mouvement, et la photo se fond dans sa version allumée : 1,25 s en tout. Avec « réduire les animations », le passage est immédiat.',
    rows: [
      two([['i-switch-120.png', '<strong>0,12 s</strong> après l’appui.'], ['i-switch-450.png', '<strong>0,45 s :</strong> le crépuscule.']]),
      two([['i-switch-800.png', '<strong>0,8 s :</strong> la nuit tombe, les textes s’éclairent.'], ['i-switch-1300.png', '<strong>1,3 s :</strong> la nuit.']]),
    ],
  },
  sections: {
    title: 'Les sections, de jour',
    sub: 'De la promesse à la demande de projet : chaque section répond à la question que la précédente fait naître. Captures à la taille d’un écran d’ordinateur (1440 × 900).',
    rows: [
      two([['s-off-glass.jpg', '<strong>Pourquoi la fibre de verre.</strong> Leur cour de Monkey Junction, une coque posée par leur pelle.'], ['s-off-compare.jpg', '<strong>Le comparatif.</strong> Quatre points, chacun tiré de leur page « Pros & Cons ».']]),
      two([['s-off-build.jpg', '<strong>La pose.</strong> Leurs machines, et les 8 étapes qui s’allument au défilement.'], ['s-off-work.jpg', '<strong>La galerie.</strong> 34 piscines, 5 filtres, une grande photo toutes les six.']]),
      two([['s-off-opts.jpg', '<strong>Les options.</strong> Dans l’eau, autour, au fond du jardin.'], ['s-off-cocktail.jpg', '<strong>La piscine cocktail.</strong> 10 × 16 ft, pour les petits jardins.']]),
      two([['s-off-dark.jpg', '<strong>La nuit.</strong> Toujours de nuit, même en plein jour : elle annonce l’interrupteur.'], ['s-off-spas.jpg', '<strong>Spas et équipement.</strong> Deux colonnes alignées, un spa de jour, un spa de nuit.']]),
      two([['s-off-reviews.jpg', '<strong>Les avis.</strong> Dix vrais avis, centrés sur Jordan.'], ['s-off-family.jpg', '<strong>La famille.</strong> Shane depuis 1991, licences, récompenses, engagement local.']]),
      two([['s-off-money.jpg', '<strong>Financement et service.</strong> Six prêteurs, la détection de fuites, un bouton vers le service.'], ['s-off-plan.jpg', '<strong>Le formulaire et la visite.</strong> Le bon service selon le sujet, l’état « Open now ».']]),
    ],
  },
  nuit: {
    title: 'Le même site, de nuit',
    dark: true,
    sub: 'Lumières allumées, toutes les couleurs passent de nuit : textes, bords, boutons, et chaque contraste a été remesuré. La galerie commence alors par les piscines éclairées.',
    rows: [
      two([['s-on-compare.jpg', '<strong>Le comparatif.</strong>'], ['s-on-work.jpg', '<strong>La galerie</strong> commence par les piscines de nuit.']]),
      two([['s-on-opts.jpg', '<strong>Les options.</strong>'], ['s-on-reviews.jpg', '<strong>Les avis.</strong>']]),
      two([['s-on-family.jpg', '<strong>La famille.</strong> La devise s’éclaire.'], ['s-on-plan.jpg', '<strong>Le formulaire.</strong> La photo de l’exposition s’allume aussi.']]),
    ],
  },
  interactions: {
    title: 'Les interactions',
    sub: 'Tout se fait à la souris, au doigt ou au clavier, et chaque changement est annoncé aux lecteurs d’écran.',
    rows: [
      two([['i-filter.png', '<strong>Filtre « By the water » :</strong> 7 piscines, le nombre est annoncé.'], ['i-lightbox.png', '<strong>La visionneuse :</strong> photo entière, flèches, glissement du doigt, Échap.']]),
      two([['i-hue-blue.png', '<strong>Les projecteurs en bleu :</strong> la même piscine, le même soir…'], ['i-hue-red.png', '<strong>… puis en rouge.</strong> La photo change sur place.']]),
      {cols: '1fr 360px', items: [['i-form-error.png', '<strong>Le formulaire :</strong> un seul message dit ce qui manque, le curseur va au premier champ.'], ['i-menu.png', '<strong>Le menu sur téléphone.</strong> La page dessous devient inerte.']]},
    ],
  },
  telephone: {
    title: 'Sur téléphone',
    sub: 'Testé de 320 à 820 px : pas de défilement de côté, cibles de 44 px, 10 photos dans la galerie avant « Show all 34 photos ».',
    rows: [
      {cols: 'repeat(4, 1fr)', items: [['p-accueil-jour.png', '<strong>L’accueil.</strong>'], ['p-accueil-nuit.png', '<strong>Lumières allumées.</strong>'], ['p-tableau.png', '<strong>Le comparatif,</strong> une ligne par matériau.'], ['p-galerie.png', '<strong>La galerie.</strong>']]},
      {cols: 'repeat(4, 1fr)', items: [['p-projecteurs.png', '<strong>Les projecteurs.</strong>'], ['p-spas.png', '<strong>Spas et équipement.</strong>'], ['p-avis.png', '<strong>Les avis,</strong> de nuit.'], ['p-formulaire.png', '<strong>Le formulaire.</strong>']]},
    ],
  },
};

const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});
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
