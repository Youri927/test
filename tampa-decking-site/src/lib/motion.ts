// Défilement fluide (Lenis) synchronisé avec GSAP ScrollTrigger, et petits outils d'animation.
// Tout est coupé si le visiteur a demandé moins d'animations : la classe .motion n'est alors pas posée sur <html>.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useSyncExternalStore } from 'react'

gsap.registerPlugin(ScrollTrigger)

export const motion = () => typeof document !== 'undefined' && document.documentElement.classList.contains('motion')

let lenis: Lenis | null = null

export function startSmoothScroll() {
  if (!motion() || lenis) return lenis
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export const pauseScroll = (paused: boolean) => (paused ? lenis?.stop() : lenis?.start())

export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.4 })
  else window.scrollTo({ top: y, behavior: 'auto' })
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  // la hauteur de l'en-tête est déjà réservée par scroll-padding-top (index.css), que Lenis respecte
  if (lenis) lenis.scrollTo(id === 'top' ? 0 : el, { duration: 1.4 })
  else el.scrollIntoView({ behavior: 'auto' })
}

// Fait apparaître [data-up], .unveil et .reveal quand ils entrent à l'écran (classe is-in).
export function watchReveals(root: ParentNode = document) {
  const targets = root.querySelectorAll<HTMLElement>('[data-up], .unveil, .reveal')
  if (!motion()) {
    targets.forEach((t) => t.classList.add('is-in'))
    return () => {}
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('is-in')
        io.unobserve(e.target)
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  )
  targets.forEach((t) => io.observe(t))
  return () => io.disconnect()
}

// Côté serveur (page pré-générée), la réponse vaut false ; React la corrige juste après l'hydratation.
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (on) => {
      const m = matchMedia(query)
      m.addEventListener('change', on)
      return () => m.removeEventListener('change', on)
    },
    () => matchMedia(query).matches,
    () => false,
  )
}

export { gsap, ScrollTrigger }
