// Plans filmés du nouveau site de Skoda Construction pour la vidéo de présentation 16:9 (image par image, temps simulé).
// Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …] [--probe]
//
// Contre les saccades : Chrome arrondit le défilement au pixel entier. Chaque plan défile donc par pas entiers qui ne
// changent que progressivement (1, 1, 2, 2, 3… puis constants), et la vidéo lit toujours les plans à vitesse 1 :
// aucune image sautée ni doublée.
// Les clics tombent sur des temps de la musique (100 BPM : un temps = 36 images), voir EVENTS dans src/beats.ts.
import {openSite, record, scrollTo, settle, top, sine, easeInOut} from './lib.mjs';
import {EVENTS, BEAT, SCENE_BEATS} from '../src/beats.ts';

const FPS = 60;
const DESK = {width: 1440, height: 900, dsf: 2};
// La hauteur du téléphone sans sa barre d'état (844 − 47 px) : la page entière reste à l'écran
const MOBILE = {width: 390, height: 797, dsf: 2, mobile: true};
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

const innerHeightOf = (site) => site.height;

const blur = (page) => page.evaluate(() => document.activeElement && document.activeElement !== document.body && document.activeElement.blur());

/** Un clic : la souris appuie et relâche à l'image i ; le contour de focus de la souris n'apparaît pas (sauf `keep`) */
const click = async (page, keep = false) => {
  await page.mouse.down();
  await page.mouse.up();
  if (!keep) await blur(page);
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
  if (on) await click(site.page, ctx.keepFocus);
  return {mouse: p, click: on};
};

/** Plan au doigt : défilement de la page seulement */
const touchStep = async (site, ctx, i) => {
  await scrollTo(site.page, ctx.ys ? ctx.ys[i] : ctx.y);
  return null;
};

/**
 * État de l'ouverture, image par image : le temps (ms) de la transition de la première lettre du nom, et de celle de la
 * première photo. Le montage et la musique en déduisent les repères : chaque lettre monte 0,06 s après la précédente
 * (de 0,1 à 1,34 s), la photo entre de 0,55 à 1,65 s (src/styles.css du site).
 */
const introState = (page) =>
  page.evaluate(() => {
    const at = (sel) => {
      const el = document.querySelector(sel);
      const a = el && document.getAnimations().find((x) => x.effect?.target === el);
      return a ? Number(a.currentTime) : -1;
    };
    return {nameT: at('.name__word > span:nth-child(1)'), photoT: at('.flow__i--1')};
  });

/** Les photos de l'accueil qui passent devant le nom : repère `pK` quand le haut de la photo K croise le milieu du nom */
const nameState = (page) =>
  page.evaluate(() => {
    const n = document.querySelector('.name').getBoundingClientRect();
    const mid = n.top + n.height / 2;
    const out = {nameTop: n.top};
    document.querySelectorAll('.flow__i').forEach((li, k) => {
      out[`p${k + 1}`] = li.querySelector('img').getBoundingClientRect().top <= mid;
    });
    out.claim = document.querySelector('.hero__claim').getBoundingClientRect().bottom < innerHeight - 40;
    return out;
  });

/** La maison restaurée : l'étape affichée (0, 1, 2) et l'avancement du défilement épinglé (0 à 1) */
const storyState = (page) =>
  page.evaluate(() => {
    const steps = [...document.querySelectorAll('.story__step')];
    const on = steps.findIndex((s) => s.classList.contains('is-on'));
    const p = Number(document.querySelector('[data-story]').style.getPropertyValue('--p')) || 0;
    return {step: on, p, s1: on >= 0, s2: on >= 1, s3: on >= 2};
  });

const desktop = [
  {
    // 1. L'ouverture, depuis sa première image : le titre est là, les cinq lettres du nom montent une à une derrière
    // leur ligne de base, puis la première photo (le terrain nu) entre par le bas ; puis l'accueil, immobile
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
    // 2. Un Skoda derrière chaque chantier : la page descend dans l'accueil ; le nom reste épinglé au milieu de l'écran
    // et leurs chantiers passent devant lui, jusqu'à « All our jobs are owner supervised. »
    name: 'd-name',
    seconds: LEN.Name / FPS,
    async setup(site) {
      const page = site.page;
      const y1 = await page.evaluate(() => {
        const e = document.querySelector('.hero__end');
        const r = e.getBoundingClientRect();
        return Math.round(r.top + scrollY + r.height + 48 - innerHeight);
      });
      await park(site, 0, 600);
      return {ys: glideTo({y0: 0, y1, from: 18, v: 6, ramp: 40, frames: LEN.Name})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
    watch: nameState,
  },
  {
    // 3. Les maisons neuves : le texte reste en place à gauche ; à droite, sous le terrain, la coque et la maison finie
    // se découvrent l'une après l'autre en arrivant à l'écran
    name: 'd-homes',
    seconds: LEN.Homes / FPS,
    async setup(site) {
      const page = site.page;
      const y0 = Math.round(await top(page, '#homes')) - 76;
      const y1 = await page.evaluate(() => {
        const s = [...document.querySelectorAll('.steps__i')].pop().getBoundingClientRect();
        return Math.round(s.top + scrollY + s.height + 40 - innerHeight);
      });
      await park(site, y0, 900);
      // le terrain est déjà découvert en arrivant (il est en haut de la partie) ; la coque et la maison se découvrent pendant le plan
      if (await page.evaluate(() => document.querySelectorAll('.steps__i')[1].classList.contains('is-in'))) throw new Error('la deuxième étape est déjà découverte');
      return {ys: glideTo({y0, y1, from: 10, v: 5, ramp: 30, frames: LEN.Homes})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
    watch: (page) =>
      page.evaluate(() => {
        const s = [...document.querySelectorAll('.steps__i')].map((e) => e.classList.contains('is-in'));
        return {s1: s[0], s2: s[1], s3: s[2]};
      }),
  },
  {
    // 4. Les pièces : la page descend des six métiers aux photos ; la souris ouvre la cuisine à l'îlot de pierre dans la
    // visionneuse (sur un temps), puis passe deux fois à la photo suivante
    name: 'd-rooms',
    seconds: LEN.Rooms / FPS,
    async setup(site) {
      const page = site.page;
      const y0 = Math.round(await top(page, '#remodels')) - 76;
      const y1 = Math.round(await top(page, '.rooms__grid')) - 76 - 128;
      // le bouton « Next photo » de la visionneuse ouverte (mesuré visionneuse ouverte, puis refermée)
      const next = await page.evaluate(() => {
        const v = document.querySelector('[data-viewer]');
        v.showModal();
        const r = v.querySelector('[data-next]').getBoundingClientRect();
        v.close();
        return {x: r.left + r.width / 2, y: r.top + r.height / 2};
      });
      await blur(page);
      await park(site, y0, 900);
      // la photo à son arrivée : sa place au départ, moins le défilement
      const photo = await centerOf(page, '.rooms__grid li:nth-child(2) .ph');
      photo.y -= y1 - y0;
      const t = (beats) => (beats * BEAT) / FPS;
      return {
        ys: glideTo({y0, y1, from: 12, v: 5, ramp: 30, frames: LEN.Rooms}),
        enter: t(3),
        pos: path([
          [t(3), 1428, 640], [t(4.6), photo.x + 40, photo.y + 30], [t(5), photo.x + 42, photo.y + 32],
          [t(5.25), photo.x + 42, photo.y + 32], [t(6.6), next.x + 2, next.y + 2], [t(7), next.x + 3, next.y + 3],
          [t(10), next.x + 3, next.y + 3],
        ]),
        clicks: [B(EVENTS.rooms.open), B(EVENTS.rooms.next), B(EVENTS.rooms.next2)],
        // le clic garde le focus : la visionneuse le met sur son bouton, et le rend à la photo en se fermant
        keepFocus: true,
      };
    },
    async step(site, ctx, i, t) {
      const out = await mouseStep(site, ctx, i, t);
      // la grande photo chargée et décodée avant l'image suivante : son fondu part de l'image du clic, sans trou
      if (out?.click) await site.page.evaluate(() => document.querySelector('[data-viewer-img]').decode().catch(() => null));
      return out;
    },
    watch: (page) =>
      page.evaluate(() => {
        const v = document.querySelector('[data-viewer]');
        const count = v.querySelector('[data-viewer-count]').textContent;
        return {open: v.open, second: count.startsWith('3 '), third: count.startsWith('4 ')};
      }),
  },
  {
    // 5. Better than new : la page descend de l'entrée de la partie à travers l'histoire épinglée, à vitesse constante ;
    // la maison passe de novembre 2022 au séchage (sur un temps), puis à décembre 2023
    name: 'd-story',
    seconds: LEN.Story / FPS,
    async setup(site) {
      const page = site.page;
      const y0 = Math.round(await top(page, '#restoration')) - 76;
      const {start, run} = await page.evaluate(() => {
        const s = document.querySelector('[data-story]');
        const topH = document.querySelector('[data-top]').offsetHeight;
        return {start: s.getBoundingClientRect().top + scrollY - topH, run: s.offsetHeight - (innerHeight - topH)};
      });
      const y1 = Math.round(start + run * 0.97);
      await park(site, y0, 900);
      // le départ du défilement : le séchage (p = 0,34) commence sur le temps EVENTS.story.second
      const target = B(EVENTS.story.second);
      let best = null;
      for (let from = 0; from < 120; from++) {
        const ys = glideTo({y0, y1, from, v: 6, ramp: 36, frames: LEN.Story});
        const k = ys.findIndex((y) => (y - start) / run >= 0.34);
        if (!best || Math.abs(k - target) < Math.abs(best.k - target)) best = {from, ys, k};
      }
      console.log(`  d-story : départ à l'image ${best.from}, séchage à l'image ${best.k} (cible ${target}), arrivée p = ${((best.ys[LEN.Story - 1] - start) / run).toFixed(3)}`);
      return {ys: best.ys};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
    watch: storyState,
  },
  {
    // 6. La famille : la page arrive sur la partie ; la ligne des dates se trace (1950, 1985, 2014, 2023), puis Chris et
    // Mike
    name: 'd-family',
    seconds: LEN.Family / FPS,
    async setup(site) {
      const page = site.page;
      // au départ, la frise est encore sous le seuil où elle se trace (82 % de la hauteur de l'écran)
      const y0 = Math.round((await top(page, '.years')) - 900 * 0.86);
      const y1 = Math.round((await top(page, '.person')) - 76 - 210);
      await park(site, y0, 900);
      if (await page.evaluate(() => document.querySelector('.years').classList.contains('is-in'))) throw new Error('la frise est déjà tracée');
      return {ys: glideTo({y0, y1, from: 8, v: 4, ramp: 40, frames: LEN.Family})};
    },
    async step(site, ctx, i) {
      await scrollTo(site.page, ctx.ys[i]);
    },
    watch: (page) =>
      page.evaluate(() => {
        const y = document.querySelector('.years');
        const m = getComputedStyle(y, '::after').transform;
        const line = m && m !== 'none' ? Number(m.slice(7).split(',')[0]) : 1;
        return {drawn: y.classList.contains('is-in'), line};
      }),
  },
  {
    // 7. La consultation : la ville, le nom, le téléphone et le message sont déjà là ; la souris choisit « A new home »
    // (les fourchettes de budget de leur site apparaissent), puis « $1 million to $5 million » ; la page descend ;
    // « Write my email to Skoda » : la demande est prête, et la page l'amène à l'écran
    name: 'd-consult',
    seconds: LEN.Consult / FPS,
    async setup(site) {
      const page = site.page;
      await page.fill('#f-where', 'Naples');
      await page.fill('#f-name', 'Jordan Avery');
      await page.fill('#f-phone', '(239) 555-0142');
      await page.fill('#f-msg', 'A four-bedroom home with a pool, on a lot we own in Naples.');
      await blur(page);
      const y0 = Math.round(await top(page, '#consultation')) - 76 + 40;
      await park(site, y0, 900);
      const home = await centerOf(page, '.chips label:has(input[value="New custom home"])');
      // les fourchettes apparaissent sous le choix du projet : la première est mesurée une fois affichée, puis on revient
      const budget = await page.evaluate(() => {
        const box = document.querySelector('[data-budget]');
        const list = box.querySelector('[data-budget-list]');
        box.hidden = false;
        list.innerHTML = '<label><input type="radio" name="budget" value="x"><span>$1 million to $5 million</span></label>';
        const r = list.querySelector('label').getBoundingClientRect();
        box.hidden = true;
        list.innerHTML = '';
        return {x: r.left + r.width / 2, y: r.top + r.height / 2};
      });
      // le bouton, une fois les fourchettes affichées (mesuré dans le même état, puis remis) ; la page descend juste assez
      // pour qu'il arrive à 170 px du bas de l'écran
      const go = await page.evaluate(() => {
        const box = document.querySelector('[data-budget]');
        box.hidden = false;
        box.querySelector('[data-budget-list]').innerHTML = '<label><input type="radio" name="budget" value="x"><span>$1 million to $5 million</span></label><label><input type="radio" value="y"><span>$5 million to $10 million</span></label><label><input type="radio" value="z"><span>$10 million or more</span></label><label><input type="radio" value="w"><span>Not sure yet</span></label>';
        const r = document.querySelector('.form__go .btn').getBoundingClientRect();
        box.hidden = true;
        box.querySelector('[data-budget-list]').innerHTML = '';
        return {x: r.left + r.width / 2, y: r.top + r.height / 2};
      });
      const dy = Math.max(120, Math.round(go.y - innerHeightOf(site) + 170));
      go.y -= dy;
      const ys = glideTo({y0, y1: y0 + dy, from: B(4.4), v: 3, ramp: 24, frames: LEN.Consult});
      // après le clic sur le bouton, la page défile seule : le site amène la demande prête à l'écran
      for (let i = B(EVENTS.consult.go); i < ys.length; i++) ys[i] = null;
      const t = (beats) => (beats * BEAT) / FPS;
      return {
        ys,
        enter: t(0.6),
        pos: path([
          [t(0.6), 1428, 700], [t(1.8), home.x, home.y + 2], [t(2), home.x + 3, home.y + 3],
          [t(2.4), home.x + 3, home.y + 3], [t(3.3), budget.x, budget.y + 2], [t(3.5), budget.x + 3, budget.y + 3],
          // pendant que la page descend, la souris attend à droite du formulaire (rien n'est survolé)
          [t(4), budget.x + 3, budget.y + 3], [t(4.8), 1428, 520],
          [t(6.6), 1428, 520], [t(7.8), go.x, go.y + 2], [t(8), go.x + 3, go.y + 3],
          [t(8.6), go.x + 3, go.y + 3], [t(9.6), 1428, 600],
        ]),
        clicks: [B(EVENTS.consult.home), B(EVENTS.consult.budget), B(EVENTS.consult.go)],
      };
    },
    step: mouseStep,
    watch: (page) =>
      page.evaluate(() => ({
        home: document.querySelector('input[value="New custom home"]').checked,
        budgets: !document.querySelector('[data-budget]').hidden,
        budget: Boolean(document.querySelector('input[name="budget"]:checked')),
        ready: !document.querySelector('[data-ready]').hidden,
      })),
  },
];

const mobile = [
  {
    // l'ouverture au téléphone : le titre, puis les lettres du nom qui montent et la première photo
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
    // le nom au téléphone : il reste au milieu de l'écran, les chantiers passent devant lui un par un
    name: 'm-name',
    seconds: LEN.Mobile / FPS,
    async setup(site) {
      const page = site.page;
      const y0 = Math.round(await top(page, '.name')) - 64 - 330;
      await park(site, y0, 900);
      return {ys: glide({y0, from: 12, v: 6, ramp: 40, frames: LEN.Mobile})};
    },
    step: touchStep,
    watch: nameState,
  },
  {
    // la maison restaurée au téléphone : les trois étapes, l'une sous l'autre, sur le fond sombre
    name: 'm-story',
    seconds: LEN.Mobile / FPS,
    async setup(site) {
      const page = site.page;
      const y0 = Math.round(await top(page, '.story__step')) - 64 - 16;
      await park(site, y0, 900);
      return {ys: glide({y0, from: 16, v: 5, ramp: 40, frames: LEN.Mobile})};
    },
    step: touchStep,
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
