// Les icônes, rendues depuis le logo vectorisé (data/logo.json) :
//  - web/favicon.png (64 px) : le monogramme et ses toits, bleu et olive sur blanc, pour l'onglet ;
//  - web/apple-touch-icon.png (180 px) : le même, avec plus de marge, pour l'écran d'accueil des téléphones ;
//  - web/logo.png (600 px) : le logo entier (monogramme, nom, « LLC »), le logo carré des données structurées.
//   node tools/icons.mjs
import {createRequire} from 'node:module';
import {readFileSync, mkdirSync} from 'node:fs';
const {chromium} = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const here = (p) => new URL(p, import.meta.url);
const L = JSON.parse(readFileSync(here('../data/logo.json'), 'utf8'));
mkdirSync(here('../web/'), {recursive: true});
const NAVY = '#2A5472';
const OLIVE = '#909C42';

const mark = (size, pad) => {
  const M = L.mark;
  const s = Math.max(M.w, M.h) * (1 + pad * 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${s} ${s}"><rect width="${s}" height="${s}" fill="#fff"/><g transform="translate(${(s - M.w) / 2} ${(s - M.h) / 2})"><path d="${M.navy}" fill="${NAVY}" fill-rule="evenodd"/><path d="${M.olive}" fill="${OLIVE}" fill-rule="evenodd"/></g></svg>`;
};
const full = (size) => {
  const {mark: M, word: W, llc: C} = L;
  const w = Math.max(M.w, W.w, C.w);
  const h = M.h + 40 + W.h + 30 + C.h;
  const s = Math.max(w, h) * 1.12;
  const ox = (s - w) / 2;
  const oy = (s - h) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${s} ${s}"><rect width="${s}" height="${s}" fill="#fff"/>` +
    `<g transform="translate(${ox + (w - M.w) / 2} ${oy})"><path d="${M.navy}" fill="${NAVY}" fill-rule="evenodd"/><path d="${M.olive}" fill="${OLIVE}" fill-rule="evenodd"/></g>` +
    `<path transform="translate(${ox + (w - W.w) / 2} ${oy + M.h + 40})" d="${W.d}" fill="${NAVY}" fill-rule="evenodd"/>` +
    `<path transform="translate(${ox + (w - C.w) / 2} ${oy + M.h + 40 + W.h + 30})" d="${C.d}" fill="${OLIVE}" fill-rule="evenodd"/></svg>`;
};
const b = await chromium.launch();
for (const [file, size, svg] of [
  ['favicon.png', 64, mark(64, 0.04)],
  ['apple-touch-icon.png', 180, mark(180, 0.14)],
  ['logo.png', 600, full(600)],
]) {
  const p = await b.newPage({viewport: {width: size, height: size}, deviceScaleFactor: 1});
  await p.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`);
  await p.screenshot({path: new URL(`../web/${file}`, import.meta.url).pathname, clip: {x: 0, y: 0, width: size, height: size}});
  await p.close();
  console.log(file, size);
}
await b.close();
