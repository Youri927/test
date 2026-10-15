"""Export des photos du site en AVIF, à leur taille d'origine (jamais agrandies).

Sources : les images publiques de leur site actuel (550 à 750 px de large), téléchargées telles quelles dans un dossier
à part, sous le nom de leur chemin d'upload (2023_03_Roofer-Lakeland.jpg…).
Écrit src/img/*.avif et data/photo-sizes.json.

    python3 -I tools/images.py <dossier des téléchargements>

Seules sont gardées les photos qui sont les leurs (voir ANALYSE.md) :
- leurs véhicules, en 2023 ;
- six photos de chantier qui ont l'air de la Floride.
Floutés : les plaques d'immatriculation, un numéro de maison, le lettrage d'un autre véhicule et un passant à
l'arrière-plan du pick-up. Recadrée : la maison à la véranda ouverte, où l'on voit quelqu'un chez lui.
Aucune retouche de couleur.
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


def blur(im, boxes):
    """Floute chaque boîte (x0, y0, x1, y1) assez fort pour qu'aucun caractère ne reste lisible, avec un bord fondu."""
    for x0, y0, x1, y1 in boxes:
        pad = 6
        zone = (max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad))
        flou = im.crop(zone).filter(ImageFilter.GaussianBlur(max(4, (x1 - x0) // 4)))
        masque = Image.new('L', flou.size, 0)
        masque.paste(255, (x0 - zone[0], y0 - zone[1], x1 - zone[0], y1 - zone[1]))
        im.paste(flou, zone[:2], masque.filter(ImageFilter.GaussianBlur(3)))
    return im


def export(name, file, crop=None, boxes=(), q=62):
    im = blur(Image.open(SRC / file).convert('RGB'), boxes)
    if crop:
        im = im.crop(crop)
    dst = OUT / f'{name}.avif'
    im.save(dst, 'AVIF', quality=q, speed=4)
    SIZES[name] = [im.width, im.height]
    print(f'{name:<16} {im.width:>4}x{im.height:<4} {dst.stat().st_size // 1024:>3} Ko')


# ——— leurs véhicules (2023) ———
export('van-inspection', '2023_03_Roof-Inspection-Lakeland-1.jpg', boxes=[(316, 316, 370, 347)])      # plaque
export('van-side', '2023_03_Roofer-Lakeland.jpg', boxes=[(218, 118, 238, 160)])                       # numéro de la maison
export('van-rear', '2023_03_Reroof-Lakleand.jpg', boxes=[(40, 230, 72, 254)])                         # plaque
export('truck', '2023_02_Residential-Roofing-Company-Truck-Brevard-County-1-1-1.jpg',
       boxes=[(566, 318, 596, 347), (584, 262, 639, 280), (468, 196, 506, 232)])                       # plaque, lettrage, passant

# ——— chantiers ———
export('reroof-house', '2020_01_Reroof_1.jpg', crop=(0, 25, 639, 325))                                # sans la véranda ouverte
export('underlayment', '2020_01_Reroof_2.jpg')
export('lanai-house', '2020_01_Roof-Replacement-1.jpg')
export('shingles', '2020_01_Roof-Replacement-3.jpg')
export('storm-crew', '2020_01_Storm-Damaage-1.jpg')
export('rotten-deck', '2020_01_Storm-Damage-2.jpg')

(ROOT / 'data').mkdir(exist_ok=True)
(ROOT / 'data/photo-sizes.json').write_text(json.dumps(SIZES, indent=1, sort_keys=True))
print(len(SIZES), 'photos')
