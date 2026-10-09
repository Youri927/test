// Deux de leurs piscines, en grand : la piscine aux deux fontaines-motos (leur film, leurs photos de drone),
// puis la piscine et le spa au bord de l'eau, l'après-midi, au crépuscule et la nuit.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Pause, Play } from 'lucide-react'

import { Film, hasFilm } from '@/components/film'
import { Lines } from '@/components/lines'
import { Photo } from '@/components/photo'
import { gsap, motion, useMediaQuery, useScrollAnim } from '@/lib/motion'
import loop from '@/assets/video/fountains.mp4?url'
import loopWebm from '@/assets/video/fountains.webm?url'
import poster from '@/assets/video/fountains-poster.avif?url'

// La boucle des fontaines : elle tourne quand elle est à l'écran ; à l'arrêt si le visiteur a demandé moins d'animations.
function Fountains() {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  useEffect(() => {
    const v = ref.current
    if (!v || !motion()) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !pausedRef.current)
        v.play().then(
          () => setPlaying(true),
          () => {},
        )
      else {
        v.pause()
        setPlaying(false)
      }
    })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) {
      pausedRef.current = false
      setPaused(false)
      v.play().then(
        () => setPlaying(true),
        () => {},
      )
    } else {
      pausedRef.current = true
      setPaused(true)
      v.pause()
      setPlaying(false)
    }
  }
  return (
    <div className="loop relative overflow-hidden bg-night">
      <video
        ref={ref}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label="The two motorcycle fountains running, from our film"
        className="aspect-[16/9] w-full object-cover sm:aspect-[1280/432]"
      >
        {/* le MP4 d'abord, codec déclaré : un navigateur sans H.264 le saute sans le charger et prend le WebM */}
        <source src={loop} type='video/mp4; codecs="avc1.64001F"' />
        <source src={loopWebm} type='video/webm; codecs="vp9"' />
      </video>
      <button type="button" onClick={toggle} className="loop-btn" aria-label={playing ? 'Pause the video' : 'Play the video'} aria-pressed={paused}>
        {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
      </button>
    </div>
  )
}

const MOTO = [
  'Two motorcycles on mosaic-tiled plinths, plumbed as fountains',
  'A sun shelf with three in-pool loungers',
  'Artificial turf to the edge of the paver deck',
  'Room around the water for a ping-pong table and lounge chairs',
]

const WATER = [
  {
    id: 'water-day',
    when: 'Afternoon',
    alt: 'The pool and spa in the afternoon, with the paver deck, palms, the boat docks and the water',
    lights: false,
  },
  {
    id: 'water-dusk',
    when: 'Dusk',
    alt: 'The same pool at dusk, lit blue, with uplit palms along the water',
    lights: true,
  },
  {
    id: 'water-night',
    when: 'Night',
    alt: 'The same pool and spa at night, lit blue and violet, with the palms uplit and the lights across the bay',
    lights: true,
  },
] as const

export function Pools() {
  const bleed = useRef<HTMLDivElement>(null)
  const water = useRef<HTMLDivElement>(null)
  const md = useMediaQuery('(min-width: 768px)')

  // la boucle des fontaines part de la largeur du texte et s'élargit jusqu'aux bords de l'écran en montant
  useScrollAnim(bleed, () => {
    const el = bleed.current!
    const wrap = el.parentElement!
    // l'écart entre le bord de l'écran et la colonne de texte, de chaque côté
    const side = (left: boolean) => {
      const r = wrap.getBoundingClientRect()
      const pad = parseFloat(getComputedStyle(wrap).paddingLeft)
      return `${(left ? r.left : window.innerWidth - r.right) + pad}px`
    }
    gsap.fromTo(
      el,
      { '--cl': () => side(true), '--cr': () => side(false), '--lr': '6px' },
      { '--cl': '0px', '--cr': '0px', '--lr': '0px', ease: 'none', scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 22%', scrub: true, invalidateOnRefresh: true } },
    )
  })

  // l'après-midi, le crépuscule et la nuit montent à des vitesses différentes, comme le temps qui passe (à partir de la tablette)
  useScrollAnim(
    water,
    (q) => {
      if (!md) return
      q('figure').forEach((f, i) => {
        gsap.fromTo(f, { y: i * 48 }, { y: -i * 48, ease: 'none', scrollTrigger: { trigger: water.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    },
    [md],
  )

  return (
    <section id="pools" aria-labelledby="pools-title" tabIndex={-1} className="bg-white pb-[clamp(88px,11vw,176px)] pt-[clamp(80px,10vw,160px)]">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
          <Lines id="pools-title" className="t-h2 max-w-[8.5em]">
            Two motorcycles, two fountains
          </Lines>
          <p className="t-lead max-w-[25em] text-ink-soft" data-up>
            A rectangular pool where two motorcycles pour into the water.
          </p>
        </div>

        <div ref={bleed} className="loop-bleed mt-12 md:mt-16">
          <Fountains />
        </div>

        <div className="mt-[var(--gutter)] grid gap-[var(--gutter)] md:grid-cols-12">
          <Photo
            id="moto-arc"
            alt="The motorcycle painted with the flag, on its tiled plinth, pouring water into the pool, with turf and a ping-pong table behind"
            className="aspect-[16/10] rounded-md md:col-span-8"
            sizes="(min-width: 768px) 64vw, 92vw"
            parallax
          />
          <Photo
            id="moto-top"
            alt="The pool from straight above: the sun shelf with three loungers, the two motorcycles, the turf, an umbrella and a ping-pong table"
            className="aspect-[4/5] rounded-md md:col-span-4 md:aspect-auto"
            sizes="(min-width: 768px) 30vw, 92vw"
            parallax
            style={{ '--d': '0.12s' } as CSSProperties}
          />
        </div>

        <div className="mt-12 grid gap-x-[var(--gutter)] gap-y-10 md:grid-cols-12">
          <ul className="grid content-start gap-4 md:col-span-5 lg:col-span-4">
            {MOTO.map((m, i) => (
              <li key={m} className="t-lead border-t border-navy/15 pt-4" data-up style={{ '--d': `${i * 0.07}s` } as CSSProperties}>
                {m}
              </li>
            ))}
            {hasFilm && (
              <li className="pt-4" data-up>
                <Film />
              </li>
            )}
          </ul>
          <div className="grid gap-[var(--gutter)] sm:grid-cols-2 md:col-span-7 lg:col-span-8">
            <Photo
              id="moto-pool"
              alt="The pool at ground level, with the sun shelf loungers and both motorcycles at the far end"
              className="aspect-[4/3] rounded-md"
              sizes="(min-width: 768px) 30vw, 92vw"
            />
            <figure>
              <Photo
                id="moto-night"
                alt="The same pool at night, the water lit violet and a motorcycle fountain pouring"
                className="lights-on-frame aspect-[4/3] rounded-md"
                lightsOn
                sizes="(min-width: 768px) 30vw, 92vw"
              />
              <figcaption className="t-note mt-3 text-ink-soft">After dark.</figcaption>
            </figure>
          </div>
        </div>
      </div>

      <div className="wrap mt-[clamp(96px,12vw,190px)]">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
          <Lines as="h3" className="t-h2 max-w-[8em]">
            On the water, after sunset
          </Lines>
          <p className="t-lead max-w-[25em] text-ink-soft" data-up>
            A pool and spa on a waterfront lot, with color lights, uplit palms and a paver deck facing the docks. The pool from the top of the page.
          </p>
        </div>
        <div ref={water} className="mt-12 grid gap-[var(--gutter)] md:mt-16 md:grid-cols-3">
          {WATER.map((w, i) => (
            <figure key={w.id}>
              <Photo
                id={w.id}
                alt={w.alt}
                lightsOn={w.lights}
                className="aspect-[4/5] rounded-md md:aspect-[3/4]"
                sizes="(min-width: 768px) 31vw, 92vw"
                style={{ '--d': `${0.15 + i * 0.2}s` } as CSSProperties}
              />
              <figcaption className="t-h4 mt-4">{w.when}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
