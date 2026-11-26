'use client';
/* Le menu du compte, dans l'en-tête : une pastille avec l'initiale ; au clic, les raccourcis et « Se déconnecter ».
   Il se ferme au clic ailleurs, avec Échap, et quand on change de page. */
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useRef} from 'react';
import {deconnexion} from '@/app/actions/compte';

export function MenuCompte({prenom, pseudo, equipe}: {prenom: string; pseudo: string; equipe: boolean}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const chemin = usePathname();
  useEffect(() => { if (ref.current) ref.current.open = false; }, [chemin]);
  useEffect(() => {
    const fermer = (e: Event) => {
      const d = ref.current;
      if (!d?.open) return;
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !d.contains(e.target as Node)) d.open = false;
    };
    document.addEventListener('click', fermer);
    document.addEventListener('keydown', fermer);
    return () => { document.removeEventListener('click', fermer); document.removeEventListener('keydown', fermer); };
  }, []);
  const initiale = (prenom || pseudo).charAt(0).toUpperCase();
  return (
    <details className="menu-compte" ref={ref}>
      <summary aria-label="Mon compte"><span className="avatar" aria-hidden="true">{initiale}</span><span className="menu-compte-mot">Mon compte</span><svg className="menu-compte-fleche" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" /></svg></summary>
      <div className="menu-compte-liste">
        <p className="menu-compte-qui"><strong>{prenom || pseudo}</strong><span>@{pseudo}</span></p>
        <Link href="/compte">Mon compte</Link>
        <Link href="/commandes">Mes commandes</Link>
        <Link href="/messages">Messages</Link>
        <Link href="/compte/versements">Mes versements</Link>
        <Link href="/placard">Mon placard</Link>
        {equipe ? <Link href="/equipe">Équipe</Link> : null}
        <form action={deconnexion}><button type="submit" className="menu-compte-sortir">Se déconnecter</button></form>
      </div>
    </details>
  );
}
