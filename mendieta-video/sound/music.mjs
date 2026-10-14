// Musique originale de la présentation Mendieta Roofing, synthétisée de zéro (aucun échantillon, aucun droit tiers).
// 112,5 BPM, en ré majeur, une pop lumineuse et boisée : marimba, guitare pincée (corde de Karplus-Strong), nappe chaude,
// basse ronde, batterie légère (grosse caisse, claquements de mains, shaker), cloches et verre pour les gestes.
// Pas de bruitages : chaque geste filmé est souligné d'une note.
// Comme le site, elle se construit couche par couche :
// - l'ouverture : la page blanche, une nappe ; le titre monte, trois notes de marimba ; la photo se découvre, une montée
//   de verre (le filtre général s'ouvre en même temps) ; la photo est entière : les cloches, et le groove entre à demi ;
//   il est complet avec la légende ;
// - couche par couche : tout retombe à la nappe. L'ancien toit s'en va (des notes qui descendent) ; la sous-couche se
//   déroule : la basse et la grosse caisse entrent, une montée de verre suit le rouleau ; les tuiles se posent : une note
//   de marimba par tuile, le shaker et la guitare entrent ; le toit est fini : l'accord de ré, les cloches, les mains ;
// - ensuite, le groove complet sous les autres parties ; les gestes (le filtre, la carte qui se colore, chaque lettre tapée,
//   la ville trouvée, les choix du devis, le message prêt, les téléphones) ont chacun leur note, à l'image près ;
// - la fin : le groove s'arrête, la cadence se pose sur ré avec les cloches.
// Les temps des scènes viennent de src/beats.ts, les repères des gestes de public/site/*.json.
// Usage : node sound/music.mjs  →  public/sfx/music.wav
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCENE_BEATS, OPEN, EVENTS, END, PHONE_TIMING, BEAT as FR} from '../src/beats.ts';

const here = dirname(fileURLToPath(import.meta.url));
const SR = 44100;
const BPM = 112.5;
const BEAT = 60 / BPM;
const TOTAL_BEATS = SCENE_BEATS.reduce((n, [, b]) => n + b, 0);
const TAIL = 4;
const N = Math.ceil((TOTAL_BEATS * BEAT + TAIL) * SR);
// deux bus : le son direct et l'envoi vers la réverbération
const L = new Float32Array(N);
const R = new Float32Array(N);
const busL = new Float32Array(N);
const busR = new Float32Array(N);

// début de chaque scène, en temps
const S = {};
{
  let b = 0;
  for (const [name, n] of SCENE_BEATS) { S[name] = b; b += n; }
}
/** une image de scène en temps de musique */
const fb = (frames) => frames / FR;
/** repères et valeurs relevés d'un plan */
const meta = (name) => {
  const file = resolve(here, `../public/site/${name}.json`);
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
};
const mark = (name, key, fallback) => meta(name).marks?.[key] ?? fallback;

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const n = (name) => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  const base = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]];
  return midi(12 * (Number(m[3]) + 1) + base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0));
};
let seed = 19880314;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
// énergie de chaque instrument, pour vérifier l'équilibre du mélange (affichée à la fin)
const energy = {};
let TAG = 'nappe';
const add = (i, l, r, send = 0) => {
  if (i < 0 || i >= N) return;
  energy[TAG] = (energy[TAG] || 0) + l * l + r * r;
  L[i] += l;
  R[i] += r;
  if (send) { busL[i] += l * send; busR[i] += r * send; }
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

// ——— Équilibre des instruments (énergie en dB affichée à la fin, réglée à l'écoute du spectre des présentations
// précédentes : la basse et la grosse caisse en retrait, le marimba et la guitare présents dans les médiums) ———
const MIX = {nappe: 1.15, marimba: 1.0, guitare: 0.9, basse: 0.62, kick: 0.8, mains: 1.1, shaker: 0.45};

// ——— Accords (voix de la nappe et de la guitare) et basse, en ré majeur ; la basse reste au-dessus de 60 Hz, que les
// petits haut-parleurs rendent encore (sauf le si, à 62 Hz) ———
const CH = {
  Dmaj9: {v: ['F#3', 'A3', 'C#4', 'E4'], b: 'D2'},
  Bm9: {v: ['D4', 'F#4', 'A4', 'C#5'], b: 'B1'},
  Gmaj9: {v: ['B3', 'D4', 'F#4', 'A4'], b: 'G2'},
  A6sus: {v: ['D4', 'E4', 'F#4', 'B4'], b: 'A2'},
  Em9: {v: ['G3', 'B3', 'D4', 'F#4'], b: 'E2'},
  Fsm7: {v: ['A3', 'C#4', 'E4', 'G#4'], b: 'F#2'},
};

// L'ouverture (scène Open, images → temps) : la page blanche jusqu'à HOLD ; le titre monte à HOLD ; la photo se découvre
// de PHOTO0 à PHOTO ; LAND : le temps qui suit, où tout se pose ; le navigateur se range à ASIDE ; la légende à CAP
const HOLD = fb(OPEN.hold);
const PHOTO0 = fb(OPEN.hold + 12);
const PHOTO = fb(OPEN.photo);
const LAND = Math.ceil(PHOTO);
const ASIDE = fb(OPEN.aside);
const CAP = fb(OPEN.cap);

// Couche par couche (scène Layers) : les étapes de la coupe, relevées image par image dans le plan d-layers
const LY = S.Layers;
const lay = (key, fallback) => LY + fb(mark('d-layers', key, fallback));
const STEP2 = Math.round(lay('s2', 160));
const STEP3 = Math.round(lay('s3', 287));
const STEP4 = Math.round(lay('s4', 415));

// Grille : un accord tous les deux temps dans le groove ; la coupe change d'accord à chaque étape et se résout sur ré
const PROG = [
  [0, 'Gmaj9'], [PHOTO0, 'A6sus'], [LAND, 'Dmaj9'], [LAND + 2, 'Bm9'], [LAND + 4, 'Gmaj9'], [LAND + 6, 'A6sus'],
  [LAND + 8, 'Dmaj9'], [LAND + 10, 'A6sus'],
  // couche par couche : le bois (sol), la sous-couche (mi mineur), les tuiles (la suspendu), fini (ré)
  [LY, 'Gmaj9'], [STEP2, 'Em9'], [STEP3, 'A6sus'], [STEP4, 'Dmaj9'], [STEP4 + 4, 'Bm9'], [STEP4 + 5, 'Gmaj9'], [LY + 19, 'A6sus'],
];
const loop = (from, to, names) => {
  for (let b = from, k = 0; b < to; b += 2, k++) PROG.push([b, names[k % names.length]]);
};
loop(S.Photos, S.Proof, ['Dmaj9', 'Bm9', 'Gmaj9', 'A6sus']);
loop(S.Proof, S.Area, ['Gmaj9', 'A6sus', 'Fsm7', 'Bm9']);
loop(S.Area, S.Estimate, ['Dmaj9', 'Bm9', 'Gmaj9', 'A6sus']);
loop(S.Estimate, S.Mobile, ['Dmaj9', 'Bm9', 'Gmaj9', 'A6sus']);
loop(S.Mobile, S.End, ['Gmaj9', 'A6sus', 'Dmaj9', 'Bm9']);
PROG.push([S.End, 'Gmaj9'], [S.End + 2, 'A6sus'], [S.End + 4, 'Dmaj9']);
PROG.sort((a, b) => a[0] - b[0]);
const chordAt = (beat) => {
  let c = PROG[0];
  for (const p of PROG) if (beat >= p[0] - 1e-9) c = p;
  return c;
};

const padGain = (b) => env(b, [
  [0, 0], [0.5, 0.2], [PHOTO0, 0.24], [LAND, 0.32], [CAP, 0.15],
  // couche par couche : la nappe reprend le premier plan, puis s'efface quand le groove revient
  [LY - 0.5, 0.15], [LY + 0.5, 0.3], [STEP4, 0.32], [STEP4 + 2, 0.16],
  [S.End, 0.26], [S.End + 4, 0.36], [TOTAL_BEATS + 3, 0],
]);

// ——— Nappe : sinus et triangles désaccordés, attaque lente, un passe-bas doux ———
{
  let cur = null;
  let prev = null;
  let xf = 1;
  const XF = SR * 0.8;
  const lp = [0, 0];
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const b = t / BEAT;
    const c = chordAt(b)[1];
    if (c !== cur) { prev = cur; cur = c; xf = prev ? 0 : 1; }
    if (xf < 1) xf = Math.min(1, xf + 1 / XF);
    const g = padGain(b);
    if (g < 1e-4) continue;
    let sl = 0;
    let sr = 0;
    for (const [name, w] of [[cur, Math.sin((xf * Math.PI) / 2)], [prev, Math.cos((xf * Math.PI) / 2)]]) {
      if (!name || w < 1e-3) continue;
      CH[name].v.forEach((nm, k) => {
        const f0 = n(nm);
        for (const d of [-1, 1]) {
          const f = f0 * Math.pow(2, (d * 0.07) / 12);
          const ph = f * t + k * 0.29 + (d > 0 ? 0.5 : 0) + 0.004 * Math.sin(t * (0.31 + k * 0.13));
          const fr = ph - Math.floor(ph);
          const tri = 1 - 4 * Math.abs(fr - 0.5);
          const x = (0.7 * Math.sin(2 * Math.PI * ph) + 0.3 * tri) * w * 0.1;
          if (d < 0) sl += x; else sr += x;
        }
      });
    }
    const a = 0.07;
    lp[0] += (sl - lp[0]) * a;
    lp[1] += (sr - lp[1]) * a;
    TAG = 'nappe';
    add(i, lp[0] * g * MIX.nappe, lp[1] * g * MIX.nappe, 1.1);
  }
}

// ——— Marimba : la lame (fondamentale, puis les partiels accordés à la double octave et à la dixième), le maillet ———
const addMarimba = (t0, freq, gain, pan, len = 1.3) => {
  TAG = 'marimba';
  gain *= MIX.marimba;
  const i0 = Math.floor(t0 * SR);
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    let s = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * (2.4 + freq / 700))
      + 0.3 * Math.sin(2 * Math.PI * freq * 3.98 * t) * Math.exp(-t * 12)
      + 0.06 * Math.sin(2 * Math.PI * freq * 9.9 * t) * Math.exp(-t * 34);
    // le maillet : un éclat sourd de 4 ms
    if (t < 0.004) s += (rnd() - 0.5) * 0.25 * (1 - t / 0.004);
    s *= gain * (t < 0.0015 ? t / 0.0015 : 1) * (t > len - 0.08 ? (len - t) / 0.08 : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.45);
  }
};

// ——— Guitare pincée (corde de Karplus-Strong, un peu feutrée) ———
const addPluck = (t0, freq, gain, pan, len = 1.4) => {
  TAG = 'guitare';
  gain *= MIX.guitare;
  const P = Math.max(2, Math.round(SR / freq));
  const buf = new Float32Array(P);
  // l'attaque : du bruit adouci (une corde pincée du gras du doigt)
  let lp = 0;
  for (let k = 0; k < P; k++) {
    lp += ((rnd() * 2 - 1) - lp) * 0.55;
    buf[k] = lp;
  }
  const damp = 0.9965 - Math.min(0.004, freq / 120000);
  const i0 = Math.floor(t0 * SR);
  let idx = 0;
  for (let j = 0; j < SR * len; j++) {
    const cur = buf[idx];
    const nxt = buf[(idx + 1) % P];
    buf[idx] = damp * 0.5 * (cur + nxt);
    idx = (idx + 1) % P;
    const fade = j > SR * (len - 0.08) ? (SR * len - j) / (SR * 0.08) : 1;
    const s = cur * gain * fade;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.3);
  }
};

// ——— Basse ronde (une sinusoïde légèrement saturée, qui s'entend aussi sur un petit haut-parleur) ———
const addBass = (t0, freq, gain, len) => {
  TAG = 'basse';
  gain *= MIX.basse;
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * (len + 0.08); j++) {
    const t = j / SR;
    ph += freq / SR;
    ph -= Math.floor(ph);
    const a = gain * (t < 0.008 ? t / 0.008 : 1) * (0.5 * Math.exp(-t * 2.2) + 0.5) * (t > len ? Math.max(0, 1 - (t - len) / 0.08) : 1);
    const s = Math.tanh((Math.sin(2 * Math.PI * ph) + 0.2 * Math.sin(4 * Math.PI * ph) * Math.exp(-t * 7)) * 1.5) * a;
    add(i0 + j, s, s, 0);
  }
};

// ——— Batterie légère ———
const addKick = (t0, gain) => {
  TAG = 'grosse caisse';
  gain *= MIX.kick;
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.45; j++) {
    const t = j / SR;
    const f = 58 + 80 * Math.exp(-t * 32);
    ph += (2 * Math.PI * f) / SR;
    const s = (Math.sin(ph) * Math.exp(-t * 8) + (t < 0.002 ? (rnd() - 0.5) * 0.2 : 0)) * gain * (t < 0.003 ? t / 0.003 : 1);
    add(i0 + j, s, s, 0);
  }
};
const svf = () => ({lp: 0, bp: 0});
const band = (st, x, fc, q) => {
  const k = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6)) / SR);
  const hp = x - st.lp - q * st.bp;
  st.bp += k * hp;
  st.lp += k * st.bp;
  return st.bp;
};
/** les mains : trois éclats rapprochés, puis une petite queue */
const addClap = (t0, gain, pan = 0.55) => {
  TAG = 'mains';
  gain *= MIX.mains;
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.22; j++) {
    const t = j / SR;
    const bursts = [0, 0.009, 0.019].reduce((acc, d) => acc + (t >= d && t < d + 0.006 ? Math.exp(-(t - d) * 400) : 0), 0);
    const e = bursts + (t > 0.019 ? Math.exp(-(t - 0.019) * 22) * 0.55 : 0);
    const s = band(st, rnd() * 2 - 1, 1250, 0.8) * e * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.4);
  }
};
/** le shaker : un souffle aigu bref, plus marqué à contretemps */
const addShaker = (t0, gain, pan = 0.68) => {
  TAG = 'shaker';
  gain *= MIX.shaker;
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.07; j++) {
    const t = j / SR;
    const e = (t < 0.006 ? t / 0.006 : 1) * Math.exp(-t * 55);
    const s = band(st, rnd() * 2 - 1, 7200, 0.7) * e * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.12);
  }
};

// ——— Verre et cloches, pour les gestes ———
const addGlass = (t0, freq, gain, pan, len = 1.1) => {
  TAG = 'verre';
  const i0 = Math.floor(t0 * SR);
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    let s = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 4.2) + 0.22 * Math.sin(2 * Math.PI * freq * 2.76 * t) * Math.exp(-t * 14) + 0.05 * Math.sin(2 * Math.PI * freq * 5.4 * t) * Math.exp(-t * 30);
    s *= gain * (t < 0.0025 ? t / 0.0025 : 1) * (t > len - 0.1 ? (len - t) / 0.1 : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.5);
  }
};
const addBell = (t0, freq, gain, pan, len = 4) => {
  TAG = 'cloches';
  const i0 = Math.floor(t0 * SR);
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    const s = (Math.sin(2 * Math.PI * freq * t) + 0.22 * Math.sin(2 * Math.PI * freq * 2.76 * t) * Math.exp(-t * 2.5) + 0.08 * Math.sin(2 * Math.PI * freq * 5.4 * t) * Math.exp(-t * 6)) * Math.exp(-t * 0.95) * gain * (t < 0.003 ? t / 0.003 : 1);
    add(i0 + j, s * (1 - pan), s * pan, 0.9);
  }
};

// ——— Partition ———
const at = (b) => b * BEAT;
const isStart = (b, start) => Math.abs(b - start) < 1e-9;
// le groove : à demi quand la photo de l'accueil se pose, complet avec la légende ; couche par couche, il revient une
// couche à la fois ; il s'arrête à la fin
const layer = (b) => {
  if (b < LAND) return 0;
  if (b < LY) return b < CAP ? 1 : 3;
  if (b < S.Photos) return b < STEP2 ? 0 : b < STEP3 ? 1 : b < STEP4 ? 2 : 3;
  if (b < S.End) return 3;
  return 0;
};
// 1 : basse et grosse caisse ; 2 : + shaker et guitare ; 3 : + mains
const SWING = 0.035;
const swingT = (b) => {
  const fr = Math.round((b % 1) * 4) / 4;
  return fr === 0.25 || fr === 0.75 ? b + SWING : b;
};

for (let s16 = 0; s16 < TOTAL_BEATS * 4; s16++) {
  const b = s16 / 4;
  const t = at(swingT(b));
  const [start, name] = chordAt(b);
  const c = CH[name];
  const lv = layer(b);
  const bar = ((b % 4) + 4) % 4;
  const inChord = b - start;
  if (lv >= 1) {
    // basse : la fondamentale au changement d'accord, reprise sur le temps suivant, la quinte juste avant le changement
    const root = n(c.b);
    if (isStart(b, start)) addBass(t, root, 0.14, BEAT * 0.8);
    else if (Math.abs(inChord - 1) < 1e-9) addBass(t, root, 0.1, BEAT * 0.4);
    else if (Math.abs(inChord - 1.5) < 1e-9 && lv >= 2) addBass(t, root * 1.5, 0.08, BEAT * 0.4);
    // grosse caisse : sur le 1 et le 3, une note fantôme avant le 3
    if (bar === 0) addKick(t, 0.4);
    if (bar === 2) addKick(t, 0.32);
    if (bar === 1.75 && lv >= 2) addKick(t, 0.12);
  }
  if (lv >= 2) {
    // shaker : les doubles croches, marquées à contretemps
    const k = s16 % 4;
    addShaker(t, [0.03, 0.016, 0.05, 0.018][k], 0.64 + 0.06 * (k % 2));
    // guitare : l'accord égrené en croches, de la note grave à l'aiguë et retour
    if (s16 % 2 === 0) {
      const order = [0, 2, 1, 3, 0, 2, 1, 3];
      const idx = order[Math.round((b % 4) * 2) % 8];
      addPluck(t, n(c.v[idx]), bar === 0 || bar === 2 ? 0.075 : 0.055, 0.3, 1.2);
    }
  }
  if (lv >= 3) {
    // les mains sur le 2 et le 4
    if (bar === 1 || bar === 3) addClap(t, 0.2);
  }
}

// ——— Les gestes ———
const PENTA = ['D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6', 'A6'];
const run = (b0, b1, gain, from, lift, dir = 1, inst = 'marimba') => {
  const steps = Math.max(1, Math.round((b1 - b0) * 4));
  for (let k = 0; k <= steps; k++) {
    const u = k / steps;
    const idx = Math.max(0, Math.min(PENTA.length - 1, from + dir * Math.round(u * lift)));
    const t = at(b0 + k / 4);
    const pan = 0.2 + 0.6 * (dir > 0 ? u : 1 - u);
    if (inst === 'verre') addGlass(t, n(PENTA[idx]), gain * (0.75 + 0.25 * Math.sin(u * Math.PI)), pan, 1.0);
    else addMarimba(t, n(PENTA[idx]), gain, pan, 1.1);
  }
};

// l'ouverture : la page blanche (nappe seule) ; le titre monte, trois lignes : trois notes ; la photo se découvre : une
// montée de verre ; la photo entière : les cloches et le groove
{
  const t = at(HOLD);
  ['D5', 'F#5', 'A5'].forEach((nm, k) => addMarimba(t + k * 0.08, n(nm), 0.05, 0.35 + 0.15 * k));
  run(PHOTO0, PHOTO - 0.25, 0.022, 3, 7, 1, 'verre');
  for (const [nm, g, pan, dt] of [['D6', 0.04, 0.38, 0], ['F#6', 0.032, 0.58, 0.03], ['A6', 0.024, 0.68, 0.06]]) addBell(at(LAND) + dt, n(nm), g, pan, 3.6);
  addMarimba(at(ASIDE), n('A5'), 0.04, 0.4);
  addMarimba(at(ASIDE + 0.5), n('D6'), 0.036, 0.62);
  addBell(at(CAP), n('A5'), 0.02, 0.6, 2.4);
}

// couche par couche
{
  // l'ancien toit s'en va : quatre notes qui descendent, quand il passe à 20, 40, 60 et 80 %
  const off = meta('d-layers').values?.off || [];
  const NOTES = ['A5', 'F#5', 'D5', 'A4'];
  [0.2, 0.4, 0.6, 0.8].forEach((v, k) => {
    const i = off.findIndex((x) => x != null && x >= v);
    if (i >= 0) addMarimba(at(LY + fb(i)), n(NOTES[k]), 0.045, 0.62 - 0.1 * k);
  });
  // la sous-couche se déroule : une cloche grave, puis une montée de verre qui suit le rouleau (20 à 100 %)
  addBell(at(lay('s2', 160)), n('D5'), 0.03, 0.42, 3.2);
  const under = meta('d-layers').values?.under || [];
  const max = Math.max(1, ...under.filter((x) => x != null));
  ['E5', 'F#5', 'A5', 'B5', 'D6'].forEach((nm, k) => {
    const i = under.findIndex((x) => x != null && x >= max * (0.2 + 0.2 * k) - 0.5);
    if (i >= 0) addGlass(at(LY + fb(i)), n(nm), 0.026, 0.3 + 0.12 * k, 1.1);
  });
  // les tuiles : une note de marimba par tuile posée, en montant
  [['t1', 'A5'], ['t2', 'C#6'], ['t3', 'E6']].forEach(([key, nm], k) => {
    const tt = at(lay(key, 313 + 25 * k));
    addMarimba(tt, n(nm), 0.06, 0.34 + 0.16 * k, 1.4);
    addMarimba(tt + 0.012, n(nm) / 2, 0.022, 0.5, 1.0);
  });
  // le toit est fini : l'accord de ré et les cloches
  for (const [nm, g, pan, dt] of [['D6', 0.042, 0.36, 0], ['F#6', 0.034, 0.58, 0.03], ['A6', 0.028, 0.48, 0.05], ['D7', 0.016, 0.7, 0.08]]) addBell(at(lay('s4', 415)) + dt, n(nm), g, pan, 3.8);
}

// les photos : le filtre « Tile » (deux notes), puis les photos qui se reposent (un arpège rapide)
{
  const t = at(S.Photos + fb(mark('d-photos', 'tile', EVENTS.photos.tile * FR)));
  addGlass(t, n('E5'), 0.034, 0.46, 1.1);
  addGlass(t + 0.012, n('A5'), 0.026, 0.56, 1.1);
  ['D6', 'E6', 'F#6', 'A6'].forEach((nm, k) => addMarimba(t + 0.1 + k * 0.07, n(nm), 0.022, 0.3 + 0.15 * k, 0.9));
}
// la preuve : la licence arrive à l'écran (une cloche)
addBell(at(S.Proof + fb(mark('d-proof', 'card', 290))), n('A5'), 0.03, 0.5, 3.2);

// le secteur : les villes se colorent une à une (une montée de marimba), chaque lettre tapée (une note douce), la ville
// trouvée (les cloches)
{
  const t0 = S.Area + fb(mark('d-area', 'mapIn', 32));
  run(t0, t0 + 2, 0.026, 3, 8, 1);
  const typeFrom = Math.round(EVENTS.area.focus * FR) + 6;
  const TYPE = ['A5', 'F#5', 'E5', 'D5', 'E5', 'F#5', 'A5', 'B5', 'A5', 'F#5'];
  TYPE.forEach((nm, k) => addMarimba(at(S.Area + fb(typeFrom + k * 5)), n(nm), 0.018, 0.4 + 0.02 * k, 0.7));
  const hit = at(S.Area + fb(mark('d-area', 'hit', EVENTS.area.check * FR)));
  addBell(hit, n('D6'), 0.036, 0.42, 3.4);
  addBell(hit + 0.035, n('A5'), 0.028, 0.6, 3.4);
}
// le devis : les deux choix (deux notes), le message prêt (les cloches, un arpège)
{
  addGlass(at(S.Estimate + fb(mark('d-estimate', 'tile', EVENTS.estimate.tile * FR))), n('E5'), 0.032, 0.45, 1.1);
  addGlass(at(S.Estimate + fb(mark('d-estimate', 'leak', EVENTS.estimate.leak * FR))), n('F#5'), 0.032, 0.55, 1.1);
  const t = at(S.Estimate + fb(mark('d-estimate', 'ready', EVENTS.estimate.go * FR)));
  for (const [nm, g, pan, dt] of [['A5', 0.036, 0.4, 0], ['D6', 0.03, 0.6, 0.03]]) addBell(t + dt, n(nm), g, pan, 3.4);
  ['D5', 'F#5', 'A5', 'D6'].forEach((nm, k) => addMarimba(t + 0.12 + k * 0.08, n(nm), 0.024, 0.3 + 0.14 * k, 1.0));
}
// au téléphone : les trois téléphones montent (trois notes) ; dans le premier, le titre monte ; dans le deuxième, les
// tuiles se posent
{
  ['D5', 'F#5', 'A5'].forEach((nm, k) => addMarimba(at(S.Mobile + fb(k * 8 + 30)), n(nm), 0.032, 0.3 + 0.2 * k, 1.1));
  const mOpen = S.Mobile + fb(PHONE_TIMING.mOpen.delay);
  ['A5', 'D6'].forEach((nm, k) => addGlass(at(mOpen) + k * 0.09, n(nm), 0.018, 0.32, 1.0));
  [['t1', 'A5'], ['t2', 'C#6'], ['t3', 'E6']].forEach(([key, nm]) => addMarimba(at(S.Mobile + fb(PHONE_TIMING.mLayers.delay + mark('m-layers', key, 240))), n(nm), 0.028, 0.5, 1.1));
}
// fin : le blason (une cloche), le nom qui monte (un arpège), la cadence posée sur ré (les cloches)
{
  addBell(at(S.End + fb(END.crest)), n('D5'), 0.03, 0.5, 3.6);
  ['D5', 'F#5', 'A5', 'D6', 'E6'].forEach((nm, k) => addMarimba(at(S.End + fb(END.name)) + k * 0.075, n(nm), 0.04, 0.25 + 0.12 * k, 1.4));
  const t1 = at(S.End + 4);
  for (const [nm, g, pan, dt] of [['D6', 0.05, 0.35, 0], ['F#6', 0.04, 0.62, 0.02], ['A6', 0.034, 0.45, 0.04], ['C#7', 0.02, 0.7, 0.06], ['E7', 0.016, 0.3, 0.08]]) addBell(t1 + dt, n(nm), g, pan, 5);
  // la guitare égrène l'accord final, la basse le pose
  CH.Dmaj9.v.forEach((nm, k) => addPluck(t1 + k * 0.06, n(nm), 0.07, 0.3 + 0.1 * k, 3.2));
  addBass(t1, n('D2'), 0.13, 3.4);
  addKick(t1, 0.34);
  // les deux accords d'avant : la guitare seule
  for (const [b, nm] of [[S.End, 'Gmaj9'], [S.End + 2, 'A6sus']]) CH[nm].v.forEach((v, k) => addPluck(at(b) + k * 0.05, n(v), 0.05, 0.3 + 0.1 * k, 1.8));
}

// ——— Réverbération (Schroeder : 4 filtres en peigne amortis + 3 passe-tout, par canal) ———
const reverb = (input, offset) => {
  const out = new Float32Array(N);
  const combs = [1687, 1601, 1491, 1422].map((d) => ({buf: new Float32Array(d + offset), i: 0, lp: 0}));
  const aps = [556, 441, 341].map((d) => ({buf: new Float32Array(d + offset), i: 0}));
  for (let s = 0; s < N; s++) {
    const x = input[s] * 0.5;
    let y = 0;
    for (const c of combs) {
      const v = c.buf[c.i];
      c.lp = v * 0.6 + c.lp * 0.4;
      c.buf[c.i] = x + c.lp * 0.84;
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
  L[i] += wetL[i] * 0.28;
  R[i] += wetR[i] * 0.28;
}

// ——— La page blanche : tout passe dans un passe-bas qui s'entrouvre, puis s'ouvre en grand pendant que la photo se
// découvre (de PHOTO0 à LAND) ———
{
  const cut = (b) => {
    if (b < PHOTO0) return 900 + 600 * smooth(b / PHOTO0);
    if (b < LAND) return 1500 * Math.pow(20000 / 1500, smooth((b - PHOTO0) / (LAND - PHOTO0)));
    return 20000;
  };
  const s = [[0, 0], [0, 0]];
  const end = Math.ceil(at(LAND) * SR);
  for (let i = 0; i < end; i++) {
    const fc = Math.min(18000, cut(i / SR / BEAT));
    const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
    for (const [ch, buf] of [[0, L], [1, R]]) {
      s[ch][0] += (buf[i] - s[ch][0]) * a;
      s[ch][1] += (s[ch][0] - s[ch][1]) * a;
      buf[i] = s[ch][1];
    }
  }
}

// ——— Normalisation (crête à −3 dBFS) et écriture WAV 16 bits ———
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = Math.pow(10, -3 / 20) / peak;
const fadeOut = Math.floor(2.5 * SR);
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
const out = resolve(here, '../public/sfx/music.wav');
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, Buffer.concat([header, data]));
console.log(`✓ ${out}  ${(N / SR).toFixed(1)} s, crête d'origine ${peak.toFixed(2)}`);
console.log(`  ouverture : titre ${HOLD.toFixed(2)}, photo ${PHOTO0.toFixed(2)}–${PHOTO.toFixed(2)}, posée ${LAND}, légende ${CAP.toFixed(2)} ; couche par couche : étapes ${STEP2 - LY}, ${STEP3 - LY}, ${STEP4 - LY} (temps de la scène)`);
const dB = (e) => (10 * Math.log10(e / N / 2 + 1e-12)).toFixed(1);
console.log('  énergie par instrument (dB, avant réverbération) : ' + Object.entries(energy).map(([k, e]) => `${k} ${dB(e)}`).join(', '));
