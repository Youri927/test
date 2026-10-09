// Construction neuve : leurs 11 étapes, illustrées par leurs photos (la piscine au bord d'un canal, à Bradenton).
// Grand écran : la section reste à l'écran pendant qu'on fait défiler ; à chaque étape, la photo suivante s'installe
// panneau par panneau, en diagonale, comme les panneaux d'une cage qu'on monte, et l'étape en cours s'ouvre dans la liste.
// Téléphone (ou moins d'animations demandées) : les étapes l'une sous l'autre, chacune avec sa photo.
import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { Cage } from '@/components/cage'
import { Frame } from '@/components/frame'
import { Lines } from '@/components/lines'
import { gsap, motion, ScrollTrigger, useMediaQuery, useScrollAnim } from '@/lib/motion'
import { photo } from '@/lib/photos'
import { stages, type Stage } from '@/lib/site'

const COLS = 4
const ROWS = 3
const pad = (n: number) => String(n).padStart(2, '0')
const range = (s: Stage) => (s.steps.length > 1 ? `Steps ${s.steps[0].n}–${s.steps[s.steps.length - 1].n} of 11` : `Step ${s.steps[0].n} of 11`)

export function Build() {
  const wide = useMediaQuery('(min-width: 1024px) and (min-height: 640px)')
  const [animated, setAnimated] = useState(false)
  useEffect(() => setAnimated(motion()), [])

  return (
    <section id="build" className="bg-mist-sec outline-none" aria-labelledby="build-title" tabIndex={-1}>
      <div className={`wrap grid-12 gap-y-6 pt-[var(--section)] ${wide && animated ? 'pb-0' : 'pb-[clamp(48px,6vw,88px)]'}`}>
        <Lines as="h2" id="build-title" className="t-h2 col-span-12 lg:col-span-7">
          Eleven steps. Six to twelve weeks.
        </Lines>
        <p className="t-lead col-span-12 sm:col-span-10 lg:col-span-4 lg:col-start-9 lg:self-end">
          That is a typical new pool with us, from the first drawing to the handover. You get your own schedule and plan when you sign.
        </p>
      </div>
      {wide && animated ? <Pinned /> : <List />}
    </section>
  )
}

// ---------- grand écran ----------

// la photo d'une étape découpée en panneaux : chacun glisse du haut de sa case vers sa place
function Tiles({ id }: { id: Stage['photo'] }) {
  const p = photo(id)
  const tiles = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      tiles.push(
        <div key={`${r}-${c}`} className="tile" style={{ left: `${(c / COLS) * 100}%`, top: `${(r / ROWS) * 100}%`, width: `${100 / COLS}%`, height: `${100 / ROWS}%`, '--c': c, '--r': r } as CSSProperties}>
          <div className="tile-slide" data-k={c + r}>
            <img src={p.src} srcSet={p.srcSet} sizes="(min-width: 1480px) 800px, 56vw" alt="" decoding="async" />
          </div>
        </div>,
      )
  return (
    <div className="tiles" style={{ '--cols': COLS, '--rows': ROWS } as CSSProperties}>
      {tiles}
    </div>
  )
}

function Pinned() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useScrollAnim(ref, (q) => {
    const layers = q('.stage[data-i]')
    const [beams] = q('.build-frame > .cage-beams')
    if (!layers.length || !beams) return
    const TR = 1 // durée d'un changement d'étape (panneaux et décalages compris)
    const HOLD = 1.1 // l'étape reste affichée
    const starts: number[] = []
    let shown = -1
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate() {
        const t = tl.time()
        // l'étape en cours change à mi-chemin de l'installation de sa photo
        let a = 0
        starts.forEach((s, i) => {
          if (t >= s + TR * 0.45) a = i + 1
        })
        if (a !== shown) {
          shown = a
          setActive(a)
        }
        // une fois tous ses panneaux posés, la photo entière les remplace
        layers.forEach((l, i) => {
          const done = t >= starts[i] + TR
          if (done !== l.hasAttribute('data-settled')) l.toggleAttribute('data-settled', done)
        })
      },
    })
    let t = 0.4
    layers.forEach((l) => {
      starts.push(t)
      const slides = l.querySelectorAll<HTMLElement>('.tile-slide')
      tl.to(beams, { opacity: 1, duration: 0.18 }, t)
      // y: 0 des deux côtés : GSAP lit le décalage de départ posé en CSS (-101 %) comme des pixels, il ne doit pas s'ajouter
      tl.fromTo(slides, { y: 0, yPercent: -101 }, { y: 0, yPercent: 0, duration: 0.42, ease: 'power2.out', stagger: (_i: number, el: HTMLElement) => Number(el.dataset.k) * 0.09 }, t)
      tl.to(beams, { opacity: 0, duration: 0.3 }, t + TR - 0.1)
      t += TR + HOLD
    })
    tl.to({}, { duration: 0.2 }, t - 0.2)

    ScrollTrigger.create({
      trigger: ref.current,
      pin: true,
      start: 'top top',
      end: () => `+=${layers.length * window.innerHeight * 0.72}`,
      scrub: 0.5,
      animation: tl,
      invalidateOnRefresh: true,
    })
    // la section épinglée arrive après d'autres animations déjà créées : on remet l'ordre de calcul dans celui de la page
    ScrollTrigger.sort()
    ScrollTrigger.refresh()
  })

  const beams = []
  for (let c = 1; c < COLS; c++) beams.push(<div key={`v${c}`} className="cage-beam v" style={{ left: `${(c / COLS) * 100}%` }} />)
  for (let r = 1; r < ROWS; r++) beams.push(<div key={`h${r}`} className="cage-beam h" style={{ top: `${(r / ROWS) * 100}%` }} />)

  return (
    <div ref={ref} className="build-pin">
      <div className="wrap grid-12 h-full items-start">
        <div className="col-span-5 pr-[clamp(0px,2vw,40px)]">
          <ol className="build-steps" aria-label="The eleven steps of a new pool">
            {stages.map((s, i) =>
              s.steps.map((st) => (
                <li key={st.n} {...(i === active ? { 'data-on': '' } : {})}>
                  <div className="build-step-head">
                    <span className="t-num">{pad(st.n)}</span>
                    <span>{st.name}</span>
                  </div>
                  <div className="build-step-body">
                    <div>
                      <p>{st.text}</p>
                    </div>
                  </div>
                </li>
              )),
            )}
          </ol>
        </div>

        <figure className="col-span-7">
          <div className="build-frame aspect-[4/3] max-h-[calc(100svh-var(--header-h)-108px)] w-full">
            {stages.map((s, i) => (
              <div key={s.id} className="stage" {...(i > 0 ? { 'data-i': i } : { 'data-settled': '' })}>
                <img className="stage-full" src={photo(s.photo).src} srcSet={photo(s.photo).srcSet} sizes="(min-width: 1480px) 800px, 56vw" alt={s.alt} decoding="async" />
                {i > 0 && <Tiles id={s.photo} />}
              </div>
            ))}
            <div className="cage-beams">{beams}</div>
            <Cage cols={COLS} rows={ROWS} />
          </div>
          <figcaption className="mt-3 grid">
            {stages.map((s, i) => (
              <span
                key={s.id}
                aria-hidden={i !== active}
                className="t-note flex justify-between gap-6 text-ink-soft transition-[opacity,transform] duration-500 ease-[var(--ease)] [grid-area:1/1]"
                style={{ opacity: i === active ? 1 : 0, transform: i === active ? 'none' : 'translateY(6px)' }}
              >
                <span>{s.caption}</span>
                <span className="t-label text-navy">{range(s)}</span>
              </span>
            ))}
          </figcaption>
        </figure>
      </div>
    </div>
  )
}

// ---------- téléphone, ou moins d'animations ----------

function List() {
  return (
    <div className="wrap pb-[var(--section)]">
      <ol className="flex flex-col gap-[clamp(56px,8vw,104px)]" aria-label="The eleven steps of a new pool">
        {stages.map((s) => (
          <li key={s.id} className="grid-12 items-start gap-y-5">
            <figure className="col-span-12 md:col-span-6">
              <Frame id={s.photo} alt={s.alt} ratio={4 / 3} sizes="(min-width: 768px) 50vw, 100vw" cage={{ cols: COLS, rows: ROWS }} />
              <figcaption className="t-note mt-2 flex justify-between gap-4 text-ink-soft">
                <span>{s.caption}</span>
                <span className="t-label text-navy">{range(s)}</span>
              </figcaption>
            </figure>
            <div className="col-span-12 md:col-span-6 md:col-start-7 md:pt-1">
              {s.steps.map((st) => (
                <div key={st.n} className="border-t border-line py-4 first:border-t-0 md:first:border-t">
                  <h3 className="t-h4 flex items-baseline gap-3">
                    <span className="t-num w-[22px] flex-none text-[13px]">{pad(st.n)}</span>
                    {st.name}
                  </h3>
                  <p className="t-small mt-2 max-w-[34em] pl-[34px] text-ink-soft">{st.text}</p>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
