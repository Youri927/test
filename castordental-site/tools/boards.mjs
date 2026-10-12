// Planches de présentation (boards/*.jpg, 1600 px de large), composées en HTML avec les polices du site,
// à partir des captures de tools/shots.mjs (o-*, s-*, p-*) et de tools/interact.mjs (i-*).
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
@font-face { font-family: Commissioner; src: url("${font('Commissioner')}") format("woff2"); font-weight: 100 900; }
* { box-sizing: border-box; }
body { margin: 0; width: 1600px; background: #EEF2F6; color: #0E1A37; font-family: Commissioner, sans-serif; font-variation-settings: "FLAR" 0, "VOLM" 0; }
main { padding: 60px 40px 52px; }
.mark { margin: 0 0 18px; color: #22348C; font-size: 20px; font-weight: 700; font-variant-caps: small-caps; letter-spacing: 0.02em; font-variation-settings: "FLAR" 100, "VOLM" 0; }
h1 { margin: 0; color: #22348C; font-weight: 500; font-size: 50px; line-height: 1.02; letter-spacing: -0.035em; }
.sub { margin: 16px 0 38px; font-size: 20px; line-height: 1.45; color: #3A4660; max-width: 62em; }
.row { display: grid; gap: 24px; align-items: start; }
.row + .row { margin-top: 36px; }
figure { margin: 0; }
img { width: 100%; display: block; border-radius: 14px; border: 1px solid rgba(14, 26, 55, 0.14); background: #fff; }
figcaption { margin-top: 12px; font-size: 16.5px; line-height: 1.4; color: #3A4660; }
figcaption strong { color: #0E1A37; font-weight: 600; }
`;

// une planche : des rangées de figures ; cols = gabarit CSS des colonnes de la rangée
const page = ({title, sub, rows}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head>
<body><main><p class="mark">Castor Dental Associates</p><h1>${title}</h1><p class="sub">${sub}</p>
${rows.map(({cols, items}) => `<div class="row" style="grid-template-columns: ${cols}">${items.map(([f, cap]) => `<figure><img src="file://${src}/${f}" alt=""><figcaption>${cap}</figcaption></figure>`).join('')}</div>`).join('\n')}
</main></body></html>`;

const two = (items) => ({cols: '1fr 1fr', items});
const BOARDS = {
  ouverture: {
    title: 'L’ouverture : l’enseigne se pose sur la façade',
    sub: 'Leur enseigne, composée en vraies lettres, recule et se pose sur celle du porche, au 785 Central Avenue. Dessous, la façade sans ses lettres évite tout dédoublement ; à la fin, l’enseigne du site se fond dans la vraie. 2,4 s, une seule fois, en haut de la page.',
    rows: [
      two([['o-d-0250.png', '<strong>0,25 s.</strong> L’enseigne seule, dans le bleu de leurs lettres.'], ['o-d-0800.png', '<strong>0,8 s.</strong> La façade apparaît autour des lettres.']]),
      two([['o-d-1150.png', '<strong>1,15 s.</strong> Les lettres foncent, comme à l’ombre du porche.'], ['o-d-1500.png', '<strong>1,5 s.</strong> La caméra recule : le porche, le banc.']]),
      two([['o-d-1900.png', '<strong>1,9 s.</strong> L’enseigne du site se fond dans la vraie.'], ['o-d-2900.png', '<strong>Fin.</strong> La photo seule : la vraie enseigne, la vraie maison.']]),
      {cols: 'repeat(4, 1fr)', items: [['o-m-0250.png', '<strong>Téléphone, 0,25 s.</strong>'], ['o-m-1150.png', '<strong>1,15 s.</strong>'], ['o-m-1900.png', '<strong>1,9 s.</strong>'], ['o-m-2900.png', '<strong>Fin.</strong> La façade en 4:3.']]},
    ],
  },
  sections: {
    title: 'Les sections',
    sub: 'De la promesse à la porte d’entrée : chaque section répond à la question que la précédente fait naître. Captures à la taille d’un écran d’ordinateur (1440 × 900).',
    rows: [
      two([['s-hero.jpg', '<strong>L’accueil.</strong> La promesse, le téléphone, la façade.'], ['s-straight.jpg', '<strong>L’orthodontie cachée.</strong> Leur soin le plus singulier, en tête.']]),
      two([['s-case.jpg', '<strong>Le cas.</strong> Avant, pendant, cinq mois, du seul côté où le fil se voit.'], ['s-others.jpg', '<strong>Les questions et les autres méthodes.</strong> Prix, durée, âge ; Invisalign® et Six Month Smiles®.']]),
      two([['s-care.jpg', '<strong>Les soins.</strong> Quatre familles, chaque soin s’ouvre.'], ['s-team.jpg', '<strong>L’équipe.</strong> Huit visages sur la même haie.']]),
      two([['s-reviews.jpg', '<strong>Ce que les patients remarquent.</strong> Chaque engagement avec un vrai avis.'], ['s-more.jpg', '<strong>D’autres avis.</strong> Prénom, source et date, cités tels quels.']]),
      two([['s-costs.jpg', '<strong>Les prix.</strong> Assurances, paiement, financement, avant tout soin.'], ['s-visit.jpg', '<strong>La visite.</strong> L’enseigne recomposée en bardage, la porte, la demande.']]),
    ],
  },
  details: {
    title: 'Les détails qui comptent',
    sub: 'Tout se fait à la souris, au doigt ou au clavier : un soin s’ouvre, un mot donne sa définition, un visage donne sa biographie, le formulaire dit quoi corriger.',
    rows: [
      two([['s-care-open.jpg', '<strong>Un soin ouvert et un mot expliqué.</strong> La définition vient de leur dictionnaire dentaire.'], ['i-term.png', '<strong>Au survol ou au focus :</strong> « scaling », sans couvrir le mot.']]),
      two([['s-bio.jpg', '<strong>Un visage choisi :</strong> le nom à gauche, la biographie à droite.'], ['i-case.png', '<strong>La ligne du temps</strong> se trace d’une étape à l’autre quand le cas arrive à l’écran.']]),
      two([['i-form-error.png', '<strong>Le formulaire :</strong> chaque erreur sous son champ, le curseur va au premier à corriger.'], ['s-form.jpg', '<strong>La demande :</strong> six sujets, cinq champs, et la note qui dit ce qui va se passer.']]),
    ],
  },
  telephone: {
    title: 'Sur téléphone',
    sub: 'Testé de 320 à 820 px : pas de défilement de côté, cibles de 44 px, le cas et l’équipe qui glissent du doigt, la barre d’appel qui se retire sur la section visite.',
    rows: [
      {cols: 'repeat(4, 1fr)', items: [['p-accueil.png', '<strong>L’accueil.</strong>'], ['p-cas.png', '<strong>Le cas,</strong> qui glisse du doigt.'], ['p-soins.png', '<strong>Les soins.</strong>'], ['p-equipe.png', '<strong>L’équipe.</strong>']]},
      {cols: 'repeat(4, 1fr)', items: [['p-avis.png', '<strong>Les avis.</strong>'], ['p-prix.png', '<strong>Les prix.</strong>'], ['p-visite.png', '<strong>La visite.</strong>'], ['p-formulaire.png', '<strong>Le formulaire.</strong>']]},
      {cols: 'repeat(4, 1fr)', items: [['i-menu.png', '<strong>Le menu.</strong> La page dessous devient inerte.'], ['i-dock.png', '<strong>La barre d’appel,</strong> au milieu de la page.'], ['i-term-m.png', '<strong>Une définition</strong> au toucher.']]},
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
