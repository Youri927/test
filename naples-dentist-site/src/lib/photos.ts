// Photos du site : adresse (fichier ou data URL selon le build) et dimensions, par identifiant.
// Les fichiers viennent de tools/images.py, d'après data/photos.json.
import sizes from '@/data/photo-sizes.json'

const files = import.meta.glob<string>('../assets/photos/*.avif', { eager: true, query: '?url', import: 'default' })

export type PhotoId = keyof typeof sizes

export function photo(id: PhotoId) {
  const src = files[`../assets/photos/${id}.avif`]
  const [width, height] = sizes[id]
  return { src, width, height }
}
