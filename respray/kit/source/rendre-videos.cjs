// Rend les séquences vidéo du kit (kit/videos/*.mp4) : intro, fins, ouvertures de séries. 1080 × 1920, 30 i/s.
// Chaque image est une capture de video.html, à un instant précis de ses animations ; ffmpeg les assemble.
//   node kit/source/rendre-videos.cjs      (il faut Playwright et ffmpeg)
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');
const {chromium} = require('playwright');

const ICI = __dirname;
const SORTIE = path.join(ICI, '..', 'videos');
const MOT = fs.readFileSync(path.join(ICI, 'mot.txt'), 'utf8').trim();
const IPS = 30;

// le bouclier « Vérifié par Respray », sans animation (le même dessin que src/components/Bouclier.tsx)
const bord = (() => {
  const p = [];
  for (let i = 0; i <= 144; i++) {
    const a = (i / 144) * Math.PI * 2;
    const r = 57 - 2.6 * (0.5 - 0.5 * Math.cos(a * 18));
    p.push(`${(60 + r * Math.cos(a)).toFixed(2)},${(60 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${p.join('L')}Z`;
})();
const SCEAU = `<svg width="260" height="260" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3cc483"/><stop offset=".55" stop-color="#1a8a52"/><stop offset="1" stop-color="#0c5c35"/></linearGradient><path id="t" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs><path d="${bord}" fill="url(#g)"/><circle cx="60" cy="60" r="51.5" fill="none" stroke="#f6f1e7" stroke-opacity=".35" stroke-width=".8"/><circle cx="60" cy="60" r="38" fill="#0c5c35" fill-opacity=".25" stroke="#f6f1e7" stroke-opacity=".55"/><text fill="#f6f1e7" font-size="7.4" font-weight="700" letter-spacing="1.15" font-family="Inter"><textPath href="#t" textLength="286" lengthAdjust="spacing">VÉRIFIÉ PAR RESPRAY · 6 CONTRÔLES ·</textPath></text><path d="M35 61 L47 73 L66 50" fill="none" stroke="#f6f1e7" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><g fill="#f6f1e7"><circle cx="73.5" cy="44" r="3.4"/><circle cx="80.5" cy="37" r="2.5"/><circle cx="82.5" cy="47.5" r="2.5"/><circle cx="86.5" cy="30.5" r="1.8"/><circle cx="89.5" cy="40" r="1.8"/><circle cx="89" cy="50" r="1.8"/></g></svg>`;

const SEQUENCES = [
  ['intro', 'scene=intro', 2.4],
  ['fin-vendeurs', 'scene=outro&titre=' + encodeURIComponent('Vends tes parfums sans commission.') + '&lien=respray.fr/fondateurs', 3.6],
  ['fin-acheteurs', 'scene=outro&titre=' + encodeURIComponent('Le parfum de seconde main, sans le doute.') + '&lien=respray.fr', 3.6],
  ['serie-on-a-verifie', 'scene=serie&numero=Série&titre=' + encodeURIComponent('On a vérifié') + '&couleur=%231a7f4b', 2.4],
  ['serie-vrai-ou-faux', 'scene=serie&numero=Série&titre=' + encodeURIComponent('Vrai ou faux ?') + '&couleur=%23b83c6e', 2.4],
  ['serie-combien-ca-vaut', 'scene=serie&numero=Série&titre=' + encodeURIComponent('Combien ça vaut ?') + '&couleur=%23b05a12', 2.4],
  ['serie-vide-ton-placard', 'scene=serie&numero=Série&titre=' + encodeURIComponent('Vide ton placard') + '&couleur=%231f7f95', 2.4],
  ['serie-astuce-parfum', 'scene=serie&numero=Série&titre=' + encodeURIComponent('Astuce parfum') + '&couleur=%236f5236', 2.4],
];

(async () => {
  fs.mkdirSync(SORTIE, {recursive: true});
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 1080, height: 1920}});
  await p.addInitScript(([m, s]) => Object.assign(window, {MOT: m, SCEAU: s}), [MOT, SCEAU]);
  for (const [nom, q, duree] of SEQUENCES) {
    const dossier = fs.mkdtempSync(path.join(require('os').tmpdir(), 'respray-'));
    await p.goto('file://' + path.join(ICI, 'video.html') + '?' + q);
    await p.waitForFunction(() => window.pret);
    await p.evaluate(() => document.fonts.ready);
    const n = Math.round(duree * IPS);
    for (let i = 0; i < n; i++) {
      await p.evaluate((t) => document.getAnimations().forEach((a) => {
        a.pause();
        a.currentTime = t;
      }), (i * 1000) / IPS);
      await p.screenshot({path: path.join(dossier, String(i).padStart(4, '0') + '.png')});
    }
    const mp4 = path.join(SORTIE, nom + '.mp4');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(IPS), '-i', path.join(dossier, '%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', mp4]);
    fs.rmSync(dossier, {recursive: true, force: true});
    console.log(nom, (fs.statSync(mp4).size / 1024).toFixed(0), 'Ko');
  }
  await b.close();
})();
