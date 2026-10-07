// La famille. Le titre se révèle mot à mot pendant le défilement (mécanique du « Text Reveal » de Magic UI,
// réécrite avec GSAP), puis Mark Haskins, leur histoire et les deux avis signés de leur site.
import { Star } from 'lucide-react'
import { useLayoutEffect, useRef, type CSSProperties } from 'react'

import { about, EMAIL, reviews } from '@/data/content'
import { gsap, motion } from '@/lib/motion'
import { photo } from '@/lib/photos'

export function About() {
  const title = useRef<HTMLHeadingElement>(null)
  const p = photo('mark')

  useLayoutEffect(() => {
    const el = title.current
    if (!el || !motion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.rw',
        { opacity: 0.16 },
        { opacity: 1, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 38%', scrub: true } },
      )
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="about" className="on-dark bg-deep text-white" aria-labelledby="about-title">
      <div className="wrap pt-[clamp(96px,12vw,192px)] pb-[clamp(72px,9vw,144px)]">
        <h2 id="about-title" ref={title} className="t-h2 max-w-[17ch]" aria-label={about.title}>
          {about.title.split(' ').map((w, i) => (
            <span key={i} className="rw" aria-hidden>
              {w}{' '}
            </span>
          ))}
        </h2>

        <div className="mt-[clamp(48px,6vw,96px)] grid gap-12 lg:grid-cols-[minmax(280px,440px)_1fr] lg:gap-[clamp(48px,7vw,120px)]">
          <figure>
            <div className="unveil rounded-[4px]" style={{ aspectRatio: `${p.width} / ${p.height}` }}>
              <div className="unveil-in size-full">
                <img src={p.src} width={p.width} height={p.height} alt={about.caption} loading="lazy" decoding="async" className="size-full object-cover" />
              </div>
            </div>
            <figcaption className="mt-3 text-[13.5px] text-white/70">{about.caption}</figcaption>
          </figure>

          <div className="flex flex-col justify-between gap-10">
            <div className="grid gap-5">
              <p data-up className="t-lead max-w-[36rem] text-white/88">{about.story}</p>
              <p data-up className="t-lead max-w-[36rem] text-white/88">{about.promise}</p>
            </div>
            <ul data-up className="flex flex-wrap gap-2.5" aria-label="About the company">
              {about.facts.map((f) => (
                <li key={f} className="flex h-11 items-center gap-2.5 rounded-full px-4 text-[15px] font-[560] shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.28)]">
                  <span className="size-2 rounded-full bg-sun" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-[clamp(72px,9vw,140px)] grid border-t border-white/15 lg:grid-cols-2">
          {reviews.map((r, i) => (
            <figure key={r.name} data-up style={{ '--d': `${i * 0.12}s` } as CSSProperties} className={`py-10 lg:py-14 ${i === 0 ? 'lg:pr-14' : 'border-t border-white/15 lg:border-t-0 lg:border-l lg:pl-14'}`}>
              {r.stars && (
                <div className="mb-6 flex gap-1" role="img" aria-label={`${r.stars} out of 5 stars`}>
                  {Array.from({ length: r.stars }, (_, k) => (
                    <Star key={k} className="size-5 fill-sun text-sun" aria-hidden />
                  ))}
                </div>
              )}
              <blockquote className="text-[clamp(22px,2vw,30px)] leading-[1.25] font-[520] tracking-[-0.015em] [font-stretch:104%]">
                <span className="text-sun">“</span>
                {r.quote}
                <span className="text-sun">”</span>
              </blockquote>
              <figcaption className="mt-6 text-[15px] font-[600] text-white/80">{r.name}</figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-2 text-[15px] text-white/70">
          Want to tell us how we did?{' '}
          <a href={`mailto:${EMAIL}?subject=Feedback`} className="ul font-[600] text-white">
            Email Mark
          </a>
        </p>
      </div>
    </section>
  )
}
