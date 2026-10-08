"""Photos de la vidéo, exportées depuis les originaux de leur médiathèque.

Mêmes sources et mêmes recadrages que le site (../tampa-decking-site/data/photos.json),
en WebP de bonne qualité pour l'image animée : public/img/<id>.webp.

    python3 tools/photos.py <dossier des photos d'origine>
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT.parent / 'tampa-decking-site'
SRC = Path(sys.argv[1])
OUT = ROOT / 'public/img'
OUT.mkdir(parents=True, exist_ok=True)

# id de la photo sur le site → largeur pour la vidéo
WANT = {
    # les quatre couches (ouverture)
    'layer-deck': 1600, 'layer-coping': 1600, 'layer-tile': 1600, 'layer-finish': 1600,
    # leurs bassins (fin)
    'hero': 1800, 'w-1179': 1400, 'w-0993': 1400, 'w-1196': 1400, 'w-1175': 1400, 'w-8916': 1400, 'w-4803': 1400,
}

photos = {p['id']: p for p in json.loads((SITE / 'data/photos.json').read_text())}
for pid, width in WANT.items():
    p = photos[pid]
    im = ImageOps.exif_transpose(Image.open(SRC / p['src'])).convert('RGB')
    if 'crop' in p:
        x0, y0, x1, y1 = p['crop']
        im = im.crop((round(x0 * im.width), round(y0 * im.height), round(x1 * im.width), round(y1 * im.height)))
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    dst = OUT / f'{pid}.webp'
    im.save(dst, 'WEBP', quality=88, method=6)
    print(f'{pid:<14} {im.width}x{im.height}  {dst.stat().st_size // 1024} Ko')
