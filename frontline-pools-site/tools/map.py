"""Trace la carte de la baie de Tampa (src/map.svg) d'après les données officielles du recensement américain.

Sources (domaine public) : US Census Bureau, TIGER/Line 2024
  - COUNTY      tl_2024_us_county             terres (comtés de Hillsborough, Pinellas, Pasco, Polk, Manatee)
  - AREAWATER   tl_2024_<comté>_areawater     baie, golfe, lacs
  - PRISECROADS tl_2024_12_prisecroads        autoroutes
  - PLACE       tl_2024_12_place              position des villes et des CDP (point intérieur officiel)
Davis Islands, South Tampa et New Tampa sont des quartiers de Tampa, absents du recensement : leur position est
approchée d'après OpenStreetMap. Le point « 33603 » est placé dans ce code postal, sans adresse précise.

    pip install pyshp numpy
    python3 tools/map.py <dossier contenant les dossiers tl_2024_* décompressés>
"""
import math
import sys
from pathlib import Path

import numpy as np
import shapefile

GEO = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / 'src' / 'map.svg'  # + src/map-bg.svg (fond)

LON0, LON1, LAT0, LAT1 = -82.80, -82.04, 27.70, 28.42
LATC = (LAT0 + LAT1) / 2
W = 800
K = W / ((LON1 - LON0) * math.cos(math.radians(LATC)))
H = round((LAT1 - LAT0) * K)
MILE = K / 69.05


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


def inside(b, margin=0.05):
    return not (b[2] < LON0 - margin or b[0] > LON1 + margin or b[3] < LAT0 - margin or b[1] > LAT1 + margin)


def parts(shape):
    idx = list(shape.parts) + [len(shape.points)]
    for s, e in zip(idx, idx[1:]):
        yield shape.points[s:e]


def path(rings, eps, closed=False, minarea=0.0):
    out = []
    for ring in rings:
        pts = [proj(x, y) for x, y in ring]
        if minarea:
            xs, ys = zip(*pts)
            if (max(xs) - min(xs)) * (max(ys) - min(ys)) < minarea:
                continue
        pts = rdp(pts, eps)
        if len(pts) < (3 if closed else 2):
            continue
        xs, ys = zip(*pts)
        if max(xs) < -30 or min(xs) > W + 30 or max(ys) < -30 or min(ys) > H + 30:
            continue
        out.append('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + ('Z' if closed else ''))
    return ''.join(out).replace('.0 ', ' ').replace('.0L', 'L').replace('.0Z', 'Z')


def reader(name):
    return shapefile.Reader(str(GEO / name / name))


# terres : les comtés autour de la baie (leurs limites englobent aussi l'eau, recouverte ensuite)
land = []
for sr in reader('tl_2024_us_county').iterShapeRecords():
    if sr.record['STATEFP'] == '12' and sr.record['COUNTYFP'] in ('057', '103', '101', '105', '081', '053'):
        land.extend(parts(sr.shape))

water, lakes = [], []
for fips in ('12057', '12103', '12101', '12081'):
    for sr in reader(f'tl_2024_{fips}_areawater').iterShapeRecords():
        if not inside(sr.shape.bbox):
            continue
        b = sr.shape.bbox
        big = (b[2] - b[0]) > 0.05 or (b[3] - b[1]) > 0.05
        (water if big else lakes).extend(parts(sr.shape))

ROUTES = {'275': {'I- 275'}, '75': {'I- 75'}, '4': {'I- 4'}, 'selmon': {'Selmon Expy', 'State Hwy 618'},
          'veterans': {'Veterans Expy', 'State Hwy 589', 'Suncoast Pkwy'}}
roads = {}
for sr in reader('tl_2024_12_prisecroads').iterShapeRecords():
    if not inside(sr.shape.bbox):
        continue
    for key, names in ROUTES.items():
        if sr.record['FULLNAME'] in names:
            roads.setdefault(key, []).extend(parts(sr.shape))

census = {}
for rec in reader('tl_2024_12_place').iterRecords():
    census[rec['NAME']] = (float(rec['INTPTLAT']), float(rec['INTPTLON']))

# secteurs : clé, nom affiché, position, côté de l'étiquette
AREAS = [
    ('davis-islands', 'Davis Islands', (27.9177, -82.4547), 'r'),
    ('south-tampa', 'South Tampa', (27.9120, -82.5050), 'b'),
    ('carrollwood', 'Carrollwood', census['Carrollwood'], 'r'),
    ('town-n-country', 'Town ’n’ Country', census["Town 'n' Country"], 'l'),
    ('westchase', 'Westchase', census['Westchase'], 'l'),
    ('citrus-park', 'Citrus Park', census['Citrus Park'], 'l'),
    ('new-tampa', 'New Tampa', (28.1330, -82.3600), 'r'),
    ('wesley-chapel', 'Wesley Chapel', census['Wesley Chapel'], 'r'),
    ('temple-terrace', 'Temple Terrace', census['Temple Terrace'], 'r'),
    ('brandon', 'Brandon', census['Brandon'], 'r'),
    ('valrico', 'Valrico', census['Valrico'], 'r'),
    ('bloomingdale', 'Bloomingdale', census['Bloomingdale'], 'r'),
    ('riverview', 'Riverview', census['Riverview'], 'l'),
    ('apollo-beach', 'Apollo Beach', census['Apollo Beach'], 'r'),
    ('plant-city', 'Plant City', census['Plant City'], 'l'),
    ('hudson', 'Hudson', census['Hudson'], 'r'),
]
BASE = (27.9850, -82.4640)  # dans le code postal 33603

svg = []
add = svg.append
# Deux calques. Le fond (côtes, lacs, routes) est une image SVG autonome : le navigateur la dessine une seule fois.
# Par-dessus, un SVG léger porte les textes (dans la police du site) et les secteurs, seuls à s'animer.
bg = [f'<svg viewBox="0 0 {W} {H}" width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg">',
      '<style>.s{fill:#1d305d}.l{fill:#eef2f7}.r{fill:none;stroke:#c1cad9;stroke-width:1.4;stroke-linejoin:round}'
      '.c{stroke:#1d305d;stroke-width:1.5;fill:none}.b{fill:#fff;stroke:#b7c1d2}</style>',
      f'<rect class="s" width="{W}" height="{H}"/>',
      f'<path class="l" d="{path(land, .8, closed=True)}"/>',
      f'<path class="s" d="{path(water, .7, closed=True)}"/>',
      f'<path class="s" d="{path(lakes, .7, closed=True, minarea=14)}"/>']
for key, rings in roads.items():
    bg.append(f'<path class="r" d="{path(rings, .7)}"/>')

add(f'<svg class="map" viewBox="0 0 {W} {H}" role="img" aria-labelledby="map-t map-d" xmlns="http://www.w3.org/2000/svg">')
add('<title id="map-t">Where Frontline Pools works</title>')
add('<desc id="map-d">Map of Tampa Bay with the neighborhoods Frontline Pools serves, from Hudson and Wesley Chapel in '
    'the north to Apollo Beach in the south and Plant City in the east. Coastline, lakes and highways from the US Census '
    'Bureau (TIGER/Line 2024).</desc>')

# numéros d'autoroutes, posés sur un point du tracé
SHIELDS = {'275': (28.150, -82.465), '75': (28.090, -82.335), '4': (28.015, -82.250)}
add('<g class="m-shields" aria-hidden="true">')
for key, (lat, lon) in SHIELDS.items():
    tx, ty = proj(lon, lat)
    best = min(((proj(x, y)[0] - tx) ** 2 + (proj(x, y)[1] - ty) ** 2, proj(x, y)) for ring in roads[key] for x, y in ring)
    x, y = best[1]
    add(f'<g transform="translate({x:.1f} {y:.1f})"><rect x="-17" y="-9" width="34" height="18" rx="3"/><text y="4.5">{key}</text></g>')
add('</g>')

# échelle : 5 miles
sx, sy = 28, H - 28
add(f'<g class="m-scale" aria-hidden="true"><path d="M{sx} {sy}h{5 * MILE:.1f}"/><path d="M{sx} {sy - 4}v8M{sx + 5 * MILE:.1f} {sy - 4}v8"/>'
    f'<text x="{sx}" y="{sy - 10}">5 miles</text></g>')

# repères de mer
for name, (lat, lon), rot in [('Gulf of Mexico', (28.20, -82.789), -90), ('Old Tampa Bay', (27.952, -82.645), 0),
                              ('Tampa Bay', (27.752, -82.585), 0)]:
    x, y = proj(lon, lat)
    tr = f' transform="rotate({rot} {x:.1f} {y:.1f})"' if rot else ''
    add(f'<text class="m-sea-label" x="{x:.1f}" y="{y:.1f}"{tr} aria-hidden="true">{name}</text>')

bx, by = proj(BASE[1], BASE[0])
add(f'<g class="m-base" transform="translate({bx:.1f} {by:.1f})"><circle class="m-base-ring" r="15"/><circle r="6.5"/>'
    f'<text x="-21" y="4.5" text-anchor="end">Tampa 33603</text></g>')
add('<g class="m-areas">')
for key, label, (lat, lon), side in AREAS:
    x, y = proj(lon, lat)
    tx, ty, anchor = {'r': (11, 4.5, 'start'), 'l': (-11, 4.5, 'end'), 'b': (0, 22, 'middle')}[side]
    add(f'<g class="m-area" data-area="{key}" transform="translate({x:.1f} {y:.1f})" tabindex="-1">'
        f'<circle class="m-hit" r="16"/><circle class="m-ring" r="11"/><circle class="m-dot" r="5"/>'
        f'<text x="{tx}" y="{ty}" text-anchor="{anchor}">{label}</text></g>')
add('</g>')
add('</svg>')
bg.append('</svg>')
(OUT.parent / 'map-bg.svg').write_text('\n'.join(bg))
OUT.write_text('\n'.join(svg))
print(OUT, f'{W}x{H}', f'{OUT.stat().st_size // 1024} KB')
