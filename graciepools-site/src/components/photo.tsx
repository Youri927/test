// Une photo du site, recadrée par son conteneur, qui se dévoile de bas en haut en entrant à l'écran.
import { useEffect, useRef, type CSSProperties } from 'react'

import { gsap, motion } from '@/lib/motion'
import { photo, type PhotoId } from '@/lib/photos'
import { cn } from '@/lib/utils'

export function Photo({
  id,
  alt,
  className,
  imgClassName,
  position,
  unveil = true,
  eager = false,
  sizes,
  style,
  parallax = false,
}: {
  id: PhotoId
  alt: string
  className?: string
  imgClassName?: string
  position?: string
  unveil?: boolean
  eager?: boolean
  sizes?: string
  style?: CSSProperties
  /** la photo glisse un peu moins vite que la page */
  parallax?: boolean
}) {
  const p = photo(id)
  const frame = useRef<HTMLDivElement>(null)
  const shift = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!parallax || !motion() || !frame.current || !shift.current) return
    const t = gsap.fromTo(shift.current, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: frame.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    return () => {
      t.scrollTrigger?.kill()
      t.kill()
    }
  }, [parallax])
  const img = (
    <img
      src={p.src}
      width={p.width}
      height={p.height}
      alt={alt}
      sizes={sizes}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('size-full object-cover', imgClassName)}
      style={position ? { objectPosition: position } : undefined}
      draggable={false}
    />
  )
  // la parallaxe déplace un calque intérieur : le dévoilement (CSS) et le glissement (GSAP) ne se marchent pas dessus
  const inner = parallax ? (
    <div className="absolute inset-0">
      <div ref={shift} className="absolute inset-x-0 -inset-y-[6%]">
        {img}
      </div>
    </div>
  ) : (
    img
  )
  return (
    <div ref={frame} className={cn('relative overflow-hidden bg-deck', unveil && 'unveil', className)} style={style}>
      {unveil ? <div className="unveil-in absolute inset-0">{inner}</div> : inner}
    </div>
  )
}
