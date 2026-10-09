// Détection de fuites : leur slogan et leurs prix sur un panneau graphite, en grands chiffres comme sur une enseigne
// (ils étaient enfermés dans une image sur l'ancien site), le calcul du prix selon la piscine ; puis leurs méthodes,
// les endroits qui fuient, le test du seau et leur FAQ complète.
import { Minus, Plus } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { motion } from '@/lib/motion'
import { faq, leakAreas, leakMethods, leakPrices, site } from '@/lib/site'

const board = [
  { price: `$${leakPrices.pool}`, name: 'Pool only', text: 'Leak detection for the pool structure and plumbing.' },
  { price: `$${leakPrices.poolSpa}`, name: 'Pool and spa', text: 'For pools with an attached spa or hot tub.' },
  { price: `+$${leakPrices.feature}`, name: 'Each water feature', text: 'Water bowls, waterfalls and other water features.' },
  { price: `+$${leakPrices.head}`, name: 'Each cleaning head', text: 'Leak detection for in-floor cleaning systems.' },
]

export function Leaks() {
  const half = Math.ceil(faq.length / 2)
  return (
    <section id="leaks" aria-labelledby="leaks-title" className="outline-none" tabIndex={-1}>
      <div className="on-ink bg-ink text-paper">
        <div className="w py-[var(--section)]">
          <div className="g12 gap-y-6">
            <h2 id="leaks-title" className="h2 col-span-12 lg:col-span-5">
              Find it. Fix it. Done right.
            </h2>
            <p className="lead col-span-12 text-paper/80 lg:col-span-6 lg:col-start-7">
              Leak detection in and around Manatee and Sarasota counties. Whether it’s a hidden plumbing issue, a structural crack or the equipment, we find it, and as a licensed pool contractor, we fix it. Not a temporary fix.
            </p>
          </div>

          <div className="posts mt-[clamp(56px,6vw,96px)]" style={{ '--n': 4 } as CSSProperties}>
            {board.map((b) => (
              <div key={b.name}>
                <p className="price">{b.price}</p>
                <p className="h3 mt-4">{b.name}</p>
                <p className="small mt-2 text-paper/75">{b.text}</p>
              </div>
            ))}
          </div>
          <p className="small mt-8 font-[500]">Epoxy repairs included. Anything more than that will be quoted.</p>

          <Calculator />
        </div>
      </div>

      <div className="w pt-[clamp(72px,8vw,120px)]">
        <div className="defs border-b border-rule">
          <div>
            <h3 className="h3">How we find it</h3>
            <p className="small text-ink-2">
              {leakMethods[0]}, {leakMethods.slice(1, -1).map((m) => m.toLowerCase()).join(', ')} and {leakMethods[leakMethods.length - 1].toLowerCase()}, chosen for your symptoms and the way your pool is set up.
            </p>
          </div>
          <div>
            <h3 className="h3">Where pools leak</h3>
            <p className="small text-ink-2">{leakAreas.map((a, i) => (i === 0 ? a.charAt(0).toUpperCase() + a.slice(1) : a)).join(', ')}.</p>
          </div>
          <div>
            <h3 className="h3">Leak or evaporation?</h3>
            <p className="small text-ink-2">
              Set a bucket on the pool step and fill it to the same level as the pool. If the pool drops more than the bucket, there may be a leak. Florida pools do lose water to evaporation, more in hot, sunny, windy or dry weather.
            </p>
          </div>
        </div>

        <div className="mt-[clamp(72px,8vw,120px)]">
          <h3 id="faq" className="h2">
            Leak detection questions
          </h3>
          <p className="small mt-3 text-ink-2">
            Still not sure? Call or text{' '}
            <a href={site.phone.sms} className="link text-ink">
              {site.phone.label}
            </a>
            .
          </p>
          <div className="mt-10 grid gap-x-[var(--gap)] lg:grid-cols-2">
            {[faq.slice(0, half), faq.slice(half)].map((col, c) => (
              <Accordion key={c} type="single" collapsible className="border-t border-rule lg:[&:last-child]:border-t">
                {col.map((f, i) => (
                  <AccordionItem key={f.q} value={`q${c}-${i}`} className="border-b border-rule">
                    <AccordionTrigger className="rounded-none py-5 text-[18px] font-[450] hover:no-underline focus-visible:ring-0 **:data-[slot=accordion-trigger-icon]:size-5 **:data-[slot=accordion-trigger-icon]:text-gulf">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="small max-w-[40em] pb-6 text-ink-2">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// le total qui défile jusqu'à sa nouvelle valeur (immédiat si le visiteur a demandé moins d'animations)
function useTween(value: number, ms = 450) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    if (!motion()) {
      from.current = value
      setShown(value)
      return
    }
    const a = from.current
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms)
      const v = Math.round(a + (value - a) * (1 - Math.pow(1 - p, 3)))
      from.current = v
      setShown(v)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return shown
}

// le calcul : la piscine (avec ou sans spa), le nombre de jeux d'eau et de buses de nettoyage au fond
function Calculator() {
  const [spa, setSpa] = useState(false)
  const [features, setFeatures] = useState(0)
  const [heads, setHeads] = useState(0)
  const total = (spa ? leakPrices.poolSpa : leakPrices.pool) + features * leakPrices.feature + heads * leakPrices.head
  const shown = useTween(total)
  const poolRef = useRef<HTMLButtonElement>(null)
  const spaRef = useRef<HTMLButtonElement>(null)

  const onKey = (e: KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
    e.preventDefault()
    const next = !spa
    setSpa(next)
    ;(next ? spaRef : poolRef).current?.focus()
  }

  return (
    <div className="mt-[clamp(48px,6vw,80px)] grid border border-paper/35 lg:grid-cols-[1fr_auto]">
      <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-3 md:gap-8">
        <div>
          <p id="calc-pool" className="label">
            Your pool
          </p>
          <div role="radiogroup" aria-labelledby="calc-pool" onKeyDown={onKey} className="mt-3 flex flex-wrap gap-2">
            <button ref={poolRef} type="button" role="radio" aria-checked={!spa} tabIndex={spa ? -1 : 0} onClick={() => setSpa(false)} className="choice">
              Pool only
            </button>
            <button ref={spaRef} type="button" role="radio" aria-checked={spa} tabIndex={spa ? 0 : -1} onClick={() => setSpa(true)} className="choice">
              Pool and spa
            </button>
          </div>
        </div>
        <Counter label="Water features" value={features} set={setFeatures} max={10} />
        <Counter label="In-floor cleaning heads" value={heads} set={setHeads} max={40} />
      </div>
      <div className="total flex flex-col justify-between gap-5 p-5 sm:p-7 lg:min-w-[340px]">
        <div className="flex items-end justify-between gap-6">
          <span className="label pb-2">Your price</span>
          <span aria-hidden="true" className="price text-[clamp(56px,5.4vw,84px)]">
            ${shown}
          </span>
          <span className="sr-only" aria-live="polite">
            Your leak detection price: ${total}
          </span>
        </div>
        <a href={site.leakRequest} target="_blank" rel="noreferrer" className="btn btn-ink w-full">
          Book leak detection
        </a>
      </div>
    </div>
  )
}

function Counter({ label, value, set, max }: { label: string; value: number; set: (n: number) => void; max: number }) {
  return (
    <div role="group" aria-label={label}>
      <p className="label">{label}</p>
      <div className="mt-3 flex items-center gap-3">
        <button type="button" className="step-btn" aria-label={`Remove one: ${label.toLowerCase()}`} disabled={value === 0} onClick={() => set(Math.max(0, value - 1))}>
          <Minus aria-hidden="true" className="size-4" />
        </button>
        <span className="num w-10 text-center text-[30px] leading-none" aria-live="polite" aria-atomic="true">
          {value}
        </span>
        <button type="button" className="step-btn" aria-label={`Add one: ${label.toLowerCase()}`} disabled={value === max} onClick={() => set(Math.min(max, value + 1))}>
          <Plus aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  )
}
