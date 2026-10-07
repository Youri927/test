// Musique originale de la présentation Frontline Pools, synthétisée de zéro
// (aucun échantillon, aucun droit tiers). 90 BPM, en La majeur, claire et allante.
// La mesure suit le montage : ouverture claire, le site actuel en mineur (une pulsation sourde monte),
// la bascule sur la dominante, puis le nouveau site (gouttes en arpège, pulsation), une petite cascade
// quand la photo d'accueil se pose en mosaïque, et un accord de La qui se pose sur le nom.
// Usage : node sound/music.mjs  →  public/sfx/music.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const BPM = 90;
const BEAT = 60 / BPM;
const TOTAL_BEATS = 150;
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
  A: ['E3', 'A3', 'C#4', 'A1'],
  Fm7: ['E3', 'A3', 'C#4', 'F#1'],
  Dmaj7: ['F#3', 'A3', 'C#4', 'D2'],
  Cm7: ['E3', 'G#3', 'B3', 'C#2'],
  Esus: ['E3', 'A3', 'B3', 'E2'],
  E: ['E3', 'G#3', 'B3', 'E2'],
  A9: ['C#4', 'E4', 'B4', 'A1'],
};
// Scènes (en temps) : ouverture 0, aujourd'hui 9, bascule 21, accueil 26, visite 38, chantiers 56, équipement 68,
// avis 80, licence 92, secteurs 104, devis 115, téléphone 129, fin 139 (le nom à 144).
const PROG = [
  [0, 'A'], [4.5, 'Dmaj7'],
  [9, 'Fm7'], [13, 'Cm7'], [17, 'Dmaj7'], [19, 'Fm7'],
  [21, 'Esus'], [24.5, 'E'],
  [26, 'A'], [30, 'Fm7'], [34, 'Dmaj7'], [36, 'Esus'],
];
for (let b = 38; b < 134; b += 16) PROG.push([b, 'A'], [b + 4, 'Fm7'], [b + 8, 'Dmaj7'], [b + 12, 'Esus']);
PROG.push([134, 'Dmaj7'], [137, 'Esus'], [139, 'Fm7'], [141, 'Dmaj7'], [142.5, 'E'], [144, 'A9']);
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
const padGain = (b) => env(b, [[0, 0], [2, 1.8], [9, 1.6], [20, 1.5], [21, 1.9], [25.5, 2.0], [26, 1.2], [38, 0.75], [134, 0.72], [139, 1.1], [144, 1.4], [147, 0.95], [152, 0]]);
const padCut = (b) => env(b, [[0, 800], [6, 1700], [9, 650], [20, 1000], [25.5, 2600], [26, 1800], [38, 1400], [120, 2100], [134, 1700], [139, 1900], [144, 2700], [150, 900]]);

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
  const pulse = b >= 38 && b < 139;
  // basse : à chaque accord, et un rappel une mesure sur deux
  if (b >= 26 && b < 144 && Math.abs(b - start) < 1e-6) addBass(t, n(notes[3]) * 2, 0.3, BEAT * 3.6);
  if (pulse && Math.abs(b - start - 2.5) < 1e-6) addBass(t, n(notes[3]) * 2, 0.16, BEAT * 1.4);
  // grosse caisse sur 1 et 3 ; avant, un battement sourd qui monte pendant le constat
  if (whole && ((pulse && bi % 2 === 1) || (b >= 26 && b < 38 && (bi - 26) % 4 === 0))) addKick(t, pulse ? 0.34 : 0.28);
  if (whole && b >= 9 && b < 21 && (bi - 9) % 2 === 0) addKick(t, 0.12 + 0.012 * (bi - 9));
  // souffle en croches, accent sur les contretemps
  if (pulse && b < 138) addShaker(t, whole ? 0.022 : 0.034, whole ? 0.4 : 0.6);
  // gouttes : quelques notes isolées au début, arpège en croches avec la pulsation
  const step = Math.round(b * 2) % 8;
  if (pulse || (b >= 26 && b < 38 && step % 2 === 0)) {
    const deg = ARP[step];
    const oct = step >= 4 ? 4 : 2;
    addDrop(t, n(notes[deg]) * oct, 0.05 * (step % 2 ? 0.7 : 1), step % 2 ? 0.68 : 0.32);
  }
  // l'ouverture et le constat : de rares gouttes, très espacées
  if (b < 21 && whole && [1, 3, 5, 7, 10, 12, 14, 16, 18, 20].includes(bi)) addDrop(t, n(notes[2]) * 2, 0.055, bi % 4 === 1 ? 0.35 : 0.65);
}

// ——— La mosaïque de l'accueil : une cascade montante, rapide, pendant que les carreaux se posent ———
['E5', 'A5', 'B5', 'C#6', 'E6', 'F#6', 'A6', 'B6', 'C#7'].forEach((nm, i) => addDrop((26.6 + i * 0.22) * BEAT, n(nm), 0.042 - i * 0.003, i % 2 ? 0.7 : 0.3, i === 8));

// ——— Fin : coup grave et cloches sur l'accord de La ———
{
  const t0 = 144 * BEAT;
  addKick(t0, 0.5);
  addBass(t0, n('A1') * 2, 0.32, 5);
  for (const [nm, g, pan] of [['A5', 0.1, 0.35], ['C#6', 0.08, 0.65], ['E6', 0.07, 0.42], ['B6', 0.045, 0.7], ['A6', 0.05, 0.3]]) {
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
