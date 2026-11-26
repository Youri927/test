'use client';
/* Ajouter un flacon à son placard (maison, parfum, contenance, niveau), et partager la valeur de son placard. */
import {useState} from 'react';
import {ajouterAuPlacard} from '@/app/actions/marche';

type P = {id: number; nom: string; formats: {ml: number}[]};
type M = {id: number; nom: string; parfums: P[]};

export function FormPlacard({maisons}: {maisons: M[]}) {
  const [maisonId, setMaison] = useState('');
  const [parfumId, setParfum] = useState('');
  const [niveau, setNiveau] = useState(100);
  const maison = maisons.find((m) => String(m.id) === maisonId);
  const parfum = maison?.parfums.find((p) => String(p.id) === parfumId);
  return (
    <form action={ajouterAuPlacard} className="placard-form">
      <div>
        <label htmlFor="pl-maison">Maison</label>
        <select id="pl-maison" className="champ" value={maisonId} onChange={(e) => { setMaison(e.target.value); setParfum(''); }} required>
          <option value="">Choisir</option>
          {maisons.filter((m) => m.parfums.length).map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="pl-parfum">Parfum</label>
        <select id="pl-parfum" name="parfumId" className="champ" value={parfumId} onChange={(e) => setParfum(e.target.value)} disabled={!maison} required>
          <option value="">Choisir</option>
          {maison?.parfums.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="pl-ml">Contenance</label>
        {parfum?.formats.length ? (
          <select id="pl-ml" name="ml" className="champ" required defaultValue="">
            <option value="">Choisir</option>
            {parfum.formats.map((f) => <option key={f.ml} value={f.ml}>{f.ml} ml</option>)}
          </select>
        ) : (
          <div className="champ-prix"><input id="pl-ml" name="ml" className="champ" inputMode="decimal" placeholder="100" required /><span>ml</span></div>
        )}
      </div>
      <div className="placard-niveau">
        <label htmlFor="pl-niveau">Il reste <output>{niveau >= 100 ? 'tout (neuf)' : `${niveau} %`}</output></label>
        <input id="pl-niveau" name="niveau" type="range" min={5} max={100} step={5} value={niveau} onChange={(e) => setNiveau(+e.target.value)} />
      </div>
      <button className="btn btn-noir" type="submit" disabled={!parfum}>Ajouter au placard</button>
    </form>
  );
}

export function Partager({texte, url}: {texte: string; url: string}) {
  const [fait, setFait] = useState('');
  async function partager() {
    try {
      if (navigator.share) {
        await navigator.share({text: texte, url});
        return;
      }
      await navigator.clipboard.writeText(`${texte} ${url}`);
      setFait('Copié : collez-le où vous voulez.');
    } catch {
      setFait('');
    }
  }
  return (
    <>
      <button className="btn" type="button" onClick={partager}>Partager</button>
      {fait ? <span className="aide" role="status">{fait}</span> : null}
    </>
  );
}
