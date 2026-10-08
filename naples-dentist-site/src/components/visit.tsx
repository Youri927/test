// Venir au cabinet : l'immeuble, l'adresse et l'itinéraire, les horaires (le jour en cours en avant),
// le téléphone et la ligne d'urgence ; puis la demande de rendez-vous et les questions fréquentes.
// Le formulaire est une démonstration : rien n'est envoyé, un message de confirmation s'affiche.
import { ArrowRight, ArrowUpRight, Check, Phone, Plus } from 'lucide-react'
import { Accordion as AccordionPrimitive, RadioGroup as RadioPrimitive } from 'radix-ui'
import { useId, useState, type CSSProperties, type FormEvent } from 'react'

import { Lines } from '@/components/lines'
import { OfficeState } from '@/components/office-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CITY, EMAIL, EMERGENCY, EMERGENCY_SMS, faq, HOURS, MAPS, PHONE, PHONE_HREF, situations, STREET, UNIT } from '@/data/content'
import { useOfficeStatus } from '@/lib/office'
import { photo } from '@/lib/photos'
import { useReason } from '@/lib/sheet'
import { cn } from '@/lib/utils'

const office = photo('office')
const field =
  'h-14 rounded-[var(--radius)] border-0 bg-white px-4 text-[16px] shadow-[inset_0_0_0_1.5px_rgb(11_35_38/0.18)] transition-shadow placeholder:text-ink-soft/60 focus-visible:shadow-[inset_0_0_0_2px_var(--ink)] focus-visible:ring-0 aria-invalid:shadow-[inset_0_0_0_2px_#b42318] aria-invalid:ring-0 md:text-[16px]'
const label = 'text-[14px] font-[600] text-ink'
// lundi en premier, comme sur leur page
const WEEK = [1, 2, 3, 4, 5, 6, 0]
const reasons = [...situations.map((s) => s.say), 'A check-up or cleaning', 'Something else']

type Errors = Partial<Record<'name' | 'phone' | 'email', string>>

function Hours() {
  const s = useOfficeStatus()
  return (
    <table className="w-full text-[16px]">
      <caption className="sr-only">Office hours</caption>
      <tbody>
        {WEEK.map((d) => {
          const today = s?.today === d
          return (
            <tr key={d} className={cn('border-b border-line', today && 'font-[600]')}>
              <th scope="row" className="py-2.5 text-left font-[inherit]">
                <span className="inline-flex items-center gap-2.5">
                  {HOURS[d].day}
                  {today && <span className="rounded-full bg-ink px-2 py-0.5 text-[12px] font-[600] text-white">Today</span>}
                </span>
              </th>
              <td className={cn('py-2.5 text-right', !today && 'text-ink-soft')}>{HOURS[d].label}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function RequestForm() {
  const uid = useId()
  const preset = useReason()
  const [why, setWhy] = useState('')
  const [when, setWhen] = useState('Any time')
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState<string | null>(null)
  const [seen, setSeen] = useState(0)

  // motif choisi dans une fiche (« Request a visit ») : on coche la situation correspondante
  if (preset.n !== seen) {
    setSeen(preset.n)
    if (preset.text) {
      setWhy(reasons.includes(preset.text) ? preset.text : 'Something else')
      setSent(null)
    }
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') ?? '').trim()
    const phone = String(f.get('phone') ?? '').trim()
    const email = String(f.get('email') ?? '').trim()
    const err: Errors = {}
    if (!name) err.name = 'Please tell us your name.'
    if (phone.replace(/\D/g, '').length < 10) err.phone = phone ? 'This phone number looks too short.' : 'Leave a phone number so the office can call you.'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = 'This email address looks incomplete.'
    setErrors(err)
    if (Object.keys(err).length) {
      e.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    setSent(name.split(' ')[0])
  }

  if (sent)
    return (
      <div className="grid min-h-[520px] content-center justify-items-center gap-5 text-center" role="status">
        <span className="grid size-16 place-items-center rounded-full bg-teal">
          <Check className="size-7" aria-hidden />
        </span>
        <p className="t-h3">Thanks, {sent}. Your request is in.</p>
        <p className="max-w-[26rem] text-ink-soft">To book right away, call {PHONE}, Monday to Friday, 8 AM to 5 PM.</p>
        <button
          type="button"
          onClick={() => {
            setSent(null)
            setWhy('')
          }}
          className="ul mt-2 w-fit text-[15px] font-[600]"
        >
          Send another request
        </button>
      </div>
    )

  return (
    <form noValidate onSubmit={submit} className="grid gap-7">
      <fieldset>
        <legend className={label}>What brings you in?</legend>
        <RadioPrimitive.Root value={why} onValueChange={setWhy} className="mt-3 flex flex-wrap gap-2" aria-label="What brings you in?">
          {reasons.map((r) => (
            <RadioPrimitive.Item key={r} value={r} className="chip">
              {r}
            </RadioPrimitive.Item>
          ))}
        </RadioPrimitive.Root>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor={`${uid}-name`} className={label}>
            Name
          </Label>
          <Input id={`${uid}-name`} name="name" autoComplete="name" className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${uid}-name-e` : undefined} />
          {errors.name && (
            <p id={`${uid}-name-e`} className="text-[13.5px] text-[#b42318]">
              {errors.name}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${uid}-phone`} className={label}>
            Phone
          </Label>
          <Input id={`${uid}-phone`} name="phone" type="tel" autoComplete="tel" inputMode="tel" className={field} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${uid}-phone-e` : undefined} />
          {errors.phone && (
            <p id={`${uid}-phone-e`} className="text-[13.5px] text-[#b42318]">
              {errors.phone}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${uid}-email`} className={label}>
            Email <span className="font-[450] text-ink-soft">(optional)</span>
          </Label>
          <Input id={`${uid}-email`} name="email" type="email" autoComplete="email" className={field} aria-invalid={!!errors.email} aria-describedby={errors.email ? `${uid}-email-e` : undefined} />
          {errors.email && (
            <p id={`${uid}-email-e`} className="text-[13.5px] text-[#b42318]">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <fieldset>
        <legend className={label}>Best time to call you</legend>
        <RadioPrimitive.Root value={when} onValueChange={setWhen} className="mt-3 flex flex-wrap gap-2" aria-label="Best time to call you">
          {['Any time', 'Morning', 'Afternoon'].map((r) => (
            <RadioPrimitive.Item key={r} value={r} className="chip">
              {r}
            </RadioPrimitive.Item>
          ))}
        </RadioPrimitive.Root>
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor={`${uid}-msg`} className={label}>
          Anything we should know? <span className="font-[450] text-ink-soft">(optional)</span>
        </Label>
        <Textarea id={`${uid}-msg`} name="message" rows={3} className={cn(field, 'h-auto min-h-[112px] py-3.5 leading-normal')} />
      </div>

      <button type="submit" className="btn btn-ink w-full">
        Send my request
        <ArrowRight className="arr size-[18px]" aria-hidden />
      </button>
    </form>
  )
}

export function Visit() {
  return (
    <section id="visit" tabIndex={-1} aria-labelledby="visit-title" className="relative bg-white">
      <div className="wrap py-[clamp(88px,11vw,170px)]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <Lines id="visit-title" className="t-h2">
            Our new office is open
          </Lines>
          <p data-up className="t-lead max-w-[34rem] text-ink-soft">
            Unit 201, in the building with the Dentist sign on Tamiami Trail East.
          </p>
        </div>

        <div className="mt-[clamp(48px,6vw,96px)] grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-[clamp(48px,6vw,110px)]">
          <figure className="unveil rounded-[var(--radius)] lg:self-start">
            <div className="unveil-in">
              <img src={office.src} width={office.width} height={office.height} alt="The office building on Tamiami Trail East, with palm trees and the Dentist sign" loading="lazy" className="aspect-[4/4.2] w-full object-cover object-[50%_60%]" />
            </div>
          </figure>

          <div className="flex flex-col">
            <address data-up className="not-italic">
              <p className="text-[clamp(26px,2.4vw,38px)] leading-[1.08] font-[560] tracking-[-0.025em] [font-stretch:90%]">
                {STREET}, {UNIT}
                <br />
                {CITY}
              </p>
              <a href={MAPS} target="_blank" rel="noopener" className="group mt-4 inline-flex items-center gap-2 font-[600]">
                <span className="ul">Get directions</span>
                <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </a>
            </address>

            <div data-up className="mt-10">
              <OfficeState className="mb-4" />
              <Hours />
            </div>

            <div data-up className="mt-10 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[14px] font-[600] text-ink-soft">Call the office</p>
                <a href={PHONE_HREF} className="t-h3 mt-1 inline-flex items-center gap-2.5">
                  <Phone className="size-5" aria-hidden />
                  <span className="ul">{PHONE}</span>
                </a>
              </div>
              <div>
                <p className="text-[14px] font-[600] text-ink-soft">Emergency line</p>
                <a href={EMERGENCY_SMS} className="t-h3 mt-1 inline-block">
                  <span className="ul">Text {EMERGENCY}</span>
                </a>
                <p className="mt-1 text-[14.5px] text-ink-soft">Someone will call you.</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[14px] font-[600] text-ink-soft">Email</p>
                <a href={`mailto:${EMAIL}`} className="mt-1 inline-block text-[17px] font-[560] break-all">
                  <span className="ul">{EMAIL}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="request" tabIndex={-1} className="scroll-mt-[var(--header)] bg-teal">
        <div className="wrap grid gap-14 py-[clamp(80px,10vw,150px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-[clamp(48px,6vw,110px)]">
          <div>
            <Lines className="t-h2">Request a visit</Lines>
            <p data-up className="t-lead mt-6 max-w-[30rem]">
              Leave your number and what brings you in, and the office will call you to set a time.
            </p>

            <div data-up className="mt-12">
              <p className="font-[600]">Questions patients ask</p>
              <AccordionPrimitive.Root type="single" collapsible className="mt-4 border-t-[1.5px] border-ink">
                {faq.map((f, i) => (
                  <AccordionPrimitive.Item key={f.q} value={`q${i}`} className="border-b border-ink/25">
                    <AccordionPrimitive.Header>
                      <AccordionPrimitive.Trigger className="faq-q group flex w-full items-center justify-between gap-6 py-5 text-left">
                        <span className="text-[clamp(18px,1.5vw,22px)] leading-[1.25] font-[560] tracking-[-0.015em]">{f.q}</span>
                        <span className="grid size-9 shrink-0 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--ink)] transition-[transform,background-color,color] duration-500 group-hover:bg-ink group-hover:text-white group-data-[state=open]:rotate-45">
                          <Plus className="size-4" aria-hidden />
                        </span>
                      </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionPrimitive.Content className="faq-a overflow-hidden">
                      <p className="max-w-[34rem] pb-6 text-[16.5px] leading-[1.55]">{f.a}</p>
                    </AccordionPrimitive.Content>
                  </AccordionPrimitive.Item>
                ))}
              </AccordionPrimitive.Root>
            </div>
          </div>

          <div data-up className="rounded-[calc(var(--radius)*1.6)] bg-white p-[clamp(20px,3vw,44px)]" style={{ '--d': '0.1s' } as CSSProperties}>
            <RequestForm />
          </div>
        </div>
      </div>
    </section>
  )
}
