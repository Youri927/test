// Musique originale de la présentation Escape TV, synthétisée de zéro (aucun échantillon, aucun droit tiers).
// 90 BPM, en Ré mineur, tendue mais retenue, comme le générique d'une émission : une horloge qui tourne
// dès l'ouverture, un constat en sourdine, puis un cœur qui bat (grosse caisse doublée), une basse
// en croches et des cordes pincées quand le nouveau site s'allume. Un accord de Ré mineur pour finir.
// Usage : node sound/music.mjs  →  public/sfx/music.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const BPM = 90;
const BEAT = 60 / BPM;
const TOTAL_BEATS = 117;
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
  Dm9: ['F3', 'A3', 'E4', 'D2'],
  Dm: ['F3', 'A3', 'D4', 'D2'],
  Bb: ['F3', 'Bb3', 'D4', 'Bb1'],
  F: ['F3', 'A3', 'C4', 'F1'],
  C: ['E3', 'G3', 'C4', 'C2'],
  Gm: ['G3', 'Bb3', 'D4', 'G1'],
  Asus: ['E3', 'A3', 'D4', 'A1'],
  A: ['E3', 'A3', 'C#4', 'A1'],
};
// Scènes (en temps) : ouverture 0, avant 8, régie 22, pitch 35, six genres 47, Minotaure 60,
// film 74, audience 85, mobile 97, fin 108 (→ 117).
const PROG = [
  [0, 'Dm9'], [4, 'Bb'],
  [8, 'Gm'], [12, 'Dm'], [16, 'Bb'], [20, 'Asus'], [21, 'A'],
];
for (let b = 22; b < 106; b += 16) PROG.push([b, 'Dm'], [b + 4, 'Bb'], [b + 8, 'F'], [b + 12, 'C']);
PROG.push([106, 'Asus'], [107, 'A'], [108, 'Dm9']);
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
const padGain = (b) => env(b, [[0, 0], [2, 1.7], [8, 1.4], [21, 1.5], [22, 1.0], [60, 0.8], [74, 0.85], [106, 0.8], [108, 1.5], [113, 1.0], [118, 0]]);
const padCut = (b) => env(b, [[0, 500], [6, 1100], [8, 520], [20, 800], [22, 1500], [60, 1100], [74, 1800], [106, 1600], [108, 2300], [117, 700]]);

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
// ——— Horloge : un tic très bref, filtré dans l'aigu ———
const addTick = (t0, gain, pan) => {
  const i0 = Math.floor(t0 * SR);
  let lp = 0;
  for (let j = 0; j < SR * 0.03; j++) {
    const t = j / SR;
    const w = rnd() * 2 - 1;
    lp += (w - lp) * 0.6;
    const s = (w - lp) * gain * Math.exp(-t * 260) + Math.sin(2 * Math.PI * 3100 * t) * gain * 0.5 * Math.exp(-t * 400);
    if (i0 + j < N) {
      L[i0 + j] += s * (1 - pan) * 2;
      R[i0 + j] += s * pan * 2;
      busL[i0 + j] += s * 0.15;
      busR[i0 + j] += s * 0.15;
    }
  }
};
// ——— Corde pincée : quelques harmoniques qui s'éteignent vite, écho en croche pointée ———
const addPluck = (t0, freq, gain, pan, echo = true) => {
  if (echo) for (let e = 1; e <= 2; e++) addPluck(t0 + e * BEAT * 0.75, freq, gain * Math.pow(0.33, e), e % 2 ? 1 - pan : pan, false);
  const i0 = Math.floor(t0 * SR);
  const ph = [rnd(), rnd(), rnd()];
  for (let j = 0; j < SR * 0.7; j++) {
    const t = j / SR;
    let x = 0;
    for (let h = 0; h < 3; h++) {
      ph[h] += (freq * (h + 1)) / SR;
      ph[h] -= Math.floor(ph[h]);
      x += Math.sin(2 * Math.PI * ph[h]) * [1, 0.45, 0.2][h] * Math.exp(-t * (7 + h * 9));
    }
    const s = x * gain * (t < 0.002 ? t / 0.002 : 1);
    if (i0 + j < N) {
      L[i0 + j] += s * (1 - pan);
      R[i0 + j] += s * pan;
      busL[i0 + j] += s * 0.6;
      busR[i0 + j] += s * 0.6;
    }
  }
};
// ——— Grondement grave, sous le Minotaure ———
const addRumble = (t0, len, gain) => {
  const i0 = Math.floor(t0 * SR);
  let lp = 0, lp2 = 0;
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    const w = rnd() * 2 - 1;
    lp += (w - lp) * 0.004;
    lp2 += (lp - lp2) * 0.01;
    const e = Math.sin(Math.PI * Math.min(1, t / len)) ** 2;
    const s = lp2 * 60 * gain * e + Math.sin(2 * Math.PI * 36.7 * t) * gain * 0.5 * e;
    if (i0 + j < N) { L[i0 + j] += s; R[i0 + j] += s; }
  }
};

// ——— Partition ———
const ARP = [0, 1, 2, 1, 2, 0, 1, 2];
const BASSLINE = [1, 1, 2, 1, 1.5, 1, 2, 1.5]; // multiplicateurs : fondamentale, octave, quinte
for (let b = 0; b < TOTAL_BEATS; b += 0.25) {
  const t = b * BEAT;
  const q = Math.round(b * 4) % 4; // position dans le temps (doubles croches)
  const whole = q === 0;
  const eighth = q % 2 === 0;
  const bi = Math.floor(b);
  const [start, c] = chordAt(b);
  const notes = CH[c];
  const pulse = b >= 22 && b < 106;
  const beast = b >= 60 && b < 74;
  // l'horloge : un tic par temps dès l'ouverture, en doubles croches avec le nouveau site
  if (b < 108) {
    if (!pulse && whole) addTick(t, b < 8 ? 0.05 : 0.035, bi % 2 ? 0.62 : 0.38);
    if (pulse) addTick(t, whole ? 0.03 : beast ? 0.024 : 0.014, q % 2 ? 0.66 : 0.34);
  }
  // cœur qui bat : deux coups rapprochés sur 1 et 3
  if (pulse && whole && bi % 2 === 0) { addKick(t, beast ? 0.42 : 0.36); addKick(t + BEAT * 0.24, beast ? 0.26 : 0.2); }
  // basse en croches qui suit l'accord
  if (pulse && eighth) {
    const k = Math.round((b - start) * 2) % 8;
    addBass(t, n(notes[3]) * 2 * BASSLINE[k], k === 0 ? 0.21 : 0.13, BEAT * 0.45);
  }
  if (!pulse && b >= 8 && b < 22 && Math.abs(b - start) < 1e-6) addBass(t, n(notes[3]) * 2, 0.24, BEAT * 3.6);
  // cordes pincées en croches avec la pulsation
  const step = Math.round(b * 2) % 8;
  if (pulse && eighth && !(beast && step % 2)) {
    const deg = ARP[step];
    const oct = step >= 4 ? 4 : 2;
    addPluck(t, n(notes[deg]) * oct, 0.056 * (step % 2 ? 0.7 : 1), step % 2 ? 0.68 : 0.32);
  }
  // l'ouverture et le constat : de rares notes, très espacées
  if (b < 22 && whole && [1, 3, 5, 10, 14, 18].includes(bi)) addPluck(t, n(notes[2]) * 2, 0.05, bi % 4 === 1 ? 0.35 : 0.65);
}
// grondements : sous le Minotaure, et à l'allumage du nouveau site
addRumble(60 * BEAT, 14 * BEAT, 0.09);
addRumble(21 * BEAT, 2.5 * BEAT, 0.07);

// ——— Fin : coup grave et cloches sur l'accord de Ré mineur ———
{
  const t0 = 108 * BEAT;
  addKick(t0, 0.55);
  addBass(t0, n('D2') * 2, 0.32, 5);
  for (const [nm, g, pan] of [['D5', 0.1, 0.35], ['F5', 0.08, 0.65], ['A5', 0.07, 0.42], ['E6', 0.045, 0.7], ['D6', 0.05, 0.3]]) {
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
// ouverture : un coup sourd quand le titre monte
addKick(1.4 * BEAT, 0.4);
addBass(1.4 * BEAT, n('D2') * 2, 0.22, 3);

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
