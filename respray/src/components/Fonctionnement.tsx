'use client';
/* Les parties animées de « Comment ça marche », reprises du prototype : le parcours (vendre / acheter) dont la scène
   suit le défilement, la vérification en 3D autour du flacon d'exemple, et le simulateur des frais. */
import {useEffect, useRef, useState} from 'react';
import {PhotoDemo, Ico} from '@/components/Visuels';
import {DEMO, DEMO_PARFUM} from '@/lib/demo';
import {eur, eur2, protection, ENVOI} from '@/lib/regles';
import {Jauge} from '@/components/Jauge';

const reduit = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const PARCOURS = {
  vendre: [
    {t: 'Choisissez votre parfum', d: 'Maison, parfum, contenance, état. Votre maison n\'est pas dans la liste ? Écrivez-la : l\'équipe vérifie l\'orthographe et l\'ajoute pour tout le monde.', s: 'choisir'},
    {t: 'Prenez les photos demandées', d: '6 photos obligatoires, toujours les mêmes : de face, le dessous avec le code lot, le niveau, vu de dessus avec le spray, la tige sans le spray, et une photo avec votre pseudo et la date.', s: 'photos'},
    {t: 'L\'équipe vérifie votre annonce', d: 'Code lot, flacon, spray, tige, niveau, prix : tout est contrôlé sur les photos. En quelques heures, l\'annonce est en ligne, ou on vous dit quoi refaire.', s: 'verif'},
    {t: 'Vous vendez, vous expédiez', d: 'Vous êtes prévenu à la vente. Vous avez 5 jours pour déposer le colis en point relais, avec l\'étiquette fournie.', s: 'vendu'},
    {t: 'Vous êtes payé', d: 'Dès que l\'acheteur confirme, ou automatiquement 7 jours après la livraison. Sans commission : vous touchez votre prix.', s: 'paye'},
  ],
  acheter: [
    {t: 'Trouvez votre parfum', d: 'Par maison, état, prix ou prix au millilitre. Toutes les annonces en ligne ont été vérifiées par l\'équipe.', s: 'trouver'},
    {t: 'Payez, l\'argent est bloqué', d: 'Le vendeur ne reçoit rien tant que vous n\'avez pas vérifié le parfum. Carte, Apple Pay ou Google Pay.', s: 'bloque'},
    {t: 'Recevez votre colis', d: 'Envoi suivi en point relais, déposé sous 5 jours, ou remise en main propre si le vendeur la propose.', s: 'recu'},
    {t: 'Vérifiez pendant 7 jours', d: 'Code lot, tige, niveau, odeur : vous avez une semaine entière, pas 48 heures.', s: 'verifier'},
    {t: 'Confirmez, ou signalez', d: 'Tout est conforme : le vendeur est payé. Un problème : l\'argent reste bloqué, l\'équipe regarde, et vous êtes remboursé s\'il n\'est pas conforme.', s: 'fin'},
  ],
};
const st = (o: Record<string, string | number>) => o as React.CSSProperties;

function Scene({s}: {s: string}) {
  switch (s) {
    case 'choisir':
      return (
        <div className="sc-app"><p className="sc-label">Maison</p><div className="sc-champ"><span className="sc-tape">maison crivel</span><i className="sc-curseur" /></div>
          <ul className="sc-liste"><li style={st({'--i': 0})}>Maison Francis Kurkdjian</li><li style={st({'--i': 1})}>Maison Margiela</li><li className="sc-ajout" style={st({'--i': 2})}>+ Proposer « Maison Crivelli »</li></ul>
          <p className="sc-bulle"><Ico n="cloche" />Proposée à l&apos;équipe : elle sera dans la liste pour les suivants.</p></div>
      );
    case 'photos':
      return <div className="sc-grille">{['face', 'dessous', 'niveau', 'dessus', 'tige', 'preuve'].map((v, i) => <span key={v} className="sc-photo" style={st({'--i': i})}><PhotoDemo vue={v} /><b><Ico n="check" /></b></span>)}<span className="sc-flash" /></div>;
    case 'verif':
      return (
        <div className="sc-verif"><div className="sc-scan"><PhotoDemo vue="tige" /><span className="sc-ligne" /></div>
          <ul className="sc-checks">{['Code lot cohérent', 'Spray et bague d\'origine', 'Tige intacte', 'Niveau conforme', 'Pseudo et date'].map((t, i) => <li key={t} style={st({'--i': i})}><b><Ico n="check" /></b>{t}</li>)}</ul>
          <p className="sc-chip"><Ico n="check" />Vérifiée · en ligne</p></div>
      );
    case 'vendu':
    case 'recu':
      return (
        <div className="sc-colis"><p className="sc-notif">{s === 'vendu' ? `Vendu ! ${DEMO_PARFUM.nom} · ${eur(DEMO.prix)}` : 'Votre colis est arrivé en point relais'}</p>
          <div className="sc-route"><svg viewBox="0 0 300 60" preserveAspectRatio="none"><path d="M10 45 C 90 5, 170 55, 290 18" /></svg><span className="sc-camion"><Ico n="boite" /></span></div>
          <p className="sc-sous">{s === 'vendu' ? 'À déposer sous 5 jours · étiquette fournie' : 'Arrivé aujourd\'hui · 7 jours pour vérifier'}</p></div>
      );
    case 'paye':
      return <div className="sc-paye"><div className="sc-anneau"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" /><circle className="sc-anneau-plein" cx="60" cy="60" r="52" /></svg><span>J+7</span></div><p className="sc-montant">+{eur2(DEMO.prix)}</p><p className="sc-sous">Versement envoyé · commission 0 €</p></div>;
    case 'trouver':
      return <div className="sc-trouver"><div className="sc-filtre"><span>Prix au ml</span><span>Entamé</span><span>Maison Francis Kurkdjian</span></div><div className="sc-cartes">{['a101', 'a102', 'a103'].map((id, i) => <span key={id} className="sc-carte" style={st({'--i': i})}><PhotoDemo id={id} /><b>{eur([189, 79, 245][i])}</b></span>)}</div></div>;
    case 'bloque':
      return <div className="sc-bloque"><svg className="sc-cadenas" viewBox="0 0 80 96"><path className="sc-anse" d="M22 44V30a18 18 0 0 1 36 0v14" /><rect x="12" y="44" width="56" height="44" rx="8" /><circle cx="40" cy="64" r="5" /></svg><p className="sc-montant">{eur2(DEMO.prix + protection(DEMO.prix) + ENVOI)}</p><p className="sc-sous">bloqués jusqu&apos;à votre vérification</p></div>;
    case 'verifier':
      return <div className="sc-verif sc-verif-acheteur"><div className="sc-anneau sc-anneau-petit"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" /><circle className="sc-anneau-plein" cx="60" cy="60" r="52" /></svg><span>7 j</span></div><ul className="sc-checks">{['Code lot : boîte = flacon', 'Tige propre et droite', 'Niveau comme sur la photo', 'Odeur conforme, départ et fond'].map((t, i) => <li key={t} style={st({'--i': i})}><b><Ico n="check" /></b>{t}</li>)}</ul></div>;
    default:
      return <div className="sc-fin"><div className="sc-issue sc-issue-ok"><b><Ico n="check" /></b><span><strong>Tout est conforme</strong>Le vendeur est payé.</span></div><div className="sc-issue sc-issue-pb"><b><Ico n="retour" /></b><span><strong>Un problème</strong>L&apos;équipe regarde : remboursé s&apos;il n&apos;est pas conforme.</span></div></div>;
  }
}

export function Parcours() {
  const [qui, setQui] = useState<'vendre' | 'acheter'>('vendre');
  const [actif, setActif] = useState(0);
  const [cle, setCle] = useState(0); // rejoue l'animation de la scène
  const racine = useRef<HTMLDivElement>(null);
  // l'étape active est celle dont le texte est le plus près du milieu de l'écran (calcul au défilement)
  useEffect(() => {
    let raf = 0;
    const suivre = () => {
      raf = 0;
      const textes = racine.current?.querySelectorAll('.h-etape .h-texte');
      if (!textes?.length) return;
      const milieu = innerHeight / 2;
      let proche = 0;
      let ecart = Infinity;
      textes.forEach((t, i) => {
        const r = t.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - milieu);
        if (d < ecart) [ecart, proche] = [d, i];
      });
      setActif((a) => {
        if (a !== proche) setCle((k) => k + 1);
        return proche;
      });
    };
    const auDefilement = () => {
      if (!raf) raf = requestAnimationFrame(suivre);
    };
    addEventListener('scroll', auDefilement, {passive: true});
    addEventListener('resize', auDefilement, {passive: true});
    suivre();
    return () => {
      removeEventListener('scroll', auDefilement);
      removeEventListener('resize', auDefilement);
    };
  }, [qui]);
  const etapes = PARCOURS[qui];
  return (
    <>
      <div className="bascule" role="tablist" aria-label="Parcours">
        <button type="button" role="tab" aria-selected={qui === 'vendre'} onClick={() => setQui('vendre')}>Je vends</button>
        <button type="button" role="tab" aria-selected={qui === 'acheter'} onClick={() => setQui('acheter')}>J&apos;achète</button>
        <span className="bascule-pastille" style={st({'--x': qui === 'vendre' ? 0 : 1})} />
      </div>
      <div className="histoire" ref={racine}>
        <ol className="histoire-etapes">
          {etapes.map((e, i) => (
            <li key={qui + i} className={`h-etape ${i === actif ? 'actif' : ''}`}>
              <span className="h-num">{String(i + 1).padStart(2, '0')}</span>
              <div className="h-texte"><h3>{e.t}</h3><p>{e.d}</p></div>
              <div className={`h-scene-mobile scene ${i === actif ? 'actif' : ''}`} aria-hidden="true"><Scene s={e.s} /></div>
            </li>
          ))}
        </ol>
        <div className="histoire-scene" aria-hidden="true">
          <div className="scene-cadre">{etapes.map((e, i) => <div key={i === actif ? `${qui}-${i}-${cle}` : `${qui}-${i}`} className={`scene ${i === actif ? 'actif' : ''}`}><Scene s={e.s} /></div>)}</div>
          <div className="scene-points">{etapes.map((e, i) => <i key={i} className={i === actif ? 'actif' : ''} />)}</div>
        </div>
      </div>
    </>
  );
}

const VERIF = [
  {t: 'Le spray et la tige.', d: 'La bague sertie d\'origine, un bouton et une tige qui n\'ont pas été forcés : un flacon ouvert pour être rempli d\'autre chose en garde la trace.', e: 'La tige'},
  {t: 'Le flacon et l\'étiquette.', d: 'Forme, bouchon, gravures : comparés aux modèles connus de la maison.', e: 'Le flacon'},
  {t: 'Le niveau.', d: 'Celui de la photo correspond à celui de l\'annonce. Flacon opaque ? Une lampe de téléphone collée derrière, et le niveau apparaît.', e: 'Le niveau'},
  {t: 'Le code lot.', d: 'Il existe, il suit le format de la marque, il est le même sur la boîte. Il donne souvent l\'année de fabrication.', e: 'Le code lot'},
];
type Scene3D = {aller(i: number): void; fond(): void; detruire(): void};

/* la vérification : la caméra va d'un point de contrôle à l'autre autour du flacon d'exemple (three.js, à la demande) */
export function Verification() {
  const [i, setI] = useState(0);
  const [pause, setPause] = useState(false);
  const cadre = useRef<HTMLDivElement>(null);
  const v3 = useRef<Scene3D | null>(null);
  const pauseJusqua = useRef(0);
  useEffect(() => {
    const el = cadre.current;
    if (!el) return;
    let fini = false;
    let minuteur = 0;
    const o = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      o.disconnect();
      import('@/components/3d/verif3d')
        .then((m) => m.default.monter(el, {a: DEMO, p: DEMO_PARFUM, etiquettes: [...VERIF.map((x) => x.e).slice(0, 3), `Code lot ${DEMO.lot}`]}))
        .then((c) => {
          if (!c) return;
          if (fini) return c.detruire();
          v3.current = c;
          c.aller(0);
        })
        .catch(() => {});
      if (reduit()) return;
      minuteur = window.setInterval(() => {
        const r = el.getBoundingClientRect();
        if (document.hidden || r.bottom < 0 || r.top > innerHeight || performance.now() < pauseJusqua.current) return;
        setPause(false);
        setI((x) => (x + 1) % VERIF.length);
      }, 5500);
    });
    o.observe(el);
    // le fond de la scène suit le thème
    const t = new MutationObserver(() => v3.current?.fond());
    t.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
    return () => {
      fini = true;
      o.disconnect();
      t.disconnect();
      clearInterval(minuteur);
      v3.current?.detruire();
      v3.current = null;
    };
  }, []);
  useEffect(() => {
    v3.current?.aller(i);
  }, [i]);
  return (
    <section className="fn-section env fn-equipe">
      <div className="fn-equipe-visuel" data-revele data-anime data-verif3d data-point={i} ref={cadre}>
        <PhotoDemo />
        <span className="repere" style={st({'--x': '50%', '--y': '24%', '--i': 0})}>1</span><span className="repere" style={st({'--x': '70%', '--y': '56%', '--i': 1})}>2</span><span className="repere" style={st({'--x': '31%', '--y': '62%', '--i': 2})}>3</span><span className="repere" style={st({'--x': '62%', '--y': '80%', '--i': 3})}>4</span>
        <span className="balayage" />
        <span className="exemple-badge">Exemple</span>
      </div>
      <div className="fn-equipe-texte" data-revele>
        <p className="surtitre">La vérification</p>
        <h2 className="grand-titre">Ce que notre équipe regarde, sur chaque annonce.</h2>
        <ol className={`verif-liste ${pause ? 'en-pause' : ''}`}>
          {VERIF.map((x, k) => (
            <li key={x.e}>
              <button type="button" className="verif-item" aria-pressed={k === i} onClick={() => { setPause(true); pauseJusqua.current = performance.now() + 14000; setI(k); }}>
                <span className="verif-n">{k + 1}</span><span><strong>{x.t}</strong> {x.d}</span><i key={`${k}-${i}`} className="verif-prog" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
        <p className="aide">Et aussi : la photo avec le pseudo et la date, un prix anormalement bas, des photos déjà vues ailleurs. Une annonce refusée l&apos;est avec une raison claire.</p>
      </div>
    </section>
  );
}

export function Simulateur() {
  const [prix, setPrix] = useState(100);
  return (
    <div className="calcul" data-revele>
      <label htmlFor="sim">Prix du parfum</label>
      <Jauge id="sim" min={10} max={400} step={5} value={prix} onChange={setPrix} format={eur} couleur="var(--noir)" reperes={['10 €', '400 €']} />
      <div className="calcul-res">
        <div><span>L&apos;acheteur paie</span><strong>{eur2(prix + protection(prix))}</strong><small>hors livraison</small></div>
        <div><span>Le vendeur reçoit</span><strong>{eur2(prix)}</strong><small>100 % du prix</small></div>
      </div>
    </div>
  );
}
