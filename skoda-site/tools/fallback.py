"""Polices de secours ajustées : Times (Liberation Serif) pour Besley, Arial (Liberation Sans) pour Rethink Sans.

size-adjust ramène la chasse moyenne de la police de secours à celle de la vraie, mesurée sur les textes du site ;
ascent et descent reprennent la hauteur de ligne de la vraie police. Le texte ne bouge presque pas quand elle arrive.
Écrit data/fallback.json.

    python3 -I tools/fallback.py
"""
import json
import re
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
html = (ROOT / 'src/index.html').read_text()
text = re.sub(r'<script.*?</script>|<style.*?</style>|<[^>]+>', ' ', html, flags=re.S)
text = re.sub(r'\s+', ' ', text)


def width(font, s):
    """chasse moyenne d'un caractère, en em"""
    cmap = font.getBestCmap()
    hmtx = font['hmtx']
    upm = font['head'].unitsPerEm
    w = [hmtx[cmap[ord(c)]][0] for c in s if ord(c) in cmap]
    return sum(w) / len(w) / upm


def real(file, wght):
    f = TTFont(ROOT / 'vendor/fonts' / file)
    return instantiateVariableFont(f, {'wght': wght}) if 'fvar' in f else f


out = {}
for key, file, wght, local in (
    ('serif', 'Besley.woff2', 700, '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'),
    ('sans', 'RethinkSans.woff2', 400, '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'),
):
    f = real(file, wght)
    fb = TTFont(local)
    ratio = width(f, text) / width(fb, text)
    upm = f['head'].unitsPerEm
    asc, desc = f['hhea'].ascent / upm, -f['hhea'].descent / upm
    out[key] = {'size': f'{ratio * 100:.1f}%', 'ascent': f'{asc / ratio * 100:.1f}%', 'descent': f'{desc / ratio * 100:.1f}%'}
    print(key, out[key])
(ROOT / 'data/fallback.json').write_text(json.dumps(out))
