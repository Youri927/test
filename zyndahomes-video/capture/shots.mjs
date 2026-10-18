// Plans filmés du nouveau site de Zynda Custom Homes & Remodeling pour la vidéo de présentation 16:9 (image par image,
// temps simulé). Usage : node capture/shots.mjs [desktop|mobile|nom-du-plan …] [--probe]
//
// Contre les saccades : Chrome arrondit le défilement au pixel entier. Chaque plan défile donc par pas entiers qui ne
// changent que progressivement (1, 1, 2, 2, 3… puis constants), et la vidéo lit toujours les plans à vitesse 1 :
// aucune image sautée ni doublée.
// Les gestes tombent sur des temps de la musique (100 BPM : un temps = 36 images), voir EVENTS dans src/beats.ts.
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

/** Toutes les photos chargées et décodées tout de suite (le site charge certaines à l'approche) : aucune image vide */
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

/**
 * Place la page à y en y descendant (les photos et les titres plus haut se sont ouverts en passant), puis laisse passer un
 * peu de temps : l'en-tête, rangé pendant la descente, a fini de remonter hors de l'écran
 */
const park = async (site, y, ms = 1200) => {
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

const blur = (page) => page.evaluate(() => document.activeElement && document.activeElement !== document.body && document.activeElement.blur());

/** Un clic : la souris appuie et relâche à l'image i ; le contour de focus n'apparaît pas (sauf `keep`) */
const click = async (page, keep = false) => {
  await page.mouse.down();
  await page.mouse.up();
  if (!keep) await blur(page);
};

/** La visionneuse est ouverte et sa photo décodée (en temps réel) : aucune image vide à l'écran */
const opened = async (page) => {
  await until(page, () => document.querySelector('[data-viewer]').open);
  await page.evaluate(() => document.querySelector('[data-vimg]').decode().catch(() => null));
};

/**
 * Plan avec une souris : défilement fixe ou glissé (`ys[i]` à null : la page ne bouge pas d'elle-même), trajet (à partir
 * de `enter` secondes) et clics aux images données (`clicks`). `onClick(i)` : ce qui suit un clic (choisir un mois,
 * attendre la visionneuse). `keys[i]` : une frappe au clavier à l'image i.
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
    if (!ctx.fake?.includes(i)) await click(site.page, ctx.keep?.includes(i));
    if (ctx.onClick) await ctx.onClick(site.page, i);
  }
  return {mouse: p, click: on, after: ctx.extra ? () => ctx.extra(site.page, i) : undefined};
};

/** Plan sans geste : la page défile seule */
const scrollStep = async (site, ctx, i) => {
  await scrollTo(site.page, ctx.ys ? ctx.ys[i] : ctx.y);
};

/* ——— relevés image par image ——— */

/** L'ouverture : `in` quand l'accueil reçoit la classe qui lance son ouverture */
const introState = (page) => page.evaluate(() => ({in: document.querySelector('[data-hero]').classList.contains('is-in')}));

/** Le cadran : le temps de l'année affiché (les quatre étiquettes), le 1er octobre atteint, le défilement */
const dialState = (page) =>
  page.evaluate(() => {
    const label = document.querySelector('[data-label]').textContent;
    const date = document.querySelector('[data-date]').textContent;
    return {
      start: label === 'We start',
      site: label === 'On site, every day',
      home: label === 'You’re home',
      oct1: label === 'You’re home' && date === 'Oct 1',
      y: window.scrollY,
    };
  });

/** Les photos qui se découvrent (classe is-in) et les titres qui montent */
const revealState = (sels) => (page) =>
  page.evaluate((sels) => Object.fromEntries(Object.entries(sels).map(([k, s]) => [k, document.querySelector(s).classList.contains('is-in')])), sels);

/** La visionneuse : `open` quand elle s'ouvre, `closed` quand elle s'est refermée */
const viewerState = (page) =>
  page.evaluate(() => {
    const v = document.querySelector('[data-viewer]');
    window.__wasOpen ||= v.open;
    return {open: v.open, closed: window.__wasOpen && !v.open};
  });

/** Le point d'insertion du champ « About the project », en px du viewport (null s'il n'a pas le focus) */
const caretOf = (page) =>
  page.evaluate(() => {
    const ta = document.querySelector('#f-msg');
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

/* ——— la phrase tapée dans « About the project » ——— */
const MESSAGE = 'Kitchen and two baths, while we’re up north.';
/** Les frappes : {image: action}. Deux à quatre images par lettre, un peu plus après une espace */
const typing = (from) => {
  const keys = {};
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let f = from;
  for (const ch of MESSAGE) {
    keys[f] = async (page) => {
      await page.keyboard.type(ch);
      await page.evaluate(() => (window.__typed = (window.__typed || 0) + 1));
    };
    f += ch === ' ' ? 5 + Math.round(rnd() * 2) : 2 + Math.round(rnd() * 2);
  }
  return {keys, end: f};
};

const desktop = [
  {
    // 1. L'ouverture, depuis sa première image : « The people who show up. » monte, le bandeau de la maison et sa piscine
    // s'ouvre depuis sa ligne d'horizon, « Every single day. » monte à droite, puis le texte et le bouton : le Z
    name: 'd-open',
    seconds: 3.2,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      return {y: 0};
    },
    step: scrollStep,
    watch: introState,
  },
  {
    // 2. L'année : la page descend le long des quatre temps ; le cadran reste à l'écran, son repère avance de novembre au
    // 1er octobre, la date change au centre, l'arc de l'été se remplit ; le repère du jour marque le 18 octobre
    name: 'd-year',
    seconds: LEN.Year / FPS,
    async setup(site) {
      const page = site.page;
      // au départ, le titre de la partie est en haut de l'écran, le cadran entre par le bas
      const y0 = Math.round(await top(page, '#year h2')) - 140;
      // à l'arrivée, le milieu de l'écran est aux deux cinquièmes du dernier temps : le repère est posé sur le 1er octobre
      const y1 = await page.evaluate(() => {
        const r = document.querySelector('[data-step="3"]').getBoundingClientRect();
        return Math.round(r.top + scrollY + r.height * 0.42 - innerHeight / 2);
      });
      await park(site, y0, 1200);
      const ys = glideTo({y0, y1, from: 16, v: 6, ramp: 48, frames: LEN.Year});
      console.log(`  d-year : de ${y0} à ${ys[ys.length - 1]} (visé ${y1}), arrêt à l'image ${stopOf(ys)}`);
      return {ys};
    },
    step: scrollStep,
    watch: dialState,
  },
  {
    // 3. Les pièces : « The work » monte, puis les photos se découvrent de bas en haut en entrant à l'écran : le séjour à
    // l'escalier de verre (et l'avis de Park Shore), la cuisine, la vasque aux écailles
    name: 'd-work',
    seconds: LEN.Work / FPS,
    async setup(site) {
      const page = site.page;
      // au départ, le titre est juste sous le seuil où il monte ; à l'arrivée, la cuisine est à 80 px du haut
      const y0 = Math.round(await top(page, '#work h2')) - 800;
      const y1 = Math.round(await top(page, '.w--kitchen')) - 80;
      await park(site, y0, 1400);
      const ys = glideTo({y0, y1, from: 14, v: 5, ramp: 44, frames: LEN.Work});
      console.log(`  d-work : de ${y0} à ${ys[ys.length - 1]} (visé ${y1}), arrêt à l'image ${stopOf(ys)}`);
      return {ys};
    },
    step: scrollStep,
    watch: revealState({title: '#work h2', living: '.w--living .ph', kitchen: '.w--kitchen .ph', vanity: '.w--vanity .ph'}),
  },
  {
    // 4. Les détails : la page entre dans le bandeau noir, « Adding pop is what we do best. » monte, les gros plans
    // arrivent ; la souris clique celui de la pierre bleue : la cheminée entière s'ouvre dans la visionneuse ; « Close »
    name: 'd-details',
    seconds: LEN.Details / FPS,
    async setup(site) {
      const page = site.page;
      const y0 = Math.round(await top(page, '#details h2')) - 800;
      const y1 = Math.round(await top(page, '.swatches')) - 100;
      await park(site, y0, 1400);
      const ys = glideTo({y0, y1, from: 12, v: 6, ramp: 44, frames: LEN.Details});
      const yEnd = ys[ys.length - 1];
      // le premier gros plan, et le bouton « Close » de la visionneuse (mesuré visionneuse ouverte, puis refermée)
      const sw = await page.evaluate((yEnd) => {
        const r = document.querySelector('.sw').getBoundingClientRect();
        return {x: r.left + r.width * 0.55, y: r.top + scrollY - yEnd + r.width * 0.5};
      }, yEnd);
      const close = await page.evaluate(() => {
        const v = document.querySelector('[data-viewer]');
        document.querySelector('[data-vprev]').hidden = document.querySelector('[data-vnext]').hidden = true;
        document.querySelector('[data-vcap]').textContent = 'Fireplace wall';
        document.querySelector('[data-vcount]').textContent = '';
        v.show();
        const r = document.querySelector('[data-vclose]').getBoundingClientRect();
        v.close();
        return {x: r.left + r.width / 2, y: r.top + r.height / 2};
      });
      await blur(page);
      const {click: at, close: off} = EVENTS.details;
      console.log(`  d-details : de ${y0} à ${yEnd} (arrêt à l'image ${stopOf(ys)}), gros plan ${Math.round(sw.x)},${Math.round(sw.y)}, Close ${Math.round(close.x)},${Math.round(close.y)}`);
      return {
        ys,
        enter: T(5.4),
        pos: path([
          // la souris entre par le bas, à droite, et monte sur le gros plan de la pierre bleue
          [T(5.4), 1430, 880], [T(at - 0.15), sw.x - 4, sw.y + 3], [T(at), sw.x - 3, sw.y + 4],
          // la visionneuse ouverte : la souris descend vers « Close »
          [T(at + 1.4), sw.x - 3, sw.y + 4], [T(off - 0.2), close.x - 2, close.y + 2, easeInOut, easeOut], [T(off), close.x - 1, close.y + 3],
          // la page revenue, la souris s'écarte
          [T(off + 0.5), close.x - 1, close.y + 3], [T(off + 1.5), close.x + 160, 880],
        ]),
        clicks: [B(at), B(off)],
        onClick: async (page, i) => {
          if (i === B(at)) await opened(page);
        },
      };
    },
    step: mouseStep,
    watch: async (page) => ({...(await viewerState(page)), title: await page.evaluate(() => document.querySelector('#details h2').classList.contains('is-in'))}),
  },
  {
    // 5. Les prestations : la souris se pose sur la liste, la page défile doucement dessous ; chaque ligne qui passe sous la
    // souris découvre sa photo, à sa place
    name: 'd-services',
    seconds: LEN.Services / FPS,
    async setup(site) {
      const page = site.page;
      const items = await page.evaluate(() => [...document.querySelectorAll('.svc__item')].map((e) => {
        const r = e.getBoundingClientRect();
        return {top: r.top + scrollY, h: r.height};
      }));
      // la souris, posée à 480 px du haut, juste au-dessus de la première ligne ; la page défile dessous à 3 px par image,
      // et une ligne passe sous la souris tous les deux temps (218 px : 72,7 images), la première sur le temps 2
      const Y = 480;
      const X = 300;
      const y0 = Math.round(items[0].top - Y - 60);
      const ys = glide({y0, from: 36, v: 3, ramp: 36, down: 36, to: LEN.Services - 40, frames: LEN.Services});
      // l'image où chaque ligne passe sous la souris
      const under = items.map((it) => ys.findIndex((y) => y + Y >= it.top + 1));
      await park(site, y0, 1200);
      console.log(`  d-services : de ${y0} à ${ys[ys.length - 1]}, lignes sous la souris aux images ${under.join(', ')}`);
      return {
        ys,
        // elle entre par la droite à la hauteur où elle se posera : elle ne survole aucune ligne en chemin
        enter: T(0.6),
        pos: path([[T(0.6), 1432, Y - 10], [T(1.6), X + 8, Y + 4, easeInOut, easeOut], [T(1.9), X, Y]]),
      };
    },
    step: mouseStep,
    watch: (page) => page.evaluate(() => {
      const items = [...document.querySelectorAll('.svc__item')];
      const k = items.findIndex((e) => e.matches(':hover'));
      return Object.fromEntries(items.map((e, i) => [`h${i}`, i === k]));
    }),
  },
  {
    // 6. La demande : le nom, l'e-mail, le téléphone, le projet et l'immeuble sont déjà là ; « I leave in » : May,
    // « I'm back in » : October : la fenêtre se dessine sur la saison des condos ; un clic dans « About the project », une
    // phrase s'écrit ; « Email my request » : la note dit que la messagerie s'ouvre avec la demande
    name: 'd-contact',
    seconds: LEN.Contact / FPS,
    async setup(site) {
      const page = site.page;
      await page.fill('#f-name', 'Pat Morgan');
      await page.fill('#f-email', 'pat@example.com');
      await page.fill('#f-phone', '(239) 555-0142');
      await page.selectOption('#f-kind', 'Condo renovation');
      await page.fill('#f-where', 'Pelican Bay');
      await blur(page);
      // le point d'insertion du navigateur clignote en temps réel : il est caché, le montage dessine le sien
      await page.addStyleTag({content: '#f-msg { caret-color: transparent; }'});
      const y0 = Math.round(await top(page, '#f-kind')) - 90;
      await park(site, y0, 1200);
      const leave = await rectOf(page, '[data-leave]');
      const back = await rectOf(page, '[data-back]');
      const msg = await rectOf(page, '#f-msg');
      const go = await rectOf(page, '.form__send .btn');
      const {leave: L, back: Bk, msg: M, type, send} = EVENTS.contact;
      const {keys, end} = typing(B(type));
      if (end >= B(send) - 20) throw new Error(`la phrase finit trop tard (${end} ≥ ${B(send) - 20})`);
      const side = msg.x + msg.w + 70;
      console.log(`  d-contact : à ${y0} ; la phrase s'écrit des images ${B(type)} à ${end}`);
      return {
        y: y0,
        enter: T(1.2),
        pos: path([
          [T(1.2), 1432, 880], [T(L - 0.2), leave.x + leave.w * 0.62, leave.cy + 2], [T(L), leave.x + leave.w * 0.62 + 1, leave.cy + 3],
          [T(L + 0.6), leave.x + leave.w * 0.62 + 1, leave.cy + 3], [T(Bk - 0.2), back.x + back.w * 0.62, back.cy + 2], [T(Bk), back.x + back.w * 0.62 + 1, back.cy + 3],
          [T(Bk + 0.7), back.x + back.w * 0.62 + 1, back.cy + 3], [T(M - 0.2), msg.x + 230, msg.y + 34], [T(M), msg.x + 231, msg.y + 35],
          // pendant que la phrase s'écrit, la souris attend à droite du champ (rien n'est survolé)
          [T(M + 0.4), msg.x + 231, msg.y + 35], [T(M + 1.4), side, msg.y + 96, easeOut, easeInOut],
          [T(send - 1.6), side, msg.y + 96], [T(send - 0.2), go.cx + 8, go.cy + 2], [T(send), go.cx + 9, go.cy + 3],
          [T(send + 0.8), go.cx + 9, go.cy + 3], [T(send + 2.2), go.cx + 170, go.cy + 120],
        ]),
        clicks: [B(L), B(Bk), B(M), B(send)],
        // les deux mois sont choisis par le script (la liste déroulante du navigateur ne se filme pas) : pas de vrai clic
        fake: [B(L), B(Bk)],
        keep: [B(M)],
        keys,
        onClick: async (page, i) => {
          if (i === B(L)) await page.selectOption('[data-leave]', '4');
          if (i === B(Bk)) await page.selectOption('[data-back]', '9');
          if (i === B(L) || i === B(Bk)) await blur(page);
        },
        extra: async (page) => {
          const c = await caretOf(page);
          return c ? {caret: c} : null;
        },
      };
    },
    step: mouseStep,
    watch: (page) =>
      page.evaluate(() => ({
        leave: document.querySelector('[data-leave]').value === '4',
        back: document.querySelector('[data-back]').value === '9',
        win: document.querySelector('[data-win]').classList.contains('is-on'),
        focus: document.activeElement === document.querySelector('#f-msg'),
        hover: document.querySelector('.form__send .btn').matches(':hover'),
        done: !document.querySelector('[data-done]').hidden,
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
    // l'ouverture au téléphone : la phrase, la photo en 4:3, la fin de la phrase, le texte et le bouton pleine largeur
    name: 'm-open',
    seconds: 3.2,
    fresh: true,
    async setup(site) {
      await prime(site.page);
      return {y: 0};
    },
    step: touchStep,
    watch: introState,
  },
  {
    // le menu : le pouce l'ouvre (les liens en grand), choisit « Your year », et la page descend jusqu'au cadran
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
        const a = [...p.querySelectorAll('a')].find((e) => e.hash === '#year');
        const r = a.getBoundingClientRect();
        p.hidden = true;
        return {x: r.left + Math.min(90, r.width / 2), y: r.top + r.height / 2};
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
    // les gros plans au téléphone : le pouce fait glisser la rangée deux fois (elle suit le doigt, puis file jusqu'au gros
    // plan suivant), puis en touche un : la pièce entière s'ouvre dans la visionneuse
    name: 'm-swatch',
    seconds: LEN.Mobile / FPS,
    async setup(site) {
      const page = site.page;
      // le défilement de la rangée est mené image par image : son aimantation est suspendue pendant le plan, et chaque
      // glissé s'arrête exactement sur un gros plan, comme elle l'aurait fait
      await page.addStyleTag({content: '.swatches { scroll-snap-type: none !important; }'});
      const y0 = Math.round(await top(page, '#details h2')) - 80;
      await park(site, y0, 1200);
      const row = await page.evaluate(() => {
        const ul = document.querySelector('.swatches');
        const pad = parseFloat(getComputedStyle(ul).scrollPaddingLeft) || 0;
        const r = ul.getBoundingClientRect();
        return {stops: [...ul.children].map((li) => li.offsetLeft - ul.firstElementChild.offsetLeft), pad, top: r.top, h: r.height, w: ul.children[0].getBoundingClientRect().width};
      });
      // chaque glissé : le doigt se pose, tire 110 px vers la gauche en 12 images (la rangée le suit), se lève ; la rangée
      // file ensuite 22 images jusqu'au gros plan suivant
      const swipes = EVENTS.mobile.swipe.map((b, k) => ({S: B(b), R: B(b) + 12, E: B(b) + 34, x0: row.stops[k], x1: row.stops[k + 1]}));
      const fy = row.top + row.w * 0.5;
      // le gros plan touché : le troisième, à sa place après le deuxième glissé
      const tap = {x: row.pad + row.w * 0.5, y: fy};
      console.log(`  m-swatch : à ${y0} ; arrêts de la rangée ${row.stops.slice(0, 4).join(', ')} ; doigt à ${Math.round(fy)}`);
      return {y: y0, swipes, fy, taps: [[B(EVENTS.mobile.tap), tap]], onTap: (page) => opened(page)};
    },
    async step(site, ctx, i) {
      const page = site.page;
      const info = (await touchStep(site, ctx, i)) || {};
      const sw = ctx.swipes.find((s) => i >= s.S && i <= s.E);
      if (!sw) return info;
      const k = ctx.swipes.indexOf(sw);
      const drag = 110;
      // la rangée : 1:1 avec le doigt pendant l'appui, puis elle file en ralentissant jusqu'à l'arrêt suivant
      let x;
      if (i <= sw.R) x = sw.x0 + drag * easeInOut((i - sw.S) / (sw.R - sw.S));
      else x = sw.x0 + drag + (sw.x1 - sw.x0 - drag) * easeOut((i - sw.R) / (sw.E - sw.R));
      await page.evaluate((x) => (document.querySelector('.swatches').scrollLeft = x), Math.round(x));
      if (i > sw.R) return info;
      const fx = 300 - drag * easeInOut((i - sw.S) / (sw.R - sw.S));
      const name = k === 0 ? '' : String(k + 1);
      return {mouse: {x: fx, y: ctx.fy + 4 * ((i - sw.S) / (sw.R - sw.S))}, mark: i === sw.S ? `hold${name}` : i === sw.R ? `release${name}` : undefined};
    },
    watch: async (page) => ({...(await viewerState(page)), x: await page.evaluate(() => document.querySelector('.swatches').scrollLeft)}),
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
      // l'ouverture du site se joue avant le plan (2,2 s), et les titres plus bas sont découpés en lignes
      await settle(site.page, 3600);
    }
    const ctx = await shot.setup(site);
    await record(site, {name: shot.name, fps: FPS, seconds: shot.seconds, step: (i, t) => shot.step(site, ctx, i, t), watch: shot.watch, probe});
    await site.browser.close();
  }
}
