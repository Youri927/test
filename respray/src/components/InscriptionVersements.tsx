'use client';
/* L'inscription du vendeur à ses versements, intégrée à Respray (Connect.js) : identité et IBAN, saisis dans le
   formulaire de Stripe, aux couleurs du site. Respray ne voit ni les papiers ni les coordonnées bancaires. */
import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import {loadConnectAndInitialize} from '@stripe/connect-js';
import {ConnectAccountOnboarding, ConnectComponentsProvider, ConnectNotificationBanner} from '@stripe/react-connect-js';

export function InscriptionVersements({deja}: {deja: boolean}) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState('');
  const connect = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const sombre = window.matchMedia?.('(prefers-color-scheme: dark)').matches && document.documentElement.dataset.theme !== 'clair';
    return loadConnectAndInitialize({
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
      locale: 'fr-FR',
      fetchClientSecret: async () => {
        const r = await fetch('/api/stripe/session-inscription', {method: 'POST'});
        if (!r.ok) {
          setErreur('Le formulaire de Stripe n\'a pas pu s\'ouvrir. Réessayez dans un instant.');
          throw new Error('session');
        }
        return (await r.json()).clientSecret;
      },
      fonts: [{cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'}],
      appearance: {
        variables: sombre
          ? {fontFamily: 'Inter, system-ui, sans-serif', colorPrimary: '#f2efe9', colorBackground: '#252421', colorText: '#f2efe9', colorSecondaryText: '#a7a29a', colorBorder: '#3a3835', buttonPrimaryColorBackground: '#f2efe9', buttonPrimaryColorText: '#1b1a18', borderRadius: '12px', spacingUnit: '10px'}
          : {fontFamily: 'Inter, system-ui, sans-serif', colorPrimary: '#1d1d1f', colorBackground: '#ffffff', colorText: '#1d1d1f', colorSecondaryText: '#6e6e73', colorBorder: '#d2d2d7', buttonPrimaryColorBackground: '#1d1d1f', buttonPrimaryColorText: '#ffffff', borderRadius: '12px', spacingUnit: '10px'},
      },
    });
  }, []);
  if (!connect) return null;
  return (
    <ConnectComponentsProvider connectInstance={connect}>
      {deja ? <div className="stripe-bandeau"><ConnectNotificationBanner /></div> : null}
      {ouvert ? (
        <div className="stripe-inscription">
          <ConnectAccountOnboarding
            onExit={() => {
              setOuvert(false);
              router.refresh(); // l'état (« prêt » ou non) est relu chez Stripe, côté serveur
            }}
          />
        </div>
      ) : (
        <button className="btn btn-noir btn-large" type="button" onClick={() => setOuvert(true)}>{deja ? 'Compléter ou modifier mes informations' : 'Configurer mes versements'}</button>
      )}
      {erreur ? <p className="erreur" role="alert">{erreur}</p> : null}
    </ConnectComponentsProvider>
  );
}
