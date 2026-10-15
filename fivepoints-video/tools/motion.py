"""Contrôle des mouvements, image par image, sur des images fixes du montage (dossier de .jpg dans l'ordre).
Un mouvement régulier donne des pas qui varient en douceur ; un « sautillement » donne des pas irréguliers
(0, 1, 0, 1…), des arrêts au milieu d'un mouvement, ou des positions collées aux pixels entiers.

    python3 -I tools/motion.py <dossier> col <x> <y0> <y1> [down|up]   bord horizontal croisé en descendant la colonne x
    python3 -I tools/motion.py <dossier> row <y> <x0> <x1> [down|up]   bord vertical croisé en allant vers la droite sur la ligne y
    python3 -I tools/motion.py <dossier> track <x> <y> [taille]          suit un morceau d'image (corrélation de phase)
    python3 -I tools/motion.py <vidéo.mp4> dup [début] [fin]             images doublées ou sautées pendant un mouvement

down : le bord où l'image s'assombrit dans le sens du parcours ; up : où elle s'éclaircit ; par défaut, le plus contrasté.
track : déplacement (dx, dy) au sous-pixel entre deux images d'un carré centré sur (x, y), qui suit le contenu.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

if len(sys.argv) < 3:
    sys.exit(__doc__)
folder, mode = sys.argv[1], sys.argv[2]
files = sorted(Path(folder).glob('*.jpg'))
gray = lambda f: np.asarray(Image.open(f).convert('L'), dtype=float)


def report(names, pos):
    """Affiche positions et pas ; résume la régularité des pas."""
    prev, steps = None, []
    for name, p in zip(names, pos):
        d = None if (p is None or prev is None) else p - prev
        if d is not None:
            steps.append(d)
        print(f'{name}  {"—" if p is None else f"{p:9.2f}"}  {"" if d is None else f"{d:+7.2f}"}')
        prev = p
    if len(steps) > 2:
        s = np.array(steps)
        jerk = np.abs(np.diff(s))
        print(f'pas : min {s.min():+.2f} max {s.max():+.2f} ; variation d’un pas au suivant : moyenne {jerk.mean():.2f}, max {jerk.max():.2f}')


if mode in ('col', 'row'):
    a, b, c = map(int, sys.argv[3:6])
    sign = sys.argv[6] if len(sys.argv) > 6 else None
    pos = []
    for f in files:
        im = gray(f)
        line = im[b:c, a] if mode == 'col' else im[a, b:c]
        g = np.diff(line)
        # le bord : la plus forte variation (dans le sens demandé) ; sa position au sous-pixel est le barycentre
        # des variations de même sens autour (exact pour un bord lissé, à 0,01 px près)
        k = int(np.argmin(g) if sign == 'down' else np.argmax(g) if sign == 'up' else np.argmax(np.abs(g)))
        lo, hi = max(0, k - 3), min(len(g), k + 4)
        w = np.clip(g[lo:hi] * np.sign(g[k]), 0, None)
        x = lo + (w * np.arange(hi - lo)).sum() / w.sum() + 0.5 if w.sum() > 0 else None
        pos.append(None if x is None else b + x)
    report([f.stem for f in files], pos)

elif mode == 'track':
    x, y = map(float, sys.argv[3:5])
    n = int(sys.argv[5]) if len(sys.argv) > 5 else 192
    win = np.outer(np.hanning(n), np.hanning(n))

    def shift(p, q):
        """Déplacement (dy, dx) du contenu de p vers q, au sous-pixel : corrélation de phase, puis alignement ECC (OpenCV) s'il est là."""
        p32, q32 = p.astype(np.float32), q.astype(np.float32)
        try:
            import cv2
        except ImportError:
            cv2 = None
        if cv2 is not None:
            (dx, dy), _ = cv2.phaseCorrelate(p32, q32, win.astype(np.float32))
            warp = np.array([[1, 0, dx], [0, 1, dy]], np.float32)
            try:
                _, warp = cv2.findTransformECC(p32, q32, warp, cv2.MOTION_TRANSLATION, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-7), None, 5)
            except cv2.error:
                pass
            return float(warp[1, 2]), float(warp[0, 2])
        R = np.fft.fft2(q * win) * np.conj(np.fft.fft2(p * win))
        r = np.fft.ifft2(R / (np.abs(R) + 1e-9)).real
        iy, ix = np.unravel_index(int(np.argmax(r)), r.shape)
        out = []
        for i, axis in ((iy, 0), (ix, 1)):
            m = r[(i - 1) % n, ix] if axis == 0 else r[iy, (i - 1) % n]
            c0 = r[iy, ix]
            pl = r[(i + 1) % n, ix] if axis == 0 else r[iy, (i + 1) % n]
            den = m - 2 * c0 + pl
            sub = 0.5 * (m - pl) / den if den != 0 else 0
            v = i + sub
            out.append(v - n if v > n / 2 else v)
        return out

    names, xs, ys = [files[0].stem], [x], [y]
    prev = gray(files[0])
    for f in files[1:]:
        cur = gray(f)
        cx, cy = int(round(x)), int(round(y))
        y0, x0 = cy - n // 2, cx - n // 2
        if y0 < 0 or x0 < 0 or y0 + n > cur.shape[0] or x0 + n > cur.shape[1]:
            print(f'{f.stem}  hors image'); break
        dy, dx = shift(prev[y0:y0 + n, x0:x0 + n], cur[y0:y0 + n, x0:x0 + n])
        x, y = x + dx, y + dy
        names.append(f.stem); xs.append(x); ys.append(y)
        prev = cur
    print('— x'); report(names, xs)
    print('— y'); report(names, ys)
elif mode == 'dup':
    # Écart moyen entre deux images successives, image par image (vidéo lue par ffmpeg en niveaux de gris, réduite en 480 × 270).
    # Pendant un mouvement régulier, cet écart varie en douceur ; une image doublée le fait tomber près de zéro entre deux
    # valeurs normales, une image sautée le fait doubler d'un coup.
    import subprocess
    a = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    b = int(sys.argv[4]) if len(sys.argv) > 4 else 10 ** 9
    w, h = 480, 270
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', folder, '-vf', f"select='between(n,{a},{b})',scale={w}:{h}:flags=area,format=gray", '-vsync', '0', '-f', 'rawvideo', '-'],
                         capture_output=True, check=True).stdout
    v = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.int16)
    d = np.abs(np.diff(v, axis=0)).mean(axis=(1, 2))
    flags = []
    for i in range(1, len(d) - 1):
        around = (d[i - 1] + d[i + 1]) / 2
        if around > 0.8 and d[i] < 0.35 * around:
            flags.append((a + i + 1, 'doublée', round(d[i], 2), round(around, 2)))
        elif d[i] > 0.8 and d[i] > 1.8 * max(d[i - 1], d[i + 1]) and min(d[i - 1], d[i + 1]) > 0.4:
            flags.append((a + i + 1, 'saut', round(d[i], 2), round(around, 2)))
    print(f'{len(d) + 1} images ; écart moyen entre images : médiane {np.median(d):.2f}, max {d.max():.2f}')
    for fl in flags:
        print(f'  image {fl[0]} : {fl[1]} (écart {fl[2]}, voisines {fl[3]})')
    if not flags:
        print('  aucune image doublée ni sautée pendant les mouvements')
else:
    sys.exit(__doc__)
