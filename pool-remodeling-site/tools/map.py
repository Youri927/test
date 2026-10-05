"""Trace la carte des secteurs (src/map.svg) à partir des données officielles du recensement américain.

Sources (domaine public) : US Census Bureau, TIGER/Line 2024
  - PLACE        tl_2024_04_place          limites des villes d'Arizona
  - PRISECROADS  tl_2024_04_prisecroads    autoroutes et grandes routes
  - LINEARWATER  tl_2024_04013_linearwater rivières, canaux et lits de ruisseaux (comté de Maricopa)
  - AREAWATER    tl_2024_04013_areawater   lacs et réservoirs
Desert Mountain n'est pas une commune : sa position vient d'OpenStreetMap (quartier « Desert Mountain »).

    pip install pyshp
    python3 tools/map.py <dossier contenant les dossiers place/ roads/ lwater/ awater/ décompressés>
"""
import math
import sys
from pathlib import Path

import numpy as np
import shapefile

GEO = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / 'src' / 'map.svg'  # + src/map-bg.svg (trame fixe)

# cadre : longitudes, latitudes
LON0, LON1, LAT0, LAT1 = -112.10, -111.62, 33.43, 33.91
LATC = (LAT0 + LAT1) / 2
W = 800
K = W / ((LON1 - LON0) * math.cos(math.radians(LATC)))
H = round((LAT1 - LAT0) * K)
MILE = K / 69.05  # un mile en unités de la carte (1° de latitude ≈ 69,05 miles)

OFFICE = (33.614838, -111.915629)  # 7645 E Gelding Dr (OpenStreetMap, bâtiment)


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


def inside(b, margin=0.02):
    return not (b[2] < LON0 - margin or b[0] > LON1 + margin or b[3] < LAT0 - margin or b[1] > LAT1 + margin)


def parts(shape):
    idx = list(shape.parts) + [len(shape.points)]
    for s, e in zip(idx, idx[1:]):
        yield shape.points[s:e]


def path(rings, eps, closed=False, minlen=0):
    out = []
    for ring in rings:
        pts = [proj(x, y) for x, y in ring]
        if minlen and sum(math.dist(p, q) for p, q in zip(pts, pts[1:])) < minlen:
            continue
        pts = rdp(pts, eps)
        if len(pts) < 2:
            continue
        # on ne garde que les morceaux qui touchent le cadre
        xs, ys = zip(*pts)
        if max(xs) < -20 or min(xs) > W + 20 or max(ys) < -20 or min(ys) > H + 20:
            continue
        d = 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
        out.append(d + ('Z' if closed else ''))
    return ''.join(out).replace('.0 ', ' ').replace('.0L', 'L').replace('.0Z', 'Z')


svg = []
add = svg.append

# lits de ruisseaux (les « washes » du désert) : une trame très fine
lw = shapefile.Reader(str(GEO / 'lwater' / 'tl_2024_04013_linearwater'))
washes, rivers, canals = [], {}, {}
RIVERS = {'Verde Riv': 'Verde River', 'Salt Riv': 'Salt River'}
CANALS = {'Arizona Cnl': 'Arizona Canal', 'Central Arizona Project Aqueduct': 'CAP Canal', 'C A P Cnl': 'CAP Canal'}
for sr in lw.iterShapeRecords():
    if not inside(sr.shape.bbox):
        continue
    name, kind = sr.record['FULLNAME'], sr.record['MTFCC']
    if name in RIVERS:
        rivers.setdefault(RIVERS[name], []).extend(parts(sr.shape))
    elif name in CANALS:
        canals.setdefault(CANALS[name], []).extend(parts(sr.shape))
    elif kind == 'H3010':
        washes.extend(parts(sr.shape))

aw = shapefile.Reader(str(GEO / 'awater' / 'tl_2024_04013_areawater'))
lakes = [p for sr in aw.iterShapeRecords() if inside(sr.shape.bbox) and sr.record['MTFCC'] in ('H2030', 'H2040')
         and (sr.shape.bbox[2] - sr.shape.bbox[0]) > 0.009 for p in parts(sr.shape)]

pl = shapefile.Reader(str(GEO / 'place' / 'tl_2024_04_place'))
SERVED = {'Scottsdale': 'scottsdale', 'Phoenix': 'phoenix', 'Paradise Valley': 'paradise-valley',
          'Fountain Hills': 'fountain-hills', 'Rio Verde': 'rio-verde'}
CONTEXT = {'Tempe', 'Mesa', 'Carefree', 'Cave Creek'}
cities, context = {}, {}
for sr in pl.iterShapeRecords():
    n = sr.record['NAME']
    if n in SERVED and sr.record['LSAD'] in ('25', '43', '57'):
        cities[SERVED[n]] = list(parts(sr.shape))
    elif n in CONTEXT:
        context[n] = list(parts(sr.shape))

rd = shapefile.Reader(str(GEO / 'roads' / 'tl_2024_04_prisecroads'))
ROUTES = {
    '101': {'Pima Fwy', 'State Rte 101', 'Loop 101', 'Price Fwy'},
    '202': {'Red Mountain Fwy', 'Loop 202', 'State Rte 202'},
    '51': {'Piestewa Fwy', 'State Rte 51'},
    '87': {'Beeline Hwy', 'N Beeline Hwy', 'State Rte 87'},
    '10': {'I- 10', 'Papago Fwy', 'Maricopa Fwy'},
    '17': {'I- 17', 'Black Canyon Fwy'},
    '143': {'Hohokam Expy', 'State Rte 143'},
}
roads = {}
for sr in rd.iterShapeRecords():
    if not inside(sr.shape.bbox):
        continue
    for num, names in ROUTES.items():
        if sr.record['FULLNAME'] in names:
            roads.setdefault(num, []).extend(parts(sr.shape))

add(f'<svg class="map" viewBox="0 0 {W} {H}" role="img" aria-labelledby="map-t map-d" xmlns="http://www.w3.org/2000/svg">')
add('<title id="map-t">Where WAVE works</title>')
add('<desc id="map-d">Map of the cities WAVE serves: Scottsdale, Phoenix, Paradise Valley, Fountain Hills, Rio Verde '
    'and the Desert Mountain area, with city limits, freeways, rivers and canals, and rings every five miles around the '
    'WAVE address on East Gelding Drive. City limits, roads and water from the US Census Bureau (TIGER/Line 2024).</desc>')
bg = [f'<svg class="map-bg" viewBox="0 0 {W} {H}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">',
      f'<path class="m-wash" d="{path(washes, 2.2, minlen=16)}"/>',
      f'<path class="m-lake" d="{path(lakes, .6, closed=True)}"/>']
for name, rings in rivers.items():
    add(f'<path class="m-river" data-name="{name}" pathLength="1" d="{path(rings, .7)}"/>')
for name, rings in canals.items():
    add(f'<path class="m-canal" data-name="{name}" d="{path(rings, .7)}"/>')
for name, rings in context.items():
    bg.append(f'<path class="m-ctx" data-name="{name}" d="{path(rings, .8, closed=True)}"/>')
bg.append('</svg>')
for key, rings in cities.items():
    add(f'<path class="m-city" data-area="{key}" pathLength="1" d="{path(rings, .6, closed=True)}"/>')

# cercles tous les 5 miles autour de l'adresse
ox, oy = proj(OFFICE[1], OFFICE[0])
add('<g class="m-rings">')
for mi in (5, 10, 15, 20):
    r = mi * MILE
    add(f'<circle cx="{ox:.1f}" cy="{oy:.1f}" r="{r:.1f}"/>')
    # étiquette au nord du cercle, un peu à gauche
    a = math.radians(-101)
    add(f'<text x="{ox + r * math.cos(a):.1f}" y="{oy + r * math.sin(a):.1f}">{mi} mi</text>')
add('</g>')

for num, rings in roads.items():
    add(f'<path class="m-road" data-route="{num}" pathLength="1" d="{path(rings, .8)}"/>')

# numéros des routes, posés sur un point du tracé
SHIELDS = {'101': (33.672, -111.892), '51': (33.555, -112.035), '202': (33.452, -111.935), '87': (33.640, -111.763),
           '17': (33.590, -112.085)}


def near(num, lat, lon, layer=None):
    tx, ty = proj(lon, lat)
    best = None
    for ring in (layer if layer is not None else roads.get(num, [])):
        for x, y in ring:
            px, py = proj(x, y)
            d = (px - tx) ** 2 + (py - ty) ** 2
            if best is None or d < best[0]:
                best = (d, px, py)
    return best[1], best[2]


add('<g class="m-shields">')
for num, (lat, lon) in SHIELDS.items():
    if num not in roads:
        continue
    x, y = near(num, lat, lon)
    if not (8 < x < W - 8 and 8 < y < H - 8):
        continue
    w = 14 + 7 * len(num)
    add(f'<g transform="translate({x:.1f} {y:.1f})"><rect x="{-w / 2:.1f}" y="-9" width="{w}" height="18" rx="9"/>'
        f'<text y="4">{num}</text></g>')
add('</g>')

# noms des villes (point intérieur du recensement, déplacé quand il tombe hors du cadre)
LABELS = [
    ('phoenix', 'Phoenix', 33.505, -112.055),
    ('paradise-valley', 'Paradise Valley', 33.545, -111.958),
    ('scottsdale', 'Scottsdale', 33.700, -111.840),
    ('fountain-hills', 'Fountain Hills', 33.604, -111.744),
    ('rio-verde', 'Rio Verde', 33.726, -111.676),
    ('desert-mountain', 'Desert Mountain', 33.8418, -111.8622),
]
add('<g class="m-labels">')
for key, name, lat, lon in LABELS:
    x, y = proj(lon, lat)
    add(f'<text class="m-label" data-area="{key}" x="{x:.1f}" y="{y:.1f}">{name}</text>')
add('</g>')
# Desert Mountain : un point (position OpenStreetMap), pas de limite officielle
dx, dy = proj(-111.8622, 33.8418)
add(f'<circle class="m-dot" data-area="desert-mountain" cx="{dx:.1f}" cy="{dy + 12:.1f}" r="3.5"/>')

WATER = [('Arizona Canal', canals, 33.548, -111.990, -4, 14), ('CAP Canal', canals, 33.655, -111.990, 6, -8),
         ('Verde River', rivers, 33.700, -111.690, 8, 0), ('Salt River', rivers, 33.465, -111.770, 6, 14)]
for name, layer, lat, lon, ox_, oy_ in WATER:
    if name not in layer:
        continue
    x, y = near(None, lat, lon, layer[name])
    add(f'<text class="m-water-label" x="{x + ox_:.1f}" y="{y + oy_:.1f}">{name}</text>')

add(f'<g class="m-office" transform="translate({ox:.1f} {oy:.1f})"><circle class="m-office__halo" r="16"/>'
    f'<circle class="m-office__dot" r="6"/><text x="14" y="-12">WAVE</text><text class="m-office__addr" x="14" y="4">7645 E Gelding Dr</text></g>')
add('</svg>')

data = '\n'.join(svg)
OUT.write_text(data)
(OUT.parent / 'map-bg.svg').write_text('\n'.join(bg))
print(f'{OUT.name}: {W}×{H}, {len(data) // 1024} Ko, villes {sorted(cities)}, routes {sorted(roads)}, '
      f'rivières {sorted(rivers)}, canaux {sorted(canals)}, {len(washes)} lits de ruisseaux, {len(lakes)} plans d\'eau')
