// La cage : un voile de panneaux (la couleur du fond de la section) qui se lèvent un à un pour découvrir une photo,
// avec des montants blancs qui restent un instant, comme la cage moustiquaire au-dessus des piscines de Floride.
// mode « view » : en CSS, à l'entrée à l'écran (data-shown, posé par watchReveals) ;
// mode « manual » : les panneaux sont animés de l'extérieur (GSAP), par exemple au défilement.
import type { CSSProperties } from 'react'

export function Cage({ cols = 3, rows = 4, mode = 'view', delay = 0, from = 'top-left', className = '' }: { cols?: number; rows?: number; mode?: 'view' | 'manual'; delay?: number; from?: 'top-left' | 'top-right' | 'bottom-left'; className?: string }) {
  const n = cols + rows - 2
  const panels = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // ordre en diagonale depuis le coin de départ
      const k = from === 'top-right' ? cols - 1 - c + r : from === 'bottom-left' ? c + (rows - 1 - r) : c + r
      panels.push(<div key={`${r}-${c}`} className="cage-panel" data-k={k} style={{ '--k': k } as CSSProperties} />)
    }
  }
  const beams = []
  for (let c = 1; c < cols; c++) beams.push(<div key={`v${c}`} className="cage-beam v" style={{ left: `${(c / cols) * 100}%` }} />)
  for (let r = 1; r < rows; r++) beams.push(<div key={`h${r}`} className="cage-beam h" style={{ top: `${(r / rows) * 100}%` }} />)
  return (
    <div className={`cage ${className}`} aria-hidden="true" data-mode={mode} {...(mode === 'view' ? { 'data-up-cage': '' } : {})} style={{ '--cols': cols, '--rows': rows, '--n': n, '--d0': `${delay}s` } as CSSProperties}>
      <div className="cage-panels">{panels}</div>
      <div className="cage-beams">{beams}</div>
    </div>
  )
}
