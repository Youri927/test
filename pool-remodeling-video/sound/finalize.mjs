// Finalise un rendu : son normalisé à −14 LUFS (loudnorm en deux passes, limiteur à −1,5 dB),
// vidéo copiée telle quelle, puis une copie muette.
// Usage : node sound/finalize.mjs out/presentation-site.mp4 renders/presentation-site-16x9.mp4
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';

const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error('usage : finalize.mjs entrée.mp4 sortie.mp4');
mkdirSync(dirname(output), {recursive: true});

const target = 'I=-14:TP=-2:LRA=11';
// 1re passe : mesure (loudnorm écrit son rapport JSON sur la sortie d'erreur)
const {stderr} = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', input, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-'], {encoding: 'utf8'});
const m = JSON.parse(stderr.slice(stderr.lastIndexOf('{'), stderr.lastIndexOf('}') + 1));
// 2e passe : correction linéaire avec les valeurs mesurées
const af = `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,alimiter=limit=0.84:attack=3:release=50:level=disabled,aresample=48000`;
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', input, '-c:v', 'copy', '-af', af, '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', output]);
const muted = output.replace(/\.mp4$/, '-muet.mp4');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', output, '-an', '-c:v', 'copy', '-movflags', '+faststart', muted]);
console.log(`✓ ${output}  (son d'origine ${m.input_i} LUFS, crête ${m.input_tp} dB)\n✓ ${muted}`);
