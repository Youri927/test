// Défilement fluide (Lenis) synchronisé avec GSAP ScrollTrigger, et petits outils d'animation.
// Tout est coupé si le visiteur a demandé moins d'animations : la classe .motion n'est alors pas posée sur <html>.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect, useSyncExternalStore, type DependencyList, type MouseEvent, type RefObject } from 'react'

gsap.registerPlugin(ScrollTrigger)

export const motion = () => typeof document !== 'undefined' && document.documentElement.classList.contains('motion')

let lenis: Lenis | null = null

export function startSmoothScroll() {
  if (!motion() || lenis) return lenis
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  remeasureOnResize()
  return lenis
}

// ScrollTrigger mesure ses positions une fois : on les remesure quand la page change de hauteur
// (police chargée après le premier affichage, onglet changé, etc.), sinon les animations au défilement se décalent.
function remeasureOnResize() {
  let height = document.body.offsetHeight
  let timer = 0
  new ResizeObserver(() => {
    if (document.body.offsetHeight === height) return
    height = document.body.offsetHeight
    clearTimeout(timer)
    timer = window.setTimeout(() => ScrollTrigger.refresh(), 150)
  }).observe(document.body)
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
  // le clavier repart de la section atteinte, comme avec un lien d'ancre classique
  el.focus({ preventScroll: true })
}

// Clic sur un lien d'ancre interne : défilement fluide au lieu du saut du navigateur
export function go(e: MouseEvent, id: string) {
  e.preventDefault()
  scrollToId(id)
}

// Animations liées au défilement d'un bloc : créées dans un contexte GSAP limité au bloc (q cherche dedans),
// défaites au démontage ; rien du tout si le visiteur a demandé moins d'animations.
// Chaque bloc est préparé dans sa propre tâche (later) : le chargement de la page n'est pas bloqué d'un seul tenant.
export function useScrollAnim(ref: RefObject<HTMLElement | null>, build: (q: (selector: string) => HTMLElement[]) => void | (() => void), deps: DependencyList = []) {
  useEffect(() => {
    const el = ref.current
    if (!el || !motion()) return
    let cleanup: void | (() => void)
    let ctx: gsap.Context | undefined
    const cancel = later(() => {
      ctx = gsap.context(() => {
        cleanup = build((selector) => gsap.utils.toArray<HTMLElement>(selector, el))
      }, el)
    })
    return () => {
      cancel()
      cleanup?.()
      ctx?.revert()
    }
  }, deps)
}

// Lance une fonction dans une tâche à part, dès que possible ; renvoie de quoi l'annuler
export function later(fn: () => void) {
  const id = window.setTimeout(fn, 0)
  return () => window.clearTimeout(id)
}

// Fait apparaître [data-up], les cages (data-up-cage) et .years quand ils entrent à l'écran. La marque est un attribut (data-shown) :
// React réécrit la classe d'un élément quand son état change, il effacerait une classe ajoutée ici.
// Les blocs ajoutés plus tard (une section qui change de version après le chargement) sont pris en compte au passage.
const REVEAL = '[data-up], [data-up-cage], .years'
export function watchReveals(root: HTMLElement = document.body) {
  const io = motion()
    ? new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue
            e.target.setAttribute('data-shown', '')
            io?.unobserve(e.target)
          }
        },
        { rootMargin: '0px 0px -8% 0px' },
      )
    : null
  const watch = (t: Element) => {
    if (t.hasAttribute('data-shown')) return
    if (io) io.observe(t)
    else t.setAttribute('data-shown', '')
  }
  root.querySelectorAll(REVEAL).forEach(watch)
  const mo = new MutationObserver((records) => {
    for (const r of records)
      r.addedNodes.forEach((n) => {
        if (!(n instanceof Element)) return
        if (n.matches(REVEAL)) watch(n)
        n.querySelectorAll(REVEAL).forEach(watch)
      })
  })
  mo.observe(root, { childList: true, subtree: true })
  return () => {
    io?.disconnect()
    mo.disconnect()
  }
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
