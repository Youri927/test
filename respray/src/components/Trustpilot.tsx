'use client';
/* Trustpilot : les avis sur Respray lui-même (pas sur les vendeurs, qui ont leurs avis sur le site).
   - <AvisRespray /> : le bouton officiel « Laissez un avis » (TrustBox « Review Collector »), proposé à chaque acheteur
     dont la commande est terminée : Trustpilot demande d'inviter tout le monde, pas seulement les clients contents ;
   - <LienTrustpilot /> : en bas de page, un lien vers la page Trustpilot de Respray ; avec
     NEXT_PUBLIC_TRUSTPILOT_NOTE=1 (à mettre quand il y a assez d'avis), la note en étoiles (TrustBox « Micro TrustScore »).
   Rien ne s'affiche tant que NEXT_PUBLIC_TRUSTPILOT_ID (l'identifiant de Respray chez Trustpilot) n'est pas renseigné. */
import Script from 'next/script';
import {useEffect, useRef, useState} from 'react';

const ID = process.env.NEXT_PUBLIC_TRUSTPILOT_ID;
const NOTE = process.env.NEXT_PUBLIC_TRUSTPILOT_NOTE === '1';
const PAGE = 'https://fr.trustpilot.com/review/respray.fr';
const MODELES = {collecteur: '56278e9abfbbba0bdcd568bc', note: '5419b637fa0340045cd0c936'};

declare global { interface Window { Trustpilot?: {loadFromElement: (el: HTMLElement, force?: boolean) => void} } }

/* le thème du site (clair / sombre), pour que la TrustBox suive */
function useSombre() {
  const [sombre, setSombre] = useState(false);
  useEffect(() => {
    const lire = () => {
      const t = document.documentElement.dataset.theme;
      setSombre(t ? t === 'sombre' : matchMedia('(prefers-color-scheme: dark)').matches);
    };
    lire();
    const o = new MutationObserver(lire);
    o.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
    return () => o.disconnect();
  }, []);
  return sombre;
}

function TrustBox({modele, hauteur, largeur = '100%'}: {modele: keyof typeof MODELES; hauteur: string; largeur?: string}) {
  const ref = useRef<HTMLDivElement>(null);
  const sombre = useSombre();
  const charger = () => { if (ref.current && window.Trustpilot) window.Trustpilot.loadFromElement(ref.current, true); };
  useEffect(charger, [sombre]);
  if (!ID) return null;
  return (
    <>
      <Script src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" strategy="lazyOnload" onLoad={charger} />
      <div key={sombre ? 's' : 'c'} ref={ref} className="trustpilot-widget" data-locale="fr-FR" data-template-id={MODELES[modele]} data-businessunit-id={ID}
        data-style-height={hauteur} data-style-width={largeur} data-theme={sombre ? 'dark' : 'light'} data-token="">
        <a href={PAGE} target="_blank" rel="noopener">Trustpilot</a>
      </div>
    </>
  );
}

export function AvisRespray() {
  if (!ID) return null;
  return (
    <div className="avis-respray">
      <p><strong>Et Respray, ça vous a plu ?</strong> Votre avis sur Trustpilot aide d&apos;autres acheteurs à nous faire confiance.</p>
      <TrustBox modele="collecteur" hauteur="52px" />
    </div>
  );
}

export function LienTrustpilot() {
  if (!ID) return null;
  if (NOTE) return <span className="pied-trustpilot"><TrustBox modele="note" hauteur="20px" largeur="240px" /></span>;
  return <a className="pied-trustpilot" href={PAGE} target="_blank" rel="noopener"><span aria-hidden="true">★</span> Respray sur Trustpilot</a>;
}
