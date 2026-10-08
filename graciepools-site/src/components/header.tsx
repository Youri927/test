// En-tête : la marque, les ancres, le téléphone et l'envoi de photo par SMS. Il se cache quand on descend et revient quand on remonte.
// Sur téléphone et tablette, le menu s'ouvre dans un panneau (Sheet de shadcn/ui, redessiné).
import { Menu, MessageSquareText, Phone, X } from 'lucide-react'
import { useEffect, useState, type MouseEvent } from 'react'

import { Logo } from '@/components/logo'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { go, pauseScroll, scrollToId } from '@/lib/motion'
import { EMAIL, PHONE, sms, TEL } from '@/lib/site'
import { cn } from '@/lib/utils'

export const NAV = [
  { id: 'fiberglass', label: 'Fiberglass' },
  { id: 'models', label: 'Models' },
  { id: 'concrete', label: 'Concrete' },
  { id: 'service', label: 'Liners & repairs' },
  { id: 'package', label: 'Financing' },
  { id: 'contact', label: 'Contact' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [dark, setDark] = useState(false)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')

  useEffect(() => {
    let last = window.scrollY
    const darks = () => Array.from(document.querySelectorAll<HTMLElement>('.on-dark'))
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 8)
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 480)
        last = y
      }
      // au-dessus d'une section sombre, l'en-tête passe en sombre lui aussi
      const probe = 30
      setDark(darks().some((s) => {
        const r = s.getBoundingClientRect()
        return r.top <= probe && r.bottom > probe
      }))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(e.target.id)
          else setCurrent((c) => (c === e.target.id ? '' : c))
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    NAV.forEach((n) => {
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

  const closeThenGo = (e: MouseEvent, id: string) => {
    e.preventDefault()
    setOpen(false)
    window.setTimeout(() => scrollToId(id), 320)
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-[transform,background-color,box-shadow,color] duration-500 ease-[cubic-bezier(.16,1,.3,1)]',
        dark ? 'on-dark bg-ink/96 text-white shadow-[0_1px_0_rgb(255_255_255/0.08)]' : scrolled ? 'bg-white/96 text-ink shadow-[0_1px_0_var(--line)]' : 'bg-white/0 text-ink',
        hidden && !open && '-translate-y-[calc(100%+2px)]',
      )}
    >
      <div className="wrap flex h-[var(--header)] items-center justify-between gap-6">
        <a href="#top" onClick={(e) => go(e, 'top')} className="shrink-0" aria-label="Gracie Pools, back to top">
          <Logo />
        </a>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-[clamp(18px,2vw,34px)] text-[15.5px] font-[560]">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={(e) => go(e, n.id)} className="inline-block py-2" aria-current={current === n.id ? 'true' : undefined}>
                  <span className={cn('ul', current === n.id && 'is-current')}>{n.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <a href={TEL} className="hidden items-center gap-2 px-2 text-[15.5px] font-[600] md:inline-flex">
            <Phone className="size-4" aria-hidden />
            <span className="tnum">{PHONE}</span>
          </a>
          <a href={sms()} className={cn('btn btn-sm hidden sm:inline-flex', dark ? 'btn-white' : 'btn-ink')}>
            <MessageSquareText className="size-4" aria-hidden />
            Text a photo
          </a>
          <a href={TEL} className={cn('grid size-11 place-items-center rounded-full md:hidden', dark ? 'bg-white text-ink' : 'bg-ink text-white')} aria-label={`Call ${PHONE}`}>
            <Phone className="size-[18px]" aria-hidden />
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                'grid size-11 place-items-center rounded-full transition-shadow xl:hidden',
                dark ? 'shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.25)] hover:shadow-[inset_0_0_0_1.5px_#fff]' : 'shadow-[inset_0_0_0_1.5px_var(--line)] hover:shadow-[inset_0_0_0_1.5px_var(--ink)]',
              )}
              aria-label="Open the menu"
            >
              <Menu className="size-5" aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" showCloseButton={false} className="sheet-panel border-0 bg-white p-0 text-ink data-[side=right]:w-full data-[side=right]:sm:max-w-md" data-lenis-prevent>
              <div className="flex h-[var(--header)] items-center justify-between px-[var(--gutter)]">
                <Logo />
                <SheetClose className="grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--line)]" aria-label="Close the menu">
                  <X className="size-5" aria-hidden />
                </SheetClose>
              </div>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Sections of the page and contact details</SheetDescription>
              <nav aria-label="Mobile" className="flex flex-1 flex-col justify-between overflow-y-auto px-[var(--gutter)] pt-6 pb-[max(28px,env(safe-area-inset-bottom))]">
                <ul className="space-y-0.5">
                  {NAV.map((n, i) => (
                    <li key={n.id} className="sheet-item" style={{ animationDelay: `${0.08 + i * 0.045}s` }}>
                      <a href={`#${n.id}`} onClick={(e) => closeThenGo(e, n.id)} className="block py-1 text-[42px] leading-[1.08] font-[660] tracking-[-0.035em]">
                        {n.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="space-y-3 pt-10">
                  <a href={sms()} className="btn btn-ink w-full">
                    <MessageSquareText className="size-4" aria-hidden />
                    Text a photo of your pool
                  </a>
                  <a href={TEL} className="btn btn-line w-full">
                    <Phone className="size-4" aria-hidden />
                    Call <span className="tnum">{PHONE}</span>
                  </a>
                  <a href={`mailto:${EMAIL}`} className="block pt-2 text-center text-[15px] text-ink-soft">
                    {EMAIL}
                  </a>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
