// Accueil : le titre, puis leur piscine de Holmes Beach vue à travers un mur de claustras, ces blocs ajourés des maisons
// modernes de la côte. En faisant défiler, les ronds s'élargissent jusqu'à ce que le mur disparaisse et laisse la piscine.
// Si le visiteur a demandé moins d'animations, il n'y a pas de mur et la vidéo attend qu'on la lance.
import { useEffect, useRef } from 'react'

import { motion } from '@/lib/motion'
import { photo } from '@/lib/photos'
import holmes from '@/assets/video/holmes-beach.mp4'

const clamp = (v: number) => Math.min(1, Math.max(0, v))

export function Hero() {
  const wall = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = wall.current
    const v = video.current
    if (!el || !v) return
    if (!motion()) {
      v.controls = true
      return
    }
    v.play().catch(() => {})
    let raf = 0
    let start = 1
    // le mur est grand ouvert quand son haut arrive près du haut de l'écran
    const measure = () => {
      start = Math.max(1, (el.getBoundingClientRect().top + window.scrollY) * 0.9)
    }
    const update = () => {
      raf = 0
      const p = clamp(window.scrollY / start)
      const e = p * p * (3 - 2 * p) // départ et arrivée en douceur
      el.style.setProperty('--r', (0.43 + e * 0.29).toFixed(4))
      el.style.setProperty('--d', (0.1 * (1 - clamp(p / 0.5))).toFixed(4)) // l'ombre s'efface sur la première moitié
      el.style.setProperty('--face', (1 - clamp((p - 0.8) / 0.2)).toFixed(3)) // les derniers éclats s'effacent
      el.toggleAttribute('data-open', p >= 0.999)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onResize = () => {
      measure()
      onScroll()
    }
    measure()
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    // la vidéo ne tourne que quand elle est à l'écran
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {})
      else v.pause()
    })
    io.observe(v)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      io.disconnect()
    }
  }, [])

  return (
    <section id="top" aria-labelledby="hero-title" className="outline-none" tabIndex={-1}>
      <h1 id="hero-title" className="w display pt-[clamp(36px,4.6vw,72px)] pb-[clamp(28px,3.4vw,52px)]">
        <span className="block">Gulf Coast pools,</span>
        <span className="block">built and rebuilt.</span>
      </h1>

      <figure>
        <div ref={wall} className="breeze">
          <video ref={video} src={holmes} poster={photo('hero-poster').src} muted loop playsInline preload="auto" aria-label="The pool and spa of a vacation rental in Holmes Beach after our renovation, with new blue glass waterline tile" />
          <div className="breeze-depth" aria-hidden="true" />
          <div className="breeze-screen" aria-hidden="true" />
        </div>
        <figcaption className="w note mt-3 text-ink-2">Holmes Beach, Anna Maria Island: full resurfacing, new waterline tile and a spa drain repair for a vacation rental.</figcaption>
      </figure>
    </section>
  )
}
