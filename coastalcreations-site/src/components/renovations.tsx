// Rénovations : leurs chantiers, avant, pendant et après. Chaque chantier a sa composition : la grande photo du résultat,
// et l'« avant » posé dessus comme un tirage ; les trois dates de Manatee en cascade. Les tirages se posent en entrant à l'écran.
import type { CSSProperties, ReactNode } from 'react'

import { Finishes } from '@/components/finishes'
import { LoopVideo, Photo } from '@/components/frame'
import { jobs, type Job } from '@/lib/site'
import brandonPoster from '@/assets/photos/brandon-poster.avif'
import brandon from '@/assets/video/brandon.mp4'

const job = (id: string) => jobs.find((j) => j.id === id) as Job

function Text({ j, className = '' }: { j: Job; className?: string }) {
  return (
    <div className={className}>
      <h3 id={`job-${j.id}`} className="h3">
        {j.place}
      </h3>
      <p className="label mt-2 text-gulf">{j.kind}</p>
      <p className="small mt-4 max-w-[30em] text-ink-2">{j.text}</p>
    </div>
  )
}

// un tirage : la photo dans sa marge blanche, et sa légende dessous
function Print({ children, label, style, className = '' }: { children: ReactNode; label: string; style?: CSSProperties; className?: string }) {
  return (
    <figure data-lay="" className={`print ${className}`} style={style}>
      <div className="h-full">{children}</div>
      <figcaption className="label pt-2.5 pb-0.5">{label}</figcaption>
    </figure>
  )
}

export function Renovations() {
  const holmes = job('holmes')
  const manatee = job('manatee')
  const commercial = job('commercial')
  const brandonJob = job('brandon')
  const [hb, ha] = holmes.frames
  const [m1, m2, m3] = manatee.frames
  const [cb, ca] = commercial.frames
  const [bb, bv] = brandonJob.frames

  return (
    <section id="renovate" aria-labelledby="renovate-title" className="pt-[var(--section)] outline-none" tabIndex={-1}>
      {/* Holmes Beach : le résultat déborde à gauche jusqu'au bord de l'écran, l'« avant » posé en bas à droite ;
          le titre de la partie et le chantier dans la colonne de droite */}
      <article className="w g12 gap-y-10" aria-labelledby="job-holmes">
        <div className="col-span-12 lg:col-span-3 lg:col-start-10 lg:row-start-1">
          <h2 id="renovate-title" className="h2">
            Renovations, photographed on the job.
          </h2>
          <p className="small mt-5 text-ink-2">Resurfacing, waterline tile and repairs for homes, vacation rentals and commercial pools.</p>
        </div>
        <div className="relative col-span-12 lg:col-span-8 lg:row-span-2 lg:row-start-1 lg:ml-[calc(var(--edge)*-1)]">
          <figure className="aspect-[5/4] sm:aspect-[16/11]">
            <Photo id="ami-after" alt={ha.alt} sizes="(min-width: 1024px) 66vw, 100vw" />
          </figure>
          <p className="label mt-2.5 ml-[var(--side)] lg:ml-[var(--edge)]">{ha.label}</p>
          <Print label={hb.label} className="absolute right-[-3%] bottom-[-14%] w-[44%] lg:right-[-9%]" style={{ '--dx': '30px', '--dy': '30px' } as CSSProperties}>
            <div className="aspect-[1206/984]">
              <Photo id="ami-before" alt={hb.alt} sizes="(min-width: 1024px) 28vw, 44vw" />
            </div>
          </Print>
        </div>
        <Text j={holmes} className="col-span-12 self-start pt-16 lg:col-span-3 lg:col-start-10 lg:row-start-2 lg:border-t lg:border-rule lg:pt-6" />
      </article>

      {/* Manatee : trois dates, trois tirages en cascade */}
      <article className="w g12 mt-[clamp(120px,13vw,200px)] gap-y-10" aria-labelledby="job-manatee">
        <Text j={manatee} className="col-span-12 lg:col-span-3" />
        <div className="col-span-12 lg:col-span-9">
          <div className="relative hidden aspect-[2.05/1] md:block">
            <Print label={m1.label} className="absolute top-0 left-0 w-[42%]" style={{ '--dx': '-26px', '--dy': '0px' } as CSSProperties}>
              <div className="aspect-[4/3]">
                <Photo id="cage-1" alt={m1.alt} sizes="(min-width: 1024px) 28vw, 42vw" />
              </div>
            </Print>
            <Print label={m2.label} className="absolute top-[9%] left-[37%] w-[23%]" style={{ '--dx': '0px', '--dy': '-26px', '--d': '0.15s' } as CSSProperties}>
              <div className="aspect-[1000/1602]">
                <Photo id="b-finish" alt={m2.alt} sizes="(min-width: 1024px) 16vw, 24vw" />
              </div>
            </Print>
            <Print label={m3.label} className="absolute top-[24%] right-0 w-[44%]" style={{ '--dx': '26px', '--dy': '0px', '--d': '0.3s' } as CSSProperties}>
              <div className="aspect-[4/3]">
                <Photo id="cage-3" alt={m3.alt} sizes="(min-width: 1024px) 30vw, 44vw" />
              </div>
            </Print>
          </div>
          {/* téléphone : les trois tirages l'un sous l'autre, décalés */}
          <div className="flex flex-col gap-6 md:hidden">
            {[
              { f: m1, id: 'cage-1' as const, ar: '4/3', cls: 'w-[86%]' },
              { f: m2, id: 'b-finish' as const, ar: '1000/1602', cls: 'ml-auto w-[58%]' },
              { f: m3, id: 'cage-3' as const, ar: '4/3', cls: 'w-[86%]' },
            ].map(({ f, id, ar, cls }) => (
              <Print key={f.label} label={f.label} className={cls}>
                <div style={{ aspectRatio: ar }}>
                  <Photo id={id} alt={f.alt} sizes="90vw" />
                </div>
              </Print>
            ))}
          </div>
        </div>
      </article>

      {/* Port Charlotte : en miroir, le résultat déborde à droite, l'« avant » posé en bas à gauche */}
      <article id="commercial" className="w g12 mt-[clamp(120px,13vw,200px)] gap-y-10 outline-none" tabIndex={-1} aria-labelledby="job-commercial">
        <Text j={commercial} className="order-2 col-span-12 pt-16 lg:order-1 lg:col-span-3 lg:pt-0" />
        <div className="relative order-1 col-span-12 lg:order-2 lg:col-span-8 lg:col-start-5 lg:mr-[calc(var(--edge)*-1)]">
          <figure className="aspect-[4/3] sm:aspect-[16/11]">
            <Photo id="pc-after" alt={ca.alt} sizes="(min-width: 1024px) 66vw, 100vw" />
          </figure>
          <p className="label mt-2.5 text-right mr-[var(--side)] lg:mr-[var(--edge)]">{ca.label}</p>
          <Print label={cb.label} className="absolute bottom-[-14%] left-[-3%] w-[42%] lg:left-[-9%]" style={{ '--dx': '-30px', '--dy': '30px' } as CSSProperties}>
            <div className="aspect-[4/3]">
              <Photo id="pc-before" alt={cb.alt} sizes="(min-width: 1024px) 26vw, 42vw" />
            </div>
          </Print>
        </div>
      </article>

      {/* Brandon : la vidéo de la piscine terminée, en hauteur, et le spa pendant les travaux */}
      <article className="w g12 mt-[clamp(120px,13vw,200px)] pb-[var(--section)] gap-y-10" aria-labelledby="job-brandon">
        <div className="relative col-span-12 sm:col-span-10 lg:col-span-6 lg:col-start-2">
          <figure className="ml-auto aspect-[9/16] w-[62%] max-h-[720px] sm:w-[48%] lg:w-[54%]">
            <LoopVideo src={brandon} poster={brandonPoster} label={bv.alt} />
          </figure>
          <p className="label mt-2.5 ml-auto w-[62%] sm:w-[48%] lg:w-[54%]">{bv.label}</p>
          <Print label={bb.label} className="absolute top-[22%] left-0 w-[56%]" style={{ '--dx': '-30px', '--dy': '0px' } as CSSProperties}>
            <div className="aspect-[4/3]">
              <Photo id="brandon-before" alt={bb.alt} sizes="(min-width: 1024px) 24vw, 56vw" />
            </div>
          </Print>
        </div>
        <Text j={brandonJob} className="col-span-12 self-center lg:col-span-4 lg:col-start-9" />
      </article>

      <Finishes />
    </section>
  )
}
