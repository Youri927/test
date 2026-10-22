"""Export des photos du site en AVIF, jamais agrandies, sans aucune métadonnée, et de leur aperçu flou.

Sources : les originaux du site actuel, téléchargés depuis le CDN de Wix (static.wixstatic.com), un fichier par photo,
au nom de Wix (« ef9f43_<empreinte>~mv2.jpg »). On les désigne ici par les 8 premiers caractères de l'empreinte. Le tri
(ce qui est repris, ce qui ne l'est pas) est dans ANALYSE.md.

    python3 -I tools/images.py <dossier des originaux> [--force]

Écrit src/img/*.avif, data/photos.json (largeur et hauteur de chaque fichier) et data/lqip.json (l'aperçu de chaque
photo : une image de 24 px de large, en JPEG, en base64 ; la page l'agrandit et la floute : c'est le verre dépoli).

- Métadonnées : aucune n'est recopiée. 40 originaux portent la position GPS de la maison ; les fichiers écrits ici
  n'ont ni EXIF, ni XMP, ni profil ICC, et le script le vérifie à la fin.
- Couleurs : les photos d'iPhone sont en Display P3 ; elles sont converties en sRGB (rendu colorimétrique relatif),
  sinon elles seraient délavées dans certains navigateurs. Aucune autre retouche : ni filtre, ni redressement.
- Recadrages, tous notés plus bas : le format des planches (3:4 ou 4:3), le filigrane « BB Brunet Brothers
  Construction Corp » de trois photos (retiré en coupant le bas), les bandes noires de la capture de la story.
- Tailles : jamais plus grandes que l'original. La plus grande porte le nom seul, les autres le nom suivi de la
  largeur (« k-1-1000 »). Deux originaux ont été agrandis à 5 600 px dans Photoshop : on ne s'en sert pas au-delà de
  1 600 px.
"""
import base64
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
LQIP = {}
# d'où vient chaque fichier déjà exporté : on ne le réécrit que si sa source, son recadrage ou sa taille a changé
SOURCES_FILE = ROOT / 'data/sources.json'
SOURCES = json.loads(SOURCES_FILE.read_text()) if SOURCES_FILE.exists() else {}
SRGB = ImageCms.createProfile('sRGB')
FILES = {p.name.split('_')[1][:8]: p for p in SRC.iterdir() if '~mv2' in p.name}


def load(key):
    im = Image.open(FILES[key])
    icc = im.info.get('icc_profile')
    im = ImageOps.exif_transpose(im).convert('RGB')
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        if 'sRGB' not in ImageCms.getProfileDescription(src):
            im = ImageCms.profileToProfile(im, src, SRGB, renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC, outputMode='RGB')
    # plus rien de l'original : ni EXIF (date, appareil, position GPS), ni XMP, ni profil
    clean = Image.new('RGB', im.size)
    clean.paste(im)
    return clean


def width(im, w):
    """Réduit à `w` px de large ; n'agrandit jamais."""
    return im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def ratio(im, r):
    """Recadre au centre au rapport largeur / hauteur `r` (3/4, 4/3, 3/2)."""
    w, h = im.size
    if abs(w / h - r) < 0.004:
        return im
    if w / h > r:
        nw = round(h * r)
        x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = round(w / r)
    y = (h - nh) // 2
    return im.crop((0, y, w, y + nh))


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
    print(f'{name:<6} {im.width:>5}x{im.height:<5} → {", ".join(str(w) for w in widths)}  {(OUT / f"{name}.avif").stat().st_size // 1024} Ko')


PORTRAIT = (1200, 720, 480)
LANDSCAPE = (1600, 1000, 640)


def photo(name, key, crop=None, r=None, widths=None, cap=None, q=58):
    im = load(key)
    if crop:
        im = im.crop(crop)
    if r:
        im = ratio(im, r)
    # les originaux agrandis dans Photoshop : jamais plus de `cap` px de large
    if cap:
        im = width(im, cap)
    export(name, im, widths or (PORTRAIT if im.height > im.width else LANDSCAPE), q=q, key=f'{key}{crop or ""}{r or ""}{cap or ""}')
    return name


# ——— l'accueil : trois douches au-dessus de trois cuisines (3:4, comme les originaux) ———
photo('h-1', '35851227')  # douche en verre, murs blancs façon marbre, une fenêtre
photo('h-2', 'a43c05b1')  # grande douche beige, trois niches, robinetterie bronze
photo('h-3', '2b8a31c8')  # douche en carreaux noirs, portes à persiennes, sol en terre cuite
photo('h-4', '24e621d6')  # cuisine blanche, grand îlot, quatre tabourets
photo('h-5', '039f590f')  # cuisine blanche, bar, suspensions
photo('h-6', 'f9133e0e')  # placards blancs, évier sous la fenêtre

# ——— les salles de bain : une rangée par type (3:4) ———
photo('s-1', 'da40373a')  # douche avec banc et bande de mosaïque
photo('s-2', '00d66ca2')  # douche sous une fenêtre, mur de verre bleu
photo('s-3', '40b7a846')  # carreaux gris, porte de verre, sol hexagonal
photo('s-4', 'b37c5e4b')  # douche d'angle en carreaux métro
photo('v-1', '692616e9')  # double vasque grise, lustre
photo('v-2', '95dc7234')  # long meuble blanc, appliques chromées
photo('v-3', 'df64b43d')  # vasques à poser, coiffeuse, baignoire îlot
photo('v-4', 'c8af341f')  # petit meuble blanc, miroir lumineux
photo('t-1', 'b3d63c65')  # baignoire îlot, double vasque sombre, douche
photo('t-2', '1249cf71')  # baignoire-douche en carreaux bleu nuit
# baignoire îlot sous un tableau : l'original est en paysage, on garde la baignoire au centre
photo('t-3', 'b18baa8f', crop=(559, 0, 2827, 3024))
photo('t-4', '6b09947e')  # WC au papier peint doré

# ——— les cuisines (4:3) ———
photo('k-1', '957468d6')  # cuisine ouverte, îlot sombre
photo('k-2', 'a1c2d87b')  # cuisine blanche ouverte sur la salle à manger
photo('k-3', 'af074d79')  # placards sombres, îlot à deux bacs, terre cuite
# placards anthracite : le filigrane, en bas à gauche, est retiré en coupant le bas
photo('k-4', 'c185deb4', crop=(216, 0, 3816, 2700))
photo('k-5', 'fb18b4f1')  # placards gris veinés, plan en cascade
photo('k-6', 'c92b56c3')  # placards merisier, long bar

# ——— les autres pièces (4:3) ———
photo('r-1', '376bb5c7')  # dressing blanc
# bureau intégré : l'original est en portrait, on garde le bureau (4:3)
photo('r-2', '28b05193', crop=(0, 1100, 3024, 3368))
# mur TV en pierre et cheminée : filigrane en bas à gauche, retiré en coupant le bas
photo('r-3', '1d8e4d64', crop=(0, 230, 4068, 3281))
# cuisine et buanderie : agrandie à 5 600 px dans Photoshop ; filigrane en bas, retiré en coupant le bas
photo('r-4', 'ac7cc287', crop=(334, 0, 5266, 3700), cap=1600)

# ——— dehors : le jardin (Canon, 3:2) ———
photo('o-1', '998a5669', widths=(2400, 1600, 1000, 640))  # cuisine d'été sous la pergola
photo('o-2', '5771923b')  # foyer sur le sable
photo('o-3', 'e78c2bf2')  # piscine, spa, salon sous la pergola

# ——— la construction neuve et le commercial ———
photo('n-1', 'ad7ed1f0', widths=(1007, 640))  # fermes en bois sur blocs de béton (l'original fait 1 007 px)
# la capture de la story Instagram : sans les bandes noires du haut et du bas (l'original fait 660 px)
photo('n-2', 'a879933a', crop=(0, 130, 660, 1304), widths=(660, 440))
photo('n-3', 'da5eb467')  # salon de coiffure

# ——— la flotte : leurs camionnettes (l'original fait 1 280 px) ———
photo('f-1', 'dec567b4', widths=(1280, 800, 520))

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
