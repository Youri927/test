// Musique originale de la présentation Castor Dental Associates, synthétisée de zéro (aucun échantillon, aucun droit tiers).
// 90 BPM, en ré majeur, calme et lumineuse, une musique de bord de mer : piano électrique (FM) qui accompagne à contretemps,
// guitare pincée (Karplus-Strong), nappe, basse ronde à la brésilienne, batterie douce (cross-stick, shaker), et des
// maillets de verre et des cloches pour les gestes. Pas de bruitages.
// - L'ouverture : l'enseigne seule sur le blanc, un accord de piano, tout est feutré ; la photo apparaît autour des lettres :
//   une montée de verre, le filtre s'ouvre ; l'enseigne se pose sur la vraie, sur un temps : l'accord de ré s'épanouit,
//   avec des cloches. Le groove arrive avec la légende.
// - Les trois étapes du cas s'allument : chacune a sa note, à l'image près (relevé du plan d-straight).
// - Les gestes filmés (un soin qui s'ouvre, une définition, un visage, un sujet, la barre d'appel, un mot touché)
//   sont soulignés d'un maillet ou d'une cloche, à l'image près (relevés des plans).
// - La scène de l'équipe, devant la haie, passe à moitié dans un filtre ; tout se rouvre pour les avis.
// Les temps des scènes viennent de src/beats.ts, les repères des gestes de public/site/*.json.
// Usage : node sound/music.mjs  →  public/sfx/music.wav
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCENE_BEATS, OPEN, EVENTS, END, PHONE_TIMING, BEAT as FR} from '../src/beats.ts';

const here = dirname(fileURLToPath(import.meta.url));
const SR = 44100;
const BPM = 90;
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
/** repères relevés d'un plan (image du plan où l'état change), avec une valeur de secours */
const marks = (name) => {
  const file = resolve(here, `../public/site/${name}.json`);
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).marks || {} : {};
};
const mark = (name, key, fallback) => marks(name)[key] ?? fallback;

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const n = (name) => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  const base = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]];
  return midi(12 * (Number(m[3]) + 1) + base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0));
};
let seed = 20140401;
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

// ——— Accords (voix du piano, de la guitare et de la nappe) et basse, en ré majeur ———
const CH = {
  Dmaj9: {v: ['F#3', 'A3', 'C#4', 'E4'], b: 'D2'},
  D69: {v: ['F#3', 'B3', 'E4', 'A4'], b: 'D2'},
  Bm9: {v: ['A3', 'C#4', 'D4', 'F#4'], b: 'B1'},
  Gmaj9: {v: ['B3', 'D4', 'F#4', 'A4'], b: 'G1'},
  Gmaj7: {v: ['B3', 'D4', 'F#4'], b: 'G1'},
  Em9: {v: ['G3', 'B3', 'D4', 'F#4'], b: 'E1'},
  Fsm7: {v: ['E3', 'A3', 'C#4'], b: 'F#1'},
  Asus: {v: ['G3', 'A3', 'D4', 'E4'], b: 'A1'},
  A13: {v: ['G3', 'C#4', 'F#4'], b: 'A1'},
  GA: {v: ['G3', 'B3', 'D4', 'E4'], b: 'A1'},
};

// L'ouverture (scène Open, images → temps) : l'enseigne seule de 0 à HOLD, puis l'ouverture du site joue ;
// la photo apparaît de PHOTO0 à PHOTO1 (relevé du plan : 1 % à 100 % d'opacité), l'enseigne se pose sur la vraie à LAND
// (un temps entier), tout est en place à SETTLE ; le navigateur se range de côté à ASIDE ; la légende et le groove à CAP
const HOLD = fb(OPEN.hold);
const PHOTO0 = fb(OPEN.hold + 31);
const PHOTO1 = fb(OPEN.hold + 84);
const LAND = fb(OPEN.land);
const SETTLE = fb(OPEN.settle);
const ASIDE = fb(OPEN.aside);
const CAP = fb(OPEN.cap);

// Grille : chaque scène commence sur un accord ; l'enseigne se pose sur ré
const PROG = [
  // l'enseigne seule, puis la photo qui apparaît : sol, puis la suspension de la, qui se résout sur ré quand elle se pose
  [0, 'Gmaj9'], [2, 'Asus'], [LAND, 'Dmaj9'], [LAND + 2, 'Bm9'],
  // le navigateur se range, la légende arrive avec le groove
  [CAP, 'Gmaj9'], [CAP + 2, 'A13'], [CAP + 4, 'Dmaj9'], [CAP + 6, 'GA'],
  // l'orthodontie cachée : les étapes s'allument sur fa dièse mineur, puis sol
  [S.Straight, 'Dmaj9'], [S.Straight + 2, 'Fsm7'], [S.Straight + 4, 'Gmaj9'], [S.Straight + 6, 'Em9'], [S.Straight + 8, 'GA'],
  // les soins
  [S.Care, 'Gmaj9'], [S.Care + 2, 'Asus'], [S.Care + 4, 'Dmaj9'], [S.Care + 6, 'Bm9'], [S.Care + 8, 'GA'],
  // l'équipe, devant la haie (plus sombre)
  [S.Team, 'Bm9'], [S.Team + 4, 'Gmaj9'], [S.Team + 6, 'Em9'], [S.Team + 8, 'GA'],
  // les avis
  [S.Reviews, 'Dmaj9'], [S.Reviews + 4, 'Bm9'], [S.Reviews + 6, 'GA'],
  // la visite
  [S.Visit, 'Gmaj9'], [S.Visit + 4, 'Em9'], [S.Visit + 6, 'GA'],
  // téléphones
  [S.Mobile, 'Dmaj9'], [S.Mobile + 4, 'Bm9'], [S.Mobile + 6, 'Gmaj9'], [S.Mobile + 8, 'GA'],
  // fin
  [S.End, 'Gmaj9'], [S.End + 2, 'D69'],
];
const chordAt = (beat) => {
  let c = PROG[0];
  for (const p of PROG) if (beat >= p[0] - 1e-9) c = p;
  return c;
};

const padGain = (b) => env(b, [
  [0, 0], [0.8, 0.26], [PHOTO0, 0.3], [LAND, 0.4], [CAP, 0.2], [S.Straight, 0.13],
  [S.Team, 0.2], [S.Reviews, 0.12], [S.End, 0.3], [S.End + 2, 0.4], [TOTAL_BEATS + 3, 0],
]);

// ——— Nappe : sinus et triangles désaccordés, attaque lente ———
{
  let cur = null;
  let prev = null;
  let xf = 1;
  const XF = SR * 1.0;
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
          const f = f0 * Math.pow(2, (d * 0.07) / 12);
          const ph = f * t + k * 0.29 + (d > 0 ? 0.5 : 0) + 0.004 * Math.sin(t * (0.31 + k * 0.13));
          const fr = ph - Math.floor(ph);
          const tri = 1 - 4 * Math.abs(fr - 0.5);
          const x = (0.7 * Math.sin(2 * Math.PI * ph) + 0.3 * tri) * w * 0.1;
          if (d < 0) sl += x; else sr += x;
        }
      });
    }
    const a = 0.07;
    lp[0] += (sl - lp[0]) * a;
    lp[1] += (sr - lp[1]) * a;
    add(i, lp[0] * g, lp[1] * g, 1.1);
  }
}

// ——— Guitare pincée (Karplus-Strong : une impulsion de bruit doux qui tourne dans une ligne à retard amortie) ———
const addPluck = (t0, freq, gain, pan, len = 1.8, bright = 0.2, groove = true) => {
  TAG = 'guitare';
  const i0 = Math.floor(t0 * SR);
  const P = Math.max(2, Math.round(SR / freq));
  const buf = new Float32Array(P);
  let lp = 0;
  for (let k = 0; k < P; k++) {
    lp += (rnd() * 2 - 1 - lp) * bright;
    buf[k] = lp;
  }
  const mean = buf.reduce((a, v) => a + v, 0) / P;
  for (let k = 0; k < P; k++) buf[k] -= mean;
  let idx = 0;
  let soft = 0;
  const total = Math.floor(SR * len);
  const fade = Math.floor(SR * 0.12);
  for (let j = 0; j < total; j++) {
    const cur = buf[idx];
    const nxt = buf[(idx + 1) % P];
    buf[idx] = 0.4985 * (cur + nxt);
    idx = (idx + 1) % P;
    // un passe-bas doux en sortie : le pincé reste rond, sans attaque qui grésille
    soft += (cur - soft) * 0.33;
    const e = (j < 40 ? j / 40 : 1) * (j > total - fade ? (total - j) / fade : 1);
    const s = soft * gain * e * 3.6;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.32, groove);
  }
};

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
const addEP = (t0, names, gain, len, bright = 0.8, groove = true, spread = 0.014) => {
  TAG = 'piano';
  for (const [k, nm] of names.entries()) {
    const f = n(nm);
    const i0 = Math.floor((t0 + k * spread) * SR);
    const pan = 0.34 + 0.32 * (k / Math.max(1, names.length - 1));
    const total = SR * (len + 0.6);
    const ph0 = rnd() * 6.28;
    for (let j = 0; j < total; j++) {
      const t = j / SR;
      const rel = t > len ? Math.exp(-(t - len) * 8) : 1;
      const att = t < 0.003 ? t / 0.003 : 1;
      const idx = bright * (0.3 + 1.6 * Math.exp(-t * 3));
      const mod = Math.sin(2 * Math.PI * f * t + ph0);
      const s = Math.sin(2 * Math.PI * f * t + idx * mod) * Math.exp(-t * (1.1 + f / 1500)) * gain * att * rel;
      if (Math.abs(s) < 1e-6 && t > len) break;
      add(i0 + j, s * (1 - pan), s * pan, 0.4, groove);
    }
  }
};

// ——— Basse ronde ———
const addBass = (t0, freq, gain, len, groove = true) => {
  TAG = 'basse';
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * (len + 0.06); j++) {
    const t = j / SR;
    ph += freq / SR;
    ph -= Math.floor(ph);
    const a = gain * (t < 0.008 ? t / 0.008 : 1) * (0.6 * Math.exp(-t * 1.6) + 0.4) * (t > len ? Math.max(0, 1 - (t - len) / 0.06) : 1);
    const s = Math.tanh((Math.sin(2 * Math.PI * ph) + 0.2 * Math.sin(4 * Math.PI * ph) * Math.exp(-t * 7)) * 1.3) * a;
    add(i0 + j, s, s, 0, groove);
  }
};

// ——— Batterie douce ———
const addKick = (t0, gain, groove = true) => {
  TAG = 'grosse caisse';
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.5; j++) {
    const t = j / SR;
    const f = 46 + 70 * Math.exp(-t * 28);
    ph += (2 * Math.PI * f) / SR;
    const s = (Math.sin(ph) * Math.exp(-t * 6.5) + (t < 0.002 ? (rnd() - 0.5) * 0.2 : 0)) * gain * (t < 0.003 ? t / 0.003 : 1);
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
/** le cross-stick : le bord de la caisse claire, sec et boisé */
const addRim = (t0, gain, pan = 0.55, groove = true) => {
  TAG = 'cross-stick';
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.12; j++) {
    const t = j / SR;
    const s = (band(st, rnd() * 2 - 1, 1900, 0.5) * Math.exp(-t * 66) * 0.7 + Math.sin(2 * Math.PI * 690 * t) * Math.exp(-t * 52) * 0.55) * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.3, groove);
  }
};
/** un balai sur la caisse claire : un souffle bref et doux */
const addBrush = (t0, gain, pan = 0.5) => {
  TAG = 'balai';
  const i0 = Math.floor(t0 * SR);
  const st = [svf(), svf()];
  for (let j = 0; j < SR * 0.22; j++) {
    const t = j / SR;
    const e = (t < 0.012 ? t / 0.012 : 1) * Math.exp(-t * 18);
    add(i0 + j, band(st[0], rnd() * 2 - 1, 3200, 1.1) * e * gain * (1 - pan) * 2, band(st[1], rnd() * 2 - 1, 3000, 1.1) * e * gain * pan * 2, 0.4, true);
  }
};
const addShaker = (t0, gain, pan) => {
  TAG = 'shaker';
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.08; j++) {
    const t = j / SR;
    const e = (t < 0.01 ? t / 0.01 : 1) * Math.exp(-t * 55);
    const s = band(st, rnd() * 2 - 1, 7400, 0.7) * e * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.12, true);
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
// les mesures repartent au début de chaque scène (dans l'ouverture : avec la légende)
const anchor = (b) => (sceneOf(b) === 'Open' ? CAP : S[sceneOf(b)]);
const grooveOn = (b) => b >= CAP && b < S.End;
const hedge = (b) => b >= S.Team && b < S.Reviews;
// intensité de la batterie : 0 = rien, 1 = complet ; elle entre à demi avec la légende, complète à l'orthodontie
const drums = (b) => {
  if (b < CAP || b >= S.End) return 0;
  if (b < S.Straight) return 0.6;
  return hedge(b) ? 0.75 : 1;
};
// le motif du verre (ré pentatonique), sur deux mesures : il monte, se balance, puis retombe ; pendant les avis
const HOOK = [[0, 'A4'], [0.5, 'B4'], [1, 'D5'], [2, 'F#5'], [2.5, 'E5'], [3.5, 'D5'], [4, 'B4'], [4.5, 'D5'], [5.5, 'E5'], [6.5, 'A4']];
const hookOn = (b) => b >= S.Reviews && b < S.Reviews + 8;
// la guitare : un arpège clairsemé, surtout à contretemps (la basse à l'octave, puis les voix)
const PLUCK_AT = {0.5: 0, 1: 2, 1.75: 1, 2.5: 3, 3: 2, 3.5: 4};

for (let s16 = 0; s16 < TOTAL_BEATS * 4; s16++) {
  const b = s16 / 4;
  const t = at(b);
  const [start, name] = chordAt(b);
  const c = CH[name];
  const bar = (((b - anchor(b)) % 4) + 4) % 4;
  const d = drums(b);

  if (grooveOn(b)) {
    // piano électrique : l'accord posé au changement, puis des accords brefs à contretemps (le « et » du 1, et le 3)
    if (isStart(b, start)) addEP(t, c.v, 0.028, BEAT * 1.4, 0.7);
    else if (bar === 0.5 || bar === 2) addEP(t, c.v, 0.022, BEAT * 0.38, 0.55, true, 0.008);
    // guitare : l'accord égrené au changement, puis l'arpège clairsemé
    if (isStart(b, start)) c.v.forEach((nm, k) => addPluck(t + k * 0.02, n(nm), 0.036, 0.3 + 0.4 * (k / (c.v.length - 1)), 2.2));
    else if (PLUCK_AT[bar] !== undefined && d >= 0.75) {
      const seq = [n(c.b) * 4, ...c.v.map(n)];
      const k = PLUCK_AT[bar] % seq.length;
      addPluck(t, seq[k], 0.038, k % 2 ? 0.66 : 0.36, 1.3);
    }
    // basse, à la brésilienne : la fondamentale sur le 1, la quinte sur le « et » de 2, la fondamentale sur le 3,
    // et une note de passage avant la mesure suivante
    const root = n(c.b) * 2;
    if (bar === 0 || isStart(b, start)) addBass(t, root, 0.25, BEAT * 1.2);
    if (bar === 1.5 && d > 0.5) addBass(t, root * 1.5, 0.13, BEAT * 0.4);
    if (bar === 2 && d > 0.5 && !isStart(b, start)) addBass(t, root, 0.21, BEAT * 1.1);
    if (bar === 3.5 && d > 0.5) addBass(t, root * 2, 0.09, BEAT * 0.35);
  }
  if (d > 0) {
    if (bar === 0) addKick(t, 0.34 * Math.min(1, d + 0.2));
    if (bar === 1.5 && d >= 0.75) addKick(t, 0.2);
    if (bar === 2.5 && d >= 1) addKick(t, 0.16);
    if (bar === 1 || bar === 3) addRim(t, d >= 1 ? 0.085 : 0.065);
    if (d >= 1 && bar === 3) addBrush(t, 0.05, 0.6);
    addShaker(t, (s16 % 2 === 1 ? 0.046 : 0.018) * d, s16 % 2 === 1 ? 0.62 : 0.4);
  }
  // le motif de verre
  if (hookOn(b)) {
    const pos = (((b - S.Reviews) % 8) + 8) % 8;
    for (const [p, nm] of HOOK) if (Math.abs(pos - p) < 1e-9) addGlass(t, n(nm), 0.05, 0.5 + 0.18 * Math.sin(p * 1.7), 1.2, true);
  }

  // — l'ouverture, avant le groove : le piano pose chaque accord, une guitare égrène doucement, une basse lointaine —
  if (b < CAP) {
    if (isStart(b, start)) {
      addEP(t, c.v, 0.026, BEAT * 1.9, 0.6, false);
      addBass(t, n(c.b) * 2, b < LAND ? 0.12 : 0.18, BEAT * 1.8, false);
    } else if (b >= LAND && s16 % 2 === 0) {
      const seq = [n(c.b) * 4, ...c.v.map(n)];
      addPluck(t, seq[[0, 2, 1, 3][(s16 / 2) % 4] % seq.length], 0.04, (s16 / 2) % 2 ? 0.62 : 0.38, 1.6, 0.3, false);
    }
  }
  // — fin : l'accord se pose —
  if (b >= S.End && isStart(b, start)) {
    c.v.forEach((nm, k) => addPluck(t + k * 0.03, n(nm), 0.05, 0.3 + 0.4 * (k / (c.v.length - 1)), 3.2, 0.3, false));
    addEP(t, c.v, 0.03, BEAT * 3, 0.6, false);
    addBass(t, n(c.b) * 2, 0.24, isStart(b, S.End + 2) ? 4 : BEAT * 3.2, false);
  }
}

// ——— Une cascade de verre en doubles croches, de gauche à droite, qui monte peu à peu ———
const PENTA = ['D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6'];
const cascade = (b0, b1, gain, lift = 6, from = 2) => {
  const steps = Math.round((b1 - b0) * 4);
  for (let k = 0; k <= steps; k++) {
    const u = k / Math.max(1, steps);
    const idx = Math.min(PENTA.length - 1, from + Math.round(u * lift + (rnd() - 0.5) * 2.2));
    addGlass(at(b0 + k / 4), n(PENTA[Math.max(0, idx)]), gain * (0.75 + 0.25 * Math.sin(u * Math.PI)), 0.12 + 0.76 * u, 1.0);
  }
};

// l'enseigne seule sur le blanc : un reflet de verre sur l'accord de piano
addGlass(at(0) + 0.05, n('F#5'), 0.026, 0.6, 1.6);
// la photo apparaît autour des lettres : une montée de verre (le filtre général s'ouvre sur la même durée)
cascade(Math.round(PHOTO0 * 4) / 4, Math.floor(LAND * 4) / 4 - 0.25, 0.03, 8, 1);
// l'enseigne se pose sur la vraie : l'accord de ré s'épanouit, avec trois cloches
addKick(at(LAND), 0.3, false);
['D3', 'A3', 'E4', 'F#4', 'C#5'].forEach((nm, k) => addPluck(at(LAND) + k * 0.018, n(nm), 0.055, 0.25 + 0.12 * k, 3.2, 0.4, false));
for (const [nm, g, pan, dt] of [['D5', 0.04, 0.38, 0], ['F#5', 0.034, 0.56, 0.03], ['A5', 0.028, 0.66, 0.06]]) addBell(at(LAND) + dt, n(nm), g, pan, 3.6);
// le navigateur se range de côté : la nappe gonfle (voir padGain) et deux notes de verre l'accompagnent
addGlass(at(ASIDE), n('A5'), 0.026, 0.4, 1.3);
addGlass(at(ASIDE) + at(0.5), n('D6'), 0.022, 0.62, 1.3);
// la légende : le groove entre sur un coup de grosse caisse
addKick(at(CAP), 0.3, false);

// l'orthodontie : les trois étapes du cas s'allument ; chacune a sa note, à l'image près (relevé du plan)
{
  const steps = [['step1', 82], ['step2', 121], ['step3', 159]].map(([k, f]) => mark('d-straight', k, f));
  const DYADS = [['D5', 'F#5'], ['E5', 'A5'], ['F#5', 'B5']];
  steps.forEach((f, k) => {
    const t = at(S.Straight + fb(f));
    addGlass(t, n(DYADS[k][0]), 0.036, 0.36 + 0.14 * k, 1.3);
    addGlass(t + 0.012, n(DYADS[k][1]), 0.028, 0.5 + 0.14 * k, 1.3);
  });
}
// les soins : le soin s'ouvre (un maillet), puis chaque définition (une cloche douce, puis un maillet)
{
  const e = EVENTS.care;
  addGlass(at(S.Care + fb(mark('d-care', 'open', e.open * FR))), n('A5'), 0.04, 0.42, 1.2);
  addBell(at(S.Care + fb(mark('d-care', 'crown', e.crown * FR))), n('D6'), 0.024, 0.55, 2.6);
  addGlass(at(S.Care + fb(mark('d-care', 'bridge', e.bridge * FR))), n('E6'), 0.032, 0.62, 1.2);
}
// l'équipe : Denise, puis Amanda ; un maillet pour chaque visage
['denise', 'amanda'].forEach((k, i) => addGlass(at(S.Team + fb(mark('d-team', k, EVENTS.team[i] * FR))), n(['F#5', 'B5'][i]), 0.036, 0.4 + 0.2 * i, 1.2));
// la visite : « Something hurts », et la note qui renvoie au téléphone (deux notes)
{
  const t = at(S.Visit + fb(mark('d-visit', 'urgent', EVENTS.visit * FR)));
  addGlass(t, n('A5'), 0.036, 0.45, 1.2);
  addGlass(t + at(0.5), n('D6'), 0.03, 0.58, 1.2);
}
// au téléphone : l'enseigne se pose (des cloches), Denise et Amanda (des maillets), la barre d'appel monte (deux notes),
// le mot touché (une cloche)
{
  const mOpen = S.Mobile + fb(PHONE_TIMING.mOpen.delay + (OPEN.land - OPEN.hold));
  addBell(at(mOpen), n('D5'), 0.03, 0.36, 3.4);
  addBell(at(mOpen) + 0.03, n('A5'), 0.022, 0.5, 3.4);
  const e = EVENTS.mobile;
  addGlass(at(S.Mobile + fb(mark('m-team', 'denise', e.denise * FR))), n('F#5'), 0.034, 0.5, 1.1);
  addGlass(at(S.Mobile + fb(mark('m-team', 'amanda', e.amanda * FR))), n('B5'), 0.034, 0.55, 1.1);
  const dock = at(S.Mobile + fb(mark('m-dock', 'dock', 208)));
  addGlass(dock, n('E5'), 0.026, 0.62, 1.0);
  addGlass(dock + at(0.25), n('A5'), 0.026, 0.68, 1.0);
  addBell(at(S.Mobile + fb(mark('m-dock', 'lingual', e.lingual * FR))), n('E6'), 0.022, 0.66, 2.6);
}
// fin : l'enseigne monte (une cloche), des éclats de verre, puis les cloches sur ré
addKick(at(S.End), 0.34, false);
addBell(at(S.End + fb(END.mark)), n('A5'), 0.03, 0.5, 4);
cascade(S.End + 0.5, S.End + 3.5, 0.028, 8, 2);
{
  const t1 = at(S.End + 2);
  for (const [nm, g, pan, dt] of [['D5', 0.05, 0.35, 0], ['F#5', 0.042, 0.62, 0.02], ['A5', 0.036, 0.45, 0.04], ['E6', 0.026, 0.7, 0.06], ['F#6', 0.02, 0.3, 0.08]]) addBell(t1 + dt, n(nm), g, pan, 5);
}

// ——— La scène de l'équipe, devant la haie : le groove passe dans un passe-bas qui se referme à moitié, puis se rouvre ———
const cutoff = (b) => env(b, [[0, 17000], [S.Team - 0.3, 17000], [S.Team + 0.5, 3800], [S.Reviews - 0.6, 3800], [S.Reviews, 17000]]);
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

// ——— L'enseigne seule sur le blanc : tout passe dans un passe-bas qui s'entrouvre, puis s'ouvre en grand pendant que la
// photo apparaît et que l'enseigne se pose (de PHOTO0 à LAND) ———
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
console.log(`  ouverture : photo ${PHOTO0.toFixed(2)}–${PHOTO1.toFixed(2)}, pose ${LAND.toFixed(2)} (calée ${SETTLE.toFixed(2)}), légende et groove ${CAP.toFixed(2)} (temps)`);
const dB = (e) => (10 * Math.log10(e / N / 2 + 1e-12)).toFixed(1);
console.log('  énergie par instrument (dB, avant réverbération) : ' + Object.entries(energy).map(([k, e]) => `${k} ${dB(e)}`).join(', '));
