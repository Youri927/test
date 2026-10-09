// Bruitages de la présentation Custom Pools by Rob Abel, synthétisés de zéro, sans échantillon.
// Peu de sons, courts et nets, mixés très bas sous la musique : aucun souffle ni glissé.
//   switch    : un interrupteur (l'allumage de chaque scène, la maison et la piscine de l'ouverture)
//   vibe1-8   : une note de vibraphone (les palmiers qui s'allument, les appareils du local technique, les étapes),
//               en mi bémol majeur pentatonique, la tonalité de la musique
//   tap       : clic ; key1-3 : frappe au clavier ; chime : la demande envoyée
// Usage : node sound/sfx.mjs  →  public/sfx/*.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sfx');
mkdirSync(dir, {recursive: true});
let seed = 32547;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

const write = (name, L, R = L, peakDb = -1) => {
  let peak = 0;
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = Math.pow(10, peakDb / 20) / peak;
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
const space = (L, R, delays = [[0.053, 0.2, 1], [0.089, 0.16, 0], [0.131, 0.1, 1], [0.197, 0.06, 0]]) => {
  const l = Float32Array.from(L);
  const r = Float32Array.from(R);
  for (const [d, g, side] of delays) {
    const k = Math.floor(d * SR);
    const src = side ? L : R;
    const out = side ? r : l;
    for (let i = k; i < src.length; i++) out[i] += src[i - k] * g;
  }
  return [l, r];
};

// ——— switch : un interrupteur mural (le petit claquement du plastique, puis le corps, très bref) ———
{
  const n = Math.floor(SR * 0.22);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (const [t0, f, body, g, pan] of [[0, 3600, 980, 1, 0.46], [0.011, 2500, 760, 0.55, 0.54]]) {
    const i0 = Math.floor(t0 * SR);
    for (let j = 0; i0 + j < n; j++) {
      const t = j / SR;
      const hit = t < 0.0004 ? rnd() * 2 - 1 : 0;
      const s = (hit * 0.5 + Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 520) * 0.55 + Math.sin(2 * Math.PI * body * t) * Math.exp(-t * 160) * 0.4) * g;
      L[i0 + j] += s * (1 - pan) * 2;
      R[i0 + j] += s * pan * 2;
    }
  }
  write('switch', ...space(L, R, [[0.027, 0.08, 1], [0.049, 0.05, 0]]));
}

// ——— vibe1-8 : vibraphone (lame d'aluminium : partiels 1, 4 et 10 ; trémolo du moteur ; maillet doux) ———
[63, 65, 67, 70, 72, 75, 77, 79].forEach((m, k) => {
  const f = midi(m);
  const n = Math.floor(SR * 1.8);
  const x = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * (1.5 + f / 1600)) + 0.18 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t * 7) + 0.05 * Math.sin(2 * Math.PI * f * 10 * t) * Math.exp(-t * 22);
    if (t < 0.008) {
      lp += (rnd() * 2 - 1 - lp) * 0.2;
      s += lp * 0.12 * (1 - t / 0.008);
    }
    const trem = 1 - 0.22 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 5.4 * t));
    x[i] = s * trem * Math.min(1, t / 0.002);
  }
  const pan = 0.32 + 0.36 * (((k * 3) % 8) / 7);
  write(`vibe${k + 1}`, ...space(x.map((v) => v * (1 - pan) * 2), x.map((v) => v * pan * 2), [[0.071, 0.18, 1], [0.113, 0.12, 0], [0.167, 0.07, 1]]));
});

// ——— tap : clic feutré ———
{
  const n = Math.floor(SR * 0.22);
  const x = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const tone = Math.sin(2 * Math.PI * 1480 * t) * Math.exp(-t * 70) * 0.55 + Math.sin(2 * Math.PI * 3100 * t) * Math.exp(-t * 130) * 0.2;
    const w = rnd() * 2 - 1;
    lp += (w - lp) * 0.35;
    x[i] = tone + lp * Math.exp(-t * 200) * 0.45;
  }
  write('tap', ...space(x, x, [[0.043, 0.16, 1], [0.079, 0.09, 0]]));
}

// ——— key1-3 : frappe au clavier ———
for (const [k, f, body] of [[1, 3400, 620], [2, 2900, 560], [3, 3800, 700]]) {
  const n = Math.floor(SR * 0.09);
  const x = new Float32Array(n);
  let hp1 = 0;
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const w = rnd() * 2 - 1;
    const h = 0.6 * (hp1 + w - prev);
    hp1 = h;
    prev = w;
    x[i] = h * Math.exp(-t * 380) * 0.7 + Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 260) * 0.25 + Math.sin(2 * Math.PI * body * t) * Math.exp(-t * 90) * 0.3;
  }
  write(`key${k}`, x, x);
}

// ——— chime : deux cloches douces, si bémol puis mi bémol (la demande est envoyée) ———
{
  const len = 1.8;
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (const [m, at, g, pan] of [[82, 0, 0.5, 0.4], [87, 0.12, 0.45, 0.6]]) {
    const f = midi(m);
    const i0 = Math.floor(at * SR);
    for (let j = 0; i0 + j < n; j++) {
      const t = j / SR;
      const s = Math.sin(2 * Math.PI * f * t + 0.6 * Math.exp(-t * 6) * Math.sin(2 * Math.PI * f * 3.5 * t)) * Math.exp(-t * 2.6) * g * Math.min(1, t / 0.002);
      L[i0 + j] += s * (1 - pan);
      R[i0 + j] += s * pan;
    }
  }
  write('chime', ...space(L, R));
}
