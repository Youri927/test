// Équipement et tempêtes : les socles surélevés après les ouragans de 2024 et une remise en état à Bradenton,
// du vert au bleu (leurs pages Storm Recovery et Equipment Replacement).
import type { CSSProperties } from 'react'

import { Frame } from '@/components/frame'
import { Lines } from '@/components/lines'
import { equipment, storm } from '@/lib/site'

const pads = [
  { id: 'equip-raised' as const, ar: 1100 / 1560, alt: 'New pool equipment being installed: filter, pump and valves' },
  { id: 'equip-pad-1' as const, ar: 450 / 600, alt: 'A pool equipment pad raised after the 2024 hurricanes' },
  { id: 'equip-pad-2' as const, ar: 338 / 600, alt: 'Another equipment pad raised after the 2024 hurricanes' },
]

export function Storm() {
  return (
    <section id="storm" className="bg-white-sec outline-none" aria-labelledby="storm-title" tabIndex={-1}>
      <div className="wrap py-[var(--section)]">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <Lines as="h2" id="storm-title" className="t-h2">
              Equipment above the surge.
            </Lines>
            <p className="t-lead mt-6">
              After the 2024 hurricanes, we replaced pool equipment and raised the pads, so pumps, heaters and electrical stay out of the storm surge.
            </p>
            <p className="t-small mt-5 max-w-[34em] text-ink-soft">
              Storm damage goes beyond what you can see on the surface. We repair structural damage, replace damaged equipment and upgrade the weak points to better withstand the next storm, so your system keeps running when it matters most.
            </p>
            <ul className="mt-8 border-t border-line">
              {equipment.map((e) => (
                <li key={e} className="t-small border-b border-line py-3 font-[560]">
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <figure className="col-span-12 self-start lg:sticky lg:top-[calc(var(--header-h)+32px)] lg:col-span-7 lg:col-start-6 lg:pl-[2vw]">
            <div className="strip">
              {pads.map((p, k) => (
                <figure key={p.id} style={{ '--ar': p.ar } as CSSProperties}>
                  <Frame id={p.id} alt={p.alt} sizes={`(min-width: 1024px) ${Math.round(p.ar * 22)}vw, 60vw`} cage={{ cols: 2, rows: 4, delay: k * 0.16 }} />
                </figure>
              ))}
            </div>
            <figcaption className="t-note mt-3 text-ink-soft">New equipment, and pads raised above the surge after the 2024 hurricanes.</figcaption>
          </figure>
        </div>

        <article className="grid-12 mt-[clamp(80px,9vw,150px)] items-end gap-y-6" aria-labelledby="storm-bradenton">
          <div className="col-span-12 lg:col-span-3">
            <h3 id="storm-bradenton" className="t-h3">
              Bradenton
            </h3>
            <p className="t-label mt-2 text-cobalt">Storm recovery</p>
            <p className="t-small mt-3 max-w-[30em] text-ink-soft">The same pool after the storm, during the repairs, and back in service.</p>
          </div>
          <div className="col-span-12 lg:col-span-9 lg:col-start-4">
            <div className="strip">
              {storm.map((f, k) => (
                <figure key={f.photo} style={{ '--ar': f.ar } as CSSProperties}>
                  <Frame id={f.photo} alt={f.alt} sizes="(min-width: 1024px) 24vw, 70vw" cage={{ cols: 3, rows: 3, delay: k * 0.18 }} />
                  <figcaption className="frame-label">
                    <span className="t-label">{f.label}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
