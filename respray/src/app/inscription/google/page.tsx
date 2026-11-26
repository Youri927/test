import {redirect} from 'next/navigation';
import {cookies} from 'next/headers';
import {eq} from 'drizzle-orm';
import {db, schema} from '@/db';
import {FormFinirGoogle} from '@/components/FormulairesCompte';
import {COOKIE_IDENTITE, deballer} from '@/lib/google';
import {moi} from '@/lib/auth';

export const metadata = {title: 'Créer un compte'};
export const dynamic = 'force-dynamic';

/* un pseudo proposé à partir de l'adresse, libre */
async function pseudoLibre(email: string) {
  const base = (email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'membre').slice(0, 20).padEnd(3, '0');
  for (let n = 0; n < 20; n++) {
    const p = n ? `${base}${n + 1}` : base;
    if (!(await db.query.membres.findFirst({where: eq(schema.membres.pseudo, p)}))) return p;
  }
  return '';
}

export default async function Page({searchParams}: {searchParams: Promise<{retour?: string}>}) {
  const {retour = '/compte'} = await searchParams;
  if (await moi()) redirect(retour);
  const i = deballer((await cookies()).get(COOKIE_IDENTITE)?.value);
  if (!i) redirect('/connexion?erreur=google');
  return (
    <div className="env page page-etroite">
      <h1 className="titre-page">Presque fini</h1>
      <p className="chapo">Connecté avec Google : {i.email}. Choisissez votre pseudo, et c'est prêt.</p>
      <FormFinirGoogle retour={retour} prenom={i.prenom} nom={i.nom} pseudo={await pseudoLibre(i.email)} />
    </div>
  );
}
