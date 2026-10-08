// Images fixes du montage, pour vérifier une scène sans tout rendre.
// Usage : node tools/stills.mjs <dossier> <image> [<image> …]   (numéros d'image à 60 i/s)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {existsSync, mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

const [dir, ...frames] = process.argv.slice(2);
mkdirSync(dir, {recursive: true});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({entryPoint: resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Presentation-Tampa-Muet', inputProps: {sound: false}, browserExecutable: existsSync(browserExecutable) ? browserExecutable : undefined});
for (const f of frames.map(Number)) {
  await renderStill({composition, serveUrl, frame: f, output: resolve(dir, `${String(f).padStart(5, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 88, inputProps: {sound: false}, browserExecutable: existsSync(browserExecutable) ? browserExecutable : undefined});
  process.stdout.write(`${f} `);
}
console.log('✓');
