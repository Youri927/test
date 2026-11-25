import {NextResponse} from 'next/server';

/* un lien de parrainage (respray.fr/r/CODE) : on garde le code 30 jours, puis direction l'inscription */
export async function GET(req: Request, {params}: {params: Promise<{code: string}>}) {
  const code = (await params).code.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 12);
  const r = NextResponse.redirect(new URL(`/inscription?parrain=${code}&retour=/vendre`, req.url));
  r.cookies.set('respray_parrain', code, {maxAge: 30 * 86400, httpOnly: true, sameSite: 'lax', path: '/'});
  return r;
}
