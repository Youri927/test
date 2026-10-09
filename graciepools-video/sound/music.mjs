// Musique originale de la présentation Gracie Pools, synthétisée de zéro (aucun échantillon, aucun droit tiers).
// 100 BPM, en la majeur. Ouverture claire (la cote compte, le contour se trace, l'eau arrive sur le temps 4) ;
// le site actuel en fa dièse mineur (pulsation sourde, piano électrique étouffé) ; la fiche : un accord tenu qui monte
// pendant que les dessins se posent, et le groove part sur le titre « Every model, drawn to scale ».
// Le nouveau site : marimba, piano électrique (synthèse FM), basse ronde, grosse caisse douce, rimshot, shaker.
// Les panneaux sombres du site (comparateur, piscines existantes) : le groove passe dans un filtre qui se referme à moitié.
// Fin sur la majeur, avec des cloches. Les temps des scènes viennent de src/beats.ts (les accords changent sur les coupes).
// Usage : node sound/music.mjs  →  public/sfx/music.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCENE_BEATS, SHEET, OPEN} from '../src/beats.ts';

const SR = 44100;
const BPM = 100;
const BEAT = 60 / BPM;
const TOTAL_BEATS = SCENE_BEATS.reduce((n, [, b]) => n + b, 0);
const TAIL = 4;
const N = Math.ceil((TOTAL_BEATS * BEAT + TAIL) * SR);
// trois bus : le groove (filtré dans les scènes sombres), le reste (nappes, basse, accents), et l'envoi vers la réverbération
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
const FR = 60 / BPM * 60; // images par temps (36)

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const n = (name) => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  const base = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]];
  return midi(12 * (Number(m[3]) + 1) + base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0));
};
let seed = 81774;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
/** ajoute un échantillon ; groove = passe par le filtre des scènes sombres */
const add = (i, l, r, send = 0, groove = false) => {
  if (i < 0 || i >= N) return;
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

// ——— Accords (voix du piano électrique et des nappes) et basse ———
const CH = {
  Amaj9: {v: ['C#4', 'E4', 'G#4', 'B4'], b: 'A1'},
  A6: {v: ['C#4', 'E4', 'F#4', 'A4'], b: 'A1'},
  Fsm9: {v: ['A3', 'C#4', 'E4', 'G#4'], b: 'F#1'},
  Fsm7: {v: ['A3', 'C#4', 'E4'], b: 'F#1'},
  Dmaj9: {v: ['F#3', 'A3', 'C#4', 'E4'], b: 'D2'},
  Dmaj7: {v: ['F#3', 'A3', 'C#4'], b: 'D2'},
  E69: {v: ['G#3', 'B3', 'C#4', 'F#4'], b: 'E2'},
  Esus: {v: ['A3', 'B3', 'E4', 'F#4'], b: 'E2'},
  E: {v: ['G#3', 'B3', 'D4', 'F#4'], b: 'E2'},
  Bm9: {v: ['A3', 'C#4', 'D4', 'F#4'], b: 'B1'},
  Bm7: {v: ['A3', 'D4', 'F#4'], b: 'B1'},
  Csm7: {v: ['G#3', 'B3', 'C#4', 'E4'], b: 'C#2'},
  Cs7sus: {v: ['F#3', 'G#3', 'B3', 'E4'], b: 'C#2'},
  Cs7: {v: ['E#3', 'G#3', 'B3', 'E4'], b: 'C#2'},
  DA: {v: ['F#3', 'A3', 'D4', 'E4'], b: 'A1'},
};
// E# n'existe pas dans le petit analyseur : on l'écrit F
CH.Cs7.v = ['F3', 'G#3', 'B3', 'E4'];

// Grille : chaque scène commence sur un accord (src/beats.ts)
const PROG = [
  // ouverture (0) : l'eau arrive sur le temps 4
  [0, 'Dmaj9'], [OPEN.fill / FR, 'Amaj9'], [7, 'E69'], [9, 'Esus'],
  // aujourd'hui (10) : fa dièse mineur, sourd
  [S.Today, 'Fsm9'], [S.Today + 4, 'Dmaj7'], [S.Today + 8, 'Bm7'], [S.Today + 12, 'Fsm9'], [S.Today + 16, 'Dmaj7'], [S.Today + 20, 'Bm7'], [S.Today + 22, 'Cs7sus'], [S.Today + 23, 'Cs7'],
  // la fiche (34) : ré majeur tenu pendant la note, puis l'accord monte pendant que les dessins se posent ; le groove part sur le titre
  [S.Sheet, 'Dmaj9'], [S.Sheet + 4, 'Bm9'], [S.Sheet + 6, 'Dmaj9'], [S.Sheet + 9, 'Esus'], [S.Sheet + 11, 'E'],
  [S.Sheet + 12, 'Amaj9'], [S.Sheet + 14, 'Fsm9'], [S.Sheet + 16, 'Dmaj9'], [S.Sheet + 17, 'Esus'],
  // l'accueil (52)
  [S.Hero, 'Amaj9'], [S.Hero + 4, 'Fsm9'], [S.Hero + 8, 'Dmaj9'], [S.Hero + 12, 'E69'],
  // la coque (66)
  [S.OnePiece, 'Amaj9'], [S.OnePiece + 4, 'Csm7'], [S.OnePiece + 8, 'Dmaj9'], [S.OnePiece + 11, 'Esus'], [S.OnePiece + 12, 'E'],
  // le comparateur (79) et la comparaison (92) : les scènes sombres
  [S.Models, 'Fsm9'], [S.Models + 4, 'Dmaj9'], [S.Models + 8, 'Bm9'], [S.Models + 11, 'Esus'],
  [S.Compare, 'Fsm9'], [S.Compare + 4, 'Dmaj9'], [S.Compare + 8, 'Amaj9'], [S.Compare + 10, 'Bm9'], [S.Compare + 12, 'Esus'], [S.Compare + 13, 'E'],
  // la galerie (106)
  [S.Gallery, 'Amaj9'], [S.Gallery + 4, 'Fsm9'], [S.Gallery + 8, 'Dmaj9'], [S.Gallery + 10, 'E69'],
  // les piscines existantes (118), sombre
  [S.Service, 'Bm9'], [S.Service + 4, 'Fsm9'], [S.Service + 8, 'Dmaj9'], [S.Service + 11, 'Esus'],
  // la demande (130)
  [S.Request, 'Amaj9'], [S.Request + 4, 'Csm7'], [S.Request + 8, 'Dmaj9'], [S.Request + 11, 'E69'], [S.Request + 12, 'Amaj9'], [S.Request + 14, 'Esus'],
  // téléphones (145)
  [S.Mobile, 'Amaj9'], [S.Mobile + 4, 'Fsm9'], [S.Mobile + 8, 'Dmaj9'], [S.Mobile + 10, 'Esus'], [S.Mobile + 11, 'E'],
  // fin (157)
  [S.End, 'Amaj9'], [S.End + 4, 'Dmaj9'], [S.End + 7, 'Bm9'], [S.End + 9, 'Esus'], [S.End + 10, 'A6'],
];
const chordAt = (beat) => {
  let c = PROG[0];
  for (const p of PROG) if (beat >= p[0] - 1e-9) c = p;
  return c;
};

// ——— Nappe : sinus et triangles désaccordés, attaque lente ———
const padGain = (b) => env(b, [
  [0, 0], [1.5, 0.3], [9.5, 0.32], [S.Today, 0.22], [S.Sheet - 0.5, 0.26], [S.Sheet, 0.36], [S.Sheet + 11.6, 0.56], [S.Sheet + 12, 0.14],
  [S.Models, 0.2], [S.Gallery, 0.12], [S.Service, 0.2], [S.Request, 0.12], [S.End, 0.4], [S.End + 12, 0.44], [TOTAL_BEATS + 3, 0],
]);
{
  let cur = null;
  let prev = null;
  let xf = 1;
  const XF = SR * 1.2;
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
    const a = 0.09;
    lp[0] += (sl - lp[0]) * a;
    lp[1] += (sr - lp[1]) * a;
    add(i, lp[0] * g, lp[1] * g, 1.1);
  }
}

// ——— Piano électrique (FM : porteuse et modulatrice au même rapport, indice qui retombe ; le « tine » à l'attaque) ———
const addEP = (t0, names, gain, len, bright = 1, groove = true, spread = 0.01) => {
  for (const [k, nm] of names.entries()) {
    const f = n(nm);
    const i0 = Math.floor((t0 + k * spread) * SR);
    const pan = 0.34 + 0.32 * (k / Math.max(1, names.length - 1));
    const total = SR * (len + 0.6);
    const ph0 = rnd() * 6.28;
    for (let j = 0; j < total; j++) {
      const t = j / SR;
      const rel = t > len ? Math.exp(-(t - len) * 9) : 1;
      const att = t < 0.003 ? t / 0.003 : 1;
      const idx = bright * (0.35 + 2.1 * Math.exp(-t * 3.2));
      const mod = Math.sin(2 * Math.PI * f * t + ph0);
      let s = Math.sin(2 * Math.PI * f * t + idx * mod) * Math.exp(-t * (1.1 + f / 1400));
      // le « tine » : un partiel aigu très bref
      s += 0.16 * bright * Math.sin(2 * Math.PI * f * 14.03 * t) * Math.exp(-t * 60);
      // trémolo stéréo lent
      const trem = 0.5 + 0.12 * Math.sin(2 * Math.PI * 4.6 * t);
      s *= gain * att * rel;
      if (Math.abs(s) < 1e-6 && t > len) break;
      add(i0 + j, s * (1 - pan) * (1 + (trem - 0.5)), s * pan * (1 - (trem - 0.5)), 0.4, groove);
    }
  }
};

// ——— Marimba (modes d'une lame : 1, 3,93, 9,0 ; maillet feutré à l'attaque) ———
const addMarimba = (t0, freq, gain, pan, groove = true, len = 1.2) => {
  const i0 = Math.floor(t0 * SR);
  const modes = [[1, 1, 3.6], [3.93, 0.42, 11], [9.0, 0.12, 26]];
  let lp = 0;
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    let s = 0;
    for (const [r, a, d] of modes) {
      if (freq * r > 12000) continue;
      s += a * Math.sin(2 * Math.PI * freq * r * t) * Math.exp(-t * d * (1 + freq / 2200));
    }
    if (t < 0.012) {
      lp += (rnd() * 2 - 1 - lp) * 0.3;
      s += lp * 0.25 * (1 - t / 0.012);
    }
    s *= gain * (t < 0.0015 ? t / 0.0015 : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.35, groove);
  }
};

// ——— Basse ronde ———
const addBass = (t0, freq, gain, len) => {
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * (len + 0.06); j++) {
    const t = j / SR;
    ph += freq / SR;
    ph -= Math.floor(ph);
    const a = gain * (t < 0.008 ? t / 0.008 : 1) * (0.6 * Math.exp(-t * 1.8) + 0.4) * (t > len ? Math.max(0, 1 - (t - len) / 0.06) : 1);
    const s = Math.tanh((Math.sin(2 * Math.PI * ph) + 0.2 * Math.sin(4 * Math.PI * ph) * Math.exp(-t * 7)) * 1.3) * a;
    add(i0 + j, s, s);
  }
};

// ——— Batterie douce ———
const addKick = (t0, gain, groove = true) => {
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.5; j++) {
    const t = j / SR;
    const f = 48 + 72 * Math.exp(-t * 30);
    ph += (2 * Math.PI * f) / SR;
    const s = (Math.sin(ph) * Math.exp(-t * 7) + (t < 0.002 ? (rnd() - 0.5) * 0.2 : 0)) * gain * (t < 0.003 ? t / 0.003 : 1);
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
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.12; j++) {
    const t = j / SR;
    const s = (band(st, rnd() * 2 - 1, 2100, 0.5) * Math.exp(-t * 62) * 0.8 + Math.sin(2 * Math.PI * 760 * t) * Math.exp(-t * 48) * 0.5) * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.3, groove);
  }
};
const addSnap = (t0, gain) => {
  const i0 = Math.floor(t0 * SR);
  const st = [svf(), svf()];
  for (let j = 0; j < SR * 0.18; j++) {
    const t = j / SR;
    const e = (t < 0.004 ? t / 0.004 : 1) * Math.exp(-t * 34);
    add(i0 + j, band(st[0], rnd() * 2 - 1, 2600, 0.8) * e * gain, band(st[1], rnd() * 2 - 1, 2500, 0.8) * e * gain, 0.45, true);
  }
};
const addShaker = (t0, gain, pan) => {
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.09; j++) {
    const t = j / SR;
    const e = (t < 0.01 ? t / 0.01 : 1) * Math.exp(-t * 50);
    const s = band(st, rnd() * 2 - 1, 7400, 0.7) * e * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.12, true);
  }
};
// ——— Cloches (fin) ———
const addBell = (t0, freq, gain, pan, len = 4) => {
  const i0 = Math.floor(t0 * SR);
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    const s = (Math.sin(2 * Math.PI * freq * t) + 0.22 * Math.sin(2 * Math.PI * freq * 2.76 * t) * Math.exp(-t * 2.5) + 0.08 * Math.sin(2 * Math.PI * freq * 5.4 * t) * Math.exp(-t * 6)) * Math.exp(-t * 0.9) * gain * (t < 0.003 ? t / 0.003 : 1);
    add(i0 + j, s * (1 - pan), s * pan, 0.9);
  }
};
// ——— Montée de bruit filtré ———
const addRiser = (b0, b1, gain) => {
  const i0 = Math.floor(b0 * BEAT * SR);
  const i1 = Math.floor(b1 * BEAT * SR);
  const st = [svf(), svf()];
  for (let i = i0; i < i1; i++) {
    const p = (i - i0) / (i1 - i0);
    const fc = 320 + 5200 * p * p;
    const a = gain * Math.pow(p, 1.8) * (p > 0.97 ? (1 - p) / 0.03 : 1);
    add(i, band(st[0], rnd() * 2 - 1, fc, 0.7) * a, band(st[1], rnd() * 2 - 1, fc * 1.04, 0.7) * a, 0.4);
  }
};

// ——— Partition ———
const at = (b) => b * BEAT;
const isStart = (b, start) => Math.abs(b - start) < 1e-9;
const GROOVE0 = S.Sheet + 12; // le titre de la fiche : le groove part
const grooveOn = (b) => b >= GROOVE0 && b < S.End;
// intensité de la batterie : 0 = rien, 1 = complet
const drums = (b) => {
  if (b < GROOVE0) return 0;
  if (b < S.Hero) return 0.6;
  if (b < S.Models) return 1;
  if (b < S.Gallery) return 0.8; // scènes sombres : un peu plus retenu
  if (b < S.Service) return 1;
  if (b < S.Request) return 0.7;
  if (b < S.Mobile) return 1;
  if (b < S.End) return 0.8;
  return 0;
};
// le motif de marimba du nouveau site (la majeur pentatonique), sur deux mesures, transposé avec l'accord
const HOOK = [[0, 'E5'], [0.75, 'C#5'], [1.5, 'B4'], [2, 'C#5'], [2.75, 'E5'], [3.5, 'F#5'], [4, 'E5'], [5, 'C#5'], [5.5, 'B4'], [6.5, 'A4']];
const hookOn = (b) => (b >= S.Hero && b < S.Hero + 8) || (b >= S.Gallery && b < S.Gallery + 8) || (b >= S.Request + 4 && b < S.Request + 12) || (b >= S.Mobile && b < S.Mobile + 8);

for (let s16 = 0; s16 < TOTAL_BEATS * 4; s16++) {
  const b = s16 / 4;
  const t = at(b);
  const [start, name] = chordAt(b);
  const c = CH[name];
  const bar = (b - GROOVE0 + 400) % 4; // position dans la mesure (les mesures partent du titre de la fiche)
  const d = drums(b);

  if (grooveOn(b)) {
    // piano électrique : l'accord sur le 1, la double-croche avant le 3 (syncope), et le changement d'accord
    if (isStart(b, start) || bar === 0 || bar === 1.75 || (bar === 3.5 && d >= 1)) addEP(t, c.v, 0.05 * (isStart(b, start) || bar === 0 ? 1 : 0.65), bar === 1.75 ? 0.9 : 0.55, 0.9);
    // basse : fondamentale sur le 1, rappel sur le « et » de 2, quinte avant la mesure suivante
    const root = n(c.b) * 2;
    if (bar === 0 || isStart(b, start)) addBass(t, root, 0.27, BEAT * 1.3);
    if (bar === 1.5 && d > 0.5) addBass(t, root, 0.16, BEAT * 0.45);
    if (bar === 2.75 && d >= 1) addBass(t, root * 1.5, 0.12, BEAT * 0.3);
    if (bar === 3.5 && d > 0.5) addBass(t, root * 2, 0.11, BEAT * 0.35);
  }
  if (d > 0) {
    if (bar === 0 || (bar === 2.5 && d >= 0.8) || (bar === 2 && d < 0.8)) addKick(t, 0.36 * Math.min(1, d + 0.2));
    if (d >= 0.6 && (bar === 1 || bar === 3)) (d >= 1 ? addSnap : addRim)(t, d >= 1 ? 0.07 : 0.07);
    if (d >= 0.6) addShaker(t, (s16 % 2 === 1 ? 0.05 : 0.024) * d, s16 % 2 === 1 ? 0.62 : 0.4);
    if (d >= 1 && (bar === 0.75 || bar === 3.25)) addRim(t, 0.03, 0.72);
  }
  // marimba : arpège en doubles croches sur les notes de l'accord, une octave au-dessus (sauf pendant le motif)
  const arp = grooveOn(b) && !hookOn(b) && !(b >= S.Service && b < S.Request);
  if (arp && (s16 % 2 === 0 || [0.75, 2.75].includes(bar))) {
    const k = Math.floor((b - GROOVE0) * 2) % (c.v.length + 1);
    const nm = k < c.v.length ? c.v[k] : c.v[0];
    addMarimba(t, n(nm) * 2, 0.04, k % 2 ? 0.66 : 0.34, true, 0.8);
  }
  // le motif, rejoué au début des scènes claires
  if (hookOn(b)) {
    const pos = ((b - S.Hero) % 8 + 8) % 8;
    for (const [p, nm] of HOOK) if (Math.abs(pos - p) < 1e-9) addMarimba(t, n(nm), 0.075, 0.5 + 0.15 * Math.sin(p), true, 1.3);
  }

  // — ouverture : la nappe ; des notes de marimba suivent la cote qui compte ; l'eau arrive sur le temps 4 —
  if (b < S.Today) {
    const tf = OPEN.fill / FR;
    if (b >= 0.25 && b < 2 && s16 % 1 === 0) addMarimba(t, n(['A5', 'C#6', 'E6', 'B5'][s16 % 4]), 0.02 + 0.004 * s16, s16 % 2 ? 0.62 : 0.38, false, 0.6);
    if (isStart(b, tf)) { addEP(t, ['A2', 'E3', 'C#4', 'G#4', 'B4'], 0.07, BEAT * 3.6, 1, false, 0.014); addBass(t, n('A1') * 2, 0.3, BEAT * 3.4); addKick(t, 0.3, false); }
    if (b > tf && b < 9.5 && s16 % 2 === 0) {
      const v = CH[name].v;
      addMarimba(t, n(v[Math.floor(b * 2) % v.length]) * 2, 0.026, s16 % 4 ? 0.64 : 0.36, false, 0.7);
    }
    if (b === 7) addBass(t, n('E2') * 2, 0.22, BEAT * 1.8);
    if (b === 9) addBass(t, n('E2') * 2, 0.2, BEAT * 0.9);
  }
  // — le site actuel : pulsation sourde, piano électrique étouffé —
  if (b >= S.Today && b < S.Sheet) {
    const k = b - S.Today;
    if (k % 4 === 0 || k % 4 === 2.5) addKick(t, 0.19 + 0.002 * k, false);
    if (k % 4 === 1 || k % 4 === 3) addRim(t, 0.022, 0.6, false);
    if (isStart(b, start)) { addEP(t, c.v, 0.04, BEAT * 3.2, 0.3, false); addBass(t, n(c.b) * 2, 0.2, BEAT * 3.4); }
    if (k >= 22 && s16 % 1 === 0) addKick(t, 0.06 + 0.05 * (k - 22), false);
  }
  // — la fiche : l'accord tenu, la note mesurée, puis les dessins se posent (les bruitages jouent les notes) ; montée vers le titre —
  if (b >= S.Sheet && b < GROOVE0) {
    const k = b - S.Sheet;
    if (isStart(b, start)) { addEP(t, c.v, 0.045, BEAT * 3, 0.6, false); addBass(t, n(c.b) * 2, 0.2, BEAT * 3); }
    if (k >= 6 && k < 11 && k % 1 === 0) addKick(t, 0.12 + 0.02 * (k - 6), false);
    if (k >= 11 && s16 % 1 === 0) addKick(t, 0.1 + 0.08 * (k - 11), false);
  }
  // — fin —
  if (b >= S.End) {
    const k = b - S.End;
    if (isStart(b, start)) { addEP(t, c.v, 0.055, BEAT * 3, 0.8, false); addBass(t, n(c.b) * 2, 0.26, BEAT * 3.2); }
    if (k < 10 && s16 % 2 === 0) addMarimba(t, n(c.v[Math.floor(b * 2) % c.v.length]) * 2, 0.024, s16 % 4 ? 0.62 : 0.38, false, 0.8);
    if (k < 9 && k % 2 === 0) addKick(t, 0.2, false);
  }
}

// le site actuel : un accord net à chaque constat, une note pour chaque preuve mesurée (src/beats.ts : TODAY)
for (const k of [5, 12, 18]) addEP(at(S.Today + k), ['F#4', 'A4', 'C#5'], 0.03, 0.7, 0.8, false);
for (const k of [7, 8, 14, 15, 19, 23]) addMarimba(at(S.Today + k), n(['C#6', 'E6', 'A5', 'C#6', 'F#5', 'A5'][[7, 8, 14, 15, 19, 23].indexOf(k)]), 0.05, 0.5, false, 0.8);
// la fiche : un accord quand la note « not to scale » est mesurée ; la montée vers le titre ; le titre
addEP(at(S.Sheet + (SHEET.note + 30) / FR), ['D4', 'F#4', 'A4', 'E5'], 0.035, 1.2, 0.9, false);
addRiser(S.Sheet + 8, GROOVE0, 0.055);
addKick(at(GROOVE0), 0.46, false);
addEP(at(GROOVE0), ['A2', 'E3', 'C#4', 'G#4', 'B4'], 0.06, BEAT * 3, 1, false, 0.012);
// l'accueil : un coup sourd et l'accord quand le nouveau site arrive
addKick(at(S.Hero), 0.4, false);
// le formulaire envoyé : un accord clair (la majeur)
// fin : basse profonde et cloches sur la majeur
addKick(at(S.End), 0.48, false);
addBass(at(S.End), n('A1') * 2, 0.3, 5);
{
  const t1 = at(S.End + 10);
  addBass(t1, n('A1') * 2, 0.26, 6);
  for (const [nm, g, pan, dt] of [['A5', 0.07, 0.35, 0], ['C#6', 0.055, 0.62, 0.02], ['E6', 0.05, 0.45, 0.04], ['G#6', 0.035, 0.7, 0.06], ['B6', 0.028, 0.3, 0.08]]) addBell(t1 + dt, n(nm), g, pan, 5);
}

// ——— Les scènes sombres : le groove passe dans un passe-bas qui se referme à moitié, puis se rouvre ———
const cutoff = (b) => env(b, [
  [0, 17000], [S.Models - 0.3, 17000], [S.Models + 0.5, 3800], [S.Gallery - 0.6, 3800], [S.Gallery, 17000],
  [S.Service - 0.3, 17000], [S.Service + 0.5, 3200], [S.Request - 0.6, 3200], [S.Request, 17000],
]);
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
  L[i] += wetL[i] * 0.28;
  R[i] += wetR[i] * 0.28;
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
