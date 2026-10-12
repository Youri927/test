"""La plaque de l'ouverture : le morceau de façade autour de l'enseigne, sans ses lettres.

Pendant l'ouverture, l'enseigne en vraies lettres recule sur la photo. La plaque cache les lettres de la photo pour
qu'elles ne se dédoublent pas avec celles du site, puis s'efface avec l'enseigne à la fin du recul, quand les lettres
sont petites : on retrouve alors la vraie enseigne, telle qu'elle est sur la photo.
Les lettres sont effacées ligne par ligne, puisque le bardage est horizontal : chaque pixel de lettre prend la médiane
des pixels sains de la même ligne (à moins de 30 px), plus le grain de la photo.
La plaque est découpée dans chaque version de la photo (même recadrage et mêmes réductions que tools/images.py), sur un
rectangle qui tombe sur des pixels entiers dans toutes les versions : elle se superpose à la photo pixel pour pixel.
Lit data/sign.json (boîtes des lettres et rectangles des plaques, en pixels de la photo d'origine) et data/photos.json.
Écrit src/img/<photo>-plate.avif et ses versions réduites, puis data/photo-sizes.json.

    python3 -I tools/plate.py <dossier des photos d'origine>
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from numpy.lib.stride_tricks import sliding_window_view
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/img'
SIGN = json.loads((ROOT / 'data/sign.json').read_text())
PHOTOS = {p['id']: p for p in json.loads((ROOT / 'data/photos.json').read_text())}
SRC = Path(sys.argv[1])

orig = np.asarray(ImageOps.exif_transpose(Image.open(SRC / SIGN['src'])).convert('RGB'))
letters = SIGN['letters']
X0 = min(b[0] for b in letters) - 60
Y0 = min(b[1] for b in letters) - 60
X1 = max(b[2] for b in letters) + 60
Y1 = max(b[3] for b in letters) + 60
reg = orig[Y0:Y1, X0:X1].astype(np.float32)


def row_median(v, r=40):
    pad = np.pad(v, ((0, 0), (r, r)), mode='edge')
    return np.median(sliding_window_view(pad, 2 * r + 1, axis=1), axis=-1)


# masque : dans les boîtes des lettres (7 px de marge), ce qui est plus sombre ou plus bleu que le bardage de la ligne
lum = reg @ np.array([0.2126, 0.7152, 0.0722], np.float32)
blue = reg[..., 2] - reg[..., 0]
inbox = np.zeros(lum.shape, bool)
for ax, ay, bx, by in letters:
    inbox[ay - 7 - Y0:by + 7 - Y0, ax - 7 - X0:bx + 7 - X0] = True
mask = (((row_median(lum) - lum > 6) | (blue - row_median(blue) > 6)) & inbox).astype(np.uint8)
mask = cv2.dilate(mask, np.ones((7, 7), np.uint8)) > 0

fill = reg.copy()
for y, x in zip(*np.nonzero(mask)):
    for h in (30, 90):
        lo, hi = max(0, x - h), min(mask.shape[1], x + h + 1)
        ok = ~mask[y, lo:hi]
        if ok.sum() >= 6:
            break
    fill[y, x] = np.median(reg[y, lo:hi][ok], axis=0)
grain = (reg - cv2.GaussianBlur(reg, (0, 0), 1.2))[~mask].std(axis=0)
noise = cv2.GaussianBlur(np.random.default_rng(7).normal(0, 1, reg.shape).astype(np.float32), (0, 0), 0.6) * 1.6 * grain
fill[mask] += noise[mask]
clean = orig.copy()
clean[Y0:Y1, X0:X1] = np.clip(fill, 0, 255).astype(np.uint8)
clean = Image.fromarray(clean)
print(f'{int(mask.sum())} pixels de lettres effacés')

for pid, rect in SIGN['plates'].items():
    p = PHOTOS[pid]
    bx0, by0, bx1, by1 = p['box']
    base = clean.crop((bx0, by0, bx1, by1))
    if base.width > p['w']:
        base = base.resize((p['w'], round(base.height * p['w'] / base.width)), Image.LANCZOS)
    q = p.get('q', 54)
    versions = [(base, f'{pid}-plate.avif', q)]
    for w in p.get('ws', []):
        if w < base.width:
            versions.append((base.resize((w, round(base.height * w / base.width)), Image.LANCZOS), f'{pid}-plate.w{w}.avif', q + 4))
    for im, name, quality in versions:
        k = im.width / (bx1 - bx0)
        r = [(rect[0] - bx0) * k, (rect[1] - by0) * k, (rect[2] - bx0) * k, (rect[3] - by0) * k]
        if any(abs(c - round(c)) > 1e-6 for c in r):
            raise SystemExit(f'{name} : le rectangle ne tombe pas sur des pixels entiers ({r})')
        im.crop(tuple(round(c) for c in r)).save(OUT / name, 'AVIF', quality=quality, speed=4)
        print(f'{name:<26} {round(r[2] - r[0])}x{round(r[3] - r[1])}  {(OUT / name).stat().st_size // 1024} Ko')

sizes = {f.stem: list(Image.open(f).size) for f in sorted(OUT.glob('*.avif')) if '.w' not in f.stem}
(ROOT / 'data/photo-sizes.json').write_text(json.dumps(sizes, indent=1) + '\n')
print(f'data/photo-sizes.json : {len(sizes)} images')
