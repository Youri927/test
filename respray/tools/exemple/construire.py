"""Les photos de l'annonce d'exemple, à partir d'une photo du flacon de face (tools/exemple/flacon.png, fond blanc) :
face, niveau (rempli à 85 %), sans bouchon avec le spray (« dessus »), sans le bouton (« tige »), la photo preuve
(papier avec pseudo et date), le dessous (code lot gravé) et la boîte (code lot). Sortie : public/demo/a101-*.webp
   python3 tools/exemple/construire.py"""
import pathlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ICI = pathlib.Path(__file__).parent
RACINE = ICI.parents[1]
SORTIE = RACINE / 'public/demo'
INTER = str(RACINE / 'public/fonts/inter-400-700.woff2')
CAVEAT = str(ICI / 'polices/Caveat.ttf')
W, H = 600, 750           # le format des photos du site (4:5)
FOND = (245, 245, 244)    # un fond de studio très clair, un peu moins blanc que la photo
LOT = '3A21'

src = Image.open(ICI / 'flacon.png').convert('RGB')
a = np.asarray(src).astype(float)

# ——— le flacon détouré (le fond de la photo est blanc) ———
def detoure(img):
    c = np.asarray(img).astype(float)
    blanc = np.abs(c - 255).max(axis=2)
    al = np.clip((blanc - 4) / 26, 0, 1)
    pur = np.where(al[..., None] > 0.05, (c - 255 * (1 - al[..., None])) / np.maximum(al[..., None], 0.05), c)
    out = Image.fromarray(np.clip(pur, 0, 255).astype(np.uint8)).convert('RGBA')
    out.putalpha(Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5)))
    return out

# ——— 1. le niveau à 85 % : au-dessus de la ligne, le verre redevient clair (le jus jaune pâle disparaît) ———
# la cavité va de l'épaule (y ≈ 245) au fond épais (y ≈ 700) ; 85 % → la surface à y ≈ 245 + 15 % × 455
SURFACE = int(245 + 0.15 * 455)
b = a.copy()
zone = b[245:SURFACE, 228:570]
gris = zone.mean(axis=2, keepdims=True)
# hors de l'étiquette (blanche, neutre) : on retire la teinte jaune et on éclaircit un peu
jaune = (zone[..., 0] + zone[..., 1]) / 2 - zone[..., 2]
masque = (jaune > 6)[..., None]
zone[:] = np.where(masque, np.clip(gris * 0.25 + zone * 0.0 + np.minimum(gris + 10, 250) * 0.75, 0, 255), zone)
# un ménisque discret : une fine ligne un peu plus dorée à la surface, de part et d'autre de l'étiquette
for x0, x1 in [(232, 282), (520, 566)]:
    b[SURFACE - 1:SURFACE + 2, x0:x1] = b[SURFACE - 1:SURFACE + 2, x0:x1] * 0.82 + np.array([170, 150, 80]) * 0.18
plein = Image.fromarray(np.clip(b, 0, 255).astype(np.uint8))

# ——— 2. sans le bouchon : on efface le bouchon, on dessine la bague, la tige et (ou non) le bouton ———
def metal(w, h, clair, fonce, reflets=((0.3, 0.45), (0.78, 0.15))):
    x = np.linspace(0, 1, w)
    k = 0.3 + 0.7 * (1 - np.abs(2 * x - 1) ** 1.8)
    for c, f in reflets:
        k = k + f * np.exp(-((x - c) / 0.06) ** 2)
    k = np.minimum(k, 1.3)
    col = np.array(fonce)[None, :] + (np.array(clair) - np.array(fonce))[None, :] * k[:, None]
    im = np.repeat(np.clip(col, 0, 255)[None, :, :], h, axis=0)
    return Image.fromarray(im.astype(np.uint8)).convert('RGBA')

def sans_bouchon(img, bouton=True):
    im = img.copy()
    d = ImageDraw.Draw(im)
    d.rectangle([280, 0, 510, 197], fill=(255, 255, 255))  # le bouchon disparaît (fond blanc de la photo)
    im = im.convert('RGBA')
    cx = 395
    # la bague chromée, posée sur le col de verre
    bague = metal(128, 26, (232, 234, 236), (70, 72, 76))
    ImageDraw.Draw(bague).rectangle([0, 23, 128, 26], fill=(40, 40, 42, 255))
    im.alpha_composite(bague, (cx - 64, 176))
    # la tige : un tube de plastique translucide
    tige = metal(12, 30 if bouton else 46, (245, 245, 245), (170, 170, 172), ((0.4, 0.4),))
    im.alpha_composite(tige, (cx - 6, 146 if bouton else 130))
    buse = None
    if bouton:
        # le bouton : noir laqué comme le bouchon, avec un reflet, la buse à gauche
        bt = metal(86, 62, (120, 120, 124), (6, 6, 8), ((0.3, 0.55), (0.8, 0.12)))
        m = Image.new('L', bt.size, 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, 85, 61], radius=10, fill=255)
        bt.putalpha(m)
        ImageDraw.Draw(bt).ellipse([5, 20, 15, 30], fill=(0, 0, 0, 255), outline=(90, 90, 94, 255))
        im.alpha_composite(bt, (cx - 43, 116))
        buse = (cx - 38, 141)
    return im.convert('RGB'), buse

# ——— la mise en page : le flacon centré sur le fond de studio, avec une ombre douce au sol ———
def poser(img, echelle=0.84, haut_bas=(10, 790), cx_img=None):
    fl = detoure(img.crop((190, haut_bas[0], 610, haut_bas[1])))
    k = min(W * echelle / fl.width, H * echelle / fl.height)
    fl = fl.resize((int(fl.width * k), int(fl.height * k)), Image.LANCZOS)
    fond = Image.new('RGBA', (W, H), (*FOND, 255))
    x0, y0 = (W - fl.width) // 2 if cx_img is None else int(cx_img - fl.width / 2), H - 44 - fl.height
    ombre = Image.new('L', (W, H), 0)
    ImageDraw.Draw(ombre).ellipse([x0 + 20, y0 + fl.height - 12, x0 + fl.width - 20, y0 + fl.height + 14], fill=70)
    noir = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    noir.putalpha(ombre.filter(ImageFilter.GaussianBlur(12)))
    fond.alpha_composite(noir)
    fond.alpha_composite(fl, (x0, y0))
    return fond.convert('RGB'), (x0, y0, k)

def sur_fond(img):
    """la photo entière, détourée et posée sur le fond de studio (pour les gros plans)"""
    f = Image.new('RGBA', img.size, (*FOND, 255))
    f.alpha_composite(detoure(img))
    return f.convert('RGB')

def enregistrer(img, nom):
    img.save(SORTIE / f'a101-{nom}.webp', quality=90)
    print(nom)

face, _ = poser(plein)
enregistrer(face, 'face')

# le niveau : recadrage serré, la surface du jus au milieu de l'image (le site y trace sa ligne)
k = 2.0
cad = sur_fond(plein).crop((395 - W / (2 * k), SURFACE - H / (2 * k), 395 + W / (2 * k), SURFACE + H / (2 * k))).resize((W, H), Image.LANCZOS)
enregistrer(cad, 'niveau')

# sans le bouchon, avec le spray ; puis sans le bouton : la tige (recadré sur le haut du flacon)
for nom, bouton in [('dessus', True), ('tige', False)]:
    im, _ = sans_bouchon(plein, bouton)
    im = sur_fond(im)
    k = 1.55
    cy = 260
    enregistrer(im.crop((395 - W / (2 * k), cy - H / (2 * k), 395 + W / (2 * k), cy + H / (2 * k))).resize((W, H), Image.LANCZOS), nom)

# la photo preuve : le flacon un peu à gauche, et un papier posé contre lui avec le pseudo et la date
preuve, (x0, y0, k) = poser(plein, echelle=0.74, cx_img=250)
papier = Image.new('RGBA', (250, 175), (252, 251, 247, 255))
dp = ImageDraw.Draw(papier)
for y in range(36, 175, 30):
    dp.line([(0, y), (250, y)], fill=(170, 190, 220, 90), width=1)
main = ImageFont.truetype(CAVEAT, 46)
main.set_variation_by_axes([600])
dp.text((18, 30), '@lea.parfums', font=main, fill=(31, 58, 138, 255))
dp.text((30, 92), '24/11/2026', font=main, fill=(31, 58, 138, 255))
papier = papier.rotate(-6, resample=Image.BICUBIC, expand=True)
ombre_p = Image.new('RGBA', papier.size, (0, 0, 0, 0))
ombre_p.putalpha(papier.split()[3].point(lambda v: int(v * 0.25)).filter(ImageFilter.GaussianBlur(8)))
pr = preuve.convert('RGBA')
pr.alpha_composite(ombre_p, (W - papier.width - 18, H - papier.height - 26))
pr.alpha_composite(papier, (W - papier.width - 28, H - papier.height - 40))
enregistrer(pr.convert('RGB'), 'preuve')

# le dessous : le fond épais du flacon en gros plan, le code lot gravé dans le verre
bas = sur_fond(plein).crop((240, 640, 560, 790)).resize((W * 2, int(150 * W * 2 / 320)), Image.LANCZOS)
dess = Image.new('RGB', (W, H), FOND)
bas = bas.resize((W, int(bas.height / 2)))
dess.paste(bas, (0, (H - bas.height) // 2))
dg = ImageDraw.Draw(dess, 'RGBA')
grave = ImageFont.truetype(INTER, 54)
grave.set_variation_by_axes([14, 600])
petit = ImageFont.truetype(INTER, 26)
petit.set_variation_by_axes([14, 500])
cy = H // 2 + 8
for dx, dy, col in [(1, 1, (255, 255, 255, 150)), (0, 0, (90, 84, 70, 170))]:
    dg.text((W // 2 + dx, cy - 14 + dy), LOT, font=grave, fill=col, anchor='mm')
    dg.text((W // 2 + dx, cy + 34 + dy), '100 ml', font=petit, fill=col, anchor='mm')
enregistrer(dess, 'dessous')

# la boîte : un côté de l'étui en carton blanc, avec l'étiquette du code lot et le code-barres
boite = Image.new('RGB', (W, H), FOND)
db = ImageDraw.Draw(boite, 'RGBA')
db.rounded_rectangle([70, 90, 530, 700], radius=6, fill=(250, 249, 246), outline=(222, 220, 214))
db.rectangle([70, 90, 96, 700], fill=(236, 234, 229))  # l'arête de l'étui
etq = ImageFont.truetype(INTER, 30)
etq.set_variation_by_axes([14, 600])
db.rounded_rectangle([150, 470, 470, 640], radius=8, fill=(255, 255, 255), outline=(210, 208, 202))
db.text((170, 492), f'LOT {LOT}', font=etq, fill=(40, 40, 42))
rng = np.random.default_rng(3)
x = 172
while x < 448:
    w = int(rng.choice([2, 2, 3, 4, 5]))
    db.rectangle([x, 545, x + w - 1, 615], fill=(30, 30, 32))
    x += w + int(rng.choice([2, 3, 3, 4]))
enregistrer(boite, 'boite')
