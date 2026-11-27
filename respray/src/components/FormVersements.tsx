'use client';
/* L'inscription du vendeur à ses versements, avec le formulaire de Respray (comme sur les sites de particulier à
   particulier) : nom, date de naissance, adresse, IBAN. Pas de mot « entreprise », pas d'écran Stripe.
   Les données partent directement du navigateur vers Stripe, avec la clé publique : Stripe renvoie des jetons
   (« accttok_… » pour l'identité, « btok_… » pour l'IBAN), et seuls ces jetons sont envoyés au serveur de Respray.
   Si Stripe demande ensuite une pièce d'identité, elle est envoyée de la même façon (fichiers Stripe). */
import {useState} from 'react';
import {useRouter} from 'next/navigation';

const PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const VERSION_V2 = '2026-11-18.endive'; // la version d'API de la bibliothèque stripe utilisée par le serveur
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const CONDITIONS = 'https://stripe.com/fr/legal/connect-account';

type Reponse = {ok?: boolean; aFournir?: string[]; erreur?: string; message?: string};

/* les messages de Stripe, en clair pour un particulier (mots entiers : « profile » ne doit pas passer pour « file ») ;
   le message d'origine est gardé à part, affiché en petit, pour savoir exactement ce qui coince */
function traduire(m: string) {
  const t = m.toLowerCase();
  if (/\biban\b|account_number|bank account|routing/.test(t)) return 'Cet IBAN n\'est pas valide : vérifiez-le (il commence par FR76 pour un compte français).';
  if (/date_of_birth|\bbirth|\bage\b/.test(t)) return 'La date de naissance n\'est pas valide. Il faut avoir au moins 18 ans pour vendre.';
  if (/postal_code|\baddress\b|\bcity\b/.test(t)) return 'L\'adresse n\'est pas complète ou pas valide.';
  if (/\bphone\b/.test(t)) return 'Le numéro de téléphone n\'est pas valide.';
  if (/\bfiles?\b|identity_document|\bimage\b/.test(t)) return 'La photo de la pièce d\'identité n\'a pas pu être lue : envoyez une photo nette (JPG ou PNG) ou un PDF.';
  return 'Stripe n\'a pas pu enregistrer ces informations. Réessayez ; si ça continue, envoyez-nous le détail ci-dessous.';
}

async function stripeV2(chemin: string, corps: unknown) {
  const r = await fetch(`https://api.stripe.com${chemin}`, {method: 'POST', headers: {Authorization: `Bearer ${PK}`, 'Content-Type': 'application/json', 'Stripe-Version': VERSION_V2}, body: JSON.stringify(corps)});
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error?.message || 'stripe');
  return j as {id: string};
}

async function jetonIban(iban: string, titulaire: string) {
  const p = new URLSearchParams({'bank_account[country]': 'FR', 'bank_account[currency]': 'eur', 'bank_account[account_number]': iban, 'bank_account[account_holder_name]': titulaire, 'bank_account[account_holder_type]': 'individual'});
  const r = await fetch('https://api.stripe.com/v1/tokens', {method: 'POST', headers: {Authorization: `Bearer ${PK}`, 'Content-Type': 'application/x-www-form-urlencoded'}, body: p});
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error?.message || 'iban');
  return j.id as string;
}

async function envoyerFichier(f: File) {
  const d = new FormData();
  d.append('purpose', 'identity_document');
  d.append('file', f);
  const r = await fetch('https://files.stripe.com/v1/files', {method: 'POST', headers: {Authorization: `Bearer ${PK}`}, body: d});
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error?.message || 'document');
  return j.id as string;
}

async function auServeur(corps: unknown): Promise<Reponse> {
  const r = await fetch('/api/versements', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(corps)});
  const j = (await r.json().catch(() => ({}))) as Reponse;
  if (!r.ok) throw new Error(j.message || j.erreur || 'serveur');
  return j;
}

const propre = (s: string) => s.replace(/\s+/g, '').toUpperCase();

/* une étape terminée : la page change (souvent plus courte), on remonte en haut pour voir le nouvel état */
const enHaut = () => window.scrollTo({top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});

/* ——— l'inscription complète : identité, adresse, IBAN ——— */
export function FormVersements({prenom = '', nom = '', email}: {prenom?: string; nom?: string; email: string}) {
  const router = useRouter();
  const [v, setV] = useState({prenom, nom, jour: '', mois: '', annee: '', rue: '', cp: '', ville: '', tel: '', iban: '', accord: false});
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');
  const [detail, setDetail] = useState('');
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((x) => ({...x, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value}));

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setDetail('');
    const [j, mo, a] = [Number(v.jour), Number(v.mois), Number(v.annee)];
    const age = (Date.now() - new Date(a, mo - 1, j).getTime()) / (365.25 * 864e5);
    if (!j || !mo || !a || age < 18 || age > 120) return setErreur('La date de naissance n\'est pas valide. Il faut avoir au moins 18 ans pour vendre.');
    if (!/^\d{5}$/.test(v.cp.trim())) return setErreur('Le code postal doit avoir 5 chiffres.');
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(propre(v.iban))) return setErreur('Cet IBAN n\'est pas valide : vérifiez-le (il commence par FR76 pour un compte français).');
    if (!v.accord) return setErreur('Il faut accepter les conditions de Stripe pour recevoir vos versements.');
    if (!PK) return setErreur('Le paiement n\'est pas encore configuré sur Respray.');
    setEnCours(true);
    try {
      const tel = v.tel.replace(/[\s.-]/g, '');
      const compte = await stripeV2('/v2/core/account_tokens', {
        contact_email: email,
        identity: {
          entity_type: 'individual',
          individual: {
            given_name: v.prenom.trim(), surname: v.nom.trim(), email,
            date_of_birth: {day: j, month: mo, year: a},
            address: {line1: v.rue.trim(), postal_code: v.cp.trim(), city: v.ville.trim(), country: 'fr'},
            ...(tel ? {phone: tel.startsWith('0') ? `+33${tel.slice(1)}` : tel} : {}),
          },
          attestations: {terms_of_service: {account: {shown_and_accepted: true}}},
        },
      });
      const banque = await jetonIban(propre(v.iban), `${v.prenom.trim()} ${v.nom.trim()}`);
      await auServeur({action: 'inscrire', compte: compte.id, banque});
      router.refresh();
      enHaut();
    } catch (x) {
      setErreur(traduire((x as Error).message));
      setDetail((x as Error).message);
    } finally {
      setEnCours(false);
    }
  };

  return (
    <form className="form-versements" onSubmit={envoyer} noValidate>
      <fieldset>
        <legend>Vous</legend>
        <div className="fv-ligne">
          <div><label htmlFor="fv-prenom">Prénom</label><input id="fv-prenom" className="champ" value={v.prenom} onChange={set('prenom')} autoComplete="given-name" required /></div>
          <div><label htmlFor="fv-nom">Nom</label><input id="fv-nom" className="champ" value={v.nom} onChange={set('nom')} autoComplete="family-name" required /></div>
        </div>
        <label id="fv-naissance">Date de naissance</label>
        <div className="fv-ligne fv-date" role="group" aria-labelledby="fv-naissance">
          <input className="champ" inputMode="numeric" placeholder="Jour" aria-label="Jour" maxLength={2} value={v.jour} onChange={set('jour')} autoComplete="bday-day" />
          <select className="champ" aria-label="Mois" value={v.mois} onChange={set('mois')} autoComplete="bday-month"><option value="">Mois</option>{MOIS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
          <input className="champ" inputMode="numeric" placeholder="Année" aria-label="Année" maxLength={4} value={v.annee} onChange={set('annee')} autoComplete="bday-year" />
        </div>
      </fieldset>
      <fieldset>
        <legend>Votre adresse</legend>
        <label htmlFor="fv-rue">Numéro et rue</label>
        <input id="fv-rue" className="champ" value={v.rue} onChange={set('rue')} autoComplete="address-line1" required />
        <div className="fv-ligne fv-ville">
          <div><label htmlFor="fv-cp">Code postal</label><input id="fv-cp" className="champ" inputMode="numeric" maxLength={5} value={v.cp} onChange={set('cp')} autoComplete="postal-code" required /></div>
          <div><label htmlFor="fv-ville">Ville</label><input id="fv-ville" className="champ" value={v.ville} onChange={set('ville')} autoComplete="address-level2" required /></div>
        </div>
        <label htmlFor="fv-tel">Téléphone <small>facultatif</small></label>
        <input id="fv-tel" className="champ" type="tel" inputMode="tel" value={v.tel} onChange={set('tel')} autoComplete="tel" placeholder="06 12 34 56 78" />
      </fieldset>
      <fieldset>
        <legend>Où recevoir votre argent</legend>
        <label htmlFor="fv-iban">IBAN</label>
        <input id="fv-iban" className="champ fv-iban" value={v.iban} onChange={set('iban')} autoComplete="off" spellCheck={false} placeholder="FR76 …" required />
        <p className="aide">À votre nom. Vous le trouvez dans l&apos;application de votre banque (RIB).</p>
      </fieldset>
      <label className="choix fv-accord"><input type="checkbox" checked={v.accord} onChange={set('accord')} /> <span>J&apos;accepte que Stripe, le partenaire de paiement de Respray, gère mes versements, et j&apos;accepte <a className="lien-souligne" href={CONDITIONS} target="_blank" rel="noopener">ses conditions</a>.</span></label>
      {erreur ? <p className="erreur" role="alert">{erreur}{detail ? <small className="fv-detail">Détail : {detail}</small> : null}</p> : null}
      <button className="btn btn-noir btn-large" type="submit" disabled={enCours}>{enCours ? 'Enregistrement…' : 'Enregistrer'}</button>
      <p className="aide fv-secu">Vos informations partent directement chez Stripe, chiffrées. Respray ne conserve ni votre IBAN ni votre date de naissance : la loi impose ces vérifications à toute plateforme qui verse de l&apos;argent (comme Vinted ou Leboncoin).</p>
    </form>
  );
}

/* ——— changer d'IBAN, une fois inscrit ——— */
export function ChangerIban({titulaire}: {titulaire: string}) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [iban, setIban] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');
  if (!ouvert) return <button className="lien-bouton" type="button" onClick={() => setOuvert(true)}>Changer d&apos;IBAN</button>;
  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(propre(iban))) return setErreur('Cet IBAN n\'est pas valide.');
    setEnCours(true);
    try {
      await auServeur({action: 'iban', banque: await jetonIban(propre(iban), titulaire)});
      setOuvert(false);
      router.refresh();
      enHaut();
    } catch (x) {
      setErreur(traduire((x as Error).message));
    } finally {
      setEnCours(false);
    }
  };
  return (
    <form className="form-versements fv-court" onSubmit={envoyer} noValidate>
      <label htmlFor="fv-iban2">Nouvel IBAN</label>
      <input id="fv-iban2" className="champ fv-iban" value={iban} onChange={(e) => setIban(e.target.value)} autoComplete="off" spellCheck={false} placeholder="FR76 …" />
      {erreur ? <p className="erreur" role="alert">{erreur}</p> : null}
      <div className="boutons"><button className="btn btn-noir" type="submit" disabled={enCours}>{enCours ? 'Enregistrement…' : 'Enregistrer'}</button><button className="btn" type="button" onClick={() => setOuvert(false)}>Annuler</button></div>
    </form>
  );
}

/* ——— une pièce d'identité, quand Stripe la demande ——— */
export function EnvoyerPiece() {
  const router = useRouter();
  const [recto, setRecto] = useState<File | null>(null);
  const [verso, setVerso] = useState<File | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');
  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    if (!recto) return setErreur('Ajoutez au moins le recto de votre pièce d\'identité.');
    setEnCours(true);
    try {
      const front = await envoyerFichier(recto);
      const back = verso ? await envoyerFichier(verso) : undefined;
      const jeton = await stripeV2('/v2/core/account_tokens', {identity: {individual: {documents: {primary_verification: {type: 'front_back', front_back: {front, ...(back ? {back} : {})}}}}}});
      await auServeur({action: 'piece', compte: jeton.id});
      router.refresh();
      enHaut();
    } catch (x) {
      setErreur(traduire((x as Error).message));
    } finally {
      setEnCours(false);
    }
  };
  return (
    <form className="form-versements" onSubmit={envoyer}>
      <p>Stripe demande une pièce d&apos;identité pour confirmer que c&apos;est bien vous : carte d&apos;identité, passeport ou titre de séjour, en photo nette.</p>
      <div className="fv-ligne">
        <div><label htmlFor="fv-recto">Recto</label><input id="fv-recto" className="champ" type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setRecto(e.target.files?.[0] ?? null)} /></div>
        <div><label htmlFor="fv-verso">Verso <small>(carte d&apos;identité)</small></label><input id="fv-verso" className="champ" type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setVerso(e.target.files?.[0] ?? null)} /></div>
      </div>
      {erreur ? <p className="erreur" role="alert">{erreur}</p> : null}
      <button className="btn btn-noir" type="submit" disabled={enCours}>{enCours ? 'Envoi…' : 'Envoyer'}</button>
      <p className="aide fv-secu">La photo part directement chez Stripe. Respray ne la voit pas et ne la conserve pas.</p>
    </form>
  );
}
