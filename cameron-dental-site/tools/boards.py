"""Planches avant / après pour la présentation (captures du site actuel et de la nouvelle version).

Les polices sont celles du site (Noto Serif Display et Instrument Sans), converties en TTF statiques pour Pillow
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
PAPER, INK, SOFT, COBALT, GREY, LINE = (244, 241, 234), (19, 19, 19), (100, 98, 94), (43, 59, 214), (168, 166, 160), (214, 210, 202)
SUB = 'camerondentalstudio.com · website redesign concept, October 2026'


def font(name, size):
    return ImageFont.truetype(str(TTF / f'{name}.ttf'), size)


def spaced(d, xy, text, f, fill, track):
    """Texte en capitales espacées, comme les étiquettes du site."""
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=f, fill=fill)
        x += d.textlength(ch, font=f) + track


def panel(board, im, xy, w, label, sub, after, crop_h=None):
    im = im.convert('RGB')
    if crop_h:
        im = im.crop((0, 0, im.width, min(im.height, round(crop_h * im.width / w))))
    h = round(im.height * w / im.width)
    shot = im.resize((w, h), Image.LANCZOS)
    x, y = xy
    d = ImageDraw.Draw(board)
    d.ellipse((x, y + 4, x + 12, y + 16), fill=COBALT if after else GREY)
    spaced(d, (x + 24, y), label, font('InstrumentSans-600', 17), INK, 3.2)
    if sub:
        d.text((x + 24, y + 30), sub, font=font('InstrumentSans-400', 19), fill=SOFT)
    top = y + 74
    board.paste(shot, (x, top))
    d.rectangle((x - 1, top - 1, x + w, top + h), outline=LINE, width=1)
    return top + h


def header(d, pad, W, title, sub):
    spaced(d, (pad, 52), 'CAMERON DENTAL STUDIO', font('InstrumentSans-600', 15), INK, 3)
    spaced(d, (W - pad - 230, 52), 'THE SMILE ISSUE', font('InstrumentSans-600', 15), INK, 3)
    d.line((pad, 80, W - pad, 80), fill=INK, width=1)
    d.text((pad, 104), title, font=font('NotoSerifDisplay-300', 58), fill=INK)
    d.text((pad, 184), sub, font=font('InstrumentSans-400', 20), fill=SOFT)


def board(name, pairs, w, title, sub, crop_h=None):
    pad, gap = 80, 64
    hs = [min(round(im.height * w / im.width), crop_h) if crop_h else round(im.height * w / im.width) for im, *_ in pairs]
    W = pad * 2 + w * len(pairs) + gap * (len(pairs) - 1)
    H = 250 + 74 + max(hs) + pad
    b = Image.new('RGB', (W, H), PAPER)
    header(ImageDraw.Draw(b), pad, W, title, sub)
    for i, (im, label, s, after) in enumerate(pairs):
        panel(b, im, (pad + i * (w + gap), 250), w, label, s, after, crop_h)
    b.save(OUT / name, quality=88)
    print('✓', name, b.size)


def grid(name, title, sub, items, w, h, cols, gap=56):
    pad = 80
    rows = (len(items) + cols - 1) // cols
    W = pad * 2 + w * cols + gap * (cols - 1)
    H = 250 + rows * (74 + h + gap) + pad - gap
    b = Image.new('RGB', (W, H), PAPER)
    header(ImageDraw.Draw(b), pad, W, title, sub)
    for i, (f, lab, s) in enumerate(items):
        panel(b, S(f).crop((0, 0, S(f).width, round(S(f).width * h / w))), (pad + (i % cols) * (w + gap), 250 + (i // cols) * (74 + h + gap)), w, lab, s, True)
    b.save(OUT / name, quality=86)
    print('✓', name, b.size)


S = lambda n: Image.open(SRC / n)
board('avant-apres-ordinateur.jpg', [
    (S('now/desktop-top.png'), 'BEFORE', 'Current homepage: template, all-caps title, video still', False),
    (S('fin-00-top.png'), 'AFTER', 'New homepage: a magazine cover, their real photo, one accent color', True),
], 1100, 'Cameron Dental Studio: before / after', SUB)
board('avant-apres-mobile.jpg', [
    (S('now/mobile-top.png'), 'BEFORE', 'Current site, phone', False),
    (S('finm-00-top.png'), 'AFTER', 'New site, phone', True),
], 520, 'Before / after on a phone', SUB, crop_h=1125)

grid('nouvelle-page-sections.jpg', 'The new page, as a magazine issue', 'Real content from the studio: doctors, treatments, 18 real cases, reviews, insurance, contact', [
    ('fin-01-contents.png', 'P. 02 · CONTENTS', 'A table of contents; each line reveals a photo on hover'),
    ('fin-02-artist100.png', 'P. 03 · THE ARTIST', 'Dr. Cameron’s profile, credentials, a patient’s words'),
    ('fin-03-smiles150.png', 'P. 04 · FEATURE', 'One case up close, with the patient’s own review'),
    ('fin-04-.sheethead60.png', 'P. 04 · EIGHTEEN SMILES', 'The whole gallery; Before / After flips every photo in a wave'),
    ('case.png', 'ONE SMILE, UP CLOSE', 'Faces before / after; press and hold the close-up to see it before'),
    ('fin-05-treatments260.png', 'P. 05 · THE TREATMENTS', 'Eight tabs, written from their own treatment pages'),
    ('fin-06-comfort120.png', 'P. 06 · COMFORT', 'How nervous are you? The matching comfort option, from their texts'),
    ('fin-07-doctors380.png', 'P. 07 · THE DOCTORS', 'Five dentists; each card opens a short bio'),
    ('fin-08-letters60.png', 'P. 08 · LETTERS', 'Real reviews, sorted by what patients mention most'),
    ('fin-10-practical760.png', 'P. 10 · INSURANCE', 'Type your plan: their list of accepted PPO and discount plans'),
], 900, 563, 2)

phones = [('finm-00-top.png', 'COVER'), ('finm-03-.sheethead60.png', 'SMILES'), ('finm-04-treatments300.png', 'TREATMENTS'),
          ('finm-05-comfort560.png', 'COMFORT'), ('finm-06-letters60.png', 'LETTERS'), ('finm-07-visit60.png', 'BOOK A VISIT')]
pad, gap, w, h = 80, 40, 390, 844
W = pad * 2 + w * len(phones) + gap * (len(phones) - 1)
b = Image.new('RGB', (W, 250 + 74 + h + pad), PAPER)
header(ImageDraw.Draw(b), pad, W, 'On a phone', 'Same issue, one column; a call / book bar follows you down the page')
for i, (f, lab) in enumerate(phones):
    panel(b, S(f), (pad + i * (w + gap), 250), w, lab, '', True)
b.save(OUT / 'telephone.jpg', quality=86)
print('✓ telephone.jpg', b.size)
