"""Planches avant / après pour la présentation (captures du site actuel et de la nouvelle version).

    python3 tools/boards.py <dossier des captures>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / 'boards'
OUT.mkdir(exist_ok=True)
PAPER, INK, INK2, SIGNAL = (242, 243, 239), (12, 37, 48), (61, 85, 96), (240, 100, 45)
MONO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
SANS = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def font(path, size):
    return ImageFont.truetype(path, size)


def rounded(im, r):
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.size[0] - 1, im.size[1] - 1), r, fill=255)
    out = Image.new('RGBA', im.size)
    out.paste(im, (0, 0), mask)
    return out


def panel(board, im, xy, w, label, sub, accent):
    h = round(im.height * w / im.width)
    shot = rounded(im.convert('RGB').resize((w, h), Image.LANCZOS), 18)
    x, y = xy
    d = ImageDraw.Draw(board)
    d.ellipse((x, y + 6, x + 14, y + 20), fill=accent)
    d.text((x + 26, y), label, font=font(MONO, 22), fill=INK)
    d.text((x + 26, y + 32), sub, font=font(MONO, 17), fill=INK2)
    board.paste(shot, (x, y + 76), shot)
    return y + 76 + h


def board(name, pairs, w, title):
    pad, gap = 80, 64
    hs = [round(im.height * w / im.width) for im, *_ in pairs]
    W = pad * 2 + w * len(pairs) + gap * (len(pairs) - 1)
    H = 190 + 76 + max(hs) + pad
    b = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(b)
    d.text((pad, 70), title, font=font(SANS, 40), fill=INK)
    d.text((pad, 124), 'poolresurfacingscottsdale.com · website redesign concept, October 2026', font=font(MONO, 18), fill=INK2)
    for i, (im, label, sub, accent) in enumerate(pairs):
        panel(b, im, (pad + i * (w + gap), 190), w, label, sub, accent)
    b.save(OUT / name, quality=88)
    print('✓', name, b.size)


S = lambda n: Image.open(SRC / n)
board('avant-apres-ordinateur.jpg', [
    (S('pr/now/desktop-top.png'), 'BEFORE', 'Current homepage', (160, 170, 175)),
    (S('shots/di-4.5.png'), 'AFTER', 'New homepage: the pool fills, then reacts to the cursor', SIGNAL),
], 1100, 'Scottsdale Pool Resurfacing: before / after')
board('avant-apres-mobile.jpg', [
    (S('pr/now/mobile-top.png'), 'BEFORE', 'Current site, phone', (160, 170, 175)),
    (S('shots/mi-4.5.png'), 'AFTER', 'New site, phone', SIGNAL),
], 560, 'Before / after on a phone')

# parcours de la nouvelle page : 6 vues
views = [
    ('shots/z-01-signs-40.png', '01 SIGNS', 'Tick what you see in your pool'),
    ('shots/x-fin-1.png', '02 FINISHES', 'Nine finishes, rendered under water'),
    ('shots/z-02-services-1300.png', '03 SERVICES', 'Five trades, stacked cards'),
    ('shots/zr-01-stepnthchild6--230.png', '04 PROCESS', 'Drain, strip, finish, refill'),
    ('shots/z-03-reviews.png', '05 REVIEWS', 'Ten Google reviews, word for word'),
    ('shots/z-04-contact.png', '06 CONTACT', 'Call back from the owner'),
]
pad, gap, w = 80, 56, 900
h = round(900 * w / 1440)
W = pad * 2 + w * 2 + gap
H = 190 + 3 * (76 + h + gap) + pad - gap
b = Image.new('RGB', (W, H), PAPER)
d = ImageDraw.Draw(b)
d.text((pad, 70), 'The new page, section by section', font=font(SANS, 40), fill=INK)
d.text((pad, 124), 'Real content from the current site: services, finishes, process, reviews, contact details', font=font(MONO, 18), fill=INK2)
for i, (f, lab, sub) in enumerate(views):
    panel(b, S(f), (pad + (i % 2) * (w + gap), 190 + (i // 2) * (76 + h + gap)), w, lab, sub, SIGNAL)
b.save(OUT / 'nouvelle-page-sections.jpg', quality=86)
print('✓ nouvelle-page-sections.jpg', b.size)
