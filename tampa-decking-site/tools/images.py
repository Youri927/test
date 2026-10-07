"""Export des photos du site en AVIF, d'après data/photos.json.

Chaque entrée : id, src (chemin dans le dossier des originaux), crop facultatif
[x0, y0, x1, y1] en fractions de l'image, largeur maximale w, qualité q (48 par défaut).
Écrit src/assets/photos/<id>.avif et src/data/photo-sizes.json (largeur, hauteur).

    python3 tools/images.py <dossier des photos d'origine>
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1])
OUT = ROOT / 'src/assets/photos'
OUT.mkdir(parents=True, exist_ok=True)

sizes, total = {}, 0
for p in json.loads((ROOT / 'data/photos.json').read_text()):
    im = ImageOps.exif_transpose(Image.open(SRC / p['src'])).convert('RGB')
    if 'crop' in p:
        x0, y0, x1, y1 = p['crop']
        im = im.crop((round(x0 * im.width), round(y0 * im.height), round(x1 * im.width), round(y1 * im.height)))
    if im.width > p['w']:
        im = im.resize((p['w'], round(im.height * p['w'] / im.width)), Image.LANCZOS)
    dst = OUT / f"{p['id']}.avif"
    im.save(dst, 'AVIF', quality=p.get('q', 48), speed=4)
    sizes[p['id']] = [im.width, im.height]
    total += dst.stat().st_size
    print(f"{p['id']:<14} {im.width}x{im.height}  {dst.stat().st_size // 1024} Ko")

(ROOT / 'src/data').mkdir(exist_ok=True)
(ROOT / 'src/data/photo-sizes.json').write_text(json.dumps(sizes, indent=1) + '\n')
print(f'total {total / 1e6:.2f} Mo')
