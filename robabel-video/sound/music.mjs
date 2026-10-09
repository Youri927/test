// Musique originale de la présentation Custom Pools by Rob Abel, synthétisée de zéro (aucun échantillon, aucun droit tiers).
// 90 BPM, en mi bémol majeur : une soirée au bord de l'eau. Ouverture : une nappe dans le noir, chaque lumière
// a sa note (les bruitages jouent les palmiers), et l'accord s'ouvre quand la piscine s'allume.
// Le site actuel en do mineur, sans batterie ; le nouveau site : piano électrique (synthèse FM), vibraphone,
// basse ronde, grosse caisse douce, rimshot et shaker. Les scènes sombres du site (local technique, chlore ou sel,
// rendez-vous) : le groove passe dans un filtre qui se referme à moitié. Fin sur mi bémol, avec des cloches,
// pendant que les lumières s'éteignent. Les temps des scènes viennent de src/beats.ts (les accords changent sur les coupes).
// Usage : node sound/music.mjs  →  public/sfx/music.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCENE_BEATS, OPEN, END} from '../src/beats.ts';

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

// ——— Accords (voix du piano électrique et des nappes) et basse, en mi bémol majeur ———
const CH = {
  Ebmaj9: {v: ['G3', 'Bb3', 'D4', 'F4'], b: 'Eb2'},
  Eb69: {v: ['G3', 'C4', 'F4', 'Bb4'], b: 'Eb2'},
  Cm9: {v: ['Eb3', 'G3', 'Bb3', 'D4'], b: 'C2'},
  Cm7: {v: ['Eb3', 'G3', 'Bb3'], b: 'C2'},
  Abmaj9: {v: ['C4', 'Eb4', 'G4', 'Bb4'], b: 'Ab1'},
  Abmaj7: {v: ['C4', 'Eb4', 'G4'], b: 'Ab1'},
  Fm9: {v: ['Ab3', 'C4', 'Eb4', 'G4'], b: 'F2'},
  Gm7: {v: ['F3', 'Bb3', 'D4'], b: 'G1'},
  Bbsus: {v: ['Ab3', 'Bb3', 'Eb4', 'F4'], b: 'Bb1'},
  Bb13: {v: ['Ab3', 'D4', 'G4'], b: 'Bb1'},
  AbBb: {v: ['Ab3', 'C4', 'Eb4', 'F4'], b: 'Bb1'},
};

// Grille : chaque scène commence sur un accord (src/beats.ts)
const POOL = OPEN.pool / FR; // la piscine s'allume
const PROG = [
  // ouverture : dans le noir, puis l'accord s'ouvre quand la piscine s'allume
  [0, 'Abmaj7'], [POOL, 'Ebmaj9'], [POOL + 3, 'Abmaj9'], [S.Today - 2, 'Bbsus'],
  // le site actuel : do mineur, sans batterie
  [S.Today, 'Cm9'], [S.Today + 4, 'Abmaj7'], [S.Today + 7, 'Fm9'], [S.Today + 9, 'Bb13'],
  // l'accueil : le groove part
  [S.Hero, 'Ebmaj9'], [S.Hero + 4, 'Cm9'], [S.Hero + 8, 'Abmaj9'], [S.Hero + 12, 'Bbsus'], [S.Hero + 14, 'Bb13'],
  // Rob et les fontaines
  [S.Pools, 'Ebmaj9'], [S.Pools + 4, 'Gm7'], [S.Pools + 8, 'Abmaj9'], [S.Pools + 12, 'Fm9'], [S.Pools + 14, 'Bbsus'],
  // au bord de l'eau
  [S.Water, 'Abmaj9'], [S.Water + 4, 'Ebmaj9'], [S.Water + 7, 'Bbsus'],
  // le local technique (sombre)
  [S.Pump, 'Cm9'], [S.Pump + 4, 'Abmaj9'], [S.Pump + 8, 'Fm9'], [S.Pump + 12, 'Cm9'], [S.Pump + 16, 'Abmaj9'], [S.Pump + 19, 'Bbsus'],
  // autour de l'eau
  [S.Backyard, 'Ebmaj9'], [S.Backyard + 4, 'Cm9'], [S.Backyard + 8, 'AbBb'],
  // neuve ou existante
  [S.How, 'Abmaj9'], [S.How + 4, 'Ebmaj9'], [S.How + 8, 'Fm9'], [S.How + 10, 'Bbsus'],
  // chlore ou sel (sombre)
  [S.Salt, 'Cm9'], [S.Salt + 4, 'Abmaj9'], [S.Salt + 8, 'Bb13'],
  // la carte et le rendez-vous (sombre)
  [S.Contact, 'Ebmaj9'], [S.Contact + 4, 'Cm9'], [S.Contact + 8, 'Abmaj9'], [S.Contact + 12, 'Fm9'], [S.Contact + 16, 'Bbsus'],
  // téléphones
  [S.Mobile, 'Ebmaj9'], [S.Mobile + 4, 'Gm7'], [S.Mobile + 8, 'AbBb'],
  // fin
  [S.End, 'Abmaj9'], [S.End + 4, 'Bbsus'], [S.End + 6, 'Eb69'],
];
const chordAt = (beat) => {
  let c = PROG[0];
  for (const p of PROG) if (beat >= p[0] - 1e-9) c = p;
  return c;
};

// ——— Nappe : sinus et triangles désaccordés, attaque lente ———
const padGain = (b) => env(b, [
  [0, 0], [1, 0.28], [POOL - 0.2, 0.3], [POOL + 0.5, 0.42], [S.Today, 0.24], [S.Hero - 0.5, 0.26], [S.Hero, 0.14],
  [S.Pump, 0.22], [S.Backyard, 0.12], [S.Salt, 0.2], [S.Mobile, 0.12], [S.End, 0.36], [S.End + 8, 0.42], [TOTAL_BEATS + 3, 0],
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
const GROOVE0 = S.Hero; // le nouveau site : le groove part
const grooveOn = (b) => b >= GROOVE0 && b < S.End;
const DARK = [['Pump', 'Backyard'], ['Salt', 'Contact'], ['Contact', 'Mobile']];
const dark = (b) => DARK.some(([a, z]) => b >= S[a] && b < S[z]);
// intensité de la batterie : 0 = rien, 1 = complet
const drums = (b) => {
  if (b < GROOVE0) return 0;
  if (b < S.Hero + 4) return 0.6;
  if (b >= S.End) return 0;
  return dark(b) ? 0.8 : 1;
};
// le motif de vibraphone du nouveau site (mi bémol pentatonique), sur deux mesures
const HOOK = [[0, 'G4'], [0.5, 'Bb4'], [1.5, 'C5'], [2.5, 'Bb4'], [3, 'G4'], [4, 'F4'], [4.5, 'G4'], [5.5, 'Eb4'], [6.5, 'F4']];
const hookOn = (b) => (b >= S.Hero + 4 && b < S.Hero + 12) || (b >= S.Backyard && b < S.Backyard + 8) || (b >= S.Mobile && b < S.Mobile + 8);

for (let s16 = 0; s16 < TOTAL_BEATS * 4; s16++) {
  const b = s16 / 4;
  const t = at(b);
  const [start, name] = chordAt(b);
  const c = CH[name];
  const bar = (b - GROOVE0 + 400) % 4; // position dans la mesure (les mesures partent de l'accueil)
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
    const ref = b < S.Backyard ? S.Hero + 4 : b < S.Mobile ? S.Backyard : S.Mobile;
    const pos = ((b - ref) % 8 + 8) % 8;
    for (const [p, nm] of HOOK) if (Math.abs(pos - p) < 1e-9) addVibe(t, n(nm), 0.06, 0.5 + 0.15 * Math.sin(p), true, 1.6);
  }

  // — ouverture : la nappe dans le noir ; un piano grave avec la maison ; l'accord s'ouvre quand la piscine s'allume —
  if (b < S.Today) {
    if (isStart(b, OPEN.house / FR)) addEP(t, ['Eb2', 'Bb2'], 0.05, BEAT * 3, 0.5, false);
    if (isStart(b, POOL)) {
      addEP(t, ['Eb2', 'Bb2', 'G3', 'D4', 'F4'], 0.07, BEAT * 3.6, 1, false, 0.016);
      addBass(t, n('Eb2') * 2, 0.3, BEAT * 3.4);
      addKick(t, 0.3, false);
    }
    if (b > POOL && b < S.Today - 0.5 && s16 % 2 === 0) {
      const v = CH[name].v;
      addVibe(t, n(v[Math.floor(b * 2) % v.length]) * 2, 0.02, s16 % 4 ? 0.64 : 0.36, false, 1.2);
    }
  }
  // — le site actuel : piano électrique étouffé, une pulsation sourde, sans batterie —
  if (b >= S.Today && b < S.Hero) {
    const k = b - S.Today;
    if (isStart(b, start)) { addEP(t, c.v, 0.04, BEAT * 3, 0.35, false); addBass(t, n(c.b) * 2, 0.18, BEAT * 3.2); }
    if (k % 2 === 0) addKick(t, 0.13, false);
    if (k >= 8 && s16 % 2 === 0) addKick(t, 0.06 + 0.04 * (k - 8), false);
  }
  // — fin : les lumières s'éteignent, l'accord se pose —
  if (b >= S.End) {
    const k = b - S.End;
    if (isStart(b, start)) { addEP(t, c.v, 0.05, BEAT * 3, 0.7, false); addBass(t, n(c.b) * 2, 0.24, BEAT * 3.2); }
    if (k < 6 && s16 % 2 === 0) addVibe(t, n(c.v[Math.floor(b * 2) % c.v.length]) * 2, 0.02, s16 % 4 ? 0.62 : 0.38, false, 1.2);
  }
}

// le nouveau site arrive : un coup sourd et l'accord
addKick(at(S.Hero), 0.42, false);
addEP(at(S.Hero), ['Eb2', 'Bb2', 'G3', 'D4', 'F4'], 0.055, BEAT * 3, 1, false, 0.012);
// fin : basse profonde et cloches sur mi bémol, pendant que la maison s'éteint
addKick(at(S.End), 0.4, false);
{
  const t1 = at(S.End + 6);
  addBass(t1, n('Eb2') * 2, 0.26, 6);
  for (const [nm, g, pan, dt] of [['Eb5', 0.06, 0.35, 0], ['G5', 0.05, 0.62, 0.02], ['Bb5', 0.045, 0.45, 0.04], ['D6', 0.032, 0.7, 0.06], ['F6', 0.026, 0.3, 0.08]]) addBell(t1 + dt, n(nm), g, pan, 5);
}

// ——— Les scènes sombres : le groove passe dans un passe-bas qui se referme à moitié, puis se rouvre ———
const cutoff = (b) => env(b, [
  [0, 17000], [S.Pump - 0.3, 17000], [S.Pump + 0.5, 3600], [S.Backyard - 0.6, 3600], [S.Backyard, 17000],
  [S.Salt - 0.3, 17000], [S.Salt + 0.5, 3400], [S.Contact + 6, 3400], [S.Contact + 9, 9000], [S.Mobile - 0.6, 9000], [S.Mobile, 17000],
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
// (END sert aux repères de la fin, voir src/cues.ts)
void END;
