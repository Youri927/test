"""Carte de la zone desservie (Fort Walton Beach, Destin, Niceville, Santa Rosa Beach, 30A), d'après le Census américain.

Sources (domaine public) :
  - comtés découpés au trait de côte : https://www2.census.gov/geo/tiger/GENZ2023/shp/cb_2023_us_county_500k.zip
  - surfaces d'eau d'Okaloosa, Walton et Santa Rosa : https://www2.census.gov/geo/tiger/TIGER2023/AREAWATER/tl_2023_<12091|12131|12113>_areawater.zip
La terre et l'eau sont dessinées en image, puis le contour est retracé : les limites de comtés qui coupent la baie disparaissent.
Écrit src/data/coast.json (chemin SVG de la terre, en evenodd, et positions des villes).

    python3 tools/map.py <dossier des fichiers décompressés>   (il faut pyshp, OpenCV et NumPy)
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
import shapefile

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1])
W_, E_, S_, N_ = -86.80, -85.96, 30.25, 30.585
LAT0 = 30.42
VBW = 1600
K = VBW / ((E_ - W_) * np.cos(np.radians(LAT0)))
VBH = round((N_ - S_) * K)
SCALE = 4  # le dessin intermédiaire est 4 fois plus fin que la carte


def xy(lon, lat):
    return (lon - W_) * np.cos(np.radians(LAT0)) * K, (N_ - lat) * K


def rings(shape):
    pts = shape.points
    parts = list(shape.parts) + [len(pts)]
    for a, b in zip(parts, parts[1:]):
        yield np.array([xy(x, y) for x, y in pts[a:b]]) * SCALE


mask = np.zeros((VBH * SCALE, VBW * SCALE), np.uint8)
counties = shapefile.Reader(str(SRC / 'county/cb_2023_us_county_500k'))
for sr in counties.iterShapeRecords():
    if sr.record['STATEFP'] == '12' and sr.record['NAME'] in ('Okaloosa', 'Walton', 'Santa Rosa', 'Bay', 'Washington', 'Holmes'):
        for r in rings(sr.shape):
            cv2.fillPoly(mask, [r.round().astype(np.int32)], 255)
for c in ('12091', '12131', '12113'):
    water = shapefile.Reader(str(SRC / f'aw-{c}/tl_2023_{c}_areawater'))
    for sr in water.iterShapeRecords():
        if sr.record['AWATER'] < 150_000:  # étangs et canaux : trop petits à cette échelle
            continue
        for r in rings(sr.shape):
            pts = r.round().astype(np.int32)
            cv2.fillPoly(mask, [pts], 0)
            # un trait épais sur le bord : referme les jours entre les surfaces d'eau de deux comtés voisins
            cv2.polylines(mask, [pts], True, 0, 3)
# petites îles et petits lacs : supprimés
n, lab, stats, _ = cv2.connectedComponentsWithStats(mask)
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] < 2500:
        mask[lab == i] = 0
inv = 255 - mask
n, lab, stats, _ = cv2.connectedComponentsWithStats(inv)
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] < 2500:
        mask[lab == i] = 255
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
# les chenaux très fins (delta de la rivière, voie navigable intracôtière) se referment : illisibles à cette échelle
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))

cnts, _ = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
paths = []
for c in cnts:
    if cv2.contourArea(c) < 4000:
        continue
    # un lac isolé dans les terres, au nord : sans rapport avec la côte, il distrait
    if cv2.boundingRect(c)[1] + cv2.boundingRect(c)[3] < 150 * SCALE:
        continue
    a = cv2.approxPolyDP(c, 2.2, True)[:, 0, :] / SCALE
    paths.append('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in a) + 'Z')

places = {
    'office': (-86.62840, 30.44927),  # 323 Racetrack Road NW, Fort Walton Beach (OpenStreetMap / Nominatim)
    'destin': (-86.4958, 30.3935),
    'niceville': (-86.4822, 30.5169),
    'santaRosa': (-86.245, 30.372),
}
# la route 30A, de Dune Allen à Inlet Beach : elle longe la plage du golfe, un peu en retrait.
# On suit le trait de côte relevé sur la carte (premier pixel de terre en remontant depuis le golfe), décalé vers l'intérieur.
road = []
for lon in np.linspace(-86.268, -85.99, 24):
    x = int(xy(lon, LAT0)[0] * SCALE)
    col = mask[:, x]
    y = len(col) - 1
    while y > 0 and col[y] == 0:
        y -= 1
    road.append([round(x / SCALE, 1), round(y / SCALE - 7, 1)])
out = {
    'viewBox': [VBW, VBH],
    'land': ''.join(paths),
    'places': {k: [round(v, 1) for v in xy(*p)] for k, p in places.items()},
    'road30A': road,
}
(ROOT / 'src/data').mkdir(exist_ok=True)
(ROOT / 'src/data/coast.json').write_text(json.dumps(out) + '\n')
print(f"{VBW}×{VBH}, {len(paths)} contours, {len(out['land']) // 1024} Ko")
