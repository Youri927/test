// Musique originale de la présentation Zynda Custom Homes & Remodeling, synthétisée de zéro (aucun échantillon, aucun
// droit tiers). 100 BPM, en fa majeur, calme et précise, comme le site : un piano feutré (une ostinato de croches, des
// accords posés), une nappe, une basse ronde, une batterie très légère (grosse caisse douce, coups de baguette sur le
// cercle, shaker), et, pour le cadran de l'année, le tic-tac d'une montre. Pas de bruitages : chaque geste filmé est
// souligné d'une note, au vibraphone, au célesta ou aux cloches.
// Elle suit le site :
// - l'ouverture : la nappe seule, à travers un filtre fermé, pendant que « The people who show up. » monte ; le filtre
//   s'ouvre avec le bandeau, et « Every single day. » monte sur le premier temps de la mesure : les cloches, le piano et
//   la basse entrent ; avec la légende, l'ostinato et la pulsation ;
// - l'année : le groupe entier et le tic-tac ; chaque temps de l'année a sa cloche quand le cadran l'affiche, et le
//   1er octobre atteint, un accord de cloches ;
// - les pièces : une note de vibraphone par photo qui se découvre ;
// - les détails : la visionneuse qui s'ouvre (les cloches, un accord), qui se referme (deux notes qui descendent) ;
// - les prestations : une note de célesta qui monte pour chaque ligne qui découvre sa photo ;
// - la demande : les deux mois choisis, la fenêtre qui se dessine, la phrase écrite, la demande prête (les cloches) ;
// - les téléphones : les mêmes gestes, plus doux ;
// - la fin : le groupe s'arrête ; le Z rejoué : un arpège suit le bandeau qui s'ouvre, et l'accord de fa se pose quand
//   « Every single day. » monte.
// Le son est décalé de 50 ms (3 images) sur l'image : un mouvement qui commence ne se voit qu'après quelques images, et un
// son un peu en retard sur un geste paraît juste, jamais un son en avance.
// Les temps des scènes viennent de src/beats.ts, les repères des gestes de public/site/*.json.
// Usage : node --no-warnings sound/music.mjs  →  public/sfx/music.wav
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCENE_BEATS, OPEN, END, EVENTS, PHONE_TIMING, PICKUP, TIMING, BEAT as FR} from '../src/beats.ts';

const here = dirname(fileURLToPath(import.meta.url));
const SR = 44100;
const BPM = 100;
const BEAT = 60 / BPM;
const DELAY = 3 / 60;
const TOTAL_BEATS = SCENE_BEATS.reduce((n, [, b]) => n + b, 0);
const TAIL = 4;
const N = Math.ceil((TOTAL_BEATS * BEAT + DELAY + TAIL) * SR);
// le son direct, et l'envoi vers la réverbération
const L = new Float32Array(N);
const R = new Float32Array(N);
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
/** temps de musique d'une image d'un plan, dans sa scène (plan lu à partir de son image `from`, figé `delay` images) */
const clipBeat = (scene, frame, t = {from: 0, delay: 0}) => S[scene] + fb(frame - t.from + t.delay);

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const n = (name) => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  const base = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]];
  return midi(12 * (Number(m[3]) + 1) + base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0));
};
let seed = 20011004;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const TAU = 2 * Math.PI;
// énergie de chaque instrument, pour vérifier l'équilibre du mélange (affichée à la fin)
const energy = {};
// et par fenêtre de 100 ms : le niveau de chaque instrument quand il joue
const WIN = Math.round(SR * 0.1);
const wins = {};
let TAG = 'nappe';
const add = (i, l, r, send = 0) => {
  if (i < 0 || i >= N) return;
  energy[TAG] = (energy[TAG] || 0) + l * l + r * r;
  (wins[TAG] ||= new Float64Array(Math.ceil(N / WIN)))[Math.floor(i / WIN)] += l * l + r * r;
  L[i] += l;
  R[i] += r;
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
/** courbe cubic-bezier CSS : la fraction du temps où la progression atteint p */
const bezier = (x1, y1, x2, y2) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (u) => ((ax * u + bx) * u + cx) * u;
  const Y = (u) => ((ay * u + by) * u + cy) * u;
  return (p) => {
    let lo = 0, hi = 1;
    for (let k = 0; k < 60; k++) { const u = (lo + hi) / 2; if (Y(u) < p) lo = u; else hi = u; }
    return X((lo + hi) / 2);
  };
};
// la courbe --ease-io du site : le bandeau de l'accueil qui s'ouvre
const SITE_IO = bezier(0.65, 0, 0.35, 1);

// ——— Équilibre des instruments (niveaux affichés à la fin) : le piano et les notes des gestes devant, la nappe dessous,
// la basse et la grosse caisse en retrait, le tic-tac, les coups sur le cercle et le shaker discrets ———
// (réglé sur la présentation de Florida South, mesurée de même : relatif à la grosse caisse, le piano à −7 dB, l'ostinato à
// −12, les notes des gestes à −10, les cloches à −17, le tic-tac à −22, le shaker à −29)
const MIX = {nappe: 0.88, piano: 0.9, ostinato: 1.25, vibra: 1.35, celesta: 1.2, cloches: 1.5, basse: 0.72, kick: 0.7, cercle: 0.36, shaker: 0.33, tictac: 0.38};

// ——— Accords, en fa majeur ———
// le piano : les accords posés au médium-grave ; l'ostinato : quatre ou cinq notes plus haut ; la nappe : quatre voix ;
// la basse : la fondamentale, entre do (65 Hz) et si bémol (117 Hz), que les petits haut-parleurs rendent
const PIANO = {
  Fadd9: ['F2', 'C3', 'G3', 'A3'],
  'F/A': ['A2', 'F3', 'A3', 'C4'],
  Am7: ['A2', 'E3', 'G3', 'C4'],
  Bbmaj9: ['Bb2', 'F3', 'A3', 'C4'],
  Bbmaj7: ['Bb2', 'F3', 'A3', 'D4'],
  C6: ['C3', 'E3', 'G3', 'A3'],
  Csus4: ['C3', 'F3', 'G3', 'C4'],
  Dm9: ['D3', 'F3', 'A3', 'E4'],
  Dm7: ['D3', 'F3', 'A3', 'C4'],
  Gm7: ['G2', 'F3', 'Bb3', 'D4'],
};
const OST = {
  Fadd9: ['F4', 'A4', 'C5', 'G5', 'A5'],
  'F/A': ['F4', 'A4', 'C5', 'F5', 'A5'],
  Am7: ['E4', 'G4', 'A4', 'C5', 'E5'],
  Bbmaj9: ['F4', 'A4', 'C5', 'D5', 'F5'],
  Bbmaj7: ['F4', 'A4', 'Bb4', 'D5', 'F5'],
  C6: ['E4', 'G4', 'A4', 'C5', 'E5'],
  Csus4: ['F4', 'G4', 'C5', 'F5', 'G5'],
  Dm9: ['E4', 'F4', 'A4', 'C5', 'E5'],
  Dm7: ['D4', 'F4', 'A4', 'C5', 'D5'],
  Gm7: ['D4', 'F4', 'G4', 'Bb4', 'D5'],
};
const PAD = {
  Fadd9: ['F3', 'A3', 'C4', 'G4'],
  'F/A': ['A3', 'C4', 'F4', 'A4'],
  Am7: ['G3', 'A3', 'C4', 'E4'],
  Bbmaj9: ['A3', 'C4', 'D4', 'F4'],
  Bbmaj7: ['F3', 'A3', 'Bb3', 'D4'],
  C6: ['G3', 'A3', 'C4', 'E4'],
  Csus4: ['G3', 'C4', 'F4', 'G4'],
  Dm9: ['F3', 'A3', 'C4', 'E4'],
  Dm7: ['F3', 'A3', 'C4', 'D4'],
  Gm7: ['F3', 'G3', 'Bb3', 'D4'],
};
const ROOT = {Fadd9: 'F2', 'F/A': 'A2', Am7: 'A2', Bbmaj9: 'Bb2', Bbmaj7: 'Bb2', C6: 'C2', Csus4: 'C2', Dm9: 'D2', Dm7: 'D2', Gm7: 'G2'};

// ——— Les repères de l'image ———
// L'ouverture (plan d-open lu à partir de OPEN.from, figé OPEN.delay images) : la première ligne monte 3 images après le
// départ, le bandeau s'ouvre 15 images après, « Every single day. » monte 51 images après, le texte paraît 75 images après
const O_IN = clipBeat('Open', mark('d-open', 'in', 1), TIMING.Open);
const O_L1 = O_IN + fb(3);
const O_BAND = O_IN + fb(15);
const O_L2 = O_IN + fb(51);
const O_LEDE = O_IN + fb(75);
if (Math.abs(O_L2 - PICKUP) > 0.1) throw new Error(`« Every single day. » monte au temps ${O_L2.toFixed(2)}, loin du premier temps ${PICKUP}`);
const ASIDE = fb(OPEN.aside);
const CAP = fb(OPEN.cap);
// la fin : le Z rejoué
const E_L1 = S.End + fb(END.l1 + 3);
const E_BAND = S.End + fb(END.l1 + 15);
const FINAL = S.End + fb(END.l1 + 51);
const E_TAIL = S.End + fb(END.l1 + 75);

// ——— La grille : un accord par mesure, deux sur les mesures qui finissent une phrase ———
const PROG = [
  [0, 'Fadd9'],
  [S.Open + 6, 'Am7'], [S.Open + 10, 'Bbmaj9'], [S.Open + 14, 'Csus4'], [S.Open + 16, 'C6'],
  [S.Year, 'Dm9'], [S.Year + 4, 'Bbmaj7'], [S.Year + 8, 'F/A'], [S.Year + 12, 'Gm7'], [S.Year + 16, 'Csus4'], [S.Year + 18, 'C6'],
  [S.Work, 'Fadd9'], [S.Work + 4, 'Am7'], [S.Work + 8, 'Bbmaj9'],
  [S.Details, 'Dm7'], [S.Details + 4, 'Bbmaj7'], [S.Details + 8, 'Csus4'], [S.Details + 10, 'C6'],
  [S.Services, 'F/A'], [S.Services + 4, 'Bbmaj9'], [S.Services + 8, 'C6'],
  [S.Contact, 'Dm9'], [S.Contact + 4, 'Am7'], [S.Contact + 8, 'Bbmaj7'], [S.Contact + 12, 'Csus4'], [S.Contact + 14, 'C6'],
  [S.Mobile, 'Fadd9'], [S.Mobile + 4, 'Dm7'], [S.Mobile + 8, 'Bbmaj9'], [S.Mobile + 12, 'Csus4'], [S.Mobile + 14, 'C6'],
  [S.End, 'Bbmaj9'], [FINAL, 'Fadd9'],
].sort((a, b) => a[0] - b[0]);
const chordAt = (beat) => {
  let c = PROG[0];
  for (const p of PROG) if (beat >= p[0] - 1e-9) c = p;
  return c;
};
const chordEnd = (start) => {
  const next = PROG.find((p) => p[0] > start + 1e-9);
  return next ? next[0] : TOTAL_BEATS;
};

// le groupe : la nappe seule pendant la levée ; à « Every single day. », le piano et la basse ; avec la légende,
// l'ostinato, la grosse caisse sur le premier temps et le shaker ; l'année, les détails, les prestations et les téléphones,
// le groupe entier ; les pièces et la demande, plus léger ; à la fin, plus rien
const layer = (b) => {
  if (b < O_L2) return 0;
  if (b < CAP) return 1;
  if (b < S.Year) return 2;
  if (b >= S.Work && b < S.Details) return 2;
  if (b >= S.Contact && b < S.Mobile) return 2;
  if (b < S.End) return 3;
  return 0;
};

const padGain = (b) => env(b, [
  [0, 0], [0.5, 0.2], [O_BAND, 0.24], [O_L2, 0.3], [O_L2 + 1.5, 0.18], [CAP, 0.14],
  [S.Work - 0.5, 0.14], [S.Work + 1, 0.2], [S.Details - 0.5, 0.2], [S.Details + 1, 0.14],
  [S.Contact - 0.5, 0.14], [S.Contact + 1, 0.2], [S.Mobile - 0.5, 0.2], [S.Mobile + 1, 0.14],
  [S.End - 0.5, 0.14], [S.End + 1, 0.28], [FINAL, 0.34], [TOTAL_BEATS + 3, 0],
]);

// ——— La nappe : trois sinus par note (fondamentale, octave, douzième), désaccordés en chœur, attaque lente, vibrato
// léger, un passe-bas doux ———
{
  let cur = null;
  let prev = null;
  let xf = 1;
  const XF = SR * 0.9;
  const lp = [0, 0];
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const b = (t - DELAY) / BEAT;
    const c = chordAt(b)[1];
    if (c !== cur) { prev = cur; cur = c; xf = prev ? 0 : 1; }
    if (xf < 1) xf = Math.min(1, xf + 1 / XF);
    const g = padGain(b);
    if (g < 1e-4) continue;
    let sl = 0;
    let sr = 0;
    for (const [name, w] of [[cur, Math.sin((xf * Math.PI) / 2)], [prev, Math.cos((xf * Math.PI) / 2)]]) {
      if (!name || w < 1e-3) continue;
      PAD[name].forEach((nm, k) => {
        const f0 = n(nm);
        for (const d of [-1, 1]) {
          const f = f0 * Math.pow(2, (d * 0.06) / 12);
          const vib = 0.0025 * Math.sin(TAU * (4.1 + k * 0.3) * t + k);
          const ph = f * t * (1 + vib * 0.02) + k * 0.29 + (d > 0 ? 0.5 : 0);
          const x = (0.76 * Math.sin(TAU * ph) + 0.18 * Math.sin(TAU * 2 * ph + 0.4) + 0.06 * Math.sin(TAU * 3 * ph + 1.1)) * w * 0.1;
          if (d < 0) sl += x; else sr += x;
        }
      });
    }
    const a = 0.045;
    lp[0] += (sl - lp[0]) * a;
    lp[1] += (sr - lp[1]) * a;
    TAG = 'nappe';
    add(i, lp[0] * g * MIX.nappe, lp[1] * g * MIX.nappe, 1.0);
  }
}

// ——— Le piano feutré : des cordes frappées par un marteau garni de feutre. Chaque partiel est une sinusoïde amortie
// (oscillateur récursif), légèrement inharmonique (la raideur de la corde), d'autant plus faible et brève qu'il est
// aigu (le feutre étouffe l'attaque) ; les trois premiers ont deux cordes un peu désaccordées (le battement du chœur) et
// un son rémanent qui s'éteint lentement ; un petit bruit de marteau ; l'étouffoir se pose au relâchement ———
const addPiano = (t0, freq, vel, len, pan = 0.5, tag = 'piano') => {
  TAG = tag;
  const g = vel * MIX[tag];
  const i0 = Math.floor(t0 * SR);
  const relT = 0.11;
  const total = Math.floor((len + relT * 5) * SR);
  const v = clamp01(vel / 0.07);
  const bright = 900 + 2600 * v;
  const Bk = 0.00008 * Math.pow(freq / 110, 1.1);
  const base = 0.5 + freq / 1100;
  // les oscillateurs : [cos ω, sin ω, facteur d'amortissement par échantillon, amplitude, re, im]
  const osc = [];
  for (let k = 1; k <= 24; k++) {
    const fk = freq * k * Math.sqrt(1 + Bk * k * k);
    if (fk > 8000) break;
    // le marteau frappe au septième de la corde : les partiels multiples de 7 sont absents
    const strike = Math.abs(Math.sin((Math.PI * k) / 7.3));
    const amp = (strike / Math.pow(k, 0.85)) * Math.exp(-(fk - freq) / bright);
    if (amp < 0.004) continue;
    const dk = base * (1 + 0.32 * (k - 1)) + 0.00035 * fk;
    const strings = k <= 3 ? [[-0.4, 0.5], [0.45, 0.5]] : [[0, 1]];
    for (const [cents, share] of strings) {
      const f = fk * Math.pow(2, cents / 1200);
      const w = (TAU * f) / SR;
      const ph = rnd() * TAU;
      // l'attaque (amorti vite) et le son rémanent (amorti lentement) : deux oscillateurs à la même fréquence
      for (const [part, slow] of k <= 3 ? [[0.7, 1], [0.3, 0.28]] : [[1, 1]]) {
        osc.push([Math.cos(w), Math.sin(w), Math.exp(-(dk * slow) / SR), amp * share * part, Math.cos(ph), Math.sin(ph)]);
      }
    }
  }
  let thump = 0;
  const mute = Math.floor(len * SR);
  const relK = Math.exp(-1 / (relT * SR));
  let rel = 1;
  const spread = Math.max(-0.25, Math.min(0.25, Math.log2(freq / 261.63) * 0.12));
  const p = clamp01(pan + spread);
  for (let j = 0; j < total; j++) {
    let s = 0;
    for (const o of osc) {
      const re = o[4] * o[0] - o[5] * o[1];
      const im = o[4] * o[1] + o[5] * o[0];
      o[4] = re * o[2];
      o[5] = im * o[2];
      s += o[5] * o[3];
    }
    const t = j / SR;
    if (t < 0.012) { thump += (rnd() * 2 - 1 - thump) * 0.05; s += thump * 0.5 * (1 - t / 0.012); }
    const att = t < 0.004 ? 0.5 - 0.5 * Math.cos((Math.PI * t) / 0.004) : 1;
    if (j > mute) rel *= relK;
    const y = s * att * rel * g;
    add(i0 + j, y * (1 - p) * 2, y * p * 2, 0.5);
    if (rel < 1e-4) break;
  }
};

// ——— Vibraphone : une lame d'aluminium (le fondamental, un partiel au quadruple et un au décuple, brefs), un maillet
// doux, et le trémolo du moteur ———
const addVibe = (t0, freq, vel, pan = 0.5, len = 3) => {
  TAG = 'vibra';
  const g = vel * MIX.vibra;
  const i0 = Math.floor(t0 * SR);
  const ph = rnd() * TAU;
  for (let j = 0; j < Math.floor(len * SR); j++) {
    const t = j / SR;
    let s = Math.sin(TAU * freq * t + ph) * Math.exp(-t * 0.9) + 0.14 * Math.sin(TAU * 3.98 * freq * t) * Math.exp(-t * 5) + 0.04 * Math.sin(TAU * 10.2 * freq * t) * Math.exp(-t * 14);
    const trem = 1 - 0.22 * (0.5 + 0.5 * Math.sin(TAU * 5.4 * (t0 + t)));
    s *= g * trem * (t < 0.002 ? t / 0.002 : 1) * (t > len - 0.3 ? Math.max(0, (len - t) / 0.3) : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.7);
  }
};

// ——— Célesta : des lames frappées dans leur caisse de résonance, une fondamentale douce et deux partiels brefs ———
const addCelesta = (t0, freq, vel, pan = 0.55, len = 2.6) => {
  TAG = 'celesta';
  const g = vel * MIX.celesta;
  const i0 = Math.floor(t0 * SR);
  let click = 0;
  for (let j = 0; j < Math.floor(len * SR); j++) {
    const t = j / SR;
    let s = Math.sin(TAU * freq * t) * Math.exp(-t * 1.5) + 0.28 * Math.sin(TAU * 2 * freq * t + 0.3) * Math.exp(-t * 4.5) + 0.12 * Math.sin(TAU * 4.07 * freq * t + 1.1) * Math.exp(-t * 11);
    if (t < 0.003) { click += (rnd() * 2 - 1 - click) * 0.4; s += click * 0.25 * (1 - t / 0.003); }
    s *= g * (t < 0.0015 ? t / 0.0015 : 1) * (t > len - 0.25 ? Math.max(0, (len - t) / 0.25) : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.75);
  }
};

// ——— Cloches (FM : un rapport inharmonique, un indice qui s'éteint) pour les grands moments ———
const addBell = (t0, freq, gain, pan, len = 3.6) => {
  TAG = 'cloches';
  gain *= MIX.cloches;
  const i0 = Math.floor(t0 * SR);
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    const idx = 2.0 * Math.exp(-t * 2.8) + 0.2;
    const s = Math.sin(TAU * freq * t + idx * Math.sin(TAU * freq * 3.5 * t)) * Math.exp(-t * 1.1) * gain * (t < 0.002 ? t / 0.002 : 1) * (t > len - 0.3 ? (len - t) / 0.3 : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.85);
  }
};

// ——— Basse : ronde, la fondamentale et un peu d'harmoniques à l'attaque ———
const addBass = (t0, freq, gain, len) => {
  TAG = 'basse';
  gain *= MIX.basse;
  const i0 = Math.floor(t0 * SR);
  let lp = 0;
  for (let j = 0; j < SR * (len + 0.1); j++) {
    const t = j / SR;
    const ph = TAU * freq * t;
    let s = Math.sin(ph) + 0.36 * Math.sin(2 * ph) * Math.exp(-t * 7) + 0.14 * Math.sin(3 * ph) * Math.exp(-t * 14) + 0.05 * Math.sin(4 * ph) * Math.exp(-t * 22);
    if (t < 0.008) { lp += (rnd() * 2 - 1 - lp) * 0.08; s += lp * 0.4; }
    const a = gain * (t < 0.008 ? t / 0.008 : 1) * (0.45 * Math.exp(-t * 3) + 0.55 * Math.exp(-t * 0.6)) * (t > len ? Math.max(0, 1 - (t - len) / 0.1) : 1);
    s = Math.tanh(s * 1.05) * a;
    add(i0 + j, s, s, 0.06);
  }
};

// ——— Batterie très légère ———
const addKick = (t0, gain) => {
  TAG = 'kick';
  gain *= MIX.kick;
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.45; j++) {
    const t = j / SR;
    const f = 52 + 58 * Math.exp(-t * 28);
    ph += (TAU * f) / SR;
    const s = Math.sin(ph) * Math.exp(-t * 8) * gain * (t < 0.004 ? t / 0.004 : 1);
    add(i0 + j, s, s, 0);
  }
};
const svf = () => ({lp: 0, bp: 0});
const band = (st, x, fc, q) => {
  const k = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6)) / SR);
  const hp = x - st.lp - q * st.bp;
  st.bp += k * hp;
  st.lp += k * st.bp;
  return {bp: st.bp, hp};
};
/** un coup de baguette sur le cercle de la caisse claire (le 2 et le 4) : un « toc » de bois, bref */
const addRim = (t0, gain, pan = 0.58) => {
  TAG = 'cercle';
  gain *= MIX.cercle;
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.1; j++) {
    const t = j / SR;
    const s = (0.55 * Math.sin(TAU * 830 * t) * Math.exp(-t * 42) + 0.35 * Math.sin(TAU * 1690 * t + 0.6) * Math.exp(-t * 80) + 0.6 * band(st, rnd() * 2 - 1, 2400, 0.6).bp * Math.exp(-t * 110)) * gain * (t < 0.0008 ? t / 0.0008 : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.3);
  }
};
/** le shaker : un grain de sable bref, aigu, à la double croche */
const addShaker = (t0, gain, pan = 0.36) => {
  TAG = 'shaker';
  gain *= MIX.shaker;
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.07; j++) {
    const t = j / SR;
    const e = (t < 0.006 ? t / 0.006 : 1) * Math.exp(-t * 60);
    const s = band(st, rnd() * 2 - 1, 7000, 0.9).bp * e * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.12);
  }
};
/** le tic-tac d'une montre : deux petits modes métalliques amortis en quelques millisecondes, plus haut pour le tic */
const addTick = (t0, gain, tock = false, pan = 0.5) => {
  TAG = 'tictac';
  gain *= MIX.tictac;
  const i0 = Math.floor(t0 * SR);
  const [f1, f2] = tock ? [2350, 4100] : [3150, 5650];
  let click = 0;
  for (let j = 0; j < SR * 0.04; j++) {
    const t = j / SR;
    let s = Math.sin(TAU * f1 * t) * Math.exp(-t * 150) + 0.45 * Math.sin(TAU * f2 * t + 0.5) * Math.exp(-t * 260);
    if (t < 0.0012) { click += (rnd() * 2 - 1 - click) * 0.6; s += click * 0.6 * (1 - t / 0.0012); }
    s *= gain * (t < 0.0004 ? t / 0.0004 : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.15);
  }
};

// ——— Partition : le groupe ———
const at = (b) => b * BEAT + DELAY;
const atFrame = (scene, frame, t) => at(clipBeat(scene, frame, t));
const near = (a, b) => Math.abs(a - b) < 1e-9;
// le piano : les accords posés (temps, durée), dans un accord de quatre temps et de deux temps
const COMP = {
  1: {4: [[0, 3.7]], 2: [[0, 1.8]]},
  2: {4: [[0, 3.7]], 2: [[0, 1.8]]},
  3: {4: [[0, 1.8], [2, 1.7]], 2: [[0, 1.8]]},
};
// l'ostinato : une note par croche, dans cet ordre parmi les cinq notes de l'accord (de la plus grave à la plus aiguë)
const OSTINATO = [0, 2, 3, 1, 4, 2, 3, 1];
// la basse : fondamentale et quinte (rapport à la fondamentale), longues
const BASS = {
  1: {4: [[0, 1, 3.6]], 2: [[0, 1, 1.8]]},
  2: {4: [[0, 1, 2.8], [3, 1.5, 0.9]], 2: [[0, 1, 1.8]]},
  3: {4: [[0, 1, 1.9], [2.5, 1, 0.45], [3, 1.5, 0.9]], 2: [[0, 1, 1.4], [1.5, 1.5, 0.45]]},
};
for (let s16 = 0; s16 < TOTAL_BEATS * 4; s16++) {
  const b = s16 / 4;
  const t = at(b);
  const [start, name] = chordAt(b);
  const lv = layer(b);
  if (!lv) continue;
  // position dans la mesure (les mesures commencent après la levée)
  const bar = (((b - PICKUP) % 4) + 4) % 4;
  const span = Math.round(chordEnd(start) - start) >= 4 ? 4 : 2;
  const inChord = b - start;
  for (const [pos, dur] of COMP[lv][span]) {
    if (!near(inChord, pos)) continue;
    const accent = pos === 0 ? 1 : 0.8;
    PIANO[name].forEach((nt, k) => addPiano(t + k * 0.012, n(nt), 0.052 * accent * (1 - 0.05 * k), dur * BEAT, 0.48));
  }
  for (const [pos, ratio, dur] of BASS[lv][span]) {
    if (near(inChord, pos)) addBass(t, n(ROOT[name]) * ratio, ratio === 1 ? 0.15 : 0.11, dur * BEAT);
  }
  // l'ostinato de croches, à partir de la légende de l'ouverture
  if (lv >= 2 && near(b % 0.5, 0)) {
    const k = Math.round(b * 2) % 8;
    const nt = OST[name][OSTINATO[k]];
    const accent = near(bar % 1, 0) ? 1 : 0.78;
    addPiano(t, n(nt), (lv === 3 ? 0.034 : 0.03) * accent, 0.55 * BEAT, 0.35 + 0.06 * OSTINATO[k], 'ostinato');
  }
  // grosse caisse : le 1 (et le 3 quand tout le groupe joue)
  if (lv >= 2 && near(bar, 0)) addKick(t, 0.4);
  if (lv === 3 && near(bar, 2)) addKick(t, 0.28);
  // coups sur le cercle sur le 2 et le 4, quand tout le groupe joue
  if (lv === 3 && (near(bar, 1) || near(bar, 3))) addRim(t, 0.1);
  // shaker en doubles croches, plus marqué sur les contretemps
  if (lv >= 2) addShaker(t + (s16 % 2 ? 0.008 : 0), s16 % 4 === 2 ? 0.05 : s16 % 2 ? 0.024 : 0.032);
}

// ——— Le tic-tac du cadran : les croches de toute la scène de l'année, tic sur les temps, tac sur les contretemps ———
for (let b = S.Year; b < S.Work - 1e-9; b += 0.5) {
  const fadeIn = clamp01((b - S.Year) / 2);
  const fadeOut = clamp01((S.Work - b) / 1.5);
  addTick(at(b), 0.08 * Math.min(fadeIn, fadeOut) * (near(b % 1, 0) ? 1 : 0.8), !near(b % 1, 0), near(b % 1, 0) ? 0.44 : 0.56);
}

// ——— Les gestes ———
// l'ouverture : la première ligne (une note) ; le bandeau qui s'ouvre (un arpège qui suit son masque, 1,5 s, --ease-io) ;
// « Every single day. » (les cloches, sur le premier temps, avec le piano et la basse) ; le texte (une note) ; le
// navigateur qui se range (deux notes) ; la légende (une note)
{
  addVibe(at(O_L1), n('C5'), 0.04, 0.4, 3);
  ['F4', 'A4', 'C5', 'F5', 'G5'].forEach((nt, k) => addCelesta(at(O_BAND) + 1.5 * SITE_IO(0.06 + (0.8 * k) / 4), n(nt), 0.03 + 0.003 * k, 0.32 + 0.09 * k, 2.6));
  addBell(at(O_L2), n('A5'), 0.026, 0.42, 4.2);
  addBell(at(O_L2) + 0.05, n('C6'), 0.018, 0.6, 4.2);
  addVibe(at(O_L2), n('F5'), 0.045, 0.5, 3.2);
  addVibe(at(O_LEDE), n('G5'), 0.03, 0.62, 2.6);
  addVibe(at(ASIDE), n('C5'), 0.032, 0.6, 2.4);
  addVibe(at(ASIDE + 0.5), n('F5'), 0.03, 0.66, 2.4);
  addCelesta(at(CAP), n('A5'), 0.026, 0.4, 2.6);
}

// l'année : chaque temps de l'année a sa cloche quand le cadran l'affiche (« We start », « On site, every day », « You’re
// home ») ; le 1er octobre atteint, un accord de cloches
{
  const y = (key, f0) => at(S.Year + fb(mark('d-year', key, f0)));
  addBell(y('start', 202), n('C6'), 0.018, 0.4, 3.4);
  addVibe(y('start', 202), n('A5'), 0.034, 0.42, 2.6);
  addBell(y('site', 358), n('D6'), 0.018, 0.55, 3.4);
  addVibe(y('site', 358), n('F5'), 0.034, 0.56, 2.6);
  addBell(y('home', 531), n('E6'), 0.018, 0.46, 3.4);
  addVibe(y('home', 531), n('G5'), 0.034, 0.5, 2.6);
  const o = y('oct1', 564);
  for (const [nt, g, pan, dt] of [['C6', 0.024, 0.38, 0], ['E6', 0.018, 0.6, 0.04], ['G6', 0.014, 0.48, 0.08]]) addBell(o + dt, n(nt), g, pan, 4.2);
}

// les pièces : une note de vibraphone par photo qui se découvre (le séjour, la cuisine, la vasque)
{
  const w = (key, f0) => at(S.Work + fb(mark('d-work', key, f0)));
  addVibe(w('living', 75), n('C5'), 0.04, 0.4, 3);
  addVibe(w('kitchen', 217), n('F5'), 0.04, 0.56, 3);
  addVibe(w('vanity', 258), n('A5'), 0.038, 0.62, 3);
}

// les détails : la visionneuse s'ouvre (les cloches et un accord de vibraphone), puis se referme (deux notes qui
// descendent)
{
  const d = (key, f0) => at(S.Details + fb(mark('d-details', key, f0)));
  const o = d('open', EVENTS.details.click * FR);
  addBell(o, n('F5'), 0.022, 0.44, 3.6);
  ['A4', 'C5', 'E5'].forEach((nt, k) => addVibe(o + k * 0.03, n(nt), 0.032, 0.4 + 0.1 * k, 2.8));
  ['E5', 'C5'].forEach((nt, k) => addVibe(d('closed', EVENTS.details.close * FR) + k * 0.12, n(nt), 0.032, 0.58 - 0.1 * k, 2.4));
}

// les prestations : chaque ligne qui passe sous la souris découvre sa photo : une note de célesta, de plus en plus haut
{
  ['C5', 'E5', 'F5', 'A5', 'C6'].forEach((nt, k) => {
    const f = mark('d-services', `h${k}`, null);
    if (f !== null) addCelesta(at(S.Services + fb(f)), n(nt), 0.036, 0.35 + 0.08 * k, 2.6);
  });
}

// la demande : les deux mois (deux notes), la fenêtre qui se dessine (une cloche) ; un clic dans le champ (une note
// grave) ; la phrase écrite (une note) ; la demande prête (les cloches, et un arpège)
{
  const c = (key, f0) => at(S.Contact + fb(mark('d-contact', key, f0)));
  addVibe(c('leave', EVENTS.contact.leave * FR), n('D5'), 0.036, 0.42, 2.4);
  addVibe(c('back', EVENTS.contact.back * FR), n('A5'), 0.036, 0.58, 2.4);
  addBell(c('win', EVENTS.contact.back * FR) + 0.12, n('E6'), 0.012, 0.6, 3);
  addPiano(c('focus', EVENTS.contact.msg * FR), n('A3'), 0.05, 0.5, 0.5);
  const typed = (meta('d-contact').caret || []).map((k) => (k ? k.typing : null));
  const last = typed.reduce((m, v) => (v != null && v > m ? v : m), 0);
  const fEnd = typed.findIndex((v) => v != null && v >= last);
  if (fEnd > 0) addVibe(at(S.Contact + fb(fEnd)), n('C5'), 0.03, 0.5, 2.4);
  const r = c('done', EVENTS.contact.send * FR);
  addBell(r, n('C6'), 0.024, 0.42, 4);
  addBell(r + 0.05, n('G6'), 0.016, 0.6, 4);
  ['F4', 'A4', 'C5', 'F5'].forEach((nt, k) => addCelesta(r + 0.08 + k * 0.08, n(nt), 0.032, 0.3 + 0.13 * k, 2.4));
}

// au téléphone : les trois téléphones montent (trois notes) ; au premier, l'ouverture (le bandeau, « Every single day. ») ;
// au deuxième, le menu s'ouvre, puis « Your year » ; au troisième, deux glissés, puis la pièce entière dans la visionneuse
{
  ['C5', 'F5', 'A5'].forEach((nt, k) => addVibe(at(S.Mobile + fb(k * 8 + 26)), n(nt), 0.028, 0.3 + 0.2 * k, 2.4));
  const mo = clipBeat('Mobile', mark('m-open', 'in', 1), PHONE_TIMING.mOpen);
  ['A4', 'C5', 'F5'].forEach((nt, k) => addCelesta(at(mo + fb(15)) + 1.5 * SITE_IO(0.08 + 0.4 * k), n(nt), 0.026, 0.3, 2.2));
  addBell(at(mo + fb(51)), n('A5'), 0.013, 0.32, 3.2);
  const mm = (key, f0) => atFrame('Mobile', mark('m-menu', key, f0), PHONE_TIMING.mMenu);
  addVibe(mm('menu', EVENTS.mobile.menu * FR), n('D5'), 0.03, 0.5, 2.2);
  addVibe(mm('closed', EVENTS.mobile.link * FR), n('G5'), 0.03, 0.5, 2.2);
  const ms = (key, f0) => atFrame('Mobile', mark('m-swatch', key, f0), PHONE_TIMING.mSwatch);
  addCelesta(ms('release', EVENTS.mobile.swipe[0] * FR + 12), n('E5'), 0.028, 0.66, 2.2);
  addCelesta(ms('release2', EVENTS.mobile.swipe[1] * FR + 12), n('G5'), 0.028, 0.7, 2.2);
  const v = ms('open', EVENTS.mobile.tap * FR);
  addBell(v, n('C6'), 0.014, 0.68, 3.4);
  ['F4', 'A4', 'C5'].forEach((nt, k) => addVibe(v + k * 0.03, n(nt), 0.026, 0.6 + 0.05 * k, 2.6));
}

// la fin : le groupe s'arrête ; l'accord de si bémol (la nappe, le piano) ; la première ligne (une note) ; le bandeau qui
// s'ouvre (un arpège qui suit son masque) ; l'accord de fa se pose quand « Every single day. » monte ; le logo et
// l'adresse (une note)
{
  PIANO.Bbmaj9.forEach((nt, k) => addPiano(at(S.End) + k * 0.012, n(nt), 0.05, 3 * BEAT, 0.48));
  addBass(at(S.End), n('Bb2'), 0.12, 3.2 * BEAT);
  addVibe(at(E_L1), n('C5'), 0.034, 0.42, 3);
  ['F4', 'A4', 'C5', 'F5', 'A5'].forEach((nt, k) => addCelesta(at(E_BAND) + 1.5 * SITE_IO(0.06 + (0.8 * k) / 4), n(nt), 0.032 + 0.002 * k, 0.32 + 0.09 * k, 3));
  const t1 = at(FINAL);
  PIANO.Fadd9.forEach((nt, k) => addPiano(t1 + k * 0.016, n(nt), 0.058, 4.4, 0.46));
  addBass(t1, n('F2'), 0.15, 4.2);
  addKick(t1, 0.28);
  for (const [nt, g, pan, dt] of [['A5', 0.028, 0.38, 0], ['C6', 0.022, 0.6, 0.04], ['F6', 0.016, 0.48, 0.08]]) addBell(t1 + dt, n(nt), g, pan, 5);
  addVibe(at(E_TAIL), n('G5'), 0.028, 0.56, 3.4);
}

// ——— Filtres ———
const biquad = (type, f0, Q, gainDb = 0) => {
  const A = Math.pow(10, gainDb / 40);
  const w0 = (TAU * f0) / SR;
  const c = Math.cos(w0);
  const alpha = Math.sin(w0) / (2 * Q);
  let b0, b1, b2, a0, a1, a2;
  if (type === 'peak') { b0 = 1 + alpha * A; b1 = -2 * c; b2 = 1 - alpha * A; a0 = 1 + alpha / A; a1 = -2 * c; a2 = 1 - alpha / A; }
  else if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; a0 = 1 + alpha; a1 = -2 * c; a2 = 1 - alpha; }
  else { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; a0 = 1 + alpha; a1 = -2 * c; a2 = 1 - alpha; }
  return {b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0};
};
const filt = (buf, q) => {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < buf.length; i++) {
    const x = buf[i];
    const y = q.b0 * x + q.b1 * x1 + q.b2 * x2 - q.a1 * y1 - q.a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    buf[i] = y;
  }
};

// ——— Réverbération (Schroeder : 4 filtres en peigne amortis + 3 passe-tout, par canal), une pièce assez grande ———
const reverb = (input, offset) => {
  const out = new Float32Array(N);
  const combs = [1931, 1801, 1699, 1559].map((d) => ({buf: new Float32Array(d + offset), i: 0, lp: 0}));
  const aps = [601, 467, 359].map((d) => ({buf: new Float32Array(d + offset), i: 0}));
  for (let s = 0; s < N; s++) {
    const x = input[s] * 0.5;
    let y = 0;
    for (const c of combs) {
      const v = c.buf[c.i];
      c.lp = v * 0.5 + c.lp * 0.5;
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
// pas de grave dans la réverbération : elle brouillerait la basse et la grosse caisse
for (const q of [biquad('hp', 120, 0.7), biquad('hp', 120, 0.7)]) {
  filt(wetL, q);
  filt(wetR, q);
}
for (let i = 0; i < N; i++) {
  L[i] += wetL[i] * 0.28;
  R[i] += wetR[i] * 0.28;
}

// ——— L'ouverture : tout passe dans un passe-bas fermé pendant que la première ligne monte ; il s'ouvre avec le bandeau,
// et il est grand ouvert quand « Every single day. » monte ———
{
  const cut = (b) => {
    if (b < O_BAND) return 600 + 300 * smooth(clamp01(b / O_BAND));
    if (b < O_L2) return 900 * Math.pow(20000 / 900, smooth((b - O_BAND) / (O_L2 - O_BAND)));
    return 20000;
  };
  const s = [[0, 0], [0, 0]];
  const end = Math.ceil(at(O_L2) * SR);
  for (let i = 0; i < end; i++) {
    const fc = Math.min(18000, cut((i / SR - DELAY) / BEAT));
    const a = 1 - Math.exp((-TAU * fc) / SR);
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
console.log(`  ouverture : première ligne ${O_L1.toFixed(2)}, bandeau ${O_BAND.toFixed(2)}, « Every single day. » ${O_L2.toFixed(2)}, légende ${CAP.toFixed(2)} (temps)`);
const dB = (e) => (10 * Math.log10(e / N / 2 + 1e-12)).toFixed(1);
console.log('  énergie par instrument (dB, avant réverbération) : ' + Object.entries(energy).map(([k, e]) => `${k} ${dB(e)}`).join(', '));
// le niveau de chaque instrument quand il joue (fenêtres de 100 ms à moins de 30 dB de son maximum) : médiane et maximum,
// en dB, après la normalisation ; c'est ce qui dit si les notes des gestes passent au-dessus du groupe
const lvl = (e) => 10 * Math.log10((e * gain * gain) / WIN / 2 + 1e-12);
console.log('  niveau quand il joue (médiane / max, dB) : ' + Object.entries(wins).map(([k, w]) => {
  const v = [...w].map(lvl);
  const top = Math.max(...v);
  const on = v.filter((x) => x > top - 30).sort((a, b) => a - b);
  return `${k} ${on[Math.floor(on.length / 2)].toFixed(1)} / ${top.toFixed(1)}`;
}).join(', '));
