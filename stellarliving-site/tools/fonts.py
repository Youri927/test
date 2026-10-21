"""Prépare les deux polices du site, licence OFL, à partir des paquets Fontsource (sous-ensemble latin) :
- Imbue (Tyler Finck, Etcetera Type Co), didone étroit, variable en graisse et en taille optique : on garde les graisses 150 à 500 et
  toute la taille optique (10 à 100) ; titres, avis mis en avant, noms des lieux, chiffres ;
- Zalando Sans (Zalando, 2025), linéale variable en graisse : on garde 400 à 650 ; texte et interface.

En woff2, avec les licences copiées à côté.

    python3 -I tools/fonts.py <dossier du paquet @fontsource-variable/imbue> <dossier du paquet @fontsource-variable/zalando-sans>
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
imbue, zalando = (Path(a) for a in sys.argv[1:3])

# latin de base, ponctuation typographique, signes utiles (×, –, —, …, ’, “ ”, ©, ™, −)
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


i = TTFont(imbue / 'files/imbue-latin-opsz-normal.woff2', lazy=False)
write(reload(instantiateVariableFont(i, {'wght': (150, 500)})), 'Imbue.woff2', ['kern', 'liga', 'ccmp', 'locl'])
z = TTFont(zalando / 'files/zalando-sans-latin-wght-normal.woff2', lazy=False)
write(reload(instantiateVariableFont(z, {'wght': (400, 650)})), 'ZalandoSans.woff2', ['kern', 'liga', 'calt', 'ccmp', 'locl', 'tnum', 'pnum'])
shutil.copy(imbue / 'LICENSE', OUT / 'OFL-Imbue.txt')
shutil.copy(zalando / 'LICENSE', OUT / 'OFL-ZalandoSans.txt')
