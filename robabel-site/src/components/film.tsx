// Leur film (1 min 19 : la piscine aux motos vue du ciel, puis un local technique), dans un lecteur à la demande.
// Seulement dans la version en ligne (dist-web, fichier public/film/) : le fichier unique resterait trop lourd.
import { Play } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import poster from '@/assets/video/film-poster.avif?url'

export const hasFilm = import.meta.env.MODE === 'web'

export function Film() {
  return (
    <Dialog>
      <DialogTrigger className="btn btn-line">
        <Play aria-hidden="true" />
        Watch our film, 1 min 19
      </DialogTrigger>
      <DialogContent className="film-dialog max-w-[min(1100px,94vw)] border-0 bg-night p-0 text-white sm:max-w-[min(1100px,94vw)]">
        <DialogTitle className="sr-only">Custom Pools by Rob Abel, the film</DialogTitle>
        <DialogDescription className="sr-only">The motorcycle pool from the air, then a pump room. With sound.</DialogDescription>
        <video src="/film/custom-pools-by-rob-abel.mp4" poster={poster} controls autoPlay playsInline className="aspect-video w-full rounded-md bg-black" />
      </DialogContent>
    </Dialog>
  )
}
