// Les piscines existantes : remplacement de liner (avec ce que comprend leur prestation), enduit et carrelage, pompes et sel,
// domotique, spas. Et leur offre la plus simple : une photo par SMS, une estimation gratuite.
import { Check, MessageSquareText, Phone } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

import { Lines } from '@/components/lines'
import { Photo } from '@/components/photo'
import { RiseBg } from '@/components/rise'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { PhotoId } from '@/lib/photos'
import { PHONE, sms, TEL } from '@/lib/site'

const INCLUDED = [
  'We drain the pool and remove the hydrostatic plug',
  'We remove and dispose of the old liner',
  'A new skimmer faceplate and gasket',
  'New main drain rings, gaskets and covers',
  'New return faceplates and directional jet nozzles',
]

type Item = { id: string; title: string; lead: string; body?: ReactNode; photo?: { id: PhotoId; alt: string } }

const ITEMS: Item[] = [
  {
    id: 'liner',
    title: 'Vinyl liner replacement',
    lead: 'Most liners go in within one or two days once the pool is drained. Free upgrade to thicker 27 mil patterns, dozens of designs, and a 20-year manufacturer’s warranty.',
    body: (
      <div className="mt-6">
        <p className="text-[15px] font-[600] text-white">Every replacement includes</p>
        <ul className="mt-3 grid gap-2.5">
          {INCLUDED.map((t, i) => (
            <li key={t} className="tick flex gap-3 text-[16px] leading-snug text-white/80" style={{ '--i': i } as CSSProperties}>
              <Check className="mt-0.5 size-[18px] shrink-0 text-[var(--water)]" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      </div>
    ),
    photo: { id: 'liner-pattern', alt: 'A new patterned vinyl liner under clear water' },
  },
  {
    id: 'surface',
    title: 'Resurfacing and tile',
    lead: 'When the surface or the tile is worn, we replace it. Today’s surface materials last longer and give you more design choices.',
    photo: { id: 'tile', alt: 'A raised spa wall finished in blue glass tile, spilling into the pool' },
  },
  {
    id: 'pumps',
    title: 'Pumps and salt systems',
    lead: 'Swap an old pump for a variable-speed pump that saves money and keeps the water crystal clear. From a quick pump replacement to a full renovation, across the Orlando area.',
  },
  {
    id: 'automation',
    title: 'Pool automation',
    lead: 'Set the spa temperature, change the color of the pool lights and manage filter times from your phone.',
  },
  {
    id: 'spa',
    title: 'Hot tub repair and relocation',
    lead: 'Factory-trained hot tub repair from Orlando to Lake Mary, and help when a hot tub has to move.',
    photo: { id: 'hot-tub', alt: 'An acrylic hot tub with jets and lit water' },
  },
]

export function Service() {
  return (
    <section id="service" tabIndex={-1} className="on-dark relative isolate text-white">
      <RiseBg above="var(--deck)" below="#ffffff" />
      <div className="wrap pt-[clamp(84px,10vw,150px)] pb-[clamp(80px,10vw,150px)]">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header)+32px)]">
              <Lines className="t-h2">Already have a pool?</Lines>
              <p className="t-lead mt-6 max-w-[30rem] text-white/72" data-up>
                Liners, surfaces, pumps, automation and hot tubs, from Orlando to Lake Mary.
              </p>
              <div className="mt-10 rounded-[22px] bg-white p-7 text-ink sm:p-8" data-up>
                <p className="text-[clamp(24px,2.1vw,30px)] leading-[1.05] font-[680] tracking-[-0.025em]">Text a photo of your pool for a free estimate</p>
                <a href={TEL} className="tnum mt-5 block text-[clamp(34px,3.4vw,48px)] leading-none font-[700] tracking-[-0.03em]">
                  {PHONE}
                </a>
                <div className="mt-7 flex flex-wrap gap-2.5">
                  <a href={sms()} className="btn btn-ink">
                    <MessageSquareText className="size-[18px]" aria-hidden />
                    Text a photo
                  </a>
                  <a href={TEL} className="btn btn-line">
                    <Phone className="size-[18px]" aria-hidden />
                    Call
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Accordion type="single" collapsible defaultValue="liner" className="service-list">
              {ITEMS.map((it) => (
                <AccordionItem key={it.id} value={it.id} className="border-b border-white/14">
                  <AccordionTrigger className="service-trigger py-6 text-left text-[clamp(24px,2.3vw,34px)] leading-[1.05] font-[660] tracking-[-0.025em] hover:no-underline">
                    {it.title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-8">
                    <div className={it.photo ? 'grid gap-6 md:grid-cols-[1.1fr_1fr]' : ''}>
                      <div>
                        <p className="max-w-[34rem] text-[17px] leading-[1.55] text-white/80">{it.lead}</p>
                        {it.body}
                      </div>
                      {it.photo ? <Photo id={it.photo.id} alt={it.photo.alt} className="aspect-[4/3] rounded-[16px]" unveil={false} /> : null}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
