// Les questions fréquentes : celles de leur page liners, et les réponses que la fiche Barrier Reef et leurs pages modèles donnent.
import { Lines } from '@/components/lines'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { EMAIL } from '@/lib/site'

const QA = [
  {
    q: 'How long does a vinyl liner last?',
    a: 'Seven years on average. Some make it ten years or longer: keeping the pH and chlorine in the right range helps. After seven years of sun and chlorine, it is usually time for a new one.',
  },
  {
    q: 'How do I choose a liner?',
    a: 'Start with a color scheme you like: blue and gray, blue and green, blue and brown, earth tones, green or tan. Then decide whether it looks better in lighter, medium or darker shades. There is a color and a shade for everyone.',
  },
  {
    q: 'Can you put a vinyl liner in a concrete pool?',
    a: 'It is possible, but most of the time it is not cost-effective.',
  },
  {
    q: 'How deep are the plunge pools?',
    a: 'The Crispin and the Pixie are 3′ 11″ all over, the Escape 4′ 7″. The Coral Cay goes from 3′ 6″ to 5′ 3″ in its 30-foot size.',
  },
  {
    q: 'Can you swim in a plunge pool?',
    a: 'Yes. With swim jets you swim against a current, a low-impact workout. The Escape has a wide swim lane for exactly that.',
  },
  {
    q: 'What does a fiberglass pool cost?',
    a: 'It depends on the model and its size, the features you add and your yard. Send us a photo or a message and we will quote your project.',
  },
]

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative bg-white">
      <div className="wrap grid gap-x-12 gap-y-10 pt-[clamp(80px,10vw,150px)] pb-[clamp(72px,9vw,130px)] lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Lines id="faq-title" className="t-h2">
            Questions we hear
          </Lines>
          <p className="t-lead mt-6 text-ink-soft" data-up>
            Something else? Write to{' '}
            <a href={`mailto:${EMAIL}`} className="ul font-[600] text-ink">
              {EMAIL}
            </a>
          </p>
        </div>
        <Accordion type="single" collapsible className="lg:col-span-8">
          {QA.map((x, i) => (
            <AccordionItem key={x.q} value={`q${i}`} className="border-b border-ink/15" data-up>
              <AccordionTrigger className="faq-trigger py-6 text-left text-[clamp(20px,1.7vw,25px)] leading-[1.15] font-[620] tracking-[-0.015em] hover:no-underline">
                {x.q}
              </AccordionTrigger>
              <AccordionContent className="pb-7">
                <p className="max-w-[44rem] text-[17px] leading-[1.6] text-ink-soft">{x.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
