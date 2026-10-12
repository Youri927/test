# Repère le logo incrusté (« Prestige Pools / Monkey Junction ») dans chaque photo : correspondance de gabarit multi-échelle.
# Sortie JSON : {fichier: [x0, y0, x1, y1, score]} en pixels.
#   python3 -I tools/findlogo.py <photo qui sert de gabarit> <sortie.json> <photos…>
import sys, json, cv2, numpy as np
from pathlib import Path
tpl_src, out, files = sys.argv[1], sys.argv[2], sys.argv[3:]
src = cv2.imread(tpl_src)
tpl = src[685:845, 555:1255]
hsv = cv2.cvtColor(tpl, cv2.COLOR_BGR2HSV)
b, g, r = [tpl[..., i].astype(int) for i in range(3)]
blue = (b > 140) & (r < 110) & (b - r > 70)
white = (hsv[..., 2] > 215) & (hsv[..., 1] < 40)
brown = (r > 100) & (r - b > 35) & (g < r)
mask = (blue | white | brown).astype(np.uint8) * 255
mask = cv2.dilate(mask, np.ones((3, 3), np.uint8))
tg = cv2.cvtColor(tpl, cv2.COLOR_BGR2GRAY)
res = {}
for f in files:
    im = cv2.imread(f)
    if im is None:
        continue
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    H, W = g.shape
    best = (-1, None)
    for s in sorted(set(np.round(np.linspace(0.40, 1.30, 46), 4)) | {1.0, 0.8125, 0.75, 0.625, 1.25, 0.9375}):
        tw, th = int(tg.shape[1] * s), int(tg.shape[0] * s)
        if tw >= W or th >= H or tw < 260:
            continue
        t = cv2.resize(tg, (tw, th), interpolation=cv2.INTER_AREA)
        m = cv2.resize(mask, (tw, th), interpolation=cv2.INTER_NEAREST)
        r_ = cv2.matchTemplate(g, t, cv2.TM_CCORR_NORMED, mask=m)
        r_ = np.nan_to_num(r_, nan=0, posinf=0, neginf=0)
        _, mx, _, loc = cv2.minMaxLoc(r_)
        if mx > best[0]:
            best = (mx, (loc[0], loc[1], loc[0] + tw, loc[1] + th))
    sc, box = best
    res[Path(f).name] = [*map(int, box), round(float(sc), 4)] if box else None
    print(f'{Path(f).name:60s} {W}x{H} {res[Path(f).name]}', flush=True)
json.dump(res, open(out, 'w'), indent=1)
