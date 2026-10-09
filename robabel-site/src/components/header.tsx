// En-tête : transparent sur la photo d'accueil, plein dès qu'on la quitte.
// Sur téléphone : le numéro en un geste, et le menu dans un panneau.
import { useEffect, useState } from 'react'
import { Menu, Phone } from 'lucide-react'

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { go } from '@/lib/motion'
import { nav, site } from '@/lib/site'
import { cn } from '@/lib/utils'

export function Lockup({ className }: { className?: string }) {
  return (
    <span className={cn('lockup', className)}>
      <span className="lockup-a">Custom Pools</span>{' '}
      <span className="lockup-b">by Rob Abel</span>
    </span>
  )
}

export function Header() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const hero = document.getElementById('top')
    const on = () => setSolid(window.scrollY > (hero ? hero.offsetHeight - 90 : 200))
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])

  return (
    <header className={cn('site-header on-dark', solid && 'is-solid')}>
      <div className="wrap flex h-full items-center justify-between gap-6">
        <a href="#top" onClick={(e) => go(e, 'top')} aria-label={`${site.name}, back to the top`} className="shrink-0">
          <Lockup />
        </a>

        <nav aria-label="Sections" className="hidden xl:block">
          <ul className="flex items-center gap-8">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={(e) => go(e, n.id)} className="header-link">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-5">
          <a href={`tel:${site.phone.tel}`} className="header-phone tnum hidden md:inline-flex">
            {site.phone.display}
          </a>
          <a href="#contact" onClick={(e) => go(e, 'contact')} className="btn btn-azure btn-sm hidden sm:inline-flex">
            Book a visit
          </a>
          <a href={`tel:${site.phone.tel}`} aria-label={`Call ${site.phone.display}`} className="icon-btn md:hidden">
            <Phone aria-hidden="true" />
          </a>
          <Sheet>
            <SheetTrigger aria-label="Open the menu" className="icon-btn xl:hidden">
              <Menu aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="menu-panel on-dark border-0 bg-night text-white">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Sections of the page, phone number and address</SheetDescription>
              <Lockup className="text-white" />
              <ul className="mt-10 grid gap-1">
                {nav.map((n) => (
                  <li key={n.id}>
                    <SheetClose asChild>
                      <a href={`#${n.id}`} onClick={(e) => go(e, n.id)} className="menu-link">
                        {n.label}
                      </a>
                    </SheetClose>
                  </li>
                ))}
              </ul>
              <div className="mt-auto grid gap-3 pt-10">
                <a href={`tel:${site.phone.tel}`} className="btn btn-azure tnum">
                  <Phone aria-hidden="true" />
                  {site.phone.display}
                </a>
                <p className="t-small text-white/70">
                  {site.address.street}, {site.address.city}
                  <br />
                  {site.hours.days}, {site.hours.time}
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
