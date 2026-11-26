import Link from 'next/link';
import {desc, eq, or, inArray} from 'drizzle-orm';
import {db, schema} from '@/db';
import {exigerMembre} from '@/lib/auth';

export const metadata = {title: 'Messages'};
export const dynamic = 'force-dynamic';

/* les conversations : une par annonce et par acheteur, la plus récente en haut */
export default async function Messages() {
  const m = await exigerMembre('/messages');
  const mesAnnonces = (await db.select({id: schema.annonces.id}).from(schema.annonces).where(eq(schema.annonces.vendeurId, m.id))).map((x) => x.id);
  const liste = await db
    .select({msg: schema.messages, a: schema.annonces})
    .from(schema.messages)
    .innerJoin(schema.annonces, eq(schema.messages.annonceId, schema.annonces.id))
    .where(or(eq(schema.messages.acheteurId, m.id), inArray(schema.messages.annonceId, mesAnnonces.length ? mesAnnonces : [-1])))
    .orderBy(desc(schema.messages.creeLe));
  const convs = new Map<string, (typeof liste)[number] & {nonLus: number}>();
  for (const x of liste) {
    const k = `${x.a.id}-${x.msg.acheteurId}`;
    const c = convs.get(k);
    const nonLu = !x.msg.lu && x.msg.auteurId !== m.id ? 1 : 0;
    if (!c) convs.set(k, {...x, nonLus: nonLu});
    else c.nonLus += nonLu;
  }
  const autres = await db.select({id: schema.membres.id, pseudo: schema.membres.pseudo}).from(schema.membres).where(inArray(schema.membres.id, [...new Set([...convs.values()].flatMap((c) => [c.msg.acheteurId, c.a.vendeurId]))].concat(-1)));
  const pseudo = (id: number) => autres.find((x) => x.id === id)?.pseudo ?? '?';
  return (
    <div className="env page page-etroite">
      <h1 className="titre-page">Messages</h1>
      <p className="chapo">Vos questions aux vendeurs, et celles des acheteurs sur vos annonces.</p>
      {convs.size ? (
        <ul className="convs">
          {[...convs.values()].map((c) => {
            const vendeur = c.a.vendeurId === m.id;
            return (
              <li key={`${c.a.id}-${c.msg.acheteurId}`}>
                <Link href={`/messages/${c.a.id}${vendeur ? `?avec=${c.msg.acheteurId}` : ''}`} className={c.nonLus ? 'conv non-lu' : 'conv'}>
                  <strong>{c.a.parfumNom} <small>· {vendeur ? `@${pseudo(c.msg.acheteurId)} (acheteur)` : `@${pseudo(c.a.vendeurId)} (vendeur)`}</small></strong>
                  <span>{c.msg.auteurId === m.id ? 'Vous : ' : ''}{c.msg.texte.slice(0, 90)}</span>
                  {c.nonLus ? <b className="bo-compte">{c.nonLus}</b> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="bientot"><h3>Aucun message pour l'instant.</h3><p className="aide">Sur une annonce, « Poser une question au vendeur » ouvre une conversation ici.</p></div>
      )}
    </div>
  );
}
