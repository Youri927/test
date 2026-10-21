"""Vectorise le logo de Stellar Living Homes à partir de leur fichier publié (logo JPG de l'en-tête, 1814 × 837 ;
potrace, au pixel près, sans rien redessiner). Le logo a deux couleurs, tracées séparément :
- le bleu marine : le grand toit, la lucarne, le faîtage fin, la ferme de charpente, les lettres « SLH », puis la ligne
  « STELLAR LIVING HOMES » ;
- le vert olive : les deux pans de toit du milieu, les deux filets de part et d'autre de « SLH », « LLC » et ses filets.

Pièces écrites dans data/logo.json (largeur, hauteur, tracés ; la couleur est laissée à la feuille de style) :
- mark : le monogramme et ses toits (« navy » et « olive » dans le même repère) ;
- word : « STELLAR LIVING HOMES » ;
- llc : « LLC » et ses deux filets (olive).

    python3 -I tools/logo.py <logo.jpg> [aperçu.svg]
"""
import json
import sys
from pathlib import Path

import numpy as np
import potrace
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
S = 2  # suréchantillonné et à peine adouci avant le seuil : le contour suit l'anticrénelage, pas le bruit JPEG

src = Image.open(sys.argv[1]).convert('RGB')
A = np.asarray(src.resize((src.width * S, src.height * S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.8 * S))).astype(int)
R, G, B = A[..., 0], A[..., 1], A[..., 2]
# Chaque pixel est rapporté aux deux mélanges possibles « encre + blanc » (bleu #2A5472 ou olive #909C42, relevés sur
# le logo) : il appartient au mélange dont il est le plus proche (l'anticrénelage d'un bord bleu reste bleu, au lieu de
# passer pour de l'olive), et il est encré s'il est à plus de la moitié du chemin entre le blanc et l'encre.
W = np.array([255, 255, 255])
def mix(rgb):
    v = np.array(rgb) - W
    p = np.stack([R, G, B], -1) - W
    t = (p @ v) / (v @ v)
    r = np.linalg.norm(p - t[..., None] * v, axis=-1)
    return t, r
tn, rn = mix((42, 84, 114))
to, ro = mix((144, 156, 66))
NAVY = (rn <= ro) & (tn > 0.5)
OLIVE = (ro < rn) & (to > 0.5)


def trace(mask, box, origin, turd=20):
    """box et origin en pixels du fichier source ; le tracé est exprimé en pixels source depuis origin"""
    x0, y0, x1, y1 = (v * S for v in box)
    m = np.zeros_like(mask)
    m[y0:y1, x0:x1] = mask[y0:y1, x0:x1]
    curves = potrace.Bitmap(~m).trace(turdsize=turd * S * S, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
                                      alphamax=1.0, opticurve=True, opttolerance=0.3)
    ox, oy = origin
    f = lambda p: f'{p.x / S - ox:.1f} {p.y / S - oy:.1f}'
    d = []
    for c in curves:
        d.append('M' + f(c.start_point))
        for seg in c.segments:
            d.append(f'L{f(seg.c)}L{f(seg.end_point)}' if seg.is_corner else f'C{f(seg.c1)} {f(seg.c2)} {f(seg.end_point)}')
        d.append('Z')
    return ''.join(d), len(curves)


def bbox(mask, box):
    x0, y0, x1, y1 = box
    sub = mask[y0 * S:y1 * S, x0 * S:x1 * S]
    ys, xs = np.where(sub)
    return (x0 + xs.min() / S, y0 + ys.min() / S, x0 + (xs.max() + 1) / S, y0 + (ys.max() + 1) / S)


out = {}
# le monogramme : toits et lettres, du haut du logo jusqu'aux filets (bleu) ; toits et filets (olive)
MARK = (0, 90, 1814, 566)
nb = bbox(NAVY, MARK)
ob = bbox(OLIVE, (0, 90, 1814, 300))  # les toits olive seulement : les filets débordent loin à gauche et à droite
x0, y0 = min(nb[0], ob[0]), min(nb[1], ob[1])
x1, y1 = max(nb[2], ob[2]), max(nb[3], ob[3])
navy_d, n1 = trace(NAVY, MARK, (x0, y0))
olive_d, n2 = trace(OLIVE, (int(x0), 90, int(x1) + 1, 300), (x0, y0))
out['mark'] = {'w': round(x1 - x0, 1), 'h': round(y1 - y0, 1), 'navy': navy_d, 'olive': olive_d}
print(f'mark {x1 - x0:.0f}×{y1 - y0:.0f}  {n1}+{n2} contours  {(len(navy_d) + len(olive_d)) // 1024} Ko')
# les deux filets olive de part et d'autre de « SLH » (sur toute la largeur du logo)
RULE = (0, 536, 1814, 562)
rb = bbox(OLIVE, RULE)
rule_d, n = trace(OLIVE, RULE, rb[:2], turd=6)
out['rule'] = {'w': round(rb[2] - rb[0], 1), 'h': round(rb[3] - rb[1], 1), 'd': rule_d, 'x': round(rb[0] - x0, 1), 'y': round(rb[1] - y0, 1)}
print(f'rule {rb[2] - rb[0]:.0f}×{rb[3] - rb[1]:.0f}  {n} contours, à x {rb[0] - x0:.0f} y {rb[1] - y0:.0f} du monogramme')
# la ligne du nom
WORD = (0, 570, 1814, 700)
wb = bbox(NAVY, WORD)
word_d, n = trace(NAVY, WORD, wb[:2])
out['word'] = {'w': round(wb[2] - wb[0], 1), 'h': round(wb[3] - wb[1], 1), 'd': word_d}
print(f'word {wb[2] - wb[0]:.0f}×{wb[3] - wb[1]:.0f}  {n} contours  {len(word_d) // 1024} Ko')
# « LLC » et ses filets
LLC = (0, 700, 1814, 800)
lb = bbox(OLIVE, LLC)
llc_d, n = trace(OLIVE, LLC, lb[:2], turd=6)
out['llc'] = {'w': round(lb[2] - lb[0], 1), 'h': round(lb[3] - lb[1], 1), 'd': llc_d}
print(f'llc {lb[2] - lb[0]:.0f}×{lb[3] - lb[1]:.0f}  {n} contours  {len(llc_d) // 1024} Ko')
(ROOT / 'data/logo.json').write_text(json.dumps(out))

if len(sys.argv) > 2:
    m, w, l = out['mark'], out['word'], out['llc']
    W = max(m['w'], w['w'], l['w'])
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -20 {W + 40} {m["h"] + w["h"] + l["h"] + 120}" width="1400">'
           f'<rect x="-20" y="-20" width="100%" height="100%" fill="#fff"/>'
           f'<g transform="translate({(W - m["w"]) / 2} 0)"><path fill="#2A5472" fill-rule="evenodd" d="{m["navy"]}"/><path fill="#909C42" fill-rule="evenodd" d="{m["olive"]}"/></g>'
           f'<path transform="translate({(W - w["w"]) / 2} {m["h"] + 30})" fill="#2A5472" fill-rule="evenodd" d="{w["d"]}"/>'
           f'<path transform="translate({(W - l["w"]) / 2} {m["h"] + w["h"] + 60})" fill="#909C42" fill-rule="evenodd" d="{l["d"]}"/></svg>')
    Path(sys.argv[2]).write_text(svg)
