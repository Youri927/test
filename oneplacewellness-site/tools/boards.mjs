// Planches de présentation (boards/*.jpg, 1600 px de large), composées en HTML avec les polices du site,
// à partir des captures de tools/shots.mjs (o-*, s-*, 1440-*, m-*) et de tools/interact.mjs (i-*).
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
@font-face { font-family: "Bodoni Moda"; src: url("${font('BodoniModa')}") format("woff2"); font-weight: 400 900; }
@font-face { font-family: "Hanken Grotesk"; src: url("${font('HankenGrotesk')}") format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #f3f0f4; color: #271b2d; font-family: "Hanken Grotesk", sans-serif; }
main { padding: 60px 40px 52px; }
.mark { margin: 0 0 18px; font-family: "Bodoni Moda", serif; font-size: 22px; font-weight: 500; }
h1 { margin: 0; font-family: "Bodoni Moda", serif; font-weight: 450; font-size: 54px; line-height: 1.02; letter-spacing: -0.015em; }
.sub { margin: 16px 0 38px; font-size: 20px; line-height: 1.45; color: #5e4e63; max-width: 62em; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 36px; }
figure { margin: 0; }
img { width: 100%; display: block; border-radius: 8px; border: 1px solid #d8d0db; background: #fff; }
figcaption { margin-top: 12px; font-size: 16.5px; line-height: 1.4; color: #5e4e63; }
figcaption strong { color: #271b2d; font-weight: 600; }
`;

// une planche : des rangées de figures ; cols = gabarit CSS des colonnes de la rangée
const page = ({title, sub, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body><main><p class="mark">One Place Wellness</p><h1>${title}</h1><p class="sub">${sub}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${cap}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const four = (items) => ({cols: 'repeat(4, 1fr)', items});
const BOARDS = {
  ouverture: {
    title: 'L’ouverture : la lumière passe de rasante à de face',
    sub: 'La Dre Fox traite les ombres, pas le volume. À l’ouverture, une fenêtre de soleil se pose sur la page : partie basse et étirée, elle vient se placer de face, et les ombres des lettres raccourcissent jusqu’à n’être plus qu’une ombre courte et douce. Rien ne grossit ni ne se déplace. 2,6 s, une seule fois, en haut de la page.',
    rows: [
      two([['o-d-0000.png', '<strong>Départ.</strong> Lumière rasante : chaque lettre traîne une ombre longue, nette contre le trait.'], ['o-d-0900.png', '<strong>0,9 s.</strong> La fenêtre, encore basse et étirée, commence à glisser.']]),
      two([['o-d-1300.png', '<strong>1,3 s.</strong> Les ombres raccourcissent.'], ['o-d-1700.png', '<strong>1,7 s.</strong> La fenêtre se redresse derrière le titre.']]),
      two([['o-d-2100.png', '<strong>2,1 s.</strong> Presque de face.'], ['o-d-3100.png', '<strong>Fin.</strong> Quatre carreaux de lumière, une ombre courte sous les lettres.']]),
      four([['o-m-0000.png', '<strong>Téléphone, départ.</strong>'], ['o-m-1300.png', '<strong>1,3 s.</strong>'], ['o-m-2100.png', '<strong>2,1 s.</strong>'], ['o-m-3100.png', '<strong>Fin.</strong>']]),
    ],
  },
  sections: {
    title: 'Les sections',
    sub: 'Une seule page, « one place » : la promesse, les ombres, les six soins sur une ligne du temps, les cas de la galerie, la docteure, la visite. Captures à la taille d’un écran d’ordinateur (1440 × 900).',
    rows: [
      two([['1440-hero.png', '<strong>L’accueil.</strong> Leur phrase, la chirurgienne, le téléphone.'], ['1440-shade.png', '<strong>Les ombres.</strong> 3 à 5 mm, cinq ans de plus ; une règle et le vrai cas.']]),
      two([['1440-tm.png', '<strong>Les soins.</strong> Six soins sur une échelle par paliers, de 15 minutes à 2 ans.'], ['1440-cases.png', '<strong>Les cas.</strong> La demande, le produit, la quantité, l’endroit.']]),
      two([['1440-doc.png', '<strong>La docteure.</strong> Ce que 25 ans de liftings lui apprennent d’un visage.'], ['1440-map.png', '<strong>La visite.</strong> La carte dessinée d’après OpenStreetMap, le cabinet au violet du marqueur.']]),
      two([['1440-form.png', '<strong>La demande.</strong> Coordonnées, horaires, et une demande de consultation qui marche.'], ['1440-foot.png', '<strong>Le pied de page.</strong> L’adresse, le téléphone, le courriel, les marques citées.']]),
    ],
  },
  details: {
    title: 'Les détails qui comptent',
    sub: 'La ligne du temps se trace une fois, parce que c’est son sens : un curseur la balaie, et chaque trait apparaît à son passage. Le reste ne bouge que si on le touche : un soin s’ouvre, un filtre trie les cas, le formulaire dit quoi corriger.',
    rows: [
      two([['s-0900.png', '<strong>0,9 s.</strong> Le curseur passe une heure : la séance, le temps où la zone est sensible.'], ['s-1500.png', '<strong>1,5 s.</strong> Un mois : les résultats du Botox, le rappel offert, le laser cicatrisé.']]),
      two([['s-2100.png', '<strong>2,1 s.</strong> Un an : ThermiSmooth, le Restylane.'], ['s-3600.png', '<strong>Fin.</strong> Le curseur s’efface, tout est tracé.']]),
      two([['1440-tm-open.png', '<strong>Un soin ouvert :</strong> ce qu’il traite, comment, le mot de la docteure, les produits.'], ['1440-cases-botox.png', '<strong>Un filtre :</strong> les trois cas de Botox et de Xeomin, annoncés aux lecteurs d’écran.']]),
      two([['i-form-error.png', '<strong>Le formulaire :</strong> chaque erreur sous son champ, le curseur va au premier à corriger.'], ['1180-tm.png', '<strong>À 1 180 px,</strong> les étiquettes se replacent, sans jamais se chevaucher.']]),
    ],
  },
  telephone: {
    title: 'Sur téléphone',
    sub: 'Testé de 320 à 820 px : pas de défilement de côté, cibles de 44 px, chaque soin avec ses faits écrits sous sa piste, la carte en hauteur, la barre d’appel qui se retire sur la section visite.',
    rows: [
      four([['m-hero.png', '<strong>L’accueil.</strong>'], ['m-shade.png', '<strong>Les ombres.</strong>'], ['m-case.png', '<strong>Le cas.</strong>'], ['m-tm.png', '<strong>Les soins,</strong> faits écrits sous chaque piste.']]),
      four([['m-cases.png', '<strong>Les cas.</strong>'], ['m-doc.png', '<strong>La docteure.</strong>'], ['m-visit.png', '<strong>La visite,</strong> la carte en hauteur.'], ['m-form.png', '<strong>La demande.</strong>']]),
      four([['i-menu.png', '<strong>Le menu.</strong> La page dessous devient inerte.'], ['i-dock.png', '<strong>La barre d’appel,</strong> au milieu de la page.'], ['m-tm-2.png', '<strong>ThermiSmooth et le laser.</strong>'], ['m-ledger.png', '<strong>Un cas,</strong> lu d’un bloc.']]),
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
