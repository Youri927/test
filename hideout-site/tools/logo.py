"""Le logo de Hideout Boutique redessiné en vectoriel, à l'identique.

Mesures relevées sur leur fichier (logo-large.jpg, 1 100 x 554) :
- le cadre doré #C4A42C : de x 195 à 913 et de y 123 à 435, trait de 8,5 px, pattes de 74 px (23,6 % de la hauteur),
  côtés ouverts au milieu ;
- « HIDEOUT BOUTIQUE » en Lato Regular, capitales de 47 px (y 229 à 276), encre de x 128 à 986 ;
- « BOUTIQUE & MED SPA » en Lato Bold, capitales de 22,6 px (y 330 à 352), encre de x 293 à 824 ;
- les lettres du fichier sont 4 % plus larges que la police : on les étire d'autant.
La police a été vérifiée en superposant les lettres au fichier ; l'espacement est recalculé pour retomber exactement
sur ces bords d'encre. Le texte prend la couleur du texte autour (currentColor), le cadre reste or.

Écrit src/logo-full.svg (cadre, nom, ligne du dessous) et src/logo-compact.svg (cadre plus bas, nom seul : l'en-tête).
    python3 tools/logo.py
"""
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / 'vendor/fonts/lato'
GOLD = '#C4A42C'


def line(font, text, cap_top, cap_px, ink_left, ink_right, sx=1.0):
    """Chemin SVG d'une ligne de capitales espacées, calée sur ses bords d'encre (sx : étirement horizontal)."""
    upm = font['head'].unitsPerEm
    cap = font['OS/2'].sCapHeight
    s = cap_px / cap  # échelle unités -> px
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    hmtx = font['hmtx']
    glyphs = [cmap[ord(c)] for c in text]
    # bords d'encre du premier et du dernier glyphe
    from fontTools.pens.boundsPen import BoundsPen

    def bounds(g):
        bp = BoundsPen(gs)
        gs[g].draw(bp)
        return bp.bounds

    first_lsb = bounds(glyphs[0])[0]
    last = glyphs[-1]
    last_rsb = hmtx[last][0] - bounds(last)[2]
    adv = sum(hmtx[g][0] for g in glyphs)
    # encre = (somme des chasses + (n-1) espacements - lsb du premier - rsb du dernier) * s
    n = len(text)
    spacing = ((ink_right - ink_left) / (s * sx) - adv + first_lsb + last_rsb) / (n - 1)
    baseline = cap_top + cap * s
    x = ink_left / (s * sx) - first_lsb  # en unités, origine du premier glyphe
    pen = SVGPathPen(gs, ntos=lambda v: f'{v:.1f}'.rstrip('0').rstrip('.'))
    for g in glyphs:
        if g != 'space':
            # y vers le bas en SVG : on retourne l'axe
            tp = TransformPen(pen, (s * sx, 0, 0, -s, x * s * sx, baseline))
            gs[g].draw(tp)
        x += hmtx[g][0] + spacing
    return pen.getCommands(), spacing / upm


regular = TTFont(FONTS / 'Lato-Regular.woff2')
bold = TTFont(FONTS / 'Lato-Bold.woff2')
name, em1 = line(regular, 'HIDEOUT BOUTIQUE', 229, 47, 128, 986, sx=1.04)
sub, em2 = line(bold, 'BOUTIQUE & MED SPA', 330, 22.6, 293, 824, sx=1.04)
print(f'espacement : nom {em1:.3f} em, ligne du dessous {em2:.3f} em')


def frame(top, bottom, leg, left=199.25, right=908.75):
    t = f'M{left} {top + leg}V{top}H{right}V{top + leg}'
    b = f'M{left} {bottom - leg}V{bottom}H{right}V{bottom - leg}'
    return (f'<g class="logo__frame" fill="none" stroke="{GOLD}" stroke-width="8.5">'
            f'<path d="{t}"/><path d="{b}"/></g>')


# le nom est porté par le lien ou le bloc qui contient le logo (aria-label) : le dessin lui-même est masqué aux lecteurs d'écran
# le cadre complet : bords extérieurs y 123 à 435, donc axe du trait de 127,25 à 430,75
full = (f'<svg class="logo" viewBox="120 119 870 321" aria-hidden="true" focusable="false">'
        f'{frame(127.25, 430.75, 74)}'
        f'<path class="logo__name" fill="currentColor" d="{name}"/>'
        f'<path class="logo__sub" fill="currentColor" d="{sub}"/></svg>')
# l'en-tête : le nom seul, dans un cadre ramené à 150 px de haut autour de lui (pattes de 23,6 %)
mid = (229 + 276.5) / 2
h = 150
top, bottom = mid - h / 2, mid + h / 2
compact = (f'<svg class="logo logo--compact" viewBox="120 {top - 8:.2f} 870 {h + 16}" aria-hidden="true" focusable="false">'
           f'{frame(round(top, 2), round(bottom, 2), round(h * 0.236, 2))}'
           f'<path class="logo__name" fill="currentColor" d="{name}"/></svg>')
(ROOT / 'src/logo-full.svg').write_text(full + '\n')
(ROOT / 'src/logo-compact.svg').write_text(compact + '\n')
print(f'src/logo-full.svg : {len(full) // 1024} Ko, src/logo-compact.svg : {len(compact) // 1024} Ko')
