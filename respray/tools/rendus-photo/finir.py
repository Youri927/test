"""Finit les rendus : léger débruitage (le grain du lancer de rayons), puis WebP pour le site.
   python3 finir.py <dossier des PNG bruts> <dossier de sortie>"""
import sys, pathlib
import cv2
import numpy as np

args = [a for a in sys.argv[1:] if not a.startswith('--')]
src, dst = pathlib.Path(args[0]), pathlib.Path(args[1])
dst.mkdir(parents=True, exist_ok=True)
for f in sorted(src.glob('*.png')):
    im = cv2.imread(str(f))
    # débruitage non local, doux : garde les arêtes nettes du verre et le texte des étiquettes
    if '--trace' in sys.argv:
        im = cv2.fastNlMeansDenoisingColored(im, None, 3, 3, 5, 17)
    # une finition photo : vignettage léger et grain fin (un rendu parfaitement lisse fait « image de synthèse »)
    h, w = im.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    vig = 1 - 0.07 * np.clip(d - 0.45, 0, None) ** 1.6
    grain = np.random.default_rng(7).normal(0, 2.2, (h, w, 1))
    im = np.clip(im.astype(np.float32) * vig[..., None] + grain, 0, 255).astype(np.uint8)
    # la porte « Vendre » : les bords se fondent dans la couleur exacte de la porte (pas de rectangle visible)
    if f.stem.startswith('vendre'):
        porte = np.array((39, 42, 43) if 'sombre' in f.stem else (238, 232, 233), np.float32)  # BGR de #2b2a27 / #e9e8ee
        h, w = im.shape[:2]
        yy, xx = np.mgrid[0:h, 0:w]
        dx = np.abs(xx - w * 0.5) / (w * 0.5)
        dy = np.where(yy < h * 0.55, (h * 0.55 - yy) / (h * 0.55), (yy - h * 0.55) / (h * 0.45))
        t = np.clip((np.maximum(dx, dy) - 0.55) / 0.4, 0, 1)[..., None]
        t = t * t * (3 - 2 * t)
        im = (im.astype(np.float32) * (1 - t) + porte * t).astype(np.uint8)
    cv2.imwrite(str(dst / (f.stem + '.webp')), im, [cv2.IMWRITE_WEBP_QUALITY, 88])
    print(f.stem)
