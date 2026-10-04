// La bande-son du plan-séquence : une journée à la Biza, synthétisée de zéro (aucun échantillon, aucun droit tiers).
// Une valse lente au piano (72 BPM, 3/4, en Fa majeur) et ce qu'on entendrait au domaine heure par heure :
// les oiseaux de l'après-midi, des pas dans le porche, l'eau autour de l'îlot, une cloche au loin pour le oui,
// les verres du vin d'honneur, les grillons du soir, la valse d'une guinguette au loin à 23 h, une chouette
// à 2 h, le chœur de l'aube au lever du jour. Les souffles suivent la vitesse du défilement ; les ampoules de
// la guirlande et les fenêtres du gîte s'allument au son, à l'image près. Pour finir, la journée se rembobine :
// on réentend tout à l'envers, très vite, au rythme où la page remonte.
// Usage : node sound/day.mjs  →  public/sfx/day.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {DAY, DAY_LEN, LIGHTS, dayY, track} from '../capture/day.mjs';

const SR = 44100;
const TAU = Math.PI * 2;
const DUR = DAY_LEN + 0.5;
const N = Math.ceil(DUR * SR);
const L = new Float32Array(N), R = new Float32Array(N); // à sec
const SL = new Float32Array(N), SR_ = new Float32Array(N); // envoi vers la réverbération

let seed = 1802;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (t) => { t = clamp01(t); return t * t * (3 - 2 * t); };
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const note = (name) => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  const base = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]];
  return midi(12 * (Number(m[3]) + 1) + base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0));
};
const pan = (p) => [Math.cos(((p + 1) * Math.PI) / 4), Math.sin(((p + 1) * Math.PI) / 4)];
const put = (i, s, p, send = 0.2) => {
  if (i < 0 || i >= N) return;
  const [gl, gr] = pan(p);
  L[i] += s * gl; R[i] += s * gr;
  SL[i] += s * gl * send; SR_[i] += s * gr * send;
};
// une courbe par clés [[t, v], …]
const curve = (keys) => track(keys.map(([t, v]) => [t, v]), smooth);

// filtre biquad (RBJ)
const biquad = (type, f, q = 0.707) => {
  const w = (TAU * f) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q);
  let b0, b1, b2;
  if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
  else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
  else { b0 = a; b1 = 0; b2 = -a; } // passe-bande
  const a0 = 1 + a, a1 = -2 * c, a2 = 1 - a;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x) => { const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; };
};

// filtre à variables d'état (TPT) : sa fréquence peut changer à chaque échantillon sans claquer
const svf = () => {
  let ic1 = 0, ic2 = 0;
  return (x, f, q = 0.8) => {
    const g = Math.tan((Math.PI * Math.min(f, SR * 0.45)) / SR), k = 1 / q;
    const a1 = 1 / (1 + g * (g + k)), a2 = g * a1, a3 = g * a2;
    const v3 = x - ic2, v1 = a1 * ic1 + a2 * v3, v2 = ic2 + a2 * ic1 + a3 * v3;
    ic1 = 2 * v1 - ic1; ic2 = 2 * v2 - ic2;
    return v1 * k; // passe-bande, gain 1 au centre
  };
};

/* ——— La musique : une valse lente au piano ——— */
const BAR0 = 0.4, BAR = 2.5, BEAT = BAR / 3;
const barT = (b, beat = 0) => BAR0 + b * BAR + beat * BEAT;
const CHORDS = {F: ['F2', 'A3', 'C4', 'F4'], Am: ['A2', 'C4', 'E4', 'A4'], Dm: ['D2', 'A3', 'D4', 'F4'], Bb: ['Bb1', 'F3', 'Bb3', 'D4'], C: ['C2', 'G3', 'C4', 'E4'], Gm: ['G2', 'D4', 'G4', 'Bb4'], C7: ['C2', 'Bb3', 'C4', 'E4']};
const PROG = ['F', 'F', 'Am', 'Dm', 'Bb', 'C', 'Bb', 'C', 'F', 'Am', 'Dm', 'Bb', null, null, null, 'Dm', 'Bb', 'Gm', 'C', 'F', 'Am', 'Bb', 'C', 'F', 'Dm'];
const MELODY = {
  1: [[0, 'A4', 3]], 2: [[0, 'C5', 2], [2, 'E5', 1]], 3: [[0, 'D5', 3]], 4: [[0, 'F5', 2], [2, 'D5', 1]],
  5: [[0, 'C5', 3]], 6: [[0, 'D5', 1], [1, 'C5', 1], [2, 'Bb4', 1]], 7: [[0, 'G4', 3]], 8: [[0, 'A4', 2], [2, 'C5', 1]],
  9: [[0, 'E5', 3]], 10: [[0, 'F5', 1], [1, 'E5', 1], [2, 'D5', 1]], 11: [[0, 'D5', 2], [2, 'C5', 1]],
  15: [[0, 'A5', 3]], 16: [[1, 'F5', 2]], 17: [[0, 'D5', 3]], 18: [[0, 'E5', 3]],
  19: [[0, 'F5', 2], [2, 'A5', 1]], 20: [[0, 'E5', 2], [2, 'C5', 1]], 21: [[0, 'D5', 3]], 22: [[0, 'E5', 2], [2, 'G5', 1]],
  23: [[0, 'A5', 3]], 24: [[0, 'F5', 2], [2, 'D5', 1]],
};
// nuances : l'ouverture dépouillée, la nuit à peine, l'aube qui s'ouvre ; la musique s'efface pour la guinguette
const musicGain = curve([[0, 0.7], [11, 0.85], [12.6, 1], [29.5, 1], [31, 0], [37.4, 0], [38.0, 0.5], [42.6, 0.6], [45.4, 1], [60.6, 1], [61.3, 0], [64, 0], [64.2, 1]]);

function piano(t0, f, vel, len, p) {
  const i0 = Math.round(t0 * SR), n = Math.round(len * SR);
  const parts = [];
  for (let k = 1; k <= 8; k++) {
    const fk = f * k * Math.sqrt(1 + 0.00035 * k * k);
    if (fk > 9000) break;
    parts.push([fk, (k === 1 ? 1 : 0.62) / Math.pow(k, 1.15), (0.9 + k * 0.55) * (f > 600 ? 1.5 : 1), rnd() * TAU]);
  }
  const g = vel * 0.1 * musicGain(t0);
  if (g < 0.002) return;
  for (let j = 0; j < n; j++) {
    const t = j / SR;
    let s = 0;
    for (const [fk, a, d, ph] of parts) s += a * Math.exp(-t * d) * Math.sin(TAU * fk * t + ph);
    const env = Math.min(1, t / 0.005) * (j > n - 3000 ? (n - j) / 3000 : 1);
    put(i0 + j, s * g * env, p, 0.4);
  }
}
for (let b = 0; b < PROG.length; b++) {
  const c = PROG[b];
  if (!c) continue;
  const [bass, ...tones] = CHORDS[c].map(note);
  const night = b >= 15 && b <= 17, sparse = b <= 4 || night;
  piano(barT(b), bass, sparse ? 0.7 : 0.85, BAR * 1.2, -0.25);
  if (!night) for (const beat of sparse ? [1.5] : [1, 2]) tones.forEach((f, k) => piano(barT(b, beat) + k * 0.012, f, sparse ? 0.32 : 0.42, BEAT * 1.6, -0.1 + k * 0.12));
  for (const [beat, nm, len] of MELODY[b] || []) piano(barT(b, beat), note(nm), night ? 0.75 : 0.62, len * BEAT + 1.2, 0.2);
}
// la nuit et l'aube : une nappe tenue sous le piano (Ré mineur, Si bémol, Sol mineur, Do)
{
  const pad = curve([[37.2, 0], [39.2, 1], [44.6, 1], [46.5, 0]]);
  for (let b = 15; b <= 18; b++) {
    const t0 = barT(b) - 0.3, len = BAR + 0.9, i0 = Math.round(t0 * SR), n = Math.round(len * SR);
    const tones = CHORDS[PROG[b]].slice(1).map(note);
    for (let j = 0; j < n; j++) {
      const t = t0 + j / SR, x = j / SR;
      const env = Math.min(1, x / 0.6) * Math.min(1, (len - x) / 0.6) * pad(t);
      if (env < 0.001) continue;
      let v = 0;
      tones.forEach((f, k) => { v += Math.sin(TAU * f * x * 1.0015 + k) + Math.sin(TAU * f * x * 0.9985 + k * 2) + 0.3 * Math.sin(TAU * f * 2 * x); });
      put(i0 + j, v * env * 0.012, 0, 0.7);
    }
  }
}
// la dernière note, après le retour en arrière : Fa majeur, longuement
['F2', 'C3', 'A3', 'C4', 'F4', 'A4'].forEach((nm, k) => piano(64.25 + k * 0.05, note(nm), 0.55, 4.2, -0.3 + k * 0.12));
piano(64.6, note('C5'), 0.5, 3.6, 0.25);
piano(65.4, note('F5'), 0.55, 3.0, 0.25);

/* ——— La guinguette, au loin : une valse à l'accordéon (musette), en Fa, deux fois plus vite ——— */
{
  const W0 = barT(12), WB = BAR / 2; // une mesure de valse = une demi-mesure de piano
  const tune = ['C5', 'F5', 'A5', 'G5', 'F5', 'E5', 'F5', 'A5', 'C6', 'Bb5', 'A5', 'G5', 'A5', 'G5', 'F5', 'E5', 'D5', 'E5', 'F5', 'A5', 'G5', 'F5', 'E5', 'C5', 'C5', 'F5', 'A5', 'G5', 'F5', 'E5', 'F5', 'A5', 'C6', 'D6', 'C6', 'Bb5', 'A5', 'G5', 'E5', 'F5', 'F5', 'F5'];
  const harm = ['F', 'C7', 'F', 'C7', 'Bb', 'F', 'C7', 'F', 'F', 'C7', 'F', 'C7', 'Bb', 'C7', 'F', 'F'];
  const gain = curve([[W0 - 0.5, 0], [W0 + 2.2, 1], [barT(15) - 0.6, 1], [barT(15) + 0.8, 0]]);
  const lp1 = biquad('lp', 1700), lp2 = biquad('lp', 1700);
  const buf = new Float32Array(Math.round((BAR * 3.6) * SR));
  const reed = (t0, f, len, a) => {
    const i0 = Math.round((t0 - W0 + 0.5) * SR), n = Math.round(len * SR);
    const det = [1, Math.pow(2, 0.11 / 12), Math.pow(2, -0.1 / 12)];
    for (let j = 0; j < n; j++) {
      const t = j / SR;
      let s = 0;
      for (const d of det) for (let k = 1; k <= 9; k++) s += Math.sin(TAU * f * d * k * t + k) / k * (k % 2 ? 1 : 0.6);
      const env = Math.min(1, t / 0.03) * Math.min(1, (len - t) / 0.06) * (0.9 + 0.1 * Math.sin(TAU * 5 * t));
      if (i0 + j < buf.length) buf[i0 + j] += s * env * a;
    }
  };
  tune.forEach((nm, k) => reed(W0 + (k * WB) / 3, note(nm), WB / 3 * 0.92, 0.05));
  harm.forEach((c, k) => {
    const [bass, ...tones] = CHORDS[c].map(note);
    reed(W0 + k * WB, bass * 2, WB / 3 * 0.8, 0.05);
    for (const beat of [1, 2]) tones.slice(0, 3).forEach((f) => reed(W0 + k * WB + (beat * WB) / 3, f, WB / 3 * 0.55, 0.022));
  });
  for (let j = 0; j < buf.length; j++) {
    const t = W0 - 0.5 + j / SR;
    const s = lp2(lp1(buf[j])) * gain(t) * 0.55;
    put(Math.round(t * SR), s, 0.35, 0.9);
  }
}

/* ——— Les oiseaux ——— */
function chirp(t0, f0, f1, len, amp, p, vib = 0) {
  const i0 = Math.round(t0 * SR), n = Math.round(len * SR);
  let ph = 0;
  for (let j = 0; j < n; j++) {
    const u = j / n;
    const f = f0 * Math.pow(f1 / f0, u) + (vib ? Math.sin(TAU * 26 * (j / SR)) * vib : 0);
    ph += (TAU * f) / SR;
    const env = Math.pow(Math.sin(Math.PI * u), 2);
    put(i0 + j, (Math.sin(ph) + 0.18 * Math.sin(2 * ph)) * env * amp, p, 0.3);
  }
}
function bird(t0, amp) {
  const p = rnd() * 1.6 - 0.8, kind = (rnd() * 4) | 0, f = 2600 + rnd() * 2600;
  if (kind === 0) chirp(t0, f, f * 1.25, 0.05, amp, p);
  else if (kind === 1) { const n = 4 + ((rnd() * 5) | 0); for (let k = 0; k < n; k++) chirp(t0 + k * 0.07, f * (1 - k * 0.03), f * (0.86 - k * 0.03), 0.045, amp * (1 - k * 0.06), p); }
  else if (kind === 2) { chirp(t0, f * 1.05, f * 0.95, 0.16, amp * 0.8, p); chirp(t0 + 0.22, f * 0.82, f * 0.78, 0.2, amp * 0.8, p); }
  else chirp(t0, f * 0.9, f * 1.05, 0.3, amp * 0.6, p, 380);
}
const birdRate = curve([[0, 0.9], [19, 0.9], [22, 0.45], [26, 0.15], [29, 0], [42.4, 0], [44, 1.8], [45.6, 2.6], [48, 1.6], [60.8, 1.4], [61, 0], [64, 0], [64.4, 1.2], [68, 1]]);
for (let t = 0.2; t < DUR - 0.4;) {
  const r = birdRate(t);
  if (r > 0.02 && rnd() < 0.9) bird(t, 0.03 + rnd() * 0.035);
  t += r > 0.02 ? (-Math.log(1 - rnd()) / r) * 0.9 + 0.08 : 0.25;
}

/* ——— L'eau : la rivière, puis le clapotis autour de l'îlot ——— */
{
  const water = curve([[0, 0.13], [4.6, 0.13], [6.6, 0.06], [11, 0.07], [12.6, 0.17], [19, 0.17], [20.6, 0.04], [26, 0.015], [61, 0.015], [61.2, 0], [64, 0], [64.6, 0.13], [68, 0.12]]);
  const lpA = biquad('lp', 1300), lpB = biquad('lp', 1500), hpA = biquad('hp', 240), hpB = biquad('hp', 260), hpA2 = biquad('hp', 240), hpB2 = biquad('hp', 260);
  let br = 0, bl = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const g = water(t);
    br = br * 0.94 + (rnd() * 2 - 1) * 0.3; bl = bl * 0.94 + (rnd() * 2 - 1) * 0.3;
    const lap = 0.55 + 0.45 * Math.sin(TAU * 0.37 * t + Math.sin(TAU * 0.11 * t) * 2);
    const sL = hpA2(hpA(lpA(bl))) * lap * g * 0.55, sR = hpB2(hpB(lpB(br))) * (1.1 - lap * 0.6) * g * 0.55;
    L[i] += sL; R[i] += sR; SL[i] += sL * 0.15; SR_[i] += sR * 0.15;
  }
  // des gouttes, des petits remous
  for (let t = 12.8; t < 19; t += 0.35 + rnd() * 0.8) {
    const i0 = Math.round(t * SR), n = Math.round(0.07 * SR), f0 = 600 + rnd() * 500, p = rnd() * 1.2 - 0.6;
    let ph = 0;
    for (let j = 0; j < n; j++) { const u = j / n; ph += (TAU * f0 * (1 - 0.55 * u)) / SR; put(i0 + j, Math.sin(ph) * Math.exp(-u * 5) * 0.05, p, 0.3); }
  }
}

/* ——— Des pas sur le gravier, sous le porche ——— */
[8.35, 8.92, 9.48, 10.03].forEach((t0, k) => {
  const bp = biquad('bp', 2600, 0.9), i0 = Math.round(t0 * SR), n = Math.round(0.16 * SR), p = k % 2 ? 0.12 : -0.12;
  for (let j = 0; j < n; j++) {
    const t = j / SR;
    const crunch = bp(rnd() * 2 - 1) * Math.exp(-t * 26) * (rnd() < 0.35 ? 1.6 : 0.7);
    const thump = Math.sin(TAU * 85 * t) * Math.exp(-t * 32) * 0.6;
    put(i0 + j, (crunch * 0.12 + thump * 0.06) * (0.8 + k * 0.08), p, 0.7);
  }
});

/* ——— Une cloche au loin, pour le oui ——— */
[14.2, 16.7].forEach((t0) => {
  const f = 311, parts = [[0.5, 0.5, 2.6], [1, 1, 1.4], [1.19, 0.6, 1.1], [1.5, 0.45, 0.9], [2, 0.5, 0.8], [2.52, 0.28, 0.6], [3.0, 0.2, 0.5], [4.07, 0.12, 0.35]];
  const i0 = Math.round(t0 * SR), n = Math.round(5 * SR), lp = biquad('lp', 2200);
  for (let j = 0; j < n; j++) {
    const t = j / SR;
    let s = 0;
    for (const [r, a, d] of parts) s += a * Math.exp(-t / d) * Math.sin(TAU * f * r * t);
    put(i0 + j, lp(s) * Math.min(1, t / 0.004) * 0.02, -0.5, 0.85);
  }
});

/* ——— Le vin d'honneur : des verres qui trinquent ——— */
[[21.5, 2], [22.45, 1], [23.2, 2]].forEach(([t0, glasses]) => {
  for (let gI = 0; gI < glasses; gI++) {
    const base = 2050 + rnd() * 500, i0 = Math.round((t0 + gI * 0.018) * SR), n = Math.round(0.9 * SR), p = rnd() * 0.8 - 0.4;
    const parts = [[1, 1, 0.5], [1.62, 0.5, 0.32], [2.43, 0.35, 0.22], [3.31, 0.2, 0.14]];
    for (let j = 0; j < n; j++) {
      const t = j / SR;
      let s = 0;
      for (const [r, a, d] of parts) s += a * Math.exp(-t / d) * Math.sin(TAU * base * r * t);
      put(i0 + j, s * Math.min(1, t / 0.001) * 0.03, p, 0.45);
    }
  }
});

/* ——— Les grillons du soir ——— */
{
  const gain = curve([[23.5, 0], [26.5, 0.7], [31, 0.9], [38, 0.9], [40, 0.55], [42.6, 0.4], [44.6, 0], [61, 0]]);
  [[4650, 2.6, -0.6, 0], [4420, 2.2, 0.55, 0.13], [4880, 3.1, 0.1, 0.27]].forEach(([f, rate, p, off]) => {
    for (let t = 23.5 + off; t < 45; t += 1 / rate + (rnd() - 0.5) * 0.04) {
      const g = gain(t);
      if (g < 0.02) continue;
      for (let k = 0; k < 3; k++) {
        const i0 = Math.round((t + k * 0.032) * SR), n = Math.round(0.018 * SR);
        for (let j = 0; j < n; j++) { const u = j / n; put(i0 + j, Math.sin((TAU * f * j) / SR) * Math.sin(Math.PI * u) * g * 0.022, p, 0.2); }
      }
    }
  });
}

/* ——— Une chouette, à 2 h ——— */
[[40.1, 0.5], [40.95, 0.22], [41.25, 0.6]].forEach(([t0, len]) => {
  const i0 = Math.round(t0 * SR), n = Math.round(len * SR), lp = biquad('lp', 900);
  let ph = 0;
  for (let j = 0; j < n; j++) {
    const u = j / n, f = 410 - 40 * u;
    ph += (TAU * f) / SR;
    const s = (Math.sin(ph) + 0.25 * Math.sin(2 * ph)) * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 1.5);
    put(i0 + j, lp(s) * 0.05, 0.6, 0.8);
  }
});

/* ——— Les ampoules de la guirlande et les fenêtres du gîte s'allument, à l'image près ——— */
const dt = 1 / 120;
{
  // la guirlande : deux fils (22 et 18 ampoules), chacune s'allume quand le défilement dépasse sa place
  const [g0, g1] = LIGHTS.garland;
  const bulbs = [];
  for (const n of [23, 19]) for (let i = 1; i < n; i++) bulbs.push(i / n);
  const on = new Set();
  for (let t = 31; t < 38; t += dt) {
    const p = clamp01((dayY(t) - g0) / (g1 - g0));
    bulbs.forEach((u, k) => {
      if (!on.has(k) && u < p * 1.05) {
        on.add(k);
        const i0 = Math.round(t * SR), n = Math.round(0.05 * SR), f = 3200 + rnd() * 1800, pn = u * 1.6 - 0.8;
        for (let j = 0; j < n; j++) { const x = j / SR; put(i0 + j, (Math.sin(TAU * f * x) * 0.6 + (rnd() * 2 - 1) * 0.4) * Math.exp(-x * 120) * 0.035, pn, 0.3); }
      }
    });
  }
  // le gîte : cinq interrupteurs
  const [h0, h1] = LIGHTS.house;
  let lit = 0;
  for (let t = 37; t < 44; t += dt) {
    const n = Math.min(5, Math.floor(clamp01((dayY(t) - h0) / (h1 - h0)) * 6));
    while (lit < n) {
      lit++;
      const i0 = Math.round(t * SR), len = Math.round(0.03 * SR), bp = biquad('bp', 1800, 1.2);
      for (let j = 0; j < len; j++) { const x = j / SR; put(i0 + j, bp(rnd() * 2 - 1) * Math.exp(-x * 160) * 0.16, -0.3 + lit * 0.12, 0.5); }
    }
  }
}

/* ——— Le souffle des accélérations : il suit la vitesse du défilement ——— */
const speed = (t) => Math.abs(dayY(t + 0.01) - dayY(t - 0.01)) / 0.02; // px/s
{
  const fL = svf(), fR = svf(), lpL = biquad('lp', 3200), lpR = biquad('lp', 3200);
  let v = 0;
  for (let i = 0; i < Math.round(61 * SR); i++) {
    if (i % 64 === 0) v = speed(i / SR);
    const f = Math.min(1800, 220 + v * 0.16);
    const a = Math.pow(clamp01((v - 250) / 2600), 1.3) * 0.14;
    const nL = lpL(fL(rnd() * 2 - 1, f, 1.2)), nR = lpR(fR(rnd() * 2 - 1, f * 1.08, 1.2));
    if (a < 0.0005) continue;
    L[i] += nL * a; R[i] += nR * a;
  }
}

/* ——— Le passage sur mobile : une fente qui s'ouvre, puis se referme ——— */
[[55.0, 1], [60.55, -1]].forEach(([t0, dir]) => {
  const i0 = Math.round(t0 * SR), n = Math.round(0.45 * SR), f = svf();
  for (let j = 0; j < n; j++) {
    const u = j / n;
    put(i0 + j, f(rnd() * 2 - 1, dir > 0 ? 500 + u * 2800 : 3300 - u * 2800, 1.1) * Math.sin(Math.PI * u) * 0.12, 0, 0.35);
  }
});

/* ——— Réverbération (Freeverb) ——— */
function reverb(inL, inR, room = 0.86, damp = 0.25) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], alls = [556, 441, 341, 225];
  const make = (sp) => ({c: combs.map((d) => ({b: new Float32Array(d + sp), i: 0, s: 0})), a: alls.map((d) => ({b: new Float32Array(d + sp), i: 0}))});
  const run = (st, x) => {
    let out = 0;
    for (const c of st.c) { const y = c.b[c.i]; c.s = y * (1 - damp) + c.s * damp; c.b[c.i] = x * 0.015 + c.s * room; c.i = (c.i + 1) % c.b.length; out += y; }
    for (const a of st.a) { const y = a.b[a.i]; a.b[a.i] = out + y * 0.5; a.i = (a.i + 1) % a.b.length; out = y - out; }
    return out;
  };
  const sl = make(0), sr = make(23);
  const oL = new Float32Array(inL.length), oR = new Float32Array(inR.length);
  for (let i = 0; i < inL.length; i++) { const x = (inL[i] + inR[i]) * 0.5; oL[i] = run(sl, x + inL[i] * 0.5); oR[i] = run(sr, x + inR[i] * 0.5); }
  return [oL, oR];
}
const [wL, wR] = reverb(SL, SR_);
const ML = new Float32Array(N), MR = new Float32Array(N);
for (let i = 0; i < N; i++) { ML[i] = L[i] + wL[i] * 0.9; MR[i] = R[i] + wR[i] * 0.9; }

/* ——— Le retour en arrière : la journée réentendue à l'envers, au rythme où la page remonte ———
   À chaque instant du retour, on lit le son du moment où la page était à la même hauteur à l'aller. */
{
  const T0 = 61.0, T1 = 64.0;
  // aller : hauteur → instant (la trajectoire monte sans jamais redescendre avant 61 s)
  const fwd = [];
  for (let t = 0; t <= T0; t += 0.005) fwd.push([dayY(t), t]);
  const when = (y) => {
    let lo = 0, hi = fwd.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (fwd[mid][0] < y) lo = mid + 1; else hi = mid; }
    return fwd[lo][1];
  };
  const lp1L = biquad('lp', 3800), lp1R = biquad('lp', 3800), lp2L = biquad('lp', 3800), lp2R = biquad('lp', 3800);
  const env = curve([[T0 - 0.1, 0], [T0 + 0.25, 1], [T1 - 0.35, 1], [T1 + 0.2, 0]]);
  const i0 = Math.round((T0 - 0.1) * SR), i1 = Math.round((T1 + 0.2) * SR);
  for (let i = i0; i < i1; i++) {
    const t = i / SR;
    const src = when(dayY(Math.min(t, T1))) * SR;
    const k = Math.floor(src), fr = src - k;
    if (k < 0 || k + 1 >= N) continue;
    const sL = ML[k] * (1 - fr) + ML[k + 1] * fr, sR = MR[k] * (1 - fr) + MR[k + 1] * fr;
    const e = env(t);
    // la journée à l'endroit s'efface pendant qu'elle se rembobine
    const keep = 1 - smooth((t - (T0 - 0.1)) / 0.4) * (1 - smooth((t - (T1 - 0.1)) / 0.4));
    ML[i] = ML[i] * keep + lp2L(lp1L(sL)) * e * 0.5;
    MR[i] = MR[i] * keep + lp2R(lp1R(sR)) * e * 0.5;
  }
  // et le souffle d'une bande qui file
  const bL = svf(), bR = svf();
  let v = 0;
  for (let i = i0; i < i1; i++) {
    if (i % 64 === 0) v = speed(i / SR);
    const f = Math.min(5200, 500 + v * 0.35);
    const a = Math.pow(clamp01(v / 9000), 1.2) * 0.12;
    ML[i] += bL(rnd() * 2 - 1, f, 0.7) * a; MR[i] += bR(rnd() * 2 - 1, f * 1.1, 0.7) * a;
  }
}

/* ——— Fondu final, crête à −3 dB, écriture ——— */
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const g = Math.min(1, t / 0.35) * (t > DUR - 1.4 ? Math.max(0, (DUR - t) / 1.4) : 1);
  ML[i] *= g; MR[i] *= g;
  peak = Math.max(peak, Math.abs(ML[i]), Math.abs(MR[i]));
}
const scale = 0.707 / peak;
const out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVE', 8); out.write('fmt ', 12);
out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22); out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(ML[i] * scale * 32767))), 44 + i * 4);
  out.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(MR[i] * scale * 32767))), 46 + i * 4);
}
const file = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sfx/day.wav');
mkdirSync(dirname(file), {recursive: true});
writeFileSync(file, out);
console.log(`✓ ${file}  ${DUR.toFixed(1)} s, crête d'origine ${(20 * Math.log10(peak)).toFixed(1)} dB`);
