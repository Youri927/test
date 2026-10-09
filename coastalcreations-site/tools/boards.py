"""Planches de présentation du nouveau site, en anglais pour le client, à qui elles s'adressent (« your »).

Le site actuel est derrière une vérification Cloudflare qui bloque les navigateurs automatisés : pas de capture
du site en ligne. La planche des tarifs montre leur propre image de tarifs (relevée sur le CDN de Wix) face au
nouveau calculateur.

La police est celle du site, Archivo, en TTF statiques pour Pillow (fontTools, varLib.instancer) :
Archivo-Display (largeur 125 %, graisse 800), -Regular (430), -Medium (560), -Semibold (650), -Label (largeur 78 %, 620).

    python3 tools/boards.py <captures du nouveau site> <image de tarifs de leur site> <dossier des TTF>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SHOTS, OLD_PRICES, TTF = (Path(a) for a in sys.argv[1:4])
OUT = Path(__file__).resolve().parent.parent / 'boards'
OUT.mkdir(exist_ok=True)
# les couleurs du site : brume, bleu nuit du logo, texte secondaire, mosaïque cobalt, gris, filet
BG, INK, SOFT, COBALT, GREY, LINE = (238, 243, 247), (12, 36, 60), (58, 80, 104), (31, 79, 163), (160, 172, 184), (208, 218, 228)
SUB = 'coastalcreationspoolsandlagoons.com, website redesign concept, October 2026'


def font(name, size):
    return ImageFont.truetype(str(TTF / f'Archivo-{name}.ttf'), size)


A = lambda n: Image.open(SHOTS / n)


def panel(board, im, xy, w, label, sub, after=True, crop=None):
    """Une capture avec son titre ; crop = (haut, bas) en fraction de la hauteur de la capture."""
    im = im.convert('RGB')
    if crop:
        im = im.crop((0, round(im.height * crop[0]), im.width, round(im.height * crop[1])))
    h = round(im.height * w / im.width)
    shot = im.resize((w, h), Image.LANCZOS)
    x, y = xy
    d = ImageDraw.Draw(board)
    d.ellipse((x, y + 9, x + 14, y + 23), fill=COBALT if after else GREY)
    d.text((x + 26, y - 2), label, font=font('Semibold', 27), fill=INK)
    if sub:
        d.text((x + 26, y + 34), sub, font=font('Regular', 21), fill=SOFT)
    top = y + 80
    d.rectangle((x - 1, top - 1, x + w, top + h), outline=LINE, width=1)
    board.paste(shot, (x, top))
    return top + h


def header(d, pad, title, sub):
    d.text((pad, 44), title, font=font('Display', 72), fill=INK)
    d.text((pad, 146), sub, font=font('Regular', 23), fill=SOFT)


def heights(items, w):
    out = []
    for im, *_rest, crop in items:
        frac = (crop[1] - crop[0]) if crop else 1
        out.append(round(im.height * frac * w / im.width))
    return out


def row(name, items, ws, title, sub):
    """Des captures côte à côte, chacune à sa largeur : (image, titre, sous-titre, nouvelle version ?, recadrage)"""
    pad, gap = 80, 56
    hs = [heights([it], w)[0] for it, w in zip(items, ws)]
    W = pad * 2 + sum(ws) + gap * (len(items) - 1)
    b = Image.new('RGB', (W, 226 + 80 + max(hs) + pad), BG)
    header(ImageDraw.Draw(b), pad, title, sub)
    x = pad
    for (im, lab, s, after, crop), w in zip(items, ws):
        panel(b, im, (x, 226), w, lab, s, after, crop)
        x += w + gap
    b.save(OUT / name, quality=88)
    print('✓', name, b.size)


def grid(name, views, cols, w, title, sub, crop=None):
    """Des captures en grille, de même format : (fichier, titre, sous-titre)"""
    pad, gap = 80, 56
    first = A(views[0][0])
    frac = (crop[1] - crop[0]) if crop else 1
    h = round(first.height * frac * w / first.width)
    W = pad * 2 + w * cols + gap * (cols - 1)
    rows = (len(views) + cols - 1) // cols
    b = Image.new('RGB', (W, 226 + rows * (80 + h + gap) + pad - gap), BG)
    header(ImageDraw.Draw(b), pad, title, sub)
    for i, (f, lab, s) in enumerate(views):
        panel(b, A(f), (pad + (i % cols) * (w + gap), 226 + (i // cols) * (80 + h + gap)), w, lab, s, True, crop)
    b.save(OUT / name, quality=86)
    print('✓', name, b.size)


row('accueil.jpg', [
    (A('d-top.png'), 'On a computer', 'Your Holmes Beach pool, uncovered panel by panel like a screen enclosure', True, None),
    (A('m-top.png'), 'On a phone', 'The video right under the headline', True, (0, 0.62)),
], [1180, 420], 'Pools built and rebuilt', SUB)

grid('construction.jpg', [
    ('d-build-0.png', 'Steps 1 and 2', 'The page holds still while the steps scroll by'),
    ('d-build-1.png', 'Each new photo goes up panel by panel', 'Like a screen enclosure being assembled'),
    ('d-build-3.png', 'Step 6, the gunite shell', 'The step in progress opens in the list'),
    ('d-build-5.png', 'Steps 10 and 11, fill and handover', 'Your canal-front pool in Bradenton, finished'),
], 2, 900, 'Eleven steps, six to twelve weeks', 'Your build process page, illustrated with your own job photos', crop=(0.08, 0.87))

grid('renovations.jpg', [
    ('d-holmes.png', 'Holmes Beach, before and after', 'New tile and surface for the vacation rental'),
    ('d-manatee.png', 'Manatee County, three dates', 'May 20, June 4 and June 8, 2026, from your own photos'),
    ('d-finishes.png', 'Choosing your pool finish', 'The six Stonescapes finishes: hover one to see it from the ledge to the deep end'),
    ('d-storm.png', 'Equipment above the surge', 'Raised pads after the 2024 hurricanes, from your storm recovery page'),
], 2, 900, 'Real jobs, real dates', 'Every project photo is yours; the finish swatches are Stonescapes images, labeled as such')

old = Image.open(OLD_PRICES).convert('RGB')
row('tarifs-fuites.jpg', [
    (old, 'Before', 'Your prices, inside an image: Google and screen readers cannot read them', False, None),
    (A('d-leaks.png'), 'After', 'The same prices in plain text, with a calculator and the booking button', True, None),
], [900, 860], 'Your leak prices, readable at last', SUB)

grid('sections.jpg', [
    ('d-services.png', 'Built', 'New pools, 6 to 12 weeks'),
    ('d-rebuilt.png', 'Rebuilt', 'Everything else you do, and the one thing you don’t'),
    ('d-about.png', 'We won’t stop until it’s right', 'Owen and Alberto, your standards, your guarantee'),
    ('d-licenses.png', 'Proof anyone can check', 'Your years in the trade, licenses in large type, the BBB A+'),
    ('d-area.png', 'Ten counties, Citrus to Charlotte', 'Every county and town from your pages'),
    ('d-contact.png', 'Call or text', 'Your number in large type, your two request forms, Lyon Financial'),
], 2, 900, 'The rest of the page', 'Real content only: your texts, prices, photos, licenses and contacts, nothing invented')

phones = [('m-top.png', 'Home'), ('m-services.png', 'Built and rebuilt'), ('m-build.png', 'Eleven steps'), ('m-reno.png', 'Renovations'),
          ('m-finishes.png', 'Finishes'), ('m-leaks.png', 'Leak pricing'), ('m-about.png', 'About'), ('m-menu.png', 'Menu')]
pad, gap, w = 80, 40, 390
h = round(A(phones[0][0]).height * w / A(phones[0][0]).width)
W = pad * 2 + w * 4 + gap * 3
b = Image.new('RGB', (W, 226 + 2 * (80 + h) + gap + pad), BG)
header(ImageDraw.Draw(b), pad, 'On a phone', 'Text and call buttons one tap away; the steps and renovations read top to bottom')
for i, (f, lab) in enumerate(phones):
    panel(b, A(f), (pad + (i % 4) * (w + gap), 226 + (i // 4) * (80 + h + gap)), w, lab, '', True)
b.save(OUT / 'telephone.jpg', quality=86)
print('✓ telephone.jpg', b.size)

# chiffres mesurés (voir README) : Lighthouse, nouveau site servi en local et compressé, médiane de trois passages
# sur téléphone ; le site actuel bloque les outils automatisés (vérification Cloudflare) : pas de mesure possible
rows = [
    ('Performance on a phone (Lighthouse)', 'not measurable*', '92'),
    ('Performance on a computer', 'not measurable*', '100'),
    ('Accessibility, best practices, SEO', 'not measurable*', '100, 100, 100'),
    ('Leak prices readable by Google', 'no, inside an image', 'yes'),
    ('Generated images shown as projects', '2 (a ChatGPT file, a “Designer” file)', '0'),
    ('Testimonials', '3 template texts (one for a house painter)', 'removed'),
    ('Contractor license', 'footer only', 'first screen, with a link to check it'),
    ('Typos', 'Gaurantee, Creational, Sumpter, Citus…', 'fixed'),
]
W, pad = 1900, 80
b = Image.new('RGB', (W, 300 + len(rows) * 92 + 140), BG)
d = ImageDraw.Draw(b)
header(d, pad, 'Measured, and fixed', 'Lighthouse on the new site served like on Netlify: median of three runs on a phone, same settings on a computer')
cb, ca = W - pad - 1060, W - pad - 470
y = 250
d.text((cb, y), 'Current site', font=font('Semibold', 24), fill=SOFT)
d.text((ca, y), 'New site', font=font('Semibold', 24), fill=INK)
y += 50
for label, before, after in rows:
    d.line((pad, y, W - pad, y), fill=LINE, width=2)
    d.text((pad, y + 28), label, font=font('Medium', 29), fill=INK)
    d.text((cb, y + 29), before, font=font('Regular', 27), fill=SOFT)
    d.ellipse((ca - 30, y + 39, ca - 16, y + 53), fill=COBALT)
    if len(after) > 14:
        d.text((ca, y + 28), after, font=font('Semibold', 29), fill=INK)
    else:
        d.text((ca, y + 22), after, font=font('Display', 42), fill=INK)
    y += 92
d.line((pad, y, W - pad, y), fill=LINE, width=2)
d.text((pad, y + 30), '* The current site sits behind a Cloudflare check that blocks automated browsers, so it cannot be measured the same way.', font=font('Regular', 22), fill=SOFT)
b.save(OUT / 'chiffres.jpg', quality=90)
print('✓ chiffres.jpg', b.size)
