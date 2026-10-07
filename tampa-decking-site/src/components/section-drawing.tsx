// Coupe technique du bord d'un bassin : plage (revêtement + dalle), margelle, carrelage de ligne d'eau,
// enduit, coque, eau. Deux calques superposés :
// - le fond, fixe (motifs, traits, légendes) : il n'est jamais retracé pendant les animations ;
// - le dessus, léger et sur sa propre couche : surlignage jaune de la couche active, repères, zones de clic.
// Les traits ne grossissent pas quand le dessin est zoomé (vector-effect).
import type { LayerId } from '@/data/content'
import { cn } from '@/lib/utils'

const VB_FULL = '0 70 1200 590'
const VB_COMPACT = '440 112 740 520'

type Props = { active: LayerId | null; onSelect?: (id: LayerId) => void; compact?: boolean; className?: string }

const lines = { stroke: 'currentColor', strokeWidth: 1.25, vectorEffect: 'non-scaling-stroke' as const, fill: 'none' }

// Formes partagées par les deux calques
const SHAPE = {
  shell: 'M600 240 V452 A156 156 0 0 0 756 608 H900 L1200 668 V592 L900 532 H756 A80 80 0 0 1 676 452 V240 Z',
  water: 'M686 252 H1200 V582 L900 522 H756 A70 70 0 0 1 686 452 Z',
  finish: 'M676 300 V452 A80 80 0 0 0 756 532 H900 L1200 592 V582 L900 522 H756 A70 70 0 0 1 686 452 V300 Z',
  finishFace: 'M686 300 V452 A70 70 0 0 0 756 522 H900 L1200 582',
  coping: 'M600 196 H688 A20 20 0 0 1 688 236 H600 Z',
  tileJoints: 'M676 250 H686 M676 260 H686 M676 270 H686 M676 280 H686 M676 290 H686',
}

// Repères avec trait de rappel (version ordinateur)
const labels: { id: LayerId; text: string; anchor: [number, number]; path: string; at: [number, number] }[] = [
  { id: 'deck', text: 'Deck', anchor: [300, 205], path: 'M300 205 V128', at: [313, 138] },
  { id: 'coping', text: 'Coping', anchor: [652, 200], path: 'M652 200 V128', at: [665, 138] },
  { id: 'tile', text: 'Waterline tile', anchor: [681, 272], path: 'M681 272 H846', at: [858, 281] },
  { id: 'finish', text: 'Interior finish', anchor: [703, 505], path: 'M703 505 H846', at: [858, 514] },
]

// Zones de clic, plus larges que les couches
const hits: Record<LayerId, string> = {
  deck: 'M0 186 H596 V290 H0 Z',
  coping: 'M596 180 H720 V242 H596 Z',
  tile: 'M662 236 H702 V306 H662 Z',
  finish: 'M660 300 V452 A96 96 0 0 0 756 548 H900 L1200 608 V566 L900 506 H756 A54 54 0 0 1 702 452 V300 Z',
}

function Base({ viewBox, compact }: { viewBox: string; compact: boolean }) {
  return (
    <svg viewBox={viewBox} className="block h-auto w-full overflow-visible" focusable="false">
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
        <path d={SHAPE.shell} fill="#f3f7f9" />
        <path d={SHAPE.shell} fill="url(#sd-hatch2)" />
        <path d={SHAPE.shell} {...lines} />
      </g>

      {/* eau */}
      <g className="sd-part" data-part="water">
        <path d={SHAPE.water} fill="#e3f0f5" />
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
      <g className="sd-part" data-part="finish">
        <path d={SHAPE.finish} fill="#c9dce5" />
        <path d={SHAPE.finish} fill="url(#sd-pebble)" />
        <path d={SHAPE.finishFace} {...lines} />
      </g>

      {/* carrelage de ligne d'eau */}
      <g className="sd-part" data-part="tile">
        <rect x="676" y="240" width="10" height="60" fill="#3f7fae" />
        <path d={SHAPE.tileJoints} stroke="#fff" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.8" />
        <rect x="676" y="240" width="10" height="60" {...lines} />
      </g>

      {/* plage : dalle + revêtement, joint de dilatation */}
      <g className="sd-part" data-part="deck">
        <rect x="0" y="210" width="594" height="74" fill="#f3f7f9" />
        <rect x="0" y="210" width="594" height="74" fill="url(#sd-hatch)" />
        <rect x="0" y="200" width="594" height="10" fill="#b9cdd8" />
        <path d="M0 200 H594 V284 H0" {...lines} />
        <path d="M0 210 H594" {...lines} opacity="0.6" />
        <rect x="594" y="200" width="6" height="84" fill="currentColor" opacity="0.55" />
      </g>

      {/* margelle sur son lit de mortier */}
      <g className="sd-part" data-part="coping">
        <path d="M600 236 H676 V240 H600 Z" fill="currentColor" opacity="0.35" />
        <path d={SHAPE.coping} fill="#e6edf1" />
        <path d={SHAPE.coping} fill="url(#sd-hatch)" opacity="0.6" />
        <path d={SHAPE.coping} {...lines} />
      </g>

      {/* légendes secondaires */}
      <g className="sd-part sd-notes" data-part="notes" fill="currentColor" fontSize="16" fontWeight="500" opacity="0.66">
        {!compact && <text x="24" y="191">Deck surface</text>}
        {!compact && <text x="24" y="254">Concrete slab</text>}
        {!compact && <text x="24" y="310">Compacted base</text>}
        <text x="638" y="430" transform="rotate(-90 638 430)" textAnchor="middle" dominantBaseline="middle">Pool shell</text>
        <text x="1043" y="247" textAnchor="end">Water level</text>
      </g>
    </svg>
  )
}

function Top({ viewBox, compact, active, onSelect }: { viewBox: string; compact: boolean; active: LayerId | null; onSelect?: (id: LayerId) => void }) {
  const on = (id: LayerId) => cn('sd-hl', active === id && 'is-on')

  return (
    <svg viewBox={viewBox} className="sd-top absolute inset-0 size-full overflow-visible" focusable="false">
      {/* surlignage : le jaune du logo sous la texture et le trait de la couche */}
      <g className={on('deck')}>
        <rect x="0" y="210" width="594" height="74" fill="var(--sun)" opacity="0.42" />
        <rect x="0" y="210" width="594" height="74" fill="url(#sd-hatch)" />
        <rect x="0" y="200" width="594" height="10" fill="var(--sun)" />
        <path d="M0 200 H594 V284 H0" {...lines} />
        <path d="M0 210 H594" {...lines} opacity="0.6" />
      </g>
      <g className={on('coping')}>
        <path d={SHAPE.coping} fill="var(--sun)" />
        <path d={SHAPE.coping} fill="url(#sd-hatch)" opacity="0.6" />
        <path d={SHAPE.coping} {...lines} />
      </g>
      <g className={on('tile')}>
        <rect x="676" y="240" width="10" height="60" fill="var(--sun)" />
        <path d={SHAPE.tileJoints} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.5" />
        <rect x="676" y="240" width="10" height="60" {...lines} />
      </g>
      <g className={on('finish')}>
        <path d={SHAPE.finish} fill="var(--sun)" />
        <path d={SHAPE.finish} fill="url(#sd-pebble)" />
        <path d={SHAPE.finishFace} {...lines} />
      </g>

      {/* repères (ordinateur) ou points à toucher (téléphone) */}
      <g className="sd-part" data-part="labels">
        {labels.map((l) => {
          const x = compact && l.anchor[0] < 460 ? 490 : l.anchor[0]
          return (
            <g key={l.id} className={cn('sd-label', active === l.id && 'is-on')}>
              {!compact && <path d={l.path} {...lines} />}
              <circle cx={x} cy={l.anchor[1]} r={compact ? 7 : 5} className="sd-dot" />
              {!compact && (
                <text x={l.at[0]} y={l.at[1]} fontSize="27" fill="currentColor" className="sd-label-text">
                  {l.text}
                </text>
              )}
            </g>
          )
        })}
      </g>

      {/* zones de clic */}
      {onSelect &&
        (Object.keys(hits) as LayerId[]).map((id) => (
          <path key={id} d={hits[id]} fill="transparent" className="sd-hit" onClick={() => onSelect(id)} />
        ))}
    </svg>
  )
}

export function SectionDrawing({ active, onSelect, compact = false, className }: Props) {
  const viewBox = compact ? VB_COMPACT : VB_FULL
  return (
    <div className={cn('sd relative text-ink', active && 'has-active', className)} aria-hidden="true">
      <Base viewBox={viewBox} compact={compact} />
      <Top viewBox={viewBox} compact={compact} active={active} onSelect={onSelect} />
    </div>
  )
}
