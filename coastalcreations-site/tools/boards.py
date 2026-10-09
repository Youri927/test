"""Planches de présentation du nouveau site, en anglais pour le client, à qui elles s'adressent (« your »).

Le site actuel est derrière une vérification Cloudflare qui bloque les navigateurs automatisés : pas de capture
du site en ligne. La planche des tarifs montre leur propre image de tarifs (relevée sur le CDN de Wix) face au
nouveau panneau des prix.

La police est celle du site, Jost, en TTF statiques pour Pillow (fontTools, varLib.instancer, depuis le woff2 du site) :
Jost-Light (300), -Regular (400), -Medium (500), -Semibold (600).

    python3 -I tools/boards.py <captures du nouveau site> <image de tarifs de leur site> <dossier des TTF>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SHOTS, OLD_PRICES, TTF = (Path(a) for a in sys.argv[1:4])
OUT = Path(__file__).resolve().parent.parent / 'boards'
OUT.mkdir(exist_ok=True)
# les couleurs du site : l'ombre fraîche, le graphite, le texte secondaire, l'eau du Golfe, le soleil, le joint
BG, INK, SOFT, GULF, SUN, LINE = (237, 243, 241), (20, 33, 31), (75, 92, 89), (12, 118, 126), (246, 195, 68), (216, 224, 221)
SUB = 'coastalcreationspoolsandlagoons.com, website redesign concept, October 2026'


def font(name, size):
    return ImageFont.truetype(str(TTF / f'Jost-{name}.ttf'), size)


A = lambda n: Image.open(SHOTS / n)


def panel(board, im, xy, w, label, sub, crop=None):
    """Une capture avec son titre ; crop = (haut, bas) en fraction de la hauteur de la capture."""
    im = im.convert('RGB')
    if crop:
        im = im.crop((0, round(im.height * crop[0]), im.width, round(im.height * crop[1])))
    h = round(im.height * w / im.width)
    shot = im.resize((w, h), Image.LANCZOS)
    x, y = xy
    d = ImageDraw.Draw(board)
    d.rectangle((x, y + 10, x + 12, y + 22), fill=GULF)
    d.text((x + 26, y - 2), label, font=font('Medium', 27), fill=INK)
    if sub:
        d.text((x + 26, y + 34), sub, font=font('Regular', 21), fill=SOFT)
    top = y + 80
    d.rectangle((x - 1, top - 1, x + w, top + h), outline=LINE, width=1)
    board.paste(shot, (x, top))
    return top + h


def header(d, pad, title, sub):
    d.text((pad, 40), title, font=font('Light', 76), fill=INK)
    d.text((pad, 146), sub, font=font('Regular', 23), fill=SOFT)


def height(im, w, crop=None):
    frac = (crop[1] - crop[0]) if crop else 1
    return round(im.height * frac * w / im.width)


def row(name, items, ws, title, sub):
    """Des captures côte à côte, chacune à sa largeur : (image, titre, sous-titre, recadrage)"""
    pad, gap = 80, 56
    hs = [height(im, w, crop) for (im, _l, _s, crop), w in zip(items, ws)]
    W = pad * 2 + sum(ws) + gap * (len(items) - 1)
    b = Image.new('RGB', (W, 226 + 80 + max(hs) + pad), BG)
    header(ImageDraw.Draw(b), pad, title, sub)
    x = pad
    for (im, lab, s, crop), w in zip(items, ws):
        panel(b, im, (x, 226), w, lab, s, crop)
        x += w + gap
    b.save(OUT / name, quality=88)
    print('✓', name, b.size)


def grid(name, views, cols, w, title, sub, crop=None):
    """Des captures en grille, de même format : (fichier, titre, sous-titre)"""
    pad, gap = 80, 56
    h = height(A(views[0][0]), w, crop)
    W = pad * 2 + w * cols + gap * (cols - 1)
    rows = (len(views) + cols - 1) // cols
    b = Image.new('RGB', (W, 226 + rows * (80 + h + gap) + pad - gap), BG)
    header(ImageDraw.Draw(b), pad, title, sub)
    for i, (f, lab, s) in enumerate(views):
        panel(b, A(f), (pad + (i % cols) * (w + gap), 226 + (i // cols) * (80 + h + gap)), w, lab, s, crop)
    b.save(OUT / name, quality=86)
    print('✓', name, b.size)


# l'accueil : le premier écran, puis le mur qui s'ouvre au défilement
pad, gap = 80, 56
top, phone, steps = A('d-top.png'), A('m-top.png'), [A('d-open-1.png'), A('d-open-2.png'), A('d-open-3.png')]
w1, w2 = 1180, 420
h1 = max(height(top, w1), height(phone, w2, (0, 0.62)))
ws = (w1 + w2 + gap - 2 * gap) // 3
h2 = height(steps[0], ws)
W = pad * 2 + w1 + w2 + gap
b = Image.new('RGB', (W, 226 + 80 + h1 + 72 + 80 + h2 + pad), BG)
header(ImageDraw.Draw(b), pad, 'Your pool, through a breeze-block wall', SUB)
panel(b, top, (pad, 226), w1, 'On a computer', 'Your Holmes Beach pool, seen through the screen blocks of Gulf Coast modern houses')
panel(b, phone, (pad + w1 + gap, 226), w2, 'On a phone', 'The same wall, three blocks wide', (0, 0.62))
y2 = 226 + 80 + h1 + 72
for i, (im, lab, s) in enumerate(zip(steps, ['As you scroll', 'The openings widen', 'Until the wall is gone'], ['', '', 'And the pool is all you see'])):
    panel(b, im, (pad + i * (ws + gap), y2), ws, lab, s)
b.save(OUT / 'accueil.jpg', quality=88)
print('✓ accueil.jpg', b.size)

grid('construction.jpg', [
    ('d-build-0.png', 'The title opens the row', 'Drag it, swipe it, or use the arrows'),
    ('d-build-1.png', 'Steps 6 to 9', 'Each stage with your own job photo; the line below shows where you are'),
], 2, 900, 'Eleven steps, six to twelve weeks', 'Your build process page, as one row of job-site photos', crop=(0.07, 0.93))

grid('renovations.jpg', [
    ('d-holmes.png', 'Holmes Beach, before and after', 'The “before” laid on the result like a print'),
    ('d-manatee.png', 'Manatee County, three dates', 'May 20, June 4 and June 8, 2026, from your own photos'),
    ('d-commercial.png', 'Port Charlotte, commercial', 'From the old surface to new plaster'),
    ('d-finishes.png', 'Choosing your pool finish', 'The six Stonescapes finishes: point at a name to see it from the ledge to the deep end'),
], 2, 900, 'Renovations, photographed on the job', 'Every project photo is yours; the finish swatches are Stonescapes images, labeled as such')

old = Image.open(OLD_PRICES).convert('RGB')
row('tarifs-fuites.jpg', [
    (old, 'Before', 'Your prices, inside an image: Google and screen readers cannot read them', None),
    (A('d-calc.png'), 'After', 'The same prices in plain text, like a sign, with a calculator and the booking button', None),
], [900, 860], 'Your leak prices, readable at last', SUB)

grid('sections.jpg', [
    ('d-services.png', 'What you do, in one sentence', 'Each part of it leads to its section'),
    ('d-storm-2.png', 'Equipment above the surge', 'Raised pads after the 2024 hurricanes, and a storm recovery in Bradenton'),
    ('d-about.png', 'We won’t stop until it’s right', 'Owen and Alberto, your standards, your guarantee'),
    ('d-licenses.png', 'Licensed and insured', 'Every license with a way to check it, and the BBB A+'),
    ('d-area.png', 'Ten counties, Citrus to Charlotte', 'Every county and town from your pages, as one sentence'),
    ('d-contact-2.png', 'Every way to reach you', 'Call or text, your two request forms, Lyon Financial, then the footer'),
], 2, 900, 'The rest of the page', 'Real content only: your texts, prices, photos, licenses and contacts, nothing invented')

phones = [('m-top.png', 'Home'), ('m-services.png', 'What you do'), ('m-build.png', 'Eleven steps'), ('m-reno.png', 'Renovations'),
          ('m-leaks.png', 'Leak pricing'), ('m-about.png', 'About'), ('m-contact.png', 'Contact'), ('m-menu.png', 'Menu')]
pad, gap, w = 80, 40, 390
h = height(A(phones[0][0]), w)
W = pad * 2 + w * 4 + gap * 3
b = Image.new('RGB', (W, 226 + 2 * (80 + h) + gap + pad), BG)
header(ImageDraw.Draw(b), pad, 'On a phone', 'Menu, call, text and free quote stay one tap away at the bottom of the screen')
for i, (f, lab) in enumerate(phones):
    panel(b, A(f), (pad + (i % 4) * (w + gap), 226 + (i // 4) * (80 + h + gap)), w, lab, '')
b.save(OUT / 'telephone.jpg', quality=86)
print('✓ telephone.jpg', b.size)

# chiffres mesurés (voir README) : Lighthouse, nouveau site servi en local et compressé, médiane de trois passages
# sur téléphone ; le site actuel bloque les outils automatisés (vérification Cloudflare) : pas de mesure possible
rows = [
    ('Performance on a phone (Lighthouse)', 'not measurable*', '96'),
    ('Performance on a computer', 'not measurable*', '100'),
    ('Accessibility, best practices, SEO', 'not measurable*', '100, 100, 100'),
    ('Leak prices readable by Google', 'no, inside an image', 'yes'),
    ('Generated images shown as projects', '2 (a ChatGPT file, a “Designer” file)', '0'),
    ('Testimonials', '3 template texts (one for a house painter)', 'removed'),
    ('Contractor license', 'footer only', 'near the top, checkable in About'),
    ('Typos', 'Gaurantee, Creational, Sumpter, Citus…', 'fixed'),
]
W, pad = 1900, 80
b = Image.new('RGB', (W, 300 + len(rows) * 92 + 140), BG)
d = ImageDraw.Draw(b)
header(d, pad, 'Measured, and fixed', 'Lighthouse on the new site served like on Netlify: median of three runs on a phone, same settings on a computer')
cb, ca = W - pad - 1060, W - pad - 470
y = 250
d.text((cb, y), 'Current site', font=font('Medium', 24), fill=SOFT)
d.text((ca, y), 'New site', font=font('Medium', 24), fill=INK)
y += 50
for label, before, after in rows:
    d.line((pad, y, W - pad, y), fill=LINE, width=2)
    d.text((pad, y + 28), label, font=font('Regular', 29), fill=INK)
    d.text((cb, y + 29), before, font=font('Regular', 27), fill=SOFT)
    d.rectangle((ca - 30, y + 40, ca - 18, y + 52), fill=GULF)
    if len(after) > 14:
        d.text((ca, y + 28), after, font=font('Medium', 29), fill=INK)
    else:
        d.text((ca, y + 16), after, font=font('Light', 48), fill=INK)
    y += 92
d.line((pad, y, W - pad, y), fill=LINE, width=2)
d.text((pad, y + 30), '* The current site sits behind a Cloudflare check that blocks automated browsers, so it cannot be measured the same way.', font=font('Regular', 22), fill=SOFT)
b.save(OUT / 'chiffres.jpg', quality=90)
print('✓ chiffres.jpg', b.size)
