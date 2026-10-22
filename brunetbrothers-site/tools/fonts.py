"""Prépare les deux polices du site, licence OFL, à partir des paquets Fontsource (sous-ensemble latin) :
- Chivo (Omnibus-Type, Buenos Aires), linéale variable en graisse : on garde 300 à 900 ; titres, texte et interface ;
- Piazzolla (Huerta Tipográfica, Buenos Aires), en italique, variable en graisse et en taille optique : on garde les
  graisses 400 à 500 et les tailles optiques 12 à 30 ; les paroles des clients seulement.

Le latin de base et le latin-1 couvrent l'espagnol (á é í ó ú ü ñ ¿ ¡ « »). En woff2, avec les licences à côté.

    python3 -I tools/fonts.py <dossier du paquet @fontsource-variable/chivo> <dossier du paquet @fontsource-variable/piazzolla>
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
chivo, piazzolla = (Path(a) for a in sys.argv[1:3])

# latin de base et latin-1 (dont l'espagnol), ponctuation typographique (– — ‘ ’ “ ” • … ′ ″), ™ et −
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


c = TTFont(chivo / 'files/chivo-latin-wght-normal.woff2', lazy=False)
write(reload(instantiateVariableFont(c, {'wght': (300, 900)})), 'Chivo.woff2', ['kern', 'liga', 'ccmp', 'locl', 'tnum', 'lnum'])
p = TTFont(piazzolla / 'files/piazzolla-latin-opsz-italic.woff2', lazy=False)
write(reload(instantiateVariableFont(p, {'wght': (400, 500), 'opsz': (12, 30)})), 'PiazzollaItalic.woff2', ['kern', 'liga', 'ccmp', 'locl'])
shutil.copy(chivo / 'LICENSE', OUT / 'OFL-Chivo.txt')
shutil.copy(piazzolla / 'LICENSE', OUT / 'OFL-Piazzolla.txt')
