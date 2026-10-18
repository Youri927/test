"""Vectorise le logo de Zynda à partir de leurs deux fichiers publiés (potrace, au pixel près, sans rien redessiner) :
- l'emblème rond (« zynda__logo (1).jpg », 1700 × 2200) : l'anneau, son texte en réserve (« ZYNDA CUSTOM HOMES AND
  REMODELING INC. ») et le Z didone au centre ;
- le mot « ZYNDA » et la ligne « CUSTOM HOMES & REMODELING INC. » du logo horizontal (« Zynda Logo Full Size.jpg »,
  1901 × 500), sans les deux filets ni le petit emblème.

Écrit data/logo.json : pour chaque pièce, sa largeur, sa hauteur et son tracé (remplissage pair-impair, la couleur est
laissée à la feuille de style).

    python3 -I tools/logo.py <emblème.jpg> <logo horizontal.jpg> [aperçu.svg]
"""
import json
import sys
from pathlib import Path

import numpy as np
import potrace
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
S = 2  # on suréchantillonne et on adoucit à peine avant le seuil : le contour suit l'anticrénelage, pas le bruit JPEG


def trace(path, box, turd=40):
    im = Image.open(path).convert('L').crop(box)
    im = im.resize((im.width * S, im.height * S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.9 * S))
    ink = np.asarray(im) < 128
    ys, xs = np.where(ink)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    # potracer prend l'encre à False : on lui passe le négatif
    curves = potrace.Bitmap(~ink).trace(turdsize=turd * S * S, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
                                       alphamax=1.1, opticurve=True, opttolerance=0.4)
    # au pixel du fichier source : l'emblème fait 1240 unités, un pixel d'écran en vaut 10 à 30, l'arrondi ne se voit pas
    f = lambda p: f'{(p.x - x0) / S:.0f} {(p.y - y0) / S:.0f}'
    d = []
    for c in curves:
        d.append('M' + f(c.start_point))
        for seg in c.segments:
            d.append(f'L{f(seg.c)}L{f(seg.end_point)}' if seg.is_corner else f'C{f(seg.c1)} {f(seg.c2)} {f(seg.end_point)}')
        d.append('Z')
    d = ''.join(d)
    w, h = (x1 - x0) / S, (y1 - y0) / S
    print(f'{Path(path).name[:24]:<24} {w:.0f}×{h:.0f}  {len(curves)} contours  {len(d) // 1024} Ko')
    return {'w': round(w, 1), 'h': round(h, 1), 'd': d}


emblem_src, wide_src = sys.argv[1], sys.argv[2]
out = {
    # l'emblème seul, avec une marge autour (le cadre est recalculé sur l'encre)
    'emblem': trace(emblem_src, (150, 380, 1550, 1800)),
    # le mot, puis la ligne du dessous ; les filets (en haut et en bas du fichier) sont hors cadre
    'word': trace(wide_src, (440, 20, 1901, 368)),
    'line': trace(wide_src, (440, 370, 1901, 482), turd=8),
}
(ROOT / 'data').mkdir(exist_ok=True)
(ROOT / 'data/logo.json').write_text(json.dumps(out))

if len(sys.argv) > 3:
    e, w, l = out['emblem'], out['word'], out['line']
    k = w['h'] / e['h'] * 1.15
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -20 {e["w"] * k + w["w"] + 120} {e["h"] * k + 40}" width="1400">'
           f'<rect x="-20" y="-20" width="100%" height="100%" fill="#fff"/>'
           f'<path transform="scale({k:.4f})" fill-rule="evenodd" d="{e["d"]}"/>'
           f'<path transform="translate({e["w"] * k + 60} 0)" fill-rule="evenodd" d="{w["d"]}"/>'
           f'<path transform="translate({e["w"] * k + 60} {w["h"] + 30})" fill-rule="evenodd" d="{l["d"]}"/></svg>')
    Path(sys.argv[3]).write_text(svg)
