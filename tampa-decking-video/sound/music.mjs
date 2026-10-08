// Musique originale de la présentation Tampa Decking & Pools, synthétisée de zéro
// (aucun échantillon, aucun droit tiers). 100 BPM, en ré majeur.
// Fil rouge : une phrase de marimba qui descend (ré, la, fa dièse, ré), comme on descend de la plage
// jusqu'au fond du bassin. Elle accompagne la fenêtre de l'ouverture ; les couches du site la reprennent (bruitages).
// Ouverture claire, le site actuel en si mineur (pulsation sourde), la bascule sur la dominante avec une montée,
// puis le nouveau site : piano électrique, basse, batterie feutrée, marimba en rythme 3-3-2.
// À partir de la section « About », le grand bain : filtre plus fermé, basse plus profonde. Fin sur ré majeur.
// Usage : node sound/music.mjs  →  public/sfx/music.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const BPM = 100;
const BEAT = 60 / BPM;
const TOTAL_BEATS = 175;
const TAIL = 3.5;
const N = Math.ceil((TOTAL_BEATS * BEAT + TAIL) * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const busL = new Float32Array(N); // envoi vers la réverbération
const busR = new Float32Array(N);

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const n = (name) => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  const base = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]];
  return midi(12 * (Number(m[3]) + 1) + base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0));
};
let seed = 1450;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const add = (i, l, r, send = 0) => {
  if (i < 0 || i >= N) return;
  L[i] += l;
  R[i] += r;
  if (send) { busL[i] += l * send; busR[i] += r * send; }
};

// ——— Accords : voix du piano électrique (4 notes) et basse ———
const CH = {
  Dmaj9: {v: ['F#3', 'A3', 'C#4', 'E4'], b: 'D2'},
  Bm9: {v: ['D3', 'F#3', 'A3', 'C#4'], b: 'B1'},
  Gmaj9: {v: ['F#3', 'A3', 'B3', 'D4'], b: 'G1'},
  Asus: {v: ['E3', 'A3', 'B3', 'D4'], b: 'A1'},
  A: {v: ['E3', 'A3', 'C#4', 'E4'], b: 'A1'},
  Em9: {v: ['D3', 'G3', 'B3', 'F#4'], b: 'E2'},
  F7sus: {v: ['E3', 'B3', 'C#4', 'F#4'], b: 'F#1'},
  F7: {v: ['E3', 'A#3', 'C#4', 'F#4'], b: 'F#1'},
  Gmaj7: {v: ['F#3', 'B3', 'D4', 'G4'], b: 'G1'},
};
// Grille, en temps : les changements tombent sur les coupes du montage (voir src/timeline.ts)
// ouverture 0, aujourd'hui 11, bascule 27, accueil 33, coupe 47 (couches à 50, 55, 60, 65), travail 71,
// surfaces 86, prix 97, famille 106, villes 119, devis 130, téléphones 147, fin 160.
const PROG = [
  [0, 'Dmaj9'], [4, 'Bm9'], [8, 'Gmaj9'], [10, 'Asus'],
  [11, 'Bm9'], [15, 'Gmaj7'], [19, 'Em9'], [23, 'F7sus'], [25, 'F7'],
  [27, 'Asus'], [30, 'A'],
  [33, 'Dmaj9'], [37, 'Bm9'], [41, 'Gmaj9'], [45, 'A'],
  [47, 'Asus'], [50, 'Dmaj9'], [55, 'Bm9'], [60, 'Gmaj9'], [65, 'Em9'], [68, 'A'],
  [71, 'Dmaj9'], [75, 'Bm9'], [79, 'Gmaj9'], [83, 'A'],
  [86, 'Bm9'], [90, 'Gmaj9'], [94, 'A'],
  [97, 'Dmaj9'], [101, 'Bm9'], [104, 'A'],
  [106, 'Bm9'], [110, 'Gmaj9'], [114, 'Em9'], [117, 'F7sus'],
  [119, 'Gmaj9'], [123, 'A'], [127, 'Bm9'],
  [130, 'Gmaj9'], [134, 'A'], [138, 'Bm9'], [142, 'Gmaj9'], [144, 'Dmaj9'],
  [147, 'Dmaj9'], [151, 'Bm9'], [155, 'Gmaj9'], [158, 'Asus'],
  [160, 'Dmaj9'], [165, 'Gmaj9'], [169, 'Dmaj9'],
];
const chordAt = (beat) => {
  let c = PROG[0];
  for (const p of PROG) if (beat >= p[0] - 1e-9) c = p;
  return c;
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
// le grand bain : à partir de la famille (106), tout s'assombrit un peu
const deep = (b) => env(b, [[0, 0], [105, 0], [106.5, 1], [146, 1], [147, 0.4], [160, 0.6]]);

// ——— Nappe : sinus et triangles désaccordés, attaque lente (ouverture, constat, fin) ———
const padGain = (b) => env(b, [[0, 0], [1.5, 0.36], [10, 0.33], [11, 0.32], [26, 0.34], [27, 0.5], [32.5, 0.7], [33, 0.12], [146, 0.12], [147, 0.3], [159, 0.34], [160, 0.55], [172, 0.5], [178, 0]]);
{
  let cur = null;
  let prev = null;
  let xf = 1;
  const XF = SR * 1.4;
  const lp = [0, 0];
  const freqs = (name) => CH[name].v.map(n);
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
      freqs(name).forEach((f0, k) => {
        for (const d of [-1, 1]) {
          const f = f0 * Math.pow(2, (d * 0.07) / 12);
          const ph = f * t + k * 0.21 + (d > 0 ? 0.5 : 0) + 0.004 * Math.sin(t * (0.4 + k * 0.13));
          const fr = ph - Math.floor(ph);
          const tri = 1 - 4 * Math.abs(fr - 0.5);
          const x = (0.7 * Math.sin(2 * Math.PI * ph) + 0.3 * tri) * w * 0.12;
          if (d < 0) sl += x; else sr += x;
        }
      });
    }
    // filtre doux : plus fermé dans le grand bain
    const a = 0.12 - 0.06 * deep(b);
    lp[0] += (sl - lp[0]) * a;
    lp[1] += (sr - lp[1]) * a;
    add(i, lp[0] * g, lp[1] * g, 1.2);
  }
}

// ——— Piano électrique (modulation de fréquence), accords plaqués ———
const addEP = (t0, names, gain, len, bright = 1) => {
  for (const [k, nm] of names.entries()) {
    const f = n(nm);
    const i0 = Math.floor((t0 + k * 0.006) * SR);
    const pan = 0.35 + 0.3 * (k / Math.max(1, names.length - 1));
    let pc = rnd();
    let pm = rnd();
    for (let j = 0; j < SR * (len + 0.6); j++) {
      const t = j / SR;
      const rel = t > len ? Math.exp(-(t - len) * 9) : 1;
      const a = gain * (t < 0.004 ? t / 0.004 : 1) * (0.55 * Math.exp(-t * 3.2) + 0.45 * Math.exp(-t * 0.7)) * rel;
      if (a < 1e-5 && t > len) break;
      pm += f / SR;
      pc += f / SR;
      const idx = (2.3 * Math.exp(-t * 6) + 0.45) * bright;
      const s = Math.sin(2 * Math.PI * pc + idx * Math.sin(2 * Math.PI * pm)) * a;
      // trémolo stéréo, très léger
      const trem = 1 + 0.12 * Math.sin(2 * Math.PI * 4.6 * t);
      add(i0 + j, s * (1 - pan) * trem, s * pan * (2 - trem), 0.5);
    }
  }
};

// ——— Basse ronde ———
const addBass = (t0, freq, gain, len) => {
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * (len + 0.05); j++) {
    const t = j / SR;
    ph += freq / SR;
    ph -= Math.floor(ph);
    const a = gain * (t < 0.006 ? t / 0.006 : 1) * Math.exp(-t * 2.2) * (t > len ? Math.max(0, 1 - (t - len) / 0.05) : 1);
    const s = Math.tanh((Math.sin(2 * Math.PI * ph) + 0.25 * Math.sin(4 * Math.PI * ph) * Math.exp(-t * 8)) * 1.4) * a;
    add(i0 + j, s, s);
  }
};

// ——— Batterie feutrée ———
const addKick = (t0, gain) => {
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.45; j++) {
    const t = j / SR;
    const f = 48 + 75 * Math.exp(-t * 30);
    ph += (2 * Math.PI * f) / SR;
    const s = (Math.sin(ph) * Math.exp(-t * 7) + (t < 0.003 ? (rnd() - 0.5) * 0.3 : 0)) * gain * (t < 0.003 ? t / 0.003 : 1);
    add(i0 + j, s, s);
  }
};
const addClap = (t0, gain) => {
  const i0 = Math.floor(t0 * SR);
  const st = [{lp: 0, bp: 0}, {lp: 0, bp: 0}];
  const k = 2 * Math.sin((Math.PI * 1500) / SR);
  for (let j = 0; j < SR * 0.25; j++) {
    const t = j / SR;
    // trois claquements serrés puis la queue
    const e = (t < 0.01 ? 1 : t < 0.02 ? 0.4 : t < 0.03 ? 0.85 : 0.6) * Math.exp(-Math.max(0, t - 0.03) * 22);
    const out = [0, 1].map((ch) => {
      const s = st[ch];
      const w = rnd() * 2 - 1;
      const hp = w - s.lp - 0.9 * s.bp;
      s.bp += k * hp;
      s.lp += k * s.bp;
      return s.bp * e * gain;
    });
    add(i0 + j, out[0], out[1], 0.6);
  }
};
const addHat = (t0, gain, pan, open = false) => {
  const i0 = Math.floor(t0 * SR);
  let x1 = 0;
  let y1 = 0;
  const dec = open ? 9 : 55;
  for (let j = 0; j < SR * (open ? 0.35 : 0.08); j++) {
    const t = j / SR;
    const w = rnd() * 2 - 1;
    // passe-haut du premier ordre, vers 7 kHz
    const y = 0.38 * (y1 + w - x1);
    x1 = w;
    y1 = y;
    const s = y * gain * Math.exp(-t * dec) * (t < 0.001 ? t / 0.001 : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.15);
  }
};
// ——— Marimba : partiels du bois (1, 3,9, 9,2) ———
const addMarimba = (t0, freq, gain, pan, send = 0.6) => {
  const i0 = Math.floor(t0 * SR);
  for (let j = 0; j < SR * 1.6; j++) {
    const t = j / SR;
    const s = (Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 3.6) + 0.32 * Math.sin(2 * Math.PI * freq * 3.92 * t) * Math.exp(-t * 14) + 0.08 * Math.sin(2 * Math.PI * freq * 9.2 * t) * Math.exp(-t * 40)) * gain * (t < 0.0015 ? t / 0.0015 : 1);
    add(i0 + j, s * (1 - pan), s * pan, send);
  }
};
// ——— Montée de bruit filtré (bascule) ———
const addRiser = (b0, b1, gain) => {
  const i0 = Math.floor(b0 * BEAT * SR);
  const i1 = Math.floor(b1 * BEAT * SR);
  const st = [{lp: 0, bp: 0}, {lp: 0, bp: 0}];
  for (let i = i0; i < i1; i++) {
    const p = (i - i0) / (i1 - i0);
    const fc = 300 + 5200 * p * p;
    const k = 2 * Math.sin((Math.PI * fc) / SR);
    const out = [0, 1].map((ch) => {
      const s = st[ch];
      const w = rnd() * 2 - 1;
      const hp = w - s.lp - 0.7 * s.bp;
      s.bp += k * hp;
      s.lp += k * s.bp;
      return s.bp;
    });
    const a = gain * Math.pow(p, 1.8) * (p > 0.97 ? (1 - p) / 0.03 : 1);
    add(i, out[0] * a, out[1] * a, 0.4);
  }
};

// ——— Partition ———
const groove = (b) => b >= 33 && b < 147;
for (let s16 = 0; s16 < TOTAL_BEATS * 4; s16++) {
  const b = s16 / 4;
  const t = b * BEAT;
  const [start, name] = chordAt(b);
  const c = CH[name];
  const inBar = (b - 33 + 400) % 4; // position dans la mesure du groove
  const d = deep(b);

  // — le nouveau site : groove —
  if (groove(b)) {
    // piano : accords syncopés (1, la double-croche avant 2, le « et » de 3)
    if (Math.abs(b - start) < 1e-9 || [1.75, 2.5].includes(inBar)) addEP(t, c.v, 0.07 * (Math.abs(b - start) < 1e-9 ? 1.1 : 0.8), inBar === 2.5 ? 0.9 : 0.45, 1 - 0.45 * d);
    // basse : fondamentale sur 1, rappel sur le « et » de 2, quinte avant la mesure suivante
    const root = n(c.b) * 2;
    if (inBar === 0 || Math.abs(b - start) < 1e-9) addBass(t, root * (d > 0.5 ? 0.5 : 1), 0.25 + 0.07 * d, BEAT * 1.3);
    if (inBar === 1.5) addBass(t, root, 0.17, BEAT * 0.45);
    if (inBar === 3.5) addBass(t, root * 1.5, 0.14, BEAT * 0.4);
    // batterie
    if (inBar === 0 || inBar === 2 || (inBar === 2.75 && Math.floor((b - 33) / 4) % 2 === 1)) addKick(t, 0.42 + 0.06 * d);
    if (inBar === 1 || inBar === 3) addClap(t, 0.075);
    addHat(t, (inBar % 1 === 0.5 ? 0.066 : 0.036) * (1 - 0.25 * d), inBar % 1 === 0.5 ? 0.62 : 0.4, inBar === 3.5 && Math.floor((b - 33) / 4) % 4 === 3);
    // marimba en 3-3-2 sur deux temps, notes de l'accord
    const tres = (b - 33 + 400) % 2;
    if ([0, 0.75, 1.5].includes(tres) && (b < 106 || b >= 119)) {
      const k = Math.floor((b - 33) * 4 / 3) % c.v.length;
      addMarimba(t, n(c.v[(k + 1) % c.v.length]) * 2, 0.07, tres === 0.75 ? 0.68 : 0.32, 0.5);
    }
  }
  // — le site actuel : pulsation sourde et accords étouffés —
  if (b >= 11 && b < 27) {
    if ((b - 11) % 2 === 0) addKick(t, 0.2 + 0.006 * (b - 11));
    if ((b - 11) % 2 === 0) addEP(t, c.v, 0.035, 0.35, 0.35);
    if (b % 1 === 0.5 && b > 15) addHat(t, 0.016, 0.55);
    if (Math.abs(b - start) < 1e-9) addBass(t, n(c.b) * 2, 0.22, BEAT * 3.6);
  }
  // le surligneur sur le code brut (temps 22) : un accord net
  if (b === 22) addEP(t, ['D4', 'F#4', 'B4'], 0.05, 0.6, 0.8);
  // — la bascule : montée, roulement de grosse caisse —
  if (b >= 31 && b < 32.75 && s16 % (b >= 32 ? 1 : 2) === 0) addKick(t, 0.16 + 0.1 * (b - 31));
  if (b >= 27 && b < 33 && Math.abs(b - start) < 1e-9) addBass(t, n(c.b) * 2, 0.24, BEAT * 2.8);
  // — téléphones : le groove s'allège (pied et charleston) —
  if (b >= 147 && b < 160) {
    if (b % 2 === 0) addKick(t, 0.26);
    if (b % 1 === 0.5) addHat(t, 0.03, 0.6);
    if (Math.abs(b - start) < 1e-9) { addEP(t, c.v, 0.05, BEAT * 3.4, 0.8); addBass(t, n(c.b) * 2, 0.24, BEAT * 3.4); }
    const tres = (b - 147 + 400) % 2;
    if ([0, 0.75, 1.5].includes(tres)) addMarimba(t, n(c.v[Math.floor(b * 1.5) % c.v.length]) * 2, 0.055, tres === 0.75 ? 0.7 : 0.3);
  }
  // — ouverture : accords tenus —
  if (b < 11 && Math.abs(b - start) < 1e-9) addEP(t, c.v, 0.034, BEAT * (b < 10 ? 3.6 : 0.9), 0.8);
}

// La phrase qui descend : la fenêtre de l'ouverture arrive sur chaque couche (temps 2, 4, 6, 8)
[['D6', 2], ['A5', 4], ['F#5', 6], ['D5', 8]].forEach(([nm, b], i) => {
  addMarimba(b * BEAT, n(nm), 0.085, i % 2 ? 0.62 : 0.38, 0.9);
  addMarimba(b * BEAT + 0.75 * BEAT, n(nm), 0.027, i % 2 ? 0.38 : 0.62, 0.9);
});
// Elle revient, une octave plus bas, quand on entre dans le grand bain (106) et à la fin (160)
[['D5', 106], ['A4', 107], ['F#4', 108], ['D4', 109]].forEach(([nm, b], i) => addMarimba(b * BEAT, n(nm), 0.06, i % 2 ? 0.6 : 0.4, 0.9));
[['D6', 160], ['A5', 161], ['F#5', 162], ['D5', 163]].forEach(([nm, b], i) => addMarimba(b * BEAT, n(nm), 0.075, i % 2 ? 0.6 : 0.4, 1.0));

// La bascule : montée de bruit filtré jusqu'au nouveau site
addRiser(27.5, 33, 0.07);
// La ligne d'eau qui monte vers le nouveau site : un coup sourd sur le temps 33
addKick(33 * BEAT, 0.5);

// ——— Fin : basse profonde et cloches sur ré majeur ———
{
  const t0 = 160 * BEAT;
  addKick(t0, 0.55);
  addBass(t0, n('D1') * 2, 0.34, 5);
  const t1 = 169 * BEAT;
  addBass(t1, n('D1') * 2, 0.26, 6);
  for (const [nm, g, pan, at] of [['D5', 0.07, 0.35, t1], ['F#5', 0.055, 0.62, t1 + 0.02], ['A5', 0.05, 0.45, t1 + 0.04], ['C#6', 0.035, 0.7, t1 + 0.06], ['E6', 0.03, 0.3, t1 + 0.08]]) {
    const i0 = Math.floor(at * SR);
    const f = n(nm);
    for (let j = 0; j < SR * 5; j++) {
      const t = j / SR;
      const s = (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 2.5)) * Math.exp(-t * 0.8) * g * (t < 0.003 ? t / 0.003 : 1);
      add(i0 + j, s * (1 - pan), s * pan, 0.9);
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
      c.lp = v * 0.62 + c.lp * 0.38;
      c.buf[c.i] = x + c.lp * 0.86;
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
