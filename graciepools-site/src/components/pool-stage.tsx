// La scène du comparateur : une grille en pieds avec ses règles, et le bassin choisi posé à l'échelle dans le coin.
// Tous les modèles partent du même coin : la longueur se lit directement sur la règle du haut, la largeur sur celle de gauche.
// Au changement de modèle, le nouveau bassin part de la taille de l'ancien et s'étire jusqu'à la sienne ; les règles suivent.
import { useLayoutEffect, useMemo, useRef, useState } from 'react'

import { PoolPlan, scalePath } from '@/components/pool-plan'
import { gsap, motion } from '@/lib/motion'
import { drawingOf, feet, type FinishId, type Model, type Size } from '@/lib/pools'

type Layer = { key: number; model: Model; size: Size; finish: FinishId }

/** largeur et hauteur d'un élément, suivies au redimensionnement */
export function useBox<T extends Element>() {
  const ref = useRef<T>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const r = e.contentRect
      setBox((b) => (Math.abs(b.w - r.width) < 0.5 && Math.abs(b.h - r.height) < 0.5 ? b : { w: r.width, h: r.height }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, box] as const
}

/** Les bassins affichés : le dernier choisi, et les précédents le temps de leur sortie */
function useLayers(model: Model, size: Size, finish: FinishId) {
  const [layers, setLayers] = useState<Layer[]>(() => [{ key: 0, model, size, finish }])
  const last = layers[layers.length - 1]
  if (last.model !== model || last.size !== size || last.finish !== finish) {
    // nouveau choix : on l'ajoute pendant le rendu (React rejoue aussitôt), les anciens restent jusqu'à la fin de leur sortie
    setLayers([...layers.slice(-2), { key: last.key + 1, model, size, finish }])
  }
  const drop = (key: number) => setLayers((ls) => (ls.length > 1 ? ls.filter((l) => l.key > key || l === ls[ls.length - 1]) : ls))
  return [layers, drop] as const
}

const MAX_FT = 41 // le plus long modèle fait 40 pieds
const DEEP_FT = 16.5 // le plus large en fait 16

export function PoolStage({
  model,
  size,
  finish,
  label,
  caption,
  ghost,
}: {
  model: Model
  size: Size
  finish: FinishId
  label: string
  caption: string
  /** un modèle épinglé pour comparer : son contour reste en pointillés, depuis le même coin */
  ghost?: { model: Model; size: Size } | null
}) {
  const [ref, box] = useBox<HTMLDivElement>()
  const [layers, drop] = useLayers(model, size, finish)
  const groups = useRef(new Map<number, SVGGElement>())
  const bars = useRef<{ top: SVGLineElement | null; left: SVGLineElement | null }>({ top: null, left: null })
  const prev = useRef<{ key: number; l: number; w: number } | null>(null)

  // géométrie : marges pour les règles, puis l'échelle commune à tous les modèles
  const narrow = box.w < 640
  // la légende du bassin occupe la première ligne, la règle du haut la suivante
  const m = { l: narrow ? 30 : 58, t: narrow ? 58 : 82, r: narrow ? 10 : 22, b: narrow ? 12 : 22 }
  const ppf = box.w ? (box.w - m.l - m.r) / MAX_FT : 0
  const height = Math.round(m.t + m.b + DEEP_FT * ppf)
  const L = (size.l / 12) * ppf
  const W = (size.w / 12) * ppf

  // les nombres des règles : tous les 5 pieds (10 sur téléphone)
  const step = narrow ? 10 : 5
  const ticks = useMemo(() => Array.from({ length: Math.floor(MAX_FT) + 1 }, (_, i) => i), [])

  useLayoutEffect(() => {
    if (!ppf) return
    const cur = layers[layers.length - 1]
    const g = groups.current.get(cur.key)
    const from = prev.current
    prev.current = { key: cur.key, l: L, w: W }
    // seul un nouveau choix s'anime ; un redimensionnement de la fenêtre redessine simplement
    const animate = motion() && from && from.key !== cur.key && layers.length > 1
    const sameSize = from && Math.abs(from.l - L) < 0.5 && Math.abs(from.w - W) < 0.5
    // les règles : la barre claire s'allonge ou se raccourcit jusqu'à la nouvelle mesure
    const { top, left } = bars.current
    if (top && left && animate && !sameSize) {
      // les extrémités des barres vont de l'ancienne mesure à la nouvelle
      gsap.fromTo(top, { attr: { x2: m.l + from.l } }, { attr: { x2: m.l + L }, duration: 0.95, ease: 'expo.out' })
      gsap.fromTo(left, { attr: { y2: m.t + from.w } }, { attr: { y2: m.t + W }, duration: 0.95, ease: 'expo.out' })
    }
    if (!g) return
    const olds = layers.slice(0, -1).map((l) => groups.current.get(l.key)).filter(Boolean) as SVGGElement[]
    if (!animate) {
      layers.slice(0, -1).forEach((l) => drop(l.key))
      return
    }
    const origin = `${m.l} ${m.t}`
    if (sameSize) {
      // même bassin, autre coloris : fondu enchaîné
      gsap.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: 'power2.out', onComplete: () => drop(cur.key - 1) })
    } else {
      gsap.fromTo(
        g,
        { scaleX: from.l / L, scaleY: from.w / W, opacity: 0, svgOrigin: origin },
        { scaleX: 1, scaleY: 1, opacity: 1, duration: 0.95, ease: 'expo.out', svgOrigin: origin, onComplete: () => drop(cur.key - 1) },
      )
      olds.forEach((o) => gsap.to(o, { scaleX: L / from.l, scaleY: W / from.w, opacity: 0, duration: 0.55, ease: 'power2.out', svgOrigin: origin }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, ppf])

  return (
    <div ref={ref} className="relative w-full" style={{ height: height || undefined, minHeight: box.w ? undefined : 260 }}>
      {ppf ? (
        <svg width={box.w} height={height} viewBox={`0 0 ${box.w} ${height}`} className="block" role="img" aria-label={label}>
          <defs>
            <pattern id="ft" width={ppf} height={ppf} patternUnits="userSpaceOnUse" x={m.l} y={m.t}>
              <path d={`M${ppf} 0V${ppf}M0 ${ppf}H${ppf}`} fill="none" stroke="rgb(255 255 255 / 0.045)" strokeWidth={1} />
            </pattern>
            <pattern id="ft5" width={ppf * 5} height={ppf * 5} patternUnits="userSpaceOnUse" x={m.l} y={m.t}>
              <path d={`M${ppf * 5} 0V${ppf * 5}M0 ${ppf * 5}H${ppf * 5}`} fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth={1} />
            </pattern>
          </defs>
          {/* le bassin affiché et ses mesures */}
          <text key={caption} x={m.l} y={narrow ? 16 : 22} className="tnum stage-caption" fill="#fff" fontSize={narrow ? 14 : 17} fontWeight={640}>
            {caption}
          </text>
          {/* la grille : un pied, et cinq pieds en plus marqué */}
          <rect x={m.l} y={m.t} width={MAX_FT * ppf} height={DEEP_FT * ppf} fill="url(#ft)" />
          <rect x={m.l} y={m.t} width={MAX_FT * ppf} height={DEEP_FT * ppf} fill="url(#ft5)" />

          {/* règle du haut */}
          <g className="tnum" fontSize={narrow ? 10.5 : 12} fill="rgb(255 255 255 / 0.5)">
            <line x1={m.l} x2={m.l + MAX_FT * ppf} y1={m.t - 10} y2={m.t - 10} stroke="rgb(255 255 255 / 0.18)" />
            {ticks.map((t) => (
              <line key={t} x1={m.l + t * ppf} x2={m.l + t * ppf} y1={m.t - 10} y2={m.t - (t % 5 ? 13 : 17)} stroke="rgb(255 255 255 / 0.28)" />
            ))}
            {ticks
              .filter((t) => t % step === 0)
              .map((t) => (
                <text key={t} x={m.l + t * ppf} y={m.t - 22} textAnchor={t ? 'middle' : 'start'}>
                  {t ? (t === 40 ? '40 ft' : t) : 0}
                </text>
              ))}
          </g>
          {/* règle de gauche */}
          <g className="tnum" fontSize={narrow ? 10.5 : 12} fill="rgb(255 255 255 / 0.5)">
            <line y1={m.t} y2={m.t + DEEP_FT * ppf} x1={m.l - 10} x2={m.l - 10} stroke="rgb(255 255 255 / 0.18)" />
            {ticks
              .filter((t) => t <= DEEP_FT)
              .map((t) => (
                <line key={t} y1={m.t + t * ppf} y2={m.t + t * ppf} x1={m.l - 10} x2={m.l - (t % 5 ? 13 : 17)} stroke="rgb(255 255 255 / 0.28)" />
              ))}
            {ticks
              .filter((t) => t <= DEEP_FT && t % step === 0 && t)
              .map((t) => (
                <text key={t} y={m.t + t * ppf + 4} x={m.l - 22} textAnchor="end">
                  {t}
                </text>
              ))}
          </g>

          {/* la mesure du bassin sur les règles */}
          <line ref={(el) => void (bars.current.top = el)} x1={m.l} x2={m.l + L} y1={m.t - 10} y2={m.t - 10} stroke="var(--water)" strokeWidth={3} strokeLinecap="butt" />
          <line ref={(el) => void (bars.current.left = el)} y1={m.t} y2={m.t + W} x1={m.l - 10} x2={m.l - 10} stroke="var(--water)" strokeWidth={3} strokeLinecap="butt" />

          {/* les bassins */}
          {layers.map((ly) => (
            <g
              key={ly.key}
              ref={(el) => {
                if (el) groups.current.set(ly.key, el)
                else groups.current.delete(ly.key)
              }}
            >
              <PoolPlan model={ly.model} size={ly.size} finish={ly.finish} ppf={ppf} x={m.l} y={m.t} />
            </g>
          ))}

          {ghost ? <Ghost ghost={ghost} ppf={ppf} x={m.l} y={m.t} narrow={narrow} /> : null}
        </svg>
      ) : null}
    </div>
  )
}

function Ghost({ ghost, ppf, x, y, narrow }: { ghost: { model: Model; size: Size }; ppf: number; x: number; y: number; narrow: boolean }) {
  const L = (ghost.size.l / 12) * ppf
  const W = (ghost.size.w / 12) * ppf
  const d = useMemo(() => scalePath(drawingOf(ghost.model, ghost.size).regions[0].d, L / 1000, W / 1000), [ghost, L, W])
  return (
    <g className="ghost-in" pointerEvents="none">
      <path d={d} transform={`translate(${x} ${y})`} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={1.5} strokeDasharray="6 5" />
      <text x={x + L - 6} y={y + W - 8} textAnchor="end" fontSize={narrow ? 11.5 : 13} fontWeight={640} fill="#fff" stroke="#0e2330" strokeWidth={4} paintOrder="stroke" className="tnum">
        {ghost.model.name} {feet(ghost.size.l)}
      </text>
    </g>
  )
}
