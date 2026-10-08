"""Dessins vus de dessus des modèles Barrier Reef, tirés de la fiche officielle 2025 que Gracie Pools héberge sur son site :
https://img1.wsimg.com/blobby/go/3c088145-d2f5-4a3c-b546-e6ddb4ebd919/Barrier%20Reef%20Fiberglass%20Pools%202025%20Model%20Sheet.pdf

Les dessins de la page 2 sont vectoriels. Chaque zone (margelle, paroi, marches, banquettes, fosse) est reprise telle quelle,
ramenée dans un cadre de 1000 × 1000, avec sa clarté d'origine (« tone ») : le site la rejoue par-dessus la texture d'eau du coloris.

    python3 tools/drawings.py chemin/vers/model-sheet-2025.pdf  →  src/data/drawings.json
"""
import json, math, os, re, subprocess, sys, tempfile

import cv2
import numpy as np
import xml.etree.ElementTree as ET

NS = '{http://www.w3.org/2000/svg}'
NUM = r'-?\d*\.?\d+(?:e-?\d+)?'
ID = (1, 0, 0, 1, 0, 0)

# Centre approximatif (en points de la page 2) de chaque dessin, et nom du dessin.
# Plusieurs dessins se chevauchent dans une même case : on les sépare par ordre de tracé (a, b, c).
CELLS = {
    'billabong-cove': (98, 99), 'billabong-splash': (225, 100), 'bondi': (353, 99), 'castaway': (481, 99),
    'coral-cay': (608, 99), 'coral-sea': (736, 99),
    'coral-sea-lounger': (100, 204), 'crispin': (225, 204), 'escape': (353, 204), 'grande': (480, 204),
    'laguna': (608, 204), 'milano': (735, 204),
    'opal': (96, 311), 'outback-dundee': (226, 311), 'outback-lounger': (353, 310), 'oyster': (483, 311),
    'pixie': (611, 311), 'southport': (736, 311),
    'sudbury': (99, 425), 'sydney-harbour': (226, 425), 'capri-spa': (336, 424), 'cube-spa': (417, 424),
    'cube-sundeck': (498, 424), 'horseshoe-spa': (336, 498), 'horseshoe-sundeck': (417, 498), 'oval-spa': (498, 499),
    'whitsunday': (98, 540), 'whitsunday-lounger': (226, 541), 'resort-spa': (336, 572), 'pixie-sundeck': (417, 572),
}
# cases qui contiennent plusieurs dessins, dans l'ordre de tracé
SPLIT = {
    'coral-cay': ['coral-cay-30', 'coral-cay-26'],
    'outback-dundee': ['outback-dundee', 'outback-dundee-lounger'],
    'whitsunday': ['whitsunday', 'whitsunday-slim', 'whitsunday-deep'],
}


def parse_d(d):
    toks = re.findall(r'[MLCZmlcz]|' + NUM, d)
    subs, cur, cmd, i = [], None, None, 0
    while i < len(toks):
        t = toks[i]
        if t in 'MLCZmlcz':
            cmd = t
            i += 1
            if cmd in 'Zz' and cur is not None:
                cur.append(('Z',))
            continue
        if cmd == 'M':
            cur = [('M', (float(toks[i]), float(toks[i + 1])))]
            subs.append(cur)
            i += 2
            cmd = 'L'
        elif cmd == 'L':
            cur.append(('L', (float(toks[i]), float(toks[i + 1]))))
            i += 2
        elif cmd == 'C':
            p = [float(v) for v in toks[i:i + 6]]
            cur.append(('C', (p[0], p[1]), (p[2], p[3]), (p[4], p[5])))
            i += 6
        else:
            raise ValueError('commande inattendue %r' % cmd)
    return subs


def apply(m, p):
    a, b, c, d, e, f = m
    return (a * p[0] + c * p[1] + e, b * p[0] + d * p[1] + f)


def mul(m1, m2):
    a1, b1, c1, d1, e1, f1 = m1
    a2, b2, c2, d2, e2, f2 = m2
    return (a1 * a2 + c1 * b2, b1 * a2 + d1 * b2, a1 * c2 + c1 * d2, b1 * c2 + d1 * d2, a1 * e2 + c1 * f2 + e1, b1 * e2 + d1 * f2 + f1)


def matrix(el):
    tr = el.get('transform') or el.get('gradientTransform')
    if not tr:
        return ID
    m = re.match(r'matrix\(([^)]+)\)', tr.strip())
    return tuple(float(v) for v in re.split(r'[ ,]+', m.group(1).strip()))


def tsubs(subs, m):
    return [[seg if seg[0] == 'Z' else (seg[0],) + tuple(apply(m, p) for p in seg[1:]) for seg in sp] for sp in subs]


def bez(p0, p1, p2, p3, t):
    u = 1 - t
    return tuple(u ** 3 * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t ** 3 * p3[k] for k in (0, 1))


def bbox(subs):
    xs, ys, last = [], [], None
    for sp in subs:
        for seg in sp:
            if seg[0] in 'ML':
                last = seg[1]
                xs.append(last[0]); ys.append(last[1])
            elif seg[0] == 'C':
                for k in range(1, 13):
                    p = bez(last, seg[1], seg[2], seg[3], k / 12)
                    xs.append(p[0]); ys.append(p[1])
                last = seg[3]
    return (min(xs), min(ys), max(xs), max(ys)) if xs else None


def rgb(s):
    m = re.match(r'rgb\(([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)%\)', s)
    if m:
        return tuple(float(v) / 100 for v in m.groups())
    if s.startswith('#'):
        return tuple(int(s[i:i + 2], 16) / 255 for i in (1, 3, 5))
    return (0.5, 0.5, 0.5)


def lightness(c):
    """L* (CIE) d'une couleur sRGB entre 0 et 1."""
    lin = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    y = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
    return 116 * (y ** (1 / 3) if y > 216 / 24389 else (24389 / 27 * y + 16) / 116) - 16


def tone(c):
    # 0 = le bleu moyen des dessins ; négatif = plus sombre (parois, fosse), positif = plus clair (marches, plages)
    return round(max(-1.2, min(0.6, (lightness(c) - 68) / 40)), 3)


def load(svg_path):
    root = ET.parse(svg_path).getroot()
    defs = root.find(NS + 'defs')
    clips = {}
    for cp in defs.iter(NS + 'clipPath'):
        shapes = []
        for el in cp.iter():
            if el.tag == NS + 'path':
                shapes.append((tsubs(parse_d(el.get('d')), matrix(el)), el.get('clip-rule', 'nonzero')))
        clips[cp.get('id')] = shapes
    grads = {}
    for lg in defs.iter(NS + 'linearGradient'):
        stops = [(float(st.get('offset', 0)), rgb(st.get('stop-color'))) for st in lg.iter(NS + 'stop')]
        grads[lg.get('id')] = {
            'p1': (float(lg.get('x1', 0)), float(lg.get('y1', 0))),
            'p2': (float(lg.get('x2', 1)), float(lg.get('y2', 0))),
            'm': matrix(lg),
            'stops': stops,
        }
    regions = []

    def walk(el, m, chain, fill, rule):
        for ch in el:
            tag = ch.tag.replace(NS, '')
            mm = mul(m, matrix(ch)) if tag != 'g' or ch.get('transform') else m
            f = ch.get('fill', fill)
            r = ch.get('fill-rule', rule)
            cc = chain
            if ch.get('clip-path'):
                cc = chain + [re.search(r'#([^)]+)', ch.get('clip-path')).group(1)]
            if tag == 'g':
                walk(ch, mm, cc, f, r)
            elif tag == 'path' and f not in (None, 'none'):
                regions.append({'fill': f, 'rule': r or 'nonzero', 'subs': tsubs(parse_d(ch.get('d')), mm), 'm': mm, 'clips': cc})

    walk(root, ID, [], None, None)
    out = []
    for idx, r in enumerate(regions):
        shape, rule = r['subs'], r['rule']
        if r['clips'] and r['fill'].startswith('url('):
            # le dégradé remplit un rectangle découpé par la forme : la forme est le plus petit des masques
            best = None
            for cid in r['clips']:
                for s, cr in clips.get(cid, []):
                    b = bbox(s)
                    if b and (best is None or (b[2] - b[0]) * (b[3] - b[1]) < best[0]):
                        best = ((b[2] - b[0]) * (b[3] - b[1]), s, cr)
            if best:
                shape, rule = best[1], best[2]
        b = bbox(shape)
        if not b:
            continue
        reg = {'i': idx, 'subs': shape, 'rule': rule, 'bb': b}
        if r['fill'].startswith('url('):
            g = grads[re.search(r'#([^)]+)', r['fill']).group(1)]
            gm = mul(r['m'], g['m'])
            reg['grad'] = {'p1': apply(gm, g['p1']), 'p2': apply(gm, g['p2']), 'stops': g['stops']}
        else:
            reg['color'] = rgb(r['fill'])
        out.append(reg)
    return out


def cluster(items, pad=1.5):
    parent = list(range(len(items)))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    for i, a in enumerate(items):
        for j in range(i + 1, len(items)):
            b = items[j]['bb']
            if a['bb'][0] - pad <= b[2] and b[0] - pad <= a['bb'][2] and a['bb'][1] - pad <= b[3] and b[1] - pad <= a['bb'][3]:
                parent[find(i)] = find(j)
    groups = {}
    for i in range(len(items)):
        groups.setdefault(find(i), []).append(items[i])
    return [sorted(g, key=lambda r: r['i']) for g in groups.values()]


def fmt(v):
    s = '%.1f' % v
    return s[:-2] if s.endswith('.0') else s


def area_of(polys_by_region):
    """surface couverte (en unités du cadre 1000 × 1000), par remplissage sur une grille"""
    img = np.zeros((1100, 1100), np.uint8)
    for polys in polys_by_region:
        pts = [np.array([[round(x + 50), round(y + 50)] for x, y in pl], np.int32) for pl in polys if len(pl) > 2]
        if pts:
            cv2.fillPoly(img, pts, 255)
    return int((img > 0).sum())


def water_outline(polys_by_region):
    """Contour extérieur de tout ce qui est dessiné dans la margelle (trous compris), en polygone simplifié.
    Certains dessins tracent la paroi en anneau d'un seul trait : l'eau, de la couleur de la margelle, se voit à travers.
    On remplit chaque zone sur une grille fine, puis on garde les contours extérieurs de l'ensemble."""
    k = 4
    img = np.zeros((1000 * k + 400, 1000 * k + 400), np.uint8)
    off = 200
    for polys in polys_by_region:
        pts = [np.array([[round(x * k + off), round(y * k + off)] for x, y in pl], np.int32) for pl in polys if len(pl) > 2]
        if pts:
            cv2.fillPoly(img, pts, 255)
    contours, _ = cv2.findContours(img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    parts = []
    for c in contours:
        if cv2.contourArea(c) < 40 * k * k:
            continue
        c = cv2.approxPolyDP(c, 1.6, True)
        pts = [((p[0][0] - off) / k, (p[0][1] - off) / k) for p in c]
        parts.append('M' + 'L'.join('%s %s' % (fmt(x), fmt(y)) for x, y in pts) + 'Z')
    return ''.join(parts)


def water_polys(d):
    """chemin « M x yL x y…Z » du contour de l'eau → polygones"""
    out = []
    for part in d.split('M')[1:]:
        pts = [tuple(float(v) for v in xy.strip().split()) for xy in part.rstrip('Z').split('L') if xy.strip()]
        out.append(pts)
    return out


def flat(subs, n):
    """sous-chemins → polylignes (courbes découpées en petits segments), coordonnées normalisées"""
    out = []
    for sp in subs:
        pts, last = [], None
        for seg in sp:
            if seg[0] in 'ML':
                last = seg[1]
                pts.append(n(last))
            elif seg[0] == 'C':
                for t in range(1, 17):
                    pts.append(n(bez(last, seg[1], seg[2], seg[3], t / 16)))
                last = seg[3]
        out.append(pts)
    return out


def normalize(regs):
    rim = max(regs, key=lambda r: (r['bb'][2] - r['bb'][0]) * (r['bb'][3] - r['bb'][1]))
    x0, y0, x1, y1 = rim['bb']
    sx, sy = 1000 / (x1 - x0), 1000 / (y1 - y0)
    n = lambda p: (fmt((p[0] - x0) * sx), fmt((p[1] - y0) * sy))
    out = []
    # la margelle d'abord, puis le reste dans l'ordre du tracé
    for r in [rim] + [r for r in regs if r is not rim]:
        parts = []
        for sp in r['subs']:
            for seg in sp:
                if seg[0] == 'Z':
                    parts.append('Z')
                else:
                    parts.append(seg[0] + ' '.join('%s %s' % n(p) for p in seg[1:]))
        reg = {'d': ''.join(parts)}
        if r['rule'] == 'evenodd':
            reg['rule'] = 'evenodd'
        if 'grad' in r:
            g = r['grad']
            st = g['stops']

            def at(o):
                for k in range(len(st) - 1):
                    if st[k][0] <= o <= st[k + 1][0]:
                        t = 0 if st[k + 1][0] == st[k][0] else (o - st[k][0]) / (st[k + 1][0] - st[k][0])
                        return tuple(st[k][1][c] + (st[k + 1][1][c] - st[k][1][c]) * t for c in range(3))
                return st[0][1] if o < st[0][0] else st[-1][1]

            p1, p2 = n(g['p1']), n(g['p2'])
            reg['grad'] = {'x1': float(p1[0]), 'y1': float(p1[1]), 'x2': float(p2[0]), 'y2': float(p2[1]),
                           'stops': [[o, tone(at(o))] for o in (0, 0.25, 0.5, 0.75, 1)]}
        else:
            reg['tone'] = tone(r['color'])
        out.append(reg)
    nf = lambda p: ((p[0] - x0) * sx, (p[1] - y0) * sy)
    inner = [flat(r['subs'], nf) for r in regs if r is not rim]
    water = water_outline(inner)
    # une plage immergée n'est qu'une margelle claire cerclée d'un trait : tout l'intérieur est de l'eau
    whole = area_of([flat(rim['subs'], nf)])
    covered = area_of([[pl for pl in [p for p in water_polys(water)]]])
    if covered < 0.5 * whole:
        water = water_outline([flat(rim['subs'], nf)])
        extra = {'nocoping': True}
    else:
        extra = {}
    # proportions du dessin (largeur / hauteur), pour information : les dessins ne sont pas à l'échelle
    return {'ratio': round((x1 - x0) / (y1 - y0), 4), 'water': water, **extra, 'regions': out}


def main(pdf):
    with tempfile.TemporaryDirectory() as tmp:
        svg = os.path.join(tmp, 'p2.svg')
        subprocess.run(['pdftocairo', '-svg', '-f', '2', '-l', '2', pdf, svg], check=True)
        regs = load(svg)
    regs = [r for r in regs if (r['bb'][2] - r['bb'][0]) < 300 and (r['bb'][3] - r['bb'][1]) < 200]
    groups = cluster(regs)
    drawings = {}
    for key, (cx, cy) in CELLS.items():
        g = [g for g in groups if min(r['bb'][0] for r in g) <= cx <= max(r['bb'][2] for r in g) and min(r['bb'][1] for r in g) <= cy <= max(r['bb'][3] for r in g)]
        if len(g) != 1:
            raise SystemExit('case introuvable ou ambiguë : %s (%d)' % (key, len(g)))
        g = g[0]
        if key in SPLIT:
            # dessins tracés l'un après l'autre : une zone qui déborde du cadre du dessin en cours commence le suivant
            parts, cur = [], [g[0]]
            for r in g[1:]:
                if not inside(r['bb'], cur[0]['bb']):
                    parts.append(cur)
                    cur = []
                cur.append(r)
            parts.append(cur)
            if len(parts) != len(SPLIT[key]):
                raise SystemExit('découpage inattendu pour %s : %d parties' % (key, len(parts)))
            for name, part in zip(SPLIT[key], parts):
                drawings[name] = normalize(part)
        else:
            drawings[key] = normalize(g)
    return drawings


def inside(b, frame, tol=0.6):
    return b[0] >= frame[0] - tol and b[1] >= frame[1] - tol and b[2] <= frame[2] + tol and b[3] <= frame[3] + tol


if __name__ == '__main__':
    out = main(sys.argv[1])
    dest = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'drawings.json')
    with open(dest, 'w') as f:
        json.dump(out, f, separators=(',', ':'))
    print('%d dessins, %d zones, %.0f Ko → %s' % (len(out), sum(len(d['regions']) for d in out.values()), os.path.getsize(dest) / 1024, os.path.normpath(dest)))
