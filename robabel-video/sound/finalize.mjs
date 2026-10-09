// Finalise un rendu : son normalisé à −14 LUFS (loudnorm en deux passes, limiteur à −1,5 dB),
// vidéo copiée telle quelle, puis une copie muette.
// GitHub refuse les fichiers de plus de 100 Mo : au-delà de 94 Mo, la vidéo est réencodée en H.264 en deux passes pour tenir dessous.
// Avec un troisième chemin : une version légère pour l'envoi (moins de 30 Mo, H.264 en deux passes).
// Usage : node sound/finalize.mjs out/presentation-site.mp4 renders/presentation-site-16x9.mp4 [out/envoi.mp4]
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdirSync, statSync} from 'node:fs';
import {basename, dirname, join} from 'node:path';

const [input, output, light] = process.argv.slice(2);
if (!input || !output) throw new Error('usage : finalize.mjs entrée.mp4 sortie.mp4');
mkdirSync(dirname(output), {recursive: true});

const MAX = 94 * 1024 * 1024;
const duration = (p) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).toString());
// H.264 en deux passes à un débit donné ; les journaux des passes restent à côté de l'entrée (dossier de travail)
const twoPass = (src, name, kbps) => {
  const v = ['-c:v', 'libx264', '-preset', 'slow', '-b:v', `${kbps}k`, '-pix_fmt', 'yuv420p', '-passlogfile', join(dirname(input), `${name}-2pass`)];
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, ...v, '-pass', '1', '-an', '-f', 'null', '/dev/null']);
  return [...v, '-pass', '2'];
};

const target = 'I=-14:TP=-1.5:LRA=11';
// 1re passe : mesure (loudnorm écrit son rapport JSON sur la sortie d'erreur)
const {stderr} = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', input, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-'], {encoding: 'utf8'});
const m = JSON.parse(stderr.slice(stderr.lastIndexOf('{'), stderr.lastIndexOf('}') + 1));
// 2e passe : correction linéaire avec les valeurs mesurées
const af = `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,alimiter=limit=0.84:attack=3:release=50:level=disabled,aresample=48000`;
const dur = duration(input);
const big = statSync(input).size > MAX;
const video = big ? twoPass(input, basename(output, '.mp4'), Math.floor((MAX * 0.97 * 8) / dur / 1000 - 192)) : ['-c:v', 'copy'];
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', input, ...video, '-af', af, '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', output]);
const muted = output.replace(/\.mp4$/, '-muet.mp4');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', output, '-an', '-c:v', 'copy', '-movflags', '+faststart', muted]);
const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(1);
console.log(`✓ ${output}  ${mb(output)} Mo${big ? ' (vidéo réencodée pour rester sous 100 Mo)' : ''}  (son d'origine ${m.input_i} LUFS, crête ${m.input_tp} dB)\n✓ ${muted}  ${mb(muted)} Mo`);
if (light) {
  // débit calculé pour rester sous 30 Mo avec un son AAC à 128 kb/s ; l'image vient du rendu d'origine, le son de la version normalisée
  const kbps = Math.floor((28.8 * 8 * 1024 * 1024) / dur / 1000 - 128);
  const v = twoPass(input, basename(light, '.mp4'), kbps);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', input, '-i', output, '-map', '0:v', '-map', '1:a', ...v, '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', light]);
  console.log(`✓ ${light}  ${mb(light)} Mo (vidéo ${kbps} kb/s)`);
}
