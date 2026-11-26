"""Un flacon de face (photo sur fond blanc) posé sur le fond de studio du site, au format 600 × 750, avec une ombre douce.
   python3 tools/exemple/faces.py <photo> <nom de sortie, ex. a102-face>"""
import sys, pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

RACINE = pathlib.Path(__file__).resolve().parents[2]
W, H = 600, 750
FOND = (245, 245, 244)

im = Image.open(sys.argv[1])
if im.mode in ('RGBA', 'LA', 'P'):
    im = im.convert('RGBA')
    blanc = Image.new('RGBA', im.size, (255, 255, 255, 255))
    blanc.alpha_composite(im)
    im = blanc
c = np.asarray(im.convert('RGB')).astype(float)
ecart = np.abs(c - 255).max(axis=2)
ys, xs = np.where(ecart > 12)
c = c[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
ecart = ecart[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
# détourage : le fond blanc devient transparent, et le blanc mêlé aux bords est retiré
al = np.clip((ecart - 4) / 26, 0, 1)
pur = np.where(al[..., None] > 0.05, (c - 255 * (1 - al[..., None])) / np.maximum(al[..., None], 0.05), c)
fl = Image.fromarray(np.clip(pur, 0, 255).astype(np.uint8)).convert('RGBA')
fl.putalpha(Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5)))
k = min(W * 0.72 / fl.width, H * 0.80 / fl.height)
fl = fl.resize((int(fl.width * k), int(fl.height * k)), Image.LANCZOS)
fond = Image.new('RGBA', (W, H), (*FOND, 255))
x0, y0 = (W - fl.width) // 2, H - 52 - fl.height
ombre = Image.new('L', (W, H), 0)
ImageDraw.Draw(ombre).ellipse([x0 + 16, y0 + fl.height - 12, x0 + fl.width - 16, y0 + fl.height + 14], fill=70)
noir = Image.new('RGBA', (W, H), (0, 0, 0, 0))
noir.putalpha(ombre.filter(ImageFilter.GaussianBlur(12)))
fond.alpha_composite(noir)
fond.alpha_composite(fl, (x0, y0))
fond.convert('RGB').save(RACINE / f'public/demo/{sys.argv[2]}.webp', quality=90)
print(sys.argv[2], fl.size)
