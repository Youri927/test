// L'accueil : la piscine au bord de l'eau, au crépuscule, lumières éteintes ; la maison, puis les palmiers un à un,
// puis la piscine s'allument. Ensuite, la lumière de la piscine change de couleur au choix (simulée, sauf le violet).
// Les calques (tools/hero.py) sont la photo d'origine là où chaque lumière agit : allumés à fond, ils redonnent la photo.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Phone } from 'lucide-react'
import { RadioGroup } from 'radix-ui'

import scene from '@/assets/hero/hero.json'
import { small } from '@/lib/hero-small'
import { go, motion } from '@/lib/motion'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

const big = import.meta.glob<string>('../assets/hero/*-2560.avif', { eager: true, query: '?url', import: 'default' })
const file = (name: string) => ({ big: big[`../assets/hero/${name}-2560.avif`], small: small[`../assets/hero/${name}-1440.avif`] })

const LIGHTS = [
  { id: 'off', label: 'Off', swatch: '#1b2740' },
  { id: 'violet', label: 'Violet', swatch: '#a35bff' },
  { id: 'blue', label: 'Blue', swatch: '#3f6dff' },
  { id: 'aqua', label: 'Aqua', swatch: '#2ad1e6' },
  { id: 'magenta', label: 'Magenta', swatch: '#ff45bd' },
  { id: 'white', label: 'White', swatch: '#eef1ff' },
] as const
type Light = (typeof LIGHTS)[number]['id']

type Layer = (typeof scene.layers)[number]
const layers = scene.layers as Layer[]
const palms = layers.filter((l) => l.group === 'palms')

// Une image du décor : la grande version sur ordinateur, la version allégée (1440 px) sur téléphone.
function Img({ name, style, className, eager, onReady }: { name: string; style?: CSSProperties; className?: string; eager?: boolean; onReady?: (name: string) => void }) {
  const f = file(name)
  const ref = useRef<HTMLImageElement>(null)
  const cb = useRef(onReady)
  cb.current = onReady
  // prévenu une seule fois, quand l'image est décodée (ou en erreur : on n'attend pas indéfiniment)
  useEffect(() => {
    const img = ref.current
    if (!img || !cb.current) return
    const done = () => cb.current?.(name)
    img.decode().then(done, done)
  }, [name])
  const tag = <img ref={ref} src={f.small ?? f.big} alt="" draggable={false} decoding="async" fetchPriority={eager ? 'high' : undefined} className={className} style={style} />
  return f.small ? (
    <picture className="contents">
      <source media="(min-width: 900px)" srcSet={f.big} />
      {tag}
    </picture>
  ) : (
    tag
  )
}

const box = (l: Layer): CSSProperties => ({ left: `${l.x * 100}%`, top: `${l.y * 100}%`, width: `${l.w * 100}%`, height: `${l.h * 100}%` })

export function Hero() {
  const [light, setLight] = useState<Light>('violet')
  // off : avant l'allumage ; intro : les lumières s'allument l'une après l'autre ; on : réponse immédiate au réglage
  const [phase, setPhase] = useState<'off' | 'intro' | 'on'>('off')
  const pending = useRef(new Set(['house', 'pool-violet', ...palms.map((p) => p.name)]))

  const ready = (name: string) => {
    pending.current.delete(name)
    if (pending.current.size === 0) start()
  }
  const started = useRef(false)
  const start = () => {
    if (started.current) return
    started.current = true
    if (!motion()) return setPhase('on')
    setPhase('intro')
    window.setTimeout(() => setPhase('on'), 3200)
  }
  // filet de sécurité : si un calque tarde, on allume quand même
  useEffect(() => {
    const t = window.setTimeout(start, 2600)
    return () => window.clearTimeout(t)
  }, [])

  const lit = phase !== 'off' && light !== 'off'
  const delay = (s: number) => (phase === 'intro' ? `${s}s` : '0s')
  const note =
    light === 'off'
      ? 'Lights off, as the evening starts.'
      : light === 'violet'
        ? 'Violet is how this pool was photographed.'
        : `${LIGHTS.find((l) => l.id === light)?.label} is simulated on the same photo.`

  return (
    <section id="top" tabIndex={-1} aria-labelledby="hero-title" className="hero on-dark relative bg-night text-white">
      {/* le décor : cadré comme une photo en « cover », point de mire sur la piscine */}
      <div className="hero-frame">
        <div className="hero-scene" aria-hidden="true">
          <Img name="off" eager className="absolute inset-0 size-full" />
          {layers
            .filter((l) => l.group !== 'color')
            .map((l) => {
              const i = palms.indexOf(l)
              const on = l.group === 'pool' ? lit && light === 'violet' : lit
              const d = l.group === 'house' ? 0.25 : l.group === 'palms' ? 0.7 + i * 0.17 : 1.75
              return (
                <Img
                  key={l.name}
                  name={l.name}
                  onReady={ready}
                  className="hero-layer"
                  style={{ ...box(l), opacity: on ? 1 : 0, transitionDelay: delay(d), transitionDuration: phase === 'intro' && l.group === 'pool' ? '1.4s' : undefined }}
                />
              )
            })}
          {phase === 'on' &&
            layers
              .filter((l) => l.group === 'color')
              .map((l) => <Img key={l.name} name={l.name} className="hero-layer" style={{ ...box(l), opacity: lit && light === l.name.replace('pool-', '') ? 1 : 0 }} />)}
        </div>
      </div>

      <div className="hero-copy wrap">
        <h1 id="hero-title" className="hero-title t-hero">
          <span className="ln">
            <span>Custom pools</span>
          </span>
          <span className="ln">
            <span>for the</span>
          </span>
          <span className="ln">
            <span>Emerald Coast</span>
          </span>
        </h1>

        <div className="hero-foot">
          <div className="hero-intro">
            <p className="t-lead hero-up max-w-[34em] text-white/90" style={{ '--d': '1.1s' } as CSSProperties}>
              Designed one-on-one by Rob Abel, in your home, after more than 30 years in the pool industry.
              <span className="hidden sm:inline"> Built to stay easy to care for, with the equipment indoors.</span>
            </p>
            <div className="hero-up mt-7 flex flex-wrap gap-3" style={{ '--d': '1.25s' } as CSSProperties}>
              <a href="#contact" onClick={(e) => go(e, 'contact')} className="btn btn-azure">
                Book an in-home meeting
              </a>
              <a href={`tel:${site.phone.tel}`} className="btn btn-line-dark tnum">
                <Phone aria-hidden="true" />
                {site.phone.display}
              </a>
            </div>
          </div>

          <div className="hero-up hero-light" style={{ '--d': '2.6s' } as CSSProperties}>
            <p id="light-label" className="t-small font-semibold">
              Pool light
            </p>
            <RadioGroup.Root aria-labelledby="light-label" value={light} onValueChange={(v) => setLight(v as Light)} className="mt-3 flex gap-2.5">
              {LIGHTS.map((l) => (
                <RadioGroup.Item
                  key={l.id}
                  value={l.id}
                  aria-label={l.label}
                  title={l.label}
                  className={cn('light-dot', l.id === 'off' && 'light-dot-off')}
                  style={{ '--c': l.swatch } as CSSProperties}
                />
              ))}
            </RadioGroup.Root>
            <p className="t-note mt-3 max-w-[24em] text-white/72 sm:min-h-[2.8em]" aria-live="polite">
              {note} Pool and spa on the water, at dusk.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
