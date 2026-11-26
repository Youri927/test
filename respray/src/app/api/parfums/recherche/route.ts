import {NextResponse} from 'next/server';
import {chercher} from '@/lib/recherche-parfums';

/* la recherche au fil de la frappe (placard, vente) */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q') || '';
  const r = await chercher(q).catch(() => []);
  return NextResponse.json(r, {headers: {'Cache-Control': 'private, max-age=60'}});
}
