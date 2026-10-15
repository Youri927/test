"""Prépare la police du site : Saira (Omnibus-Type, licence OFL), variable en largeur et en graisse.

On garde seulement les largeurs de 62,5 % (condensée, les titres) à 125 % (étendue, le nom du logo) et les graisses de
400 à 800, puis le latin de base et ses signes : un seul fichier woff2.

    python3 -I tools/fonts.py <Saira[wdth,wght].ttf> <OFL.txt>
"""
import io
import shutil
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
src, licence = Path(sys.argv[1]), Path(sys.argv[2])
font = instantiateVariableFont(TTFont(src, lazy=False), {'wdth': (62.5, 125), 'wght': (400, 800)})
# relu depuis la mémoire : le sous-ensemble a besoin des tables entièrement chargées
buf = io.BytesIO()
font.save(buf)
buf.seek(0)
font = TTFont(buf, lazy=False)
opts = subset.Options()
opts.flavor = 'woff2'
opts.layout_features = ['kern', 'liga', 'calt', 'tnum', 'lnum', 'case']
opts.name_IDs = ['*']
opts.notdef_outline = True
sub = subset.Subsetter(opts)
# latin de base, ponctuation typographique, puces, flèches, signes utiles (°, ×, ½, –, —, …, ’, “ ”, €, ™)
sub.populate(unicodes=list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x2032, 0x2033, 0x20AC, 0x2122, 0x2190, 0x2192, 0x2191, 0x2193, 0x2212])
sub.subset(font)
out = ROOT / 'vendor/fonts/Saira.woff2'
font.flavor = 'woff2'
font.save(out)
shutil.copy(licence, ROOT / 'vendor/fonts/OFL-Saira.txt')
print(out, out.stat().st_size // 1024, 'Ko')
