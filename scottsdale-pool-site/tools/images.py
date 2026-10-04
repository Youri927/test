"""Prépare les photos de la maquette : recadrage par point focal, étalonnage commun, export WebP.

Les photos d'origine viennent des galeries du site actuel (scottsdalepoolpatiolandscape.com).
Les plus petites ont d'abord été agrandies ×2 (super-résolution EDSR, OpenCV), sans retouche du contenu.

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
    ('hero',        'Scottsdale-swimming-pool-fire-pit.jpeg',      3 / 2, (.5, .5),  1920),
    ('d-pools',     'Custom-Patio-designs-in-Scottsdale-AZ.jpg',   4 / 5, (.42, .55), 1400),
    ('d-landscape', 'Pool-contractor-Scottsdale.jpg',              4 / 5, (.5, .5),  1400),
    ('d-living',    'Scottsdale-patio-cabanas.jpg',                4 / 5, (.5, .55), 1400),
    ('e-plan',      '3D-Pools-Design-in-Scottsdale.jpg',           4 / 5, (.42, .6), 900),
    ('e-water',     'Scottsdale-grotto-swimming-pool.jpg',         4 / 5, (.56, .42), 900, 1.25),
    ('e-stone',     'Scottsdale-outdoor-pools.jpg',                4 / 5, (.36, .72), 900, 1.45),
    ('e-fire',      'Scottsdale-swimming-pool-fire-pit.jpeg',      4 / 5, (.5, .8),  900, 1.6),
    ('e-shade',     'Scottsdale-Patio-Design.jpg',                 4 / 5, (.2, .5),  900),
    ('e-living',    'Scottsdale-Patio-Design-Contractor.jpg',      4 / 5, (.5, .55), 900),
    ('e-green',     'Scottsdale-pool-tile-waterline.jpg',          4 / 5, (.68, .55), 900),
    ('w-01',        'Scottsdale-Patio-Design.jpg',                 3 / 2, (.5, .55), 1600),
    ('w-02',        'Scottsdale-outdoor-pools.jpg',                4 / 5, (.48, .55), 1200),
    ('w-03',        'Scottsdale-grotto-swimming-pool.jpg',         3 / 2, (.5, .41), 1600, 1.55),
    ('w-04',        'Scottsdale-fire-pit-in-swimming-pool.jpg',    4 / 3, (.42, .55), 1400),
    ('w-05',        'Modern-pool-designer-in-Scottsdale.jpg',      3 / 2, (.5, .55), 1600),
    ('w-06',        'Scottsdale-landscape-swimming-pool.jpg',      4 / 5, (.62, .5), 1200),
    ('w-07',        'Scottsdale-spanish-style-pools.jpg',          3 / 2, (.5, .5),  1600),
    ('w-08',        'Scottsdale-pools-with-baja-shelf.jpg',        4 / 3, (.45, .55), 1400),
    ('w-09',        'Scottsdale-pool-tile-waterline.jpg',          3 / 2, (.5, .5),  1600),
    ('w-10',        'Scottsdale-Pool-Patio-Landscape-Design.jpg',  4 / 5, (.43, .55), 1200),
    ('p-1',         'Modern-pool-designer-in-Scottsdale.jpg',      4 / 5, (.42, .6), 1200),
    ('p-3',         'Scottsdale-pool-coping-edges.jpg',            4 / 5, (.63, .62), 1200),
    ('p-4',         'Scottsdale-baja-pool.jpg',                    4 / 5, (.46, .6), 1200),
]


def source(name):
    up = UP / (Path(name).stem + '.jpg')
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
    """Étalonnage commun : couleurs un peu moins criardes, noirs à peine relevés, lumières chaudes."""
    a = np.asarray(im).astype(np.float32) / 255
    lum = a @ np.array([.2126, .7152, .0722], np.float32)
    # bleus et cyans des bassins souvent saturés à l'excès : on les calme davantage
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    blueish = np.clip((b - r) * 2.2, 0, 1)
    sat = .9 - .1 * blueish
    a = lum[..., None] + (a - lum[..., None]) * sat[..., None]
    # courbe douce : noirs à 2,5 %, léger contraste au milieu
    a = .025 + a * .965
    a = a + .045 * np.sin((a - .5) * np.pi) * (1 - np.abs(a - .5) * 1.2)
    # virage : ombres légèrement froides, hautes lumières légèrement chaudes
    w = np.clip(lum, 0, 1)[..., None]
    a = a + (w - .45) * np.array([.028, .010, -.03], np.float32)
    return Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8))


for out, name, ratio, focal, maxw, *zoom in JOBS:
    im, upscaled = source(name)
    im = crop(im, ratio, focal, *zoom)
    if im.width > maxw:
        im = im.resize((maxw, round(maxw / ratio)), Image.LANCZOS)
    im = grade(im).filter(ImageFilter.UnsharpMask(radius=1.1, percent=45, threshold=2))
    path = OUT / f'{out}.webp'
    im.save(path, 'WEBP', quality=80, method=6)
    print(f'{out:12} {im.width}×{im.height} {"agrandie" if upscaled else "originale"} {path.stat().st_size // 1024} Ko')
