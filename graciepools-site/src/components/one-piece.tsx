// La coque polyester : fabriquée en usine, posée d'un seul tenant. Leurs arguments, puis le chemin de l'usine au jardin,
// dessiné avec le contour du Coral Sea (textes de fabrication de Barrier Reef, textes de pose de Gracie Pools).
import { useMemo, type CSSProperties } from 'react'

import { Lines } from '@/components/lines'
import { PoolPlan, scalePath } from '@/components/pool-plan'
import { Photo } from '@/components/photo'
import drawings from '@/data/drawings.json'
import { useChoice } from '@/lib/choice'
import { modelById } from '@/lib/pools'

const FACTS = [
  { lead: 'Since 1984', text: 'Barrier Reef has made in-ground fiberglass pools since 1984, and is one of the largest makers in the world.' },
  { lead: 'Lifetime', text: 'Every Barrier Reef shell carries a lifetime limited structural warranty.' },
  { lead: 'Thicker', text: 'Proven gelcoats and vinyl ester resins, in a shell thicker than the industry standard.' },
  { lead: 'Smooth', text: 'A non-porous surface that is easy to keep clean, gentle on dogs’ paws and ready for a saltwater system.' },
]

type Step = { title: string; text: string; draw: 'mold' | 'gelcoat' | 'resin' | 'lugs' | 'template' | 'dig' | 'done' }
const FACTORY: Step[] = [
  { title: 'Mold preparation', text: 'Cleaned like an operating room, so no flaw reaches the shell.', draw: 'mold' },
  { title: 'Three coats of gelcoat', text: 'Each pass is checked before the next one goes on.', draw: 'gelcoat' },
  { title: 'Resin, then fiberglass', text: 'Vinyl ester resin seals the gelcoat, fiberglass builds and reinforces the wall.', draw: 'resin' },
  { title: 'Lifting lugs', text: 'So a crane can lift the finished shell. It ships with its manufacturer’s sheet.', draw: 'lugs' },
]
const YARD: Step[] = [
  { title: 'Template and dig print', text: 'A template the exact size and shape of your pool marks its place.', draw: 'template' },
  { title: 'Dug and compacted', text: 'Dug close to the shape to limit back-fill, compacted so nothing settles.', draw: 'dig' },
  { title: 'Set in one piece', text: 'Then the paver deck, lighting, equipment and saltwater system.', draw: 'done' },
]

export function OnePiece() {
  return (
    <section id="fiberglass" tabIndex={-1} className="relative bg-white">
      <div className="wrap pt-[clamp(64px,8vw,128px)] pb-[clamp(72px,9vw,140px)]">
        <div className="grid gap-x-10 gap-y-6 lg:grid-cols-12 lg:items-end">
          <Lines className="t-h2 lg:col-span-7">Built in a factory, set in one piece</Lines>
          <p className="t-lead text-ink-soft lg:col-span-5" data-up>
            A fiberglass pool arrives finished: one shell, with its steps and benches molded in. It goes in weeks or months faster than a
            pool built on site.
          </p>
        </div>

        <figure className="mt-[clamp(36px,4.5vw,64px)]">
          <Photo id="laguna" alt="A Laguna fiberglass pool with a light concrete deck, a lawn and a pergola" className="aspect-[4/5] rounded-[22px] sm:aspect-[16/9] lg:aspect-[21/9]" sizes="100vw" position="50% 62%" parallax />
          <figcaption className="mt-3 text-[14px] text-ink-soft">Laguna, 29′. Photo: Barrier Reef</figcaption>
        </figure>

        <dl className="mt-[clamp(40px,5vw,72px)] grid gap-x-10 gap-y-9 sm:grid-cols-2 xl:grid-cols-4">
          {FACTS.map((f, i) => (
            <div key={f.lead} data-up style={{ '--d': `${i * 0.07}s` } as CSSProperties} className="border-t border-ink/15 pt-5">
              <dt className="text-[clamp(30px,2.6vw,40px)] leading-none font-[680] tracking-[-0.03em]">{f.lead}</dt>
              <dd className="mt-3 max-w-[22rem] text-[16.5px] leading-[1.5] text-ink-soft">{f.text}</dd>
            </div>
          ))}
        </dl>

        <Journey />
      </div>
    </section>
  )
}

/* ——— De l'usine au jardin ——— */

function Journey() {
  return (
    <div className="mt-[clamp(72px,9vw,140px)]">
      <h3 className="t-h3 max-w-[30rem]" data-up>
        From the factory floor to your backyard
      </h3>
      <div className="mt-9 grid gap-x-6 gap-y-12 xl:grid-cols-[4fr_3fr]">
        <StepGroup label="At the Barrier Reef factory" steps={FACTORY} offset={0} cols="sm:grid-cols-2 md:grid-cols-4" />
        <StepGroup label="In your yard, with Gracie Pools" steps={YARD} offset={FACTORY.length} cols="sm:grid-cols-3" />
      </div>
    </div>
  )
}

function StepGroup({ label, steps, offset, cols }: { label: string; steps: Step[]; offset: number; cols: string }) {
  return (
    <div>
      <p className="border-b border-ink/15 pb-3 text-[15px] font-[600]" data-up>
        {label}
      </p>
      <ol className={`mt-6 grid grid-cols-2 gap-x-5 gap-y-9 ${cols}`}>
        {steps.map((s, i) => (
          <li key={s.title} className="step" data-up style={{ '--d': `${(offset + i) * 0.09}s` } as CSSProperties}>
            <Pictogram kind={s.draw} />
            <p className="mt-4 text-[16.5px] leading-tight font-[640]">{s.title}</p>
            <p className="mt-1.5 text-[15px] leading-[1.45] text-ink-soft">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** Le contour du Coral Sea, à chaque étape : moule, gelcoat, stratification, anneaux, gabarit, fouille, bassin fini */
const PW = 168
const PH = 80
function Pictogram({ kind }: { kind: Step['draw'] }) {
  const { finish } = useChoice()
  const d = drawings['coral-sea']
  const pool = { l: 40, w: 15 + 2 / 12 }
  const ppf = Math.min((PW - 16) / pool.l, (PH - 12) / pool.w)
  const L = pool.l * ppf
  const W = pool.w * ppf
  const x = (PW - L) / 2
  const y = (PH - W) / 2
  const rim = useMemo(() => scalePath(d.regions[0].d, L / 1000, W / 1000), [d, L, W])
  const water = useMemo(() => scalePath(d.water, L / 1000, W / 1000), [d, L, W])
  const coralSea = modelById('coral-sea')
  const ink = 'var(--ink)'
  const inset = (k: number) => `translate(${(L * (1 - k)) / 2} ${(W * (1 - k)) / 2}) scale(${k})`

  return (
    <svg viewBox={`0 0 ${PW} ${PH}`} className="pictogram block h-auto w-full max-w-[220px]" aria-hidden>
      <defs>
        <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0V5" stroke={ink} strokeWidth="1.1" />
        </pattern>
      </defs>
      {kind === 'done' ? (
        <PoolPlan model={coralSea} size={coralSea.sizes[0]} finish={finish} ppf={ppf} x={x} y={y} drift={false} lines={false} />
      ) : (
        <g transform={`translate(${x} ${y})`} fill="none" stroke={ink} strokeWidth="1.3" strokeLinejoin="round">
          {kind === 'mold' && <path d={rim} strokeDasharray="4 3" pathLength={1} className="draw-dash" />}
          {kind === 'gelcoat' &&
            [1, 0.86, 0.72].map((k, i) => <path key={k} d={rim} transform={inset(k)} stroke="var(--water)" vectorEffect="non-scaling-stroke" pathLength={1} className="draw" style={{ '--n': i } as CSSProperties} />)}
          {kind === 'resin' && (
            <>
              <path d={rim} fill={ink} stroke="none" />
              <path d={water} stroke="#fff" strokeOpacity="0.6" strokeWidth="1" pathLength={1} className="draw" />
            </>
          )}
          {kind === 'lugs' && (
            <>
              <path d={rim} pathLength={1} className="draw" />
              {[
                [0.1, 0.24],
                [0.9, 0.2],
                [0.12, 0.78],
                [0.88, 0.8],
              ].map(([u, v]) => (
                <circle key={`${u}${v}`} cx={u * L} cy={v * W} r="3.2" fill="var(--water)" stroke="none" className="pop" />
              ))}
            </>
          )}
          {kind === 'template' && (
            <>
              <path d={rim} strokeDasharray="2 3.5" />
              {[
                [0, 0],
                [L, 0],
                [0, W],
                [L, W],
              ].map(([u, v]) => (
                <path key={`${u}${v}`} d={`M${u - 5} ${v}H${u + 5}M${u} ${v - 5}V${v + 5}`} stroke="var(--water)" strokeWidth="1.6" className="pop" />
              ))}
            </>
          )}
          {kind === 'dig' && (
            <>
              <path d={rim} fill="url(#hatch)" stroke="none" className="fade-in" />
              <path d={rim} pathLength={1} className="draw" />
            </>
          )}
        </g>
      )}
    </svg>
  )
}
