// Ce qu'ils font, en deux mots tirés du titre de l'accueil : « Built » (les piscines neuves) et « Rebuilt » (tout le reste).
// Chaque mot coiffe son propre contenu ; les deux glissent légèrement en sens contraire au défilement.
import { CircleSlash } from 'lucide-react'
import { useRef } from 'react'

import { Frame } from '@/components/frame'
import { Lines } from '@/components/lines'
import { go, gsap, useScrollAnim } from '@/lib/motion'
import { extras, rebuilt } from '@/lib/site'

export function Services() {
  const ref = useRef<HTMLElement>(null)

  useScrollAnim(ref, (q) => {
    const [a] = q('.word-built')
    const [b] = q('.word-rebuilt')
    if (!a || !b) return
    const st = { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true }
    gsap.fromTo(a, { xPercent: -3 }, { xPercent: 3, ease: 'none', scrollTrigger: st })
    gsap.fromTo(b, { xPercent: 3 }, { xPercent: -3, ease: 'none', scrollTrigger: st })
  })

  return (
    <section ref={ref} id="services" className="bg-white-sec overflow-hidden" aria-label="What we do">
      <div className="wrap py-[var(--section)]">
        <div className="grid-12 gap-y-8">
          <div className="word-built col-span-12">
            <Lines as="h2" className="t-giant">
              Built
            </Lines>
          </div>
          <div className="col-span-12 sm:col-span-9 lg:col-span-4 lg:pt-3">
            <p className="t-lead">New pools, designed around your house, your yard and your budget, then engineered, permitted and built. About 6 to 12 weeks for a typical project.</p>
            <a href="#build" onClick={(e) => go(e, 'build')} className="btn btn-line mt-7">
              How we build a new pool
            </a>
          </div>
          <figure className="col-span-12 lg:col-span-7 lg:col-start-6">
            <Frame id="pool-ocher" alt="A new rectangular pool with a deck of ocher and rose pavers, behind a house in Bradenton" ratio={16 / 10} sizes="(min-width: 1024px) 56vw, 100vw" cage={{ cols: 4, rows: 3 }} />
            <figcaption className="t-note mt-3 text-ink-soft">New construction in Bradenton.</figcaption>
          </figure>
        </div>

        <div className="grid-12 mt-[clamp(88px,10vw,168px)] gap-y-8">
          <div className="word-rebuilt col-span-12 lg:text-right">
            <Lines as="h2" className="t-giant">
              Rebuilt
            </Lines>
          </div>
          <p className="t-lead col-span-12 sm:col-span-9 lg:col-span-4 lg:pt-3">
            Renovations and repairs for homes, vacation rentals and commercial pools.
          </p>
          <ul className="col-span-12 border-t border-line lg:col-span-7 lg:col-start-6">
            {rebuilt.map((r) => (
              <li key={r.label} className="border-b border-line">
                <a href={`#${r.id}`} onClick={(e) => go(e, r.id)} className="group grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-baseline">
                  <span className="t-h4 transition-colors duration-300 group-hover:text-cobalt">{r.label}</span>
                  <span className="t-small text-ink-soft">{r.note}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid-12 mt-[clamp(64px,7vw,112px)] gap-y-6 border-t border-line pt-8">
          <p className="t-small col-span-12 text-ink-soft lg:col-span-7">
            <span className="font-[640] text-navy">Also on the list: </span>
            {extras.charAt(0).toLowerCase() + extras.slice(1)}
          </p>
          <p className="t-small col-span-12 flex items-start gap-3 lg:col-span-4 lg:col-start-9">
            <CircleSlash aria-hidden="true" className="mt-[3px] size-[18px] flex-none text-cobalt" />
            <span>
              <span className="font-[640]">One thing we don’t do:</span> routine pool cleaning or weekly maintenance.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
