"""Export des photos du site en AVIF, jamais agrandies.

Sources : les images publiques de leur site Squarespace (2 500 px de large au plus, le maximum que sert leur CDN),
téléchargées telles quelles dans un dossier à part et nommées par leur rang dans le plan du site (00.jpg, 09.jpg…).
Écrit src/img/*.avif et data/photo-sizes.json.

    python3 -I tools/images.py <dossier des téléchargements>

- Recadrages : le rétroviseur de la voiture, l'échafaudage du voisin, le ciel en trop.
- Floutés : le numéro d'une maison, celui d'une boîte aux lettres et les panneaux d'autres entreprises sur un chantier
  (boîtes en pixels de la photo d'origine).
- Aucune retouche de couleur.
- Chaque photo sort en deux ou trois largeurs, jamais plus grandes que l'original.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/img'
SRC = Path(sys.argv[1]).resolve()
OUT.mkdir(parents=True, exist_ok=True)
SIZES = {}


def save(im, name, q=56):
    dst = OUT / f'{name}.avif'
    im.save(dst, 'AVIF', quality=q, speed=4)
    SIZES[name] = [im.width, im.height]
    print(f'{name:<16} {im.width:>5}x{im.height:<5} {dst.stat().st_size // 1024:>4} Ko')


def width(im, w):
    """Réduit à `w` px de large ; n'agrandit jamais."""
    return im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def blur(im, boxes):
    """Floute chaque boîte (x0, y0, x1, y1) assez fort pour qu'aucun chiffre ne reste lisible, avec un bord fondu."""
    for x0, y0, x1, y1 in boxes:
        pad = 10
        zone = (max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad))
        flou = im.crop(zone).filter(ImageFilter.GaussianBlur(max(4, (x1 - x0) // 5)))
        masque = Image.new('L', flou.size, 0)
        masque.paste(255, (x0 - zone[0], y0 - zone[1], x1 - zone[0], y1 - zone[1]))
        im.paste(flou, zone[:2], masque.filter(ImageFilter.GaussianBlur(4)))
    return im


def photo(file, crop=None, boxes=()):
    im = blur(Image.open(SRC / file).convert('RGB'), boxes)
    return im.crop(crop) if crop else im


def export(name, im, widths, q=56):
    """La plus grande largeur porte le nom seul ; les autres, le nom suivi de la largeur."""
    widths = sorted(widths, reverse=True)
    for i, w in enumerate(widths):
        save(width(im, w), name if i == 0 else f'{name}-{w}', q)


# ——— l'accueil : leurs chantiers, qui passent devant le nom (le terrain et la maison finie sont ceux des étapes) ———
HERO = {
    'h-shell': ('24.jpg', (0, 160, 2500, 1875), []),                  # la coque en blocs, trois niveaux
    'h-room': ('40.jpg', None, []),                                   # la grande pièce et la cuisine
    'h-rebuilt': ('15.jpg', None, []),                                # la maison refaite après la tempête
    'h-tall': ('00.jpg', (60, 40, 2500, 1560), [(990, 930, 1080, 975)]),  # trois niveaux ; numéro flouté, sans le rétroviseur
    'h-studio': ('54.jpg', None, []),                                 # le studio de fitness
    'h-box': ('03.jpg', (600, 260, 2500, 1700), []),                  # la maison blanche aux grandes baies, sans l'échafaudage voisin
}
for name, (file, crop, boxes) in HERO.items():
    export(name, photo(file, crop, boxes), (1100, 640))

# ——— du terrain à la maison : trois chantiers ———
export('st-lot', photo('20.jpg', (0, 430, 2500, 1875)), (1200, 700))
export('st-shell', photo('21.jpg', (100, 80, 2450, 1500), [(415, 1445, 480, 1490), (585, 1475, 750, 1630)]), (1200, 700))
export('st-house', photo('09.jpg', (120, 0, 2400, 1875)), (1200, 700))

# ——— les pièces : intérieurs de leurs maisons neuves et rénovées ———
ROOMS = ['34', '04', '01', '22', '13', '36', '08', '38', '23', '30', '41', '06']
for n in ROOMS:
    im = photo(f'{n}.jpg')
    export(f'g-{n}', im, (2000, 1200, 700) if im.width > 2000 else (im.width, 700))

# ——— « better than new » : une maison, de la tempête aux clés ———
for n in ('57', '59', '62', '63'):                                    # les dégâts, petites photos de téléphone : taille réelle
    save(photo(f'{n}.jpg'), f'b-{n}', q=62)
export('b-64', photo('64.jpg'), (1200, 700))                          # sous la maison, novembre 2022
for n in ('66', '67', '71'):                                          # le séchage, murs ouverts
    export(f'd-{n}', photo(f'{n}.jpg'), (1170, 640))
export('a-15', photo('15.jpg'), (1476, 800))                          # la maison refaite, décembre 2023
export('a-11', photo('11.jpg'), (1500, 800))
export('a-05', photo('05.jpg'), (1500, 800))

# ——— commercial ———
for n, crop in (('54', None), ('53', None), ('48', None), ('46', None), ('44', None)):
    im = photo(f'{n}.png' if n == '46' else f'{n}.jpg', crop)
    export(f'c-{n}', im, (1200, 700))

(ROOT / 'data').mkdir(exist_ok=True)
(ROOT / 'data/photo-sizes.json').write_text(json.dumps(SIZES, indent=1, sort_keys=True))
print(len(SIZES), 'fichiers')
