"""Planches avant / après pour la présentation (captures du site actuel et de la nouvelle version).

Les polices sont celles du site (Funnel Display et Funnel Sans), converties en TTF statiques pour Pillow.

    python3 tools/boards.py <dossier des captures> <dossier des TTF>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SRC = Path(sys.argv[1])
TTF = Path(sys.argv[2])
OUT = Path(__file__).resolve().parent.parent / 'boards'
OUT.mkdir(exist_ok=True)
SAND, INK, SOFT, LIME, GREY = (244, 239, 230), (15, 29, 58), (92, 100, 118), (144, 238, 1), (170, 174, 180)


def font(name, size):
    return ImageFont.truetype(str(TTF / f'{name}.ttf'), size)


def rounded(im, r):
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.size[0] - 1, im.size[1] - 1), r, fill=255)
    out = Image.new('RGBA', im.size)
    out.paste(im, (0, 0), mask)
    return out


def panel(board, im, xy, w, label, sub, accent, crop_h=None):
    im = im.convert('RGB')
    if crop_h:
        im = im.crop((0, 0, im.width, min(im.height, round(crop_h * im.width / w))))
    h = round(im.height * w / im.width)
    shot = rounded(im.resize((w, h), Image.LANCZOS), 16)
    x, y = xy
    d = ImageDraw.Draw(board)
    d.ellipse((x, y + 7, x + 14, y + 21), fill=accent, outline=INK if accent == LIME else None, width=2)
    d.text((x + 26, y), label, font=font('FunnelSans-600', 22), fill=INK)
    d.text((x + 26, y + 32), sub, font=font('FunnelSans-400', 19), fill=SOFT)
    board.paste(shot, (x, y + 78), shot)
    return y + 78 + h


def header(d, pad, title, sub):
    d.text((pad, 62), title, font=font('FunnelDisplay-600', 48), fill=INK)
    d.text((pad, 128), sub, font=font('FunnelSans-400', 20), fill=SOFT)


def board(name, pairs, w, title, sub, crop_h=None):
    pad, gap = 80, 64
    hs = []
    for im, *_ in pairs:
        h = round(im.height * w / im.width)
        hs.append(min(h, crop_h) if crop_h else h)
    W = pad * 2 + w * len(pairs) + gap * (len(pairs) - 1)
    H = 200 + 78 + max(hs) + pad
    b = Image.new('RGB', (W, H), SAND)
    header(ImageDraw.Draw(b), pad, title, sub)
    for i, (im, label, s, accent) in enumerate(pairs):
        panel(b, im, (pad + i * (w + gap), 200), w, label, s, accent, crop_h)
    b.save(OUT / name, quality=88)
    print('✓', name, b.size)


S = lambda n: Image.open(SRC / n)
SUB = 'poolremodelingscottsdaleaz.com · website redesign concept, October 2026'
board('avant-apres-ordinateur.jpg', [
    (S('now/desktop-top.png'), 'BEFORE', 'Current homepage: stock photo, form, all-caps title', GREY),
    (S('fin-00-top.png'), 'AFTER', 'New homepage: noon light, the arch from the logo, real photo', LIME),
], 1100, 'WAVE Pool Remodeling: before / after', SUB)
board('avant-apres-mobile.jpg', [
    (S('now/mobile-top.png'), 'BEFORE', 'Current site, phone', GREY),
    (S('finm-00-top.png'), 'AFTER', 'New site, phone', LIME),
], 520, 'Before / after on a phone', SUB, crop_h=1125)

# la nouvelle page, section par section : 8 vues
views = [
    ('fin-01-1000.png', 'THE ARCH OPENS', 'Scrolling steps you into the backyard'),
    ('fin-03-remodel40.png', '01 REMODEL', 'Three services, by where your pool is today'),
    ('fin-04-resurface40.png', '02 RESURFACE', 'How long finishes last, from WAVE’s own guide'),
    ('fin-05-cost0.png', 'COST', 'Remodel from ~$15,000, new pool from ~$55,000'),
    ('fin-06-work700.png', 'WORK', 'Each photo rises like a wave as you scroll'),
    ('fin-07-season0.png', 'SEASON', 'NOAA normals at Scottsdale Airport, off-season marked'),
    ('fin-08-areas250.png', 'SERVICE AREA', 'Census city limits and freeways, rings every 5 miles'),
    ('fin-10-estimate0.png', 'CONTACT, AT BLUE HOUR', 'Live open / closed status, Arizona time'),
]
pad, gap, w = 80, 56, 900
h = round(900 * w / 1440)
W = pad * 2 + w * 2 + gap
H = 200 + 4 * (78 + h + gap) + pad - gap
b = Image.new('RGB', (W, H), SAND)
d = ImageDraw.Draw(b)
header(d, pad, 'The new page, from noon to blue hour', 'Real content from WAVE: services, trust points, published prices, guides, contact details')
for i, (f, lab, s) in enumerate(views):
    panel(b, S(f), (pad + (i % 2) * (w + gap), 200 + (i // 2) * (78 + h + gap)), w, lab, s, LIME)
b.save(OUT / 'nouvelle-page-sections.jpg', quality=86)
print('✓ nouvelle-page-sections.jpg', b.size)

# téléphone : 6 vues
phones = [
    ('finm-00-top.png', 'HOME'), ('finm-02-remodel500.png', 'REMODEL'), ('finm-03-cost380.png', 'COST'),
    ('finm-04-season520.png', 'SEASON'), ('finm-05-areas560.png', 'AREAS'), ('finm-06-estimate0.png', 'CONTACT'),
]
pad, gap, w = 80, 40, 390
h = 844
W = pad * 2 + w * len(phones) + gap * (len(phones) - 1)
H = 200 + 78 + h + pad
b = Image.new('RGB', (W, H), SAND)
d = ImageDraw.Draw(b)
header(d, pad, 'On a phone', 'Same content, one column; a call / estimate bar follows you down the page')
for i, (f, lab) in enumerate(phones):
    panel(b, S(f), (pad + i * (w + gap), 200), w, lab, '', LIME)
b.save(OUT / 'telephone.jpg', quality=86)
print('✓ telephone.jpg', b.size)
