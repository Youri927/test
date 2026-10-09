// Accueil : le titre, la piscine de Holmes Beach (leur vidéo) qui se découvre panneau par panneau, et les preuves.
// Sur téléphone, la vidéo vient juste sous le titre ; sur grand écran, elle occupe la colonne de droite.
import { BadgeCheck, MessageSquareText, ShieldCheck } from 'lucide-react'
import { useRef, type CSSProperties } from 'react'

import { Cage } from '@/components/cage'
import { Lines } from '@/components/lines'
import { gsap, useScrollAnim } from '@/lib/motion'
import { photo } from '@/lib/photos'
import { site } from '@/lib/site'
import holmes from '@/assets/video/holmes-beach.mp4'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const poster = photo('hero-poster')

  // au défilement, la photo se resserre un peu et le titre remonte plus vite que la page
  useScrollAnim(ref, (q) => {
    const [media] = q('.hero-media')
    const [title] = q('.hero-title')
    if (!media || !title) return
    const st = { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true }
    gsap.to(media, { scale: 1.08, ease: 'none', scrollTrigger: st })
    gsap.to(title, { yPercent: -14, ease: 'none', scrollTrigger: st })
  })

  return (
    <section ref={ref} id="top" className="bg-plaster-sec relative overflow-hidden" aria-labelledby="hero-title">
      <div className="wrap hero-grid min-h-[100svh] content-end pt-[calc(var(--header-h)+28px)] pb-10 lg:pb-14">
        <div className="hero-title [grid-area:title]">
          <Lines as="h1" id="hero-title" className="t-display max-w-[9.5em]">
            Pools built and rebuilt on the Gulf Coast.
          </Lines>
        </div>

        <figure className="[grid-area:media] mt-7 lg:mt-0 lg:self-end">
          <div className="hero-frame aspect-[16/11] w-full lg:aspect-[4/5] lg:max-h-[calc(100svh-var(--header-h)-120px)]">
            <div className="hero-media size-full">
              <video src={holmes} poster={poster.src} autoPlay muted loop playsInline preload="auto" aria-label="The pool of a vacation rental in Holmes Beach after our renovation: new surface and blue glass waterline tile" />
            </div>
            <Cage cols={3} rows={4} delay={0.3} />
          </div>
          <figcaption className="hero-up t-note mt-3 text-navy/75" style={{ '--d': '1.2s' } as CSSProperties}>
            Holmes Beach, Anna Maria Island: full resurfacing, new waterline tile and a spa drain repair for a vacation rental.
          </figcaption>
        </figure>

        <p className="t-lead hero-up [grid-area:lead] mt-7 max-w-[31em] text-navy/85 lg:mt-8" style={{ '--d': '0.55s' } as CSSProperties}>
          Custom pool construction, renovation and leak detection from Palmetto, across Bradenton, Sarasota and Tampa Bay. Licensed, insured, and family run.
        </p>
        <div className="hero-up [grid-area:cta] mt-7 flex flex-wrap gap-3 lg:mt-8" style={{ '--d': '0.7s' } as CSSProperties}>
          <a href={site.quote} target="_blank" rel="noreferrer" className="btn btn-navy">
            Request a free quote
          </a>
          <a href={site.leakRequest} target="_blank" rel="noreferrer" className="btn btn-line">
            Book leak detection
          </a>
        </div>
        <ul className="hero-up [grid-area:proof] mt-9 flex flex-col gap-3 self-end text-[15px] font-[540] sm:flex-row sm:flex-wrap sm:gap-x-7 lg:mt-10" style={{ '--d': '0.85s' } as CSSProperties}>
          <li className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="size-[18px] text-cobalt" />
            Florida pool contractor {site.license}
          </li>
          <li>
            <a href={site.bbb} target="_blank" rel="noreferrer" className="flex items-center gap-2">
              <BadgeCheck aria-hidden="true" className="size-[18px] text-cobalt" />
              <span className="ul">BBB accredited, A+</span>
            </a>
          </li>
          <li>
            <a href={site.phone.sms} className="flex items-center gap-2">
              <MessageSquareText aria-hidden="true" className="size-[18px] text-cobalt" />
              <span className="ul">Call or text {site.phone.label}</span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  )
}
