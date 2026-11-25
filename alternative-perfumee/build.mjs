// Deux sorties, à partir de src/ :
//  - dist/index.html : le prototype Respray en un seul fichier (police, styles, données et script intégrés), à ouvrir
//    d'un double-clic, sans serveur ni connexion ;
//  - dist/artifact.html : le même contenu sans l'enveloppe <html>/<head>/<body>, pour la publication en page Claude.
//   node build.mjs
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';

const here = (p) => new URL(p, import.meta.url);
const read = (p) => readFileSync(here(p), 'utf8');
const b64 = (p) => readFileSync(here(p)).toString('base64');

let css = read('./src/styles.css').replace(/url\(\.\.\/vendor\/fonts\/([\w.-]+\.woff2)\)/g, (_, f) => `url(data:font/woff2;base64,${b64('./vendor/fonts/' + f)})`);
const js = ['data', 'visuels', 'app'].map((f) => read(`./src/${f}.js`)).join('\n');
if (js.includes('</script')) throw new Error('le script contient </script');

// le logo, en ligne (sa couleur suit le texte), et le favicon intégré
const logo = read('./marque/logo-site.svg').trim().replace('<svg ', '<svg class="logo-svg" aria-hidden="true" focusable="false" ').replace(/<title>.*?<\/title>/, '').replace(/ role="img" aria-label="Respray"/, '');
const favicon = 'data:image/svg+xml;base64,' + b64('./marque/favicon.svg');
const page = read('./src/index.html')
  .replaceAll('<!--logo-->', () => logo)
  .replace('<link rel="icon" href="../marque/favicon.svg">', () => `<link rel="icon" href="${favicon}">`)
  .replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${css}</style>`)
  .replace('<script src="data.js"></script>\n<script src="visuels.js"></script>\n<script src="app.js"></script>', () => `<script>\n${js}</script>`);
if (page.includes('src="data.js"') || page.includes('href="styles.css"')) throw new Error('remplacement manqué');

// la tête : tout ce qui précède le bandeau ; le corps : le reste
const coupe = page.indexOf('<p class="proto"');
const tete = page.slice(0, coupe).trim();
const corps = page.slice(coupe).trim();

mkdirSync(here('./dist/'), {recursive: true});
writeFileSync(
  here('./dist/index.html'),
  `<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="robots" content="noindex">\n${tete}\n</head>\n<body>\n${corps}\n</body>\n</html>\n`,
);
writeFileSync(here('./dist/artifact.html'), page + '\n');
const ko = (f) => (readFileSync(here(f)).length / 1024).toFixed(0) + ' Ko';
console.log(`dist/index.html ${ko('./dist/index.html')}, dist/artifact.html ${ko('./dist/artifact.html')}`);
