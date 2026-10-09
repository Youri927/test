// Chlore ou sel : leur comparatif en sept lignes (page construction), à cocher selon ce qui compte pour soi.
// Le fléau penche du côté qui l'emporte ; à égalité, la question revient à Rob.
import { useState, type CSSProperties } from 'react'
import { ToggleGroup } from 'radix-ui'

import { Lines } from '@/components/lines'
import { cn } from '@/lib/utils'

const POINTS: {
  id: string
  label: string
  side: 'salt' | 'chlorine'
  line: string
}[] = [
  {
    id: 'water',
    label: 'Better water',
    side: 'salt',
    line: 'Salt water pools have better water quality.',
  },
  {
    id: 'upkeep',
    label: 'Easy upkeep',
    side: 'salt',
    line: 'Saltwater pools are easier to maintain.',
  },
  {
    id: 'running',
    label: 'Lower running cost',
    side: 'salt',
    line: 'Saltwater pools have lower running cost.',
  },
  {
    id: 'odor',
    label: 'No odor',
    side: 'salt',
    line: 'Saltwater pools don’t give off an odor.',
  },
  {
    id: 'repairs',
    label: 'Easy repairs',
    side: 'chlorine',
    line: 'Chlorine pools are easier to repair.',
  },
  {
    id: 'corrosion',
    label: 'Less corrosion',
    side: 'chlorine',
    line: 'Chlorine pools are not as corrosive.',
  },
  {
    id: 'upfront',
    label: 'Lower upfront cost',
    side: 'chlorine',
    line: 'Chlorine pools have lower upfront cost.',
  },
]

export function Salt() {
  const [picked, setPicked] = useState<string[]>([])
  const salt = POINTS.filter((p) => p.side === 'salt' && picked.includes(p.id))
  const chlorine = POINTS.filter((p) => p.side === 'chlorine' && picked.includes(p.id))
  const lean = salt.length - chlorine.length
  // l'inclinaison du fléau, en degrés : vers le sel à droite, vers le chlore à gauche
  const tilt = Math.max(-1, Math.min(1, lean / 3)) * 7
  const verdict =
    picked.length === 0
      ? 'Pick what matters to you.'
      : lean > 0
        ? `Salt, ${salt.length} to ${chlorine.length}.`
        : lean < 0
          ? `Chlorine, ${chlorine.length} to ${salt.length}.`
          : 'Even. A question for Rob, at your home.'

  return (
    <section id="salt" aria-labelledby="salt-title" className="on-dark bg-navy py-[clamp(88px,11vw,176px)] text-white">
      <div className="wrap grid gap-x-[var(--gutter)] gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Lines id="salt-title" className="t-h2 max-w-[7em]">
            Chlorine or salt?
          </Lines>
          <p className="t-lead mt-8 max-w-[28em] text-white/80" data-up>
            Rob’s comparison, in seven lines. Pick what matters to you and see which way it leans. With a chemistry controller, the salt system only runs when it is needed.
          </p>
          <ToggleGroup.Root type="multiple" value={picked} onValueChange={setPicked} aria-label="What matters to you" className="mt-10 flex flex-wrap gap-2.5" data-up>
            {POINTS.map((p) => (
              <ToggleGroup.Item key={p.id} value={p.id} className="chip">
                {p.label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>

        <div className="lg:col-span-6 lg:col-start-7" data-up>
          {/* le fléau */}
          <div className="balance" aria-hidden="true" style={{ '--tilt': `${tilt}deg` } as CSSProperties}>
            <div className="balance-beam">
              {(
                [
                  ['Chlorine', chlorine],
                  ['Salt', salt],
                ] as const
              ).map(([name, side]) => (
                <span key={name} className="balance-pan">
                  <span className="balance-weights">
                    {side.map((p) => (
                      <i key={p.id} />
                    ))}
                  </span>
                  <span className="balance-end">{name}</span>
                </span>
              ))}
            </div>
            <span className="balance-post" />
          </div>
          <p className="t-h3 mt-10" aria-live="polite">
            {verdict}
          </p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {(['chlorine', 'salt'] as const).map((side) => (
              <div key={side}>
                <h3 className="t-h4 border-b border-white/15 pb-3">{side === 'salt' ? 'Saltwater' : 'Chlorine'}</h3>
                <ul className="mt-4 grid gap-3">
                  {POINTS.filter((p) => p.side === side).map((p) => (
                    <li key={p.id} className={cn('salt-line t-small', picked.includes(p.id) && 'is-picked')}>
                      {p.line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
