// Musique originale de la présentation Heritage Pools Texas, synthétisée de zéro (aucun échantillon, aucun droit tiers).
// 90 BPM, en fa majeur, lumineuse. Ouverture : une nappe, puis l'accord s'ouvre quand le logotype arrive.
// Le site : piano électrique (synthèse FM), vibraphone, basse ronde, grosse caisse douce, rimshot et shaker. Pendant
// l'ouverture du site, le motif monte comme l'eau ; quand la piscine s'allume, une cloche. La scène de nuit : le groove
// passe dans un filtre qui se referme à moitié. Fin sur fa, avec des cloches. Les temps des scènes viennent de
// src/beats.ts (les accords changent sur les coupes).
// Usage : node sound/music.mjs  →  public/sfx/music.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCENE_BEATS, OPEN, END, BUILD} from '../src/beats.ts';

const SR = 44100;
const BPM = 90;
const BEAT = 60 / BPM;
const FR = 40; // images par temps
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

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const n = (name) => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  const base = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]];
  return midi(12 * (Number(m[3]) + 1) + base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0));
};
let seed = 32547;
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

// ——— Accords (voix du piano électrique et des nappes) et basse, en fa majeur ———
const CH = {
  Fmaj9: {v: ['A3', 'C4', 'E4', 'G4'], b: 'F2'},
  F69: {v: ['A3', 'D4', 'G4', 'C5'], b: 'F2'},
  Dm9: {v: ['F3', 'A3', 'C4', 'E4'], b: 'D2'},
  Bbmaj9: {v: ['D4', 'F4', 'A4', 'C5'], b: 'Bb1'},
  Bbmaj7: {v: ['D4', 'F4', 'A4'], b: 'Bb1'},
  Gm9: {v: ['Bb3', 'D4', 'F4', 'A4'], b: 'G1'},
  Am7: {v: ['G3', 'C4', 'E4'], b: 'A1'},
  Csus: {v: ['Bb3', 'C4', 'F4', 'G4'], b: 'C2'},
  C13: {v: ['Bb3', 'E4', 'A4'], b: 'C2'},
  BbC: {v: ['Bb3', 'D4', 'F4', 'G4'], b: 'C2'},
};

// Grille : chaque scène commence sur un accord (src/beats.ts)
const POOL = OPEN.logo / FR; // le logotype arrive : l'accord s'ouvre
// l'ouverture du site (scène Build) : l'eau monte, puis la piscine s'allume (temps comptés depuis le début de la scène)
const half = (x) => Math.round(x * 2) / 2; // sur la croche la plus proche
const WATER = S.Build + half(BUILD.water / FR);
const LIT = S.Build + half(BUILD.lit / FR);
const PROG = [
  // ouverture : une nappe, puis l'accord s'ouvre quand le logotype arrive
  [0, 'Bbmaj7'], [POOL, 'Fmaj9'], [POOL + 2, 'Bbmaj9'], [S.Build - 1, 'Csus'],
  // l'ouverture du site : le groove part, la pelouse, la terre, le béton, la pierre
  [S.Build, 'Fmaj9'], [S.Build + 4, 'Dm9'], [S.Build + 8, 'Bbmaj9'], [S.Build + 12, 'Gm9'],
  // l'eau monte, puis la nuit : la piscine s'allume
  [WATER, 'Csus'], [LIT, 'F69'], [S.Drag - 1, 'C13'],
  // la règle des jours
  [S.Drag, 'Dm9'], [S.Drag + 4, 'Bbmaj9'], [S.Drag + 6, 'Csus'],
  // les services
  [S.Services, 'Fmaj9'], [S.Services + 4, 'Am7'], [S.Services + 6, 'Csus'],
  // la galerie
  [S.Pools, 'Bbmaj9'], [S.Pools + 4, 'Gm9'], [S.Pools + 7, 'C13'],
  // la nuit (sombre)
  [S.Night, 'Dm9'], [S.Night + 4, 'Bbmaj9'],
  // les valeurs
  [S.Values, 'Fmaj9'], [S.Values + 4, 'Csus'],
  // le contact
  [S.Contact, 'Bbmaj9'], [S.Contact + 4, 'C13'],
  // téléphones
  [S.Mobile, 'Fmaj9'], [S.Mobile + 4, 'Am7'], [S.Mobile + 7, 'BbC'],
  // fin
  [S.End, 'Bbmaj9'], [S.End + 3, 'Csus'], [S.End + 4, 'F69'],
];
const chordAt = (beat) => {
  let c = PROG[0];
  for (const p of PROG) if (beat >= p[0] - 1e-9) c = p;
  return c;
};

// ——— Nappe : sinus et triangles désaccordés, attaque lente ———
const padGain = (b) => env(b, [
  [0, 0], [1, 0.28], [POOL - 0.2, 0.3], [POOL + 0.5, 0.42], [S.Build - 0.5, 0.3], [S.Build, 0.14],
  [WATER - 1, 0.14], [WATER + 1, 0.22], [LIT + 1.5, 0.22], [S.Drag, 0.14],
  [S.Night, 0.2], [S.Values, 0.12], [S.End, 0.36], [S.End + 4, 0.42], [TOTAL_BEATS + 3, 0],
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
    const a = 0.08;
    lp[0] += (sl - lp[0]) * a;
    lp[1] += (sr - lp[1]) * a;
    add(i, lp[0] * g, lp[1] * g, 1.1);
  }
}

// ——— Piano électrique (FM : porteuse et modulatrice au même rapport, indice qui retombe ; le « tine » à l'attaque) ———
const addEP = (t0, names, gain, len, bright = 1, groove = true, spread = 0.012) => {
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
      const idx = bright * (0.3 + 1.8 * Math.exp(-t * 3));
      const mod = Math.sin(2 * Math.PI * f * t + ph0);
      let s = Math.sin(2 * Math.PI * f * t + idx * mod) * Math.exp(-t * (1.0 + f / 1500));
      s += 0.14 * bright * Math.sin(2 * Math.PI * f * 14.03 * t) * Math.exp(-t * 60);
      const trem = 0.5 + 0.12 * Math.sin(2 * Math.PI * 4.2 * t);
      s *= gain * att * rel;
      if (Math.abs(s) < 1e-6 && t > len) break;
      add(i0 + j, s * (1 - pan) * (1 + (trem - 0.5)), s * pan * (1 - (trem - 0.5)), 0.42, groove);
    }
  }
};

// ——— Vibraphone (partiels 1, 4, 10 ; trémolo du moteur ; maillet doux) ———
const addVibe = (t0, freq, gain, pan, groove = true, len = 1.6) => {
  const i0 = Math.floor(t0 * SR);
  let lp = 0;
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    let s = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * (1.6 + freq / 1600)) + 0.18 * Math.sin(2 * Math.PI * freq * 4 * t) * Math.exp(-t * 7) + 0.05 * Math.sin(2 * Math.PI * freq * 10 * t) * Math.exp(-t * 22);
    if (t < 0.008) {
      lp += (rnd() * 2 - 1 - lp) * 0.2;
      s += lp * 0.12 * (1 - t / 0.008);
    }
    const trem = 1 - 0.22 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 5.4 * t));
    s *= gain * trem * (t < 0.002 ? t / 0.002 : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.45, groove);
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
    const a = gain * (t < 0.008 ? t / 0.008 : 1) * (0.6 * Math.exp(-t * 1.6) + 0.4) * (t > len ? Math.max(0, 1 - (t - len) / 0.06) : 1);
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
    add(i0 + j, band(st[0], rnd() * 2 - 1, 2400, 0.8) * e * gain, band(st[1], rnd() * 2 - 1, 2300, 0.8) * e * gain, 0.45, true);
  }
};
const addShaker = (t0, gain, pan) => {
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.08; j++) {
    const t = j / SR;
    const e = (t < 0.01 ? t / 0.01 : 1) * Math.exp(-t * 55);
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

// ——— Partition ———
const at = (b) => b * BEAT;
const isStart = (b, start) => Math.abs(b - start) < 1e-9;
const GROOVE0 = S.Build; // le nouveau site : le groove part
const grooveOn = (b) => b >= GROOVE0 && b < S.End;
const DARK = [['Night', 'Values']];
const dark = (b) => DARK.some(([a, z]) => b >= S[a] && b < S[z]);
// intensité de la batterie : 0 = rien, 1 = complet
const drums = (b) => {
  if (b < GROOVE0) return 0;
  if (b < S.Build + 4) return 0.6;
  if (b >= S.End) return 0;
  return dark(b) ? 0.8 : 1;
};
// le motif de vibraphone du nouveau site (fa pentatonique), sur deux mesures : il monte, puis retombe
const HOOK = [[0, 'F4'], [0.5, 'G4'], [1, 'A4'], [1.5, 'C5'], [2.5, 'D5'], [3, 'C5'], [4, 'A4'], [4.5, 'C5'], [5.5, 'G4'], [6.5, 'A4']];
const hookOn = (b) => (b >= S.Build + 2 && b < S.Build + 10) || (b >= S.Mobile && b < S.Mobile + 7);

for (let s16 = 0; s16 < TOTAL_BEATS * 4; s16++) {
  const b = s16 / 4;
  const t = at(b);
  const [start, name] = chordAt(b);
  const c = CH[name];
  const bar = (b - GROOVE0 + 400) % 4; // position dans la mesure (les mesures partent de l'ouverture du site)
  const d = drums(b);

  if (grooveOn(b)) {
    // piano électrique : l'accord sur le 1, une syncope avant le 3, et chaque changement d'accord
    if (isStart(b, start) || bar === 0 || bar === 1.5 || (bar === 3.5 && d >= 1)) addEP(t, c.v, 0.05 * (isStart(b, start) || bar === 0 ? 1 : 0.62), bar === 1.5 ? 1.0 : 0.6, 0.85);
    // basse : fondamentale sur le 1, rappel sur le « et » de 2, la quinte avant la mesure suivante
    const root = n(c.b) * 2;
    if (bar === 0 || isStart(b, start)) addBass(t, root, 0.27, BEAT * 1.3);
    if (bar === 1.5 && d > 0.5) addBass(t, root, 0.15, BEAT * 0.45);
    if (bar === 3.5 && d > 0.5) addBass(t, root * 1.5, 0.11, BEAT * 0.35);
  }
  if (d > 0) {
    // une demi-mesure plus lente que la musique : grosse caisse sur le 1 et le « et » de 2, rimshot sur 2 et 4
    if (bar === 0 || bar === 2.5) addKick(t, 0.36 * Math.min(1, d + 0.2));
    if (bar === 1 || bar === 3) (d >= 1 ? addSnap : addRim)(t, 0.065);
    addShaker(t, (s16 % 2 === 1 ? 0.045 : 0.02) * d, s16 % 2 === 1 ? 0.62 : 0.4);
    if (d >= 1 && bar === 3.75) addRim(t, 0.028, 0.72);
  }
  // vibraphone : arpège en croches sur les notes de l'accord (sauf pendant le motif)
  const arp = grooveOn(b) && !hookOn(b);
  if (arp && s16 % 2 === 0) {
    const k = Math.floor((b - GROOVE0) * 2) % (c.v.length + 1);
    const nm = k < c.v.length ? c.v[k] : c.v[0];
    addVibe(t, n(nm) * 2, 0.026, k % 2 ? 0.66 : 0.34, true, 1.1);
  }
  // le motif, rejoué au début des scènes claires
  if (hookOn(b)) {
    const ref = b < S.Mobile ? S.Build + 2 : S.Mobile;
    const pos = ((b - ref) % 8 + 8) % 8;
    for (const [p, nm] of HOOK) if (Math.abs(pos - p) < 1e-9) addVibe(t, n(nm), 0.06, 0.5 + 0.15 * Math.sin(p), true, 1.6);
  }

  // — ouverture : la nappe ; l'accord s'ouvre quand le logotype arrive —
  if (b < S.Build) {
    if (isStart(b, POOL)) {
      addEP(t, ['F2', 'C3', 'A3', 'E4', 'G4'], 0.07, BEAT * 3.6, 1, false, 0.016);
      addBass(t, n('F2') * 2, 0.3, BEAT * 3.4);
      addKick(t, 0.3, false);
    }
    if (b > POOL && b < S.Build - 0.5 && s16 % 2 === 0) {
      const v = CH[name].v;
      addVibe(t, n(v[Math.floor(b * 2) % v.length]) * 2, 0.02, s16 % 4 ? 0.64 : 0.36, false, 1.2);
    }
  }
  // — fin : l'accord se pose —
  if (b >= S.End) {
    const k = b - S.End;
    if (isStart(b, start)) { addEP(t, c.v, 0.05, BEAT * 3, 0.7, false); addBass(t, n(c.b) * 2, 0.24, BEAT * 3.2); }
    if (k < 6 && s16 % 2 === 0) addVibe(t, n(c.v[Math.floor(b * 2) % c.v.length]) * 2, 0.02, s16 % 4 ? 0.62 : 0.38, false, 1.2);
  }
}

// le nouveau site arrive : un coup sourd et l'accord
addKick(at(S.Build), 0.42, false);
addEP(at(S.Build), ['F2', 'C3', 'A3', 'E4', 'G4'], 0.055, BEAT * 3, 1, false, 0.012);
// la piscine s'allume : deux cloches douces
for (const [nm, g, pan, dt] of [['C6', 0.034, 0.4, 0], ['F6', 0.026, 0.62, 0.05]]) addBell(at(LIT) + dt, n(nm), g, pan, 3.5);
// fin : basse profonde et cloches sur fa, sur le dernier accord
addKick(at(S.End), 0.4, false);
{
  const t1 = at(S.End + 4);
  addBass(t1, n('F2') * 2, 0.26, 4);
  for (const [nm, g, pan, dt] of [['F5', 0.06, 0.35, 0], ['A5', 0.05, 0.62, 0.02], ['C6', 0.045, 0.45, 0.04], ['E6', 0.032, 0.7, 0.06], ['G6', 0.026, 0.3, 0.08]]) addBell(t1 + dt, n(nm), g, pan, 5);
}

// ——— Les scènes sombres : le groove passe dans un passe-bas qui se referme à moitié, puis se rouvre ———
const cutoff = (b) => env(b, [
  [0, 17000], [S.Night - 0.3, 17000], [S.Night + 0.5, 3600], [S.Values - 0.6, 3600], [S.Values, 17000],
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
void END;
