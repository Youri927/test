// « Everything in between » : tous les autres soins, rangés par situation, avec les mots des patients.
// Chaque ligne ouvre la fiche des soins qui y répondent (texte complet de leurs pages).
import { ArrowUpRight } from 'lucide-react'
import type { CSSProperties } from 'react'

import { Lines } from '@/components/lines'
import { byId, situations } from '@/data/content'
import { openSheet } from '@/lib/sheet'

export function Situations() {
  return (
    <section id="treatments" tabIndex={-1} aria-labelledby="treatments-title" className="relative bg-mist py-[clamp(88px,11vw,170px)]">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <Lines id="treatments-title" className="t-h2">
            And everything in between
          </Lines>
          <p data-up className="t-lead max-w-[34rem] text-ink-soft">
            Start from what is going on. Each line opens the treatments that answer it, explained in full.
          </p>
        </div>

        <ul className="mt-[clamp(48px,6vw,88px)] border-t-[1.5px] border-ink">
          {situations.map((s, i) => (
            <li key={s.id} data-up style={{ '--d': `${Math.min(i, 5) * 0.04}s` } as CSSProperties} className="border-b border-ink/15">
              <button type="button" onClick={() => openSheet(s.treatments, s.say, 'treatments')} className="sit group" aria-haspopup="dialog">
                <span className="sit-say">{s.say}</span>
                <span className="sit-info">
                  <span className="block text-[15.5px] leading-[1.45] text-ink-soft">{s.answer}</span>
                  <span className="mt-2 block text-[14px] leading-[1.4] font-[600]">{s.treatments.map((t) => byId[t].name).join(' · ')}</span>
                </span>
                <span className="sit-arrow" aria-hidden>
                  <ArrowUpRight className="size-5" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
