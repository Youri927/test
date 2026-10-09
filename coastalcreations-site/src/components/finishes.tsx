// Les enduits Stonescapes de leur page « Pool Surface Colors » : la liste des six noms, et le nuancier du fabricant
// qui change au survol, au toucher ou au clavier. Leur explication de la couleur de l'eau, telle quelle.
// Sur téléphone, le nuancier passe au-dessus de la liste : on voit le changement là où l'on touche.
import { useState } from 'react'

import { Photo } from '@/components/frame'
import { finishes } from '@/lib/site'

export function Finishes() {
  const [open, setOpen] = useState(2)
  const f = finishes[open]

  return (
    <div className="bg-shade">
      <div className="w grid gap-x-[var(--gap)] gap-y-10 py-[var(--section)] [grid-template-areas:'title'_'swatch'_'list'] lg:grid-cols-[5fr_7fr] lg:grid-rows-[auto_1fr] lg:[grid-template-areas:'title_swatch'_'list_swatch']">
        <div className="[grid-area:title]">
          <h3 className="h2">Choosing your pool finish</h3>
          <p className="lead mt-6 text-ink-2">Choosing the right pool surface is one of the most important decisions in achieving the exact water color you envision.</p>
        </div>

        <div className="[grid-area:list] self-start border-b border-rule" role="group" aria-label="Stonescapes finishes">
          {finishes.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="finish-name"
              aria-pressed={i === open}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(i)}
              onFocus={() => setOpen(i)}
              onClick={() => setOpen(i)}
            >
              <span>{s.name}</span>
              {s.tone && <span className="tone">{s.tone}</span>}
            </button>
          ))}
        </div>

        <figure className="[grid-area:swatch] lg:pl-[clamp(0px,3vw,48px)]">
          <div className="lg:sticky lg:top-[112px]">
            <div className="swatch">
              {finishes.map((s, i) => (
                <Photo key={s.id} id={s.id} alt={i === open ? `Stonescapes ${s.name} swatch: the color at the ledge, the first step, the shallow end and the deep end` : ''} sizes="(min-width: 1024px) 54vw, 92vw" className={i === open ? 'on' : ''} />
              ))}
            </div>
            <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1" aria-live="polite">
              <span className="label">Stonescapes {f.name}</span>
              <span className="note text-ink-2">Manufacturer swatch, from the ledge to the deep end</span>
            </figcaption>
            <ul className="small mt-8 grid gap-x-8 gap-y-3 text-ink-2 sm:grid-cols-3">
              <li>Lighter finishes tend to produce bright, Caribbean-blue tones.</li>
              <li>Screen enclosures can soften or slightly dull the color by filtering sunlight.</li>
              <li>Depth changes the color too, and so do the time of day and the season.</li>
            </ul>
            <p className="small mt-8">
              Waterline tile from Luv Tile and{' '}
              <a href="https://aquabellatile.com/" target="_blank" rel="noreferrer" className="link">
                Aquabella
              </a>
              .
            </p>
          </div>
        </figure>
      </div>
    </div>
  )
}
