// Le menu : un seul panneau, que l'on peut ouvrir depuis l'en-tête, le bandeau du haut ou la barre d'actions du téléphone.
// Après un lien du menu, le focus va au chapitre atteint ; sinon il revient au bouton qui l'a ouvert.
import { Phone } from 'lucide-react'
import { useRef, useSyncExternalStore, type ReactNode } from 'react'

import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { go } from '@/lib/motion'
import { nav, site } from '@/lib/site'

let isOpen = false
let opener: HTMLElement | null = null
const subs = new Set<() => void>()
const set = (v: boolean) => {
  isOpen = v
  subs.forEach((f) => f())
}
const useOpen = () =>
  useSyncExternalStore(
    (f) => {
      subs.add(f)
      return () => subs.delete(f)
    },
    () => isOpen,
    () => false,
  )

export function MenuButton({ className, children = 'Menu' }: { className: string; children?: ReactNode }) {
  const open = useOpen()
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={(e) => {
        opener = e.currentTarget
        set(true)
      }}
    >
      {children}
    </button>
  )
}

export function SiteMenu() {
  const open = useOpen()
  const jumped = useRef<string | null>(null)
  return (
    <Sheet open={open} onOpenChange={set}>
      <SheetContent
        side="right"
        className="w-full border-0 bg-paper p-0 text-ink sm:max-w-md"
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          const target = jumped.current ? document.getElementById(jumped.current) : opener
          target?.focus({ preventScroll: true })
          jumped.current = null
        }}
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Sections of the page and ways to reach us</SheetDescription>
        <div className="flex h-full flex-col overflow-y-auto px-6 pt-20 pb-8">
          <nav aria-label="Sections" className="flex flex-col border-t border-rule">
            {[...nav, { id: 'area', label: 'Service area' }, { id: 'contact', label: 'Contact' }].map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={(e) => {
                  jumped.current = n.id
                  set(false)
                  go(e, n.id)
                }}
                className="border-b border-rule py-4 text-[30px] leading-tight font-[300] tracking-[-0.02em]"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="mt-auto grid gap-3 pt-10">
            <a href={site.quote} target="_blank" rel="noreferrer" className="btn btn-sun w-full">
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
  )
}
