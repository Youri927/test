"""Planches avant / après pour la présentation (captures du site actuel et de la nouvelle version).

Les polices sont celles du site (Bricolage Grotesque et Hanken Grotesk), converties en TTF statiques pour Pillow
(fontTools, varLib.instancer).

    python3 tools/boards.py <dossier des captures> <dossier des TTF>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SRC = Path(sys.argv[1])
TTF = Path(sys.argv[2])
OUT = Path(__file__).resolve().parent.parent / 'boards'
OUT.mkdir(exist_ok=True)
BG, INK, SOFT, BLUE, GREY, LINE = (242, 246, 249), (14, 34, 51), (85, 102, 117), (42, 115, 163), (160, 170, 178), (221, 228, 234)
SUB = 'camerondentalstudio.com · website redesign concept, October 2026'


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
    shot = rounded(im.resize((w, h), Image.LANCZOS), 10)
    x, y = xy
    d = ImageDraw.Draw(board)
    d.rounded_rectangle((x, y + 3, x + 12, y + 15), 3, fill=BLUE if after else GREY)
    d.text((x + 24, y - 2), label, font=font('Hanken-600', 21), fill=INK)
    if sub:
        d.text((x + 24, y + 28), sub, font=font('Hanken-400', 19), fill=SOFT)
    top = y + 72
    d.rounded_rectangle((x - 1, top - 1, x + w, top + h), 11, outline=LINE, width=1)
    board.paste(shot, (x, top), shot)
    return top + h


def header(d, pad, W, title, sub):
    d.text((pad, 60), title, font=font('Bricolage-600', 60), fill=INK)
    d.text((pad, 142), sub, font=font('Hanken-400', 21), fill=SOFT)


def board(name, pairs, w, title, sub, crop_h=None):
    pad, gap = 80, 64
    hs = [min(round(im.height * w / im.width), crop_h) if crop_h else round(im.height * w / im.width) for im, *_ in pairs]
    W = pad * 2 + w * len(pairs) + gap * (len(pairs) - 1)
    H = 220 + 72 + max(hs) + pad
    b = Image.new('RGB', (W, H), BG)
    header(ImageDraw.Draw(b), pad, W, title, sub)
    for i, (im, label, s, after) in enumerate(pairs):
        panel(b, im, (pad + i * (w + gap), 220), w, label, s, after, crop_h)
    b.save(OUT / name, quality=88)
    print('✓', name, b.size)


S = lambda n: Image.open(SRC / n)
board('avant-apres-ordinateur.jpg', [
    (S('now/desktop-top.png'), 'Before', 'Current homepage: template, all-caps title, video still', False),
    (S('top.png'), 'After', 'New homepage: twelve real patients, after treatment', True),
], 1100, 'Cameron Dental Studio: before / after', SUB)
board('avant-apres-mobile.jpg', [
    (S('now/mobile-top.png'), 'Before', 'Current site, phone', False),
    (S('m-top.png'), 'After', 'New site, phone', True),
], 520, 'Before / after on a phone', SUB, crop_h=1125)

# la nouvelle page, section par section
views = [
    ('top-before.png', 'The smile wall, switched to “before”', 'Hover one face, or flip all twelve in a wave'),
    ('case.png', 'Any smile, up close', 'Before / after, faces and close-ups; arrows or swipe for all 18'),
    ('doctor.png', 'Dr. Andrea Cameron', '“Every smile is a work of art”: her story, a patient’s words'),
    ('story.png', 'One case in detail', 'The section holds still while a wipe reveals the new smile'),
    ('treat.png', 'What we do', 'Eight treatments, written from their own pages'),
    ('comfort.png', 'Nervous about the dentist?', 'Three levels of help, from their sedation pages'),
    ('team.png', 'Five doctors', 'The team photo widens to the edges as you scroll'),
    ('reviews.png', 'What patients say', 'Real, signed reviews; their magazine covers'),
    ('ins.png', 'Is my insurance accepted?', 'Type your plan: their list of 25 PPO and 6 discount plans'),
    ('visit.png', 'Book a visit', 'Phone, live open / closed status, address and a short form'),
]
pad, gap, w = 80, 56, 900
h = round(900 * w / 1440)
W = pad * 2 + w * 2 + gap
rows = (len(views) + 1) // 2
H = 220 + rows * (72 + h + gap) + pad - gap
b = Image.new('RGB', (W, H), BG)
header(ImageDraw.Draw(b), pad, W, 'The new page, section by section', 'Real content from the studio: 18 real cases, doctors, treatments, reviews, insurance, contact')
for i, (f, lab, s) in enumerate(views):
    panel(b, S(f), (pad + (i % 2) * (w + gap), 220 + (i // 2) * (72 + h + gap)), w, lab, s, True)
b.save(OUT / 'nouvelle-page-sections.jpg', quality=86)
print('✓ nouvelle-page-sections.jpg', b.size)

# téléphone
phones = [('m-top.png', 'Home'), ('m-wall.png', 'Smile wall'), ('m-story.png', 'One case'),
          ('m-treat.png', 'Treatments'), ('m-reviews.png', 'Reviews'), ('m-visit.png', 'Book a visit')]
pad, gap, w, h = 80, 40, 390, 844
W = pad * 2 + w * len(phones) + gap * (len(phones) - 1)
b = Image.new('RGB', (W, 220 + 72 + h + pad), BG)
header(ImageDraw.Draw(b), pad, W, 'On a phone', 'One column; a call / book bar follows you down the page')
for i, (f, lab) in enumerate(phones):
    panel(b, S(f), (pad + i * (w + gap), 220), w, lab, '', True)
b.save(OUT / 'telephone.jpg', quality=86)
print('✓ telephone.jpg', b.size)
