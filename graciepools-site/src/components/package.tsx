// L'ensemble livré autour du bassin (terrasse en pavés, éclairage, équipement Pentair, électrolyse au sel)
// et le financement Lyon Financial, leur partenaire (« Loan Options for New Pools and Paver Decks »).
import { ArrowUpRight } from 'lucide-react'
import type { CSSProperties } from 'react'

import { Lines } from '@/components/lines'
import { Photo } from '@/components/photo'
import { LYON } from '@/lib/site'

const ITEMS = [
  { title: 'Paver decking', text: 'The deck is part of the package, and it can be financed with the pool.' },
  { title: 'Pool lighting', text: 'LED lights that keep the pool in use, and good to look at, after dark.' },
  { title: 'Pentair equipment', text: 'Pumps, filtration and automation from Pentair, the only brand we install.' },
  { title: 'Saltwater systems', text: 'A healthy option, and a smooth fiberglass shell is made for it.' },
]

export function Package() {
  return (
    <section id="package" tabIndex={-1} className="relative bg-deck">
      <div className="wrap pt-[clamp(80px,10vw,150px)] pb-[clamp(80px,10vw,150px)]">
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Lines className="t-h2">Everything around the water</Lines>
            <p className="t-lead mt-6 max-w-[34rem] text-ink-soft" data-up>
              Our complete pool packages come with the paver deck, the lighting, the equipment and a saltwater system.
            </p>
            <ul className="mt-12">
              {ITEMS.map((it, i) => (
                <li key={it.title} className="grid gap-x-8 gap-y-1 border-t border-ink/15 py-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:items-baseline" data-up style={{ '--d': `${i * 0.06}s` } as CSSProperties}>
                  <p className="text-[clamp(26px,2.4vw,36px)] leading-none font-[660] tracking-[-0.03em]">{it.title}</p>
                  <p className="text-[16.5px] leading-[1.5] text-ink-soft">{it.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid content-start gap-5 lg:col-span-5">
            <figure>
              <Photo id="dusk-steps" alt="A pool at night, its entry steps lit in blue" className="aspect-[4/3] rounded-[22px]" sizes="(max-width: 1023px) 100vw, 560px" position="50% 60%" />
              <figcaption className="mt-3 text-[14px] text-ink-soft">Lit steps after dark. Photo: Barrier Reef</figcaption>
            </figure>
            <div className="rounded-[22px] bg-azure p-7 text-ink sm:p-9" data-up>
              <p className="text-[clamp(26px,2.3vw,34px)] leading-[1.02] font-[680] tracking-[-0.03em]">Loan options for new pools and paver decks</p>
              <p className="mt-4 max-w-[26rem] text-[16.5px] leading-[1.5] text-ink/80">
                Gracie Pools works with Lyon Financial. Their page for Gracie Pools shows the options and lets you apply.
              </p>
              <a href={LYON} target="_blank" rel="noreferrer" className="btn btn-ink mt-7">
                See loan options
                <ArrowUpRight className="btn-arrow size-[18px]" aria-hidden />
                <span className="sr-only">(Lyon Financial, opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
