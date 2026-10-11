// Couleur du fond de la page, image par image, pour les plans de l'ouverture du site (qui prend la couleur du chantier).
// On moyenne un carré de 16 × 16 px CSS pris dans la marge gauche (px CSS 8 à 24, 692 à 708 du viewport 1440 × 900),
// là où n'arrivent ni le texte ni les photos : la vague d'eau et la nuit y passent comme sur le reste de la page.
// Usage : node tools/tones.mjs d-open d-ruler   →  public/site/<plan>.tones.json
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const dir = resolve('public/site');
for (const name of process.argv.slice(2)) {
  const meta = JSON.parse(readFileSync(resolve(dir, `${name}.json`), 'utf8'));
  const k = meta.dsf || 2; // captures en 2×
  const [x, y, s] = [8 * k, 692 * k, 16 * k];
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', resolve(dir, `${name}.mp4`), '-vf', `crop=${s}:${s}:${x}:${y},scale=1:1:flags=area`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], {maxBuffer: 1 << 26});
  const hex = (v) => v.toString(16).padStart(2, '0');
  const tones = [];
  for (let i = 0; i + 2 < raw.length; i += 3) tones.push(`#${hex(raw[i])}${hex(raw[i + 1])}${hex(raw[i + 2])}`);
  writeFileSync(resolve(dir, `${name}.tones.json`), JSON.stringify(tones) + '\n');
  console.log(`✓ ${name}.tones.json  ${tones.length} images (${tones[0]} → ${tones[tones.length - 1]})`);
}
