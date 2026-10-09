import { useEffect } from 'react'

import { About } from '@/components/about'
import { Area } from '@/components/area'
import { Build } from '@/components/build'
import { Contact, Footer } from '@/components/contact'
import { ActionBar, Bar, Letterhead } from '@/components/header'
import { Hero } from '@/components/hero'
import { Leaks } from '@/components/leaks'
import { SiteMenu } from '@/components/menu'
import { Renovations } from '@/components/renovations'
import { Services } from '@/components/services'
import { Storm } from '@/components/storm'
import { watchReveals } from '@/lib/motion'

export default function App() {
  useEffect(() => {
    document.documentElement.setAttribute('data-ready', '')
    return watchReveals()
  }, [])
  return (
    <>
      <a href="#main" className="sr-only bg-ink px-4 py-2 text-paper focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50">
        Skip to content
      </a>
      <Letterhead />
      <Bar />
      <main id="main" tabIndex={-1} className="overflow-x-clip outline-none">
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
      <ActionBar />
      <SiteMenu />
    </>
  )
}
