// Rénovations : leurs chantiers photographiés du même point, avant, pendant et après, avec les dates de leurs photos.
// Chaque chantier est une rangée de photos de même hauteur ; sur téléphone, la rangée défile au doigt.
import type { CSSProperties } from 'react'

import { Finishes } from '@/components/finishes'
import { Frame, FrameVideo } from '@/components/frame'
import { Lines } from '@/components/lines'
import { jobs, type Job } from '@/lib/site'
import brandonPoster from '@/assets/photos/brandon-poster.avif'
import brandon from '@/assets/video/brandon.mp4'

export function Renovations() {
  return (
    <section id="renovate" className="outline-none" aria-labelledby="renovate-title" tabIndex={-1}>
      <div className="bg-white-sec">
        <div className="wrap py-[var(--section)]">
          <div className="grid-12 gap-y-6">
            <Lines as="h2" id="renovate-title" className="t-h2 col-span-12 lg:col-span-7">
              Before, during, after.
            </Lines>
            <p className="t-lead col-span-12 sm:col-span-10 lg:col-span-4 lg:col-start-9 lg:self-end">
              Resurfacing, waterline tile and repairs for homes, vacation rentals and commercial pools. Same pool, same spot, photographed on the job.
            </p>
          </div>
          <div className="mt-[clamp(56px,7vw,112px)]">
            {jobs.map((job, i) => (
              <JobRow key={job.id} job={job} flip={i % 2 === 1} />
            ))}
          </div>
        </div>
      </div>
      <Finishes />
    </section>
  )
}

function JobRow({ job, flip }: { job: Job; flip: boolean }) {
  const total = job.frames.reduce((a, f) => a + f.ar, 0)
  return (
    <article id={job.id === 'commercial' ? 'commercial' : undefined} className="job" aria-labelledby={`job-${job.id}`}>
      <div className="grid-12 items-end gap-y-3">
        <div className="col-span-12 lg:col-span-6">
          <h3 id={`job-${job.id}`} className="t-h3">
            {job.place}
          </h3>
          <p className="t-label mt-2 text-cobalt">{job.kind}</p>
        </div>
        <p className="t-small col-span-12 max-w-[34em] text-ink-soft sm:col-span-9 lg:col-span-5 lg:col-start-8">{job.text}</p>
      </div>
      {/* la rangée ne dépasse pas une hauteur confortable : plus étroite que la page, elle se cale à gauche ou à droite */}
      <div className={`strip mt-7 ${flip ? 'md:ml-auto' : ''}`} style={{ maxWidth: `calc(${total.toFixed(3)} * min(560px, 64vh))` }}>
        {job.frames.map((f, k) => (
          <figure key={f.label} style={{ '--ar': f.ar } as CSSProperties}>
            {f.video ? (
              <FrameVideo src={brandon} poster={brandonPoster} label={f.alt} cage={{ cols: 2, rows: 4, delay: k * 0.18 }} />
            ) : (
              f.photo && <Frame id={f.photo} alt={f.alt} sizes={`(min-width: 1024px) ${Math.round((f.ar / total) * 90)}vw, 70vw`} cage={{ cols: f.ar < 1 ? 2 : 3, rows: f.ar < 1 ? 4 : 3, delay: k * 0.18, from: flip ? 'top-right' : 'top-left' }} />
            )}
            <figcaption className="frame-label">
              <span className="t-label">{f.label}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </article>
  )
}
