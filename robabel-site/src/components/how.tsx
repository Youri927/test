// Une piscine neuve ou une piscine existante : leurs deux pages (construction, rénovation), en étapes.
import { useState, type CSSProperties } from 'react'
import { Tabs } from 'radix-ui'

import { Lines } from '@/components/lines'
import { Photo } from '@/components/photo'
import type { PhotoId } from '@/lib/photos'

const PATHS: { id: string; tab: string; title: string; intro: string; photo: PhotoId; alt: string; steps: { name: string; text: string }[] }[] = [
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
      { name: 'Refill and care', text: 'Refilling and checking every system. Their technicians can then handle the cleaning, the chemistry and the servicing.' },
    ],
  },
]

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
                <Photo id={p.photo} alt={p.alt} unveil={false} className="how-photo mt-10 aspect-[4/3] rounded-md" sizes="(min-width: 1024px) 38vw, 92vw" />
              </div>
              <ol className="steps lg:col-span-6 lg:col-start-7">
                {p.steps.map((s, i) => (
                  <li key={s.name} className="step" style={{ '--i': i } as CSSProperties}>
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
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>
    </section>
  )
}
