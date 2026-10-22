"""Polices de secours ajustées : Arial gras (Liberation Sans Bold) pour les titres en Chivo, Arial (Liberation Sans)
pour le texte en Chivo, Times italique (Liberation Serif Italic) pour les paroles des clients en Piazzolla.

size-adjust ramène la chasse moyenne de la police de secours à celle de la vraie, mesurée sur les textes du site (les
titres en Chivo 850, le texte en Chivo 400, les témoignages en Piazzolla italique 440) ; ascent et descent reprennent
leur hauteur de ligne. Le texte bouge à peine quand les polices arrivent. Mesuré avec Liberation, métriquement
identique à Arial et Times. Écrit data/fallback.json.

    python3 -I tools/fallback.py
"""
import json
import re
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
LIB = Path('/usr/share/fonts/truetype/liberation')
html = (ROOT / 'src/index.html').read_text()
body = html.split('</head>')[1]
text = re.sub(r'<script.*?</script>|<svg.*?</svg>|<template.*?</template>|<[^>]+>', ' ', body, flags=re.S)
text = re.sub(r'\s+', ' ', text)
head = ' '.join(re.sub(r'<[^>]+>', '', m) for m in re.findall(r'<h[123][^>]*>(.*?)</h[123]>', body, flags=re.S))
quotes = ' '.join(json.loads((ROOT / 'data/testimonials.json').read_text())['quotes'])


def width(font, s):
    """chasse moyenne d'un caractère, en em"""
    cmap = font.getBestCmap()
    hmtx = font['hmtx']
    upm = font['head'].unitsPerEm
    w = [hmtx[cmap[ord(c)]][0] for c in s if ord(c) in cmap]
    return sum(w) / len(w) / upm


chivo = ROOT / 'vendor/fonts/Chivo.woff2'
out = {}
for key, real, local, sample in (
    ('head', instantiateVariableFont(TTFont(chivo, lazy=False), {'wght': 850}), 'LiberationSans-Bold.ttf', head),
    ('text', instantiateVariableFont(TTFont(chivo, lazy=False), {'wght': 400}), 'LiberationSans-Regular.ttf', text),
    ('quote', instantiateVariableFont(TTFont(ROOT / 'vendor/fonts/PiazzollaItalic.woff2', lazy=False), {'wght': 440, 'opsz': 24}), 'LiberationSerif-Italic.ttf', quotes),
):
    fb = TTFont(LIB / local)
    ratio = width(real, sample) / width(fb, sample)
    upm = real['head'].unitsPerEm
    asc, desc = real['hhea'].ascent / upm, -real['hhea'].descent / upm
    out[key] = {'size': f'{ratio * 100:.1f}%', 'ascent': f'{asc / ratio * 100:.1f}%', 'descent': f'{desc / ratio * 100:.1f}%'}
    print(key, out[key], len(sample), 'car.')
(ROOT / 'data/fallback.json').write_text(json.dumps(out))
