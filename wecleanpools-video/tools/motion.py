"""Contrôle des mouvements : position au sous-pixel d'un bord, image par image, sur des images fixes du montage.
Un bord qui se déplace régulièrement donne des pas qui varient en douceur ; un « sautillement » donne des pas
irréguliers (0, 1, 0, 1…) ou des arrêts au milieu d'un mouvement.

    python3 -I tools/motion.py <dossier d'images> col <x> <y0> <y1>   bord horizontal croisé en descendant la colonne x
    python3 -I tools/motion.py <dossier d'images> row <y> <x0> <x1>   bord vertical croisé en allant vers la droite sur la ligne y
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

folder, mode, a, b, c = sys.argv[1], sys.argv[2], *map(int, sys.argv[3:6])
pos = []
for f in sorted(Path(folder).glob('*.jpg')):
    im = np.asarray(Image.open(f).convert('L'), dtype=float)
    line = im[b:c, a] if mode == 'col' else im[a, b:c]
    # le plus fort contraste le long de la ligne : le bord ; position affinée en interpolant le profil autour
    g = np.abs(np.diff(line))
    k = int(np.argmax(g))
    lo, hi = line[max(0, k - 3)], line[min(len(line) - 1, k + 4)]
    mid = (lo + hi) / 2
    seg = line[max(0, k - 3): k + 5]
    x = None
    for j in range(len(seg) - 1):
        if (seg[j] - mid) * (seg[j + 1] - mid) <= 0 and seg[j] != seg[j + 1]:
            x = max(0, k - 3) + j + (mid - seg[j]) / (seg[j + 1] - seg[j])
            break
    pos.append((f.stem, (b + x) if x is not None else None))
prev = None
steps = []
for name, p in pos:
    d = None if (p is None or prev is None) else p - prev
    if d is not None:
        steps.append(d)
    print(f'{name}  {p if p is None else round(p, 2)}  {"" if d is None else f"{d:+.2f}"}')
    prev = p
if len(steps) > 2:
    s = np.array(steps)
    jerk = np.abs(np.diff(s))
    print(f'pas : min {s.min():+.2f} max {s.max():+.2f} ; variation d’un pas au suivant : moyenne {jerk.mean():.2f}, max {jerk.max():.2f}')
