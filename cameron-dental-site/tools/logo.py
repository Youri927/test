"""Vectorise la dent du logo Cameron Dental Studio (leur fichier CAMERON-DENTAL-STUDIO-Naples-Logo.png) : src/logo.svg.

Seul le dessin de la dent est repris, au pixel près (potrace) ; le nom est composé dans la police du site.
La couleur est laissée à la feuille de style (currentColor).

    pip install potracer
    python3 tools/logo.py <chemin du logo PNG>
"""
import sys
from pathlib import Path

import numpy as np
import potrace
from PIL import Image

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / 'src' / 'logo.svg'
S = 3

im = Image.open(SRC).convert('RGBA')
im = im.resize((im.width * S, im.height * S), Image.LANCZOS)
a = np.asarray(im).astype(int)
tooth = (a[..., 3] > 110) & (a[..., 2] > 120) & (a[..., 0] < 150) & (a[..., 2] - a[..., 0] > 50)
tooth[:, 330 * S:] = False  # le texte commence à droite de la dent
ys, xs = np.where(tooth)
x0, y0, x1, y1 = xs.min() / S, ys.min() / S, (xs.max() + 1) / S, (ys.max() + 1) / S

bm = potrace.Bitmap(~tooth)
curves = bm.trace(turdsize=30, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.1, opticurve=True, opttolerance=0.35)
f = lambda p: f'{p.x / S - x0:.1f} {p.y / S - y0:.1f}'
d = []
for c in curves:
    d.append('M' + f(c.start_point))
    for seg in c.segments:
        d.append(f'L{f(seg.c)}L{f(seg.end_point)}' if seg.is_corner else f'C{f(seg.c1)} {f(seg.c2)} {f(seg.end_point)}')
    d.append('Z')
w, h = x1 - x0, y1 - y0
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" style="display:none"><symbol id="tooth" viewBox="0 0 {w:.0f} {h:.0f}">'
       f'<path fill="currentColor" fill-rule="evenodd" d="{"".join(d)}"/></symbol></svg>')
OUT.write_text(svg)
print(f'{OUT.name}: dent {w:.0f}×{h:.0f}, {len(curves)} tracés, {len(svg) // 1024} Ko')
