"""Planches de présentation (captures du site actuel et de la nouvelle version), en anglais pour le client.

La police est celle du site, Sofia Sans et Sofia Sans Extra Condensed, convertie en TTF statiques pour Pillow
(fontTools, varLib.instancer) : SofiaSans-Display (Extra Condensed, graisse 760), -Regular (430), -Medium (560), -Semibold (650).

    python3 tools/boards.py <captures du site actuel> <nouvelles captures> <dossier des TTF>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BEFORE, AFTER, TTF = (Path(a) for a in sys.argv[1:4])
OUT = Path(__file__).resolve().parent.parent / 'boards'
OUT.mkdir(exist_ok=True)
# les couleurs du site : fond « salt », bleu nuit du logo, texte secondaire, azur du logo
BG, INK, SOFT, AZURE, GREY, LINE = (242, 245, 248), (12, 36, 72), (61, 81, 112), (0, 156, 204), (170, 180, 190), (214, 222, 231)
SUB = 'custompoolsbyrobabel.com · website redesign concept, October 2026'


def font(name, size):
    return ImageFont.truetype(str(TTF / f'SofiaSans-{name}.ttf'), size)


def panel(board, im, xy, w, label, sub, after, crop=None):
    """Une capture avec son titre ; crop = (haut, bas) en fraction de la hauteur de la capture."""
    im = im.convert('RGB')
    if crop:
        im = im.crop((0, round(im.height * crop[0]), im.width, round(im.height * crop[1])))
    h = round(im.height * w / im.width)
    shot = im.resize((w, h), Image.LANCZOS)
    x, y = xy
    d = ImageDraw.Draw(board)
    d.ellipse((x, y + 9, x + 14, y + 23), fill=AZURE if after else GREY)
    d.text((x + 26, y - 2), label, font=font('Semibold', 27), fill=INK)
    if sub:
        d.text((x + 26, y + 34), sub, font=font('Regular', 21), fill=SOFT)
    top = y + 80
    d.rectangle((x - 1, top - 1, x + w, top + h), outline=LINE, width=1)
    board.paste(shot, (x, top))
    return top + h


def header(d, pad, title, sub):
    d.text((pad, 40), title, font=font('Display', 86), fill=INK)
    d.text((pad, 146), sub, font=font('Regular', 23), fill=SOFT)


def row(name, items, w, title, sub):
    """Des captures côte à côte : (image, titre, sous-titre, nouvelle version ?, recadrage)"""
    pad, gap = 80, 56
    hs = []
    for im, *_rest, crop in items:
        frac = (crop[1] - crop[0]) if crop else 1
        hs.append(round(im.height * frac * w / im.width))
    W = pad * 2 + w * len(items) + gap * (len(items) - 1)
    b = Image.new('RGB', (W, 226 + 80 + max(hs) + pad), BG)
    header(ImageDraw.Draw(b), pad, title, sub)
    for i, (im, lab, s, after, crop) in enumerate(items):
        panel(b, im, (pad + i * (w + gap), 226), w, lab, s, after, crop)
    b.save(OUT / name, quality=88)
    print('✓', name, b.size)


def grid(name, views, cols, w, title, sub, crop=None):
    """Des captures en grille : (fichier, titre, sous-titre[, recadrage propre à la capture, de même hauteur])"""
    pad, gap = 80, 56
    first = A(views[0][0])
    frac = (crop[1] - crop[0]) if crop else 1
    h = round(first.height * frac * w / first.width)
    W = pad * 2 + w * cols + gap * (cols - 1)
    rows = (len(views) + cols - 1) // cols
    b = Image.new('RGB', (W, 226 + rows * (80 + h + gap) + pad - gap), BG)
    header(ImageDraw.Draw(b), pad, title, sub)
    for i, (f, lab, s, *own) in enumerate(views):
        panel(b, A(f), (pad + (i % cols) * (w + gap), 226 + (i // cols) * (80 + h + gap)), w, lab, s, True, own[0] if own else crop)
    b.save(OUT / name, quality=86)
    print('✓', name, b.size)


B = lambda n: Image.open(BEFORE / n)
A = lambda n: Image.open(AFTER / n)

row('avant-apres-ordinateur.jpg', [
    (B('d-01.jpg'), 'Before', 'Current homepage: a grey box until its 22 MB video loads', False, None),
    (A('d-top.png'), 'After', 'New homepage: their own pool on the water, the lights coming on', True, None),
], 1100, 'Custom Pools by Rob Abel: before and after', SUB)

row('avant-apres-mobile.jpg', [
    (B('m-01.jpg'), 'Before', 'Current site on a phone', False, None),
    (A('m-top.png'), 'After', 'New site on a phone', True, None),
], 520, 'Before and after on a phone', SUB)

grid('lumieres.jpg', [
    ('d-light-0.png', 'Lights off', 'The page opens on their photo, at dusk, lights out'),
    ('d-light-1.png', 'The house, then each palm', 'Then the pool: each light comes on in turn, from the real photo'),
    ('d-top.png', 'Violet', 'How the pool was photographed'),
    ('d-light-aqua.png', 'Aqua', 'Simulated, and labeled as such on the page'),
    ('d-light-white.png', 'White', 'Simulated on the same photo'),
    ('d-light-off.png', 'Off', 'The visitor picks the pool light'),
], 3, 640, 'Lights on', 'Their photo is cut into light layers (the house, each palm, the pool): lit to the full, the layers give back the original')

grid('local-technique.jpg', [
    ('d-pump-flow.png', 'The water moves with the scroll', 'The circuit stays in place while the water runs through it'),
    ('d-pipe-clear.png', 'Clear PVC with UV', 'The water and the UV show through the pipe'),
    ('d-pipe-s40.png', 'Schedule 40', 'The plumbing options from their pump room page'),
    ('d-pipe-s80.png', 'Schedule 80', 'Same circuit, darker pipe'),
], 2, 900, 'The pump room, as a water circuit', 'Their signature: pool, pump, filter, chemistry controller, UV, heat pump and salt system, with their own photos', crop=(0.25, 0.85))

grid('nouvelle-page-sections.jpg', [
    ('d-rob.png', 'One builder', '30 years, the meeting at home, a pool made to be easy to keep'),
    ('d-pools.png', 'Two motorcycles, two fountains', 'A loop from their own film, and their photos'),
    ('d-water.png', 'On the water, after sunset', 'The pool from the top of the page, afternoon, dusk and night'),
    ('d-pump-room.png', 'The room behind the pool', 'Their quote, the brands they install, the room at night'),
    ('d-backyard.png', 'Everything around the water', 'The photo follows the list: fire pits, turf, kitchens'),
    ('d-how.png', 'A new pool, or the one you have', 'Their two processes, step by step'),
    ('d-salt.png', 'Chlorine or salt?', 'Their seven points: pick what matters, the beam leans'),
    ('d-area.png', 'Destin to 30A', 'A real map of the coast, drawn from U.S. Census data'),
    ('d-contact.png', 'Book an in-home meeting', 'The number in large type, a short form, their financing'),
    ('d-footer.png', 'Footer', 'Address, hours, towns, and every section'),
], 2, 900, 'The new page, section by section', 'Real content only: their texts, services, brands, photos, film, address, hours and contacts, nothing invented')

phones = [('m-top.png', 'Home'), ('m-pools.png', 'Pools'), ('m-pump-flow.png', 'Pump room'), ('m-backyard.png', 'Around the water'),
          ('m-how.png', 'New or existing'), ('m-salt.png', 'Chlorine or salt?'), ('m-contact.png', 'Contact'), ('m-menu.png', 'Menu')]
pad, gap, w = 80, 40, 390
h = round(A(phones[0][0]).height * w / A(phones[0][0]).width)
W = pad * 2 + w * 4 + gap * 3
b = Image.new('RGB', (W, 226 + 2 * (80 + h) + gap + pad), BG)
header(ImageDraw.Draw(b), pad, 'On a phone', 'The number one tap away at the top of every screen; the water circuit runs down the page')
for i, (f, lab) in enumerate(phones):
    panel(b, A(f), (pad + (i % 4) * (w + gap), 226 + (i // 4) * (80 + h + gap)), w, lab, '', True)
b.save(OUT / 'telephone.jpg', quality=86)
print('✓ telephone.jpg', b.size)

# chiffres mesurés (voir README) : Lighthouse mobile, mêmes réglages des deux côtés ; le site actuel en ligne, meilleur
# de quatre passages ; le nouveau servi en local et compressé, médiane de trois ; puis le contenu des deux sites
rows = [
    ('Performance (Lighthouse, phone)', '89', '89'),
    ('Accessibility', '84', '100'),
    ('Best practices', '61', '100'),
    ('SEO', '92', '100'),
    ('Main thread blocked while loading', '0.31 s', '0.08 s'),
    ('Downloaded while loading, on a phone', '1.2 MB', '0.5 MB'),
    ('Gallery', '5 stock photos, file names as captions', 'their own photos'),
    ('Names for the company', '3', '1'),
    ('Contact form', '250 countries, 7 address lines', 'name, phone, town'),
    ('Zoom on a phone', 'blocked', 'allowed'),
]
W, pad = 1900, 80
b = Image.new('RGB', (W, 300 + len(rows) * 92 + 80), BG)
d = ImageDraw.Draw(b)
header(d, pad, 'Measured, not promised', 'Lighthouse on a phone, same settings: the current site online, best of four runs; the new one on a test server, median of three')
cb, ca = W - pad - 1000, W - pad - 420
y = 250
d.text((cb, y), 'Before', font=font('Semibold', 24), fill=SOFT)
d.text((ca, y), 'After', font=font('Semibold', 24), fill=INK)
y += 50
for label, before, after in rows:
    d.line((pad, y, W - pad, y), fill=LINE, width=2)
    d.text((pad, y + 26), label, font=font('Medium', 31), fill=INK)
    d.text((cb, y + 25), before, font=font('Regular', 31), fill=SOFT)
    d.ellipse((ca - 30, y + 39, ca - 16, y + 53), fill=AZURE)
    d.text((ca, y + 18), after, font=font('Display', 44), fill=INK)
    y += 92
d.line((pad, y, W - pad, y), fill=LINE, width=2)
b.save(OUT / 'chiffres.jpg', quality=90)
print('✓ chiffres.jpg', b.size)
