"""La fiche Barrier Reef 2025 (page 2) pour la scène « The sheet » : l'image de la page, et la place de chaque dessin.

Reprend l'extraction du site (../graciepools-site/tools/drawings.py) : mêmes zones, mêmes regroupements.
Pour chaque dessin, on garde le cadre de sa margelle (la plus grande zone), en points de la page (834 × 654 pt).

    python3 -I tools/sheet.py chemin/vers/model-sheet-2025.pdf  →  public/img/sheet.png, src/sheet.json
"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'graciepools-site', 'tools'))
import drawings as D  # noqa: E402

pdf = sys.argv[1]
root = os.path.join(HERE, '..')
with tempfile.TemporaryDirectory() as tmp:
    svg = os.path.join(tmp, 'p2.svg')
    subprocess.run(['pdftocairo', '-svg', '-f', '2', '-l', '2', pdf, svg], check=True)
    regs = D.load(svg)
    # l'image de la page, à 288 points par pouce (4 px par point) : nette même en gros plan dans la vidéo
    subprocess.run(['pdftocairo', '-png', '-singlefile', '-r', '288', '-f', '2', '-l', '2', pdf, os.path.join(tmp, 'p2')], check=True)
    os.makedirs(os.path.join(root, 'public', 'img'), exist_ok=True)
    os.replace(os.path.join(tmp, 'p2.png'), os.path.join(root, 'public', 'img', 'sheet.png'))

regs = [r for r in regs if (r['bb'][2] - r['bb'][0]) < 300 and (r['bb'][3] - r['bb'][1]) < 200]
groups = D.cluster(regs)
boxes = {}
for key, (cx, cy) in D.CELLS.items():
    g = [g for g in groups if min(r['bb'][0] for r in g) <= cx <= max(r['bb'][2] for r in g) and min(r['bb'][1] for r in g) <= cy <= max(r['bb'][3] for r in g)][0]
    parts = [g]
    if key in D.SPLIT:
        parts, cur = [], [g[0]]
        for r in g[1:]:
            if not D.inside(r['bb'], cur[0]['bb']):
                parts.append(cur)
                cur = []
            cur.append(r)
        parts.append(cur)
    for name, part in zip(D.SPLIT.get(key, [key]), parts):
        rim = max(part, key=lambda r: (r['bb'][2] - r['bb'][0]) * (r['bb'][3] - r['bb'][1]))
        x0, y0, x1, y1 = rim['bb']
        boxes[name] = [round(x0, 2), round(y0, 2), round(x1 - x0, 2), round(y1 - y0, 2)]

with open(os.path.join(root, 'src', 'sheet.json'), 'w') as f:
    json.dump({'page': [834, 654], 'scale': 4, 'boxes': boxes}, f, indent=1)
print('%d dessins placés sur la page' % len(boxes))
