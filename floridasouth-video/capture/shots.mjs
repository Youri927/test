// Plans filmés du nouveau site de Florida South Construction pour la vidéo de présentation 16:9 (image par image, temps
// simulé). Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …] [--probe]
//
// Contre les saccades : Chrome arrondit le défilement au pixel entier. Chaque plan défile donc par pas entiers qui ne
// changent que progressivement (1, 1, 2, 2, 3… puis constants), et la vidéo lit toujours les plans à vitesse 1 :
// aucune image sautée ni doublée.
// Les gestes tombent sur des temps de la musique (112,5 BPM : un temps = 32 images), voir EVENTS dans src/beats.ts.
import {openSite, record, scrollTo, settle, top, until, sine, easeInOut, easeOut} from './lib.mjs';
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
const topH = (site) => (site.width > 700 ? 76 : 62);

/** Toutes les photos chargées et décodées tout de suite (le site les charge à l'approche) : aucune image vide à l'écran */
const prime = (page) =>
  page.evaluate(async () => {
    for (const img of document.images) img.loading = 'eager';
    await Promise.all([...document.images].map((i) => i.decode().catch(() => null)));
  });

/** Rectangle (px du viewport) du premier élément visible qui correspond */
const rectOf = (page, sel) =>
  page.evaluate((sel) => {
    const el = [...document.querySelectorAll(sel)].find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (!el) throw new Error('cible introuvable : ' + sel);
    const r = el.getBoundingClientRect();
    return {x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2};
  }, sel);

/** Place la page à y en y descendant (les cadres plus haut se sont ouverts en passant), puis laisse passer un peu de temps */
const park = async (site, y, ms = 1000) => {
  const page = site.page;
  for (let v = 0; v < y - 300; v += 400) {
    await scrollTo(page, v);
    await settle(page, 60);
  }
  await scrollTo(page, y - 150);
  await settle(page, 200);
  await scrollTo(page, y);
  await settle(page, ms);
};

/**
 * Défilement par pas entiers : position à chaque image du plan.
 * Le défilement part à l'image `from`, accélère sur `ramp` images (1, 1, 2, 2, 3… px), roule à `v` px par image,
 * et freine de même sur ses `down` dernières images s'il a une fin (`to`, image d'arrêt).
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

/** Image où un défilement s'arrête (la dernière image où la position change) */
const stopOf = (ys) => {
  let k = ys.length - 1;
  while (k > 0 && ys[k - 1] === ys[k]) k--;
  return k;
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

/** Un clic : la souris appuie et relâche à l'image i ; le contour de focus de la souris n'apparaît pas (sauf `keep`) */
const click = async (page, keep = false) => {
  await page.mouse.down();
  await page.mouse.up();
  if (!keep) await blur(page);
};

/** La visionneuse a fini de décoder la photo (en temps réel) et lancé son ouverture depuis la vignette */
const opened = (page) => until(page, () => document.querySelector('[data-viewer]').open && document.querySelector('[data-vimg]').style.opacity === '');

/**
 * Plan avec une souris : défilement fixe ou glissé (`ys[i]` à null : la page défile seule, comme quand le site amène
 * lui-même la demande prête à l'écran), trajet (à partir de `enter` secondes) et clics aux images données (`clicks`).
 * `onClick(i)` : ce qui suit un clic (attendre la visionneuse, garder le focus du champ).
 */
const mouseStep = async (site, ctx, i, t) => {
  const y = ctx.ys ? ctx.ys[i] : ctx.y;
  if (y != null) await scrollTo(site.page, y);
  if (ctx.keys?.[i]) await ctx.keys[i](site.page);
  if (t / 1000 < (ctx.enter ?? 0)) return ctx.extra ? {after: () => ctx.extra(site.page, i)} : null;
  const p = ctx.pos(t / 1000);
  await site.page.mouse.move(p.x, p.y);
  const on = (ctx.clicks || []).includes(i);
  if (on) {
    await click(site.page, ctx.keep?.includes(i));
    if (ctx.onClick) await ctx.onClick(site.page, i);
  }
  return {mouse: p, click: on, after: ctx.extra ? () => ctx.extra(site.page, i) : undefined};
};

/** Plan sans geste : la page défile seule */
const scrollStep = async (site, ctx, i) => {
  await scrollTo(site.page, ctx.ys ? ctx.ys[i] : ctx.y);
};

/* ——— relevés image par image ——— */

/** L'ouverture : `s1` à `s5` quand chaque ligne se barre, `done` quand « Consider it done. » commence à s'écrire */
const introState = (page) =>
  page.evaluate(() => {
    const o = {};
    [...document.querySelectorAll('[data-todo] li')].forEach((li, k) => (o[`s${k + 1}`] = li.classList.contains('is-struck') || li.parentElement.classList.contains('is-done')));
    o.done = document.querySelector('[data-done]').classList.contains('is-in');
    return o;
  });

/** L'ouverture des cadres (--c, de 1 fermé à 0 ouvert), image par image */
const frameState = (sels) => (page) =>
  page.evaluate((sels) => Object.fromEntries(Object.entries(sels).map(([k, s]) => [k, Number(document.querySelector(s).style.getPropertyValue('--c') || 0)])), sels);

/** La visionneuse : `open` quand elle s'ouvre, `n2` quand la deuxième photo y est, `closed` quand elle s'est refermée */
const viewerState = (page) =>
  page.evaluate(() => {
    const v = document.querySelector('[data-viewer]');
    const count = document.querySelector('[data-vcount]').textContent;
    window.__wasOpen ||= v.open;
    return {open: v.open, n2: v.open && count.startsWith('2 of'), closed: window.__wasOpen && !v.open};
  });

/** Le point d'insertion du champ « Your list », en px du viewport (null s'il n'a pas le focus) */
const caretOf = (page) =>
  page.evaluate(() => {
    const ta = document.querySelector('#f-list');
    if (document.activeElement !== ta) return null;
    const cs = getComputedStyle(ta);
    const lh = parseFloat(cs.lineHeight);
    const before = ta.value.slice(0, ta.selectionEnd).split('\n');
    const line = before[before.length - 1];
    const c = (window.__cv ||= document.createElement('canvas')).getContext('2d');
    c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const r = ta.getBoundingClientRect();
    const fs = parseFloat(cs.fontSize);
    const h = Math.round(fs * 1.3);
    const x = r.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft) + c.measureText(line).width;
    const y = r.top + parseFloat(cs.borderTopWidth) + parseFloat(cs.paddingTop) + (before.length - 1) * lh - ta.scrollTop + (lh - h) / 2;
    return {x: Math.round(x * 4) / 4, y: Math.round(y * 4) / 4, h, typing: window.__typed || 0};
  });

/* ——— la liste tapée dans « Your list » : trois lignes, une tous les EVENTS.estimate.every temps ——— */
const LIST = ['Fix the screen door.', 'Paint the guest room.', 'Price a new kitchen.'];
/** Les frappes : {image: action}. Trois images par lettre, un peu plus après une espace (les mots se tapent d'un trait),
 *  et la touche Entrée juste avant la ligne suivante */
const typing = () => {
  const keys = {};
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const {lines, every} = EVENTS.estimate;
  LIST.forEach((line, k) => {
    let f = B(lines + k * every);
    if (k > 0) keys[f - 4] = async (page) => { await page.keyboard.press('Enter'); await page.evaluate(() => (window.__typed = (window.__typed || 0) + 1)); };
    let last = f;
    for (const ch of line) {
      const at = (last = f);
      keys[at] = async (page) => {
        await page.keyboard.type(ch);
        await page.evaluate(() => (window.__typed = (window.__typed || 0) + 1));
      };
      f += ch === ' ' ? 5 + Math.round(rnd() * 2) : 2 + Math.round(rnd() * 2);
    }
    const next = B(lines + (k + 1) * every) - 4;
    if (k < LIST.length - 1 && last >= next - 2) throw new Error(`la ligne ${k + 1} déborde sur la suivante (${last} ≥ ${next - 2})`);
  });
  return keys;
};

const desktop = [
  {
    // 1. L'ouverture, depuis sa première image : « Give us your list. » et les cinq lignes, du trou à reboucher à la
    // maison à construire ; elles se barrent l'une après l'autre, puis « Consider it done. » s'écrit dans le même sens
    name: 'd-open',
    seconds: 3.5,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      return {y: 0};
    },
    step: scrollStep,
    watch: introState,
  },
  {
    // 2. Ce qu'ils font : la page arrive sur « No job is too small. » ; les trois rangées passent, et chaque cadre s'ouvre
    // à la mesure du chantier : l'étrier un peu, l'ossature davantage, puis la maison jusqu'aux bords de l'écran
    name: 'd-work',
    seconds: 512 / FPS,
    async setup(site) {
      const page = site.page;
      // au départ, le titre de la partie est au milieu de l'écran et le premier cadre encore presque fermé
      const y0 = Math.round(await top(page, '.work__head')) - 520;
      // à l'arrivée, le haut de la photo de la maison est à 26 px sous l'en-tête : le cadre est grand ouvert
      const y1 = Math.round(await top(page, '[data-bleed] .frame')) - topH(site) - 26;
      await park(site, y0, 900);
      const ys = glideTo({y0, y1, from: 16, v: 5, ramp: 44, frames: LEN.Work});
      console.log(`  d-work : de ${y0} à ${ys[ys.length - 1]} (visé ${y1}), arrêt à l'image ${stopOf(ys)}`);
      return {ys};
    },
    step: scrollStep,
    watch: frameState({small: '.scale--s .frame', mid: '.scale--m .frame', house: '[data-bleed] .frame'}),
  },
  {
    // 3. Les deux maisons : la page arrive sur la mosaïque de la maison sur pilotis, ses photos s'ouvrent ; la souris
    // clique la photo des débords blancs : elle grandit depuis sa vignette dans la visionneuse ; « Next photo » : le
    // panneau du chantier, « Another Quality Home » ; « Close » : la photo retourne à sa place
    name: 'd-houses',
    seconds: LEN.Houses / FPS,
    async setup(site) {
      const page = site.page;
      const y1 = Math.round(await top(page, '#house-raised')) - 104;
      const y0 = y1 - 420;
      await park(site, y0, 900);
      const ys = glideTo({y0, y1, from: 10, v: 4, ramp: 36, frames: LEN.Houses});
      const yEnd = ys[ys.length - 1];
      // la photo, et les boutons de la visionneuse (mesurés visionneuse affichée, puis refermée)
      const eaves = await page.evaluate((yEnd) => {
        const r = document.querySelector('.m-eaves .ph').getBoundingClientRect();
        return {x: r.left + r.width * 0.56, y: r.top + scrollY - yEnd + r.height * 0.52};
      }, yEnd);
      const btn = await page.evaluate(() => {
        const v = document.querySelector('[data-viewer]');
        document.querySelector('[data-vcap]').textContent = 'White eaves and gutters over the front porch.';
        document.querySelector('[data-vwhere]').textContent = 'The raised house, 2015';
        document.querySelector('[data-vcount]').textContent = '1 of 15';
        v.show();
        const c = (s) => {
          const r = document.querySelector(s).getBoundingClientRect();
          return {x: r.left + r.width / 2, y: r.top + r.height / 2};
        };
        const out = {next: c('[data-vnext]'), close: c('[data-vclose]')};
        v.close();
        return out;
      });
      const {open, next, close} = EVENTS.houses;
      console.log(`  d-houses : de ${y0} à ${yEnd} (arrêt à l'image ${stopOf(ys)}), photo ${Math.round(eaves.x)},${Math.round(eaves.y)}`);
      return {
        ys,
        enter: T(3.2),
        pos: path([
          // la souris entre par la droite, sous la rangée des photos, et monte sur la photo des débords
          [T(3.2), 1430, 860], [T(5.6), eaves.x - 6, eaves.y + 4], [T(open), eaves.x - 4, eaves.y + 5],
          // la visionneuse ouverte : la souris descend vers la barre, sur « Next photo »
          [T(open + 1.6), eaves.x - 4, eaves.y + 5], [T(next - 0.25), btn.next.x - 2, btn.next.y + 2, easeInOut, easeOut], [T(next), btn.next.x - 1, btn.next.y + 3],
          // puis sur « Close »
          [T(next + 1.7), btn.next.x - 1, btn.next.y + 3], [T(close - 0.25), btn.close.x - 2, btn.close.y + 2], [T(close), btn.close.x - 1, btn.close.y + 3],
          // la photo revenue à sa place, la souris s'écarte vers le bas
          [T(close + 0.9), btn.close.x - 1, btn.close.y + 3], [T(close + 2.2), btn.close.x - 60, 880],
        ]),
        clicks: [B(open), B(next), B(close)],
        onClick: async (page, i) => {
          if (i === B(open)) await opened(page);
        },
      };
    },
    step: mouseStep,
    watch: viewerState,
  },
  {
    // 4. Judson : la page arrive sur la partie ; son portrait s'ouvre, son nom, sa phrase ; puis la photo avec un membre
    // de l'équipe, les trois engagements, et la carte de la licence de l'État
    name: 'd-judson',
    seconds: LEN.Judson / FPS,
    async setup(site) {
      const page = site.page;
      const y0 = Math.round(await top(page, '.judson__portrait img')) - 640;
      // à l'arrivée, la carte de la licence est au milieu du stuc ; la légende de la photo de l'équipe, juste au-dessus,
      // est entièrement passée sous l'en-tête (pas de jambages de lettres qui dépassent)
      const cap = await page.evaluate(() => {
        const r = document.querySelector('.judson__team figcaption').getBoundingClientRect();
        return r.bottom + scrollY;
      });
      const y1 = Math.max(Math.round(await top(page, '.license')) - topH(site) - 120, Math.ceil(cap) - topH(site) + 6);
      await park(site, y0, 900);
      const ys = glideTo({y0, y1, from: 12, v: 5, ramp: 44, frames: LEN.Judson});
      console.log(`  d-judson : de ${y0} à ${ys[ys.length - 1]} (visé ${y1}), arrêt à l'image ${stopOf(ys)}`);
      return {ys};
    },
    step: scrollStep,
    watch: async (page) => ({...(await frameState({portrait: '.judson__portrait img', team: '.judson__team img'})(page)), y: await page.evaluate(() => window.scrollY)}),
  },
  {
    // 5. Les avis : la page arrive sur « What clients say » ; l'avis de Carol F. se lit mot à mot, du gris à l'encre
    name: 'd-reviews',
    seconds: LEN.Reviews / FPS,
    async setup(site) {
      const page = site.page;
      // au départ, le haut de la citation est juste sous les 90 % de l'écran (rien n'est lu) ; à l'arrivée, son dernier
      // mot vient de s'allumer (son bas aux trois quarts de l'écran)
      const q = await page.evaluate(() => {
        const r = document.querySelector('.quote--a').getBoundingClientRect();
        return {top: r.top + scrollY, h: r.height};
      });
      const y0 = Math.floor(q.top - site.height * 0.9) - 6;
      const y1 = Math.ceil(q.top - (site.height * 0.74 - q.h)) + 4;
      await park(site, y0, 900);
      if (!(await page.evaluate(() => document.querySelectorAll('.quote .w').length))) throw new Error('les avis ne sont pas découpés en mots');
      const ys = glideTo({y0, y1, from: 10, v: 2, ramp: 36, frames: LEN.Reviews});
      console.log(`  d-reviews : de ${y0} à ${ys[ys.length - 1]} (visé ${y1}), arrêt à l'image ${stopOf(ys)}`);
      return {ys};
    },
    step: scrollStep,
    watch: (page) =>
      page.evaluate(() => {
        const lit = (s) => Number(document.querySelector(s).style.getPropertyValue('--lit') || -1);
        return {litA: lit('.quote--a'), litB: lit('.quote--b')};
      }),
  },
  {
    // 6. La demande : le nom, le quartier, le téléphone et qui les a recommandés sont déjà là ; un clic dans « Your
    // list », trois lignes s'écrivent ; « Email my list » : la demande est prête, et la page l'amène à l'écran
    name: 'd-estimate',
    seconds: LEN.Estimate / FPS,
    async setup(site) {
      const page = site.page;
      await page.fill('#f-name', 'Pat Morgan');
      await page.fill('#f-where', 'Golden Gate');
      await page.fill('#f-phone', '(239) 555-0142');
      await page.fill('#f-who', 'A neighbor');
      await blur(page);
      // le point d'insertion du navigateur clignote en temps réel : il est caché, le montage dessine le sien
      await page.addStyleTag({content: '#f-list { caret-color: transparent; }'});
      const y0 = Math.round(await top(page, '.form')) - topH(site) - 44;
      await park(site, y0, 900);
      const ta = await rectOf(page, '#f-list');
      const go = await rectOf(page, '.form__send .btn');
      const {list, send} = EVENTS.estimate;
      const ys = new Array(LEN.Estimate).fill(y0);
      // après le clic sur le bouton, la page défile seule : le site amène la demande prête à l'écran
      for (let i = B(send); i < ys.length; i++) ys[i] = null;
      const side = ta.x + ta.w + 44;
      return {
        ys,
        enter: T(0.3),
        pos: path([
          [T(0.3), 1432, ta.y + 300], [T(list - 0.2), ta.x + 210, ta.y + 52], [T(list), ta.x + 212, ta.y + 53],
          // pendant que la liste s'écrit, la souris attend à droite du champ (rien n'est survolé)
          [T(list + 0.3), ta.x + 212, ta.y + 53], [T(list + 1.3), side, ta.y + 120, easeOut, easeInOut],
          [T(send - 1.7), side, ta.y + 120], [T(send - 0.2), go.cx + 8, go.cy + 2], [T(send), go.cx + 9, go.cy + 3],
          [T(send + 0.6), go.cx + 9, go.cy + 3], [T(send + 1.8), go.cx + 150, go.cy + 110],
        ]),
        clicks: [B(list), B(send)],
        keep: [B(list)],
        keys: typing(),
        extra: async (page) => {
          const c = await caretOf(page);
          return c ? {caret: c} : null;
        },
      };
    },
    step: mouseStep,
    watch: (page) =>
      page.evaluate(() => ({
        focus: document.activeElement === document.querySelector('#f-list'),
        hover: document.querySelector('.form__send .btn').matches(':hover'),
        ready: !document.querySelector('[data-ready]').hidden,
        y: window.scrollY,
      })),
  },
];

/* ——— téléphone : touchers et glissés ——— */

/** Un toucher du pouce à l'image donnée ; la page défile (ys[i] à null : elle défile seule) */
const touchStep = async (site, ctx, i) => {
  const y = ctx.ys ? ctx.ys[i] : ctx.y;
  if (y != null) await scrollTo(site.page, y);
  const tap = (ctx.taps || []).find(([at]) => at === i);
  if (!tap) return null;
  await site.page.touchscreen.tap(tap[1].x, tap[1].y);
  await blur(site.page);
  if (ctx.onTap) await ctx.onTap(site.page, i);
  return {mouse: tap[1], click: true};
};

const mobile = [
  {
    // l'ouverture au téléphone : la liste se barre, « Consider it done. » s'écrit
    name: 'm-open',
    seconds: 3.5,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      return {y: 0};
    },
    step: touchStep,
    watch: introState,
  },
  {
    // le menu : le pouce l'ouvre (le ciel, les liens en grand), choisit « What we do », et la page descend sur la partie
    name: 'm-menu',
    seconds: LEN.Mobile / FPS,
    async setup(site) {
      const page = site.page;
      await scrollTo(page, 0);
      await settle(page, 400);
      const menu = await rectOf(page, '[data-menu]');
      const link = await page.evaluate(() => {
        const p = document.querySelector('[data-panel]');
        p.hidden = false;
        const r = p.querySelector('a').getBoundingClientRect();
        p.hidden = true;
        return {x: r.left + Math.min(110, r.width / 2), y: r.top + r.height / 2};
      });
      const ys = new Array(LEN.Mobile).fill(0);
      for (let i = B(EVENTS.mobile.link); i < ys.length; i++) ys[i] = null;
      return {ys, taps: [[B(EVENTS.mobile.menu), {x: menu.cx, y: menu.cy}], [B(EVENTS.mobile.link), link]]};
    },
    step: touchStep,
    watch: (page) =>
      page.evaluate(() => {
        const p = document.querySelector('[data-panel]');
        window.__menu ||= !p.hidden;
        return {menu: !p.hidden, closed: window.__menu && p.hidden, y: window.scrollY};
      }),
  },
  {
    // la visionneuse au téléphone : le pouce touche la photo des débords, elle grandit ; puis il la fait glisser vers la
    // gauche : la photo suit le doigt, et la suivante arrive
    name: 'm-viewer',
    seconds: LEN.Mobile / FPS,
    async setup(site) {
      const page = site.page;
      const y0 = Math.round(await top(page, '.m-eaves')) - 250;
      await park(site, y0, 900);
      const ph = await rectOf(page, '.m-eaves .ph');
      const tap = {x: ph.x + ph.w * 0.55, y: ph.cy};
      // le glissé : le doigt se pose à droite de la photo, tire 150 px vers la gauche en 16 images, et se lève
      const S = B(EVENTS.mobile.swipe);
      const R = S + 16;
      return {y: y0, taps: [[B(EVENTS.mobile.photo), tap]], S, R, onTap: (page) => opened(page)};
    },
    async step(site, ctx, i) {
      const page = site.page;
      const info = (await touchStep(site, ctx, i)) || {};
      if (i < ctx.S || i > ctx.R) return info;
      // le doigt au milieu de la photo affichée, à droite ; il tire en accélérant puis ralentit avant de se lever
      const k = easeInOut((i - ctx.S) / (ctx.R - ctx.S));
      const p = await page.evaluate(([k, i, S, R]) => {
        const stage = document.querySelector('[data-stage]');
        const img = document.querySelector('[data-vimg]').getBoundingClientRect();
        window.__f0 ||= {x: Math.min(innerWidth - 60, img.left + img.width * 0.78), y: img.top + img.height * 0.5};
        const x = window.__f0.x - 150 * k;
        const y = window.__f0.y + 6 * k;
        const type = i === S ? 'pointerdown' : i === R ? 'pointerup' : 'pointermove';
        stage.dispatchEvent(new PointerEvent(type, {pointerType: 'touch', pointerId: 7, isPrimary: true, clientX: x, clientY: y, bubbles: true}));
        return {x, y};
      }, [k, i, ctx.S, ctx.R]);
      return {mouse: p, mark: i === ctx.S ? 'hold' : i === ctx.R ? 'release' : undefined};
    },
    watch: viewerState,
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
      // l'ouverture du site se joue avant le plan (3 s), et les avis sont découpés en mots
      await settle(site.page, 3600);
    }
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t), watch: shot.watch, probe});
    await site.browser.close();
  }
}
