import Link from 'next/link';
import {notFound} from 'next/navigation';
import {and, asc, eq, ne} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre} from '@/lib/auth';
import {eur} from '@/lib/regles';
import {FormMessage} from '@/components/Echanges';

export const metadata = {title: 'Conversation'};
export const dynamic = 'force-dynamic';

const quand = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});

/* une conversation à propos d'une annonce, entre son vendeur et un acheteur */
export default async function Conversation({params, searchParams}: {params: Promise<{id: string}>; searchParams: Promise<{avec?: string}>}) {
  const id = Number((await params).id);
  const {avec} = await searchParams;
  const m = await exigerMembre(`/messages/${id}`);
  const a = await db.query.annonces.findFirst({where: eq(schema.annonces.id, id)});
  if (!a || !['publiee', 'vendue'].includes(a.statut)) notFound();
  const vendeur = a.vendeurId === m.id;
  const acheteurId = vendeur ? Number(avec) : m.id;
  if (!acheteurId || acheteurId === a.vendeurId) notFound();
  const autre = await db.query.membres.findFirst({where: eq(schema.membres.id, vendeur ? acheteurId : a.vendeurId)});
  const fil = await db.select().from(schema.messages).where(and(eq(schema.messages.annonceId, a.id), eq(schema.messages.acheteurId, acheteurId))).orderBy(asc(schema.messages.creeLe));
  await db.update(schema.messages).set({lu: true}).where(and(eq(schema.messages.annonceId, a.id), eq(schema.messages.acheteurId, acheteurId), ne(schema.messages.auteurId, m.id), eq(schema.messages.lu, false)));
  return (
    <div className="env page page-etroite">
      <nav className="fil" aria-label="Fil d'Ariane"><Link href="/messages">Messages</Link><span aria-hidden="true">›</span><span>{a.parfumNom}</span></nav>
      <h1 className="titre-page">{a.parfumNom}</h1>
      <p className="chapo">{a.maisonNom} · {eur(a.prix)} · avec @{autre?.pseudo} ({vendeur ? 'acheteur' : 'vendeur'}). <Link className="lien-souligne" href={`/annonces/${a.id}`}>Voir l'annonce</Link></p>
      <ol className="fil-messages">
        {fil.map((x) => (
          <li key={x.id} className={x.auteurId === m.id ? 'bulle moi' : 'bulle'}>
            <p>{x.texte}</p>
            <small>{quand.format(x.creeLe)}{x.masque ? ' · coordonnées masquées' : ''}</small>
          </li>
        ))}
      </ol>
      {!fil.length ? <p className="aide">{vendeur ? 'Aucun message.' : 'Une question sur le flacon, le niveau, l\'envoi ? Le vendeur est prévenu tout de suite.'}</p> : null}
      <FormMessage annonceId={a.id} acheteurId={vendeur ? acheteurId : undefined} />
    </div>
  );
}
