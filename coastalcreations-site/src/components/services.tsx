// Ce qu'ils font, en une phrase qui sert aussi de sommaire : chaque morceau mène à sa partie. Puis les deux demandes
// (devis, détection de fuites) et ce qui permet de leur faire confiance, vérifiable.
import { BadgeCheck, ShieldCheck } from 'lucide-react'

import { go } from '@/lib/motion'
import { extras, site } from '@/lib/site'

const parts = [
  { id: 'build', text: 'build new pools' },
  { id: 'renovate', text: 'bring tired ones back' },
  { id: 'leaks', text: 'find leaks from $350' },
  { id: 'storm', text: 'raise equipment above the storm surge' },
]

export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="w pt-[clamp(72px,8vw,128px)] outline-none" tabIndex={-1}>
      <h2 id="services-title" className="sr-only">
        What we do
      </h2>
      <p className="index max-w-[21em]">
        We{' '}
        {parts.map((p, i) => (
          <span key={p.id}>
            <a href={`#${p.id}`} onClick={(e) => go(e, p.id)}>
              {p.text}
            </a>
            {i < parts.length - 2 ? ', ' : i === parts.length - 2 ? ' and ' : ''}
          </span>
        ))}
        , across{' '}
        <a href="#area" onClick={(e) => go(e, 'area')}>
          ten counties
        </a>{' '}
        of the Gulf Coast, from Palmetto.
      </p>

      <div className="mt-[clamp(36px,4vw,56px)] flex flex-wrap items-center gap-x-8 gap-y-5">
        <a href={site.quote} target="_blank" rel="noreferrer" className="btn btn-sun">
          Request a free quote
        </a>
        <a href={site.leakRequest} target="_blank" rel="noreferrer" className="link font-[500]">
          Book leak detection
        </a>
      </div>
      <ul className="small mt-7 flex flex-wrap gap-x-8 gap-y-2.5">
        <li className="flex items-center gap-2.5">
          <ShieldCheck aria-hidden="true" className="size-[18px] text-gulf" />
          Licensed, insured, family run: Florida pool contractor {site.license}
        </li>
        <li>
          <a href={site.bbb} target="_blank" rel="noreferrer" className="flex items-center gap-2.5">
            <BadgeCheck aria-hidden="true" className="size-[18px] text-gulf" />
            <span className="link">BBB accredited, A+</span>
          </a>
        </li>
      </ul>

      <div className="g12 mt-[clamp(56px,6vw,96px)] gap-y-5 border-t border-rule pt-6">
        <p className="small col-span-12 text-ink-2 lg:col-span-7">
          <span className="font-[500] text-ink">Also on the list: </span>
          {extras.charAt(0).toLowerCase() + extras.slice(1)}
        </p>
        <p className="small col-span-12 lg:col-span-4 lg:col-start-9">
          <span className="font-[500]">One thing we don’t do:</span> routine pool cleaning or weekly maintenance.
        </p>
      </div>
    </section>
  )
}
