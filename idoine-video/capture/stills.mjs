// Planche de contrôle : rend quelques images de la présentation avec un seul bundle.
// Usage : node capture/stills.mjs dossier-de-sortie 120 900 1500 …
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const [, , out, ...frames] = process.argv;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const pw = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = existsSync(pw) ? pw : undefined;
const inputProps = {sound: false};
const composition = await selectComposition({serveUrl, id: 'Presentation-Idoine-Muet', inputProps, browserExecutable});
for (const fr of frames) {
  const output = path.join(out, `p${String(fr).padStart(4, '0')}.jpg`);
  await renderStill({composition, serveUrl, frame: Number(fr), output, imageFormat: 'jpeg', jpegQuality: 100, browserExecutable, inputProps});
  process.stdout.write(`${fr} `);
}
console.log('✓');
