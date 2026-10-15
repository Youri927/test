// Musique originale de la présentation Five Points Roofing, synthétisée de zéro (aucun échantillon, aucun droit tiers).
// 90 BPM, en ré majeur, chaleureuse et simple, une couleur de la Floride rurale : une guitare acier (cordes pincées,
// synthèse Karplus-Strong, grattée et arpégée), une nappe tenue, une contrebasse pincée, une batterie légère (grosse
// caisse douce, balais, shaker), et un piano feutré et un carillon pour les gestes. Pas de bruitages : chaque geste
// filmé est souligné d'une note.
// Elle suit le site :
// - l'ouverture : la nappe seule, à travers un filtre fermé ; les rampants se tracent des avant-toits au faîte : la
//   guitare monte en arpège, au rythme du tracé, et le filtre s'ouvre ; les mots montent la pente : un accord gratté ;
//   l'étoile se pose : le carillon ; le groupe entre quand tout est posé, les balais avec la légende ;
// - les trois toits : la ligne de toit se trace et la guitare suit son profil, une note par point (elle monte aux
//   pignons, redescend dans la noue) ; les quatre repères arrivent : quatre notes de piano ; chaque onglet choisi a sa
//   figure (la ligne qui s'aplatit descend, le toit plat remonte) ; le repère qui s'allume : le carillon ;
// - la tempête : la batterie se tait, l'accord passe en si mineur, la guitare arpège ; le platelage pourri : une note
//   grave ;
// - les autres gestes (les photos qui se découvrent, les barres des garanties, la ligne de la famille, les choix du
//   formulaire, la demande prête, les téléphones, la rangée qui défile) ont chacun leur note, à l'image près ;
// - la fin : le groupe s'arrête ; le toit revient : l'arpège qui monte, l'accord, le carillon de l'étoile, et la
//   cadence se pose sur ré quand l'adresse du site apparaît.
// Les temps des scènes viennent de src/beats.ts, les repères des gestes de public/site/*.json.
// Usage : node --no-warnings sound/music.mjs  →  public/sfx/music.wav
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SCENE_BEATS, OPEN, EVENTS, END, PHONE_TIMING, BEAT as FR} from '../src/beats.ts';

const here = dirname(fileURLToPath(import.meta.url));
const SR = 44100;
const BPM = 90;
const BEAT = 60 / BPM;
const TOTAL_BEATS = SCENE_BEATS.reduce((n, [, b]) => n + b, 0);
const TAIL = 4;
const N = Math.ceil((TOTAL_BEATS * BEAT + TAIL) * SR);
// le son direct, le bus de la guitare (filtré à part : la caisse de l'instrument), et l'envoi vers la réverbération
const L = new Float32Array(N);
const R = new Float32Array(N);
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

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const n = (name) => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  const base = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]];
  return midi(12 * (Number(m[3]) + 1) + base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0));
};
let seed = 19552021;
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
// les courbes du site : --ease (rampants, mots, étoile) et le tracé de la ligne de toit (main.js)
const SITE_EASE = bezier(0.2, 0.7, 0.1, 1);
const DRAW_EASE = bezier(0.45, 0, 0.2, 1);

// ——— Équilibre des instruments (énergie en dB affichée à la fin) : la guitare et le piano devant, la nappe dessous, la
// contrebasse et la grosse caisse en retrait, les balais et le shaker discrets ———
const MIX = {nappe: 0.78, guitare: 0.125, piano: 1.0, contrebasse: 0.72, kick: 0.7, balais: 0.62, shaker: 0.3, carillon: 0.95};

// ——— Accords, en ré majeur ———
// la guitare : ce qui sonne sur chaque corde, de la 6e (mi grave) à la 1re (mi aigu), null pour une corde étouffée
const GV = {
  Dadd9: [null, null, 'D3', 'A3', 'D4', 'E4'],
  D: [null, null, 'D3', 'A3', 'D4', 'F#4'],
  'D/F#': ['F#2', null, 'D3', 'A3', 'D4', 'F#4'],
  G: ['G2', 'B2', 'D3', 'G3', 'D4', 'G4'],
  Gmaj7: ['G2', 'B2', 'D3', 'G3', 'B3', 'F#4'],
  A: [null, 'A2', 'E3', 'A3', 'C#4', 'E4'],
  Asus4: [null, 'A2', 'E3', 'A3', 'D4', 'E4'],
  Bm: [null, 'B2', 'F#3', 'B3', 'D4', 'F#4'],
  Bm7: [null, 'B2', 'F#3', 'A3', 'D4', 'F#4'],
  Em7: ['E2', 'B2', 'D3', 'G3', 'D4', 'G4'],
};
// la nappe : quatre voix au médium ; la contrebasse : la fondamentale, au-dessus de 60 Hz
const PV = {
  Dadd9: ['A3', 'D4', 'E4', 'F#4'],
  D: ['A3', 'D4', 'F#4', 'A4'],
  'D/F#': ['A3', 'D4', 'F#4', 'A4'],
  G: ['G3', 'B3', 'D4', 'G4'],
  Gmaj7: ['G3', 'B3', 'D4', 'F#4'],
  A: ['A3', 'C#4', 'E4', 'A4'],
  Asus4: ['A3', 'D4', 'E4', 'A4'],
  Bm: ['B3', 'D4', 'F#4', 'B4'],
  Bm7: ['A3', 'B3', 'D4', 'F#4'],
  Em7: ['G3', 'B3', 'D4', 'E4'],
};
const ROOT = {Dadd9: 'D2', D: 'D2', 'D/F#': 'F#2', G: 'G2', Gmaj7: 'G2', A: 'A2', Asus4: 'A2', Bm: 'B1', Bm7: 'B1', Em7: 'E2'};

// ——— Les repères de l'image ———
// L'ouverture (scène Open) : la page telle qu'elle s'affiche jusqu'à HOLD ; les rampants se tracent à partir de RAKES
// (1 s), les mots montent 0,3 s après, l'étoile se pose 0,75 s après ; tout est posé à LAND ; le navigateur se range à
// ASIDE, la légende entre à CAP
const open = meta('d-open');
const F0 = Math.max(0, (open.values?.lineT || []).findIndex((v) => v != null && v >= 0));
const RAKES = fb(OPEN.hold + F0);
const WORDS = RAKES + 0.3 / BEAT;
const STAR = RAKES + 0.75 / BEAT;
const LAND = 4;
const ASIDE = fb(OPEN.aside);
const CAP = fb(OPEN.cap);
// les trois toits : le dessin qui se trace, les deux clics, le repère qui s'allume
const DRAW = S.Roofs + fb(mark('d-roofs', 'draw', 29));
const TAB1 = S.Roofs + EVENTS.roofs.mobile;
const TAB2 = S.Roofs + EVENTS.roofs.commercial;
const HOT = S.Roofs + fb(mark('d-roofs', 'hot', EVENTS.roofs.hover * FR - 10));
// la fin : les rampants, les mots, l'étoile (aux temps du site), puis l'adresse et l'accord final
const E_RAKES = S.End + fb(END.rakes);
const E_WORDS = E_RAKES + 0.3 / BEAT;
const E_STAR = E_RAKES + 0.75 / BEAT;
const FINAL = S.End + 4;

// ——— La grille : deux temps par accord dans le groupe, une mesure par accord sous le dessin des toits ———
const PROG = [
  [0, 'Dadd9'], [LAND, 'D'], [6, 'G'], [8, 'Bm7'], [10, 'A'],
  [S.Roofs, 'D'], [S.Roofs + 4, 'Bm7'], [S.Roofs + 8, 'G'], [S.Roofs + 12, 'Em7'], [S.Roofs + 14, 'A'],
  // la tempête : en si mineur
  [S.Storm, 'Bm'], [S.Storm + 2, 'G'], [S.Storm + 4, 'Em7'], [S.Storm + 6, 'Asus4'], [S.Storm + 7, 'A'],
  [S.Job, 'D'], [S.Job + 2, 'G'], [S.Job + 4, 'D/F#'], [S.Job + 6, 'A'],
  [S.Warranty, 'G'], [S.Warranty + 2, 'D'], [S.Warranty + 4, 'A'], [S.Warranty + 6, 'Bm7'],
  [S.Family, 'Gmaj7'], [S.Family + 2, 'D'], [S.Family + 4, 'Em7'], [S.Family + 6, 'A'],
  [S.Estimate, 'D'], [S.Estimate + 2, 'Bm7'], [S.Estimate + 4, 'G'], [S.Estimate + 6, 'A'], [S.Estimate + 8, 'D'], [S.Estimate + 10, 'Asus4'], [S.Estimate + 11, 'A'],
  [S.Mobile, 'D'], [S.Mobile + 2, 'G'], [S.Mobile + 4, 'Bm7'], [S.Mobile + 6, 'A'], [S.Mobile + 8, 'G'], [S.Mobile + 10, 'Asus4'], [S.Mobile + 11, 'A'],
  [S.End, 'Gmaj7'], [S.End + 2, 'Asus4'], [FINAL, 'D'],
].sort((a, b) => a[0] - b[0]);
const chordAt = (beat) => {
  let c = PROG[0];
  for (const p of PROG) if (beat >= p[0] - 1e-9) c = p;
  return c;
};

// le groupe : la contrebasse, la grosse caisse et la guitare grattée quand tout est posé (LAND), les balais au temps 8,
// le shaker avec les toits ; la tempête n'a que la grosse caisse, la contrebasse et la guitare arpégée ; les garanties
// et la famille, sans shaker ; à la fin, plus rien
const layer = (b) => {
  if (b < LAND) return 0;
  if (b < 8) return 1;
  if (b < S.Roofs) return 2;
  if (b >= S.Storm && b < S.Job) return 'storm';
  if (b >= S.Warranty && b < S.Estimate) return 2;
  if (b < S.End) return 3;
  return 0;
};

const padGain = (b) => env(b, [
  [0, 0], [0.7, 0.2], [RAKES, 0.22], [STAR + 0.5, 0.32], [LAND + 0.5, 0.2], [CAP, 0.16],
  // le dessin des toits : la maison apparaît sous la ligne
  [DRAW, 0.15], [DRAW + 1.2, 0.22], [DRAW + 3, 0.15],
  // la tempête : la nappe passe devant
  [S.Storm - 0.5, 0.15], [S.Storm + 0.6, 0.34], [S.Job - 0.6, 0.3], [S.Job + 0.4, 0.15],
  [S.End - 0.5, 0.15], [S.End + 1, 0.3], [FINAL, 0.36], [TOTAL_BEATS + 3, 0],
]);

// ——— La nappe : trois sinus par note (fondamentale, octave, douzième), désaccordés en chœur, attaque lente, vibrato
// léger, un passe-bas doux ———
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
    const a = 0.055;
    lp[0] += (sl - lp[0]) * a;
    lp[1] += (sr - lp[1]) * a;
    TAG = 'nappe';
    add(i, lp[0] * g * MIX.nappe, lp[1] * g * MIX.nappe, 1.1);
  }
}

// ——— La guitare acier : chaque corde est un Karplus-Strong (une ligne à retard rebouclée, moyennée, accordée au
// sous-échantillon par un passe-tout), excitée par un bruit filtré (le médiator) ; une corde rejouée ou étouffée
// s'arrête net, comme sous les doigts ———
const gNotes = [];
// deux guitares : la rythmique (cordes 0 à 5, de la 6e à la 1re) et une seconde pour les phrases des gestes (cordes 6 à
// 11, un peu à droite), pour que ses notes sonnent jusqu'au bout sous les accords grattés
const LEAD = 6;
/** une corde pincée : `s` de 0 (6e corde, grave) à 5 (1re), +LEAD pour la seconde guitare ; `b` : la brillance du médiator */
const pick = (t, s, note, v, b = 0.5) => gNotes.push({t: t + (rnd() - 0.5) * 0.006, s, f: n(note), v: v * (0.92 + 0.16 * rnd()), b});
/** une corde étouffée à t (la main gauche qui la lâche, la paume qui la couvre) */
const mute = (t, s) => gNotes.push({t, s, mute: true});
/** un coup de médiator sur l'accord : vers le bas, des graves aux aigus ; vers le haut, les quatre cordes aiguës */
const strum = (t, name, dir, vel) => {
  const v = GV[name];
  const strings = v.map((nt, s) => [s, nt]).filter(([, nt]) => nt);
  const order = dir === 'down' ? strings : strings.slice(-4).reverse();
  const gap = dir === 'down' ? 0.011 : 0.008;
  order.forEach(([s, nt], j) => pick(t + j * gap * (0.85 + 0.3 * rnd()), s, nt, vel * (dir === 'down' ? 1 - 0.04 * j : 0.62), dir === 'down' ? 0.48 : 0.62));
  // les cordes que l'accord ne joue pas se taisent
  v.forEach((nt, s) => { if (!nt) mute(t, s); });
};
const renderGuitar = () => {
  TAG = 'guitare';
  const byString = Array.from({length: 12}, () => []);
  for (const e of gNotes) byString[e.s].push(e);
  for (const list of byString) {
    list.sort((a, b) => a.t - b.t);
    list.forEach((e, k) => {
      if (e.mute) return;
      const next = list.slice(k + 1).find((x) => x.t > e.t + 0.005);
      const dur = Math.min(4.5, next ? next.t - e.t + 0.012 : 4.5);
      const i0 = Math.round(e.t * SR);
      const P = SR / e.f;
      const Lb = Math.max(2, Math.floor(P - 0.6));
      const d = P - 0.5 - Lb;
      const C = (1 - d) / (1 + d);
      // l'excitation : un bruit adouci (plus le coup est doux, plus il est sourd), sans composante continue, creusé à la
      // place du médiator (un cinquième de la corde)
      const ex = new Float32Array(Lb);
      let lp = 0;
      const a = 0.1 + 0.75 * e.b * (0.6 + 0.4 * Math.min(1, e.v * 3));
      for (let k2 = 0; k2 < Lb; k2++) { lp += a * (rnd() * 2 - 1 - lp); ex[k2] = lp; }
      let mean = 0;
      for (let k2 = 0; k2 < Lb; k2++) mean += ex[k2];
      mean /= Lb;
      const pos = Math.max(1, Math.round(Lb * 0.2));
      const raw = Float32Array.from(ex, (x) => x - mean);
      for (let k2 = 0; k2 < Lb; k2++) ex[k2] = raw[k2] - (k2 >= pos ? raw[k2 - pos] : 0);
      // sans composante continue après le creux non plus : la boucle la garderait des secondes (et la réverbération la
      // gonflerait en grondement)
      let mean2 = 0;
      for (let k2 = 0; k2 < Lb; k2++) mean2 += ex[k2];
      mean2 /= Lb;
      for (let k2 = 0; k2 < Lb; k2++) ex[k2] -= mean2;
      // l'extinction : les cordes graves sonnent plus longtemps
      const T60 = 2.2 + 3.2 * Math.min(1, 150 / e.f);
      const rho = Math.pow(0.001, 1 / (e.f * T60));
      const size = Lb + 2;
      const y = new Float32Array(size);
      const len = Math.floor(dur * SR);
      const fade = Math.floor(0.012 * SR);
      let w = 0;
      let apX = 0;
      let apY = 0;
      // un coupe-continu (passe-haut à 20 Hz) à la sortie de la corde
      let dcX = 0;
      let dcY = 0;
      const pan = e.s < LEAD ? 0.34 + 0.035 * e.s : 0.58 + 0.02 * (e.s - LEAD);
      const g = e.v * MIX.guitare;
      for (let j = 0; j < len; j++) {
        let out;
        if (j < Lb) out = ex[j];
        else {
          const avg = 0.5 * (y[(w - Lb + size) % size] + y[(w - Lb - 1 + size) % size]);
          const ap = C * avg + apX - C * apY;
          apX = avg;
          apY = ap;
          out = rho * ap;
        }
        y[w] = out;
        w = (w + 1) % size;
        const hp = out - dcX + 0.9972 * dcY;
        dcX = out;
        dcY = hp;
        const k3 = j > len - fade ? (len - j) / fade : 1;
        const s = hp * g * k3;
        add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.32);
      }
    });
  }
};

// ——— Piano feutré : partiels légèrement inharmoniques, deux cordes par note un peu désaccordées, décroissance en deux
// temps, un marteau feutré ———
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
    if (t < 0.012) {
      hammer += (rnd() * 2 - 1 - hammer) * 0.07;
      s += hammer * 0.5 * (1 - t / 0.012);
    }
    s *= g * (t < 0.004 ? t / 0.004 : 1) * (t > len - 0.15 ? Math.max(0, (len - t) / 0.15) : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.5);
  }
};

// ——— Contrebasse pincée ———
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

// ——— Batterie légère ———
const addKick = (t0, gain) => {
  TAG = 'grosse caisse';
  gain *= MIX.kick;
  const i0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.4; j++) {
    const t = j / SR;
    const f = 54 + 62 * Math.exp(-t * 28);
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
const addBrush = (t0, gain, pan = 0.58) => {
  TAG = 'balais';
  gain *= MIX.balais;
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.3; j++) {
    const t = j / SR;
    const e = (t < 0.022 ? t / 0.022 : 1) * Math.exp(-t * 12);
    const s = band(st, rnd() * 2 - 1, 3200, 1.1) * e * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.3);
  }
};
/** le shaker : un grain de sable bref, aigu, à la croche */
const addShaker = (t0, gain, pan = 0.7) => {
  TAG = 'shaker';
  gain *= MIX.shaker;
  const i0 = Math.floor(t0 * SR);
  const st = svf();
  for (let j = 0; j < SR * 0.08; j++) {
    const t = j / SR;
    const e = (t < 0.007 ? t / 0.007 : 1) * Math.exp(-t * 55);
    const s = band(st, rnd() * 2 - 1, 7400, 0.9) * e * gain;
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.12);
  }
};

// ——— Carillon (synthèse FM : un rapport inharmonique, un indice qui s'éteint) pour les gestes ———
const addChime = (t0, freq, gain, pan, len = 3.2) => {
  TAG = 'carillon';
  gain *= MIX.carillon;
  const i0 = Math.floor(t0 * SR);
  for (let j = 0; j < SR * len; j++) {
    const t = j / SR;
    const idx = 2.0 * Math.exp(-t * 2.6) + 0.15;
    const s = Math.sin(TAU * freq * t + idx * Math.sin(TAU * freq * 3.47 * t)) * Math.exp(-t * 1.3) * gain * (t < 0.002 ? t / 0.002 : 1) * (t > len - 0.2 ? (len - t) / 0.2 : 1);
    add(i0 + j, s * (1 - pan) * 2, s * pan * 2, 0.8);
  }
};

// ——— Partition : le groupe ———
const at = (b) => b * BEAT;
const isStart = (b, start) => Math.abs(b - start) < 1e-9;
// le coup de médiator de la mesure, à la croche : bas, bas-haut, haut-bas-haut (null : rien) ; plus léger sur les
// garanties et la famille : bas, haut, bas, haut
const STRUM = [['down', 1], null, ['down', 0.72], ['up', 0.5], null, ['up', 0.5], ['down', 0.7], ['up', 0.46]];
const STRUM_LIGHT = [['down', 0.9], null, null, ['up', 0.42], ['down', 0.66], null, null, ['up', 0.4]];
// pendant que le dessin des toits se trace, la guitare grattée se tait : la phrase de la ligne de toit et les repères
// s'entendent seuls sur la contrebasse et la batterie
const MR = S.Mobile + fb(PHONE_TIMING.mRoofs.delay + mark('m-roofs', 'draw', 75));
const quiet = (b) => (b >= DRAW - 0.25 && b < DRAW + 2.75) || (b >= MR - 0.25 && b < MR + 2.75);
for (let s8 = 0; s8 < TOTAL_BEATS * 2; s8++) {
  const b = s8 / 2;
  const t = at(b);
  const [start, name] = chordAt(b);
  const lv = layer(b);
  const bar = ((b % 4) + 4) % 4;
  const inChord = b - start;
  const root = n(ROOT[name]);
  if (lv === 'storm') {
    // la tempête : la contrebasse tient la fondamentale, la grosse caisse marque le premier temps ; la guitare arpège
    if (isStart(b, start)) addBass(t, root, 0.15, BEAT * 1.8);
    if (bar === 0) addKick(t, 0.34);
    const v = GV[name].map((nt, s) => [s, nt]).filter(([, nt]) => nt);
    const seq = [0, 2, 1, 3, 4, 3, 2, 3].map((k) => v[Math.min(v.length - 1, k + (v.length >= 6 ? 1 : 0))]);
    const [s, nt] = seq[s8 % 8];
    pick(t + 0.008, s, nt, s8 % 2 ? 0.34 : 0.42, 0.42);
    if (isStart(b, start)) GV[name].forEach((x, s2) => { if (!x) mute(t, s2); });
    continue;
  }
  if (lv >= 1) {
    // contrebasse : la fondamentale au changement d'accord, la quinte au temps d'après (ou au 3e temps d'une mesure entière)
    const long = chordAt(start + 2.01)[0] === start;
    if (isStart(b, start)) addBass(t, root, 0.15, BEAT * 0.9);
    else if (Math.abs(inChord - (long ? 2 : 1)) < 1e-9) addBass(t, root * 1.5, 0.1, BEAT * 0.6);
    else if (lv >= 3 && Math.abs(inChord - (long ? 3.5 : 1.5)) < 1e-9) addBass(t, root * 2, 0.06, BEAT * 0.3);
    // grosse caisse : sur le 1 et le 3, douce
    if (bar === 0) addKick(t, 0.4);
    if (bar === 2) addKick(t, 0.28);
    // la guitare grattée
    const light = b >= S.Warranty && b < S.Estimate;
    const st = (light ? STRUM_LIGHT : STRUM)[s8 % 8];
    if (st && !quiet(b)) strum(t, name, st[0], st[1] * (lv === 1 ? 0.55 : 0.75));
    // la reprise après le silence : les cordes encore tenues se taisent à l'entrée du dessin
    if (quiet(b) && !quiet(b - 0.5)) GV[name].forEach((x, s2) => mute(t, s2));
  }
  if (lv >= 2 && (bar === 1 || bar === 3)) addBrush(t, 0.1);
  if (lv >= 3) addShaker(t + (s8 % 2 ? 0.012 : 0), s8 % 2 ? 0.05 : 0.03);
}

// ——— Les gestes ———
const SCALE = ['A4', 'B4', 'D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6', 'A6'];

// l'ouverture : les rampants se tracent (un arpège de guitare qui monte, au rythme du tracé : vite au départ, posé à
// l'arrivée) ; les mots montent la pente (un accord gratté) ; l'étoile se pose (le carillon) ; tout est posé (le groupe
// entre) ; le navigateur se range (deux notes de piano) ; la légende (une note de carillon)
{
  ['D3', 'A3', 'D4', 'F#4', 'A4'].forEach((nt, k) => {
    const tt = at(RAKES) + SITE_EASE(Math.min(0.96, k / 4)) * 1.0;
    pick(tt, LEAD + Math.min(5, 1 + k), nt, 0.5, 0.55);
  });
  strum(at(WORDS), 'Dadd9', 'down', 0.42);
  addChime(at(STAR), n('A5'), 0.03, 0.58, 3.4);
  addChime(at(STAR) + 0.07, n('D6'), 0.022, 0.42, 3.4);
  addPiano(at(LAND), n('D3'), 0.05, 0.45, 2.6);
  addPiano(at(ASIDE), n('F#5'), 0.042, 0.62, 1.8);
  addPiano(at(ASIDE + 0.5), n('A5'), 0.038, 0.66, 1.8);
  addChime(at(CAP), n('E6'), 0.018, 0.4, 2.6);
}

// les trois toits : la ligne de toit se trace, une note de guitare à chaque point de la ligne (aux pignons elle monte,
// dans la noue elle redescend) ; les quatre repères tombent un à un (le piano) ; « Mobile homes » : la ligne
// s'aplatit (trois notes qui descendent) ; « Commercial » : le toit plat et ses acrotères (trois notes qui remontent) ;
// le repère qui s'allume : le carillon
const roofline = (b0, vel) => {
  const P = [[90, 250], [230, 180], [300, 215], [470, 130], [590, 190], [650, 220], [710, 250]];
  const seg = P.slice(1).map(([x, y], k) => Math.hypot(x - P[k][0], y - P[k][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let acc = 0;
  P.forEach(([, y], k) => {
    if (k) acc += seg[k - 1];
    const p = Math.min(0.97, acc / total);
    const tt = at(b0) + DRAW_EASE(p) * 1.3;
    const step = Math.round((250 - y) / 20);
    pick(tt, LEAD + 3 + (step > 3 ? 2 : step > 1 ? 1 : 0), SCALE[Math.min(SCALE.length - 1, step)], vel, 0.66);
  });
};
const pins = (b0, vel, pan = 0.6) => ['B5', 'D6', 'E6', 'F#6'].forEach((nt, k) => addPiano(at(b0) + 1.05 + k * 0.13 + 0.05, n(nt), vel, pan - 0.06 * k, 1.8));
{
  roofline(DRAW, 0.8);
  pins(DRAW, 0.04);
  addPiano(at(TAB1), n('D5'), 0.05, 0.4, 2.0);
  ['D6', 'B5', 'F#5'].forEach((nt, k) => addPiano(at(TAB1) + 0.12 + k * 0.24, n(nt), 0.034, 0.55, 1.6));
  addPiano(at(TAB2), n('G4'), 0.05, 0.4, 2.0);
  ['B4', 'D5', 'G5'].forEach((nt, k) => addPiano(at(TAB2) + 0.12 + k * 0.24, n(nt), 0.034, 0.55, 1.6));
  addChime(at(HOT) + 0.05, n('D6'), 0.026, 0.62, 3.0);
  addChime(at(HOT) + 0.11, n('B5'), 0.016, 0.5, 3.0);
}

// la tempête : le platelage pourri se découvre, une note grave et lente
{
  const w = S.Storm + fb(mark('d-storm', 'wipe', 38));
  addPiano(at(w), n('B2'), 0.055, 0.42, 3.4);
  addPiano(at(w) + 0.014, n('F#3'), 0.04, 0.46, 3.4);
  addPiano(at(w) + 0.03, n('D4'), 0.03, 0.5, 3.2);
}

// les chantiers : les quatre photos se découvrent l'une après l'autre (0,12 s d'écart), quatre notes qui montent
{
  const j = S.Job + fb(mark('d-job', 'j1', 102));
  ['D5', 'G5', 'B5', 'D6'].forEach((nt, k) => addPiano(at(j) + k * 0.12, n(nt), 0.058, 0.32 + 0.12 * k, 2.2));
}

// les garanties : la photo du toit neuf (une note de carillon), puis les trois barres de la règle (10, 20, de 30 ans à
// vie), trois notes qui montent
{
  addChime(at(S.Warranty + fb(mark('d-warranty', 'wipe', 34))), n('B5'), 0.02, 0.6, 2.8);
  const r = S.Warranty + fb(mark('d-warranty', 'ruler', 131));
  ['D5', 'F#5', 'A5'].forEach((nt, k) => addPiano(at(r) + k * 0.12, n(nt), 0.06, 0.36 + 0.14 * k, 2.4));
  addChime(at(r) + 0.24 + 0.1, n('D6'), 0.014, 0.66, 2.6);
}

// la famille : la ligne de 1955 se trace, une note pour chaque date qui se pose (0, 0,45 et 0,9 s)
{
  const l = S.Family + fb(mark('d-family', 'line', 35));
  ['D5', 'F#5', 'A5'].forEach((nt, k) => addPiano(at(l) + k * 0.45 + 0.04, n(nt), 0.062, 0.3 + 0.18 * k, 2.4));
}

// l'estimation : « A mobile home » et « Repair » (deux notes), le bouton qui se remplit d'or au survol (une note de
// carillon), la demande prête (le carillon, l'accord, et le piano qui monte)
{
  const c = (key, f0) => at(S.Estimate + fb(mark('d-estimate', key, f0)));
  addPiano(c('kind', EVENTS.estimate.kind * FR), n('D5'), 0.058, 0.42, 2.0);
  addPiano(c('need', EVENTS.estimate.need * FR), n('F#5'), 0.058, 0.54, 2.0);
  addChime(c('hover', 297) + 0.08, n('E6'), 0.012, 0.6, 2.2);
  const r = c('ready', EVENTS.estimate.go * FR);
  addChime(r, n('D6'), 0.032, 0.42, 3.4);
  addChime(r + 0.05, n('F#6'), 0.02, 0.6, 3.4);
  ['D5', 'F#5', 'A5', 'D6'].forEach((nt, k) => addPiano(r + 0.1 + k * 0.09, n(nt), 0.04, 0.3 + 0.13 * k, 2.0));
}

// au téléphone : les trois téléphones montent (trois notes) ; dans le deuxième, le dessin se trace (la même phrase de
// guitare, plus douce) et le pouce choisit « Commercial » ; dans le troisième, la rangée défile et deux photos se
// découvrent
{
  ['D5', 'F#5', 'A5'].forEach((nt, k) => addPiano(at(S.Mobile + fb(k * 8 + 30)), n(nt), 0.045, 0.3 + 0.2 * k, 2.0));
  roofline(MR, 0.42);
  pins(MR, 0.026, 0.52);
  const tap = S.Mobile + fb(PHONE_TIMING.mRoofs.delay + mark('m-roofs', 'commercial', EVENTS.mobile.commercial * FR));
  addPiano(at(tap), n('F#5'), 0.048, 0.5, 2.0);
  addChime(at(tap) + 0.4, n('B5'), 0.014, 0.5, 2.4);
  const mj = (key, f0) => at(S.Mobile + fb(PHONE_TIMING.mJob.delay + mark('m-job', key, f0)));
  addPiano(mj('j3', EVENTS.mobile.swipe * FR + 22), n('B5'), 0.046, 0.62, 2.0);
  addPiano(mj('j4', EVENTS.mobile.swipe * FR + 50), n('D6'), 0.046, 0.68, 2.0);
}

// la fin : les rampants se tracent (l'arpège qui monte, sur sol), les mots montent (un accord), l'étoile se pose (le
// carillon), puis la cadence se pose sur ré avec l'adresse du site
{
  ['G2', 'D3', 'G3', 'B3', 'F#4'].forEach((nt, k) => {
    const tt = at(E_RAKES) + SITE_EASE(Math.min(0.96, k / 4)) * 1.0;
    pick(tt, LEAD + [0, 2, 3, 4, 5][k], nt, 0.5, 0.55);
  });
  strum(at(E_WORDS), 'Gmaj7', 'down', 0.4);
  addChime(at(E_STAR), n('A5'), 0.03, 0.58, 3.4);
  addChime(at(E_STAR) + 0.07, n('E6'), 0.02, 0.42, 3.4);
  strum(at(S.End + 2), 'Asus4', 'down', 0.38);
  addBass(at(S.End + 2), n('A2'), 0.11, BEAT * 1.6);
  const t1 = at(FINAL);
  strum(t1, 'D', 'down', 0.62);
  strum(t1 + 0.42, 'D', 'up', 0.3);
  addBass(t1, n('D2'), 0.15, 3.6);
  addKick(t1, 0.32);
  ['D3', 'A3', 'F#4', 'A4', 'D5'].forEach((nt, k) => addPiano(t1 + k * 0.07, n(nt), 0.055 - 0.005 * k, 0.3 + 0.1 * k, 4.6));
  for (const [nt, g, pan, dt] of [['D6', 0.036, 0.38, 0], ['F#6', 0.026, 0.6, 0.04], ['A6', 0.02, 0.48, 0.07]]) addChime(t1 + dt, n(nt), g, pan, 5);
}

// ——— La guitare, puis sa caisse : les résonances du bois (vers 105 et 220 Hz), un creux dans le bas-médium, un peu de
// présence, l'aigu adouci ———
renderGuitar();
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
for (const q of [biquad('hp', 70, 0.7), biquad('peak', 105, 1.4, 4), biquad('peak', 220, 1.6, 2.5), biquad('peak', 650, 1, -2.5), biquad('peak', 2800, 0.9, 2), biquad('lp', 9500, 0.7)]) {
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
// pas de grave dans la réverbération : elle brouillerait la contrebasse et la grosse caisse
for (const q of [biquad('hp', 90, 0.7), biquad('hp', 90, 0.7)]) {
  filt(wetL, q);
  filt(wetR, q);
}
for (let i = 0; i < N; i++) {
  L[i] += wetL[i] * 0.28;
  R[i] += wetR[i] * 0.28;
}

// ——— L'ouverture : tout passe dans un passe-bas fermé, qui s'ouvre pendant que les rampants se tracent (des avant-toits
// au faîte) et que l'étoile se pose ———
{
  const OPEN_END = STAR + 1.2 / BEAT;
  const cut = (b) => {
    if (b < RAKES) return 700 + 500 * smooth(b / RAKES);
    if (b < OPEN_END) return 1200 * Math.pow(20000 / 1200, smooth((b - RAKES) / (OPEN_END - RAKES)));
    return 20000;
  };
  const s = [[0, 0], [0, 0]];
  const end = Math.ceil(at(OPEN_END) * SR);
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
console.log(`  ouverture : rampants ${RAKES.toFixed(2)}, mots ${WORDS.toFixed(2)}, étoile ${STAR.toFixed(2)}, groupe ${LAND} ; toits : dessin ${(DRAW - S.Roofs).toFixed(2)}, repère allumé ${(HOT - S.Roofs).toFixed(2)} (temps de la scène) ; ${gNotes.filter((e) => !e.mute).length} cordes pincées`);
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
