"""La porte « Vendre » : le flacon fourni (photo), sans son bouchon, avec une bague et un bouton spray dessinés, posé sur
la couleur de la porte (clair et sombre). Sortie : public/demo/vendre.webp, vendre-sombre.webp, et la position de la buse.
   python3 tools/porte-vendre/construire.py <photo du flacon>"""
import sys, json, pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

RACINE = pathlib.Path(__file__).resolve().parents[2]
src = Image.open(sys.argv[1]).convert('RGB')
a = np.asarray(src).astype(int)
H0, W0 = a.shape[:2]

# 1. le corps seul : sous le bouchon (sa base étroite finit vers 25 % de la hauteur), sans le reflet au sol
haut, bas = 115, 412
corps = src.crop((0, haut, W0, bas))
c = np.asarray(corps).astype(int)
# le fond blanc devient transparent (les coins de l'épaule biseautée)
blanc = np.abs(c - 255).max(axis=2)
# transparence d'origine : seulement là où le flacon se mêle au fond blanc (les coins biseautés de l'épaule)
a0 = np.clip((blanc - 6) / 150, 0, 1)
# on retire ce blanc des pixels mêlés (« démultiplication »), avec CETTE transparence-là seulement
pur = np.where(a0[..., None] > 0.05, (c - 255 * (1 - a0[..., None])) / np.maximum(a0[..., None], 0.05), c)
# le flacon touche les bords de la photo : les 2 premières rangées de pixels tout autour sont un liseré (mêlé de blanc,
# puis une ligne sombre) ; on les écarte du masque, sans toucher aux couleurs, puis on adoucit le bord
m = np.minimum((a0 * 255).astype(np.uint8), 255)
cadre = np.zeros_like(m); cadre[3:-3, 3:-3] = 255
m = Image.fromarray(np.minimum(m, cadre)).filter(ImageFilter.GaussianBlur(0.7))
corps = Image.fromarray(np.clip(pur, 0, 255).astype(np.uint8)).convert('RGBA')
corps.putalpha(m)

# 2. on travaille en ×4 pour des bords nets
K = 4
corps = corps.resize((W0 * K, (bas - haut) * K), Image.LANCZOS)
cx = W0 * K // 2

def metal(w, h, clair=(236, 206, 140), fonce=(132, 98, 38)):
    """un cylindre doré vu de face : dégradé horizontal (reflet clair à gauche du centre, bords foncés)"""
    im = Image.new('RGBA', (w, h))
    px = im.load()
    for x in range(w):
        t = x / (w - 1)
        # profil d'éclairage d'un cylindre : sombre aux bords, deux reflets
        k = 0.35 + 0.65 * (1 - abs(2 * t - 1) ** 1.6)
        k += 0.45 * np.exp(-((t - 0.32) / 0.07) ** 2) + 0.15 * np.exp(-((t - 0.78) / 0.05) ** 2)
        k = min(k, 1.25)
        col = tuple(int(min(255, fonce[i] + (clair[i] - fonce[i]) * k)) for i in range(3))
        for y in range(h):
            px[x, y] = (*col, 255)
    return im

# 3. la bague (col) et le bouton spray, centrés sur le haut du corps
bague_w, bague_h = 62 * K, 15 * K
bouton_w, bouton_h = 42 * K, 33 * K
tige_h = 4 * K
total_h = bouton_h + tige_h + bague_h
flacon = Image.new('RGBA', (corps.width, corps.height + total_h), (0, 0, 0, 0))
flacon.alpha_composite(corps, (0, total_h - 3 * K))  # la bague mord un peu sur le verre : pas de jour entre les deux
bague = metal(bague_w, bague_h)
ImageDraw.Draw(bague).rectangle([0, bague_h - 2 * K, bague_w, bague_h], fill=(110, 80, 30, 255))  # le joint sombre
flacon.alpha_composite(bague, (cx - bague_w // 2, total_h - bague_h))
tige = metal(18 * K, tige_h, (210, 210, 205), (120, 120, 118))
flacon.alpha_composite(tige, (cx - 9 * K, bouton_h))
bouton = metal(bouton_w, bouton_h)
# le dessus du bouton, légèrement plus clair, et les coins arrondis
masque = Image.new('L', (bouton_w, bouton_h), 0)
ImageDraw.Draw(masque).rounded_rectangle([0, 0, bouton_w - 1, bouton_h - 1], radius=5 * K, fill=255)
bouton.putalpha(masque)
ImageDraw.Draw(bouton).rounded_rectangle([0, 0, bouton_w - 1, 4 * K], radius=4 * K, fill=(246, 224, 168, 255))
# la buse : un petit trou sombre sur le côté gauche
buse_y = int(bouton_h * 0.42)
ImageDraw.Draw(bouton).ellipse([2 * K, buse_y - 3 * K, 8 * K, buse_y + 3 * K], fill=(38, 26, 12, 255))
flacon.alpha_composite(bouton, (cx - bouton_w // 2, 0))
buse_local = (cx - bouton_w // 2 + 2 * K, buse_y)

# 4. la porte : 600 × 800, le flacon posé en bas, une ombre douce
W, H = 600, 800
echelle = 1.5 / K
fl = flacon.resize((int(flacon.width * echelle), int(flacon.height * echelle)), Image.LANCZOS)
x0 = (W - fl.width) // 2 + 10
y0 = H - 40 - fl.height
for nom, fond, force in [('vendre', (233, 232, 238), 0.30), ('vendre-sombre', (43, 42, 39), 0.55)]:
    porte = Image.new('RGBA', (W, H), (*fond, 255))
    ombre = Image.new('L', (W, H), 0)
    ImageDraw.Draw(ombre).ellipse([x0 + 6, y0 + fl.height - 14, x0 + fl.width - 6, y0 + fl.height + 16], fill=int(255 * force))
    ombre = ombre.filter(ImageFilter.GaussianBlur(14))
    porte.alpha_composite(Image.new('RGBA', (W, H), (0, 0, 0, 255)).convert('RGBA'), (0, 0)) if False else None
    noir = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    noir.putalpha(ombre)
    porte.alpha_composite(noir)
    porte.alpha_composite(fl, (x0, y0))
    porte.convert('RGB').save(RACINE / f'public/demo/{nom}.webp', quality=90)
buse = {'x': round((x0 + buse_local[0] * echelle) / W, 3), 'y': round((y0 + buse_local[1] * echelle) / H, 3)}
print(json.dumps({'buse': buse, 'flacon': fl.size}))
