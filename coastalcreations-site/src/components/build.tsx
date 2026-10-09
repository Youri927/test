// Construction neuve : leurs 11 étapes en une rangée de chantier qui défile de côté, au doigt, à la souris (on attrape
// et on tire), au clavier ou avec les flèches. Le titre ouvre la rangée ; un filet dessous indique où l'on en est.
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Photo } from '@/components/frame'
import { stages, type Stage } from '@/lib/site'

const pad = (n: number) => String(n).padStart(2, '0')
const range = (s: Stage) => (s.steps.length > 1 ? `Steps ${s.steps[0].n}–${s.steps[s.steps.length - 1].n} of 11` : `Step ${s.steps[0].n} of 11`)

export function Build() {
  const rail = useRef<HTMLDivElement>(null)
  const [state, setState] = useState({ p: 0, i: 0, start: true, end: false })

  // où l'on en est dans la rangée
  useEffect(() => {
    const el = rail.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = el.scrollWidth - el.clientWidth
      const first = el.querySelector<HTMLElement>('.slide')
      const step = first ? first.offsetWidth + parseFloat(getComputedStyle(first.parentElement!).columnGap || '0') : 1
      const i = Math.min(stages.length - 1, Math.max(0, Math.round(el.scrollLeft / step) - 1))
      setState({ p: max > 0 ? el.scrollLeft / max : 1, i, start: el.scrollLeft < 4, end: el.scrollLeft > max - 4 })
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    el.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])

  // à la souris : on attrape la rangée et on la tire ; un vrai glissé n'ouvre pas de lien
  useEffect(() => {
    const el = rail.current
    if (!el) return
    let x0 = 0
    let s0 = 0
    let moved = false
    let id = -1
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      id = e.pointerId
      x0 = e.clientX
      s0 = el.scrollLeft
      moved = false
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      const dx = e.clientX - x0
      if (!moved && Math.abs(dx) > 5) {
        moved = true
        el.setAttribute('data-drag', '')
        el.setPointerCapture(id)
      }
      if (moved) el.scrollLeft = s0 - dx
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      id = -1
      if (!moved) return
      el.removeAttribute('data-drag')
      // la rangée se cale sur l'étape la plus proche
      const first = el.querySelector<HTMLElement>('.slide')
      const step = first ? first.offsetWidth + parseFloat(getComputedStyle(first.parentElement!).columnGap || '0') : 1
      el.scrollTo({ left: Math.round(el.scrollLeft / step) * step, behavior: 'smooth' })
    }
    const click = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault()
        e.stopPropagation()
        moved = false
      }
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('click', click, true)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('click', click, true)
    }
  }, [])

  const nudge = (dir: 1 | -1) => {
    const el = rail.current
    const first = el?.querySelector<HTMLElement>('.slide')
    if (!el || !first) return
    const step = first.offsetWidth + parseFloat(getComputedStyle(first.parentElement!).columnGap || '0')
    el.scrollTo({ left: (Math.round(el.scrollLeft / step) + dir) * step, behavior: 'smooth' })
  }

  return (
    <section id="build" aria-labelledby="build-title" className="pt-[var(--section)] outline-none" tabIndex={-1}>
      <div ref={rail} className="rail" tabIndex={0} role="region" aria-label="The eleven steps of a new pool. Scroll sideways to see them all.">
        <div className="rail-track">
          <div className="slide slide-text">
            <h2 id="build-title" className="h2">
              Eleven steps,
              <br />
              six to twelve weeks.
            </h2>
            <p className="lead mt-6 text-ink-2">That is a typical new pool with us, from the first drawing to the handover. You get your own schedule and plan when you sign.</p>
          </div>
          <ol>
            {stages.map((s) => (
              <li key={s.id} className="slide">
                <figure>
                  <Photo id={s.photo} alt={s.alt} sizes="(min-width: 1024px) 36vw, 80vw" className="" />
                  <figcaption className="note mt-3 text-ink-2">{s.caption}</figcaption>
                </figure>
                <ol className="mt-5 border-t border-rule">
                  {s.steps.map((st) => (
                    <li key={st.n} className="border-b border-rule py-4">
                      <div className="flex items-baseline gap-4">
                        <span className="num w-[44px] flex-none text-[34px] leading-none text-gulf" aria-hidden="true">
                          {pad(st.n)}
                        </span>
                        <h3 className="h3">
                          <span className="sr-only">Step {st.n}: </span>
                          {st.name}
                        </h3>
                      </div>
                      <p className="small mt-2 pl-[60px] text-ink-2">{st.text}</p>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="w mt-8 flex items-center gap-5">
        <div className="meter flex-1" aria-hidden="true">
          <span style={{ width: `${Math.max(6, state.p * 100)}%` }} />
        </div>
        <span className="label whitespace-nowrap">{range(stages[state.i])}</span>
        <div className="hidden gap-2 md:flex">
          <button type="button" className="arrow" aria-label="Previous steps" disabled={state.start} onClick={() => nudge(-1)}>
            <ArrowLeft aria-hidden="true" className="size-5" />
          </button>
          <button type="button" className="arrow" aria-label="Next steps" disabled={state.end} onClick={() => nudge(1)}>
            <ArrowRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
