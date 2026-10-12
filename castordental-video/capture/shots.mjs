// Plans filmés du nouveau site de Castor Dental Associates pour la vidéo de présentation 16:9 (image par image,
// temps simulé). Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …] [--probe]
//
// Contre les saccades : Chrome arrondit le défilement au pixel entier. Chaque plan défile donc par pas entiers qui ne
// changent que progressivement (1, 1, 2, 2, 3… puis constants), et la vidéo lit toujours les plans à vitesse 1 :
// aucune image sautée ni doublée.
// Les clics et les touchers tombent sur des temps de la musique (90 BPM : un temps = 2/3 s), voir EVENTS dans src/beats.ts.
import {openSite, record, scrollTo, settle, top, until, sine, easeInOut} from './lib.mjs';
import {OPEN, EVENTS, BEAT} from '../src/beats.ts';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
// La hauteur du téléphone sans sa barre d'état (844 − 47 px) : la page entière, barre d'appel comprise, reste à l'écran
const MOBILE = {width: 390, height: 797, dsf: 2, mobile: true};
const F = (s) => Math.round(s * FPS);
/** image d'un plan qui démarre avec sa scène, pour un temps de la musique */
const B = (beats) => Math.round(beats * BEAT);

/** Toutes les photos chargées et décodées tout de suite (le site les charge au défilement) : aucune image vide à l'écran */
const prime = (page) =>
  page.evaluate(async () => {
    for (const img of document.images) img.loading = 'eager';
    await Promise.all([...document.images].map((i) => i.decode().catch(() => null)));
  });

/** Rectangle d'un élément, en px du document */
const rect = (page, sel) =>
  page.evaluate((sel) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return {left: r.left, top: r.top + scrollY, width: r.width, height: r.height};
  }, sel);

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

/** Un clic : la souris appuie et relâche à l'image i ; le contour de focus de la souris n'apparaît pas */
const click = async (page) => {
  await page.mouse.down();
  await page.mouse.up();
  await blur(page);
};

/** Plan avec une souris : défilement fixe ou glissé, trajet (à partir de `enter` secondes), clics aux images données */
const mouseStep = async (site, ctx, i, t) => {
  await scrollTo(site.page, ctx.ys ? ctx.ys[i] : ctx.y);
  if (t / 1000 < (ctx.enter ?? 0)) return null;
  const p = ctx.pos(t / 1000);
  await site.page.mouse.move(p.x, p.y);
  const on = ctx.clicks.includes(i);
  if (on) await click(site.page);
  return {mouse: p, click: on};
};

/** Plan au doigt : défilement de la page (et d'une bande horizontale, `xs`), et touchers [[image, point], …] */
const touchStep = async (site, ctx, i) => {
  await scrollTo(site.page, ctx.ys ? ctx.ys[i] : ctx.y);
  if (ctx.xs) await site.page.evaluate(([sel, x]) => { document.querySelector(sel).scrollLeft = x; }, [ctx.strip, ctx.xs[i]]);
  const tap = ctx.taps.find(([at]) => at === i);
  if (!tap) return null;
  await site.page.touchscreen.tap(tap[1].x, tap[1].y);
  await blur(site.page);
  return {mouse: tap[1], click: true};
};

/** L'ouverture du site a commencé (l'enseigne est à l'écran) : attente en temps réel, l'horloge de la page est figée */
const introStarted = (page) => until(page, () => document.querySelector('[data-facade]').classList.contains('is-shown'));
/** Opacité de la photo de la façade et de l'enseigne, image par image (le relevé place les accents de la musique) */
const introState = (page) =>
  page.evaluate(() => ({
    photo: Number(getComputedStyle(document.querySelector('[data-photo]')).opacity),
    sign: Number(getComputedStyle(document.querySelector('[data-sign]')).opacity),
  }));
/** La biographie affichée : un repère quand celle de `names` s'affiche */
const bioOn = (page, names) =>
  page.evaluate((names) => Object.fromEntries(names.map((n) => [n, document.querySelector(`.bio[data-person="${n}"]`).classList.contains('is-on')])), names);
/** La définition affichée (le mot), ou rien */
const defShown = (page) => page.evaluate(() => (document.querySelector('[data-def]').hidden ? '' : document.querySelector('[data-def-term]').textContent));

const desktop = [
  {
    // 1. L'ouverture, depuis sa première image : l'enseigne en vraies lettres, la caméra du site qui recule, la photo qui
    // apparaît, l'enseigne qui se pose sur la vraie ; puis la page descend de 60 px pour montrer la façade entière
    name: 'd-open',
    seconds: 10.0,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      await introStarted(site.page);
      return {ys: glideTo({y0: 0, y1: 60, from: OPEN.scroll - OPEN.hold, v: 2, ramp: 20, frames: F(10.0)})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
    watch: introState,
  },
  {
    // 2. L'orthodontie cachée : la page descend de la façade jusqu'au cas ; ses trois étapes s'allument une à une
    name: 'd-straight',
    seconds: 6.7,
    async setup(site) {
      const y0 = 450;
      await park(site, y0, 900);
      return {ys: glideTo({y0, y1: Math.round((await top(site.page, '#straight h2')) - 116), from: 19, v: 3, ramp: 40, frames: F(6.7)})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
    // le nombre d'étapes allumées : un repère par étape (la musique y pose une note)
    watch: (page) =>
      page.evaluate(() => {
        const n = document.querySelectorAll('.case__step.is-on').length;
        return {step1: n >= 1, step2: n >= 2, step3: n >= 3};
      }),
  },
  {
    // 3. Les soins : la souris ouvre « Crowns and bridges » (sur un temps), puis passe sur « crown » et sur « bridge » :
    // leur définition, tirée du dictionnaire dentaire du cabinet, s'affiche au-dessus du mot
    name: 'd-care',
    seconds: 6.7,
    async setup(site) {
      const page = site.page;
      const item = '#g-natural + .group__items details:first-child';
      const y = Math.round((await top(page, `${item} summary`)) - 195);
      await park(site, y, 900);
      const name = await centerOf(page, `${item} .item__name`, 80);
      // les mots, relevés le soin ouvert, puis le soin refermé directement (la fermeture du site attend la fin de son
      // animation, qui ne vient jamais ici : les animations sont tenues en pause et placées image par image)
      await page.click(`${item} summary`);
      await settle(page, 700);
      const crown = await centerOf(page, `${item} [data-term="crown"]`);
      const bridge = await centerOf(page, `${item} [data-term="bridge"]`);
      await page.evaluate((s) => {
        const d = document.querySelector(s);
        const body = d.querySelector('.item__body');
        body.getAnimations().forEach((a) => a.cancel());
        body.style.overflow = '';
        d.open = false;
      }, item);
      await page.mouse.move(1250, 860);
      await blur(page);
      await settle(page, 400);
      if (await page.evaluate((s) => document.querySelector(s).open, item)) throw new Error('le soin est resté ouvert');
      return {
        y,
        enter: 0.3,
        pos: path([
          [0.3, 1250, 860], [1.15, name.x, name.y + 2], [1.6, name.x + 2, name.y + 3],
          [3.1, crown.x + 2, crown.y + 3], [4.03, crown.x + 3, crown.y + 4],
          [4.88, bridge.x + 2, bridge.y + 3], [6.7, bridge.x + 3, bridge.y + 4],
        ]),
        clicks: [B(EVENTS.care.open)],
      };
    },
    step: mouseStep,
    watch: async (page) => {
      const d = await defShown(page);
      return {open: await page.evaluate(() => document.querySelector('#g-natural + .group__items details').open), crown: d === 'Crown', bridge: d === 'Bridge'};
    },
  },
  {
    // 4. L'équipe : la souris choisit Denise, puis Amanda (sur des temps) ; leur biographie s'affiche sous la haie
    name: 'd-team',
    seconds: 6.7,
    async setup(site) {
      const page = site.page;
      // cadrage tout entier dans la haie : le bas de la section (qui remonte avec une biographie courte) reste sous l'écran
      const y = Math.round((await top(page, '#team h2')) - 181);
      await park(site, y, 900);
      const denise = await centerOf(page, '.face[data-person="denise"] .face__pic');
      const amanda = await centerOf(page, '.face[data-person="amanda"] .face__pic');
      return {
        y,
        enter: 0.3,
        pos: path([
          [0.3, 1250, 860], [1.4, denise.x + 6, denise.y + 10], [1.75, denise.x + 8, denise.y + 12],
          [3.75, amanda.x + 6, amanda.y + 10], [4.1, amanda.x + 8, amanda.y + 12], [5.3, amanda.x + 60, amanda.y + 250],
        ]),
        clicks: EVENTS.team.map(B),
      };
    },
    step: mouseStep,
    watch: (page) => bioOn(page, ['denise', 'amanda']),
  },
  {
    // 5. Ce que les patients remarquent : les engagements et leurs avis défilent doucement
    name: 'd-reviews',
    seconds: 5.4,
    async setup(site) {
      const y0 = Math.round((await top(site.page, '#reviews h2')) - 116);
      await park(site, y0, 900);
      return {ys: glide({y0, from: 12, v: 2, ramp: 40, frames: F(5.4)})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
  },
  {
    // 6. La visite : l'enseigne recomposée en bardage, la porte, la demande ; la souris choisit « Something hurts »
    // (sur un temps) et la note renvoie au téléphone
    name: 'd-visit',
    seconds: 5.4,
    async setup(site) {
      const page = site.page;
      const y = Math.round((await top(page, '.board')) - 100);
      await park(site, y, 1200);
      const hurt = await centerOf(page, '.topics input[data-urgent] + span');
      return {
        y,
        enter: 0.3,
        pos: path([[0.3, 1250, 860], [1.7, hurt.x + 6, hurt.y + 3], [2.05, hurt.x + 8, hurt.y + 4], [3.3, hurt.x + 90, hurt.y + 120]]),
        clicks: [B(EVENTS.visit)],
      };
    },
    step: mouseStep,
    watch: (page) => page.evaluate(() => ({urgent: !document.querySelector('[data-urgent-note]').hidden})),
  },
];

const mobile = [
  {
    // l'ouverture au téléphone : la même enseigne, sur la façade en 4:3 ; puis la page descend pour la montrer entière
    name: 'm-open',
    seconds: 6.2,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      await introStarted(site.page);
      return {ys: glideTo({y0: 0, y1: 90, from: 160, v: 2, ramp: 20, frames: F(6.2)}), taps: []};
    },
    step: touchStep,
    watch: introState,
  },
  {
    // l'équipe au téléphone : le doigt choisit Denise, la bande des visages glisse jusqu'au bout, puis Amanda
    name: 'm-team',
    seconds: 6.7,
    async setup(site) {
      const page = site.page;
      // l'aimantation de la bande est coupée pour la capture : elle glisse par pas entiers, comme la page
      await page.addStyleTag({content: '.strip-wrap { scroll-snap-type: none !important; }'});
      const y = Math.round((await top(page, '#team h2')) - 88);
      await park(site, y, 900);
      const max = await page.evaluate(() => { const s = document.querySelector('.strip-wrap'); return s.scrollWidth - s.clientWidth; });
      const denise = await centerOf(page, '.face[data-person="denise"] .face__pic');
      const amanda = await centerOf(page, '.face[data-person="amanda"] .face__pic');
      const xs = glideTo({y0: 0, y1: max, from: 150, v: 6, ramp: 30, frames: F(6.7)});
      const x1 = xs[xs.length - 1];
      return {
        y,
        strip: '.strip-wrap',
        xs,
        taps: [[B(EVENTS.mobile.denise), denise], [B(EVENTS.mobile.amanda), {x: amanda.x - x1, y: amanda.y}]],
      };
    },
    step: touchStep,
    watch: (page) => bioOn(page, ['denise', 'amanda']),
  },
  {
    // la barre d'appel au téléphone : la page descend, la barre « Call / Request a visit » monte une fois l'accueil passé ;
    // puis le doigt touche « lingual » : sa définition s'affiche
    name: 'm-dock',
    seconds: 6.7,
    async setup(site) {
      const page = site.page;
      const y0 = 420;
      await park(site, y0, 900);
      const y1 = Math.round((await top(page, '#straight h2')) - 67);
      const ys = glideTo({y0, y1, from: 70, v: 4, ramp: 36, frames: F(6.7)});
      // position du mot une fois la page arrivée (mesurée en y allant, puis retour)
      await scrollTo(page, ys[ys.length - 1]);
      await settle(page, 100);
      const term = await centerOf(page, '[data-term="lingual"]');
      await scrollTo(page, y0);
      await settle(page, 600);
      return {ys, taps: [[B(EVENTS.mobile.lingual), term]]};
    },
    step: touchStep,
    watch: async (page) => ({dock: await page.evaluate(() => document.querySelector('[data-dock]').classList.contains('is-on')), lingual: (await defShown(page)) === 'Lingual'}),
  },
];

// --probe : rejoue les plans sans filmer, pour relever les repères (voir record() dans lib.mjs)
const probe = process.argv.includes('--probe');
const args = process.argv.slice(2).filter((a) => a !== '--probe');
const pick = (list, group) => list.filter((s) => !args.length || args.includes(s.name) || args.includes(group));

for (const [list, cfg, group] of [[desktop, DESK, 'desktop'], [mobile, MOBILE, 'mobile']]) {
  for (const shot of pick(list, group)) {
    const site = await openSite({...cfg, query: shot.query || ''});
    site.page.on('pageerror', (e) => console.log(`  ${shot.name} : ${e.message}`));
    if (!shot.fresh) {
      // l'ouverture du site se joue d'abord en entier (2,4 s), en haut de la page
      await prime(site.page);
      await settle(site.page, 2700);
    }
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t), watch: shot.watch, probe});
    await site.browser.close();
  }
}
