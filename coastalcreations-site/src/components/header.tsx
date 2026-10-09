// En-tête : le nom, les chapitres, le téléphone (appel ou SMS) et le devis gratuit.
// Transparent sur l'accueil, il devient blanc au défilement, se cache quand on descend et revient quand on remonte.
import { Menu, MessageSquareText, Phone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { go } from '@/lib/motion'
import { nav, site } from '@/lib/site'

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className="text-[19px] font-[820] tracking-[-0.02em] [font-stretch:125%] sm:text-[21px]">Coastal Creations</span>
      <span className="mt-[5px] text-[12.5px] font-[520] tracking-[0.01em] opacity-80">Pools and Lagoons</span>
    </span>
  )
}

export function Header() {
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const jumped = useRef<string | null>(null)

  // le chapitre qui passe au milieu de l'écran est souligné dans le menu
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id)
      },
      { rootMargin: '-45% 0px -54% 0px' },
    )
    const ids = [...nav.map((n) => n.id), 'top', 'services', 'area', 'contact']
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      el.toggleAttribute('data-solid', y > 40)
      // caché en descendant, de retour en remontant ; toujours visible en haut de page
      el.toggleAttribute('data-hidden', y > 500 && y > last + 2)
      if (y < last - 2) el.removeAttribute('data-hidden')
      last = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header ref={ref} className="site-header text-navy">
      <a href="#main" className="sr-only rounded bg-navy px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3">
        Skip to content
      </a>
      <div className="wrap flex h-full items-center justify-between gap-6">
        <a href="#top" onClick={(e) => go(e, 'top')}>
          <Wordmark />
          <span className="sr-only">, back to top</span>
        </a>
        <nav aria-label="Sections" className="hidden items-center gap-7 lg:flex">
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={(e) => go(e, n.id)} className="nav-link" aria-current={current === n.id ? 'true' : undefined}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <a href={site.phone.href} className="hidden items-center gap-2 px-2 text-[15.5px] font-[640] [font-stretch:108%] xl:flex">
            <Phone aria-hidden="true" className="size-4" />
            {site.phone.label}
          </a>
          <a href={site.quote} target="_blank" rel="noreferrer" className="btn btn-navy hidden min-h-[44px] px-5 text-[15px] sm:inline-flex">
            Free quote
          </a>
          <a href={site.phone.sms} aria-label={`Text us at ${site.phone.label}`} className="grid size-11 place-items-center rounded-full border-[1.5px] border-current sm:hidden">
            <MessageSquareText aria-hidden="true" className="size-5" />
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="grid size-11 place-items-center rounded-full bg-navy text-white lg:hidden" aria-label="Open the menu">
              <Menu aria-hidden="true" className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="on-dark w-[min(88vw,380px)] border-0 bg-navy p-0 text-white"
              // après un lien du menu, le focus reste sur le chapitre atteint au lieu de revenir au bouton du menu
              onCloseAutoFocus={(e) => {
                if (!jumped.current) return
                e.preventDefault()
                document.getElementById(jumped.current)?.focus({ preventScroll: true })
                jumped.current = null
              }}
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Sections of the page and ways to reach us</SheetDescription>
              <div className="flex h-full flex-col px-7 pt-20 pb-8">
                <nav aria-label="Sections" className="flex flex-col">
                  {nav.map((n) => (
                    <a
                      key={n.id}
                      href={`#${n.id}`}
                      onClick={(e) => {
                        jumped.current = n.id
                        setOpen(false)
                        go(e, n.id)
                      }}
                      className="border-b border-white/15 py-4 text-[26px] font-[760] tracking-[-0.02em] [font-stretch:120%]"
                    >
                      {n.label}
                    </a>
                  ))}
                  <a
                    href="#contact"
                    onClick={(e) => {
                      jumped.current = 'contact'
                      setOpen(false)
                      go(e, 'contact')
                    }}
                    className="py-4 text-[26px] font-[760] tracking-[-0.02em] [font-stretch:120%]"
                  >
                    Contact
                  </a>
                </nav>
                <div className="mt-auto flex flex-col gap-3">
                  <a href={site.quote} target="_blank" rel="noreferrer" className="btn btn-aqua w-full">
                    Request a free quote
                  </a>
                  <a href={site.phone.href} className="btn btn-line w-full">
                    <Phone aria-hidden="true" />
                    Call {site.phone.label}
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
