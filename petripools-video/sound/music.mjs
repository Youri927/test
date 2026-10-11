// Musique originale de la présentation Petri Pools, synthétisée de zéro (aucun échantillon, aucun droit tiers).
// 100 BPM, en ré majeur, chaleureuse et claire : guitare pincée (Karplus-Strong), nappe, basse ronde, batterie douce,
// et des maillets de verre, comme les carreaux de la mosaïque.
// - L'ancien site : la musique est étouffée ; l'eau monte, le filtre s'ouvre et une montée de verre arrive sur le temps
//   où le nouveau site apparaît.
// - Chaque fois qu'une mosaïque se pose à l'image (la frise de l'accueil, « PETRI » du pied de page, la frise de la fin),
//   une cascade de verre la suit, de gauche à droite dans le stéréo, comme la pose.
// - Les gestes filmés (clics, ligne d'eau, photos qui changent) tombent sur des temps : un maillet les souligne.
// Les temps des scènes et des gestes viennent de src/beats.ts.
// Usage : node sound/music.mjs  →  public/sfx/music.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCENE_BEATS, OPEN, EVENTS, BEAT as FR} from '../src/beats.ts';

const SR = 44100;
const BPM = 100;
const BEAT = 60 / BPM;
const TOTAL_BEATS = SCENE_BEATS.reduce((n, [, b]) => n + b, 0);
const TAIL = 4;
const N = Math.ceil((TOTAL_BEATS * BEAT + TAIL) * SR);
// trois bus : le groove (filtré dans la scène sombre), le reste, et l'envoi vers la réverbération
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

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const n = (name) => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  const base = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]];
  return midi(12 * (Number(m[3]) + 1) + base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0));
};
let seed = 20000601;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
// énergie de chaque instrument, pour vérifier l'équilibre du mélange (affichée à la fin)
const energy = {};
let TAG = 'nappe';
/** ajoute un échantillon ; groove = passe par le filtre de la scène sombre */
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

// ——— Accords (voix de la guitare et de la nappe) et basse, en ré majeur ———
const CH = {
  Dmaj9: {v: ['F#3', 'A3', 'C#4', 'E4'], b: 'D2'},
  D69: {v: ['F#3', 'B3', 'E4', 'A4'], b: 'D2'},
  Bm9: {v: ['D3', 'F#3', 'A3', 'C#4'], b: 'B1'},
  Gmaj9: {v: ['B3', 'D4', 'F#4', 'A4'], b: 'G1'},
  Gmaj7: {v: ['B3', 'D4', 'F#4'], b: 'G1'},
  Em9: {v: ['G3', 'B3', 'D4', 'F#4'], b: 'E2'},
  Fsm7: {v: ['E3', 'A3', 'C#4'], b: 'F#1'},
  Asus: {v: ['G3', 'A3', 'D4', 'E4'], b: 'A1'},
  A13: {v: ['G3', 'C#4', 'F#4'], b: 'A1'},
  GA: {v: ['G3', 'B3', 'D4', 'E4'], b: 'A1'},
  DFs: {v: ['A3', 'D4', 'E4', 'F#4'], b: 'F#1'},
};

// L'ouverture (scène Open) : l'ancien site, l'eau monte de WATER à SITE, le nouveau site arrive sur SITE (un début de mesure),
// la frise se pose de LAY à SET, puis le reflet passe
const WATER = fb(OPEN.water);
const SITE = fb(OPEN.site);
const LAY = fb(OPEN.lay);
const SET = fb(OPEN.set);

// Grille : chaque scène commence sur un accord
const PROG = [
  // l'ancien site, étouffé
  [0, 'Gmaj7'], [2, 'Asus'],
  // le nouveau site
  [SITE, 'Dmaj9'], [SITE + 4, 'Bm9'], [SITE + 6, 'Gmaj9'], [SITE + 8, 'Dmaj9'], [SITE + 10, 'Gmaj9'], [S.Refill - 2, 'Asus'], [S.Refill - 1, 'A13'],
  // l'avant/après
  [S.Refill, 'Dmaj9'], [S.Refill + 4, 'Bm9'], [S.Refill + 6, 'Gmaj9'], [S.Refill + 10, 'Asus'],
  // les quatre changements
  [S.Changes, 'Em9'], [S.Changes + 2, 'Fsm7'], [S.Changes + 4, 'Gmaj9'], [S.Changes + 6, 'A13'],
  // le local technique
  [S.Pad, 'Dmaj9'], [S.Pad + 4, 'Bm9'], [S.Pad + 6, 'Gmaj9'], [S.Pad + 10, 'Asus'],
  // le déroulé (sombre)
  [S.Process, 'Bm9'], [S.Process + 4, 'Gmaj9'], [S.Process + 6, 'GA'],
  // les avis
  [S.Reviews, 'Dmaj9'], [S.Reviews + 4, 'Fsm7'], [S.Reviews + 6, 'Gmaj9'], [S.Reviews + 10, 'A13'],
  // l'entreprise, le devis, « PETRI »
  [S.Close, 'Gmaj9'], [S.Close + 2, 'A13'], [S.Close + 4, 'Bm9'], [S.Close + 6, 'DFs'], [S.Close + 8, 'Gmaj9'], [S.Close + 10, 'Asus'], [S.Close + 11, 'A13'],
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

// ——— Nappe : sinus et triangles désaccordés, attaque lente ———
const padGain = (b) => env(b, [
  [0, 0], [0.6, 0.3], [SITE - 0.3, 0.34], [SITE, 0.16], [S.Refill, 0.13],
  [S.Process, 0.2], [S.Reviews, 0.12], [S.End, 0.3], [S.End + 2, 0.4], [TOTAL_BEATS + 3, 0],
]);
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
  // retire la composante continue de l'impulsion
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
    // un passe-bas doux en sortie (vers 2,5 kHz) : le pincé reste rond, sans attaque qui grésille
    soft += (cur - soft) * 0.33;
    const e = (j < 40 ? j / 40 : 1) * (j > total - fade ? (total - j) / fade : 1);
    const s = soft * gain * e * 3.6;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.32, groove);
  }
};

// ——— Maillet de verre (un carreau : la note, deux partiels inharmoniques qui s'éteignent vite) ———
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

// ——— Piano électrique (FM, doux), pour poser certains accords ———
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
const addBass = (t0, freq, gain, len) => {
  TAG = 'basse';
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * (len + 0.06); j++) {
    const t = j / SR;
    ph += freq / SR;
    ph -= Math.floor(ph);
    const a = gain * (t < 0.008 ? t / 0.008 : 1) * (0.6 * Math.exp(-t * 1.6) + 0.4) * (t > len ? Math.max(0, 1 - (t - len) / 0.06) : 1);
    const s = Math.tanh((Math.sin(2 * Math.PI * ph) + 0.2 * Math.sin(4 * Math.PI * ph) * Math.exp(-t * 7)) * 1.3) * a;
    add(i0 + j, s, s);
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
const addRim = (t0, gain, pan = 0.55, groove = true) => {
  TAG = 'rim';
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.12; j++) {
    const t = j / SR;
    const s = (band(st, rnd() * 2 - 1, 2100, 0.5) * Math.exp(-t * 62) * 0.8 + Math.sin(2 * Math.PI * 760 * t) * Math.exp(-t * 48) * 0.5) * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.3, groove);
  }
};
const addSnap = (t0, gain) => {
  TAG = 'claquement';
  const i0 = Math.floor(t0 * SR);
  const st = [svf(), svf()];
  for (let j = 0; j < SR * 0.18; j++) {
    const t = j / SR;
    const e = (t < 0.004 ? t / 0.004 : 1) * Math.exp(-t * 34);
    add(i0 + j, band(st[0], rnd() * 2 - 1, 2400, 0.8) * e * gain, band(st[1], rnd() * 2 - 1, 2300, 0.8) * e * gain, 0.45, true);
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
// les mesures repartent au début de chaque scène (dans l'ouverture : à l'arrivée du nouveau site)
const anchor = (b) => (sceneOf(b) === 'Open' ? SITE : S[sceneOf(b)]);
const grooveOn = (b) => b >= SITE && b < S.End;
const dark = (b) => b >= S.Process && b < S.Reviews;
// intensité de la batterie : 0 = rien, 1 = complet
const drums = (b) => {
  if (b < SITE || b >= S.End) return 0;
  if (b < SITE + 4) return 0.6;
  return dark(b) ? 0.75 : 1;
};
// le motif du verre (ré pentatonique), sur deux mesures : il monte, puis retombe
const HOOK = [[0, 'A4'], [0.5, 'B4'], [1, 'D5'], [1.5, 'E5'], [2.5, 'F#5'], [3, 'E5'], [4, 'D5'], [4.5, 'E5'], [5.5, 'B4'], [6.5, 'A4']];
const hookOn = (b) => (b >= S.Reviews && b < S.Reviews + 4) || (b >= S.Mobile && b < S.Mobile + 8);
const hookRef = (b) => (b < S.Mobile ? S.Reviews : S.Mobile);

for (let s16 = 0; s16 < TOTAL_BEATS * 4; s16++) {
  const b = s16 / 4;
  const t = at(b);
  const [start, name] = chordAt(b);
  const c = CH[name];
  const bar = (((b - anchor(b)) % 4) + 4) % 4;
  const d = drums(b);

  if (grooveOn(b)) {
    // guitare : l'accord égrené au début de chaque accord, puis un arpège en croches (la basse à l'octave, puis les voix)
    if (isStart(b, start)) c.v.forEach((nm, k) => addPluck(t + k * 0.018, n(nm), 0.07, 0.3 + 0.4 * (k / (c.v.length - 1)), 2.2));
    else if (s16 % 2 === 0) {
      const seq = [n(c.b) * 4, ...c.v.map(n)];
      const k = [0, 2, 1, 3, 2, 4, 3, 1][Math.round((b - anchor(b)) * 2) % 8] % seq.length;
      addPluck(t, seq[k], 0.058 * (bar === 0 ? 1.1 : 1), k % 2 ? 0.64 : 0.36, 1.4);
    }
    // piano électrique doux sur les changements d'accord
    if (isStart(b, start)) addEP(t, c.v, 0.022, BEAT * 1.6, 0.7);
    // basse : fondamentale sur le 1, rappel sur le « et » de 2, la quinte avant la mesure suivante
    const root = n(c.b) * 2;
    if (bar === 0 || isStart(b, start)) addBass(t, root, 0.26, BEAT * 1.3);
    if (bar === 1.5 && d > 0.5) addBass(t, root, 0.14, BEAT * 0.45);
    if (bar === 3.5 && d > 0.5) addBass(t, root * 1.5, 0.1, BEAT * 0.35);
  }
  if (d > 0) {
    if (bar === 0 || (bar === 2.5 && d >= 0.75)) addKick(t, 0.34 * Math.min(1, d + 0.2));
    if (bar === 1 || bar === 3) (d >= 1 ? addSnap : addRim)(t, d >= 1 ? 0.1 : 0.07);
    addShaker(t, (s16 % 2 === 1 ? 0.05 : 0.02) * d, s16 % 2 === 1 ? 0.62 : 0.4);
    if (d >= 1 && bar === 3.75) addRim(t, 0.026, 0.72);
  }
  // le motif de verre
  if (hookOn(b)) {
    const pos = (((b - hookRef(b)) % 8) + 8) % 8;
    for (const [p, nm] of HOOK) if (Math.abs(pos - p) < 1e-9) addGlass(t, n(nm), 0.05, 0.5 + 0.18 * Math.sin(p * 1.7), 1.2, true);
  }

  // — l'ancien site : guitare seule, étouffée (le filtre général s'ouvre quand l'eau monte) —
  if (b < SITE) {
    if (isStart(b, start)) c.v.forEach((nm, k) => addPluck(t + k * 0.03, n(nm), 0.07, 0.3 + 0.4 * (k / (c.v.length - 1)), 2.6, 0.3, false));
    else if (s16 % 2 === 0) {
      const seq = [n(c.b) * 4, ...c.v.map(n)];
      addPluck(t, seq[[0, 2, 1, 3][(s16 / 2) % 4] % seq.length], 0.05, (s16 / 2) % 2 ? 0.62 : 0.38, 1.6, 0.3, false);
    }
  }
  // — fin : l'accord se pose —
  if (b >= S.End) {
    if (isStart(b, start)) {
      c.v.forEach((nm, k) => addPluck(t + k * 0.03, n(nm), 0.06, 0.3 + 0.4 * (k / (c.v.length - 1)), 3.2, 0.3, false));
      addEP(t, c.v, 0.03, BEAT * 3, 0.6, false);
      addBass(t, n(c.b) * 2, 0.24, BEAT * 3.2);
    }
  }
}

// ——— Les mosaïques qui se posent : une cascade de verre en doubles croches, de gauche à droite, qui monte peu à peu ———
const PENTA = ['D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6'];
const cascade = (b0, b1, gain, lift = 6, from = 2) => {
  const steps = Math.round((b1 - b0) * 4);
  for (let k = 0; k <= steps; k++) {
    const u = k / Math.max(1, steps);
    // un peu de désordre, comme l'ordre de pose du site, mais une pente qui monte
    const idx = Math.min(PENTA.length - 1, from + Math.round(u * lift + (rnd() - 0.5) * 2.2));
    addGlass(at(b0 + k / 4), n(PENTA[Math.max(0, idx)]), gain * (0.75 + 0.25 * Math.sin(u * Math.PI)), 0.12 + 0.76 * u, 1.0);
  }
};

// l'eau monte sur l'ancien site : des croches de verre qui montent, puis des doubles croches, jusqu'au nouveau site
{
  const notes = ['D4', 'F#4', 'A4', 'D5', 'E5', 'F#5', 'A5', 'B5', 'D6'];
  const times = [WATER, WATER + 0.5, WATER + 1, WATER + 1.5, WATER + 1.75, WATER + 2, WATER + 2.25, WATER + 2.375].filter((x) => x < SITE);
  times.forEach((x, k) => addGlass(at(x), n(notes[k]), 0.04 + 0.006 * k, 0.4 + 0.03 * k, 1.1));
}
// le nouveau site arrive : un coup sourd, la basse et l'accord ouvert
addKick(at(SITE), 0.36, false);
addBass(at(SITE), n('D2') * 2, 0.27, BEAT * 3.4);
['D3', 'A3', 'E4', 'F#4', 'C#5'].forEach((nm, k) => addPluck(at(SITE) + k * 0.016, n(nm), 0.064, 0.25 + 0.12 * k, 3, 0.4, false));
// la frise de l'accueil se pose, puis le reflet passe : deux cloches douces
cascade(Math.ceil(LAY * 4) / 4, Math.floor(SET * 4) / 4, 0.042, 7, 3);
for (const [nm, g, pan, dt] of [['A5', 0.03, 0.35, 0], ['F#6', 0.022, 0.68, 0.06]]) addBell(at(Math.round(SET * 2) / 2) + dt, n(nm), g, pan, 3.2);

// l'avant/après : la ligne d'eau montée à la souris (une montée de verre), puis lâchée (une note)
{
  const e = EVENTS.refill;
  const up = ['A4', 'B4', 'D5', 'E5', 'F#5', 'A5'];
  up.forEach((nm, k) => addGlass(at(S.Refill + e.grab + (k * (e.top - e.grab)) / up.length), n(nm), 0.032, 0.42 + 0.04 * k, 0.9));
  ['F#5', 'E5', 'D5', 'B4', 'A4'].forEach((nm, k) => addGlass(at(S.Refill + e.top + 0.5 + k * 0.5), n(nm), 0.024, 0.6 - 0.04 * k, 0.9));
  addGlass(at(S.Refill + e.release), n('D5'), 0.035, 0.5, 1.4);
}
// les photos des changements, les clics du local technique et des avis : un maillet sur le temps
EVENTS.changes.forEach((x, k) => addGlass(at(S.Changes + x), n(['F#5', 'A5', 'B5'][k]), 0.04, 0.4 + 0.1 * k, 1.2));
EVENTS.pad.forEach((x, k) => {
  addGlass(at(S.Pad + x), n(['A5', 'D6', 'F#5'][k]), 0.04, 0.45, 1.1);
  addGlass(at(S.Pad + x + 0.25), n(['D6', 'F#6', 'A5'][k]), 0.026, 0.55, 1.0);
});
EVENTS.reviews.forEach((x, k) => addGlass(at(S.Reviews + x), n(['F#5', 'A5'][k]), 0.04, 0.45 + 0.1 * k, 1.2));
// « PETRI » se pose en mosaïque dans le pied de page
cascade(S.Close + EVENTS.close.inlay, S.Close + EVENTS.close.inlay + 2.5, 0.04, 6, 4);
// les téléphones : les puces des villes et le menu
EVENTS.mobile.towns.forEach((x, k) => addGlass(at(S.Mobile + x), n(['A5', 'B5'][k]), 0.034, 0.5, 1.1));
addGlass(at(S.Mobile + EVENTS.mobile.menu), n('D6'), 0.03, 0.62, 1.1);
// fin : la frise se pose, puis l'accord et des cloches sur ré
addKick(at(S.End), 0.36, false);
cascade(S.End + 0.25, S.End + 3.5, 0.034, 8, 2);
{
  const t1 = at(S.End + 2);
  addBass(t1, n('D2') * 2, 0.26, 4);
  for (const [nm, g, pan, dt] of [['D5', 0.05, 0.35, 0], ['F#5', 0.042, 0.62, 0.02], ['A5', 0.036, 0.45, 0.04], ['E6', 0.026, 0.7, 0.06], ['A6', 0.02, 0.3, 0.08]]) addBell(t1 + dt, n(nm), g, pan, 5);
}

// ——— La scène sombre (le déroulé) : le groove passe dans un passe-bas qui se referme à moitié, puis se rouvre ———
const cutoff = (b) => env(b, [[0, 17000], [S.Process - 0.3, 17000], [S.Process + 0.5, 3800], [S.Reviews - 0.6, 3800], [S.Reviews, 17000]]);
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

// ——— L'ancien site : tout passe dans un passe-bas qui s'ouvre à mesure que l'eau monte ———
{
  const OPEN_END = SITE + 0.05;
  const cut = (b) => (b < WATER ? 650 : b >= OPEN_END ? 20000 : 650 * Math.pow(20000 / 650, smooth((b - WATER) / (OPEN_END - WATER))));
  const s = [[0, 0], [0, 0]];
  const end = Math.ceil(at(OPEN_END) * SR);
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
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sfx/music.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.concat([header, data]));
console.log(`✓ ${out}  ${(N / SR).toFixed(1)} s, crête d'origine ${peak.toFixed(2)}`);
const dB = (e) => (10 * Math.log10(e / N / 2 + 1e-12)).toFixed(1);
console.log('  énergie par instrument (dB, avant réverbération) : ' + Object.entries(energy).map(([k, e]) => `${k} ${dB(e)}`).join(', '));
