// Un bassin vu de dessus, à l'échelle : le dessin de la fiche Barrier Reef 2025 (margelle, parois, marches, banquettes, fosse),
// rempli avec la vraie texture d'eau du coloris. Les clartés du dessin d'origine sont rejouées par-dessus l'eau
// (une carte de gris en « lumière douce ») : les marches restent claires, la fosse s'assombrit.
import { memo, useId, useMemo } from 'react'

import { photo } from '@/lib/photos'
import { drawingOf, type FinishId, type Model, type Size } from '@/lib/pools'

type Region = {
  d: string
  rule?: 'evenodd'
  tone?: number
  grad?: { x1: number; y1: number; x2: number; y2: number; stops: number[][] }
}

const NUM = /-?\d*\.?\d+(?:e-?\d+)?/g

/** chemin du dessin (cadre de 1000 × 1000) → chemin en pixels, x et y mis à l'échelle séparément */
export function scalePath(d: string, sx: number, sy: number) {
  let k = 0
  return d.replace(NUM, (n) => String(Math.round(parseFloat(n) * (k++ % 2 ? sy : sx) * 10) / 10))
}

/** clarté du dessin d'origine → gris de la carte de relief (0,5 = neutre) */
const gray = (t: number) => {
  const g = Math.round(255 * Math.max(0, Math.min(1, 0.5 + t * 0.4)))
  return `rgb(${g} ${g} ${g})`
}

export type PoolPlanProps = {
  model: Model
  size: Size
  finish: FinishId
  /** pixels par pied */
  ppf: number
  /** coin haut gauche du bassin dans le dessin parent */
  x?: number
  y?: number
  /** l'eau dérive doucement */
  drift?: boolean
  /** filets clairs sur les marches et banquettes */
  lines?: boolean
  coping?: string
}

export const PoolPlan = memo(function PoolPlan({ model, size, finish, ppf, x = 0, y = 0, drift = true, lines = true, coping = 'var(--stone)' }: PoolPlanProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const drawing = drawingOf(model, size)
  const regions = drawing.regions as Region[]
  const L = (size.l / 12) * ppf
  const W = (size.w / 12) * ppf
  const paths = useMemo(() => regions.map((r) => scalePath(r.d, L / 1000, W / 1000)), [regions, L, W])
  // l'eau occupe tout ce qui est dessiné à l'intérieur de la margelle, trous compris (contour précalculé par tools/drawings.py) :
  // dans certains dessins, l'eau claire est la margelle elle-même, vue à travers les trous de la paroi
  const inner = useMemo(() => scalePath(drawing.water, L / 1000, W / 1000), [drawing, L, W])
  const water = photo(`water-${finish}`)
  // la texture garde la même échelle réelle d'un bassin à l'autre : 26 pieds de large au minimum
  const tw = Math.max(L * 1.16, 26 * ppf)
  const th = Math.max((tw * water.height) / water.width, W * 1.16)
  const twide = Math.max(tw, (th * water.width) / water.height)

  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={`${uid}w`}>
          <path d={inner} />
        </clipPath>
        {regions.map((r, i) =>
          r.grad ? (
            <linearGradient key={i} id={`${uid}g${i}`} gradientUnits="userSpaceOnUse" x1={(r.grad.x1 * L) / 1000} y1={(r.grad.y1 * W) / 1000} x2={(r.grad.x2 * L) / 1000} y2={(r.grad.y2 * W) / 1000}>
              {r.grad.stops.map(([o, t]) => (
                <stop key={o} offset={o} stopColor={gray(t)} />
              ))}
            </linearGradient>
          ) : null,
        )}
      </defs>
      {/* la margelle */}
      <path d={paths[0]} fill={coping} fillRule={regions[0].rule ?? 'nonzero'} />
      {/* l'eau, puis le relief du dessin par-dessus */}
      <g clipPath={`url(#${uid}w)`} style={{ isolation: 'isolate' }}>
        <image
          className={drift ? 'water-drift' : undefined}
          href={water.src}
          x={L / 2 - twide / 2}
          y={W / 2 - th / 2}
          width={twide}
          height={th}
          preserveAspectRatio="xMidYMid slice"
        />
        <g style={{ mixBlendMode: 'soft-light' }}>
          {paths.map((d, i) => {
            const r = regions[i]
            return <path key={i} d={d} fillRule={r.rule ?? 'nonzero'} fill={r.grad ? `url(#${uid}g${i})` : gray(r.tone ?? 0)} />
          })}
        </g>
      </g>
      {lines ? (
        <g fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={0.75}>
          {paths.slice(1).map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      ) : null}
      <path d={paths[0]} fill="none" stroke="rgb(10 26 36 / 0.16)" strokeWidth={1} />
    </g>
  )
})
