// Les enduits Stonescapes de leur page « Pool Surface Colors » : une rangée de nuanciers ; celui qu'on survole,
// qu'on touche ou qu'on atteint au clavier s'élargit et montre toute sa gamme, du rebord au grand fond.
// Adapté du composant « Hover Expand Gallery » (kedhareswer, 21st.dev) : panneaux plus larges, nuanciers visibles fermés,
// une seule légende sous la rangée. Les nuanciers sont des visuels du fabricant, présentés comme tels.
import { useState } from 'react'

import { Lines } from '@/components/lines'
import { Photo } from '@/components/frame'
import { finishes } from '@/lib/site'

export function Finishes() {
  const [open, setOpen] = useState(2)
  const f = finishes[open]

  return (
    <div className="bg-plaster2-sec">
      <div className="wrap py-[var(--section)]">
        <div className="grid-12 gap-y-6">
          <Lines as="h3" className="t-h2 col-span-12 lg:col-span-6">
            Choosing your pool finish
          </Lines>
          <div className="col-span-12 sm:col-span-10 lg:col-span-5 lg:col-start-8">
            <p className="t-lead">Choosing the right pool surface is one of the most important decisions in achieving the exact water color you envision.</p>
            <ul className="t-small mt-5 flex flex-col gap-2 text-ink-soft">
              <li>Lighter finishes tend to produce bright, Caribbean-blue tones.</li>
              <li>Screen enclosures can soften or slightly dull the color by filtering sunlight.</li>
              <li>Depth changes the color too, and so do the time of day and the season.</li>
            </ul>
          </div>
        </div>

        <div className="finishes-row mt-[clamp(40px,5vw,72px)]" role="group" aria-label="Stonescapes finishes">
          {finishes.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="finish"
              aria-pressed={i === open}
              aria-label={s.name}
              {...(i === open ? { 'data-open': '' } : {})}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(i)}
              onFocus={() => setOpen(i)}
              onClick={() => setOpen(i)}
            >
              <Photo id={s.id} alt="" sizes="(min-width: 1024px) 70vw, 92vw" />
              <span className="finish-name" aria-hidden="true">
                {s.name}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1" aria-live="polite">
          <p>
            <span className="t-h4">Stonescapes {f.name}</span>
            {f.tone && <span className="t-small ml-3 text-ink-soft">{f.tone}</span>}
          </p>
          <p className="t-note text-ink-soft">Manufacturer swatch, from the ledge to the deep end</p>
        </div>
        <p className="t-small mt-10 border-t border-navy/20 pt-6">
          Waterline tile from Luv Tile and{' '}
          <a href="https://aquabellatile.com/" target="_blank" rel="noreferrer" className="ul">
            Aquabella
          </a>
          .
        </p>
      </div>
    </div>
  )
}
