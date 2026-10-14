// Bande-son finale de la présentation : la musique seule (pas de bruitages), recalée sur la durée du montage.
// Usage : node --no-warnings sound/mix.mjs out/audio.wav
import {execFileSync} from 'node:child_process';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {BEAT, SCENE_BEATS} from '../src/beats.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] || 'out/audio.wav';
const FPS = 60;
const TOTAL = SCENE_BEATS.reduce((n, [, beats]) => n + beats * BEAT, 0);

// on retire l'infra-grave, on allège un peu le bas et le haut-médium (le marimba et la guitare sont brillants) ; un peu de gain, puis un limiteur
// qui ne prend que les crêtes. Le dernier accord résonne encore à la dernière image : il s'éteint avec le fondu au noir.
const filter = `highpass=f=48,equalizer=f=120:t=q:w=0.9:g=-1.5,equalizer=f=1600:t=q:w=1:g=-2.5,volume=0.72,atrim=0:${(TOTAL / FPS).toFixed(3)},aresample=48000,volume=8.5dB,alimiter=limit=0.47:attack=4:release=70:level=false,afade=t=out:st=${(TOTAL / FPS - 0.9).toFixed(3)}:d=0.9`;
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', resolve(root, 'public/sfx/music.wav'), '-af', filter, '-ar', '48000', '-c:a', 'pcm_s16le', resolve(root, out)], {stdio: 'inherit'});
console.log(`✓ ${out}  ${(TOTAL / FPS).toFixed(2)} s`);
