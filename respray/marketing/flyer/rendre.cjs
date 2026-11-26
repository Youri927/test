// Le flyer en PDF : python3 construire.py && node rendre.cjs
//   flyer-imprimeur.pdf : recto et verso A6 avec 3 mm de fond perdu (111 × 154 mm), pour un imprimeur en ligne ;
//   flyer-a4-maison.pdf : 4 flyers par feuille A4 (page 1 recto, page 2 verso), traits de coupe, pour une imprimante ;
//   apercu-recto.png, apercu-verso.png.
const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const url = 'file://' + path.join(__dirname, 'flyer.html');

  await p.goto(url);
  await p.addStyleTag({content: ':root{--pw:111mm;--ph:154mm;--fp:3mm}'});
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({path: path.join(__dirname, 'flyer-imprimeur.pdf'), width: '111mm', height: '154mm', printBackground: true});

  // aperçus nets (×3), au format fini
  const ap = await b.newPage({viewport: {width: 397, height: 560}, deviceScaleFactor: 3});
  await ap.goto(url);
  await ap.evaluate(() => document.fonts.ready);
  const faces = await ap.$$('.face');
  for (const [i, f] of faces.entries()) await f.screenshot({path: path.join(__dirname, `apercu-${i ? 'verso' : 'recto'}.png`)});

  // A4 maison : 2 × 2 flyers par page, la page 2 en miroir pour que recto et verso tombent face à face
  const html = fs.readFileSync(path.join(__dirname, 'flyer.html'), 'utf8');
  const recto = html.match(/<section class="face recto">[\s\S]*?<\/section>/)[0];
  const verso = html.match(/<section class="face verso">[\s\S]*?<\/section>/)[0];
  const style = html.match(/<style>[\s\S]*?<\/style>/)[0];
  const feuille = (f) => `<div class="feuille">${[0, 1, 2, 3].map(() => f).join('')}</div>`;
  const a4 = `<!doctype html><html lang="fr"><head><meta charset="utf-8">${style}<style>
    @page { size: A4; margin: 0; }
    .feuille { width: 210mm; height: 297mm; display: grid; grid-template-columns: 105mm 105mm; grid-template-rows: 148.5mm 148.5mm; break-after: page; position: relative; }
    .feuille .face { height: 148.5mm; break-after: auto; }
    .feuille::before, .feuille::after { content: ""; position: absolute; background: rgba(128,128,128,.6); z-index: 2; }
    .feuille::before { left: 105mm; top: 0; bottom: 0; width: .1mm; }
    .feuille::after { top: 148.5mm; left: 0; right: 0; height: .1mm; }
  </style></head><body>${feuille(recto)}${feuille(verso)}</body></html>`;
  fs.writeFileSync(path.join(__dirname, 'a4.html'), a4);
  await p.goto('file://' + path.join(__dirname, 'a4.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({path: path.join(__dirname, 'flyer-a4-maison.pdf'), format: 'A4', printBackground: true});
  await b.close();
  console.log('ok');
})();
