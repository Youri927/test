// Rob en personne : le tête-à-tête, le rendez-vous à domicile, plus de 30 ans de métier,
// et une piscine pensée pour son entretien (leur page d'accueil, « About us »).
import { Lines } from '@/components/lines'
import { Photo } from '@/components/photo'

const FACTS = [
  { title: 'In your home', text: 'A one-on-one custom builder: you meet Rob at your home, where the pool will be.' },
  { title: 'Easy to keep', text: 'Each pool is designed to be maintained easily, at minimal cost, after the warranty period ends.' },
  { title: 'Equipment indoors', text: 'Pumps, filters and controls go in a climate-controlled pump room, out of the weather and out of view.' },
  { title: 'An experienced crew', text: 'A professional staff with years of experience in every phase of pool installation and maintenance.' },
]

export function Rob() {
  return (
    <section id="rob" aria-labelledby="rob-title" className="bg-salt py-[clamp(88px,11vw,176px)]">
      <div className="wrap grid gap-x-[var(--gutter)] gap-y-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Lines id="rob-title" className="t-h2 max-w-[9em]">
            One builder, from the first meeting to the first swim
          </Lines>
          <p className="t-lead mt-9 max-w-[33em] text-ink-soft" data-up>
            Rob Abel has been in the pool industry for more than 30 years. He designs each pool for the yard it goes in and the way you will use it, and just as much for how it will be cared for once
            the warranty ends.
          </p>
        </div>
        <figure className="lg:col-span-5 lg:col-start-8 lg:row-span-2">
          <Photo
            id="build-steel"
            alt="A pool under construction, from above: the steel grid in the excavation, with the crew spraying the shell"
            className="aspect-[4/5] rounded-md lg:aspect-[4/5]"
            sizes="(min-width: 1024px) 38vw, 92vw"
            position="50% 60%"
            parallax
          />
          <figcaption className="t-note mt-3 text-ink-soft">Before the water: the steel, and the shell sprayed over it.</figcaption>
        </figure>
        <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:col-span-7 lg:self-end">
          {FACTS.map((f, i) => (
            <div key={f.title} className="border-t border-navy/15 pt-5" data-up style={{ '--d': `${i * 0.08}s` } as React.CSSProperties}>
              <dt className="t-h4">{f.title}</dt>
              <dd className="t-small mt-2 max-w-[24em] text-ink-soft">{f.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
