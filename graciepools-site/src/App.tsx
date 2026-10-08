// La page : l'accueil, la coque d'un seul tenant, le comparateur à l'échelle, les photos, le béton,
// l'ensemble et le financement, les piscines existantes, les questions, la demande.
import { useEffect } from 'react'

import { Concrete } from '@/components/concrete'
import { Contact } from '@/components/contact'
import { Faq } from '@/components/faq'
import { Footer } from '@/components/footer'
import { Gallery } from '@/components/gallery'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { MobileBar } from '@/components/mobile-bar'
import { OnePiece } from '@/components/one-piece'
import { Package } from '@/components/package'
import { Planner } from '@/components/planner'
import { Service } from '@/components/service'
import { ChoiceProvider } from '@/lib/choice'
import { startSmoothScroll, watchReveals } from '@/lib/motion'

export default function App() {
  useEffect(() => {
    startSmoothScroll()
    return watchReveals()
  }, [])
  return (
    <ChoiceProvider>
      <a href="#models" className="skip-link">
        Skip to the pool models
      </a>
      <Header />
      <main>
        <Hero />
        <OnePiece />
        <Planner />
        <Gallery />
        <Concrete />
        <Package />
        <Service />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <MobileBar />
    </ChoiceProvider>
  )
}
