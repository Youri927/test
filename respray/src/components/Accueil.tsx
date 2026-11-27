'use client';
/* Ce qui bouge sur l'accueil, repris du prototype : le fil des dernières vérifications, le ruban des annonces (filtre par
   maison, flèches), l'annonce « point par point » qui avance seule, et le guide de réception à cocher. */
import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {PhotoDemo, Ico} from '@/components/Visuels';
import {DEMO, DEMO_PARFUM} from '@/lib/demo';
import {eur, eur2} from '@/lib/regles';
import {useUnePasse} from '@/components/Ambiance';

const reduit = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* « Vérifiée il y a 4 min · Santal 33 · 172 € », qui change toutes les 3,6 s (les vraies dernières annonces) */
export function Direct({items}: {items: {id: number; nom: string; prix: number; il: string}[]}) {
  const [k, setK] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (items.length < 2 || reduit()) return;
    const t = setInterval(() => {
      setK((x) => x + 1);
      const d = ref.current;
      if (d) {
        d.classList.remove('change');
        void d.offsetWidth;
        d.classList.add('change');
      }
    }, 3600);
    return () => clearInterval(t);
  }, [items.length]);
  if (!items.length) return null;
  const x = items[k % items.length];
  return (
    <p className="direct" aria-live="polite">
      <span className="point-vert" aria-hidden="true" />
      <span id="direct" ref={ref}><Link href={`/annonces/${x.id}`}>Vérifiée {x.il} · <strong>{x.nom}</strong> · {eur(x.prix)}</Link></span>
    </p>
  );
}

/* le ruban : les cartes (rendues par le serveur) sont filtrées par maison, et défilent avec les flèches */
export function Ruban({maisons, total, aide, children}: {maisons: string[]; total: number; aide: string; children: React.ReactNode}) {
  const [maison, setMaison] = useState('tout');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const r = ref.current;
    if (!r) return;
    r.querySelectorAll<HTMLElement>('[data-maison]').forEach((c) => (c.hidden = maison !== 'tout' && c.dataset.maison !== maison));
    r.scrollTo({left: 0});
  }, [maison]);
  const defiler = (sens: number) => {
    const r = ref.current;
    const c = r?.querySelector<HTMLElement>('.carte:not([hidden])');
    r?.scrollBy({left: sens * (c ? c.offsetWidth + 16 : 260) * 2, behavior: reduit() ? 'auto' : 'smooth'});
  };
  return (
    <>
      <div className="env ruban-tete">
        <div><h2 className="grand-titre">En ce moment</h2><p className="aide">{aide}</p></div>
        <div className="ruban-fleches">
          <button className="rond" type="button" aria-label="Annonces précédentes" onClick={() => defiler(-1)}><Ico n="fleche" /></button>
          <button className="rond" type="button" aria-label="Annonces suivantes" onClick={() => defiler(1)}><Ico n="fleche" /></button>
        </div>
      </div>
      <div className="env">
        <div className="ruban-filtres" role="group" aria-label="Filtrer par maison">
          {['tout', ...maisons].map((m) => (
            <button key={m} type="button" className="filtre" aria-pressed={maison === m} onClick={() => setMaison(m)}>{m === 'tout' ? 'Toutes les maisons' : m}</button>
          ))}
        </div>
      </div>
      <div className="ruban" id="ruban" ref={ref} tabIndex={0} aria-label="Annonces récentes">{children}</div>
      <div className="env"><Link className="lien" href="/parfums">Voir {total > 1 ? `les ${total} annonces` : 'l\'annonce'} <Ico n="fleche" /></Link></div>
    </>
  );
}

/* une annonce Respray, point par point : l'exemple s'éclaire zone par zone, et avance seul quand il est à l'écran */
const ANATOMIE = [
  {t: '6 photos imposées', d: 'Toujours les mêmes, jusqu\'à la tige du spray et une photo avec le pseudo du vendeur.'},
  {t: 'Vérifiée par l\'équipe', d: 'Avant d\'être en ligne, en quelques heures. Code lot, spray, tige, niveau, prix.'},
  {t: '7 jours pour vérifier', d: 'L\'argent reste bloqué jusqu\'à votre accord. Non conforme : remboursé.'},
  {t: '0 % pour le vendeur', d: 'Il touche le prix affiché. L\'acheteur paie une protection de 8 % + 1,50 €.'},
];
/* les étapes défilent une fois (1,3 s chacune) quand la carte est à l'écran ; un choix à la main met en pause 5 s */
const DUREE_ANAT = 1300;
const PAUSE_ANAT = 5000;

export function Anatomie() {
  // toute la section compte (au téléphone, la liste 01-04 est au-dessus de la carte) : l'animation se joue dès que l'une
  // ou l'autre est bien à l'écran
  const bloc = useRef<HTMLElement>(null);
  const [i, choisir] = useUnePasse(bloc, ANATOMIE.length, DUREE_ANAT, {pause: PAUSE_ANAT, seuil: 0.4});
  return (
    <section className="section env anatomie" ref={bloc}>
      <div className="anat-texte">
        <p className="surtitre">Pourquoi c&apos;est plus sûr</p>
        <h2 className="grand-titre">Une annonce Respray, point par point.</h2>
        <ol className="anat-points auto" style={{'--duree': `${DUREE_ANAT}ms`} as React.CSSProperties} role="tablist" aria-label="Ce qui protège une vente">
          {ANATOMIE.map((x, k) => (
            <li key={x.t}>
              <button type="button" role="tab" aria-selected={k === i} onClick={() => choisir(k)}>
                <span className="anat-n">{String(k + 1).padStart(2, '0')}</span>
                <span className="anat-txt"><strong>{x.t}</strong><small>{x.d}</small></span>
                <i className="anat-prog" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
        <Link className="lien" href="/comment-ca-marche">Tout le fonctionnement <Ico n="fleche" /></Link>
      </div>
      {/* toucher une zone de la carte choisit son étape (au doigt, la liste des étapes est plus haut, hors de l'écran) */}
      <div className="anat-carte" data-zone={i} aria-hidden="true" onClick={(e) => { const z = (e.target as HTMLElement).closest('[data-z]'); if (z) choisir(Number(z.getAttribute('data-z'))); }}>
        <span className="exemple-badge">Exemple</span>
        <div className="z z0" data-z="0"><div className="anat-grande"><PhotoDemo /></div><div className="anat-minis">{['dessous', 'niveau', 'dessus', 'tige', 'preuve'].map((v) => <span key={v}><PhotoDemo vue={v} /></span>)}</div></div>
        <div className="anat-infos"><p>{DEMO_PARFUM.maison}</p><p className="anat-nom">{DEMO_PARFUM.nom}</p><p className="anat-prix">{eur(DEMO.prix)} <small>· {DEMO.ml} ml · reste ~{DEMO.niveau} %</small></p></div>
        <div className="z z1" data-z="1"><b><Ico n="check" /></b><span><strong>Vérifiée par l&apos;équipe</strong><small>avant d&apos;être en ligne · 6 contrôles</small></span></div>
        <div className="z z2" data-z="2"><b><Ico n="cadenas" /></b><span><strong>Paiement bloqué, 7 jours pour vérifier</strong><span className="anat-jours">{Array.from({length: 7}, (_, k) => <i key={k} style={{'--i': k} as React.CSSProperties} />)}</span></span></div>
        <div className="z z3" data-z="3"><b><Ico n="euro" /></b><span><strong>Le vendeur reçoit {eur2(DEMO.prix)}</strong><small>Commission : 0,00 €</small></span></div>
      </div>
      {/* au téléphone : l'étape en cours, sous la carte, et des points pour passer de l'une à l'autre */}
      <div className="anat-legende-m" aria-hidden="true">
        <p><strong>{String(i + 1).padStart(2, '0')} · {ANATOMIE[i].t}</strong> {ANATOMIE[i].d}</p>
        <div className="anat-points-m">{ANATOMIE.map((x, k) => <button key={x.t} type="button" tabIndex={-1} className={k === i ? 'actif' : ''} onClick={() => choisir(k)} aria-label={x.t} />)}</div>
      </div>
    </section>
  );
}

/* le guide de réception : 5 gestes à cocher, et trois fiches qui s'ouvrent en grand */
const RECEPTION = [
  {t: 'Le code lot', d: 'Le même sous le flacon et sur la boîte. Effacé ou gratté : signalez-le.', vues: ['dessous', 'boite']},
  {t: 'Le spray et la tige', d: 'Retirez le bouton : la tige doit être propre, droite, sans trace de colle.', vues: ['dessus', 'tige']},
  {t: 'Le niveau', d: 'Il correspond à la photo de l\'annonce.', vues: ['niveau']},
  {t: 'Le jus', d: 'Couleur et limpidité comparables aux photos, sans dépôt ni trouble.', vues: ['face']},
  {t: 'L\'odeur', d: 'Vaporisez sur la peau et laissez le temps faire : le fond compte autant que le départ.', vues: [] as string[]},
];
const LEG: Record<string, string> = {dessous: 'le dessous du flacon et le code lot', boite: 'la boîte', dessus: 'vu de dessus, avec le spray', tige: 'sans le bouton spray, la tige', niveau: 'le niveau', face: 'de face'};
const GUIDE = [
  {k: 'lot', t: 'Lire un code lot'},
  {k: 'conserver', t: 'Bien conserver un parfum'},
  {k: 'concentrations', t: 'Eau de toilette, eau de parfum, extrait'},
];
function FicheGuide({k}: {k: string}) {
  if (k === 'lot')
    return (
      <>
        <h3>Une suite de lettres et de chiffres, gravée ou imprimée.</h3>
        <div className="guide-lot"><figure><PhotoDemo vue="dessous" /><figcaption>Sous le flacon</figcaption></figure><span className="guide-egal" aria-hidden="true">=</span><figure><PhotoDemo vue="boite" /><figcaption>Sur la boîte</figcaption></figure></div>
        <p>Il identifie la fabrication et, chez beaucoup de marques, permet de retrouver sa date. Les deux codes doivent être les mêmes. Un code effacé ou gratté est un mauvais signe ; un code correct ne suffit pas à lui seul, d&apos;où les autres photos.</p>
      </>
    );
  if (k === 'conserver')
    return (
      <>
        <h3>Lumière, chaleur et humidité sont ses ennemis.</h3>
        <ul className="guide-astuces">
          <li><Ico n="soleil" /><span><strong>À l&apos;abri de la lumière.</strong> Dans sa boîte ou un placard.</span></li>
          <li><Ico n="thermo" /><span><strong>Au frais et au sec.</strong> Loin d&apos;un radiateur et d&apos;une fenêtre.</span></li>
          <li><Ico n="goutte" /><span><strong>Pas dans la salle de bain.</strong> L&apos;humidité et les écarts de température l&apos;abîment.</span></li>
          <li><Ico n="check" /><span><strong>Bien refermé.</strong> Le bouchon remis après chaque usage.</span></li>
        </ul>
        <p>Bien conservé, un parfum garde ses qualités pendant des années. C&apos;est aussi ce qui fait sa valeur à la revente.</p>
      </>
    );
  return (
    <>
      <h3>La différence, c&apos;est la part de matières parfumantes.</h3>
      <div className="concentrations">
        {([['Eau de cologne', 2, 5], ['Eau de toilette', 5, 15], ['Eau de parfum', 15, 20], ['Extrait de parfum', 20, 40]] as const).map(([n, x, y], i) => (
          <div key={n} className="conc" style={{'--a': x / 40, '--b': y / 40, '--i': i} as React.CSSProperties}><span className="conc-nom">{n}</span><span className="conc-barre"><i /></span><span className="conc-val">{x} à {y} %</span></div>
        ))}
      </div>
      <p>Ce sont des ordres de grandeur : chaque maison dose à sa façon. En général, plus c&apos;est concentré, plus le parfum tient sur la peau.</p>
    </>
  );
}

export function Reception() {
  const [coches, setCoches] = useState<number[]>([]);
  const [ouvert, setOuvert] = useState(0);
  const [fiche, setFiche] = useState<string | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (fiche) dlg.current?.showModal();
    else dlg.current?.close();
  }, [fiche]);
  const n = coches.length;
  const cocher = (i: number) => {
    const fait = !coches.includes(i);
    setCoches((c) => (fait ? [...c, i] : c.filter((x) => x !== i)));
    if (fait) setOuvert(i + 1 < RECEPTION.length && !coches.includes(i + 1) ? i + 1 : -1);
  };
  return (
    <section className="reception-section">
      <div className="env reception">
        <div className="rec-gauche">
          <p className="surtitre">Le guide</p>
          <h2 className="grand-titre">Vous venez de recevoir un parfum ? Vérifiez-le en 5 gestes.</h2>
          <div className={`rec-progres ${n === 5 ? 'complet' : ''}`}>
            <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="27" /><circle className="rec-arc" cx="32" cy="32" r="27" style={{'--k': n / 5} as React.CSSProperties} /></svg>
            <span><strong>{n}/5</strong><small>{n === 5 ? 'Tout est conforme : confirmez la réception, le vendeur est payé.' : 'Cochez au fur et à mesure. Vous avez 7 jours.'}</small></span>
          </div>
          <div className="rec-plus"><p>Aussi dans le guide</p>{GUIDE.map((g) => <button key={g.k} type="button" className="filtre" onClick={() => setFiche(g.k)}>{g.t}</button>)}</div>
        </div>
        <ol className="rec-liste">
          {RECEPTION.map((x, i) => (
            <li key={x.t} className={`rec-item ${coches.includes(i) ? 'fait' : ''}`}>
              <button type="button" className="rec-case" aria-pressed={coches.includes(i)} aria-label={`${x.t} : vérifié`} onClick={() => cocher(i)}><Ico n="check" /></button>
              <details open={ouvert === i} onToggle={(e) => (e.currentTarget.open ? setOuvert(i) : ouvert === i && setOuvert(-1))}>
                <summary><span className="rec-n">{i + 1}</span><span className="rec-t"><strong>{x.t}</strong><small>{x.d}</small></span></summary>
                <div className="rec-corps">
                  {x.vues.length ? (
                    <div className="rec-photos">{x.vues.map((v) => <figure key={v}><PhotoDemo vue={v} /><figcaption>{LEG[v]} (exemple)</figcaption></figure>)}</div>
                  ) : (
                    <div className="odeur"><span style={{'--i': 0} as React.CSSProperties}><b>Départ</b>tout de suite</span><span style={{'--i': 1} as React.CSSProperties}><b>Cœur</b>après 20 à 30 min</span><span style={{'--i': 2} as React.CSSProperties}><b>Fond</b>après 1 à 2 h</span></div>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ol>
      </div>
      <dialog ref={dlg} className="guide-dialogue" onClose={() => setFiche(null)} onClick={(e) => e.target === dlg.current && setFiche(null)}>
        <div className="guide-contenu">{fiche ? <FicheGuide k={fiche} /> : null}</div>
        <button className="modale-x" type="button" aria-label="Fermer" onClick={() => setFiche(null)}><Ico n="croix" /></button>
      </dialog>
    </section>
  );
}
