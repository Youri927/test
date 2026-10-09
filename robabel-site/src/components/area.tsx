// La zone desservie, sur une vraie carte de la côte (tools/map.py, d'après le Census américain) :
// le bureau de Fort Walton Beach, Destin, Niceville, Santa Rosa Beach et la route 30A, entre la baie et le golfe.
import { useRef } from 'react'
import { MapPin } from 'lucide-react'

import { Lines } from '@/components/lines'
import coast from '@/data/coast.json'
import { gsap, useScrollAnim } from '@/lib/motion'
import { site } from '@/lib/site'

const [W, H] = coast.viewBox
const P = coast.places
const road = coast.road30A.map(([x, y]) => `${x},${y}`).join(' ')
const mid = coast.road30A[Math.floor(coast.road30A.length / 2)]

const LABELS: {
  at: number[]
  text: string
  dx: number
  dy: number
  anchor?: 'start' | 'end' | 'middle'
}[] = [
  { at: P.destin, text: 'Destin', dx: 0, dy: 34, anchor: 'middle' },
  { at: P.niceville, text: 'Niceville', dx: 18, dy: -14 },
  { at: P.santaRosa, text: 'Santa Rosa Beach', dx: -18, dy: 34, anchor: 'end' },
]

export function Area() {
  const frame = useRef<HTMLDivElement>(null)

  // en arrivant sur la carte : on part de leur bureau et on recule jusqu'à toute la côte ; les villes apparaissent une à une,
  // puis la route 30A se trace jusqu'au bout
  useScrollAnim(frame, (q) => {
    gsap
      .timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: frame.current, start: 'top 85%', end: 'center 45%', scrub: 0.5 } })
      .fromTo(q('.map'), { scale: 1.18 }, { scale: 1, duration: 1 }, 0)
      .fromTo(q('.map-place'), { opacity: 0 }, { opacity: 1, duration: 0.16, stagger: 0.11 }, 0.12)
      .fromTo(q('.map-road-draw'), { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.42 }, 0.52)
  })

  return (
    <section id="area" aria-labelledby="area-title" className="bg-white py-[clamp(88px,11vw,176px)]">
      <div className="wrap grid gap-x-[var(--gutter)] gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Lines id="area-title" className="t-h2 max-w-[6em]">
            Destin to 30A
          </Lines>
          <p className="t-lead mt-8 max-w-[24em] text-ink-soft" data-up>
            Pools in {site.towns.slice(0, -1).join(', ')} and {site.towns.at(-1)}, across {site.counties}.
          </p>
          <dl className="mt-10 grid gap-6" data-up>
            <div>
              <dt className="t-small font-semibold">Office</dt>
              <dd className="t-lead mt-1">
                {site.address.street}
                <br />
                {site.address.city}, {site.address.state} {site.address.zip}
              </dd>
              <dd className="mt-2">
                <a href={site.maps} target="_blank" rel="noreferrer" className="flow t-small font-semibold text-azure-ink">
                  Open in Maps
                </a>
              </dd>
            </div>
            <div>
              <dt className="t-small font-semibold">Hours</dt>
              <dd className="t-lead mt-1">
                {site.hours.days}
                <br />
                {site.hours.time}
              </dd>
            </div>
          </dl>
        </div>

        <figure className="lg:col-span-8">
          <div ref={frame} className="map-frame" data-up>
            <svg viewBox={`0 0 ${W} ${H}`} className="map" role="img" aria-labelledby="map-title">
              <title id="map-title">Map of the Emerald Coast: the office in Fort Walton Beach, Destin, Niceville, Santa Rosa Beach and the 30A road, between Choctawhatchee Bay and the Gulf</title>
              <rect width={W} height={H} className="map-water" />
              <path d={coast.land} className="map-land" fillRule="evenodd" />
              <text x={P.destin[0] + 260} y={P.destin[1] - 150} className="map-water-label">
                Choctawhatchee Bay
              </text>
              {/* la route se trace à travers un masque : le pointillé reste régulier */}
              <mask id="road-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                <polyline points={road} className="map-road-draw" pathLength={1} strokeDasharray="1 1" strokeDashoffset={0} />
              </mask>
              <polyline points={road} className="map-road" mask="url(#road-reveal)" />
              <g className="map-office map-place">
                <circle cx={P.office[0]} cy={P.office[1]} r="22" className="map-ring" />
                <circle cx={P.office[0]} cy={P.office[1]} r="9" className="map-pin" />
                <text x={P.office[0] - 18} y={P.office[1] - 34} textAnchor="start" className="map-label map-label-strong">
                  Fort Walton Beach
                </text>
              </g>
              {LABELS.map((l) => (
                <g key={l.text} className="map-place">
                  <circle cx={l.at[0]} cy={l.at[1]} r="6" className="map-dot" />
                  <text x={l.at[0] + l.dx} y={l.at[1] + l.dy} textAnchor={l.anchor ?? 'start'} className="map-label">
                    {l.text}
                  </text>
                </g>
              ))}
              <text x={mid[0] + 10} y={mid[1] - 22} className="map-label map-road-label map-place">
                30A
              </text>
            </svg>
          </div>
          <figcaption className="t-note mt-3 flex items-center gap-2 text-ink-soft">
            <MapPin aria-hidden="true" className="size-4 text-azure-ink" />
            Their office, {site.address.street}. Coastline: U.S. Census Bureau.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
