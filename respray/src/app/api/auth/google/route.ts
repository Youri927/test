import {NextResponse} from 'next/server';
import {COOKIE_DEMANDE, demande, googleActif} from '@/lib/google';

/* « Continuer avec Google » : direction Google, en gardant l'état, le vérificateur PKCE et la page de retour */
export async function GET(req: Request) {
  if (!googleActif()) return NextResponse.redirect(new URL('/connexion', req.url));
  const r = new URL(req.url).searchParams.get('retour') || '/compte';
  const retour = r.startsWith('/') && !r.startsWith('//') ? r : '/compte';
  const d = demande();
  const rep = NextResponse.redirect(d.url);
  rep.cookies.set(COOKIE_DEMANDE, JSON.stringify({etat: d.etat, verif: d.verif, retour}), {httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/'});
  return rep;
}
