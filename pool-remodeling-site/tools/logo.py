"""Vectorise le logo WAVE à partir de leur fichier d'origine (Square.png, 1000 × 1000) : src/logo.svg.

Le tracé suit le fichier au pixel près (potrace). Deux symboles :
  - #wave-mark : le croissant bleu marine et le palmier (classe lg-navy), le croissant vert citron (lg-lime) ;
  - #wave-word : le mot WAVE.
Les couleurs sont laissées à la feuille de style, pour passer du marine au sable sur fond sombre.

    pip install potracer
    python3 tools/logo.py <chemin de Square.png>
"""
import sys
from pathlib import Path

import numpy as np
import potrace
from PIL import Image

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / 'src' / 'logo.svg'
S = 3  # suréchantillonnage avant tracé : courbes plus fidèles

im = Image.open(SRC).convert('RGBA')
im = im.resize((im.width * S, im.height * S), Image.LANCZOS)
a = np.asarray(im).astype(int)
opaque = a[..., 3] > 128
navy = opaque & (a[..., 2] > 70) & (a[..., 1] < 160)
lime = opaque & (a[..., 1] > 150) & (a[..., 2] < 90)
cut = 720 * S  # le mot commence sous cette ligne
mark, word = navy.copy(), navy.copy()
mark[cut:] = False
word[:cut] = False


def bbox(*masks):
    m = np.logical_or.reduce(masks)
    ys, xs = np.where(m)
    return xs.min() / S, ys.min() / S, (xs.max() + 1) / S, (ys.max() + 1) / S


def trace(mask, ox, oy):
    bm = potrace.Bitmap(~mask)  # potracer trace le « noir » : on lui passe le masque inversé
    curves = bm.trace(turdsize=20, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0,
                      opticurve=True, opttolerance=0.3)
    f = lambda p: f'{p.x / S - ox:.1f} {p.y / S - oy:.1f}'.replace('.0 ', ' ').removesuffix('.0')
    d = []
    for c in curves:
        d.append('M' + f(c.start_point))
        for seg in c.segments:
            d.append(f'L{f(seg.c)}L{f(seg.end_point)}' if seg.is_corner
                     else f'C{f(seg.c1)} {f(seg.c2)} {f(seg.end_point)}')
        d.append('Z')
    return ''.join(d)


mx0, my0, mx1, my1 = bbox(mark, lime)
wx0, wy0, wx1, wy1 = bbox(word)
svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">'
    f'<symbol id="wave-mark" viewBox="0 0 {mx1 - mx0:.0f} {my1 - my0:.0f}">'
    f'<path class="lg-navy" fill-rule="evenodd" d="{trace(mark, mx0, my0)}"/>'
    f'<path class="lg-lime" d="{trace(lime, mx0, my0)}"/></symbol>'
    f'<symbol id="wave-word" viewBox="0 0 {wx1 - wx0:.0f} {wy1 - wy0:.0f}">'
    f'<path fill-rule="evenodd" d="{trace(word, wx0, wy0)}"/></symbol>'
    '</svg>'
)
OUT.write_text(svg)
print(f'{OUT.name}: marque {mx1 - mx0:.0f}×{my1 - my0:.0f}, mot {wx1 - wx0:.0f}×{wy1 - wy0:.0f}, {len(svg) // 1024} Ko')
