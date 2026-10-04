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
const SCENES = [['Opening', 8], ['Before', 12], ['The new site', 13], ['01 Three trades', 10], ['02 25 services', 11], ['03 Pool designs', 14], ['04 Work', 13], ['05 Process', 11], ['06 Reviews', 9], ['07 Free quote', 14], ['Mobile', 9], ['End', 9]];
const START = {};
const LEN = {};
let at = 0;
for (const [name, beats] of SCENES) { START[name] = at; LEN[name] = beats * BEAT; at += beats * BEAT; }
const TOTAL = at;

const meta = (name) => JSON.parse(readFileSync(resolve(root, `public/site/${name}.json`), 'utf8'));
const CLICK_CLIPS = [
  ['03 Pool designs', 'd-pools', 60, 1.15, 0.34],
  ['04 Work', 'd-work', 50, 1.12, 0.3],
  ['06 Reviews', 'd-proof', 60, 1, 0.3],
  ['07 Free quote', 'd-quote', 100, 1.18, 0.34],
];
const clicks = CLICK_CLIPS.flatMap(([scene, clip, from, rate, vol]) =>
  meta(clip).clicks
    .map((c) => Math.round(START[scene] + (c - from) / rate))
    .filter((f) => f >= START[scene] && f < START[scene] + LEN[scene])
    .map((f) => [f, 'tap', vol]));
const WHIPS = ['01 Three trades', '02 25 services', '03 Pool designs', '04 Work', '06 Reviews'].map((n) => START[n] - 12);
const CUES = [
  [130, 'air', 0.2],
  [START['Before'] - 40, 'air', 0.3],
  [START['The new site'] - 40, 'air', 0.32],
  ...WHIPS.map((f) => [f, 'whoosh', 0.4]),
  [START['05 Process'] - 10, 'air', 0.22],
  [START['07 Free quote'] - 10, 'air', 0.22],
  [START['Mobile'] - 40, 'air', 0.3],
  [START['End'] - 40, 'air', 0.3],
  [START['End'] + 160, 'air', 0.26],
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
