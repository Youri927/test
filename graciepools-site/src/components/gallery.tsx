// Les photos des modèles Barrier Reef (photos du fabricant, présentées comme telles), en bande horizontale.
// Un modèle connu renvoie au comparateur, à sa vraie taille.
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { Lines } from '@/components/lines'
import { Photo } from '@/components/photo'
import { PoolPlan } from '@/components/pool-plan'
import { useChoice } from '@/lib/choice'
import { scrollToId } from '@/lib/motion'
import type { PhotoId } from '@/lib/photos'
import { modelById, type FinishId } from '@/lib/pools'

type Shot = { id: PhotoId; alt: string; caption: string; model?: string; finish?: FinishId; ratio: number }

const SHOTS: Shot[] = [
  { id: 'escape-ocean', alt: 'A small rectangular plunge pool with a stone coping, artificial turf and a wooden fence', caption: 'Escape Plunge in Ocean Shimmer', model: 'escape', finish: 'ocean', ratio: 16 / 9 },
  { id: 'dusk-fire', alt: 'A rectangular pool at dusk with an outdoor stone fireplace behind it', caption: 'At dusk, with an outdoor fireplace', ratio: 3 / 2 },
  { id: 'cove-california', alt: 'A free-form pool with a curved coping and a stamped concrete deck', caption: 'Billabong Cove in California Shimmer', model: 'billabong-cove', finish: 'california', ratio: 3 / 2 },
  { id: 'patio', alt: 'A rectangular pool with a paver deck, loungers, planters and a sofa', caption: 'Pavers, loungers and planters', ratio: 3 / 2 },
  { id: 'dusk-steps', alt: 'Lit entry steps across the shallow end of a pool at night', caption: 'Lit steps across the shallow end', ratio: 3 / 2 },
  { id: 'oyster-arctic', alt: 'A kidney-shaped pool with a wide entry and a light coping', caption: 'Oyster in Arctic Shimmer', model: 'oyster', finish: 'arctic', ratio: 3 / 2 },
  { id: 'milano', alt: 'A Roman-shaped pool with rounded ends and a light deck', caption: 'Milano, the Roman shape', model: 'milano', ratio: 3 / 2 },
  { id: 'loungers', alt: 'A pool lined with loungers and umbrellas, trees behind', caption: 'Umbrellas and loungers along the deck', ratio: 3 / 2 },
]

export function Gallery() {
  const track = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })
  const { setPick, setFinish } = useChoice()

  useEffect(() => {
    const t = track.current
    if (!t) return
    const update = () => setEdges({ start: t.scrollLeft < 8, end: t.scrollLeft + t.clientWidth > t.scrollWidth - 8 })
    update()
    t.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    // à la souris, on peut aussi faire glisser la bande
    let down = false
    let sx = 0
    let sl = 0
    let moved = false
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      down = true
      moved = false
      sx = e.clientX
      sl = t.scrollLeft
    }
    const onMove = (e: PointerEvent) => {
      if (!down) return
      const dx = e.clientX - sx
      if (Math.abs(dx) > 4) {
        moved = true
        t.classList.add('is-dragging')
      }
      t.scrollLeft = sl - dx
    }
    const onUp = () => {
      down = false
      t.classList.remove('is-dragging')
    }
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault()
        e.stopPropagation()
        moved = false
      }
    }
    t.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    t.addEventListener('click', onClick, true)
    return () => {
      t.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      t.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      t.removeEventListener('click', onClick, true)
    }
  }, [])

  const page = (dir: 1 | -1) => {
    const t = track.current
    if (!t) return
    t.scrollBy({ left: dir * Math.min(t.clientWidth * 0.8, 720), behavior: 'smooth' })
  }

  const toScale = (s: Shot) => {
    if (!s.model) return
    setPick({ model: s.model, size: 0 })
    if (s.finish) setFinish(s.finish)
    scrollToId('models')
  }

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="relative bg-deck">
      <div className="wrap pt-[clamp(72px,9vw,136px)]">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="max-w-[46rem]">
            <Lines id="gallery-title" className="t-h2">
              What they look like in the ground
            </Lines>
            <p className="t-lead mt-5 text-ink-soft" data-up>
              Barrier Reef pools photographed by the manufacturer. Tap a model name to see it to scale.
            </p>
          </div>
          <div className="hidden gap-2 md:flex" data-up>
            <button type="button" onClick={() => page(-1)} disabled={edges.start} className="round-btn" aria-label="Previous photos">
              <ArrowLeft className="size-5" aria-hidden />
            </button>
            <button type="button" onClick={() => page(1)} disabled={edges.end} className="round-btn" aria-label="Next photos">
              <ArrowRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
      <div ref={track} className="gallery-track mt-10 pb-[clamp(72px,9vw,136px)]" tabIndex={0} aria-label="Photos of Barrier Reef pools, scroll sideways">
        {SHOTS.map((s, i) => (
          <figure key={s.id} className="gallery-card" style={{ '--r': s.ratio, '--d': `${Math.min(i, 3) * 0.08}s` } as CSSProperties} data-up>
            <Photo id={s.id} alt={s.alt} className="gallery-img rounded-[18px]" unveil={false} />
            <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[15px]">
              {s.model ? (
                <button type="button" onClick={() => toScale(s)} className="group inline-flex items-center gap-3 text-left font-[600]">
                  <MiniPlan id={s.model} finish={s.finish ?? 'california'} />
                  <span className="ul">{s.caption}</span>
                </button>
              ) : (
                <span className="font-[600]">{s.caption}</span>
              )}
              <span className="text-[13.5px] text-ink-soft">Photo: Barrier Reef</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/** le dessin du modèle à côté de sa photo, à petite échelle */
function MiniPlan({ id, finish }: { id: string; finish: FinishId }) {
  const m = modelById(id)
  const s = m.sizes[0]
  const ppf = 1.7
  const L = (s.l / 12) * ppf
  const W = (s.w / 12) * ppf
  return (
    <svg width={Math.ceil(L) + 2} height={Math.ceil(W) + 2} aria-hidden className="shrink-0">
      <PoolPlan model={m} size={s} finish={finish} ppf={ppf} x={1} y={1} drift={false} lines={false} />
    </svg>
  )
}
