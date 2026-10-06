"""Prépare les photos du site actuel (camerondentalstudio.com) pour la maquette : export WebP.

- Les photos des patients (avant / après) ne sont ni retouchées ni étalonnées : seulement redimensionnées.
  Elles font 430 × 536 px (visages) et 385 × 246 px (gros plans) à l'origine ; elles ont été agrandies ×2
  par super-résolution (EDSR, OpenCV) avant export.
- Les portraits des dentistes de 275 à 547 px ont été agrandis de la même façon.
- Les photos du cabinet sont seulement redimensionnées, avec un léger renforcement de netteté.

    python3 tools/images.py <dossier des originaux> <dossier des agrandies>
"""
import sys
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps

ORIG = Path(sys.argv[1])
UP = Path(sys.argv[2])
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src' / 'img'
OUT.mkdir(parents=True, exist_ok=True)

# sortie, source, largeur maximale, qualité
PHOTOS = [
    ('mirror', 'dr-cameron-with-patient.avif', 1500, 80),
    ('shade', 'three.avif', 1300, 78),
    ('rootcanal', 'root-canal-naples_desktop.jpg', 1800, 78),
    ('xray', 'dr-al-xrays-2a.avif', 1400, 78),
    ('kid', 'IMG_3715-scaled-1-e1760392104527.avif', 1100, 78),
    ('building', 'cameron-dental-building-2.avif', 1500, 78),
    ('team', 'Cameron-Dental-Studio-staff-image-stairs-2-768x576-1.avif', 1536, 80),
    ('waiting', 'IMG_3641-scaled.jpg', 1500, 76),
    ('desk', 'IMG_3567.jpg', 1400, 76),
    ('art', 'IMG_3645.jpg', 1200, 76),
    ('hall', 'IMG_3646.jpg', 1100, 76),
    ('cbct', 'IMG_3611-scaled-e1752787983246.jpg', 1200, 76),
    ('dr-cameron', 'Dr.-Andrea-Cameron.jpg', 900, 80),
    ('dr-djindil', 'IMG_3561-scaled-e1708028912200.jpg', 900, 80),
    ('dr-goncalves', 'DrFlaviaGoncalves.png', 600, 80),
    ('dr-martinez', 'Headshot-6.21.26-crop.jpg', 550, 80),
    ('dr-tardibuono', 'Dr-Tardibuono.jpg', 600, 80),
    ('cover-social', 'Gulfshore-Life-social-register.webp', 700, 80),
    ('cover-taste', 'Gulfshore-Life-2-1.webp', 700, 80),
    ('cover-ni', 'Ingrid-Aielli.webp', 700, 80),
    # paires avant / après de leur page galerie (« More smiles ») : esthétique, implants
    ('cos-b', 'naples-cosmetic-dentistry-before2.jpg', 780, 78),
    ('cos-a', 'naples-cosmetic-dentistry-after2.jpg', 780, 78),
    ('imp-b', 'dental-implants-1-before.jpg', 980, 78),
    ('imp-a', 'dental-implants-1-after.jpg', 980, 78),
]

# les 18 cas complets de leur galerie : visage avant, visage après, gros plan avant, gros plan après
CASES = [
    ('Shelly-Gertge-Before-Face.jpg', 'Shelly-Gertgen-Face-After.jpg', 'Shelly-Gertgen-Before.jpg', 'Shelly-Gertge-After-1.jpg'),
    ('KEN-CAMERON-Before-Face-adj.jpg', 'KEN-CAMERON-After-Face-adj.jpg', 'KEN-CAMERON-Before.png', 'KEN-CAMERON-After.png'),
    ('before-speros.jpg', 'after-speros.jpg', 'before-close-speros.jpg', 'after-close-speros.jpg'),
    ('before-andrew.jpg', 'andrew-after.jpg', 'before-close-andrew.jpg', 'after-close-andrew.jpg'),
    ('before-celia.jpg', 'after-celia.jpg', 'before-close-celia.jpg', 'after-close-celia.jpg'),
    ('Linda-Ouimet-Before-Face-adj.jpg', 'Linda-Ouimet-After-Face-adj.jpg', 'Linda-Ouimet-Before-adj.jpg', 'Linda-Ouimet-After-adj.jpg'),
    ('veneers-face-before.jpg', 'veneers-face-after.jpg', 'veneers-close-before.jpg', 'veneers-close-after.jpg'),
    ('arthur-before.jpg', 'arthur-after.jpg', 'arthur-close-before.jpg', 'arthur-close-after.jpg'),
    ('barbara-before.jpg', 'barbara-after.jpg', 'barbara-close-before.jpg', 'barbara-close-after.jpg'),
    ('renne-face-before.jpg', 'renne-face-after.jpg', 'renne-before.jpg', 'renne-after.jpg'),
    ('gillman-before-smile.jpg', 'gillman-after-smile.jpg', 'gillman-before.jpg', 'gillman-after.jpg'),
    ('yvonne-face-before.jpg', 'yvonne-face-after.jpg', 'yvonne-before.jpg', 'yvonne-after.jpg'),
    ('Donald-Rebello-Before-Face-adj.jpg', 'Donald-Rebello-After-Face-adj.jpg', 'Donald-Rebello-Before.png', 'Donald-Rebello-After.png'),
    ('George-Pfotenhauer-Before-Face.avif', 'George-Pfotenhauer-After-Face.avif', 'George-Pfotenhauer-Before.avif', 'George-Pfotenhauer-After.avif'),
    ('Hayden-Boudreaus-Before-Face-adj.jpg', 'Hayden-Boudreaus-After-Face-adj.jpg', 'Hayden-Boudreaus-Before.png', 'Hayden-Boudreaus-After-close.jpg'),
    ('Jeffrey-Bowen-Before-Face.avif', 'Jeffrey-Bowen-After-Face.avif', 'Jeffrey-Bowen-Before.avif', 'Jeffrey-Bowen-After.avif'),
    ('duncan-face-before.jpg', 'duncan-face-after.jpg', 'duncan-close-before.jpg', 'duncan-close-after.jpg'),
    ('Melinda-Thomas-Before-Face-adj.jpg', 'Melinda-Thomas-After-Face-adj.jpg', 'Melinda-Thomas-Before-adj.jpg', 'Melinda-Thomas-After-adj.jpg'),
]
FACE = (480, 600)   # 4:5
CLOSE = (720, 460)  # ~ 1.565:1, comme les originaux


def source(name):
    up = UP / (Path(name).stem + '.png')
    return Image.open(up if up.exists() else ORIG / name).convert('RGB'), up.exists()


def fit(im, size):
    """Recadre au centre au format voulu, puis réduit."""
    return ImageOps.fit(im, size, Image.LANCZOS, centering=(0.5, 0.45))


report = []
for out, name, maxw, q in PHOTOS:
    im, up = source(name)
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    if not up:
        im = im.filter(ImageFilter.UnsharpMask(radius=1.0, percent=30, threshold=2))
    p = OUT / f'{out}.webp'
    im.save(p, 'WEBP', quality=q, method=6)
    report.append(f'{out:14} {im.width}×{im.height} {"agrandie" if up else "originale":9} {p.stat().st_size // 1024} Ko')

up_count = 0
for i, names in enumerate(CASES, 1):
    for kind, name in zip(('fb', 'fa', 'cb', 'ca'), names):
        im, up = source(name)
        up_count += up
        im = fit(im, FACE if kind[0] == 'f' else CLOSE)
        p = OUT / f'case{i:02d}-{kind}.webp'
        im.save(p, 'WEBP', quality=74, method=6)
total = sum(f.stat().st_size for f in OUT.glob('case*.webp'))
report.append(f'18 cas : {len(CASES) * 4} images, dont {up_count} agrandies, {total // 1024} Ko au total')
print('\n'.join(report))
