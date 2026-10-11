"""Textures de l'eau, calculées une fois (toutes raccordables : elles se répètent sans couture).

- caustics-a.webp, caustics-b.webp : le réseau de lumière que le soleil dessine au fond d'une piscine (caustiques),
  blanc sur transparent, en deux tailles ;
- plaster.webp  : le grain léger d'un enduit de piscine ;
- murk.webp     : le trouble d'une eau verte, en nuages ;
- specks.webp   : les particules en suspension (algues, poussière).

    python3 -I tools/textures.py
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/img'
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(1999)


def fractal(n, beta, lo=1.0, hi=None):
    """Bruit fractal périodique (bruit blanc filtré en 1/f^beta dans le domaine de Fourier), normalisé de 0 à 1."""
    f = np.fft.fftfreq(n)[:, None] ** 2 + np.fft.fftfreq(n)[None, :] ** 2
    f = np.sqrt(f) * n
    amp = np.where(f < lo, 0, 1 / np.maximum(f, 1e-9) ** beta)
    if hi:
        amp = amp * np.exp(-((f / hi) ** 2))
    phase = np.exp(2j * np.pi * rng.random((n, n)))
    x = np.real(np.fft.ifft2(amp * phase))
    return (x - x.min()) / (x.max() - x.min())


def save(arr_rgba, name, q=82, lossless=False):
    im = Image.fromarray(np.clip(arr_rgba * 255 + 0.5, 0, 255).astype(np.uint8), 'RGBA')
    p = OUT / name
    im.save(p, 'WEBP', quality=q, lossless=lossless, method=6)
    print(f'{name} : {im.size[0]}×{im.size[1]}, {p.stat().st_size / 1024:.1f} Ko')


# — les caustiques : la lumière du soleil réfractée par la surface de l'eau, recueillie au fond (simulation de rayons).
#   La surface est une houle régulière (bruit à bande étroite) ; chaque point envoie un rayon dévié selon la pente,
#   et là où les rayons se concentrent, le fond s'éclaire en lignes courbes. Deux couches, une large et une fine,
#   qui glissent à des vitesses différentes : leurs croisements font le scintillement. Tout est périodique. —
def blur(x, sigma):
    """Flou gaussien périodique (sur un tore) : les bords se raccordent."""
    n = x.shape[0]
    f2 = np.fft.fftfreq(n)[:, None] ** 2 + np.fft.fftfreq(n)[None, :] ** 2
    return np.real(np.fft.ifft2(np.fft.fft2(x) * np.exp(-2 * np.pi ** 2 * sigma ** 2 * f2)))


def ring(n, r0, w):
    f = np.sqrt(np.fft.fftfreq(n)[:, None] ** 2 + np.fft.fftfreq(n)[None, :] ** 2) * n
    x = np.real(np.fft.ifft2(np.exp(-((f - r0) / w) ** 2) * np.exp(2j * np.pi * rng.random((n, n)))))
    return x / x.std()


def caustic(name, N, r0, focus, q=82, SS=3):
    n = N * SS
    h = ring(n, r0, 1.6) + 0.25 * ring(n, r0 * 2.3, 2.4)
    gy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) / 2
    gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) / 2
    lap = np.roll(h, 1, 0) + np.roll(h, -1, 0) + np.roll(h, 1, 1) + np.roll(h, -1, 1) - 4 * h
    k = focus / lap.std()
    yy, xx = np.mgrid[0:n, 0:n]
    lx = ((xx + k * gx) / SS).astype(np.int64) % N
    ly = ((yy + k * gy) / SS).astype(np.int64) % N
    acc = np.zeros((N, N))
    np.add.at(acc, (ly.ravel(), lx.ravel()), 1)
    acc /= acc.mean()
    # léger flou, calculé dans le domaine de Fourier pour que la texture reste raccordable (pas de couture entre les tuiles)
    c = np.clip((blur(np.minimum(acc, 255 / 40), 0.8) - 0.9) / 2.2, 0, 1) ** 0.9
    save(np.dstack([np.ones_like(c), np.ones_like(c), np.ones_like(c), c]), name, q=q)


caustic('caustics-a.webp', 512, 6, 1.0)
caustic('caustics-b.webp', 512, 9, 0.8)

# — l'enduit : un grain très fin, à peine visible (un fond propre ; la tuile est petite, donc sans marbrure
#   qui trahirait la répétition) —
N = 256
fine = fractal(N, 0.4, hi=120)
g = (fine - fine.mean()) / fine.std()
a = np.clip(np.abs(g) * 0.03, 0, 0.08)
a = np.round(a / 0.08 * 5) / 5 * 0.08  # six niveaux seulement : en WebP sans perte, la tuile pèse ~20 Ko
tone = (g < 0).astype(float) * 0.55 + 0.45
save(np.dstack([tone, tone, tone, a]), 'plaster.webp', lossless=True)

# — le trouble : des nuages verts plus ou moins denses —
N = 512
m = fractal(N, 2.0, hi=24) * 0.75 + fractal(N, 1.4, hi=60) * 0.25
m = np.clip((m - 0.3) / 0.5, 0, 1) ** 1.1
r, gch, b = 0.15, 0.2, 0.06
save(np.dstack([np.full_like(m, r), np.full_like(m, gch), np.full_like(m, b), m * 0.8]), 'murk.webp', q=74)

# — les particules : de petits points flous, brun-vert, de tailles variées —
N = 512
s = np.zeros((N, N))
yy, xx = np.mgrid[0:N, 0:N]
for _ in range(240):
    cx, cy = rng.random(2) * N
    rad = rng.choice([0.8, 1.1, 1.5, 2.2, 3.2], p=[0.32, 0.3, 0.2, 0.12, 0.06])
    dx = np.minimum(np.abs(xx - cx), N - np.abs(xx - cx))
    dy = np.minimum(np.abs(yy - cy), N - np.abs(yy - cy))
    s = np.maximum(s, np.exp(-(dx * dx + dy * dy) / (2 * rad * rad)) * rng.uniform(0.35, 0.9))
save(np.dstack([np.full_like(s, 0.2), np.full_like(s, 0.24), np.full_like(s, 0.1), s]), 'specks.webp', q=80)
