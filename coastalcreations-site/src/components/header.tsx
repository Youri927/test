// Le haut de page : pas de barre de navigation, mais un en-tête de papier à lettres, leur logo en grand, le numéro,
// le devis et le menu. Une fois l'accueil passé, un bandeau fin descend (sur ordinateur) avec le titre de la partie
// où l'on se trouve, comme le titre courant d'un livre. Sur téléphone et tablette, c'est une barre d'actions en bas.
import { Menu, MessageSquareText, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'

import { MenuButton } from '@/components/menu'
import { go } from '@/lib/motion'
import { site } from '@/lib/site'
import logo from '@/assets/brand/logo-light.avif'

export function Letterhead() {
  return (
    <header className="w flex items-center justify-between gap-4 pt-[clamp(14px,2vw,28px)]">
      <a href="#top" onClick={(e) => go(e, 'top')} className="flex-none">
        <img src={logo} width={420} height={383} alt="Coastal Creations Pools and Lagoons" className="h-[60px] w-auto sm:h-[72px] lg:h-[88px]" />
        <span className="sr-only">, back to top</span>
      </a>
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
        <a href={site.phone.href} className="hidden text-[16.5px] font-[500] md:block">
          <span className="font-[400] text-ink-2">Call or text </span>
          {site.phone.label}
        </a>
        <a href={site.quote} target="_blank" rel="noreferrer" className="btn btn-sun hidden sm:inline-flex">
          Free quote
        </a>
        <MenuButton className="btn btn-line px-5" />
      </div>
    </header>
  )
}

// le titre courant : la partie qui passe sous le bandeau
const heads: [string, string][] = [
  ['services', 'What we do'],
  ['build', 'New pools'],
  ['renovate', 'Renovations'],
  ['leaks', 'Leak detection'],
  ['storm', 'Storms and equipment'],
  ['about', 'About us'],
  ['area', 'Service area'],
  ['contact', 'Contact'],
]

// vrai une fois l'accueil sorti de l'écran par le haut
function usePastHero() {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) return
    const io = new IntersectionObserver(([e]) => setPast(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(hero)
    return () => io.disconnect()
  }, [])
  return past
}

export function Bar() {
  const on = usePastHero()
  const [label, setLabel] = useState('')
  useEffect(() => {
    const inside = new Set<string>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inside.add(e.target.id)
          else inside.delete(e.target.id)
        }
        // la dernière partie entrée dans la bande, dans l'ordre de la page
        const last = heads.filter(([id]) => inside.has(id)).pop()
        if (last) setLabel(last[1])
      },
      { rootMargin: '-72px 0px -62% 0px' },
    )
    heads.forEach(([id]) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <div className="bar hidden lg:block" data-on={on ? '' : undefined}>
      <div className="w flex h-[64px] items-center gap-5">
        <a href="#top" onClick={(e) => go(e, 'top')} className="flex-none">
          <img src={logo} width={420} height={383} alt="Coastal Creations Pools and Lagoons" className="h-[44px] w-auto" />
          <span className="sr-only">, back to top</span>
        </a>
        <p className="runhead" aria-hidden="true">
          {label}
        </p>
        <div className="ml-auto flex items-center gap-5">
          <a href={site.phone.href} className="text-[15.5px] font-[500]">
            <span className="font-[400] text-ink-2">Call or text </span>
            {site.phone.label}
          </a>
          <a href={site.quote} target="_blank" rel="noreferrer" className="btn btn-sun min-h-[44px] px-5">
            Free quote
          </a>
          <MenuButton className="btn btn-line min-h-[44px] px-5" />
        </div>
      </div>
    </div>
  )
}

// Téléphone et tablette : le menu, appeler, écrire, demander un devis, à portée de pouce une fois l'accueil passé
// (et cachée quand la section contact, qui offre les mêmes choix, est à l'écran)
export function ActionBar() {
  const past = usePastHero()
  const [atContact, setAtContact] = useState(false)
  useEffect(() => {
    const contact = document.getElementById('contact')
    if (!contact) return
    const io = new IntersectionObserver(([e]) => setAtContact(e.isIntersecting))
    io.observe(contact)
    return () => io.disconnect()
  }, [])
  return (
    <div className="actions lg:hidden" data-on={past && !atContact ? '' : undefined} role="group" aria-label="Menu and contact">
      <MenuButton className="">
        <Menu aria-hidden="true" />
        Menu
      </MenuButton>
      <a href={site.phone.href}>
        <Phone aria-hidden="true" />
        Call
      </a>
      <a href={site.phone.sms}>
        <MessageSquareText aria-hidden="true" />
        Text
      </a>
      <a href={site.quote} target="_blank" rel="noreferrer" className="bg-sun">
        Free quote
      </a>
    </div>
  )
}
