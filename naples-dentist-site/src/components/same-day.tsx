// La couronne en une séance, sur le turquoise du cabinet.
// Deux lignes de temps font la course au défilement : la méthode habituelle (empreinte, couronne provisoire,
// second rendez-vous) et la leur, E4D (scan, conception, usinage, pose), qui finit dès la première visite.
// Le schéma ne donne aucune durée : seulement le nombre de visites, comme leur page.
import { ArrowRight, Check } from 'lucide-react'
import { useEffect, useRef, type CSSProperties } from 'react'

import { Lines } from '@/components/lines'
import { e4dWay, usualWay } from '@/data/content'
import { motion, ScrollTrigger } from '@/lib/motion'
import { openSheet } from '@/lib/sheet'
import { cn } from '@/lib/utils'

// positions sur la ligne (0 → 1) ; la première visite occupe le même espace dans les deux lignes
const VISIT = 0.26
// up : étiquette au-dessus de la ligne (les étapes rapprochées alternent)
const usual = [0.04, 0.19, 0.81, 0.96].map((at, i) => ({ at, label: usualWay[i], up: i === 3 }))
const e4d = [0.03, 0.09, 0.15, 0.21].map((at, i) => ({ at, label: e4dWay[i], up: i % 2 === 1 }))
const E4D_DONE = 0.24
const USUAL_DONE = 0.97

const benefits = [
  ['Natural-looking', 'The porcelain has the same translucency as natural teeth, in many shades for a precise match.'],
  ['Strong', 'Twice as strong as metal-filled crowns, even on back teeth, milled from a single block of porcelain.'],
  ['Natural-acting', 'One solid block means fewer risks of cracks, and the porcelain expands much like a natural tooth.'],
  ['Accurate', 'Digital scanning, design, milling and fine-tuning give a crown that matches and sits precisely.'],
] as const

function Track({ nodes }: { nodes: { at: number; label: string; up: boolean }[] }) {
  return (
    <div className="race-track">
      <span className="race-rail" aria-hidden />
      {nodes.map((n) => (
        <span key={n.label} className={cn('race-node', n.up && 'is-up', n.at > 0.9 && 'is-end')} style={{ '--at': n.at } as CSSProperties}>
          <span className="race-dot" aria-hidden />
          <span className="race-label">{n.label}</span>
        </span>
      ))}
    </div>
  )
}

export function SameDay() {
  const stage = useRef<HTMLDivElement>(null)
  const race = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = race.current
    const sg = stage.current
    if (!el || !sg) return
    if (!motion()) {
      el.style.setProperty('--p', '1')
      el.setAttribute('data-e4d', '')
      el.setAttribute('data-usual', '')
      return
    }
    const wide = innerWidth >= 1024 && innerHeight >= 640
    const st = ScrollTrigger.create({
      trigger: wide ? sg : el,
      start: wide ? 'top top' : 'center center',
      end: () => `+=${Math.round(innerHeight * (wide ? 1.5 : 1.15))}`,
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        // une petite marge au début et à la fin : le schéma reste immobile le temps de le lire
        const p = Math.min(1, Math.max(0, (self.progress - 0.06) / 0.86))
        el.style.setProperty('--p', p.toFixed(4))
        el.toggleAttribute('data-e4d', p >= E4D_DONE)
        el.toggleAttribute('data-usual', p >= USUAL_DONE)
      },
    })
    return () => st.kill()
  }, [])

  return (
    <section id="crowns" tabIndex={-1} aria-labelledby="crowns-title" className="relative bg-teal text-ink">
      <div ref={stage} className="race-stage">
      <div className="wrap pt-[clamp(88px,11vw,170px)] lg:pt-[calc(var(--header)+clamp(24px,5vh,64px))]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <Lines id="crowns-title" className="t-h2">
            A permanent crown in one visit
          </Lines>
          <p data-up className="t-lead max-w-[34rem]">
            Dr. Fakhoury designs and mills all-porcelain crowns right here, with the E4D system. No impression material, no temporary crown, no second appointment.
          </p>
        </div>
      </div>

      {/* la course : épinglée au centre de l'écran le temps du défilement */}
      <div ref={race} className="race wrap py-[clamp(48px,7vw,96px)] lg:flex lg:flex-1 lg:items-center lg:py-[clamp(24px,5vh,64px)]" style={{ '--p': 0 } as CSSProperties} role="img" aria-label="The usual way takes two visits: impression and temporary crown, then a second appointment for the permanent crown. With E4D, scan, design, milling and fitting happen in one visit.">
        <div className="race-grid" aria-hidden>
          <div className="race-row">
            <p className="race-name">
              <span className="block font-[600]">The usual way</span>
              <span className="race-count block">Two visits</span>
            </p>
            <div className="race-lane">
              <span className="race-visit" style={{ '--from': 0, '--to': VISIT } as CSSProperties} />
              <span className="race-gap" style={{ '--from': VISIT, '--to': 1 - VISIT } as CSSProperties}>
                <span>Wearing a temporary crown</span>
              </span>
              <span className="race-visit" style={{ '--from': 1 - VISIT, '--to': 1 } as CSSProperties} />
              <span className="race-fill" style={{ '--end': USUAL_DONE } as CSSProperties} />
              <span className="race-head-lane" />
              <Track nodes={usual} />
            </div>
          </div>
          <div className="race-row">
            <p className="race-name">
              <span className="block font-[600]">Here, with E4D</span>
              <span className="race-count block">One visit</span>
            </p>
            <div className="race-lane">
              <span className="race-visit is-e4d" style={{ '--from': 0, '--to': VISIT } as CSSProperties} />
              <span className="race-fill" style={{ '--end': E4D_DONE } as CSSProperties} />
              <span className="race-head-lane" />
              <Track nodes={e4d} />
              <span className="race-done" style={{ '--at': E4D_DONE } as CSSProperties}>
                <span className="race-done-badge">
                  <Check className="size-4" aria-hidden />
                  Walk out with your permanent crown
                </span>
              </span>
            </div>
          </div>
          <span className="race-head" aria-hidden>
            <span />
          </span>
        </div>
      </div>
      </div>

      <div className="wrap pb-[clamp(88px,11vw,170px)]">
        <div className="grid gap-x-8 gap-y-10 border-t-[1.5px] border-ink pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(([t, d], i) => (
            <div key={t} data-up style={{ '--d': `${i * 0.06}s` } as CSSProperties}>
              <p className="t-h3">{t}</p>
              <p className="mt-3 text-[16px] leading-[1.5]">{d}</p>
            </div>
          ))}
        </div>
        <div data-up className="mt-14 flex flex-col gap-6 rounded-[var(--radius)] bg-ink p-6 text-white sm:flex-row sm:items-center sm:justify-between md:p-8">
          <p className="max-w-[40rem] text-[17px] leading-[1.5]">
            <span className="font-[600]">Bridges too.</span> To replace one or two missing teeth, Dr. Fakhoury can often create and place a bridge in a single day.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={() => openSheet(['crowns'], 'Same-day crowns', 'crowns')} className="btn btn-teal btn-sm">
              Same-day crowns
              <ArrowRight className="arr size-4" aria-hidden />
            </button>
            <button type="button" onClick={() => openSheet(['bridges'], 'Bridges', 'crowns')} className="btn btn-line btn-sm text-white">
              Bridges
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
