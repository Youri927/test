// Bruitages de la présentation, synthétisés de zéro, sans échantillon.
//   air  : souffle très court, changement de plan et feuille qui passe
//   tap  : clic doux, sélection dans le formulaire
//   whoosh : filé de caméra, souffle qui monte puis retombe
//   tiles : carreaux qu'on pose, une pluie de petits clics de céramique qui balaie de gauche à droite
// Usage : node sound/sfx.mjs  →  public/sfx/*.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sfx');
mkdirSync(dir, {recursive: true});
let seed = 99;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

const write = (name, L, R = L) => {
  let peak = 0;
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = Math.pow(10, -1 / 20) / peak;
  const data = Buffer.alloc(L.length * 4);
  for (let i = 0; i < L.length; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  writeFileSync(resolve(dir, `${name}.wav`), Buffer.concat([h, data]));
  console.log(`✓ ${name}.wav  ${(L.length / SR).toFixed(2)} s`);
};

// Petit écho stéréo, pour donner de l'espace sans réverbération lourde
const space = (x, delays = [[0.061, 0.32, 0], [0.093, 0.28, 1], [0.141, 0.18, 0], [0.207, 0.12, 1]]) => {
  const L = Float32Array.from(x);
  const R = Float32Array.from(x);
  for (const [d, g, side] of delays) {
    const k = Math.floor(d * SR);
    const out = side ? R : L;
    for (let i = k; i < x.length; i++) out[i] += x[i - k] * g;
  }
  return [L, R];
};

// ——— air : souffle filtré très court ———
{
  const n = Math.floor(SR * 0.7);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [{lp: 0, bp: 0}, {lp: 0, bp: 0}];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = t / 0.7;
    const env = Math.pow(Math.sin(Math.PI * Math.pow(p, 0.55)), 2);
    const fc = 600 + 2600 * Math.pow(Math.sin(Math.PI * p), 2);
    const k = 2 * Math.sin((Math.PI * fc) / SR);
    for (const [ch, out] of [[0, L], [1, R]]) {
      const s = st[ch];
      const w = rnd() * 2 - 1;
      const hp = w - s.lp - 1.4 * s.bp;
      s.bp += k * hp;
      s.lp += k * s.bp;
      out[i] = s.bp * env * (ch ? 0.4 + 0.6 * p : 1 - 0.6 * p) * 0.4;
    }
  }
  write('air', L, R);
}

// ——— tap : clic feutré (bois mat) ———
{
  const n = Math.floor(SR * 0.25);
  const x = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const tone = Math.sin(2 * Math.PI * 1250 * t) * Math.exp(-t * 60) * 0.6 + Math.sin(2 * Math.PI * 2600 * t) * Math.exp(-t * 110) * 0.25;
    const w = rnd() * 2 - 1;
    lp += (w - lp) * 0.3;
    const noise = lp * Math.exp(-t * 180) * 0.5;
    x[i] = tone + noise;
  }
  write('tap', ...space(x, [[0.047, 0.18, 1], [0.083, 0.1, 0]]));
}

// ——— whoosh : filé de caméra, bruit filtré dont la fréquence monte puis retombe ———
{
  const len = 0.62;
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [{lp: 0, bp: 0}, {lp: 0, bp: 0}];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = t / len;
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, p / 0.55) * 0.5), 2.2) * Math.pow(1 - Math.max(0, (p - 0.45) / 0.55), 1.6);
    const fc = 300 + 3200 * Math.pow(Math.sin(Math.PI * Math.min(1, p * 1.1)), 1.5);
    const k = 2 * Math.sin((Math.PI * fc) / SR);
    for (const [ch, out] of [[0, L], [1, R]]) {
      const s = st[ch];
      const w = rnd() * 2 - 1;
      const hp = w - s.lp - 1.1 * s.bp;
      s.bp += k * hp;
      s.lp += k * s.bp;
      // le souffle passe de gauche à droite, comme la caméra
      out[i] = s.bp * env * (ch ? 0.25 + 0.75 * p : 1 - 0.75 * p) * 0.5;
    }
  }
  write('whoosh', L, R);
}

// ——— tiles : une quarantaine de petits clics de céramique en 0,8 s, de plus en plus serrés, de gauche à droite ———
{
  const len = 1.1;
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const COUNT = 42;
  for (let c = 0; c < COUNT; c++) {
    const u = c / (COUNT - 1);
    const t0 = 0.8 * Math.pow(u, 0.8) + (rnd() - 0.5) * 0.012;
    const f1 = 2900 + rnd() * 1500;
    const f2 = f1 * (1.47 + rnd() * 0.2);
    const g = (0.35 + 0.65 * rnd()) * (1 - 0.45 * u);
    const pan = 0.15 + 0.7 * u + (rnd() - 0.5) * 0.15;
    const i0 = Math.max(0, Math.floor(t0 * SR));
    for (let j = 0; j < SR * 0.05 && i0 + j < n; j++) {
      const t = j / SR;
      const s = (Math.sin(2 * Math.PI * f1 * t) * 0.7 + Math.sin(2 * Math.PI * f2 * t) * 0.3) * Math.exp(-t * 160) * g * (t < 0.0007 ? t / 0.0007 : 1);
      L[i0 + j] += s * (1 - pan);
      R[i0 + j] += s * pan;
    }
  }
  const [l2] = space(L, [[0.031, 0.16, 0], [0.067, 0.09, 0]]);
  const [, r2] = space(R, [[0.043, 0.16, 1], [0.079, 0.09, 1]]);
  write('tiles', l2, r2);
}
