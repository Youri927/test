"""Planches de présentation (captures du site actuel et de la nouvelle version), en anglais pour le client.

La police est celle du site, Instrument Sans, convertie en TTF statiques pour Pillow (fontTools, varLib.instancer) :
InstrumentSans-Display (chasse 84, graisse 560), -Regular (100, 420), -Medium (100, 520), -Semibold (100, 600).

    python3 tools/boards.py <dossier des captures du site actuel> <dossier des nouvelles captures> <dossier des TTF>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BEFORE, AFTER, TTF = (Path(a) for a in sys.argv[1:4])
OUT = Path(__file__).resolve().parent.parent / 'boards'
OUT.mkdir(exist_ok=True)
BG, INK, SOFT, TEAL, GREY, LINE = (237, 243, 242), (11, 35, 38), (58, 83, 86), (35, 172, 172), (170, 184, 184), (211, 222, 221)
SUB = 'naplescomprehensivedentist.com · website redesign concept, October 2026'


def font(name, size):
    return ImageFont.truetype(str(TTF / f'InstrumentSans-{name}.ttf'), size)


def panel(board, im, xy, w, label, sub, after, crop_h=None):
    im = im.convert('RGB')
    if crop_h:
        im = im.crop((0, 0, im.width, min(im.height, round(crop_h * im.width / w))))
    h = round(im.height * w / im.width)
    shot = im.resize((w, h), Image.LANCZOS)
    x, y = xy
    d = ImageDraw.Draw(board)
    d.ellipse((x, y + 6, x + 13, y + 19), fill=TEAL if after else GREY, outline=INK if after else None)
    d.text((x + 26, y - 2), label, font=font('Semibold', 23), fill=INK)
    if sub:
        d.text((x + 26, y + 30), sub, font=font('Regular', 19), fill=SOFT)
    top = y + 76
    d.rectangle((x - 1, top - 1, x + w, top + h), outline=LINE, width=1)
    board.paste(shot, (x, top))
    return top + h


def header(d, pad, title, sub):
    d.text((pad, 48), title, font=font('Display', 66), fill=INK)
    d.text((pad, 140), sub, font=font('Regular', 21), fill=SOFT)


def row(name, items, w, title, sub, crop_h=None, src=AFTER):
    """Des captures côte à côte : (fichier ou image, titre, sous-titre, nouvelle version ?)"""
    pad, gap = 80, 56
    ims = [(Image.open(src / f) if isinstance(f, str) else f, lab, s, after) for f, lab, s, after in items]
    hs = [min(round(im.height * w / im.width), crop_h) if crop_h else round(im.height * w / im.width) for im, *_ in ims]
    W = pad * 2 + w * len(ims) + gap * (len(ims) - 1)
    b = Image.new('RGB', (W, 220 + 76 + max(hs) + pad), BG)
    header(ImageDraw.Draw(b), pad, title, sub)
    for i, (im, lab, s, after) in enumerate(ims):
        panel(b, im, (pad + i * (w + gap), 220), w, lab, s, after, crop_h)
    b.save(OUT / name, quality=88)
    print('✓', name, b.size)


def grid(name, views, cols, w, ratio, title, sub):
    pad, gap = 80, 56
    h = round(w * ratio)
    W = pad * 2 + w * cols + gap * (cols - 1)
    rows = (len(views) + cols - 1) // cols
    b = Image.new('RGB', (W, 220 + rows * (76 + h + gap) + pad - gap), BG)
    header(ImageDraw.Draw(b), pad, title, sub)
    for i, (f, lab, s) in enumerate(views):
        panel(b, Image.open(AFTER / f), (pad + (i % cols) * (w + gap), 220 + (i // cols) * (76 + h + gap)), w, lab, s, True)
    b.save(OUT / name, quality=86)
    print('✓', name, b.size)


B = lambda n: Image.open(BEFORE / n)

row('avant-apres-ordinateur.jpg', [
    (B('desktop-home-top.png'), 'Before', 'Current homepage: a Shopify store, a generic headline, no phone link', False),
    ('d-top.png', 'After', 'New homepage: what they do in one sentence, and Dr. Fakhoury’s smile in the middle of it', True),
], 1100, 'Implant and Comprehensive Dentistry of Naples: before and after', SUB, src=AFTER)

row('avant-apres-mobile.jpg', [
    (B('mobile-home-top.png'), 'Before', 'Current site on a phone', False),
    ('m-top.png', 'After', 'New site on a phone', True),
], 520, 'Before and after on a phone', SUB, crop_h=1125)

items = [('d-top.png', 'On arrival', 'The headline, with his smile in a pill', True),
         ('d-open-mid.png', 'As you scroll', 'The pill opens up over the page', True),
         ('d-open-end.png', 'Meet your dentist', 'His whole portrait, his name on the wall', True)]
row('ouverture.jpg', items, 760, 'The opening', 'The smile in the headline opens into the full portrait of Dr. Fakhoury: the first thing patients see is the person who treats them')

items = [('d-sed-1.png', 'Nitrous oxide', 'Laughing gas: relaxed', True),
         ('d-sed-2.png', 'Conscious sedation', 'Relaxed, and you won’t remember', True),
         ('d-sed-3.png', 'IV sedation', 'You sleep through it', True)]
row('sedation.jpg', items, 760, 'As calm as you need to be', 'Three levels of sedation: as you scroll or pick a level, the light of the section dims with it')

grid('nouvelle-page-sections.jpg', [
    ('d-implants.png', 'Implants', 'Their own logo becomes the diagram: crown, abutment, implant'),
    ('d-race.png', 'A permanent crown in one visit', 'The usual way against their E4D crowns, as you scroll'),
    ('d-treatments.png', 'And everything in between', 'Every treatment, filed under what patients actually say'),
    ('d-sheet.png', 'The full story, one tap away', 'Each line opens the complete text of their treatment pages'),
    ('d-doctor.png', 'From Michigan to New York to Naples', 'His path on a real map, his training, his work'),
    ('d-visit.png', 'Our new office is open', 'Address, directions, hours with today highlighted, emergency line'),
    ('d-request.png', 'Request a visit', 'A short form, pre-filled from the treatment you were reading'),
    ('d-footer.png', 'Everything at the bottom too', 'Treatments, office hours and every way to reach them'),
], 2, 900, 900 / 1440, 'The new page, section by section', 'Real content only: their texts, services, photos, hours and contact details, nothing invented')

phones = [('m-top.png', 'Home'), ('m-open-end.png', 'Dr. Fakhoury'), ('m-implants.png', 'Implants'), ('m-race.png', 'Same-day crowns'),
          ('m-treatments.png', 'Treatments'), ('m-sedation.png', 'Sedation'), ('m-doctor.png', 'His path'), ('m-request.png', 'Request a visit')]
pad, gap, w, h = 80, 40, 390, 844
W = pad * 2 + w * 4 + gap * 3
b = Image.new('RGB', (W, 220 + 2 * (76 + h) + gap + pad), BG)
header(ImageDraw.Draw(b), pad, 'On a phone', 'Built for phones: every number is one tap away, and a call / request bar follows you down the page')
for i, (f, lab) in enumerate(phones):
    panel(b, Image.open(AFTER / f), (pad + (i % 4) * (w + gap), 220 + (i // 4) * (76 + h + gap)), w, lab, '', True)
b.save(OUT / 'telephone.jpg', quality=86)
print('✓ telephone.jpg', b.size)

# chiffres mesurés (voir README) : audit Lighthouse mobile et trace de performance Chrome, mêmes réglages des deux côtés
rows = [
    ('Accessibility', '93', '100'),
    ('Best practices', '100', '100'),
    ('SEO', '100', '100'),
    ('First screen on a throttled phone (LCP)', '4.4 s', '1.8 s'),
    ('Phone numbers you can tap', 'none', 'all'),
    ('Template leftovers (“Button label”, “Image slide”…)', 'on 4 pages', 'none'),
    ('Appointment request', 'an empty page', 'a form with checks'),
]
W, pad = 1760, 80
b = Image.new('RGB', (W, 300 + len(rows) * 92 + 120), BG)
d = ImageDraw.Draw(b)
header(d, pad, 'Measured, not promised', 'Lighthouse mobile audit and Chrome performance trace (Slow 4G, 4× slower processor) on both sites')
y = 250
d.text((W - pad - 760, y), 'Before', font=font('Semibold', 22), fill=SOFT)
d.text((W - pad - 400, y), 'After', font=font('Semibold', 22), fill=INK)
y += 50
for label, before, after in rows:
    d.line((pad, y, W - pad, y), fill=LINE, width=2)
    d.text((pad, y + 26), label, font=font('Medium', 30), fill=INK)
    d.text((W - pad - 760, y + 24), before, font=font('Regular', 32), fill=SOFT)
    d.ellipse((W - pad - 430, y + 38, W - pad - 416, y + 52), fill=TEAL, outline=INK)
    d.text((W - pad - 400, y + 22), after, font=font('Display', 36), fill=INK)
    y += 92
d.line((pad, y, W - pad, y), fill=LINE, width=2)
b.save(OUT / 'chiffres.jpg', quality=90)
print('✓ chiffres.jpg', b.size)
