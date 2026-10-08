// Le fond d'une section sombre monte comme un panneau : légèrement en retrait et arrondi quand elle entre à l'écran,
// il s'élargit jusqu'aux bords pendant qu'on défile. Seul ce fond bouge (une transformation), pas le contenu.
import { useEffect, useRef } from 'react'

import { gsap, motion, ScrollTrigger } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function RiseBg({ className, above = '#ffffff', below = '#ffffff' }: { className?: string; above?: string; below?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    const section = el?.parentElement
    if (!el || !section || !motion()) return
    const enter = gsap.fromTo(
      el,
      { scaleX: 0.955, borderRadius: 36 },
      { scaleX: 1, borderRadius: 0, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 25%', scrub: 0.4 } },
    )
    // en sortant par le haut, le panneau se resserre de nouveau
    const leave = gsap.fromTo(
      el,
      { scaleX: 1, borderRadius: 0 },
      { scaleX: 0.955, borderRadius: 36, ease: 'none', immediateRender: false, scrollTrigger: { trigger: section, start: 'bottom 70%', end: 'bottom top', scrub: 0.4 } },
    )
    return () => {
      ;[enter, leave].forEach((t) => {
        t.scrollTrigger?.kill()
        t.kill()
      })
    }
  }, [])
  return (
    <>
      {/* ce qui apparaît sur les côtés pendant que le panneau s'élargit : la couleur des sections voisines */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20" style={{ background: `linear-gradient(${above} 50%, ${below} 50%)` }} />
      <div ref={ref} aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10 bg-ink', className)} />
    </>
  )
}

export { ScrollTrigger }
