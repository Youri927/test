"""La carte du secteur : la côte du golfe de Boca Grande à Marco Island, et les onze villes de leur liste.

Source : les fichiers « cartographic boundary » 2023 du Recensement américain, au 1:500 000
(www2.census.gov/geo/tiger/GENZ2023/shp/) : cb_2023_us_county_500k (les comtés) et cb_2023_12_place_500k (les villes
de Floride), dézippés dans un dossier à part. Lecture avec pyshp. Écrit data/map.json : la taille du dessin, le
contour de chaque comté visible (ceux du secteur marqués) et le point de chaque ville, en coordonnées SVG (1000 unités
de haut, projection équirectangulaire corrigée de la latitude).

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
LON0, LON1, LAT0, LAT1 = -82.42, -81.42, 25.84, 27.10
K = 1000 / (LAT1 - LAT0)
CX = math.cos(math.radians((LAT0 + LAT1) / 2))
W = round((LON1 - LON0) * CX * K)
def P(lon, lat): return ((lon - LON0) * CX * K, (LAT1 - lat) * K)


def dp(pts, tol):
    """Douglas-Peucker"""
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
        # les îlots minuscules (moins d'un demi-pixel de large) ne servent à rien
        xs = [x for x, _ in pts]; ys = [y for _, y in pts]
        if max(xs) - min(xs) < 1.2 and max(ys) - min(ys) < 1.2: continue
        d.append('M' + ' '.join(f'{x:.1f} {y:.1f}' for x, y in pts) + 'Z')
    return ''.join(d)


SERVED = {'015': 'Charlotte', '071': 'Lee', '021': 'Collier'}
data = {'w': W, 'h': 1000, 'counties': [], 'towns': []}
r = shapefile.Reader(base + '/cb_2023_us_county_500k/cb_2023_us_county_500k')
for sr in r.iterShapeRecords():
    rec = sr.record.as_dict()
    if rec['STATEFP'] != '12': continue
    x0, y0, x1, y1 = sr.shape.bbox
    if x1 < LON0 - 0.3 or x0 > LON1 + 0.3 or y1 < LAT0 - 0.3 or y0 > LAT1 + 0.3: continue
    data['counties'].append({'name': rec['NAME'], 'served': rec['COUNTYFP'] in SERVED, 'd': path(rings(sr.shape), 0.45)})

# l'ordre de leur liste, du nord au sud ; les noms du Recensement sont les mêmes
TOWNS = ['Port Charlotte', 'Punta Gorda', 'Boca Grande', 'Captiva', 'Sanibel', 'Fort Myers', 'Fort Myers Beach',
         'Estero', 'Bonita Springs', 'Naples', 'Marco Island']
found = {}
p = shapefile.Reader(base + '/cb_2023_12_place_500k/cb_2023_12_place_500k')
for sr in p.iterShapeRecords():
    rec = sr.record.as_dict()
    if rec['NAME'] in TOWNS:
        x0, y0, x1, y1 = sr.shape.bbox
        if not (LON0 < (x0 + x1) / 2 < LON1 and LAT0 < (y0 + y1) / 2 < LAT1): continue
        # le point de la ville : le centre de gravité de son plus grand contour (moyenne des sommets, pondérée par l'aire)
        best = max(rings(sr.shape), key=len)
        a = cx = cy = 0.0
        for (xa, ya), (xb, yb) in zip(best, best[1:] + best[:1]):
            c = xa * yb - xb * ya; a += c; cx += (xa + xb) * c; cy += (ya + yb) * c
        lon, lat = cx / (3 * a), cy / (3 * a)
        x, y = P(lon, lat)
        found[rec['NAME']] = {'name': rec['NAME'], 'x': round(x, 1), 'y': round(y, 1), 'lon': round(lon, 4), 'lat': round(lat, 4)}
# Boca Grande n'est pas un « place » du Recensement (village non incorporé de l'île de Gasparilla) : ses coordonnées
# sont celles de sa page Wikipédia (26°44′56″ N, 82°15′43″ O), dans la partie de l'île qui est dans le comté de Lee.
if 'Boca Grande' not in found:
    x, y = P(-82.26194, 26.74889)
    found['Boca Grande'] = {'name': 'Boca Grande', 'x': round(x, 1), 'y': round(y, 1), 'lon': -82.2619, 'lat': 26.7489}
missing = [t for t in TOWNS if t not in found]
if missing: raise SystemExit(f'villes introuvables : {missing}')
data['towns'] = [found[t] for t in TOWNS]
out.write_text(json.dumps(data))
print(f'{W} x 1000, {len(data["counties"])} comtés, {len(data["towns"])} villes, {out.stat().st_size // 1024} Ko')
for t in data['towns']: print(t)
