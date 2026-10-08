// Choix exclusif en ligne, avec un repère qui glisse jusqu'à l'option choisie.
// Adapté du « Segmented Control » de kuratlielia sur 21st.dev (défilement horizontal avec fondu des bords,
// navigation au clavier comme une liste d'onglets), sans sa dépendance d'animation : le repère glisse en CSS.
import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from 'react'

import { cn } from '@/lib/utils'

export type Option<T extends string> = { value: T; label: string; count?: number }

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
  label: string
  className?: string
}) {
  const track = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLSpanElement>(null)
  const first = useRef(true)

  // quand les options dépassent, la bande défile sur elle-même ; les bords s'estompent du côté où il en reste
  useLayoutEffect(() => {
    const node = track.current
    if (!node) return
    const edges = () => {
      const rest = node.scrollWidth - node.clientWidth - node.scrollLeft
      node.toggleAttribute('data-fade-start', node.scrollLeft > 1)
      node.toggleAttribute('data-fade-end', rest > 1)
    }
    edges()
    node.addEventListener('scroll', edges, { passive: true })
    const ro = new ResizeObserver(edges)
    ro.observe(node)
    return () => {
      node.removeEventListener('scroll', edges)
      ro.disconnect()
    }
  }, [options.length])

  // le repère se cale sous l'option choisie (et suit les changements de largeur, police chargée comprise)
  useLayoutEffect(() => {
    const node = track.current
    const t = thumb.current
    if (!node || !t) return
    const place = () => {
      const b = node.querySelector<HTMLElement>('[aria-pressed="true"]')
      if (!b) return
      t.style.width = `${b.offsetWidth}px`
      t.style.transform = `translateX(${b.offsetLeft}px)`
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(node)
    document.fonts?.ready.then(place)
    return () => ro.disconnect()
  }, [value, options])

  // l'option choisie reste entièrement visible, avec un peu de marge pour dépasser le fondu
  useEffect(() => {
    const node = track.current
    const b = node?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!node || !b || node.scrollWidth <= node.clientWidth) {
      first.current = false
      return
    }
    const room = 24
    const start = b.offsetLeft - room
    const end = b.offsetLeft + b.offsetWidth + room - node.clientWidth
    const left = node.scrollLeft > start ? start : node.scrollLeft < end ? end : node.scrollLeft
    if (left !== node.scrollLeft) node.scrollTo({ left: Math.max(0, left), behavior: first.current ? 'auto' : 'smooth' })
    first.current = false
  }, [value])

  const index = Math.max(0, options.findIndex((o) => o.value === value))
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1
    const k = e.key
    const to = k === 'ArrowRight' || k === 'ArrowDown' ? (index === last ? 0 : index + 1) : k === 'ArrowLeft' || k === 'ArrowUp' ? (index === 0 ? last : index - 1) : k === 'Home' ? 0 : k === 'End' ? last : -1
    if (to < 0) return
    e.preventDefault()
    onChange(options[to].value)
    track.current?.querySelector<HTMLElement>(`[data-value="${options[to].value}"]`)?.focus({ preventScroll: true })
  }

  return (
    <div role="group" aria-label={label} className={cn('seg', className)}>
      <div ref={track} className="seg-track">
        <span ref={thumb} className="seg-thumb" aria-hidden />
        {options.map((o, i) => (
          <button
            key={o.value}
            type="button"
            data-value={o.value}
            aria-pressed={o.value === value}
            tabIndex={i === index ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={onKeyDown}
            className="seg-btn"
          >
            {o.label}
            {o.count !== undefined ? <span className="seg-count tnum">{o.count}</span> : null}
          </button>
        ))}
      </div>
    </div>
  )
}
