// « Pick your surface » : des échantillons découpés dans leurs photos.
// Ordinateur : un index à gauche, un bandeau de panneaux à droite ; le panneau survolé s'ouvre et les autres
// restent en lamelles (mécanique des galeries « hover expand » du catalogue 21st.dev, écrite ici sans bibliothèque).
// L'image garde une largeur fixe dans son panneau : seule la découpe change, rien n'est redimensionné.
// Téléphone : des cartes qu'on fait défiler du doigt.
import { useState } from 'react'

import { Lines } from '@/components/lines'
import { surfaces } from '@/data/content'
import { photo } from '@/lib/photos'
import { cn } from '@/lib/utils'

export function Surfaces() {
  const [active, setActive] = useState(0)
  const s = surfaces[active]

  return (
    <section id="surfaces" className="bg-water py-[clamp(88px,11vw,176px)]" aria-labelledby="surfaces-title">
      <div className="wrap grid gap-10 lg:grid-cols-[minmax(300px,0.78fr)_2fr] lg:gap-[clamp(40px,4.5vw,80px)]">
        <div className="flex flex-col">
          <Lines id="surfaces-title" className="t-h2 text-ink">Pick your surface</Lines>
          <p data-up className="t-lead mt-6 max-w-[28rem] text-ink-soft">
            A few of the surfaces we work with. Coatings come in over 1,500 colors, and we can match a custom one.
          </p>

          {/* index (ordinateur) */}
          <ul className="mt-10 hidden border-t border-ink/15 lg:block" aria-label="Surfaces">
            {surfaces.map((x, i) => (
              <li key={x.id} className="border-b border-ink/15">
                <button
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className={cn('flex w-full items-center justify-between py-3 text-left text-[17px] font-[560] transition-colors duration-300', active === i ? 'text-ink' : 'text-ink/55 hover:text-ink')}
                >
                  {x.name}
                  <span className={cn('size-2.5 rounded-full bg-sun ring-1 ring-ink/30 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]', active === i ? 'scale-100' : 'scale-0')} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <div key={active} className="panel-in mt-8 hidden gap-2 lg:grid" aria-live="polite">
            <p className="text-ink">{s.text}</p>
            <p className="t-small text-ink-soft">Where: {s.where}</p>
          </div>
        </div>

        {/* bandeau (ordinateur) */}
        <div className="hidden h-[clamp(460px,64vh,640px)] gap-2 lg:flex">
          {surfaces.map((x, i) => {
            const p = photo(x.id)
            return (
              <button
                key={x.id}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={cn('sw relative min-w-0 overflow-hidden rounded-[4px] bg-water-2', active === i && 'is-on')}
                aria-label={x.name}
                aria-pressed={active === i}
                tabIndex={-1}
              >
                <img src={p.src} width={p.width} height={p.height} alt={x.alt} loading="lazy" decoding="async" className="sw-img" />
                <span className="sw-bar" aria-hidden />
              </button>
            )
          })}
        </div>

        {/* cartes (téléphone, tablette) */}
        <ul className="-mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-3 overflow-x-auto px-[var(--gutter)] pb-2 [scrollbar-width:none] lg:hidden" aria-label="Surfaces">
          {surfaces.map((x) => {
            const p = photo(x.id)
            return (
              <li key={x.id} className="w-[76vw] max-w-[340px] shrink-0 snap-start">
                <div className="aspect-[4/5] overflow-hidden rounded-[4px] bg-water-2">
                  <img src={p.src} width={p.width} height={p.height} alt={x.alt} loading="lazy" decoding="async" className="size-full object-cover" />
                </div>
                <p className="mt-3 text-[17px] font-[620] text-ink">{x.name}</p>
                <p className="mt-1 text-[15px] text-ink-soft">{x.text}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
