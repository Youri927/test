// Les versions allégées des grandes photos (1200 px de large), servies aux téléphones par le build web (srcset, voir photos.ts),
// et les vignettes des photos de modèles (336 px) pour le comparateur.
// Le build en un seul fichier les remplace par photo-small.stub.ts : tout y est déjà intégré, elles ne feraient que l'alourdir.
export const small = import.meta.glob<string>('../assets/photos-s/*.avif', { eager: true, query: '?url', import: 'default' })
export const thumbs = import.meta.glob<string>('../assets/photos-t/*.avif', { eager: true, query: '?url', import: 'default' })
