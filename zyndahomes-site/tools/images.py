"""Export des photos du site en AVIF, jamais agrandies.

Sources : les images publiques de leur site Squarespace, à la plus grande taille que sert leur CDN (2500 px de large au
plus), téléchargées telles quelles dans un dossier à part sous le nom « rang-empreinte » (29-e17d99…). Le tri des photos
(les leurs, gardées ; les images d'IA, les photos d'annonces à filigrane, les crédits d'un autre studio, écartés) est
dans ANALYSE.md. Écrit src/img/*.avif et data/photos.json (largeur et hauteur de chaque fichier).

    python3 -I tools/images.py <dossier des téléchargements>

- Couleurs : les photos prises au téléphone (la cheminée, les deux photos des carreaux en écailles) sont en Display P3 ;
  elles sont converties en sRGB (rendu colorimétrique relatif), sinon elles seraient délavées dans certains
  navigateurs. Les autres sont déjà en sRGB ou sans profil. Aucune autre retouche.
- Recadrages : le bandeau de l'accueil et sa version téléphone, les quatre photos de l'année en 4:5, les gros plans
  des détails en carré, la vasque aux carreaux en écailles sans le miroir (on y voyait la personne qui photographiait).
- Chaque photo sort en plusieurs largeurs, jamais plus grandes que l'original. La plus grande porte le nom seul.
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


def load(key, crop=None):
    file = next(p for p in SRC.iterdir() if p.name.startswith(key + '-'))
    im = Image.open(file)
    icc = im.info.get('icc_profile')
    im = im.convert('RGB')
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        if 'sRGB' not in ImageCms.getProfileDescription(src):
            im = ImageCms.profileToProfile(im, src, SRGB, renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC, outputMode='RGB')
    return im.crop(crop) if crop else im


def width(im, w):
    """Réduit à `w` px de large ; n'agrandit jamais."""
    return im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def export(name, im, widths, q=58):
    widths = sorted({min(w, im.width) for w in widths}, reverse=True)
    for i, w in enumerate(widths):
        out = width(im, w)
        n = name if i == 0 else f'{name}-{w}'
        dst = OUT / f'{n}.avif'
        out.save(dst, 'AVIF', quality=q, speed=4)
        SIZES[n] = [out.width, out.height]
        print(f'{n:<16} {out.width:>5}x{out.height:<5} {dst.stat().st_size // 1024:>4} Ko')


# ——— l'accueil : la maison neuve au bord de l'eau, côté piscine (2500 × 1656) ———
house = load('29')
export('hero', house.crop((0, 110, 2500, 1260)), (2500, 1600, 1000), q=60)        # bandeau : le pignon entier, la piscine
export('hero-m', house.crop((330, 100, 2190, 1495)), (1200, 800), q=60)           # au téléphone, en 4:3

# ——— l'année, en 4:5 ———
export('y-winter', load('08', (830, 150, 2030, 1650)), (1200, 800))               # le robinet, le marbre : les choix
export('y-may', load('12'), (810, 600))                                           # « Demo Days » : le condo démoli face au golfe
export('y-summer', load('26', (300, 150, 2300, 2650)), (1200, 800))               # la douche aux carreaux en écailles
export('y-home', load('47', (720, 0, 2045, 1656)), (1200, 800))                   # la chambre ouverte sur les palmiers

# ——— les pièces ———
for name, key, crop in (
    ('w-living', '07', None),             # le séjour, l'escalier de verre suspendu
    ('w-kitchen', '79', None),            # cuisine blanche, îlot en bois, crédence en marbre
    ('w-kitchen2', '23', None),           # cuisine blanche, îlot gris
    ('w-fire', '76', None),               # la cheminée et sa pierre bleue
    ('w-vanity', '71', (0, 560, 2500, 3333)),  # la vasque et les écailles, sans le miroir
    ('w-mosaic', '06', None),             # salle de bain en mosaïque de verre, baignoire ronde
    ('w-master', '36', None),             # salle de bain principale (série « 840 »)
    ('w-outdoor', '31', None),            # la cuisine d'extérieur de Gulf Shore Drive
    ('w-shower', '51', None),             # douche en marbre, pomme de pluie
    ('w-guest', '44', None),              # salle de bain d'invités
    ('w-guestroom', '43', None),          # chambre d'invités
    ('w-round', '50', None),              # salle de bain au plafond rond
):
    export(name, load(key, crop), (2500, 1600, 1000, 600))

# ——— les détails : gros plans carrés, pris dans les photos à 2500 px ———
for name, key, crop in (
    ('d-stone', '76', (1500, 950, 2300, 1750)),     # la flamme, le cadre bronze, la pierre bleue
    ('d-scale', '26', (500, 300, 1700, 1500)),      # les écailles et les deux pommes de douche
    ('d-faucet', '08', (900, 250, 2000, 1350)),     # le robinet et le marbre
    ('d-stair', '07', (300, 230, 950, 880)),        # les marches de verre
    ('d-kitchen', '79', (1100, 250, 1800, 950)),    # la crédence en marbre veiné
    ('d-vanity', '46', (700, 300, 1800, 1400)),     # mitigeur chromé, mosaïque et marbre
):
    export(name, load(key, crop), (1000, 520))

# ——— la famille ———
export('family', load('35'), (1600, 1000, 600))

(ROOT / 'data').mkdir(exist_ok=True)
(ROOT / 'data/photos.json').write_text(json.dumps(SIZES, indent=1, sort_keys=True))
print(len(SIZES), 'fichiers')
