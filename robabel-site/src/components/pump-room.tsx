// Le local technique, présenté comme le circuit de l'eau : de la piscine à la pompe, au filtre, au régulateur,
// à l'UV, à la pompe à chaleur et à l'électrolyseur, puis retour à la piscine.
// Au défilement, l'eau avance dans le tuyau et chaque appareil s'allume quand elle l'atteint.
// La tuyauterie se choisit comme sur leur page : PVC schedule 40, schedule 80 ou transparent (on voit alors l'eau et l'UV).
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ToggleGroup } from 'radix-ui'

import { Lines } from '@/components/lines'
import { Photo } from '@/components/photo'
import { gsap, later, motion, ScrollTrigger, useMediaQuery } from '@/lib/motion'
import type { PhotoId } from '@/lib/photos'
import { cn } from '@/lib/utils'

type Pipe = 'clear' | 's40' | 's80'
const PIPES: { id: Pipe; label: string; note: string }[] = [
  {
    id: 's40',
    label: 'Schedule 40',
    note: 'Schedule 40 PVC: the standard white pipe.',
  },
  {
    id: 's80',
    label: 'Schedule 80',
    note: 'Schedule 80 PVC: thicker walled, gray.',
  },
  {
    id: 'clear',
    label: 'Clear PVC',
    note: 'Clear PVC with UV: here is what it looks like.',
  },
]

// Les symboles, dessinés comme sur un schéma de plomberie : le tuyau passe par leur centre (y = 32)
const SYMBOLS: Record<string, ReactNode> = {
  pump: (
    <>
      <circle cx="32" cy="32" r="17" />
      <path d="M24 22 L42 32 L24 42 Z" />
    </>
  ),
  filter: (
    <>
      <path d="M21 50 V22 a11 11 0 0 1 22 0 V50 Z" />
      <path d="M32 11 V6 M27 6 H37" />
      <path d="M21 50 H43" />
    </>
  ),
  controller: (
    <>
      <rect x="18" y="4" width="28" height="18" rx="2" />
      <path d="M23 10 H41 M23 15 H33" />
      <path d="M27 22 V32 M37 22 V32" />
    </>
  ),
  uv: (
    <>
      <rect x="9" y="23" width="46" height="18" rx="9" />
      <path className="sym-lamp" d="M17 32 H47" />
      <path d="M32 23 V15 M27 15 H37" />
    </>
  ),
  heat: (
    <>
      <rect x="15" y="15" width="34" height="34" rx="3" />
      <circle cx="32" cy="32" r="10" />
      <path d="M32 22 V42 M22 32 H42" />
    </>
  ),
  salt: (
    <>
      <rect x="10" y="23" width="44" height="18" rx="9" />
      <path d="M22 26 V38 M28 26 V38 M34 26 V38 M40 26 V38" />
    </>
  ),
}

const STATIONS: {
  id: string
  symbol: keyof typeof SYMBOLS
  name: string
  text: string
  photo: PhotoId
  alt: string
}[] = [
  {
    id: 'pump',
    symbol: 'pump',
    name: 'Pump',
    text: 'Pentair. It circulates the water through the filtration system.',
    photo: 'st-pump',
    alt: 'Two pumps on the floor of the pump room, between the clear pipes',
  },
  {
    id: 'filter',
    symbol: 'filter',
    name: 'Filter',
    text: 'Removes debris and impurities, so the water stays clean and safe to swim in.',
    photo: 'st-filter',
    alt: 'The tan filter tank in the pump room',
  },
  {
    id: 'controller',
    symbol: 'controller',
    name: 'Chemistry controller',
    text: 'Keeps the pH right, and turns the salt system on and off only as needed, like a commercial pool.',
    photo: 'st-controller',
    alt: 'The Precision Control pool and spa chemistry controller on the wall, with its probes',
  },
  {
    id: 'uv',
    symbol: 'uv',
    name: 'UV',
    text: 'Solaxx UV in a clear chamber. Behind clear PVC, you can see it glow.',
    photo: 'st-uv',
    alt: 'The Precision UV panel by Solaxx, with its optimum water conditions',
  },
  {
    id: 'heat',
    symbol: 'heat',
    name: 'Heat pump',
    text: 'Rheem, with chill mode. Outside, set off the ground on a composite pad.',
    photo: 'st-heatpump',
    alt: 'The heat pump outside the pump room, raised on its stand above the gravel',
  },
  {
    id: 'salt',
    symbol: 'salt',
    name: 'Salt system',
    text: 'Solaxx saline, in a clear chamber too: softer water and fewer chemicals.',
    photo: 'st-salt',
    alt: 'The saline system controller above a clear chamber on the pipe',
  },
]

export function PumpRoom() {
  const [pipe, setPipe] = useState<Pipe>('clear')
  const [reached, setReached] = useState(-1)
  const section = useRef<HTMLElement>(null)
  const circuit = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const stick = useRef<HTMLDivElement>(null)
  const wide = useMediaQuery('(min-width: 1024px)')

  // l'eau avance avec le défilement ; chaque appareil s'allume quand elle l'atteint
  useEffect(() => {
    const el = circuit.current
    const tr = track.current
    const sk = stick.current
    if (!el || !tr || !sk) return
    if (!motion()) {
      el.style.setProperty('--flow', '1')
      setReached(STATIONS.length)
      return
    }
    const flow = (p: number) => {
      el.style.setProperty('--flow', p.toFixed(4))
      // les appareils sont répartis régulièrement entre l'entrée et la sortie du tuyau
      setReached(p === 0 ? -1 : Math.floor(p * (STATIONS.length + 1) - 0.35))
    }
    if (!wide) {
      // téléphone et tablette : le circuit est vertical, l'eau suit la lecture
      let st: ScrollTrigger | undefined
      const cancel = later(() => {
        st = ScrollTrigger.create({ trigger: el, start: 'top 70%', end: 'bottom 60%', scrub: 0.6, onUpdate: (s) => flow(s.progress) })
      })
      return () => {
        cancel()
        st?.kill()
      }
    }
    // ordinateur : le circuit et le choix de la tuyauterie restent au milieu de l'écran (position sticky, index.css)
    // le temps d'un écran de défilement, pendant que l'eau parcourt le circuit ; ils repartent une fois le circuit plein
    const measure = () => {
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) || 78
      const h = sk.offsetHeight
      tr.style.setProperty('--ch', `${h}px`)
      tr.style.setProperty('--stick', `${Math.max(header + 24, Math.round((window.innerHeight - h + header) / 2))}px`)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(sk)
    window.addEventListener('resize', measure)
    let st: ScrollTrigger | undefined
    const cancel = later(() => {
      st = ScrollTrigger.create({
        trigger: tr,
        start: () => `top ${parseFloat(tr.style.getPropertyValue('--stick'))}px`,
        end: () => `+=${window.innerHeight}`,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (s) => flow(Math.min(1, s.progress / 0.8)),
      })
    })
    return () => {
      cancel()
      st?.kill()
      ro.disconnect()
      window.removeEventListener('resize', measure)
      tr.style.removeProperty('--ch')
      tr.style.removeProperty('--stick')
    }
  }, [wide])

  // le titre de la section glisse un peu au début : rien d'autre ne bouge sans le visiteur
  useEffect(() => {
    if (!motion() || !section.current) return
    const q = gsap.utils.selector(section.current)
    const t = gsap.fromTo(
      q('.pr-quote'),
      { yPercent: 18 },
      {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: q('.pr-quote')[0],
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    )
    return () => {
      t.scrollTrigger?.kill()
      t.kill()
    }
  }, [])

  const note = PIPES.find((p) => p.id === pipe)?.note

  return (
    <section ref={section} id="pump-room" aria-labelledby="pr-title" tabIndex={-1} className="pump-room on-dark bg-night py-[clamp(88px,11vw,176px)] text-white" data-pipe={pipe}>
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
          <Lines id="pr-title" className="t-h2 max-w-[8em]">
            The room behind the pool
          </Lines>
          <p className="t-lead max-w-[30em] text-white/80" data-up>
            Pool equipment is expensive. Rob moves it indoors, into an air-conditioned pump room: out of the weather and out of view, it lasts far longer. The air conditioner removes moisture and
            keeps a healthy temperature.
          </p>
        </div>

        {/* le circuit (sur ordinateur, sa piste lui laisse un écran de défilement pendant que l'eau coule) */}
        <div ref={track} className="circuit-track mt-14 lg:mt-20">
          <div ref={stick} className="circuit-stick">
            <div className="pipe-row" data-up>
              <p id="pipe-label" className="t-small font-semibold">
                Plumbing
              </p>
              <ToggleGroup.Root type="single" value={pipe} onValueChange={(v) => v && setPipe(v as Pipe)} aria-labelledby="pipe-label" className="pipe-switch">
                {PIPES.map((p) => (
                  <ToggleGroup.Item key={p.id} value={p.id} className="pipe-opt">
                    {p.label}
                  </ToggleGroup.Item>
                ))}
              </ToggleGroup.Root>
              <p className="t-small text-white/70" aria-live="polite">
                {note}
              </p>
            </div>
            <div ref={circuit} className="circuit mt-16 lg:mt-14" style={{ '--n': STATIONS.length } as CSSProperties}>
              <div className="pipe" aria-hidden="true">
                <span className="pipe-water" />
                <span className="pipe-shine" />
              </div>
              <p className="circuit-end circuit-in t-small">From the pool</p>
              <ol className="stations">
                {STATIONS.map((s, i) => (
                  <li key={s.id} className={cn('station', i <= reached && 'is-on', s.id === 'uv' && 'is-uv')}>
                    <svg className="station-sym" viewBox="0 0 64 64" aria-hidden="true">
                      {SYMBOLS[s.symbol]}
                    </svg>
                    <div className="station-body">
                      <Photo id={s.photo} alt={s.alt} unveil={false} className="station-photo aspect-[4/3] rounded-sm" sizes="240px" />
                      <h3 className="station-name mt-5">{s.name}</h3>
                      <p className="station-text t-small mt-2">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="circuit-end circuit-out t-small">Back to the pool, through the returns and the fountains</p>
            </div>
          </div>
        </div>

        {/* la pièce elle-même */}
        <div className="mt-[clamp(80px,9vw,140px)] grid gap-[var(--gutter)] lg:grid-cols-12">
          <Photo
            id="pump-wide"
            alt="Inside a pump room: the filter tank, the pumps, the clear pipes with their valves, and the air conditioner"
            className="aspect-[4/3] rounded-md lg:col-span-5"
            sizes="(min-width: 1024px) 40vw, 92vw"
            parallax
          />
          <figure className="lg:col-span-3">
            <Photo
              id="pump-night"
              alt="A pump room at night: the clear pipes glowing blue under the UV light"
              className="aspect-[4/3] rounded-md lg:aspect-[3/4]"
              lightsOn
              sizes="(min-width: 1024px) 24vw, 92vw"
              position="35% 50%"
            />
            <figcaption className="t-note mt-3 text-white/65">Clear PVC with UV, at night.</figcaption>
          </figure>
          <div className="flex flex-col justify-between gap-10 lg:col-span-4">
            <blockquote className="pr-quote">
              <p className="t-h3">“We don’t install expensive equipment on the ground here in the panhandle.”</p>
              <footer className="t-small mt-4 text-white/65">Custom Pools by Rob Abel</footer>
            </blockquote>
            <div data-up>
              <h3 className="t-h4">Room for the rest</h3>
              <p className="t-small mt-2 text-white/72">The pump room also takes the outdoor surround sound equipment, a small refrigerator, the floats and the test kit.</p>
              <h3 className="t-h4 mt-7">What we install</h3>
              <p className="t-small mt-2 text-white/72">
                Pentair. Rheem heat pumps with chill mode. Solaxx UV and saline systems with clear chambers. Dolphin robotic cleaners, with a service and warranty station. Ledge Loungers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
