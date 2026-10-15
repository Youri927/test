// Plans filmés du nouveau site de Five Points Roofing pour la vidéo de présentation 16:9 (image par image, temps simulé).
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …] [--probe]
//
// Contre les saccades : Chrome arrondit le défilement au pixel entier. Chaque plan défile donc par pas entiers qui ne
// changent que progressivement (1, 1, 2, 2, 3… puis constants), et la vidéo lit toujours les plans à vitesse 1 :
// aucune image sautée ni doublée.
// Les clics tombent sur des temps de la musique (90 BPM : un temps = 40 images), voir EVENTS dans src/beats.ts.
import {openSite, record, scrollTo, settle, top, sine, easeInOut, easeOut} from './lib.mjs';
import {EVENTS, BEAT, SCENE_BEATS} from '../src/beats.ts';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
// La hauteur du téléphone sans sa barre d'état (844 − 47 px) : la page entière reste à l'écran
const MOBILE = {width: 390, height: 797, dsf: 2, mobile: true};
/** image d'un plan qui démarre avec sa scène, pour un temps de la musique */
const B = (beats) => Math.round(beats * BEAT);
/** secondes d'un plan qui démarre avec sa scène, pour un temps de la musique */
const T = (beats) => (beats * BEAT) / FPS;
/** durée de chaque scène, en images */
const LEN = Object.fromEntries(SCENE_BEATS.map(([name, beats]) => [name, beats * BEAT]));
/** la hauteur de l'en-tête collant du site : 76 px sur ordinateur, 62 px au téléphone */
const topH = (site) => (site.width >= 1000 ? 76 : 62);

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

/** Centre d'un élément en px du document (x du viewport, y de la page) */
const docCenter = (page, sel, dx = null) =>
  page.evaluate(([sel, dx]) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return {x: dx === null ? r.left + r.width / 2 : r.left + dx, y: r.top + scrollY + r.height / 2};
  }, [sel, dx]);

/**
 * Le dernier défilement (px) où un élément du site n'est pas encore découvert, moins `margin` : le site découvre les
 * photos, la ligne de la famille et le toit du pied de page quand 15 % de l'élément passe au-dessus de 88 % de la
 * hauteur de l'écran (main.js : rootMargin −12 %, seuil 0,15)
 */
const beforeReveal = (page, sel, margin = 30, {threshold = 0.15, bottom = 0.12} = {}) =>
  page.evaluate(([sel, margin, threshold, bottom]) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return Math.floor(r.top + scrollY + r.height * threshold - innerHeight * (1 - bottom) - margin);
  }, [sel, margin, threshold, bottom]);

const isIn = (page, sel) => page.evaluate((sel) => document.querySelector(sel).classList.contains('is-in'), sel);

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
 * et freine de même sur ses `ramp` dernières images s'il a une fin (`to`, image d'arrêt). `down` : un freinage plus
 * long que le départ (le doigt qui lâche la rangée des photos, et son élan qui s'éteint).
 */
const glide = ({y0, from, v, ramp = 40, down = ramp, to = Infinity, frames}) => {
  const ys = new Array(frames).fill(y0);
  let y = y0;
  for (let i = 1; i < frames; i++) {
    let step = 0;
    if (i > from && i <= to) {
      const a = i - from;
      const b = to === Infinity ? Infinity : to - i + 1;
      const k = Math.min(1, a / ramp, b / down);
      step = Math.max(1, Math.round(v * sine(k)));
    }
    y += step;
    ys[i] = y;
  }
  return ys;
};

/** Même défilement, avec l'image d'arrêt choisie pour arriver au plus près de y1 */
const glideTo = ({y0, y1, from, v, ramp = 40, down = ramp, frames}) => {
  let best = null;
  for (let to = from + ramp + down; to < frames; to++) {
    const ys = glide({y0, from, v, ramp, down, to, frames});
    if (!best || Math.abs(ys[frames - 1] - y1) < Math.abs(best[frames - 1] - y1)) best = ys;
    if (ys[frames - 1] >= y1) break;
  }
  return best;
};

/**
 * Trajet de souris par clés [[t, x, y, easing, easingY], …] (secondes, px du viewport). Un easing à part pour y courbe
 * le trajet (la souris contourne ce qu'elle ne doit pas survoler).
 */
const path = (keys) => (s) => {
  if (s <= keys[0][0]) return {x: keys[0][1], y: keys[0][2]};
  for (let k = 1; k < keys.length; k++) {
    const [ta, xa, ya] = keys[k - 1];
    const [tb, xb, yb, e = easeInOut, ey = e] = keys[k];
    if (s <= tb) {
      const t = (s - ta) / (tb - ta);
      return {x: xa + (xb - xa) * e(t), y: ya + (yb - ya) * ey(t)};
    }
  }
  const last = keys[keys.length - 1];
  return {x: last[1], y: last[2]};
};
const easeIn = (t) => t * t * t;

const blur = (page) => page.evaluate(() => document.activeElement && document.activeElement !== document.body && document.activeElement.blur());

/** Un clic : la souris appuie et relâche à l'image i ; le contour de focus de la souris n'apparaît pas */
const click = async (page) => {
  await page.mouse.down();
  await page.mouse.up();
  await blur(page);
};

/**
 * Plan avec une souris : défilement fixe ou glissé (`ys[i]` à null : la page défile seule, comme quand le site amène
 * lui-même la demande prête à l'écran), trajet (à partir de `enter` secondes) et clics aux images données (`clicks`).
 */
const mouseStep = async (site, ctx, i, t) => {
  const y = ctx.ys ? ctx.ys[i] : ctx.y;
  if (y != null) await scrollTo(site.page, y);
  if (t / 1000 < (ctx.enter ?? 0)) return null;
  const p = ctx.pos(t / 1000);
  await site.page.mouse.move(p.x, p.y);
  const on = (ctx.clicks || []).includes(i);
  if (on) await click(site.page);
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

/** Plan sans geste : la page défile seule */
const scrollStep = async (site, ctx, i) => {
  await scrollTo(site.page, ctx.ys ? ctx.ys[i] : ctx.y);
};

/**
 * État de l'ouverture, image par image : le temps (ms) de la transition du rampant de gauche. Le montage et la musique en
 * déduisent les repères : les rampants se tracent de 0 à 1 s, les mots montent de 0,3 à 1,4 s, l'étoile se pose de 0,75
 * à 1,75 s (src/styles.css du site).
 */
const introState = (page) =>
  page.evaluate(() => {
    const el = document.querySelector('.gable__line--l');
    const a = document.getAnimations().find((x) => x.effect?.target === el);
    return {lineT: a ? Number(a.currentTime) : -1};
  });

/**
 * Le dessin des toits : la ligne de toit tracée (sa première animation), l'onglet choisi, et le faîte de la ligne de toit
 * (le plus petit y de ses sept points, dans le dessin : 130 sur la maison, 226 sur le mobile-home, 196 sur le toit plat),
 * qui suit la transformation image par image
 */
const roofsState = (page) =>
  page.evaluate(() => {
    const roof = document.querySelector('[data-roof]');
    const sel = (id) => document.querySelector(id).getAttribute('aria-selected') === 'true';
    const ys = [...roof.getAttribute('d').matchAll(/[ML]\s*([\d.]+)\s+([\d.]+)/g)].map((m) => Number(m[2]));
    return {
      draw: roof.getAnimations().length > 0,
      mobile: sel('#tab-mobile'),
      commercial: sel('#tab-commercial'),
      hot: document.querySelector('#panel-commercial .spots li:nth-child(3)').classList.contains('is-hot'),
      ridge: Math.min(...ys),
    };
  });

/** Les quatre photos de la rangée des chantiers : `jK` quand la photo K se découvre */
const jobState = (page) =>
  page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.job .shot')].map((s, k) => [`j${k + 1}`, s.classList.contains('is-in')])));

const desktop = [
  {
    // 1. L'ouverture, depuis sa première image : le titre est là, sous un toit encore vide ; les deux rampants dorés se
    // tracent des avant-toits au faîte, « Roofing is in our blood » monte les deux pentes, l'étoile du logo se pose au
    // faîte en tournant d'une pointe ; puis l'accueil, immobile
    name: 'd-open',
    seconds: 3.4,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      return {y: 0};
    },
    step: scrollStep,
    watch: introState,
  },
  {
    // 2. Les trois toits : la page arrive sur la partie et le dessin se trace (la ligne de toit des avant-toits au faîte,
    // la maison dessous, les quatre repères un à un) ; la souris choisit « Mobile homes », puis « Commercial » : la ligne
    // de toit s'aplatit et le bâtiment se transforme avec elle ; elle survole enfin « Flashing… » dans la liste du toit
    // plat, et son repère s'allume sur le dessin
    name: 'd-roofs',
    seconds: LEN.Roofs / FPS,
    async setup(site) {
      const page = site.page;
      // à l'arrivée, le texte d'introduction de la partie est encore entier sous l'en-tête, et le bas de l'écran reste
      // au-dessus de la fin de la partie quand elle est la plus courte (le panneau du mobile-home) : la partie sombre qui
      // suit n'apparaît pas en bas de l'écran quand on change de toit
      const y1 = Math.round(await top(page, '#roofs .head p')) - topH(site) - 4;
      const end = await page.evaluate(() => {
        const home = document.querySelector('#panel-home');
        const mob = document.querySelector('#panel-mobile');
        home.hidden = true;
        mob.hidden = false;
        const y = document.querySelector('#storm').getBoundingClientRect().top + scrollY;
        home.hidden = false;
        mob.hidden = true;
        return y;
      });
      if (y1 + site.height >= end) throw new Error(`la partie sombre apparaîtrait en bas de l'écran (${y1 + site.height} ≥ ${end})`);
      // au départ, le dessin est encore sous le seuil où il se trace (35 % de sa hauteur à l'écran)
      const y0 = await beforeReveal(page, '[data-profile]', 30, {threshold: 0.35, bottom: 0});
      await park(site, y0, 900);
      if (await page.evaluate(() => document.querySelector('[data-roof]').getAnimations().length > 0)) throw new Error('le dessin s’est déjà tracé');
      const ys = glideTo({y0, y1, from: 10, v: 6, ramp: 30, frames: LEN.Roofs});
      const yEnd = ys[ys.length - 1];
      const at = (p) => ({x: p.x, y: p.y - yEnd});
      const mobile = at(await docCenter(page, '#tab-mobile'));
      const commercial = at(await docCenter(page, '#tab-commercial'));
      // la 3e ligne de la liste du toit plat, mesurée panneau affiché (puis remis), et le bord droit des panneaux
      const {li, right} = await page.evaluate(() => {
        const home = document.querySelector('#panel-home');
        const com = document.querySelector('#panel-commercial');
        home.hidden = true;
        com.hidden = false;
        const r = com.querySelector('.spots li:nth-child(3)').getBoundingClientRect();
        const box = com.getBoundingClientRect();
        home.hidden = false;
        com.hidden = true;
        return {li: {x: r.left + 190, y: r.top + scrollY + r.height / 2}, right: box.right};
      });
      const spot = at(li);
      const side = right + 66;
      return {
        ys,
        enter: T(3.2),
        pos: path([
          // la souris entre par la gauche, sous les onglets, sans passer sur les repères du dessin
          [T(3.2), 36, 700], [T(4.6), mobile.x - 8, mobile.y + 4], [T(5), mobile.x - 6, mobile.y + 5],
          [T(7.3), mobile.x - 6, mobile.y + 5], [T(8.6), commercial.x - 8, commercial.y + 4], [T(9), commercial.x - 6, commercial.y + 5],
          // puis vers la droite, au-dessus de la liste (x d'abord, y ensuite), et sur la 3e ligne
          [T(10.2), commercial.x - 6, commercial.y + 5], [T(11), side, spot.y, easeOut, easeIn], [T(EVENTS.roofs.hover), spot.x, spot.y],
          [T(13.6), spot.x + 3, spot.y + 1], [T(EVENTS.roofs.leave + 0.6), side + 24, spot.y + 1],
          [T(15.4), side + 30, spot.y + 60],
        ]),
        clicks: [B(EVENTS.roofs.mobile), B(EVENTS.roofs.commercial)],
      };
    },
    step: mouseStep,
    watch: roofsState,
  },
  {
    // 3. Après une tempête : la page entre dans la partie sombre ; les quatre étapes, « 5 days or less », le platelage
    // pourri trouvé sous les bardeaux, qui se découvre à la pente d'un toit, puis les premiers gestes si le toit fuit
    name: 'd-storm',
    seconds: LEN.Storm / FPS,
    async setup(site) {
      const page = site.page;
      const y1 = Math.round(await top(page, '.storm__grid')) - topH(site) - 8;
      const y0 = await beforeReveal(page, '.storm__side .shot', 40);
      await park(site, y0, 900);
      if (await isIn(page, '.storm__side .shot')) throw new Error('la photo de la tempête est déjà découverte');
      return {ys: glideTo({y0, y1, from: 8, v: 3, ramp: 40, frames: LEN.Storm})};
    },
    step: scrollStep,
    watch: (page) => page.evaluate(() => ({wipe: document.querySelector('.storm__side .shot').classList.contains('is-in')})),
  },
  {
    // 4. Réparer, recouvrir, remplacer : la page quitte la partie sombre ; les trois réponses, puis la rangée de leurs
    // chantiers, qui se découvre photo après photo à la pente d'un toit (la dépose, la sous-couche, les bardeaux, le toit
    // fini)
    name: 'd-job',
    seconds: LEN.Job / FPS,
    async setup(site) {
      const page = site.page;
      const y1 = Math.round(await top(page, '#replace .head')) - topH(site) - 30;
      const y0 = Math.min(y1 - 380, await beforeReveal(page, '.job .shot', 30));
      await park(site, y0, 900);
      if (await isIn(page, '.job .shot')) throw new Error('les photos des chantiers sont déjà découvertes');
      return {ys: glideTo({y0, y1, from: 8, v: 2.6, ramp: 36, frames: LEN.Job})};
    },
    step: scrollStep,
    watch: jobState,
  },
  {
    // 5. Les garanties : la page arrive sur la partie ; la photo d'un toit neuf se découvre, puis les trois barres de la
    // règle s'allongent jusqu'à leur durée (10 ans, 20 ans, de 30 ans à vie)
    name: 'd-warranty',
    seconds: LEN.Warranty / FPS,
    async setup(site) {
      const page = site.page;
      // la photo d'un toit neuf est un peu plus haut que le titre : elle arrive à 24 px sous l'en-tête
      const y1 = Math.round(await top(page, '.warranty__top')) - topH(site) - 24;
      const y0 = await beforeReveal(page, '.warranty__top .shot', 30);
      await park(site, y0, 900);
      if (await isIn(page, '[data-ruler]')) throw new Error('la règle est déjà remplie');
      return {ys: glideTo({y0, y1, from: 8, v: 4, ramp: 40, frames: LEN.Warranty})};
    },
    step: scrollStep,
    watch: (page) =>
      page.evaluate(() => ({
        wipe: document.querySelector('.warranty__top .shot').classList.contains('is-in'),
        ruler: document.querySelector('[data-ruler]').classList.contains('is-in'),
      })),
  },
  {
    // 6. La famille : la page arrive sur la partie ; la ligne de 1955 se trace et ses trois dates se posent ; à côté, la
    // licence de l'État en plaque, puis la camionnette où son numéro est peint, qui se découvre
    name: 'd-family',
    seconds: LEN.Family / FPS,
    async setup(site) {
      const page = site.page;
      const y1 = Math.round(await top(page, '#family-t')) - topH(site) - 30;
      const y0 = await beforeReveal(page, '[data-line]', 30);
      await park(site, y0, 900);
      if (await isIn(page, '[data-line]')) throw new Error('la ligne de la famille est déjà tracée');
      return {ys: glideTo({y0, y1, from: 8, v: 2.5, ramp: 36, frames: LEN.Family})};
    },
    step: scrollStep,
    watch: (page) =>
      page.evaluate(() => ({
        line: document.querySelector('[data-line]').classList.contains('is-in'),
        van: document.querySelector('.family__side .shot').classList.contains('is-in'),
      })),
  },
  {
    // 7. L'estimation : l'adresse, le nom, le téléphone et le message sont déjà là ; la souris choisit « A mobile home »,
    // puis « Repair » ; la page descend ; « Write my request » : la demande est prête, et la page l'amène à l'écran
    name: 'd-estimate',
    seconds: LEN.Estimate / FPS,
    async setup(site) {
      const page = site.page;
      await page.fill('#f-address', '1234 Example Rd, Lakeland, FL');
      await page.fill('#f-name', 'Jordan Avery');
      await page.fill('#f-phone', '863-555-0142');
      await page.fill('#f-msg', 'Water stain on the living room ceiling since the last storm, near the vent.');
      await blur(page);
      const y0 = Math.round(await top(page, '#estimate')) - topH(site) + 40;
      await park(site, y0, 900);
      const kind = await centerOf(page, '.chips label:has(input[value="Mobile home"])');
      const need = await centerOf(page, '.chips label:has(input[value="Roof repair"])');
      // le bouton : la page descend juste assez pour qu'il arrive à 170 px du bas de l'écran
      const go = await centerOf(page, '.form__go .btn');
      const dy = Math.max(120, Math.round(go.y - site.height + 170));
      go.y -= dy;
      const ys = glideTo({y0, y1: y0 + dy, from: B(4.4), v: 3, ramp: 24, frames: LEN.Estimate});
      // après le clic sur le bouton, la page défile seule : le site amène la demande prête à l'écran
      for (let i = B(EVENTS.estimate.go); i < ys.length; i++) ys[i] = null;
      const {kind: k, need: n, go: g} = EVENTS.estimate;
      return {
        ys,
        enter: T(0.6),
        pos: path([
          [T(0.6), 1428, 700], [T(k - 0.2), kind.x, kind.y + 2], [T(k), kind.x + 3, kind.y + 3],
          [T(k + 0.4), kind.x + 3, kind.y + 3], [T(n - 0.2), need.x, need.y + 2], [T(n), need.x + 3, need.y + 3],
          // pendant que la page descend, la souris attend à droite du formulaire (rien n'est survolé)
          [T(n + 0.5), need.x + 3, need.y + 3], [T(n + 1.3), 1428, 520],
          [T(g - 1.4), 1428, 520], [T(g - 0.2), go.x, go.y + 2], [T(g), go.x + 3, go.y + 3],
          [T(g + 0.6), go.x + 3, go.y + 3], [T(g + 1.6), 1428, 600],
        ]),
        clicks: [B(k), B(n), B(g)],
      };
    },
    step: mouseStep,
    watch: (page) =>
      page.evaluate(() => ({
        kind: document.querySelector('input[value="Mobile home"]').checked,
        need: document.querySelector('input[value="Roof repair"]').checked,
        hover: document.querySelector('.form__go .btn').matches(':hover'),
        ready: !document.querySelector('[data-ready]').hidden,
      })),
  },
];

const mobile = [
  {
    // l'ouverture au téléphone : le titre, puis le toit de mots et l'étoile
    name: 'm-open',
    seconds: 3.4,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      return {y: 0};
    },
    step: touchStep,
    watch: introState,
  },
  {
    // les trois toits au téléphone : la page arrive sur les onglets, le dessin se trace ; le pouce choisit « Commercial »
    name: 'm-roofs',
    seconds: LEN.Mobile / FPS,
    async setup(site) {
      const page = site.page;
      const y1 = Math.round(await top(page, '[data-tabs]')) - topH(site) - 14;
      const y0 = await beforeReveal(page, '[data-profile]', 20, {threshold: 0.35, bottom: 0});
      await park(site, y0, 900);
      if (await page.evaluate(() => document.querySelector('[data-roof]').getAnimations().length > 0)) throw new Error('le dessin s’est déjà tracé');
      const ys = glideTo({y0, y1, from: 56, v: 6, ramp: 36, frames: LEN.Mobile});
      const tab = await docCenter(page, '#tab-commercial');
      tab.y -= ys[ys.length - 1];
      return {ys, taps: [[B(EVENTS.mobile.commercial), tab]]};
    },
    step: touchStep,
    watch: roofsState,
  },
  {
    // la rangée des chantiers au téléphone : la page arrive sur la rangée (les deux premières photos se découvrent), puis
    // le pouce la fait défiler d'un geste : la troisième et la quatrième photo se découvrent en arrivant
    name: 'm-job',
    seconds: LEN.Mobile / FPS,
    async setup(site) {
      const page = site.page;
      const y1 = Math.round(await top(page, '.job')) - 300;
      const y0 = await beforeReveal(page, '.job .shot', 30);
      await park(site, y0, 900);
      if (await isIn(page, '.job .shot')) throw new Error('les photos des chantiers sont déjà découvertes');
      const ys = glideTo({y0, y1, from: 50, v: 5, ramp: 36, frames: LEN.Mobile});
      // le geste : la rangée défile jusqu'à la troisième photo, calée sur sa place (son point d'accroche) ; l'accroche
      // du navigateur est coupée pendant le geste (chaque pas la ramènerait en arrière), la rangée s'arrête sur elle
      const {snap, mid} = await page.evaluate(() => {
        const job = document.querySelector('.job');
        job.style.scrollSnapType = 'none';
        const pad = parseFloat(getComputedStyle(job).scrollPaddingLeft) || 0;
        const li = job.children[2].getBoundingClientRect();
        const img = job.querySelector('img').getBoundingClientRect();
        return {snap: Math.round(li.left - job.getBoundingClientRect().left + job.scrollLeft - pad), mid: img.top + scrollY + img.height / 2};
      });
      // le doigt tire la rangée d'un coup bref (elle le suit), la lâche, et son élan s'éteint sur près d'une seconde
      const S = B(EVENTS.mobile.swipe);
      const frames = LEN.Mobile;
      const DOWN = 56;
      let xs = null;
      for (let v = 10; v <= 20 && !xs; v += 0.05) {
        const cand = glideTo({y0: 0, y1: snap, from: S, v, ramp: 8, down: DOWN, frames});
        if (cand[frames - 1] === snap && cand.indexOf(snap) - S <= 8 + 6 + DOWN) xs = cand;
      }
      if (!xs) throw new Error('geste introuvable vers ' + snap);
      // le doigt se lève quand la rangée commence à ralentir
      const R = xs.indexOf(snap) - DOWN;
      const y = mid - ys[ys.length - 1];
      const finger = (i) => ({x: 300 - (xs[i] - xs[S]), y: y + (xs[i] - xs[S]) * 0.06});
      console.log(`  m-job : la rangée défile de 0 à ${snap} px (arrêt à l'image ${xs.indexOf(snap)}), le doigt tire ${xs[R] - xs[S]} px en ${R - S} images`);
      return {ys, xs, S, R, finger};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
      await site.page.evaluate((x) => {
        const job = document.querySelector('.job');
        if (job.scrollLeft !== x) {
          job.scrollLeft = x;
          job.dispatchEvent(new Event('scroll'));
        }
      }, ctx.xs[i]);
      if (i < ctx.S || i > ctx.R) return null;
      return {mouse: ctx.finger(i), mark: i === ctx.S ? 'hold' : i === ctx.R ? 'release' : undefined};
    },
    watch: jobState,
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
      // l'ouverture du site se joue avant le plan (1,8 s)
      await settle(site.page, 2200);
    }
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t), watch: shot.watch, probe});
    await site.browser.close();
  }
}
