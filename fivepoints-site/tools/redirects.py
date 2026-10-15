"""Redirections des anciennes pages WordPress vers la bonne partie de la nouvelle page.

Écrit web/_redirects (Netlify) et web/vercel.json (Vercel), à partir d'une seule liste : les 46 adresses du plan de
site (l'accueil mis à part). Leurs adresses finissent par « / » ; Netlify les reconnaît avec ou sans, Vercel reçoit
les deux formes.

    python3 -I tools/redirects.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PAGES = {
    '/': [
        '/category/announcements/',
    ],
    '/#roofs': [
        '/services/',
        '/residential-roofing/',
        '/residential-roofing/roof-installation/',
        '/mobile-home-roofing/',
        '/commercial-roofing/',
        '/commercial-roofing/commercial-roof-repair/',
        '/commercial-roofing/roof-maintenance-and-repair/',
        '/commercial-roofing/built-up-roofing-bur/',
        '/commercial-roofing/elastomeric-roof-coating/',
        '/commercial-roofing/coal-tar-pitch-roofing/',
        '/commercial-roofing/metal-roofing/',
        '/commercial-roofing/modified-bitumen-roofing/',
        '/commercial-roofing/tpo-roofing/',
        '/commercial-roofing/epdm-roofing/',
        '/commercial-roofing/pvc-roofing/',
        '/3-best-roof-types-in-florida/',
        '/cypress-gardens-roofing-3-popular-options/',
    ],
    '/#storm': [
        '/residential-roofing/hail-storm-damage-repair/',
        '/residential-roofing/roof-inspection/',
        '/mobile-home-roof-storm-damage-how-to-stop-the-leaking/',
        '/is-there-a-roof-inspection-needed-after-a-storm/',
        '/review-insurance/',
    ],
    '/#replace': [
        '/residential-roofing/roof-replacement/',
        '/residential-roofing/reroofing/',
        '/residential-roofing/roof-repairs-and-maintenance/',
        '/commercial-roofing/commercial-roof-replacement/',
        '/replace-or-repair-your-roof/',
        '/5-roof-repair-tips/',
        '/test/',
    ],
    '/#warranty': [
        '/residential-roofing/roof-warranties/',
    ],
    '/#family': [
        '/about/',
    ],
    '/#reviews': [
        '/testimonials/',
    ],
    '/#area': [
        '/category/lakeland-fl/',
        '/category/highlands-fl/',
        '/category/winter-haven-fl/',
        '/category/cypress-gardens-fl/',
        '/category/haines-city-fl/',
        '/category/bartow-fl/',
    ],
    '/#faq': [
        '/lakeland-mobile-home-roofing-faqs/',
        '/how-often-should-you-seal-mobile-home-roof/',
        '/how-do-you-prepare-a-mobile-home-roof-for-coating/',
        '/what-is-the-best-roof-for-a-mobile-home-near-lakeland-fl/',
    ],
    '/#estimate': [
        '/roof-estimate/',
        '/contact/',
        '/thanks/',
    ],
}

rules = [(old, new) for new, olds in PAGES.items() for old in olds]
assert len({old for old, _ in rules}) == len(rules), 'adresse en double'
assert len(rules) == 46, f'{len(rules)} adresses au lieu de 46'

width = max(len(old) for old, _ in rules)
lines = ['# Les anciennes pages de leur site WordPress, vers la bonne partie de la nouvelle page (301)']
lines += [f'{old:<{width}}  {new}  301' for old, new in rules]
(ROOT / 'web/_redirects').write_text('\n'.join(lines) + '\n')

vercel = {
    'headers': [
        {'source': '/(.*)', 'headers': [{'key': 'X-Robots-Tag', 'value': 'noindex, nofollow'}]},
        {'source': '/assets/(.*)', 'headers': [{'key': 'Cache-Control', 'value': 'public, max-age=604800'}]},
    ],
    'redirects': [
        {'source': src, 'destination': new, 'permanent': True}
        for old, new in rules
        for src in (old, old.rstrip('/'))
    ],
}
(ROOT / 'web/vercel.json').write_text(json.dumps(vercel, indent=2, ensure_ascii=False) + '\n')
print(len(rules), 'redirections')
