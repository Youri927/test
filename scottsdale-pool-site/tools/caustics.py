"""Texture de reflets d'eau (caustiques) : réseau de cellules aux bords lumineux, déformé, raccordable sans couture.
Sortie : src/img/caustics.webp"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

N = 512
rng = np.random.default_rng(7)
y, x = (np.mgrid[0:N, 0:N] + .5) / N
TAU = 2 * np.pi


def warp(u, v, amp, seed):
    """déformation périodique (fréquences entières : la tuile se raccorde)"""
    r = np.random.default_rng(seed)
    du = np.zeros_like(u)
    dv = np.zeros_like(v)
    for k in range(4):
        fx, fy = r.integers(1, 4, 2)
        ph = r.random(2) * TAU
        a = amp / (k + 1)
        du += a * np.sin(TAU * (fx * u + fy * v) + ph[0])
        dv += a * np.cos(TAU * (fy * u - fx * v) + ph[1])
    return (u + du) % 1, (v + dv) % 1


def cells(u, v, n, seed):
    pts = np.random.default_rng(seed).random((n, 2))
    f1 = np.full(u.shape, 9.0)
    f2 = np.full(u.shape, 9.0)
    for px, py in pts:
        dx = np.abs(u - px); dx = np.minimum(dx, 1 - dx)
        dy = np.abs(v - py); dy = np.minimum(dy, 1 - dy)
        d = np.hypot(dx, dy)
        f2 = np.where(d < f1, f1, np.minimum(f2, d))
        f1 = np.minimum(f1, d)
    return f2 - f1


u1, v1 = warp(x, y, .035, 1)
a = cells(u1, v1, 26, 3)
u2, v2 = warp(x, y, .05, 2)
b = cells(u2, v2, 44, 5)
edge = np.exp(-a / .012) * .85 + np.exp(-b / .009) * .55
# les croisements brillent davantage, comme sous une vraie surface d'eau
edge = np.clip(edge, 0, 1.4) / 1.4
edge = edge ** 1.25
rgba = np.zeros((N, N, 4), np.uint8)
rgba[..., :3] = 255
rgba[..., 3] = np.clip(edge * 255, 0, 255).astype(np.uint8)
img = Image.fromarray(rgba, 'RGBA').filter(ImageFilter.GaussianBlur(.6))
out = Path(__file__).resolve().parent.parent / 'src' / 'img' / 'caustics.webp'
img.resize((320, 320), Image.LANCZOS).save(out, 'WEBP', quality=84, method=6)
print(out, out.stat().st_size // 1024, 'Ko')
