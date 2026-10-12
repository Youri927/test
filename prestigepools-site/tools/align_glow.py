# Aligne des photos de nuit d'une même piscine éclairée de couleurs différentes : on cale la forme lumineuse du bassin (ECC).
#   python3 -I tools/align_glow.py <photo de référence> <photo à caler> <sortie.png> <hauteur au-dessus du logo, en px>
import sys, cv2, numpy as np
ref_p, mov_p, out_p, H = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
def glow(img):
    v = img.max(axis=2).astype(np.float32)  # canal le plus fort : la lumière, quelle que soit sa couleur
    v[H:] = 0
    m = (v > 60).astype(np.float32)
    return cv2.GaussianBlur(m, (0, 0), 6)
ref = cv2.imread(ref_p); mov = cv2.imread(mov_p)
a, b = glow(ref), glow(mov)
warp = np.eye(2, 3, dtype=np.float32)
cc, warp = cv2.findTransformECC(a, b, warp, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 500, 1e-7), None, 5)
print('corrélation', round(cc, 4), 'matrice', np.round(warp, 4).tolist())
out = cv2.warpAffine(mov, warp, (ref.shape[1], ref.shape[0]), flags=cv2.INTER_LANCZOS4 + cv2.WARP_INVERSE_MAP, borderValue=(0, 0, 0))
cv2.imwrite(out_p, out)
mix = cv2.addWeighted(ref, 0.5, out, 0.5, 0)
cv2.imwrite(out_p.replace('.jpg', '-mix.jpg'), mix[:H])
