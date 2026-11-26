"""Vérifie que les QR codes des aperçus se lisent, et fait une planche des deux faces : python3 verifier_qr.py [sortie.png]"""
import sys
import cv2
from PIL import Image

for f in ['apercu-recto.png', 'apercu-verso.png']:
    im = cv2.imread(f)
    txt, _, _ = cv2.QRCodeDetector().detectAndDecode(im)
    print(f, im.shape[:2], '→', txt or 'non lu')
if len(sys.argv) > 1:
    a, b = Image.open('apercu-recto.png'), Image.open('apercu-verso.png')
    c = Image.new('RGB', (a.width + b.width + 60, a.height), 'white')
    c.paste(a, (0, 0))
    c.paste(b, (a.width + 60, 0))
    c.resize((c.width // 3, c.height // 3)).save(sys.argv[1])
