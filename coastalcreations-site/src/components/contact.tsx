// Contact : leur phrase « Let's build your backyard paradise. », le numéro qui prend aussi les SMS, leurs deux formulaires
// Jobber (devis gratuit, détection de fuites), le financement Lyon Financial ; puis le pied de page avec leur vrai logo.
import { Mail, MapPin, MessageSquareText, Phone } from 'lucide-react'

import { Lines } from '@/components/lines'
import { leakPrices, site } from '@/lib/site'
import logo from '@/assets/brand/logo.avif'

export function Contact() {
  return (
    <section id="contact" className="bg-navy-sec on-dark outline-none" aria-labelledby="contact-title" tabIndex={-1}>
      <div className="wrap py-[var(--section)]">
        <Lines as="h2" id="contact-title" className="t-h2 max-w-[11em]">
          Let’s build your backyard paradise.
        </Lines>

        <div className="grid-12 mt-[clamp(48px,6vw,96px)] gap-y-14">
          <div className="col-span-12 lg:col-span-6">
            <a href={site.phone.href} className="t-num block text-[clamp(40px,4.9vw,80px)] leading-[0.9] tracking-[-0.03em] whitespace-nowrap transition-colors hover:text-aqua">
              {site.phone.label}
            </a>
            <p className="t-label mt-3 text-aqua">Call or text, same number</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={site.phone.href} className="btn btn-white">
                <Phone aria-hidden="true" />
                Call
              </a>
              <a href={site.phone.sms} className="btn btn-line">
                <MessageSquareText aria-hidden="true" />
                Send a text
              </a>
            </div>
            <ul className="t-small mt-10 flex flex-col gap-3 text-white/85">
              <li className="flex items-center gap-3">
                <Phone aria-hidden="true" className="size-[18px] text-aqua" />
                <span>
                  Second line:{' '}
                  <a href={site.phone2.href} className="ul text-white">
                    {site.phone2.label}
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail aria-hidden="true" className="size-[18px] text-aqua" />
                <a href={`mailto:${site.email}`} className="ul break-all text-white">
                  {site.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin aria-hidden="true" className="size-[18px] text-aqua" />
                {site.city}
              </li>
            </ul>
          </div>

          <div className="col-span-12 flex flex-col lg:col-span-5 lg:col-start-8">
            <div className="border-t border-white/20 py-7">
              <h3 className="t-h3">Request a free quote</h3>
              <p className="t-small mt-3 text-white/80">New pool builds, equipment repair and upgrades, pool renovation, commercial pool renovation, and patio renovation.</p>
              <a href={site.quote} target="_blank" rel="noreferrer" className="btn btn-aqua mt-6">
                Request a free quote
              </a>
            </div>
            <div className="border-t border-white/20 py-7">
              <h3 className="t-h3">Book leak detection</h3>
              <p className="t-small mt-3 text-white/80">${leakPrices.pool} for a pool, ${leakPrices.poolSpa} with a spa. Epoxy repairs included.</p>
              <a href={site.leakRequest} target="_blank" rel="noreferrer" className="btn btn-line mt-6">
                Book leak detection
              </a>
            </div>
            <div id="financing" className="border-y border-white/20 py-7">
              <h3 className="t-h3">Financing</h3>
              <p className="t-small mt-3 text-white/80">We’re proud to partner with Lyon Financial to help finance your project.</p>
              <a href={site.lyon} target="_blank" rel="noreferrer" className="ul mt-4 inline-block font-[620]">
                Apply with Lyon Financial
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="on-dark bg-[#081a2c] text-white">
      <div className="wrap grid-12 gap-y-10 py-14">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <img src={logo} width={420} height={383} alt="Coastal Creations Pools and Lagoons" loading="lazy" decoding="async" className="h-auto w-[150px]" />
        </div>
        <div className="t-small col-span-12 text-white/80 sm:col-span-6 lg:col-span-3">
          <p className="font-[640] text-white">{site.legal}</p>
          <p className="mt-1">{site.city}</p>
          <p className="mt-4">Licensed and insured</p>
          <p>
            Pool contractor {site.license}
            <br />
            LP gas license {site.gas}
          </p>
        </div>
        <nav aria-label="Elsewhere" className="t-small col-span-12 sm:col-span-6 lg:col-span-3">
          <ul className="flex flex-col gap-2">
            <li>
              <a href={site.instagram} target="_blank" rel="noreferrer" className="ul">
                Instagram
              </a>
            </li>
            <li>
              <a href={site.facebook} target="_blank" rel="noreferrer" className="ul">
                Facebook
              </a>
            </li>
            <li>
              <a href={site.bbb} target="_blank" rel="noreferrer" className="ul">
                Better Business Bureau
              </a>
            </li>
            <li>
              <a href={site.privacy} target="_blank" rel="noreferrer" className="ul">
                Privacy policy
              </a>
            </li>
          </ul>
        </nav>
        <p className="t-note col-span-12 text-white/60 sm:col-span-6 lg:col-span-3 lg:text-right" suppressHydrationWarning>
          © {new Date().getFullYear()} {site.legal}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
