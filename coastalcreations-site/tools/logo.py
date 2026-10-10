"""Leur logo sans son fond : le fichier de leur site est une capture d'écran sur fond bleu nuit uni (#001e38).
L'opacité de chaque pixel vient de son écart au fond, la couleur est « dé-prémultipliée ».
Deux versions :
  - pour fond sombre (pied de page) : les couleurs d'origine, blanc et aqua ;
  - pour fond clair (en-tête) : le blanc devient le bleu nuit de leur marque, l'aqua devient un aqua plus soutenu.

    python3 -I tools/logo.py <logo d'origine, jpg> src/img
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

src, out = sys.argv[1], Path(sys.argv[2])
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
bg = np.array([0x00, 0x1E, 0x38], np.float32)
# écart au fond, rapporté à l'écart maximal possible vers le blanc, canal par canal
a = np.max((im - bg) / (255.0 - bg), axis=2)
a = np.clip((a - 0.06) / 0.94, 0, 1)  # le grain du JPEG autour du fond disparaît
fg = np.clip((im - (1 - a[..., None]) * bg) / np.maximum(a[..., None], 1e-3), 0, 255)


def save(rgb, name):
    img = Image.fromarray(np.dstack([rgb, a * 255]).astype(np.uint8), 'RGBA')
    img = img.crop(img.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox())
    w = 420
    img = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
    img.save(out / name, 'AVIF', quality=62)
    print(out / name, img.size)


save(fg, 'logo.avif')

# fond clair : la saturation sépare le blanc (lettres) de l'aqua (vagues, « POOLS AND LAGOONS »)
mx, mn = fg.max(axis=2), fg.min(axis=2)
sat = (mx - mn) / np.maximum(mx, 1)
k = np.clip((sat - 0.15) / 0.2, 0, 1)[..., None]
navy = np.array([0x0C, 0x24, 0x3C], np.float32)
aqua = np.array([0x1F, 0x9F, 0xC4], np.float32)
save(navy * (1 - k) + aqua * k, 'logo-light.avif')
