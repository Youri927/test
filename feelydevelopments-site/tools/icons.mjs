// Les icônes du site, tirées du logo redessiné (tools/mark.mjs) :
//  - web/favicon.png (64 px) et web/apple-touch-icon.png (180 px) : le premier E du logo, avec sa barre qui dépasse,
//    clair sur un carré vert buis ;
//  - web/logo.png (600 px de large) : le logo entier, pour les données structurées.
//   node tools/icons.mjs
import {createRequire} from 'node:module';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {iconSvg, markSvg} from './mark.mjs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const here = (p) => resolve(dirname(fileURLToPath(import.meta.url)), '..', p);

const b = await chromium.launch();
const p = await b.newPage({deviceScaleFactor: 1});
const square = async (size, radius, out) => {
  await p.setViewportSize({width: size, height: size});
  await p.setContent(`<body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px;border-radius:${radius}px;background:#22372A;display:grid;place-items:center">
${iconSvg({ink: '#F2F1EE', attrs: ` width="${Math.round(size * 0.92)}" height="${Math.round(size * 0.92)}"`})}</div></body>`);
  await p.screenshot({path: here(out), omitBackground: true});
  console.log(out);
};
await square(64, 12, 'web/favicon.png');
await square(180, 0, 'web/apple-touch-icon.png'); // iOS arrondit lui-même les angles
await p.setViewportSize({width: 600, height: 75});
await p.setContent(`<body style="margin:0;background:#F2F1EE;display:grid;place-items:center;height:75px">${markSvg({ink: '#1F201E', attrs: ' width="560"'})}</body>`);
await p.screenshot({path: here('web/logo.png')});
console.log('web/logo.png');
await b.close();
