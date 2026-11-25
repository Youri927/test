"""Dessine le logo de Respray et ses déclinaisons, en SVG, dans marque/.

Le symbole : un « r » dont l'épaule se prolonge en jet de spray (un, deux, trois points), dessiné sur une grille de
110 × 100. Le mot : « respray » en Inter SemiBold (taille optique 32), vectorisé, approché de -0,04 em.

    python3 tools/logo.py        (il faut fontTools et brotli : pip install fonttools brotli)
"""
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ICI = Path(__file__).resolve().parent.parent
SORTIE = ICI / 'marque'
SORTIE.mkdir(exist_ok=True)
ENCRE = '#1d1d1f'
BLANC = '#ffffff'

# ——— le symbole, sur sa grille ———
TRAIT = 13
SYMBOLE = (
    f'<path d="M30 86V58c0-14 10-22 24-22" fill="none" stroke="{{c}}" stroke-width="{TRAIT}" stroke-linecap="round"/>'
    '<g fill="{c}"><circle cx="71" cy="36" r="5.5"/>'
    '<circle cx="84" cy="26" r="4"/><circle cx="85" cy="44" r="4"/>'
    '<circle cx="96" cy="18" r="2.8"/><circle cx="97" cy="35" r="2.8"/><circle cx="96" cy="52" r="2.8"/></g>'
)
SYM_BOITE = (23.5, 15.2, 99.8, 92.5)  # x0, y0, x1, y1 : contour exact du dessin (bouts arrondis compris)


def symbole(couleur, dx=0.0, dy=0.0, k=1.0):
    return f'<g transform="translate({dx:.2f} {dy:.2f}) scale({k:.4f})">{SYMBOLE.format(c=couleur)}</g>'


# ——— le mot, vectorisé depuis Inter ———
police = TTFont(ICI / 'vendor/fonts/inter-400-700.woff2')
police = instantiateVariableFont(police, {'wght': 600, 'opsz': 32})
upm = police['head'].unitsPerEm
cmap = police.getBestCmap()
glyphes = police.getGlyphSet()
hmtx = police['hmtx']
x_hauteur = police['OS/2'].sxHeight
capitale = police['OS/2'].sCapHeight
APPROCHE = -0.04 * upm


def mot(texte, couleur):
    """Le texte en un chemin : (chemin SVG, largeur), en unités de la police, ligne de base à y = 0."""
    x = 0.0
    morceaux = []
    for i, car in enumerate(texte):
        nom = cmap[ord(car)]
        stylo = SVGPathPen(glyphes)
        glyphes[nom].draw(TransformPen(stylo, (1, 0, 0, -1, x, 0)))
        morceaux.append(stylo.getCommands())
        x += hmtx[nom][0] + (APPROCHE if i < len(texte) - 1 else 0)
    return f'<path fill="{couleur}" d="{" ".join(morceaux)}"/>', x


def ecrire(nom, vb, contenu, titre='Respray'):
    (SORTIE / nom).write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="{titre}"><title>{titre}</title>{contenu}</svg>\n'
    )


# le symbole seul
x0, y0, x1, y1 = SYM_BOITE
vb_sym = f'{x0:.1f} {y0:.1f} {x1 - x0:.1f} {y1 - y0:.1f}'
ecrire('symbole.svg', vb_sym, SYMBOLE.format(c=ENCRE))
ecrire('symbole-blanc.svg', vb_sym, SYMBOLE.format(c=BLANC))

# le mot seul
chemin, largeur = mot('respray', ENCRE)
desc = 0.24 * upm  # la jambe du p et du y
vb_mot = f'0 {-x_hauteur - 0.2 * upm:.0f} {largeur:.0f} {x_hauteur + 0.2 * upm + desc:.0f}'
ecrire('mot.svg', vb_mot, chemin)

# le logo complet : symbole + mot. Le pied du « r » du symbole est posé sur la ligne de base du mot, son épaule
# monte à la hauteur des capitales ; l'espace entre les deux vaut 0,26 em.
k = (capitale * 1.32) / (y1 - y0)
sym_l = (x1 - x0) * k
ecart = 0.26 * upm


def logo(couleur):
    s = symbole(couleur, -x0 * k, -y1 * k, k)
    c, _ = mot('respray', couleur)
    return s + f'<g transform="translate({sym_l + ecart:.1f} 0)">{c}</g>'


haut = (y1 - y0) * k
total = sym_l + ecart + largeur
vb_logo = f'0 {-haut - 10:.0f} {total:.0f} {haut + desc + 20:.0f}'
ecrire('logo.svg', vb_logo, logo(ENCRE))
# pour le site : la couleur suit le texte (currentColor), clair ou sombre
ecrire('logo-site.svg', vb_logo, logo('currentColor'))
ecrire('logo-blanc.svg', vb_logo, logo(BLANC))

# l'icône d'application : le symbole blanc sur un carré à coins continus (1024)
def carre_continu(t, r):
    """Un carré aux coins « continus » (courbure progressive), comme les icônes d'Apple."""
    c = r * 0.55
    return (
        f'M{r} 0H{t - r}C{t - r + c} 0 {t} {r - c} {t} {r}V{t - r}C{t} {t - r + c} {t - r + c} {t} {t - r} {t}'
        f'H{r}C{r - c} {t} 0 {t - r + c} 0 {t - r}V{r}C0 {r - c} {r - c} 0 {r} 0Z'
    )


T = 1024
kk = T * 0.56 / (x1 - x0)
dxi = (T - (x1 - x0) * kk) / 2 - x0 * kk
dyi = (T - (y1 - y0) * kk) / 2 - y0 * kk
icone = f'<path fill="{ENCRE}" d="{carre_continu(T, 230)}"/>' + symbole(BLANC, dxi, dyi, kk)
ecrire('icone.svg', f'0 0 {T} {T}', icone)
# le favicon : même dessin, symbole un peu plus grand pour rester lisible à 16 px
kf = T * 0.66 / (x1 - x0)
dxf = (T - (x1 - x0) * kf) / 2 - x0 * kf
dyf = (T - (y1 - y0) * kf) / 2 - y0 * kf
ecrire('favicon.svg', f'0 0 {T} {T}', f'<path fill="{ENCRE}" d="{carre_continu(T, 230)}"/>' + symbole(BLANC, dxf, dyf, kf))

print('marque/ :', ', '.join(sorted(p.name for p in SORTIE.glob('*.svg'))))
print(f'logo : {total:.0f} × {haut + desc + 20:.0f} unités ; symbole k = {k:.2f}')
