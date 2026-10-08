// Implant and Comprehensive Dentistry of Naples : la page suit sa phrase d'ouverture,
// « Implants, same-day crowns and everything in between », puis la sédation, le dentiste et le cabinet.
import { useEffect } from 'react'

import { Dock } from '@/components/dock'
import { Doctor } from '@/components/doctor'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Implants } from '@/components/implants'
import { SameDay } from '@/components/same-day'
import { Sedation } from '@/components/sedation'
import { Situations } from '@/components/situations'
import { TreatmentSheet } from '@/components/treatment-sheet'
import { Visit } from '@/components/visit'
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
        <Implants />
        <SameDay />
        <Situations />
        <Sedation />
        <Doctor />
        <Visit />
      </main>
      <Footer />
      <Dock />
      <TreatmentSheet />
    </>
  )
}
