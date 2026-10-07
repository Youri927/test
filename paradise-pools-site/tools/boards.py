"""Planches avant / après pour la présentation (captures du site actuel et de la nouvelle version).

La police est celle du site, Funnel, convertie en TTF statiques pour Pillow (fontTools, varLib.instancer) :
FunnelDisplay-700, FunnelSans-400, FunnelSans-600.

    python3 tools/boards.py <dossier des captures> <dossier des TTF>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SRC = Path(sys.argv[1])
TTF = Path(sys.argv[2])
OUT = Path(__file__).resolve().parent.parent / 'boards'
OUT.mkdir(exist_ok=True)
BG, INK, SOFT, SUN, GREY, LINE = (238, 244, 247), (0, 70, 109), (75, 98, 113), (240, 90, 40), (170, 184, 194), (214, 225, 232)
SUB = 'paradisepoolstb.com · website redesign concept, October 2026'


def font(name, size):
    return ImageFont.truetype(str(TTF / f'{name}.ttf'), size)


def panel(board, im, xy, w, label, sub, after, crop_h=None):
    im = im.convert('RGB')
    if crop_h:
        im = im.crop((0, 0, im.width, min(im.height, round(crop_h * im.width / w))))
    h = round(im.height * w / im.width)
    shot = im.resize((w, h), Image.LANCZOS)
    x, y = xy
    d = ImageDraw.Draw(board)
    d.ellipse((x, y + 5, x + 12, y + 17), fill=SUN if after else GREY)
    d.text((x + 24, y - 2), label, font=font('FunnelSans-600', 22), fill=INK)
    if sub:
        d.text((x + 24, y + 29), sub, font=font('FunnelSans-400', 19), fill=SOFT)
    top = y + 74
    d.rectangle((x - 1, top - 1, x + w, top + h), outline=LINE, width=1)
    board.paste(shot, (x, top))
    return top + h


def header(d, pad, title, sub):
    d.text((pad, 56), title, font=font('FunnelDisplay-700', 60), fill=INK)
    d.text((pad, 140), sub, font=font('FunnelSans-400', 21), fill=SOFT)


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


def grid(name, views, cols, w, ratio, title, sub):
    pad, gap = 80, 56
    h = round(w * ratio)
    W = pad * 2 + w * cols + gap * (cols - 1)
    rows = (len(views) + cols - 1) // cols
    H = 220 + rows * (74 + h + gap) + pad - gap
    b = Image.new('RGB', (W, H), BG)
    header(ImageDraw.Draw(b), pad, title, sub)
    for i, (f, lab, s) in enumerate(views):
        panel(b, S(f), (pad + (i % cols) * (w + gap), 220 + (i // cols) * (74 + h + gap)), w, lab, s, True)
    b.save(OUT / name, quality=86)
    print('✓', name, b.size)


S = lambda n: Image.open(SRC / n)
board('avant-apres-ordinateur.jpg', [
    (S('now-desktop.png'), 'Before', 'Current homepage: a cropped banner, no headline, no phone, no button', False),
    (S('top.png'), 'After', 'New homepage: one of their own pools from the air, and one clear action', True),
], 1100, 'Paradise Pools: before and after', SUB)
board('avant-apres-mobile.jpg', [
    (S('now-mobile.png'), 'Before', 'Current site on a phone: the desktop page, shrunk', False),
    (S('m-top.png'), 'After', 'New site on a phone', True),
], 520, 'Before and after on a phone', SUB, crop_h=1125)

# ouverture : la vue de drone s'ouvre, puis on descend au bord de l'eau
grid('ouverture-vue-de-drone.jpg', [
    ('top.png', 'The plan', 'Their drone photo, annotated like a drawing'),
    ('hero-1.png', 'It opens', 'Scrolling widens the photo to the full screen'),
    ('hero-3.png', 'Down to the water', 'The same pool, now seen from the deck'),
    ('hero-4.png', 'From the plan to the first swim', 'Every new pool starts with a design you can see'),
], 2, 900, 900 / 1440, 'Opening: from above, then at the water’s edge', 'Two real photos of the same new pool: their drone shot and the view from the deck')

grid('nouvelle-page-sections.jpg', [
    ('family.png', 'Family owned and operated', 'Their own words, with the license, the six counties and the 24 hour callback'),
    ('steps.png', 'New pools, in three steps', 'Get to know you, see it in 3D, build it to last: each photo slides in as you read'),
    ('remodels.png', 'Remodels, as an index', 'Resurfacing, tile and coping, decks, pavers: hover a line to see the work'),
    ('work.png', 'Our work, from every angle', 'Six backyards from their gallery, scrolling sideways, each with all its photos'),
    ('work-2.png', 'What you can see in each one', 'Described from the photos, never invented; “New pool” only where their site says so'),
    ('gallery.png', 'All 49 photos', 'Filter by freeform, geometric, sun shelf, spa, water features, screened, waterfront'),
    ('financing.png', 'Spread the cost', 'Lyon Financial and HFS compared by the figures on their site'),
    ('areas.png', 'Six counties around the bay', 'A real map (US Census data); the counties light up one by one'),
    ('quote.png', 'Tell us about your backyard', 'The same fields as today, a live open / closed status and the 24 hour promise'),
    ('footer.png', 'The name, large', 'License, hours, counties and contact at the bottom of every scroll'),
], 2, 900, 900 / 1440, 'The new page, section by section', 'Real content only: their photos, services, license, counties, hours and financing partners')

phones = [('m-top.png', 'Home'), ('m-hero.png', 'At the water'), ('m-steps.png', 'New pools'), ('m-remodels.png', 'Remodels'),
          ('m-work.png', 'Our work'), ('m-gallery.png', 'All photos'), ('m-financing.png', 'Financing'), ('m-areas.png', 'Counties')]
pad, gap, w, h = 80, 40, 390, 844
W = pad * 2 + w * 4 + gap * 3
b = Image.new('RGB', (W, 220 + 2 * (74 + h) + gap + pad), BG)
header(ImageDraw.Draw(b), pad, 'On a phone', 'Built for phones from the start; a call / quote bar follows you down the page')
for i, (f, lab) in enumerate(phones):
    panel(b, S(f), (pad + (i % 4) * (w + gap), 220 + (i // 4) * (74 + h + gap)), w, lab, '', True)
b.save(OUT / 'telephone.jpg', quality=86)
print('✓ telephone.jpg', b.size)
