import { useEffect } from 'react'

import { About } from '@/components/about'
import { Area } from '@/components/area'
import { Build } from '@/components/build'
import { Contact, Footer } from '@/components/contact'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Leaks } from '@/components/leaks'
import { Renovations } from '@/components/renovations'
import { Services } from '@/components/services'
import { Storm } from '@/components/storm'
import { startSmoothScroll, watchReveals } from '@/lib/motion'

export default function App() {
  useEffect(() => {
    startSmoothScroll()
    return watchReveals()
  }, [])
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Services />
        <Build />
        <Renovations />
        <Leaks />
        <Storm />
        <About />
        <Area />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
