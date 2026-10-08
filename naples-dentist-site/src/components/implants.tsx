// Les implants. Le logo du cabinet sert de schéma : au défilement, la racine apparaît, la vis entre filet par filet,
// puis la couronne se pose ; les trois parties d'un implant se nomment à côté.
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, type CSSProperties } from 'react'

import { Lines } from '@/components/lines'
import L from '@/data/logo.json'
import { gsap, motion } from '@/lib/motion'
import { openSheet } from '@/lib/sheet'

// le schéma : le logo (960 × 1199) à gauche, les légendes à droite
const VB_W = 1640
const LABEL_X = 1080
const parts = [
  { y: 236, from: 935, title: 'Crown', text: 'Zirconium or porcelain' },
  { y: 640, from: 800, title: 'Abutment', text: 'The connector' },
  { y: 930, from: 835, title: 'Implant', text: 'Medical-grade titanium, fused to the bone' },
]

function Diagram() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !motion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: 0.8 },
      })
      tl.from('[data-part="root"]', { opacity: 0, y: 40, duration: 0.5 })
        // la vis entre en tournant : chaque filet s'étire depuis la gauche, du bas vers le haut
        .from('[data-part="thread"]', { scaleX: 0, x: -24, transformOrigin: '0% 50%', duration: 0.32, stagger: { each: 0.09, from: 'end' } }, 0.25)
        .from('[data-part="crown"]', { y: -150, opacity: 0, duration: 0.6, ease: 'power3.out' }, 0.95)
        .from('.dg-line', { scaleX: 0, transformOrigin: '0% 50%', duration: 0.35, stagger: 0.12 }, 1.35)
        .from('.dg-label', { opacity: 0, y: 14, duration: 0.35, stagger: 0.12 }, 1.45)
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="relative w-full" style={{ aspectRatio: `${VB_W} / ${L.h}` }}>
      <svg viewBox={`0 0 ${VB_W} ${L.h}`} className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <path data-part="root" d={L.root} fill="var(--bone)" />
        {L.threads.map((d, i) => (
          <path key={i} data-part="thread" d={d} fill="var(--teal)" />
        ))}
        <path data-part="crown" d={L.crown} fill="var(--ink)" />
        {parts.map((p) => (
          <g key={p.title} className="dg-line">
            <line x1={p.from} y1={p.y} x2={LABEL_X - 24} y2={p.y} stroke="var(--ink)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            <circle cx={p.from} cy={p.y} r={9} fill="var(--ink)" />
          </g>
        ))}
      </svg>
      {parts.map((p) => (
        <p key={p.title} className="dg-label absolute -translate-y-1/2" style={{ left: `${(LABEL_X / VB_W) * 100}%`, top: `${(p.y / L.h) * 100}%`, right: 0 }}>
          <span className="block text-[clamp(15px,1.35vw,20px)] leading-tight font-[600]">{p.title}</span>
          <span className="block text-[clamp(13px,1.05vw,15.5px)] leading-snug text-ink-soft">{p.text}</span>
        </p>
      ))}
    </div>
  )
}

export function Implants() {
  return (
    <section id="implants" tabIndex={-1} aria-labelledby="implants-title" className="relative bg-white py-[clamp(88px,12vw,180px)]">
      <div className="wrap grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-[clamp(48px,6vw,110px)]">
        <div className="lg:sticky lg:top-[calc(var(--header)+6vh)] lg:self-start">
          <div className="mx-auto max-w-[620px] lg:max-w-none">
            <Diagram />
          </div>
        </div>

        <div>
          <Lines id="implants-title" className="t-h2">
            The new standard in tooth replacement
          </Lines>
          <p data-up className="t-lead mt-8 max-w-[36rem] text-ink-soft">
            Dental implants are artificial tooth roots, a permanent base for teeth that fit, feel and function like your own. Dr. Fakhoury completed the New York Maxi-Course for Implant Dentistry.
          </p>

          <dl className="mt-12 border-t-[1.5px] border-ink">
            {[
              ['The implant', 'A medical-grade titanium screw that fuses to the living bone of the jaw: a strong, durable anchor.'],
              ['The abutment', 'The connector that supports the tooth or teeth.'],
              ['The crown', 'The visible part, usually zirconium or porcelain, for durability and looks.'],
            ].map(([t, d], i) => (
              <div key={t} data-up style={{ '--d': `${i * 0.06}s` } as CSSProperties} className="grid gap-1 border-b border-line py-5 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="font-[600]">{t}</dt>
                <dd className="text-ink-soft">{d}</dd>
              </div>
            ))}
          </dl>

          <div data-up className="mt-12">
            <p className="font-[600]">One tooth, several teeth, or a full upper or lower set</p>
            <p className="mt-6 text-[clamp(26px,2.6vw,40px)] leading-[1.08] font-[560] tracking-[-0.025em] [font-stretch:88%]">
              No slippage or movement
              <br />
              No eating difficulties
              <br />
              No need for regular repairs
            </p>
          </div>

          <div data-up className="mt-12 grid gap-4 sm:grid-cols-2">
            <button type="button" onClick={() => openSheet(['implant-dentures'], 'Implant-supported dentures', 'implants')} className="group rounded-[var(--radius)] bg-mist p-6 text-left transition-colors duration-300 hover:bg-[#e2ecea]">
              <span className="block font-[600]">Already wear dentures?</span>
              <span className="mt-2 block text-ink-soft">Anchored on implants, the denture snaps into place and stays put.</span>
              <span className="mt-5 inline-flex items-center gap-2 font-[600]">
                <span className="ul">Implant-supported dentures</span>
                <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" aria-hidden />
              </span>
            </button>
            <button type="button" onClick={() => openSheet(['bridges'], 'Bridges', 'implants')} className="group rounded-[var(--radius)] bg-mist p-6 text-left transition-colors duration-300 hover:bg-[#e2ecea]">
              <span className="block font-[600]">Implants need healing time</span>
              <span className="mt-2 block text-ink-soft">For a faster permanent option, a bridge can often be placed in a single day.</span>
              <span className="mt-5 inline-flex items-center gap-2 font-[600]">
                <span className="ul">Bridges</span>
                <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" aria-hidden />
              </span>
            </button>
          </div>

          <button type="button" onClick={() => openSheet(['implants'], 'Dental implants', 'implants')} data-up className="btn btn-ink mt-10">
            Everything about dental implants
            <ArrowRight className="arr size-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  )
}
