// Bruitages de la présentation, synthétisés de zéro, sans échantillon.
//   thread1-7 : les filets de la vis qui entrent, petits tintements métalliques qui montent (fa, sol, la, do, mi, fa, la)
//   thump     : la couronne qui se pose (grave feutré et petit choc de bois)
//   pill      : une pastille qui s'ouvre sur la scène suivante (souffle qui monte, arrêt doux) ; pillLong : celle du sourire
//   pop       : la petite pastille du sourire qui s'ouvre
//   page      : une page du site actuel qui se charge
//   marker    : un surligneur sur une preuve
//   swell     : la pastille du titre qui grandit jusqu'au portrait
//   air       : souffle court (la fiche qui s'ouvre, le nom qui apparaît)
//   tick      : une légende du schéma ; tap : clic ; key1-3 : frappe au clavier
//   chime     : E4D arrive, le formulaire est envoyé ; done : la méthode habituelle arrive (plus sourd)
//   dim1-2    : la lumière qui baisse (sédation consciente, puis intraveineuse)
//   stop1-3   : les étapes du parcours sur la carte (la, do, fa)
// Usage : node sound/sfx.mjs  →  public/sfx/*.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sfx');
mkdirSync(dir, {recursive: true});
let seed = 4280;
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

// Filtre d'état variable (passe-bande), un par canal
const svf = () => ({lp: 0, bp: 0});
const band = (s, x, fc, q) => {
  const k = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6)) / SR);
  const hp = x - s.lp - q * s.bp;
  s.bp += k * hp;
  s.lp += k * s.bp;
  return s;
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

// ——— thread1-7 : tintement métallique court (partiels inharmoniques de petite pièce de métal) ———
[77, 79, 81, 84, 88, 89, 93].forEach((m, k) => {
  const f = midi(m);
  const n = Math.floor(SR * 0.32);
  const x = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const tone = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 16) + 0.45 * Math.sin(2 * Math.PI * f * 2.71 * t) * Math.exp(-t * 34) + 0.2 * Math.sin(2 * Math.PI * f * 5.13 * t) * Math.exp(-t * 60);
    const w = rnd() * 2 - 1;
    lp += (w - lp) * 0.5;
    x[i] = (tone * 0.7 + lp * Math.exp(-t * 400) * 0.35) * Math.min(1, t / 0.0008);
  }
  const pan = 0.3 + 0.4 * (k / 6);
  write(`thread${k + 1}`, ...space(pad(x.map((v) => v * (1 - pan) * 2), 0.25), pad(x.map((v) => v * pan * 2), 0.25), [[0.047, 0.16, 1], [0.083, 0.1, 0]]));
});

// ——— thump : la couronne se pose (sinus grave qui descend, petit choc de bois) ———
{
  const n = Math.floor(SR * 0.7);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 52 + 60 * Math.exp(-t * 22);
    ph += f / SR;
    const sub = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 7) * Math.min(1, t / 0.002);
    const wood = (Math.sin(2 * Math.PI * 340 * t) * 0.6 + Math.sin(2 * Math.PI * 910 * t) * 0.25) * Math.exp(-t * 55);
    L[i] = R[i] = sub * 0.9 + wood * 0.45;
  }
  write('thump', ...space(L, R, [[0.061, 0.12, 1], [0.097, 0.08, 0]]));
}

// ——— pill : souffle qui monte en s'ouvrant, arrêt doux sur la coupe (+ petite pastille qui se pose) ———
const pillSound = (name, len) => {
  const n = Math.floor(SR * (len + 0.6));
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [svf(), svf()];
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = Math.min(1, t / len);
    // l'ouverture de la pastille (départ franc, arrivée douce) : le souffle suit la vitesse
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, p * 1.05)), 1.4) * (t < len ? 1 : Math.exp(-(t - len) * 9));
    const fc = 500 + 3800 * Math.pow(p, 0.8);
    // l'arrivée : un petit coup rond et grave
    const tt = t - len * 0.92;
    let body = 0;
    if (tt > 0) {
      ph += (95 - 30 * Math.min(1, tt / 0.15)) / SR;
      body = Math.sin(2 * Math.PI * ph) * Math.exp(-tt * 14) * 0.35 * Math.min(1, tt / 0.004);
    }
    for (const [ch, out] of [[0, L], [1, R]]) {
      const s = band(st[ch], rnd() * 2 - 1, fc * (ch ? 1.06 : 0.94), 0.75);
      out[i] = s.bp * env * 0.5 * (ch ? 0.75 + 0.25 * p : 1 - 0.25 * p) + body;
    }
  }
  write(name, ...space(L, R, [[0.057, 0.16, 1], [0.093, 0.12, 0]]));
};
pillSound('pill', 0.6);
pillSound('pillLong', 1.07);

// ——— pop : petite pastille qui s'ouvre (bulle douce qui monte) ———
{
  const n = Math.floor(SR * 0.35);
  const x = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 380 + 900 * (1 - Math.exp(-t * 30));
    ph += f / SR;
    x[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 18) * Math.min(1, t / 0.003);
  }
  write('pop', ...space(x, x, [[0.051, 0.18, 1], [0.087, 0.1, 0]]));
}

// ——— page : chargement d'une page (souffle bref, clic sourd) ———
{
  const n = Math.floor(SR * 0.4);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [svf(), svf()];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = t / 0.4;
    const env = Math.pow(Math.sin(Math.PI * Math.pow(p, 0.6)), 2) * 0.5;
    const click = t > 0.22 && t < 0.26 ? Math.sin(2 * Math.PI * 1200 * (t - 0.22)) * Math.exp(-(t - 0.22) * 120) * 0.4 : 0;
    for (const [ch, out] of [[0, L], [1, R]]) {
      out[i] = band(st[ch], rnd() * 2 - 1, 2400 - 1400 * p, 1.1).bp * env * 0.6 + click;
    }
  }
  write('page', L, R);
}

// ——— marker : un trait de surligneur (bruit filtré, frottement) ———
{
  const len = 0.42;
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [svf(), svf()];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = t / len;
    const env = Math.min(1, t / 0.025) * Math.pow(1 - p, 1.4);
    const grain = 0.7 + 0.3 * Math.sin(2 * Math.PI * 41 * t + 3 * Math.sin(2 * Math.PI * 7 * t));
    const fc = 2100 + 500 * Math.sin(Math.PI * p);
    for (const [ch, out] of [[0, L], [1, R]]) {
      out[i] = band(st[ch], rnd() * 2 - 1, fc, 0.35).bp * env * grain * 0.5 * (ch ? 0.4 + 0.6 * p : 1 - 0.5 * p);
    }
  }
  write('marker', L, R);
}

// ——— swell : souffle long qui gonfle (la pastille du titre qui s'agrandit jusqu'au portrait) ———
{
  const len = 2.2;
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [svf(), svf()];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = t / len;
    const env = Math.pow(Math.sin(Math.PI * Math.pow(p, 0.75)), 2);
    const fc = 700 + 1600 * Math.sin(Math.PI * p);
    for (const [ch, out] of [[0, L], [1, R]]) {
      out[i] = band(st[ch], rnd() * 2 - 1, fc * (ch ? 1.08 : 0.92), 1.2).bp * env * 0.45;
    }
  }
  write('swell', L, R);
}

// ——— air : souffle très court ———
{
  const n = Math.floor(SR * 0.6);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [svf(), svf()];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = t / 0.6;
    const env = Math.pow(Math.sin(Math.PI * Math.pow(p, 0.5)), 2);
    const fc = 700 + 2400 * Math.pow(Math.sin(Math.PI * p), 2);
    for (const [ch, out] of [[0, L], [1, R]]) {
      out[i] = band(st[ch], rnd() * 2 - 1, fc, 1.4).bp * env * (ch ? 0.4 + 0.6 * p : 1 - 0.6 * p) * 0.4;
    }
  }
  write('air', L, R);
}

// ——— tick : petit déclic d'interface ———
{
  const n = Math.floor(SR * 0.12);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    x[i] = (Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t * 140) * 0.5 + Math.sin(2 * Math.PI * 4100 * t) * Math.exp(-t * 220) * 0.2) * Math.min(1, t / 0.0005);
  }
  write('tick', ...space(x, x, [[0.039, 0.14, 1], [0.071, 0.08, 0]]));
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

// ——— chime : deux cloches douces, do puis fa (E4D arrive, le formulaire est envoyé) ; done : plus grave et plus sourd ———
const chime = (name, notes, bright) => {
  const len = 2.4;
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (const [m, at, g, pan] of notes) {
    const f = midi(m);
    const i0 = Math.floor(at * SR);
    for (let j = 0; i0 + j < n; j++) {
      const t = j / SR;
      const s = Math.sin(2 * Math.PI * f * t + bright * Math.exp(-t * 4) * Math.sin(2 * Math.PI * f * 3.5 * t)) * Math.exp(-t * 1.7) * g * Math.min(1, t / 0.002);
      L[i0 + j] += s * (1 - pan);
      R[i0 + j] += s * pan;
    }
  }
  write(name, ...space(L, R));
};
chime('chime', [[84, 0, 0.5, 0.4], [89, 0.12, 0.45, 0.6]], 1.2);
chime('done', [[72, 0, 0.5, 0.45], [77, 0.12, 0.42, 0.55]], 0.5);

// ——— dim1-2 : la lumière baisse (accord de souffle qui se referme, grave qui s'enfonce) ———
const dim = (name, f0, f1, depth) => {
  const len = 2.6;
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [svf(), svf()];
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = t / len;
    const env = Math.min(1, t / 0.05) * Math.exp(-t * 1.4);
    const fc = f0 * Math.pow(f1 / f0, Math.min(1, t / 1.2));
    ph += (depth - 18 * Math.min(1, t / 1.5)) / SR;
    const sub = Math.sin(2 * Math.PI * ph) * env * 0.45;
    for (const [ch, out] of [[0, L], [1, R]]) {
      out[i] = band(st[ch], rnd() * 2 - 1, fc * (ch ? 1.05 : 0.95), 0.9).bp * env * 0.4 * (1 - 0.3 * p) + sub;
    }
  }
  write(name, ...space(L, R, [[0.071, 0.2, 1], [0.113, 0.16, 0], [0.163, 0.1, 1]]));
};
dim('dim1', 2600, 700, 74);
dim('dim2', 1800, 380, 58);

// ——— stop1-3 : les étapes du parcours (lame de bois et cloche, la 4, do 5, fa 5) ———
[69, 72, 77].forEach((m, k) => {
  const f = midi(m);
  const n = Math.floor(SR * 2.2);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    x[i] = (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 2.4) + 0.3 * Math.sin(2 * Math.PI * f * 3.92 * t) * Math.exp(-t * 12) + 0.12 * Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 3)) * Math.min(1, t / 0.0015);
  }
  const pan = [0.38, 0.6, 0.48][k];
  write(`stop${k + 1}`, ...space(x.map((v) => v * (1 - pan) * 2), x.map((v) => v * pan * 2)));
});
