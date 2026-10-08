// Mixe la bande-son de la présentation sans passer par le rendu d'images de Remotion :
// la musique, plus chaque bruitage placé à son image (repères partagés avec src/PresSound.tsx : src/cues.ts).
// Usage : node --no-warnings sound/mix.mjs out/audio.wav
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {BEAT, SCENE_BEATS} from '../src/beats.ts';
import {cues} from '../src/cues.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] || 'out/audio.wav';
const FPS = 60;

// les scènes et leur durée (même calcul que src/timeline.ts)
const START = {};
const LEN = {};
let at = 0;
for (const [name, beats] of SCENE_BEATS) { START[name] = at; LEN[name] = beats * BEAT; at += beats * BEAT; }
const TOTAL = at;

const FILES = {dTreatments: 'd-treatments', dRequest: 'd-request'};
const clicks = (clip) => JSON.parse(readFileSync(resolve(root, `public/site/${FILES[clip]}.json`), 'utf8')).clicks;
const CUES = cues(START, LEN, clicks);

const args = ['-v', 'error', '-y', '-i', resolve(root, 'public/sfx/music.wav')];
// musique : on retire l'infra-grave, on allège un peu le bas et on éclaircit le haut
const parts = ['[0:a]highpass=f=32,equalizer=f=120:t=q:w=0.9:g=-2,treble=g=1.5:f=5000,volume=0.72[m0]'];
CUES.forEach(([f, name, vol], i) => {
  args.push('-i', resolve(root, `public/sfx/${name}.wav`));
  const ms = Math.round((Math.max(0, f) / FPS) * 1000);
  parts.push(`[${i + 1}:a]volume=${vol},adelay=${ms}|${ms}[c${i}]`);
});
const labels = ['[m0]', ...CUES.map((_, i) => `[c${i}]`)].join('');
// sortie : un peu de gain, puis un limiteur qui ne prend que les crêtes (grosse caisse, couronne qui se pose).
// L'écart entre crêtes et niveau moyen reste sous 12 dB : la normalisation finale à −14 LUFS est alors un simple gain.
parts.push(`${labels}amix=inputs=${CUES.length + 1}:normalize=0:duration=first,atrim=0:${(TOTAL / FPS).toFixed(3)},aresample=48000,volume=8.5dB,alimiter=limit=0.47:attack=4:release=70:level=false[out]`);
args.push('-filter_complex', parts.join(';'), '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_s16le', resolve(root, out));
execFileSync('ffmpeg', args, {stdio: 'inherit'});
console.log(`✓ ${out}  ${CUES.length} bruitages, ${(TOTAL / FPS).toFixed(2)} s`);
