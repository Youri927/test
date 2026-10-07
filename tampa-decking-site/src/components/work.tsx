// Galerie : trois colonnes qui glissent à des vitesses différentes pendant le défilement
// (mécanique de « Parallax Scroll » d'Aceternity UI, réécrite avec GSAP ScrollTrigger). Chaque photo s'ouvre en grand.
import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import { Lightbox, type Shot } from '@/components/lightbox'
import { Lines } from '@/components/lines'
import { work } from '@/data/content'
import { gsap, motion } from '@/lib/motion'
import { photo } from '@/lib/photos'

function Tile({ shot, i, onOpen }: { shot: Shot; i: number; onOpen: (i: number) => void }) {
  return (
    <figure className="group">
      <button onClick={() => onOpen(i)} className="block w-full cursor-zoom-in text-left" aria-label={`Open photo: ${shot.alt}`}>
        <div className="unveil rounded-[4px]" style={{ aspectRatio: `${shot.width} / ${shot.height}` }}>
          <div className="unveil-in size-full">
            <img
              src={shot.src}
              width={shot.width}
              height={shot.height}
              alt=""
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
            />
          </div>
        </div>
      </button>
      <figcaption className="mt-2.5 hidden text-[13.5px] leading-snug text-ink-soft md:block">{shot.alt}</figcaption>
    </figure>
  )
}

export function Work() {
  const root = useRef<HTMLElement>(null)
  const [index, setIndex] = useState<number | null>(null)
  const shots = useMemo<Shot[]>(() => work.map((w) => ({ ...photo(w.id), alt: w.alt })), [])

  // ordinateur : 3 colonnes de 5 ; téléphone : 2 colonnes
  const cols3 = [0, 1, 2].map((c) => shots.map((s, i) => ({ s, i })).slice(c * 5, c * 5 + 5))
  const cols2 = [0, 1].map((c) => shots.map((s, i) => ({ s, i })).filter((_, i) => i % 2 === c && i < 14))

  useLayoutEffect(() => {
    const el = root.current
    if (!el || !motion()) return
    const mm = gsap.matchMedia()
    mm.add(
      '(min-width: 1024px)',
      () => {
        const st = { trigger: '[data-cols]', start: 'top bottom', end: 'bottom top', scrub: true }
        gsap.fromTo('[data-col="0"]', { y: 90 }, { y: -90, ease: 'none', scrollTrigger: st })
        gsap.fromTo('[data-col="1"]', { y: -70 }, { y: 150, ease: 'none', scrollTrigger: st })
        gsap.fromTo('[data-col="2"]', { y: 160 }, { y: -60, ease: 'none', scrollTrigger: st })
      },
      el,
    )
    return () => mm.revert()
  }, [])

  return (
    <section id="work" ref={root} className="overflow-hidden pt-[clamp(96px,13vw,200px)] pb-[clamp(80px,10vw,160px)]" aria-labelledby="work-title">
      <div className="wrap grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
        <Lines id="work-title" className="t-h2 max-w-[12ch] text-ink">Our work, up close</Lines>
        <p data-up className="t-lead max-w-[30rem] text-ink-soft">
          Stone spas, rock waterfalls, travertine and paver decks, and decks refinished in a decorative coating. Tap a photo to see it large.
        </p>
      </div>

      <div data-cols className="wrap mt-[clamp(40px,6vw,96px)]">
        <div className="hidden grid-cols-3 items-start gap-[clamp(16px,2vw,32px)] lg:grid">
          {cols3.map((col, c) => (
            <div key={c} data-col={c} className="grid gap-[clamp(16px,2vw,32px)]">
              {col.map(({ s, i }) => (
                <Tile key={i} shot={s} i={i} onOpen={setIndex} />
              ))}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 items-start gap-3 lg:hidden">
          {cols2.map((col, c) => (
            <div key={c} className={`grid gap-3 ${c === 1 ? 'pt-12' : ''}`}>
              {col.map(({ s, i }) => (
                <Tile key={i} shot={s} i={i} onOpen={setIndex} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <Lightbox items={shots} index={index} onIndex={setIndex} />
    </section>
  )
}
