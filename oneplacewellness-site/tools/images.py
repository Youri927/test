"""Export de la photo du cas en AVIF, à sa taille d'origine (jamais agrandie).

La photo de la galerie (601 × 225) réunit l'avant et l'après, séparés par un filet bleu, avec un liseré blanc sur les
bords. On en tire deux tirages de même taille (292 × 225), sans le filet ni le liseré : le site les pose côte à côte
sur leur passe-partout.
Écrit src/img/case-before.avif, src/img/case-after.avif et data/photo-sizes.json.

    python3 -I tools/images.py data/case-marionette-1.jpg
"""
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/img'
OUT.mkdir(parents=True, exist_ok=True)

# colonnes mesurées sur la photo d'origine : liseré blanc en 0-2 et 600, filet bleu de 296 à 302
CROPS = {'case-before': (3, 0, 295, 225), 'case-after': (303, 0, 595, 225)}

im = Image.open(sys.argv[1]).convert('RGB')
if im.size != (601, 225):
    raise SystemExit(f'taille inattendue : {im.size}')
for name, box in CROPS.items():
    part = im.crop(box)
    dst = OUT / f'{name}.avif'
    part.save(dst, 'AVIF', quality=72, speed=4)
    print(f'{name:<12} {part.width}x{part.height}  {dst.stat().st_size // 1024} Ko')

sizes = {f.stem: list(Image.open(f).size) for f in sorted(OUT.glob('*.avif')) if '.w' not in f.stem}
(ROOT / 'data/photo-sizes.json').write_text(json.dumps(sizes, indent=1) + '\n')
print(f'data/photo-sizes.json : {len(sizes)} images')
