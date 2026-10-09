// Détection de fuites : leur slogan, leurs tarifs (enfermés dans une image sur l'ancien site, ici en clair et calculés),
// leurs méthodes, les endroits qui fuient, le test du seau et leur FAQ complète.
import { Minus, Plus, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

import { Lines } from '@/components/lines'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { motion } from '@/lib/motion'
import { faq, leakAreas, leakMethods, leakPrices, site } from '@/lib/site'

export function Leaks() {
  return (
    <section id="leaks" className="bg-navy-sec on-dark outline-none" aria-labelledby="leaks-title" tabIndex={-1}>
      <div className="wrap py-[var(--section)]">
        <div className="grid-12 gap-y-14">
          <div className="col-span-12 lg:col-span-6">
            <Lines as="h2" id="leaks-title" className="t-h2">
              Find it. Fix it. Done right.
            </Lines>
            <p className="t-lead mt-6 max-w-[30em] text-white/85">
              Leak detection in and around Manatee and Sarasota counties. Whether it’s a hidden plumbing issue, a structural crack or the equipment, we find it, and as a licensed pool contractor, we fix it. Not a temporary fix.
            </p>
            <div className="mt-[clamp(48px,6vw,88px)] flex flex-col gap-12 lg:pr-[3vw]">
              <div>
                <h3 className="t-h3">How we find it</h3>
                <p className="t-small mt-4 max-w-[34em] text-white/80">
                  {leakMethods[0]}, {leakMethods.slice(1, -1).map((m) => m.toLowerCase()).join(', ')} and {leakMethods[leakMethods.length - 1].toLowerCase()}, chosen for your symptoms and the way your pool is set up.
                </p>
              </div>
              <div>
                <h3 className="t-h3">Where pools leak</h3>
                <ul className="mt-5 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
                  {leakAreas.map((a) => (
                    <li key={a} className="t-small border-t border-white/15 py-2.5 text-white/85 first-letter:uppercase">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="t-h3">Leak or evaporation? The bucket test</h3>
                <p className="t-small mt-4 max-w-[34em] text-white/80">
                  Set a bucket on the pool step and fill it to the same level as the pool. If the pool drops more than the bucket, there may be a leak. Florida pools do lose water to evaporation, more in hot, sunny, windy or dry weather.
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
              <LeakPrice />
            </div>
          </div>
        </div>

        <div className="grid-12 mt-[clamp(72px,8vw,128px)] gap-y-8">
          <div className="col-span-12 lg:col-span-4">
            <h3 id="faq" className="t-h3">Leak detection questions</h3>
            <p className="t-small mt-4 max-w-[26em] text-white/75">
              Still not sure? Call or text{' '}
              <a href={site.phone.sms} className="ul text-white">
                {site.phone.label}
              </a>
              .
            </p>
          </div>
          <Accordion type="single" collapsible className="col-span-12 lg:col-span-8">
            {faq.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`} className="faq-item !border-b-0">
                <AccordionTrigger className="rounded-none py-5 text-[17px] font-[620] [font-stretch:104%] hover:no-underline focus-visible:ring-0 **:data-[slot=accordion-trigger-icon]:size-5 **:data-[slot=accordion-trigger-icon]:text-aqua">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="t-small max-w-[44em] pb-6 text-white/80">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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

function LeakPrice() {
  const [spa, setSpa] = useState(false)
  const [features, setFeatures] = useState(0)
  const [heads, setHeads] = useState(0)
  const total = (spa ? leakPrices.poolSpa : leakPrices.pool) + features * leakPrices.feature + heads * leakPrices.head
  const shown = useTween(total)
  const spaRef = useRef<HTMLButtonElement>(null)
  const poolRef = useRef<HTMLButtonElement>(null)

  // groupe de boutons radio : les flèches passent d'un choix à l'autre
  const onKey = (e: KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
    e.preventDefault()
    const next = !spa
    setSpa(next)
    ;(next ? spaRef : poolRef).current?.focus()
  }

  const choices = [
    { ref: poolRef, on: !spa, set: () => setSpa(false), name: 'Pool only', note: 'Leak detection for the pool structure and plumbing', price: leakPrices.pool },
    { ref: spaRef, on: spa, set: () => setSpa(true), name: 'Pool and spa', note: 'For pools with an attached spa or hot tub', price: leakPrices.poolSpa },
  ]

  return (
    <div className="sheet">
      <div className="px-5 pt-6 pb-5 sm:px-7">
        <h3 className="t-h3">Leak detection pricing</h3>
        <p className="t-note mt-2 text-white/70">Choose your setup to see the price.</p>
      </div>
      <div role="radiogroup" aria-label="Your pool" onKeyDown={onKey}>
        {choices.map((c) => (
          <button key={c.name} ref={c.ref} type="button" role="radio" aria-checked={c.on} tabIndex={c.on ? 0 : -1} onClick={c.set} className="choice sheet-row sm:px-7">
            <span className="dot" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block font-[640]">{c.name}</span>
              <span className="t-note block text-white/65">{c.note}</span>
            </span>
            <span className="t-num text-[20px]">${c.price}</span>
          </button>
        ))}
      </div>
      <Stepper label="Water features" note="Water bowls, waterfalls and other water features" price={leakPrices.feature} value={features} set={setFeatures} max={10} />
      <Stepper label="In-floor cleaning heads" note="Leak detection for in-floor cleaning systems" price={leakPrices.head} value={heads} set={setHeads} max={40} />
      <div className="sheet-row flex items-end justify-between gap-4 px-5 pt-5 pb-4 sm:px-7">
        <span className="pb-1 font-[640]">Your detection price</span>
        <span aria-hidden="true" className="t-num text-[clamp(46px,4.8vw,68px)] leading-[0.85] text-aqua">
          ${shown}
        </span>
        <span className="sr-only" aria-live="polite">
          Your detection price: ${total}
        </span>
      </div>
      <div className="px-5 pb-6 sm:px-7">
        <p className="t-small flex items-start gap-2.5 text-white/85">
          <ShieldCheck aria-hidden="true" className="mt-[2px] size-[18px] flex-none text-aqua" />
          Epoxy repairs included. Anything more than that will be quoted.
        </p>
        <a href={site.leakRequest} target="_blank" rel="noreferrer" className="btn btn-aqua mt-6 w-full">
          Book leak detection
        </a>
        <p className="t-note mt-3 text-center text-white/70">
          Or call or text{' '}
          <a href={site.phone.href} className="ul text-white">
            {site.phone.label}
          </a>
        </p>
      </div>
    </div>
  )
}

function Stepper({ label, note, price, value, set, max }: { label: string; note: string; price: number; value: number; set: (n: number) => void; max: number }) {
  return (
    <div className="sheet-row flex items-center gap-4 px-5 py-4 sm:px-7">
      <div className="min-w-0 flex-1">
        <p className="font-[640]">
          {label} <span className="font-[460] whitespace-nowrap text-white/60">${price} each</span>
        </p>
        <p className="t-note text-white/65">{note}</p>
      </div>
      <div className="stepper flex items-center gap-2" role="group" aria-label={label}>
        <button type="button" aria-label={`Remove one: ${label.toLowerCase()}`} disabled={value === 0} onClick={() => set(Math.max(0, value - 1))}>
          <Minus aria-hidden="true" className="size-4" />
        </button>
        <span className="t-num w-7 text-center text-[20px]" aria-live="polite" aria-atomic="true">
          {value}
        </span>
        <button type="button" aria-label={`Add one: ${label.toLowerCase()}`} disabled={value === max} onClick={() => set(Math.min(max, value + 1))}>
          <Plus aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  )
}
