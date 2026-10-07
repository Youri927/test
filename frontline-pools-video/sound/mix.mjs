// Mixe la bande-son de la présentation sans passer par le rendu d'images de Remotion :
// la musique, plus chaque bruitage placé à son image (repères partagés avec src/PresSound.tsx : src/cues.ts).
// Usage : node --no-warnings sound/mix.mjs out/audio.wav
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {cues} from '../src/cues.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] || 'out/audio.wav';
const FPS = 60;
const BEAT = 40;

// les scènes et leur durée en temps (src/timeline.ts)
const SCENES = [['Opening', 9], ['Today', 12], ['Turn', 5], ['First impression', 12], ['What we rebuild', 18], ['Recent work', 12], ['Equipment', 12],
  ['Reviews', 12], ['License & financing', 12], ['Service area', 11], ['Free estimate', 14], ['Mobile', 10], ['End', 11]];
const START = {};
const LEN = {};
let at = 0;
for (const [name, beats] of SCENES) { START[name] = at; LEN[name] = beats * BEAT; at += beats * BEAT; }
const TOTAL = at;

const FILES = {dAreas: 'd-areas', dEstimate: 'd-estimate', mMenu: 'm-menu'};
const clicks = (clip) => JSON.parse(readFileSync(resolve(root, `public/site/${FILES[clip]}.json`), 'utf8')).clicks;
const CUES = cues(START, LEN, clicks);

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
