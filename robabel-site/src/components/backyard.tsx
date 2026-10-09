// Autour de l'eau : leur page « Landscaping and Outdoor Living Spaces », avec leurs propres photos.
// Sur ordinateur, la photo reste en place pendant que la liste défile ; elle change avec le sujet au centre de l'écran.
import { useEffect, useRef, useState } from 'react'

import { Lines } from '@/components/lines'
import { Photo } from '@/components/photo'
import { motion, useMediaQuery } from '@/lib/motion'
import type { PhotoId } from '@/lib/photos'
import { cn } from '@/lib/utils'

const ITEMS: { title: string; text: string; photo: PhotoId; alt: string; position?: string }[] = [
  {
    title: 'Water features',
    text: 'Waterfalls, fountains and bubblers, lit from underwater after dark. Or two motorcycles.',
    photo: 'moto-plinth',
    alt: 'A motorcycle painted with the flag, on a mosaic-tiled plinth at the edge of the pool',
  },
  {
    title: 'Lighting',
    text: 'Pool and outdoor fiber optic lighting: colors and effects that carry past the water’s edge, energy-efficient and low-maintenance.',
    photo: 'moto-night',
    alt: 'The pool at night, lit violet, with a motorcycle fountain lit at the far end',
    position: '78% 50%',
  },
  {
    title: 'Sun ledge seating',
    text: 'Sunledge seating, made for the coast: salt air and strong sun.',
    photo: 'moto-shelf',
    alt: 'The pool from above, with three loungers set in the shallow sun shelf',
  },
  {
    title: 'Lounging and shade',
    text: 'Lounge chairs, daybeds or outdoor sofas, under a pergola or a shade structure.',
    photo: 'out-lounges',
    alt: 'Two white lounge chairs under an umbrella, on artificial turf',
  },
  {
    title: 'Fire pits',
    text: 'A fire pit, a fire table or an outdoor fireplace, with seating around it for cool evenings.',
    photo: 'out-firepit',
    alt: 'A square fire pit burning at dusk, in a sand yard with palms',
  },
  {
    title: 'Turf and putting greens',
    text: 'Artificial turf that stays green all year with little upkeep and less water, safe for kids and pets. Or a custom putting green.',
    photo: 'out-green',
    alt: 'A backyard putting green with three flags, next to the house',
  },
  {
    title: 'Kitchens and screens',
    text: 'A built-in grill, a bar, outdoor televisions and surround sound, for evenings by the pool.',
    photo: 'out-bar',
    alt: 'An outdoor kitchen and bar with stools and two televisions, at night',
  },
  {
    title: 'Decks and plantings',
    text: 'A paver or tile deck, pathways and low walls, and plants chosen for heat, humidity and splashing water.',
    photo: 'out-drone',
    alt: 'A pool with a wide paver deck and loungers in its sun shelf, seen from above, with a drone in flight',
  },
]

export function Backyard() {
  const [active, setActive] = useState(0)
  const list = useRef<HTMLOListElement>(null)
  const wide = useMediaQuery('(min-width: 1024px)')

  // le sujet actif : celui qui passe au milieu de l'écran
  useEffect(() => {
    const el = list.current
    if (!el || !wide) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i))
      },
      { rootMargin: '-48% 0px -48% 0px' },
    )
    el.querySelectorAll('li').forEach((li) => io.observe(li))
    return () => io.disconnect()
  }, [wide])

  return (
    <section id="backyard" aria-labelledby="by-title" tabIndex={-1} className="bg-salt py-[clamp(88px,11vw,176px)]">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
          <Lines id="by-title" className="t-h2 max-w-[8em]">
            Everything around the water
          </Lines>
          <p className="t-lead max-w-[26em] text-ink-soft" data-up>
            The pool is the start. Landscaping and outdoor living turn the rest of the yard into the place you spend your evenings.
          </p>
        </div>

        <div className="mt-14 grid gap-x-[var(--gutter)] lg:mt-20 lg:grid-cols-12">
          {/* la photo qui reste en place (ordinateur) */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="by-frame sticky top-[calc(var(--header)+40px)]">
              {ITEMS.map((it, i) => (
                <div key={it.photo} className={cn('by-slide', i === active && 'is-active')} aria-hidden={i !== active}>
                  <Photo id={it.photo} alt={it.alt} position={it.position} unveil={false} className="absolute inset-0" sizes="40vw" />
                </div>
              ))}
            </div>
          </div>

          <ol ref={list} className="by-list lg:col-span-6 lg:col-start-7">
            {ITEMS.map((it, i) => (
              <li key={it.title} data-i={i} className={cn('by-item', (!wide || !motion() || i === active) && 'is-active')}>
                <Photo id={it.photo} alt={it.alt} position={it.position} className="mb-6 aspect-[4/3] rounded-md lg:hidden" sizes="92vw" />
                <h3 className="by-title">{it.title}</h3>
                <p className="t-lead mt-3 max-w-[30em] text-ink-soft">{it.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
