// Bruitages de la présentation, synthétisés de zéro, sans échantillon.
//   air  : souffle très court, mouvement de caméra
//   tap  : clic doux, survol et clic sur le site
//   on   : un téléviseur cathodique qui s'allume (coup sourd, sifflement, grésillement)
//   off  : le même qui s'éteint (glissando vers le grave)
//   zap  : neige de télévision très brève, d'une partie du site à l'autre
//   thud : deux coups sourds, un cœur qui saute quand le Minotaure vous rattrape
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

// ——— neige : bruit grésillant (crépitements + souffle filtré) ———
const snow = (n, t0, len, gain, out) => {
  const st = {lp: 0, bp: 0};
  for (let i = 0; i < n; i++) {
    const t = i / SR - t0;
    if (t < 0 || t > len) continue;
    const env = Math.sin(Math.PI * Math.min(1, t / len)) ** 0.6 * Math.exp(-t * 2.2);
    const k = 2 * Math.sin((Math.PI * 4200) / SR);
    const w = rnd() * 2 - 1;
    const hp = w - st.lp - 1.1 * st.bp;
    st.bp += k * hp;
    st.lp += k * st.bp;
    const crackle = rnd() < 0.004 ? (rnd() * 2 - 1) * 2.5 : 0;
    out[i] += (st.bp * 0.8 + crackle) * env * gain;
  }
};

// ——— on : coup sourd + sifflement aigu + grésillement ———
{
  const n = Math.floor(SR * 1.1);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    x[i] += Math.sin(2 * Math.PI * (55 + 80 * Math.exp(-t * 30)) * t) * Math.exp(-t * 9) * 0.9; // coup sourd
    x[i] += Math.sin(2 * Math.PI * 7400 * t) * 0.05 * Math.min(1, t / 0.05) * Math.exp(-t * 3.5); // sifflement
  }
  snow(n, 0.01, 0.7, 0.55, x);
  write('on', ...space(x, [[0.031, 0.2, 1], [0.067, 0.12, 0]]));
}

// ——— off : glissando qui tombe, petit clic, la neige s'éteint ———
{
  const n = Math.floor(SR * 0.8);
  const x = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 90 + 1300 * Math.exp(-t * 9);
    ph += f / SR;
    x[i] += Math.sin(2 * Math.PI * ph) * 0.45 * Math.exp(-t * 6) * Math.min(1, t / 0.004);
  }
  snow(n, 0, 0.3, 0.45, x);
  write('off', ...space(x, [[0.043, 0.18, 1], [0.089, 0.1, 0]]));
}

// ——— zap : neige très brève ———
{
  const n = Math.floor(SR * 0.35);
  const x = new Float32Array(n);
  snow(n, 0, 0.26, 1, x);
  for (let i = 0; i < 300; i++) x[i] += Math.sin(i / 3) * (1 - i / 300) * 0.3;
  write('zap', ...space(x, [[0.029, 0.15, 1]]));
}

// ——— thud : deux coups sourds rapprochés ———
{
  const n = Math.floor(SR * 1.0);
  const x = new Float32Array(n);
  for (const [t0, g] of [[0, 1], [0.2, 0.7]]) {
    let ph = 0;
    for (let i = Math.floor(t0 * SR); i < n; i++) {
      const t = i / SR - t0;
      const f = 42 + 70 * Math.exp(-t * 22);
      ph += (2 * Math.PI * f) / SR;
      x[i] += Math.tanh(Math.sin(ph) * 1.6) * Math.exp(-t * 7) * g * Math.min(1, t / 0.003);
    }
  }
  write('thud', ...space(x, [[0.051, 0.12, 1]]));
}
