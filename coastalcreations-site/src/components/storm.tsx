// Tempêtes et équipement : la remise en état d'une piscine de Bradenton en trois photos bord à bord, du vert au bleu,
// puis les socles d'équipement surélevés après les ouragans de 2024 (leurs pages Storm Recovery et Equipment Replacement).
import { Photo } from '@/components/frame'
import { equipment, storm } from '@/lib/site'

const pads = [
  { id: 'equip-raised' as const, ar: 1100 / 1560, alt: 'New pool equipment being installed: filter, pump and valves' },
  { id: 'equip-pad-1' as const, ar: 450 / 600, alt: 'A pool equipment pad raised after the 2024 hurricanes' },
  { id: 'equip-pad-2' as const, ar: 338 / 600, alt: 'Another equipment pad raised after the 2024 hurricanes' },
]

export function Storm() {
  return (
    <section id="storm" aria-labelledby="storm-title" className="pt-[var(--section)] outline-none" tabIndex={-1}>
      {/* les trois temps, bord à bord sur toute la largeur de l'écran */}
      <figure>
        <div className="grid grid-cols-3 gap-[3px]">
          {storm.map((f) => (
            <div key={f.photo} className="aspect-[4/5] sm:aspect-[4/3]">
              <Photo id={f.photo} alt={f.alt} sizes="34vw" />
            </div>
          ))}
        </div>
        <figcaption className="w mt-3 grid grid-cols-3 gap-[3px]">
          {storm.map((f) => (
            <span key={f.photo} className="label">
              {f.label}
            </span>
          ))}
        </figcaption>
        <p className="w note mt-1 text-ink-2">Storm recovery in Bradenton: the same pool after the storm, during the repairs, and back in service.</p>
      </figure>

      <div className="w g12 mt-[clamp(56px,7vw,104px)] gap-y-12">
        <div className="col-span-12 lg:col-span-6">
          <h2 id="storm-title" className="h2">
            Equipment above the surge.
          </h2>
          <p className="lead mt-6 max-w-[30em]">After the 2024 hurricanes, we replaced pool equipment and raised the pads, so pumps, heaters and electrical stay out of the storm surge.</p>
          <p className="small mt-5 max-w-[34em] text-ink-2">
            Storm damage goes beyond what you can see on the surface. We repair structural damage, replace damaged equipment and upgrade the weak points to better withstand the next storm, so your system keeps running when it matters most.
          </p>
          <p className="small mt-8">
            <span className="font-[500]">What we take on: </span>
            <span className="text-ink-2">{equipment.join('; ').toLowerCase()}.</span>
          </p>
        </div>
        <div className="col-span-12 flex items-start gap-[var(--gap)] lg:col-span-5 lg:col-start-8 lg:pt-2">
          {pads.map((p, k) => (
            <figure key={p.id} className="min-w-0" style={{ flex: `${p.ar} 1 0`, marginTop: k === 1 ? '12%' : k === 2 ? '4%' : 0 }}>
              <div style={{ aspectRatio: p.ar }}>
                <Photo id={p.id} alt={p.alt} sizes="(min-width: 1024px) 14vw, 30vw" />
              </div>
            </figure>
          ))}
        </div>
        <p className="note col-span-12 -mt-6 text-ink-2 lg:col-span-5 lg:col-start-8">New equipment, and pads raised above the surge after the 2024 hurricanes.</p>
      </div>
    </section>
  )
}
