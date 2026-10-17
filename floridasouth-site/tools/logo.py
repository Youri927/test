"""L'emblème de Florida South, redessiné : la Floride, le lac Okeechobee en réserve, et l'anneau de rose des vents qui
passe derrière la côte (comme sur leur logo de 2015, sur leurs polos et leur panneau de chantier).

Sources, toutes du domaine public :
- la Floride : les limites cartographiques du Recensement américain au 1:10 000 000, telles que les publie us-atlas
  (states-10m.json, TopoJSON quantifié) ;
- le lac Okeechobee : Natural Earth, lacs au 1:10 000 000 (ne_10m_lakes.geojson).
Projection équirectangulaire corrigée de la latitude (la Floride n'est pas étirée comme sur l'ancien logo).
L'anneau et ses quatre pointes sont tracés ici, en courbes ; l'anneau est coupé à 1,6 % de la largeur autour de la côte,
pour qu'on le voie passer derrière. Calculs de géométrie avec shapely.

Écrit data/logo.json : le cadre (viewBox) et deux tracés, `land` (la Floride, le lac en réserve) et `ring` (l'anneau
et ses pointes, déjà coupés), chacun en deux versions : fine pour les grandes tailles, forte (`landBold`, `ringBold`)
pour l'en-tête et l'onglet.

    python3 -I tools/logo.py <dossier où est installé shapely> <states-10m.json> <ne_10m_lakes.geojson> [aperçu.svg]
"""
import json
import math
import sys
from pathlib import Path

sys.path.insert(0, sys.argv[1])
from shapely import affinity  # noqa: E402
from shapely.geometry import MultiPolygon, Polygon  # noqa: E402
from shapely.ops import unary_union  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
topo = json.load(open(sys.argv[2]))
lakes = json.load(open(sys.argv[3]))

# ——— la Floride : décodage du TopoJSON (arcs quantifiés, codés en différences) ———
(sx, sy), (tx, ty) = topo['transform']['scale'], topo['transform']['translate']
arcs = []
for arc in topo['arcs']:
    x = y = 0
    pts = []
    for dx, dy in arc:
        x += dx
        y += dy
        pts.append((x * sx + tx, y * sy + ty))
    arcs.append(pts)


def ring_of(indices):
    pts = []
    for i in indices:
        a = arcs[i] if i >= 0 else arcs[~i][::-1]
        pts.extend(a if not pts else a[1:])
    return pts


florida = next(g for g in topo['objects']['states']['geometries'] if g['properties']['name'] == 'Florida')
LAT0 = 27.6
CX = math.cos(math.radians(LAT0))


def proj(lon, lat):
    return ((lon + 87.7) * CX * 100, (31.1 - lat) * 100)


polys = [Polygon([proj(*p) for p in ring_of(poly[0])]) for poly in florida['arcs']]
mainland = max(polys, key=lambda p: p.area)
lake = next(f for f in lakes['features'] if f['properties'].get('name') == 'Lake Okeechobee')
lake = Polygon([proj(*p) for p in lake['geometry']['coordinates'][0]])

# mise à l'échelle : la Floride fait 1000 unités de large
x0, y0, x1, y1 = mainland.bounds
k = 1000 / (x1 - x0)
norm = lambda g: affinity.scale(affinity.translate(g, -x0, -y0), k, k, origin=(0, 0))  # noqa: E731
mainland, lake = norm(mainland), norm(lake)
W, H = 1000, (y1 - y0) * k
# simplification : à 120 px de large, un détail de moins de 2 unités est invisible
land = mainland.simplify(1.6, preserve_topology=True).difference(lake.simplify(1.2))

# ——— l'anneau : une ellipse inclinée, centrée sur le centre de la péninsule ———
C = (0.52 * W, 0.405 * H)      # centre
RX, RY = 0.385 * W, 0.185 * W  # demi-axes
ROT = -8                       # degrés : la droite plus haute, comme sur l'original
T = 0.03 * W                   # épaisseur de l'anneau


def ellipse(rx, ry, n=360):
    return Polygon([(C[0] + rx * math.cos(2 * math.pi * i / n), C[1] + ry * math.sin(2 * math.pi * i / n)) for i in range(n)])


def bez(p0, p1, p2, p3, n=40):
    out = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        out.append((u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
                    u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1]))
    return out


def spike(theta, length, w):
    """Une pointe de rose des vents, sur l'axe normal à l'ellipse en theta (angle paramétrique) : sa base, large de 2 w,
    part de l'anneau ; ses flancs quittent l'anneau tangents à lui puis serrent l'axe : une aiguille de `length`."""
    rx, ry = RX + T / 2, RY + T / 2
    pt = lambda a: (C[0] + rx * math.cos(a), C[1] + ry * math.sin(a))  # noqa: E731
    tg = lambda a: (-rx * math.sin(a), ry * math.cos(a))  # noqa: E731 (dérivée)
    nx, ny = ry * math.cos(theta), rx * math.sin(theta)
    nl = math.hypot(nx, ny)
    nx, ny = nx / nl, ny / nl
    base = pt(theta)
    tip = (base[0] + nx * length, base[1] + ny * length)
    half = w / math.hypot(*tg(theta))  # l'écart angulaire qui donne la demi-largeur w le long de l'anneau
    b1, b2 = pt(theta - half), pt(theta + half)
    t1, t2 = tg(theta - half), tg(theta + half)
    u1 = (t1[0] / math.hypot(*t1), t1[1] / math.hypot(*t1))
    u2 = (t2[0] / math.hypot(*t2), t2[1] / math.hypot(*t2))
    c1 = (b1[0] + u1[0] * w * 0.9, b1[1] + u1[1] * w * 0.9)
    c2 = (b2[0] - u2[0] * w * 0.9, b2[1] - u2[1] * w * 0.9)
    d = (tip[0] - nx * length * 0.62, tip[1] - ny * length * 0.62)
    inner = (C[0] + (RX - T / 2) * math.cos(theta), C[1] + (RY - T / 2) * math.sin(theta))
    pts = bez(b1, c1, d, tip) + bez(tip, d, c2, b2)[1:] + [inner]
    return Polygon(pts).buffer(0)


def compass(t, k, gap):
    """L'anneau d'épaisseur t et ses pointes (largeurs multipliées par k), incliné, coupé autour de la côte."""
    global T
    T = t
    band = ellipse(RX + T / 2, RY + T / 2).difference(ellipse(RX - T / 2, RY - T / 2))
    spikes = [
        spike(math.pi, 0.22 * W, 0.034 * W * k),          # ouest
        spike(0, 0.20 * W, 0.034 * W * k),                # est
        spike(-math.pi / 2, 0.37 * W, 0.052 * W * k),     # nord : ressort au-dessus de l’enclave
        spike(math.pi / 2, 0.13 * W, 0.030 * W * k),      # sud, courte
    ]
    ring = affinity.rotate(unary_union([band, *spikes]), ROT, origin=C)
    # l'anneau passe derrière la Floride : on le coupe autour de la côte
    return ring.difference(mainland.buffer(gap * W, join_style='round'))


ring = compass(0.03 * W, 1, 0.016)          # pour les grandes tailles (pied de page, licence)
bold = compass(0.052 * W, 1.45, 0.024)      # pour les petites (en-tête, onglet) : lisible à 40 px
land_bold = mainland.simplify(3.2, preserve_topology=True).difference(lake.simplify(2.4))

# ——— le cadre : tout ce qui est dessiné, plus une petite marge ———
allb = unary_union([land, ring, bold]).bounds
pad = 6
vb = [allb[0] - pad, allb[1] - pad, allb[2] - allb[0] + 2 * pad, allb[3] - allb[1] + 2 * pad]


def path(g):
    polys = list(g.geoms) if isinstance(g, MultiPolygon) else [g]
    out = []
    for p in polys:
        for r in [p.exterior, *p.interiors]:
            c = list(r.coords)[:-1]
            out.append('M' + ' '.join(f'{x - vb[0]:.1f} {y - vb[1]:.1f}' for x, y in c) + 'Z')
    return ''.join(out)


data = {'w': round(vb[2], 1), 'h': round(vb[3], 1), 'land': path(land), 'ring': path(ring), 'landBold': path(land_bold), 'ringBold': path(bold)}
(ROOT / 'data').mkdir(exist_ok=True)
(ROOT / 'data/logo.json').write_text(json.dumps(data))
print('cadre', data['w'], 'x', data['h'], '; Floride', len(data['land']), 'car. ; anneau', len(data['ring']), 'car.')
if len(sys.argv) > 4:
    for key, suffix in (('', ''), ('Bold', '-bold')):
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {data["w"]} {data["h"]}" width="{data["w"]}" height="{data["h"]}">'
               f'<rect width="100%" height="100%" fill="#2E5AB2"/><path d="{data["ring" + key]}" fill="#fff" fill-rule="evenodd"/>'
               f'<path d="{data["land" + key]}" fill="#fff" fill-rule="evenodd"/></svg>')
        Path(sys.argv[4].replace('.svg', f'{suffix}.svg')).write_text(svg)
