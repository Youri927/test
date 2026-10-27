"""Export des photos du site en AVIF, jamais agrandies, sans aucune métadonnée, et de leur aperçu flou.

Sources : les trois photos du site actuel, téléchargées en taille originale depuis le CDN de GoDaddy (img1.wsimg.com),
sous leur nom de fichier GoDaddy. Le tri et ce qu'on sait de chacune sont dans ANALYSE.md.

    python3 -I tools/images.py <dossier des originaux> [--force]

Écrit src/img/*.avif, data/photos.json (largeur et hauteur de chaque fichier, et la place de chaque détail dans sa
photo) et data/lqip.json (l'aperçu de chaque photo : 24 px de large, en JPEG, en base64, que la page agrandit et floute
le temps du chargement).

- Métadonnées : aucune n'est recopiée (les intérieurs avaient l'appareil et la date). Les fichiers écrits ici n'ont ni
  EXIF, ni XMP, ni profil ICC (les originaux étaient en sRGB, la couleur ne change pas), et le script le vérifie.
- Couleurs : telles que livrées. Aucun filtre.
- La seule retouche : sur la façade, la plaque du pilier de droite (le numéro et la rue de la maison) est recouverte par
  la brique peinte du même pilier, prise quatre rangs plus bas (les joints restent alignés), aux bords adoucis.
- Les détails sont des recadrages des mêmes photos, à leur taille réelle : ils ne sont jamais agrandis non plus.
- Tailles : la plus grande porte le nom seul, les autres le nom suivi de la largeur (« foyer-1600 »).
"""
import base64
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageStat

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/img'
SRC = Path(sys.argv[1]).resolve()
FORCE = '--force' in sys.argv
OUT.mkdir(parents=True, exist_ok=True)
SIZES = {}
LQIP = {}
SOURCES_FILE = ROOT / 'data/sources.json'
SOURCES = json.loads(SOURCES_FILE.read_text()) if SOURCES_FILE.exists() else {}

FILES = {
    'foyer': 'orig-00012844_blended.JPG',  # l'entrée : brique blanchie, portes anciennes, chêne en chevrons
    'living': 'orig-00012695.jpg',  # le séjour : poutres, plafond de planches, cheminée
    'house': 'hero-orig.jpg',  # la façade (photo d'accueil du site actuel)
}
# la plaque du pilier de droite, sur la façade : (zone, décalage vertical de la brique reportée)
PLATES = {'house': [((1494, 897, 1582, 937), 40)]}


def ring(im, box, w=5):
    """la teinte moyenne d'une bande de w pixels autour d'un rectangle"""
    x0, y0, x1, y1 = box
    outer = im.crop((x0 - w, y0 - w, x1 + w, y1 + w))
    mask = Image.new('L', outer.size, 255)
    ImageDraw.Draw(mask).rectangle((w, w, w + x1 - x0 - 1, w + y1 - y0 - 1), fill=0)
    return ImageStat.Stat(outer, mask).mean


def erase(im, box, dy):
    """recouvre la plaque par la brique du même pilier, dy pixels plus bas, ramenée à la teinte de son nouveau pourtour"""
    x0, y0, x1, y1 = box
    src = (x0, y0 + dy, x1, y1 + dy)
    shift = [a - b for a, b in zip(ring(im, box), ring(im, src))]
    patch = im.crop(src)
    patch = Image.merge('RGB', [c.point(lambda v, s=s: max(0, min(255, round(v + s)))) for c, s in zip(patch.split(), shift)])
    mask = Image.new('L', patch.size, 0)
    ImageDraw.Draw(mask).rectangle((3, 3, patch.width - 4, patch.height - 4), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(2))
    im.paste(patch, (x0, y0), mask)


def load(key):
    im = Image.open(SRC / FILES[key])
    im = ImageOps.exif_transpose(im).convert('RGB')
    clean = Image.new('RGB', im.size)  # plus rien de l'original : ni EXIF, ni XMP, ni profil
    clean.paste(im)
    for box, dy in PLATES.get(key, []):
        erase(clean, box, dy)
    return clean


def width(im, w):
    """réduit à w px de large ; n'agrandit jamais"""
    return im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def export(name, im, widths, q, key):
    widths = sorted({min(w, im.width) for w in widths}, reverse=True)
    widths = [w for i, w in enumerate(widths) if i == 0 or w <= widths[0] * 0.8]
    for i, w in enumerate(widths):
        out = width(im, w)
        n = name if i == 0 else f'{name}-{w}'
        dst = OUT / f'{n}.avif'
        if FORCE or not dst.exists() or SOURCES.get(n) != key or Image.open(dst).size != out.size:
            out.save(dst, 'AVIF', quality=q, speed=4)
            SOURCES[n] = key
        SIZES[n] = [out.width, out.height]
    tiny = im.resize((24, max(1, round(im.height * 24 / im.width))), Image.LANCZOS)
    buf = io.BytesIO()
    tiny.save(buf, 'JPEG', quality=60, optimize=True)
    LQIP[name] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
    print(f'{name:<10} {im.width:>5}x{im.height:<5} → {", ".join(str(w) for w in widths)}  {(OUT / f"{name}.avif").stat().st_size // 1024} Ko')


PLACES = {}


def photo(name, key, widths, q=60):
    im = load(key)
    export(name, im, widths, q, f'{key}{PLATES.get(key, "")}')
    return im


def detail(name, key, im, box, widths=(560, 360), q=62):
    """un détail recadré dans une photo ; sa place y est notée en fractions, pour que la page la montre au survol"""
    x0, y0, x1, y1 = box
    export(name, im.crop(box), widths, q, f'{key}{box}')
    PLACES[name] = [round(x0 / im.width, 4), round(y0 / im.height, 4), round(x1 / im.width, 4), round(y1 / im.height, 4)]


# ——— l'entrée (Design) : la photo entière, puis trois détails ———
foyer = photo('foyer', 'foyer', (2560, 1920, 1280, 800))
detail('foyer-doors', 'foyer', foyer, (1860, 330, 2340, 810))  # une porte ancienne sur son rail de fer
detail('foyer-brick', 'foyer', foyer, (1000, 520, 1480, 1000))  # la brique blanchie
detail('foyer-oak', 'foyer', foyer, (1300, 1240, 1860, 1707))  # le chêne en chevrons

# ——— la façade (Build) : plaque effacée ———
photo('house', 'house', (2002, 1600, 1000))

# ——— le séjour (Live) ———
living = photo('living', 'living', (2560, 1920, 1280, 800))
detail('living-beams', 'living', living, (240, 0, 900, 440))  # les poutres de récupération, le plafond de planches
detail('living-fire', 'living', living, (1340, 760, 1900, 1240))  # la cheminée linéaire, le mur de chêne
detail('living-hood', 'living', living, (0, 480, 460, 920))  # la hotte de bois, le carrelage en écailles

(ROOT / 'data').mkdir(exist_ok=True)
(ROOT / 'data/photos.json').write_text(json.dumps({'sizes': SIZES, 'places': PLACES}, indent=1, sort_keys=True))
(ROOT / 'data/lqip.json').write_text(json.dumps(LQIP, indent=1, sort_keys=True))
SOURCES_FILE.write_text(json.dumps({k: SOURCES[k] for k in sorted(SIZES)}, indent=1))

for f in OUT.glob('*.avif'):
    if f.stem not in SIZES:
        f.unlink()
        continue
    im = Image.open(f)
    if im.getexif() or im.info.get('icc_profile') or im.info.get('xmp'):
        raise SystemExit(f'{f.name} garde des métadonnées')
print(len(SIZES), 'fichiers, aucune métadonnée')
