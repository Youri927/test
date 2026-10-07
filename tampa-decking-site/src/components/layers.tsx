// « From the deck down » : la coupe du bord de bassin sert de menu des services.
// Ordinateur : la scène reste fixe pendant le défilement, chaque couche s'allume à son tour et le dessin
// se recadre dessus (transformations seulement). Téléphone, tablette ou animations réduites : on touche les couches.
import { Check } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import { Lines } from '@/components/lines'
import { SectionDrawing } from '@/components/section-drawing'
import { layers, type LayerId } from '@/data/content'
import { gsap, motion, ScrollTrigger, scrollToY, useMediaQuery } from '@/lib/motion'
import { photo } from '@/lib/photos'
import { cn } from '@/lib/utils'

// Cadrage du dessin pour chaque couche : point visé (en fraction du dessin) et grossissement.
const CAMERA: Record<LayerId | 'all', { fx: number; fy: number; s: number }> = {
  all: { fx: 0.5, fy: 0.5, s: 1 },
  deck: { fx: 0.25, fy: 0.3, s: 1.08 },
  coping: { fx: 0.54, fy: 0.26, s: 1.3 },
  tile: { fx: 0.58, fy: 0.34, s: 1.38 },
  finish: { fx: 0.62, fy: 0.68, s: 1.22 },
}

function frame(box: HTMLElement, id: LayerId | null) {
  const { fx, fy, s } = CAMERA[id ?? 'all']
  const w = box.offsetWidth
  const h = box.offsetHeight
  // amène le point visé vers le centre sans jamais découvrir les bords
  const x = Math.min(0, Math.max(w * (1 - s), w * 0.5 - s * fx * w))
  const y = Math.min(0, Math.max(h * (1 - s), h * 0.5 - s * fy * h))
  return { x, y, scale: s }
}

function Intro() {
  return (
    <div className="wrap grid gap-6 pt-[clamp(72px,11vw,160px)] pb-[clamp(28px,4vw,56px)] lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
      <Lines id="layers-title" className="t-h2 max-w-[13ch] text-ink">From the deck down, layer by layer</Lines>
      <p data-up className="t-lead max-w-[30rem] text-ink-soft">
        Ready for a new look, feel or finish? We redo each surface of your pool, one at a time or all at once.
      </p>
    </div>
  )
}

function Tabs({ active, onPick, className }: { active: LayerId | null; onPick: (id: LayerId) => void; className?: string }) {
  return (
    <div role="tablist" aria-label="Layers of a pool" className={cn('flex gap-1 overflow-x-auto', className)}>
      {layers.map((l) => (
        <button
          key={l.id}
          role="tab"
          id={`tab-${l.id}`}
          aria-selected={active === l.id}
          aria-controls="layer-panel"
          onClick={() => onPick(l.id)}
          className={cn(
            'relative h-11 shrink-0 rounded-full px-4 text-[15px] font-[560] transition-colors duration-300',
            active === l.id ? 'bg-ink text-white' : 'text-ink hover:bg-water',
          )}
        >
          {l.tab}
        </button>
      ))}
    </div>
  )
}

function Panel({ active }: { active: LayerId }) {
  const l = layers.find((x) => x.id === active)!
  return (
    <div id="layer-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="grid gap-6">
      <figure className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-water">
        {layers.map((x) => {
          const p = photo(x.photo)
          return (
            <img
              key={x.id}
              src={p.src}
              width={p.width}
              height={p.height}
              alt={x.id === active ? x.alt : ''}
              aria-hidden={x.id !== active}
              loading="lazy"
              decoding="async"
              className={cn('lp-img absolute inset-0 size-full object-cover', x.id === active && 'is-on')}
            />
          )
        })}
      </figure>
      <div key={active} className="panel-in grid gap-4">
        <h3 className="t-h3 text-ink">{l.title}</h3>
        <p className="max-w-[34rem] text-ink-soft">{l.text}</p>
        {l.facts && (
          <ul className="grid gap-2 text-[15px]">
            {l.facts.map((f) => (
              <li key={f} className="flex gap-2.5">
                <Check className="mt-[3px] size-4 shrink-0 text-ink" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        )}
        <ul className="flex flex-wrap gap-1.5" aria-label="Options">
          {l.options.map((o) => (
            <li key={o} className="rounded-full bg-water px-3 py-1 text-[13.5px] font-[520] text-ink">
              {o}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Sheet({ children }: { children: ReactNode }) {
  // cadre de la planche, avec son cartouche
  return (
    <div className="relative overflow-hidden rounded-[4px] border border-line bg-[#fbfdfe]">
      {children}
      <p className="pointer-events-none absolute top-2.5 right-3 text-[11.5px] font-[520] tracking-[0.01em] text-ink-soft/80">Typical pool edge, in section</p>
    </div>
  )
}

function LayersPinned() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const cam = useRef<HTMLDivElement>(null)
  const pin = useRef<ScrollTrigger | null>(null)
  const [active, setActive] = useState<LayerId | null>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // le dessin se construit quand la scène arrive : terrain, coque, enduit, eau, carrelage, plage, margelle, repères
      const parts = ['ground', 'shell', 'finish', 'water', 'tile', 'deck', 'coping', 'notes', 'labels']
      const sel = parts.map((p) => `[data-part="${p}"], [data-layer="${p}"]`)
      gsap.set(sel, { opacity: 0, y: 18 })
      const build = gsap.timeline({ paused: true, defaults: { ease: 'expo.out', duration: 1.2 } })
      sel.forEach((s, i) => build.to(s, { opacity: 1, y: 0 }, i * 0.13))
      ScrollTrigger.create({ trigger: stage.current, start: 'top 78%', once: true, onEnter: () => build.play() })

      pin.current = ScrollTrigger.create({
        trigger: stage.current,
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * 3.4),
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const i = Math.min(layers.length - 1, Math.floor(self.progress * layers.length))
          setActive(layers[i].id)
        },
        onLeaveBack: () => setActive(null),
      })
    }, root)
    return () => {
      ctx.revert()
      pin.current = null
    }
  }, [])

  // recadrage du dessin sur la couche active
  useEffect(() => {
    if (!box.current || !cam.current) return
    gsap.to(cam.current, { ...frame(box.current, active), duration: 1.5, ease: 'expo.out', overwrite: true })
  }, [active])

  const jump = (id: LayerId) => {
    const st = pin.current
    if (!st) return
    const i = layers.findIndex((l) => l.id === id)
    scrollToY(st.start + ((i + 0.5) / layers.length) * (st.end - st.start))
  }

  return (
    <section id="layers" ref={root} aria-labelledby="layers-title">
      <Intro />
      <div ref={stage} className="h-screen">
        <div className="wrap grid h-full grid-cols-[1.32fr_1fr] items-center gap-[clamp(32px,4vw,72px)] pt-[calc(var(--header)*0.5)] pb-8">
          <div className="grid gap-5">
            <Sheet>
              <div ref={box} className="relative aspect-[1200/590] overflow-hidden">
                <div ref={cam} className="absolute inset-0 origin-top-left">
                  <SectionDrawing active={active} onSelect={jump} />
                </div>
              </div>
            </Sheet>
            <div className="flex items-center justify-between gap-4">
              <Tabs active={active} onPick={jump} />
              <Progress active={active} />
            </div>
          </div>
          <Panel active={active ?? 'deck'} />
        </div>
      </div>
    </section>
  )
}

function Progress({ active }: { active: LayerId | null }) {
  const i = active ? layers.findIndex((l) => l.id === active) + 1 : 0
  return (
    <div className="hidden h-[3px] w-28 overflow-hidden rounded-full bg-line xl:block" aria-hidden>
      <div className="h-full origin-left bg-ink transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)]" style={{ transform: `scaleX(${i / layers.length})` }} />
    </div>
  )
}

function LayersStatic() {
  const [active, setActive] = useState<LayerId>('deck')
  const compact = useMediaQuery('(max-width: 767px)')
  return (
    <section id="layers" aria-labelledby="layers-title">
      <Intro />
      <div className="wrap grid gap-8 md:gap-10 lg:grid-cols-[1.32fr_1fr] lg:items-start">
        <div className="grid gap-4">
          <Sheet>
            <SectionDrawing active={active} onSelect={setActive} compact={compact} />
          </Sheet>
          <Tabs active={active} onPick={setActive} className="-mx-1 px-1" />
        </div>
        <Panel active={active} />
      </div>
    </section>
  )
}

export function Layers() {
  const desktop = useMediaQuery('(min-width: 1024px) and (min-height: 640px)')
  return desktop && motion() ? <LayersPinned /> : <LayersStatic />
}
