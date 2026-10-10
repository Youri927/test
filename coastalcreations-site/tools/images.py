"""Export des photos du site en AVIF, d'après data/photos.json.

Chaque entrée : id, src (chemin dans le dossier des originaux), crop facultatif [x0, y0, x1, y1] en fractions
de l'image, largeur maximale w, qualité q (48 par défaut), et facultativement color et contrast (ImageEnhance,
1 = inchangé). Écrit src/img/<id>.avif et data/photo-sizes.json (largeur et hauteur de chaque photo, pour les
attributs width et height de la page).

    python3 -I tools/images.py <dossier des photos d'origine>
    python3 -I tools/images.py <dossier des photos d'origine> --only hero,hero-m   (seulement ces photos)
    python3 -I tools/images.py --sizes      (recalcule seulement data/photo-sizes.json d'après src/img)
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/img'
OUT.mkdir(parents=True, exist_ok=True)

if sys.argv[1] != '--sizes':
    SRC = Path(sys.argv[1])
    only = set(sys.argv[sys.argv.index('--only') + 1].split(',')) if '--only' in sys.argv else None
    total = 0
    for p in json.loads((ROOT / 'data/photos.json').read_text()):
        if only and p['id'] not in only:
            continue
        im = ImageOps.exif_transpose(Image.open(SRC / p['src'])).convert('RGB')
        if 'crop' in p:
            x0, y0, x1, y1 = p['crop']
            im = im.crop((round(x0 * im.width), round(y0 * im.height), round(x1 * im.width), round(y1 * im.height)))
        if im.width > p['w']:
            im = im.resize((p['w'], round(im.height * p['w'] / im.width)), Image.LANCZOS)
        if 'color' in p:
            im = ImageEnhance.Color(im).enhance(p['color'])
        if 'contrast' in p:
            im = ImageEnhance.Contrast(im).enhance(p['contrast'])
        dst = OUT / f"{p['id']}.avif"
        im.save(dst, 'AVIF', quality=p.get('q', 48), speed=4)
        total += dst.stat().st_size
        print(f"{p['id']:<15} {im.width}x{im.height}  {dst.stat().st_size // 1024} Ko")
    print(f'total {total // 1024} Ko')

sizes = {f.stem: list(Image.open(f).size) for f in sorted(OUT.glob('*.avif'))}
(ROOT / 'data/photo-sizes.json').write_text(json.dumps(sizes, indent=1) + '\n')
print(f'data/photo-sizes.json : {len(sizes)} images')
