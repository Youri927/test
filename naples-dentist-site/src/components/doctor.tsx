// Le Dr. Fakhoury, sur fond sombre : son parcours tracé sur une carte de l'est des États-Unis
// (le Michigan où il a grandi, New York où il s'est formé, Naples), sa photo au travail, ses formations.
// Carte : données us-atlas (Census Bureau), projetées par tools/map.mjs.
import { useEffect, useRef, type CSSProperties } from 'react'

import { Lines } from '@/components/lines'
import M from '@/data/east-map.json'
import { gsap, motion } from '@/lib/motion'
import { photo } from '@/lib/photos'

const work = photo('work')
const { michigan: A, newYork: B, naples: C } = M.stops

// le trajet : une courbe du Michigan à New York, puis une longue courbe au-dessus de l'Atlantique jusqu'à Naples
const route = `M${A[0]} ${A[1]} Q${(A[0] + B[0]) / 2} ${A[1] - 70} ${B[0]} ${B[1]} C${B[0] + 150} ${B[1] + 150} ${C[0] + 260} ${C[1] - 210} ${C[0]} ${C[1]}`

const stops = [
  { id: 'mi', at: A, place: 'Michigan', lines: ['Born and raised'], pos: { left: A[0] + 24, top: A[1] - 96 } },
  { id: 'ny', at: B, place: 'New York City', lines: ['DDS, New York University School of Dentistry', 'New York Maxi-Course for Implant Dentistry', 'Oral surgery at Jamaica (Queens) and Brooklyn hospitals'], pos: { left: B[0] - 214, top: B[1] + 30 } },
  { id: 'fl', at: C, place: 'Naples, Florida', lines: ['4280 Tamiami Trail East'], pos: { left: C[0] + 26, top: C[1] - 30 } },
]

const credentials = [
  'Licensed in IV sedation and conscious sedation',
  'Trained in Invisalign and aesthetic fillers',
  'After-hours emergency care',
  'Active in community service, and in lifelong learning',
]

function RouteMap() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !motion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 55%', scrub: 0.7 } })
      tl.fromTo('.map-route', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 }, 0.12)
        .from('[data-stop="mi"]', { opacity: 0, y: 12, duration: 0.12, ease: 'power2.out' }, 0)
        .from('[data-stop="ny"]', { opacity: 0, y: 12, duration: 0.12, ease: 'power2.out' }, 0.42)
        .from('[data-stop="fl"]', { opacity: 0, y: 12, duration: 0.12, ease: 'power2.out' }, 1.02)
        .from('.map-mi', { opacity: 0, duration: 0.2 }, 0)
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[600px]" style={{ aspectRatio: `${M.w} / ${M.h}` }} role="img" aria-label="Map: born and raised in Michigan, trained in New York City, now in Naples, Florida.">
      <svg viewBox={`0 0 ${M.w} ${M.h}`} className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <path d={M.newYork} fill="rgb(255 255 255 / 0.07)" />
        <path d={M.florida} fill="rgb(255 255 255 / 0.07)" />
        <path className="map-mi" d={M.michigan} fill="var(--teal)" fillOpacity={0.85} />
        <path d={M.borders} fill="none" stroke="rgb(255 255 255 / 0.16)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <path d={M.outline} fill="none" stroke="rgb(255 255 255 / 0.5)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
        <path className="map-route" d={route} pathLength={1} fill="none" stroke="var(--teal)" strokeWidth={2.5} strokeLinecap="round" strokeDasharray="1" vectorEffect="non-scaling-stroke" />
        {[A, B, C].map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={9} fill="var(--ink)" stroke="var(--teal)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
            <circle cx={p[0]} cy={p[1]} r={3.5} fill="#fff" />
          </g>
        ))}
      </svg>
      {stops.map((s) => (
        <div key={s.id} data-stop={s.id} className="map-stop absolute max-w-[46%] rounded-[6px] bg-ink/92 px-2.5 py-2" style={{ left: `${(s.pos.left / M.w) * 100}%`, top: `${(s.pos.top / M.h) * 100}%` } as CSSProperties}>
          <p className="text-[clamp(15px,1.4vw,19px)] leading-tight font-[600]">{s.place}</p>
          <ul className="mt-1 space-y-0.5 text-[clamp(12.5px,1vw,14.5px)] leading-snug text-white/70">
            {s.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export function Doctor() {
  return (
    <section id="doctor" tabIndex={-1} aria-labelledby="doctor-title" className="on-dark relative bg-ink py-[clamp(88px,11vw,170px)] text-white">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <Lines id="doctor-title" className="t-h2">
            From Michigan to New York to Naples
          </Lines>
          <p data-up className="t-lead max-w-[34rem] text-white/75">
            <span className="font-[600] text-white">Dr. Fady Fakhoury, DDS.</span> Lead dentist, with more than ten years in comprehensive and implant dentistry.
          </p>
        </div>

        <div className="mt-[clamp(48px,6vw,96px)] grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-[clamp(48px,6vw,110px)]">
          <div className="order-2 lg:order-1">
            <figure>
              <div className="unveil rounded-[var(--radius)]">
                <div className="unveil-in">
                  <img src={work.src} width={work.width} height={work.height} alt="Dr. Fakhoury treating a patient, with his assistant" loading="lazy" className="aspect-[848/518] w-full object-cover" />
                </div>
              </div>
              <figcaption className="mt-3 text-[14px] text-white/60">Dr. Fakhoury at work</figcaption>
            </figure>

            <div data-up className="mt-12">
              <p className="font-[600]">Specialties</p>
              <p className="mt-2 text-[clamp(22px,2vw,30px)] leading-[1.15] font-[560] tracking-[-0.02em] [font-stretch:90%]">Dental implants, oral surgery, sedation dentistry, Invisalign, cosmetic fillers</p>
            </div>
            <ul className="mt-10 border-t border-white/20">
              {credentials.map((c, i) => (
                <li key={c} data-up style={{ '--d': `${i * 0.05}s` } as CSSProperties} className="border-b border-white/20 py-4 text-[16.5px]">
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="order-1 lg:order-2">
            <RouteMap />
          </div>
        </div>
      </div>
    </section>
  )
}
