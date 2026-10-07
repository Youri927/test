// « What resurfacing costs » : les fourchettes de leur page de prix, sur une même échelle de 0 à 12 000 $.
// Les barres s'étirent depuis leur début et les montants comptent jusqu'à leur valeur quand la section arrive.
import { ArrowRight } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'

import { Lines } from '@/components/lines'
import { cost } from '@/data/content'
import { go, gsap, motion, ScrollTrigger } from '@/lib/motion'

const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US')
const pct = (n: number) => `${(n / cost.scaleMax) * 100}%`
const ticks = [0, 2000, 4000, 6000, 8000, 10000, 12000]

export function Cost() {
  const chart = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = chart.current
    if (!el || !motion()) return
    const ctx = gsap.context(() => {
      const bars = gsap.utils.toArray<HTMLElement>('[data-bar]')
      gsap.set(bars, { scaleX: 0 })
      gsap.set('[data-plus]', { opacity: 0 })
      ScrollTrigger.create({
        trigger: el,
        start: 'top 86%',
        once: true,
        onEnter: () => {
          bars.forEach((bar, i) => {
            const row = cost.rows[i]
            const label = bar.closest('[data-row]')?.querySelector<HTMLElement>('[data-amount]')
            const v = { a: 0, b: 0 }
            gsap.to(bar, { scaleX: 1, duration: 1.4, delay: i * 0.18, ease: 'expo.out' })
            gsap.to(v, {
              a: row.from,
              b: row.to,
              duration: 1.4,
              delay: i * 0.18,
              ease: 'expo.out',
              onUpdate: () => label && (label.textContent = `${money(v.a)} – ${money(v.b)}${row.plus ? '+' : ''}`),
            })
          })
          gsap.to('[data-plus]', { opacity: 1, duration: 0.8, delay: 1.1 })
        },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="cost" tabIndex={-1} className="bg-water pb-[clamp(88px,11vw,176px)]" aria-labelledby="cost-title">
      <div className="wrap grid gap-12 border-t border-ink/15 pt-[clamp(72px,9vw,140px)] lg:grid-cols-[1fr_1.25fr] lg:gap-[clamp(48px,6vw,104px)]">
        <div>
          <Lines id="cost-title" className="t-h2 max-w-[14ch] text-ink">What resurfacing costs in Tampa</Lines>
          <p data-up className="t-lead mt-6 max-w-[30rem] text-ink-soft">
            Typical ranges from our resurfacing guide. Your price depends on your pool and the finish you pick, and we give it to you up front, for free.
          </p>
          <div data-up className="mt-10">
            <p className="text-[15px] font-[620] text-ink">What moves the price</p>
            <ul className="mt-3 grid gap-2 text-ink-soft">
              {cost.factors.map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="mt-[11px] h-px w-4 shrink-0 bg-ink/50" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <a data-up href="#estimate" onClick={(e) => go(e, 'estimate')} className="btn btn-ink mt-10">
            Get your exact price
            <ArrowRight className="arr size-[18px]" aria-hidden />
          </a>
        </div>

        <div ref={chart} className="self-end">
          <ul className="grid gap-10">
            {cost.rows.map((r) => (
              <li key={r.label} data-row className="grid gap-3">
                <div className="flex items-baseline justify-between gap-6">
                  <p className="text-[19px] font-[640] [font-stretch:106%] text-ink">{r.label}</p>
                  <p data-amount className="t-num text-[19px] whitespace-nowrap text-ink">
                    {money(r.from)} – {money(r.to)}
                    {r.plus ? '+' : ''}
                  </p>
                </div>
                <div className="relative h-3.5 rounded-full bg-white">
                  <div data-bar className="absolute inset-y-0 origin-left rounded-full bg-ink" style={{ left: pct(r.from), width: pct(r.to - r.from) }} />
                  {r.plus && (
                    <div data-plus className="absolute inset-y-[3px] rounded-r-full border-y-[1.5px] border-r-[1.5px] border-dashed border-ink/45" style={{ left: pct(r.to), width: pct(1500) }} aria-hidden />
                  )}
                </div>
                <p className="t-small text-ink-soft">{r.note}</p>
              </li>
            ))}
          </ul>
          <div className="relative mt-4 h-6" aria-hidden>
            {ticks.map((t) => (
              <span key={t} className="t-num absolute -translate-x-1/2 text-[12.5px] text-ink-soft first:translate-x-0 last:-translate-x-full" style={{ left: pct(t) }}>
                {t === 0 ? '$0' : `$${t / 1000}k`}
              </span>
            ))}
          </div>
          <p className="t-small mt-8 max-w-[36rem] text-ink-soft">{cost.quartz} Every pool is different, so every quote is made after a visit.</p>
        </div>
      </div>
    </section>
  )
}
