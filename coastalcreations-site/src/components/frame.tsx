// Photos et vidéos du site : l'image elle-même (dimensions, version allégée pour les téléphones),
// et la vidéo muette en boucle qui ne se charge et ne joue qu'à l'écran.
import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { motion } from '@/lib/motion'
import { photo, type PhotoId } from '@/lib/photos'

export function Photo({ id, alt, sizes = '100vw', eager = false, className = 'photo', style }: { id: PhotoId; alt: string; sizes?: string; eager?: boolean; className?: string; style?: CSSProperties }) {
  const p = photo(id)
  return <img src={p.src} srcSet={p.srcSet} sizes={p.srcSet ? sizes : undefined} width={p.width} height={p.height} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className={className} style={style} />
}

// Si le visiteur a demandé moins d'animations, la vidéo reste sur sa première image, avec les commandes pour la lancer.
export function LoopVideo({ src, poster, label, className = 'photo' }: { src: string; poster: string; label: string; className?: string }) {
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
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" controls={still} aria-label={label} className={className} />
}
