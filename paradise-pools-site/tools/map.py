"""Trace la carte des six comtés desservis (src/map.svg) d'après les données officielles du recensement américain.

Source (domaine public) : US Census Bureau, Cartographic Boundary Files 2024, cb_2024_us_county_500k
(limites des comtés découpées sur le trait de côte : la baie et le golfe restent en eau).

    pip install pyshp numpy
    python3 tools/map.py <dossier contenant cb_2024_us_county_500k.shp>
"""
import math
import sys
from pathlib import Path

import numpy as np
import shapefile

GEO = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / 'src' / 'map.svg'

LON0, LON1, LAT0, LAT1 = -83.02, -81.02, 27.16, 28.80
LATC = (LAT0 + LAT1) / 2
W = 800
K = W / ((LON1 - LON0) * math.cos(math.radians(LATC)))
H = round((LAT1 - LAT0) * K)
MILE = K / 69.05

# les six comtés cités sur leur site, dans l'ordre où la carte les allume (du cœur de la baie vers l'extérieur)
SERVED = [('057', 'hillsborough', 'Hillsborough'), ('103', 'pinellas', 'Pinellas'), ('101', 'pasco', 'Pasco'),
          ('081', 'manatee', 'Manatee'), ('105', 'polk', 'Polk'), ('053', 'hernando', 'Hernando')]
# position des noms (lon, lat), choisie à la main au centre visuel de chaque comté
LABELS = {'hillsborough': (-82.24, 27.90), 'pinellas': (-82.745, 27.90), 'pasco': (-82.43, 28.31),
          'manatee': (-82.30, 27.47), 'polk': (-81.70, 27.95), 'hernando': (-82.42, 28.56)}


def proj(lon, lat):
    return ((lon - LON0) * math.cos(math.radians(LATC)) * K, (LAT1 - lat) * K)


def rdp(pts, eps):
    """Simplification de Ramer-Douglas-Peucker (itérative)."""
    if len(pts) < 3:
        return pts
    a = np.asarray(pts)
    keep = np.zeros(len(a), bool)
    keep[0] = keep[-1] = True
    stack = [(0, len(a) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        p, q = a[i], a[j]
        d = q - p
        n = math.hypot(*d)
        seg = a[i + 1:j]
        if n == 0:
            dist = np.hypot(*(seg - p).T)
        else:
            dist = np.abs(d[0] * (seg[:, 1] - p[1]) - d[1] * (seg[:, 0] - p[0])) / n
        k = int(np.argmax(dist))
        if dist[k] > eps:
            m = i + 1 + k
            keep[m] = True
            stack += [(i, m), (m, j)]
    return a[keep].tolist()


def parts(shape):
    idx = list(shape.parts) + [len(shape.points)]
    for s, e in zip(idx, idx[1:]):
        yield shape.points[s:e]


def path(rings, eps, minarea=4.0):
    out = []
    for ring in rings:
        pts = [proj(x, y) for x, y in ring]
        xs, ys = zip(*pts)
        if (max(xs) - min(xs)) * (max(ys) - min(ys)) < minarea:
            continue  # îlots trop petits pour être vus
        if max(xs) < -40 or min(xs) > W + 40 or max(ys) < -40 or min(ys) > H + 40:
            continue
        pts = rdp(pts, eps)
        if len(pts) < 3:
            continue
        out.append('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + 'Z')
    return ''.join(out).replace('.0 ', ' ').replace('.0L', 'L').replace('.0Z', 'Z')


served, around = {}, []
rd = shapefile.Reader(str(GEO / 'cb_2024_us_county_500k'))
for sr in rd.iterShapeRecords():
    if sr.record['STATEFP'] != '12':
        continue
    b = sr.shape.bbox
    if b[2] < LON0 - .2 or b[0] > LON1 + .2 or b[3] < LAT0 - .2 or b[1] > LAT1 + .2:
        continue
    fp = sr.record['COUNTYFP']
    if fp in [s[0] for s in SERVED]:
        served[fp] = list(parts(sr.shape))
    else:
        around.extend(parts(sr.shape))

svg = []
add = svg.append
add(f'<svg class="map" viewBox="0 0 {W} {H}" role="img" aria-labelledby="map-t map-d" xmlns="http://www.w3.org/2000/svg">')
add('<title id="map-t">The six counties Paradise Pools serves</title>')
add('<desc id="map-d">Map of the Tampa Bay area with the six counties Paradise Pools of Tampa Bay serves: Hillsborough, '
    'Pinellas, Pasco, Hernando, Manatee and Polk. County lines and coastline from the US Census Bureau (2024).</desc>')
add(f'<path class="m-around" d="{path(around, .9)}"/>')
add('<g class="m-counties">')
for i, (fp, key, name) in enumerate(SERVED):
    add(f'<path class="m-county" data-county="{key}" style="--i:{i}" d="{path(served[fp], .8)}"/>')
add('</g>')
add('<g class="m-labels" aria-hidden="true">')
for i, (fp, key, name) in enumerate(SERVED):
    x, y = proj(*LABELS[key])
    rot = f' transform="rotate(-78 {x:.1f} {y:.1f})"' if key == 'pinellas' else ''  # le long de la presqu'île
    add(f'<text class="m-label" data-county="{key}" style="--i:{i}" x="{x:.1f}" y="{y:.1f}"{rot}>{name}</text>')
add('</g>')
for name, (lon, lat), rot in [('Gulf of Mexico', (-82.93, 27.62), -90), ('Tampa Bay', (-82.60, 27.70), -48)]:
    x, y = proj(lon, lat)
    add(f'<text class="m-sea" x="{x:.1f}" y="{y:.1f}" transform="rotate({rot} {x:.1f} {y:.1f})" aria-hidden="true">{name}</text>')
sx, sy = W - 28 - 20 * MILE, H - 30
add(f'<g class="m-scale" aria-hidden="true"><path d="M{sx:.1f} {sy}h{20 * MILE:.1f}M{sx:.1f} {sy - 4}v8M{sx + 20 * MILE:.1f} {sy - 4}v8"/>'
    f'<text x="{sx + 10 * MILE:.1f}" y="{sy - 10}">20 miles</text></g>')
add('</svg>')

OUT.write_text('\n'.join(svg) + '\n')
print(OUT, f'{OUT.stat().st_size / 1024:.1f} Ko', f'{W}×{H}')
