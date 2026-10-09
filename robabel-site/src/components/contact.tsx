// Le rendez-vous à domicile : leur numéro en très grand, et un formulaire court.
// Le formulaire est une démonstration : rien n'est envoyé (à brancher avant la mise en ligne).
import { useState, type FormEvent } from 'react'
import { Check, Mail, Phone } from 'lucide-react'
import { ToggleGroup } from 'radix-ui'

import { Lines } from '@/components/lines'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

// les champs de shadcn, redessinés pour le fond de nuit (cn fusionne ces classes avec les leurs)
const FIELD =
  'h-13 rounded-md border-white/25 bg-white/[.06] px-4 text-[17px] text-white placeholder:text-white/45 focus-visible:border-azure focus-visible:ring-azure/35 md:text-[17px] dark:bg-white/[.06]'

const PROJECTS = ['A new pool', 'A renovation', 'Equipment or a pump room', 'Landscaping or outdoor living']

export function Contact() {
  const [project, setProject] = useState(PROJECTS[0])
  const [sent, setSent] = useState<string | null>(null)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const name = String(new FormData(e.currentTarget).get('name') ?? '')
      .trim()
      .split(/\s+/)[0]
    setSent(name || 'there')
  }

  return (
    <section id="contact" aria-labelledby="contact-title" tabIndex={-1} className="contact on-dark bg-night pb-[clamp(72px,8vw,128px)] pt-[clamp(88px,11vw,176px)] text-white">
      <div className="wrap grid gap-x-[var(--gutter)] gap-y-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Lines id="contact-title" className="t-h2 max-w-[8em]">
            Book an in-home meeting
          </Lines>
          <p className="t-lead mt-8 max-w-[28em] text-white/80" data-up>
            Rob comes to you, looks at the yard and talks it through with you. Call, write, or leave your number here.
          </p>
          <a href={`tel:${site.phone.tel}`} className="big-phone tnum mt-12 block" data-up>
            {site.phone.display}
          </a>
          <p className="t-small mt-3 text-white/70 tnum" data-up>
            Or {site.phone.digits}, {site.hours.days.toLowerCase()}, {site.hours.time}.
          </p>
          <div className="mt-10 flex flex-wrap gap-3" data-up>
            <a href={`tel:${site.phone.tel}`} className="btn btn-azure tnum">
              <Phone aria-hidden="true" />
              Call Rob
            </a>
            <a href={`mailto:${site.email}`} className="btn btn-line-dark">
              <Mail aria-hidden="true" />
              {site.email}
            </a>
          </div>

          <div className="mt-16 max-w-[30em] border-t border-white/15 pt-6" data-up>
            <h3 className="t-h4">Financing</h3>
            <p className="t-small mt-2 text-white/72">
              For a new pool, a remodel or added features, we work with Lyon Financial: competitive rates and payment plans that fit the budget.{' '}
              <a href={site.financing} target="_blank" rel="noreferrer" className="flow font-semibold text-white">
                Apply at LyonFinancial.net
              </a>
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          {sent ? (
            <div className="form-done" role="status">
              <Check aria-hidden="true" className="size-8 text-azure" />
              <p className="t-h3 mt-6">Thanks, {sent}.</p>
              <p className="t-lead mt-3 text-white/80">Your request is ready for Rob. In this preview, nothing leaves the page.</p>
              <button type="button" onClick={() => setSent(null)} className="btn btn-line-dark mt-8">
                Write another request
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="form grid gap-6" aria-label="Request an in-home meeting">
              <div className="grid gap-2">
                <Label className="text-[15px] font-semibold" htmlFor="f-name">
                  Name
                </Label>
                <Input id="f-name" name="name" autoComplete="name" required className={FIELD} />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="text-[15px] font-semibold" htmlFor="f-phone">
                    Phone
                  </Label>
                  <Input id="f-phone" name="phone" type="tel" autoComplete="tel" required className={cn(FIELD, 'tnum')} />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[15px] font-semibold" htmlFor="f-town">
                    Town
                  </Label>
                  <select id="f-town" name="town" className="select" defaultValue="">
                    <option value="" disabled>
                      Choose
                    </option>
                    {site.towns.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                    <option>Elsewhere in Walton or Okaloosa</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-[15px] font-semibold" htmlFor="f-email">
                  Email <span className="font-normal text-white/60">(optional)</span>
                </Label>
                <Input id="f-email" name="email" type="email" autoComplete="email" className={FIELD} />
              </div>
              <fieldset className="grid gap-3">
                <legend className="text-sm font-medium">Your project</legend>
                <ToggleGroup.Root type="single" value={project} onValueChange={(v) => v && setProject(v)} aria-label="Your project" className="flex flex-wrap gap-2.5">
                  {PROJECTS.map((p) => (
                    <ToggleGroup.Item key={p} value={p} className="chip">
                      {p}
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup.Root>
                <input type="hidden" name="project" value={project} />
              </fieldset>
              <div className="grid gap-2">
                <Label className="text-[15px] font-semibold" htmlFor="f-msg">
                  Anything Rob should know <span className="font-normal text-white/60">(optional)</span>
                </Label>
                <Textarea id="f-msg" name="message" rows={4} className={cn(FIELD, 'h-auto min-h-[132px] py-3')} placeholder="The size of the yard, the timing, the pool you have now…" />
              </div>
              <button type="submit" className="btn btn-azure mt-2 justify-self-start">
                Request a meeting
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
