// L'accueil : « Hello Florida », leur salut, en grand ; à côté, un bassin vu de dessus présenté comme un produit,
// avec ses cotes, qui passe d'une forme à l'autre (libre, rectangulaire, haricot, romaine, petit bassin).
import { ArrowDown, MessageSquareText, Pause, Play } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { PoolPlan } from '@/components/pool-plan'
import { useBox } from '@/components/pool-stage'
import { useChoice } from '@/lib/choice'
import { go, gsap, motion, scrollToId } from '@/lib/motion'
import { photo } from '@/lib/photos'
import { feet, finishById, modelById, type FinishId } from '@/lib/pools'
import { LICENSE, sms } from '@/lib/site'
import { cn } from '@/lib/utils'

const SHOW: { model: string; finish: FinishId }[] = [
  { model: 'billabong-cove', finish: 'california' },
  { model: 'laguna', finish: 'aquamarine' },
  { model: 'oyster', finish: 'ocean' },
  { model: 'milano', finish: 'evening-sky' },
  { model: 'escape', finish: 'california' },
]
const HOLD = 4.6 // secondes par bassin

export function Hero() {
  return (
    <section id="top" tabIndex={-1} className="relative overflow-hidden bg-white">
      {/* sur téléphone, le bassin vient juste après le titre ; sur grand écran, il occupe la colonne de droite */}
      <div className="wrap grid min-h-[min(100svh,1040px)] content-center gap-x-10 pt-[calc(var(--header)+clamp(24px,5vw,64px))] pb-[clamp(40px,6vw,88px)] lg:grid-cols-12 lg:grid-rows-[auto_auto_auto_auto]">
        <h1 className="t-display hero-title lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:self-end" aria-label="Hello Florida, let’s build your pool">
          {['Hello', 'Florida,', 'let’s build', 'your pool'].map((l, i) => (
            <span key={l} className="ln" aria-hidden style={{ ['--i' as string]: i }}>
              <span>{l}</span>
            </span>
          ))}
        </h1>
        <div className="mt-8 lg:col-span-7 lg:col-start-6 lg:row-span-4 lg:row-start-1 lg:mt-0 lg:self-center">
          <HeroPool />
        </div>
        <p className="t-lead hero-up mt-8 max-w-[31rem] text-ink-soft lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:mt-7" style={{ ['--d' as string]: '0.45s' }}>
          Fiberglass and custom concrete pools for Central Florida backyards, built complete with the deck, lighting and equipment. Already
          have a pool? We do liners, resurfacing and repairs too.
        </p>
        <div className="hero-up mt-8 grid gap-2.5 sm:flex sm:flex-wrap sm:gap-3 lg:col-span-5 lg:col-start-1 lg:row-start-3 lg:mt-9" style={{ ['--d' as string]: '0.55s' }}>
          <a href="#models" onClick={(e) => go(e, 'models')} className="btn btn-ink">
            Find your pool
            <ArrowDown className="btn-arrow size-[18px]" aria-hidden />
          </a>
          <a href={sms()} className="btn btn-line">
            <MessageSquareText className="size-[18px]" aria-hidden />
            Text us a photo
          </a>
        </div>
        <p className="hero-up mt-8 text-[14.5px] leading-relaxed text-ink-soft lg:col-span-5 lg:col-start-1 lg:row-start-4 lg:self-start" style={{ ['--d' as string]: '0.65s' }}>
          Florida licensed and insured pool contractor, <span className="tnum">{LICENSE}</span>
          <br />
          20+ years building pools · Altamonte Springs, Orlando, Winter Park, Lake Mary
        </p>
      </div>
    </section>
  )
}

function HeroPool() {
  const [ref, box] = useBox<HTMLDivElement>()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [stopped, setStopped] = useState(false)
  const [entered, setEntered] = useState(false)
  const { setPick } = useChoice()
  const pool = useRef<SVGGElement>(null)
  const reveal = useRef<SVGRectElement>(null)
  const busy = useRef(false)

  const item = SHOW[index]
  const model = modelById(item.model)
  const size = model.sizes[0]
  const fin = finishById(item.finish)

  // le bassin occupe la scène en gardant ses vraies proportions ; la place des cotes est réservée autour
  const w = box.w
  const h = box.h
  const side = w < 520 ? 34 : 72
  const lft = size.l / 12
  const wft = size.w / 12
  const ppf = w && h ? Math.min((w - side * 2) / lft, (h * 0.72) / wft) : 0
  const L = lft * ppf
  const W = wft * ppf
  const x = (w - L) / 2
  const y = (h - W) / 2 + 8

  // passage au bassin suivant : l'ancien s'efface, le nouveau se pose
  const goTo = useCallback((next: number) => {
    if (busy.current) return
    const g = pool.current
    if (!g || !motion()) {
      setIndex(next)
      return
    }
    busy.current = true
    gsap.to(g, { opacity: 0, duration: 0.32, ease: 'power2.in', onComplete: () => setIndex(next) })
  }, [])

  // défilement automatique, coupé si le visiteur demande moins d'animations ou met en pause
  useEffect(() => {
    if (!motion()) setStopped(true)
  }, [])
  useEffect(() => {
    if (stopped || paused || !entered) return
    const t = window.setTimeout(() => goTo((index + 1) % SHOW.length), HOLD * 1000)
    return () => window.clearTimeout(t)
  }, [index, paused, stopped, entered, goTo])

  // entrée : l'eau se découvre d'un bout à l'autre ; ensuite, chaque bassin arrive en fondu en se posant
  useLayoutEffect(() => {
    if (!ppf || !pool.current) return
    if (!motion()) {
      setEntered(true)
      return
    }
    if (!entered) {
      const r = reveal.current
      if (r) gsap.fromTo(r, { attr: { width: 0 } }, { attr: { width: w + 40 }, duration: 1.6, ease: 'power3.inOut', delay: 0.4 })
      gsap.fromTo(pool.current, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.4, onComplete: () => setEntered(true) })
      return
    }
    gsap.fromTo(
      pool.current,
      { opacity: 0, scale: 0.94, svgOrigin: `${w / 2} ${h / 2}` },
      { opacity: 1, scale: 1, duration: 1.1, ease: 'expo.out', svgOrigin: `${w / 2} ${h / 2}`, onComplete: () => void (busy.current = false) },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, ppf > 0])

  const seeToScale = () => {
    setPick({ model: model.id, size: 0 })
    scrollToId('models')
  }

  const dim = 'rgb(10 26 36 / 0.5)'
  const fs = w < 520 ? 13 : 15
  return (
    <div className="hero-pool" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div ref={ref} className="relative aspect-[16/11] w-full sm:aspect-[16/10]">
        {ppf ? (
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 overflow-visible" role="img" aria-label={`${model.name}, ${feet(size.l)} by ${feet(size.w)}, seen from above in ${fin.name}`}>
            <defs>
              {/* une grille d'un pied, calée sur le coin du bassin, qui s'estompe vers les bords */}
              <pattern id="hero-ft" width={ppf} height={ppf} patternUnits="userSpaceOnUse" x={x} y={y}>
                <path d={`M${ppf} 0V${ppf}M0 ${ppf}H${ppf}`} fill="none" stroke="rgb(10 26 36 / 0.07)" strokeWidth={1} />
              </pattern>
              <radialGradient id="hero-fade">
                <stop offset="0.55" stopColor="#fff" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <mask id="hero-grid-mask">
                <ellipse cx={x + L / 2} cy={y + W / 2} rx={L / 2 + ppf * 5} ry={W / 2 + ppf * 4.5} fill="url(#hero-fade)" />
              </mask>
              <clipPath id="hero-reveal">
                <rect ref={reveal} x={-20} y={-20} width={entered ? w + 40 : 0} height={h + 40} />
              </clipPath>
            </defs>
            <g clipPath="url(#hero-reveal)">
              <g ref={pool} key={index}>
                <rect x={x - ppf * 6} y={y - ppf * 6} width={L + ppf * 12} height={W + ppf * 12} fill="url(#hero-ft)" mask="url(#hero-grid-mask)" />
                <PoolPlan model={model} size={size} finish={item.finish} ppf={ppf} x={x} y={y} />
                {/* les cotes, comme sur un plan : la longueur au-dessus, la largeur à gauche */}
                <g stroke={dim} strokeWidth={1} fill="none">
                  <path d={`M${x} ${y - 26}H${x + L}M${x} ${y - 32}V${y - 20}M${x + L} ${y - 32}V${y - 20}`} />
                  <path d={`M${x - 26} ${y}V${y + W}M${x - 32} ${y}H${x - 20}M${x - 32} ${y + W}H${x - 20}`} />
                </g>
                <g className="tnum" fontSize={fs} fontWeight={600} fill="var(--ink)">
                  <text x={x + L / 2} y={y - 38} textAnchor="middle">
                    {feet(size.l)}
                  </text>
                  {/* la largeur se lit le long de sa cote, comme sur un plan */}
                  <text x={0} y={0} textAnchor="middle" transform={`translate(${x - 36} ${y + W / 2}) rotate(-90)`}>
                    {feet(size.w)}
                  </text>
                </g>
              </g>
            </g>
          </svg>
        ) : null}
      </div>

      {/* légende : le modèle, ses mesures et son coloris ; une barre par bassin, qui se remplit le temps de sa présentation */}
      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div key={index} className="caption-in flex items-center gap-3.5">
          <img src={photo(`chip-${item.finish}`).src} alt="" width={40} height={40} className="size-10 rounded-full shadow-[0_0_0_1px_rgb(10_26_36/0.12)]" />
          <div className="leading-tight">
            <button type="button" onClick={seeToScale} className="ul text-[18px] font-[650] tracking-[-0.01em]">
              {model.name}
            </button>
            <div className="text-[14.5px] text-ink-soft">
              <span className="tnum">
                {feet(size.l)} × {feet(size.w)}
              </span>{' '}
              · {fin.name}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" role="group" aria-label="Pool shapes">
            {SHOW.map((s, i) => (
              <button key={s.model} type="button" onClick={() => i !== index && goTo(i)} aria-label={`Show the ${modelById(s.model).name}`} aria-current={i === index ? 'true' : undefined} className="hero-seg">
                <span
                  className={cn('hero-seg-fill', i === index && !stopped && !paused && entered && 'is-running', i === index && (stopped || paused || !entered) && 'is-held')}
                  style={{ animationDuration: `${HOLD}s` }}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStopped((v) => !v)}
            className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-deck hover:text-ink"
            aria-label={stopped ? 'Play the pool shapes' : 'Pause the pool shapes'}
          >
            {stopped ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
    </div>
  )
}
