// Pied de page, « le grand bain » : logo, ancres, coordonnées.
import { ArrowUp } from 'lucide-react'

import logoNavy from '@/assets/brand/logo-navy.webp'
import { go } from '@/components/header'
import { EMAIL, PHONE, PHONE_HREF } from '@/data/content'

const groups = [
  {
    title: 'Services',
    links: [
      ['Pool resurfacing', 'layers'],
      ['Tile and coping', 'layers'],
      ['Pool decks and coatings', 'surfaces'],
      ['Paver sealing', 'care'],
      ['Pressure washing', 'care'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['Our work', 'work'],
      ['Pricing', 'cost'],
      ['About us', 'about'],
      ['Areas we serve', 'areas'],
    ],
  },
] as const

export function Footer() {
  return (
    <footer id="site-footer" className="on-dark bg-abyss text-white">
      <div className="wrap pt-[clamp(64px,8vw,120px)] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div className="max-w-[22rem]">
            <span className="inline-block rounded-[6px] bg-white px-4 py-3">
              <img src={logoNavy} alt="Tampa Decking & Pools" width={464} height={226} loading="lazy" className="h-[58px] w-auto" />
            </span>
            <p className="mt-6 text-[15px] text-white/75">Pool resurfacing, tile, coping and decks across Tampa Bay, from the deck to the deep end.</p>
            <p className="mt-4 text-[14px] font-[560] text-white/90">Veteran owned · Christian owned · Family business</p>
          </div>
          {groups.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <p className="text-[14px] font-[620] text-white/55">{g.title}</p>
              <ul className="mt-4 grid gap-2.5 text-[15px]">
                {g.links.map(([label, id]) => (
                  <li key={label}>
                    <a href={`#${id}`} onClick={(e) => go(e, id)} className="ul">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <p className="text-[14px] font-[620] text-white/55">Contact</p>
            <ul className="mt-4 grid gap-2.5 text-[15px]">
              <li><a href={PHONE_HREF} className="ul font-[600]">{PHONE}</a></li>
              <li><a href={`mailto:${EMAIL}`} className="ul break-all">{EMAIL}</a></li>
              <li className="text-white/75">Tampa, FL 33624</li>
              <li className="text-white/75">Hillsborough, Pasco and Pinellas</li>
            </ul>
            <a href="#estimate" onClick={(e) => go(e, 'estimate')} className="btn btn-sun btn-sm mt-6">
              Get a free estimate
            </a>
          </div>
        </div>

        <div className="mt-[clamp(56px,7vw,104px)] flex flex-col gap-4 border-t border-white/15 pt-6 text-[13.5px] text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Tampa Decking & Pools</p>
          <a href="#top" onClick={(e) => go(e, 'top')} className="group inline-flex w-fit items-center gap-2 text-white/80">
            <span className="ul">You have reached the deep end. Back to the top</span>
            <ArrowUp className="size-4 transition-transform duration-500 group-hover:-translate-y-1" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  )
}
