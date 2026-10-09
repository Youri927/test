"""Planches de présentation (captures du site actuel et de la nouvelle version), en anglais pour le client.

La police est celle du site, Familjen Grotesk, convertie en TTF statiques pour Pillow (fontTools, varLib.instancer) :
FamiljenGrotesk-Display (graisse 680), -Regular (420), -Medium (520), -Semibold (620).

    python3 tools/boards.py <captures du site actuel> <nouvelles captures> <dossier des TTF> <rendu de la fiche Barrier Reef, page 2>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BEFORE, AFTER, TTF, SHEET = (Path(a) for a in sys.argv[1:5])
OUT = Path(__file__).resolve().parent.parent / 'boards'
OUT.mkdir(exist_ok=True)
BG, INK, SOFT, AZURE, GREY, LINE = (238, 242, 244), (10, 26, 36), (61, 79, 90), (8, 148, 252), (170, 180, 186), (213, 221, 226)
SUB = 'graciepools.com · website redesign concept, October 2026'


def font(name, size):
    return ImageFont.truetype(str(TTF / f'FamiljenGrotesk-{name}.ttf'), size)


def panel(board, im, xy, w, label, sub, after, crop_h=None):
    im = im.convert('RGB')
    if crop_h:
        im = im.crop((0, 0, im.width, min(im.height, round(crop_h * im.width / w))))
    h = round(im.height * w / im.width)
    shot = im.resize((w, h), Image.LANCZOS)
    x, y = xy
    d = ImageDraw.Draw(board)
    d.ellipse((x, y + 7, x + 14, y + 21), fill=AZURE if after else GREY)
    d.text((x + 26, y - 2), label, font=font('Semibold', 25), fill=INK)
    if sub:
        d.text((x + 26, y + 32), sub, font=font('Regular', 20), fill=SOFT)
    top = y + 78
    d.rectangle((x - 1, top - 1, x + w, top + h), outline=LINE, width=1)
    board.paste(shot, (x, top))
    return top + h


def header(d, pad, title, sub):
    d.text((pad, 46), title, font=font('Display', 70), fill=INK)
    d.text((pad, 140), sub, font=font('Regular', 22), fill=SOFT)


def row(name, items, w, title, sub, crop_h=None):
    """Des captures côte à côte : (image, titre, sous-titre, nouvelle version ?)"""
    pad, gap = 80, 56
    hs = [min(round(im.height * w / im.width), crop_h) if crop_h else round(im.height * w / im.width) for im, *_ in items]
    W = pad * 2 + w * len(items) + gap * (len(items) - 1)
    b = Image.new('RGB', (W, 220 + 78 + max(hs) + pad), BG)
    header(ImageDraw.Draw(b), pad, title, sub)
    for i, (im, lab, s, after) in enumerate(items):
        panel(b, im, (pad + i * (w + gap), 220), w, lab, s, after, crop_h)
    b.save(OUT / name, quality=88)
    print('✓', name, b.size)


def grid(name, views, cols, w, ratio, title, sub):
    pad, gap = 80, 56
    h = round(w * ratio)
    W = pad * 2 + w * cols + gap * (cols - 1)
    rows = (len(views) + cols - 1) // cols
    b = Image.new('RGB', (W, 220 + rows * (78 + h + gap) + pad - gap), BG)
    header(ImageDraw.Draw(b), pad, title, sub)
    for i, (f, lab, s) in enumerate(views):
        panel(b, A(f), (pad + (i % cols) * (w + gap), 220 + (i // cols) * (78 + h + gap)), w, lab, s, True)
    b.save(OUT / name, quality=86)
    print('✓', name, b.size)


B = lambda n: Image.open(BEFORE / n)
A = lambda n: Image.open(AFTER / n)

row('avant-apres-ordinateur.jpg', [
    (B('d-home-top.jpg'), 'Before', 'Current homepage: a GoDaddy template, a darkened banner photo, a cookie box over it', False),
    (A('d-top.png'), 'After', 'New homepage: their own greeting, and a Barrier Reef pool drawn to scale', True),
], 1100, 'Gracie Pools: before and after', SUB)

row('avant-apres-mobile.jpg', [
    (B('m-home-top.jpg'), 'Before', 'Current site on a phone', False),
    (A('m-top.png'), 'After', 'New site on a phone', True),
], 520, 'Before and after on a phone', SUB, crop_h=1125)

row('comparateur.jpg', [
    (A('d-planner.png'), 'Every model, to scale', 'All the shells on one grid in feet: the rulers measure the pool', True),
    (A('d-compare.png'), 'Pin one, compare another', 'The Escape Plunge stays as a dashed outline inside the Whitsunday Deep', True),
    (A('d-finish.png'), 'Six real finishes', 'The real gelcoat chips; the water and the rest of the site take the color', True),
], 760, 'The model finder', 'Barrier Reef’s own drawings and measurements from the 2025 model sheet, filled with the real water of each finish')

# de la fiche du fabricant aux dessins du site
sheet = Image.open(SHEET).convert('RGB')
sheet = sheet.crop((0, round(sheet.height * 0.04), sheet.width, round(sheet.height * 0.58)))
row('dessins.jpg', [
    (sheet, 'Barrier Reef 2025 model sheet', 'Hosted on their current site as a PDF: drawings not to scale', False),
    (A('d-lineup.png'), 'On the new site', 'The same drawings, scaled to each model’s listed length and width', True),
], 1100, 'From the manufacturer’s sheet to the site', 'The drawings are vector files in the PDF: steps, benches, loungers and deep ends are redrawn exactly, then set on the same scale')

grid('nouvelle-page-sections.jpg', [
    ('d-fiberglass.png', 'Built in a factory, set in one piece', 'Their arguments and Barrier Reef’s, with the right photo credit'),
    ('d-journey.png', 'From the factory floor to the backyard', 'Each step drawn with the outline of a real model'),
    ('d-gallery.png', 'What they look like in the ground', 'Manufacturer photos, labeled as such; a name opens the model to scale'),
    ('d-concrete.png', 'Custom concrete', 'Concept to construction: 3D design, waterfalls and fire, Pentair'),
    ('d-package.png', 'Everything around the water', 'Pavers, lighting, equipment, salt, and their real financing partner'),
    ('d-service.png', 'Already have a pool?', 'Liners with what the job includes, surfaces, pumps, automation, hot tubs'),
    ('d-faq.png', 'Questions we hear', 'From their liner page and the model sheet'),
    ('d-contact.png', 'Tell us about your pool', 'The chosen model comes with the request; address, hours and both contacts'),
], 2, 900, 900 / 1440, 'The new page, section by section', 'Real content only: their texts, services, partners, photos, address, hours and contacts, nothing invented')

phones = [('m-top.png', 'Home'), ('m-fiberglass.png', 'One piece'), ('m-planner.png', 'Every model, to scale'), ('m-specs.png', 'The numbers'),
          ('m-gallery.png', 'In the ground'), ('m-service.png', 'Already have a pool?'), ('m-contact.png', 'Contact'), ('m-menu.png', 'Menu')]
pad, gap, w, h = 80, 40, 390, 844
W = pad * 2 + w * 4 + gap * 3
b = Image.new('RGB', (W, 220 + 2 * (78 + h) + gap + pad), BG)
header(ImageDraw.Draw(b), pad, 'On a phone', 'Call or text a photo from anywhere: the button bar follows you down the page')
for i, (f, lab) in enumerate(phones):
    panel(b, A(f), (pad + (i % 4) * (w + gap), 220 + (i // 4) * (78 + h + gap)), w, lab, '', True)
b.save(OUT / 'telephone.jpg', quality=86)
print('✓ telephone.jpg', b.size)

# chiffres mesurés (voir README) : Lighthouse mobile, mêmes réglages des deux côtés ; le site actuel en ligne, meilleur
# de quatre passages pour chaque ligne ; le nouveau servi en local et compressé, médiane de trois ; puis le contenu des deux sites
rows = [
    ('Performance (Lighthouse, phone)', '51', '87'),
    ('Accessibility', '85', '100'),
    ('Best practices', '96', '100'),
    ('SEO', '92', '100'),
    ('Main thread blocked while loading', '0.95 s', '0.12 s'),
    ('Downloaded while loading, on a phone', '1.0 MB', '0.5 MB'),
    ('Template leftovers (“Daily Specials”, water slide, gift card)', 'on 7 pages', 'none'),
    ('Model dimensions', '3 wrong cards', 'the 2025 sheet'),
    ('“Text a photo for a free estimate”', 'on 1 page', 'on every screen'),
]
W, pad = 1800, 80
b = Image.new('RGB', (W, 300 + len(rows) * 92 + 80), BG)
d = ImageDraw.Draw(b)
header(d, pad, 'Measured, not promised', 'Lighthouse on a phone, same settings: the current site online, best of four runs; the new one on a test server, median of three')
y = 250
d.text((W - pad - 760, y), 'Before', font=font('Semibold', 23), fill=SOFT)
d.text((W - pad - 400, y), 'After', font=font('Semibold', 23), fill=INK)
y += 50
for label, before, after in rows:
    d.line((pad, y, W - pad, y), fill=LINE, width=2)
    d.text((pad, y + 26), label, font=font('Medium', 30), fill=INK)
    d.text((W - pad - 760, y + 24), before, font=font('Regular', 32), fill=SOFT)
    d.ellipse((W - pad - 430, y + 38, W - pad - 416, y + 52), fill=AZURE)
    d.text((W - pad - 400, y + 22), after, font=font('Display', 36), fill=INK)
    y += 92
d.line((pad, y, W - pad, y), fill=LINE, width=2)
b.save(OUT / 'chiffres.jpg', quality=90)
print('✓ chiffres.jpg', b.size)
