// L'ouverture : « Implants, same-day crowns and everything in between ».
// Au milieu de la phrase, une pastille montre le sourire du Dr. Fakhoury. Au défilement, elle s'ouvre jusqu'à
// remplir l'écran (son portrait entier), puis son nom apparaît sur le mur, à droite du visage.
// La pastille de départ est un fond CSS (visible avant le JavaScript) ; dès qu'on défile, un calque prend le relais,
// cadré exactement pareil, puis s'agrandit. Tout se fait par transformations : le calque sert de fenêtre (déplacé,
// étiré), la photo reçoit l'échelle inverse ; seuls les coins arrondis du début sont redessinés.
import { ArrowDown, ArrowRight, Phone } from 'lucide-react'
import { Fragment, useEffect, useRef, type CSSProperties } from 'react'

import { OfficeState } from '@/components/office-state'
import { CITY, EMERGENCY, EMERGENCY_SMS, PHONE, PHONE_HREF, STREET, UNIT } from '@/data/content'
import { go, motion, ScrollTrigger } from '@/lib/motion'
import { photo } from '@/lib/photos'

const P = photo('portrait')
// la pastille (en em, dans le titre) et la zone du sourire qu'elle montre (pixels de la photo, même format)
const PILL = { w: 2.12, h: 0.78 }
const CROP = { x: 560, y: 572, w: 980, h: (980 * PILL.h) / PILL.w }
// point de la photo gardé au centre quand elle remplit l'écran (fraction de la largeur et de la hauteur)
const FOCUS = { x: 0.5, y: 0.42 }
// le visage dans la photo (pixels) : bords gauche et droit (oreille comprise), centre
const FACE_LEFT = 660
const FACE_RIGHT = 1500
const FACE_CENTER = 1045

const pillStyle: CSSProperties = {
  width: `${PILL.w}em`,
  height: `${PILL.h}em`,
  backgroundImage: `url(${P.src})`,
  backgroundSize: `${(P.width / CROP.w) * 100}% auto`,
  backgroundPosition: `${(CROP.x / (P.width - CROP.w)) * 100}% ${(CROP.y / (P.height - CROP.h)) * 100}%`,
}

// le titre, mot par mot ; « | » force un retour à la ligne partout, « ¦ » seulement sur téléphone et tablette en portrait
const TITLE = 'Implants, ¦ same-day crowns | ◖◗ and ¦ everything | in between'

type Rect = { x: number; y: number; w: number; h: number }
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

// position d'un élément dans un ancêtre, sans les transformations (les mots sont encore en train de monter)
function offsetWithin(el: HTMLElement, ancestor: HTMLElement): Rect {
  let x = 0
  let y = 0
  let n: HTMLElement | null = el
  while (n && n !== ancestor) {
    x += n.offsetLeft
    y += n.offsetTop
    n = n.offsetParent as HTMLElement | null
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

export function Hero() {
  const stage = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const card = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const st = stage.current
    const pl = pill.current
    const ly = layer.current
    const im = img.current
    const cd = card.current
    if (!st || !pl || !ly || !im || !cd || !motion()) return

    let S: Rect = { x: 0, y: 0, w: 1, h: 1 }
    let T: Rect = { x: 0, y: 0, w: 1, h: 1 }
    let W = 1
    let H = 1
    let k0 = 1
    let k1 = 1
    let F1 = { x: 0, y: 0 }
    const F0 = { x: CROP.x + CROP.w / 2, y: CROP.y + CROP.h / 2 }
    let t = 0
    let shown = false

    const measure = () => {
      W = st.offsetWidth
      H = st.offsetHeight
      S = offsetWithin(pl, st)
      // grand écran en paysage : le nom sur le mur ; téléphone et tablette en portrait : sous la photo
      const wide = W >= 768 && W / H >= 1.05
      cd.dataset.layout = wide ? 'wall' : 'below'
      let ox: number
      let oy: number
      if (wide) {
        // tout l'écran : la photo prend toute la hauteur, le visage à gauche ; à droite, le mur se prolonge
        // (fond du calque de la même couleur que le mur, bord de la photo fondu) et le nom s'y pose
        T = { x: 0, y: 0, w: W, h: H }
        k1 = Math.max(H / P.height, (W * 0.58) / P.width)
        const space = Math.min(Math.max(W * 0.3, 360), 500) + W * 0.04
        ox = Math.max(-FACE_LEFT * k1 * 0.85, Math.min(0, W - space - FACE_RIGHT * k1 - W * 0.03))
        oy = (H - P.height * k1) * FOCUS.y
        const left = ox + FACE_RIGHT * k1 + W * 0.035
        cd.style.setProperty('--card-left', `${Math.round(left)}px`)
        cd.style.setProperty('--card-width', `${Math.round(Math.min(W - left - W * 0.04, 460))}px`)
      } else {
        // téléphone : un cadre en haut, le visage centré, le nom en dessous (le tout dans la hauteur visible)
        const vh = Math.min(H, innerHeight)
        T = { x: 0, y: 0, w: W, h: Math.round(Math.min(W * 1.2, vh - (W >= 768 ? 330 : 250))) }
        k1 = Math.max(T.w / P.width, T.h / P.height)
        ox = Math.min(0, Math.max(T.w - P.width * k1, T.w / 2 - FACE_CENTER * k1))
        oy = (T.h - P.height * k1) * FOCUS.y
        cd.style.setProperty('--card-top', `${T.y + T.h}px`)
      }
      k0 = S.w / CROP.w
      F1 = { x: (T.x + T.w / 2 - ox) / k1, y: (T.y + T.h / 2 - oy) / k1 }
      render()
    }

    const render = () => {
      const e = ease(t)
      // fenêtre D (à l'écran) : le calque, de la taille de l'ouverture, est réduit et déplacé jusqu'à elle ;
      // la photo, à l'intérieur, reçoit l'échelle inverse. Que des transformations : pas de masque à repeindre.
      const D = { x: lerp(S.x, T.x, e), y: lerp(S.y, T.y, e), w: lerp(S.w, T.w, e), h: lerp(S.h, T.h, e) }
      const sx = D.w / W
      const sy = D.h / H
      const k = k0 * Math.pow(k1 / k0, e)
      const fx = lerp(F0.x, F1.x, e)
      const fy = lerp(F0.y, F1.y, e)
      const ox = D.x + D.w / 2 - k * fx
      const oy = D.y + D.h / 2 - k * fy
      ly.style.transform = `translate3d(${D.x.toFixed(2)}px, ${D.y.toFixed(2)}px, 0) scale(${sx.toFixed(5)}, ${sy.toFixed(5)})`
      // la photo est mise en page à demi-taille (voir .hero-img), d'où l'échelle doublée
      im.style.transform = `translate3d(${((ox - D.x) / sx).toFixed(2)}px, ${((oy - D.y) / sy).toFixed(2)}px, 0) scale(${((2 * k) / sx).toFixed(5)}, ${((2 * k) / sy).toFixed(5)})`
      // les bords arrondis de la pastille s'effacent pendant le premier quart de l'ouverture (rayons dans le repère du calque)
      const r = (S.h / 2) * (1 - Math.min(1, e / 0.22))
      ly.style.borderRadius = r > 0.5 ? `${(r / sx).toFixed(1)}px / ${(r / sy).toFixed(1)}px` : '0'
      // relais : le calque n'apparaît qu'une fois le défilement commencé, la pastille se cache derrière lui
      const on = t > 0.0005
      if (on !== shown) {
        shown = on
        ly.style.visibility = on ? 'visible' : 'hidden'
        pl.style.visibility = on ? 'hidden' : 'visible'
      }
    }

    const trigger = ScrollTrigger.create({
      trigger: st,
      start: 'top top',
      end: () => `+=${Math.round(st.offsetHeight * (st.offsetWidth >= 768 ? 1.25 : 1.05))}`,
      pin: true,
      scrub: true,
      onRefresh: measure,
      onUpdate: (self) => {
        // 0 → 0,72 : la photo s'ouvre ; ensuite le nom monte ; la fin laisse le temps de lire
        t = clamp01(self.progress / 0.72)
        render()
        st.style.setProperty('--base', (1 - clamp01((t - 0.3) / 0.45)).toFixed(3))
        const c = clamp01((self.progress - 0.66) / 0.22)
        cd.style.setProperty('--in', c.toFixed(3))
        cd.toggleAttribute('data-on', c > 0.02)
      },
    })
    measure()
    const ro = new ResizeObserver(() => ScrollTrigger.refresh())
    ro.observe(st)
    return () => {
      ro.disconnect()
      trigger.kill()
      ly.style.removeProperty('visibility')
      pl.style.removeProperty('visibility')
    }
  }, [])

  let i = 0
  return (
    <section id="top" aria-label="Implant and Comprehensive Dentistry of Naples" className="hero relative">
      <div ref={stage} className="hero-stage relative flex min-h-[100svh] flex-col bg-white md:h-[100svh] md:min-h-[680px]">
        <div className="wrap hero-fade flex flex-1 flex-col pt-[calc(var(--header)+clamp(24px,5vh,72px))] md:justify-center md:pt-[var(--header)]">
          <div className="relative">
          <h1 className="hero-title t-display relative" aria-label="Implants, same-day crowns and everything in between">
            {TITLE.split(' ').map((tok, k) => {
              if (tok === '|') return <br key={k} />
              if (tok === '¦') return <br key={k} className="br-narrow" />
              const n = i++
              return (
                <Fragment key={k}>
                  <span className="w" aria-hidden style={{ '--i': n } as CSSProperties}>
                    {tok === '◖◗' ? <span ref={pill} className="pill" style={pillStyle} /> : <span>{tok}</span>}
                  </span>{' '}
                </Fragment>
              )
            })}
          </h1>

          <div className="hero-side mt-7 max-w-[30rem] md:mt-10 lg:absolute lg:right-0 lg:mt-0 lg:w-[min(34vw,440px)]">
            <p className="hero-in t-lead" style={{ '--d': '0.55s' } as CSSProperties}>
              Dr. Fady Fakhoury and his team, on Tamiami Trail East. Implant surgery, sedation, and crowns designed and milled in the office.
            </p>
            <div className="hero-in mt-6 flex flex-wrap gap-2.5" style={{ '--d': '0.65s' } as CSSProperties}>
              <a href={PHONE_HREF} className="btn btn-teal">
                <Phone className="size-4" aria-hidden />
                Call {PHONE}
              </a>
              <a href="#visit" onClick={(e) => go(e, 'visit')} className="btn btn-line">
                Request a visit
                <ArrowRight className="arr size-4" aria-hidden />
              </a>
            </div>
          </div>
          </div>
        </div>

        <div className="wrap hero-fade">
          <div className="hero-in grid grid-cols-2 gap-x-6 gap-y-4 border-t-[1.5px] border-ink py-5 text-[14.5px] leading-[1.35] md:grid-cols-4 md:pb-7" style={{ '--d': '0.8s' } as CSSProperties}>
            <OfficeState />
            <div>
              <span className="block font-[600]">{STREET}</span>
              <span className="block text-ink-soft">
                {UNIT}, {CITY}
              </span>
            </div>
            <a href={EMERGENCY_SMS} className="group block">
              <span className="block font-[600]">Emergency line</span>
              <span className="ul text-ink-soft">Text {EMERGENCY}</span>
            </a>
            <a href="#implants" onClick={(e) => go(e, 'implants')} className="group hidden items-center justify-end gap-3 text-right md:flex">
              <span>
                <span className="block font-[600]">Scroll</span>
                <span className="block text-ink-soft">Meet Dr. Fakhoury</span>
              </span>
              <span className="grid size-10 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--ink)] transition-transform duration-500 group-hover:translate-y-1">
                <ArrowDown className="size-4" aria-hidden />
              </span>
            </a>
          </div>
        </div>

        {/* le portrait qui s'ouvre (calque animé) */}
        <div ref={layer} className="hero-layer" aria-hidden>
          <img ref={img} src={P.src} width={P.width} height={P.height} alt="" className="hero-img" style={{ '--hw': `${P.width / 2}px`, '--hh': `${P.height / 2}px` } as CSSProperties} />
        </div>
        <div ref={card} className="hero-card">
          <p className="hero-card-name t-h3">Dr. Fady Fakhoury, DDS</p>
          <p className="hero-card-role">Lead dentist</p>
          <p className="hero-card-text">Born and raised in Michigan, trained at New York University and in New York City hospitals. More than ten years in implant and comprehensive dentistry.</p>
          <a href="#doctor" onClick={(e) => go(e, 'doctor')} className="hero-card-link group inline-flex items-center gap-2 font-[600]">
            <span className="ul">Meet Dr. Fakhoury</span>
            <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  )
}
