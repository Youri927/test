// Musique originale de la présentation Implant and Comprehensive Dentistry of Naples, synthétisée de zéro
// (aucun échantillon, aucun droit tiers). 90 BPM, en fa majeur.
// Ouverture claire (le logo se construit, la couronne se pose sur le temps 4), le site actuel en ré mineur
// (pulsation sourde, piano étouffé), la bascule sur si bémol avec une montée, puis le nouveau site :
// piano feutré, cordes pincées, basse ronde, grosse caisse douce, rim et shaker.
// Sédation : la lumière baisse, la musique aussi (filtre qui se referme en deux fois, la batterie s'efface).
// Le parcours du Dr. Fakhoury repart en demi-temps ; la demande retrouve tout le groove. Fin sur fa majeur.
// Les temps des scènes viennent de src/beats.ts (les accords changent sur les coupes).
// Usage : node sound/music.mjs  →  public/sfx/music.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCENE_BEATS} from '../src/beats.ts';

const SR = 44100;
const BPM = 90;
const BEAT = 60 / BPM;
const TOTAL_BEATS = SCENE_BEATS.reduce((n, [, b]) => n + b, 0);
const TAIL = 4;
const N = Math.ceil((TOTAL_BEATS * BEAT + TAIL) * SR);
// trois bus : le groove (filtré pendant la sédation), le reste (nappes, basse), et l'envoi vers la réverbération
const L = new Float32Array(N);
const R = new Float32Array(N);
const GL = new Float32Array(N);
const GR = new Float32Array(N);
const busL = new Float32Array(N);
const busR = new Float32Array(N);

// début de chaque scène, en temps
const SB = {};
{
  let b = 0;
  for (const [name, n] of SCENE_BEATS) { SB[name] = b; b += n; }
}

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const n = (name) => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  const base = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]];
  return midi(12 * (Number(m[3]) + 1) + base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0));
};
let seed = 2392;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
/** ajoute un échantillon ; groove = passe par le filtre de la sédation */
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

// ——— Accords (voix du piano et des nappes) et basse ———
const CH = {
  Fmaj9: {v: ['A3', 'C4', 'E4', 'G4'], b: 'F1'},
  Dm9: {v: ['F3', 'A3', 'C4', 'E4'], b: 'D2'},
  Bbmaj9: {v: ['F3', 'A3', 'C4', 'D4'], b: 'Bb1'},
  Bbmaj7: {v: ['F3', 'A3', 'D4'], b: 'Bb1'},
  Gm9: {v: ['F3', 'Bb3', 'D4', 'A4'], b: 'G1'},
  Gm7: {v: ['F3', 'Bb3', 'D4'], b: 'G1'},
  Csus: {v: ['F3', 'G3', 'Bb3', 'D4'], b: 'C2'},
  C: {v: ['E3', 'G3', 'Bb3', 'D4'], b: 'C2'},
  Am7: {v: ['G3', 'C4', 'E4', 'A4'], b: 'A1'},
  FA: {v: ['F3', 'A3', 'C4', 'E4'], b: 'A1'},
  A7sus: {v: ['E3', 'G3', 'A3', 'D4'], b: 'A1'},
  A7: {v: ['E3', 'G3', 'C#4'], b: 'A1'},
};
const S = SB;
// Grille : chaque scène commence sur un accord (src/beats.ts) ; repères des scènes entre parenthèses
const PROG = [
  [0, 'Bbmaj9'], [4, 'Fmaj9'], [8, 'Csus'], [9, 'C'],
  // aujourd'hui (10)
  [S.Today, 'Dm9'], [S.Today + 4, 'Bbmaj7'], [S.Today + 8, 'Gm9'], [S.Today + 12, 'Dm9'], [S.Today + 16, 'Bbmaj7'], [S.Today + 18, 'Gm7'], [S.Today + 20, 'A7sus'], [S.Today + 21, 'A7'],
  // la bascule (32)
  [S.Turn, 'Bbmaj9'], [S.Turn + 3, 'Csus'], [S.Turn + 4, 'C'],
  // l'accueil (37)
  [S.Hero, 'Fmaj9'], [S.Hero + 4, 'Am7'], [S.Hero + 8, 'Bbmaj9'], [S.Hero + 12, 'Gm9'], [S.Hero + 14, 'Csus'], [S.Hero + 16, 'C'],
  // les implants (54)
  // les filets tombent du temps 5 au temps 8, la couronne se pose sur le temps 9 (nouvel accord)
  [S.Implants, 'Fmaj9'], [S.Implants + 4, 'Dm9'], [S.Implants + 9, 'Bbmaj9'], [S.Implants + 11, 'C'],
  // la course (66) : E4D arrive sur le temps 4 de la scène, la méthode habituelle sur le temps 10
  // (la course part en ré mineur ; E4D arrive sur la tonique, la méthode habituelle sur la dominante, en retard)
  [S.Crowns, 'Dm9'], [S.Crowns + 4, 'Fmaj9'], [S.Crowns + 6, 'Bbmaj9'], [S.Crowns + 8, 'Gm9'], [S.Crowns + 10, 'C'], [S.Crowns + 12, 'Fmaj9'],
  // les situations (80) : la fiche s'ouvre sur le temps 8
  [S.Treatments, 'Dm9'], [S.Treatments + 4, 'Bbmaj9'], [S.Treatments + 8, 'FA'], [S.Treatments + 11, 'Gm9'], [S.Treatments + 13, 'Csus'], [S.Treatments + 14, 'C'],
  // la sédation (95) : les deux niveaux sur les temps 4 et 9
  [S.Sedation, 'Fmaj9'], [S.Sedation + 4, 'Dm9'], [S.Sedation + 9, 'Bbmaj9'],
  // le parcours (108) : New York sur le temps 3, Naples sur le temps 9
  [S.Doctor, 'Gm9'], [S.Doctor + 3, 'Bbmaj9'], [S.Doctor + 6, 'Dm9'], [S.Doctor + 9, 'Csus'], [S.Doctor + 11, 'C'],
  // la demande (120) : l'envoi sur le temps 11
  [S.Request, 'Fmaj9'], [S.Request + 4, 'Am7'], [S.Request + 8, 'Bbmaj9'], [S.Request + 11, 'C'], [S.Request + 12, 'Fmaj9'], [S.Request + 14, 'Csus'], [S.Request + 15, 'C'],
  // téléphones (136)
  [S.Mobile, 'Fmaj9'], [S.Mobile + 4, 'Dm9'], [S.Mobile + 8, 'Bbmaj9'], [S.Mobile + 10, 'Csus'], [S.Mobile + 11, 'C'],
  // fin (148)
  [S.End, 'Fmaj9'], [S.End + 4, 'Bbmaj9'], [S.End + 7, 'Dm9'], [S.End + 9, 'Csus'], [S.End + 10, 'Fmaj9'],
];
const chordAt = (beat) => {
  let c = PROG[0];
  for (const p of PROG) if (beat >= p[0] - 1e-9) c = p;
  return c;
};

// ——— Nappe : sinus et triangles désaccordés, attaque lente ———
const padGain = (b) => env(b, [
  [0, 0], [2, 0.3], [9.5, 0.34], [S.Today, 0.26], [S.Turn - 0.5, 0.3], [S.Turn, 0.42], [S.Hero - 0.3, 0.62], [S.Hero, 0.14],
  [S.Sedation + 3.5, 0.14], [S.Sedation + 4.5, 0.3], [S.Sedation + 9, 0.42], [S.Doctor + 6, 0.3], [S.Request - 0.5, 0.26], [S.Request, 0.12],
  [S.Mobile, 0.16], [S.End, 0.42], [S.End + 12, 0.46], [TOTAL_BEATS + 3, 0],
]);
{
  let cur = null;
  let prev = null;
  let xf = 1;
  const XF = SR * 1.3;
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
          const f = f0 * Math.pow(2, (d * 0.06) / 12);
          const ph = f * t + k * 0.23 + (d > 0 ? 0.5 : 0) + 0.004 * Math.sin(t * (0.37 + k * 0.11));
          const fr = ph - Math.floor(ph);
          const tri = 1 - 4 * Math.abs(fr - 0.5);
          const x = (0.72 * Math.sin(2 * Math.PI * ph) + 0.28 * tri) * w * 0.11;
          if (d < 0) sl += x; else sr += x;
        }
      });
    }
    const a = 0.1;
    lp[0] += (sl - lp[0]) * a;
    lp[1] += (sr - lp[1]) * a;
    add(i, lp[0] * g, lp[1] * g, 1.1);
  }
}

// ——— Piano feutré (synthèse additive : partiels légèrement inharmoniques, attaque douce) ———
const addPiano = (t0, names, gain, len, bright = 1, groove = true, spread = 0.008) => {
  for (const [k, nm] of names.entries()) {
    const f = n(nm);
    const i0 = Math.floor((t0 + k * spread) * SR);
    const pan = 0.36 + 0.28 * (k / Math.max(1, names.length - 1));
    const parts = [];
    for (let p = 1; p <= 7; p++) {
      const fp = p * f * Math.sqrt(1 + 0.0004 * p * p);
      if (fp > 9000) break;
      parts.push({f: fp, a: Math.pow(p, -1.5) * (p === 1 ? 1 : bright * Math.exp(-(p - 1) * 0.25)), d: 1.1 + 0.85 * p + f / 900, ph: rnd() * 6.28});
    }
    const total = SR * (len + 0.5);
    for (let j = 0; j < total; j++) {
      const t = j / SR;
      const rel = t > len ? Math.exp(-(t - len) * 10) : 1;
      const att = t < 0.004 ? t / 0.004 : 1;
      let s = 0;
      for (const q of parts) s += q.a * Math.exp(-q.d * t) * Math.sin(2 * Math.PI * q.f * t + q.ph);
      // le feutre du marteau : un petit souffle grave à l'attaque
      if (t < 0.02) s += (rnd() - 0.5) * 0.08 * (1 - t / 0.02);
      s *= gain * att * rel;
      if (Math.abs(s) < 1e-6 && t > len) break;
      add(i0 + j, s * (1 - pan), s * pan, 0.45, groove);
    }
  }
};

// ——— Corde pincée (additive : position du pincement, aigus qui s'éteignent vite) ———
const addPluck = (t0, freq, gain, pan, len = 0.9, groove = true) => {
  const i0 = Math.floor(t0 * SR);
  const parts = [];
  for (let p = 1; p <= 8; p++) {
    if (p * freq > 10000) break;
    parts.push({f: p * freq, a: Math.abs(Math.sin(p * Math.PI * 0.18)) / p, d: 2.2 + 1.6 * p});
  }
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    let s = 0;
    for (const q of parts) s += q.a * Math.exp(-q.d * t) * Math.sin(2 * Math.PI * q.f * t);
    s *= gain * (t < 0.002 ? t / 0.002 : 1);
    add(i0 + j, s * (1 - pan), s * pan, 0.35, groove);
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
    const a = gain * (t < 0.008 ? t / 0.008 : 1) * (0.62 * Math.exp(-t * 1.6) + 0.38) * (t > len ? Math.max(0, 1 - (t - len) / 0.06) : 1);
    const s = Math.tanh((Math.sin(2 * Math.PI * ph) + 0.22 * Math.sin(4 * Math.PI * ph) * Math.exp(-t * 6)) * 1.3) * a;
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
const addRim = (t0, gain, pan = 0.55) => {
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.12; j++) {
    const t = j / SR;
    const s = (band(st, rnd() * 2 - 1, 1900, 0.5) * Math.exp(-t * 60) * 0.8 + Math.sin(2 * Math.PI * 830 * t) * Math.exp(-t * 45) * 0.5) * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.3, true);
  }
};
const addClap = (t0, gain) => {
  const i0 = Math.floor(t0 * SR);
  const st = [svf(), svf()];
  for (let j = 0; j < SR * 0.25; j++) {
    const t = j / SR;
    const e = (t < 0.01 ? 1 : t < 0.02 ? 0.4 : t < 0.03 ? 0.85 : 0.6) * Math.exp(-Math.max(0, t - 0.03) * 24);
    add(i0 + j, band(st[0], rnd() * 2 - 1, 1500, 0.9) * e * gain, band(st[1], rnd() * 2 - 1, 1500, 0.9) * e * gain, 0.5, true);
  }
};
const addShaker = (t0, gain, pan) => {
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.09; j++) {
    const t = j / SR;
    const e = (t < 0.01 ? t / 0.01 : 1) * Math.exp(-t * 48);
    const s = band(st, rnd() * 2 - 1, 7200, 0.7) * e * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.12, true);
  }
};
// ——— Cloches (ouverture, fin) ———
const addBell = (t0, freq, gain, pan, len = 4) => {
  const i0 = Math.floor(t0 * SR);
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    const s = (Math.sin(2 * Math.PI * freq * t) + 0.22 * Math.sin(2 * Math.PI * freq * 2.76 * t) * Math.exp(-t * 2.5) + 0.08 * Math.sin(2 * Math.PI * freq * 5.4 * t) * Math.exp(-t * 6)) * Math.exp(-t * 0.9) * gain * (t < 0.003 ? t / 0.003 : 1);
    add(i0 + j, s * (1 - pan), s * pan, 0.9);
  }
};
// ——— Montée de bruit filtré (bascule) ———
const addRiser = (b0, b1, gain) => {
  const i0 = Math.floor(b0 * BEAT * SR);
  const i1 = Math.floor(b1 * BEAT * SR);
  const st = [svf(), svf()];
  for (let i = i0; i < i1; i++) {
    const p = (i - i0) / (i1 - i0);
    const fc = 300 + 5000 * p * p;
    const a = gain * Math.pow(p, 1.8) * (p > 0.97 ? (1 - p) / 0.03 : 1);
    add(i, band(st[0], rnd() * 2 - 1, fc, 0.7) * a, band(st[1], rnd() * 2 - 1, fc * 1.04, 0.7) * a, 0.4);
  }
};

// ——— Partition ———
const at = (b) => b * BEAT;
const isStart = (b, start) => Math.abs(b - start) < 1e-9;
const grooveOn = (b) => (b >= S.Hero && b < S.Sedation + 9) || (b >= S.Request && b < S.End);
// intensité du groove par scène : 0 = rien, 1 = complet
const drums = (b) => {
  if (b < S.Hero) return 0;
  if (b < S.Hero + 4) return 0.6;
  if (b < S.Sedation + 4) return 1;
  if (b < S.Sedation + 9) return 0.35; // sédation consciente : pied seul, très doux
  if (b < S.Request) return 0;
  if (b < S.Mobile) return 1;
  if (b < S.End) return 0.7;
  return 0;
};
for (let s16 = 0; s16 < TOTAL_BEATS * 4; s16++) {
  const b = s16 / 4;
  const t = at(b);
  const [start, name] = chordAt(b);
  const c = CH[name];
  const bar = (b - S.Hero + 400) % 4; // position dans la mesure (les mesures partent de l'accueil)
  const d = drums(b);

  if (grooveOn(b)) {
    // piano : l'accord sur le 1 et la double-croche avant le 3 (syncope), plus le changement d'accord
    if (isStart(b, start) || bar === 0 || bar === 1.75) addPiano(t, c.v, 0.055 * (isStart(b, start) || bar === 0 ? 1 : 0.7), bar === 1.75 ? 1.1 : 0.6, 0.9);
    // basse : fondamentale sur le 1, rappel sur le « et » de 2, quinte avant la mesure suivante
    const root = n(c.b) * 2;
    if (bar === 0 || isStart(b, start)) addBass(t, root, 0.26, BEAT * 1.4);
    if (bar === 1.5 && d > 0.5) addBass(t, root, 0.16, BEAT * 0.45);
    if (bar === 3.5 && d > 0.5) addBass(t, root * 1.5, 0.13, BEAT * 0.4);
  }
  if (d > 0) {
    if (bar === 0 || bar === 2 || (bar === 2.75 && d >= 1 && Math.floor((b - S.Hero) / 4) % 2 === 1)) addKick(t, 0.36 * Math.min(1, d + 0.2));
    if (d >= 0.6 && (bar === 1 || bar === 3)) (d >= 1 ? addClap : addRim)(t, d >= 1 ? 0.06 : 0.08);
    if (d >= 0.6) addShaker(t, (s16 % 2 === 1 ? 0.05 : 0.026) * d, s16 % 2 === 1 ? 0.62 : 0.42);
    if (d >= 1 && (bar === 0.5 || bar === 2.5) && Math.floor((b - S.Hero) / 4) % 2 === 0) addRim(t, 0.035, 0.7);
  }
  // cordes pincées : arpège en doubles croches sur les notes de l'accord (la course : plus dense ; les implants : laissent la place aux filets)
  const arp = (b >= S.Hero + 4 && b < S.Implants) || (b >= S.Crowns && b < S.Treatments + 13) || (b >= S.Request && b < S.Request + 11) || (b >= S.Mobile && b < S.End);
  if (arp) {
    const dense = b >= S.Crowns && b < S.Crowns + 10;
    if (dense || s16 % 2 === 0 || [0.75, 2.75].includes(bar)) {
      const k = Math.floor((b - S.Hero) * (dense ? 4 : 2)) % (c.v.length + 1);
      const nm = k < c.v.length ? c.v[k] : c.v[0];
      addPluck(t, n(nm) * 2, dense ? 0.05 : 0.045, k % 2 ? 0.66 : 0.34, 0.7);
    }
  }

  // — ouverture : la nappe, puis le piano quand la couronne se pose (temps 4), arpège jusqu'à la coupe —
  if (b < S.Today) {
    if (b === 4) { addPiano(t, ['F2', 'C3', 'A3', 'C4', 'E4', 'G4'], 0.07, BEAT * 3.8, 1, false, 0.012); addBass(t, n('F1') * 2, 0.3, BEAT * 3.6); addKick(t, 0.32, false); }
    if (b >= 4.5 && b < 9.5 && s16 % 2 === 0) {
      const v = CH[name].v;
      addPiano(t, [v[Math.floor(b * 2) % v.length]].map((x) => x.replace(/\d/, (o) => String(Number(o) + 1))), 0.03, 0.9, 0.8, false);
    }
    if (b === 8) addBass(t, n('C2') * 2, 0.22, BEAT * 1.8);
  }
  // — le site actuel : pulsation sourde, piano étouffé —
  if (b >= S.Today && b < S.Turn) {
    const k = b - S.Today;
    if (k % 4 === 0 || k % 4 === 2.5) addKick(t, 0.2 + 0.002 * k, false);
    if (k % 4 === 1 || k % 4 === 3) addRim(t, 0.025, 0.6);
    if (isStart(b, start)) { addPiano(t, c.v, 0.04, BEAT * 3.2, 0.35, false); addBass(t, n(c.b) * 2, 0.2, BEAT * 3.4); }
  }
  // — la bascule : montée, roulement doux de grosse caisse vers l'accueil —
  if (b >= S.Turn && b < S.Hero) {
    if (isStart(b, start)) { addPiano(t, c.v, 0.05, BEAT * 2.6, 0.8, false); addBass(t, n(c.b) * 2, 0.22, BEAT * 2.6); }
    if (b >= S.Hero - 1.5 && s16 % (b >= S.Hero - 0.75 ? 1 : 2) === 0) addKick(t, 0.12 + 0.12 * (b - (S.Hero - 1.5)), false);
    if (b >= S.Turn + 2 && s16 % 2 === 0) addPluck(t, n(c.v[Math.floor(b * 2) % c.v.length]) * 2, 0.04, s16 % 4 ? 0.64 : 0.36, 0.6, false);
  }
  // — le parcours : demi-temps, la nappe porte ; une grosse caisse par mesure, le shaker revient à New York —
  if (b >= S.Doctor && b < S.Request) {
    const k = b - S.Doctor;
    if (k % 4 === 0) addKick(t, 0.26, false);
    if (k >= 3 && s16 % 2 === 1) addShaker(t, 0.026 + 0.002 * k, 0.6);
    if (isStart(b, start)) { addPiano(t, c.v, 0.045, BEAT * 2.8, 0.7, false); addBass(t, n(c.b) * 2, 0.22, BEAT * 2.8); }
    if (k >= 10 && s16 % 1 === 0) addKick(t, 0.08 + 0.06 * (k - 10), false);
  }
  // — sédation intraveineuse : la batterie s'est tue ; piano lointain sur les changements —
  if (b >= S.Sedation + 9 && b < S.Doctor && isStart(b, start)) { addPiano(t, c.v, 0.04, BEAT * 3.8, 0.4, false); addBass(t, n(c.b) * 2, 0.22, BEAT * 3.8); }
  // — fin —
  if (b >= S.End) {
    const k = b - S.End;
    if (isStart(b, start)) { addPiano(t, c.v, 0.055, BEAT * 3, 0.8, false); addBass(t, n(c.b) * 2, 0.26, BEAT * 3.2); }
    if (k < 10 && s16 % 2 === 0) {
      const v = c.v;
      addPiano(t, [v[Math.floor(b * 2) % v.length].replace(/\d/, (o) => String(Number(o) + 1))], 0.026, 0.9, 0.8, false);
    }
    if (k < 9 && k % 2 === 0) addKick(t, 0.2, false);
  }
}

// le site actuel : un accord net à chaque constat (temps 14, 20, 26 du montage), une note pour chaque preuve surlignée
for (const k of [4, 10, 16]) addPiano(at(S.Today + k), ['D5', 'F5', 'A5'], 0.032, 0.7, 0.8, false);
for (const [k, nm] of [[6, 'A5'], [6.5, 'C6'], [7, 'D6'], [12, 'C6'], [18, 'A5'], [19, 'D6']]) addPiano(at(S.Today + k), [nm], 0.03, 0.5, 0.7, false);
// la bascule : montée vers l'accueil
addRiser(S.Turn + 0.5, S.Hero, 0.06);
// l'accueil : un coup sourd et l'accord quand le nouveau site est là
addKick(at(S.Hero), 0.46, false);
addPiano(at(S.Hero), ['F2', 'C3', 'A3', 'C4', 'E4', 'G4'], 0.06, BEAT * 3, 1, false, 0.01);
// les deux niveaux de sédation : un accord grave qui s'éteint lentement
addPiano(at(S.Sedation + 4), ['D2', 'A2', 'F3', 'C4'], 0.05, BEAT * 4, 0.5, false, 0.02);
addPiano(at(S.Sedation + 9), ['Bb1', 'F2', 'D3', 'A3'], 0.05, BEAT * 5, 0.4, false, 0.03);
// fin : basse profonde et cloches sur fa majeur
addKick(at(S.End), 0.5, false);
addBass(at(S.End), n('F1') * 2, 0.3, 5);
{
  const t1 = at(S.End + 10);
  addBass(t1, n('F1') * 2, 0.26, 6);
  for (const [nm, g, pan, dt] of [['F5', 0.07, 0.35, 0], ['A5', 0.055, 0.62, 0.02], ['C6', 0.05, 0.45, 0.04], ['E6', 0.035, 0.7, 0.06], ['G6', 0.028, 0.3, 0.08]]) addBell(t1 + dt, n(nm), g, pan, 5);
}

// ——— La sédation : le groove passe dans un passe-bas qui se referme en deux fois, puis se rouvre pour la demande ———
const cutoff = (b) => env(b, [
  [0, 17000], [S.Sedation + 3.6, 17000], [S.Sedation + 4.4, 2400], [S.Sedation + 8.6, 2000], [S.Sedation + 9.4, 700],
  [S.Doctor, 900], [S.Doctor + 9, 3000], [S.Request - 0.5, 9000], [S.Request, 17000],
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
