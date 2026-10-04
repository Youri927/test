// La Biza : le plan-séquence. Un seul trajet continu dans le site, filmé image par image en temps simulé,
// découpé en plans pour la sûreté de la capture (la page n'est jamais rechargée entre deux plans :
// la vidéo les enchaîne sans coupe). Puis un court passage sur mobile.
// Usage : node capture/shots.mjs [desktop|mobile]
// (le temps de la page est simulé : 1/60 s par image, ralenti au début du premier plan)
import {openSite, record, scrollTo, settle, center, sine} from './lib.mjs';
import {DAY, DAY_LEN, PHONE, PHONE_LEN, track} from './day.mjs';

const FPS = 60;
const DESK = {width: 1920, height: 1080, dsf: 1.5};
const MOBILE = {width: 390, height: 844, dsf: 2, mobile: true};

const Y = track(DAY);

// ——— La souris, seulement là où le site y répond : la carte, la guirlande, les portes ———
// {t, sel, dx, dy} : position relative au centre d'un élément, lue en direct ; {t, xy} : position fixe ; off : la souris s'en va
const MOUSE = [
  {t: 26.2, xy: [2010, 760], jump: true},
  {t: 27.2, sel: '.carte', dx: 150, dy: 60, dur: 1.0},
  {t: 28.4, sel: '.carte', dx: -170, dy: -90, dur: 1.2},
  {t: 29.6, sel: '.carte', dx: -120, dy: 120, dur: 1.2},
  {t: 30.8, sel: '.carte', dx: 140, dy: -40, dur: 1.2},
  {t: 31.6, xy: [1500, -40], dur: 0.8, off: true},
  {t: 33.0, sel: '[data-garland]', dx: -560, dy: 40, jump: true},
  {t: 34.6, sel: '[data-garland]', dx: -60, dy: 70, dur: 1.6},
  {t: 36.2, sel: '[data-garland]', dx: 520, dy: 30, dur: 1.6},
  {t: 37.0, xy: [1980, 300], dur: 0.8, off: true},
  {t: 46.0, xy: [1990, 900], jump: true},
  {t: 46.9, sel: '.door:nth-child(1)', dx: 60, dy: 40, dur: 0.9},
  {t: 48.2, sel: '.door:nth-child(1)', dx: 90, dy: 20, dur: 1.3},
  {t: 49.0, sel: '.door:nth-child(2)', dx: -40, dy: 30, dur: 0.8},
  {t: 50.0, sel: '.door:nth-child(2)', dx: 30, dy: 70, dur: 1.0},
  {t: 50.6, xy: [1990, 1000], dur: 0.6, off: true},
];

const at = async (page, ev) => {
  if (ev.xy) return {x: ev.xy[0], y: ev.xy[1]};
  const c = await center(page, ev.sel);
  return {x: c.x + (ev.dx || 0), y: c.y + (ev.dy || 0)};
};
/** la souris entre deux étapes : glisse vers l'étape suivante pendant sa durée ; cachée hors des moments interactifs */
const mouseAt = async (page, s) => {
  let k = -1;
  while (k + 1 < MOUSE.length && MOUSE[k + 1].t <= s) k++;
  const next = MOUSE[k + 1];
  const cur = MOUSE[k];
  if (!cur && !next) return null;
  const visible = cur && !cur.off;
  if (next && !next.jump && s >= next.t - (next.dur || 0.8) && (visible || next)) {
    const from = cur ? await at(page, cur) : await at(page, next);
    const to = await at(page, next);
    const u = sine(Math.min(1, (s - (next.t - (next.dur || 0.8))) / (next.dur || 0.8)));
    if (!cur || cur.off) return null;
    return {x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u};
  }
  return visible ? at(page, cur) : null;
};

async function desktop() {
  const site = await openSite(DESK);
  const {page} = site;
  const parts = [[0, 12.6], [12.6, 26.0], [26.0, 43.0], [43.0, 55.0], [55.0, DAY_LEN]];
  for (const [p, [a, b]] of parts.entries()) {
    await record(site, {
      name: `day-${p + 1}`,
      fps: FPS,
      seconds: b - a,
      // l'ouverture au ralenti : le nom se lève lentement de l'eau
      rate: p === 0 ? (s) => (s < 3.4 ? 0.42 : s < 4.6 ? 0.42 + 0.58 * sine((s - 3.4) / 1.2) : 1) : null,
      async step(i, t) {
        const s = a + t / 1000;
        const y = Math.round(Y(s));
        await scrollTo(page, y);
        const m = await mouseAt(page, s);
        if (m) await page.mouse.move(m.x, m.y);
        else await page.mouse.move(1919, 1079);
        return {y, mouse: m};
      },
    });
  }
  await site.browser.close();
}

// Sur mobile : du nom qui se lève à l'îlot, en passant par le porche
async function mobile() {
  const site = await openSite(MOBILE);
  const {page} = site;
  await settle(page, 3200); // le nom s'est levé, le parc et le porche sont dessinés
  const Ym = track(PHONE);
  await record(site, {
    name: 'phone',
    fps: FPS,
    seconds: PHONE_LEN,
    async step(i, t) {
      const y = Math.round(Ym(t / 1000));
      await scrollTo(page, y);
      return {y};
    },
  });
  await site.browser.close();
}

const want = process.argv.slice(2);
if (!want.length || want.includes('desktop')) await desktop();
if (!want.length || want.includes('mobile')) await mobile();
