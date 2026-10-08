// La gamme au complet, à la même échelle, répartie en rangées de longueurs à peu près égales (2 à 4 selon la largeur).
import { useMemo } from 'react'

import { PoolPlan } from '@/components/pool-plan'
import { useBox } from '@/components/pool-stage'
import { useChoice } from '@/lib/choice'
import { POOLS, type Model } from '@/lib/pools'

const GAP_FT = 2.2

export function FooterLineup() {
  const [ref, box] = useBox<HTMLDivElement>()
  const { finish } = useChoice()
  const n = box.w < 640 ? 4 : box.w < 1024 ? 3 : 2
  // rangées équilibrées : chaque bassin, du plus long au plus court, va dans la rangée la moins remplie
  const rows = useMemo(() => {
    const sorted = [...POOLS].sort((a, b) => b.sizes[0].l - a.sizes[0].l)
    const rs: { pools: Model[]; len: number }[] = Array.from({ length: n }, () => ({ pools: [], len: 0 }))
    for (const m of sorted) {
      const r = rs.reduce((a, b) => (b.len < a.len ? b : a))
      r.pools.push(m)
      r.len += m.sizes[0].l / 12 + (r.pools.length > 1 ? GAP_FT : 0)
    }
    return rs
  }, [n])
  const longest = Math.max(...rows.map((r) => r.len))
  const ppf = box.w ? box.w / longest : 0
  const H = 16 * ppf
  return (
    <div ref={ref} className="grid gap-[clamp(10px,1.4vw,18px)]" aria-hidden>
      {ppf
        ? rows.map((r, i) => {
            let x = 0
            return (
              <svg key={i} width={box.w} height={Math.ceil(H) + 2} className="block overflow-visible">
                {r.pools.map((m) => {
                  const s = m.sizes[0]
                  const L = (s.l / 12) * ppf
                  const W = (s.w / 12) * ppf
                  const px = x
                  x += L + GAP_FT * ppf
                  return <PoolPlan key={m.id} model={m} size={s} finish={finish} ppf={ppf} x={px} y={H - W + 1} drift={false} lines={false} />
                })}
              </svg>
            )
          })
        : null}
    </div>
  )
}
