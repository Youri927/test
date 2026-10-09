// Une piscine neuve ou une piscine existante : leurs deux pages (construction, rénovation), en étapes.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Tabs } from 'radix-ui'

import { Lines } from '@/components/lines'
import { Photo } from '@/components/photo'
import { later, motion, ScrollTrigger } from '@/lib/motion'
import type { PhotoId } from '@/lib/photos'
import { cn } from '@/lib/utils'

type Step = { name: string; text: string }

const PATHS: { id: string; tab: string; title: string; intro: string; photo: PhotoId; alt: string; steps: Step[] }[] = [
  {
    id: 'new',
    tab: 'A new pool',
    title: 'Designed and built for your yard',
    intro: 'A bespoke design and build: a pool that suits the property, follows local regulations and becomes the center of the yard.',
    photo: 'moto-aerial',
    alt: 'A finished backyard from above: the pool with its sun shelf, the turf, a ping-pong table and an umbrella',
    steps: [
      { name: 'Assessment and planning', text: 'What you want (size, shape, depth, features), the best spot in the yard for sun, landscaping and access, and a budget.' },
      { name: 'Design', text: 'A plan built around your preferences, the property and the local codes: waterfalls, a spa, lighting, chlorine or salt, the pump room.' },
      { name: 'Review and permits', text: 'You check the design against what you asked for, and the permits are secured from local authorities.' },
      { name: 'Construction', text: 'Excavation, plumbing and electrical, the shell, the features, then the finishes: plaster or tile.' },
      { name: 'Water and safety', text: 'Landscaping around the pool, filling and testing every system, then fences, covers and alarms.' },
    ],
  },
  {
    id: 'existing',
    tab: 'The pool you have',
    title: 'Renovated, remodeled, brought up to date',
    intro: 'Resurfacing and new tile, LED lighting, waterfalls, newer equipment: a pool that looks better, works better and costs less to run.',
    photo: 'reno-drained',
    alt: 'A drained pool during a renovation, with blue tile marking the steps',
    steps: [
      { name: 'Assessment', text: 'The structure, plumbing, equipment and looks of the pool today; what you want to change; a budget.' },
      { name: 'Plan', text: 'What needs work: resurfacing, new features, equipment or layout, with materials and finishes that fit the budget.' },
      { name: 'Renovation', text: 'Draining if needed, repairing cracks and leaks, more efficient pumps, filters and heaters, new tile, coping and decking, safety upgrades.' },
      { name: 'Refill and care', text: 'Refilling and checking every system. Our technicians can then handle the cleaning, the chemistry and the servicing.' },
    ],
  },
]

// Les étapes, reliées par un tuyau qui se remplit au défilement, comme celui du local technique :
// chaque étape s'allume quand l'eau atteint son numéro. Seul l'onglet affiché est suivi.
function Steps({ steps, active }: { steps: Step[]; active: boolean }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [reached, setReached] = useState(-1)
  useEffect(() => {
    const el = wrap.current
    if (!el || !active) return
    const pipe = el.querySelector<HTMLElement>('.steps-pipe')!
    const dots = [...el.querySelectorAll<HTMLElement>('.step-n')]
    let centers: number[] = []
    // le tuyau va du centre du premier numéro au centre du dernier
    const measure = () => {
      const base = el.getBoundingClientRect().top
      const c = dots.map((d) => {
        const r = d.getBoundingClientRect()
        return r.top + r.height / 2 - base
      })
      pipe.style.top = `${c[0]}px`
      pipe.style.height = `${c[c.length - 1] - c[0]}px`
      centers = c.map((v) => v - c[0])
    }
    measure()
    if (!motion()) {
      pipe.style.setProperty('--fill', '1')
      setReached(steps.length)
      return
    }
    const fill = (p: number) => {
      pipe.style.setProperty('--fill', p.toFixed(4))
      const px = p * (centers[centers.length - 1] ?? 0)
      setReached(p === 0 ? -1 : centers.filter((c) => c <= px + 2).length - 1)
    }
    let st: ScrollTrigger | undefined
    const cancel = later(() => {
      st = ScrollTrigger.create({ trigger: pipe, start: 'top 62%', end: 'bottom 62%', scrub: 0.4, onUpdate: (s) => fill(s.progress), onRefresh: (s) => fill(s.progress) })
    })
    const ro = new ResizeObserver(() => {
      measure()
      st?.refresh()
    })
    ro.observe(el)
    return () => {
      cancel()
      ro.disconnect()
      st?.kill()
    }
  }, [active, steps.length])

  return (
    <div ref={wrap} className="steps-wrap lg:col-span-6 lg:col-start-7">
      <span className="steps-pipe" aria-hidden="true">
        <span className="steps-water" />
      </span>
      <ol className="steps">
        {steps.map((s, i) => (
          <li key={s.name} className={cn('step', i <= reached && 'is-on')} style={{ '--i': i } as CSSProperties}>
            <span className="step-n tnum" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <h4 className="t-h4">{s.name}</h4>
              <p className="t-small mt-1.5 max-w-[34em] text-ink-soft">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function How() {
  const [tab, setTab] = useState('new')
  return (
    <section id="how" aria-labelledby="how-title" tabIndex={-1} className="bg-white py-[clamp(88px,11vw,176px)]">
      <div className="wrap">
        <Lines id="how-title" className="t-h2 max-w-[9em]">
          A new pool, or the one you have
        </Lines>

        <Tabs.Root value={tab} onValueChange={setTab} className="mt-12">
          <Tabs.List aria-label="Choose a project" className="tab-list">
            {PATHS.map((p) => (
              <Tabs.Trigger key={p.id} value={p.id} className="tab">
                {p.tab}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {PATHS.map((p) => (
            <Tabs.Content key={p.id} value={p.id} className="how-panel mt-12 grid gap-x-[var(--gutter)] gap-y-10 lg:mt-16 lg:grid-cols-12" forceMount hidden={tab !== p.id}>
              <div className="lg:col-span-5">
                <h3 className="t-h3 max-w-[12em]">{p.title}</h3>
                <p className="t-lead mt-4 max-w-[28em] text-ink-soft">{p.intro}</p>
                <Photo id={p.photo} alt={p.alt} unveil={false} parallax className="how-photo mt-10 aspect-[4/3] rounded-md" sizes="(min-width: 1024px) 38vw, 92vw" />
              </div>
              <Steps steps={p.steps} active={tab === p.id} />
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>
    </section>
  )
}
