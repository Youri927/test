// Photos du site : adresse (fichier ou data URL selon le build) et dimensions, par identifiant.
// Les fichiers viennent de tools/images.py, d'après data/photos.json.
import sizes from '@/data/photo-sizes.json'
import { small, thumbs } from '@/lib/photo-small'

const files = import.meta.glob<string>('../assets/photos/*.avif', { eager: true, query: '?url', import: 'default' })

export type PhotoId = keyof typeof sizes

export function photo(id: PhotoId) {
  const src = files[`../assets/photos/${id}.avif`]
  const [width, height, sw] = sizes[id]
  // la version allégée, quand il y en a une : le navigateur la choisit d'après la largeur affichée (sizes)
  const s = sw ? small[`../assets/photos-s/${id}.avif`] : undefined
  return { src, width, height, srcSet: s ? `${s} ${sw}w, ${src} ${width}w` : undefined, thumb: thumbs[`../assets/photos-t/${id}.avif`] as string | undefined }
}
