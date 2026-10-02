// Musique originale de la présentation, synthétisée de zéro (aucun échantillon, aucun droit tiers).
// 100 BPM, la mesure suit le montage : ouverture sombre, groove pendant la visite du site,
// suspension avant la sortie, puis accord de La majeur quand la porte s'ouvre sur la lumière.
// Usage : node sound/music.mjs  →  public/sfx/pres/music.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const BPM = 100;
const BEAT = 60 / BPM;
const TOTAL_BEATS = 84;
const TAIL = 3.2;
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
let seed = 12345;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// ——— Grille harmonique : [temps de début, accord, basse] ———
const CH = {
  Am: ['A3', 'C4', 'E4', 'A2'],
  F: ['F3', 'A3', 'C4', 'F2'],
  C: ['G3', 'C4', 'E4', 'C3'],
  G: ['G3', 'B3', 'D4', 'G2'],
  Esus: ['E3', 'A3', 'B3', 'E2'],
  E: ['E3', 'G#3', 'B3', 'E2'],
  A: ['A3', 'C#4', 'E4', 'A2'],
};
const PROG = [
  [0, 'Am'], [12, 'Am'], [16, 'F'], [20, 'C'], [24, 'G'], [28, 'Am'], [32, 'F'], [36, 'C'], [40, 'G'],
  [44, 'Am'], [48, 'F'], [52, 'C'], [56, 'G'], [60, 'Am'], [64, 'F'], [68, 'Esus'], [74, 'Esus'], [77, 'E'], [79, 'A'],
];
const chordAt = (beat) => {
  let c = PROG[0];
  for (const p of PROG) if (beat >= p[0]) c = p;
  return c;
};

// ——— Enveloppes de sections (en temps) ———
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
const padGain = (b) => env(b, [[0, 0], [3, 0.95], [12, 0.8], [32, 0.7], [68, 0.8], [74, 0.6], [79, 0.55], [79.05, 1.7], [84, 1.4], [86.5, 0]]);
const padCut = (b) => env(b, [[0, 520], [10, 800], [24, 1100], [32, 1700], [60, 2200], [68, 900], [78.9, 2600], [79, 3600], [86, 1600]]);

// ——— Oscillateurs ———
const polyblep = (t, dt) => {
  if (t < dt) { t /= dt; return t + t - t * t - 1; }
  if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
  return 0;
};

// ——— Nappe : 3 scies désaccordées par note, fondu enchaîné entre accords, filtre d'état variable ———
{
  const voices = [];
  for (let v = 0; v < 4; v++) for (let d = 0; d < 3; d++) voices.push({v, d, ph: rnd(), php: rnd()});
  const svf = [{lp: 0, bp: 0}, {lp: 0, bp: 0}];
  let cur = null;
  let prev = null;
  let xf = 1;
  const XF = SR * 0.6;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const b = t / BEAT;
    const c = chordAt(b)[1];
    if (c !== cur) {
      prev = cur;
      cur = c;
      xf = prev ? 0 : 1;
      for (const vo of voices) { vo.php = vo.ph; vo.ph = rnd(); }
    }
    if (xf < 1) xf = Math.min(1, xf + 1 / XF);
    const g = padGain(b);
    const gCur = Math.sin((xf * Math.PI) / 2);
    const gPrev = Math.cos((xf * Math.PI) / 2);
    let sl = 0;
    let sr = 0;
    for (const vo of voices) {
      const det = Math.pow(2, [-0.11, 0, 0.12][vo.d] / 12) * (1 + 0.0015 * Math.sin(t * (0.3 + vo.d * 0.17) + vo.v));
      const amp = vo.v === 3 ? 0.4 : 0.32;
      const pan = vo.d === 0 ? 0.25 : vo.d === 2 ? 0.75 : 0.5;
      let x = 0;
      const fc = n(CH[cur][vo.v]) * det;
      const dt = fc / SR;
      vo.ph += dt;
      if (vo.ph >= 1) vo.ph -= 1;
      x += (2 * vo.ph - 1 - polyblep(vo.ph, dt)) * gCur;
      if (prev && gPrev > 0.0005) {
        const fp = n(CH[prev][vo.v]) * det;
        const dp = fp / SR;
        vo.php += dp;
        if (vo.php >= 1) vo.php -= 1;
        x += (2 * vo.php - 1 - polyblep(vo.php, dp)) * gPrev;
      }
      sl += x * amp * (1 - pan);
      sr += x * amp * pan;
    }
    const fc = padCut(b) * (1 + 0.08 * Math.sin(t * 0.7));
    const k = 2 * Math.sin((Math.PI * Math.min(fc, 8000)) / SR);
    const q = 0.8;
    const out = [sl, sr].map((x, ch) => {
      const st = svf[ch];
      const hp = x - st.lp - q * st.bp;
      st.bp += k * hp;
      st.lp += k * st.bp;
      return st.lp;
    });
    const a = g * 0.11;
    L[i] += out[0] * a;
    R[i] += out[1] * a;
    busL[i] += out[0] * a * 0.9;
    busR[i] += out[1] * a * 0.9;
  }
}

// ——— Bourdon grave : l'ouverture dans le noir, puis la note tenue de la fin ———
{
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const b = i / SR / BEAT;
    const g = env(b, [[0, 0], [4, 0.12], [12, 0.07], [20, 0], [68, 0], [74, 0.06], [79, 0.1], [79.05, 0.18], [84, 0.13], [86.5, 0]]);
    if (g <= 0) continue;
    const f = b < 60 ? 55 : b < 79 ? 41.2 : 55;
    ph += f / SR;
    ph -= Math.floor(ph);
    const s = (Math.sin(2 * Math.PI * ph) + 0.3 * Math.sin(4 * Math.PI * ph)) * g;
    L[i] += s;
    R[i] += s;
  }
}

// ——— Sons percussifs ———
const addKick = (t0, gain) => {
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.45; j++) {
    const t = j / SR;
    const f = 44 + 90 * Math.exp(-t * 32);
    ph += (2 * Math.PI * f) / SR;
    const a = Math.exp(-t * 7.5) * gain * (t < 0.002 ? t / 0.002 : 1);
    const s = Math.tanh(Math.sin(ph) * 1.6) * a;
    if (i0 + j < N) { L[i0 + j] += s; R[i0 + j] += s; }
  }
};
const addNoise = (t0, gain, decay, hpAmt, pan = 0.5, send = 0.15) => {
  const i0 = Math.floor(t0 * SR);
  let lp = 0;
  let prev = 0;
  for (let j = 0; j < SR * Math.min(0.6, 6 / decay); j++) {
    const t = j / SR;
    const w = rnd() * 2 - 1;
    lp += (w - lp) * 0.5;
    const hp = w - lp * hpAmt;
    const s = (hp * 0.6 + (hp - prev) * 0.4) * Math.exp(-t * decay) * gain;
    prev = hp;
    if (i0 + j < N) {
      L[i0 + j] += s * (1 - pan) * 2;
      R[i0 + j] += s * pan * 2;
      busL[i0 + j] += s * send;
      busR[i0 + j] += s * send;
    }
  }
};
const addClap = (t0, gain) => {
  for (const [d, g] of [[0, 0.7], [0.011, 0.6], [0.023, 1]]) addNoise(t0 + d, gain * g, 22, 0.6, 0.5, 0.35);
};
const addPluck = (t0, freq, gain, pan, echo = true) => {
  // échos en croche pointée, alternés gauche / droite
  if (echo) for (let e = 1; e <= 2; e++) addPluck(t0 + e * BEAT * 0.75, freq, gain * Math.pow(0.32, e), e % 2 ? 1 - pan : pan, false);
  const i0 = Math.floor(t0 * SR);
  let ph = rnd();
  let lp = 0;
  for (let j = 0; j < SR * 0.5; j++) {
    const t = j / SR;
    ph += freq / SR;
    ph -= Math.floor(ph);
    const tri = 4 * Math.abs(ph - 0.5) - 1;
    const sq = ph < 0.5 ? 1 : -1;
    const x = tri * 0.7 + sq * 0.3;
    lp += (x - lp) * (0.12 + 0.5 * Math.exp(-t * 18));
    const s = lp * Math.exp(-t * 9) * gain * (t < 0.003 ? t / 0.003 : 1);
    if (i0 + j < N) {
      L[i0 + j] += s * (1 - pan);
      R[i0 + j] += s * pan;
      busL[i0 + j] += s * 0.6;
      busR[i0 + j] += s * 0.6;
    }
  }
};
const addBass = (t0, freq, gain, len) => {
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  let ph2 = 0;
  let lp = 0;
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    ph += freq / SR;
    ph2 += (2 * freq) / SR;
    ph -= Math.floor(ph);
    ph2 -= Math.floor(ph2);
    const x = Math.sin(2 * Math.PI * ph) + 0.35 * (2 * ph2 - 1);
    lp += (x - lp) * 0.08;
    const a = gain * Math.exp(-t * 3.2) * (t < 0.004 ? t / 0.004 : 1) * (t > len - 0.02 ? (len - t) / 0.02 : 1);
    const s = Math.tanh(lp * 1.4) * a;
    if (i0 + j < N) { L[i0 + j] += s; R[i0 + j] += s; }
  }
};

// ——— Partition ———
for (let b = 0; b < TOTAL_BEATS; b += 0.25) {
  const t = b * BEAT;
  const beatIn = b - Math.floor(b);
  const whole = Math.abs(beatIn) < 1e-6;
  const half = Math.abs(beatIn - 0.5) < 1e-6;
  const bi = Math.floor(b);
  const groove = b >= 12 && b < 68;
  const full = b >= 32 && b < 68;
  const [, c] = chordAt(b);
  const notes = CH[c];
  // grosse caisse : moitié de temps puis carrure
  if (whole && groove && (full || b >= 24 || bi % 2 === 0)) addKick(t, b >= 24 ? 0.42 : 0.36);
  // claquement sur 2 et 4
  if (whole && full && bi % 2 === 1) addClap(t, 0.16);
  // tic-tac : d'abord des noires (concept), puis des croches, puis des doubles
  const tick = (b >= 7 && b < 12 && whole) || (b >= 24 && b < 32 && (whole || half)) || full;
  if (tick && b < 68) {
    const accent = whole ? 1 : half ? 0.75 : 0.5;
    addNoise(t, 0.05 * accent, 60, 0.98, bi % 2 ? 0.62 : 0.38, 0.08);
  }
  // basse en croches
  if (groove && (whole || half)) addBass(t, n(notes[3]) / 2, b >= 32 ? 0.34 : 0.28, BEAT * 0.48);
  // arpège en doubles croches pendant les portes et le mobile
  if ((b >= 32 && b < 48) || (b >= 60 && b < 68)) {
    const step = Math.round(b * 4) % 8;
    const seq = [0, 1, 2, 1, 0, 2, 1, 2];
    const octave = step >= 4 ? 4 : 2;
    const f = n(notes[seq[step]]) * octave;
    addPluck(t, f, 0.075 * (step % 2 ? 0.7 : 1), step % 2 ? 0.7 : 0.3);
  }
  // un rappel discret pendant le verdict et le cadenas
  if (b >= 48 && b < 60 && (whole || half) && bi % 2 === 0) addPluck(t, n(notes[2]) * 2, 0.06, 0.5);
}

// ——— Montée avant la sortie : souffle filtré qui s'ouvre, puis silence d'un instant ———
{
  const b0 = 70;
  const b1 = 79;
  let lp = 0;
  let bp = 0;
  for (let i = Math.floor(b0 * BEAT * SR); i < Math.floor(b1 * BEAT * SR); i++) {
    const b = i / SR / BEAT;
    const p = (b - b0) / (b1 - b0);
    const fc = 200 + 5200 * p * p;
    const k = 2 * Math.sin((Math.PI * fc) / SR);
    const w = rnd() * 2 - 1;
    const hp = w - lp - 1.2 * bp;
    bp += k * hp;
    lp += k * bp;
    const s = bp * 0.12 * p * p * (b > b1 - 0.08 ? (b1 - b) / 0.08 : 1);
    L[i] += s;
    R[i] += s;
    busL[i] += s * 0.4;
    busR[i] += s * 0.4;
  }
}
// ——— La porte s'ouvre : coup grave et cloches sur l'accord de La majeur ———
{
  const t0 = 79 * BEAT;
  addKick(t0, 0.75);
  for (const [nm, g, pan] of [['A4', 0.11, 0.35], ['C#5', 0.09, 0.65], ['E5', 0.09, 0.4], ['B5', 0.05, 0.7], ['A5', 0.06, 0.3]]) {
    const i0 = Math.floor(t0 * SR);
    const f = n(nm);
    for (let j = 0; j < SR * 3.5; j++) {
      const t = j / SR;
      const s = (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t * 3)) * Math.exp(-t * 1.1) * g * (t < 0.004 ? t / 0.004 : 1);
      if (i0 + j < N) {
        L[i0 + j] += s * (1 - pan);
        R[i0 + j] += s * pan;
        busL[i0 + j] += s * 0.9;
        busR[i0 + j] += s * 0.9;
      }
    }
  }
}

// ——— Réverbération (Schroeder : 4 filtres en peigne amortis + 2 passe-tout, par canal) ———
const reverb = (input, offset) => {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422].map((d) => ({buf: new Float32Array(d + offset), i: 0, lp: 0}));
  const aps = [556, 441, 341].map((d) => ({buf: new Float32Array(d + offset), i: 0}));
  for (let s = 0; s < N; s++) {
    const x = input[s] * 0.5;
    let y = 0;
    for (const c of combs) {
      const v = c.buf[c.i];
      c.lp = v * 0.72 + c.lp * 0.28;
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
  L[i] += wetL[i] * 0.32;
  R[i] += wetR[i] * 0.32;
}

// ——— Normalisation (crête à −3 dBFS) et écriture WAV 16 bits ———
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = Math.pow(10, -3 / 20) / peak;
const fadeOut = Math.floor(1.2 * SR);
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
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sfx/pres/music.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.concat([header, data]));
console.log(`✓ ${out}  ${(N / SR).toFixed(1)} s, crête d'origine ${peak.toFixed(2)}`);
