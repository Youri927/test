"""Polices de secours ajustées : Georgia (ou Liberation Serif) pour Montagu Slab, Arial (Liberation Sans) pour Reddit Sans.

size-adjust ramène la chasse moyenne de la police de secours à celle de la vraie, mesurée sur les textes du site ;
ascent et descent reprennent leur hauteur de ligne. Le texte ne bouge presque pas quand les polices arrivent.
Mesuré avec Liberation, métriquement identique à Times et Arial ; Georgia est un peu plus large que Times, la
différence reste sous 3 %. Écrit data/fallback.json.

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
text = re.sub(r'<script.*?</script>|<svg.*?</svg>|<[^>]+>', ' ', body, flags=re.S)
text = re.sub(r'\s+', ' ', text)
# ce qui est composé en Montagu Slab : la phrase d'accueil, les titres, les citations, les quartiers
serif = ' '.join(re.sub(r'<[^>]+>', '', m) for m in re.findall(
    r'<(?:h1|h2|h3)[^>]*>(.*?)</(?:h1|h2|h3)>|<blockquote>(.*?)</blockquote>|<ul class="places[^"]*">(.*?)</ul>', body, flags=re.S) for m in m if m)


def width(font, s):
    """chasse moyenne d'un caractère, en em"""
    cmap = font.getBestCmap()
    hmtx = font['hmtx']
    upm = font['head'].unitsPerEm
    w = [hmtx[cmap[ord(c)]][0] for c in s if ord(c) in cmap]
    return sum(w) / len(w) / upm


out = {}
for key, real, local, sample in (
    ('serif', instantiateVariableFont(TTFont(ROOT / 'vendor/fonts/MontaguSlab.woff2', lazy=False), {'wght': 250, 'opsz': 72}), 'LiberationSerif-Regular.ttf', serif),
    ('sans', instantiateVariableFont(TTFont(ROOT / 'vendor/fonts/RedditSans.woff2', lazy=False), {'wght': 400}), 'LiberationSans-Regular.ttf', text),
):
    fb = TTFont(LIB / local)
    ratio = width(real, sample) / width(fb, sample)
    upm = real['head'].unitsPerEm
    asc, desc = real['hhea'].ascent / upm, -real['hhea'].descent / upm
    out[key] = {'size': f'{ratio * 100:.1f}%', 'ascent': f'{asc / ratio * 100:.1f}%', 'descent': f'{desc / ratio * 100:.1f}%'}
    print(key, out[key], len(sample), 'car.')
(ROOT / 'data/fallback.json').write_text(json.dumps(out))
