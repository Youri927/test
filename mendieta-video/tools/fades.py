"""Luminosité moyenne de chaque image d'une vidéo, et sa plus forte variation d'une image à l'autre pendant les passages
par le noir (scènes de src/beats.ts) : la lumière ne doit faire aucune marche.

    python3 -I tools/fades.py <vidéo.mp4> <début de chaque scène en images, séparés par des virgules>
"""
import subprocess
import sys

import numpy as np

if len(sys.argv) < 3:
    sys.exit(__doc__)
video = sys.argv[1]
starts = [int(x) for x in sys.argv[2].split(',')]
w, h = 192, 108
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-vf', f'scale={w}:{h}:flags=area,format=gray', '-vsync', '0', '-f', 'rawvideo', '-'],
                     capture_output=True, check=True).stdout
v = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float64)
lum = v.mean(axis=(1, 2))
d = np.abs(np.diff(lum))
print(f'{len(lum)} images ; luminosité moyenne de 0 à 255')
worst = 0
for s in starts:
    a, b = max(0, s - 16), min(len(lum) - 1, s + 22)
    seg = d[a:b]
    k = int(np.argmax(seg))
    worst = max(worst, seg.max())
    black = [i for i in range(max(0, s - 2), min(len(lum), s + 2)) if lum[i] < 1.0]
    print(f'  coupe à {s} : plus forte marche {seg.max():.1f} (image {a + k + 1}), images noires {black}')
print(f'plus forte marche de lumière autour des coupes : {worst:.1f} niveaux')
