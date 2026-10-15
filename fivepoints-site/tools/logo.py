"""Redessine le logo Five Points en vecteurs, d'après leur PNG (280 px) : écrit data/logo.json.

- L'étoile : une étoile régulière à cinq branches, en traits droits exacts, coupée comme la leur. Le chevron du haut
  (la pointe, qui est un toit) et la branche de droite en asphalte ; la barre du haut, la branche de gauche et le « 5 »
  du centre en or.
- Le nom : « FIVE » (asphalte) et « POINTS » (or) en Saira étendue (largeur 125 %), « ROOFING » espacé dessous ; leur
  logo est composé dans une lettre de ce dessin. Les lettres sont converties en contours : le logo ne dépend pas du
  chargement de la police.

    python3 -I tools/logo.py <Saira[wdth,wght].ttf>
"""
import json
import math
import sys
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1])


def static(wdth, wght):
    return instantiateVariableFont(TTFont(SRC, lazy=False), {'wdth': wdth, 'wght': wght})


def text(font, s, size, x=0.0, y=0.0, track=0.0):
    """Contours d'un texte : chemin SVG (y vers le bas), et chasse totale"""
    upm = font['head'].unitsPerEm
    k = size / upm
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    pen = SVGPathPen(gs, lambda v: f'{v:.2f}'.rstrip('0').rstrip('.'))
    cx = x
    for i, ch in enumerate(s):
        name = cmap[ord(ch)]
        g = gs[name]
        g.draw(TransformPen(pen, (k, 0, 0, -k, cx, y)))
        cx += g.width * k + (track if i < len(s) - 1 else 0)
    return pen.getCommands(), cx - x


def ink(font, s, size):
    """Bord gauche et droit de l'encre (pour aligner les deux lignes du nom au trait près)"""
    from fontTools.pens.boundsPen import BoundsPen
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    k = size / font['head'].unitsPerEm
    first = BoundsPen(gs)
    gs[cmap[ord(s[0])]].draw(first)
    return first.bounds[0] * k


# ——— l'étoile, dans un carré de 100 ———
# Une bande d'épaisseur W : l'étoile extérieure moins l'étoile intérieure (pour une étoile régulière, décaler chaque
# côté de W vers le centre donne la même étoile, réduite). Puis on la découpe comme leur logo, avec un jour de G
# entre les morceaux : le chevron du haut, la barre d'une pointe à l'autre, la branche de droite, la branche de gauche.
cx, cy, R = 50.0, 54.0, 46.0
r = R * math.sin(math.radians(18)) / math.sin(math.radians(54))   # rayon intérieur d'une étoile régulière (0,382 R)
W, G = 4.6, 1.9


def star(rad_out, rad_in):
    pts = []
    for i in range(10):
        rad = rad_out if i % 2 == 0 else rad_in
        a = math.radians(-90 + 36 * i)
        pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a)))
    return pts


outer = star(R, r)
# distance du centre à la droite d'un côté
(x1, y1), (x2, y2) = outer[0], outer[1]
d = abs((x2 - x1) * (y1 - cy) - (x1 - cx) * (y2 - y1)) / math.hypot(x2 - x1, y2 - y1)
k = (d - W) / d
inner = star(R * k, r * k)
y_tips = outer[2][1]  # la hauteur des pointes latérales (le dessus des branches est horizontal)


def clip(poly, inside, cut):
    """Sutherland-Hodgman : garde la partie du polygone du côté `inside` d'une droite"""
    out = []
    for i in range(len(poly)):
        a, b = poly[i - 1], poly[i]
        ia, ib = inside(a), inside(b)
        if ib:
            if not ia:
                out.append(cut(a, b))
            out.append(b)
        elif ia:
            out.append(cut(a, b))
    return out


def hy(c, above):
    ins = (lambda p: p[1] <= c) if above else (lambda p: p[1] >= c)
    cut = lambda a, b: (a[0] + (b[0] - a[0]) * (c - a[1]) / (b[1] - a[1]), c)
    return ins, cut


def vx(c, left):
    ins = (lambda p: p[0] <= c) if left else (lambda p: p[0] >= c)
    cut = lambda a, b: (c, a[1] + (b[1] - a[1]) * (c - a[0]) / (b[0] - a[0]))
    return ins, cut


def region(rings, *halfplanes):
    d = []
    for ring in rings:
        poly = ring
        for ins, cut in halfplanes:
            poly = clip(poly, ins, cut)
            if not poly:
                break
        if len(poly) > 2:
            d.append('M' + 'L'.join(f'{x:.2f} {y:.2f}' for x, y in poly) + 'Z')
    return ''.join(d)


band = [outer, inner]
mark = {
    # le chevron du haut : la pointe de l'étoile, un toit
    'roof': region(band, hy(y_tips - G, True)),
    # la barre du haut, d'une pointe à l'autre, pleine (elle passe sous le chevron)
    'bar': region([outer], hy(y_tips, False), hy(y_tips + W, True)),
    # la branche de droite, jusqu'à la pointe du bas
    'right': region(band, hy(y_tips + W + G, False), vx(cx + G / 2, False)),
    # la branche de gauche
    'left': region(band, hy(y_tips + W + G, False), vx(cx - G / 2, True)),
}
five = static(100, 760)
d5, w5 = text(five, '5', 34)
# le « 5 » centré dans l'étoile (sa chasse et sa hauteur de chiffre)
cap = five['OS/2'].sCapHeight * 34 / five['head'].unitsPerEm
mark['five'] = text(five, '5', 30, x=cx - text(five, '5', 30)[1] / 2, y=cy + 1.5 + five['OS/2'].sCapHeight * 30 / five['head'].unitsPerEm / 2)[0]

# ——— le nom ———
big = static(125, 640)
small = static(125, 560)
S1, S2 = 40.0, 15.2
d_five, w_five = text(big, 'FIVE', S1)
d_points, w_points = text(big, 'POINTS', S1, x=w_five + 1.5)
total = w_five + 1.5 + w_points
# « ROOFING » s'étire sous toute la largeur du nom, comme sur leur logo
d_r, w_r0 = text(small, 'ROOFING', S2)
track = (total - w_r0) / 6
d_roof, w_r = text(small, 'ROOFING', S2, y=S1 * 0.72 + S2 * 0.72 + 9, track=track)
d_five = text(big, 'FIVE', S1, y=S1 * 0.72)[0]
d_points = text(big, 'POINTS', S1, x=w_five + 1.5, y=S1 * 0.72)[0]
word = {'five': d_five, 'points': d_points, 'roofing': d_roof, 'w': round(total, 2), 'h': round(S1 * 0.72 + S2 * 0.72 + 9, 2)}

out = ROOT / 'data/logo.json'
out.write_text(json.dumps({'mark': mark, 'word': word}, indent=1))
print(out, word['w'], word['h'])
