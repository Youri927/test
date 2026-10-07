"""Exporte les photos du site actuel de Paradise Pools en AVIF pour la maquette (src/img/).

Sources : les fichiers d'origine envoyés sur leur site Wix (static.wixstatic.com/media/<id>, sans redimensionnement),
jusqu'à 6000 × 4000 px. Les deux plus petits (1019 et 1027 px de large) ont d'abord été agrandis ×2 par
super-résolution (EDSR, OpenCV dnn_superres) dans sr/. Aucune retouche : rotation EXIF, mise à l'échelle et export seulement.
La liste, les descriptions et les étiquettes sont dans data/photos.json.

    python3 tools/images.py <dossier contenant raw/ et sr/>
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

SRC = Path(sys.argv[1])
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src' / 'img'
OUT.mkdir(parents=True, exist_ok=True)

# trois tailles, pour garder le fichier unique léger :
# l'ouverture plein écran en 2048 px (la largeur d'origine), les photos montrées en grand en 1600 px,
# les autres (galerie et visionneuse) en 1200 px sur le grand côté
BIG = {'plan', 'eye'}
LARGE = {'a-1', 'b-1', 'b-2', 'b-3', 'f-1', 'c-2', 'e-1', 'd-1', 'modern', 'resurface', 'tile', 'deck-1', 'pads', 'sheer'}


def size_q(name):
    # qualité AVIF : à l'œil, indiscernable du WebP à 70, pour moitié moins de poids
    if name in BIG:
        return 2048, 52
    if name in LARGE:
        return 1600, 48
    return 1200, 46


def load(short):
    sr = SRC / 'sr' / f'{short}.jpg'
    if sr.exists():
        return Image.open(sr).convert('RGB'), 'sr'
    p = next(SRC.glob(f'raw/462049_{short}*'))
    return ImageOps.exif_transpose(Image.open(p)).convert('RGB'), 'raw'


total = 0
sizes = {}
for ph in json.loads((ROOT / 'data' / 'photos.json').read_text())['photos']:
    im, origin = load(ph['src'])
    side, q = size_q(ph['name'])
    k = side / max(im.size)
    if k < 1:
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    path = OUT / f"{ph['name']}.avif"
    im.save(path, 'AVIF', quality=q, speed=4)
    total += path.stat().st_size
    sizes[ph['name']] = im.size
    # vignette pour la grille de la galerie et les petites vues : 560 px, décodée bien plus vite que l'original
    th = im.copy()
    th.thumbnail((560, 560), Image.LANCZOS)
    tp = OUT / f"t-{ph['name']}.avif"
    th.save(tp, 'AVIF', quality=50, speed=4)
    total += tp.stat().st_size
    sizes['t-' + ph['name']] = th.size
    print(f"{ph['name']:13} {ph['src']} {origin:3} {im.size[0]}×{im.size[1]} {path.stat().st_size // 1024} Ko")
(OUT / 'sizes.json').write_text(json.dumps(sizes, separators=(',', ':')))
print(f'total {total / 1024 / 1024:.2f} Mo')

# le logo d'origine (PNG transparent, 500 × 500) : en entier pour le pied de page, et le seul dessin (soleil, palmiers,
# vague, lignes 0 à 305) pour l'en-tête, où le nom est composé en texte
logo = Image.open(next(SRC.glob('raw/462049_2e61*'))).convert('RGBA')
logo.crop(logo.getbbox()).save(OUT / 'logo.webp', 'WEBP', quality=90, method=6)
mark = logo.crop((0, 0, 500, 305))
mark = mark.crop(mark.getbbox())
mark.resize((round(mark.width * 160 / mark.height), 160), Image.LANCZOS).save(OUT / 'mark.webp', 'WEBP', quality=90, method=6)
sizes['logo'] = logo.crop(logo.getbbox()).size
sizes['mark'] = (round(mark.width * 160 / mark.height), 160)
(OUT / 'sizes.json').write_text(json.dumps(sizes, separators=(',', ':')))
print('logo', sizes['logo'], 'mark', sizes['mark'])
