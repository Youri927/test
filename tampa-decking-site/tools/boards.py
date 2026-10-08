"""Planches de présentation (captures du site actuel et de la nouvelle version), en anglais pour le client.

La police est celle du site, Mona Sans, convertie en TTF statiques pour Pillow (fontTools, varLib.instancer) :
MonaSans-Display (chasse 112, graisse 650), MonaSans-Regular (100, 420), MonaSans-Semibold (100, 600).

    python3 tools/boards.py <dossier des captures du site actuel> <dossier des nouvelles captures> <dossier des TTF>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BEFORE, AFTER, TTF = (Path(a) for a in sys.argv[1:4])
OUT = Path(__file__).resolve().parent.parent / 'boards'
OUT.mkdir(exist_ok=True)
BG, INK, SOFT, SUN, GREY, LINE = (238, 245, 247), (4, 66, 111), (61, 92, 116), (242, 214, 75), (170, 184, 194), (214, 226, 232)
SUB = 'tampadeckingandpools.com · website redesign concept, October 2026'


def font(name, size):
    return ImageFont.truetype(str(TTF / f'MonaSans-{name}.ttf'), size)


def panel(board, im, xy, w, label, sub, after, crop_h=None):
    im = im.convert('RGB')
    if crop_h:
        im = im.crop((0, 0, im.width, min(im.height, round(crop_h * im.width / w))))
    h = round(im.height * w / im.width)
    shot = im.resize((w, h), Image.LANCZOS)
    x, y = xy
    d = ImageDraw.Draw(board)
    d.ellipse((x, y + 6, x + 13, y + 19), fill=SUN if after else GREY, outline=INK if after else None)
    d.text((x + 26, y - 2), label, font=font('Semibold', 23), fill=INK)
    if sub:
        d.text((x + 26, y + 30), sub, font=font('Regular', 19), fill=SOFT)
    top = y + 76
    d.rectangle((x - 1, top - 1, x + w, top + h), outline=LINE, width=1)
    board.paste(shot, (x, top))
    return top + h


def header(d, pad, title, sub):
    d.text((pad, 52), title, font=font('Display', 62), fill=INK)
    d.text((pad, 140), sub, font=font('Regular', 21), fill=SOFT)


def pair(name, items, w, title, sub, crop_h=None):
    pad, gap = 80, 64
    hs = [min(round(im.height * w / im.width), crop_h) if crop_h else round(im.height * w / im.width) for im, *_ in items]
    W = pad * 2 + w * len(items) + gap * (len(items) - 1)
    b = Image.new('RGB', (W, 220 + 76 + max(hs) + pad), BG)
    header(ImageDraw.Draw(b), pad, title, sub)
    for i, (im, label, s, after) in enumerate(items):
        panel(b, im, (pad + i * (w + gap), 220), w, label, s, after, crop_h)
    b.save(OUT / name, quality=88)
    print('✓', name, b.size)


def grid(name, views, cols, w, ratio, title, sub, src=AFTER):
    pad, gap = 80, 56
    h = round(w * ratio)
    W = pad * 2 + w * cols + gap * (cols - 1)
    rows = (len(views) + cols - 1) // cols
    b = Image.new('RGB', (W, 220 + rows * (76 + h + gap) + pad - gap), BG)
    header(ImageDraw.Draw(b), pad, title, sub)
    for i, (f, lab, s) in enumerate(views):
        panel(b, Image.open(src / f), (pad + (i % cols) * (w + gap), 220 + (i // cols) * (76 + h + gap)), w, lab, s, True)
    b.save(OUT / name, quality=86)
    print('✓', name, b.size)


A = lambda n: Image.open(AFTER / n)
B = lambda n: Image.open(BEFORE / n)

pair('avant-apres-ordinateur.jpg', [
    (B('desktop-top.png'), 'Before', 'Current homepage: a darkened patio photo, no menu, a form that does not load', False),
    (A('d-top.png'), 'After', 'New homepage: their own stone spa, the headline across the waterline', True),
], 1100, 'Tampa Decking & Pools: before and after', SUB)

pair('avant-apres-mobile.jpg', [
    (B('mobile-top.png'), 'Before', 'Current site on a phone', False),
    (A('m-top.png'), 'After', 'New site on a phone', True),
], 520, 'Before and after on a phone', SUB, crop_h=1125)

grid('la-coupe.jpg', [
    ('d-layer-deck.png', 'Deck', 'Poured, stamped, stained or coated concrete, pavers, travertine'),
    ('d-layer-coping.png', 'Coping', 'Concrete, bullnose brick, safety grip, flagstone, custom stonework'),
    ('d-layer-tile.png', 'Waterline tile', 'Glass, stone or glazed, replaced with every resurfacing'),
    ('d-layer-finish.png', 'Interior finish', 'Quartz, pebble, plaster or glass bead, and a new warranty'),
], 2, 900, 900 / 1440, 'The pool edge, layer by layer', 'A technical section of a pool edge is the services menu: as you scroll, each layer lights up with a photo of real work')

grid('nouvelle-page-sections.jpg', [
    ('d-work.png', 'Our work, up close', 'Three columns that glide at different speeds as you scroll'),
    ('d-lightbox.png', 'Every photo, large', 'Arrow keys, swipe, and a description of what you see'),
    ('d-surfaces.png', 'Pick your surface', 'Samples cut from their photos; hover one to open it'),
    ('d-cost.png', 'What resurfacing costs', 'The ranges from their own pricing page, on one scale'),
    ('d-care.png', 'Keep it looking new', 'Paver sealing in six steps, then pressure washing'),
    ('d-about.png', 'Part of Tampa for 30 years', 'Mark Haskins, veteran and family owned, and here to stay'),
    ('d-reviews.png', 'Two signed reviews', 'The ones on their site, nothing added'),
    ('d-areas.png', 'Do you work in my city?', 'The 23 cities they serve, with an instant answer'),
    ('d-estimate.png', 'A free estimate that works', 'Their current form shows raw code; this one guides you'),
    ('d-footer.png', 'The deep end', 'Contact, services and areas at the bottom of every scroll'),
], 2, 900, 900 / 1440, 'The new page, section by section', 'Real content only: their photos, services, prices, cities, reviews and contact details')

phones = [('m-top.png', 'Home'), ('m-layers.png', 'Layer by layer'), ('m-work.png', 'Our work'), ('m-surfaces.png', 'Surfaces'),
          ('m-cost.png', 'Pricing'), ('m-about.png', 'About'), ('m-areas.png', 'Areas'), ('m-estimate.png', 'Free estimate')]
pad, gap, w, h = 80, 40, 390, 844
W = pad * 2 + w * 4 + gap * 3
b = Image.new('RGB', (W, 220 + 2 * (76 + h) + gap + pad), BG)
header(ImageDraw.Draw(b), pad, 'On a phone', 'Built for phones: tap the layers, swipe the samples, and a call / estimate bar follows you down the page')
for i, (f, lab) in enumerate(phones):
    panel(b, A(f), (pad + (i % 4) * (w + gap), 220 + (i // 4) * (76 + h + gap)), w, lab, '', True)
b.save(OUT / 'telephone.jpg', quality=86)
print('✓ telephone.jpg', b.size)

# chiffres mesurés (voir README) : audit Lighthouse mobile et trace de performance Chrome
rows = [
    ('Accessibility', '89', '100'),
    ('Best practices', '96', '100'),
    ('SEO', '85', '100'),
    ('First screen on a throttled phone (LCP)', '0.85 s', '0.67 s'),
    ('Layout shift (CLS)', '0.02', '0'),
    ('Main menu', 'none', 'yes'),
    ('Estimate form', 'shows raw code', 'works, with checks'),
]
W, pad = 1760, 80
b = Image.new('RGB', (W, 300 + len(rows) * 92 + 120), BG)
d = ImageDraw.Draw(b)
header(d, pad, 'Measured, not promised', 'Lighthouse mobile audit and Chrome performance trace (Fast 4G, 4× slower processor), production build of the new site')
y = 250
d.text((W - pad - 760, y), 'Before', font=font('Semibold', 22), fill=SOFT)
d.text((W - pad - 400, y), 'After', font=font('Semibold', 22), fill=INK)
y += 50
for label, before, after in rows:
    d.line((pad, y, W - pad, y), fill=LINE, width=2)
    d.text((pad, y + 26), label, font=font('Medium', 30), fill=INK)
    d.text((W - pad - 760, y + 24), before, font=font('Regular', 32), fill=SOFT)
    d.ellipse((W - pad - 430, y + 38, W - pad - 416, y + 52), fill=SUN, outline=INK)
    d.text((W - pad - 400, y + 22), after, font=font('Display', 34), fill=INK)
    y += 92
d.line((pad, y, W - pad, y), fill=LINE, width=2)
b.save(OUT / 'chiffres.jpg', quality=90)
print('✓ chiffres.jpg', b.size)
