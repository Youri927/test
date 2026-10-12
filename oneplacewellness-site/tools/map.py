"""Carte de la visite, dessinée à partir des données OpenStreetMap (© OpenStreetMap contributors, ODbL 1.0).

Lit des extraits .osm (API OpenStreetMap, /api/0.6/map) et écrit deux SVG :
  - src/map-wide.svg : la bande qui va de la plage au Tamiami Trail, à la latitude du cabinet (ordinateur) ;
  - src/map-tall.svg : un cadrage resserré autour du cabinet (téléphone).
On y voit la mer (fermée par le trait de côte), les plages, les plans d'eau et les canaux, les bâtiments, les rues
(trois épaisseurs selon leur rang), les noms de quelques rues, une échelle et le cabinet au violet du marqueur.

    python3 -I tools/map.py <extrait.osm> [<extrait.osm> …]
"""
import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OFFICE = '523816065'  # le bâtiment du 827 Myrtle Terrace dans OpenStreetMap
LABELS = {
    'Tamiami Trail North': 'Tamiami Trail North (US 41)',
    'Pine Ridge Road': 'Pine Ridge Road',
    'Seagate Drive': 'Seagate Drive',
    'Crayton Road': 'Crayton Road',
    'Gulf Shore Boulevard North': 'Gulf Shore Blvd N',
    'Myrtle Terrace': 'Myrtle Terrace',
}

# ——— lecture : nœuds, chemins et relations de tous les extraits ———
nodes, ways, rels = {}, {}, []
for f in sys.argv[1:]:
    r = ET.parse(f).getroot()
    for n in r.iter('node'):
        nodes[n.get('id')] = (float(n.get('lon')), float(n.get('lat')))
    for w in r.iter('way'):
        tg = {t.get('k'): t.get('v') for t in w.findall('tag')}
        ways[w.get('id')] = ([nd.get('ref') for nd in w.findall('nd')], tg)
    for rel in r.iter('relation'):
        tg = {t.get('k'): t.get('v') for t in rel.findall('tag')}
        rels.append(([(m.get('type'), m.get('ref'), m.get('role')) for m in rel.findall('member')], tg))


def pts(refs):
    return [nodes[r] for r in refs if r in nodes]


def chain(segments):
    """Relie des morceaux de ligne bout à bout (trait de côte, anneaux de multipolygone)"""
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


def straight(q, limit=28):
    """Coupe un tracé aux virages de plus de `limit` degrés : un nom ne fait pas l'angle d'une rue"""
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
    """Des nombres à la suite, sans espace devant un signe moins ni devant un point quand le nombre d'avant en a déjà un."""
    out = ''
    for v in map(num, vals):
        if out and not v.startswith('-') and not (v.startswith('.') and '.' in out.split(' ')[-1].split('-')[-1]):
            out += ' '
        out += v
    return out


class View:
    """Projection équirectangulaire (corrigée de la latitude) d'une fenêtre lon/lat vers un viewBox de largeur W"""

    def __init__(self, lon0, lat0, lon1, lat1, W):
        self.lon0, self.lat0, self.lon1, self.lat1 = lon0, lat0, lon1, lat1
        k = math.cos(math.radians((lat0 + lat1) / 2))
        self.W = W
        self.s = W / ((lon1 - lon0) * k)
        self.k = k
        self.H = round((lat1 - lat0) * self.s)
        # mètres par unité du viewBox (1° de latitude ≈ 111 320 m)
        self.m = 111320 / self.s

    def xy(self, p):
        lon, lat = p
        return ((lon - self.lon0) * self.k * self.s, (self.lat1 - lat) * self.s)

    def path(self, p, close=False):
        # tracé compact : un premier point absolu, puis des écarts relatifs, au dixième d'unité (les écarts sont calculés
        # entre points déjà arrondis, pour que l'erreur ne s'accumule pas le long du tracé)
        if len(p) < 2:
            return ''
        q = [(round(x * 10), round(y * 10)) for x, y in (self.xy(a) for a in p)]
        steps = [(x1 - x0, y1 - y0) for (x0, y0), (x1, y1) in zip(q, q[1:]) if (x1, y1) != (x0, y0)]
        if not steps:
            return ''
        d = 'M' + pack([q[0][0], q[0][1]]) + 'l' + pack([v for st in steps for v in st])
        return d + ('z' if close else '')

    def inside(self, p, margin=0.002):
        return any(self.lon0 - margin <= lon <= self.lon1 + margin and self.lat0 - margin <= lat <= self.lat1 + margin for lon, lat in p)


def render(view, out, label_size, lw, place=None):
    # place : pour une carte, le nom affiché et la position (en % du tracé) de certaines rues
    place = place or {}
    W, H = view.W, view.H
    parts = []
    # la mer : le trait de côte (la terre est à gauche du sens du tracé, donc la mer à l'ouest ici), refermé par le
    # bord ouest de la carte
    coast = chain([pts(r) for r, tg in ways.values() if tg.get('natural') == 'coastline'])
    for c in coast:
        if not view.inside(c, 0.01):
            continue
        c = sorted(c, key=lambda p: -p[1]) if abs(c[0][1] - c[-1][1]) < 1e-9 else c
        # du nord au sud
        if c[0][1] < c[-1][1]:
            c = c[::-1]
        far = view.lon0 - 0.05
        poly = [(far, max(c[0][1], view.lat1 + 0.05))] + [(c[0][0], view.lat1 + 0.05)] + c + [(c[-1][0], view.lat0 - 0.05), (far, view.lat0 - 0.05)]
        parts.append(f'<path class="m-sea" d="{view.path(poly, True)}"/>')
    # plages
    for r, tg in ways.values():
        p = pts(r)
        if tg.get('natural') in ('beach', 'sand') and view.inside(p):
            parts.append(f'<path class="m-beach" d="{view.path(p, True)}"/>')
    for members, tg in rels:
        if tg.get('natural') == 'beach':
            rings = chain([pts(ways[ref][0]) for t, ref, role in members if t == 'way' and ref in ways and role != 'inner'])
            for ring in rings:
                if view.inside(ring):
                    parts.append(f'<path class="m-beach" d="{view.path(ring, True)}"/>')
    # plans d'eau et canaux
    for r, tg in ways.values():
        p = pts(r)
        if not view.inside(p):
            continue
        if tg.get('natural') == 'water' and r and r[0] == r[-1]:
            parts.append(f'<path class="m-water" d="{view.path(p, True)}"/>')
        elif tg.get('waterway') in ('canal', 'river', 'stream'):
            parts.append(f'<path class="m-canal" d="{view.path(p)}" stroke-width="{lw * 3:.1f}"/>')
    for members, tg in rels:
        if tg.get('natural') == 'water' or tg.get('water'):
            outer = chain([pts(ways[ref][0]) for t, ref, role in members if t == 'way' and ref in ways and role != 'inner'])
            inner = chain([pts(ways[ref][0]) for t, ref, role in members if t == 'way' and ref in ways and role == 'inner'])
            d = ' '.join(view.path(ring, True) for ring in outer + inner if view.inside(ring))
            if d:
                parts.append(f'<path class="m-water" fill-rule="evenodd" d="{d}"/>')
    # bâtiments (le cabinet à part, par-dessus tout)
    blds = []
    for wid, (r, tg) in ways.items():
        if 'building' in tg and wid != OFFICE:
            p = pts(r)
            if len(p) > 2 and view.inside(p, 0.0005):
                blds.append(view.path(p, True))
    parts.append(f'<path class="m-bld" d="{" ".join(blds)}"/>')
    # rues : trois rangs
    ranks = {
        'minor': ('residential', 'unclassified', 'living_street', 'tertiary_link'),
        'mid': ('tertiary', 'secondary', 'secondary_link'),
        'major': ('primary', 'primary_link', 'trunk'),
    }
    for rank, kinds in ranks.items():
        d = ' '.join(view.path(pts(r)) for r, tg in ways.values() if tg.get('highway') in kinds and view.inside(pts(r)))
        if d:
            w = {'minor': lw, 'mid': lw * 1.9, 'major': lw * 3.2}[rank]
            parts.append(f'<path class="m-road m-{rank}" d="{d}" stroke-width="{w:.2f}"/>')
    # noms de rues : les morceaux de chaque rue sont reliés bout à bout, puis le nom suit le plus long tracé visible,
    # loin des bords. Pour une route à deux chaussées, le nom va du côté extérieur (à gauche d'une route verticale,
    # au-dessus d'une route horizontale), pour ne pas chevaucher l'autre chaussée.
    defs, texts = [], []
    inset = label_size * 2.2
    for name, text in LABELS.items():
        text = place.get(name, (text, None))[0]
        segs = [r for r, tg in ways.values() if tg.get('name') == name and tg.get('highway') not in (None, 'footway', 'steps')]
        best = None
        pieces = []
        for c in chain(segs):
            q = [view.xy(a) for a in pts(c)]
            q = [a for a in q if inset <= a[0] <= W - inset and inset <= a[1] <= H - inset]
            pieces += straight(q)
        for q in pieces:
            if len(q) < 2:
                continue
            length = sum(math.dist(q[i], q[i + 1]) for i in range(len(q) - 1))
            # un nom ne suit pas une courbe : seulement les tracés presque droits (corde ≥ 92 % de la longueur)
            if math.dist(q[0], q[-1]) < 0.92 * length:
                continue
            vertical = abs(q[-1][1] - q[0][1]) > abs(q[-1][0] - q[0][0])
            side = sum(a[0] for a in q) / len(q) if vertical else sum(a[1] for a in q) / len(q)
            key = (round(length / 40), -side)
            if best is None or key > best[0]:
                best = (key, q, vertical, length)
        if not best:
            continue
        _, q, vertical, length = best
        need = len(text) * label_size * 0.56
        if length < need * 1.1:
            continue
        # sens de lecture : de gauche à droite, ou de bas en haut pour une rue verticale
        if (not vertical and q[0][0] > q[-1][0]) or (vertical and q[0][1] < q[-1][1]):
            q = q[::-1]
        pid = f'{out.stem}-st{len(defs)}'
        defs.append(f'<path id="{pid}" d="M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in q) + '"/>')
        major = name in ('Tamiami Trail North', 'Pine Ridge Road')
        # la rue du cabinet : son nom passe sous la rue, l'étiquette du cabinet est au-dessus
        dy = label_size * 1.75 if name == 'Myrtle Terrace' else -label_size * (1.05 if major else 0.5)
        # le Tamiami Trail passe juste à côté du cabinet : son nom descend plus au sud, loin de l'étiquette du cabinet
        # Seagate Drive croise une rue nord-sud en son milieu : son nom se décale vers l'ouest
        at = place.get(name, (None, None))[1] or {'Tamiami Trail North': 25, 'Seagate Drive': 40}.get(name, 50)
        texts.append(f'<text class="m-label" font-size="{label_size}" dy="{dy:.1f}"><textPath href="#{pid}" startOffset="{at}%" text-anchor="middle">{text}</textPath></text>')
    # la plage la plus visible : son nom, le long du sable (le nom vient d'OpenStreetMap)
    beaches = [(tg['name'], [pts(r)]) for r, tg in ways.values() if tg.get('natural') == 'beach' and tg.get('name')]
    beaches += [(tg['name'], [pts(ways[ref][0]) for t, ref, role in members if t == 'way' and ref in ways]) for members, tg in rels if tg.get('natural') == 'beach' and tg.get('name')]
    best = None
    for name, rings in beaches:
        q = [view.xy(a) for ring in rings for a in ring]
        q = [a for a in q if inset <= a[1] <= H - inset and inset <= a[0] <= W - inset]
        if len(q) > 3 and (best is None or len(q) > len(best[1])):
            best = (name, q)
    if best:
        name, q = best
        x = sum(a[0] for a in q) / len(q)
        y = sum(a[1] for a in q) / len(q)
        texts.append(f'<text class="m-label m-label--beach" font-size="{label_size}" transform="translate({x:.1f} {y:.1f}) rotate(-84)" text-anchor="middle" dy="{label_size * 0.35:.1f}">{name}</text>')
    # le cabinet : le bâtiment au violet, un anneau, et son nom
    office = pts(ways[OFFICE][0])
    parts.append(f'<path class="m-office" d="{view.path(office, True)}"/>')
    cx = sum(view.xy(a)[0] for a in office) / len(office)
    cy = sum(view.xy(a)[1] for a in office) / len(office)
    ring = label_size * 1.9
    parts.append(f'<circle class="m-ring" cx="{cx:.1f}" cy="{cy:.1f}" r="{ring:.1f}" stroke-width="{lw * 1.6:.2f}"/>')
    texts.append(
        f'<text class="m-office-name" font-size="{label_size * 1.15:.1f}" x="{cx - ring - label_size * 0.6:.1f}" y="{cy + label_size * 0.1:.1f}" text-anchor="end">One Place Wellness</text>'
    )
    # échelle : 250 m (et son équivalent en pieds), en bas à gauche, au millimètre près du viewBox
    sb = 250 / view.m
    x0, y0 = label_size * 1.6, H - label_size * 1.8
    scale = (
        f'<g class="m-scale"><path d="M{x0:.1f} {y0 - label_size * 0.5:.1f} V{y0:.1f} H{x0 + sb:.1f} V{y0 - label_size * 0.5:.1f}" stroke-width="{lw * 1.2:.2f}"/>'
        f'<text x="{x0 + sb + label_size * 0.6:.1f}" y="{y0:.1f}" font-size="{label_size * 0.92:.1f}">250 m, 820 ft</text></g>'
    )
    svg = (
        f'<svg class="map__svg" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="{out.stem}-t">'
        f'<title id="{out.stem}-t">Map: One Place Wellness at 827 Myrtle Terrace, Naples, just off the Tamiami Trail, south of Pine Ridge Road</title>'
        f'<defs>{"".join(defs)}</defs>'
        + ''.join(parts)
        + ''.join(texts)
        + scale
        + f'<g class="m-pin" transform="translate({cx:.1f} {cy:.1f})" data-office><circle r="{label_size * 0.42:.1f}"/></g>'
        + '</svg>'
    )
    out.write_text(svg)
    print(f'{out.name} : {W} × {H}, {len(svg) / 1024:.0f} Ko, cabinet à ({cx / W:.3f}, {cy / H:.3f}), échelle {sb:.0f} unités = 250 m')
    return cx, cy


lon_o, lat_o = (sum(c) / len(c) for c in zip(*pts(ways[OFFICE][0])))
# ordinateur : de la mer (à l'ouest) au Tamiami Trail (à l'est), à la latitude du cabinet
render(View(-81.8196, lat_o - 0.0040, -81.7962, lat_o + 0.0040, 1600), ROOT / 'src' / 'map-wide.svg', 18, 1.25)
# téléphone : le cabinet, le Tamiami Trail et Pine Ridge Road
# (le Tamiami Trail y fait un crochet au sud du cabinet : son nom, plus court, passe entre Pine Ridge Road et le crochet)
render(View(lon_o - 0.0034, lat_o - 0.0040, lon_o + 0.0030, lat_o + 0.0032, 800), ROOT / 'src' / 'map-tall.svg', 27, 2.1, {'Tamiami Trail North': ('Tamiami Trail', 56)})
