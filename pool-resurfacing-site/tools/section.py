"""Coupe technique du bassin (section « Is it time? ») : un SVG au trait, à la manière d'un détail
d'architecte. Les six défauts sont dessinés à leur place ; les repères 1 à 6 répondent à la liste.

    python3 tools/section.py   → src/section.svg (inséré dans la page par build.mjs)
"""
import math
import random
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'src' / 'section.svg'
rnd = random.Random(7)
f = lambda v: f'{v:.1f}'.rstrip('0').rstrip('.')


def poly(pts):
    return ' '.join(f'{f(x)},{f(y)}' for x, y in pts)


# ——— géométrie (viewBox 720 × 560) ———
# eau côté droit ; mur à x = 180 (enduit), coque à x = 170…100, fond à y = 470 (enduit), 480…550 (coque)
WATER_TOP = 205  # niveau actuel
NORMAL = 160     # niveau normal

# 2. surface rugueuse : dents irrégulières
rough = [(372, 470)]
x = 372
while x < 452:
    x += rnd.uniform(2.6, 4.4)
    rough.append((min(x, 452), 470 - rnd.uniform(0.5, 4.2)))
rough.append((452, 470))

# 1. surface du béton mise à nu sous l'écaille
bare = [(270, 480)]
x = 270
while x < 332:
    x += rnd.uniform(3, 5)
    bare.append((min(x, 332), 480 - rnd.uniform(0, 1.6)))

# 4. dépôt calcaire : pointillé serré sur la surface, quelques particules en suspension
chalk = []
for _ in range(110):
    cx = rnd.uniform(590, 676)
    cy = 470 - abs(rnd.gauss(0, 1.7)) - 0.6
    chalk.append((cx, cy, rnd.uniform(0.7, 1.3)))
floating = [(rnd.uniform(596, 672), rnd.uniform(424, 462), rnd.uniform(0.9, 1.5)) for _ in range(14)]

# 3. taches : mouchetures dans l'épaisseur de l'enduit
specks = [(rnd.uniform(486, 554), rnd.uniform(471, 478), rnd.uniform(0.5, 1.2)) for _ in range(40)]

# 6. faïençage en plan : rayons + liaisons concentriques, irréguliers
CX, CY, R = 300, 288, 56
rays = []
n = 8
angles = [i * 2 * math.pi / n + rnd.uniform(-0.25, 0.25) for i in range(n)]
for a in angles:
    pts = [(CX + rnd.uniform(-1.5, 1.5), CY + rnd.uniform(-1.5, 1.5))]
    r = 0
    aa = a
    while r < R + 8:
        r += rnd.uniform(7, 12)
        aa += rnd.uniform(-0.18, 0.18)
        pts.append((CX + math.cos(aa) * r, CY + math.sin(aa) * r))
    rays.append(pts)
rings = []
for rr in (17, 31, 46):
    for i in range(n):
        if rnd.random() < 0.18:
            continue
        a0, a1 = angles[i], angles[(i + 1) % n] + (2 * math.pi if i == n - 1 else 0)
        mid = (a0 + a1) / 2 + rnd.uniform(-0.1, 0.1)
        r0, r1, rm = rr + rnd.uniform(-3, 3), rr + rnd.uniform(-3, 3), rr + rnd.uniform(-5, 2)
        rings.append([(CX + math.cos(a0) * r0, CY + math.sin(a0) * r0), (CX + math.cos(mid) * rm, CY + math.sin(mid) * rm), (CX + math.cos(a1) * r1, CY + math.sin(a1) * r1)])

# fissures en coupe dans le mur
cracks = []
for y0 in (292, 309):
    pts = [(181, y0)]
    x, y = 181, y0
    while x > 158:
        x -= rnd.uniform(3, 5)
        y += rnd.uniform(-2.2, 2.2)
        pts.append((x, y))
    cracks.append(pts)


def pin(n, cx, cy, lead):
    lx, ly = lead
    # le trait part du bord du cercle
    d = math.hypot(lx - cx, ly - cy)
    sx, sy = cx + (lx - cx) / d * 13, cy + (ly - cy) / d * 13
    return (f'<g class="pin" data-pin="{n}"><path class="lead ln" pathLength="1" d="M{f(sx)},{f(sy)} L{f(lx)},{f(ly)}"/>'
            f'<circle class="dot" cx="{cx}" cy="{cy}" r="13"/><text class="num" x="{cx}" y="{cy + 4.4}">{n}</text></g>')


svg = f'''<svg class="section" viewBox="0 26 720 534" role="img" aria-labelledby="sec-t sec-d">
<title id="sec-t">Section through an aged plaster pool</title>
<desc id="sec-d">Technical drawing of a pool edge in section: deck, coping, waterline tile, plaster finish over a gunite shell. Marked: 1 peeling plaster, 2 rough texture, 3 stains, 4 chalky residue, 5 water level below normal, 6 spider-web cracks, with a plan detail.</desc>
<defs>
  <pattern id="p-shell" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" class="hatch"/></pattern>
  <pattern id="p-soil" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="3" cy="4" r=".8" class="soil"/><circle cx="11" cy="9" r=".6" class="soil"/><circle cx="6" cy="13" r=".7" class="soil"/><circle cx="14" cy="2" r=".5" class="soil"/></pattern>
  <pattern id="p-water" width="22" height="9" patternUnits="userSpaceOnUse"><line x1="2" y1="4.5" x2="12" y2="4.5" class="wline"/></pattern>
  <clipPath id="c-plan"><circle cx="{CX}" cy="{CY}" r="{R}"/></clipPath>
</defs>

<!-- terre, coque, enduit -->
<path class="soil-fill" d="M0,130 H100 V420 A130,130 0 0 0 230,550 H720 V560 H0 Z"/>
<path class="shell" d="M100,130 H170 V420 A60,60 0 0 0 230,480 H720 V550 H230 A130,130 0 0 1 100,420 Z"/>
<path class="water" d="M181,{WATER_TOP} H720 V470 H230 A50,50 0 0 1 180,420 V{WATER_TOP} Z"/>
<path class="water-hatch" d="M181,{WATER_TOP} H720 V470 H230 A50,50 0 0 1 180,420 V{WATER_TOP} Z"/>
<path class="plaster" d="M170,178 H180 V420 A50,50 0 0 0 230,470 H720 V480 H230 A60,60 0 0 1 170,420 Z"/>

<!-- plage, margelle, frise de carrelage -->
<rect class="deck" x="0" y="112" width="72" height="18"/>
<path class="coping" d="M72,108 H185 A11,11 0 0 1 185,130 H72 Z"/>
<rect class="tile" x="170" y="132" width="11.5" height="46"/>
<path class="joint" d="M170,147.3 H181.5 M170,162.6 H181.5"/>

<!-- contours au trait -->
<path class="ln o" pathLength="1" d="M0,112 H72 M72,130 H0"/>
<path class="ln o" pathLength="1" d="M72,108 H185 A11,11 0 0 1 185,130 H72 Z"/>
<path class="ln o" pathLength="1" d="M100,130 V420 A130,130 0 0 0 230,550 H720"/>
<path class="ln o" pathLength="1" d="M181.5,132 V178 H180 V420 A50,50 0 0 0 230,470 H720"/>
<path class="ln s" pathLength="1" d="M170,132 V420 A60,60 0 0 0 230,480 H720"/>
<path class="ln s" pathLength="1" d="M170,132 H181.5"/>

<!-- niveaux d'eau -->
<path class="ln level-n" pathLength="1" d="M196,{NORMAL} H720"/>
<path class="ln level" pathLength="1" d="M181.5,{WATER_TOP} H720"/>
<path class="sym" d="M591,{NORMAL - 9} H605 L598,{NORMAL - 1} Z"/>
<path class="sym sym--on" d="M591,{WATER_TOP - 9} H605 L598,{WATER_TOP - 1} Z"/>
<path class="ln s" pathLength="1" d="M592,{WATER_TOP + 4} H604 M594.5,{WATER_TOP + 7.5} H601.5"/>

<!-- 1 · enduit qui s'écaille -->
<g class="def" data-def="1">
  <path class="water" d="M269,468.5 H333.5 V481 H269 Z"/><path class="water-hatch" d="M269,468.5 H333.5 V481 H269 Z"/>
  <polyline class="ln s acc" pathLength="1" points="{poly(bare)}"/>
  <path class="plaster acc-fill" d="M270,470 C292,466 312,458 335,449 L337,456.5 C315,465 294,473 270.5,480 Z"/>
  <path class="ln o acc" pathLength="1" d="M270,470 C292,466 312,458 335,449 L337,456.5 C315,465 294,473 270.5,480"/>
  <path class="ln o" pathLength="1" d="M230,470 H270 M333,470 H372"/>
</g>

<!-- 2 · surface rugueuse -->
<g class="def" data-def="2">
  <path class="water" d="M371,462 H453 V471 H371 Z"/><path class="water-hatch" d="M371,462 H453 V471 H371 Z"/>
  <polygon class="plaster" points="{poly(rough)} 452,480 372,480"/>
  <polyline class="ln o acc" pathLength="1" points="{poly(rough)}"/>
</g>

<!-- 3 · taches -->
<g class="def" data-def="3">
  <path class="stain acc-fill" d="M484,470.2 C500,469.6 538,469.8 556,470.2 L556,476 C540,478.5 502,478.8 484,475.5 Z"/>
  {''.join(f'<circle class="speck" cx="{f(x)}" cy="{f(y)}" r="{f(r)}"/>' for x, y, r in specks)}
</g>

<!-- 4 · dépôt calcaire -->
<g class="def" data-def="4">
  {''.join(f'<circle class="chalk acc-dot" cx="{f(x)}" cy="{f(y)}" r="{f(r)}"/>' for x, y, r in chalk)}
  {''.join(f'<circle class="float acc-dot" cx="{f(x)}" cy="{f(y)}" r="{f(r)}"/>' for x, y, r in floating)}
</g>

<!-- 5 · niveau en baisse : cote -->
<g class="def" data-def="5">
  <path class="ln dim acc" pathLength="1" d="M560,{NORMAL} V{WATER_TOP} M555,{NORMAL + 5} L565,{NORMAL - 5} M555,{WATER_TOP + 5} L565,{WATER_TOP - 5}"/>
</g>

<!-- 6 · faïençage : fissures en coupe et détail en plan -->
<g class="def" data-def="6">
  {''.join(f'<polyline class="ln crack acc" pathLength="1" points="{poly(c)}"/>' for c in cracks)}
  <path class="ln lead" pathLength="1" d="M184,300 L{f(CX - R - 1)},{f(CY + 6)}"/>
  <circle class="plan-bg" cx="{CX}" cy="{CY}" r="{R}"/>
  <g clip-path="url(#c-plan)">
    {''.join(f'<polyline class="ln crack-p acc" pathLength="1" points="{poly(r)}"/>' for r in rays)}
    {''.join(f'<polyline class="ln crack-p acc" pathLength="1" points="{poly(r)}"/>' for r in rings)}
  </g>
  <circle class="ln plan-ring" pathLength="1" cx="{CX}" cy="{CY}" r="{R}"/>
  <text class="lab" x="{CX}" y="{CY + R + 17}" text-anchor="middle">PLAN DETAIL</text>
</g>

<!-- légendes de structure -->
<g class="labels">
  <text class="lab" x="14" y="102">DECK</text>
  <path class="ln lead-s" pathLength="1" d="M206,96 L190,111"/><text class="lab" x="210" y="99">COPING</text>
  <path class="ln lead-s" pathLength="1" d="M206,143 L184,150"/><text class="lab" x="210" y="146">WATERLINE TILE</text>
  <text class="lab" x="712" y="{NORMAL - 6}" text-anchor="end">NORMAL LEVEL</text>
  <text class="lab" x="712" y="{WATER_TOP - 6}" text-anchor="end">CURRENT LEVEL</text>
  <path class="ln lead-s" pathLength="1" d="M664,504 L664,476"/><rect class="tag-bg" x="606" y="506" width="116" height="18" rx="2"/><text class="lab" x="664" y="519" text-anchor="middle">PLASTER FINISH</text>
  <rect class="tag-bg" x="398" y="506" width="104" height="18" rx="2"/><text class="lab" x="450" y="519" text-anchor="middle">GUNITE SHELL</text>
  <text class="lab lab--soft" x="22" y="300">SOIL</text>
</g>

<!-- cartouche -->
<g class="cartouche">
  <path class="ln s" pathLength="1" d="M472,58 H712"/>
  <text class="lab lab--title" x="472" y="48">SECTION A · AGED PLASTER POOL</text>
  <text class="lab lab--soft" x="472" y="74">NOT TO SCALE</text>
</g>

<!-- repères -->
{pin(1, 300, 404, (318, 457))}
{pin(2, 412, 404, (412, 466))}
{pin(3, 520, 404, (520, 472))}
{pin(4, 633, 404, (633, 464))}
{pin(5, 522, 182, (556, 182))}
{pin(6, 348, 240, (338, 250))}
</svg>
'''
OUT.write_text(svg)
print('✓', OUT, len(svg) // 1024, 'Ko')
