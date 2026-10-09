"""Leur logo sans son fond : le fichier de leur site est une capture d'écran sur fond bleu nuit uni (#001e38).
L'opacité de chaque pixel vient de son écart au fond, la couleur est « dé-prémultipliée » ; le pied de page
peut alors poser le logo sur le bleu nuit du site sans rectangle autour.

    python3 -I tools/logo.py <logo d'origine, jpg> src/assets/brand/logo.avif
"""
import sys

import numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
bg = np.array([0x00, 0x1E, 0x38], np.float32)
# écart au fond, rapporté à l'écart maximal possible vers le blanc, canal par canal
a = np.max((im - bg) / (255.0 - bg), axis=2)
a = np.clip((a - 0.06) / 0.94, 0, 1)  # le grain du JPEG autour du fond disparaît
fg = np.clip((im - (1 - a[..., None]) * bg) / np.maximum(a[..., None], 1e-3), 0, 255)
img = Image.fromarray(np.dstack([fg, a * 255]).astype(np.uint8), 'RGBA')
img = img.crop(img.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox())
w = 420
img = img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
img.save(out, 'AVIF', quality=62)
print(out, img.size)
