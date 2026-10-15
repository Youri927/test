"""Polices de secours ajustées pour Saira : Arial (Liberation Sans) pour le texte, Arial Narrow pour les titres.

size-adjust ramène la chasse moyenne de la police de secours à celle de Saira, mesurée sur les textes du site ;
ascent et descent reprennent la hauteur de ligne de Saira. Le texte ne bouge presque pas quand elle arrive.
Arial Narrow n'est pas sur cette machine : on la mesure comme Arial Bold resserrée à 82 %, ce qu'elle est.
Écrit data/fallback.json.

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
# les titres : ce qui est composé en Saira condensée
heads = ' '.join(re.sub(r'<[^>]+>', '', m) for m in re.findall(r'<h[123][^>]*>(.*?)</h[123]>', body, flags=re.S))


def width(font, s, squeeze=1.0):
    """chasse moyenne d'un caractère, en em"""
    cmap = font.getBestCmap()
    hmtx = font['hmtx']
    upm = font['head'].unitsPerEm
    w = [hmtx[cmap[ord(c)]][0] for c in s if ord(c) in cmap]
    return sum(w) / len(w) / upm * squeeze


def saira(wdth, wght):
    return instantiateVariableFont(TTFont(ROOT / 'vendor/fonts/Saira.woff2', lazy=False), {'wdth': wdth, 'wght': wght})


out = {}
for key, (wdth, wght), local, squeeze, sample in (
    ('sans', (100, 400), 'LiberationSans-Regular.ttf', 1.0, text),
    ('cond', (70, 760), 'LiberationSans-Bold.ttf', 0.82, heads),
):
    f = saira(wdth, wght)
    fb = TTFont(LIB / local)
    ratio = width(f, sample) / width(fb, sample, squeeze)
    upm = f['head'].unitsPerEm
    asc, desc = f['hhea'].ascent / upm, -f['hhea'].descent / upm
    out[key] = {'size': f'{ratio * 100:.1f}%', 'ascent': f'{asc / ratio * 100:.1f}%', 'descent': f'{desc / ratio * 100:.1f}%'}
    print(key, out[key])
(ROOT / 'data/fallback.json').write_text(json.dumps(out))
