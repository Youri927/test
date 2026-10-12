# Aligne la photo de nuit sur celle du crépuscule (même piscine, cadrage un peu différent) : similitude par points SIFT.
#   python3 -I tools/align.py <photo au crépuscule> <photo de nuit> <sortie.png>
import sys, cv2, numpy as np
day_p, night_p, out_p = sys.argv[1:4]
day = cv2.imread(day_p); night = cv2.imread(night_p)
H = 980  # au-dessus du logo incrusté
mask_d = np.zeros(day.shape[:2], np.uint8); mask_d[:H] = 255
mask_n = np.zeros(night.shape[:2], np.uint8); mask_n[:H] = 255
g1 = cv2.cvtColor(day, cv2.COLOR_BGR2GRAY); g2 = cv2.cvtColor(night, cv2.COLOR_BGR2GRAY)
# égalisation : la nuit est très sombre
cl = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8)); g1e = cl.apply(g1); g2e = cl.apply(g2)
sift = cv2.SIFT_create(4000)
k1, d1 = sift.detectAndCompute(g1e, mask_d); k2, d2 = sift.detectAndCompute(g2e, mask_n)
m = cv2.BFMatcher().knnMatch(d2, d1, k=2)
good = [a for a, b in m if a.distance < 0.75 * b.distance]
src = np.float32([k2[a.queryIdx].pt for a in good]); dst = np.float32([k1[a.trainIdx].pt for a in good])
M, inl = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=4)
print('points', len(good), 'inliers', int(inl.sum()), 'matrice', np.round(M, 4).tolist())
s = (M[0, 0] ** 2 + M[1, 0] ** 2) ** 0.5; ang = np.degrees(np.arctan2(M[1, 0], M[0, 0]))
print(f'échelle {s:.4f} rotation {ang:.2f}°')
warped = cv2.warpAffine(night, M, (day.shape[1], day.shape[0]), flags=cv2.INTER_LANCZOS4, borderValue=(0, 0, 0))
cv2.imwrite(out_p, warped)
# zone valide (pas de bord noir) dans le cadre du jour
valid = cv2.warpAffine(np.full(night.shape[:2], 255, np.uint8), M, (day.shape[1], day.shape[0]))
valid[H:] = 0
ys, xs = np.where(valid > 250)
print('zone valide', xs.min(), ys.min(), xs.max(), ys.max())
blend = cv2.addWeighted(day, 0.5, warped, 0.5, 0)
cv2.imwrite(out_p.replace('.jpg', '-mix.jpg'), blend[:H])
