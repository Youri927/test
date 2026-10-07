"""Exporte les photos du site actuel de Frontline Pools en WebP pour la maquette (src/img/).

Sources : les images de frontlinepools.com, téléchargées à la plus grande taille proposée par leur serveur
(dossiers full/ : version entière, raw/ : version carrée « fill » 2000 px quand il n'y a pas d'autre version).
Les plus petites ont d'abord été agrandies ×2 par super-résolution (EDSR, OpenCV dnn_superres) dans sr/.
Aucune retouche : recadrage, mise à l'échelle et export seulement.

    python3 tools/images.py <dossier contenant full/ raw/ sr/>
"""
import sys
from pathlib import Path

from PIL import Image

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / 'src' / 'img'
OUT.mkdir(parents=True, exist_ok=True)

KEYS = {
    '729qr0': '729qr0uvb3do43gkmhze86516oj8', 'om3w9i': 'om3w9ihwbxtlibsz9f23oxeowaso', 'zcyn5r': 'zcyn5rh9cm7jq6v0w1ctzfqbycp5',
    'oxcy2i': 'oxcy2i4jm8550p0gz3nzkkskghk5', 'gdyrtl': 'gdyrtl95gg04c749bknelr79igoz', 'whovd6': 'whovd659pyywxnto1fpis6rntqqs',
    'vrf0vw': 'vrf0vwmce13n0ufqhpp15cf9b1zr', 'eqwyex': 'eqwyexsa8kq2hgb6pr627uctennr', 'h6i7vn': 'h6i7vnx8nzrqzknsit6j6fcujr6v',
    '4hwgdn': '4hwgdnobl2x4f5xec6e0yhdcc95g', 'sezppk': 'sezppk1dn0yb3choiwh9c7f74sae', 'lh1iqp': 'lh1iqpct8m4m6tbtltgemb3ew6sy',
    'hx8deu': 'hx8deu63vxjr4068cmzqotc3yn4a', '1mhwwc': '1mhwwcx93dlobgposi0q1b25tlrw', 'zuy0bp': 'zuy0bpukhn7rchsb7t4qkn1zg0d8',
    'k08e7i': 'k08e7imbo1nytajjsnrwuap072bm', 'k3u354': 'k3u35489e4stj99j2sq9cwuo679u', 'ejsdnj': 'ejsdnjrqs3xpzb2ogym2cs7q6cxd',
}


def load(short):
    """La meilleure version disponible : agrandie (sr/), entière (full/), sinon carrée (raw/)."""
    for p in (SRC / 'sr' / f'{short}.jpg', SRC / 'full' / KEYS[short], SRC / 'raw' / KEYS[short]):
        if p.exists():
            im = Image.open(p).convert('RGB')
            if short == 'h6i7vn' and p.parent.name != 'sr':
                im = im.crop((6, 2, 940, 714))  # la capture d'écran d'origine a un liseré noir
            return im, p.parent.name
    raise FileNotFoundError(short)


def crop_ratio(im, ratio, fy=0.5, fx=0.5):
    """Recadre au rapport largeur / hauteur demandé, centré sur (fx, fy)."""
    w, h = im.size
    if w / h > ratio:
        nw = round(h * ratio)
        x = round((w - nw) * fx)
        return im.crop((x, 0, x + nw, h))
    nh = round(w / ratio)
    y = round((h - nh) * fy)
    return im.crop((0, y, w, y + nh))


def save(im, name, width, q=80):
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    path = OUT / f'{name}.webp'
    im.save(path, 'WEBP', quality=q, method=6)
    return im.size, path.stat().st_size // 1024


JOBS = [
    # nom, source, recadrage (rapport, fy) ou None, largeur
    ('hero', '729qr0', None, 2400),
    ('tour', 'om3w9i', None, 2800),
    ('p-davis', 'zcyn5r', None, 1500),
    ('p-citrus', 'oxcy2i', None, 2000),
    ('p-south', 'gdyrtl', None, 1500),
    ('p-walden', 'whovd6', None, 1500),
    ('g-spill', 'vrf0vw', None, 1600),
    ('g-kidney', 'eqwyex', 'kidney', 1200),
    ('g-modern', 'h6i7vn', None, 1400),
    ('g-star', '4hwgdn', None, 1200),
    ('g-long', 'sezppk', None, 1600),
    ('g-spa', 'lh1iqp', None, 1020),
    ('ba1-before', 'hx8deu', (1, 0.6), 1000),
    ('ba1-after', '1mhwwc', (1, 0.6), 1000),
    ('ba2-before', 'zuy0bp', None, 1000),
    ('ba2-after', 'k08e7i', None, 1000),
    ('ba3-before', 'k3u354', (1, 0.5), 1000),
    ('ba3-after', 'ejsdnj', None, 1000),
]

for name, short, crop, width in JOBS:
    im, origin = load(short)
    if crop == 'kidney':
        # la mention « Galaxy A52 5G » en bas à gauche est retirée
        im = im.crop((0, 0, im.width, round(im.height * 0.905)))
    elif crop:
        im = crop_ratio(im, crop[0], crop[1])
    size, kb = save(im, name, width, q=78 if name in ('hero', 'tour') else 80)
    print(f'{name:12s} {short} ({origin}) -> {size[0]}x{size[1]} {kb} KB')
