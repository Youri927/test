// Le logo du cabinet, redessiné en vectoriel d'après leur fichier (tools : tracé potrace, voir README) :
// la couronne, la racine traversée par la courbe, et les sept filets de la vis d'implant.
// Chaque pièce est un tracé séparé, pour pouvoir l'animer (section Implants).
import type { CSSProperties } from 'react'

import L from '@/data/logo.json'

export const LOGO_RATIO = L.w / L.h

export function Logo({ className, title, style }: { className?: string; title?: string; style?: CSSProperties }) {
  return (
    <svg viewBox={`0 0 ${L.w} ${L.h}`} className={className} style={style} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path data-part="crown" d={L.crown} />
      <path data-part="root" d={L.root} />
      {L.threads.map((d, i) => (
        <path key={i} data-part="thread" d={d} />
      ))}
    </svg>
  )
}
