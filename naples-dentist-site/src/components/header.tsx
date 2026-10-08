// En-tête : logo, ancres, état du cabinet et téléphone. Il se cache quand on descend et revient quand on remonte.
// Sur téléphone et tablette, le menu s'ouvre dans un panneau plein écran (Sheet de shadcn/ui, redessiné).
import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'

import { Logo } from '@/components/logo'
import { OfficeState } from '@/components/office-state'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { CITY, EMERGENCY, EMERGENCY_SMS, nav, PHONE, PHONE_HREF, STREET, UNIT } from '@/data/content'
import { go, pauseScroll, scrollToId } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <Logo className="h-[38px] w-auto shrink-0 fill-current md:h-[42px]" />
      <span className="text-[14px] leading-[1.12] font-[600] tracking-[-0.01em] [font-stretch:94%] md:text-[15px]">
        Implant &amp; Comprehensive
        <br />
        Dentistry of Naples
      </span>
    </span>
  )
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
        setHidden(y > last && y > 420)
        last = y
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    // section en cours, pour souligner l'ancre correspondante
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    nav.forEach((n) => {
      const el = document.getElementById(n.id)
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
        scrolled ? 'bg-white/96 shadow-[0_1px_0_var(--line)]' : 'bg-white/0',
        hidden && !open && '-translate-y-[calc(100%+2px)]',
      )}
    >
      <div className="wrap flex h-[var(--header)] items-center justify-between gap-6">
        <a href="#top" onClick={(e) => go(e, 'top')} className="shrink-0" aria-label="Implant & Comprehensive Dentistry of Naples, back to top">
          <Brand />
        </a>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-[clamp(16px,1.8vw,30px)] text-[15px] font-[520]">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={(e) => go(e, n.id)} className="inline-block py-2" aria-current={current === n.id ? 'true' : undefined}>
                  <span className={cn('ul', current === n.id && 'is-current')}>{n.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <OfficeState compact className="hidden 2xl:flex" />
          <a href={PHONE_HREF} className="btn btn-ink btn-sm hidden sm:inline-flex">
            <Phone className="size-4" aria-hidden />
            {PHONE}
          </a>
          <a href={PHONE_HREF} className="grid size-11 place-items-center rounded-full bg-ink text-white sm:hidden" aria-label={`Call ${PHONE}`}>
            <Phone className="size-[18px]" aria-hidden />
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--line)] transition-shadow hover:shadow-[inset_0_0_0_1.5px_var(--ink)] xl:hidden" aria-label="Open the menu">
              <Menu className="size-5" aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" showCloseButton={false} className="sheet-panel border-0 bg-white p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md" data-lenis-prevent>
              <div className="flex h-[var(--header)] items-center justify-between px-[var(--gutter)]">
                <Brand />
                <SheetClose className="grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--line)]" aria-label="Close the menu">
                  <X className="size-5" aria-hidden />
                </SheetClose>
              </div>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Sections of the page and contact details</SheetDescription>
              <nav aria-label="Mobile" className="flex flex-1 flex-col justify-between overflow-y-auto px-[var(--gutter)] pt-6 pb-[max(28px,env(safe-area-inset-bottom))]">
                <ul className="space-y-0.5">
                  {nav.map((n, i) => (
                    <li key={n.id} className="sheet-item" style={{ animationDelay: `${0.08 + i * 0.045}s` }}>
                      <a href={`#${n.id}`} onClick={(e) => closeThenGo(e, n.id)} className="t-h2 block py-1 !text-[42px]">
                        {n.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="space-y-5 pt-10">
                  <OfficeState />
                  <a href={PHONE_HREF} className="btn btn-teal w-full">
                    <Phone className="size-4" aria-hidden />
                    Call {PHONE}
                  </a>
                  <div className="grid gap-1 text-[15px] text-ink-soft">
                    <a href={EMERGENCY_SMS} className="font-[600] text-ink">
                      Emergency? Text {EMERGENCY}
                    </a>
                    <span>
                      {STREET}, {UNIT}, {CITY}
                    </span>
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
