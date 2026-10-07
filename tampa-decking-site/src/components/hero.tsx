// Ouverture. La première ligne du titre est posée sur le blanc (la plage), la seconde passe sur la photo,
// comme sous la ligne d'eau. À l'arrivée, la photo monte comme l'eau qui remplit un bassin.
import { ArrowRight, Phone } from 'lucide-react'
import { Fragment, useLayoutEffect, useRef } from 'react'

import { go } from '@/components/header'
import { hero, PHONE, PHONE_HREF } from '@/data/content'
import { gsap, motion } from '@/lib/motion'
import { photo } from '@/lib/photos'

const words = (s: string) =>
  s.split(' ').map((w, i, a) => (
    <Fragment key={i}>
      <span className="w">
        <span>{w}</span>
      </span>
      {i < a.length - 1 && ' '}
    </Fragment>
  ))

const facts = ['Veteran owned', 'Christian owned', 'Family business', 'In Tampa for 30 years', 'Free, up-front estimates', 'We aim to reply within 24 hours']

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const big = photo('hero')
  const small = photo('hero-m')

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !motion()) return
    // page pré-générée déjà affichée depuis un moment (réseau lent) : on ne rejoue pas l'entrée
    const late = document.documentElement.hasAttribute('data-prerendered') && performance.now() > 700
    const ctx = gsap.context(() => {
      if (!late) {
        gsap
          .timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 })
          .from('[data-l1] .w > span', { yPercent: 112, duration: 1.4, stagger: 0.08 })
          .from('[data-mask]', { yPercent: 100, duration: 1.7 }, 0.12)
          .from('[data-mask-in]', { yPercent: -100, duration: 1.7 }, 0.12)
          .from('[data-img]', { scale: 1.2, duration: 2.4, ease: 'power3.out' }, 0.12)
          .from('[data-l2] .w > span', { yPercent: 112, duration: 1.4, stagger: 0.08 }, 0.62)
          .from('[data-intro] > *', { y: 26, opacity: 0, duration: 1.1, stagger: 0.09 }, 0.55)
          .from('[data-fact]', { y: 16, opacity: 0, duration: 0.9, stagger: 0.05 }, 1)
      }

      // parallaxe : la photo descend moins vite que la page, la seconde ligne remonte plus vite
      const st = { trigger: '[data-photo]', start: 'top 70%', end: 'bottom top', scrub: true }
      gsap.fromTo('[data-img-wrap]', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: st })
      gsap.to('[data-l2]', { yPercent: -55, ease: 'none', scrollTrigger: { ...st, start: 'top 40%' } })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="top" ref={ref} className="relative pt-[var(--header)]" aria-labelledby="hero-title">
      <div className="wrap grid items-end gap-x-12 gap-y-6 pt-[clamp(24px,5.5vh,72px)] xl:grid-cols-[auto_minmax(300px,1fr)]">
        <h1 id="hero-title" className="t-display text-ink xl:whitespace-nowrap">
          <span data-l1 className="split block" aria-hidden>{words(hero.line1)}</span>
          <span className="sr-only">{hero.line1} {hero.line2}</span>
        </h1>
        <div data-intro className="grid gap-6 pb-[0.4vw] md:grid-cols-[1fr_auto] md:items-end xl:block xl:max-w-[430px] xl:justify-self-end">
          <p className="t-lead max-w-[30rem] text-ink-soft">{hero.intro}</p>
          <div className="flex flex-wrap gap-3 xl:mt-7">
            <a href="#estimate" onClick={(e) => go(e, 'estimate')} className="btn btn-sun">
              Get a free estimate
              <ArrowRight className="arr size-[18px]" aria-hidden />
            </a>
            <a href={PHONE_HREF} className="btn btn-line">
              <Phone className="size-4" aria-hidden />
              {PHONE}
            </a>
          </div>
        </div>
      </div>

      <div data-photo className="relative mt-[clamp(20px,3.2vw,44px)]">
        <div data-mask className="relative h-[64svh] overflow-hidden md:h-[72vh] xl:h-[min(80vh,880px)]">
          <div data-mask-in className="absolute inset-0">
            <div data-img-wrap className="absolute inset-x-0 -top-[8%] h-[116%] will-change-transform">
              <picture>
                <source media="(max-width: 767px)" srcSet={small.src} width={small.width} height={small.height} />
                <img
                  data-img
                  src={big.src}
                  width={big.width}
                  height={big.height}
                  alt={hero.caption}
                  fetchPriority="high"
                  decoding="async"
                  className="size-full object-cover object-[50%_42%]"
                />
              </picture>
            </div>
            <div className="absolute inset-0 bg-[#062c48]/12" aria-hidden />
          </div>
        </div>
        <p data-l2 className="t-display split pointer-events-none absolute top-[clamp(10px,2.1vw,30px)] left-[var(--gutter)] text-white will-change-transform" aria-hidden>
          {words(hero.line2)}
        </p>
      </div>

      <div className="wrap">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 border-b border-line py-6 text-[15px] font-[560] md:flex md:flex-wrap md:justify-between md:gap-x-8">
          {facts.map((f) => (
            <li key={f} data-fact className="flex items-center gap-2.5">
              <span className="size-2 shrink-0 rounded-full bg-sun ring-1 ring-ink/25" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
