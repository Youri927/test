// Titre qui apparaît ligne par ligne quand il entre à l'écran.
// Le découpage se fait sur les vraies lignes affichées, et se refait si la largeur change.
import { useEffect, useRef, type ElementType } from 'react'

export function Lines({ as: Tag = 'h2', children, className = '' }: { as?: ElementType; children: string; className?: string }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const split = () => {
      el.textContent = ''
      const words = children.split(/\s+/).map((w, i, a) => {
        const s = document.createElement('span')
        s.textContent = w + (i < a.length - 1 ? ' ' : '')
        el.appendChild(s)
        return s
      })
      const lines: string[][] = []
      let top: number | null = null
      for (const s of words) {
        if (s.offsetTop !== top) { lines.push([]); top = s.offsetTop }
        lines[lines.length - 1].push(s.textContent ?? '')
      }
      el.innerHTML = lines.map((l, i) => `<span class="ln" aria-hidden="true" style="--i:${i}"><span>${l.join('').trim()}</span></span>`).join('')
    }
    split()
    let w = el.offsetWidth
    const ro = new ResizeObserver(() => { if (el.offsetWidth !== w) { w = el.offsetWidth; split() } })
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect() } }, { rootMargin: '0px 0px -12% 0px' })
    io.observe(el)
    return () => { ro.disconnect(); io.disconnect() }
  }, [children])

  return <Tag ref={ref} className={`lines ${className}`} aria-label={children}>{children}</Tag>
}
