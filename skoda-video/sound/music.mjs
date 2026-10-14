// Musique originale de la présentation Skoda Construction, synthétisée de zéro (aucun échantillon, aucun droit tiers).
// 100 BPM, en mi bémol majeur, chaleureuse et posée : piano feutré, cordes, contrebasse pincée, batterie aux balais
// (grosse caisse douce, balais, charleston léger), et un carillon pour les gestes. Pas de bruitages : chaque geste
// filmé est souligné d'une note.
// Elle suit le site :
// - l'ouverture : les cordes seules, à travers un filtre fermé ; les cinq lettres du nom montent : cinq notes de piano
//   qui montent, et le filtre s'ouvre ; la première photo entre : le carillon ; la contrebasse et la grosse caisse
//   entrent quand le navigateur se range, les balais avec la légende ;
// - le nom : le groove complet ; chaque chantier qui passe devant le nom a sa note de piano, en haut du clavier ;
//   « All our jobs are owner supervised » : l'accord s'ouvre et le carillon sonne ;
// - la maison restaurée : la batterie s'arrête, l'accord passe en mineur (novembre 2022), la contrebasse revient au
//   séchage, et décembre 2023 retombe sur mi bémol avec le carillon et le groove complet ;
// - les autres gestes (les étapes qui se découvrent, la visionneuse, la ligne de la famille et ses quatre dates, les
//   choix du formulaire, la demande prête, les téléphones) ont chacun leur note, à l'image près ;
// - la fin : le groove s'arrête, une note par lettre du nom, la cadence se pose sur mi bémol.
// Les temps des scènes viennent de src/beats.ts, les repères des gestes de public/site/*.json.
// Usage : node --no-warnings sound/music.mjs  →  public/sfx/music.wav
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCENE_BEATS, OPEN, EVENTS, END, PHONE_TIMING, BEAT as FR} from '../src/beats.ts';

const here = dirname(fileURLToPath(import.meta.url));
const SR = 44100;
const BPM = 100;
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
let seed = 19501985;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const TAU = 2 * Math.PI;
// énergie de chaque instrument, pour vérifier l'équilibre du mélange (affichée à la fin)
const energy = {};
let TAG = 'cordes';
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

// ——— Équilibre des instruments (énergie en dB affichée à la fin) : le piano devant, les cordes en nappe, la contrebasse
// et la grosse caisse en retrait, les balais discrets ———
const MIX = {cordes: 0.8, piano: 1.0, contrebasse: 0.7, kick: 0.75, balais: 0.7, charleston: 0.3, carillon: 1.0};

// ——— Accords (voix des cordes et du piano) et basse, en mi bémol majeur ; la basse reste au-dessus de 60 Hz, que les
// petits haut-parleurs rendent encore ———
const CH = {
  Ebmaj9: {v: ['G3', 'Bb3', 'D4', 'F4'], b: 'Eb2'},
  Cm9: {v: ['G3', 'Bb3', 'D4', 'Eb4'], b: 'C2'},
  Abmaj9: {v: ['G3', 'C4', 'Eb4', 'Bb4'], b: 'Ab2'},
  Bb6sus: {v: ['F3', 'G3', 'C4', 'Eb4'], b: 'Bb2'},
  Fm9: {v: ['Ab3', 'C4', 'Eb4', 'G4'], b: 'F2'},
  Gm7: {v: ['F3', 'Bb3', 'D4', 'G4'], b: 'G2'},
};

// L'ouverture (scène Open, images → temps) : la page telle qu'elle s'affiche jusqu'à HOLD ; les lettres du nom montent
// à partir de LETTER[0] ; la première photo entre de PHOTO0 à PHOTO ; LAND : le temps qui suit, où tout se pose ;
// le navigateur se range à ASIDE ; la légende à CAP
const open = meta('d-open');
const F0 = Math.max(0, (open.values?.nameT || []).findIndex((v) => v != null && v >= 0));
const LETTER = [0, 1, 2, 3, 4].map((k) => fb(OPEN.hold + F0 + ((100 + 60 * k) * 60) / 1000));
const PHOTO0 = fb(OPEN.hold + F0 + (550 * 60) / 1000);
const PHOTO = fb(OPEN.hold + F0 + (1650 * 60) / 1000);
const LAND = Math.ceil(PHOTO);
const ASIDE = fb(OPEN.aside);
const CAP = fb(OPEN.cap);

// La maison restaurée (scène Story) : le séchage et décembre 2023, relevés image par image dans le plan d-story
const ST = S.Story;
const DRY = ST + fb(mark('d-story', 's2', EVENTS.story.second * FR));
const DEC = ST + fb(mark('d-story', 's3', 375));

// Grille : un accord tous les deux temps dans le groove ; la maison restaurée passe en mineur, puis revient sur mi bémol
const PROG = [
  [0, 'Abmaj9'], [LETTER[0], 'Bb6sus'], [LAND, 'Ebmaj9'], [LAND + 2, 'Cm9'], [LAND + 4, 'Abmaj9'], [LAND + 6, 'Bb6sus'],
  [LAND + 8, 'Ebmaj9'],
];
const loop = (from, to, names) => {
  for (let b = from, k = 0; b < to - 1e-9; b += 2, k++) PROG.push([b, names[k % names.length]]);
};
if (LAND + 10 < S.Name) loop(LAND + 10, S.Name, ['Abmaj9', 'Bb6sus']);
loop(S.Name, S.Homes, ['Ebmaj9', 'Cm9', 'Abmaj9', 'Bb6sus']);
loop(S.Homes, S.Rooms, ['Ebmaj9', 'Gm7', 'Abmaj9', 'Bb6sus']);
loop(S.Rooms, S.Story, ['Ebmaj9', 'Cm9', 'Abmaj9', 'Bb6sus', 'Ebmaj9']);
// la maison restaurée : novembre 2022 en mineur, le séchage qui remonte, décembre 2023 sur mi bémol
PROG.push([ST, 'Cm9'], [ST + 2, 'Abmaj9'], [ST + 4, 'Cm9']);
loop(DRY, DEC, ['Fm9', 'Bb6sus']);
loop(DEC, S.Family, ['Ebmaj9', 'Abmaj9', 'Ebmaj9', 'Bb6sus']);
loop(S.Family, S.Consult, ['Abmaj9', 'Ebmaj9', 'Fm9', 'Bb6sus']);
loop(S.Consult, S.Mobile, ['Ebmaj9', 'Cm9', 'Abmaj9', 'Bb6sus']);
loop(S.Mobile, S.End, ['Ebmaj9', 'Gm7', 'Abmaj9', 'Bb6sus']);
PROG.push([S.End, 'Abmaj9'], [S.End + 2, 'Bb6sus'], [S.End + 4, 'Ebmaj9']);
PROG.sort((a, b) => a[0] - b[0]);
const chordAt = (beat) => {
  let c = PROG[0];
  for (const p of PROG) if (beat >= p[0] - 1e-9) c = p;
  return c;
};

const padGain = (b) => env(b, [
  [0, 0], [0.6, 0.22], [LETTER[0], 0.26], [LAND, 0.34], [CAP, 0.16],
  // la maison restaurée : les cordes reprennent le premier plan pendant la tempête et le séchage
  [ST - 0.5, 0.16], [ST + 0.5, 0.34], [DEC, 0.36], [DEC + 2, 0.17],
  [S.End, 0.26], [S.End + 4, 0.38], [TOTAL_BEATS + 3, 0],
]);

// ——— Cordes : trois sinus par note (fondamentale, octave, douzième), désaccordés en chœur, attaque lente, vibrato léger ———
{
  let cur = null;
  let prev = null;
  let xf = 1;
  const XF = SR * 0.9;
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
          const f = f0 * Math.pow(2, (d * 0.08) / 12);
          const vib = 0.0025 * Math.sin(TAU * (4.6 + k * 0.3) * t + k);
          const ph = f * t * (1 + vib * 0.02) + k * 0.31 + (d > 0 ? 0.5 : 0);
          const x = (0.72 * Math.sin(TAU * ph) + 0.2 * Math.sin(TAU * 2 * ph + 0.4) + 0.08 * Math.sin(TAU * 3 * ph + 1.1)) * w * 0.1;
          if (d < 0) sl += x; else sr += x;
        }
      });
    }
    const a = 0.06;
    lp[0] += (sl - lp[0]) * a;
    lp[1] += (sr - lp[1]) * a;
    TAG = 'cordes';
    add(i, lp[0] * g * MIX.cordes, lp[1] * g * MIX.cordes, 1.1);
  }
}

// ——— Piano feutré : partiels légèrement inharmoniques, deux cordes par note un peu désaccordées, décroissance en deux
// temps (le son direct, puis le son de résonance), un marteau feutré ———
const addPiano = (t0, freq, vel, pan, len = 2.4) => {
  TAG = 'piano';
  const g = vel * MIX.piano;
  const i0 = Math.floor(t0 * SR);
  const inh = 0.00012 * Math.pow(freq / 261.6, 1.2);
  const np = Math.max(2, Math.min(9, Math.floor(8500 / freq)));
  const parts = [];
  for (let k = 1; k <= np; k++) {
    const fk = k * freq * Math.sqrt(1 + inh * k * k);
    const amp = Math.exp(-(k - 1) * (0.62 - 0.3 * Math.min(1, vel * 8))) / k;
    parts.push({w1: (TAU * fk) / SR, w2: (TAU * fk * Math.pow(2, 0.35 / 1200)) / SR, amp, d1: 1.4 + 0.0018 * fk + 0.3 * k, d2: 0.32 + 0.00045 * fk, ph: rnd() * TAU});
  }
  const len2 = Math.floor(SR * len);
  let hammer = 0;
  for (let j = 0; j < len2; j++) {
    const t = j / SR;
    let s = 0;
    for (const p of parts) {
      const e = 0.62 * Math.exp(-t * p.d1) + 0.38 * Math.exp(-t * p.d2);
      s += p.amp * e * 0.5 * (Math.sin(p.w1 * j + p.ph) + Math.sin(p.w2 * j + p.ph * 1.3));
    }
    // le marteau feutré : un bruit sourd de 12 ms
    if (t < 0.012) {
      hammer += (rnd() * 2 - 1 - hammer) * 0.07;
      s += hammer * 0.5 * (1 - t / 0.012);
    }
    s *= g * (t < 0.004 ? t / 0.004 : 1) * (t > len - 0.15 ? Math.max(0, (len - t) / 0.15) : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.5);
  }
};

// ——— Contrebasse pincée : la fondamentale, l'octave et la douzième qui s'éteignent vite, une attaque un peu sourde ———
const addBass = (t0, freq, gain, len) => {
  TAG = 'contrebasse';
  gain *= MIX.contrebasse;
  const i0 = Math.floor(t0 * SR);
  let lp = 0;
  for (let j = 0; j < SR * (len + 0.1); j++) {
    const t = j / SR;
    const bend = 1 + 0.012 * Math.exp(-t * 30);
    const ph = TAU * freq * bend * t;
    let s = Math.sin(ph) + 0.38 * Math.sin(2 * ph) * Math.exp(-t * 7) + 0.14 * Math.sin(3 * ph) * Math.exp(-t * 12);
    if (t < 0.01) { lp += (rnd() * 2 - 1 - lp) * 0.05; s += lp * 0.6; }
    const a = gain * (t < 0.006 ? t / 0.006 : 1) * (0.55 * Math.exp(-t * 3.2) + 0.45 * Math.exp(-t * 0.9)) * (t > len ? Math.max(0, 1 - (t - len) / 0.1) : 1);
    s = Math.tanh(s * 1.2) * a;
    add(i0 + j, s, s, 0.08);
  }
};

// ——— Batterie aux balais ———
const addKick = (t0, gain) => {
  TAG = 'grosse caisse';
  gain *= MIX.kick;
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.4; j++) {
    const t = j / SR;
    const f = 56 + 64 * Math.exp(-t * 28);
    ph += (TAU * f) / SR;
    const s = Math.sin(ph) * Math.exp(-t * 9) * gain * (t < 0.004 ? t / 0.004 : 1);
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
/** les balais sur la caisse claire : un souffle qui frotte (attaque lente), sur le 2 et le 4 */
const addBrush = (t0, gain, pan = 0.42) => {
  TAG = 'balais';
  gain *= MIX.balais;
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.32; j++) {
    const t = j / SR;
    const e = (t < 0.025 ? t / 0.025 : 1) * Math.exp(-t * 11);
    const s = band(st, rnd() * 2 - 1, 3400, 1.1) * e * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.3);
  }
};
/** le charleston : une touche brève et aiguë, à la croche */
const addHat = (t0, gain, pan = 0.66) => {
  TAG = 'charleston';
  gain *= MIX.charleston;
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.05; j++) {
    const t = j / SR;
    const e = (t < 0.002 ? t / 0.002 : 1) * Math.exp(-t * 80);
    const s = band(st, rnd() * 2 - 1, 8200, 0.8) * e * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.1);
  }
};

// ——— Carillon (synthèse FM : un rapport inharmonique, un indice qui s'éteint) pour les gestes ———
const addChime = (t0, freq, gain, pan, len = 3.2) => {
  TAG = 'carillon';
  gain *= MIX.carillon;
  const i0 = Math.floor(t0 * SR);
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    const idx = 2.2 * Math.exp(-t * 2.6) + 0.15;
    const s = Math.sin(TAU * freq * t + idx * Math.sin(TAU * freq * 3.47 * t)) * Math.exp(-t * 1.25) * gain * (t < 0.002 ? t / 0.002 : 1) * (t > len - 0.2 ? (len - t) / 0.2 : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.8);
  }
};

// ——— Partition ———
const at = (b) => b * BEAT;
const isStart = (b, start) => Math.abs(b - start) < 1e-9;
// le groove : la contrebasse et la grosse caisse quand le navigateur se range, les balais avec la légende ; la maison
// restaurée l'arrête (novembre 2022), la contrebasse revient au séchage, tout revient en décembre 2023 ; il s'arrête à la fin
const layer = (b) => {
  if (b < ASIDE) return 0;
  if (b < S.Name) return b < CAP ? 1 : 2;
  if (b >= ST && b < S.Family) return b < DRY ? 0 : b < DEC ? 1 : 3;
  if (b >= S.Rooms && b < ST) return 2;
  if (b < S.End) return 3;
  return 0;
};
// 1 : contrebasse et grosse caisse ; 2 : + balais et piano en accords brisés ; 3 : + charleston
const SWING = 0.045;
const swingT = (b) => {
  const fr = Math.round((b % 1) * 2) / 2;
  return fr === 0.5 ? b + SWING : b;
};

for (let s8 = 0; s8 < TOTAL_BEATS * 2; s8++) {
  const b = s8 / 2;
  const t = at(swingT(b));
  const [start, name] = chordAt(b);
  const c = CH[name];
  const lv = layer(b);
  const bar = ((b % 4) + 4) % 4;
  const inChord = b - start;
  if (lv >= 1) {
    // contrebasse : la fondamentale au changement d'accord, la quinte au temps suivant
    const root = n(c.b);
    if (isStart(b, start)) addBass(t, root, 0.16, BEAT * 0.9);
    else if (Math.abs(inChord - 1) < 1e-9) addBass(t, root * 1.5, 0.11, BEAT * 0.6);
    else if (Math.abs(inChord - 1.5) < 1e-9 && lv >= 3) addBass(t, root * 2, 0.07, BEAT * 0.35);
    // grosse caisse : sur le 1 et le 3, douce
    if (bar === 0) addKick(t, 0.42);
    if (bar === 2) addKick(t, 0.3);
  }
  if (lv >= 2) {
    // balais : sur le 2 et le 4
    if (bar === 1 || bar === 3) addBrush(t, 0.11);
    // piano : l'accord brisé, une note par croche, en haut du médium
    const order = [0, 2, 1, 3, 2, 1, 3, 2];
    const idx = order[s8 % 8];
    addPiano(t, n(c.v[idx]) * 2, isStart(b, start) ? 0.04 : 0.028, 0.36 + 0.08 * (idx % 2), 1.6);
  }
  if (lv >= 3) {
    // charleston : les croches, plus marqué à contretemps
    addHat(t, s8 % 2 ? 0.05 : 0.026);
  }
}

// ——— Les gestes ———
const SCALE = ['Eb4', 'F4', 'G4', 'Bb4', 'C5', 'Eb5', 'F5', 'G5', 'Bb5', 'C6', 'Eb6', 'F6', 'G6', 'Bb6'];

// l'ouverture : une note de piano par lettre du nom, qui monte ; la première photo entre : le carillon ; tout se pose :
// l'accord de mi bémol ; le navigateur se range : deux notes ; la légende : une note de carillon
{
  ['Eb5', 'F5', 'G5', 'Bb5', 'C6'].forEach((nm, k) => addPiano(at(LETTER[k]), n(nm), 0.07, 0.3 + 0.1 * k, 2.6));
  addChime(at(PHOTO0), n('Bb5'), 0.03, 0.62, 3.2);
  CH.Ebmaj9.v.forEach((nm, k) => addPiano(at(LAND) + k * 0.05, n(nm) * 2, 0.045, 0.3 + 0.12 * k, 2.8));
  addPiano(at(LAND), n('Eb3'), 0.05, 0.45, 2.8);
  addPiano(at(ASIDE), n('G5'), 0.045, 0.4, 1.8);
  addPiano(at(ASIDE + 0.5), n('Bb5'), 0.04, 0.6, 1.8);
  addChime(at(CAP), n('Eb6'), 0.02, 0.58, 2.6);
}

// le nom : chaque chantier qui passe devant le nom, une note de piano en haut du clavier (une phrase qui monte et
// redescend) ; « All our jobs are owner supervised » : l'accord s'ouvre, le carillon sonne
{
  const NAME = ['G5', 'Bb5', 'C6', 'Eb6', 'D6', 'Bb5', 'C6', 'Eb6'];
  const seen = new Set();
  NAME.forEach((nm, k) => {
    const f = mark('d-name', `p${k + 1}`, null);
    if (f == null) return;
    // deux photos qui croisent le nom à la même image : un accord de deux notes
    const tt = at(S.Name + fb(f)) + (seen.has(f) ? 0.012 : 0);
    seen.add(f);
    addPiano(tt, n(nm), 0.075, 0.28 + 0.06 * k, 2.4);
  });
  const claim = S.Name + fb(mark('d-name', 'claim', 512));
  addChime(at(claim), n('Eb6'), 0.034, 0.42, 3.4);
  addChime(at(claim) + 0.04, n('Bb5'), 0.026, 0.6, 3.4);
}

// les maisons : la coque et la maison finie se découvrent, deux notes qui montent ; la dernière avec le carillon
{
  const s2 = at(S.Homes + fb(mark('d-homes', 's2', 45)));
  const s3 = at(S.Homes + fb(mark('d-homes', 's3', 156)));
  addPiano(s2, n('Bb5'), 0.07, 0.4, 2.2);
  addPiano(s3, n('Eb6'), 0.075, 0.6, 2.6);
  addChime(s3 + 0.03, n('G6'), 0.018, 0.55, 2.8);
}

// les pièces : la visionneuse s'ouvre (le carillon), une note à chaque photo suivante
{
  const o = at(S.Rooms + fb(mark('d-rooms', 'open', EVENTS.rooms.open * FR)));
  addChime(o, n('Bb5'), 0.032, 0.45, 3.2);
  addPiano(o + 0.02, n('Eb5'), 0.05, 0.5, 2.2);
  addPiano(at(S.Rooms + fb(mark('d-rooms', 'second', EVENTS.rooms.next * FR))), n('G5'), 0.06, 0.55, 2.0);
  addPiano(at(S.Rooms + fb(mark('d-rooms', 'third', EVENTS.rooms.next2 * FR))), n('Bb5'), 0.06, 0.62, 2.0);
}

// la maison restaurée : novembre 2022, une note grave et lente ; le séchage, deux notes qui remontent ; décembre 2023,
// l'accord de mi bémol posé et le carillon
{
  addPiano(at(ST + fb(20)), n('C4'), 0.06, 0.4, 3.2);
  addPiano(at(ST + fb(20)) + 0.012, n('G3'), 0.04, 0.4, 3.2);
  addPiano(at(DRY), n('F5'), 0.06, 0.42, 2.4);
  addPiano(at(DRY + 0.5), n('Ab5'), 0.055, 0.56, 2.4);
  ['Eb5', 'G5', 'Bb5', 'D6'].forEach((nm, k) => addPiano(at(DEC) + k * 0.06, n(nm), 0.06, 0.32 + 0.12 * k, 3.0));
  addChime(at(DEC), n('Eb6'), 0.036, 0.4, 3.6);
  addChime(at(DEC) + 0.05, n('Bb6'), 0.02, 0.62, 3.6);
}

// la famille : la ligne se trace, une note quand elle passe chaque date (1950, 1985, 2014, 2023)
{
  const fam = meta('d-family');
  const line = fam.values?.line || [];
  const NOTES = ['Eb5', 'G5', 'Bb5', 'Eb6'];
  [0.005, 0.25, 0.5, 0.75].forEach((v, k) => {
    const i = line.findIndex((x, j) => x != null && x >= v && j >= (fam.marks?.drawn ?? 0));
    if (i >= 0) addPiano(at(S.Family + fb(i)), n(NOTES[k]), 0.065, 0.3 + 0.13 * k, 2.4);
  });
}

// la consultation : « A new home » (une note), les fourchettes apparaissent (un arpège rapide), la fourchette choisie
// (une note), la demande prête (le carillon et l'accord)
{
  const c = (key, fb0) => at(S.Consult + fb(mark('d-consult', key, fb0)));
  addPiano(c('home', EVENTS.consult.home * FR), n('G5'), 0.06, 0.44, 2.0);
  ['Bb5', 'C6', 'Eb6', 'F6'].forEach((nm, k) => addPiano(c('budgets', EVENTS.consult.home * FR) + 0.1 + k * 0.07, n(nm), 0.032, 0.36 + 0.1 * k, 1.4));
  addPiano(c('budget', EVENTS.consult.budget * FR), n('Bb5'), 0.06, 0.52, 2.0);
  const r = c('ready', EVENTS.consult.go * FR);
  addChime(r, n('Eb6'), 0.034, 0.42, 3.4);
  addChime(r + 0.04, n('G6'), 0.022, 0.6, 3.4);
  ['Eb5', 'G5', 'Bb5', 'Eb6'].forEach((nm, k) => addPiano(r + 0.1 + k * 0.08, n(nm), 0.04, 0.3 + 0.13 * k, 2.0));
}

// au téléphone : les trois téléphones montent (trois notes) ; dans le premier, les lettres du nom montent ; dans le
// deuxième, chaque chantier qui passe devant le nom a sa note
{
  ['Eb5', 'G5', 'Bb5'].forEach((nm, k) => addPiano(at(S.Mobile + fb(k * 8 + 30)), n(nm), 0.05, 0.3 + 0.2 * k, 2.0));
  const mo = meta('m-open');
  const m0 = Math.max(0, (mo.values?.nameT || []).findIndex((v) => v != null && v >= 0));
  ['Bb5', 'C6', 'Eb6', 'F6', 'G6'].forEach((nm, k) => addPiano(at(S.Mobile + fb(PHONE_TIMING.mOpen.delay + m0 + ((100 + 60 * k) * 60) / 1000)), n(nm), 0.024, 0.32, 1.4));
  ['C6', 'Eb6', 'D6', 'Bb5', 'C6'].forEach((nm, k) => {
    const f = mark('m-name', `p${k + 1}`, null);
    if (f != null) addPiano(at(S.Mobile + fb(PHONE_TIMING.mName.delay + f)), n(nm), 0.04, 0.5, 1.8);
  });
}

// la fin : la fenêtre en arc (le carillon), une note par lettre du nom, la cadence posée sur mi bémol
{
  addChime(at(S.End + fb(END.mark)), n('Bb5'), 0.03, 0.5, 3.4);
  ['Eb5', 'F5', 'G5', 'Bb5', 'C6'].forEach((nm, k) => addPiano(at(S.End + fb(END.name + k * 4)), n(nm), 0.07, 0.25 + 0.12 * k, 2.6));
  const t1 = at(S.End + 4);
  for (const [nm, g, pan, dt] of [['Eb6', 0.042, 0.36, 0], ['G6', 0.032, 0.6, 0.03], ['Bb6', 0.026, 0.46, 0.05]]) addChime(t1 + dt, n(nm), g, pan, 5);
  // le piano pose l'accord final, la contrebasse le soutient
  ['Eb3', 'Bb3', 'G4', 'D5', 'F5'].forEach((nm, k) => addPiano(t1 + k * 0.07, n(nm), 0.06 - 0.005 * k, 0.3 + 0.1 * k, 4.6));
  addBass(t1, n('Eb2'), 0.15, 3.6);
  addKick(t1, 0.32);
  // les deux accords d'avant : le piano seul
  for (const [b, nm] of [[S.End, 'Abmaj9'], [S.End + 2, 'Bb6sus']]) CH[nm].v.forEach((v, k) => addPiano(at(b) + k * 0.05, n(v) * 2, 0.04, 0.3 + 0.1 * k, 2.2));
}

// ——— Réverbération (Schroeder : 4 filtres en peigne amortis + 3 passe-tout, par canal), une salle un peu plus grande ———
const reverb = (input, offset) => {
  const out = new Float32Array(N);
  const combs = [1789, 1693, 1571, 1483].map((d) => ({buf: new Float32Array(d + offset), i: 0, lp: 0}));
  const aps = [577, 449, 347].map((d) => ({buf: new Float32Array(d + offset), i: 0}));
  for (let s = 0; s < N; s++) {
    const x = input[s] * 0.5;
    let y = 0;
    for (const c of combs) {
      const v = c.buf[c.i];
      c.lp = v * 0.55 + c.lp * 0.45;
      c.buf[c.i] = x + c.lp * 0.85;
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
  L[i] += wetL[i] * 0.3;
  R[i] += wetR[i] * 0.3;
}

// ——— L'ouverture : tout passe dans un passe-bas fermé, qui s'ouvre pendant que les lettres du nom montent (de la
// première lettre à LAND) ———
{
  const cut = (b) => {
    if (b < LETTER[0]) return 800 + 500 * smooth(b / LETTER[0]);
    if (b < LAND) return 1300 * Math.pow(20000 / 1300, smooth((b - LETTER[0]) / (LAND - LETTER[0])));
    return 20000;
  };
  const s = [[0, 0], [0, 0]];
  const end = Math.ceil(at(LAND) * SR);
  for (let i = 0; i < end; i++) {
    const fc = Math.min(18000, cut(i / SR / BEAT));
    const a = 1 - Math.exp((-TAU * fc) / SR);
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
console.log(`  ouverture : lettres ${LETTER.map((x) => x.toFixed(2)).join(', ')}, photo ${PHOTO0.toFixed(2)}–${PHOTO.toFixed(2)}, posée ${LAND}, légende ${CAP.toFixed(2)} ; maison restaurée : séchage ${(DRY - ST).toFixed(2)}, décembre 2023 ${(DEC - ST).toFixed(2)} (temps de la scène)`);
const dB = (e) => (10 * Math.log10(e / N / 2 + 1e-12)).toFixed(1);
console.log('  énergie par instrument (dB, avant réverbération) : ' + Object.entries(energy).map(([k, e]) => `${k} ${dB(e)}`).join(', '));
