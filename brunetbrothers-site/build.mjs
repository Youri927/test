// Deux sorties :
//  - dist/index.html : le site en un seul fichier (polices, styles, photos, logo, textes espagnols, librairie et script
//    intégrés), à ouvrir d'un double-clic ; les photos y sont en 720 px de large en portrait, 1000 en paysage ;
//  - dist-web/ : la version à mettre en ligne, la page légère, et les photos (en plusieurs largeurs) et les polices
//    en fichiers.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync} from 'node:fs';
import {FRAME, LETTERS} from './tools/mark.mjs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');
const fail = (m) => {
  throw new Error(m);
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SITE = 'https://www.brunetbrothersconstruction.com';
const MAIL = 'brunetbrothersconstruction@gmail.com';
const REGISTRY = 'https://www.myfloridalicense.com/LicenseDetail.asp?SID=&id=';
const LICENSES = [
  {num: 'CGC1524915', name: 'Certified General Contractor', id: '0C3B199AF22F7E2A642F84B420C04286'},
  {num: 'CFC1430197', name: 'Certified Plumbing Contractor', id: '4D31B477BBE26590A2777D0F4774B01A'},
  {num: 'CAC1825088', name: 'Certified Air Conditioning Contractor', id: 'FA2CA2307E86E68C74F36BDC05C9FAB8'},
  {num: 'CCC1337876', name: 'Certified Roofing Contractor', id: 'F7DD100CA664B313869214280C248A20'},
];

/* ——— les polices : Chivo (titres, texte, interface) et Piazzolla italique (les clients), licence OFL ———
   Les polices de secours reprennent la chasse et la hauteur des vraies (Arial, Arial gras et Times italique ajustées,
   mesurées sur les textes du site, tools/fallback.py) : le texte bouge à peine quand elles arrivent. */
const FONTS = [
  {family: 'Chivo', file: 'Chivo.woff2', weight: '300 900', style: 'normal'},
  {family: 'Piazzolla', file: 'PiazzollaItalic.woff2', weight: '400 500', style: 'italic'},
];
const FB = JSON.parse(read('./data/fallback.json'));
const fallback = (name, locals, m, style = 'normal') =>
  `@font-face{font-family:"${name}";src:${locals.map((l) => `local("${l}")`).join(',')};font-style:${style};size-adjust:${m.size};ascent-override:${m.ascent};descent-override:${m.descent};line-gap-override:0%}`;
const fontCss = (url) =>
  FONTS.map((f) => `@font-face{font-family:"${f.family}";src:url(${url(f.file)}) format("woff2");font-weight:${f.weight};font-style:${f.style};font-display:swap}`).join('') +
  fallback('Chivo Head Fallback', ['Arial Bold', 'Arial-BoldMT', 'Liberation Sans Bold', 'Arial'], FB.head) +
  fallback('Chivo Fallback', ['Arial', 'ArialMT', 'Liberation Sans', 'Helvetica'], FB.text) +
  fallback('Piazzolla Fallback', ['Times New Roman Italic', 'TimesNewRomanPS-ItalicMT', 'Liberation Serif Italic', 'Times Italic'], FB.quote, 'italic');

/* ——— le logo : leur monogramme redessiné (tools/mark.mjs), défini une fois ———
   Ses couleurs passent par --mark-frame et --mark-ink (sur fond sombre, les lettres deviennent blanches). */
const symbols =
  `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">` +
  `<symbol id="mark" viewBox="0 0 230 208"><path d="${FRAME}" style="fill:var(--mark-frame,#EA8A12)"/><path d="${LETTERS}" fill-rule="evenodd" style="fill:var(--mark-ink,#191A1B)"/></symbol>` +
  `</svg>`;
const mark = `<svg class="mark" viewBox="0 0 230 208" aria-hidden="true" focusable="false"><use href="#mark"/></svg>`;
const favicon = `data:image/png;base64,${b64('./web/favicon.png')}`;

/* ——— les photos : ce que chacune montre, en anglais et en espagnol (la légende, et le nom du bouton qui l'ouvre) ——— */
const PH = {
  'h-1': ['A walk-in shower behind a frameless glass panel, with white marble-look walls, a mosaic floor and a window.', 'Una ducha tras un panel de vidrio sin marco, con paredes blancas tipo mármol, piso de mosaico y una ventana.'],
  'h-2': ['A large glass shower in beige stone-look tile, with three niches and bronze-tone fixtures.', 'Una ducha grande de vidrio en azulejo beige tipo piedra, con tres nichos y grifería en tono bronce.'],
  'h-3': ['A shower walled in black tile behind glass, louvered closet doors and a terracotta floor.', 'Una ducha con paredes de azulejo negro tras el vidrio, puertas de persiana y piso de terracota.'],
  'h-4': ['A white kitchen with a large island, four stools and two wall ovens.', 'Una cocina blanca con una isla grande, cuatro taburetes y dos hornos de pared.'],
  'h-5': ['A white kitchen with a breakfast bar, pendant lights and a mosaic backsplash.', 'Una cocina blanca con barra desayunador, lámparas colgantes y salpicadero de mosaico.'],
  'h-6': ['White shaker cabinets, a marble-look backsplash and the sink under the window.', 'Gabinetes blancos tipo shaker, salpicadero tipo mármol y el fregadero bajo la ventana.'],
  's-1': ['A glass shower with a tiled bench, a niche and a mosaic band.', 'Una ducha de vidrio con banco de azulejo, un nicho y una franja de mosaico.'],
  's-2': ['A shower under a window, with a blue glass-tile wall and corner shelves.', 'Una ducha bajo una ventana, con una pared de azulejo de vidrio azul y repisas de esquina.'],
  's-3': ['Gray marble-look tile behind a frameless glass door, and a hexagon floor.', 'Azulejo gris tipo mármol tras una puerta de vidrio sin marco, y piso hexagonal.'],
  's-4': ['A corner shower in white subway tile, with a niche, over a basketweave floor.', 'Una ducha de esquina en azulejo blanco tipo metro, con un nicho, sobre piso de mosaico entrelazado.'],
  'v-1': ['A gray double vanity with stone counters, under a crystal chandelier.', 'Un mueble doble gris con cubiertas de piedra, bajo una lámpara de cristal.'],
  'v-2': ['A long white vanity with two sinks and sculpted chrome lights.', 'Un mueble largo y blanco con dos lavamanos y apliques cromados esculturales.'],
  'v-3': ['Two vessel sinks on a stone counter, a makeup seat and a freestanding tub.', 'Dos lavamanos de sobreponer sobre piedra, un tocador con banqueta y una bañera exenta.'],
  'v-4': ['A small white vanity under a lit mirror.', 'Un pequeño mueble blanco bajo un espejo iluminado.'],
  't-1': ['A freestanding tub, a dark double vanity and a glass shower.', 'Una bañera exenta, un mueble doble oscuro y una ducha de vidrio.'],
  't-2': ['A tub and shower in dark blue tile, behind a sliding glass door.', 'Bañera y ducha en azulejo azul oscuro, tras una puerta corrediza de vidrio.'],
  't-3': ['A freestanding tub with a floor faucet, set in cream stone.', 'Una bañera exenta con grifo de piso, sobre piedra color crema.'],
  't-4': ['A powder room in gold-patterned wallpaper.', 'Un medio baño con papel tapiz de dibujo dorado.'],
  'k-1': ['An open kitchen: white upper cabinets, a long dark island with a white veined top, four gold stools.', 'Una cocina abierta: gabinetes altos blancos, una isla larga y oscura con cubierta blanca veteada y cuatro taburetes dorados.'],
  'k-2': ['A white kitchen open to the dining room, with a breakfast bar and a small wood-top island.', 'Una cocina blanca abierta al comedor, con barra desayunador y una pequeña isla con cubierta de madera.'],
  'k-3': ['Dark cabinets and a long island with a double sink, over a terracotta floor.', 'Gabinetes oscuros y una isla larga con fregadero doble, sobre piso de terracota.'],
  'k-4': ['Charcoal shaker cabinets, stainless appliances and a white veined counter.', 'Gabinetes shaker color carbón, electrodomésticos de acero y cubierta blanca veteada.'],
  'k-5': ['Gray wood-grain cabinets and a white waterfall counter.', 'Gabinetes grises con veta de madera y una cubierta blanca en cascada.'],
  'k-6': ['Cherry cabinets, a tall pantry and a long breakfast bar.', 'Gabinetes color cerezo, una despensa alta y una barra desayunador larga.'],
  'r-1': ['A white built-in closet: drawers, shelves, cubbies and hanging rods.', 'Un clóset empotrado blanco: cajones, repisas, casilleros y barras para colgar.'],
  'r-2': ['A built-in desk with a wood top, against a dark wall.', 'Un escritorio empotrado con cubierta de madera, contra una pared oscura.'],
  'r-3': ['A TV wall in stacked stone, with a long electric fireplace and lit niches.', 'Una pared de TV en piedra apilada, con una chimenea eléctrica larga y nichos iluminados.'],
  'r-4': ['A white kitchen with the washer and dryer stacked beside the fridge.', 'Una cocina blanca con la lavadora y la secadora apiladas junto al refrigerador.'],
  'o-1': ['An outdoor kitchen under a white pergola: a grill, a side burner and a sink.', 'Una cocina exterior bajo una pérgola blanca: una parrilla, un quemador lateral y un fregadero.'],
  'o-2': ['A fire pit on white sand, with Adirondack chairs, under the palms.', 'Una fogata sobre arena blanca, con sillas Adirondack, bajo las palmeras.'],
  'o-3': ['The pool and its raised spa, and a lounge under the pergola.', 'La piscina y su spa elevado, y una sala bajo la pérgola.'],
  'n-1': ['Wood roof trusses over concrete block walls.', 'Cerchas de madera sobre muros de bloque de concreto.'],
  'n-2': ['Our caption, in Spanish: “The guys outdid themselves. All clean and well done.”', 'Nuestro mensaje: «Se lucieron los muchachos. Todo limpio y bien hecho.»'],
  'n-3': ['Commercial: a hair salon, with its styling stations and washing area.', 'Comercial: una peluquería, con sus puestos de peinado y su zona de lavado.'],
  'f-1': ['Our vans, pickups and trailers.', 'Nuestras camionetas, pickups y remolques.'],
};
const SETS = {
  hero: {t: ['Showers and kitchens', 'Duchas y cocinas'], items: ['h-1', 'h-2', 'h-3', 'h-4', 'h-5', 'h-6']},
  showers: {t: ['Showers', 'Duchas'], items: ['s-1', 's-2', 's-3', 's-4']},
  vanities: {t: ['Vanities', 'Muebles de baño'], items: ['v-1', 'v-2', 'v-3', 'v-4']},
  tubs: {t: ['Tubs and powder rooms', 'Bañeras y medios baños'], items: ['t-1', 't-2', 't-3', 't-4']},
  kitchens: {t: ['Kitchens', 'Cocinas'], items: ['k-1', 'k-2', 'k-3', 'k-4', 'k-5', 'k-6']},
  rooms: {t: ['Closets, offices and living rooms', 'Clósets, oficinas y salas'], items: ['r-1', 'r-2', 'r-3', 'r-4']},
  outside: {t: ['A backyard', 'Un patio'], items: ['o-1', 'o-2', 'o-3']},
  build: {t: ['New construction and commercial', 'Obra nueva y comercial'], items: ['n-1', 'n-2', 'n-3']},
  fleet: {t: ['Our vans', 'Nuestras camionetas'], items: ['f-1']},
};
// la largeur affichée de chaque groupe de photos (pour choisir le bon fichier)
const SIZES = {
  hero: '(min-width: 1024px) 19vw, 31vw',
  showers: '(min-width: 1024px) 20vw, (min-width: 600px) 23vw, 46vw',
  kitchens: '(min-width: 1024px) 28vw, (min-width: 600px) 46vw, 92vw',
  rooms: '(min-width: 1024px) 20vw, 46vw',
  'o-1': '(min-width: 1024px) 62vw, 100vw',
  'o-2': '(min-width: 1024px) 31vw, 92vw',
  'n-1': '(min-width: 1024px) 26vw, 60vw',
  'n-2': '(min-width: 1024px) 18vw, 44vw',
  'n-3': '(min-width: 1024px) 40vw, 92vw',
  'f-1': '(min-width: 1024px) 46vw, 92vw',
};
SIZES.vanities = SIZES.tubs = SIZES.showers;
SIZES['o-3'] = SIZES['o-2'];

const sizes = JSON.parse(read('./data/photos.json'));
const lqip = JSON.parse(read('./data/lqip.json'));
const capOf = (n) => PH[n] || fail(`photo sans légende : ${n}`);
const sizeOf = (n) => sizes[n] || fail(`photo inconnue : ${n}`);
// une photo cliquable : le verre dépoli (l'aperçu flou en fond), la photo, le nom du bouton (sa légende)
const ph = (set, at, name, attrs = '') => {
  const [w, h] = sizeOf(name);
  return (
    `<button class="ph" type="button" data-set="${set}" data-at="${at}" aria-labelledby="cap-${name} open-hint" style="aspect-ratio:${w}/${h};background-image:url(${lqip[name] || fail(`aperçu manquant : ${name}`)})">` +
    `<img data-img="${name}" alt="" sizes="${SIZES[set] || SIZES[name]}" loading="lazy"${attrs}></button>`
  );
};
// une planche : des photos de même format, chacune avec sa légende dessous ; celle de l'accueil a ses légendes cachées
// (la ligne sous la planche affiche celle de la photo survolée)
const plate = (set) => {
  const {items} = SETS[set];
  const hero = set === 'hero';
  const cells = items
    .map((n, i) => {
      const [en] = capOf(n);
      const cap = hero ? `<span class="sr" id="cap-${n}" data-t="ph.${n}">${esc(en)}</span>` : `<p class="cell__cap" id="cap-${n}" data-t="ph.${n}">${esc(en)}</p>`;
      return `<li class="cell">${ph(set, i, n, hero ? ' fetchpriority="auto"' : '')}${cap}</li>`;
    })
    .join('');
  return `<ol class="plate plate--${set}" data-plate="${set}">${cells}</ol>`;
};
// des photos de formats différents, chacune dans sa figure avec sa légende
const figs = (set) =>
  `<div class="figs figs--${set}">` +
  SETS[set].items
    .map((n, i) => `<figure class="fig fig--${n}">${ph(set, i, n)}<figcaption class="fig__cap" id="cap-${n}" data-t="ph.${n}">${esc(capOf(n)[0])}</figcaption></figure>`)
    .join('') +
  `</div>`;
// la visionneuse : les photos de chaque groupe, avec leur légende
const templates = Object.entries(SETS)
  .map(([id, s]) => {
    const items = s.items.map((n) => `<li><figure><img data-img="${n}" data-cap sizes="(min-width: 900px) 80vw, 100vw" loading="lazy" alt=""><figcaption data-t="ph.${n}">${esc(capOf(n)[0])}</figcaption></figure></li>`).join('');
    return `<template id="set-${id}" data-t-title="set.${id}">${items}</template>`;
  })
  .join('\n');

/* ——— les témoignages : les 18 de leur page, mot pour mot ; six en avant, les douze autres derrière un bouton ——— */
const T = JSON.parse(read('./data/testimonials.json'));
if (T.quotes.length !== 18) fail('il faut les 18 témoignages');
const quote = (q, cls) => `<li class="${cls}"><blockquote lang="en"><p>“${esc(q)}”</p></blockquote></li>`;
const featured = T.featured.map((i) => T.quotes[i - 1]);
const others = T.quotes.filter((_, i) => !T.featured.includes(i + 1));
const quotesHtml =
  `<div class="quotes">` +
  `<ul class="quotes__top">${featured.map((q) => quote(q, 'q')).join('')}</ul>` +
  `<ul class="quotes__more" id="quotes-more" hidden>${others.map((q) => quote(q, 'q q--small')).join('')}</ul>` +
  `<button class="quotes__btn" type="button" aria-expanded="false" aria-controls="quotes-more" data-t="q.more">Read the other ${others.length} testimonials</button>` +
  `</div>`;

/* ——— les textes espagnols : ceux de la page (src/es.json), les légendes et les titres des groupes ——— */
const ES = JSON.parse(read('./src/es.json'));
for (const [n, [, es]] of Object.entries(PH)) ES[`ph.${n}`] = es;
for (const [id, s] of Object.entries(SETS)) ES[`set.${id}`] = s.t[1];
// les titres anglais des groupes (lus par la visionneuse)
const EN_SETS = Object.fromEntries(Object.entries(SETS).map(([id, s]) => [`set.${id}`, s.t[0]]));

/* ——— la page ——— */
let src = read('./src/index.html')
  .replaceAll('<!--MARK-->', () => mark)
  .replace('<!--FAVICON-->', () => favicon)
  .replace(/<!--PLATE:(\w+)-->/g, (_, s) => plate(s))
  .replace(/<!--FIGS:(\w+)-->/g, (_, s) => figs(s))
  .replace('<!--QUOTES-->', () => quotesHtml)
  .replace('<!--SETS-->', () => templates)
  .replace('<!--I18N-->', () => `<script type="application/json" id="i18n">${JSON.stringify({es: ES, en: EN_SETS}).replace(/</g, '\\u003c')}</script>`)
  .replace('<body>', () => `<body>\n${symbols}`);

/* ——— les données structurées : l'entreprise, ses licences, ses deux lignes, la FAQ du déroulé ——— */
const BIZ = `${SITE}/#business`;
const faq = [...src.matchAll(/<h3 class="step__q" data-t="step\d\.t">([^<]+)<\/h3>\s*<p data-t="step\d\.p">([^<]+)<\/p>/g)].map(([, q, a]) => ({
  '@type': 'Question',
  name: q.replace(/&amp;/g, '&'),
  acceptedAnswer: {'@type': 'Answer', text: a.replace(/&amp;/g, '&')},
}));
if (faq.length !== 6) fail(`la FAQ du déroulé doit avoir 6 questions (${faq.length})`);
const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'GeneralContractor',
      '@id': BIZ,
      name: 'Brunet Brothers Construction',
      legalName: 'Brunet Brothers Construction, Corp',
      slogan: 'Masters of Consistency and Quality',
      url: `${SITE}/`,
      logo: `${SITE}/assets/logo.png`,
      image: `${SITE}/assets/og.jpg`,
      description: 'Family-owned general contractor in Lake Worth, Florida, since 2008: kitchen and bathroom remodeling, complete remodels, outdoor living and new construction, residential and commercial, all over South Florida. Free in-home estimates, in English or Spanish.',
      foundingDate: '2008',
      telephone: '+1-561-904-1465',
      email: MAIL,
      address: {'@type': 'PostalAddress', addressLocality: 'Lake Worth', addressRegion: 'FL', addressCountry: 'US'},
      areaServed: [
        {'@type': 'AdministrativeArea', name: 'Palm Beach County, Florida'},
        {'@type': 'Place', name: 'South Florida'},
      ],
      contactPoint: [
        {'@type': 'ContactPoint', telephone: '+1-561-904-1465', contactType: 'customer service', availableLanguage: 'English'},
        {'@type': 'ContactPoint', telephone: '+1-561-904-1893', contactType: 'customer service', availableLanguage: 'Spanish'},
      ],
      knowsLanguage: ['en', 'es'],
      hasCredential: LICENSES.map((l) => ({
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'license',
        name: `Florida ${l.name}`,
        identifier: l.num,
        url: `${REGISTRY}${l.id}`,
        recognizedBy: {'@type': 'GovernmentOrganization', name: 'Florida Department of Business and Professional Regulation'},
      })),
      knowsAbout: ['Bathroom remodeling', 'Kitchen remodeling', 'Interior remodeling', 'Exterior remodeling', 'Outdoor kitchens', 'New construction', 'Commercial build-outs'],
      sameAs: ['https://www.facebook.com/brunetbrothersconstruction', 'https://www.instagram.com/brunetbrothersconstruction'],
    },
    {'@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: 'Brunet Brothers Construction', publisher: {'@id': BIZ}, inLanguage: ['en-US', 'es-US']},
    {'@type': 'FAQPage', '@id': `${SITE}/#process`, mainEntity: faq},
  ],
};
src = src.replace('<!--JSONLD-->', () => JSON.stringify(ld).replace(/</g, '\\u003c'));

/* ——— vérifications : ce qui est affiché correspond au contenu ——— */
const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const shown = clean(src.split('</head>')[1].replace(/<script[\s\S]*?<\/script>|<svg[\s\S]*?<\/svg>|<template[\s\S]*?<\/template>/g, ' '));
// chaque texte traduisible a son espagnol, et chaque texte espagnol sert
const keys = new Set([...src.matchAll(/data-t="([\w.-]+)"/g)].map((m) => m[1]).concat([...src.matchAll(/data-ta="([^"]+)"/g)].flatMap((m) => m[1].split(';').map((x) => x.split(':')[1]))));
for (const k of Object.keys(EN_SETS)) keys.add(k);
for (const k of keys) if (!(k in ES)) fail(`pas d’espagnol pour « ${k} »`);
for (const k of Object.keys(ES)) if (!keys.has(k) && k !== 'q.less') fail(`texte espagnol inutilisé : « ${k} »`);
for (const l of LICENSES) {
  if ((src.match(new RegExp(l.num, 'g')) || []).length < 3) fail(`la licence ${l.num} doit figurer dans la section de l’entreprise, le pied de page et les données`);
  if (!src.includes(`${REGISTRY}${l.id}`.replace(/&/g, '&amp;'))) fail(`le lien vers la fiche de ${l.num} manque`);
}
if ((shown.match(/\(561\) 904-1465/g) || []).length < 4) fail('la ligne anglaise doit figurer dans le menu, l’accueil, la demande et le pied de page');
if ((shown.match(/\(561\) 904-1893/g) || []).length < 4) fail('la ligne espagnole doit figurer dans le menu, l’accueil, la demande et le pied de page');
// pas d'adresse de rue (seulement « Lake Worth »), pas de date de chantier
if (/\b\d{2,5}\s+[A-Z][a-z]+\s+(Lane|Ln|Avenue|Ave|Road|Rd|Street|St|Drive|Dr|Blvd)\b/.test(shown)) fail('une adresse de rue s’affiche');
for (const y of shown.match(/\b(19|20)\d\d\b/g) || []) if (!['2008', '2026'].includes(y)) fail(`une année s’affiche : ${y}`);
for (const [, s, at] of src.matchAll(/data-set="(\w+)" data-at="(\d+)"/g)) if (!SETS[s]?.items[+at]) fail(`bouton : pas de photo ${at} dans ${s}`);
for (const m of src.matchAll(/<img\b[^>]*>/g)) if (!/\salt="[^"]*"/.test(m[0])) fail(`photo sans attribut alt : ${m[0].slice(0, 80)}`);
for (const [, id] of src.matchAll(/aria-labelledby="cap-([\w-]+) open-hint"/g)) if (!src.includes(`id="cap-${id}"`)) fail(`légende manquante : ${id}`);
if ((src.match(/<h1[\s>]/g) || []).length !== 1) fail('il faut un seul h1');
if (/<!--(MARK|FAVICON|PLATE|FIGS|QUOTES|SETS|I18N|JSONLD)/.test(src)) fail('un repère du gabarit n’a pas été remplacé');

/* ——— les photos : chaque <img data-img>, en fichier unique (intégrées) ou en ligne (assets/) ——— */
const size = (name) => sizes[name] || fail(`photo inconnue : ${name}`);
const variants = (name) =>
  Object.keys(sizes)
    .filter((k) => k === name || (k.startsWith(`${name}-`) && /^\d+$/.test(k.slice(name.length + 1))))
    .map((k) => ({file: k, w: size(k)[0], h: size(k)[1]}))
    .sort((a, b) => a.w - b.w);
const used = new Set();
const embedded = new Map();
const photos = (html, mode) =>
  html.replace(/<img\b([^>]*)\sdata-img="([\w-]+)"([^>]*)>/g, (m, a, name, b) => {
    const v = variants(name);
    if (!v.length) fail(`photo inconnue : ${name}`);
    const big = v[v.length - 1];
    let attrs = `${a}${b}`;
    // data-cap : la photo ne s'affiche jamais plus grande que son fichier (la visionneuse)
    const capped = /\sdata-cap/.test(attrs);
    attrs = attrs.replace(/\sdata-cap(="[^"]*")?/g, '');
    if (mode === 'one') {
      // fichier unique : une seule version, 1000 px de large (720 en portrait, ou ce que demande data-one), jamais
      // agrandie ; la taille annoncée est celle du fichier intégré
      const portrait = big.h > big.w;
      const want = +((attrs.match(/data-one="(\d+)"/) || [])[1] || (portrait ? 720 : 1000));
      const pick = [...v].reverse().find((x) => x.w <= want) || v[0];
      if (!embedded.has(pick.file)) embedded.set(pick.file, `data:image/avif;base64,${b64(`./src/img/${pick.file}.avif`)}`);
      const cap = capped ? ` style="max-width:min(100%,${pick.w}px)"` : '';
      return `<img src="${embedded.get(pick.file)}" width="${pick.w}" height="${pick.h}"${cap}${attrs.replace(/\s(sizes|data-one)="[^"]*"/g, '')}>`;
    }
    for (const x of v) used.add(x.file);
    const srcset = v.map((x) => `assets/img/${x.file}.avif ${x.w}w`).join(', ');
    const mid = v.find((x) => x.w >= 720) || big;
    const cap = capped ? ` style="max-width:min(100%,${big.w}px)"` : '';
    return `<img src="assets/img/${mid.file}.avif" srcset="${srcset}" width="${big.w}" height="${big.h}"${cap}${attrs.replace(/\sdata-one="[^"]*"/g, '')}>`;
  });

const minCss = (c) =>
  c
    .split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/)
    .map((part, i) =>
      i % 2
        ? part
        : part
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\s+/g, ' ')
            .replace(/\s*([{};,>])\s*/g, '$1')
            .replace(/;}/g, '}'),
    )
    .join('')
    .trim();
const css = minCss(read('./src/styles.css'));
const js = [read('./vendor/lenis.min.js'), read('./src/main.js')].join('\n;\n').replace(/<\/script/gi, '<\\/script');

/* ——— le fichier unique ——— */
// la première photo de l'accueil est chargée en priorité, les autres de l'accueil tout de suite après
const heroFirst = (html) => html.replace(/(<img src="[^"]*"[^>]*?) fetchpriority="auto"/, '$1 fetchpriority="high"').replace(/(<button class="ph"[^>]*data-set="hero"[^>]*>\s*<img\b[^>]*?) loading="lazy"/g, '$1 loading="eager"');
const page = heroFirst(photos(src, 'one'))
  .replace('<!--STYLES-->', () => `<style>\n${fontCss((f) => `data:font/woff2;base64,${b64(`./vendor/fonts/${f}`)}`)}\n${css}\n</style>`)
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/data-img=/.test(page)) fail('fichier unique : une photo n’a pas été intégrée');
mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(here('./dist/index.html'), page);
console.log(`dist/index.html : ${(Buffer.byteLength(page) / 1024).toFixed(0)} Ko, ${embedded.size} photos`);

/* ——— la version en ligne ——— */
const web = (p) => here(`./dist-web/${p}`);
rmSync(web(''), {recursive: true, force: true});
for (const d of ['assets/img', 'assets/fonts']) mkdirSync(web(d), {recursive: true});
for (const f of FONTS) copyFileSync(here(`./vendor/fonts/${f.file}`), web(`assets/fonts/${f.file}`));
const pageWeb = heroFirst(photos(src, 'web'))
  .replace('<!--STYLES-->', () =>
    [
      `<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">`,
      `<link rel="preload" as="font" type="font/woff2" href="assets/fonts/Chivo.woff2" crossorigin>`,
      `<style>\n${fontCss((f) => `assets/fonts/${f}`)}\n${css}\n</style>`,
    ].join('\n'),
  )
  .replace('<!--SCRIPTS-->', () => `<script>\n${js}\n</script>`);
if (/data-img=/.test(pageWeb)) fail('version en ligne : un chemin de photo n’a pas été réécrit');
for (const n of used) copyFileSync(here(`./src/img/${n}.avif`), web(`assets/img/${n}.avif`));
writeFileSync(web('index.html'), pageWeb);
// robots.txt, sitemap.xml, llms.txt, en-têtes, redirections des anciennes adresses, image de partage et logo
for (const f of ['_headers', '_redirects', 'vercel.json', 'robots.txt', 'sitemap.xml', 'llms.txt']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(f));
for (const f of ['og.jpg', 'logo.png', 'apple-touch-icon.png']) if (existsSync(here(`./web/${f}`))) copyFileSync(here(`./web/${f}`), web(`assets/${f}`));
console.log(`dist-web/index.html : ${(Buffer.byteLength(pageWeb) / 1024).toFixed(0)} Ko, ${used.size} fichiers de photos`);
