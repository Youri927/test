import { useEffect } from 'react'

import { Area } from '@/components/area'
import { Backyard } from '@/components/backyard'
import { Contact } from '@/components/contact'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { How } from '@/components/how'
import { Pools } from '@/components/pools'
import { PumpRoom } from '@/components/pump-room'
import { Rob } from '@/components/rob'
import { Salt } from '@/components/salt'
import { startSmoothScroll, watchReveals } from '@/lib/motion'

export default function App() {
  useEffect(() => {
    startSmoothScroll()
    return watchReveals()
  }, [])
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Rob />
        <Pools />
        <PumpRoom />
        <Backyard />
        <How />
        <Salt />
        <Area />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
