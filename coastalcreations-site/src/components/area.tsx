// Zone desservie : leurs dix comtés du nord au sud, et les villes de leurs pages, en un seul texte courant.
import { counties } from '@/lib/site'

export function Area() {
  return (
    <section id="area" aria-labelledby="area-title" className="pt-[var(--section)] outline-none" tabIndex={-1}>
      <div className="w">
        <h2 id="area-title" className="h2">
          Ten counties, Citrus to Charlotte.
        </h2>
        <p className="lead mt-5 max-w-[34em] text-ink-2">We work from Palmetto, in Manatee County, from Crystal River down to Punta Gorda.</p>
        <p className="towns mt-[clamp(36px,4vw,64px)] max-w-[52em]">
          {counties.map((c, i) => (
            <span key={c.name}>
              <span className="font-[450] text-ink">{c.name}</span>
              {c.towns.length > 0 && <span className="text-ink-2"> {c.towns.join(', ')}</span>}
              {i < counties.length - 1 && <span aria-hidden="true" className="text-gulf">{' / '}</span>}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
