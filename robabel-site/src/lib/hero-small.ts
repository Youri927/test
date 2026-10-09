// Les calques de l'accueil en 1440 px, servis aux téléphones par le build web (voir hero.tsx).
// Le build en un seul fichier les remplace par hero-small.stub.ts : la version 2560 px y suffit.
export const small = import.meta.glob<string>('../assets/hero/*-1440.avif', { eager: true, query: '?url', import: 'default' })
