import {lirePhoto} from '@/lib/photos';

/* les photos envoyées par les vendeurs ; les noms sont aléatoires et ne se devinent pas */
export async function GET(_: Request, {params}: {params: Promise<{nom: string}>}) {
  const {nom} = await params;
  const p = await lirePhoto(nom);
  if (!p) return new Response('Introuvable', {status: 404});
  return new Response(new Uint8Array(p.data), {headers: {'Content-Type': p.type, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff'}});
}
