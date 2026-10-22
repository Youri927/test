"""Export des photos du site en AVIF, jamais agrandies, sans aucune métadonnée.

Sources : les originaux des photos du site actuel, téléchargés depuis le CDN de GoDaddy (img1.wsimg.com), un fichier
par photo nommé par le début de son empreinte (« c4ea1735.jpeg »), avec leur index (_index.json). Le tri (leurs
chantiers en Floride, gardés ; les photos d'annonces californiennes, les images générées, l'image de banque d'images,
écartées) est dans ANALYSE.md.

    python3 -I tools/images.py <dossier des originaux> [--force]

Écrit src/img/*.avif, data/photos.json (largeur et hauteur de chaque fichier) et data/sets.json (pour chaque projet :
ses photos, avec leur légende).

- Métadonnées : aucune n'est recopiée. 48 originaux du site actuel portent la position GPS de la maison ; les fichiers
  écrits ici n'ont ni EXIF, ni XMP, ni profil ICC, et le script le vérifie à la fin.
- Couleurs : les photos d'iPhone sont en Display P3 ; elles sont converties en sRGB (rendu colorimétrique relatif),
  sinon elles seraient délavées dans certains navigateurs. Aucune autre retouche : ni filtre, ni redressement.
- Recadrages, tous notés plus bas : le cadre de la capture d'écran du rendu 3D, la barre des tâches des deux photos de
  l'écran du bureau, et deux photos de toits (deux plaques d'immatriculation, au bord).
- Une seule retouche, pour la vie privée : le numéro d'une maison, sur le mur au-dessus du garage, est effacé (la zone
  est remplie par le mur au-dessus et au-dessous, ligne par ligne).
- Tailles : les photos en paysage sortent en 1600, 1000 et 600 px de large, celles en portrait en 1200, 800 et 480 ;
  les trois images de l'accueil en plus grand. Jamais plus grandes que l'original. La plus grande porte le nom seul.
"""
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageCms, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/img'
SRC = Path(sys.argv[1]).resolve()
FORCE = '--force' in sys.argv
OUT.mkdir(parents=True, exist_ok=True)
SIZES = {}
SETS = {}
# d'où vient chaque fichier déjà exporté : on ne le réécrit que si sa source, son recadrage ou sa taille a changé
SOURCES_FILE = ROOT / 'data/sources.json'
SOURCES = json.loads(SOURCES_FILE.read_text()) if SOURCES_FILE.exists() else {}
SRGB = ImageCms.createProfile('sRGB')
FILES = {it['id']: SRC / it['file'] for it in json.loads((SRC / '_index.json').read_text())}


def load(key):
    im = Image.open(FILES[key])
    exif = im.getexif()
    shot = exif.get_ifd(0x8769).get(36867) or exif.get(306)
    icc = im.info.get('icc_profile')
    im = ImageOps.exif_transpose(im).convert('RGB')
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        if 'sRGB' not in ImageCms.getProfileDescription(src):
            im = ImageCms.profileToProfile(im, src, SRGB, renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC, outputMode='RGB')
    # plus rien de l'original : ni EXIF (date, appareil, position GPS), ni XMP, ni profil
    clean = Image.new('RGB', im.size)
    clean.paste(im)
    return clean, (str(shot) if shot else None)


def width(im, w):
    """Réduit à `w` px de large ; n'agrandit jamais."""
    return im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def export(name, im, widths, q=56, key=None):
    widths = sorted({min(w, im.width) for w in widths}, reverse=True)
    # une largeur à moins de 20 % de la plus grande n'apporte rien : on ne la garde pas
    widths = [w for i, w in enumerate(widths) if i == 0 or w <= widths[0] * 0.8]
    for i, w in enumerate(widths):
        out = width(im, w)
        n = name if i == 0 else f'{name}-{w}'
        dst = OUT / f'{n}.avif'
        if FORCE or not dst.exists() or SOURCES.get(n) != key or Image.open(dst).size != out.size:
            out.save(dst, 'AVIF', quality=q, speed=4)
            SOURCES[n] = key
        SIZES[n] = [out.width, out.height]
    print(f'{name:<12} {im.width:>5}x{im.height:<5} → {", ".join(str(w) for w in widths)}  {(OUT / f"{name}.avif").stat().st_size // 1024} Ko')


SHOTS = {}


def erase(im, box):
    """Efface une petite zone (un numéro de maison) : chaque colonne est remplie en dégradé entre le pixel du mur juste
    au-dessus et celui juste au-dessous."""
    x0, y0, x1, y1 = box
    px = im.load()
    for x in range(x0, x1):
        top, bottom = px[x, y0 - 1], px[x, y1]
        for y in range(y0, y1):
            t = (y - y0 + 1) / (y1 - y0 + 1)
            px[x, y] = tuple(round(a + (b - a) * t) for a, b in zip(top, bottom))
    return im


def photo(name, key, crop=None, widths=None, q=56, hide=None):
    im, shot = load(key)
    if hide:
        im = erase(im, hide)
    if crop:
        im = im.crop(crop)
    portrait = im.height > im.width
    export(name, im, widths or ((1200, 800, 480) if portrait else (1600, 1000, 600)), q=q, key=f'{key}{crop or ""}{hide or ""}')
    SHOTS[name] = shot
    return name


def series(set_id, items):
    """Un projet : (nom du fichier, légende), dans l'ordre où on les montre."""
    SETS[set_id] = [{'name': n, 'caption': c} for n, c in items]


# ——— l'accueil : la salle de bain parentale, de l'esquisse à la pièce finie (même point de vue) ———
# 1. l'esquisse aux crayons de couleur, photographiée dans le carnet (on garde la page entière, spirale comprise)
photo('st-1', '82131cf3', widths=(2400, 1600, 1000))
# 2. le rendu 3D, une capture d'écran de téléphone : on ne garde que l'image (sans le cadre noir, la marge blanche et
#    la barre du bas de l'écran)
photo('st-2', '8667db3b', crop=(58, 37, 1571, 1248), widths=(1513, 1000, 640))
# 3. la pièce construite
photo('st-3', 'c4ea1735', widths=(2560, 1600, 1000, 640))

# ——— la cuisine aux deux îlots : le plan et la 3D sur l'écran du bureau (sans la barre des tâches), le polissage de
# l'îlot sur place, la cuisine finie, la pose du micro-ondes ———
photo('kd-1', 'a6fc2e8d', crop=(0, 0, 2560, 1590), widths=(1600, 1000, 600))
photo('kd-2', '66a13872', crop=(0, 0, 2560, 1680), widths=(1600, 1000, 600))
photo('k-1', '5a4437d2')
photo('k-2', '205af358')
photo('k-3', 'f334c26c')
# ——— la salle de bain à baignoire sur estrade : le dessin 3D coté, puis la douche et la pièce finies ———
photo('bd-1', 'ac0eb5a9')
photo('b2-1', '8d74115e')
photo('b2-2', '89e2d433')

# ——— la salle de bain parentale de l'accueil, les autres vues ———
photo('mb-1', 'a94bb6ed')
photo('mb-2', 'af345c15')
photo('mb-3', '253a2f63')
photo('mb-4', '6a38608a')
# ——— la salle de bain en pierre bleu-gris, et la chambre de la même maison ———
photo('sb-1', '1137afb1')
photo('sb-2', '3fd3f6f4')
photo('sb-3', '44a7b0e7')
# ——— les autres pièces ———
photo('lv-1', 'f471c31c')
photo('ba-1', '3e563851')
photo('ba-2', '4c0a065f')
photo('ba-3', 'a59f772a')
photo('kp-1', '446b4b2b')
# ——— dehors : la piscine sous sa cage, la terrasse d'une piscine ———
photo('po-1', '0b99511b')
photo('po-2', '8a0570b9')
photo('pd-1', '928e3ec8')
photo('pd-2', 'b68709e2')
# ——— les toits de l'été 2026, avec leurs camions. 5c37862b : le numéro de la maison effacé, la plaque du camion-benne
# coupée (à gauche) ; ff816531 : la plaque du camion-grue coupée (à gauche) ———
photo('rf-1', '5c37862b', hide=(1832, 1082, 1898, 1136), crop=(70, 0, 2560, 1920))
photo('rf-2', 'ff816531', crop=(150, 0, 2560, 1920))
photo('rf-3', 'c01e6db8')
photo('rf-4', '94340eb3')
photo('rf-5', '3c958039')

# ——— les projets de la visionneuse ———
series('primary', [
    ('st-3', 'The primary bath, from the door'),
    ('mb-1', 'The tub under the window, and the glass shower'),
    ('mb-2', 'The tub, the shower and the door to the toilet room'),
    ('mb-3', 'The shower bench and its pebble floor'),
    ('mb-4', 'The glass shower, brass hinges and bench'),
])
series('kitchen', [
    ('kd-1', 'The plan, drawn on our office screen'),
    ('kd-2', 'The same kitchen in 3D, the same afternoon'),
    ('k-1', 'Polishing the quartzite island on site'),
    ('k-3', 'Putting in the microwave'),
    ('k-2', 'The finished kitchen'),
])
series('step', [
    ('bd-1', 'The 3D plan, with its measurements'),
    ('b2-1', 'The shower, with its wood slat floor, and the tub on its step'),
    ('b2-2', 'The whole room'),
])
series('stone', [
    ('sb-1', 'A bath in blue-gray stone, with a freestanding tub and a brass floor faucet'),
    ('sb-2', 'Inside the shower: the bench, the brass fixtures and a stone mosaic floor'),
    ('sb-3', 'The bedroom next door: a TV wall with a fireplace'),
])
series('baths', [
    ('ba-1', 'A white vanity under a lit mirror'),
    ('ba-2', 'A black vanity under a lit mirror'),
    ('ba-3', 'A glass shower with a niche'),
])
series('living', [('lv-1', 'A living room with a grand piano')])
series('kitchen2', [('kp-1', 'A kitchen going in: white cabinets, quartzite counters, a brass faucet')])
series('pool', [
    ('po-1', 'A pool under its screen cage'),
    ('po-2', 'The same pool, toward the golf course'),
])
series('deck', [
    ('pd-1', 'A pool deck and the back of the house'),
    ('pd-2', 'The same deck, from the other side of the pool'),
])
series('roofs', [
    ('rf-1', 'Taking off the old tiles, the dump truck in the driveway'),
    ('rf-2', 'New tiles going up by crane'),
    ('rf-3', 'Our crew on the roof'),
    ('rf-4', 'Our pickup in the driveway'),
    ('rf-5', 'A finished roof, on the golf course'),
])

for s in SETS.values():
    for p in s:
        if p['name'] not in SIZES:
            raise SystemExit(f'photo inconnue dans un projet : {p["name"]}')

# vérification : aucune métadonnée dans les fichiers écrits
for f in sorted(OUT.glob('*.avif')):
    if f.stem not in SIZES:
        continue
    im = Image.open(f)
    if im.getexif() or im.info.get('xmp') or im.info.get('icc_profile'):
        raise SystemExit(f'{f.name} : des métadonnées sont restées')

(ROOT / 'data').mkdir(exist_ok=True)
(ROOT / 'data/photos.json').write_text(json.dumps(SIZES, indent=1, sort_keys=True))
(ROOT / 'data/sets.json').write_text(json.dumps(SETS, indent=1))
SOURCES_FILE.write_text(json.dumps({k: v for k, v in SOURCES.items() if k in SIZES}, indent=1, sort_keys=True))
print(len(SIZES), 'fichiers,', sum(len(s) for s in SETS.values()), 'photos dans', len(SETS), 'projets ; aucune métadonnée')
