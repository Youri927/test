// Visionneuse plein écran (Dialog de shadcn/ui, redessiné) : flèches du clavier, glissé du doigt, compteur.
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { pauseScroll } from '@/lib/motion'

export type Shot = { src: string; width: number; height: number; alt: string }

export function Lightbox({ items, index, onIndex }: { items: Shot[]; index: number | null; onIndex: (i: number | null) => void }) {
  const open = index !== null
  const start = useRef<number | null>(null)
  const go = (d: number) => index !== null && onIndex((index + d + items.length) % items.length)

  useEffect(() => {
    pauseScroll(open)
  }, [open])

  const shot = index !== null ? items[index] : null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onIndex(null)}>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 grid h-dvh w-screen max-w-none translate-x-0 translate-y-0 grid-rows-[auto_1fr_auto] gap-0 rounded-none bg-abyss p-0 text-white ring-0 sm:max-w-none"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1)
          if (e.key === 'ArrowLeft') go(-1)
        }}
        data-lenis-prevent
      >
        <div className="flex items-center justify-between px-[var(--gutter)] py-4">
          <p className="t-num text-[15px] text-white/80" aria-live="polite">
            {index !== null ? index + 1 : 0} / {items.length}
          </p>
          <DialogClose className="grid size-11 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.35)] transition-colors hover:bg-white/10" aria-label="Close">
            <X className="size-5" aria-hidden />
          </DialogClose>
        </div>

        <div
          className="relative grid min-h-0 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] place-items-center px-[var(--gutter)] py-2 md:py-4"
          onPointerDown={(e) => (start.current = e.clientX)}
          onPointerUp={(e) => {
            if (start.current === null) return
            const dx = e.clientX - start.current
            start.current = null
            if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1)
          }}
        >
          {shot && (
            <img
              key={index}
              src={shot.src}
              width={shot.width}
              height={shot.height}
              alt={shot.alt}
              className="lb-img max-h-full w-auto max-w-full touch-pan-y object-contain select-none"
              draggable={false}
            />
          )}
          <button onClick={() => go(-1)} className="absolute top-1/2 left-[calc(var(--gutter)*0.5)] hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white text-ink transition-transform hover:scale-105 md:grid" aria-label="Previous photo">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button onClick={() => go(1)} className="absolute top-1/2 right-[calc(var(--gutter)*0.5)] hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white text-ink transition-transform hover:scale-105 md:grid" aria-label="Next photo">
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 px-[var(--gutter)] pt-4 pb-[max(20px,env(safe-area-inset-bottom))]">
          <DialogTitle className="sr-only">Photo viewer</DialogTitle>
          <DialogDescription className="text-[15px] text-white/85">{shot?.alt}</DialogDescription>
          <div className="flex gap-2 md:hidden">
            <button onClick={() => go(-1)} className="grid size-11 place-items-center rounded-full bg-white text-ink" aria-label="Previous photo">
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button onClick={() => go(1)} className="grid size-11 place-items-center rounded-full bg-white text-ink" aria-label="Next photo">
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
