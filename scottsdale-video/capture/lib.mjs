// Capture image par image du site, en temps simulé.
// L'horloge de la page (timers, requestAnimationFrame, Date, performance) est figée
// par Playwright et avancée d'exactement 1/fps entre deux images ; les animations CSS
// sont recalées sur ce même temps. Résultat : des animations fluides et exactes,
// quelle que soit la durée réelle d'une capture d'écran.
import {spawn} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');

const here = dirname(fileURLToPath(import.meta.url));
export const SITE = resolve(here, '../../scottsdale-pool-site/dist/index.html');
export const OUT = resolve(here, '../public/site');

const T0 = Date.parse('2026-10-04T10:00:00-07:00');

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
  // Animations et transitions CSS : recalées sur le temps simulé
  window.__seek = (vt) => {
    for (const a of document.getAnimations()) {
      if (a.__t0 === undefined) {
        a.__t0 = vt;
        a.pause();
      }
      a.currentTime = vt - a.__t0;
    }
  };
};

export async function openSite({width, height, dsf = 2, mobile = false}) {
  const browser = await chromium.launch({args: ['--hide-scrollbars', '--force-color-profile=srgb']});
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
  await page.goto('file://' + SITE, {waitUntil: 'load'});
  await page.evaluate(() => document.fonts.ready);
  // le script du site démarre une fois les polices et la photo d'accroche prêtes
  // (attente côté Node : l'horloge de la page est figée, ses minuteries ne tournent pas)
  for (let k = 0; k < 200; k++) {
    if (await page.evaluate(() => document.documentElement.classList.contains('is-ready'))) break;
    await new Promise((r) => setTimeout(r, 50));
  }
  const cdp = await context.newCDPSession(page);
  return {browser, context, page, cdp, width, height, dsf};
}

/** Position (px document) du haut d'un élément */
export const top = (page, sel) => page.evaluate((sel) => document.querySelector(sel).getBoundingClientRect().top + window.scrollY, sel);

/** Centre (px viewport) d'un élément */
export const center = (page, sel) =>
  page.evaluate((sel) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return {x: r.left + r.width / 2, y: r.top + r.height / 2};
  }, sel);

export const scrollTo = (page, y) =>
  page.evaluate((y) => {
    window.scrollTo({top: y, behavior: 'instant'});
    if (window.ScrollTrigger) window.ScrollTrigger.update();
  }, y);

/** Avance le temps simulé (horloge de la page + animations CSS) */
export async function tick(page, ms) {
  if (ms > 0) await page.clock.runFor(ms);
  await page.evaluate((ms) => { window.__vt = (window.__vt || 0) + ms; window.__seek(window.__vt); }, ms);
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
export async function record(site, {name, fps = 30, seconds, step, quality = 92}) {
  const {page} = site;
  mkdirSync(OUT, {recursive: true});
  const out = resolve(OUT, `${name}.mp4`);
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    out,
  ], {stdio: ['pipe', 'inherit', 'inherit']});
  const done = new Promise((ok, ko) => ff.on('close', (c) => (c === 0 ? ok() : ko(new Error('ffmpeg ' + c)))));
  const n = Math.round(seconds * fps);
  const meta = {name, fps, frames: n, width: site.width, height: site.height, mouse: [], clicks: []};
  let last = 0;
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const t = Math.round((i * 1000) / fps);
    const info = (await step(i, t)) || {};
    if (info.mouse) meta.mouse[i] = info.mouse;
    if (info.click) meta.clicks.push(i);
    await tick(page, t - last);
    last = t;
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
  console.log(`✓ ${name}.mp4  ${n} images, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  return meta;
}

// Courbes utiles pour écrire les plans
export const clamp01 = (v) => Math.max(0, Math.min(1, v));
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const sine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
/** Interpole une suite de clés [[t, valeur], …] avec un easing par segment */
export const track = (keys, ease = sine) => (t) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let k = 1; k < keys.length; k++) {
    const [ta, va] = keys[k - 1];
    const [tb, vb, e] = keys[k];
    if (t <= tb) return va + (vb - va) * (e || ease)((t - ta) / (tb - ta));
  }
  return keys[keys.length - 1][1];
};
