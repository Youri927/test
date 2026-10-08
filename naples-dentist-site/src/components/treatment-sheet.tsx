// La fiche des soins : un panneau à droite (plein écran sur téléphone), avec le texte complet de leurs pages.
// Plusieurs soins peuvent répondre à une même situation : des puces mènent à chacun.
import { ArrowRight, Phone, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { byId, PHONE, PHONE_HREF, type Treatment } from '@/data/content'
import { pauseScroll, scrollToId } from '@/lib/motion'
import { closeSheet, setReason, sheetOpener, useSheet } from '@/lib/sheet'

function Body({ t }: { t: Treatment }) {
  return (
    <article id={`sheet-${t.id}`} className="scroll-mt-4 border-t-[1.5px] border-ink pt-6">
      <h3 className="t-h3">{t.name}</h3>
      <p className="mt-2 font-[600] text-teal-ink">{t.short}</p>
      <div className="mt-5 space-y-5 text-[16.5px] leading-[1.6] text-ink-soft">
        {t.body.map((b, i) => (
          <div key={i}>
            {b.title && <p className="mb-1.5 font-[600] text-ink">{b.title}</p>}
            {b.text && <p>{b.text}</p>}
            {b.list && (
              <dl className="mt-1 divide-y divide-line border-y border-line">
                {b.list.map(([k, v]) => (
                  <div key={k} className="grid gap-0.5 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
                    <dt className="font-[600] text-ink">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        ))}
      </div>
    </article>
  )
}

export function TreatmentSheet() {
  const s = useSheet()
  const scroller = useRef<HTMLDivElement>(null)
  const list = s.ids.map((id) => byId[id]).filter(Boolean)

  useEffect(() => {
    pauseScroll(s.open)
  }, [s.open])

  const jump = (id: string) => {
    const el = scroller.current?.querySelector<HTMLElement>(`#sheet-${id}`)
    el?.scrollIntoView({ behavior: document.documentElement.classList.contains('motion') ? 'smooth' : 'auto', block: 'start' })
  }

  // demande de rendez-vous : le formulaire reprend le motif, puis on y descend
  const request = () => {
    setReason(s.title || list[0]?.name || '')
    closeSheet()
    window.setTimeout(() => scrollToId('request'), 380)
  }

  return (
    <Sheet open={s.open} onOpenChange={(o) => (o ? null : closeSheet())}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="sheet-panel gap-0 border-0 bg-white p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[620px]"
        onCloseAutoFocus={(e) => {
          // pas de bouton d'ouverture attaché au panneau (il s'ouvre depuis plusieurs sections) : on rend le focus à la main
          const el = sheetOpener()
          if (el?.isConnected) {
            e.preventDefault()
            el.focus({ preventScroll: true })
          }
        }}
      >
        <div className="flex items-center justify-between gap-4 px-[clamp(20px,4vw,40px)] pt-5 pb-3">
          <SheetDescription className="text-[14.5px] font-[520] text-ink-soft">{list.length > 1 ? `${list.length} treatments` : 'Treatment'}</SheetDescription>
          <SheetClose className="grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--line)] transition-shadow hover:shadow-[inset_0_0_0_1.5px_var(--ink)]" aria-label="Close">
            <X className="size-5" aria-hidden />
          </SheetClose>
        </div>
        <div ref={scroller} className="flex-1 overflow-y-auto overscroll-contain px-[clamp(20px,4vw,40px)] pb-8" data-lenis-prevent>
          <div className="sheet-stagger">
            <SheetTitle className="t-h2 !text-[clamp(36px,4.6vw,56px)] !leading-[0.95] font-[560] text-ink">{s.title}</SheetTitle>
            {list.length > 1 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {list.map((t) => (
                  <button key={t.id} type="button" onClick={() => jump(t.id)} className="chip">
                    {t.name}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-8 space-y-10">
              {list.map((t) => (
                <Body key={t.id} t={t} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5 border-t border-line px-[clamp(20px,4vw,40px)] pt-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <a href={PHONE_HREF} className="btn btn-teal btn-sm flex-1 sm:flex-none">
            <Phone className="size-4" aria-hidden />
            Call {PHONE}
          </a>
          <button type="button" onClick={request} className="btn btn-line btn-sm flex-1 sm:flex-none">
            Request a visit
            <ArrowRight className="arr size-4" aria-hidden />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
