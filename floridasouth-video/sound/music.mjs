// Musique originale de la présentation Florida South Construction, synthétisée de zéro (aucun échantillon, aucun droit
// tiers). 112,5 BPM, en la majeur, une pop ensoleillée et posée : un piano électrique à anches (façon Wurlitzer, en
// synthèse FM, avec son trémolo), une nappe, une basse électrique aux doigts, une batterie légère (grosse caisse douce,
// claquements de doigts, charleston), et un célesta et des cloches pour les gestes. Pas de bruitages : chaque geste
// filmé est souligné d'une note.
// Elle suit le site :
// - l'ouverture : la nappe seule, à travers un filtre fermé, pendant qu'on lit la liste ; les cinq lignes se barrent en
//   croches : cinq notes de célesta qui montent, et le filtre s'ouvre ; « Consider it done. » s'écrit sur le premier
//   temps de la mesure : les cloches, et le groupe entre ;
// - les cadres qui s'ouvrent au défilement (l'étrier, l'ossature, la maison jusqu'aux bords) : une note chacun, la
//   maison a la sienne, plus grande ;
// - la visionneuse : la photo grandit depuis sa vignette, un arpège qui monte au rythme de son ouverture ; la suivante,
//   deux notes ; elle retourne à sa place, l'arpège redescend ;
// - Judson et les avis : le groupe s'allège ; chaque phrase de l'avis de Carol F. a sa note quand son dernier mot
//   s'allume ;
// - la demande : chaque ligne de la liste a sa note quand elle est écrite ; la demande prête, les cloches ;
// - les téléphones : les mêmes gestes, plus doux ;
// - la fin : le groupe s'arrête ; « Consider it done. » s'écrit sur un arpège, et l'accord de la se pose avec
//   l'adresse du site.
// Le son est décalé de 50 ms (3 images) sur l'image : un trait qui commence à se tracer ne se voit qu'après quelques
// images, et un son un peu en retard sur un geste paraît juste, jamais un son en avance.
// Les temps des scènes viennent de src/beats.ts, les repères des gestes de public/site/*.json.
// Usage : node --no-warnings sound/music.mjs  →  public/sfx/music.wav
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCENE_BEATS, OPEN, END, EVENTS, PHONE_TIMING, PICKUP, TIMING, BEAT as FR} from '../src/beats.ts';

const here = dirname(fileURLToPath(import.meta.url));
const SR = 44100;
const BPM = 112.5;
const BEAT = 60 / BPM;
const DELAY = 3 / 60;
const TOTAL_BEATS = SCENE_BEATS.reduce((n, [, b]) => n + b, 0);
const TAIL = 4;
const N = Math.ceil((TOTAL_BEATS * BEAT + DELAY + TAIL) * SR);
// le son direct, et l'envoi vers la réverbération
const L = new Float32Array(N);
const R = new Float32Array(N);
// le bus de la guitare, filtré à part (la caisse de l'instrument)
const GL = new Float32Array(N);
const GR = new Float32Array(N);
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
/** première image d'un plan où une valeur relevée passe sous (ou au-dessus de) un seuil */
const when = (name, key, test, fallback) => {
  const v = meta(name).values?.[key] || [];
  const i = v.findIndex((x) => x != null && test(x));
  return i >= 0 ? i : fallback;
};
/** temps de musique d'une image d'un plan, dans sa scène (plan lu à partir de son image `from`, figé `delay` images) */
const clipBeat = (scene, frame, t = {from: 0, delay: 0}) => S[scene] + fb(frame - t.from + t.delay);

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const n = (name) => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  const base = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]];
  return midi(12 * (Number(m[3]) + 1) + base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0));
};
let seed = 15155320;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const TAU = 2 * Math.PI;
// énergie de chaque instrument, pour vérifier l'équilibre du mélange (affichée à la fin)
const energy = {};
// et par fenêtre de 100 ms : le niveau de chaque instrument quand il joue
const WIN = Math.round(SR * 0.1);
const wins = {};
let TAG = 'nappe';
const add = (i, l, r, send = 0) => {
  if (i < 0 || i >= N) return;
  energy[TAG] = (energy[TAG] || 0) + l * l + r * r;
  (wins[TAG] ||= new Float64Array(Math.ceil(N / WIN)))[Math.floor(i / WIN)] += l * l + r * r;
  if (TAG === 'guitare') { GL[i] += l; GR[i] += r; }
  else { L[i] += l; R[i] += r; }
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
/** courbe cubic-bezier CSS : la fraction du temps où la progression atteint p */
const bezier = (x1, y1, x2, y2) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = (u) => ((ax * u + bx) * u + cx) * u;
  const Y = (u) => ((ay * u + by) * u + cy) * u;
  return (p) => {
    let lo = 0, hi = 1;
    for (let k = 0; k < 60; k++) { const u = (lo + hi) / 2; if (Y(u) < p) lo = u; else hi = u; }
    return X((lo + hi) / 2);
  };
};
// les courbes du site : --ease (la visionneuse) et --ease-io (les traits, « Consider it done. »)
const SITE_EASE = bezier(0.2, 0.7, 0.1, 1);
const SITE_IO = bezier(0.65, 0, 0.35, 1);

// ——— Équilibre des instruments (énergie en dB affichée à la fin) : le piano électrique et le célesta devant, la nappe
// dessous, la basse et la grosse caisse en retrait, les claquements et le charleston discrets ———
const MIX = {nappe: 0.88, wurli: 0.86, celesta: 0.93, cloches: 1.3, basse: 0.69, kick: 0.72, claquement: 0.47, charleston: 0.2, shaker: 0.3, guitare: 0.08};

// ——— Accords, en la majeur ———
// le piano électrique : trois ou quatre notes au médium ; la nappe : quatre voix ; la basse : la fondamentale
const WV = {
  Aadd9: ['E3', 'A3', 'B3', 'C#4'],
  A: ['E3', 'A3', 'C#4', 'E4'],
  'A/C#': ['E3', 'A3', 'C#4', 'E4'],
  'C#m7': ['E3', 'G#3', 'B3', 'C#4'],
  Dmaj7: ['F#3', 'A3', 'C#4', 'E4'],
  E: ['E3', 'G#3', 'B3', 'E4'],
  Esus4: ['E3', 'A3', 'B3', 'E4'],
  'F#m7': ['E3', 'F#3', 'A3', 'C#4'],
  Bm7: ['D3', 'F#3', 'A3', 'B3'],
};
const PV = {
  Aadd9: ['A3', 'B3', 'C#4', 'E4'],
  A: ['A3', 'C#4', 'E4', 'A4'],
  'A/C#': ['A3', 'C#4', 'E4', 'A4'],
  'C#m7': ['G#3', 'B3', 'C#4', 'E4'],
  Dmaj7: ['F#3', 'A3', 'C#4', 'E4'],
  E: ['G#3', 'B3', 'E4', 'G#4'],
  Esus4: ['A3', 'B3', 'E4', 'A4'],
  'F#m7': ['A3', 'C#4', 'E4', 'F#4'],
  Bm7: ['F#3', 'A3', 'B3', 'D4'],
};
// la basse reste au-dessus de 60 Hz, que les petits haut-parleurs rendent : la ligne descend du la (110 Hz) au si (62 Hz)
const ROOT = {Aadd9: 'A2', A: 'A2', 'A/C#': 'C#2', 'C#m7': 'C#2', Dmaj7: 'D2', E: 'E2', Esus4: 'E2', 'F#m7': 'F#2', Bm7: 'B1'};

// ——— Les repères de l'image ———
// L'ouverture : les cinq lignes se barrent (clip d-open, lu à partir de OPEN.from, figé OPEN.delay images) ;
// « Consider it done. » commence à s'écrire 6 images avant le premier temps de la deuxième mesure (temps 6)
const STRIKES = [1, 2, 3, 4, 5].map((k) => clipBeat('Open', mark('d-open', `s${k}`, 22 + 16 * k), TIMING.Open));
const DONE = 6;
{
  const d = clipBeat('Open', mark('d-open', 'done', 128), TIMING.Open);
  if (Math.abs(d - DONE) > 0.3) throw new Error(`« Consider it done. » s'écrit au temps ${d.toFixed(2)}, loin du premier temps ${DONE}`);
}
const ASIDE = fb(OPEN.aside);
const CAP = fb(OPEN.cap);
// la fin : l'emblème, la phrase qui s'écrit, puis l'adresse et l'accord final
const E_MARK = S.End + fb(END.mark);
const E_DONE = S.End + fb(END.done);
const FINAL = S.End + fb(END.url);

// ——— La grille : un accord par mesure, deux sur les mesures qui finissent une phrase ———
const PROG = [
  [0, 'Aadd9'],
  [S.Open + 6, 'A'], [S.Open + 10, 'F#m7'], [S.Open + 14, 'Dmaj7'], [S.Open + 16, 'E'],
  [S.Work, 'A'], [S.Work + 4, 'C#m7'], [S.Work + 8, 'Dmaj7'], [S.Work + 12, 'E'],
  [S.Houses, 'F#m7'], [S.Houses + 4, 'Dmaj7'], [S.Houses + 8, 'A'], [S.Houses + 12, 'Esus4'], [S.Houses + 14, 'E'],
  [S.Judson, 'Dmaj7'], [S.Judson + 4, 'A/C#'], [S.Judson + 8, 'Bm7'], [S.Judson + 12, 'E'],
  [S.Reviews, 'F#m7'], [S.Reviews + 4, 'Dmaj7'], [S.Reviews + 8, 'Esus4'], [S.Reviews + 10, 'E'],
  [S.Estimate, 'A'], [S.Estimate + 4, 'C#m7'], [S.Estimate + 8, 'F#m7'], [S.Estimate + 12, 'Dmaj7'], [S.Estimate + 16, 'E'],
  [S.Mobile, 'A'], [S.Mobile + 4, 'F#m7'], [S.Mobile + 8, 'Dmaj7'], [S.Mobile + 12, 'Esus4'], [S.Mobile + 14, 'E'],
  [S.End, 'Dmaj7'], [FINAL, 'A'],
].sort((a, b) => a[0] - b[0]);
const chordAt = (beat) => {
  let c = PROG[0];
  for (const p of PROG) if (beat >= p[0] - 1e-9) c = p;
  return c;
};
const chordEnd = (start) => {
  const next = PROG.find((p) => p[0] > start + 1e-9);
  return next ? next[0] : TOTAL_BEATS;
};

// le groupe : rien pendant la lecture de la liste ; à « Consider it done. », la basse, la grosse caisse et le piano
// électrique ; avec la légende, les claquements et le charleston ; Judson et les avis, plus léger (sans charleston) ;
// à la fin, plus rien
const layer = (b) => {
  if (b < DONE) return 0;
  if (b < CAP) return 1;
  if (b >= S.Judson && b < S.Estimate) return 2;
  if (b < S.End) return 3;
  return 0;
};

const padGain = (b) => env(b, [
  [0, 0], [0.6, 0.24], [STRIKES[0], 0.26], [DONE, 0.34], [DONE + 1.5, 0.2], [CAP, 0.15],
  [S.Judson - 0.5, 0.15], [S.Judson + 1, 0.22], [S.Estimate - 0.5, 0.22], [S.Estimate + 1, 0.15],
  [S.End - 0.5, 0.15], [S.End + 1, 0.3], [FINAL, 0.36], [TOTAL_BEATS + 3, 0],
]);

// ——— La nappe : trois sinus par note (fondamentale, octave, douzième), désaccordés en chœur, attaque lente, vibrato
// léger, un passe-bas doux ———
{
  let cur = null;
  let prev = null;
  let xf = 1;
  const XF = SR * 0.7;
  const lp = [0, 0];
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const b = (t - DELAY) / BEAT;
    const c = chordAt(b)[1];
    if (c !== cur) { prev = cur; cur = c; xf = prev ? 0 : 1; }
    if (xf < 1) xf = Math.min(1, xf + 1 / XF);
    const g = padGain(b);
    if (g < 1e-4) continue;
    let sl = 0;
    let sr = 0;
    for (const [name, w] of [[cur, Math.sin((xf * Math.PI) / 2)], [prev, Math.cos((xf * Math.PI) / 2)]]) {
      if (!name || w < 1e-3) continue;
      PV[name].forEach((nm, k) => {
        const f0 = n(nm);
        for (const d of [-1, 1]) {
          const f = f0 * Math.pow(2, (d * 0.07) / 12);
          const vib = 0.0025 * Math.sin(TAU * (4.4 + k * 0.3) * t + k);
          const ph = f * t * (1 + vib * 0.02) + k * 0.29 + (d > 0 ? 0.5 : 0);
          const x = (0.74 * Math.sin(TAU * ph) + 0.19 * Math.sin(TAU * 2 * ph + 0.4) + 0.07 * Math.sin(TAU * 3 * ph + 1.1)) * w * 0.1;
          if (d < 0) sl += x; else sr += x;
        }
      });
    }
    const a = 0.05;
    lp[0] += (sl - lp[0]) * a;
    lp[1] += (sr - lp[1]) * a;
    TAG = 'nappe';
    add(i, lp[0] * g * MIX.nappe, lp[1] * g * MIX.nappe, 1.0);
  }
}

// ——— Le piano électrique à anches : FM 1:1 (la brillance de l'attaque qui s'éteint), une pointe de 3:1 pour l'anche,
// une saturation douce qui « aboie » quand on joue fort, et le trémolo de l'instrument, en stéréo ———
const addWurli = (t0, freq, vel, len, pan = 0.5) => {
  TAG = 'wurli';
  const g = vel * MIX.wurli;
  const i0 = Math.floor(t0 * SR);
  const total = Math.floor((len + 0.35) * SR);
  const ph0 = rnd() * TAU;
  const drive = 1.6 + 2.4 * Math.min(1, vel * 6);
  for (let j = 0; j < total; j++) {
    const t = j / SR;
    const idx = (1.0 + 2.0 * Math.min(1, vel * 6)) * Math.exp(-t * 4) + 0.8;
    const reed = 0.32 * Math.exp(-t * 6) + 0.06;
    const w = TAU * freq * t + ph0;
    let s = Math.sin(w + idx * Math.sin(w) + reed * Math.sin(3 * w));
    s = Math.tanh(s * drive * (0.6 + 0.4 * Math.exp(-t * 3))) / Math.tanh(drive);
    const a = (t < 0.004 ? t / 0.004 : 1) * (0.62 * Math.exp(-t * 2.6) + 0.38 * Math.exp(-t * 0.7));
    const rel = t > len ? Math.max(0, 1 - (t - len) / 0.35) : 1;
    // le trémolo : 5,6 Hz, qui balance d'un côté à l'autre
    const trem = 0.14 * Math.sin(TAU * 5.6 * (t0 + t));
    const v = s * a * rel * g;
    add(i0 + j, v * (1 - pan + trem), v * (pan - trem), 0.42);
  }
};

// ——— Célesta : des lames frappées dans leur caisse de résonance, une fondamentale douce et deux partiels brefs ———
const addCelesta = (t0, freq, vel, pan = 0.55, len = 2.6) => {
  TAG = 'celesta';
  const g = vel * MIX.celesta;
  const i0 = Math.floor(t0 * SR);
  let click = 0;
  for (let j = 0; j < Math.floor(len * SR); j++) {
    const t = j / SR;
    let s = Math.sin(TAU * freq * t) * Math.exp(-t * 1.5) + 0.28 * Math.sin(TAU * 2 * freq * t + 0.3) * Math.exp(-t * 4.5) + 0.12 * Math.sin(TAU * 4.07 * freq * t + 1.1) * Math.exp(-t * 11);
    if (t < 0.003) { click += (rnd() * 2 - 1 - click) * 0.4; s += click * 0.25 * (1 - t / 0.003); }
    s *= g * (t < 0.0015 ? t / 0.0015 : 1) * (t > len - 0.25 ? Math.max(0, (len - t) / 0.25) : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.75);
  }
};

// ——— Guitare électrique claire, étouffée : des accords brefs sur les contretemps, comme dans une pop de la côte. Chaque
// corde est un Karplus-Strong (une ligne à retard rebouclée, moyennée, accordée au sous-échantillon par un passe-tout),
// excitée par un bruit filtré (le médiator, vif) ; la paume l'étouffe au bout de quelques centièmes de seconde ———
const GV = {
  Aadd9: ['A3', 'B3', 'C#4', 'E4'],
  A: ['A3', 'C#4', 'E4', 'A4'],
  'A/C#': ['A3', 'C#4', 'E4', 'A4'],
  'C#m7': ['G#3', 'B3', 'C#4', 'E4'],
  Dmaj7: ['A3', 'C#4', 'D4', 'F#4'],
  E: ['G#3', 'B3', 'E4', 'G#4'],
  Esus4: ['A3', 'B3', 'E4', 'A4'],
  'F#m7': ['A3', 'C#4', 'E4', 'F#4'],
  Bm7: ['A3', 'B3', 'D4', 'F#4'],
};
const gNotes = [];
/** un accord étouffé : les quatre cordes aiguës, du grave à l'aigu (coup vers le bas) ou de l'aigu au grave (vers le haut) */
const chank = (t, name, dir, vel, len = 0.11) => {
  const v = GV[name].map((nt, k) => [k, nt]);
  (dir === 'down' ? v : [...v].reverse()).forEach(([k, nt], j) => gNotes.push({t: t + j * 0.007 * (0.85 + 0.3 * rnd()), s: k, f: n(nt), v: vel * (0.9 + 0.2 * rnd()) * (1 - 0.05 * j), len}));
};
const renderGuitar = () => {
  TAG = 'guitare';
  for (const e of gNotes) {
    const i0 = Math.round(e.t * SR);
    const P = SR / e.f;
    const Lb = Math.max(2, Math.floor(P - 0.6));
    const d = P - 0.5 - Lb;
    const C = (1 - d) / (1 + d);
    // l'excitation : un bruit vif, sans composante continue, creusé à la place du médiator (un cinquième de la corde)
    const ex = new Float32Array(Lb);
    let lp = 0;
    for (let k = 0; k < Lb; k++) { lp += 0.72 * (rnd() * 2 - 1 - lp); ex[k] = lp; }
    let mean = 0;
    for (let k = 0; k < Lb; k++) mean += ex[k];
    mean /= Lb;
    const pos = Math.max(1, Math.round(Lb * 0.2));
    const raw = Float32Array.from(ex, (x) => x - mean);
    for (let k = 0; k < Lb; k++) ex[k] = raw[k] - (k >= pos ? raw[k - pos] : 0);
    const size = Lb + 2;
    const y = new Float32Array(size);
    const rho = Math.pow(0.001, 1 / (e.f * 2.2));
    const len = Math.floor((e.len + 0.05) * SR);
    const mute = Math.floor(e.len * SR);
    let w = 0, apX = 0, apY = 0, dcX = 0, dcY = 0;
    const pan = 0.3 + 0.04 * e.s;
    const g = e.v * MIX.guitare;
    for (let j = 0; j < len; j++) {
      let out;
      if (j < Lb) out = ex[j];
      else {
        const avg = 0.5 * (y[(w - Lb + size) % size] + y[(w - Lb - 1 + size) % size]);
        const ap = C * avg + apX - C * apY;
        apX = avg;
        apY = ap;
        // la paume se pose : la corde s'éteint en 50 ms
        out = (j > mute ? rho * Math.exp(-(j - mute) / (0.012 * SR)) : rho) * ap;
      }
      y[w] = out;
      w = (w + 1) % size;
      const hp = out - dcX + 0.995 * dcY;
      dcX = out;
      dcY = hp;
      const s2 = hp * g;
      add(i0 + j, s2 * (1 - pan) * 2, s2 * pan * 2, 0.22);
    }
  }
};

// ——— Cloches (FM : un rapport inharmonique, un indice qui s'éteint) pour les grands moments ———
const addBell = (t0, freq, gain, pan, len = 3.6) => {
  TAG = 'cloches';
  gain *= MIX.cloches;
  const i0 = Math.floor(t0 * SR);
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    const idx = 2.2 * Math.exp(-t * 2.8) + 0.2;
    const s = Math.sin(TAU * freq * t + idx * Math.sin(TAU * freq * 3.5 * t)) * Math.exp(-t * 1.1) * gain * (t < 0.002 ? t / 0.002 : 1) * (t > len - 0.3 ? (len - t) / 0.3 : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.85);
  }
};

// ——— Basse électrique aux doigts : la fondamentale ronde, un peu d'harmoniques à l'attaque, le bruit du doigt ———
const addBass = (t0, freq, gain, len) => {
  TAG = 'basse';
  gain *= MIX.basse;
  const i0 = Math.floor(t0 * SR);
  let lp = 0;
  for (let j = 0; j < SR * (len + 0.08); j++) {
    const t = j / SR;
    const ph = TAU * freq * t;
    let s = Math.sin(ph) + 0.42 * Math.sin(2 * ph) * Math.exp(-t * 9) + 0.18 * Math.sin(3 * ph) * Math.exp(-t * 16) + 0.06 * Math.sin(4 * ph) * Math.exp(-t * 24);
    if (t < 0.008) { lp += (rnd() * 2 - 1 - lp) * 0.08; s += lp * 0.5; }
    const a = gain * (t < 0.005 ? t / 0.005 : 1) * (0.5 * Math.exp(-t * 4) + 0.5 * Math.exp(-t * 0.8)) * (t > len ? Math.max(0, 1 - (t - len) / 0.08) : 1);
    s = Math.tanh(s * 1.1) * a;
    add(i0 + j, s, s, 0.06);
  }
};

// ——— Batterie légère ———
const addKick = (t0, gain) => {
  TAG = 'kick';
  gain *= MIX.kick;
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.4; j++) {
    const t = j / SR;
    const f = 56 + 64 * Math.exp(-t * 30);
    ph += (TAU * f) / SR;
    const s = Math.sin(ph) * Math.exp(-t * 9) * gain * (t < 0.003 ? t / 0.003 : 1);
    add(i0 + j, s, s, 0);
  }
};
const svf = () => ({lp: 0, bp: 0});
const band = (st, x, fc, q) => {
  const k = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6)) / SR);
  const hp = x - st.lp - q * st.bp;
  st.bp += k * hp;
  st.lp += k * st.bp;
  return {bp: st.bp, hp};
};
/** un claquement de doigts sur le 2 et le 4 : un éclat bref, médium-aigu, et un petit corps */
const addSnap = (t0, gain, pan = 0.6) => {
  TAG = 'claquement';
  gain *= MIX.claquement;
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.12; j++) {
    const t = j / SR;
    const e = (t < 0.0012 ? t / 0.0012 : 1) * Math.exp(-t * 48);
    const s = (band(st, rnd() * 2 - 1, 2800, 0.55).bp * 0.9 + 0.35 * Math.sin(TAU * 1250 * t) * Math.exp(-t * 90)) * e * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.35);
  }
};
/** le shaker : un grain de sable bref, aigu, à la double croche */
const addShaker = (t0, gain, pan = 0.36) => {
  TAG = 'shaker';
  gain *= MIX.shaker;
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.07; j++) {
    const t = j / SR;
    const e = (t < 0.006 ? t / 0.006 : 1) * Math.exp(-t * 60);
    const s = band(st, rnd() * 2 - 1, 7000, 0.9).bp * e * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.12);
  }
};
/** le charleston fermé : un souffle aigu, très bref */
const addHat = (t0, gain, pan = 0.66) => {
  TAG = 'charleston';
  gain *= MIX.charleston;
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.06; j++) {
    const t = j / SR;
    const e = (t < 0.001 ? t / 0.001 : 1) * Math.exp(-t * 55);
    const s = band(st, rnd() * 2 - 1, 8200, 0.7).hp * e * gain * 0.6;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.1);
  }
};

// ——— Partition : le groupe ———
const at = (b) => b * BEAT + DELAY;
const atFrame = (scene, frame, t) => at(clipBeat(scene, frame, t));
const near = (a, b) => Math.abs(a - b) < 1e-9;
// le piano électrique : où il frappe dans un accord de quatre temps (temps, durée), et dans un accord de deux temps
const COMP = {
  1: {4: [[0, 3.6]], 2: [[0, 1.8]]},
  2: {4: [[0, 2.2], [2.5, 1.3]], 2: [[0, 1.4], [1.5, 0.4]]},
  3: {4: [[0, 1.1], [1.5, 0.45], [2.5, 0.45], [3.5, 0.4]], 2: [[0, 1.1], [1.5, 0.4]]},
};
// la basse : fondamentale, quinte, octave (rapport à la fondamentale), aux mêmes endroits
const BASS = {
  1: {4: [[0, 1, 1.8], [2, 1.5, 1.6]], 2: [[0, 1, 1.8]]},
  2: {4: [[0, 1, 1.7], [2.5, 1.5, 1.2]], 2: [[0, 1, 1.4]]},
  3: {4: [[0, 1, 0.9], [1.5, 1, 0.35], [2, 1.5, 0.9], [3, 1, 0.4], [3.5, 2, 0.4]], 2: [[0, 1, 0.9], [1, 1.5, 0.4], [1.5, 1, 0.4]]},
};
for (let s16 = 0; s16 < TOTAL_BEATS * 4; s16++) {
  const b = s16 / 4;
  const t = at(b);
  const [start, name] = chordAt(b);
  const lv = layer(b);
  if (!lv) continue;
  // position dans la mesure (les mesures commencent après la levée)
  const bar = (((b - PICKUP) % 4) + 4) % 4;
  const span = Math.round(chordEnd(start) - start) >= 4 ? 4 : 2;
  const inChord = b - start;
  for (const [pos, dur] of COMP[lv][span]) {
    if (!near(inChord, pos)) continue;
    const accent = pos === 0 ? 1 : 0.72;
    WV[name].forEach((nt, k) => addWurli(t + k * 0.004, n(nt), (lv === 1 ? 0.05 : 0.06) * accent * (1 - 0.06 * k), dur * BEAT, 0.42 + 0.06 * k));
  }
  for (const [pos, ratio, dur] of BASS[lv][span]) {
    if (near(inChord, pos)) addBass(t, n(ROOT[name]) * ratio, ratio === 1 ? 0.16 : 0.12, dur * BEAT);
  }
  // grosse caisse : le 1 et le 3, et le « et » du 2 quand tout le groupe joue
  if (near(bar, 0)) addKick(t, 0.42);
  if (near(bar, 2)) addKick(t, 0.3);
  if (lv === 3 && near(bar, 1.5)) addKick(t, 0.2);
  // claquements sur le 2 et le 4
  if (lv >= 2 && (near(bar, 1) || near(bar, 3))) addSnap(t, lv === 3 ? 0.12 : 0.08);
  // charleston : les croches, plus marquées sur les contretemps, et une double croche discrète avant le 4
  if (lv === 3) {
    const pos = bar % 1;
    if (near(pos, 0)) addHat(t, 0.05);
    else if (near(pos, 0.5)) addHat(t, 0.075);
    else if (near(bar, 2.75)) addHat(t, 0.03);
    addShaker(t + (s16 % 2 ? 0.01 : 0), s16 % 4 === 2 ? 0.05 : s16 % 2 ? 0.026 : 0.034);
    // la guitare étouffée : un accord bref sur chaque contretemps, vers le haut, un peu plus marqué sur le 2 et le 4
    if (near(pos, 0.5)) chank(t, name, 'up', near(bar, 1.5) || near(bar, 3.5) ? 0.42 : 0.32);
  }
}

// ——— Les gestes ———
const SCALE = ['A4', 'B4', 'C#5', 'E5', 'F#5', 'A5', 'B5', 'C#6', 'E6', 'F#6', 'A6'];

// l'ouverture : les cinq lignes se barrent (cinq notes qui montent, en croches) ; « Consider it done. » (les cloches,
// sur le premier temps, avec le groupe) ; le navigateur se range (deux notes) ; la légende (une note)
{
  ['A4', 'C#5', 'E5', 'F#5', 'A5'].forEach((nt, k) => addCelesta(at(STRIKES[k]), n(nt), 0.05 + 0.006 * k, 0.36 + 0.07 * k, 2.8));
  addBell(at(DONE), n('C#6'), 0.03, 0.42, 4.2);
  addBell(at(DONE) + 0.05, n('E6'), 0.022, 0.6, 4.2);
  addCelesta(at(DONE), n('A5'), 0.05, 0.5, 3.2);
  addCelesta(at(ASIDE), n('E5'), 0.034, 0.62, 2.2);
  addCelesta(at(ASIDE + 0.5), n('A5'), 0.03, 0.66, 2.2);
  addCelesta(at(CAP), n('C#6'), 0.024, 0.4, 2.6);
}

// les cadres qui s'ouvrent : l'étrier, l'ossature, puis la maison (trois notes qui montent, et les cloches)
{
  const open = (key, f0) => at(S.Work + fb(when('d-work', key, (x) => x <= 0.001, f0)));
  addCelesta(open('small', 132), n('E5'), 0.042, 0.62, 2.4);
  addCelesta(open('mid', 215), n('A5'), 0.044, 0.58, 2.4);
  const h = open('house', 365);
  ['A5', 'C#6', 'E6'].forEach((nt, k) => addCelesta(h + k * 0.09, n(nt), 0.046 - 0.004 * k, 0.4 + 0.1 * k, 2.6));
  addBell(h + 0.18, n('A6'), 0.012, 0.62, 3.2);
}

// la visionneuse : la photo grandit depuis sa vignette (un arpège qui monte au rythme de l'ouverture, 480 ms), la
// suivante arrive (deux notes), la photo retourne à sa place (l'arpège redescend)
const flip = (t0, notes, vel, pan = 0.5, ms = 480, ease = SITE_EASE) =>
  notes.forEach((nt, k) => addCelesta(t0 + ease(Math.min(0.97, k / (notes.length - 1))) * (ms / 1000), n(nt), vel * (1 - 0.05 * k), pan - 0.1 + (0.2 * k) / (notes.length - 1), 2.2));
{
  const v = (key, f0) => at(S.Houses + fb(mark('d-houses', key, f0)));
  flip(v('open', EVENTS.houses.open * FR), ['A4', 'C#5', 'E5', 'A5', 'C#6'], 0.044);
  ['F#5', 'A5'].forEach((nt, k) => addCelesta(v('n2', EVENTS.houses.next * FR) + k * 0.11, n(nt), 0.04, 0.6, 2.2));
  flip(at(S.Houses + EVENTS.houses.close), ['C#6', 'A5', 'E5', 'C#5', 'A4'], 0.04, 0.5, 480);
}

// Judson : le portrait s'ouvre, puis la photo avec l'équipe ; la carte de la licence arrive (les cloches)
{
  const j = (key, f0) => at(S.Judson + fb(when('d-judson', key, (x) => x <= 0.001, f0)));
  addCelesta(j('portrait', 100), n('F#5'), 0.04, 0.4, 2.4);
  addCelesta(j('team', 220), n('A5'), 0.04, 0.6, 2.4);
  const y = meta('d-judson').values?.y || [];
  let stop = y.length - 1;
  while (stop > 0 && y[stop - 1] === y[stop]) stop--;
  const lic = at(S.Judson + fb(y.length ? stop : 371));
  addBell(lic, n('E6'), 0.016, 0.45, 3.4);
  addCelesta(lic, n('B5'), 0.034, 0.55, 2.4);
}

// les avis : chaque phrase de l'avis de Carol F. a sa note quand son dernier mot s'allume (un mot est allumé quand
// --lit dépasse son rang + 1 ; les phrases sont relues dans la page du site)
{
  const html = readFileSync(resolve(here, '../../floridasouth-site/src/index.html'), 'utf8');
  const quote = /<figure class="quote quote--a"[\s\S]*?<p>([\s\S]*?)<\/p>/.exec(html)[1];
  const words = quote.trim().split(/\s+/);
  const ends = words.map((w, i) => (/[.!?][”’"]?$/.test(w) ? i : -1)).filter((i) => i >= 0);
  const notes = ['C#5', 'E5', 'F#5', 'A5', 'C#6'];
  ends.forEach((i, k) => {
    const f = when('d-reviews', 'litA', (x) => x >= i + 1, null);
    if (f === null) return;
    addCelesta(at(S.Reviews + fb(f)), n(notes[Math.min(k, notes.length - 1)]), 0.04, 0.4 + 0.05 * k, 2.6);
  });
}

// la demande : un clic dans la liste (une note grave) ; chaque ligne écrite (sa note, quand son point est tapé) ; la
// demande prête (les cloches, et un arpège)
{
  const est = meta('d-estimate');
  const typed = (est.caret || []).map((c) => (c ? c.typing : null));
  const lineEnd = (count, f0) => {
    const i = typed.findIndex((v) => v != null && v >= count);
    return at(S.Estimate + fb(i >= 0 ? i : f0));
  };
  addWurli(at(S.Estimate + fb(mark('d-estimate', 'focus', EVENTS.estimate.list * FR))), n('E4'), 0.05, 0.5, 0.45);
  [[20, 'E5'], [42, 'F#5'], [63, 'A5']].forEach(([count, nt], k) => addCelesta(lineEnd(count, (EVENTS.estimate.lines + k * EVENTS.estimate.every + 2.2) * FR), n(nt), 0.046, 0.4 + 0.1 * k, 2.4));
  const r = at(S.Estimate + fb(mark('d-estimate', 'ready', EVENTS.estimate.send * FR)));
  addBell(r, n('A5'), 0.026, 0.42, 4);
  addBell(r + 0.05, n('E6'), 0.018, 0.6, 4);
  ['A4', 'C#5', 'E5', 'A5'].forEach((nt, k) => addCelesta(r + 0.08 + k * 0.08, n(nt), 0.036, 0.3 + 0.13 * k, 2.2));
}

// au téléphone : les trois téléphones montent (trois notes) ; au premier, la liste se barre et la phrase s'écrit ; au
// deuxième, le menu s'ouvre, puis « What we do » ; au troisième, la photo grandit, puis glisse vers la suivante
{
  ['E5', 'A5', 'C#6'].forEach((nt, k) => addCelesta(at(S.Mobile + fb(k * 8 + 30)), n(nt), 0.03, 0.3 + 0.2 * k, 2.0));
  const mo = (key, f0) => atFrame('Mobile', mark('m-open', key, f0), PHONE_TIMING.mOpen);
  ['A4', 'C#5', 'E5', 'F#5', 'A5'].forEach((nt, k) => addCelesta(mo(`s${k + 1}`, 22 + 16 * (k + 1)), n(nt), 0.032, 0.3, 2.4));
  // la phrase devient visible quelques images après le début de son masque, comme sur l'ordinateur
  addBell(mo('done', 128) + 6 / 60, n('C#6'), 0.014, 0.32, 3.2);
  const mm = (key, f0) => atFrame('Mobile', mark('m-menu', key, f0), PHONE_TIMING.mMenu);
  addCelesta(mm('menu', EVENTS.mobile.menu * FR), n('B5'), 0.034, 0.5, 2.2);
  addCelesta(mm('closed', EVENTS.mobile.link * FR), n('E5'), 0.034, 0.5, 2.2);
  const mv = (key, f0) => atFrame('Mobile', mark('m-viewer', key, f0), PHONE_TIMING.mViewer);
  flip(mv('open', EVENTS.mobile.photo * FR), ['A4', 'C#5', 'E5', 'A5'], 0.032, 0.68);
  ['F#5', 'A5'].forEach((nt, k) => addCelesta(mv('n2', EVENTS.mobile.swipe * FR + 16) + k * 0.11, n(nt), 0.032, 0.7, 2.2));
}

// la fin : le groupe s'arrête ; l'accord de ré (la nappe, le piano électrique) quand l'emblème paraît ; « Consider it
// done. » s'écrit sur un arpège qui suit son masque (0,85 s, --ease-io) ; l'accord de la se pose avec l'adresse
{
  WV.Dmaj7.forEach((nt, k) => addWurli(at(S.End) + k * 0.006, n(nt), 0.05, 3.2 * BEAT, 0.42 + 0.06 * k));
  addBass(at(S.End), n('D2'), 0.13, 3.4 * BEAT);
  addCelesta(at(E_MARK), n('F#5'), 0.03, 0.5, 2.6);
  ['A4', 'C#5', 'E5', 'F#5', 'A5'].forEach((nt, k) => addCelesta(at(E_DONE) + 0.85 * SITE_IO(0.08 + (0.84 * k) / 4), n(nt), 0.042, 0.34 + 0.08 * k, 3));
  const t1 = at(FINAL);
  WV.A.forEach((nt, k) => addWurli(t1 + k * 0.012, n(nt), 0.058, 4.6, 0.4 + 0.07 * k));
  addBass(t1, n('A2'), 0.16, 4.2);
  addKick(t1, 0.3);
  for (const [nt, g, pan, dt] of [['A5', 0.03, 0.38, 0], ['C#6', 0.024, 0.6, 0.04], ['E6', 0.02, 0.48, 0.08]]) addBell(t1 + dt, n(nt), g, pan, 5);
}

// ——— Filtres ———
const biquad = (type, f0, Q, gainDb = 0) => {
  const A = Math.pow(10, gainDb / 40);
  const w0 = (TAU * f0) / SR;
  const c = Math.cos(w0);
  const alpha = Math.sin(w0) / (2 * Q);
  let b0, b1, b2, a0, a1, a2;
  if (type === 'peak') { b0 = 1 + alpha * A; b1 = -2 * c; b2 = 1 - alpha * A; a0 = 1 + alpha / A; a1 = -2 * c; a2 = 1 - alpha / A; }
  else if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; a0 = 1 + alpha; a1 = -2 * c; a2 = 1 - alpha; }
  else { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; a0 = 1 + alpha; a1 = -2 * c; a2 = 1 - alpha; }
  return {b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0};
};
const filt = (buf, q) => {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < buf.length; i++) {
    const x = buf[i];
    const y = q.b0 * x + q.b1 * x1 + q.b2 * x2 - q.a1 * y1 - q.a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    buf[i] = y;
  }
};

// ——— La guitare, puis sa caisse et son micro : pas de grave, un peu de présence, l'aigu adouci ———
renderGuitar();
for (const q of [biquad('hp', 160, 0.7), biquad('peak', 1200, 0.9, 1.5), biquad('peak', 3200, 1, 2.5), biquad('lp', 9000, 0.7)]) {
  filt(GL, q);
  filt(GR, q);
}
for (let i = 0; i < N; i++) {
  L[i] += GL[i];
  R[i] += GR[i];
}

// ——— Réverbération (Schroeder : 4 filtres en peigne amortis + 3 passe-tout, par canal) ———
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
// pas de grave dans la réverbération : elle brouillerait la basse et la grosse caisse
for (const q of [biquad('hp', 110, 0.7), biquad('hp', 110, 0.7)]) {
  filt(wetL, q);
  filt(wetR, q);
}
for (let i = 0; i < N; i++) {
  L[i] += wetL[i] * 0.26;
  R[i] += wetR[i] * 0.26;
}

// ——— L'ouverture : tout passe dans un passe-bas fermé pendant qu'on lit la liste, qui s'ouvre avec les traits et se
// trouve grand ouvert quand « Consider it done. » s'écrit ———
{
  const cut = (b) => {
    if (b < STRIKES[0]) return 650 + 450 * smooth(clamp01(b / STRIKES[0]));
    if (b < DONE) return 1100 * Math.pow(20000 / 1100, smooth((b - STRIKES[0]) / (DONE - STRIKES[0])));
    return 20000;
  };
  const s = [[0, 0], [0, 0]];
  const end = Math.ceil(at(DONE) * SR);
  for (let i = 0; i < end; i++) {
    const fc = Math.min(18000, cut((i / SR - DELAY) / BEAT));
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
console.log(`  ouverture : traits ${STRIKES.map((b) => b.toFixed(2)).join(', ')} ; phrase ${DONE} ; légende ${CAP.toFixed(2)} (temps)`);
const dB = (e) => (10 * Math.log10(e / N / 2 + 1e-12)).toFixed(1);
console.log('  énergie par instrument (dB, avant réverbération) : ' + Object.entries(energy).map(([k, e]) => `${k} ${dB(e)}`).join(', '));
// le niveau de chaque instrument quand il joue (fenêtres de 100 ms à moins de 30 dB de son maximum) : médiane et maximum,
// en dB, après la normalisation ; c'est ce qui dit si les notes des gestes passent au-dessus du groupe
const lvl = (e) => 10 * Math.log10((e * gain * gain) / WIN / 2 + 1e-12);
console.log('  niveau quand il joue (médiane / max, dB) : ' + Object.entries(wins).map(([k, w]) => {
  const v = [...w].map(lvl);
  const top = Math.max(...v);
  const on = v.filter((x) => x > top - 30).sort((a, b) => a - b);
  return `${k} ${on[Math.floor(on.length / 2)].toFixed(1)} / ${top.toFixed(1)}`;
}).join(', '));
