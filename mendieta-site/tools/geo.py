"""Tracés de la carte du secteur : les comtés de Palm Beach et de Broward et les 25 villes de leur liste.

Source : les fichiers « cartographic boundary » 2023 du Recensement américain, au 1:500 000
(www2.census.gov/geo/tiger/GENZ2023/shp/) : cb_2023_us_county_500k et cb_2023_12_place_500k, dézippés dans un
dossier à part. Lecture avec pyshp (installé hors du projet). Écrit data/map.json : la taille du dessin, le contour de
chaque comté et, pour chaque ville, son contour simplifié et son centre, en coordonnées SVG (1000 unités de haut,
projection équirectangulaire corrigée de la latitude).

    python3 -I tools/geo.py <dossier où est installé pyshp> <dossier des fichiers du Recensement>
"""
import json
import math
import sys
from pathlib import Path

sys.path.insert(0, sys.argv[1])
import shapefile  # noqa: E402

base = sys.argv[2]
out = Path(__file__).resolve().parent.parent / 'data/map.json'
LON0, LON1, LAT0, LAT1 = -80.47, -79.84, 25.965, 26.985
K = 1000 / (LAT1 - LAT0)                    # 1000 unités de haut
CX = math.cos(math.radians((LAT0 + LAT1) / 2))
W = round((LON1 - LON0) * CX * K)
def P(lon, lat): return ((lon - LON0) * CX * K, (LAT1 - lat) * K)

def dp(pts, tol):
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1e-9
    i, dmax = 0, -1
    for k in range(1, len(pts) - 1):
        x, y = pts[k]; d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / L
        if d > dmax: i, dmax = k, d
    if dmax <= tol: return [pts[0], pts[-1]]
    return dp(pts[:i + 1], tol)[:-1] + dp(pts[i:], tol)

def dp_ring(pts, tol):
    # anneau fermé : on le coupe au point le plus éloigné du premier, puis on simplifie chaque moitié
    if pts[0] == pts[-1]: pts = pts[:-1]
    if len(pts) < 4: return pts
    x0, y0 = pts[0]
    far = max(range(len(pts)), key=lambda k: (pts[k][0] - x0) ** 2 + (pts[k][1] - y0) ** 2)
    a = dp(pts[:far + 1], tol); b = dp(pts[far:] + [pts[0]], tol)
    return a[:-1] + b[:-1]

def rings(shape):
    idx = list(shape.parts) + [len(shape.points)]
    return [shape.points[idx[i]:idx[i + 1]] for i in range(len(shape.parts))]

def path(rs, tol):
    d = []
    for r in rs:
        pts = dp_ring([P(*p) for p in r], tol)
        if len(pts) < 3: continue
        d.append('M' + ' '.join(f'{x:.1f} {y:.1f}' for x, y in pts) + 'Z')
    return ''.join(d)

data = {'w': W, 'h': 1000, 'counties': {}, 'cities': []}
r = shapefile.Reader(base + '/cb_2023_us_county_500k/cb_2023_us_county_500k')
for sr in r.iterShapeRecords():
    rec = sr.record.as_dict()
    if rec['STATEFP'] == '12' and rec['COUNTYFP'] in ('099', '011'):
        data['counties'][rec['NAME']] = path(rings(sr.shape), 0.35)

LIST = {  # nom sur leur site -> nom du Recensement
    'West Palm Beach': 'West Palm Beach', 'Palm Beach': 'Palm Beach', 'Palm Beach Gardens': 'Palm Beach Gardens',
    'Jupiter': 'Jupiter', 'Wellington': 'Wellington', 'Greenacres': 'Greenacres', 'Lake Worth': 'Lake Worth Beach',
    'Loxahatchee': 'Loxahatchee Groves', 'Boynton Beach': 'Boynton Beach', 'Delray Beach': 'Delray Beach',
    'Boca Raton': 'Boca Raton', 'Deerfield Beach': 'Deerfield Beach', 'Pompano Beach': 'Pompano Beach',
    'Coconut Creek': 'Coconut Creek', 'Margate': 'Margate', 'Coral Springs': 'Coral Springs', 'Tamarac': 'Tamarac',
    'Lauderhill': 'Lauderhill', 'Oakland Park': 'Oakland Park', 'Sunrise': 'Sunrise', 'Plantation': 'Plantation',
    'Fort Lauderdale': 'Fort Lauderdale', 'Davie': 'Davie', 'Dania': 'Dania Beach', 'Pembroke Pines': 'Pembroke Pines'}
PB = {'West Palm Beach', 'Palm Beach', 'Palm Beach Gardens', 'Jupiter', 'Wellington', 'Greenacres', 'Lake Worth',
      'Loxahatchee', 'Boynton Beach', 'Delray Beach', 'Boca Raton'}
inv = {v: k for k, v in LIST.items()}
p = shapefile.Reader(base + '/cb_2023_12_place_500k/cb_2023_12_place_500k')
for sr in p.iterShapeRecords():
    rec = sr.record.as_dict()
    if rec['NAME'] in inv and sr.shape.bbox[0] > -80.6:
        name = inv[rec['NAME']]
        rs = rings(sr.shape)
        # centre : moyenne pondérée des aires des anneaux (centroïde de polygone)
        A = Cx = Cy = 0
        for rr in rs:
            q = [P(*pt) for pt in rr]
            for (x1, y1), (x2, y2) in zip(q, q[1:] + q[:1]):
                c = x1 * y2 - x2 * y1; A += c; Cx += (x1 + x2) * c; Cy += (y1 + y2) * c
        cx, cy = Cx / (3 * A), Cy / (3 * A)
        data['cities'].append({'name': name, 'census': rec['NAMELSAD'], 'county': 'Palm Beach' if name in PB else 'Broward',
                               'x': round(cx, 1), 'y': round(cy, 1), 'd': path(rs, 0.35)})
data['cities'].sort(key=lambda c: c['y'])
out.parent.mkdir(exist_ok=True)
print(W, len(data['cities']), sum(len(c['d']) for c in data['cities']), {k: len(v) for k, v in data['counties'].items()})
json.dump(data, open(out, 'w'))
