"""Export des photos du site en AVIF, d'après data/photos.json.

Chaque entrée : id, src (chemin dans le dossier des originaux), crop facultatif
[x0, y0, x1, y1] en fractions de l'image, largeur maximale w, qualité q (48 par défaut),
s facultatif : la largeur d'une version allégée, servie aux téléphones par le build web (srcset),
et t facultatif : la largeur d'une vignette (la photo du modèle, dans le comparateur).
Écrit src/assets/photos/<id>.avif, src/assets/photos-s/<id>.avif, src/assets/photos-t/<id>.avif
et src/data/photo-sizes.json (largeur, hauteur, et largeur de la version allégée s'il y en a une).

    python3 tools/images.py <dossier des photos d'origine>
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1])
OUT = ROOT / 'src/assets/photos'
SMALL = ROOT / 'src/assets/photos-s'
THUMB = ROOT / 'src/assets/photos-t'
for d in (OUT, SMALL, THUMB):
    d.mkdir(parents=True, exist_ok=True)

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
    print(f"{p['id']:<15} {im.width}x{im.height}  {dst.stat().st_size // 1024} Ko")
    if p.get('s') and im.width > p['s']:
        sm = im.resize((p['s'], round(im.height * p['s'] / im.width)), Image.LANCZOS)
        out = SMALL / f"{p['id']}.avif"
        sm.save(out, 'AVIF', quality=p.get('q', 48), speed=4)
        sizes[p['id']].append(sm.width)
        print(f"{'':<15} {sm.width}x{sm.height}  {out.stat().st_size // 1024} Ko (téléphones)")
    if p.get('t'):
        th = im.resize((p['t'], round(im.height * p['t'] / im.width)), Image.LANCZOS)
        out = THUMB / f"{p['id']}.avif"
        th.save(out, 'AVIF', quality=60, speed=4)
        print(f"{'':<15} {th.width}x{th.height}  {out.stat().st_size // 1024} Ko (vignette)")

(ROOT / 'src/data').mkdir(exist_ok=True)
(ROOT / 'src/data/photo-sizes.json').write_text(json.dumps(sizes, indent=1) + '\n')
print(f'total {total / 1e6:.2f} Mo')
