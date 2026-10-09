// Pied de page : leurs coordonnées, leur zone, et le chemin vers chaque section.
import { Lockup } from '@/components/header'
import { go } from '@/lib/motion'
import { nav, site } from '@/lib/site'

export function Footer() {
  return (
    <footer className="on-dark bg-night pb-10 text-white">
      <div className="wrap">
        <div className="grid gap-x-[var(--gutter)] gap-y-12 border-t border-white/12 pt-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <a href="#top" onClick={(e) => go(e, 'top')} aria-label={`${site.name}, back to the top`} className="inline-block">
              <Lockup />
            </a>
            <p className="t-small mt-5 max-w-[22em] text-white/70">Custom pools, renovations, pump rooms and outdoor living in {site.counties}.</p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <h2 className="t-small font-semibold text-white/60">On this page</h2>
            <ul className="mt-4 grid gap-2.5">
              {nav.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} onClick={(e) => go(e, n.id)} className="foot-link">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="t-small font-semibold text-white/60">Service area</h2>
            <ul className="mt-4 grid gap-2.5">
              {site.towns.map((t) => (
                <li key={t} className="foot-text">
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <address className="not-italic lg:col-span-3">
            <h2 className="t-small font-semibold text-white/60">Contact</h2>
            <ul className="mt-4 grid gap-2.5">
              <li>
                <a href={`tel:${site.phone.tel}`} className="foot-link tnum">
                  {site.phone.display}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="foot-link break-all">
                  {site.email}
                </a>
              </li>
              <li>
                <a href={site.maps} target="_blank" rel="noreferrer" className="foot-link">
                  {site.address.street}, {site.address.city}, {site.address.state} {site.address.zip}
                </a>
              </li>
              <li className="foot-text">
                {site.hours.days}, {site.hours.time}
              </li>
            </ul>
          </address>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-white/55">
          <p className="t-note">© 2026 {site.name}</p>
          <a href="https://custompoolsbyrobabel.com/privacy-policy/" className="t-note flow">
            Privacy policy
          </a>
        </div>
      </div>
    </footer>
  )
}
