// Zone desservie : leurs dix comtés, du nord au sud, avec les villes de leurs pages ; Manatee, où ils sont installés, est marqué.
import { MapPin } from 'lucide-react'
import type { CSSProperties } from 'react'

import { Lines } from '@/components/lines'
import { counties } from '@/lib/site'

export function Area() {
  return (
    <section id="area" className="bg-plaster-sec outline-none" aria-labelledby="area-title" tabIndex={-1}>
      <div className="wrap py-[var(--section)]">
        <div className="grid-12 gap-y-6">
          <Lines as="h2" id="area-title" className="t-h2 col-span-12 lg:col-span-8">
            Ten counties, Citrus to Charlotte.
          </Lines>
          <p className="t-lead col-span-12 sm:col-span-10 lg:col-span-4 lg:col-start-9 lg:self-end">
            We work from Palmetto, in Manatee County, across Tampa Bay and the Gulf Coast.
          </p>
        </div>
        <ol className="mt-[clamp(48px,6vw,96px)] grid gap-x-[var(--gutter)] lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-5" aria-label="Counties we serve, north to south">
          {counties.map((c, i) => (
            <li key={c.name} className="county grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-1 py-4 sm:grid-cols-[minmax(170px,0.42fr)_minmax(0,1fr)] lg:py-5" data-up="" style={{ '--d': `${(i % 5) * 0.05}s` } as CSSProperties}>
              <h3 className="t-h3 flex items-center gap-2">
                {c.name}
                {c.name === 'Manatee' && <MapPin aria-label="Our home county" className="size-5 text-cobalt" />}
              </h3>
              {c.towns.length > 0 && <p className="t-small text-navy/80 sm:pt-1">{c.name === 'Manatee' ? `Home base. ${c.towns.join(', ')}` : c.towns.join(', ')}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
