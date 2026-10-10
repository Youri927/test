"""Planches de présentation du nouveau site, en anglais pour le client, à qui elles s'adressent (« your »).

Le site actuel est derrière une vérification Cloudflare qui bloque les navigateurs automatisés : pas de capture
du site en ligne. La planche des tarifs montre leur propre image de tarifs (relevée sur le CDN de Wix) face au
nouveau panneau des prix.

Les polices sont celles du site, en TTF statiques pour Pillow (fontTools, varLib.instancer, depuis les woff2 de vendor/fonts) :
Unbounded-Bold (700) et -Black (900) pour les titres, Figtree-Regular (400), -Medium (500) et -Bold (700) pour le texte.

    python3 -I tools/boards.py <captures du nouveau site> <image de tarifs de leur site> <dossier des TTF>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SHOTS, OLD_PRICES, TTF = (Path(a) for a in sys.argv[1:4])
OUT = Path(__file__).resolve().parent.parent / 'boards'
OUT.mkdir(exist_ok=True)
# les couleurs du site : le sable, le bleu-vert profond, le texte secondaire, le turquoise, le corail, le filet
BG, INK, SOFT, GULF, SUN, LINE = (244, 238, 228), (5, 42, 48), (63, 90, 94), (53, 196, 204), (255, 106, 76), (214, 208, 196)
SUB = 'coastalcreationspoolsandlagoons.com, website redesign concept, October 2026'


FILES = {'Light': 'Unbounded-Black', 'Display': 'Unbounded-Bold', 'Regular': 'Figtree-Regular', 'Medium': 'Figtree-Bold', 'Semibold': 'Figtree-Bold'}


def font(name, size):
    return ImageFont.truetype(str(TTF / f'{FILES[name]}.ttf'), size)


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
    d.ellipse((x, y + 9, x + 14, y + 23), fill=GULF)
    d.text((x + 26, y - 2), label, font=font('Medium', 27), fill=INK)
    if sub:
        d.text((x + 26, y + 34), sub, font=font('Regular', 21), fill=SOFT)
    top = y + 80
    d.rectangle((x - 1, top - 1, x + w, top + h), outline=LINE, width=1)
    board.paste(shot, (x, top))
    return top + h


def header(d, pad, title, sub):
    d.text((pad, 44), title, font=font('Light', 64), fill=INK)
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


# l'accueil : leur construction de Bradenton en plein écran, le titre et le devis par-dessus
row('accueil.jpg', [
    (A('d-top.png'), 'On a computer', 'A new pool you built in Bradenton, in full resolution', None),
    (A('m-top.png'), 'On a phone', 'Same pool, quote at hand', None),
], [1180, 340], 'Opening on your own work', SUB)

grid('construction.jpg', [
    ('d-build-0.png', 'The screen holds still', 'Scroll, and the build moves on: plan, dig, steel, shell, tile, plaster, water'),
    ('d-build-1.png', 'Step 6, the gunite shell', 'Each stage with one of your own job photos; the bar shows where you are'),
], 2, 900, 'Eleven steps, six to twelve weeks', 'Your build process page, as a job site you watch go up', crop=(0.08, 1))

grid('renovations.jpg', [
    ('d-reno.png', 'Before. After.', 'Every photo from one of your jobs'),
    ('d-holmes.png', 'Holmes Beach', 'The result large, the “before” beside it, drifting as you scroll'),
    ('d-commercial.png', 'Port Charlotte, commercial', 'From the old surface to new plaster'),
    ('d-dates.png', 'Manatee County, three dates', 'May 20, June 4 and June 8, 2026, from your own photos'),
], 2, 900, 'Renovations, photographed on the job', 'Every project photo is yours; the finish swatches are Stonescapes images, labeled as such')

old = Image.open(OLD_PRICES).convert('RGB')
row('tarifs-fuites.jpg', [
    (old, 'Before', 'Your prices, inside an image: Google and screen readers cannot read them', None),
    (A('d-prices.png'), 'After', 'The same prices in plain text and large type, with a calculator and the booking button', None),
], [900, 860], 'Your leak prices, readable at last', SUB)

grid('sections.jpg', [
    ('d-intro.png', 'What you do, in one sentence', 'The words light up as you read down the page'),
    ('d-cards-2.png', 'Four things you do well', 'New pools, renovations, leak detection, storms: four cards that stack as you scroll'),
    ('d-finish.png', 'Pick your water color', 'The six Stonescapes finishes: pick a name, the swatch changes'),
    ('d-storm.png', 'From green to blue', 'Your storm recovery in Bradenton, the three photos revealed in order'),
    ('d-about.png', 'We won’t stop until it’s right', 'Owen and Alberto, your standards, your years in the trade'),
    ('d-licenses.png', 'Licensed and insured', 'Every license with a way to check it, and the BBB A+'),
    ('d-area.png', 'Ten counties, Citrus to Charlotte', 'Your towns sliding by, then every county and town from your pages'),
    ('d-contact-2.png', 'Let’s build your backyard paradise', 'Call or text, your two request forms, Lyon Financial'),
], 2, 900, 'The rest of the page', 'Real content only: your texts, prices, photos, licenses and contacts, nothing invented')

phones = [('m-top.png', 'Home'), ('m-cards.png', 'What you do'), ('m-build.png', 'Eleven steps'), ('m-reno.png', 'Renovations'),
          ('m-leaks.png', 'Leak pricing'), ('m-about.png', 'About'), ('m-contact.png', 'Contact'), ('m-menu.png', 'Menu')]
pad, gap, w = 80, 40, 390
h = height(A(phones[0][0]), w)
W = pad * 2 + w * 4 + gap * 3
b = Image.new('RGB', (W, 226 + 2 * (80 + h) + gap + pad), BG)
header(ImageDraw.Draw(b), pad, 'On a phone', 'Call, text and free quote stay one tap away at the bottom of the screen')
for i, (f, lab) in enumerate(phones):
    panel(b, A(f), (pad + (i % 4) * (w + gap), 226 + (i // 4) * (80 + h + gap)), w, lab, '')
b.save(OUT / 'telephone.jpg', quality=86)
print('✓ telephone.jpg', b.size)

# chiffres mesurés (voir README) : Lighthouse sur la version en ligne (dist-web) servie en local et compressée, trois passages
# sur téléphone ; le site actuel bloque les outils automatisés (vérification Cloudflare) : pas de mesure possible
rows = [
    ('Performance on a phone (Lighthouse)', 'not measurable*', '95'),
    ('Performance on a computer', 'not measurable*', '100'),
    ('Accessibility, best practices, SEO', 'not measurable*', '100, 100, 100'),
    ('Leak prices readable by Google', 'no, inside an image', 'yes'),
    ('Generated images shown as projects', '2 (a ChatGPT file, a “Designer” file)', '0'),
    ('Testimonials', '3 template texts (one for a house painter)', 'removed'),
    ('Contractor license', 'footer only', 'with a link to check it'),
    ('Typos', 'Gaurantee, Creational, Sumpter, Citus…', 'fixed'),
]
W, pad = 1900, 80
b = Image.new('RGB', (W, 300 + len(rows) * 92 + 140), BG)
d = ImageDraw.Draw(b)
header(d, pad, 'Measured, and fixed', 'Lighthouse on the new site served like on Netlify: three runs on a phone, same settings on a computer')
cb, ca = W - pad - 1060, W - pad - 470
y = 250
d.text((cb, y), 'Current site', font=font('Medium', 24), fill=SOFT)
d.text((ca, y), 'New site', font=font('Medium', 24), fill=INK)
y += 50
for label, before, after in rows:
    d.line((pad, y, W - pad, y), fill=LINE, width=2)
    d.text((pad, y + 28), label, font=font('Regular', 29), fill=INK)
    d.text((cb, y + 29), before, font=font('Regular', 27), fill=SOFT)
    d.ellipse((ca - 30, y + 39, ca - 16, y + 53), fill=GULF)
    if len(after) > 14:
        d.text((ca, y + 28), after, font=font('Medium', 29), fill=INK)
    else:
        d.text((ca, y + 18), after, font=font('Light', 40), fill=INK)
    y += 92
d.line((pad, y, W - pad, y), fill=LINE, width=2)
d.text((pad, y + 30), '* The current site sits behind a Cloudflare check that blocks automated browsers, so it cannot be measured the same way.', font=font('Regular', 22), fill=SOFT)
b.save(OUT / 'chiffres.jpg', quality=90)
print('✓ chiffres.jpg', b.size)
