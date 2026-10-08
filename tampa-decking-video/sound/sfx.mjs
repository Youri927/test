// Bruitages de la présentation, synthétisés de zéro, sans échantillon.
//   rise    : la ligne d'eau qui monte (changement de chapitre), souffle qui monte et grave qui gonfle
//   dive    : la caméra plonge d'une section à l'autre, souffle qui descend et petit choc à l'arrivée
//   plunge  : l'entrée dans le grand bain (section « About »), plus long, plus grave, étouffé
//   swish   : la fenêtre de l'ouverture qui descend d'une couche
//   air     : souffle très court (visionneuse, menu)
//   tap     : clic doux ; key1-3 : frappe au clavier
//   marker  : coup de surligneur sur le code brut du site actuel
//   chime   : formulaire envoyé
//   layer1-4 : les couches qui s'allument, marimba ré, la, fa dièse, ré (la phrase de la musique)
//   deep    : le grand bain, à la fin
// Usage : node sound/sfx.mjs  →  public/sfx/*.wav
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 44100;
const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sfx');
mkdirSync(dir, {recursive: true});
let seed = 314;
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
const space = (L, R, delays = [[0.053, 0.24, 1], [0.089, 0.2, 0], [0.131, 0.13, 1], [0.197, 0.08, 0]]) => {
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

// ——— rise : souffle filtré dont la fréquence monte, grave qui gonfle, arrêt net quand la ligne arrive en haut ———
{
  const len = 1.15;
  const top = 0.74; // la ligne d'eau atteint le haut de l'image (44 images)
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [svf(), svf()];
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = Math.min(1, t / top);
    const env = Math.pow(p, 1.6) * (t < top ? 1 : Math.exp(-(t - top) * 9));
    const fc = 260 + 2600 * Math.pow(p, 1.4);
    const f = 62 + 30 * p;
    ph += f / SR;
    const sub = Math.sin(2 * Math.PI * ph) * env * 0.35;
    for (const [ch, out] of [[0, L], [1, R]]) {
      const s = band(st[ch], rnd() * 2 - 1, fc * (ch ? 1.06 : 0.94), 0.8);
      out[i] = s.bp * env * 0.5 + sub;
    }
  }
  write('rise', ...space(L, R));
}

// ——— dive : souffle qui descend, plus fort au moment de la coupe (0,4 s), petit choc grave à l'arrivée ———
const diveSound = (name, len, cut, f0, f1, depth) => {
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [svf(), svf()];
  const lp = [0, 0];
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = t / len;
    const rise = Math.min(1, t / cut);
    const env = Math.pow(Math.sin((Math.PI / 2) * rise), 2.2) * (t > cut ? Math.exp(-(t - cut) * (depth ? 2.6 : 6)) : 1);
    const fc = f0 * Math.pow(f1 / f0, Math.min(1, t / (cut * 1.25)));
    // choc à l'arrivée : sinus grave qui descend
    const tt = t - cut;
    let thump = 0;
    if (tt > 0) {
      const ff = depth ? 70 - 28 * Math.min(1, tt / 0.6) : 82 - 20 * Math.min(1, tt / 0.2);
      ph += ff / SR;
      thump = Math.sin(2 * Math.PI * ph) * Math.exp(-tt * (depth ? 3.2 : 16)) * (depth ? 0.55 : 0.32) * Math.min(1, tt / 0.004);
    }
    for (const [ch, out] of [[0, L], [1, R]]) {
      const s = band(st[ch], rnd() * 2 - 1, fc * (ch ? 1.05 : 0.95), 0.9);
      let x = s.bp * env * 0.6;
      // dans le grand bain, le souffle est étouffé : passe-bas qui se referme après la coupe
      if (depth) {
        const a = t < cut ? 0.5 : 0.5 * Math.exp(-(t - cut) * 3) + 0.03;
        lp[ch] += (x - lp[ch]) * a;
        x = lp[ch] * 1.3;
      }
      out[i] = x * (ch ? 0.85 + 0.15 * p : 1 - 0.15 * p) + thump;
    }
  }
  write(name, ...space(L, R, [[0.061, 0.18, 1], [0.097, 0.14, 0]]));
};
diveSound('dive', 0.9, 0.4, 3400, 380, false);
diveSound('plunge', 2.2, 0.4, 2600, 200, true);

// ——— swish : souffle léger et aigu, qui descend ———
{
  const len = 0.42;
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [svf(), svf()];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = t / len;
    const env = Math.pow(Math.sin(Math.PI * Math.pow(p, 0.7)), 2);
    const fc = 6500 * Math.pow(1500 / 6500, p);
    for (const [ch, out] of [[0, L], [1, R]]) {
      const s = band(st[ch], rnd() * 2 - 1, fc, 1.2);
      out[i] = s.bp * env * 0.4;
    }
  }
  write('swish', L, R);
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
      const s = band(st[ch], rnd() * 2 - 1, fc, 1.4);
      out[i] = s.bp * env * (ch ? 0.4 + 0.6 * p : 1 - 0.6 * p) * 0.4;
    }
  }
  write('air', L, R);
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

// ——— key1-3 : frappe au clavier, trois touches un peu différentes ———
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

// ——— marker : un trait de surligneur (bruit filtré, frottement) ———
{
  const len = 0.5;
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [svf(), svf()];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = t / len;
    const env = Math.min(1, t / 0.03) * Math.pow(1 - p, 1.5);
    const grain = 0.7 + 0.3 * Math.sin(2 * Math.PI * 38 * t + 3 * Math.sin(2 * Math.PI * 7 * t));
    const fc = 2000 + 500 * Math.sin(Math.PI * p);
    for (const [ch, out] of [[0, L], [1, R]]) {
      const s = band(st[ch], rnd() * 2 - 1, fc, 0.35);
      out[i] = s.bp * env * grain * 0.5 * (ch ? 0.4 + 0.6 * p : 1 - 0.5 * p);
    }
  }
  write('marker', L, R);
}

// ——— chime : deux cloches douces, la puis ré (formulaire envoyé) ———
{
  const len = 2.4;
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (const [m, at, g, pan] of [[81, 0, 0.5, 0.4], [86, 0.13, 0.45, 0.6]]) {
    const f = midi(m);
    const i0 = Math.floor(at * SR);
    for (let j = 0; i0 + j < n; j++) {
      const t = j / SR;
      const s = Math.sin(2 * Math.PI * f * t + 1.2 * Math.exp(-t * 4) * Math.sin(2 * Math.PI * f * 3.5 * t)) * Math.exp(-t * 1.6) * g * Math.min(1, t / 0.002);
      L[i0 + j] += s * (1 - pan);
      R[i0 + j] += s * pan;
    }
  }
  write('chime', ...space(L, R));
}

// ——— layer1-4 : marimba, ré 6, la 5, fa dièse 5, ré 5 ———
[86, 81, 78, 74].forEach((m, k) => {
  const f = midi(m);
  const len = 1.6;
  const n = Math.floor(SR * len);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    x[i] = (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 3.4) + 0.3 * Math.sin(2 * Math.PI * f * 3.92 * t) * Math.exp(-t * 13) + 0.08 * Math.sin(2 * Math.PI * f * 9.2 * t) * Math.exp(-t * 38)) * Math.min(1, t / 0.0015);
  }
  const pan = [0.4, 0.58, 0.44, 0.56][k];
  const L = x.map((v) => v * (1 - pan) * 2);
  const R = x.map((v) => v * pan * 2);
  write(`layer${k + 1}`, ...space(L, R));
});

// ——— deep : le grand bain, grave long qui descend et souffle étouffé ———
{
  const len = 3.6;
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const lp = [0, 0];
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 58 - 14 * Math.min(1, t / 1.5);
    ph += f / SR;
    const sub = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 1.1) * Math.min(1, t / 0.01) * 0.7;
    for (const [ch, out] of [[0, L], [1, R]]) {
      lp[ch] += ((rnd() * 2 - 1) - lp[ch]) * 0.02;
      out[i] = sub + lp[ch] * Math.exp(-t * 0.9) * Math.min(1, t / 0.2) * 2.2;
    }
  }
  write('deep', L, R);
}
