"""Le logo Respray : le « r » au jet de spray est la première lettre du mot, un peu plus grand que les autres, et le jet
part au-dessus du « e » sans le toucher. Les lettres « espray » sont les contours d'Inter (gras, taille d'affichage).
   python3 tools/logo/construire.py  →  tools/logo/logo.svg (et le chemin à reprendre dans src/components/Logo.tsx)"""
import pathlib
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ICI = pathlib.Path(__file__).parent
POLICE = ICI.parent.parent / 'public/fonts/inter-400-700.woff2'

# le « r » : trait rond, comme le symbole, posé sur la ligne de base (y = 86)
BASE = 86.0
TRAIT = 13.0
R = f'M30 {BASE - TRAIT / 2}V58c0-14 10-22 24-22'
# le jet : trois rangs de points qui s'ouvrent vers le haut et la droite, tous au-dessus du « e »
JET = [(70.5, 28.0, 5.5), (83.0, 18.5, 4.0), (84.0, 32.5, 4.0), (95.0, 10.5, 2.8), (96.0, 22.5, 2.8), (96.0, 35.0, 2.8)]
HAUT_X = 39.0     # hauteur des minuscules : le « r » (56 de haut) est nettement plus grand
DEBUT = 61.0      # où commence le « e », juste après l'épaule du « r »
APPROCHE = -0.018  # espacement des lettres (en em)

f = TTFont(POLICE)
f = instantiateVariableFont(f, {'wght': 700, 'opsz': 32})
upm = f['head'].unitsPerEm
ech = HAUT_X / f['OS/2'].sxHeight
gs = f.getGlyphSet()
cmap = f.getBestCmap()
hmtx = f['hmtx']

chemins = []
x = DEBUT
bas = BASE
droite = x
for c in 'espray':
    nom = cmap[ord(c)]
    pen = SVGPathPen(gs, ntos=lambda v: f'{v:.2f}'.rstrip('0').rstrip('.'))
    # la police a l'axe y vers le haut : on retourne, on met à l'échelle, on pose sur la ligne de base
    tp = TransformPen(pen, (ech, 0, 0, -ech, x, BASE))
    gs[nom].draw(tp)
    chemins.append(pen.getCommands())
    bp = BoundsPen(gs)
    gs[nom].draw(TransformPen(bp, (ech, 0, 0, -ech, x, BASE)))
    if bp.bounds:
        bas = max(bas, bp.bounds[3])
        droite = max(droite, bp.bounds[2])
    if c == 'e':
        bp2 = BoundsPen(gs)
        gs[nom].draw(TransformPen(bp2, (ech, 0, 0, -ech, x, BASE)))
        haut_e = bp2.bounds[1]
    x += hmtx[nom][0] * ech + APPROCHE * upm * ech

bas_jet = max(cy + r for _, cy, r in JET)
print(f'haut du « e » : {haut_e:.1f} · bas du jet : {bas_jet:.1f} · écart : {haut_e - bas_jet:.1f}')

g = 23.5
haut = min(cy - r for _, cy, r in JET) - 1.5  # le cadre part au-dessus du plus haut point (marge)
vb = (g, haut, droite + 1 - g, bas + 1 - haut)
points = ''.join(f'<circle cx="{cx}" cy="{cy}" r="{r}"/>' for cx, cy, r in JET)
lettres = ''.join(chemins)
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb[0]:.1f} {vb[1]:.1f} {vb[2]:.1f} {vb[3]:.1f}">'
       f'<path d="{R}" fill="none" stroke="currentColor" stroke-width="{TRAIT:g}" stroke-linecap="round"/>'
       f'<g fill="currentColor">{points}</g><path fill="currentColor" d="{lettres}"/></svg>')
(ICI / 'logo.svg').write_text(svg)
(ICI / 'lettres.txt').write_text(lettres)
print('viewBox', ' '.join(f'{v:.1f}' for v in vb), '· longueur du chemin', len(lettres))
