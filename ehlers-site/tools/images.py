"""Export des photos du site en AVIF, jamais agrandies.

Sources : les deux photos du projet Park Shore publiées par l'entreprise sur Houzz (2400 × 1600, servies par
st.hzcdn.com), et le portrait de son profil (208 × 208, au centre d'une image de 1200 × 1200). Rangées dans un
dossier à part :
  kitchen-2400.jpg  la cuisine
  living-2400.jpg   le séjour sur la baie
  profile-big.jpg   le portrait du profil
Écrit src/img/*.avif et data/photo-sizes.json.

    python3 -I tools/images.py <dossier des téléchargements>

Les photos sont un peu douces à 100 % : on les exporte à 2000 px de large au plus. Le séjour, voilé dans les fenêtres,
reçoit une correction légère (point noir, gamma, une pointe de saturation), sans retouche locale.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/img'
SRC = Path(sys.argv[1]).resolve()
OUT.mkdir(parents=True, exist_ok=True)
SIZES = {}


def save(im, name, q=58):
    dst = OUT / f'{name}.avif'
    im.save(dst, 'AVIF', quality=q, speed=4)
    SIZES[name] = [im.width, im.height]
    print(f'{name:<16} {im.width:>5}x{im.height:<5} {dst.stat().st_size // 1024:>4} Ko')


def width(im, w):
    """Réduit à `w` px de large ; n'agrandit jamais."""
    return im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def tone(im, black=0, g=1.0, sat=1.0, hi=0.0):
    a = np.asarray(im, float) / 255
    a = np.clip((a - black / 255) / (1 - black / 255), 0, 1) ** g
    if hi:  # adoucit un peu les hautes lumières des fenêtres, sans toucher aux ombres
        a = a - hi * np.clip(a - 0.72, 0, None) ** 2
    out = Image.fromarray((np.clip(a, 0, 1) * 255).round().astype('uint8'))
    return ImageEnhance.Color(out).enhance(sat)


# ——— le séjour sur la baie (l'accueil) ———
# on retire les 4 % de droite (le bord d'un sapin décoré) ; l'horizon de la baie reste à 40 % de la hauteur
living = tone(Image.open(SRC / 'living-2400.jpg').convert('RGB'), black=9, g=1.1, sat=1.06, hi=0.6)
living = living.crop((0, 0, 2304, 1600))
save(width(living, 2000), 'hero')
# au téléphone : la baie vitrée, les fauteuils et la baie, en hauteur (1350 × 1600 de la photo d'origine)
save(width(living.crop((880, 0, 2230, 1600)), 1200), 'hero-tall')

# ——— la cuisine ———
kitchen = tone(Image.open(SRC / 'kitchen-2400.jpg').convert('RGB'), black=4, g=1.04, sat=1.02)
save(width(kitchen, 2000), 'kitchen')

# ——— le portrait du profil : 208 × 208, montré à 96 px au plus ———
p = Image.open(SRC / 'profile-big.jpg').convert('RGB').crop((496, 496, 704, 704))
save(p, 'rick', q=70)

(ROOT / 'data').mkdir(exist_ok=True)
(ROOT / 'data/photo-sizes.json').write_text(json.dumps(SIZES, indent=1) + '\n')
