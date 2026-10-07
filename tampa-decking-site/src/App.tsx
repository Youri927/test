// Page de démonstration du starter : chaque bloc montre une brique réutilisable.
// Pour un vrai site, on garde la structure (motion, Lines, composants ui/) et on remplace tout le contenu.
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Menu } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Lines } from '@/components/lines'
import { gsap, motion, pauseScroll, scrollToId, startSmoothScroll } from '@/lib/motion'

const NAV = [['work', 'Work'], ['services', 'Services'], ['faq', 'FAQ'], ['quote', 'Get a quote']] as const

export default function App() {
  const hero = useRef<HTMLDivElement>(null)
  const [menu, setMenu] = useState(false)
  const [sent, setSent] = useState<string | null>(null)

  useEffect(() => {
    startSmoothScroll()
    if (!motion() || !hero.current) return
    // ouverture : la photo se dévoile (transform uniquement), puis le texte monte
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-wipe]', { yPercent: 0 }, { yPercent: -101, duration: 1.3, ease: 'expo.inOut', delay: 0.2 })
      gsap.fromTo('[data-up]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.5 })
    }, hero)
    return () => ctx.revert()
  }, [])

  useEffect(() => { pauseScroll(menu) }, [menu])

  const go = (id: string) => { setMenu(false); scrollToId(id) }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setSent(String(f.get('first') || ''))
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border/60 bg-background px-4 md:px-12">
        <a href="#top" className="font-heading text-lg font-bold text-ink">Brand</a>
        <nav className="hidden gap-8 md:flex">
          {NAV.slice(0, 3).map(([id, label]) => (
            <button key={id} onClick={() => go(id)} className="text-sm font-medium hover:text-ink">{label}</button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="brand" size="lg" className="hidden sm:inline-flex" onClick={() => go('quote')}>Get a quote <ArrowRight /></Button>
          <Sheet open={menu} onOpenChange={setMenu}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon-lg" className="md:hidden" aria-label="Menu"><Menu /></Button>
            </SheetTrigger>
            <SheetContent side="right" data-lenis-prevent className="bg-ink text-white">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav className="mt-16 flex flex-col gap-2 px-6">
                {NAV.map(([id, label]) => (
                  <button key={id} onClick={() => go(id)} className="text-left font-heading text-4xl font-bold">{label}</button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main id="top">
        <section ref={hero} className="px-4 pt-28 pb-16 md:px-12">
          <Lines as="h1" className="text-[clamp(48px,9vw,150px)] leading-[.88] font-bold">A headline set in the brand typeface</Lines>
          <p data-up className="mt-6 max-w-xl text-lg">Starter page: replace every word and every block with the client’s real content.</p>
          <div data-up className="mt-8 flex flex-wrap items-center gap-4">
            <Button variant="brand" size="xl" onClick={() => go('quote')}>Get a quote <ArrowRight /></Button>
            <Button variant="link" className="text-ink" onClick={() => go('work')}>See the work</Button>
          </div>
          <div className="relative mt-12 aspect-[21/9] overflow-hidden bg-ink/15">
            <div className="absolute inset-0 grid place-items-center text-ink/60">Hero photo</div>
            <div data-wipe className="absolute inset-0 bg-background" />
          </div>
        </section>

        <section id="work" className="px-4 py-24 md:px-12">
          <Lines className="max-w-3xl text-[clamp(36px,6vw,96px)] leading-[.95] font-bold">Photos open in an accessible viewer</Lines>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <Dialog key={n} onOpenChange={pauseScroll}>
                <DialogTrigger className="aspect-square bg-ink/10 text-ink/60 transition hover:bg-ink/20">Photo {n}</DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                  <DialogTitle>Photo {n}</DialogTitle>
                  <DialogDescription>Real description of what the photo shows.</DialogDescription>
                  <div className="aspect-[3/2] bg-ink/10" />
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </section>

        <section id="services" className="bg-muted px-4 py-24 md:px-12">
          <Lines className="max-w-3xl text-[clamp(36px,6vw,96px)] leading-[.95] font-bold">Two services, one place</Lines>
          <Tabs defaultValue="a" className="mt-10 max-w-2xl">
            <TabsList><TabsTrigger value="a">Service A</TabsTrigger><TabsTrigger value="b">Service B</TabsTrigger></TabsList>
            <TabsContent value="a" className="pt-4 text-lg">What the client really offers for service A.</TabsContent>
            <TabsContent value="b" className="pt-4 text-lg">What the client really offers for service B.</TabsContent>
          </Tabs>
        </section>

        <section id="faq" className="px-4 py-24 md:px-12">
          <Lines className="text-[clamp(36px,6vw,96px)] leading-[.95] font-bold">Questions</Lines>
          <Accordion type="single" collapsible className="mt-10 max-w-2xl">
            {['First real question', 'Second real question'].map((q, i) => (
              <AccordionItem key={q} value={String(i)}>
                <AccordionTrigger className="text-lg">{q}</AccordionTrigger>
                <AccordionContent className="text-base">Answer taken from the client’s own content.</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section id="quote" className="bg-muted px-4 py-24 md:px-12">
          <Lines className="text-[clamp(36px,6vw,96px)] leading-[.95] font-bold">Get a quote</Lines>
          {sent !== null ? (
            <p className="mt-10 font-heading text-3xl text-ink" role="status">Thank you{sent ? `, ${sent}` : ''}. (Demo: nothing is sent.)</p>
          ) : (
            <form onSubmit={submit} className="mt-10 grid max-w-2xl gap-5 bg-background p-6 md:p-10">
              <fieldset className="grid gap-3">
                <legend className="mb-3 text-sm font-medium">What are you interested in?</legend>
                <RadioGroup name="interest" defaultValue="a" className="flex gap-6">
                  <Label className="flex items-center gap-2"><RadioGroupItem value="a" /> Service A</Label>
                  <Label className="flex items-center gap-2"><RadioGroupItem value="b" /> Service B</Label>
                </RadioGroup>
              </fieldset>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="first">First name</Label><Input id="first" name="first" required autoComplete="given-name" /></div>
                <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required autoComplete="email" /></div>
              </div>
              <div className="grid gap-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" rows={4} /></div>
              <Button type="submit" variant="brand" size="xl" className="justify-self-start">Send my request <ArrowRight /></Button>
            </form>
          )}
        </section>
      </main>
    </>
  )
}
