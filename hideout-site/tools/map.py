"""Carte de la visite, dessinée à partir des données OpenStreetMap (© OpenStreetMap contributors, ODbL 1.0).

Lit un extrait .osm (API OpenStreetMap, /api/0.6/map) et écrit deux SVG :
  - src/map-wide.svg : du Caloosahatchee (à l'ouest) à Summerlin Road (à l'est), à la latitude du cabinet (ordinateur) ;
  - src/map-tall.svg : un cadrage resserré autour du cabinet (téléphone).
On y voit le fleuve (fermé par sa rive), les bassins, les bâtiments, les rues (trois épaisseurs selon leur rang),
le nom des grandes rues, un repère (le Broadway Palm Dinner Theater), une échelle, et le
bâtiment du cabinet en or, entouré du cadre du logo.

L'emplacement est celui que donne leur propre site (données structurées et lien Google Maps : 26.5943023,
-81.889333) ; il tombe dans le bâtiment OpenStreetMap 1056427409.

    python3 -I tools/map.py <extrait.osm>
"""
import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OFFICE = '1056427409'
LABELS = {'Colonial Boulevard': 'Colonial Blvd', 'McGregor Boulevard': 'McGregor Blvd', 'Summerlin Road': 'Summerlin Rd'}
POIS = {'Broadway Palm Dinner Theater': 'Broadway Palm'}

nodes, ways, named = {}, {}, {}
r = ET.parse(sys.argv[1]).getroot()
for n in r.iter('node'):
    nodes[n.get('id')] = (float(n.get('lon')), float(n.get('lat')))
    tg = {t.get('k'): t.get('v') for t in n.findall('tag')}
    if tg.get('name') in POIS:
        named[tg['name']] = nodes[n.get('id')]
for w in r.iter('way'):
    tg = {t.get('k'): t.get('v') for t in w.findall('tag')}
    ways[w.get('id')] = ([nd.get('ref') for nd in w.findall('nd')], tg)


def pts(refs):
    return [nodes[x] for x in refs if x in nodes]


for wid, (refs, tg) in ways.items():
    if tg.get('name') in POIS and tg['name'] not in named:
        p = pts(refs)
        named[tg['name']] = (sum(a[0] for a in p) / len(p), sum(a[1] for a in p) / len(p))


def chain(segments):
    """Relie des morceaux de ligne bout à bout (la rive du fleuve)."""
    segs = [list(s) for s in segments if len(s) > 1]
    out = []
    while segs:
        cur = segs.pop(0)
        grew = True
        while grew:
            grew = False
            for i, s in enumerate(segs):
                if s[0] == cur[-1]:
                    cur += s[1:]
                elif s[-1] == cur[-1]:
                    cur += s[::-1][1:]
                elif s[-1] == cur[0]:
                    cur = s[:-1] + cur
                elif s[0] == cur[0]:
                    cur = s[::-1][:-1] + cur
                else:
                    continue
                segs.pop(i)
                grew = True
                break
        out.append(cur)
    return out


def straight(q, limit=24):
    """Coupe un tracé aux virages de plus de `limit` degrés : un nom ne fait pas l'angle d'une rue."""
    out, cur = [], q[:2]
    for i in range(2, len(q)):
        a = math.atan2(cur[-1][1] - cur[-2][1], cur[-1][0] - cur[-2][0])
        b = math.atan2(q[i][1] - cur[-1][1], q[i][0] - cur[-1][0])
        turn = abs((math.degrees(b - a) + 180) % 360 - 180)
        if turn > limit and math.dist(q[i], cur[-1]) > 2:
            out.append(cur)
            cur = [cur[-1], q[i]]
        else:
            cur.append(q[i])
    out.append(cur)
    return [c for c in out if len(c) > 1]


def num(v):
    """Un nombre en dixièmes, écrit au plus court : 12, -3.5, .4, -.4."""
    t = f'{v / 10:.1f}'.rstrip('0').rstrip('.')
    if t.startswith('0.'):
        t = t[1:]
    elif t.startswith('-0.'):
        t = '-' + t[2:]
    return '0' if t in ('', '-0') else t


def pack(vals):
    """Des nombres à la suite, sans espace devant un signe moins ni devant un point quand c'est sans ambiguïté."""
    out = ''
    for v in map(num, vals):
        if out and not v.startswith('-') and not (v.startswith('.') and '.' in out.split(' ')[-1].split('-')[-1]):
            out += ' '
        out += v
    return out


class View:
    """Projection équirectangulaire (corrigée de la latitude) d'une fenêtre lon/lat vers un viewBox de largeur W."""

    def __init__(self, lon0, lat0, lon1, lat1, W):
        self.lon0, self.lat0, self.lon1, self.lat1 = lon0, lat0, lon1, lat1
        self.k = math.cos(math.radians((lat0 + lat1) / 2))
        self.W = W
        self.s = W / ((lon1 - lon0) * self.k)
        self.H = round((lat1 - lat0) * self.s)
        self.m = 111320 / self.s  # mètres par unité du viewBox

    def xy(self, p):
        return ((p[0] - self.lon0) * self.k * self.s, (self.lat1 - p[1]) * self.s)

    def path(self, p, close=False):
        # un premier point absolu, puis des écarts relatifs au dixième d'unité, calculés entre points déjà arrondis
        if len(p) < 2:
            return ''
        q = [(round(x * 10), round(y * 10)) for x, y in (self.xy(a) for a in p)]
        steps = [(x1 - x0, y1 - y0) for (x0, y0), (x1, y1) in zip(q, q[1:]) if (x1, y1) != (x0, y0)]
        if not steps:
            return ''
        return 'M' + pack([q[0][0], q[0][1]]) + 'l' + pack([v for st in steps for v in st]) + ('z' if close else '')

    def inside(self, p, margin=0.002):
        return any(self.lon0 - margin <= a <= self.lon1 + margin and self.lat0 - margin <= b <= self.lat1 + margin for a, b in p)


def render(view, out, fs, lw, label_at=None):
    label_at = label_at or {}
    W, H = view.W, view.H
    parts, defs, texts = [], [], []
    # le fleuve : la rive (la terre est à gauche du sens du tracé, le fleuve à l'ouest), refermée par le bord ouest
    for c in chain([pts(x) for x, tg in ways.values() if tg.get('natural') == 'coastline']):
        if not view.inside(c, 0.01):
            continue
        if c[0][1] < c[-1][1]:
            c = c[::-1]  # du nord au sud
        far = view.lon0 - 0.05
        poly = [(far, view.lat1 + 0.05), (c[0][0], view.lat1 + 0.05)] + c + [(c[-1][0], view.lat0 - 0.05), (far, view.lat0 - 0.05)]
        parts.append(f'<path class="m-water" d="{view.path(poly, True)}"/>')
    for x, tg in ways.values():
        p = pts(x)
        if tg.get('natural') == 'water' and x and x[0] == x[-1] and view.inside(p):
            parts.append(f'<path class="m-water" d="{view.path(p, True)}"/>')
    blds = [view.path(pts(x), True) for wid, (x, tg) in ways.items()
            if 'building' in tg and wid != OFFICE and len(x) > 3 and view.inside(pts(x), 0.0005)]
    parts.append(f'<path class="m-bld" d="{" ".join(blds)}"/>')
    ranks = {
        'minor': ('residential', 'unclassified', 'living_street', 'tertiary_link', 'service'),
        'mid': ('tertiary', 'secondary', 'secondary_link'),
        'major': ('primary', 'primary_link', 'trunk', 'trunk_link'),
    }
    for rank, kinds in ranks.items():
        d = ' '.join(view.path(pts(x)) for x, tg in ways.values()
                     if tg.get('highway') in kinds and view.inside(pts(x))
                     and not (tg.get('highway') == 'service' and tg.get('service') in ('parking_aisle', 'drive-through')))
        if d:
            w = {'minor': lw, 'mid': lw * 2.2, 'major': lw * 3.4}[rank]
            parts.append(f'<path class="m-road m-{rank}" d="{d}" stroke-width="{w:.2f}"/>')
    # noms de rues : le plus long tracé presque droit et visible, loin des bords, au-dessus de la rue
    inset = fs * 2
    for name, text in LABELS.items():
        segs = [x for x, tg in ways.values() if tg.get('name') == name and tg.get('highway') not in (None, 'footway')]
        best = None
        for c in chain(segs):
            q = [view.xy(a) for a in pts(c)]
            q = [a for a in q if inset <= a[0] <= W - inset and inset <= a[1] <= H - inset]
            for piece in straight(q):
                length = sum(math.dist(piece[i], piece[i + 1]) for i in range(len(piece) - 1))
                if length and math.dist(piece[0], piece[-1]) >= 0.94 * length and (best is None or length > best[1]):
                    best = (piece, length)
        if not best or best[1] < len(text) * fs * 0.62 * 1.2:
            continue
        q, length = best
        vertical = abs(q[-1][1] - q[0][1]) > abs(q[-1][0] - q[0][0])
        if (not vertical and q[0][0] > q[-1][0]) or (vertical and q[0][1] < q[-1][1]):
            q = q[::-1]
        pid = f'{out.stem}-st{len(defs)}'
        defs.append(f'<path id="{pid}" d="M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in q) + '"/>')
        at = label_at.get(name, 50)
        texts.append(f'<text class="m-label" font-size="{fs}" dy="{-fs * 0.85:.1f}"><textPath href="#{pid}" startOffset="{at}%" text-anchor="middle">{text}</textPath></text>')
    # le fleuve : son nom, en travers de l'eau, le long de la rive
    coast = [view.xy(a) for c in chain([pts(x) for x, tg in ways.values() if tg.get('natural') == 'coastline']) for a in c]
    coast = [a for a in coast if 0 <= a[1] <= H and 0 <= a[0] <= W]
    if coast:
        xs = sorted(a[0] for a in coast)
        xm = xs[len(xs) // 2]
        if xm > fs * 6:
            texts.append(f'<text class="m-label m-label--water" font-size="{fs}" transform="translate({xm * 0.45:.1f} {H * 0.62:.1f}) rotate(-72)" text-anchor="middle">Caloosahatchee River</text>')
    # repères
    office = pts(ways[OFFICE][0])
    cx = sum(view.xy(a)[0] for a in office) / len(office)
    cy = sum(view.xy(a)[1] for a in office) / len(office)
    for name, text in POIS.items():
        if name in named and view.inside([named[name]], 0):
            x, y = view.xy(named[name])
            right = x >= cx
            anchor = '' if right else ' text-anchor="end"'
            texts.append(f'<g class="m-poi"><circle cx="{x:.1f}" cy="{y:.1f}" r="{fs * 0.22:.1f}"/>'
                         f'<text x="{x + (fs * 0.55 if right else -fs * 0.55):.1f}" y="{y + fs * 0.32:.1f}" font-size="{fs * 0.86:.1f}"'
                         f'{anchor}>{text}</text></g>')
    # le cabinet : le bâtiment en or, le cadre du logo autour (pattes à 23,6 %), son nom dessous
    parts.append(f'<path class="m-office" d="{view.path(office, True)}"/>')
    bx = [view.xy(a)[0] for a in office]
    by = [view.xy(a)[1] for a in office]
    pad = fs * 1.1
    fx0, fx1 = min(bx) - pad * 1.6, max(bx) + pad * 1.6
    fy0, fy1 = min(by) - pad, max(by) + pad
    leg = (fy1 - fy0) * 0.236
    frame = (f'<g class="m-frame" fill="none" stroke-width="{lw * 1.9:.2f}" data-frame>'
             f'<path pathLength="1" d="M{fx0:.1f} {fy0 + leg:.1f}V{fy0:.1f}H{fx1:.1f}V{fy0 + leg:.1f}"/>'
             f'<path pathLength="1" d="M{fx0:.1f} {fy1 - leg:.1f}V{fy1:.1f}H{fx1:.1f}V{fy1 - leg:.1f}"/></g>')
    texts.append(f'<text class="m-office-name" font-size="{fs * 1.1:.1f}" x="{cx:.1f}" y="{fy1 + fs * 1.55:.1f}" text-anchor="middle">Hideout Boutique</text>')
    # échelle : 200 m (et son équivalent en pieds), en bas à droite
    sb = 200 / view.m
    x1, y0 = W - fs * 1.6, H - fs * 1.6
    scale = (f'<g class="m-scale"><path d="M{x1 - sb:.1f} {y0 - fs * 0.45:.1f}V{y0:.1f}H{x1:.1f}V{y0 - fs * 0.45:.1f}" stroke-width="{lw * 1.1:.2f}"/>'
             f'<text x="{x1 - sb - fs * 0.6:.1f}" y="{y0:.1f}" font-size="{fs * 0.86:.1f}" text-anchor="end">200 m, 660 ft</text></g>')
    svg = (f'<svg class="map__svg" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="{out.stem}-t">'
           f'<title id="{out.stem}-t">Map: Hideout Boutique at 1342 Colonial Blvd, Suite H57, Fort Myers, just south of Colonial Boulevard and east of McGregor Boulevard</title>'
           f'<defs>{"".join(defs)}</defs>' + ''.join(parts) + frame + ''.join(texts) + scale + '</svg>')
    out.write_text(svg)
    print(f'{out.name} : {W} x {H}, {len(svg) / 1024:.0f} Ko, cabinet à ({cx / W:.3f}, {cy / H:.3f}), 200 m = {sb:.0f} unités')


lon_o, lat_o = (sum(c) / len(c) for c in zip(*pts(ways[OFFICE][0])))
render(View(-81.9002, lat_o - 0.0042, -81.8788, lat_o + 0.0040, 1600), ROOT / 'src' / 'map-wide.svg', 19, 1.3)
render(View(lon_o - 0.0040, lat_o - 0.0046, lon_o + 0.0034, lat_o + 0.0040, 800), ROOT / 'src' / 'map-tall.svg', 26, 2, {'Colonial Boulevard': 62})
