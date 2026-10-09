// À propos : leur devise, les deux associés, les règles de l'équipe et leurs années de métier en deux phrases,
// puis leurs licences, chacune avec de quoi la vérifier.
import type { ReactNode } from 'react'

import { Photo } from '@/components/frame'
import { site, standards, team, years } from '@/lib/site'

const plates: { term: string; value: string; note: ReactNode }[] = [
  {
    term: 'Florida certified pool contractor',
    value: site.license,
    note: (
      <a href={site.dbpr} target="_blank" rel="noreferrer" className="link">
        Search it on the state license site
      </a>
    ),
  },
  { term: 'LP gas license', value: site.gas, note: 'Florida Department of Agriculture and Consumer Services' },
  { term: 'Certified Pool & Spa Operator', value: site.cpo, note: 'National Swimming Pool Foundation and Pool & Hot Tub Alliance' },
  {
    term: 'Better Business Bureau',
    value: 'A+',
    note: (
      <a href={site.bbb} target="_blank" rel="noreferrer" className="link">
        Accredited since April 2026
      </a>
    ),
  },
]

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

export function About() {
  const trade = years.slice(0, 4).map((y) => `${lower(y.text)} since ${y.year}`)
  return (
    <section id="about" aria-labelledby="about-title" className="bg-shade outline-none" tabIndex={-1}>
      <div className="w py-[var(--section)]">
        <div className="g12 gap-y-14">
          <div className="col-span-12 lg:col-span-5">
            <h2 id="about-title" className="h2">
              We won’t stop until it’s right.
            </h2>
            <p className="lead mt-6 text-ink-2">
              Coastal Creations is family owned and operated, in Palmetto. Our partners have 50 years in the trade between them, and every job comes with a 100% customer satisfaction guarantee.
            </p>
          </div>
          <div className="col-span-12 grid gap-x-[var(--gap)] gap-y-12 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {team.map((p) => (
              <div key={p.name}>
                <div className="aspect-[4/5] w-[150px] overflow-hidden bg-paper">
                  <Photo id={p.photo} alt={`Portrait of ${p.name}`} sizes="150px" style={{ objectPosition: '50% 18%' }} />
                </div>
                <h3 className="h3 mt-5">{p.name}</h3>
                <p className="label mt-1.5 text-gulf">{p.role}</p>
                <p className="small mt-3 max-w-[24em] text-ink-2">{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="defs mt-[clamp(64px,7vw,112px)] border-b border-rule">
          <div>
            <h3 className="h3">On every job</h3>
            <p className="small max-w-[46em] text-ink-2">
              {[standards[0], ...standards.slice(1, -1).map(lower)].join(', ')}, and {lower(standards[standards.length - 1])}. On time and within budget, with problems resolved quickly and honestly.
            </p>
          </div>
          <div>
            <h3 className="h3">Years in the trade</h3>
            <p className="small max-w-[46em] text-ink-2">
              Between them, our partners have worked in {trade.slice(0, -1).join(', ')}, and {trade[trade.length - 1]}. {years[4].text.replace(' starts', '')} started in {years[4].year}, and has been accredited by the Better Business Bureau, rated A+, since April {years[5].year}.
            </p>
          </div>
        </div>

        <div className="mt-[clamp(64px,7vw,112px)]">
          <h3 className="h3">Licensed and insured</h3>
          <dl className="mt-6 border-b border-rule">
            {plates.map((pl) => (
              <div key={pl.term} className="grid gap-x-[var(--gap)] gap-y-2 border-t border-rule py-5 md:grid-cols-[4fr_3fr_5fr] md:items-baseline">
                <dt className="small font-[500]">{pl.term}</dt>
                <dd className="num text-[clamp(30px,2.6vw,40px)] leading-none">{pl.value}</dd>
                <dd className="note text-ink-2">{pl.note}</dd>
              </div>
            ))}
          </dl>
          <p className="small mt-6 text-ink-2">
            Read what homeowners say on{' '}
            <a href={site.angi} target="_blank" rel="noreferrer" className="link text-ink">
              Angi
            </a>{' '}
            and{' '}
            <a href={site.google} target="_blank" rel="noreferrer" className="link text-ink">
              Google
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
