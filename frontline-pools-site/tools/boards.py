"""Planches avant / après pour la présentation (captures du site actuel et de la nouvelle version).

La police est celle du site, Archivo, convertie en TTF statiques pour Pillow (fontTools, varLib.instancer) :
Archivo-X800 (largeur 125 %, graisse 800), Archivo-400, Archivo-600.

    python3 tools/boards.py <dossier des captures> <dossier des TTF>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SRC = Path(sys.argv[1])
TTF = Path(sys.argv[2])
OUT = Path(__file__).resolve().parent.parent / 'boards'
OUT.mkdir(exist_ok=True)
BG, INK, SOFT, YELLOW, GREY, LINE = (238, 242, 247), (29, 48, 93), (90, 104, 134), (254, 188, 17), (176, 186, 202), (217, 224, 234)
SUB = 'frontlinepools.com · website redesign concept, October 2026'


def font(name, size):
    return ImageFont.truetype(str(TTF / f'{name}.ttf'), size)


def rounded(im, r):
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.size[0] - 1, im.size[1] - 1), r, fill=255)
    out = Image.new('RGBA', im.size)
    out.paste(im, (0, 0), mask)
    return out


def panel(board, im, xy, w, label, sub, after, crop_h=None):
    im = im.convert('RGB')
    if crop_h:
        im = im.crop((0, 0, im.width, min(im.height, round(crop_h * im.width / w))))
    h = round(im.height * w / im.width)
    shot = rounded(im.resize((w, h), Image.LANCZOS), 8)
    x, y = xy
    d = ImageDraw.Draw(board)
    d.rectangle((x, y + 4, x + 12, y + 16), fill=YELLOW if after else GREY)
    d.text((x + 24, y - 2), label, font=font('Archivo-600', 22), fill=INK)
    if sub:
        d.text((x + 24, y + 29), sub, font=font('Archivo-400', 19), fill=SOFT)
    top = y + 74
    d.rounded_rectangle((x - 1, top - 1, x + w, top + h), 9, outline=LINE, width=1)
    board.paste(shot, (x, top), shot)
    return top + h


def header(d, pad, title, sub):
    d.text((pad, 58), title.upper(), font=font('Archivo-X800', 56), fill=INK)
    d.text((pad, 140), sub, font=font('Archivo-400', 21), fill=SOFT)


def board(name, pairs, w, title, sub, crop_h=None):
    pad, gap = 80, 64
    hs = [min(round(im.height * w / im.width), crop_h) if crop_h else round(im.height * w / im.width) for im, *_ in pairs]
    W = pad * 2 + w * len(pairs) + gap * (len(pairs) - 1)
    H = 220 + 74 + max(hs) + pad
    b = Image.new('RGB', (W, H), BG)
    header(ImageDraw.Draw(b), pad, title, sub)
    for i, (im, label, s, after) in enumerate(pairs):
        panel(b, im, (pad + i * (w + gap), 220), w, label, s, after, crop_h)
    b.save(OUT / name, quality=88)
    print('✓', name, b.size)


S = lambda n: Image.open(SRC / n)
board('avant-apres-ordinateur.jpg', [
    (S('now/desktop-top.png'), 'Before', 'Current homepage: a six-field form before anything else', False),
    (S('top.png'), 'After', 'New homepage: their own work, full width, and one clear action', True),
], 1100, 'Frontline Pools: before / after', SUB)
board('avant-apres-mobile.jpg', [
    (S('now/mobile-top.png'), 'Before', 'Current site, phone', False),
    (S('m-top.png'), 'After', 'New site, phone', True),
], 520, 'Before / after on a phone', SUB, crop_h=1125)

# la nouvelle page, section par section
views = [
    ('tour-waterline.png', 'What we rebuild: the waterline', 'The camera moves in on each part of a real Frontline pool'),
    ('tour-equipment.png', 'What we rebuild: the equipment', 'Six chapters, from the finish to the equipment pad'),
    ('work.png', 'Recent work', 'Four renovations from their site, each with its build sheet'),
    ('equip.png', 'The equipment pad, sorted', 'Their before / after photos, revealed behind a rising waterline'),
    ('reviews.png', 'Meet Matt and Jacob', '19 of their 33 published reviews name them'),
    ('reviews-list.png', 'All 33 reviews, word for word', 'Their names highlighted, four excerpts set large'),
    ('license.png', 'Licensed means accountable', 'CPC1460668 in large type, with a link to verify it'),
    ('finance.png', 'Pay over time', 'Their Lyon Financial offer, figures from their own site'),
    ('areas.png', 'Where we work', 'A real map of Tampa Bay (US Census data): pick a neighborhood, see the work from there'),
    ('estimate.png', 'Free on-site estimate', 'Call, text, email, live open / closed status, and the same form fields as today'),
]
pad, gap, w = 80, 56, 900
h = round(900 * w / 1440)
W = pad * 2 + w * 2 + gap
rows = (len(views) + 1) // 2
H = 220 + rows * (74 + h + gap) + pad - gap
b = Image.new('RGB', (W, H), BG)
header(ImageDraw.Draw(b), pad, 'The new page, section by section', 'Real content only: their photos, projects, reviews, license, financing and service areas')
for i, (f, lab, s) in enumerate(views):
    panel(b, S(f), (pad + (i % 2) * (w + gap), 220 + (i // 2) * (74 + h + gap)), w, lab, s, True)
b.save(OUT / 'nouvelle-page-sections.jpg', quality=86)
print('✓ nouvelle-page-sections.jpg', b.size)

# ouverture : la mosaïque
frames = [('intro-1.png', '0.7 s'), ('intro-2.png', '1.0 s'), ('intro-3.png', '1.3 s'), ('intro-4.png', '2.0 s')]
pad, gap, w = 80, 40, 700
h = round(900 * w / 1440)
W = pad * 2 + w * 4 + gap * 3
b = Image.new('RGB', (W, 220 + 74 + h + pad), BG)
header(ImageDraw.Draw(b), pad, 'Opening: the photo is set like tile', 'Tile by tile on a diagonal, then the grout lines close')
for i, (f, lab) in enumerate(frames):
    panel(b, S(f), (pad + i * (w + gap), 220), w, lab, '', True)
b.save(OUT / 'ouverture-mosaique.jpg', quality=86)
print('✓ ouverture-mosaique.jpg', b.size)

# téléphone
phones = [('m-top.png', 'Home'), ('m-tour.png', 'What we rebuild'), ('m-work.png', 'Recent work'),
          ('m-equip.png', 'Equipment'), ('m-reviews.png', 'Reviews'), ('m-areas.png', 'Where we work')]
pad, gap, w, h = 80, 40, 390, 844
W = pad * 2 + w * len(phones) + gap * (len(phones) - 1)
b = Image.new('RGB', (W, 220 + 74 + h + pad), BG)
header(ImageDraw.Draw(b), pad, 'On a phone', 'One column; a call / text / estimate bar follows you down the page')
for i, (f, lab) in enumerate(phones):
    panel(b, S(f), (pad + i * (w + gap), 220), w, lab, '', True)
b.save(OUT / 'telephone.jpg', quality=86)
print('✓ telephone.jpg', b.size)
