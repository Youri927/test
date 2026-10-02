// Musique originale de la présentation Idoine, synthétisée de zéro (aucun échantillon, aucun droit tiers).
// 80 BPM, calme et aérée, en Ré majeur. La mesure suit le montage : ouverture claire,
// constat en mineur, puis l'eau entre avec le nouveau site (pulsation douce, gouttes en arpège),
// et un accord de Ré qui se pose sur la fin.
// Usage : node sound/music.mjs  →  public/sfx/music.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const BPM = 80;
const BEAT = 60 / BPM;
const TOTAL_BEATS = 114;
const TAIL = 3;
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
let seed = 2026;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// ——— Grille harmonique : accords (3 notes de nappe + basse) ———
const CH = {
  D7: ['F#3', 'A3', 'C#4', 'D2'],
  Bm7: ['D3', 'F#3', 'A3', 'B1'],
  G7: ['F#3', 'B3', 'D4', 'G1'],
  Em7: ['E3', 'G3', 'B3', 'E1'],
  Asus: ['E3', 'A3', 'D4', 'A1'],
  A: ['E3', 'A3', 'C#4', 'A1'],
  D9: ['F#3', 'A3', 'E4', 'D2'],
};
// Scènes (en temps) : ouverture 0, avant 7, ligne d'eau 20, coupe 31, bord de l'eau 52,
// références 65, métier 73, projet 88, mobile 97, fin 106.
const PROG = [
  [0, 'D7'], [4, 'G7'],
  [7, 'Bm7'], [11, 'Em7'], [15, 'Bm7'], [18, 'Asus'], [19.5, 'A'],
  [20, 'D7'], [24, 'Bm7'], [28, 'G7'],
];
for (let b = 31; b < 104; b += 16) PROG.push([b, 'D7'], [b + 4, 'Bm7'], [b + 8, 'G7'], [b + 12, 'Asus']);
PROG.push([104, 'Asus'], [105.5, 'A'], [106, 'D9']);
PROG.sort((a, b) => a[0] - b[0]);
const chordAt = (beat) => {
  let c = PROG[0];
  for (const p of PROG) if (beat >= p[0]) c = p;
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
const padGain = (b) => env(b, [[0, 0], [2, 1.8], [7, 1.6], [19, 1.5], [20, 1.2], [31, 0.75], [104, 0.72], [106, 1.4], [111, 0.95], [117, 0]]);
const padCut = (b) => env(b, [[0, 700], [6, 1500], [7, 650], [19, 900], [20, 1700], [31, 1400], [88, 2000], [104, 1700], [106, 2600], [116, 900]]);

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
  const XF = SR * 1.1;
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
      const det = Math.pow(2, [-0.09, 0, 0.1][vo.d] / 12) * (1 + 0.0015 * Math.sin(t * (0.3 + vo.d * 0.17) + vo.v));
      const amp = vo.v === 3 ? 0.3 : 0.32;
      const pan = vo.d === 0 ? 0.22 : vo.d === 2 ? 0.78 : 0.5;
      let x = 0;
      const fc = n(CH[cur][vo.v]) * det * (vo.v === 3 ? 2 : 1);
      const dt = fc / SR;
      vo.ph += dt;
      if (vo.ph >= 1) vo.ph -= 1;
      x += (2 * vo.ph - 1 - polyblep(vo.ph, dt)) * gCur;
      if (prev && gPrev > 0.0005) {
        const fp = n(CH[prev][vo.v]) * det * (vo.v === 3 ? 2 : 1);
        const dp = fp / SR;
        vo.php += dp;
        if (vo.php >= 1) vo.php -= 1;
        x += (2 * vo.php - 1 - polyblep(vo.php, dp)) * gPrev;
      }
      sl += x * amp * (1 - pan);
      sr += x * amp * pan;
    }
    const fc = padCut(b) * (1 + 0.1 * Math.sin(t * 0.5));
    const k = 2 * Math.sin((Math.PI * Math.min(fc, 8000)) / SR);
    const q = 0.9;
    const out = [sl, sr].map((x, ch) => {
      const st = svf[ch];
      const hp = x - st.lp - q * st.bp;
      st.bp += k * hp;
      st.lp += k * st.bp;
      return st.lp;
    });
    const a = g * 0.1;
    L[i] += out[0] * a;
    R[i] += out[1] * a;
    busL[i] += out[0] * a * 1.1;
    busR[i] += out[1] * a * 1.1;
  }
}

// ——— Basse ronde : sinus, une note par accord puis un rappel à la croche pointée ———
const addBass = (t0, freq, gain, len) => {
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    ph += freq / SR;
    ph -= Math.floor(ph);
    const a = gain * Math.exp(-t * 1.4) * (t < 0.03 ? t / 0.03 : 1) * (t > len - 0.08 ? Math.max(0, (len - t) / 0.08) : 1);
    const s = Math.tanh((Math.sin(2 * Math.PI * ph) + 0.12 * Math.sin(4 * Math.PI * ph)) * 1.2) * a;
    if (i0 + j < N) { L[i0 + j] += s; R[i0 + j] += s; }
  }
};

// ——— Pulsation : grosse caisse feutrée ———
const addKick = (t0, gain) => {
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.5; j++) {
    const t = j / SR;
    const f = 46 + 60 * Math.exp(-t * 26);
    ph += (2 * Math.PI * f) / SR;
    const a = Math.exp(-t * 6.5) * gain * (t < 0.004 ? t / 0.004 : 1);
    const s = Math.sin(ph) * a;
    if (i0 + j < N) { L[i0 + j] += s; R[i0 + j] += s; }
  }
};
// ——— Souffle court : shaker très doux ———
const addShaker = (t0, gain, pan) => {
  const i0 = Math.floor(t0 * SR);
  let lp = 0;
  for (let j = 0; j < SR * 0.12; j++) {
    const t = j / SR;
    const w = rnd() * 2 - 1;
    lp += (w - lp) * 0.35;
    const hp = w - lp;
    const s = hp * gain * (t < 0.01 ? t / 0.01 : 1) * Math.exp(-t * 38);
    if (i0 + j < N) {
      L[i0 + j] += s * (1 - pan) * 2;
      R[i0 + j] += s * pan * 2;
      busL[i0 + j] += s * 0.1;
      busR[i0 + j] += s * 0.1;
    }
  }
};
// ——— Goutte : sinus à attaque nette, petite glissade vers le haut, écho en croche pointée ———
const addDrop = (t0, freq, gain, pan, echo = true) => {
  if (echo) for (let e = 1; e <= 2; e++) addDrop(t0 + e * BEAT * 0.75, freq, gain * Math.pow(0.35, e), e % 2 ? 1 - pan : pan, false);
  const i0 = Math.floor(t0 * SR);
  let ph = rnd();
  for (let j = 0; j < SR * 0.9; j++) {
    const t = j / SR;
    const f = freq * (1 + 0.012 * (1 - Math.exp(-t * 30)));
    ph += f / SR;
    ph -= Math.floor(ph);
    const x = Math.sin(2 * Math.PI * ph) + 0.18 * Math.sin(4 * Math.PI * ph) * Math.exp(-t * 14);
    const s = x * Math.exp(-t * 5.5) * gain * (t < 0.002 ? t / 0.002 : 1);
    if (i0 + j < N) {
      L[i0 + j] += s * (1 - pan);
      R[i0 + j] += s * pan;
      busL[i0 + j] += s * 0.75;
      busR[i0 + j] += s * 0.75;
    }
  }
};

// ——— Partition ———
const ARP = [0, 1, 2, 1, 2, 0, 1, 2];
for (let b = 0; b < TOTAL_BEATS; b += 0.5) {
  const t = b * BEAT;
  const whole = Math.abs(b - Math.round(b)) < 1e-6;
  const bi = Math.floor(b);
  const [start, c] = chordAt(b);
  const notes = CH[c];
  const pulse = b >= 31 && b < 104;
  // basse : à chaque accord, et un rappel une mesure sur deux
  if (b >= 20 && b < 106 && Math.abs(b - start) < 1e-6) addBass(t, n(notes[3]) * 2, 0.3, BEAT * 3.6);
  if (pulse && Math.abs(b - start - 2.5) < 1e-6) addBass(t, n(notes[3]) * 2, 0.16, BEAT * 1.4);
  // grosse caisse sur 1 et 3 (simplement sur 1 pendant la ligne d'eau)
  if (whole && ((pulse && bi % 2 === 1) || (b >= 20 && b < 31 && (bi - 20) % 4 === 0))) addKick(t, pulse ? 0.34 : 0.28);
  // souffle en croches, accent sur les contretemps
  if (pulse && b < 103) addShaker(t, whole ? 0.022 : 0.034, whole ? 0.4 : 0.6);
  // gouttes : quelques notes isolées au début, arpège en croches avec la pulsation
  const step = Math.round(b * 2) % 8;
  if (pulse || (b >= 20 && b < 31 && step % 2 === 0)) {
    const deg = ARP[step];
    const oct = step >= 4 ? 4 : 2;
    addDrop(t, n(notes[deg]) * oct, 0.05 * (step % 2 ? 0.7 : 1), step % 2 ? 0.68 : 0.32);
  }
  // l'ouverture et le constat : de rares gouttes, très espacées
  if (b < 20 && whole && [1, 3, 5, 9, 13, 17].includes(bi)) addDrop(t, n(notes[2]) * 2, 0.055, bi % 4 === 1 ? 0.35 : 0.65);
}

// ——— Fin : coup grave et cloches sur l'accord de Ré ———
{
  const t0 = 106 * BEAT;
  addKick(t0, 0.5);
  addBass(t0, n('D2') * 2, 0.32, 5);
  for (const [nm, g, pan] of [['D5', 0.1, 0.35], ['F#5', 0.08, 0.65], ['A5', 0.07, 0.42], ['E6', 0.045, 0.7], ['D6', 0.05, 0.3]]) {
    const i0 = Math.floor(t0 * SR);
    const f = n(nm);
    for (let j = 0; j < SR * 4.5; j++) {
      const t = j / SR;
      const s = (Math.sin(2 * Math.PI * f * t) + 0.22 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t * 3)) * Math.exp(-t * 0.9) * g * (t < 0.004 ? t / 0.004 : 1);
      if (i0 + j < N) {
        L[i0 + j] += s * (1 - pan);
        R[i0 + j] += s * pan;
        busL[i0 + j] += s * 0.9;
        busR[i0 + j] += s * 0.9;
      }
    }
  }
}

// ——— Réverbération (Schroeder : 4 filtres en peigne amortis + 3 passe-tout, par canal) ———
const reverb = (input, offset) => {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422].map((d) => ({buf: new Float32Array(d + offset), i: 0, lp: 0}));
  const aps = [556, 441, 341].map((d) => ({buf: new Float32Array(d + offset), i: 0}));
  for (let s = 0; s < N; s++) {
    const x = input[s] * 0.5;
    let y = 0;
    for (const c of combs) {
      const v = c.buf[c.i];
      c.lp = v * 0.66 + c.lp * 0.34;
      c.buf[c.i] = x + c.lp * 0.88;
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
  L[i] += wetL[i] * 0.36;
  R[i] += wetR[i] * 0.36;
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
const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sfx/music.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.concat([header, data]));
console.log(`✓ ${out}  ${(N / SR).toFixed(1)} s, crête d'origine ${peak.toFixed(2)}`);
