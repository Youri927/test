// Bruitages de la présentation Gracie Pools, synthétisés de zéro, sans échantillon.
// Peu de sons, courts et nets, mixés bas sous la musique : aucun souffle ni glissé.
//   tick      : un déclic de la cote qui compte (ouverture)
//   drop      : l'eau qui arrive dans le bassin (une goutte, un grave rond très bref)
//   click     : les mâchoires de la règle qui s'écartent (deux déclics feutrés, comme un pied à coulisse)
//   land1-8   : un dessin qui se pose dans la gamme (marimba : la, do dièse, mi, fa dièse, la, si, do dièse, mi)
//   pin       : l'épingle ; swatch : un coloris choisi (une goutte)
//   tap       : clic ; key1-3 : frappe au clavier ; chime : le formulaire envoyé
// Usage : node sound/sfx.mjs  →  public/sfx/*.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sfx');
mkdirSync(dir, {recursive: true});
let seed = 32701;
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
const space = (L, R, delays = [[0.053, 0.22, 1], [0.089, 0.18, 0], [0.131, 0.12, 1], [0.197, 0.07, 0]]) => {
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
const pad = (x, extra) => {
  const out = new Float32Array(x.length + Math.floor(extra * SR));
  out.set(x);
  return out;
};
// ——— tick : déclic sec et court (la cote qui compte) ———
{
  const n = Math.floor(SR * 0.06);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    x[i] = (Math.sin(2 * Math.PI * 3200 * t) * Math.exp(-t * 260) * 0.6 + (rnd() * 2 - 1) * Math.exp(-t * 900) * 0.3) * Math.min(1, t / 0.0004);
  }
  write('tick', ...space(pad(x, 0.12), pad(x, 0.12), [[0.031, 0.12, 1], [0.057, 0.07, 0]]));
}

// ——— drop : l'eau qui arrive (une goutte qui se referme vite, un grave rond sur la, très bref) ———
{
  const n = Math.floor(SR * 0.5);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  let ph = 0;
  let ph2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 720 + 1080 * (1 - Math.exp(-t * 55));
    ph += f / SR;
    ph2 += 110 / SR;
    const drop = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 34) * Math.min(1, t / 0.0015);
    const body = Math.sin(2 * Math.PI * ph2) * Math.exp(-t * 10) * Math.min(1, t / 0.006) * 0.35;
    L[i] = drop * 0.85 + body;
    R[i] = drop + body;
  }
  write('drop', ...space(L, R, [[0.047, 0.12, 1], [0.083, 0.07, 0]]));
}

// ——— click : les mâchoires qui s'écartent (deux déclics secs et feutrés, sans souffle) ———
{
  const n = Math.floor(SR * 0.26);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (const [t0, f, g, pan] of [[0, 2300, 1, 0.42], [0.038, 1900, 0.7, 0.58]]) {
    const i0 = Math.floor(t0 * SR);
    for (let j = 0; i0 + j < n; j++) {
      const t = j / SR;
      // une demi-milliseconde de bruit pour l'attaque, puis la résonance du métal et un corps boisé
      const hit = t < 0.0006 ? rnd() * 2 - 1 : 0;
      const s = (hit * 0.6 + Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 300) * 0.5 + Math.sin(2 * Math.PI * 640 * t) * Math.exp(-t * 110) * 0.35) * g;
      L[i0 + j] += s * (1 - pan);
      R[i0 + j] += s * pan;
    }
  }
  write('click', ...space(L, R, [[0.029, 0.1, 1], [0.053, 0.06, 0]]));
}

// ——— land1-8 : un dessin qui se pose (marimba, la majeur pentatonique) ———
[69, 73, 76, 78, 81, 83, 85, 88].forEach((m, k) => {
  const f = midi(m);
  const n = Math.floor(SR * 1.1);
  const x = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * (3.6 + f / 900)) + 0.4 * Math.sin(2 * Math.PI * f * 3.93 * t) * Math.exp(-t * 12) + 0.1 * Math.sin(2 * Math.PI * f * 9 * t) * Math.exp(-t * 30);
    if (t < 0.01) {
      lp += (rnd() * 2 - 1 - lp) * 0.3;
      s += lp * 0.25 * (1 - t / 0.01);
    }
    x[i] = s * Math.min(1, t / 0.0015);
  }
  const pan = 0.3 + 0.4 * ((k * 3) % 8) / 7;
  write(`land${k + 1}`, ...space(x.map((v) => v * (1 - pan) * 2), x.map((v) => v * pan * 2), [[0.061, 0.16, 1], [0.103, 0.1, 0]]));
});

// ——— pin : l'épingle (déclic franc et petit coup de bois) ———
{
  const n = Math.floor(SR * 0.3);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    x[i] = (Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 90) * 0.45 + Math.sin(2 * Math.PI * 420 * t) * Math.exp(-t * 40) * 0.5 + (rnd() * 2 - 1) * Math.exp(-t * 600) * 0.3) * Math.min(1, t / 0.0005);
  }
  write('pin', ...space(x, x, [[0.043, 0.14, 1], [0.077, 0.08, 0]]));
}

// ——— swatch : un coloris choisi (une goutte courte) ———
{
  const n = Math.floor(SR * 0.4);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 650 + 650 * (1 - Math.exp(-t * 45));
    ph += f / SR;
    const s = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 22) * Math.min(1, t / 0.002) * 0.6 + Math.sin(2 * Math.PI * 2 * ph) * Math.exp(-t * 40) * 0.08;
    L[i] = s * 0.9;
    R[i] = s;
  }
  write('swatch', ...space(L, R, [[0.057, 0.14, 1], [0.091, 0.08, 0]]));
}

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

// ——— chime : deux cloches douces, mi puis la (le formulaire est envoyé) ———
{
  const len = 1.8;
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (const [m, at, g, pan] of [[88, 0, 0.5, 0.4], [93, 0.12, 0.45, 0.6]]) {
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
