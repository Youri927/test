// Capture image par image du nouveau site de Castor Dental Associates, en temps simulé.
// L'horloge de la page (timers, requestAnimationFrame, Date, performance) est figée par Playwright et avancée
// d'exactement 1/fps entre deux images ; les animations natives (WAAPI) et CSS sont recalées sur ce même temps.
// L'ouverture (l'enseigne qui se pose sur la façade), la ligne du temps du cas, les soins qui s'ouvrent, les biographies,
// la barre d'appel du téléphone et Lenis tournent donc sur ce temps simulé : des animations fluides et exactes,
// quelle que soit la durée réelle d'une capture d'écran.
import {spawn} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');

const here = dirname(fileURLToPath(import.meta.url));
export const SITE = resolve(here, '../../castordental-site/dist/index.html');
export const OUT = resolve(here, '../public/site');

// lundi 12 octobre 2026, 10 h à Naples (heure de l'Est, UTC−4) ; le site n'affiche rien qui dépende de l'heure
const T0 = Date.parse('2026-10-12T10:00:00-04:00');

// Injecté avant les scripts du site
const INIT = () => {
  // Hasard reproductible : même rendu à chaque capture
  let seed = 0x2a2a2a;
  Math.random = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // Animations et transitions : recalées sur le temps simulé. Une animation part de 0 à la première image qui la voit.
  window.__seek = (vt) => {
    for (const a of document.getAnimations()) {
      if (a.__t0 === undefined) a.__t0 = vt;
      a.pause();
      a.currentTime = vt - a.__t0;
    }
  };
};

/** Ouvre le site dans un Chromium à l'horloge figée */
export async function openSite({width, height, dsf = 2, mobile = false, query = ''}) {
  // Rendu processeur : l'émulateur graphique du conteneur laisse des bandes dupliquées sur les grandes images
  const browser = await chromium.launch({args: ['--hide-scrollbars', '--force-color-profile=srgb', '--disable-gpu']});
  const context = await browser.newContext({
    viewport: {width, height},
    deviceScaleFactor: dsf,
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: 'no-preference',
    colorScheme: 'light',
    locale: 'en-US',
  });
  await context.addInitScript(INIT);
  await context.clock.install({time: T0});
  await context.clock.pauseAt(T0 + 1);
  const page = await context.newPage();
  await page.goto('file://' + SITE + query, {waitUntil: 'load'});
  await page.evaluate(() => document.fonts.ready);
  const cdp = await context.newCDPSession(page);
  return {browser, context, page, cdp, width, height, dsf};
}

/** Attend (en temps réel, côté Node : l'horloge de la page est figée) qu'une condition soit vraie dans la page */
export async function until(page, fn, arg, ms = 10000) {
  for (let k = 0; k < ms / 50; k++) {
    if (await page.evaluate(fn, arg)) return true;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error('attente trop longue : ' + fn.toString());
}

/** Position (px document) du haut d'un élément */
export const top = (page, sel) => page.evaluate((sel) => document.querySelector(sel).getBoundingClientRect().top + window.scrollY, sel);

// Défilement instantané, puis un événement scroll tout de suite : Lenis et l'en-tête se mettent à jour dans la même
// image (l'événement natif n'arrive qu'au rendu suivant). Chrome arrondit le défilement au pixel CSS entier : les plans
// défilent donc à un nombre entier de pixels par image, pour des pas parfaitement réguliers (pas de saccade à l'écran).
export const scrollTo = (page, y) =>
  page.evaluate((y) => {
    if (Math.abs(window.scrollY - y) < 0.5) return;
    window.scrollTo({top: y, behavior: 'instant'});
    window.dispatchEvent(new Event('scroll'));
  }, y);

/** Avance le temps simulé (horloge de la page + animations) */
export async function tick(page, ms) {
  if (ms > 0) await page.clock.runFor(ms);
  await page.evaluate((ms) => {
    window.__vt = (window.__vt || 0) + ms;
    window.__seek(window.__vt);
  }, ms);
}

/** Avance le temps sans filmer (mise en place d'un plan), par pas de 1/60 s */
export async function settle(page, ms) {
  let done = 0;
  for (let i = 1; done < ms; i++) {
    const t = Math.min(ms, Math.round((i * 1000) / 60));
    await tick(page, t - done);
    done = t;
  }
}

/**
 * Filme un plan : à chaque image, `step(i, tMs)` règle défilement / souris / clics,
 * puis le temps avance d'1/fps et l'image est capturée.
 */
export async function record(site, {name, fps = 60, seconds, step, watch, probe = false, quality = 92}) {
  const {page} = site;
  mkdirSync(OUT, {recursive: true});
  const out = resolve(OUT, `${name}.mp4`);
  // relevé seul (probe) : mêmes gestes, même temps simulé, sans capture ni encodage ; les repères vont dans le JSON existant
  if (probe) return survey(site, {name, fps, seconds, step, watch});
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    out,
  ], {stdio: ['pipe', 'inherit', 'inherit']});
  const done = new Promise((ok, ko) => ff.on('close', (c) => (c === 0 ? ok() : ko(new Error('ffmpeg ' + c)))));
  const n = Math.round(seconds * fps);
  const meta = {name, fps, frames: n, width: site.width, height: site.height, mouse: [], clicks: [], marks: {}, values: {}};
  let last = 0;
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const t = Math.round((i * 1000) / fps);
    const info = (await step(i, t)) || {};
    if (info.mouse) meta.mouse[i] = info.mouse;
    if (info.click) meta.clicks.push(i);
    if (info.mark) meta.marks[info.mark] = i;
    await tick(page, t - last);
    last = t;
    if (watch) note(meta, i, await watch(page));
    // clip.scale = densité de pixels : sans lui, la capture sort en 1×, quel que soit l'écran émulé.
    // Le clip est en coordonnées de page : on le cale sur la position de défilement.
    const {cssLayoutViewport: vp} = await site.cdp.send('Page.getLayoutMetrics');
    const clip = {x: vp.pageX, y: vp.pageY, width: site.width, height: site.height, scale: site.dsf};
    const {data} = await site.cdp.send('Page.captureScreenshot', {format: 'jpeg', quality, optimizeForSpeed: true, clip});
    const buf = Buffer.from(data, 'base64');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 60 === 0) process.stdout.write(`  ${name} ${i}/${n} (${((Date.now() - t0) / 1000).toFixed(0)} s)\n`);
  }
  ff.stdin.end();
  await done;
  writeFileSync(resolve(OUT, `${name}.json`), JSON.stringify(meta));
  console.log(`✓ ${name}.mp4  ${n} images, ${((Date.now() - t0) / 1000).toFixed(0)} s  repères ${JSON.stringify(meta.marks)}`);
  return meta;
}

/**
 * État de la page relevé après chaque image (`watch` renvoie {clé: valeur}) :
 * un booléen donne un repère à l'image où il devient vrai, un nombre est gardé image par image.
 */
function note(meta, i, state) {
  for (const [k, v] of Object.entries(state || {})) {
    if (typeof v === 'number') (meta.values[k] ||= [])[i] = Math.round(v * 1000) / 1000;
    else if (v && meta.marks[k] === undefined) meta.marks[k] = i;
  }
}

async function survey(site, {name, fps, seconds, step, watch}) {
  const {page} = site;
  const file = resolve(OUT, `${name}.json`);
  const meta = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {name, fps, mouse: [], clicks: []};
  meta.marks = {};
  meta.values = {};
  const n = Math.round(seconds * fps);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const t = Math.round((i * 1000) / fps);
    await step(i, t);
    await tick(page, t - last);
    last = t;
    if (watch) note(meta, i, await watch(page));
  }
  writeFileSync(file, JSON.stringify(meta));
  console.log(`✓ ${name}.json  repères ${JSON.stringify(meta.marks)}`);
  return meta;
}

// Courbes utiles pour écrire les plans
export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const sine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
