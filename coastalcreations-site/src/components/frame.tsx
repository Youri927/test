// Photos du site : l'image elle-même (dimensions, version allégée pour les téléphones) et le cadre qui la dévoile
// panneau par panneau à l'entrée à l'écran (la cage, components/cage.tsx).
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

import { Cage } from '@/components/cage'
import { motion } from '@/lib/motion'
import { photo, type PhotoId } from '@/lib/photos'

export function Photo({ id, alt, sizes = '100vw', eager = false, className = '', style }: { id: PhotoId; alt: string; sizes?: string; eager?: boolean; className?: string; style?: CSSProperties }) {
  const p = photo(id)
  return <img src={p.src} srcSet={p.srcSet} sizes={p.srcSet ? sizes : undefined} width={p.width} height={p.height} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className={className} style={style} />
}

type CageOpts = { cols?: number; rows?: number; delay?: number; from?: 'top-left' | 'top-right' | 'bottom-left' }

// Un cadre au format donné (ratio largeur / hauteur), qui se découvre en entrant à l'écran
export function Frame({ id, alt, ratio, sizes, cage = {}, className = '', children }: { id: PhotoId; alt: string; ratio?: number; sizes?: string; cage?: CageOpts | false; className?: string; children?: ReactNode }) {
  return (
    <div className={`frame ${className}`} style={ratio ? { aspectRatio: ratio } : undefined}>
      <Photo id={id} alt={alt} sizes={sizes} />
      {children}
      {cage && <Cage cols={cage.cols ?? 3} rows={cage.rows ?? 3} delay={cage.delay ?? 0} from={cage.from} />}
    </div>
  )
}

// Même cadre pour une vidéo muette en boucle (leurs vidéos de chantier). Elle ne se charge et ne joue qu'à l'écran ;
// si le visiteur a demandé moins d'animations, elle reste sur sa première image, avec les commandes pour la lancer.
export function FrameVideo({ src, poster, label, ratio, cage = {}, className = '' }: { src: string; poster: string; label: string; ratio?: number; cage?: CageOpts | false; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [still, setStill] = useState(false)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (!motion()) {
      setStill(true)
      return
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {})
      else v.pause()
    })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return (
    <div className={`frame ${className}`} style={ratio ? { aspectRatio: ratio } : undefined}>
      <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" controls={still} aria-label={label} />
      {cage && <Cage cols={cage.cols ?? 3} rows={cage.rows ?? 3} delay={cage.delay ?? 0} from={cage.from} />}
    </div>
  )
}
