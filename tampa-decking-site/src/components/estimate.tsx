// Demande de devis, sur le jaune du logo. Leur formulaire actuel ne s'affiche pas (code WPForms brut),
// celui-ci fonctionne : choix du projet, coordonnées, ville, détails, moyen de contact préféré.
// Ici c'est une démonstration : rien n'est envoyé, un message de confirmation s'affiche.
import { ArrowRight, Check, Mail, Phone } from 'lucide-react'
import { RadioGroup as RadioPrimitive } from 'radix-ui'
import { useId, useState, type FormEvent } from 'react'

import { Lines } from '@/components/lines'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cities, EMAIL, nextSteps, PHONE, PHONE_HREF, projectTypes } from '@/data/content'
import { cn } from '@/lib/utils'

const field = 'h-14 rounded-[6px] border-0 bg-white px-4 text-[16px] shadow-[inset_0_0_0_1.5px_#c9d8e1] transition-shadow placeholder:text-ink-soft/60 focus-visible:shadow-[inset_0_0_0_2px_var(--ink)] focus-visible:ring-0 aria-invalid:shadow-[inset_0_0_0_2px_#b42318] aria-invalid:ring-0 md:text-[16px]'
const label = 'text-[14px] font-[620] text-ink'

type Errors = Partial<Record<'name' | 'contact' | 'email' | 'phone', string>>

export function Estimate() {
  const uid = useId()
  const [types, setTypes] = useState<string[]>([])
  const [reach, setReach] = useState('Call')
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState<string | null>(null)

  const toggle = (t: string) => setTypes((v) => (v.includes(t) ? v.filter((x) => x !== t) : [...v, t]))

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') ?? '').trim()
    const phone = String(f.get('phone') ?? '').trim()
    const email = String(f.get('email') ?? '').trim()
    const err: Errors = {}
    if (!name) err.name = 'Please tell us your name.'
    if (!phone && !email) err.contact = 'Leave a phone number or an email so we can reach you.'
    if (phone && phone.replace(/\D/g, '').length < 10) err.phone = 'This phone number looks too short.'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = 'This email address looks incomplete.'
    setErrors(err)
    if (Object.keys(err).length) {
      const first = e.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')
      first?.focus()
      return
    }
    setSent(name.split(' ')[0])
  }

  return (
    <section id="estimate" tabIndex={-1} className="bg-sun text-ink" aria-labelledby="estimate-title">
      <div className="wrap grid gap-12 py-[clamp(88px,11vw,176px)] lg:grid-cols-[1fr_1.3fr] lg:gap-[clamp(48px,6vw,104px)]">
        <div className="flex flex-col">
          <Lines id="estimate-title" className="t-h2 max-w-[10ch]">Get a free estimate</Lines>
          <p data-up className="t-lead mt-6 max-w-[28rem]">
            Tell us about your pool and deck. The more you share, the more accurate our assessment.
          </p>
          <div data-up className="mt-10">
            <p className="text-[15px] font-[620]">What happens next</p>
            <ol className="mt-4 grid gap-4">
              {nextSteps.map((s, i) => (
                <li key={s.name} className="grid grid-cols-[28px_1fr] gap-x-3">
                  <span className="t-num grid size-7 place-items-center rounded-full bg-ink text-[13px] text-white" aria-hidden>{i + 1}</span>
                  <p className="pt-[3px] text-[16px] leading-snug">
                    <span className="font-[620]">{s.name}.</span> <span className="text-ink/80">{s.text}</span>
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <div data-up className="mt-auto grid gap-3 pt-12">
            <p className="text-[15px] font-[600]">Prefer to talk?</p>
            <a href={PHONE_HREF} className="t-h3 inline-flex w-fit items-center gap-3">
              <Phone className="size-6" aria-hidden />
              <span className="ul">{PHONE}</span>
            </a>
            <a href={`mailto:${EMAIL}`} className="inline-flex w-fit items-center gap-3 text-[16px] font-[560]">
              <Mail className="size-[18px]" aria-hidden />
              <span className="ul">{EMAIL}</span>
            </a>
          </div>
        </div>

        <div data-up className="rounded-[6px] bg-white p-[clamp(20px,3vw,44px)] shadow-[0_40px_80px_-48px_rgb(4_66_111/0.55)]">
          {sent ? (
            <div className="panel-in grid min-h-[480px] content-center gap-5 text-center" role="status">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-sun">
                <Check className="size-7" aria-hidden />
              </span>
              <p className="t-h3">Thanks, {sent}. Your request is in.</p>
              <p className="mx-auto max-w-[26rem] text-ink-soft">We aim to get back to you within 24 hours. Need us sooner? Call {PHONE}.</p>
              <button onClick={() => { setSent(null); setTypes([]) }} className="ul mx-auto mt-2 w-fit text-[15px] font-[600]">
                Send another request
              </button>
            </div>
          ) : (
            <form noValidate onSubmit={submit} className="grid gap-7">
              <fieldset>
                <legend className={label}>What do you need?</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {projectTypes.map((t) => {
                    const on = types.includes(t)
                    return (
                      <button
                        type="button"
                        key={t}
                        aria-pressed={on}
                        onClick={() => toggle(t)}
                        className={cn('chip', on ? 'bg-ink text-white shadow-[inset_0_0_0_1.5px_var(--ink)]' : 'text-ink hover:shadow-[inset_0_0_0_1.5px_var(--ink)]')}
                      >
                        <span className={cn('grid size-4 place-items-center rounded-full transition-colors', on ? 'bg-sun text-ink' : 'shadow-[inset_0_0_0_1.5px_#9db4c2]')} aria-hidden>
                          {on && <Check className="size-3" strokeWidth={3} />}
                        </span>
                        {t}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor={`${uid}-name`} className={label}>Name</Label>
                  <Input id={`${uid}-name`} name="name" autoComplete="name" className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${uid}-name-e` : undefined} />
                  {errors.name && <p id={`${uid}-name-e`} className="text-[13.5px] text-[#b42318]">{errors.name}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`${uid}-phone`} className={label}>Phone</Label>
                  <Input id={`${uid}-phone`} name="phone" type="tel" autoComplete="tel" inputMode="tel" className={field} aria-invalid={!!(errors.phone || errors.contact)} aria-describedby={errors.phone || errors.contact ? `${uid}-phone-e` : undefined} />
                  {(errors.phone || errors.contact) && <p id={`${uid}-phone-e`} className="text-[13.5px] text-[#b42318]">{errors.phone ?? errors.contact}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`${uid}-email`} className={label}>Email</Label>
                  <Input id={`${uid}-email`} name="email" type="email" autoComplete="email" className={field} aria-invalid={!!errors.email} aria-describedby={errors.email ? `${uid}-email-e` : undefined} />
                  {errors.email && <p id={`${uid}-email-e`} className="text-[13.5px] text-[#b42318]">{errors.email}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`${uid}-city`} className={label}>City</Label>
                  <Input id={`${uid}-city`} name="city" list={`${uid}-cities`} autoComplete="address-level2" className={field} />
                  <datalist id={`${uid}-cities`}>
                    {cities.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`${uid}-msg`} className={label}>Tell us about your project</Label>
                <Textarea
                  id={`${uid}-msg`}
                  name="message"
                  rows={4}
                  placeholder="The shape and size of your pool, its finish today, what you would like to change…"
                  className={cn(field, 'h-auto min-h-[132px] py-3.5 leading-normal')}
                />
              </div>

              <fieldset>
                <legend className={label}>Best way to reach you</legend>
                <RadioPrimitive.Root value={reach} onValueChange={setReach} className="mt-3 flex flex-wrap gap-2" aria-label="Best way to reach you">
                  {['Call', 'Text', 'Email'].map((r) => (
                    <RadioPrimitive.Item
                      key={r}
                      value={r}
                      className={cn('chip', reach === r ? 'bg-ink text-white shadow-[inset_0_0_0_1.5px_var(--ink)]' : 'text-ink hover:shadow-[inset_0_0_0_1.5px_var(--ink)]')}
                    >
                      {r}
                    </RadioPrimitive.Item>
                  ))}
                </RadioPrimitive.Root>
              </fieldset>

              <div className="grid gap-3 pt-1">
                <button type="submit" className="btn btn-ink w-full justify-center">
                  Send my request
                  <ArrowRight className="arr size-[18px]" aria-hidden />
                </button>
                <p className="text-center text-[13.5px] text-ink-soft">Free, with no obligation.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
