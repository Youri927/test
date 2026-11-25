# Assemble kit/studio.html (une seule page autonome) à partir de source/studio.html :
# y injecte le tracé du mot « respray » et les trois photos d'exemple.
#   python3 kit/source/construire-studio.py
import base64, pathlib

ici = pathlib.Path(__file__).resolve().parent
racine = ici.parents[2]
photo = lambda nom: 'data:image/webp;base64,' + base64.b64encode((racine / 'alternative-perfumee/photos' / nom).read_bytes()).decode()
s = (ici / 'studio.html').read_text()
s = (s.replace('__MOT__', (ici / 'mot.txt').read_text().strip())
      .replace('__FACE__', photo('a118-face.webp'))
      .replace('__DESSOUS__', photo('a118-dessous.webp'))
      .replace('__FAUX__', photo('l502-dessous.webp')))
(ici.parent / 'studio.html').write_text(s)
print('kit/studio.html', len(s) // 1024, 'Ko')
