// Coupe technique du bord d'un bassin : plage (revêtement + dalle), margelle, carrelage de ligne d'eau,
// enduit, coque, eau. Chaque couche porte data-layer ; la couche active passe au jaune du logo.
// Les traits ne grossissent pas quand le dessin est zoomé (vector-effect).
import type { LayerId } from '@/data/content'
import { cn } from '@/lib/utils'

const VB_FULL = '0 70 1200 590'
const VB_COMPACT = '440 112 740 520'

type Props = { active: LayerId | null; onSelect?: (id: LayerId) => void; compact?: boolean; className?: string }

const lines = { stroke: 'currentColor', strokeWidth: 1.25, vectorEffect: 'non-scaling-stroke' as const, fill: 'none' }

// Repères avec trait de rappel (version ordinateur)
const labels: { id: LayerId; text: string; anchor: [number, number]; path: string; at: [number, number] }[] = [
  { id: 'deck', text: 'Deck', anchor: [300, 205], path: 'M300 205 V128', at: [313, 138] },
  { id: 'coping', text: 'Coping', anchor: [652, 200], path: 'M652 200 V128', at: [665, 138] },
  { id: 'tile', text: 'Waterline tile', anchor: [681, 272], path: 'M681 272 H846', at: [858, 281] },
  { id: 'finish', text: 'Interior finish', anchor: [703, 505], path: 'M703 505 H846', at: [858, 514] },
]

export function SectionDrawing({ active, onSelect, compact = false, className }: Props) {
  const pick = (id: LayerId) => (onSelect ? { onClick: () => onSelect(id), style: { cursor: 'pointer' } } : {})
  const on = (id: LayerId) => (active === id ? 'is-on' : '')

  return (
    <svg viewBox={compact ? VB_COMPACT : VB_FULL} className={cn('sd block h-auto w-full overflow-visible text-ink', active && 'has-active', className)} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="sd-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.32" />
        </pattern>
        <pattern id="sd-hatch2" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        </pattern>
        <pattern id="sd-gravel" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="4" r="1.6" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
          <circle cx="10" cy="10" r="1.2" fill="currentColor" opacity="0.3" />
          <circle cx="11" cy="3" r="0.8" fill="currentColor" opacity="0.3" />
        </pattern>
        <pattern id="sd-soil" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="6" r="0.9" fill="currentColor" opacity="0.28" />
          <circle cx="15" cy="12" r="0.7" fill="currentColor" opacity="0.24" />
          <circle cx="8" cy="18" r="0.6" fill="currentColor" opacity="0.22" />
        </pattern>
        <pattern id="sd-pebble" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.6" cy="1.8" r="1.1" fill="currentColor" opacity="0.42" />
          <circle cx="4.6" cy="4.4" r="0.9" fill="currentColor" opacity="0.32" />
        </pattern>
      </defs>

      {/* terrain */}
      <g className="sd-part" data-part="ground">
        <path d="M0 324 H600 V452 A156 156 0 0 0 756 608 H900 L1200 668 V720 H0 Z" fill="url(#sd-soil)" />
        <rect x="0" y="284" width="600" height="40" fill="#f6f9fa" />
        <rect x="0" y="284" width="600" height="40" fill="url(#sd-gravel)" />
        <path d="M0 324 H600" {...lines} opacity="0.5" />
      </g>

      {/* coque */}
      <g className="sd-part" data-part="shell">
        <path d="M600 240 V452 A156 156 0 0 0 756 608 H900 L1200 668 V592 L900 532 H756 A80 80 0 0 1 676 452 V240 Z" fill="#f3f7f9" />
        <path d="M600 240 V452 A156 156 0 0 0 756 608 H900 L1200 668 V592 L900 532 H756 A80 80 0 0 1 676 452 V240 Z" fill="url(#sd-hatch2)" />
        <path d="M600 240 V452 A156 156 0 0 0 756 608 H900 L1200 668 V592 L900 532 H756 A80 80 0 0 1 676 452 V240 Z" {...lines} />
      </g>

      {/* eau */}
      <g className="sd-part" data-part="water">
        <path d="M686 252 H1200 V582 L900 522 H756 A70 70 0 0 1 686 452 Z" fill="#e3f0f5" />
        <path d="M686 252 H1200" {...lines} strokeWidth={1.6} />
        <g {...lines} opacity="0.38">
          <path d="M770 300 H850" />
          <path d="M890 330 H1010" />
          <path d="M1080 300 H1150" />
          <path d="M800 380 H860" />
          <path d="M960 420 H1080" />
        </g>
        <path d="M1051 239 H1069 L1060 251 Z" fill="currentColor" />
        <path d="M1053 259 H1067 M1056 265 H1064" {...lines} />
      </g>

      {/* enduit */}
      <g className="sd-part layer" data-layer="finish" {...pick('finish')}>
        <path d="M676 300 V452 A80 80 0 0 0 756 532 H900 L1200 592 V582 L900 522 H756 A70 70 0 0 1 686 452 V300 Z" fill="#c9dce5" />
        <path className={cn('sd-sun', on('finish'))} d="M676 300 V452 A80 80 0 0 0 756 532 H900 L1200 592 V582 L900 522 H756 A70 70 0 0 1 686 452 V300 Z" fill="var(--sun)" />
        <path d="M676 300 V452 A80 80 0 0 0 756 532 H900 L1200 592 V582 L900 522 H756 A70 70 0 0 1 686 452 V300 Z" fill="url(#sd-pebble)" />
        <path d="M686 300 V452 A70 70 0 0 0 756 522 H900 L1200 582" {...lines} />
        {/* zone de clic plus large */}
        <path d="M660 300 V452 A96 96 0 0 0 756 548 H900 L1200 608 V566 L900 506 H756 A54 54 0 0 1 702 452 V300 Z" fill="transparent" />
      </g>

      {/* carrelage de ligne d'eau */}
      <g className="sd-part layer" data-layer="tile" {...pick('tile')}>
        <rect x="676" y="240" width="10" height="60" fill="#3f7fae" />
        <rect className={cn('sd-sun', on('tile'))} x="676" y="240" width="10" height="60" fill="var(--sun)" />
        <path d="M676 250 H686 M676 260 H686 M676 270 H686 M676 280 H686 M676 290 H686" stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.8" />
        <rect x="676" y="240" width="10" height="60" {...lines} />
        <rect x="662" y="236" width="40" height="70" fill="transparent" />
      </g>

      {/* plage : dalle + revêtement */}
      <g className="sd-part layer" data-layer="deck" {...pick('deck')}>
        <rect x="0" y="210" width="594" height="74" fill="#f3f7f9" />
        <rect className={cn('sd-sun sd-sun-soft', on('deck'))} x="0" y="210" width="594" height="74" fill="var(--sun)" />
        <rect x="0" y="210" width="594" height="74" fill="url(#sd-hatch)" />
        <rect x="0" y="200" width="594" height="10" fill="#b9cdd8" />
        <rect className={cn('sd-sun', on('deck'))} x="0" y="200" width="594" height="10" fill="var(--sun)" />
        <path d="M0 200 H594 V284 H0" {...lines} />
        <path d="M0 210 H594" {...lines} opacity="0.6" />
        {/* joint de dilatation */}
        <rect x="594" y="200" width="6" height="84" fill="currentColor" opacity="0.55" />
      </g>

      {/* margelle */}
      <g className="sd-part layer" data-layer="coping" {...pick('coping')}>
        <path d="M600 236 H676 V240 H600 Z" fill="currentColor" opacity="0.35" />
        <path d="M600 196 H688 A20 20 0 0 1 688 236 H600 Z" fill="#e6edf1" />
        <path className={cn('sd-sun', on('coping'))} d="M600 196 H688 A20 20 0 0 1 688 236 H600 Z" fill="var(--sun)" />
        <path d="M600 196 H688 A20 20 0 0 1 688 236 H600 Z" fill="url(#sd-hatch)" opacity="0.6" />
        <path d="M600 196 H688 A20 20 0 0 1 688 236 H600 Z" {...lines} />
        <rect x="596" y="180" width="124" height="62" fill="transparent" />
      </g>

      {/* légendes secondaires */}
      <g className="sd-part sd-notes" data-part="notes" fill="currentColor" fontSize="16" fontWeight="500" opacity="0.66">
        {!compact && <text x="24" y="191">Deck surface</text>}
        {!compact && <text x="24" y="254">Concrete slab</text>}
        {!compact && <text x="24" y="310">Compacted base</text>}
        <text x="638" y="430" transform="rotate(-90 638 430)" textAnchor="middle" dominantBaseline="middle">Pool shell</text>
        <text x="1078" y="246">Water level</text>
      </g>

      {/* repères */}
      {!compact && (
        <g className="sd-part" data-part="labels">
          {labels.map((l) => (
            <g key={l.id} className={cn('sd-label', active === l.id && 'is-on')} {...pick(l.id)}>
              <path d={l.path} {...lines} />
              <circle cx={l.anchor[0]} cy={l.anchor[1]} r="5" className="sd-dot" />
              <text x={l.at[0]} y={l.at[1]} fontSize="27" fill="currentColor" className="sd-label-text">
                {l.text}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* points à toucher (version téléphone) */}
      {compact && (
        <g className="sd-part" data-part="labels">
          {labels.map((l) => (
            <g key={l.id} className={cn('sd-label', active === l.id && 'is-on')} {...pick(l.id)}>
              <circle cx={l.anchor[0] < 420 ? 470 : l.anchor[0]} cy={l.anchor[1]} r="22" fill="transparent" />
              <circle cx={l.anchor[0] < 420 ? 470 : l.anchor[0]} cy={l.anchor[1]} r="7" className="sd-dot" />
            </g>
          ))}
        </g>
      )}
    </svg>
  )
}
