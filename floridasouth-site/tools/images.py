"""Export des photos du site en AVIF, jamais agrandies.

Sources : les images publiques de leur site Squarespace, à la plus grande taille que sert leur CDN (2 500 px de large),
téléchargées telles quelles dans un dossier à part sous le nom « rang-nom d'origine » (27-IMG_0343.jpg…).
Écrit src/img/*.avif et data/photo-sizes.json.

    python3 -I tools/images.py <dossier des téléchargements>

- Couleurs : les photos de 2015, le portrait et la photo d'équipe sont en Adobe RGB ; elles sont converties en sRGB
  (rendu colorimétrique relatif), sinon le navigateur les afficherait ternes et le ciel de l'accueil ne raccorderait
  pas avec le fond de la page. Celles de 2016 n'ont pas de profil (sRGB). Aucune autre retouche.
- Recadrages : l'accueil au téléphone (l'angle du débord et la colonne), la maison sur pilotis en bandeau (moins de
  ciel et de terre).
- Chaque photo sort en deux ou trois largeurs, jamais plus grandes que l'original. La plus grande porte le nom seul.
- Vérifié image par image : aucun numéro de maison, aucune plaque. Pas de photo de banque d'images, pas de logo de
  marque en gros plan (la scie à onglets est écartée pour ça).
"""
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageCms

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/img'
SRC = Path(sys.argv[1]).resolve()
OUT.mkdir(parents=True, exist_ok=True)
SIZES = {}
SRGB = ImageCms.createProfile('sRGB')


def load(file, crop=None):
    im = Image.open(SRC / file)
    icc = im.info.get('icc_profile')
    im = im.convert('RGB')
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        im = ImageCms.profileToProfile(im, src, SRGB, renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC, outputMode='RGB')
    return im.crop(crop) if crop else im


def width(im, w):
    """Réduit à `w` px de large ; n'agrandit jamais."""
    return im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def export(name, im, widths, q=56):
    widths = sorted({min(w, im.width) for w in widths}, reverse=True)
    for i, w in enumerate(widths):
        out = width(im, w)
        n = name if i == 0 else f'{name}-{w}'
        dst = OUT / f'{n}.avif'
        out.save(dst, 'AVIF', quality=q, speed=4)
        SIZES[n] = [out.width, out.height]
        print(f'{n:<18} {out.width:>5}x{out.height:<5} {dst.stat().st_size // 1024:>4} Ko')


# ——— l'accueil : les deux angles de débords blancs contre le ciel (2015) ———
hero = load('27-IMG_0343.jpg')
export('hero', hero, (2500, 1600, 1000), q=60)
# au téléphone : l'angle de gauche et la colonne, le ciel en haut
export('hero-m', hero.crop((0, 0, 1500, 1667)), (1200, 800), q=60)

# ——— ce qu'on fait : la taille de la photo suit celle du chantier ———
export('hanger', load('40-image-asset.jpeg'), (1200, 700))                       # étrier et boulons sous la terrasse
export('framing', load('15-IMG_0072.jpg'), (1600, 900))                          # l'ossature d'un couloir, 2016
house = load('18-IMG_0324.jpg')
export('house', house.crop((0, 150, 2500, 1400)), (2500, 1600, 1000), q=58)      # bandeau 2:1, sans le trop de terre
export('house-m', house.crop((240, 120, 2260, 1636)), (1200, 800))               # au téléphone, en 4:3

# ——— la maison sur pilotis, photographiée en 2015 ———
for name, file in (
    ('r-sign', '19-IMG_0327.jpg'),       # le panneau du chantier
    ('r-eaves', '26-IMG_0341.jpg'),      # débords et gouttières au-dessus des colonnes
    ('r-porch', '20-IMG_0335.jpg'),      # le porche, l'échafaudage encore là
    ('r-palms', '23-IMG_0337.jpg'),      # les palmiers royaux
    ('r-siding', '30-IMG_0358.jpg'),     # bardage et fenêtre sous le débord
    ('r-shutter', '22-IMG_0336.jpg'),    # un volet bahamien
    ('r-deck', '28-IMG_0355.jpg'),       # le porche couvert et l'ossature de la terrasse
):
    export(name, load(file), (1800, 900))

# ——— la maison en blocs, photographiée en 2016 ———
for name, file in (
    ('b-pines', '08-IMG_0059.jpg'),      # murs en blocs et porches, dans les pins
    ('b-columns', '07-IMG_0057.jpg'),    # colonnes du porche et fermes, avant les sous-faces
    ('b-through', '06-IMG_0056.jpg'),    # à travers le porche, l'intérieur
    ('b-trusses', '11-IMG_0063.jpg'),    # les fermes au-dessus de la grande pièce
    ('b-ducts', '16-IMG_0074.jpg'),      # gaines, câbles et tuyaux avant les plaques
    ('b-walls', '17-IMG_0079.jpg'),      # les cloisons en ossature bois
    ('b-room', '13-IMG_0067.jpg'),       # une pièce, fenêtres posées
    ('b-window', '12-IMG_0065.jpg'),     # l'ossature près d'une fenêtre (verticale)
):
    export(name, load(file), (1800, 900))

# ——— Judson ———
export('judson', load('33-JudsonWhite'), (990, 600))                             # portrait carré, 990 px au plus
export('team', load('41-image-asset.jpeg'), (1600, 900))                         # Judson, à droite, et un membre de l'équipe

(ROOT / 'data').mkdir(exist_ok=True)
(ROOT / 'data/photo-sizes.json').write_text(json.dumps(SIZES, indent=1, sort_keys=True))
print(len(SIZES), 'fichiers')
