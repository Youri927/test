"""Construit flyer.html à partir du logo et des QR codes (python3 construire.py), puis : node rendre.cjs"""
import pathlib

ICI = pathlib.Path(__file__).parent
logo = (ICI / 'logo.svg').read_text()
qv = (ICI / 'qr-vendre.svg').read_text()
qa = (ICI / 'qr-acheter.svg').read_text()


def classe(svg, cls):
    return svg.replace('<svg ', f'<svg class="{cls}" ', 1)


SYMBOLE = ('<svg class="symbole" viewBox="23.5 15.2 76.3 77.3"><path d="M30 86V58c0-14 10-22 24-22" fill="none" '
           'stroke="currentColor" stroke-width="13" stroke-linecap="round"/><g fill="currentColor"><circle cx="71" cy="36" r="5.5"/>'
           '<circle cx="84" cy="26" r="4"/><circle cx="85" cy="44" r="4"/><circle cx="96" cy="18" r="2.8"/><circle cx="97" cy="35" r="2.8"/>'
           '<circle cx="96" cy="52" r="2.8"/></g></svg>')

STYLE = (ICI / 'flyer.css').read_text()


def face(cote, sur, titre, chapo, points, qr, appel, detail):
    lis = ''.join(f'<li><b>✓</b><span><strong>{a}</strong> {b}</span></li>' for a, b in points)
    return f'''<section class="face {cote}">
  {SYMBOLE}
  {classe(logo, 'logo')}
  <p class="sur">{sur}</p>
  <h1>{titre}</h1>
  <p class="chapo">{chapo}</p>
  <ul>{lis}</ul>
  <div class="pied">
    <div class="qr">{qr}</div>
    <p class="appel">{appel}<small>{detail}</small><span class="url">respray.fr</span></p>
  </div>
  <p class="legal">Ne pas jeter sur la voie publique.</p>
</section>'''


recto = face('recto', 'Vendre', "Le parfum qui dort dans votre placard vaut <em>encore de l'argent.</em>",
             "Entamé, offert, porté deux fois : vendez-le à quelqu'un qui le cherche.",
             [('0 % de commission.', 'Vous touchez tout le prix.'),
              ("Vérifié par l'équipe", "avant d'être en ligne."),
              ('Envoi en point relais,', 'étiquette fournie.')],
             qv, 'Combien vaut votre placard ?', "Scannez, ajoutez vos flacons : l'estimation est immédiate.")
verso = face('verso', 'Acheter', 'Le parfum de seconde main, <em>sans le doute.</em>',
             'Des parfums de niche et de créateurs, entamés ou neufs, entre particuliers.',
             [('Chaque annonce vérifiée', "par l'équipe : code lot, spray, niveau."),
              ('Votre argent reste bloqué', "jusqu'à ce que vous ayez vérifié le flacon."),
              ('7 jours pour vérifier.', 'Pas conforme : remboursé.')],
             qa, 'Voir les parfums en ligne', 'Annonces vérifiées, prix comparé au neuf.')

(ICI / 'flyer.html').write_text(f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Flyer Respray</title><style>{STYLE}</style></head><body>{recto}{verso}</body></html>')
print('flyer.html')
