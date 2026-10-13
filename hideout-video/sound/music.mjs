// Musique originale de la présentation Hideout Boutique, synthétisée de zéro (aucun échantillon, aucun droit tiers).
// 100 BPM, en la bémol majeur, du néo-soul feutré : piano électrique (FM) en accords posés et en contretemps, nappe chaude,
// basse ronde, batterie souple en demi-temps (grosse caisse, claquement de doigts, charleston balancé), et des maillets
// de verre et des cloches pour les gestes. Pas de bruitages.
// - L'ouverture : la page blanche, un accord de piano ; le logo apparaît, un reflet de verre ; la photo s'ouvre dans le
//   cadre : une montée de verre, et le filtre s'ouvre pendant que le cadre s'agrandit ; le cadre se pose sur un temps :
//   l'accord de la bémol s'épanouit avec des cloches, la basse et la batterie entrent. Le charleston arrive avec la légende.
// - Les gestes filmés (une famille survolée, une famille ouverte, un filtre, le cadre qui se trace, chaque mois du
//   Beauty Bank, le cadre qui se pose sur la carte, les gestes au téléphone) sont soulignés d'un maillet ou d'une cloche,
//   à l'image près (relevés des plans).
// - La scène de l'équipe, sur l'expresso, passe à moitié dans un filtre ; tout se rouvre pour le Beauty Bank.
// Les temps des scènes viennent de src/beats.ts, les repères des gestes de public/site/*.json.
// Usage : node sound/music.mjs  →  public/sfx/music.wav
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCENE_BEATS, OPEN, EVENTS, END, PHONE_TIMING, BEAT as FR} from '../src/beats.ts';

const here = dirname(fileURLToPath(import.meta.url));
const SR = 44100;
const BPM = 100;
const BEAT = 60 / BPM;
const TOTAL_BEATS = SCENE_BEATS.reduce((n, [, b]) => n + b, 0);
const TAIL = 4;
const N = Math.ceil((TOTAL_BEATS * BEAT + TAIL) * SR);
// trois bus : le groove (filtré dans la scène de l'équipe), le reste, et l'envoi vers la réverbération
const L = new Float32Array(N);
const R = new Float32Array(N);
const GL = new Float32Array(N);
const GR = new Float32Array(N);
const busL = new Float32Array(N);
const busR = new Float32Array(N);

// début de chaque scène, en temps
const S = {};
{
  let b = 0;
  for (const [name, n] of SCENE_BEATS) { S[name] = b; b += n; }
}
/** une image de scène en temps de musique */
const fb = (frames) => frames / FR;
/** repères et valeurs relevés d'un plan */
const meta = (name) => {
  const file = resolve(here, `../public/site/${name}.json`);
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
};
const mark = (name, key, fallback) => meta(name).marks?.[key] ?? fallback;

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const n = (name) => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  const base = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]];
  return midi(12 * (Number(m[3]) + 1) + base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0));
};
let seed = 20171013;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
// énergie de chaque instrument, pour vérifier l'équilibre du mélange (affichée à la fin)
const energy = {};
let TAG = 'nappe';
/** ajoute un échantillon ; groove = passe par le filtre de la scène de l'équipe */
const add = (i, l, r, send = 0, groove = false) => {
  if (i < 0 || i >= N) return;
  energy[TAG] = (energy[TAG] || 0) + l * l + r * r;
  if (groove) { GL[i] += l; GR[i] += r; } else { L[i] += l; R[i] += r; }
  if (send) { busL[i] += l * send; busR[i] += r * send; }
};
const env = (beat, keys) => {
  if (beat <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (beat <= keys[i][0]) {
      const [b0, v0] = keys[i - 1];
      const [b1, v1] = keys[i];
      return v0 + (v1 - v0) * smooth((beat - b0) / (b1 - b0));
    }
  }
  return keys[keys.length - 1][1];
};

// ——— Équilibre des instruments, réglé sur le spectre des présentations précédentes : la basse et la grosse caisse
// un peu en retrait (leur énergie tombait sous 90 Hz, que les petits haut-parleurs ne rendent pas), le piano (un peu plus
// brillant), la nappe et le claquement plus présents dans les médiums, le charleston plus discret dans l'aigu ———
const MIX = {piano: 1.45, brillance: 1.25, nappe: 1.25, basse: 0.7, kick: 0.85, claquement: 1.25, charleston: 0.35};

// ——— Accords (voix du piano et de la nappe) et basse, en la bémol majeur ———
const CH = {
  Abmaj9: {v: ['C4', 'Eb4', 'G4', 'Bb4'], b: 'Ab2'},
  Fm9: {v: ['Ab3', 'C4', 'Eb4', 'G4'], b: 'F2'},
  Dbmaj9: {v: ['F3', 'Ab3', 'C4', 'Eb4'], b: 'Db2'},
  Ebsus: {v: ['Ab3', 'Bb3', 'Db4', 'F4'], b: 'Eb2'},
  Cm7: {v: ['Bb3', 'Eb4', 'G4'], b: 'C2'},
  Bbm9: {v: ['Db4', 'F4', 'Ab4', 'C5'], b: 'Bb1'},
  Dbm6: {v: ['E3', 'Ab3', 'Bb3', 'Eb4'], b: 'Db2'},
  Ab69: {v: ['C4', 'F4', 'Bb4', 'Eb5'], b: 'Ab2'},
};

// L'ouverture (scène Open, images → temps) : la page blanche de 0 à HOLD ; le logo apparaît de LOGO à LOGO + 0,8 ;
// la photo s'ouvre dans le cadre de PHOTO0 à PHOTO ; le cadre s'agrandit de PHOTO à LAND (un temps entier), où tout se pose ;
// le navigateur se range de côté à ASIDE ; la légende et le charleston à CAP
const LOGO = fb(OPEN.logo);
const PHOTO0 = fb(OPEN.photo - 18);
const PHOTO = fb(OPEN.photo);
const LAND = fb(OPEN.land);
const ASIDE = fb(OPEN.aside);
const CAP = fb(OPEN.cap);

// Grille : chaque scène commence sur un accord ; le cadre se pose sur la bémol
const PROG = [
  // la page blanche et le logo : ré bémol ; la photo s'ouvre : la suspension de mi bémol ; le cadre se pose : la bémol
  [0, 'Dbmaj9'], [PHOTO0, 'Ebsus'], [LAND, 'Abmaj9'], [LAND + 4, 'Fm9'], [LAND + 8, 'Dbmaj9'], [LAND + 10, 'Ebsus'],
  // les soins
  [S.Treatments, 'Abmaj9'], [S.Treatments + 4, 'Fm9'], [S.Treatments + 8, 'Dbmaj9'], [S.Treatments + 10, 'Ebsus'],
  // les résultats
  [S.Results, 'Abmaj9'], [S.Results + 4, 'Cm7'], [S.Results + 6, 'Fm9'], [S.Results + 8, 'Ebsus'],
  // l'équipe, sur l'expresso (plus sombre)
  [S.Team, 'Fm9'], [S.Team + 4, 'Dbmaj9'], [S.Team + 6, 'Bbm9'], [S.Team + 8, 'Ebsus'],
  // le Beauty Bank
  [S.Bank, 'Abmaj9'], [S.Bank + 4, 'Fm9'], [S.Bank + 6, 'Dbmaj9'], [S.Bank + 8, 'Ebsus'],
  // la visite
  [S.Visit, 'Dbmaj9'], [S.Visit + 4, 'Cm7'], [S.Visit + 6, 'Ebsus'],
  // téléphones
  [S.Mobile, 'Abmaj9'], [S.Mobile + 4, 'Fm9'], [S.Mobile + 8, 'Dbmaj9'], [S.Mobile + 10, 'Ebsus'],
  // fin : la sous-dominante mineure, puis la bémol, posée
  [S.End, 'Dbm6'], [S.End + 2, 'Ab69'],
];
const chordAt = (beat) => {
  let c = PROG[0];
  for (const p of PROG) if (beat >= p[0] - 1e-9) c = p;
  return c;
};

const padGain = (b) => env(b, [
  [0, 0], [0.6, 0.22], [PHOTO0, 0.26], [LAND, 0.36], [CAP, 0.17], [S.Treatments, 0.12],
  [S.Team, 0.19], [S.Bank, 0.12], [S.End, 0.28], [S.End + 2, 0.38], [TOTAL_BEATS + 3, 0],
]);

// ——— Nappe : sinus et triangles désaccordés, attaque lente ———
{
  let cur = null;
  let prev = null;
  let xf = 1;
  const XF = SR * 0.9;
  const lp = [0, 0];
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const b = t / BEAT;
    const c = chordAt(b)[1];
    if (c !== cur) { prev = cur; cur = c; xf = prev ? 0 : 1; }
    if (xf < 1) xf = Math.min(1, xf + 1 / XF);
    const g = padGain(b);
    if (g < 1e-4) continue;
    let sl = 0;
    let sr = 0;
    for (const [name, w] of [[cur, Math.sin((xf * Math.PI) / 2)], [prev, Math.cos((xf * Math.PI) / 2)]]) {
      if (!name || w < 1e-3) continue;
      CH[name].v.forEach((nm, k) => {
        const f0 = n(nm);
        for (const d of [-1, 1]) {
          const f = f0 * Math.pow(2, (d * 0.08) / 12);
          const ph = f * t + k * 0.31 + (d > 0 ? 0.5 : 0) + 0.004 * Math.sin(t * (0.29 + k * 0.11));
          const fr = ph - Math.floor(ph);
          const tri = 1 - 4 * Math.abs(fr - 0.5);
          const x = (0.72 * Math.sin(2 * Math.PI * ph) + 0.28 * tri) * w * 0.1;
          if (d < 0) sl += x; else sr += x;
        }
      });
    }
    const a = 0.06;
    lp[0] += (sl - lp[0]) * a;
    lp[1] += (sr - lp[1]) * a;
    add(i, lp[0] * g * MIX.nappe, lp[1] * g * MIX.nappe, 1.1);
  }
}

// ——— Maillet de verre (la note, deux partiels inharmoniques qui s'éteignent vite) ———
const addGlass = (t0, freq, gain, pan, len = 1.1, groove = false) => {
  TAG = 'verre';
  const i0 = Math.floor(t0 * SR);
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    let s = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 4.2) + 0.22 * Math.sin(2 * Math.PI * freq * 2.76 * t) * Math.exp(-t * 14) + 0.05 * Math.sin(2 * Math.PI * freq * 5.4 * t) * Math.exp(-t * 30);
    s *= gain * (t < 0.0025 ? t / 0.0025 : 1) * (t > len - 0.1 ? (len - t) / 0.1 : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.5, groove);
  }
};

// ——— Piano électrique (FM, doux) : les accords posés, et l'accompagnement à contretemps ———
const addEP = (t0, names, gain, len, bright = 0.8, groove = true, spread = 0.016) => {
  TAG = 'piano';
  gain *= MIX.piano;
  bright *= MIX.brillance;
  for (const [k, nm] of names.entries()) {
    const f = n(nm);
    const i0 = Math.floor((t0 + k * spread) * SR);
    const pan = 0.34 + 0.32 * (k / Math.max(1, names.length - 1));
    const total = SR * (len + 0.6);
    const ph0 = rnd() * 6.28;
    // un léger trémolo, comme un piano Rhodes
    const trem = 4.6 + rnd() * 0.4;
    for (let j = 0; j < total; j++) {
      const t = j / SR;
      const rel = t > len ? Math.exp(-(t - len) * 8) : 1;
      const att = t < 0.003 ? t / 0.003 : 1;
      const idx = bright * (0.3 + 1.6 * Math.exp(-t * 3));
      const mod = Math.sin(2 * Math.PI * f * t + ph0);
      const am = 1 - 0.12 * (0.5 + 0.5 * Math.sin(2 * Math.PI * trem * t));
      const s = Math.sin(2 * Math.PI * f * t + idx * mod) * Math.exp(-t * (1.0 + f / 1600)) * gain * att * rel * am;
      if (Math.abs(s) < 1e-6 && t > len) break;
      add(i0 + j, s * (1 - pan), s * pan, 0.4, groove);
    }
  }
};

// ——— Basse ronde (une sinusoïde légèrement saturée, qui s'entend aussi sur un petit haut-parleur) ———
const addBass = (t0, freq, gain, len, groove = true) => {
  TAG = 'basse';
  gain *= MIX.basse;
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * (len + 0.08); j++) {
    const t = j / SR;
    ph += freq / SR;
    ph -= Math.floor(ph);
    const a = gain * (t < 0.01 ? t / 0.01 : 1) * (0.55 * Math.exp(-t * 1.4) + 0.45) * (t > len ? Math.max(0, 1 - (t - len) / 0.08) : 1);
    const s = Math.tanh((Math.sin(2 * Math.PI * ph) + 0.18 * Math.sin(4 * Math.PI * ph) * Math.exp(-t * 6)) * 1.6) * a;
    add(i0 + j, s, s, 0, groove);
  }
};

// ——— Batterie souple ———
const addKick = (t0, gain, groove = true) => {
  TAG = 'grosse caisse';
  gain *= MIX.kick;
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.5; j++) {
    const t = j / SR;
    const f = 48 + 74 * Math.exp(-t * 30);
    ph += (2 * Math.PI * f) / SR;
    const s = (Math.sin(ph) * Math.exp(-t * 7) + (t < 0.002 ? (rnd() - 0.5) * 0.22 : 0)) * gain * (t < 0.003 ? t / 0.003 : 1);
    add(i0 + j, s, s, 0, groove);
  }
};
const svf = () => ({lp: 0, bp: 0});
const band = (st, x, fc, q) => {
  const k = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6)) / SR);
  const hp = x - st.lp - q * st.bp;
  st.bp += k * hp;
  st.lp += k * st.bp;
  return st.bp;
};
/** le claquement de doigts : un éclat de bruit court et un petit corps boisé, sur le temps fort du demi-temps */
const addSnap = (t0, gain, pan = 0.56, groove = true) => {
  TAG = 'claquement';
  gain *= MIX.claquement;
  const i0 = Math.floor(t0 * SR);
  const st = [svf(), svf()];
  for (let j = 0; j < SR * 0.16; j++) {
    const t = j / SR;
    // trois micro-éclats, comme des doigts qui claquent ensemble
    const burst = (t < 0.004 ? 1 : 0) + (t > 0.006 && t < 0.009 ? 0.6 : 0);
    const noise = band(st[0], rnd() * 2 - 1, 2300, 0.55) * (Math.exp(-t * 42) + burst * 0.4);
    const body = band(st[1], rnd() * 2 - 1, 1150, 0.9) * Math.exp(-t * 24) * 0.45;
    const s = (noise + body) * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.35, groove);
  }
};
/** le charleston fermé : un souffle aigu très bref */
const addHat = (t0, gain, pan) => {
  TAG = 'charleston';
  gain *= MIX.charleston;
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.06; j++) {
    const t = j / SR;
    const e = (t < 0.002 ? t / 0.002 : 1) * Math.exp(-t * 70);
    const s = band(st, rnd() * 2 - 1, 8600, 0.6) * e * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.1, true);
  }
};
// ——— Cloches ———
const addBell = (t0, freq, gain, pan, len = 4) => {
  TAG = 'cloches';
  const i0 = Math.floor(t0 * SR);
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    const s = (Math.sin(2 * Math.PI * freq * t) + 0.22 * Math.sin(2 * Math.PI * freq * 2.76 * t) * Math.exp(-t * 2.5) + 0.08 * Math.sin(2 * Math.PI * freq * 5.4 * t) * Math.exp(-t * 6)) * Math.exp(-t * 0.9) * gain * (t < 0.003 ? t / 0.003 : 1);
    add(i0 + j, s * (1 - pan), s * pan, 0.9);
  }
};

// ——— Partition ———
const at = (b) => b * BEAT;
const isStart = (b, start) => Math.abs(b - start) < 1e-9;
const ORDER = SCENE_BEATS.map(([name]) => name);
const sceneOf = (b) => {
  let s = ORDER[0];
  for (const name of ORDER) if (b >= S[name] - 1e-9) s = name;
  return s;
};
// les mesures repartent au début de chaque scène (dans l'ouverture : quand le cadre se pose)
const anchor = (b) => (sceneOf(b) === 'Open' ? LAND : S[sceneOf(b)]);
const grooveOn = (b) => b >= LAND && b < S.End;
const dark = (b) => b >= S.Team && b < S.Bank;
// intensité de la batterie : 0 = rien, 1 = complet ; elle entre à demi quand le cadre se pose, complète avec la légende
const drums = (b) => {
  if (b < LAND || b >= S.End) return 0;
  if (b < CAP) return 0.6;
  return dark(b) ? 0.8 : 1;
};
// le balancement : les croches à contretemps arrivent un peu en retard, les doubles croches à contretemps de moitié moins
const SWING = 0.07;
const swingT = (b) => {
  const fr = Math.round((b % 1) * 4) / 4;
  return fr === 0.5 ? b + SWING : fr === 0.25 || fr === 0.75 ? b + SWING / 2 : b;
};

for (let s16 = 0; s16 < TOTAL_BEATS * 4; s16++) {
  const b = s16 / 4;
  const t = at(swingT(b));
  const [start, name] = chordAt(b);
  const c = CH[name];
  const bar = (((b - anchor(b)) % 4) + 4) % 4;
  const d = drums(b);

  if (grooveOn(b)) {
    // piano électrique : l'accord posé au changement, puis deux accords brefs à contretemps (le « et » du 2 et du 4)
    if (isStart(b, start)) addEP(t, c.v, 0.04, BEAT * 1.6, 0.7);
    else if (bar === 1.5 || bar === 3.5) addEP(t, c.v, 0.028, BEAT * 0.42, 0.55, true, 0.009);
    // basse : la fondamentale sur le 1, une reprise juste avant le 3, la quinte à la fin de la mesure, une note d'approche
    const root = n(c.b);
    if (bar === 0 || isStart(b, start)) addBass(t, root, 0.135, BEAT * 1.4);
    if (bar === 1.75 && d > 0.5) addBass(t, root, 0.085, BEAT * 0.3);
    if (bar === 2.5 && d > 0.5) addBass(t, root * 1.5, 0.08, BEAT * 0.6);
    if (bar === 3.5 && d >= 1) addBass(t, root * 2, 0.045, BEAT * 0.3);
  }
  if (d > 0) {
    // demi-temps : grosse caisse sur le 1 et juste avant le 3 ; le claquement sur le 3
    if (bar === 0) addKick(t, 0.38 * Math.min(1, d + 0.15));
    if (bar === 1.75) addKick(t, 0.22 * d);
    if (bar === 2.75 && d >= 1) addKick(t, 0.13);
    if (bar === 2) addSnap(t, d >= 1 ? 0.19 : 0.14);
    if (bar === 3.75 && d >= 1) addSnap(t, 0.05, 0.42);
    // charleston : les croches, balancées ; quelques doubles croches fantômes
    if (b >= CAP || sceneOf(b) !== 'Open') {
      if (s16 % 2 === 0) addHat(t, 0.06 * d, 0.6);
      else addHat(t, 0.04 * d, 0.66);
      if (bar === 2.25 || bar === 3.25) addHat(t, 0.02 * d, 0.7);
    }
  }

  // — fin : l'accord se pose —
  if (b >= S.End && isStart(b, start)) {
    addEP(t, c.v, 0.042, BEAT * (isStart(b, S.End + 2) ? 5 : 2.2), 0.6, false);
    addBass(t, n(c.b), 0.12, isStart(b, S.End + 2) ? 4 : BEAT * 2, false);
  }
}

// ——— Une cascade de verre en doubles croches, de gauche à droite, qui monte peu à peu ———
const PENTA = ['Ab3', 'Bb3', 'C4', 'Eb4', 'F4', 'Ab4', 'Bb4', 'C5', 'Eb5', 'F5', 'Ab5', 'Bb5', 'C6', 'Eb6', 'F6'];
const cascade = (b0, b1, gain, lift = 6, from = 4) => {
  const steps = Math.round((b1 - b0) * 4);
  for (let k = 0; k <= steps; k++) {
    const u = k / Math.max(1, steps);
    const idx = Math.min(PENTA.length - 1, from + Math.round(u * lift + (rnd() - 0.5) * 1.6));
    addGlass(at(b0 + k / 4), n(PENTA[Math.max(0, idx)]), gain * (0.75 + 0.25 * Math.sin(u * Math.PI)), 0.12 + 0.76 * u, 1.0);
  }
};

// l'ouverture, avant le groove : le piano pose les deux accords (ré bémol, puis la suspension quand la photo s'ouvre),
// avec une basse lointaine
for (const [b0, nm, len] of [[0, 'Dbmaj9', PHOTO0], [PHOTO0, 'Ebsus', LAND - PHOTO0]]) {
  addEP(at(b0), CH[nm].v, 0.034, at(len) + 0.2, 0.55, false);
  addBass(at(b0), n(CH[nm].b), 0.05, at(len), false);
}
// le logo apparaît sur la page blanche : un reflet de verre
addGlass(at(LOGO) + 0.04, n('C6'), 0.024, 0.58, 1.6);
addGlass(at(LOGO) + 0.3, n('Eb6'), 0.016, 0.66, 1.4);
// la photo s'ouvre dans le cadre, puis le cadre s'agrandit : une montée de verre (le filtre général s'ouvre en même temps)
cascade(PHOTO0, LAND - 0.25, 0.028, 8, 3);
// le cadre se pose : l'accord de la bémol s'épanouit, avec trois cloches ; la basse et la batterie entrent (voir drums)
for (const [nm, g, pan, dt] of [['Ab5', 0.04, 0.38, 0], ['C6', 0.033, 0.56, 0.03], ['Eb6', 0.027, 0.66, 0.06]]) addBell(at(LAND) + dt, n(nm), g, pan, 3.6);
// le navigateur se range de côté : deux notes de verre
addGlass(at(ASIDE), n('Eb5'), 0.026, 0.4, 1.3);
addGlass(at(ASIDE) + at(0.5), n('Ab5'), 0.022, 0.62, 1.3);

// les soins : une note quand chaque famille passe dans le cadre, une cloche quand « Skin and lasers » s'ouvre
{
  const e = EVENTS.svc;
  addGlass(at(S.Treatments + fb(mark('d-svc', 'injectables', e.injectables * FR))), n('Eb5'), 0.038, 0.42, 1.2);
  addGlass(at(S.Treatments + fb(mark('d-svc', 'lashes', e.lashes * FR))), n('F5'), 0.036, 0.52, 1.2);
  addGlass(at(S.Treatments + fb(mark('d-svc', 'skin', e.skin * FR))), n('Ab5'), 0.036, 0.6, 1.2);
  addBell(at(S.Treatments + fb(mark('d-svc', 'open', 9 * FR))), n('C6'), 0.024, 0.55, 2.6);
}
// les résultats : le filtre (deux notes), puis les avant/après qui montent un à un (un arpège rapide)
{
  const t = at(S.Results + fb(mark('d-res', 'pmu', EVENTS.res.pmu * FR)));
  addGlass(t, n('C5'), 0.034, 0.44, 1.1);
  addGlass(t + 0.012, n('Eb5'), 0.026, 0.56, 1.1);
  ['Ab5', 'Bb5', 'C6', 'Eb6'].forEach((nm, k) => addGlass(t + 0.09 + k * 0.08, n(nm), 0.016, 0.3 + 0.14 * k, 0.9));
}
// l'équipe : le cadre se trace autour de la photo de groupe (une cloche grave, un éclat de verre)
{
  const t = at(S.Team + fb(mark('d-team', 'drawn', 40)));
  addBell(t, n('Ab4'), 0.03, 0.45, 3.4);
  addGlass(t + at(0.5), n('Eb5'), 0.022, 0.6, 1.4);
}
// le Beauty Bank : une note par mois rempli, en montant (relevé image par image du plan), une cloche quand on lâche
{
  const months = meta('d-bank').values?.months || [];
  const NOTES = ['C5', 'Eb5', 'F5', 'Ab5', 'Bb5', 'C6', 'Eb6', 'F6', 'Ab6'];
  let prev = null;
  let k = 0;
  months.forEach((v, i) => {
    if (v == null) return;
    if (prev != null && v > prev) {
      for (let m = prev + 1; m <= v; m++) addGlass(at(S.Bank + fb(i)) + (m - prev - 1) * 0.03, n(NOTES[Math.min(NOTES.length - 1, k++)]), 0.03, 0.3 + 0.07 * k, 1.0);
    }
    prev = v;
  });
  addBell(at(S.Bank + fb(mark('d-bank', 'release', EVENTS.bank.release * FR))), n('Ab5'), 0.026, 0.6, 3);
}
// la visite : le cadre du logo se pose sur le cabinet (deux cloches)
{
  const t = at(S.Visit + fb(mark('d-visit', 'drawn', 60)));
  addBell(t, n('Eb5'), 0.03, 0.42, 3.2);
  addBell(t + 0.04, n('Ab5'), 0.024, 0.58, 3.2);
}
// au téléphone : le cadre se pose (des cloches), la famille ouverte (un maillet), la barre du bas monte (deux notes)
{
  const mLand = S.Mobile + fb(PHONE_TIMING.mOpen.delay + (OPEN.land - OPEN.hold));
  addBell(at(mLand), n('Ab5'), 0.028, 0.36, 3.4);
  addBell(at(mLand) + 0.03, n('Eb6'), 0.02, 0.5, 3.4);
  addGlass(at(S.Mobile + fb(mark('m-svc', 'open', EVENTS.mobile.facials * FR))), n('F5'), 0.034, 0.52, 1.1);
  const dock = at(S.Mobile + fb(mark('m-dock', 'dock', 160)));
  addGlass(dock, n('C5'), 0.026, 0.64, 1.0);
  addGlass(dock + at(0.25), n('F5'), 0.026, 0.7, 1.0);
}
// fin : le cadre se trace (une montée de verre), le nom se découvre et l'accord se pose (les cloches sur la bémol)
addKick(at(S.End), 0.32, false);
cascade(S.End + fb(END.frame), S.End + fb(END.frame + 60), 0.024, 7, 4);
{
  const t1 = at(S.End + 2);
  for (const [nm, g, pan, dt] of [['Ab5', 0.048, 0.35, 0], ['C6', 0.04, 0.62, 0.02], ['Eb6', 0.034, 0.45, 0.04], ['F6', 0.024, 0.7, 0.06], ['Ab6', 0.018, 0.3, 0.08]]) addBell(t1 + dt, n(nm), g, pan, 5);
}

// ——— La scène de l'équipe, sur l'expresso : le groove passe dans un passe-bas qui se referme à moitié, puis se rouvre ———
const cutoff = (b) => env(b, [[0, 17000], [S.Team - 0.3, 17000], [S.Team + 0.5, 3600], [S.Bank - 0.6, 3600], [S.Bank, 17000]]);
{
  const s = [[0, 0], [0, 0]];
  for (let i = 0; i < N; i++) {
    const fc = cutoff(i / SR / BEAT);
    const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
    for (const [ch, src, out] of [[0, GL, L], [1, GR, R]]) {
      s[ch][0] += (src[i] - s[ch][0]) * a;
      s[ch][1] += (s[ch][0] - s[ch][1]) * a;
      out[i] += s[ch][1];
    }
  }
}

// ——— Réverbération (Schroeder : 4 filtres en peigne amortis + 3 passe-tout, par canal) ———
const reverb = (input, offset) => {
  const out = new Float32Array(N);
  const combs = [1687, 1601, 1491, 1422].map((d) => ({buf: new Float32Array(d + offset), i: 0, lp: 0}));
  const aps = [556, 441, 341].map((d) => ({buf: new Float32Array(d + offset), i: 0}));
  for (let s = 0; s < N; s++) {
    const x = input[s] * 0.5;
    let y = 0;
    for (const c of combs) {
      const v = c.buf[c.i];
      c.lp = v * 0.6 + c.lp * 0.4;
      c.buf[c.i] = x + c.lp * 0.85;
      c.i = (c.i + 1) % c.buf.length;
      y += v;
    }
    for (const a of aps) {
      const v = a.buf[a.i];
      const u = y + v * 0.5;
      a.buf[a.i] = u;
      a.i = (a.i + 1) % a.buf.length;
      y = v - u * 0.5;
    }
    out[s] = y;
  }
  return out;
};
const wetL = reverb(busL, 0);
const wetR = reverb(busR, 23);
for (let i = 0; i < N; i++) {
  L[i] += wetL[i] * 0.3;
  R[i] += wetR[i] * 0.3;
}

// ——— La page blanche et le logo : tout passe dans un passe-bas qui s'entrouvre, puis s'ouvre en grand pendant que la
// photo s'ouvre et que le cadre s'agrandit (de PHOTO0 à LAND) ———
{
  const cut = (b) => {
    if (b < PHOTO0) return 900 + 500 * smooth(b / PHOTO0);
    if (b < LAND) return 1400 * Math.pow(20000 / 1400, smooth((b - PHOTO0) / (LAND - PHOTO0)));
    return 20000;
  };
  const s = [[0, 0], [0, 0]];
  const end = Math.ceil(at(LAND) * SR);
  for (let i = 0; i < end; i++) {
    const fc = Math.min(18000, cut(i / SR / BEAT));
    const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
    for (const [ch, buf] of [[0, L], [1, R]]) {
      s[ch][0] += (buf[i] - s[ch][0]) * a;
      s[ch][1] += (s[ch][0] - s[ch][1]) * a;
      buf[i] = s[ch][1];
    }
  }
}

// ——— Normalisation (crête à −3 dBFS) et écriture WAV 16 bits ———
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = Math.pow(10, -3 / 20) / peak;
const fadeOut = Math.floor(2.5 * SR);
const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const f = i > N - fadeOut ? (N - i) / fadeOut : 1;
  data.writeInt16LE(Math.round(clamp01((L[i] * gain * f + 1) / 2) * 65534 - 32767), i * 4);
  data.writeInt16LE(Math.round(clamp01((R[i] * gain * f + 1) / 2) * 65534 - 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + data.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(data.length, 40);
const out = resolve(here, '../public/sfx/music.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.concat([header, data]));
console.log(`✓ ${out}  ${(N / SR).toFixed(1)} s, crête d'origine ${peak.toFixed(2)}`);
console.log(`  ouverture : logo ${LOGO.toFixed(2)}, photo ${PHOTO0.toFixed(2)}–${PHOTO.toFixed(2)}, cadre posé ${LAND.toFixed(2)}, légende ${CAP.toFixed(2)} (temps)`);
const dB = (e) => (10 * Math.log10(e / N / 2 + 1e-12)).toFixed(1);
console.log('  énergie par instrument (dB, avant réverbération) : ' + Object.entries(energy).map(([k, e]) => `${k} ${dB(e)}`).join(', '));
