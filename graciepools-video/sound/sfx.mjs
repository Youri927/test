// Bruitages de la présentation Gracie Pools, synthétisés de zéro, sans échantillon.
//   tick      : un déclic de la cote qui compte (ouverture)
//   draw      : le contour du bassin qui se trace (frottement léger de mine)
//   fill      : l'eau qui remplit le bassin (souffle qui gonfle, petites bulles, grave rond)
//   pop       : la marque qui apparaît (bulle douce qui monte)
//   measure   : le ruban de la règle qu'on tire (cliquetis qui accélère)
//   open      : les mâchoires de la règle qui s'écartent (souffle, arrêt doux)
//   page      : une page du site actuel qui se charge ; mark : une preuve mesurée (le cadre se trace)
//   lift      : les dessins qui se détachent de la fiche
//   land1-8   : un dessin qui se pose dans la gamme (marimba : la, do dièse, mi, fa dièse, la, si, do dièse, mi)
//   swap      : le bassin de l'accueil qui change
//   grow, shrink : le bassin du comparateur qui s'étire, ou se rétracte
//   pin       : l'épingle ; swatch : un coloris choisi (une goutte)
//   drag      : la bande de photos qu'on fait glisser
//   air       : souffle court ; tap : clic ; key1-3 : frappe au clavier ; chime : le formulaire envoyé
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
const noise = (len, fn) => {
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [svf(), svf()];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const [fc, q, gl, gr] = fn(t, t / len);
    L[i] = band(st[0], rnd() * 2 - 1, fc, q).bp * gl;
    R[i] = band(st[1], rnd() * 2 - 1, fc * 1.04, q).bp * gr;
  }
  return [L, R];
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

// ——— draw : le contour qui se trace (frottement de mine, grain irrégulier) ———
{
  const len = 1.7;
  const [L, R] = noise(len, (t, p) => {
    const env = Math.min(1, t / 0.08) * Math.min(1, (len - t) / 0.25);
    const grain = 0.55 + 0.45 * Math.abs(Math.sin(2 * Math.PI * 23 * t + 2 * Math.sin(2 * Math.PI * 5.3 * t)));
    return [3600 + 900 * Math.sin(2 * Math.PI * 1.7 * t), 0.4, env * grain * 0.32 * (1 - 0.4 * p), env * grain * 0.32 * (0.6 + 0.4 * p)];
  });
  write('draw', L, R);
}

// ——— fill : l'eau qui remplit (souffle qui gonfle, bulles, grave rond) ———
{
  const len = 1.6;
  const [L, R] = noise(len, (t, p) => {
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, p * 1.1)), 1.5);
    return [500 + 1600 * Math.sin(Math.PI * p * 0.9), 1.1, env * 0.5, env * 0.5];
  });
  // bulles : petites gouttes sinusoïdales qui montent
  for (let k = 0; k < 14; k++) {
    const t0 = 0.15 + rnd() * 1.1;
    const f0 = 500 + rnd() * 900;
    const i0 = Math.floor(t0 * SR);
    const pan = rnd();
    let ph = 0;
    for (let j = 0; j < SR * 0.08 && i0 + j < L.length; j++) {
      const t = j / SR;
      ph += (f0 * (1 + 2.2 * t / 0.08)) / SR;
      const s = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 45) * 0.16;
      L[i0 + j] += s * (1 - pan);
      R[i0 + j] += s * pan;
    }
  }
  let ph = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    ph += (70 + 25 * Math.min(1, t / 0.8)) / SR;
    const s = Math.sin(2 * Math.PI * ph) * Math.pow(Math.sin(Math.PI * Math.min(1, t / len)), 2) * 0.22;
    L[i] += s;
    R[i] += s;
  }
  write('fill', ...space(L, R, [[0.061, 0.16, 1], [0.097, 0.12, 0]]));
}

// ——— pop : bulle douce qui monte ———
{
  const n = Math.floor(SR * 0.35);
  const x = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 420 + 900 * (1 - Math.exp(-t * 30));
    ph += f / SR;
    x[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 18) * Math.min(1, t / 0.003);
  }
  write('pop', ...space(x, x, [[0.051, 0.18, 1], [0.087, 0.1, 0]]));
}

// ——— measure : le ruban qu'on tire (cliquetis qui accélère, souffle léger) ———
{
  const len = 0.62;
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [svf(), svf()];
  // positions des déclics : de plus en plus serrés
  const clicks = [];
  for (let t = 0.0, k = 0; k < 16; k++) { clicks.push(t); t += Math.max(0.012, 0.05 * Math.pow(0.84, k)); }
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = t / len;
    const whoosh = Math.pow(Math.sin(Math.PI * Math.min(1, p * 1.15)), 2) * 0.12;
    L[i] = band(st[0], rnd() * 2 - 1, 1800 + 2600 * p, 0.9).bp * whoosh;
    R[i] = band(st[1], rnd() * 2 - 1, 1900 + 2600 * p, 0.9).bp * whoosh;
  }
  clicks.forEach((t0, k) => {
    const i0 = Math.floor(t0 * SR);
    const f = 2600 + 60 * k;
    const pan = 0.3 + 0.4 * (k / clicks.length);
    for (let j = 0; j < SR * 0.02 && i0 + j < n; j++) {
      const t = j / SR;
      const s = (Math.sin(2 * Math.PI * f * t) * 0.5 + (rnd() * 2 - 1) * 0.3) * Math.exp(-t * 520) * 0.5;
      L[i0 + j] += s * (1 - pan) * 2;
      R[i0 + j] += s * pan * 2;
    }
  });
  write('measure', ...space(L, R, [[0.041, 0.14, 1], [0.073, 0.09, 0]]));
}

// ——— open : les mâchoires qui s'écartent (souffle qui s'ouvre, arrêt doux, grave rond) ———
{
  const len = 0.7;
  const n = Math.floor(SR * (len + 0.5));
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const st = [svf(), svf()];
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = Math.min(1, t / len);
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, p * 1.05)), 1.4) * (t < len ? 1 : Math.exp(-(t - len) * 9));
    const fc = 600 + 3400 * Math.pow(p, 0.7);
    const tt = t - len * 0.85;
    let body = 0;
    if (tt > 0) {
      ph += (88 - 26 * Math.min(1, tt / 0.15)) / SR;
      body = Math.sin(2 * Math.PI * ph) * Math.exp(-tt * 13) * 0.3 * Math.min(1, tt / 0.004);
    }
    L[i] = band(st[0], rnd() * 2 - 1, fc * 0.94, 0.8).bp * env * 0.45 * (1 - 0.3 * p) + body;
    R[i] = band(st[1], rnd() * 2 - 1, fc * 1.06, 0.8).bp * env * 0.45 * (0.7 + 0.3 * p) + body;
  }
  write('open', ...space(L, R, [[0.057, 0.15, 1], [0.093, 0.1, 0]]));
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

// ——— mark : une preuve mesurée (le cadre se trace : petit frottement rapide, puis un déclic) ———
{
  const len = 0.5;
  const [L, R] = noise(len, (t, p) => {
    const env = Math.min(1, t / 0.02) * Math.pow(Math.max(0, 1 - p * 1.4), 1.3);
    return [2600 + 1400 * p, 0.45, env * 0.34 * (1 - 0.5 * p), env * 0.34 * (0.5 + 0.5 * p)];
  });
  const i0 = Math.floor(0.36 * SR);
  for (let j = 0; j < SR * 0.06; j++) {
    const t = j / SR;
    const s = Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-t * 160) * 0.5;
    L[i0 + j] += s;
    R[i0 + j] += s;
  }
  write('mark', ...space(L, R, [[0.039, 0.12, 1], [0.067, 0.08, 0]]));
}

// ——— lift : les dessins se détachent de la page (souffle qui monte doucement) ———
{
  const len = 1.2;
  const [L, R] = noise(len, (t, p) => {
    const env = Math.pow(Math.sin(Math.PI * Math.pow(p, 0.7)), 2);
    return [700 + 2600 * p, 1.2, env * 0.4 * (1 - 0.4 * p), env * 0.4 * (0.6 + 0.4 * p)];
  });
  write('lift', ...space(L, R, [[0.071, 0.18, 1], [0.113, 0.14, 0]]));
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

// ——— swap : le bassin de l'accueil qui change (souffle bref qui descend puis remonte) ———
{
  const len = 0.8;
  const [L, R] = noise(len, (t, p) => {
    const env = Math.pow(Math.sin(Math.PI * p), 2);
    return [1400 + 1300 * Math.cos(Math.PI * 2 * p), 1.3, env * 0.36, env * 0.36];
  });
  write('swap', ...space(L, R));
}

// ——— grow / shrink : le bassin qui s'étire ou se rétracte (glissé doux, la règle qui suit) ———
const glide = (name, f0, f1) => {
  const len = 0.62;
  const n = Math.floor(SR * (len + 0.3));
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  let ph = 0;
  let ph2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const p = Math.min(1, t / len);
    // la courbe des animations du site (expo.out)
    const e = 1 - Math.pow(2, -10 * p);
    const f = f0 + (f1 - f0) * e;
    ph += f / SR;
    ph2 += (f * 2.01) / SR;
    const env = Math.min(1, t / 0.02) * (t < len ? 1 - 0.5 * p : 0.5 * Math.exp(-(t - len) * 12));
    const s = (Math.sin(2 * Math.PI * ph) * 0.6 + Math.sin(2 * Math.PI * ph2) * 0.18) * env * 0.4;
    L[i] = s * (1 - 0.3 * p);
    R[i] = s * (0.7 + 0.3 * p);
  }
  write(name, ...space(L, R, [[0.049, 0.14, 1], [0.083, 0.1, 0]]));
};
glide('grow', midi(64), midi(71));
glide('shrink', midi(71), midi(62));

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

// ——— swatch : un coloris choisi (une goutte qui résonne) ———
{
  const n = Math.floor(SR * 0.6);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 600 + 900 * (1 - Math.exp(-t * 40));
    ph += f / SR;
    const s = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 11) * Math.min(1, t / 0.002) * 0.6 + Math.sin(2 * Math.PI * 2 * ph) * Math.exp(-t * 30) * 0.12;
    L[i] = s * 0.9;
    R[i] = s;
  }
  write('swatch', ...space(L, R, [[0.057, 0.2, 1], [0.091, 0.14, 0], [0.137, 0.08, 1]]));
}

// ——— drag : la bande qu'on fait glisser (frottement doux qui suit la main) ———
{
  const len = 1.6;
  const [L, R] = noise(len, (t, p) => {
    const env = Math.min(1, t / 0.1) * Math.pow(Math.sin(Math.PI * Math.min(1, p * 1.05)), 0.8);
    return [900 + 900 * Math.sin(Math.PI * p), 0.9, env * 0.32 * (0.4 + 0.6 * p), env * 0.32 * (1 - 0.6 * p)];
  });
  write('drag', L, R);
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
  const len = 2.4;
  const n = Math.floor(SR * len);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (const [m, at, g, pan] of [[88, 0, 0.5, 0.4], [93, 0.12, 0.45, 0.6]]) {
    const f = midi(m);
    const i0 = Math.floor(at * SR);
    for (let j = 0; i0 + j < n; j++) {
      const t = j / SR;
      const s = Math.sin(2 * Math.PI * f * t + 1.2 * Math.exp(-t * 4) * Math.sin(2 * Math.PI * f * 3.5 * t)) * Math.exp(-t * 1.7) * g * Math.min(1, t / 0.002);
      L[i0 + j] += s * (1 - pan);
      R[i0 + j] += s * pan;
    }
  }
  write('chime', ...space(L, R));
}
