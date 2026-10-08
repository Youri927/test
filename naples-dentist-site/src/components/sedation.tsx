// La sédation : trois niveaux, et la lumière de la section qui baisse avec eux.
// Au défilement (section épinglée), on passe du protoxyde d'azote à la sédation consciente, puis intraveineuse :
// le fond passe du gris clair au vert profond, puis au presque noir. Un clic sur un niveau y mène directement.
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { Lines } from '@/components/lines'
import { sedationLevels } from '@/data/content'
import { motion, ScrollTrigger, scrollToY } from '@/lib/motion'
import { openSheet } from '@/lib/sheet'
import { cn } from '@/lib/utils'

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export function Sedation() {
  const stage = useRef<HTMLDivElement>(null)
  const trigger = useRef<ScrollTrigger | null>(null)
  const [level, setLevel] = useState(0)

  useEffect(() => {
    const st = stage.current
    if (!st || !motion()) return
    let current = 0
    trigger.current = ScrollTrigger.create({
      trigger: st,
      start: 'top top',
      end: () => `+=${Math.round(innerHeight * (innerWidth >= 1024 ? 2.1 : 1.7))}`,
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        st.style.setProperty('--l2', smooth(0.27, 0.39, p).toFixed(3))
        st.style.setProperty('--l3', smooth(0.6, 0.72, p).toFixed(3))
        st.style.setProperty('--sp', p.toFixed(4))
        const l = p < 0.33 ? 0 : p < 0.66 ? 1 : 2
        if (l !== current) {
          current = l
          setLevel(l)
        }
      },
    })
    return () => {
      trigger.current?.kill()
      trigger.current = null
    }
  }, [])

  // sans animation, les fonds suivent simplement le niveau choisi
  useEffect(() => {
    const st = stage.current
    if (!st || motion()) return
    st.style.setProperty('--l2', level >= 1 ? '1' : '0')
    st.style.setProperty('--l3', level >= 2 ? '1' : '0')
  }, [level])

  const choose = (i: number) => {
    const t = trigger.current
    if (t) scrollToY(t.start + (t.end - t.start) * (i / 3 + 0.17))
    else setLevel(i)
  }

  const L = sedationLevels[level]
  return (
    <section id="sedation" tabIndex={-1} aria-labelledby="sedation-title" className="relative">
      <div ref={stage} className="sed relative overflow-hidden lg:h-[100svh]" data-level={level} style={{ '--l2': 0, '--l3': 0 } as CSSProperties}>
        <span className="sed-bg sed-bg-1" aria-hidden />
        <span className="sed-bg sed-bg-2" aria-hidden />
        <span className="sed-bg sed-bg-3" aria-hidden />

        <div className="wrap relative grid h-full gap-10 pt-[calc(var(--header)+clamp(28px,5vh,64px))] pb-[96px] md:pb-[clamp(36px,6vh,72px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-[clamp(40px,6vw,110px)]">
          <div className="flex flex-col">
            <Lines id="sedation-title" className="t-h2">
              As calm as you need to be
            </Lines>
            <p className="t-lead sed-soft mt-6 max-w-[30rem]">For patients with mild to severe dental anxiety. Dr. Fakhoury is licensed in conscious and IV sedation.</p>

            <div role="radiogroup" aria-label="Sedation level" className="sed-levels mt-8 lg:mt-auto">
              {sedationLevels.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={level === i}
                  onClick={() => choose(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                      e.preventDefault()
                      choose(Math.min(2, i + 1))
                    }
                    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                      e.preventDefault()
                      choose(Math.max(0, i - 1))
                    }
                  }}
                  tabIndex={level === i ? 0 : -1}
                  className={cn('sed-level', level === i && 'is-on')}
                >
                  <span className="sed-level-name">{s.name}</span>
                  <span className="sed-level-aka">{s.aka}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <div className="sed-feel" aria-live="polite">
              <p key={L.id} className="sed-feel-text">
                {L.feel}
              </p>
            </div>
            <p key={`${L.id}-t`} className="sed-feel-sub mt-6 max-w-[30rem] text-[18px] leading-[1.5]">
              <span className="font-[600]">{L.name}.</span> <span className="sed-soft">{L.text}</span>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-current/20 pt-6 text-[15.5px]">
              <span className="sed-soft">All procedures are done in the office.</span>
              <button type="button" onClick={() => openSheet(['sedation'], 'Sedation dentistry', 'sedation')} className="group inline-flex items-center gap-2 font-[600]">
                <span className="ul">Sedation in detail</span>
                <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
