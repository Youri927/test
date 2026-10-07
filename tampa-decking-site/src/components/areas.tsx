// Les 23 villes de leur page « Areas We Serve », avec un champ qui répond tout de suite à « Do you work in my city? ».
import { Search } from 'lucide-react'
import { useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react'

import { Lines } from '@/components/lines'
import { cities, PHONE, PHONE_HREF } from '@/data/content'
import { cn } from '@/lib/utils'

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/['’.]/g, '')
    .replace(/\band\b/g, 'n')
    .replace(/newport/g, 'new port')
    .replace(/\s+/g, ' ')
    .trim()

export function Areas() {
  const [q, setQ] = useState('')
  const id = useId()
  const nq = norm(q)

  const { exact, matches } = useMemo(() => {
    if (nq.length < 2) return { exact: null as string | null, matches: [] as string[] }
    const exact = cities.find((c) => norm(c) === nq) ?? null
    const matches = cities.filter((c) => norm(c).startsWith(nq) || norm(c).includes(' ' + nq))
    return { exact, matches }
  }, [nq])

  let answer: ReactNode = 'Start typing, we will tell you right away.'
  if (exact) answer = <>Yes, we work in <strong className="font-[650] text-white">{exact}</strong>. Your estimate is free.</>
  else if (matches.length) answer = <>Did you mean {matches.slice(0, 3).map((m, i) => (
    <span key={m}>
      {i > 0 && (i === Math.min(matches.length, 3) - 1 ? ' or ' : ', ')}
      <button className="ul font-[600] text-white" onClick={() => setQ(m)}>{m}</button>
    </span>
  ))}?</>
  else if (nq.length >= 3) answer = <>Not on our list yet. Call us at <a href={PHONE_HREF} className="ul font-[600] text-white">{PHONE}</a> and we will tell you.</>

  return (
    <section id="areas" tabIndex={-1} className="on-dark bg-deep pb-[clamp(96px,12vw,192px)] text-white" aria-labelledby="areas-title">
      <div className="wrap grid gap-12 border-t border-white/15 pt-[clamp(72px,9vw,140px)] lg:grid-cols-[1fr_1.25fr] lg:gap-[clamp(48px,6vw,104px)]">
        <div>
          <Lines id="areas-title" className="t-h2 max-w-[12ch]">Hillsborough, Pasco and Pinellas</Lines>
          <p data-up className="t-lead mt-6 max-w-[28rem] text-white/80">We work in 23 cities around Tampa Bay.</p>
          <div data-up className="mt-10 max-w-[28rem]">
            <label htmlFor={id} className="text-[15px] font-[600]">Do you work in my city?</label>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute top-1/2 left-5 size-[18px] -translate-y-1/2 text-white/60" aria-hidden />
              <input
                id={id}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type your city"
                autoComplete="address-level2"
                className="h-14 w-full rounded-full bg-white/10 pr-5 pl-12 text-[17px] text-white placeholder:text-white/50 shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.22)] outline-none transition-shadow focus:shadow-[inset_0_0_0_2px_var(--sun)]"
              />
            </div>
            <p className="mt-4 min-h-[3em] text-[15px] text-white/80" aria-live="polite">{answer}</p>
          </div>
        </div>

        <ul className="flex flex-wrap content-start gap-x-[clamp(16px,1.6vw,28px)] gap-y-[clamp(6px,0.7vw,12px)] lg:pt-3" aria-label="Cities we serve">
          {cities.map((c, i) => {
            const on = exact === c || (!exact && matches.includes(c))
            return (
              <li
                key={c}
                data-up
                style={{ '--d': `${i * 0.025}s` } as CSSProperties}
                className={cn('city text-[clamp(22px,2.3vw,36px)] leading-[1.15] font-[600] tracking-[-0.025em] [font-stretch:108%] transition-colors duration-300', on ? 'is-on text-white' : 'text-white/55 hover:text-white/90')}
              >
                {c}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
