// Sur téléphone : appeler ou envoyer une photo, toujours à portée de pouce, une fois l'accueil passé
// (la barre s'efface devant la section contact et le pied de page, qui ont déjà ces boutons).
import { MessageSquareText, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'

import { sms, TEL } from '@/lib/site'
import { cn } from '@/lib/utils'

export function MobileBar() {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const contact = document.getElementById('contact')
      const past = window.scrollY > window.innerHeight * 0.85
      const before = contact ? contact.getBoundingClientRect().top > window.innerHeight * 0.9 : true
      setShown(past && before)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] md:hidden',
        shown ? 'translate-y-0' : 'pointer-events-none translate-y-[130%]',
      )}
      aria-hidden={!shown}
    >
      <div className="grid grid-cols-[auto_1fr] gap-2 rounded-[18px] bg-ink p-2 shadow-[0_18px_40px_-12px_rgb(10_26_36/0.5)]">
        <a href={TEL} className="btn btn-sm btn-line-dark !h-12 !px-5" tabIndex={shown ? 0 : -1}>
          <Phone className="size-4" aria-hidden />
          Call
        </a>
        <a href={sms()} className="btn btn-sm btn-white !h-12" tabIndex={shown ? 0 : -1}>
          <MessageSquareText className="size-4" aria-hidden />
          Text a photo for a free estimate
        </a>
      </div>
    </div>
  )
}
