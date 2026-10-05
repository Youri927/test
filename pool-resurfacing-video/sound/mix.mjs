// Mixe la bande-son de la présentation sans passer par le rendu d'images de Remotion :
// la musique, plus chaque bruitage placé à son image (mêmes repères que src/PresSound.tsx).
// Usage : node sound/mix.mjs out/audio.wav
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] || 'out/audio.wav';
const FPS = 60;
const BEAT = 45;

// les scènes et leur durée en temps (src/timeline.ts)
const SCENES = [['Opening', 8], ['Before', 12], ['The new site', 13], ['01 Signs', 11], ['02 Finishes', 12], ['03 Services', 10], ['04 Process', 12], ['05 Reviews', 9], ['06 Offer & FAQ', 9], ['07 Contact', 13], ['Mobile', 9], ['End', 9]];
const START = {};
const LEN = {};
let at = 0;
for (const [name, beats] of SCENES) { START[name] = at; LEN[name] = beats * BEAT; at += beats * BEAT; }
const TOTAL = at;

const meta = (name) => JSON.parse(readFileSync(resolve(root, `public/site/${name}.json`), 'utf8'));
// mêmes repères que src/PresSound.tsx
const CLICK_CLIPS = [
  ['The new site', 'd-hero', 0, 1, 0.28],
  ['01 Signs', 'd-signs', 60, 1.2, 0.32],
  ['02 Finishes', 'd-finishes', 60, 1.2, 0.34],
  ['06 Offer & FAQ', 'd-faq', 60, 1.3, 0.3],
  ['07 Contact', 'd-contact', 60, 1.28, 0.32],
];
const clicks = CLICK_CLIPS.flatMap(([scene, clip, from, rate, vol]) =>
  meta(clip).clicks
    .map((c) => Math.round(START[scene] + (c - from) / rate))
    .filter((f) => f >= START[scene] && f < START[scene] + LEN[scene])
    .map((f) => [f, 'tap', vol]));
const WHIPS = ['01 Signs', '02 Finishes', '03 Services', '04 Process', '05 Reviews'].map((n) => START[n] - 12);
const CUES = [
  [100, 'air', 0.22],
  [START['Before'] - 40, 'air', 0.3],
  [START['The new site'] - 40, 'air', 0.32],
  ...WHIPS.map((f) => [f, 'whoosh', 0.4]),
  [START['06 Offer & FAQ'] - 10, 'air', 0.22],
  [START['07 Contact'] - 10, 'air', 0.22],
  [START['Mobile'] - 40, 'air', 0.3],
  [START['End'] - 40, 'air', 0.3],
  [START['End'] + 150, 'air', 0.26],
  ...clicks,
];

const args = ['-v', 'error', '-y', '-i', resolve(root, 'public/sfx/music.wav')];
const parts = ['[0:a]volume=0.72[m0]'];
CUES.forEach(([f, name, vol], i) => {
  args.push('-i', resolve(root, `public/sfx/${name}.wav`));
  const ms = Math.round((Math.max(0, f) / FPS) * 1000);
  parts.push(`[${i + 1}:a]volume=${vol},adelay=${ms}|${ms}[c${i}]`);
});
const labels = ['[m0]', ...CUES.map((_, i) => `[c${i}]`)].join('');
parts.push(`${labels}amix=inputs=${CUES.length + 1}:normalize=0:duration=first,atrim=0:${(TOTAL / FPS).toFixed(3)}[out]`);
args.push('-filter_complex', parts.join(';'), '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_s16le', resolve(root, out));
execFileSync('ffmpeg', args, {stdio: 'inherit'});
console.log(`✓ ${out}  ${CUES.length} bruitages, ${(TOTAL / FPS).toFixed(2)} s`);
