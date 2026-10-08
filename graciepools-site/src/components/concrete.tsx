// Les piscines béton sur mesure : leur texte (« from concept to construction », dessinateur maison, rendu 3D,
// cascades et foyers, Pentair, garantie structurelle à vie), le rendu 3D de leur page et deux photos de bassins béton.
import type { CSSProperties } from 'react'

import { Lines } from '@/components/lines'
import { Photo } from '@/components/photo'

const FEATURES = [
  { title: 'Designed in 3D', text: 'Our in-house designer shows you the pool, the deck and the features in a 3D rendering before anything is dug.' },
  { title: 'Waterfalls and fire', text: 'Water and fire features drawn into the design from the start.' },
  { title: 'Room for everyone', text: 'Large enough for the whole family, with seating and sun shelves.' },
  { title: 'Pentair equipment', text: 'We only install Pentair pool products: you know the brand behind the pump.' },
  { title: 'Lifetime structural guarantee', text: 'On every pool shell we build.' },
]

export function Concrete() {
  return (
    <section id="concrete" tabIndex={-1} className="relative bg-white">
      <div className="wrap pt-[clamp(80px,10vw,150px)] pb-[clamp(72px,9vw,140px)]">
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Lines className="t-h2">Custom concrete, from concept to construction</Lines>
            <p className="t-lead mt-6 max-w-[32rem] text-ink-soft" data-up>
              When the yard calls for a shape no mold makes, we build the pool in concrete, start to finish.
            </p>
            <ul className="mt-10 grid gap-0">
              {FEATURES.map((f, i) => (
                <li key={f.title} className="border-t border-ink/15 py-5" data-up style={{ '--d': `${i * 0.06}s` } as CSSProperties}>
                  <p className="text-[18px] leading-tight font-[640] tracking-[-0.01em]">{f.title}</p>
                  <p className="mt-1.5 max-w-[30rem] text-[16px] leading-[1.5] text-ink-soft">{f.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid content-start gap-5 lg:col-span-7">
            <figure>
              <Photo id="concrete" alt="A rectangular concrete pool with wide entry steps, a travertine deck and a fire table" className="aspect-[4/3] rounded-[22px] sm:aspect-[16/11]" position="60% 62%" parallax />
              <figcaption className="mt-3 text-[14px] text-ink-soft">Concrete, with wide entry steps, a travertine deck and a fire table</figcaption>
            </figure>
            <div className="grid grid-cols-2 gap-5">
              <figure>
                <Photo id="render-3d" alt="A 3D rendering of a pool with sun loungers, a fire bowl and an outdoor kitchen" className="aspect-[4/3] rounded-[18px]" position="62% 60%" style={{ '--d': '0.1s' } as CSSProperties} />
                <figcaption className="mt-3 text-[14px] text-ink-soft">A 3D rendering, the way a design is presented before construction</figcaption>
              </figure>
              <figure>
                <Photo id="travertine" alt="A free-form pool with a travertine deck under a screen enclosure, palm trees behind" className="aspect-[4/3] rounded-[18px]" position="40% 75%" style={{ '--d': '0.18s' } as CSSProperties} />
                <figcaption className="mt-3 text-[14px] text-ink-soft">Free form, travertine deck, screen enclosure</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
