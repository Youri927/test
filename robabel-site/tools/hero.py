# Calques de la photo d'accueil : version lumières éteintes, et chaque lumière en calque (palmiers, maison, piscine, couleurs).
# Usage : python3 -I tools/hero.py <photo d'accueil> src/assets/hero   (la photo : 0001D15E-58BF-426A-AFB7-1BD83CB343F3.jpg, leur médiathèque)
import json, sys
import numpy as np, cv2

src, out = sys.argv[1], sys.argv[2]
im = cv2.imread(src)
H, W = im.shape[:2]
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV_FULL).astype(np.float32)
h = hsv[..., 0] * 360 / 256; s = hsv[..., 1] / 255; v = hsv[..., 2] / 255
yy, xx = np.mgrid[0:H, 0:W]
K = lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (r, r))

def soft(m, grow, blur):
    m = m.astype(np.uint8)
    if grow: m = cv2.dilate(m, K(grow))
    f = cv2.GaussianBlur(m.astype(np.float32), (0, 0), blur) if blur else m.astype(np.float32)
    return np.clip(f, 0, 1)

# — l'eau : bleu-violet très saturé et lumineux, puis les trous (reflets des palmiers) bouchés
water = ((h > 200) & (h < 340) & (s > 0.45) & (v > 0.28) & (yy > H * 0.5) & (yy < H * 0.8) & (xx > W * 0.18) & (xx < W * 0.72)).astype(np.uint8)
water = cv2.morphologyEx(water, cv2.MORPH_CLOSE, K(25))
n, lab, stats, _ = cv2.connectedComponentsWithStats(water)
keep = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] > 4000]
pool = np.isin(lab, keep).astype(np.uint8)
cnts, _ = cv2.findContours(pool, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
pool = np.zeros_like(pool); cv2.drawContours(pool, cnts, -1, 1, -1)
pool_a = soft(pool, 3, 2.0)
# halo de la lumière sur la margelle et le dallage autour du bassin
ring_a = np.clip(soft(pool, 151, 45) - pool_a, 0, 1)

# — les palmiers éclairés (et les spots à leur pied) : orange très saturé, loin de la bande orangée du ciel
warm = ((h > 23) & (h < 55) & (s > 0.5) & (v > 0.2)).astype(np.uint8)
n, lab, stats, cen = cv2.connectedComponentsWithStats(warm)
palms = []
for i in range(1, n):
    x, y, w, hh, area = stats[i]
    if area < 250: continue
    # les lumières de la ville en face : petits points au ras de l'eau, à droite
    if hh < 60 and 0.62 * W < cen[i][0] < 0.97 * W and y > 0.38 * H and y + hh < 0.47 * H: continue
    palms.append(i)
groups = {}
for i in palms:
    cx = cen[i][0]
    key = next((k for k in groups if abs(k - cx) < W * 0.035), cx)
    groups.setdefault(key, []).append(i)
palm_layers = []
for k in sorted(groups):
    m = np.isin(lab, groups[k]).astype(np.uint8)
    if m.sum() < 600: continue
    # autour des points orange : tout ce qui est lumineux et chaud ou neutre (reflets blancs du tronc), pas le ciel ni l'eau
    # (la bande orangée du ciel est plus rose, h < 26 : on ne la touche pas)
    near = cv2.dilate(m, K(41)) > 0
    # le tronc éclairé : orange franc ; puis ses reflets pâles, seulement collés à lui
    # (l'eau juste derrière reflète le couchant, elle ne doit pas s'assombrir)
    strong = near & (h >= 26) & (h < 62) & (s > 0.45) & (v > 0.22)
    core = cv2.dilate(strong.astype(np.uint8), K(11)) > 0
    lit = strong | (core & (v > 0.45) & ((((h >= 26) & (h < 62)) & (s >= 0.1)) | (s < 0.16)))
    m = cv2.morphologyEx((lit | (m > 0)).astype(np.uint8), cv2.MORPH_CLOSE, K(9))
    palm_layers.append(soft(m, 7, 6))

# — la maison : le dessous de toit éclairé en violet, en haut à gauche
soffit = ((h > 235) & (h < 335) & (s > 0.22) & (v > 0.12) & (((yy < H * 0.42) & (xx < W * 0.21)) | ((xx < W * 0.06) & (yy < H * 0.72)))).astype(np.uint8)
soffit_a = soft(cv2.morphologyEx(soffit, cv2.MORPH_CLOSE, K(15)), 5, 6)

# — la photo lumières éteintes (mélanges faits en RGB : interpoler la teinte ferait des liserés verts)
def hsv2rgb(hh, ss, vv):
    x = np.stack([hh * 256 / 360, np.clip(ss, 0, 1) * 255, np.clip(vv, 0, 1) * 255], -1)
    return cv2.cvtColor(np.clip(x, 0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR_FULL).astype(np.float32)
f = lambda a: a[..., None]
off = im.astype(np.float32)
# l'eau reflète le ciel du crépuscule : sombre, bleu-gris, mais garde sa structure
off = off * (1 - f(pool_a)) + hsv2rgb(np.full_like(h, 218), np.full_like(s, 0.4), 0.055 + 0.15 * v) * f(pool_a)
# le halo violet disparaît du dallage
off = off * (1 - f(ring_a)) + hsv2rgb(h, s * 0.3, v * 0.72) * f(ring_a)
# les troncs redeviennent des silhouettes
trunk_off = hsv2rgb(np.full_like(h, 215), s * 0.2, v * 0.1)
for a in palm_layers:
    off = off * (1 - f(a)) + trunk_off * f(a)
off = off * (1 - f(soffit_a)) + hsv2rgb(np.full_like(h, 225), s * 0.25, v * 0.3) * f(soffit_a)
off_bgr = np.clip(off, 0, 255).astype(np.uint8)
cv2.imwrite(f'{out}/off.png', off_bgr)

# — les calques : la photo d'origine (ou recolorée) là où la lumière agit, sur fond transparent, recadrés.
# Leur opacité monte très vite au bord : allumé à fond, le calque redonne exactement la photo d'origine
# (là où l'effet est faible, la photo éteinte est déjà presque identique à l'originale).
from PIL import Image
OUT_SIZES = (2560, 1440)
layers = []
def save_avif(arr_bgr_or_bgra, name, q):
    mode = 'RGBA' if arr_bgr_or_bgra.shape[2] == 4 else 'RGB'
    rgb = cv2.cvtColor(arr_bgr_or_bgra, cv2.COLOR_BGRA2RGBA if mode == 'RGBA' else cv2.COLOR_BGR2RGB)
    img = Image.fromarray(rgb, mode)
    sizes = []
    for w in OUT_SIZES:
        k = w / W
        im2 = img.resize((max(1, round(img.width * k)), max(1, round(img.height * k))), Image.LANCZOS)
        im2.save(f'{out}/{name}-{w}.avif', 'AVIF', quality=q, speed=4)
        sizes.append(__import__('os').path.getsize(f'{out}/{name}-{w}.avif') // 1024)
    return sizes

def layer(name, rgb, alpha, group):
    ys, xs = np.where(alpha > 0.004)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    a8 = (np.clip(alpha[y0:y1, x0:x1] * 40, 0, 1) * 255).astype(np.uint8)
    kb = save_avif(np.dstack([rgb[y0:y1, x0:x1].astype(np.uint8), a8]), name, 60)
    layers.append({'name': name, 'group': group, 'x': x0 / W, 'y': y0 / H, 'w': (x1 - x0) / W, 'h': (y1 - y0) / H})
    print(f'{name:14s} {x1 - x0}x{y1 - y0}  {kb} Ko')

kb = save_avif(off_bgr, 'off', 52)
print(f"{'off':14s} {W}x{H}  {kb} Ko")
layer('house', im, soffit_a, 'house')
order = sorted(range(len(palm_layers)), key=lambda i: np.where(palm_layers[i] > 0.5)[1].mean())
for k, i in enumerate(order): layer(f'palm-{k}', im, palm_layers[i], 'palms')
light_a = np.clip(pool_a + ring_a, 0, 1)
layer('pool-violet', im, light_a, 'pool')
med = np.median(h[pool > 0])
fl = lambda a: a[..., None]
for name, hue, sat in [('blue', 222, 1.0), ('aqua', 186, 0.92), ('magenta', 318, 1.0), ('white', None, 0.14)]:
    hh = (hue + (h - med)) % 360 if hue is not None else h
    rec = hsv2rgb(hh, s * sat, v)
    if name == 'white':
        rec = rec * np.array([1.06, 1.0, 0.96])
    mix = im.astype(np.float32) * (1 - fl(light_a)) + rec * fl(light_a)
    layer(f'pool-{name}', np.clip(mix, 0, 255), light_a, 'color')
json.dump({'width': W, 'height': H, 'sizes': OUT_SIZES, 'layers': layers}, open(f'{out}/hero.json', 'w'), indent=1)
