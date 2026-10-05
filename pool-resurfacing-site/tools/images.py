"""Prépare les photos de chantier : recadrage par point focal, étalonnage commun, export WebP.

Les photos d'origine viennent du site actuel (poolresurfacingscottsdale.com) : ce sont des photos de
téléphone de 680 à 1024 px de large. Elles ont d'abord été agrandies ×2 (super-résolution EDSR,
OpenCV), sans retouche du contenu.

    python3 tools/images.py <dossier des originaux> <dossier des agrandies>
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ORIG = Path(sys.argv[1])
UP = Path(sys.argv[2])
OUT = Path(__file__).resolve().parent.parent / 'src' / 'img'
OUT.mkdir(parents=True, exist_ok=True)

# sortie, source, rapport largeur/hauteur, point focal (x, y), largeur maximale, zoom (facultatif)
JOBS = [
    ('s-resurfacing', 'pool-resurfacing-service-arizona-scottsdale.webp',           4 / 3, (.5, .55), 1400),
    ('s-remodeling',  'pool-remodeling-service-arizona-scottsdale.webp',            4 / 3, (.5, .55), 1400),
    ('s-plastering',  'pool-plastering-service-arizona-scottsdale.webp',            4 / 3, (.5, .55), 1400),
    ('s-equipment',   'pool-equipment-installation-service-arizona-scottsdale.webp', 4 / 3, (.45, .6), 1400),
    ('s-deck',        'pool-deck-resurfacing-service-arizona-scottsdale.webp',      4 / 3, (.5, .5), 1400),
    ('w-refill',      'pool-arizona-scottsdale-body1.webp',                         4 / 5, (.36, .5), 1000),
    ('w-spa',         'pool-arizona-scottsdale-body2.webp',                         4 / 5, (.62, .6), 1000),
    ('w-night',       'pool-arizona-scottsdale-body3.webp',                         4 / 5, (.5, .55), 1000, 1.05),
    ('w-cactus',      'pool-in-arizona-with-cactus.jpeg',                           4 / 5, (.36, .8), 1000),
]


def source(name):
    up = UP / (Path(name).stem + '.png')
    return Image.open(up if up.exists() else ORIG / name).convert('RGB'), up.exists()


def crop(im, ratio, focal, zoom=1):
    w, h = im.size
    if w / h > ratio:
        cw, ch = round(h * ratio), h
    else:
        cw, ch = w, round(w / ratio)
    cw, ch = round(cw / zoom), round(ch / zoom)
    x = min(max(round(focal[0] * w - cw / 2), 0), w - cw)
    y = min(max(round(focal[1] * h - ch / 2), 0), h - ch)
    return im.crop((x, y, x + cw, y + ch))


def grade(im):
    """Étalonnage commun : bleus de téléphone calmés, noirs à peine relevés, lumière de fin d'après-midi."""
    a = np.asarray(im).astype(np.float32) / 255
    lum = a @ np.array([.2126, .7152, .0722], np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    blueish = np.clip((b - r) * 2.0, 0, 1)
    sat = .94 - .14 * blueish
    a = lum[..., None] + (a - lum[..., None]) * sat[..., None]
    # l'eau trop violette des photos tire vers le turquoise
    a[..., 0] = a[..., 0] - 0.02 * blueish
    a[..., 1] = a[..., 1] + 0.035 * blueish
    a = .02 + a * .97
    a = a + .04 * np.sin((a - .5) * np.pi) * (1 - np.abs(a - .5) * 1.2)
    w = np.clip(lum, 0, 1)[..., None]
    a = a + (w - .45) * np.array([.024, .008, -.026], np.float32)
    return Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8))


for out, name, ratio, focal, maxw, *zoom in JOBS:
    im, upscaled = source(name)
    im = crop(im, ratio, focal, *zoom)
    if im.width > maxw:
        im = im.resize((maxw, round(maxw / ratio)), Image.LANCZOS)
    im = grade(im).filter(ImageFilter.UnsharpMask(radius=1.1, percent=40, threshold=2))
    path = OUT / f'{out}.webp'
    im.save(path, 'WEBP', quality=80, method=6)
    print(f'{out:14} {im.width}×{im.height} {"agrandie" if upscaled else "originale"} {path.stat().st_size // 1024} Ko')
