"""Redirections des anciennes pages Squarespace vers la bonne partie de la nouvelle page.

Écrit web/_redirects (Netlify) et web/vercel.json (Vercel), à partir d'une seule liste : les pages du menu, celles du
plan de site, et les pages de la galerie (/gallery/…, liées depuis la page « Ideas »). Leurs adresses n'ont pas de
« / » final ; Netlify les reconnaît avec ou sans, Vercel reçoit les deux formes.

    python3 -I tools/redirects.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PAGES = {
    # la copie de l'accueil au nom du modèle, et le brouillon « Home 2 »
    '/': ['/welcome-pacific', '/home-1'],
    '/#work': ['/contracting', '/contractor-services', '/ideas'],
    # la galerie, la page « Portfolio » en faux texte, et les pages de la galerie
    '/#houses': ['/gallery', '/portfolio', '/gallery/*'],
    '/#judson': ['/about'],
    '/#reviews': ['/reviews'],
    '/#estimate': ['/contact'],
}

lines = ['# Les anciennes pages de floridasouth.us (Squarespace) vers la bonne partie de la nouvelle page', '']
rules = []
for to, froms in PAGES.items():
    for f in froms:
        lines.append(f'{f:<28} {to:<12} 301')
        if f.endswith('/*'):
            rules.append({'source': f[:-2] + '/:path*', 'destination': to, 'permanent': True})
        else:
            rules.append({'source': f, 'destination': to, 'permanent': True})
            rules.append({'source': f + '/', 'destination': to, 'permanent': True})
(ROOT / 'web/_redirects').write_text('\n'.join(lines) + '\n')
vercel = {
    'redirects': rules,
    'headers': [
        # la maquette ne doit pas être indexée (à retirer au lancement)
        {'source': '/(.*)', 'headers': [{'key': 'X-Robots-Tag', 'value': 'noindex, nofollow'}]},
        {'source': '/assets/(.*)', 'headers': [{'key': 'Cache-Control', 'value': 'public, max-age=604800'}]},
    ],
}
(ROOT / 'web/vercel.json').write_text(json.dumps(vercel, indent=2) + '\n')
print(sum(len(v) for v in PAGES.values()), 'anciennes adresses ;', len(rules), 'règles Vercel')
