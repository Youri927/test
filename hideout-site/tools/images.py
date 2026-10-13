"""Export des photos du site en AVIF, jamais agrandies.

Les sources sont les fichiers téléchargés depuis hideoutboutique.com (wp-content/uploads), rangés dans un dossier
à part : a/ (photos du cabinet, photo de groupe), team/ (portraits), ba/ (avant/après).
Écrit src/img/*.avif et data/photo-sizes.json.

    python3 -I tools/images.py <dossier des téléchargements>

Portraits : leurs médaillons ovales n'ont pas tous la même forme (largeur/hauteur de 0,55 à 0,75). On garde, dans
chaque ovale d'origine, le plus grand ovale de proportion 0,72 qui touche le haut et reste entièrement dedans ; on
recadre sur son rectangle, sur fond blanc (le fond de leur studio), et la page le découpe en ovale (border-radius).
Rien de ce qui est visible ne sort donc de l'ovale du photographe.
"""
import json
import math
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/img'
SRC = Path(sys.argv[1]).resolve()
OUT.mkdir(parents=True, exist_ok=True)


def save(im, name, q=60):
    dst = OUT / f'{name}.avif'
    im.save(dst, 'AVIF', quality=q, speed=4)
    print(f'{name:<16} {im.width:>5}x{im.height:<5} {dst.stat().st_size // 1024:>4} Ko')


def fit(im, longest):
    """Réduit si le plus grand côté dépasse `longest` ; n'agrandit jamais."""
    s = longest / max(im.size)
    return im if s >= 1 else im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)


def width(im, w):
    return im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


# ——— photos du cabinet (photographe, 2 560 px) ———
PHOTOS = {
    # le miroir rond : Lina en soin des lèvres, les lèvres dorées et les diplômes au mur (l'accueil)
    'hero': ('a/DSC_0038-scaled.jpg', 2560, 58),
    # les familles de soins
    'fam-facials': ('a/DSC_0194-scaled.jpg', 1600, 60),  # dermaplaning sous la lumière LED
    'fam-injectables': ('a/DSC_0091-scaled.jpg', 1600, 60),  # Lina et l'échographie esthétique
    'fam-lashes': ('a/DSC_0173-scaled.jpg', 1600, 60),
    'fam-pmu': ('a/DSC_0013-scaled.jpg', 1600, 60),  # maquillage permanent, le dermographe rose
    'team-group': ('a/group-pic-w-backdrop-scaled.jpg', 2560, 58),
    'team-night': ('a/DSC_0264-scaled.jpg', 1600, 60),
    'facial-steam': ('a/hideout-boutique-about.png', 450, 64),  # 450 x 640 : montrée à 300 px au plus
}
for name, (f, w, q) in PHOTOS.items():
    save(width(Image.open(SRC / f).convert('RGB'), w), name, q)

# ——— portraits ———
TEAM = {
    'p-jen': 'team/jen.png', 'p-lina': 'team/lina-2.png', 'p-jess': 'team/jess.png', 'p-diana': 'team/diana.png',
    'p-brandi': 'team/brandi.png', 'p-madison': 'team/madison.png', 'p-melanie': 'team/melanie.png',
    'p-bailey': 'team/bailey.png', 'p-priscilla': 'team/priscilla.png', 'p-eric': 'team/eric-head-shot-for-website.png',
    'p-mabel': 'team/mabel.png', 'p-lindsey': 'a/IMG_0207.png', 'p-cali': 'team/cali-website-headshot.png',
}
RATIO = 0.72


def inner_oval(W, H):
    """Plus grand ovale de proportion RATIO, tangent au haut de l'ovale inscrit dans W x H, et contenu dedans."""
    a, b = W / 2, H / 2

    def inside(a2):
        b2 = a2 / RATIO
        for i in range(721):
            t = i / 720 * 2 * math.pi
            x, y = a2 * math.cos(t), b2 + b2 * math.sin(t)  # y compté depuis le haut
            if (x / a) ** 2 + ((y - b) / b) ** 2 > 1.0005:
                return False
        return True

    lo, hi = 1.0, min(a, b * RATIO)
    for _ in range(40):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if inside(mid) else (lo, mid)
    return lo, lo / RATIO


for name, f in TEAM.items():
    im = Image.open(SRC / f).convert('RGBA')
    W, H = im.size
    a2, b2 = inner_oval(W, H)
    box = (round(W / 2 - a2), 0, round(W / 2 + a2), round(2 * b2))
    flat = Image.new('RGB', im.size, (255, 255, 255))
    flat.paste(im, mask=im.getchannel('A'))
    crop = flat.crop(box)
    save(crop.resize((600, round(600 / RATIO)), Image.LANCZOS), name, 62)

# ——— avant/après (taille d'origine, ou 1 200 px au plus sur le grand côté) ———
BA = {
    # injections, Lina Davis, NP-C
    'r-balance-1': 'ba/12D3A868-3977-4574-9C48-FA93ABE846A0.jpg',
    'r-balance-2': 'ba/391FC200-CD39-46FB-AAFE-09BB1DA8BCF4.jpg',
    'r-balance-3': 'ba/3462317F-F284-401B-B95B-480437A564FC.jpg',
    'r-balance-4': 'ba/042B8855-21D7-424B-A284-4C2AEE49F0AB.jpg',
    'r-balance-5': 'ba/3CB87EB2-9FD5-40A8-B3C2-E1BE1665B025.jpg',
    'r-chin': 'ba/DE826D49-1562-4B85-A9BF-FBDD9E3782FE.jpg',
    'r-cheek': 'ba/9AC395D5-C38C-4D2A-A20B-F7482EF589E4.jpg',
    'r-balance-full': 'ba/EBB663E3-D21F-442D-A280-73894EAF6402.jpg',
    'r-plasma-filler': 'ba/83052F30-B77D-489A-A1B7-66DA98F28831.jpg',
    'r-lips-1': 'ba/filler-by-lina-lips-5.png',
    'r-lips-2': 'ba/filler-by-lina-lips-7.png',
    'r-lips-3': 'ba/filler-by-lina-lips-8.png',
    'r-lips-4': 'ba/*-vollure-yes*',  # le nom du fichier d'origine porte le prénom de la cliente : on le retrouve sans l'écrire
    'r-lips-liplase': 'ba/liplase_filler_2.jpg',
    'r-plasma-1': 'ba/plasma_1.jpg',
    'r-plasma-2': 'ba/plasma_2.jpg',
    # peau et lasers
    'r-fotona-co2': 'ba/IMG_0639.jpg',
    'r-fotona-co2-2': 'ba/IMG_0638.jpg',
    'r-fotona-plasma': 'ba/IMG_0636.jpg',
    'r-fotona-ipl': 'ba/IMG_9697.jpg',
    'r-ipl': 'ba/IMG_9673.jpg',
    'r-microneedling': 'ba/IMG_0244.jpg',
    'r-tattoo-brows': 'ba/brows-r.png',
    'r-tattoo-lips': 'ba/lips.png',
    # cils
    'r-lash-mega': 'ba/Mega-Volume-Lashes-Results-Hideout-Boutique.jpg',
    'r-lash-volume': 'ba/Volume-Lashes-Results-Hideout-Boutique-2.jpg',
    'r-lash-hybrid': 'ba/Hybrid-Lashes-Results-Hideout-Boutique.jpg',
    'r-lash-classic': 'ba/Classic-Lashes-Results-Hideout-Boutique.jpg',
    'r-lash-lift': 'ba/Lash-lifts-Results-Hideout-Boutique.jpg',
    # maquillage permanent : Jen (JLS Beauty), Jessica (Most Beauty), Mabel
    'r-jen-lips': 'ba/Lip-Blush-Permanent-Makeup-Results-JLS-Beauty-Hideout-Boutique.png',
    'r-jen-lips-2': 'ba/Lip-Blush-Permanent-Makeup-Results-JLS-Beauty-Hideout-Boutique-3.png',
    'r-jen-brows': 'ba/Ombre-Powdered-Machine-Brows-Results-JLS-Beauty-Hideout-Boutique-2.png',
    'r-jen-microblading': 'ba/microblading-results-JLS-Beauty-Hideout-Boutique-2.png',
    'r-jess-brows': 'ba/Ombre-Powdered-Brows-Permanent-Makeup-Results-Hideout-Boutique-3.jpg',
    'r-jess-brows-2': 'ba/Ombre-Powdered-Brows-Permanent-Makeup-Results-Hideout-Boutique-6.jpg',
    'r-jess-smp': 'ba/Scalp-Micro-Pigmentation-SMP-Permanent-Makeup-Results-Hideout-Boutique.jpg',
    'r-mabel-lips': 'ba/Lip-Blushing-Permanent-Makeup-Results-Hideout-Boutique-3.jpg',
    'r-mabel-brows': 'ba/Ombre-Powder-Brows-Permanent-Makeup-Results-Hideout-Boutique.jpg',
}
for name, f in BA.items():
    path = next(SRC.glob(f)) if '*' in f else SRC / f
    save(fit(Image.open(path).convert('RGB'), 1200), name, 62)

sizes = {f.stem: list(Image.open(f).size) for f in sorted(OUT.glob('*.avif'))}
(ROOT / 'data/photo-sizes.json').write_text(json.dumps(sizes, indent=1) + '\n')
print(f'data/photo-sizes.json : {len(sizes)} images, {sum(f.stat().st_size for f in OUT.glob("*.avif")) // 1024} Ko')
