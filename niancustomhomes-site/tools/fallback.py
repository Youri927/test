"""Polices de secours ajustées : Times (Liberation Serif) pour les titres en Petrona, Arial (Liberation Sans) pour le
texte en Gantari.

size-adjust ramène la chasse moyenne de la police de secours à celle de la vraie, mesurée sur les textes du site (les
titres en Petrona 300, le texte en Gantari 400) ; ascent et descent reprennent leur hauteur de ligne. Le texte bouge à
peine quand les polices arrivent. Mesuré avec Liberation, métriquement identique à Times et Arial. Écrit
data/fallback.json.

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
text = re.sub(r'<script.*?</script>|<svg.*?</svg>|<template.*?</template>|<!--.*?-->|<[^>]+>', ' ', body, flags=re.S)
text = re.sub(r'\s+', ' ', text)
head = ' '.join(re.sub(r'<[^>]+>', '', m) for m in re.findall(r'<(?:h[123]|legend)[^>]*>(.*?)</(?:h[123]|legend)>', body, flags=re.S))


def width(font, s):
    """chasse moyenne d'un caractère, en em"""
    cmap = font.getBestCmap()
    hmtx = font['hmtx']
    upm = font['head'].unitsPerEm
    w = [hmtx[cmap[ord(c)]][0] for c in s if ord(c) in cmap]
    return sum(w) / len(w) / upm


out = {}
for key, path, axes, local, sample in (
    ('head', 'Petrona.woff2', {'wght': 300}, 'LiberationSerif-Regular.ttf', head),
    ('text', 'Gantari.woff2', {'wght': 400}, 'LiberationSans-Regular.ttf', text),
):
    real = instantiateVariableFont(TTFont(ROOT / 'vendor/fonts' / path, lazy=False), axes)
    fb = TTFont(LIB / local)
    ratio = width(real, sample) / width(fb, sample)
    upm = real['head'].unitsPerEm
    asc, desc = real['hhea'].ascent / upm, -real['hhea'].descent / upm
    out[key] = {'size': f'{ratio * 100:.1f}%', 'ascent': f'{asc / ratio * 100:.1f}%', 'descent': f'{desc / ratio * 100:.1f}%'}
    print(key, out[key], len(sample), 'car.')
(ROOT / 'data/fallback.json').write_text(json.dumps(out))
