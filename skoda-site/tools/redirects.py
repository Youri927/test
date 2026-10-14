"""Redirections des anciennes pages Squarespace vers la bonne partie de la nouvelle page.

Écrit web/_redirects (Netlify) et web/vercel.json (Vercel), à partir d'une seule liste :
les 33 adresses du plan de site, plus les 5 pages du menu qui n'y figurent pas.

    python3 -I tools/redirects.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PAGES = {
    '/': [
        '/home',
    ],
    '/#homes': [
        '/florida-southwest-luxury-home-construction',
        '/build-on-your-lot-custom-homes-florida-sanibel',
        '/custom-luxury-home-builder-florida-naples',
        '/custom-luxury-home-builder-florida-marco-island',
        '/custom-luxury-home-builder-florida-estero',
        '/sanibel-florida-custom-luxury-home-builder',
        '/fort-myers-beach-florida-custom-luxury-home-builder',
        '/captiva-florida-custom-luxury-home-builder',
        '/bonita-springs-florida-custom-luxury-home-builder',
        '/fort-myers-fl-custom-luxury-home-builder',
        '/boca-grande-fl-custom-luxury-home-builder',
        '/port-charlotte-florida-custom-luxury-home-builder',
    ],
    '/#remodels': [
        '/luxury-home-remodeling',
        '/luxury-custom-home-remodeling-florida-naples',
        '/luxury-custom-home-remodeling-florida-sanibel',
        '/luxury-custom-home-remodeling-florida-bonita-springs',
        '/luxury-custom-home-remodeling-florida-estero',
        '/luxury-custom-home-remodeling-florida-captiva',
        '/luxury-custom-home-remodeling-florida-fort-myers-beach',
        '/fort-myers-fl-luxury-custom-home-remodeling',
        '/marco-island-fl-luxury-custom-home-remodeling',
        '/port-charlotte-fl-luxury-custom-home-remodeling',
        '/boca-grande-fl-luxury-custom-home-remodeling',
    ],
    '/#restoration': [
        '/storm-damage-repair',
        '/storm-damage-repair-florida-naples-marco-island',
        '/storm-damage-repair-florida-fort-myers-beach',
        '/naples-fl-storm-damage-repair',
        '/marco-island-fl-storm-damage-repair',
        '/florida-sanibel-storm-damage-repair',
        '/storm-damage-repair-fl-captiva',
        '/storm-damage-repair-fl-fort-myers-beach',
    ],
    '/#commercial': [
        '/commercial-construction',
        '/commercial-construction-florida-naples-ft-myers-estero',
        '/commercial-contractor-florida-fort-myers',
        '/office-build-out-construction-florida-naples',
        '/office-build-out-construction-florida-fort-myers',
        '/commercial-renovations-construction-florida-estero',
    ],
}

rules = [(old, new) for new, olds in PAGES.items() for old in olds]
assert len({old for old, _ in rules}) == len(rules), 'adresse en double'

width = max(len(old) for old, _ in rules)
lines = ['# Les anciennes pages de leur site Squarespace, vers la bonne partie de la nouvelle page (301)']
lines += [f'{old:<{width}}  {new}  301' for old, new in rules]
(ROOT / 'web/_redirects').write_text('\n'.join(lines) + '\n')

vercel = {
    'headers': [
        {'source': '/(.*)', 'headers': [{'key': 'X-Robots-Tag', 'value': 'noindex, nofollow'}]},
        {'source': '/assets/(.*)', 'headers': [{'key': 'Cache-Control', 'value': 'public, max-age=604800'}]},
    ],
    'redirects': [{'source': old, 'destination': new, 'permanent': True} for old, new in rules],
}
(ROOT / 'web/vercel.json').write_text(json.dumps(vercel, indent=2, ensure_ascii=False) + '\n')
print(len(rules), 'redirections')
