"""Prépare les deux polices du site, licence OFL :
- Gloock (Duarte Pires), une seule graisse : la liste de l'accueil, les titres, les citations, le nom du logo ;
- Albert Sans, variable en graisse : on garde de 400 à 700 (le texte, l'interface).

Latin de base et ses signes, en woff2. Les licences sont copiées à côté.

    python3 -I tools/fonts.py <Gloock-Regular.ttf> <OFL Gloock> <AlbertSans[wght].ttf> <OFL Albert Sans>
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
gloock, gloock_ofl, albert, albert_ofl = (Path(a) for a in sys.argv[1:5])

# latin de base, ponctuation typographique, puces, signes utiles (°, ×, ½, –, —, …, ’, “ ”, ©, ®, ™)
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


write(TTFont(gloock, lazy=False), 'Gloock.woff2', ['kern', 'liga', 'case', 'tnum', 'pnum'])
write(reload(instantiateVariableFont(TTFont(albert, lazy=False), {'wght': (400, 700)})), 'AlbertSans.woff2',
      ['kern', 'liga', 'calt', 'ss01', 'ss02', 'ss03', 'ss04', 'ss05'])
shutil.copy(gloock_ofl, OUT / 'OFL-Gloock.txt')
shutil.copy(albert_ofl, OUT / 'OFL-AlbertSans.txt')
