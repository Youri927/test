"""La carte des villes desservies (section des avis) : les lacs du nord de DFW et la position de chaque ville.

Sources : le recensement américain (Gazetteer 2024 pour le centre de chaque ville, TIGER/Line 2024 AREAWATER pour les lacs
des comtés de Denton, Tarrant, Dallas et Collin). Projection équirectangulaire corrigée de la latitude (cos 33°).
Écrit src/partials/map-lakes.svg (les tracés des lacs) et data/cities.json (x, y en % de la carte).

    python3 -I tools/map.py <dossier contenant aw-48121/, aw-48439/, aw-48113/, aw-48085/>
"""
import json
import math
import sys
from pathlib import Path

import shapefile

sys.setrecursionlimit(20000)

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1])
LON0, LON1, LAT0, LAT1 = -97.27, -96.57, 32.655, 33.275   # le cadre de la carte
K = math.cos(math.radians(32.97))
W = 1000
H = round(W * (LAT1 - LAT0) / ((LON1 - LON0) * K))

def xy(lon, lat):
    return ((lon - LON0) / (LON1 - LON0) * W, (LAT1 - lat) / (LAT1 - LAT0) * H)

def simplify(pts, eps):
    """Douglas-Peucker"""
    if len(pts) < 3:
        return pts
    (x0, y0), (x1, y1) = pts[0], pts[-1]
    dx, dy = x1 - x0, y1 - y0
    n = math.hypot(dx, dy) or 1e-9
    best, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + x1 * y0 - y1 * x0) / n
        if d > best:
            best, idx = d, i
    if best <= eps:
        return [pts[0], pts[-1]]
    return simplify(pts[:idx + 1], eps)[:-1] + simplify(pts[idx:], eps)

paths = []
names = set()
for county in ('48121', '48439', '48113', '48085'):
    r = shapefile.Reader(str(SRC / f'aw-{county}' / f'tl_2024_{county}_areawater.shp'))
    fields = [f[0] for f in r.fields[1:]]
    for sr in r.iterShapeRecords():
        rec = dict(zip(fields, sr.record))
        if rec['AWATER'] < 2_500_000:   # les grands plans d'eau seulement (plus de 2,5 km²)
            continue
        b = sr.shape.bbox
        if b[2] < LON0 or b[0] > LON1 or b[3] < LAT0 or b[1] > LAT1:
            continue
        names.add(rec['FULLNAME'])
        parts = list(sr.shape.parts) + [len(sr.shape.points)]
        d = []
        for a, z in zip(parts[:-1], parts[1:]):
            ring = [xy(*p) for p in sr.shape.points[a:z]]
            # un anneau fermé : on le coupe au point le plus éloigné du premier, et on simplifie chaque moitié
            far = max(range(len(ring)), key=lambda i: math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]))
            ring = simplify(ring[:far + 1], 0.9)[:-1] + simplify(ring[far:], 0.9)
            if len(ring) < 4:
                continue
            d.append('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in ring) + 'Z')
        if d:
            paths.append(''.join(d))

out = ROOT / 'src/partials'
out.mkdir(exist_ok=True)
(out / 'map-lakes.svg').write_text(
    f'<svg class="map__lakes" viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
    f'<path d="{"".join(paths)}" fill-rule="evenodd"/></svg>\n')
cities = json.loads((ROOT / 'data/cities-latlon.json').read_text())
# « North Arlington » et « North Grand Prairie » : leur site dessert le nord de ces villes
cities['Arlington'] = [32.775, -97.115]
cities['Grand Prairie'] = [32.775, -97.02]
pos = {}
for name, (lat, lon) in cities.items():
    x, y = xy(lon, lat)
    pos[name] = [round(x / W * 100, 2), round(y / H * 100, 2)]
(ROOT / 'data/cities.json').write_text(json.dumps({'ratio': round(W / H, 4), 'cities': pos}, indent=1) + '\n')
print(f'{W}x{H}, {len(paths)} plans d\'eau : {sorted(n for n in names if n)}')
print(f'{sum(len(p) for p in paths) // 1024} Ko de tracés')
