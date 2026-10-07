// « Keep it looking new » : le scellement des pavés en six étapes, sur une ligne qui se remplit pendant
// le défilement (mécanique de la « Timeline » d'Aceternity UI, réécrite avec GSAP), puis le nettoyage haute pression.
import { useLayoutEffect, useRef } from 'react'

import { Lines } from '@/components/lines'
import { sealing } from '@/data/content'
import { gsap, motion, ScrollTrigger } from '@/lib/motion'
import { photo } from '@/lib/photos'

const washing = ['Roofs, with a soft wash', 'Pool decks and patios', 'Driveways and walkways', 'Oil, rust and graffiti stains']

export function Care() {
  const list = useRef<HTMLOListElement>(null)
  const p = photo('care-pavers')

  useLayoutEffect(() => {
    const el = list.current
    if (!el) return
    if (!motion()) {
      el.querySelectorAll('li').forEach((li) => li.classList.add('is-done'))
      return
    }
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-fill]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 62%', end: 'bottom 62%', scrub: true } })
      el.querySelectorAll('li').forEach((li) => {
        ScrollTrigger.create({ trigger: li, start: 'top 62%', onEnter: () => li.classList.add('is-done'), onLeaveBack: () => li.classList.remove('is-done') })
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="care" className="bg-water-2 py-[clamp(88px,11vw,176px)]" aria-labelledby="care-title">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
          <Lines id="care-title" className="t-h2 max-w-[12ch] text-ink">Keep it looking new</Lines>
          <p data-up className="t-lead max-w-[30rem] text-ink-soft">
            Florida sun, rain and humidity are hard on outdoor surfaces. Sealing and cleaning keep them looking new for longer.
          </p>
        </div>

        <div className="mt-[clamp(48px,6vw,96px)] grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-[clamp(48px,6vw,104px)]">
          <figure className="lg:sticky lg:top-[calc(var(--header)+32px)] lg:self-start">
            <div className="unveil rounded-[4px]" style={{ aspectRatio: `${p.width} / ${p.height}` }}>
              <div className="unveil-in size-full">
                <img src={p.src} width={p.width} height={p.height} alt="Pool steps and a light paver deck by a brick house" loading="lazy" decoding="async" className="size-full object-cover" />
              </div>
            </div>
            <figcaption className="mt-3 text-[13.5px] text-ink-soft">Pool steps and a light paver deck</figcaption>
          </figure>

          <div>
            <h3 className="t-h3 text-ink">Paver sealing, in six steps</h3>
            <ol ref={list} className="relative mt-8 grid gap-8">
              <span className="absolute top-2 bottom-2 left-[11px] w-px bg-ink/20" aria-hidden />
              <span data-fill className="absolute top-2 bottom-2 left-[11px] w-px origin-top bg-ink" aria-hidden />
              {sealing.map((s) => (
                <li key={s.name} className="step relative grid gap-1.5 pl-12">
                  <span className="step-dot absolute top-[3px] left-0 grid size-[23px] place-items-center rounded-full bg-water-2" aria-hidden>
                    <span className="block size-[11px] rounded-full ring-[1.5px] ring-ink" />
                  </span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-[19px] font-[640] [font-stretch:106%] text-ink">{s.name}</p>
                    {s.time && <span className="t-num rounded-full bg-white px-2.5 py-0.5 text-[13px] text-ink">{s.time}</span>}
                  </div>
                  <p className="max-w-[32rem] text-ink-soft">{s.text}</p>
                </li>
              ))}
            </ol>
            <p data-up className="mt-10 rounded-[4px] bg-white px-5 py-4 text-[15px] text-ink">
              In the Tampa area, pavers should be resealed every two to three years, more often next to a pool.
            </p>
          </div>
        </div>

        <div className="mt-[clamp(72px,9vw,140px)] grid gap-8 border-t border-ink/15 pt-[clamp(40px,5vw,72px)] lg:grid-cols-[1fr_1.1fr] lg:gap-[clamp(48px,6vw,104px)]">
          <div data-up>
            <h3 className="t-h3 text-ink">Pressure washing</h3>
            <p className="mt-4 max-w-[30rem] text-ink-soft">
              From a simple driveway cleaning to a full pool deck, with commercial-grade equipment. Our team is fully insured.
            </p>
          </div>
          <ul data-up className="grid content-start gap-x-8 sm:grid-cols-2">
            {washing.map((w) => (
              <li key={w} className="border-b border-ink/15 py-3.5 text-[17px] font-[560] text-ink">
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
