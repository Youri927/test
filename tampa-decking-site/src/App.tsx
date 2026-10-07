// Tampa Decking & Pools : la page, de la plage jusqu'au grand bain.
import { useEffect } from 'react'

import { About } from '@/components/about'
import { Areas } from '@/components/areas'
import { Care } from '@/components/care'
import { Cost } from '@/components/cost'
import { Dock } from '@/components/dock'
import { Estimate } from '@/components/estimate'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Layers } from '@/components/layers'
import { Surfaces } from '@/components/surfaces'
import { Work } from '@/components/work'
import { ScrollTrigger, startSmoothScroll, watchReveals } from '@/lib/motion'

export default function App() {
  useEffect(() => {
    startSmoothScroll()
    const stop = watchReveals()
    // les positions des déclencheurs dépendent de la police et des photos : on les recalcule une fois tout chargé
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(() => requestAnimationFrame(refresh))
    window.addEventListener('load', refresh)
    document.documentElement.classList.add('is-ready')
    return () => {
      stop()
      window.removeEventListener('load', refresh)
    }
  }, [])

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Layers />
        <Work />
        <Surfaces />
        <Cost />
        <Care />
        <About />
        <Areas />
        <Estimate />
      </main>
      <Footer />
      <Dock />
    </>
  )
}
