// En-tête : logo, ancres, téléphone et devis. Il se cache quand on descend et revient quand on remonte.
// Sur téléphone, le menu s'ouvre dans un panneau plein écran (Sheet de shadcn/ui, redessiné).
import { ArrowRight, Menu, Phone, X } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'

import logoNavy from '@/assets/brand/logo-navy.webp'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { EMAIL, nav, PHONE, PHONE_HREF } from '@/data/content'
import { pauseScroll, scrollToId } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function go(e: MouseEvent, id: string) {
  e.preventDefault()
  scrollToId(id)
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 8)
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 520)
        last = y
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    // section en cours, pour souligner l'ancre correspondante
    const ids = nav.map((n) => n.id)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    pauseScroll(open)
  }, [open])

  // le défilement est verrouillé tant que le menu est ouvert : on le ferme, puis on part vers la section
  const closeThenGo = (e: MouseEvent, id: string) => {
    e.preventDefault()
    setOpen(false)
    window.setTimeout(() => scrollToId(id), 320)
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-[transform,background-color,box-shadow] duration-500 ease-[cubic-bezier(.16,1,.3,1)]',
        scrolled ? 'bg-white/95 shadow-[0_1px_0_var(--line)]' : 'bg-white/0',
        hidden && !open && '-translate-y-[calc(100%+2px)]',
      )}
    >
      <div className="wrap flex h-[var(--header)] items-center justify-between gap-6">
        <a href="#top" onClick={(e) => go(e, 'top')} className="shrink-0" aria-label="Tampa Decking & Pools, back to top">
          <img src={logoNavy} alt="Tampa Decking & Pools" width={464} height={226} className="h-[50px] w-auto md:h-[62px]" />
        </a>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-[clamp(18px,2.2vw,34px)] text-[15px] font-[540]">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={(e) => go(e, n.id)} className="inline-block py-2" aria-current={current === n.id ? 'true' : undefined}>
                  <span className={cn('ul', current === n.id && 'is-current')}>{n.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 md:gap-5">
          <a href={PHONE_HREF} className="ul hidden items-center gap-2 text-[15px] font-[600] md:inline-flex">
            <Phone className="size-4" aria-hidden />
            {PHONE}
          </a>
          <a href="#estimate" onClick={(e) => go(e, 'estimate')} className="btn btn-sun btn-sm hidden sm:inline-flex">
            Free estimate
            <ArrowRight className="arr size-4" aria-hidden />
          </a>
          <a href={PHONE_HREF} className="grid size-11 place-items-center rounded-full bg-sun md:hidden" aria-label={`Call ${PHONE}`}>
            <Phone className="size-[18px]" aria-hidden />
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--line)] lg:hidden" aria-label="Open the menu">
              <Menu className="size-5" aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" showCloseButton={false} className="w-full border-0 bg-white p-0 sm:max-w-md" data-lenis-prevent>
              <div className="flex h-[var(--header)] items-center justify-between px-[var(--gutter)]">
                <img src={logoNavy} alt="" width={464} height={226} className="h-[46px] w-auto" />
                <SheetClose className="grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--line)]" aria-label="Close the menu">
                  <X className="size-5" aria-hidden />
                </SheetClose>
              </div>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Sections of the page and contact details</SheetDescription>
              <nav aria-label="Mobile" className="flex flex-1 flex-col justify-between px-[var(--gutter)] pt-6 pb-[max(28px,env(safe-area-inset-bottom))]">
                <ul className="space-y-1">
                  {nav.map((n, i) => (
                    <li key={n.id} className="sheet-item" style={{ animationDelay: `${0.08 + i * 0.045}s` }}>
                      <a href={`#${n.id}`} onClick={(e) => closeThenGo(e, n.id)} className="t-h2 block py-1.5 !text-[40px]">
                        {n.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="space-y-5 pt-10">
                  <a href="#estimate" onClick={(e) => closeThenGo(e, 'estimate')} className="btn btn-sun w-full justify-center">
                    Get a free estimate
                    <ArrowRight className="arr size-4" aria-hidden />
                  </a>
                  <div className="flex flex-col gap-2 text-[15px]">
                    <a href={PHONE_HREF} className="font-[600]">{PHONE}</a>
                    <a href={`mailto:${EMAIL}`} className="text-ink-soft">{EMAIL}</a>
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
