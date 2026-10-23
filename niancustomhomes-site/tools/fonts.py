"""Prépare les deux polices du site, licence OFL, à partir des paquets Fontsource (sous-ensemble latin) :
- Petrona (Ringo R. Seeber), serif variable en graisse : on garde 200 à 500 ; « Lot » et « Home », les titres, les noms
  des maisons ;
- Gantari (Lafontaine), linéale variable en graisse : on garde 400 à 700 ; le texte, les légendes, l'interface.

En woff2, avec les licences à côté.

    python3 -I tools/fonts.py <dossier du paquet @fontsource-variable/petrona> <dossier du paquet @fontsource-variable/gantari>
"""
import io
import shutil
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'vendor/fonts'
OUT.mkdir(parents=True, exist_ok=True)
petrona, gantari = (Path(a) for a in sys.argv[1:3])

# latin de base et latin-1, ponctuation typographique (– — ‘ ’ “ ” • … ′ ″), ™ et −
UNICODES = list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [
    0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x2032, 0x2033, 0x2122, 0x2212,
]


def reload(font):
    """relu depuis la mémoire : le sous-ensemble a besoin des tables entièrement chargées"""
    buf = io.BytesIO()
    font.save(buf)
    buf.seek(0)
    return TTFont(buf, lazy=False)


def write(font, name, features):
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = features
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=UNICODES)
    sub.subset(font)
    font.flavor = 'woff2'
    out = OUT / name
    font.save(out)
    print(out.name, out.stat().st_size // 1024, 'Ko')


p = TTFont(petrona / 'files/petrona-latin-wght-normal.woff2', lazy=False)
write(reload(instantiateVariableFont(p, {'wght': (200, 500)})), 'Petrona.woff2', ['kern', 'liga', 'ccmp', 'locl', 'lnum'])
g = TTFont(gantari / 'files/gantari-latin-wght-normal.woff2', lazy=False)
write(reload(instantiateVariableFont(g, {'wght': (400, 700)})), 'Gantari.woff2', ['kern', 'liga', 'ccmp', 'locl', 'tnum', 'lnum'])
shutil.copy(petrona / 'LICENSE', OUT / 'OFL-Petrona.txt')
shutil.copy(gantari / 'LICENSE', OUT / 'OFL-Gantari.txt')
