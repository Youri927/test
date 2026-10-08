// Pied de page : le logo dans son gris d'origine, les soins, le cabinet, le contact.
import { ArrowUp } from 'lucide-react'

import { Logo } from '@/components/logo'
import { CITY, EMAIL, EMERGENCY, EMERGENCY_SMS, PHONE, PHONE_HREF, STREET, UNIT } from '@/data/content'
import { go } from '@/lib/motion'
import { openSheet } from '@/lib/sheet'

const links: [string, string[]][] = [
  ['Dental implants', ['implants']],
  ['Same-day crowns', ['crowns']],
  ['Bridges', ['bridges']],
  ['Dentures', ['implant-dentures', 'dentures']],
  ['Root canals', ['root-canals']],
  ['Extractions', ['extractions']],
  ['Gum treatment', ['periodontal']],
  ['Sedation', ['sedation']],
  ['Fillings', ['fillings']],
  ['Cosmetic dentistry', ['cosmetic', 'fillers']],
]

export function Footer() {
  return (
    <footer id="site-footer" className="on-dark bg-ink text-white">
      <div className="wrap pt-[clamp(72px,9vw,140px)] pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1.2fr_0.9fr_1fr]">
          <div className="max-w-[24rem]">
            <Logo className="h-[120px] w-auto fill-bone md:h-[150px]" title="Implant and Comprehensive Dentistry of Naples" />
            <p className="mt-8 text-[18px] leading-[1.25] font-[600] tracking-[-0.01em]">Implant and Comprehensive Dentistry of Naples</p>
            <p className="mt-3 text-[15px] text-white/70">Implants, same-day crowns and everything in between, with Dr. Fady Fakhoury, DDS.</p>
          </div>

          <nav aria-label="Treatments">
            <p className="text-[14px] font-[600] text-white/55">Treatments</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[15px]">
              {links.map(([label, ids]) => (
                <li key={label}>
                  <button type="button" onClick={() => openSheet(ids, label, 'footer')} className="text-left">
                    <span className="ul">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-[14px] font-[600] text-white/55">Office</p>
            <ul className="mt-4 grid gap-2.5 text-[15px] text-white/80">
              <li>
                {STREET}, {UNIT}
                <br />
                {CITY}
              </li>
              <li>
                Monday to Friday, 8 AM – 5 PM
                <br />
                Saturday by appointment
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[14px] font-[600] text-white/55">Contact</p>
            <ul className="mt-4 grid gap-2.5 text-[15px]">
              <li>
                <a href={PHONE_HREF} className="ul font-[600]">
                  {PHONE}
                </a>
              </li>
              <li>
                <a href={EMERGENCY_SMS} className="ul">
                  Emergency: text {EMERGENCY}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="ul break-all">
                  {EMAIL}
                </a>
              </li>
            </ul>
            <a href="#request" onClick={(e) => go(e, 'request')} className="btn btn-teal btn-sm mt-6">
              Request a visit
            </a>
          </div>
        </div>

        <div className="mt-[clamp(56px,7vw,104px)] flex flex-col gap-4 border-t border-white/15 pt-6 text-[13.5px] text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Implant and Comprehensive Dentistry of Naples</p>
          <a href="#top" onClick={(e) => go(e, 'top')} className="group inline-flex w-fit items-center gap-2 text-white/80">
            <span className="ul">Back to the top</span>
            <ArrowUp className="size-4 transition-transform duration-500 group-hover:-translate-y-1" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  )
}
