"""Export des photos du site en AVIF, jamais agrandies.

Sources : les médias publics de leur WordPress (wp-content/uploads), téléchargés tels quels dans un dossier à part,
sous le nom « année_mois_fichier » (2022_05_16.jpg, 2024_08_96c0122e-….jpeg, 2022_05_logo.png…).
Écrit src/img/*.avif et data/photo-sizes.json.

    python3 -I tools/images.py <dossier des téléchargements>

- Les photos de chantier font 800 px de large : on les exporte à 800 px (la visionneuse) et à 480 px (les grilles
  au téléphone), sans retouche de couleur.
- Les numéros de maison et la plaque d'un véhicule sont floutés (boîtes en pixels de la photo d'origine).
- La photo de 2024 (1920 × 897) sert à l'accueil : 1920, 1280 et 800 px de large, et un recadrage en hauteur pour
  le téléphone (800 × 897, autour du palmier et de l'entrée).
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
    print(f'{name:<14} {im.width:>5}x{im.height:<5} {dst.stat().st_size // 1024:>4} Ko')


def width(im, w):
    """Réduit à `w` px de large ; n'agrandit jamais."""
    return im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def blur(im, boxes):
    """Floute chaque boîte (x0, y0, x1, y1) assez fort pour qu'aucun chiffre ne reste lisible, avec un bord fondu
    pour que la retouche ne se voie pas comme un rectangle."""
    for x0, y0, x1, y1 in boxes:
        pad = 8
        zone = (max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad))
        flou = im.crop(zone).filter(ImageFilter.GaussianBlur(max(3, (x1 - x0) // 5)))
        masque = Image.new('L', flou.size, 0)
        masque.paste(255, (x0 - zone[0], y0 - zone[1], x1 - zone[0], y1 - zone[1]))
        im.paste(flou, zone[:2], masque.filter(ImageFilter.GaussianBlur(3)))
    return im


def photo(file, boxes=()):
    return blur(Image.open(SRC / file).convert('RGB'), boxes)


# ——— l'accueil : la maison blanche au toit de tuiles plates grises (2024) ———
hero = photo('2024_08_96c0122e-064e-4628-ae67-bd70b425820f.jpeg')
for w in (1920, 1280, 800):
    save(width(hero, w), f'hero-{w}', q=58)
save(hero.crop((760, 0, 1560, 897)), 'hero-tall', q=58)

# ——— couche par couche : les étapes, sur leurs chantiers ———
STAGES = {
    's1': ('2022_05_16.jpg', [(274, 308, 296, 326)]),   # toit déposé jusqu'au bois ; numéro sur le pilier
    's2': ('2022_05_31.jpg', []),                       # sous-couche posée, leur panneau sur la pelouse
    's3': ('2022_05_35.jpg', []),                       # tuiles montées sur la sous-couche
    's4a': ('2022_05_19.jpg', [(194, 308, 216, 326)]),  # la maison de s1, terminée (tuiles blanches)
    's4b': ('2022_05_28.jpg', []),                      # la maison de s2, terminée (tuiles terre cuite)
}
for name, (file, boxes) in STAGES.items():
    im = photo(file, boxes)
    save(width(im, 800), name)
    save(width(im, 480), f'{name}-480')

# ——— la grille des toits ———
GALLERY = {
    'g29': ('2022_05_29.jpg', []),
    'g20': ('2022_05_20.jpg', []),
    'g22': ('2022_05_22.jpg', [(194, 362, 242, 400)]),           # « 118 » sur le mur
    'g45': ('2022_05_45.jpg', []),
    'g41': ('2022_05_41.jpg', [(566, 371, 586, 386)]),           # plaque près de la porte
    'g11': ('2022_05_11.jpg', [(762, 328, 788, 346)]),           # numéro sur le pilier
    'g30': ('2022_05_30.jpg', []),
    'g25': ('2022_05_25.jpg', [(688, 314, 712, 332)]),           # plaque au-dessus du garage
    'g15': ('2022_05_15.jpg', []),
    'g49': ('2022_05_49.jpg', []),
    'g42': ('2022_05_42.jpg', []),
    'gs3': ('2022_05_services3.jpg', [(158, 276, 210, 306), (140, 305, 165, 320)]),  # plaque du fourgon
    'g9': ('2022_05_9.jpg', []),
    'g24': ('2022_05_24.jpg', [(606, 355, 636, 372)]),           # numéro au-dessus du garage
    'g34': ('2022_05_34.jpg', []),
    'g33': ('2022_05_33.jpg', [(362, 268, 378, 286)]),           # plaque près de la porte
    'g40': ('2022_05_40.jpg', [(260, 402, 278, 418)]),           # numéro près de la porte
    'g44': ('2022_05_44.jpg', []),
    'gct': ('2022_05_contact.jpg', []),
    'g10': ('2022_05_10.jpg', []),
    'gs2': ('2022_05_services2.jpg', []),
}
for name, (file, boxes) in GALLERY.items():
    im = photo(file, boxes)
    save(width(im, 800), name)
    if im.width > 480:
        save(width(im, 480), f'{name}-480')

# ——— le blason (344 × 227, fond transparent) ———
crest = Image.open(SRC / '2022_05_logo.png').convert('RGBA')
save(crest, 'crest', q=82)
# le même blason inversé pour le pied de page bleu : le bleu devient blanc, le blanc devient bleu, la transparence reste
INK = (11, 27, 77)
px = crest.load()
rev = Image.new('RGBA', crest.size)
out = rev.load()
for y in range(crest.height):
    for x in range(crest.width):
        r, g, b, a = px[x, y]
        lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
        out[x, y] = tuple(round(INK[k] + (255 - INK[k]) * (1 - lum)) for k in range(3)) + (a,)
save(rev, 'crest-rev', q=82)

(ROOT / 'data').mkdir(exist_ok=True)
(ROOT / 'data/photo-sizes.json').write_text(json.dumps(SIZES, indent=1) + '\n')
