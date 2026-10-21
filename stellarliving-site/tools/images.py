"""Export des photos du site en AVIF, jamais agrandies, avec leur date de prise de vue.

Sources : les originaux des photos de leurs pages de projets, téléchargés depuis le CDN de Wix
(static.wixstatic.com/media/<identifiant>) dans un dossier par page (g-pelican-bay_breakwater_815000202…), plus les
couvertures de la liste des projets (cover/). On désigne une photo par le début de son identifiant (« 9035c29a »). Le
tri (leurs photos, gardées ; les photos d'annonces immobilières à filigrane SWFLAMLS, écartées) est dans ANALYSE.md.

    python3 -I tools/images.py <dossier des téléchargements> [--force]

Écrit src/img/*.avif, data/photos.json (largeur et hauteur de chaque fichier) et data/sets.json (pour chaque
reportage : ses photos dans l'ordre de prise de vue, avec la date et l'heure lues dans le fichier, et la légende).

- Couleurs : les photos d'iPhone sont en Display P3 ; elles sont converties en sRGB (rendu colorimétrique relatif),
  sinon elles seraient délavées dans certains navigateurs. Aucune autre retouche : ni filtre, ni redressement.
- Orientation : appliquée d'après l'EXIF (une photo de 2017 est enregistrée couchée).
- Tailles : les photos en portrait (1920 × 2560 pour la plupart) sortent en 1200, 800 et 480 px de large, la photo
  d'accueil aussi en 1440 ; les photos en paysage en 1600, 1000 et 600. Jamais plus grandes que l'original. La plus
  grande porte le nom seul.
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
# d'où vient chaque fichier déjà exporté : on ne le réécrit que si sa source ou sa taille a changé
SOURCES_FILE = ROOT / 'data/sources.json'
SOURCES = json.loads(SOURCES_FILE.read_text()) if SOURCES_FILE.exists() else {}
SRGB = ImageCms.createProfile('sRGB')
FILES = {p.name[7:15]: p for p in SRC.rglob('661203_*') if p.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp')}


def load(key):
    file = FILES[key]
    im = Image.open(file)
    exif = im.getexif()
    shot = exif.get(36867) or exif.get_ifd(0x8769).get(36867) or exif.get(306)
    icc = im.info.get('icc_profile')
    im = ImageOps.exif_transpose(im).convert('RGB')
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        if 'sRGB' not in ImageCms.getProfileDescription(src):
            im = ImageCms.profileToProfile(im, src, SRGB, renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC, outputMode='RGB')
    return im, (str(shot) if shot else None)


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
        # déjà exporté (même source, même taille) : on garde le fichier ; « --force » réécrit tout
        if FORCE or not dst.exists() or SOURCES.get(n) != key or Image.open(dst).size != out.size:
            out.save(dst, 'AVIF', quality=q, speed=4)
            SOURCES[n] = key
        SIZES[n] = [out.width, out.height]
    print(f'{name:<10} {im.width:>5}x{im.height:<5} → {", ".join(str(w) for w in widths)}  {(OUT / f"{name}.avif").stat().st_size // 1024} Ko')


def photo(name, key, crop=None, extra=()):
    im, shot = load(key)
    if crop:
        im = im.crop(crop)
    portrait = im.height > im.width
    export(name, im, (1200, 800, 480, *extra) if portrait else (1600, 1000, 600, *extra), key=f'{key}{crop or ""}')
    return shot


def series(set_id, prefix, items):
    """Un reportage : (identifiant, légende) dans l'ordre de prise de vue."""
    out = []
    for i, (key, caption) in enumerate(items, 1):
        name = f'{prefix}-{i:02d}'
        shot = photo(name, key)
        out.append({'name': name, 'shot': shot, 'caption': caption})
    shots = [p['shot'] for p in out if p['shot']]
    if shots != sorted(shots):
        raise SystemExit(f'{set_id} : les photos ne sont pas dans l’ordre de prise de vue')
    SETS[set_id] = out


# ——— l'accueil : la cuisine de Breakwater aux tabourets bleus (novembre 2024), aussi en 1440 de large ———
photo('hero', 'ba8cca2c', extra=(1440,))

# ——— Breakwater, Pelican Bay, 3 novembre 2025 : le condo entier, de 10:38 à 10:45 (24 photos du même passage ; la
# photo d'un placard prise en mars 2026 est laissée de côté, elle n'est pas de cette visite) ———
series('bw25', 'bw25', [
    ('9035c29a', 'Kitchen'),
    ('34c9080a', 'Kitchen'),
    ('5fdca4ed', 'Breakfast bay'),
    ('13791d03', 'Refrigerator and wall ovens'),
    ('c532be9b', 'Kitchen, toward the windows'),
    ('609a6fa3', 'Kitchen'),
    ('b04b842b', 'Tall cabinets'),
    ('64d557d6', 'Paneled refrigerator'),
    ('0b2c01d4', 'Cooktop and hood cabinet'),
    ('a8f79f3f', 'Cooktop wall'),
    ('fee41346', 'Appliance garage'),
    ('c58de136', 'Island sink'),
    ('4ce67f4e', 'Peninsula'),
    ('f9ed96df', 'Front door'),
    ('5b7e94d5', 'Lanai'),
    ('72078897', 'Bath and closet doors'),
    ('352f8ef7', 'Linen cabinet'),
    ('b309c0fb', 'Vanity'),
    ('9fe13b86', 'Vanity and shower'),
    ('209016ff', 'Glass shower between two vanities'),
    ('994b8cda', 'Shower floor'),
    ('0e1c59d8', 'Shower niche and fixtures'),
    ('b8242ab4', 'Shower and vanities'),
    ('80073462', 'Shower and vanities'),
])

# ——— Breakwater, Pelican Bay, 1er novembre 2024 (un logement habité) ———
series('bw24', 'bw24', [
    ('f0454455', 'Kitchen'),
    ('d0e89a40', 'Kitchen and refrigerator'),
    ('ba8cca2c', 'Island'),
    ('0b608898', 'Island and wine refrigerator'),
    ('66ec2ad4', 'Island seating'),
    ('2fdaeb70', 'Kitchen, from the end of the island'),
    ('aced4ae9', 'Dining area'),
    ('2a18c33f', 'Laundry sink'),
    ('96ab624c', 'Tub and shower'),
    ('c016ece1', 'Vanity'),
    ('a59c9728', 'Bath'),
    ('1b6e7e7d', 'Island and range'),
    ('844bf24f', 'Island and range'),
    ('4fae10f5', 'Island and range'),
])

# ——— Breakwater, Pelican Bay, 14 novembre 2024 : leur seule photo sur une page faite de photos d'annonce (SWFLAMLS,
# écartées), les toilettes d'invités au papier peint de palmiers ———
series('bw15', 'bw15', [('25e1e735', 'Powder room')])

# ——— le club-house de Breakwater, 18 décembre 2024, de 13:28 à 13:29 ———
series('bwc', 'bwc', [
    ('2bb630d7', 'Lounge'),
    ('4a160364', 'Lounge'),
    ('dc343667', 'Kitchen'),
    ('8d824d6c', 'Kitchen'),
    ('f9e62dac', 'Kitchen'),
    ('87e2d89d', 'Lounge, toward the pool'),
    ('c09e5520', 'Lounge'),
    ('28d05cc7', 'Lounge, toward the pool'),
    ('7a8d7f61', 'Lounge'),
    ('d1aa4f86', 'Lounge'),
    ('d6f5434e', 'Dining room'),
    ('cce3b8a9', 'Dining room'),
    ('66162421', 'Dining room'),
    ('1f7ac2f6', 'Dining room'),
    ('6f1d632b', 'Dining room'),
    ('1ff6e3ce', 'Dining room'),
])

# ——— Breakwater, Pelican Bay, de décembre 2021 à août 2022 : deux salles de bain, puis la cuisine et le bar ———
# ——— les autres chantiers : leurs galeries, une sélection dans l'ordre de prise de vue ———
series('bw22', 'bw22', [
    ('ed785de1', 'Shower and vanity'),
    ('9245eb7e', 'Bath with an angled glass shower'),
    ('654b58b0', 'Bath'),
    ('2089c8a1', 'Vanity and toilet room'),
    ('87dc4b18', 'Kitchen and dining area'),
    ('18efa711', 'Bar under a glass block window'),
    ('58affa20', 'Kitchen and living room'),
    ('e543d24f', 'Kitchen island'),
    ('82ae5dcd', 'Kitchen'),
])
series('bw7', 'bw7', [
    ('e0f0ee24', 'Kitchen'),
    ('623c9d2e', 'Kitchen sink under the window'),
    ('6376fe1a', 'Bar with a wine refrigerator'),
    ('678f3595', 'Glass shower'),
    ('7fca9140', 'Vanity with a makeup counter'),
    ('ad385101', 'Vanity with a makeup counter'),
    ('88ea30c3', 'Dining room'),
    ('0912c66b', 'Kitchen'),
    ('c38005a7', 'Kitchen counter and stools'),
    ('f19a8477', 'Second bath, vanity'),
    ('f656950a', 'Second bath, glass shower'),
    ('a9c875f9', 'Laundry room'),
])
# Trieste, Bay Colony, 20 octobre 2022, de 13:23 à 13:26 (une vue prise deux fois à 8 s d'écart, gardée une fois ; trois
# photos sans date, en double ou plus petites, laissées de côté)
series('tr', 'tr', [
    ('7c53464e', 'Shower with a window over Naples'),
    ('65436382', 'Double vanity'),
    ('9d9b797b', 'Primary bath'),
    ('4cea8918', 'Linen cabinets'),
    ('08eac0d9', 'Makeup vanity and toilet room'),
    ('08342314', 'Shower window and bench'),
    ('9cdcff20', 'Shower bench by the window'),
    ('0364a75d', 'Rain shower head'),
    ('da442b2e', 'Shower, from the entry'),
])
series('hl', 'hl', [
    ('5ee98dd1', 'Kitchen island'),
    ('ebf60180', 'Kitchen and living room'),
    ('6c78503a', 'Kitchen, from the refrigerator'),
    ('fd655bb5', 'Laundry'),
    ('d9ed542e', 'Pantry cabinets'),
    ('bf5b5a0c', 'Kitchen and living room'),
    ('f28c50cc', 'Shower with a glass mosaic stripe'),
    ('ceb0e6da', 'Bedroom'),
    ('c32e022e', 'Vanity framed in glass mosaic'),
    ('a8cccffb', 'Shower with a window'),
    ('bf398e2b', 'Walk-in closet'),
    ('1194d026', 'Island and dishwasher'),
    ('4e1bc52b', 'Mirror framed in glass mosaic'),
])
series('gt', 'gt', [
    ('7c166a07', 'Kitchen island'),
    ('d97cb73f', 'Kitchen, from the hall'),
    ('61145a3b', 'Kitchen between two columns'),
    ('96986e59', 'Bath vanity'),
    ('dee988b8', 'Shower with a pebble floor'),
    ('6bd8685a', 'Living room'),
    ('dbacd2d7', 'Shower and vanity'),
    ('019cf1e0', 'Backsplash and cooktop'),
])
# ——— Imperial Golf Club, 19 avril 2023 : leurs quatre photos (les vingt autres de la page sont des photos
# d'annonce SWFLAMLS, écartées) ———
series('im', 'im', [
    ('2213188f', 'Walk-in shower'),
    ('8f2a1178', 'Frosted glass between the shower and the toilet'),
    ('6423d833', 'Shower, toward the door'),
    ('e928f7dc', 'Frosted glass panel, toward the door'),
])
series('pi', 'pi', [
    ('7b7a7e3c', 'Kitchen under the arch'),
    ('80ca3fa9', 'Kitchen island'),
    ('e5d5d136', 'Kitchen'),
    ('b6220066', 'Island and great room'),
    ('c6e71d17', 'Island seating'),
    ('4d764ecf', 'Great room'),
    ('b76ddd76', 'Bar'),
    ('93282cf5', 'Bar, toward the great room'),
    ('a9ecb42e', 'Primary bath with a freestanding tub'),
    ('bd6461e6', 'Walk-in shower'),
    ('592f7bec', 'Shower fixtures'),
    ('a82a9e69', 'Tub and shower'),
])

# ——— les cages de piscine : leurs photos datées (2017, 2022, 2024), puis celles sans date, plus petites (la pose,
# des ouvriers sur l'échelle, des immeubles aux lanais grillagés ; une photo en double sur leur page, gardée une fois) ———
series('se', 'se', [
    ('801d6e1e', 'Pool enclosure'),
    ('0ccf67c2', 'Pool cage on the lake'),
    ('71ed664c', 'Pool cage on the lake'),
    ('4c6d81a7', 'Pool and spa cage on the lake'),
    ('76174952', 'Rescreening a pool cage'),
    ('ca244499', 'Screen work on the cage roof'),
    ('db5daab0', 'White pool cage'),
    ('57e200a1', 'Pool and spa under a white cage'),
    ('520f5f5b', 'Screened lanai along the arches'),
    ('c04d7cc3', 'Arched screen door'),
    ('8b126652', 'Screened lanais on a condo building'),
    ('a5dc8d1a', 'Screened lanais on a condo building'),
])

(ROOT / 'data').mkdir(exist_ok=True)
(ROOT / 'data/photos.json').write_text(json.dumps(SIZES, indent=1, sort_keys=True))
(ROOT / 'data/sets.json').write_text(json.dumps(SETS, indent=1))
SOURCES_FILE.write_text(json.dumps({k: v for k, v in SOURCES.items() if k in SIZES}, indent=1, sort_keys=True))
print(len(SIZES), 'fichiers,', sum(len(s) for s in SETS.values()), 'photos dans', len(SETS), 'reportages')
