// La demande : ce que le visiteur prévoit, le bassin choisi dans le comparateur s'il y en a un, et ses coordonnées.
// Le formulaire est une démonstration (rien n'est envoyé) : à brancher avant la mise en ligne, voir le README.
import { ArrowRight, Mail, MapPin, MessageSquareText, Phone, X } from 'lucide-react'
import { RadioGroup } from 'radix-ui'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { Lines } from '@/components/lines'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useChoice } from '@/lib/choice'
import { photo } from '@/lib/photos'
import { feet, finishById, modelById } from '@/lib/pools'
import { AREAS, EMAIL, LICENSE, PHONE, sms, TEL } from '@/lib/site'
import { cn } from '@/lib/utils'

const PLANS = ['New fiberglass pool', 'New concrete pool', 'Liner replacement', 'Resurfacing or tile', 'Pump, salt or automation', 'Hot tub repair'] as const

export function Contact() {
  const { request, setRequest } = useChoice()
  const [plan, setPlan] = useState<string>('')
  const [sent, setSent] = useState<{ name: string; summary: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const form = useRef<HTMLFormElement>(null)

  // un bassin demandé depuis le comparateur : c'est un projet de piscine coque
  useEffect(() => {
    if (request) setPlan('New fiberglass pool')
  }, [request])

  const chosen = request ? modelById(request.model) : null
  const chosenSize = chosen ? (chosen.sizes[request!.size] ?? chosen.sizes[0]) : null

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const phone = String(data.get('phone') ?? '').trim()
    const err = { name: !name, phone: phone.replace(/\D/g, '').length < 10 }
    setErrors(err)
    if (err.name || err.phone) {
      form.current?.querySelector<HTMLInputElement>(err.name ? '#name' : '#phone')?.focus()
      return
    }
    const parts = [plan || 'A pool project', chosen && chosenSize ? `${chosen.name} ${feet(chosenSize.l)} in ${finishById(request!.finish).name}` : ''].filter(Boolean)
    setSent({ name: name.split(/\s+/)[0], summary: parts.join(' · ') })
  }

  return (
    <section id="contact" tabIndex={-1} className="relative bg-deck">
      <div className="wrap grid gap-x-12 gap-y-12 pt-[clamp(80px,10vw,150px)] pb-[clamp(80px,10vw,150px)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Lines className="t-h2">Tell us about your pool</Lines>
          <p className="t-lead mt-6 max-w-[30rem] text-ink-soft" data-up>
            A new pool, a liner, a repair: we answer within 24 hours.
          </p>
          <ul className="mt-10 grid gap-5 text-[17px]" data-up>
            <li className="flex gap-4">
              <Phone className="mt-1 size-5 shrink-0" aria-hidden />
              <div>
                <a href={TEL} className="ul tnum font-[650]">
                  {PHONE}
                </a>
                <p className="text-[15px] text-ink-soft">
                  Call, or{' '}
                  <a href={sms()} className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
                    text a photo of your pool
                  </a>{' '}
                  for a free estimate
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <Mail className="mt-1 size-5 shrink-0" aria-hidden />
              <a href={`mailto:${EMAIL}`} className="ul font-[650]">
                {EMAIL}
              </a>
            </li>
            <li className="flex gap-4">
              <MapPin className="mt-1 size-5 shrink-0" aria-hidden />
              <div>
                <p className="font-[650]">Based in Altamonte Springs</p>
                <p className="text-[15px] text-ink-soft">Building in {AREAS.slice(1).join(', ')} and across Central Florida</p>
              </div>
            </li>
          </ul>
          <p className="mt-10 border-t border-ink/15 pt-5 text-[14.5px] leading-relaxed text-ink-soft" data-up>
            Florida State licensed swimming pool contractor <span className="tnum">{LICENSE}</span>, licensed and insured. 20+ years of pool construction.
          </p>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-[24px] bg-white p-6 shadow-[0_1px_0_rgb(10_26_36/0.06),0_24px_60px_-30px_rgb(10_26_36/0.25)] sm:p-9" data-up>
            {sent ? (
              <div className="py-6 sm:py-10" role="status">
                <p className="text-[clamp(30px,3vw,44px)] leading-[1.02] font-[680] tracking-[-0.03em]">Thanks, {sent.name}. Your request is in.</p>
                <p className="mt-4 text-[17px] text-ink-soft">{sent.summary}</p>
                <p className="mt-2 text-[17px] text-ink-soft">We answer within 24 hours. In a hurry? Call {PHONE}.</p>
                <button type="button" onClick={() => setSent(null)} className="btn btn-line mt-8">
                  Send another request
                </button>
              </div>
            ) : (
              <form ref={form} onSubmit={submit} noValidate className="grid gap-7">
                <fieldset>
                  <legend className="text-[17px] font-[650]">What are you planning?</legend>
                  <RadioGroup.Root value={plan} onValueChange={setPlan} className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="What are you planning?">
                    {PLANS.map((p) => (
                      <RadioGroup.Item key={p} value={p} className="plan">
                        <span className="plan-dot" aria-hidden />
                        {p}
                      </RadioGroup.Item>
                    ))}
                  </RadioGroup.Root>
                </fieldset>

                {chosen && chosenSize ? (
                  <div className="flex items-center gap-3 rounded-[14px] bg-deck p-3 pr-2">
                    <img src={photo(`chip-${request!.finish}`).src} alt="" width={36} height={36} className="size-9 rounded-full" />
                    <div className="min-w-0 flex-1 text-[15px] leading-tight">
                      <p className="font-[650]">
                        {chosen.name} <span className="tnum">{feet(chosenSize.l)}</span>
                      </p>
                      <p className="text-ink-soft">{finishById(request!.finish).name}, from the model list</p>
                    </div>
                    <button type="button" onClick={() => setRequest(null)} className="grid size-10 place-items-center rounded-full text-ink-soft hover:bg-white hover:text-ink" aria-label="Remove this pool from the request">
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                ) : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="name" label="Name" required error={errors.name ? 'Please tell us your name' : ''}>
                    <Input id="name" name="name" autoComplete="name" aria-invalid={errors.name || undefined} aria-describedby={errors.name ? 'name-err' : undefined} className="field" />
                  </Field>
                  <Field id="phone" label="Phone" required error={errors.phone ? 'A 10-digit phone number, please' : ''}>
                    <Input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" aria-invalid={errors.phone || undefined} aria-describedby={errors.phone ? 'phone-err' : undefined} className="field" />
                  </Field>
                  <Field id="email" label="Email" hint="optional">
                    <Input id="email" name="email" type="email" autoComplete="email" className="field" />
                  </Field>
                  <Field id="city" label="City" hint="optional">
                    <Input id="city" name="city" autoComplete="address-level2" placeholder="Winter Park" className="field" />
                  </Field>
                </div>
                <Field id="message" label="Anything we should know?" hint="optional">
                  <Textarea id="message" name="message" rows={4} placeholder="The size of the yard, the timing, a photo you can text us…" className="field min-h-[120px]" />
                </Field>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <button type="submit" className="btn btn-ink">
                    Send to Gracie Pools
                    <ArrowRight className="btn-arrow size-[18px]" aria-hidden />
                  </button>
                  <a href={sms()} className="inline-flex items-center gap-2 text-[15px] font-[600] text-ink-soft hover:text-ink">
                    <MessageSquareText className="size-4" aria-hidden />
                    Or text us a photo
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({ id, label, hint, required, error, children }: { id: string; label: string; hint?: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-[15px] font-[600]">
        {label}
        {required ? <span className="sr-only"> (required)</span> : null}
        {hint ? <span className="font-[450] text-ink-soft"> · {hint}</span> : null}
      </Label>
      {children}
      <p id={`${id}-err`} className={cn('text-[14px] text-destructive', !error && 'sr-only')} aria-live="polite">
        {error}
      </p>
    </div>
  )
}
