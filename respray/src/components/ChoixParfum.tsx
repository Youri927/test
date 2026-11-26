'use client';
/* Chercher un parfum en tapant (nom ou maison) : d'abord notre catalogue, puis les parfums connus de Scento. Clavier :
   flèches, Entrée, Échap. Un parfum introuvable peut être proposé à l'équipe. */
import {useEffect, useId, useRef, useState} from 'react';

export type Choix = {id?: number; nom: string; maison: string; formats?: {ml: number; neuf?: number}[]; source: 'catalogue' | 'scento' | 'libre'};

export function ChoixParfum({onChoix, valeur, libre = true, placeholder = 'Ex. Baccarat Rouge 540, Dior, Aventus…'}: {
  onChoix: (c: Choix | null) => void;
  valeur?: Choix | null;
  libre?: boolean; // propose « je ne le trouve pas » quand rien ne correspond
  placeholder?: string;
}) {
  const id = useId();
  const [q, setQ] = useState('');
  const [res, setRes] = useState<Choix[]>([]);
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(0);
  const [charge, setCharge] = useState(false);
  const boite = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = q.trim();
    if (t.length < 2) { setRes([]); return; }
    setCharge(true);
    const ctl = new AbortController();
    const h = setTimeout(() => {
      fetch(`/api/parfums/recherche?q=${encodeURIComponent(t)}`, {signal: ctl.signal})
        .then((r) => r.json())
        .then((r: Choix[]) => { setRes(r); setActif(0); setCharge(false); })
        .catch(() => setCharge(false));
    }, 220);
    return () => { clearTimeout(h); ctl.abort(); };
  }, [q]);

  useEffect(() => {
    const f = (e: MouseEvent) => { if (!boite.current?.contains(e.target as Node)) setOuvert(false); };
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);

  const options: Choix[] = [...res, ...(libre && q.trim().length >= 3 && !charge ? [{nom: q.trim(), maison: '', source: 'libre' as const}] : [])];
  const choisir = (c: Choix) => { onChoix(c); setOuvert(false); setQ(''); setRes([]); };

  if (valeur) {
    return (
      <div className="choix-parfum-pris">
        <span><strong>{valeur.nom}</strong>{valeur.maison ? <small>{valeur.maison}</small> : <small>Parfum à ajouter par l&apos;équipe</small>}</span>
        <button type="button" className="lien-bouton" onClick={() => onChoix(null)}>Changer</button>
      </div>
    );
  }

  return (
    <div className="choix-parfum" ref={boite}>
      <input
        id={id} className="champ" type="search" autoComplete="off" placeholder={placeholder} value={q}
        role="combobox" aria-expanded={ouvert && options.length > 0} aria-controls={`${id}-liste`} aria-autocomplete="list"
        aria-activedescendant={ouvert && options[actif] ? `${id}-${actif}` : undefined}
        onChange={(e) => { setQ(e.target.value); setOuvert(true); }}
        onFocus={() => setOuvert(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setOuvert(true); setActif((a) => Math.min(options.length - 1, a + 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActif((a) => Math.max(0, a - 1)); }
          else if (e.key === 'Enter' && ouvert && options[actif]) { e.preventDefault(); choisir(options[actif]); }
          else if (e.key === 'Escape') setOuvert(false);
        }}
      />
      {ouvert && q.trim().length >= 2 ? (
        <ul className="choix-parfum-liste" id={`${id}-liste`} role="listbox">
          {charge && !res.length ? <li className="choix-parfum-info">Recherche…</li> : null}
          {!charge && !res.length && !libre ? <li className="choix-parfum-info">Aucun parfum trouvé.</li> : null}
          {options.map((o, i) => (
            <li key={`${o.source}-${o.maison}-${o.nom}`} id={`${id}-${i}`} role="option" aria-selected={i === actif}
              className={`${i === actif ? 'actif' : ''} ${o.source === 'libre' ? 'libre' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); choisir(o); }} onMouseEnter={() => setActif(i)}>
              {o.source === 'libre'
                ? <span><strong>Je ne le trouve pas</strong><small>Ajouter « {o.nom} » : l&apos;équipe le met au catalogue</small></span>
                : <span><strong>{o.nom}</strong><small>{o.maison}</small></span>}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
