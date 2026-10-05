"""Prépare les photos de chantier du site actuel : étalonnage commun léger, export WebP.

Les originaux viennent de poolremodelingscottsdaleaz.com (wp-content/uploads/2025/03). Les trois photos de
1 200 px de large ont d'abord été agrandies ×2 par super-résolution (EDSR, OpenCV), sans retouche du contenu.
Le cadrage se fait dans la page (object-position) : les images gardent leur cadre d'origine.
La photo « Small-pool-project-scottsdale-arizona.jpg » n'est pas utilisée : elle porte le filigrane d'un autre
constructeur (« Pools by Design »).

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

# sortie, source, largeur maximale, qualité WebP
JOBS = [
    ('noon',       'Scottsdale-Pool-remodeling-1.jpg',                 2200, 80),  # accueil
    ('view',       'Pool-Remodeling-Scottsdale.jpg',                   1800, 80),  # Remodel
    ('crew',       'Wave-at-job-site.jpg',                             2000, 80),  # Resurface
    ('shell',      'Proj1_Pool_A-Used.jpg',                            1600, 80),  # Build : la coque
    ('freeform',   'Free-form-pool-finished-by-wave-in-scottsdale.jpg', 1800, 80),  # Build : terminé
    ('golden',     'Pool-Construction-Scottsdale-Az.jpg',              2000, 80),  # la saison
    ('completed',  'Completed-project-by-Wave-in-Scottsdale.jpg',      1800, 80),
    ('waterfall',  'free-form-pool-finished-project-in-scottsdale.jpg', 1800, 80),
    ('clouds',     'Pool-remodeling-Scottsdale-Project.jpg',           1800, 80),
    ('green',      'square-form-pool-project-in-scottsdale-az.jpg',    1800, 80),
]


def source(name):
    up = UP / (Path(name).stem + '.png')
    return Image.open(up if up.exists() else ORIG / name).convert('RGB'), up.exists()


def grade(im):
    """Étalonnage commun, volontairement léger : ciels calmés, noirs à peine relevés, hautes lumières adoucies."""
    a = np.asarray(im).astype(np.float32) / 255
    lum = a @ np.array([.2126, .7152, .0722], np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # ciel : bleu dominant et clair (l'eau des bassins, plus verte, est épargnée)
    sky = np.clip((b - r) * 2.2, 0, 1) * np.clip((b - g) * 5, 0, 1) * np.clip((lum - .35) * 2.5, 0, 1)
    sat = .97 - .16 * sky
    a = lum[..., None] + (a - lum[..., None]) * sat[..., None]
    # courbe douce : noirs relevés de 1,5 %, épaule sur les hautes lumières
    a = .015 + a * .985
    a = np.where(a > .78, .78 + (a - .78) * (1 - .32 * (a - .78) / .22), a)
    # une pointe de chaleur dans les lumières, de fraîcheur dans les ombres
    w = np.clip(lum, 0, 1)[..., None]
    a = a + (w - .5) * np.array([.018, .006, -.02], np.float32)
    return Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8))


for out, name, maxw, q in JOBS:
    im, upscaled = source(name)
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    im = grade(im).filter(ImageFilter.UnsharpMask(radius=1.0, percent=35, threshold=2))
    path = OUT / f'{out}.webp'
    im.save(path, 'WEBP', quality=q, method=6)
    print(f'{out:10} {im.width}×{im.height} {"agrandie" if upscaled else "originale":9} {path.stat().st_size // 1024} Ko')
