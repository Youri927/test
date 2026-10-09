// Petits outils d'animation, sans bibliothèque : défilement natif, apparitions à l'entrée à l'écran.
// Tout est coupé si le visiteur a demandé moins d'animations : la classe .motion n'est alors pas posée sur <html>.
import { useSyncExternalStore, type MouseEvent } from 'react'

export const motion = () => typeof document !== 'undefined' && document.documentElement.classList.contains('motion')

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (id === 'top') window.scrollTo({ top: 0, behavior: motion() ? 'smooth' : 'auto' })
  else el.scrollIntoView({ behavior: motion() ? 'smooth' : 'auto', block: 'start' })
  // le clavier repart de la section atteinte, comme avec un lien d'ancre classique
  el.focus({ preventScroll: true })
}

// Clic sur un lien d'ancre interne
export function go(e: MouseEvent, id: string) {
  e.preventDefault()
  scrollToId(id)
}

// Les tirages (.print[data-lay]) apparaissent en entrant à l'écran ; la marque est un attribut
// (data-shown), que React ne réécrit pas. Les blocs ajoutés plus tard sont pris en compte au passage.
const REVEAL = '[data-lay]'
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
        { rootMargin: '0px 0px -10% 0px' },
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
