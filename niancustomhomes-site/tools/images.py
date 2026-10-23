"""Export des photos du site en AVIF, jamais agrandies, sans aucune métadonnée, et de leur aperçu flou.

Sources : les originaux du site actuel, téléchargés depuis le CDN de Wix (static.wixstatic.com), un fichier par image, au
nom de Wix (« f0e6cd_<empreinte>….png »). On les désigne ici par les 8 premiers caractères de l'empreinte. Le tri (ce
qui est repris, ce qui ne l'est pas) est dans ANALYSE.md.

    python3 -I tools/images.py <dossier des originaux> [--force]

Écrit src/img/*.avif, data/photos.json (largeur et hauteur de chaque fichier) et data/lqip.json (l'aperçu de chaque
photo : une image de 24 px de large, en JPEG, en base64, que la page agrandit et floute le temps du chargement).

- Métadonnées : aucune n'est recopiée (une seule photo en avait : un appareil et une date). Les fichiers écrits ici n'ont
  ni EXIF, ni XMP, ni profil ICC, et le script le vérifie à la fin.
- Couleurs : telles que le photographe les a livrées (traitement HDR compris). Aucun filtre, aucun redressement.
- Recadrages, tous notés plus bas : le filigrane NIAN d'une vingtaine de photos est laissé hors cadre ; les panoramiques
  sont resserrés au centre, où les murs restent droits.
- Numéros de maison : six façades montrent leur numéro. Il est effacé en reportant l'enduit juste au-dessus ou au-dessous
  (un rectangle aux bords adoucis). C'est la seule retouche.
- Tailles : jamais plus grandes que l'original. La plus grande porte le nom seul, les autres le nom suivi de la largeur
  (« v-1-1000 »).
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
# d'où vient chaque fichier déjà exporté : on ne le réécrit que si sa source, son recadrage ou sa taille a changé
SOURCES_FILE = ROOT / 'data/sources.json'
SOURCES = json.loads(SOURCES_FILE.read_text()) if SOURCES_FILE.exists() else {}
FILES = {p.name.split('_')[1][:8]: p for p in SRC.iterdir() if p.name.startswith('f0e6cd_')}

# les numéros de maison : (zone en pixels de l'original, décalage vertical de l'enduit reporté[, sans correction de
# teinte : sous le numéro de Villa Estate, le pourtour prend l'ombre des colonnes et la correction foncerait l'enduit])
NUMBERS = {
    '9cc43423': [((1374, 1104, 1460, 1159), -64)],
    'f34c166e': [((1432, 998, 1499, 1033), -42, False)],
    '39faf8f9': [((1294, 1366, 1359, 1402), -42)],
    'fb4518da': [((960, 948, 988, 1036), -92)],
    'afa558ca': [((2435, 958, 2505, 991), -34)],
    '85ffdf47': [((1003, 811, 1032, 883), 76)],
}


def ring(im, box, w=6):
    """la teinte moyenne d'une bande de w pixels autour d'un rectangle"""
    x0, y0, x1, y1 = box
    outer = im.crop((x0 - w, y0 - w, x1 + w, y1 + w))
    mask = Image.new('L', outer.size, 255)
    ImageDraw.Draw(mask).rectangle((w, w, w + x1 - x0 - 1, w + y1 - y0 - 1), fill=0)
    return ImageStat.Stat(outer, mask).mean


def erase(im, box, dy, match=True):
    """recouvre un numéro par l'enduit voisin : le même rectangle, pris dy pixels plus haut ou plus bas, ramené à la
    teinte de son nouveau pourtour (l'enduit n'est pas éclairé tout à fait pareil à quelques centimètres près)"""
    x0, y0, x1, y1 = box
    src = (x0, y0 + dy, x1, y1 + dy)
    shift = [a - b for a, b in zip(ring(im, box), ring(im, src))] if match else [0, 0, 0]
    patch = im.crop(src)
    patch = Image.merge('RGB', [c.point(lambda v, s=s: max(0, min(255, round(v + s)))) for c, s in zip(patch.split(), shift)])
    mask = Image.new('L', patch.size, 0)
    ImageDraw.Draw(mask).rectangle((4, 4, patch.width - 5, patch.height - 5), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    im.paste(patch, (x0, y0), mask)


def load(key):
    im = Image.open(FILES[key])
    im = ImageOps.exif_transpose(im).convert('RGB')
    # plus rien de l'original : ni EXIF, ni XMP, ni profil
    clean = Image.new('RGB', im.size)
    clean.paste(im)
    for args in NUMBERS.get(key, []):
        erase(clean, *args)
    return clean


def width(im, w):
    """Réduit à `w` px de large ; n'agrandit jamais."""
    return im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def export(name, im, widths, q=58, key=None):
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
    # l'aperçu : 24 px de large, flouté par la page
    tiny = im.resize((24, max(1, round(im.height * 24 / im.width))), Image.LANCZOS)
    buf = io.BytesIO()
    tiny.save(buf, 'JPEG', quality=60, optimize=True)
    LQIP[name] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
    print(f'{name:<7} {im.width:>5}x{im.height:<5} → {", ".join(str(w) for w in widths)}  {(OUT / f"{name}.avif").stat().st_size // 1024} Ko')


WIDTHS = (2000, 1400, 1000, 480)


def photo(name, key, crop=None, widths=WIDTHS, q=58):
    im = load(key)
    if crop:
        x0, y0, x1, y1 = crop
        im = im.crop((round(x0 * im.width), round(y0 * im.height), round(x1 * im.width), round(y1 * im.height)))
    export(name, im, widths, q=q, key=f'{key}{crop or ""}{NUMBERS.get(key, "")}' + ('v2' if key in NUMBERS else ''))
    return name


# ——— l'accueil : la façade d'Oakes Estate, le jardin à gauche, la maison à droite. Sur un grand écran elle couvre toute
# la scène (jusqu'à 3 600 px pour les écrans haute densité) ; sur un téléphone, une bande au format 4:5.
photo('hero-w', '5ac63991', crop=(0, 0.10, 1, 0.94), widths=(3600, 2400, 1600, 1000))

# ——— The Park Modern Home (Modern West Indies) ———
photo('p-1', '9cc43423')  # la façade (numéro effacé)
photo('p-2', 'bbe81102')  # le patio et la piscine au crépuscule (l'original fait 1 189 px)
photo('p-3', '266318d2', crop=(0.06, 0, 0.94, 1))  # panoramique de la cuisine et du séjour, resserré
photo('p-4', '13561ad1', crop=(0.05, 0, 0.95, 1))  # panoramique du séjour, resserré
photo('p-5', '7460f919')  # la mezzanine
photo('p-6', '07396e3a')  # la double vasque (l'original fait 1 169 px)

# ——— Villa Estate Home ———
photo('v-1', 'f34c166e')  # la façade, la fontaine (numéro effacé)
photo('v-2', '617c16c2')  # la piscine sous les arcades
photo('v-3', '32d2355c', crop=(0, 0, 1, 0.84))  # l'entrée ; filigrane en bas à droite, hors cadre
photo('v-4', 'f8b85d68')  # la cuisine
photo('v-5', '5e8579d8', crop=(0.21, 0, 0.79, 1))  # la baignoire entre les deux douches ; filigrane hors cadre
photo('v-6', '39faf8f9', crop=(0, 0.22, 1, 1))  # vue de l'allée (numéro effacé) ; filigrane dans le ciel, hors cadre

# ——— Oakes Estate Home ———
photo('e-1', '5ac63991')  # la façade, les cyprès
photo('e-2', 'a40122c5')  # la façade sous les pins
photo('e-3', '27b11180', crop=(0, 0.18, 1, 1))  # l'arrière ; filigrane dans le ciel, hors cadre
photo('e-4', '6feaf55b', crop=(0, 0, 1, 0.83))  # la piscine ; filigrane en bas à gauche, hors cadre
photo('e-5', '1aac832d', crop=(0, 0, 1, 0.79))  # le séjour ; filigrane en bas à droite, hors cadre
photo('e-6', 'e9fc8859', crop=(0, 0, 1, 0.82))  # la cuisine ; filigrane en bas à droite, hors cadre

# ——— Oakes Woods Custom Home ———
photo('w-1', 'fb4518da')  # la façade (numéro effacé)
photo('w-2', '14fa12a6', crop=(0, 0, 1, 0.84))  # la piscine ; filigrane hors cadre
photo('w-3', '552d5080', crop=(0, 0, 1, 0.83))  # la cuisine blanche ; filigrane hors cadre
photo('w-4', '6e89949c', crop=(0, 0, 1, 0.83))  # le séjour ; filigrane hors cadre
photo('w-5', 'c42ee8e6', crop=(0, 0, 1, 0.90))  # la salle de bain ; filigrane hors cadre

# ——— Collier Woods Custom Home ———
photo('c-1', 'afa558ca', crop=(0, 0, 1, 0.87))  # la façade (numéro effacé) ; filigrane hors cadre
photo('c-2', '9775c25b', crop=(0, 0, 1, 0.83))  # la cuisine ; filigrane hors cadre
photo('c-3', 'abfc9a93')  # une pièce au parquet
photo('c-4', '5d1b3751', crop=(0, 0, 1, 0.84))  # la salle de bain ; filigrane hors cadre

# ——— Gates Custom Home ———
photo('g-1', '85ffdf47')  # la façade (numéro effacé)
photo('g-2', 'b7b3fc1c')  # l'allée dans les pins
photo('g-3', '48f2db5d')  # l'arrière
photo('g-4', 'c459eaed')  # la cuisine ouverte
photo('g-5', '28001d17')  # la baignoire et la douche
photo('g-6', '1eb08a13')  # le débord de toit sous les pins

(ROOT / 'data').mkdir(exist_ok=True)
(ROOT / 'data/photos.json').write_text(json.dumps(SIZES, indent=1, sort_keys=True))
(ROOT / 'data/lqip.json').write_text(json.dumps(LQIP, indent=1, sort_keys=True))
SOURCES_FILE.write_text(json.dumps({k: SOURCES[k] for k in sorted(SIZES)}, indent=1))

# vérification : aucun fichier écrit ne garde de métadonnées
for f in OUT.glob('*.avif'):
    if f.stem not in SIZES:
        f.unlink()
        continue
    im = Image.open(f)
    if im.getexif() or im.info.get('icc_profile') or im.info.get('xmp'):
        raise SystemExit(f'{f.name} garde des métadonnées')
print(len(SIZES), 'fichiers, aucune métadonnée')
