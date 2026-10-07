// Défilement fluide (Lenis) synchronisé avec GSAP ScrollTrigger.
// Rien ne s'anime si le visiteur a demandé de réduire les animations.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export const motion = () => document.documentElement.classList.contains('motion')

let lenis: Lenis | null = null

export function startSmoothScroll() {
  if (!motion() || lenis) return lenis
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

// à appeler à l'ouverture d'une fenêtre ou d'un menu, pour bloquer le défilement de la page derrière
export const pauseScroll = (paused: boolean) => (paused ? lenis?.stop() : lenis?.start())

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.4, offset: -40 })
  else el.scrollIntoView({ behavior: motion() ? 'smooth' : 'auto' })
}

export { gsap, ScrollTrigger }
