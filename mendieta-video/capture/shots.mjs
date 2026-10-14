// Plans filmés du nouveau site de Mendieta Roofing pour la vidéo de présentation 16:9 (image par image, temps simulé).
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …] [--probe]
//
// Contre les saccades : Chrome arrondit le défilement au pixel entier. Chaque plan défile donc par pas entiers qui ne
// changent que progressivement (1, 1, 2, 2, 3… puis constants), et la vidéo lit toujours les plans à vitesse 1 :
// aucune image sautée ni doublée.
// Les clics et la frappe tombent sur des temps de la musique (112,5 BPM : un temps = 32 images), voir EVENTS dans
// src/beats.ts.
import {openSite, record, scrollTo, settle, tick, top, sine, easeInOut} from './lib.mjs';
import {EVENTS, BEAT, SCENE_BEATS} from '../src/beats.ts';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
// La hauteur du téléphone sans sa barre d'état (844 − 47 px) : la page entière, barre du bas comprise, reste à l'écran
const MOBILE = {width: 390, height: 797, dsf: 2, mobile: true};
const F = (s) => Math.round(s * FPS);
/** image d'un plan qui démarre avec sa scène, pour un temps de la musique */
const B = (beats) => Math.round(beats * BEAT);
/** durée de chaque scène, en images */
const LEN = Object.fromEntries(SCENE_BEATS.map(([name, beats]) => [name, beats * BEAT]));

/** Toutes les photos chargées et décodées tout de suite (le site les charge à l'approche) : aucune image vide à l'écran */
const prime = (page) =>
  page.evaluate(async () => {
    for (const img of document.images) img.loading = 'eager';
    await Promise.all([...document.images].map((i) => i.decode().catch(() => null)));
  });

/** Centre (px du viewport) du premier élément visible qui correspond ; `dx` : décalage depuis son bord gauche */
const centerOf = (page, sel, dx = null) =>
  page.evaluate(([sel, dx]) => {
    const all = [...document.querySelectorAll(sel)];
    const el = all.find((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
    if (!el) throw new Error('cible introuvable : ' + sel);
    const r = el.getBoundingClientRect();
    return {x: dx === null ? r.left + r.width / 2 : r.left + dx, y: r.top + r.height / 2};
  }, [sel, dx]);

/** Place la page à y en y descendant (les apparitions plus haut sont déjà jouées), puis laisse passer un peu de temps */
const park = async (site, y, ms = 1000) => {
  const page = site.page;
  for (let v = 0; v < y - 300; v += 400) { await scrollTo(page, v); await settle(page, 60); }
  await scrollTo(page, y - 150);
  await settle(page, 200);
  await scrollTo(page, y);
  await settle(page, ms);
};

/**
 * Défilement par pas entiers : position à chaque image du plan.
 * Le défilement part à l'image `from`, accélère sur `ramp` images (1, 1, 2, 2, 3… px), roule à `v` px par image,
 * et freine de même sur ses `ramp` dernières images s'il a une fin (`to`, image d'arrêt).
 */
const glide = ({y0, from, v, ramp = 40, to = Infinity, frames}) => {
  const ys = new Array(frames).fill(y0);
  let y = y0;
  for (let i = 1; i < frames; i++) {
    let step = 0;
    if (i > from && i <= to) {
      const a = i - from;
      const b = to === Infinity ? Infinity : to - i + 1;
      const k = Math.min(1, a / ramp, b / ramp);
      step = Math.max(1, Math.round(v * sine(k)));
    }
    y += step;
    ys[i] = y;
  }
  return ys;
};

/** Même défilement, avec l'image d'arrêt choisie pour arriver au plus près de y1 */
const glideTo = ({y0, y1, from, v, ramp = 40, frames}) => {
  let best = null;
  for (let to = from + 2 * ramp; to < frames; to++) {
    const ys = glide({y0, from, v, ramp, to, frames});
    if (!best || Math.abs(ys[frames - 1] - y1) < Math.abs(best[frames - 1] - y1)) best = ys;
    if (ys[frames - 1] >= y1) break;
  }
  return best;
};

/** Trajet de souris par clés [[t, x, y, easing], …] (secondes, px du viewport) */
const path = (keys) => (s) => {
  if (s <= keys[0][0]) return {x: keys[0][1], y: keys[0][2]};
  for (let k = 1; k < keys.length; k++) {
    const [ta, xa, ya] = keys[k - 1];
    const [tb, xb, yb, e = easeInOut] = keys[k];
    if (s <= tb) {
      const u = e((s - ta) / (tb - ta));
      return {x: xa + (xb - xa) * u, y: ya + (yb - ya) * u};
    }
  }
  const last = keys[keys.length - 1];
  return {x: last[1], y: last[2]};
};

const blur = (page) => page.evaluate(() => document.activeElement && document.activeElement !== document.body && document.activeElement.blur());

/** Un clic : la souris appuie et relâche à l'image i ; le contour de focus de la souris n'apparaît pas (sauf `keep`) */
const click = async (page, keep = false) => {
  await page.mouse.down();
  await page.mouse.up();
  if (!keep) await blur(page);
};

/**
 * Plan avec une souris : défilement fixe ou glissé, trajet (à partir de `enter` secondes), clics aux images données
 * (`clicks` ; `focus` : un clic qui garde le focus, dans un champ), et des touches tapées (`keys` : [[image, texte], …]).
 */
const mouseStep = async (site, ctx, i, t) => {
  await scrollTo(site.page, ctx.ys ? ctx.ys[i] : ctx.y);
  const key = (ctx.keys || []).find(([at]) => at === i);
  if (key) await site.page.keyboard.type(key[1]);
  if (t / 1000 < (ctx.enter ?? 0)) return null;
  const p = ctx.pos(t / 1000);
  await site.page.mouse.move(p.x, p.y);
  const keep = (ctx.focus || []).includes(i);
  const on = keep || (ctx.clicks || []).includes(i);
  if (on) await click(site.page, keep);
  return {mouse: p, click: on};
};

/** Plan au doigt : défilement de la page, et touchers [[image, point], …] */
const touchStep = async (site, ctx, i) => {
  await scrollTo(site.page, ctx.ys ? ctx.ys[i] : ctx.y);
  const tap = (ctx.taps || []).find(([at]) => at === i);
  if (!tap) return null;
  await site.page.touchscreen.tap(tap[1].x, tap[1].y);
  await blur(site.page);
  return {mouse: tap[1], click: true};
};

/**
 * État de l'ouverture, image par image : le temps de l'animation du titre (ms) et de celle de la photo.
 * Le montage et la musique en déduisent les repères : le titre monte de 0 à 1,11 s, la photo se découvre de 0,2 à 1,45 s,
 * la légende arrive de 1,3 à 1,9 s (src/styles.css du site).
 */
const introState = (page) =>
  page.evaluate(() => {
    const at = (sel) => {
      const el = document.querySelector(sel);
      const a = el && document.getAnimations().find((x) => x.effect?.target === el);
      return a ? Number(a.currentTime) : -1;
    };
    return {titleT: at('.hero__title .ln > span'), photoT: at('.hero__photo picture')};
  });

/** L'état de la coupe : étape, tuiles posées, l'ancien toit qui s'en va (0 à 1), la sous-couche déroulée (px) */
const layersState = (page) =>
  page.evaluate(() => {
    const d = document.querySelector('[data-drawing]');
    const st = Number(d.dataset.stage);
    const set = document.querySelectorAll('.xs__tile.is-set').length;
    const off = Number(document.querySelector('[data-drawing] svg').style.getPropertyValue('--off')) || 0;
    const under = Number(document.querySelector('[data-clip="under"]').getAttribute('width')) || 0;
    return {s2: st >= 2, s3: st >= 3, s4: st >= 4, t1: set >= 1, t2: set >= 2, t3: set >= 3, gone: off >= 0.5, stage: st, off, under};
  });

const desktop = [
  {
    // 1. L'ouverture, depuis sa première image : le titre monte ligne par ligne, la photo d'un toit de tuiles plates se
    // découvre du bas vers le haut, puis le texte, les boutons, la licence et la légende ; puis l'accueil, immobile
    name: 'd-open',
    seconds: 3.2,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      return {y: 0};
    },
    async step(site, ctx) {
      await scrollTo(site.page, ctx.y);
    },
    watch: introState,
  },
  {
    // 2. Couche par couche : la page descend à vitesse constante dans la partie épinglée ; l'ancien toit s'en va, la
    // sous-couche se déroule, les tuiles se posent, puis les maisons pendant et après. L'étape 2 arrive sur un temps.
    name: 'd-layers',
    seconds: LEN.Layers / FPS,
    async setup(site) {
      const page = site.page;
      const y0 = Math.round(await top(page, '#layers'));
      const span = await page.evaluate(() => {
        const l = document.querySelector('[data-layers]');
        return l.offsetHeight - innerHeight;
      });
      const y1 = y0 + Math.round(span * 0.97);
      await park(site, y0, 900);
      // le départ du défilement : l'étape 2 commence (un quart de la partie) sur le temps EVENTS.layers.first
      const target = B(EVENTS.layers.first);
      let best = null;
      for (let from = 0; from < 90; from++) {
        const ys = glideTo({y0, y1, from, v: 6, ramp: 30, frames: LEN.Layers});
        const k = ys.findIndex((y) => y - y0 >= span / 4);
        if (!best || Math.abs(k - target) < Math.abs(best.k - target)) best = {from, ys, k};
      }
      console.log(`  d-layers : départ à l'image ${best.from}, étape 2 à l'image ${best.k} (cible ${target}), arrivée ${best.ys[LEN.Layers - 1] - y0} px sur ${span}`);
      return {ys: best.ys};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
    watch: layersState,
  },
  {
    // 3. Les toits et les photos : la page descend des trois petites coupes aux photos en rangs de tuiles ; la souris
    // choisit « Tile » (sur un temps) : les dix photos de toits en tuiles se reposent en rangs décalés
    name: 'd-photos',
    seconds: LEN.Photos / FPS,
    async setup(site) {
      const page = site.page;
      const y0 = Math.round(await top(page, '#roofs')) - 72;
      const y1 = Math.round(await top(page, '.roofs__bar')) - 100;
      await park(site, y0, 900);
      // position du filtre la page arrivée, puis retour
      await scrollTo(page, y1);
      await settle(page, 100);
      const tab = await centerOf(page, '[data-tabs] [data-k="tile"]');
      await scrollTo(page, y0);
      await settle(page, 400);
      return {
        ys: glideTo({y0, y1, from: 12, v: 5, ramp: 30, frames: LEN.Photos}),
        enter: 1.9,
        // par la droite, au-dessus des photos (aucune n'est survolée), puis ressort par la droite
        pos: path([
          [1.9, 1428, 150], [2.7, tab.x + 4, tab.y + 3], [2.95, tab.x + 6, tab.y + 4],
          [3.55, tab.x + 6, tab.y + 4], [4.3, 1428, 140],
        ]),
        clicks: [B(EVENTS.photos.tile)],
      };
    },
    step: mouseStep,
    watch: (page) => page.evaluate(() => ({tile: document.querySelector('[data-tabs] [data-k="tile"]').getAttribute('aria-selected') === 'true'})),
  },
  {
    // 4. La preuve : les avis sur le marine, puis la page descend jusqu'à la licence en grand
    name: 'd-proof',
    seconds: LEN.Proof / FPS,
    async setup(site) {
      const page = site.page;
      const y0 = Math.round(await top(page, '#reviews')) - 72;
      const y1 = Math.round(await top(page, '#license')) - 72;
      await park(site, y0, 900);
      return {ys: glideTo({y0, y1, from: 40, v: 5, ramp: 36, frames: LEN.Proof})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
    watch: (page) => page.evaluate(() => ({card: document.querySelector('.card').getBoundingClientRect().bottom < innerHeight - 60})),
  },
  {
    // 5. Le secteur : la page descend sur la carte, les villes se colorent une à une ; la souris tape « Boca Raton »
    // dans « Check your city », puis « Check » (sur un temps) : la ville s'allume, la réponse dit son comté
    name: 'd-area',
    seconds: LEN.Area / FPS,
    async setup(site) {
      const page = site.page;
      const areaTop = await top(page, '#area');
      const y0 = Math.round(areaTop - 700);
      const y1 = Math.round((await top(page, '.area__map')) - 92);
      await park(site, y0, 900);
      if (await page.evaluate(() => document.querySelector('[data-area]').classList.contains('is-in'))) throw new Error('la carte est déjà découverte');
      // positions à l'arrivée, déduites de leur place au départ (aller-retour interdit : la carte se découvrirait)
      const dy = y1 - y0;
      const input = await centerOf(page, '#city', 110);
      const check = await centerOf(page, '[data-check] button');
      input.y -= dy;
      check.y -= dy;
      const typeFrom = B(EVENTS.area.focus) + 6;
      const keys = [...'Boca Raton'].map((ch, k) => [typeFrom + k * 5, ch]);
      return {
        ys: glideTo({y0, y1, from: 8, v: 6, ramp: 30, frames: LEN.Area}),
        enter: 2.0,
        pos: path([
          [2.0, 470, 250], [2.85, input.x, input.y + 2], [3.15, input.x + 2, input.y + 3],
          [4.2, input.x + 2, input.y + 3], [4.6, check.x, check.y + 2], [4.75, check.x + 2, check.y + 3],
        ]),
        focus: [B(EVENTS.area.focus)],
        keys,
        clicks: [B(EVENTS.area.check)],
      };
    },
    step: mouseStep,
    watch: (page) =>
      page.evaluate(() => ({
        mapIn: document.querySelector('[data-area]').classList.contains('is-in'),
        hit: Boolean(document.querySelector('.map__city.is-hit')),
      })),
  },
  {
    // 6. Le devis : le nom, le téléphone, la ville et le message sont déjà là ; la souris choisit « Tile », puis « A leak
    // fixed » ; la page descend ; « Write my text to Mendieta » : le message est prêt, adressé au portable
    name: 'd-estimate',
    seconds: LEN.Estimate / FPS,
    async setup(site) {
      const page = site.page;
      await page.fill('#f-name', 'Dana');
      await page.fill('#f-phone', '(561) 555-0123');
      await page.fill('#f-city', 'Wellington');
      await page.fill('#f-msg', 'Water stain on the ceiling after the last storm.');
      await blur(page);
      const y0 = Math.round(await top(page, '.chips label:has(input[value="Tile"])')) - 110;
      const y1 = y0 + 280;
      await park(site, y0, 900);
      const tile = await centerOf(page, '.chips label:has(input[value="Tile"])');
      const leak = await centerOf(page, '.chips label:has(input[value="A leak fixed"])');
      const go = await centerOf(page, '.form__go');
      go.y -= y1 - y0;
      return {
        ys: glideTo({y0, y1, from: 124, v: 4, ramp: 25, frames: LEN.Estimate}),
        enter: 0.35,
        pos: path([
          [0.35, 1250, 700], [0.95, tile.x, tile.y], [1.08, tile.x + 3, tile.y + 2],
          [1.45, tile.x + 3, tile.y + 2], [1.75, leak.x, leak.y], [1.88, leak.x + 3, leak.y + 2],
          // pendant que la page descend, la souris attend à droite du formulaire (rien n'est survolé)
          [2.05, leak.x + 3, leak.y + 2], [2.55, 1428, 420],
          [3.6, 1428, 420], [4.1, go.x, go.y + 2], [4.25, go.x + 3, go.y + 3],
        ]),
        clicks: [B(EVENTS.estimate.tile), B(EVENTS.estimate.leak), B(EVENTS.estimate.go)],
      };
    },
    step: mouseStep,
    watch: (page) =>
      page.evaluate(() => ({
        tile: document.querySelector('input[value="Tile"]').checked,
        leak: document.querySelector('input[value="A leak fixed"]').checked,
        ready: !document.querySelector('[data-ready]').hidden,
      })),
  },
];

const mobile = [
  {
    // l'ouverture au téléphone : le titre monte, la photo en hauteur se découvre
    name: 'm-open',
    seconds: 3.4,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      return {y: 0, taps: []};
    },
    step: touchStep,
    watch: introState,
  },
  {
    // couche par couche au téléphone : la coupe reste en haut, recadrée sur le toit ; les étapes défilent dessous et la
    // coupe suit celle qu'on lit
    name: 'm-layers',
    seconds: LEN.Mobile / FPS,
    async setup(site) {
      const page = site.page;
      // au départ, la coupe entre par le bas de l'écran avec l'ancien toit encore en place (au téléphone, l'étape 1 se lit
      // pendant que la coupe monte se caler en haut)
      const y0 = Math.round(await top(page, '#layers')) - 62 - 300;
      // jusqu'à la fin de l'étape 4 : son haut passé de 85 % de sa hauteur sous la ligne de lecture
      const y1 = await page.evaluate((y0) => {
        const li = document.querySelector('.layers__steps [data-step="4"]');
        const stage = document.querySelector('.layers__stage');
        const band = 62 + stage.offsetHeight;
        const line = band + (innerHeight - band) * 0.42;
        return Math.round(li.getBoundingClientRect().top + scrollY - line + li.offsetHeight * 0.85);
      }, y0);
      await park(site, y0, 900);
      return {ys: glideTo({y0, y1, from: 10, v: 6, ramp: 30, frames: LEN.Mobile}), taps: []};
    },
    step: touchStep,
    watch: layersState,
  },
  {
    // les photos au téléphone : deux par deux, la barre « Call / Free estimate » en bas
    name: 'm-photos',
    seconds: LEN.Mobile / FPS,
    async setup(site) {
      const page = site.page;
      const y0 = Math.round(await top(page, '.roofs__bar')) - 82;
      await park(site, y0, 900);
      return {ys: glide({y0, from: 16, v: 4, ramp: 40, frames: LEN.Mobile}), taps: []};
    },
    step: touchStep,
    watch: (page) => page.evaluate(() => ({bar: document.querySelector('[data-callbar]').classList.contains('is-on')})),
  },
];

// --probe : rejoue les plans sans filmer, pour relever les repères (voir record() dans lib.mjs)
const probe = process.argv.includes('--probe');
const args = process.argv.slice(2).filter((a) => a !== '--probe');
const pick = (list, group) => list.filter((s) => !args.length || args.includes(s.name) || args.includes(group));

for (const [list, cfg, group] of [[desktop, DESK, 'desktop'], [mobile, MOBILE, 'mobile']]) {
  for (const shot of pick(list, group)) {
    const site = await openSite(cfg);
    site.page.on('pageerror', (e) => console.log(`  ${shot.name} : ${e.message}`));
    if (!shot.fresh) {
      await prime(site.page);
      // l'ouverture du site se joue avant le plan (2 s)
      await settle(site.page, 2200);
    }
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t), watch: shot.watch, probe});
    await site.browser.close();
  }
}
