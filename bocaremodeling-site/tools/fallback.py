"""Polices de secours ajustées : Arial gras (ou Liberation Sans Bold) pour Mozilla Headline, Arial (Liberation Sans)
pour Mozilla Text.

size-adjust ramène la chasse moyenne de la police de secours à celle de la vraie, mesurée sur les textes du site (les
titres en Mozilla Headline étroite et grasse, le reste en Mozilla Text) ; ascent et descent reprennent leur hauteur de
ligne. Le texte bouge à peine quand les polices arrivent (sans cet ajustement, le titre de l'accueil, très étroit,
déborderait de sa ligne le temps du chargement). Mesuré avec Liberation, métriquement identique à Arial. Écrit
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
text = re.sub(r'<script.*?</script>|<svg.*?</svg>|<template.*?</template>|<[^>]+>', ' ', body, flags=re.S)
text = re.sub(r'\s+', ' ', text)
# ce qui est composé en Mozilla Headline : les titres, la liste des métiers, l'adresse
head = ' '.join(re.sub(r'<[^>]+>', '', m) for m in re.findall(r'<h[123][^>]*>(.*?)</h[123]>|<span class="office__street">(.*?)</span>', body, flags=re.S) for m in m if m)


def width(font, s):
    """chasse moyenne d'un caractère, en em"""
    cmap = font.getBestCmap()
    hmtx = font['hmtx']
    upm = font['head'].unitsPerEm
    w = [hmtx[cmap[ord(c)]][0] for c in s if ord(c) in cmap]
    return sum(w) / len(w) / upm


out = {}
for key, real, local, sample in (
    ('head', instantiateVariableFont(TTFont(ROOT / 'vendor/fonts/MozillaHeadline.woff2', lazy=False), {'wght': 640, 'wdth': 78}), 'LiberationSans-Bold.ttf', head),
    ('text', instantiateVariableFont(TTFont(ROOT / 'vendor/fonts/MozillaText.woff2', lazy=False), {'wght': 400}), 'LiberationSans-Regular.ttf', text),
):
    fb = TTFont(LIB / local)
    ratio = width(real, sample) / width(fb, sample)
    upm = real['head'].unitsPerEm
    asc, desc = real['hhea'].ascent / upm, -real['hhea'].descent / upm
    out[key] = {'size': f'{ratio * 100:.1f}%', 'ascent': f'{asc / ratio * 100:.1f}%', 'descent': f'{desc / ratio * 100:.1f}%'}
    print(key, out[key], len(sample), 'car.')
(ROOT / 'data/fallback.json').write_text(json.dumps(out))
