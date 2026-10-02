// Bruitages de la présentation, synthétisés de zéro : l'eau, sans échantillon.
//   drop : une goutte qui tombe à la surface (onde)
//   wash : l'eau qui monte ou se retire sur tout l'écran (transition)
//   air  : souffle très court, changement de plan
//   tap  : clic doux, sélection dans le formulaire
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

// ——— drop : sinus qui glisse vers le haut (la bulle qui résonne), précédé d'un petit claquement ———
{
  const n = Math.floor(SR * 0.9);
  const x = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 620 + 1100 * (1 - Math.exp(-t * 26));
    ph += f / SR;
    const tone = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 16) * (t < 0.002 ? t / 0.002 : 1);
    const click = t < 0.006 ? (rnd() * 2 - 1) * (1 - t / 0.006) * 0.35 : 0;
    x[i] = tone + click;
  }
  write('drop', ...space(x));
}

// ——— wash : bruit filtré qui gonfle puis retombe, avec des bulles ———
{
  const n = Math.floor(SR * 1.6);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [{lp: 0, bp: 0}, {lp: 0, bp: 0}];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = t / 1.6;
    const env = Math.sin(Math.PI * Math.pow(p, 0.7)) ** 2;
    const fc = 380 + 1400 * Math.sin(Math.PI * p) + 120 * Math.sin(t * 23);
    const k = 2 * Math.sin((Math.PI * fc) / SR);
    for (const [ch, out] of [[0, L], [1, R]]) {
      const s = st[ch];
      const w = rnd() * 2 - 1;
      const hp = w - s.lp - 1.1 * s.bp;
      s.bp += k * hp;
      s.lp += k * s.bp;
      out[i] = (s.bp * 0.7 + s.lp * 0.3) * env * 0.5;
    }
  }
  // bulles : petites gouttes très courtes, au hasard
  for (let b = 0; b < 26; b++) {
    const t0 = 0.15 + rnd() * 1.2;
    const f0 = 900 + rnd() * 1600;
    const pan = rnd();
    const i0 = Math.floor(t0 * SR);
    let ph = 0;
    for (let j = 0; j < SR * 0.06 && i0 + j < n; j++) {
      const t = j / SR;
      ph += (f0 * (1 + 2.5 * t * 10)) / SR;
      const s = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 70) * 0.09 * Math.sin(Math.PI * (t0 / 1.6));
      L[i0 + j] += s * (1 - pan);
      R[i0 + j] += s * pan;
    }
  }
  write('wash', L, R);
}

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
