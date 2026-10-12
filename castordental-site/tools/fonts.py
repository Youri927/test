"""Les polices allégées, à partir des fichiers de Google Fonts rangés dans vendor/fonts/src/.

  - Commissioner : l'axe d'inclinaison (slnt) n'est jamais utilisé, il est figé à 0 ; les graisses de 100 à 900 et les
    axes FLAR et VOLM de l'enseigne restent.
  - Literata italique : elle ne sert qu'aux paroles des patients et aux définitions, en graisse 400, entre 17 et 29 px.
    La graisse est figée à 400 ; la taille optique (opsz) reste entière (la restreindre à 14-36 changeait la chasse des
    lettres dans Chrome).
Les deux sont réduites au latin de base et au latin-1, avec la ponctuation typographique. Une lettre absente (un
prénom tapé dans le formulaire, par exemple) s'affiche dans la police de secours.
Écrit vendor/fonts/Commissioner.woff2 et vendor/fonts/Literata-Italic.woff2.

    python3 -I tools/fonts.py
"""
import io
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'vendor/fonts/src'
OUT = ROOT / 'vendor/fonts'
LATIN = [*range(0x20, 0x7F), *range(0xA0, 0x100), 0x2009, 0x2011, 0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x202F, 0x2122]


def light(name, location):
    font = instancer.instantiateVariableFont(TTFont(SRC / name), location)
    # relu avant le découpage : le découpeur a besoin des tables complètes
    buf = io.BytesIO()
    font.save(buf)
    buf.seek(0)
    font = TTFont(buf)
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=LATIN)
    sub.subset(font)
    font.flavor = 'woff2'
    font.save(OUT / name)
    print(f'{name:<22} {(SRC / name).stat().st_size // 1024} Ko -> {(OUT / name).stat().st_size // 1024} Ko')


light('Commissioner.woff2', {'slnt': 0})
light('Literata-Italic.woff2', {'wght': 400})
