// Contact : la fin de la page, sur la couleur de l'eau. Leur phrase « Let's build your backyard paradise. », puis un
// annuaire, une ligne par façon de les joindre : le numéro qui prend aussi les SMS, leurs deux formulaires Jobber,
// le financement Lyon Financial, la seconde ligne, l'e-mail, la ville. Le pied de page suit, sur la même couleur.
import { MessageSquareText, Phone } from 'lucide-react'
import type { ReactNode } from 'react'

import { leakPrices, site } from '@/lib/site'
import logo from '@/assets/brand/logo.avif'

function Row({ id, term, children, act }: { id?: string; term: string; children: ReactNode; act?: ReactNode }) {
  return (
    <div id={id}>
      <dt className="label">{term}</dt>
      <dd>{children}</dd>
      {act && <dd className="act">{act}</dd>}
    </div>
  )
}

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="on-gulf bg-gulf text-paper outline-none" tabIndex={-1}>
      <div className="w pt-[var(--section)] pb-[clamp(56px,6vw,88px)]">
        <h2 id="contact-title" className="display max-w-[11em] text-[clamp(42px,5.6vw,92px)]">
          Let’s build your backyard paradise.
        </h2>

        <dl className="dir mt-[clamp(48px,6vw,88px)] border-b border-paper/35">
          <Row
            term="Call or text, same number"
            act={
              <span className="flex flex-wrap gap-3 min-[900px]:justify-end">
                <a href={site.phone.href} className="btn btn-sun">
                  <Phone aria-hidden="true" />
                  Call
                </a>
                <a href={site.phone.sms} className="btn btn-line">
                  <MessageSquareText aria-hidden="true" />
                  Send a text
                </a>
              </span>
            }
          >
            <a href={site.phone.href} className="num block text-[clamp(40px,4.8vw,76px)] leading-none whitespace-nowrap">
              {site.phone.label}
            </a>
          </Row>
          <Row
            term="Free quote"
            act={
              <a href={site.quote} target="_blank" rel="noreferrer" className="link font-[500]">
                Open the quote form
              </a>
            }
          >
            <p className="lead">New pool builds, equipment repair and upgrades, pool renovation, commercial pool renovation, and patio renovation.</p>
          </Row>
          <Row
            term="Leak detection"
            act={
              <a href={site.leakRequest} target="_blank" rel="noreferrer" className="link font-[500]">
                Open the leak detection form
              </a>
            }
          >
            <p className="lead">
              ${leakPrices.pool} for a pool, ${leakPrices.poolSpa} with a spa. Epoxy repairs included.
            </p>
          </Row>
          <Row
            id="financing"
            term="Financing"
            act={
              <a href={site.lyon} target="_blank" rel="noreferrer" className="link font-[500]">
                Apply with Lyon Financial
              </a>
            }
          >
            <p className="lead">We’re proud to partner with Lyon Financial to help finance your project.</p>
          </Row>
          <Row term="Second line">
            <a href={site.phone2.href} className="link lead">
              {site.phone2.label}
            </a>
          </Row>
          <Row term="Email">
            <a href={`mailto:${site.email}`} className="link lead break-all">
              {site.email}
            </a>
          </Row>
          <Row term="Based in">
            <p className="lead">{site.city}</p>
          </Row>
        </dl>
      </div>

    </section>
  )
}

export function Footer() {
  return (
    <footer className="on-gulf bg-gulf text-paper">
      <div className="w g12 gap-y-8 pb-[calc(76px+env(safe-area-inset-bottom))] lg:pb-14">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <img src={logo} width={420} height={383} alt="Coastal Creations Pools and Lagoons" loading="lazy" decoding="async" className="h-auto w-[132px]" />
        </div>
        <div className="small col-span-12 sm:col-span-6 lg:col-span-4">
          <p className="font-[500]">{site.legal}</p>
          <p>
            Licensed and insured. Pool contractor {site.license}, LP gas license {site.gas}.
          </p>
        </div>
        <nav aria-label="Elsewhere" className="small col-span-12 sm:col-span-6 lg:col-span-3">
          <ul className="flex flex-col gap-1.5">
            {[
              ['Instagram', site.instagram],
              ['Facebook', site.facebook],
              ['Better Business Bureau', site.bbb],
              ['Privacy policy', site.privacy],
            ].map(([label, href]) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" className="link">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="note col-span-12 sm:col-span-6 lg:col-span-2 lg:text-right" suppressHydrationWarning>
          © {new Date().getFullYear()} {site.legal}.
        </p>
      </div>
    </footer>
  )
}
