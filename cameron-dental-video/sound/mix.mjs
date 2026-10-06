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
const SCENES = [['Opening', 8], ['Today', 10], ['Turn', 5], ['First impression', 10], ['Before & after', 11], ['Feature case', 10], ['The artist', 8], ['Care', 11], ['Team & reviews', 10], ['Booking', 13], ['Mobile', 8], ['End', 9]];
const START = {};
const LEN = {};
let at = 0;
for (const [name, beats] of SCENES) { START[name] = at; LEN[name] = beats * BEAT; at += beats * BEAT; }
const TOTAL = at;

const meta = (name) => JSON.parse(readFileSync(resolve(root, `public/site/${name}.json`), 'utf8'));
// mêmes repères que src/PresSound.tsx
const CLICK_CLIPS = [
  ['Before & after', 'd-wall', 30, 1, 0.3],
  ['Care', 'd-care', 20, 1.4, 0.3],
  ['Booking', 'd-book', 20, 1.5, 0.3],
];
const clicks = CLICK_CLIPS.flatMap(([scene, clip, from, rate, vol]) =>
  meta(clip).clicks
    .map((c) => Math.round(START[scene] + (c - from) / rate))
    .filter((f) => f >= START[scene] && f < START[scene] + LEN[scene])
    .map((f) => [f, 'tap', vol]));
const TYPING = Array.from({length: 9}, (_, i) => [70 + Math.round((i * 2 * 70) / 17), 'tap', 0.1]);
const WHIPS = ['Before & after', 'Feature case', 'The artist', 'Care', 'Team & reviews', 'Booking'].map((n) => START[n] - 12);
const CUES = [
  ...TYPING,
  [START['Today'] - 40, 'air', 0.3],
  [START['Turn'] - 40, 'air', 0.3],
  [START['First impression'] - 44, 'air', 0.36],
  [START['First impression'] + 112, 'air', 0.2],
  ...WHIPS.map((f) => [f, 'whoosh', 0.4]),
  [START['Mobile'] - 40, 'air', 0.3],
  [START['End'] - 40, 'air', 0.3],
  [START['End'] + 175, 'air', 0.26],
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
