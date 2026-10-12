"""Export des photos du site en AVIF, d'après data/photos.json.

Chaque entrée : id, src (nom du fichier d'origine), et l'une des deux découpes :
  - box [x0, y0, x1, y1] en pixels de l'image d'origine ;
  - face <nom> : un portrait de l'équipe, découpé d'après les yeux relevés dans data/faces.json (tools/faces.py),
    pour que tous les visages aient la même taille et les yeux la même hauteur.
Puis la largeur maximale w (jamais agrandie), la qualité q, et facultativement ws (versions réduites pour le srcset).
Écrit src/img/<id>.avif et data/photo-sizes.json (largeur et hauteur de chaque photo, pour les attributs width et height).

    python3 -I tools/images.py <dossier des photos d'origine>
    python3 -I tools/images.py <dossier des photos d'origine> --only facade,facade-m
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/img'
OUT.mkdir(parents=True, exist_ok=True)

# cadre des portraits : 420 × 606 (affichés à 210 × 303 au plus), yeux à 36 % de la hauteur,
# écart entre les yeux égal à 25,5 % de la largeur
TEAM_W, TEAM_H, TEAM_EYE, TEAM_D = 420, 606, 0.36, 0.255


def team_box(face):
    s = TEAM_W * TEAM_D / face['eyeDist']
    ex, ey = face['eyes']
    x0, y0 = ex - TEAM_W / 2 / s, ey - TEAM_EYE * TEAM_H / s
    box = (round(x0), round(y0), round(x0 + TEAM_W / s), round(y0 + TEAM_H / s))
    if box[0] < 0 or box[1] < 0 or box[2] > face['w'] or box[3] > face['h']:
        raise SystemExit(f'le cadre sort de la photo : {face["file"]} {box}')
    return box


SRC = Path(sys.argv[1])
only = set(sys.argv[sys.argv.index('--only') + 1].split(',')) if '--only' in sys.argv else None
faces = json.loads((ROOT / 'data/faces.json').read_text())
total = 0
for p in json.loads((ROOT / 'data/photos.json').read_text()):
    if only and p['id'] not in only:
        continue
    face = faces[p['face']] if 'face' in p else None
    im = ImageOps.exif_transpose(Image.open(SRC / (face['file'] if face else p['src']))).convert('RGB')
    box = team_box(face) if face else p.get('box')
    if box:
        im = im.crop(tuple(box))
    if face:
        im = im.resize((TEAM_W, TEAM_H), Image.LANCZOS)
    elif im.width > p['w']:
        im = im.resize((p['w'], round(im.height * p['w'] / im.width)), Image.LANCZOS)
    dst = OUT / f"{p['id']}.avif"
    im.save(dst, 'AVIF', quality=p.get('q', 54), speed=4)
    total += dst.stat().st_size
    print(f"{p['id']:<15} {im.width}x{im.height}  {dst.stat().st_size // 1024} Ko")
    for w in p.get('ws', []):
        if w < im.width:
            small = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            d2 = OUT / f"{p['id']}.w{w}.avif"
            small.save(d2, 'AVIF', quality=p.get('q', 54) + 4, speed=4)
            total += d2.stat().st_size
            print(f"{'':<15} {small.width}x{small.height}  {d2.stat().st_size // 1024} Ko")
print(f'total {total // 1024} Ko')

sizes = {f.stem: list(Image.open(f).size) for f in sorted(OUT.glob('*.avif')) if '.w' not in f.stem}
(ROOT / 'data/photo-sizes.json').write_text(json.dumps(sizes, indent=1) + '\n')
print(f'data/photo-sizes.json : {len(sizes)} images')
