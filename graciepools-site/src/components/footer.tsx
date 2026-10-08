// Pied de page : toute la gamme côte à côte, à la même échelle et dans le coloris choisi, puis les coordonnées.
import { NAV } from '@/components/header'
import { Logo } from '@/components/logo'
import { FooterLineup } from '@/components/footer-lineup'
import { go } from '@/lib/motion'
import { AREAS, EMAIL, LICENSE, LYON, PHONE, SHEET, sms, TEL } from '@/lib/site'

export function Footer() {
  return (
    <footer className="on-dark relative overflow-hidden bg-ink text-white">
      <div className="wrap pt-[clamp(64px,8vw,110px)]">
        <FooterLineup />
        <p className="mt-4 text-[14px] text-white/50">Every Barrier Reef pool on this site, side by side at the same scale, in the finish you picked.</p>

        <div className="mt-[clamp(56px,7vw,96px)] grid gap-x-10 gap-y-12 border-t border-white/12 pt-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo className="text-white" />
            <p className="mt-5 max-w-[26rem] text-[16px] leading-relaxed text-white/65">
              Fiberglass and custom concrete pools, liners, resurfacing and repairs. Based in Altamonte Springs, building across Central Florida.
            </p>
          </div>
          <div className="lg:col-span-3">
            <p className="text-[15px] font-[600]">Contact</p>
            <ul className="mt-4 grid gap-2.5 text-[16px] text-white/70">
              <li>
                <a href={TEL} className="ul tnum">
                  {PHONE}
                </a>
              </li>
              <li>
                <a href={sms()} className="ul">
                  Text a photo of your pool
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="ul">
                  {EMAIL}
                </a>
              </li>
              <li>{AREAS.join(', ')}</li>
            </ul>
          </div>
          <div className="lg:col-span-2">
            <p className="text-[15px] font-[600]">On this page</p>
            <ul className="mt-4 grid gap-2.5 text-[16px] text-white/70">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} onClick={(e) => go(e, n.id)} className="ul">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <p className="text-[15px] font-[600]">Partners</p>
            <ul className="mt-4 grid gap-2.5 text-[16px] text-white/70">
              <li>
                <a href={SHEET} target="_blank" rel="noreferrer" className="ul">
                  Barrier Reef 2025 models
                </a>
              </li>
              <li>Pentair equipment</li>
              <li>
                <a href={LYON} target="_blank" rel="noreferrer" className="ul">
                  Lyon Financial
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap justify-between gap-x-8 gap-y-3 border-t border-white/12 py-8 text-[14px] text-white/50">
          <p>
            © 2026 Gracie Pools, Inc. Florida State licensed swimming pool contractor <span className="tnum">{LICENSE}</span>.
          </p>
          <p>Model photos and drawings: Barrier Reef Fiberglass Pools.</p>
        </div>
      </div>
    </footer>
  )
}
