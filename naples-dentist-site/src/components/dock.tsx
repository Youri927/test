// Téléphone : une barre « Call / Request a visit » suit la page, sauf sur l'ouverture, la demande et le pied de page.
import { Phone } from 'lucide-react'
import { useEffect, useState } from 'react'

import { PHONE_HREF } from '@/data/content'
import { go } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function Dock() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const visible = new Set(['top'])
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target.id)
        else visible.delete(e.target.id)
      }
      setShow(visible.size === 0)
    })
    for (const id of ['top', 'request', 'site-footer']) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] md:hidden',
        show ? 'translate-y-0' : 'translate-y-[130%]',
      )}
      aria-hidden={!show}
    >
      <div className="grid grid-cols-2 gap-1.5 rounded-full bg-white p-1.5 shadow-[0_14px_36px_-14px_rgb(11_35_38/0.5)] ring-1 ring-ink/10">
        <a href={PHONE_HREF} className="btn btn-ink btn-sm" tabIndex={show ? 0 : -1}>
          <Phone className="size-4" aria-hidden />
          Call
        </a>
        <a href="#request" onClick={(e) => go(e, 'request')} className="btn btn-teal btn-sm" tabIndex={show ? 0 : -1}>
          Request a visit
        </a>
      </div>
    </div>
  )
}
