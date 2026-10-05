"""Échantillons des finitions de bassin, vus de dessus, à l'échelle réelle et raccordables sans couture.

Chaque texture couvre environ 25 cm de fond de bassin (1 px ≈ 0,24 mm) : galets de 6 à 10 mm pour le
Pebble Tec, de 1 à 2 mm pour le Pebble Sheen, billes de verre de 2 à 3 mm pour le Beadcrete, mosaïque
de 25 mm pour le carrelage de verre. Ce sont des rendus de matière (relief, ombre, brillance),
pas des photos : ils servent à comparer les finitions, sous l'eau, dans le configurateur du site.
L'éclairage est volontairement doux : l'eau et les caustiques sont ajoutées par le shader du site.

    python3 tools/finishes.py                  → src/img/fin-*.webp (calculées en 1024 px, enregistrées en 768)
    python3 tools/finishes.py quartz beadcrete → seulement celles-ci
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.spatial import cKDTree

OUT = Path(__file__).resolve().parent.parent / 'textures'
OUT.mkdir(parents=True, exist_ok=True)
LIGHT = np.array([-0.38, -0.5, 0.78])
LIGHT /= np.linalg.norm(LIGHT)
HALF = LIGHT + np.array([0, 0, 1.0])
HALF /= np.linalg.norm(HALF)


def hexrgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255


def freqs(n):
    k = np.fft.fftfreq(n)
    return k[:, None], k[None, :]


def noise(n, lo, hi, seed, beta=1.0):
    """Bruit périodique filtré entre deux échelles (en px), moyenne 0, écart-type 1."""
    r = np.random.default_rng(seed)
    f = np.fft.fft2(r.standard_normal((n, n)))
    kx, ky = freqs(n)
    k = np.sqrt(kx ** 2 + ky ** 2)
    k[0, 0] = 1e-9
    band = (k >= 1 / hi) & (k <= 1 / lo)
    soft = np.exp(-((np.log(k) - np.log(np.sqrt(1 / hi * 1 / lo))) ** 2) / 2.2)
    f *= np.where(band, 1, soft * 0.15) * k ** (-beta / 2)
    f[0, 0] = 0
    x = np.real(np.fft.ifft2(f))
    return (x - x.mean()) / (x.std() + 1e-9)


def aniso(n, lo, hi, seed, angle, stretch):
    """Bruit étiré dans une direction (veines, coulures du verre)."""
    r = np.random.default_rng(seed)
    f = np.fft.fft2(r.standard_normal((n, n)))
    kx, ky = freqs(n)
    c, s = np.cos(angle), np.sin(angle)
    u, v = kx * c + ky * s, (-kx * s + ky * c) * stretch
    k = np.sqrt(u * u + v * v)
    k[0, 0] = 1e-9
    f *= np.exp(-((np.log(k) - np.log(np.sqrt(1 / hi * 1 / lo))) ** 2) / 1.6)
    f[0, 0] = 0
    x = np.real(np.fft.ifft2(f))
    return (x - x.mean()) / (x.std() + 1e-9)


def blur(x, s):
    """Flou gaussien périodique (s en px)."""
    n = x.shape[0]
    kx, ky = freqs(n)
    g = np.exp(-2 * (np.pi * s) ** 2 * (kx ** 2 + ky ** 2))
    if x.ndim == 3:
        return np.stack([np.real(np.fft.ifft2(np.fft.fft2(x[..., i]) * g)) for i in range(x.shape[2])], -1)
    return np.real(np.fft.ifft2(np.fft.fft2(x) * g))


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def poisson(n, r, seed, tries=None):
    """Points espacés d'au moins r, sur un tore de côté n (tirage par cellules)."""
    rng = np.random.default_rng(seed)
    cell = r / np.sqrt(2)
    g = int(np.ceil(n / cell))
    grid = -np.ones((g, g), int)
    pts = []
    m = tries or int((n / r) ** 2 * 6)
    for p in rng.random((m, 2)) * n:
        gx, gy = int(p[0] / cell) % g, int(p[1] / cell) % g
        if grid[gx, gy] >= 0:
            continue
        ok = True
        for dx in (-2, -1, 0, 1, 2):
            for dy in (-2, -1, 0, 1, 2):
                j = grid[(gx + dx) % g, (gy + dy) % g]
                if j >= 0:
                    d = np.abs(pts[j] - p)
                    d = np.minimum(d, n - d)
                    if d[0] * d[0] + d[1] * d[1] < r * r:
                        ok = False
                        break
            if not ok:
                break
        if ok:
            grid[gx, gy] = len(pts)
            pts.append(p)
    return np.array(pts)


def grains(n, pts, a, b, theta, seed, k=8, wobble=0.0, angular=False):
    """Pour chaque pixel : grain le plus proche (distance de forme, 1 = bord), cette distance et la suivante.

    wobble déforme le contour (harmoniques 3 à 5, galets irréguliers) ; angular donne des éclats à facettes.
    """
    rng = np.random.default_rng(seed)
    m = len(pts)
    w = rng.uniform(0, wobble, (m, 3)) if wobble else None
    ph = rng.uniform(0, 2 * np.pi, (m, 3))
    oc = rng.uniform(0.6, 0.76, m)
    tree = cKDTree(pts, boxsize=n)
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32) + 0.5
    q = np.stack([xx.ravel(), yy.ravel()], 1)
    _, idx = tree.query(q, k=k)
    best = np.full(q.shape[0], 9.0, np.float32)
    second = best.copy()
    bi = np.zeros(q.shape[0], int)
    for j in range(k):
        i = idx[:, j]
        d = q - pts[i]
        d = (d + n / 2) % n - n / 2
        c, s = np.cos(theta[i]), np.sin(theta[i])
        u = (d[:, 0] * c + d[:, 1] * s) / a[i]
        v = (-d[:, 0] * s + d[:, 1] * c) / b[i]
        if angular:
            au, av = np.abs(u), np.abs(v)
            rho = np.maximum(np.maximum(au, av), (au + av) * oc[i])
        else:
            rho = np.sqrt(u * u + v * v)
        if wobble:
            phi = np.arctan2(v, u)
            rho = rho / (1 + w[i, 0] * np.cos(3 * phi + ph[i, 0]) + w[i, 1] * np.cos(4 * phi + ph[i, 1]) + w[i, 2] * np.cos(5 * phi + ph[i, 2]))
        better = rho < best
        second = np.where(better, best, np.minimum(second, rho))
        best = np.where(better, rho, best)
        bi = np.where(better, i, bi)
    return bi.reshape(n, n), best.reshape(n, n), second.reshape(n, n)


def normals(h, strength):
    gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5 * strength
    gy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5 * strength
    l = np.sqrt(gx * gx + gy * gy + 1)
    return -gx / l, -gy / l, 1 / l


def cavity(h, s, k, lo=0.45):
    """Occlusion : ce qui est plus bas que son voisinage reçoit moins de lumière."""
    return np.clip(1 - k * np.maximum(blur(h, s) - h, 0), lo, 1)


def shade(albedo, h, strength, spec=0.1, shine=40, ao=None, amb=0.62, diff=0.42):
    nx, ny, nz = normals(h, strength)
    d = np.clip(nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2], 0, 1)
    hs = np.clip(nx * HALF[0] + ny * HALF[1] + nz * HALF[2], 0, 1) ** shine
    s = spec if np.ndim(spec) == 0 else spec[..., None]
    out = albedo * (amb + diff * d)[..., None]
    if ao is not None:
        out *= ao[..., None]
    return out + hs[..., None] * s


def save(img, name, q=80, size=None):
    """Enregistre en WebP ; size : réduction en gardant le raccord (l'image est rééchantillonnée sur 3 × 3 tuiles)."""
    a = (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)
    im = Image.fromarray(a)
    if size and size != a.shape[0]:
        n = a.shape[0]
        big = Image.fromarray(np.tile(a, (3, 3, 1))).resize((size * 3, size * 3), Image.LANCZOS)
        im = big.crop((size, size, size * 2, size * 2))
    im.save(OUT / f'{name}.webp', 'WEBP', quality=q, method=6)
    print('✓', name, im.size[0])


def palette(cols, m, rng, weights=None, spread=(0.9, 1.08)):
    c = np.array([hexrgb(x) for x in cols])
    pick = rng.choice(len(c), m, p=weights)
    return c[pick] * rng.uniform(*spread, (m, 1))


def sand(n, base, seed, mott=0.025, grain=0.05):
    """Ciment ou enduit : marbrure lente et grain de sable."""
    c = hexrgb(base)[None, None, :] * (1 + mott * noise(n, 60, 500, seed)[..., None])
    return c * (1 + grain * noise(n, 0.8, 2.2, seed + 1)[..., None])


def stones(n, r, seed, cols, weights=None, axes=(0.56, 0.74), squash=(0.62, 0.92), bump=3.0, spec=0.07, shine=30,
           matrix='#A9A499', expose=0.62, wobble=0.07, veins=0.25, grain=0.11, level=0.22):
    """Agrégat de galets roulés, noyés dans le ciment puis dégagés à l'acide : dessus presque plat, bords arrondis."""
    rng = np.random.default_rng(seed)
    pts = poisson(n, r, seed)
    m = len(pts)
    a = rng.uniform(*axes, m) * r
    b = a * rng.uniform(*squash, m)
    th = rng.uniform(0, np.pi, m)
    gi, rho, rho2 = grains(n, pts, a, b, th, seed + 1, wobble=wobble)
    depth = rng.uniform(0.86, 1.0, m)[gi]
    top = smooth(1.0, 1 - expose * 0.6, rho)
    h_stone = (0.5 + 0.5 * top + 0.08 * (1 - np.minimum(rho, 1) ** 2)) * depth
    level = level + 0.05 * noise(n, 3, 40, seed + 2)
    meniscus = 0.16 * np.exp(-np.maximum(rho - 1, 0) / 0.12) * (rho >= 1)
    h_cem = level + meniscus
    inside = (rho < 1) & (h_stone > h_cem)
    h = np.where(inside, h_stone, h_cem)
    # couleur : chaque galet a son grain (granite, quartzite) et parfois une veine claire
    alb = palette(cols, m, rng, weights)
    tex = 1 + grain * noise(n, 0.8, 2.5, seed + 3) + 0.06 * noise(n, 4, 24, seed + 4)
    stone = alb[gi] * tex[..., None]
    vein = (np.abs(aniso(n, 6, 30, seed + 5, 0.7, 3.0)) < 0.06) & (rng.random(m) < veins)[gi]
    stone = np.where(vein[..., None], stone * 0.6 + 0.4 * hexrgb('#EEEAE2'), stone)
    stone *= (0.86 + 0.14 * top)[..., None]
    mat = sand(n, matrix, seed + 6, grain=0.09)
    albedo = np.where(inside[..., None], stone, mat)
    # deux galets qui se touchent : un trait d'ombre fin
    seam = inside & (rho2 - rho < 0.06)
    albedo = np.where(seam[..., None], albedo * 0.6, albedo)
    ao = cavity(h, r * 0.35, 2.0) * np.where(inside, 1.0, 0.9)
    return shade(albedo, h, bump, np.where(inside, spec * top, 0.015), shine, ao)


def chips(n, layers, seed, base, mott=0.025, polish=0.0, bump=1.6, base_grain=0.05):
    """Enduit chargé d'éclats anguleux (quartz, agrégats, verre), en plusieurs tailles, poncé ou non."""
    albedo = sand(n, base, seed, mott=mott, grain=base_grain)
    h = 0.03 * noise(n, 2, 20, seed + 1)
    specm = np.full((n, n), 0.02, np.float32)
    for li, (r, density, cols, weights, sz) in enumerate(layers):
        rng = np.random.default_rng(seed + 10 * (li + 1))
        pts = poisson(n, r, seed + 10 * (li + 1))
        m = len(pts)
        a = rng.uniform(*sz, m) * r
        b = a * rng.uniform(0.5, 0.95, m)
        th = rng.uniform(0, np.pi, m)
        gi, rho, _ = grains(n, pts, a, b, th, seed + 10 * li + 3, k=6, wobble=0.12, angular=True)
        keep = rng.random(m) < density
        inside = (rho < 1) & keep[gi]
        alb = palette(cols, m, rng, weights)
        facet = rng.uniform(0.85, 1.12, m)[gi]
        col = alb[gi] * (facet * (1 + 0.05 * noise(n, 0.8, 2, seed + li)))[..., None]
        albedo = np.where(inside[..., None], col, albedo)
        lift = (1 - polish) * 0.35 * np.clip(1 - rho, 0, 1) ** 0.3
        h = np.where(inside, h + lift, h)
        specm = np.where(inside, 0.08 + 0.12 * polish, specm)
    ao = cavity(h, 2.5, 1.5, 0.7)
    return shade(albedo, h, bump, specm, 60, ao, amb=0.66, diff=0.36)


def plaster(n, seed, base='#EDF0EC'):
    """Enduit blanc (marcite) : presque uni, une marbrure à peine visible et les passes de la lisseuse."""
    c = sand(n, base, seed, mott=0.008, grain=0.018)
    yy, xx = np.mgrid[0:n, 0:n] / n * 2 * np.pi
    arcs = np.sin(4 * np.sin(xx + 0.6 * np.sin(yy * 2)) + 7 * yy + 0.8 * np.sin(3 * xx))
    trowel = smooth(0.85, 1.0, arcs) * (0.5 + 0.5 * noise(n, 80, 400, seed + 3))
    c = c * (1 - 0.012 * trowel)[..., None]
    h = 0.02 * noise(n, 1.5, 8, seed + 4) + 0.04 * trowel
    return shade(c, h, 3, 0.02, 20, amb=0.7, diff=0.32)


def beads(n, seed, cols, weights=None, r=11.0, matrix='#C4C8C4'):
    """Billes de verre de 2 à 3 mm dans le ciment, plus ou moins dégagées : reflet net, lumière qui traverse."""
    rng = np.random.default_rng(seed)
    pts = poisson(n, r, seed)
    m = len(pts)
    a = rng.uniform(0.44, 0.54, m) * r
    gi, rho, _ = grains(n, pts, a, a.copy(), np.zeros(m), seed + 1, k=6)
    vis = rng.uniform(0.72, 1.0, m)[gi]  # bille plus ou moins enfoncée : on n'en voit qu'un disque
    inside = rho < vis
    rr = np.clip(rho / vis, 0, 1)
    dome = np.sqrt(np.clip(1 - rr ** 2, 0, 1))
    base = palette(cols, m, rng, weights, (0.92, 1.06))[gi]
    yy, xx = np.mgrid[0:n, 0:n] + 0.5
    p = pts[gi]
    dx = ((xx - p[..., 0] + n / 2) % n - n / 2) / (a[gi] * vis)
    dy = ((yy - p[..., 1] + n / 2) % n - n / 2) / (a[gi] * vis)
    # le verre concentre la lumière du côté opposé à la source
    glow = np.exp(-((dx - 0.32) ** 2 + (dy - 0.38) ** 2) / 0.12)
    body = base * (0.62 + 0.38 * dome)[..., None] + base * glow[..., None] * 0.45
    mat = sand(n, matrix, seed + 2, grain=0.08)
    albedo = np.where(inside[..., None], body, mat)
    h = np.where(inside, 0.3 + 0.7 * dome, 0.25 + 0.04 * noise(n, 2, 20, seed + 3))
    ao = cavity(h, 4, 1.6, 0.55)
    return shade(albedo, h, 4, np.where(inside, 0.55, 0.02), 120, ao)


def tile(n, seed, cols, tiles=10, grout_mm=2.0, grout='#CED3CF'):
    """Mosaïque de verre 25 mm : carreaux un peu irréguliers, verre coulé à l'intérieur, joint en retrait."""
    rng = np.random.default_rng(seed)
    s = n / tiles
    g = grout_mm / 0.244
    yy, xx = np.mgrid[0:n, 0:n] + 0.5
    tx, ty = (xx // s).astype(int) % tiles, (yy // s).astype(int) % tiles
    tid = ty * tiles + tx
    t = tiles * tiles
    jx, jy = rng.uniform(-2.5, 2.5, t), rng.uniform(-2.5, 2.5, t)
    shrink = rng.uniform(0, 2.0, t)
    fx = xx % s - s / 2 - jx[tid]
    fy = yy % s - s / 2 - jy[tid]
    half = s / 2 - g / 2 - shrink[tid]
    e = half - np.maximum(np.abs(fx), np.abs(fy))
    corner = np.sqrt(np.maximum(np.abs(fx) - half + 5, 0) ** 2 + np.maximum(np.abs(fy) - half + 5, 0) ** 2)
    e = np.minimum(e, 5 - corner)
    inside = e > 0
    alb = palette(cols, t, rng, None, (0.9, 1.08))[tid]
    ang = rng.uniform(0, np.pi, t)[tid]
    streak = np.where(ang < np.pi / 2, aniso(n, 16, 140, seed + 2, 0.4, 2.5), aniso(n, 16, 140, seed + 3, 2.0, 2.5))
    cloud = noise(n, 24, 220, seed + 4)
    glass = 1 + 0.025 * streak + 0.06 * cloud
    # reflet doux du ciel sur le verre, en biais sur chaque carreau
    glass += 0.05 * np.clip((fx + fy) / s, -1, 1)
    bubbles = blur((rng.random((n, n)) < 0.0012).astype(np.float32), 0.8) > 0.12
    albedo = alb * glass[..., None]
    albedo = np.where(bubbles[..., None], albedo * 1.25, albedo)
    edge = smooth(0, 5, e)
    albedo = albedo * (0.82 + 0.18 * edge)[..., None]
    mat = sand(n, grout, seed + 5, grain=0.1)
    albedo = np.where(inside[..., None], albedo, mat)
    h = np.where(inside, 0.4 + 0.6 * edge, 0.1 + 0.03 * noise(n, 1, 4, seed + 6))
    ao = cavity(h, 6, 1.2, 0.6)
    return shade(albedo, h, 2.6, np.where(inside, 0.35, 0.01), 90, ao, amb=0.66, diff=0.38)


def wrapd(a):
    return (a + 0.5) % 1 - 0.5


def blob(n, cx, cy, r, seed, rough=0.35):
    """Tache organique centrée en (cx, cy) (fractions de la texture), rayon r : 1 au centre, 0 dehors."""
    yy, xx = (np.mgrid[0:n, 0:n] + 0.5) / n
    d = np.sqrt(wrapd(xx - cx) ** 2 + wrapd(yy - cy) ** 2) / r
    shape = d + rough * noise(n, n * r * 0.35, n * r * 1.6, seed) + 0.25 * rough * noise(n, n * r * 0.06, n * r * 0.2, seed + 99)
    return shape


def worn(n, seed=5):
    """Vieil enduit après quinze ans de soleil : taches, dépôts calcaires, enduit qui s'écaille, faïençage.

    Chaque défaut est placé à un endroit connu (fractions de la texture) pour que le site puisse le désigner.
    """
    base = sand(n, '#E2E0D6', seed, mott=0.022, grain=0.03)
    base = base * (1 + 0.018 * noise(n, 200, 1200, seed + 1))[..., None]
    h = 0.1 * noise(n, 1.5, 6, seed + 2) + 0.06 * noise(n, 8, 40, seed + 3)
    alb = base.copy()
    # taches de rouille et de métaux : fond dégradé, ligne de séchage plus foncée au bord
    for (cx, cy, r, col, k, sd) in [(0.70, 0.24, 0.15, '#9B7B55', 0.42, 11), (0.10, 0.56, 0.07, '#8E7656', 0.4, 12), (0.88, 0.47, 0.05, '#6E685A', 0.35, 13)]:
        sh = blob(n, cx, cy, r, seed + sd, rough=0.25)
        inside = smooth(1.02, 0.35, sh)
        tide = np.exp(-((sh - 0.98) / 0.035) ** 2) + 0.6 * np.exp(-((sh - 0.8) / 0.03) ** 2)
        amt = np.clip(inside * (0.8 + 0.25 * noise(n, 40, 220, seed + sd + 1)) * k + tide * k * 0.45, 0, 0.8)
        alb = alb * (1 - amt[..., None]) + hexrgb(col) * amt[..., None]
    # algues grisées dans un coin
    sh = blob(n, 0.42, 0.10, 0.09, seed + 21, rough=0.3)
    amt = smooth(1.05, 0.3, sh) * (0.7 + 0.3 * noise(n, 20, 90, seed + 22)) * 0.32
    alb = alb * (1 - amt[..., None]) + hexrgb('#76846F') * amt[..., None]
    # dépôt calcaire : voile blanc poudreux, bord net là où l'eau s'est arrêtée
    sh = blob(n, 0.30, 0.76, 0.14, seed + 31, rough=0.3)
    amt = np.clip(smooth(1.0, 0.85, sh) * (0.75 + 0.35 * noise(n, 2, 12, seed + 32)), 0, 1) * 0.8
    alb = alb * (1 - amt[..., None]) + hexrgb('#F7F6F2') * amt[..., None]
    alb = alb * (1 - 0.12 * np.exp(-((sh - 1.0) / 0.02) ** 2))[..., None]
    h = h * (1 - 0.6 * amt) + 0.1 * amt * noise(n, 1, 3, seed + 33)
    # enduit écaillé : plaques où la couche du dessus est partie, sous-couche grise, bord blanc cassé
    peel_sh = np.full((n, n), 9.0)
    for (cx, cy, r, sd) in [(0.20, 0.28, 0.075, 41), (0.27, 0.36, 0.04, 44), (0.13, 0.22, 0.03, 45)]:
        peel_sh = np.minimum(peel_sh, blob(n, cx, cy, r, seed + sd, rough=0.3))
    peel_sh = peel_sh + 0.05 * noise(n, 1.5, 8, seed + 46)
    peel = peel_sh < 1.0
    edge = np.exp(-((peel_sh - 1.0) / 0.035) ** 2)
    under = sand(n, '#A9A79E', seed + 42, mott=0.04, grain=0.12)
    alb = np.where(peel[..., None], under, alb)
    alb = alb * (1 + 0.18 * edge * (peel_sh > 1.0))[..., None]
    h = np.where(peel, h - 0.7 + 0.15 * noise(n, 1, 4, seed + 43), h)
    # faïençage en toile d'araignée
    pts = poisson(n, n * 0.035, seed + 51)
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32) + 0.5
    wx = xx + 2.5 * noise(n, 10, 40, seed + 52) + 0.8 * noise(n, 2, 6, seed + 55)
    wy = yy + 2.5 * noise(n, 10, 40, seed + 53) + 0.8 * noise(n, 2, 6, seed + 56)
    tree = cKDTree(pts, boxsize=n)
    d, _ = tree.query(np.stack([wx.ravel() % n, wy.ravel() % n], 1), k=2)
    gap = (d[:, 1] - d[:, 0]).reshape(n, n)
    sh = blob(n, 0.76, 0.72, 0.17, seed + 54, rough=0.3)
    mask = smooth(1.05, 0.55, sh)
    crack = np.exp(-(gap / 1.3) ** 2) * mask
    halo = np.exp(-(gap / 5.0) ** 2) * mask
    alb = alb * (1 - 0.6 * crack - 0.06 * halo)[..., None]
    h = h - 0.5 * crack
    # piqûres de métal : petits points bruns, flous
    rng = np.random.default_rng(seed + 61)
    spots = blur((rng.random((n, n)) < 0.00006).astype(np.float32), 2.2)
    spots = np.clip(spots / spots.max() * 3, 0, 1)
    alb = alb * (1 - 0.45 * spots[..., None] * (1 - hexrgb('#7A5E44')))
    ao = cavity(h, 3, 1.2, 0.6)
    return shade(alb, h, 2.4, 0.02, 20, ao, amb=0.66, diff=0.36)


def stripped(n, seed=7):
    """Coque mise à nu au sablage : béton projeté gris, granulats, quelques îlots d'ancien enduit."""
    base = sand(n, '#A6A49C', seed, mott=0.02, grain=0.14)
    h = 0.35 * noise(n, 1, 4, seed + 1) + 0.25 * noise(n, 5, 30, seed + 2)
    rng = np.random.default_rng(seed + 3)
    pts = poisson(n, 9, seed + 3)
    m = len(pts)
    a = rng.uniform(0.25, 0.45, m) * 9
    gi, rho, _ = grains(n, pts, a, a * rng.uniform(0.6, 0.95, m), rng.uniform(0, np.pi, m), seed + 4, k=6, wobble=0.12, angular=True)
    keep = (rng.random(m) < 0.3)[gi] & (rho < 1)
    stones = palette(['#8C8A84', '#B9B5AA', '#6F6E6A', '#C9C4B8'], m, rng)[gi]
    alb = np.where(keep[..., None], stones, base)
    h = np.where(keep, h + 0.5 * np.clip(1 - rho, 0, 1) ** 0.4, h)
    old = (noise(n, 60, 400, seed + 5) + 0.3 * noise(n, 4, 24, seed + 6)) > 2.1
    alb = np.where(old[..., None], sand(n, '#DCDAD1', seed + 7, grain=0.05), alb)
    h = np.where(old, h + 0.3, h)
    damp = noise(n, 150, 900, seed + 8)
    alb = alb * (1 - 0.05 * damp)[..., None]
    ao = cavity(h, 2.5, 1.0, 0.6)
    return shade(alb, h, 3.0, 0.02, 20, ao, amb=0.64, diff=0.4)


QUARTZ = ['#7FA9C7', '#4E7FA8', '#BFD9E4', '#9AA3A8', '#2F3A44', '#E9ECE8']
QW = [0.24, 0.18, 0.22, 0.14, 0.08, 0.14]
FINISHES = {
    'plaster': lambda n: plaster(n, 11),
    'quartz': lambda n: chips(n, [(9.0, 0.5, QUARTZ, QW, (0.4, 0.55)), (5.0, 0.35, QUARTZ, QW, (0.35, 0.5))], 21, '#ECEEEA', polish=0.3),
    'diamond-brite': lambda n: chips(n, [
        (10.0, 0.62, ['#F2F2EE', '#6A8FB2', '#35567A', '#A3B8C6', '#22282D', '#BFC3C2'], [0.26, 0.2, 0.12, 0.18, 0.1, 0.14], (0.42, 0.58)),
        (5.5, 0.6, ['#F2F2EE', '#6A8FB2', '#A3B8C6', '#22282D'], [0.4, 0.25, 0.25, 0.1], (0.35, 0.5)),
    ], 31, '#D5DCDF', polish=0.2),
    'pebble-fina': lambda n: stones(n, 6.2, 41, ['#C9BFAE', '#9C9488', '#E6E1D6', '#7D8A93', '#5D6064', '#B4A894'],
                                    axes=(0.56, 0.72), bump=1.6, spec=0.12, shine=50, matrix='#C2BDB1', grain=0.06, veins=0.0),
    'pebble-tec': lambda n: stones(n, 31, 51, ['#8E8B85', '#4C4E52', '#B9A88E', '#D9D3C8', '#687985', '#2E3034', '#A39A8C'],
                                   weights=[0.18, 0.14, 0.16, 0.12, 0.16, 0.1, 0.14], axes=(0.66, 0.84), squash=(0.68, 0.95), bump=3.2, matrix='#ABA69B'),
    'pebble-sheen': lambda n: stones(n, 7.6, 61, ['#9A968F', '#55585D', '#C2B39B', '#E1DCD2', '#6F8190', '#32353A'],
                                     weights=[0.2, 0.15, 0.17, 0.16, 0.2, 0.12], axes=(0.56, 0.74), bump=1.5, spec=0.22, shine=70,
                                     matrix='#B3AEA4', expose=0.8, grain=0.07, veins=0.1),
    'hydrazzo': lambda n: chips(n, [
        (14.0, 0.55, ['#EEF3F2', '#3F6E93', '#7FC2CF', '#22313D', '#C9D6DA'], [0.25, 0.22, 0.22, 0.13, 0.18], (0.42, 0.6)),
        (7.0, 0.6, ['#EEF3F2', '#3F6E93', '#7FC2CF', '#22313D'], [0.3, 0.25, 0.3, 0.15], (0.35, 0.52)),
        (3.6, 0.5, ['#EEF3F2', '#7FC2CF', '#22313D'], [0.4, 0.4, 0.2], (0.3, 0.45)),
    ], 71, '#93A9B5', mott=0.035, polish=1.0, bump=0.6),
    'beadcrete': lambda n: beads(n, 81, ['#6FB9D0', '#2D6FA3', '#B9E0E8', '#3E9AB0', '#E8F1F2'], weights=[0.28, 0.22, 0.18, 0.2, 0.12]),
    'glass-tile': lambda n: tile(n, 91, ['#2F6E9E', '#3C82AF', '#235A86', '#4F93BE', '#1D4C73', '#3A8AA8']),
}

EXTRA = {
    'worn': lambda: worn(2048),
    'stripped': lambda: stripped(1024),
}

if __name__ == '__main__':
    args = sys.argv[1:]
    for name, fn in FINISHES.items():
        if not args or name in args:
            save(fn(1024), f'fin-{name}', size=768)
    for name, fn in EXTRA.items():
        if not args or name in args:
            save(fn(), name, q=78, size=1536 if name == 'worn' else None)
