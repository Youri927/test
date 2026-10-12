"""Sélection des photos : écrit data/photos.json (recadrages pour tools/images.py), data/gallery.json et data/options.json.

Les recadrages évitent le logo incrusté dans les photos d'origine. Ils partent du cadre 2:1 proposé pour chaque photo
(data/crops.json : le plus grand cadre au format 2:1 qui ne touche pas le logo repéré, marge de 14 px), ou d'un cadre fixé à la main.

    python3 -I tools/select.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
crops = json.loads((ROOT / 'data/crops.json').read_text())


def auto(name):
    c = crops[name]
    W, H = c['size']
    x0, y0, x1, y1 = c['box']
    return [x0 / W, y0 / H, x1 / W, y1 / H]


def square(name, pos=0.5):
    """Un carré pris dans le cadre 2:1 sans logo ; pos = 0 à gauche, 1 à droite."""
    c = crops[name]
    W, H = c['size']
    x0, y0, x1, y1 = c['box']
    side = y1 - y0
    left = x0 + (x1 - x0 - side) * pos
    return [left / W, y0 / H, (left + side) / W, y1 / H]


P = []  # data/photos.json


def add(id_, src, crop, w, ws=(), q=54):
    P.append({'id': id_, 'src': src, 'crop': [round(v, 4) for v in crop], 'w': w, 'q': q, **({'ws': list(ws)} if ws else {})})


# ——— ouverture : la même piscine au crépuscule, puis de nuit (photo de nuit recalée sur celle du crépuscule) ———
HB = [0 / 900, 40 / 1200, 870 / 900, 980 / 1200]
add('hero-day', 'pools_Prestige_Pools_Wilmington_0323_2.jpg', HB, 870, (480, 640), 56)
add('hero-night', 'derived/hero-night-aligned.png', HB, 870, (480, 640), 56)

# ——— la fibre, la pose, la visite ———
add('yard-air', 'DJI_0095.JPG', [0, 0, 1, 1], 800, (480,))
add('yard-air-w', 'DJI_0095.JPG', [0, 0.125, 1, 0.875], 800, (480,))
add('shell-set', 'who-we-are-sm.jpg', auto('who-we-are-sm.jpg'), 500)
# la chargeuse : cadrée sur la machine, au-dessus du tapis de protection posé au sol (qui ressemblait à un raccord en petit)
add('loader', 'Dump-action-shot.jpg', [71 / 700, 0, 583 / 700, 640 / 934], 512, (420,))
add('truck', '6-10-Work-vehicles.jpg', [0.455, 0, 1, 1], 330)
add('display-night', 'Prestige-Pools-Display-Pools-Night.jpg', [30 / 1040, 0, 856 / 1040, 413 / 617], 826, (480,), 58)

# ——— la nuit : la même forme libre éclairée en blanc, bleu et rouge (recalées sur la blanche) ———
LB = [0, 0, 1, 670 / 865]
add('lights-white', 'pools_Prestige_Pools_Wilmington_0322_4.jpg', LB, 1280, (760,), 58)
add('lights-blue', 'derived/lights-blue-aligned.png', LB, 1280, (760,), 58)
add('lights-red', 'derived/lights-red-aligned.png', LB, 1280, (760,), 58)
add('night-fire', 'pools_Prestige-Pools-Wilmington-0821-1.jpg', auto('pools_Prestige-Pools-Wilmington-0821-1.jpg'), 1280, (640,), 56)
add('night-pier', 'pools_Prestige-Pools-Wilmington-0821-3.jpg', auto('pools_Prestige-Pools-Wilmington-0821-3.jpg'), 1280, (640,), 56)
add('night-strings', 'pools_Prestige-Pools-of-Wilmington-outdoor-space-revised.jpg', auto('pools_Prestige-Pools-of-Wilmington-outdoor-space-revised.jpg'), 1040, (640,), 56)

# ——— spas ———
add('spa', 'pools_Prestige-Pools-Wilmington-0520-7.jpg', auto('pools_Prestige-Pools-Wilmington-0520-7.jpg'), 1274, (760,))
# de nuit, à côté de l'équipement : cadre 10:7 pris au-dessus du logo, sans les deux personnes à gauche
add('spa-night', 'pools_Prestige_Pools_Wilmington_0723_2.jpg', [160 / 1280, 0, 1121 / 1280, 673 / 865], 961, (520,), 56)

# ——— la galerie : 2:1, dans l'ordre d'affichage ———
G = [
    ('0423_1', 'pools_Prestige_Pools_Wilmington_0423_1.jpg', 'rect', 'A rectangular pool on bright turf behind a raised beach house, with palm trees along the fence.'),
    ('0124-3', 'pools_Prestige-Pools-Wilmington-0124-3.jpg', 'free spa', 'A freeform pool with a raised round stone spa beside a covered patio.'),
    ('0519-8', 'pools_Prestige-Pools-Wilmington-0519-8.jpg', 'free water', 'A freeform pool on a lawn under live oaks, with the sound just beyond.'),
    ('0724-2', 'pools_Prestige-Pools-Wilmington-0724-2.jpg', 'rect', 'A rectangular pool at sunset, with a gold sky over the neighborhood.'),
    ('0324-1', 'pools_Prestige-Pools-Wilmington-0324-1.jpg', 'rect', 'A rectangular pool with a wide concrete deck and a covered pavilion.'),
    ('1020-3', 'pools_Prestige-Pools-Wilmington-1020-3.jpg', 'free water', 'A freeform pool beside a waterway, with a dock and boat lift behind.'),
    ('0520-8', 'pools_Prestige-Pools-Wilmington-0520-8.jpg', 'rect spa', 'Aerial view of a white house with a rectangular pool and spa.'),
    ('0124-4', 'pools_Prestige-Pools-Wilmington-0124-4.jpg', 'rect spa', 'A modern rectangular pool with a raised spa and large pavers set in grass.'),
    ('0324-2', 'pools_Prestige-Pools-Wilmington-0324-2.jpg', 'free', 'A freeform pool behind a brick house, with umbrellas and lounge chairs.'),
    ('0821-3', 'pools_Prestige-Pools-Wilmington-0821-3.jpg', 'free water night', 'A pool glowing blue at sunset, with a long pier on the water behind it.'),
    ('0520-7', 'pools_Prestige-Pools-Wilmington-0520-7.jpg', 'spa water', 'A raised round spa spilling into the pool, with a boardwalk to the beach behind.'),
    ('0824-2', 'pools_Prestige-Pools-Wilmington-0824-2.jpg', 'rect', 'A rectangular pool with in-water loungers on the tanning ledge, under a white pergola.'),
    ('0719-5', 'pools_Prestige-Pools-Wilmington-0719-5.jpg', 'free night', 'A freeform pool lit blue at night under string lights.'),
    ('1023-9', 'pools_Prestige-Pools-Wilmington-1023-9.jpg', 'rect water', 'A rectangular pool with a travertine border, the marsh beyond the fence.'),
    ('0324-3', 'pools_Prestige-Pools-Wilmington-0324-3.jpg', 'rect spa', 'A raised stone spa at the end of a rectangular pool, framed by palms.'),
    ('0422_1', 'pools_Prestige_Pools_Wilmington_0422_1.jpg', 'free spa night', 'A spa and pool lit purple under a pink and blue sunset sky.'),
    ('1023-7', 'pools_Prestige-Pools-Wilmington-1023-7.jpg', 'free', 'A freeform pool reflecting palm trees and a clear sky.'),
    ('0524-3', 'pools_Prestige-Pools-Wilmington-0524-3.jpg', 'rect', 'A rectangular pool with lounge chairs and a wooden pavilion.'),
    ('0420-1', 'pools_Prestige-Pools-Wilmington-0420-1.jpg', 'rect spa', 'Aerial view straight down on a rectangular pool and spa beside a house.'),
    ('0724-5', 'pools_Prestige-Pools-Wilmington-0724-5.jpg', 'free spa', 'A freeform pool with an attached spa and a wide white deck.'),
    ('0821-1', 'pools_Prestige-Pools-Wilmington-0821-1.jpg', 'free water night', 'A lit pool and a fire bowl on a deck above the water at dusk.'),
    ('0922-1', 'pools_Prestige-Pools-Wilmington-0922-1.jpg', 'rect', 'A long, narrow rectangular pool between a beach house and a wood fence.'),
    ('1218-2', 'pools_Prestige_Pools_Wilmington_1218_2.jpg', 'rect water', 'A rectangular pool behind an aluminum fence, with trees and water beyond.'),
    ('0324-6', 'pools_Prestige-Pools-Wilmington-0324-6.jpg', 'rect', 'A rectangular pool with a travertine deck behind a two-story house.'),
    ('0922-5', 'pools_Prestige-Pools-Wilmington-0922-5.jpg', 'free', 'A freeform pool with bright Adirondack chairs on the deck.'),
    ('1023-4', 'pools_Prestige-Pools-Wilmington-1023-4.jpg', 'rect spa', 'A rectangular pool with a spa, facing a pool house with glass doors.'),
    ('0324-5', 'pools_Prestige-Pools-Wilmington-0324-5.jpg', 'free night', 'A freeform pool at night with deck jets arching into the lit water.'),
    ('0423_3', 'pools_Prestige_Pools_Wilmington_0423_3.jpg', 'rect', 'A rectangular pool behind beach houses, with a white picket fence.'),
    ('0723_2', 'pools_Prestige_Pools_Wilmington_0723_2.jpg', 'night', 'A pool and spa lit purple at night under uplit palm trees.'),
    ('1024-5', 'pools_Prestige-Pools-Wilmington-1024-5.jpg', 'rect', 'A rectangular pool with in-water loungers, in a yard lined with palms.'),
    ('0524-1', 'pools_Prestige-Pools-Wilmington-0524-1.jpg', 'rect spa', 'A rectangular pool and raised spa under palm trees and a blue sky.'),
    ('1023-5', 'pools_Prestige-Pools-Wilmington-1023-5.jpg', 'free', 'A freeform pool seen from above, ringed by palms and a curving deck.'),
    ('0324-10', 'pools_Prestige-Pools-Wilmington-0324-10.jpg', '', 'Sheer water descents falling from a stone wall into bright turquoise water.'),
    ('1218-4', 'pools_Prestige_Pools_Wilmington_1218_4.jpg', 'free', 'A small freeform pool with deck jets arching into it.'),
]
gallery = []
for key, src, tags, alt in G:
    gid = 'g-' + key.lower().replace('_', '-')
    add(gid, src, auto(src), 1280, (640,))
    gallery.append({'id': gid, 'tags': tags, 'alt': alt})

# ——— les options : une grande photo 2:1 par groupe, puis des carrés ———
O = {
    'water': [
        ('o-ledge', 'pools_Prestige-Pools-Wilmington-0824-2.jpg', 'wide', None, 'Tanning ledge', 'A shallow ledge to lounge in a few inches of water.', 'In-water loungers on a tanning ledge, under a white pergola.'),
        ('o-spillover', 'spas_Prestige-Pools-Wilmington-1022-2.jpg', 'sq', 0.45, 'Spillover spa', 'Raised above the pool, sharing its equipment.', 'A raised square spa in stacked stone, spilling into the pool.'),
        ('o-spa', 'spas_Prestige-Pools-Wilmington-1022-1.jpg', 'sq', 0.42, 'Stand-alone spa', 'With its own equipment, apart from the pool.', 'A round raised spa in stacked stone with a light coping.'),
        ('o-jets', 'pools_Prestige_Pools_Wilmington_1218_4.jpg', 'sq', 0.5, 'Deck jets', 'Crystal Fountains jets that arc into the pool.', 'Three deck jets arching into a small pool.'),
        ('o-cascade', 'Prestige-Pools-Wilmington-Cascades-0218.jpg', 'sq', 0.5, 'Cascades', 'Water features that start right in the coping.', 'A sheet of water falling from a stone wall into the pool.'),
        ('o-rocks', 'Prestige-Pools-Wilmington-0418-Waterfall1.jpg', 'sq', 0.45, 'Rock waterfalls', 'RicoRock waterfalls and boulders to jump from.', 'A stacked rock waterfall pouring into a pool.'),
        ('o-slide', 'pools_Prestige-Pools-Wilmington-1024-4.jpg', 'sq', 0.0, 'Slides', 'S.R. Smith slides, from the Cyclone to the BigRide.', 'A gray pool slide at the edge of a rectangular pool.'),
    ],
    'around': [
        ('o-stamped', 'decking_Prestige-Pools-Wilmington-0419-7.jpg', 'wide', None, 'Stamped concrete', 'Gray or color, pressed with shells and starfish if you like.', 'Stamped concrete deck with shells and a starfish pressed into it.'),
        ('o-seashell', 'outdoor-area_Prestige-Pools-051714.jpg', 'sq', 0.5, 'Seashell finish', 'Concrete with real shells exposed in the surface.', 'Close-up of seashell-finish concrete with crushed shells in it.'),
        ('o-coping', 'outdoor-area_Prestige-Pools-051715.jpg', 'sq', 0.5, 'Coping', 'The rounded edge between the water and the deck.', 'Close-up of a rounded coping edge between seashell concrete and pool water.'),
        ('o-stone', 'decking_Prestige-Pools-Wilmington-0420-2.jpg', 'sq', 0.5, 'Stamped stone', 'Concrete stamped in a cut-stone pattern.', 'Concrete deck stamped in a cut-stone pattern.'),
        ('o-travertine', 'Prestige-Pools-Wilmington-Aruba-0218.jpg', 'sq', 0.3, 'Travertine', 'Travertine decking and coping, here with stepping stones.', 'A freeform pool with travertine decking and stepping stones set in black pebbles.'),
        ('o-pavers', 'pools_Prestige-Pools-Wilmington-0524-5.jpg', 'sq', 0.75, 'Pavers', 'Paver decks and coping in your choice of color.', 'A rectangular pool with a gray paver deck.'),
        ('o-fence', 'pools_Prestige-Pools-Wilmington-0424-5.jpg', 'sq', 0.4, 'Fences and gates', 'Pool barrier compliant, so the pool is closed when you want it to be.', 'A rectangular pool behind a black mesh safety fence.'),
    ],
    'back': [
        ('o-firepit', 'outdoor-area_Prestige-Pools-Wilmington-0220-3.jpg', 'wide', None, 'Fire pits', 'Stone fire pits, with a place for the firewood.', 'A stone fire pit circled by white Adirondack chairs, with a firewood rack behind.'),
        ('o-fireplace', 'pools_Prestige-Pools-Wilmington-1024-3.jpg', 'sq', 0.75, 'Fireplaces', 'Outdoor stone fireplaces and seating areas.', 'An outdoor stone fireplace with sofas on a stamped concrete patio.'),
        ('o-kitchen', 'outdoor-area_Prestige-Pools-Wilmington-1123-1.jpg', 'sq', 0.55, 'Outdoor kitchens', 'Built-in grills and counters by the pool.', 'An outdoor kitchen with a built-in grill and white cabinets.'),
        ('o-pergola', 'outdoor-area_Prestige_Pools_Wilmington_1118_2.jpg', 'sq', 0.45, 'Pergolas', 'Shade over the deck, or right over the water.', 'A white pergola beside a rectangular pool.'),
        ('o-gazebo', 'outdoor-area_Prestige-Pools-Wilmington-0419-9.jpg', 'sq', 0.5, 'Gazebos', 'A covered room by the pool.', 'A metal gazebo with sofas and curtains on a concrete deck.'),
        ('o-shower', 'outdoor-area_Prestige-Pools-Wilmington-Shower.jpg', 'sq', 0.45, 'Outdoor showers', 'Rinse off on the way in.', 'An outdoor shower against a brick wall.'),
        ('o-enclosure', 'pools_Prestige_Pools_Wilmington_1117_3.jpg', 'sq', 0.35, 'Pool enclosures', 'Keep swimming after the weather cools down.', 'A pool inside a screened enclosure.'),
    ],
}
options = {}
for group, rows in O.items():
    options[group] = []
    for id_, src, kind, pos, title, text, alt in rows:
        if kind == 'wide':
            add(id_, src, auto(src), 1100, (640,))
        else:
            add(id_, src, square(src, pos), 640, (360,))
        options[group].append({'id': id_, 'wide': kind == 'wide', 'title': title, 'text': text, 'alt': alt})

(ROOT / 'data/photos.json').write_text(json.dumps(P, indent=1) + '\n')
(ROOT / 'data/gallery.json').write_text(json.dumps(gallery, indent=1) + '\n')
(ROOT / 'data/options.json').write_text(json.dumps(options, indent=1) + '\n')
print(len(P), 'photos,', len(gallery), 'dans la galerie,', sum(len(v) for v in options.values()), 'options')
