// À propos : leur devise, les deux associés, les règles de l'équipe, leurs années de métier et les preuves vérifiables
// (licences écrites en grand, avec de quoi les vérifier soi-même).
import type { CSSProperties, ReactNode } from 'react'

import { Photo } from '@/components/frame'
import { Lines } from '@/components/lines'
import { site, standards, team, years } from '@/lib/site'

export function About() {
  return (
    <section id="about" className="bg-mist-sec outline-none" aria-labelledby="about-title" tabIndex={-1}>
      <div className="wrap py-[var(--section)]">
        <div className="grid-12 gap-y-6">
          <Lines as="h2" id="about-title" className="t-h2 col-span-12 lg:col-span-8">
            We won’t stop until it’s right.
          </Lines>
          <p className="t-lead col-span-12 sm:col-span-10 lg:col-span-6">
            Coastal Creations is family owned and operated, in Palmetto. Our partners have 50 years in the trade between them, and every job comes with a 100% customer satisfaction guarantee.
          </p>
        </div>

        <div className="grid-12 mt-[clamp(56px,7vw,104px)] gap-y-12">
          <ul className="col-span-12 grid gap-8 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-1 xl:grid-cols-2">
            {team.map((p) => (
              <li key={p.name} className="flex gap-5">
                <div className="frame aspect-[3/4] w-[112px] flex-none sm:w-[124px]">
                  <Photo id={p.photo} alt={`Portrait of ${p.name}`} sizes="124px" style={{ objectPosition: '50% 18%' }} />
                </div>
                <div className="pt-1">
                  <h3 className="t-h3">{p.name}</h3>
                  <p className="t-label mt-1.5 text-cobalt">{p.role}</p>
                  <p className="t-small mt-3 text-ink-soft">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="col-span-12 sm:col-span-8 lg:col-span-4 lg:col-start-9">
            <h3 className="t-h4">On every job</h3>
            <ul className="mt-4 border-t border-line">
              {[...standards, 'On time and within budget', 'Problems resolved quickly and honestly'].map((s) => (
                <li key={s} className="t-small border-b border-line py-2.5">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-[clamp(72px,8vw,128px)]">
          <h3 className="t-h4">Our partners’ years in the trade</h3>
          <ol className="years mt-8 lg:mt-10">
            {years.map((y, i) => (
              <li key={y.year} style={{ '--i': i } as CSSProperties}>
                <p className="t-num text-[clamp(28px,2.6vw,40px)] leading-none">{y.year}</p>
                <p className="t-small mt-2 max-w-[13em] text-ink-soft">{y.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-[clamp(72px,8vw,128px)]">
          <h3 className="t-h4">Licenses and reviews</h3>
          <dl className="mt-6 grid gap-x-[var(--gutter)] border-t border-navy/25 sm:grid-cols-2 xl:grid-cols-4">
            <Proof term="Florida certified pool contractor" value={site.license}>
              <a href={site.dbpr} target="_blank" rel="noreferrer" className="ul">
                Search it on the state license site
              </a>
            </Proof>
            <Proof term="LP gas license" value={site.gas}>
              Florida Department of Agriculture and Consumer Services
            </Proof>
            <Proof term="Certified Pool & Spa Operator" value={site.cpo}>
              Through the National Swimming Pool Foundation and the Pool & Hot Tub Alliance
            </Proof>
            <Proof term="Better Business Bureau" value="A+">
              <a href={site.bbb} target="_blank" rel="noreferrer" className="ul">
                Accredited since April 2026
              </a>
            </Proof>
          </dl>
          <p className="t-small mt-6 text-ink-soft">
            Read what homeowners say on{' '}
            <a href={site.angi} target="_blank" rel="noreferrer" className="ul text-navy">
              Angi
            </a>{' '}
            and{' '}
            <a href={site.google} target="_blank" rel="noreferrer" className="ul text-navy">
              Google
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}

function Proof({ term, value, children }: { term: string; value: string; children: ReactNode }) {
  return (
    <div className="border-b border-navy/25 py-6 sm:pr-4">
      <dt className="t-small font-[600]">{term}</dt>
      <dd className="t-num mt-3 text-[clamp(28px,2.4vw,40px)] leading-none">{value}</dd>
      <dd className="t-note mt-3 text-ink-soft">{children}</dd>
    </div>
  )
}
