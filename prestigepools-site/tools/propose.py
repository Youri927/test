# Propose pour chaque photo le plus grand cadre au rapport voulu qui évite le logo incrusté (marge de 14 px).
# Sortie : crops.json {fichier: {"box": [x0,y0,x1,y1], "side": ...}} + planches de contrôle (cadre sur la photo).
#   python3 -I tools/propose.py <logos.json> <dossier de sortie> <rapport, 2 pour 2:1> <photos…>
import sys, json, os
from PIL import Image, ImageDraw, ImageFont
logos = json.load(open(sys.argv[1])); out = sys.argv[2]; ratio = float(sys.argv[3]); files = sys.argv[4:]
M = 14
res = {}
for f in files:
    n = os.path.basename(f)
    im = Image.open(f); W, H = im.size
    L = logos.get(n)
    if not L or L[4] < 0.90:
        lx0 = ly0 = lx1 = ly1 = -1  # pas de logo sûr : toute l'image
    else:
        lx0, ly0, lx1, ly1 = L[0] - M, L[1] - M, L[2] + M, L[3] + M
    cands = []
    def fit(x0, y0, x1, y1, side):
        w, h = x1 - x0, y1 - y0
        if w <= 0 or h <= 0:
            return
        if w / h > ratio:
            nw = int(h * ratio); cx = (x0 + x1) / 2
            x0 = int(max(x0, min(cx - nw / 2, x1 - nw))); x1 = x0 + nw
        else:
            nh = int(w / ratio)
            # bande du haut : on descend le cadre au plus près du logo (le bassin est souvent en bas)
            if side == 'top':
                y0 = y1 - nh
            elif side == 'bottom':
                y1 = y0 + nh
            else:
                cy = (y0 + y1) / 2; y0 = int(cy - nh / 2); y1 = y0 + nh
        cands.append(((x1 - x0) * (y1 - y0), [int(x0), int(y0), int(x1), int(y1)], side))
    if lx0 < 0:
        fit(0, 0, W, H, 'all')
    else:
        fit(0, 0, W, max(0, ly0), 'top')
        fit(0, min(H, ly1), W, H, 'bottom')
        fit(0, 0, max(0, lx0), H, 'left')
        fit(min(W, lx1), 0, W, H, 'right')
    if not cands:
        continue
    a, box, side = max(cands)
    res[n] = {'box': box, 'side': side, 'size': [W, H], 'logo': L}
json.dump(res, open(out, 'w'), indent=1)
print(len(res), 'cadres')
