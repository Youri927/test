"""Compare les deux mouvements du montage à leur courbe prévue, sur des images du rendu (dossier de .jpg nommés par
leur numéro d'image dans le montage, par exemple 00280.jpg) :

    python3 -I tools/curves.py <dossier> aside            mise de côté du navigateur (ouverture, OPEN.aside à OPEN.aside + 54)
    python3 -I tools/curves.py <dossier> phones <début>   montée des trois téléphones (<début> : 1re image de la scène)

Les bords sont mesurés au sous-pixel (barycentre du gradient), cherchés près de la position prévue. Un décalage
constant (le bord visible n'est pas exactement le bord de la boîte) est retiré ; reste l'écart à la courbe.
Les valeurs viennent du montage : src/scenes/Open.tsx (B, WIDE, SIDE), src/Stage.tsx (ASIDE), src/Screen.tsx (barre),
src/beats.ts (OPEN.aside), src/scenes/After.tsx (téléphones) et src/util.ts (courbes E.soft et E.out).
"""
import math
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image


def bezier(x1, y1, x2, y2):
    """Courbe cubic-bezier CSS : t (temps) → progression"""
    cx, cy = 3 * x1, 3 * y1
    bx, by = 3 * (x2 - x1) - cx, 3 * (y2 - y1) - cy
    ax, ay = 1 - cx - bx, 1 - cy - by

    def f(t):
        lo, hi, u = 0.0, 1.0, t
        for _ in range(60):
            x = ((ax * u + bx) * u + cx) * u
            if abs(x - t) < 1e-12:
                break
            lo, hi = (u, hi) if x < t else (lo, u)
            u = (lo + hi) / 2
        return ((ay * u + by) * u + cy) * u
    return f


SOFT, OUT = bezier(0.45, 0, 0.25, 1), bezier(0.2, 0.7, 0.1, 1)
# l'image où le navigateur commence à se ranger de côté : OPEN.aside dans src/beats.ts
ASIDE = int(re.search(r'OPEN = \{hold: \d+, aside: (\d+)', (Path(__file__).resolve().parent.parent / 'src/beats.ts').read_text()).group(1))
clamp = lambda v: max(0.0, min(1.0, v))
W, H = 1920, 1080
BX, BY, BW = 960, 540, 1850
BAR = round(BW * 0.036)
BH = BAR + BW * 900 / 1440


def aside_cam(f, start=ASIDE, length=54, s0=0.8, s1=0.64, margin=56):
    """Caméra de l'ouverture (CameraRig) : centre x et échelle à l'image f"""
    cx1 = BX - ((margin + BW / 2 * s1) - W / 2) / s1
    t = SOFT(clamp((f - start) / length))
    return BX + (cx1 - BX) * t, math.exp(math.log(s0) + (math.log(s1) - math.log(s0)) * t)


def edge(line, near, darker=False, span=30):
    """Position au sous-pixel du bord le plus net à ±span px de near (None s'il n'y en a pas)"""
    a = max(0, int(near) - span)
    d = np.diff(line[a:a + 2 * span])
    if darker:
        d = -d
    i = int(np.argmax(d))
    if d[i] < 8:
        return None
    lo, hi = max(0, i - 3), min(len(d), i + 4)
    w = np.clip(d[lo:hi], 0, None)
    return a + (np.arange(lo, hi) * w).sum() / w.sum() + 0.5


def report(label, rows):
    rows = [r for r in rows if r[1] is not None]
    off = float(np.median([p - e for _, p, e in rows]))
    dev = np.array([abs(p - e - off) for _, p, e in rows])
    print(f'{label} : {len(rows)} images ; décalage constant {off:.2f} px ; écart à la courbe : max {dev.max():.2f} px, moyenne {dev.mean():.2f} px')
    return rows


if len(sys.argv) < 3:
    sys.exit(__doc__)
files = sorted(Path(sys.argv[1]).glob('*.jpg'))
gray = lambda f: np.asarray(Image.open(f).convert('L'), dtype=float)

if sys.argv[2] == 'aside':
    left, top = [], []
    for f in files:
        n = int(f.stem)
        cx, s = aside_cam(n)
        g = gray(f)
        # bord gauche, sur la ligne du milieu de la barre du navigateur (elle descend avec le zoom)
        x = 960 + (BX - BW / 2 - cx) * s
        y = int(round(540 + (BY - BH / 2 + BAR / 2 - 540) * s))
        left.append((n, edge(g[y - 1:y + 2].mean(axis=0), x), x))
        # bord haut, sur une colonne qui suit le navigateur : 18 px après son bord gauche, entre l'arrondi du coin et
        # le premier bouton de la barre (une colonne fixe finit sur l'adresse, qui glisse dessous pendant le mouvement)
        c = int(round(x + 18))
        y = 540 + (BY - BH / 2 - 540) * s
        top.append((n, edge(g[:, c - 1:c + 2].mean(axis=1), y), y))
    report('bord gauche', left)
    report('bord haut', top)
elif sys.argv[2] == 'phones':
    start = int(sys.argv[3])
    for k, (x, at) in enumerate([(560, 0), (960, 8), (1360, 16)]):
        rows = []
        for f in files:
            n = int(f.stem)
            y = 240 + 760 * (1 - OUT(clamp((n - start - at) / 50)))
            if y < 1040:
                rows.append((n, edge(gray(f)[:, x - 1:x + 2].mean(axis=1), y, darker=True, span=40), y))
        rows = report(f'téléphone {k + 1}', rows)
        still = [p for n, p, _ in rows if n - start >= at + 50]
        print(f'  à l’arrêt : de {min(still):.2f} à {max(still):.2f} px')
else:
    sys.exit(__doc__)
