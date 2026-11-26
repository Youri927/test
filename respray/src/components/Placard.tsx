'use client';
/* Ajouter un flacon à son placard (maison, parfum, contenance, niveau), et partager la valeur de son placard. */
import {useState} from 'react';
import {ajouterAuPlacard} from '@/app/actions/marche';
import {Jauge} from '@/components/Jauge';
import {ChoixParfum, type Choix} from '@/components/ChoixParfum';

export function FormPlacard() {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [niveau, setNiveau] = useState(100);
  const formats = choix?.formats ?? [];
  return (
    <form action={ajouterAuPlacard} className="placard-form">
      <div>
        <label>Parfum</label>
        <ChoixParfum valeur={choix} onChoix={setChoix} />
        {choix?.source === 'catalogue' ? <input type="hidden" name="parfumId" value={choix.id} /> : null}
        {choix?.source === 'scento' ? <><input type="hidden" name="scentoNom" value={choix.nom} /><input type="hidden" name="scentoMaison" value={choix.maison} /></> : null}
        {choix?.source === 'libre' ? <input type="hidden" name="libreNom" value={choix.nom} /> : null}
      </div>
      {choix?.source === 'libre' ? (
        <div>
          <label htmlFor="pl-maison">Maison</label>
          <input id="pl-maison" name="libreMaison" className="champ" placeholder="Ex. Maison Francis Kurkdjian" required />
          <p className="aide">L&apos;équipe l&apos;ajoute au catalogue, puis il apparaît dans votre placard avec son estimation.</p>
        </div>
      ) : null}
      {choix && choix.source !== 'libre' ? (
        <>
          <div>
            <label htmlFor="pl-ml">Contenance</label>
            {formats.length ? (
              <select id="pl-ml" name="ml" className="champ" required defaultValue="">
                <option value="">Choisir</option>
                {formats.map((f) => <option key={f.ml} value={f.ml}>{f.ml} ml</option>)}
              </select>
            ) : (
              <div className="champ-prix"><input id="pl-ml" name="ml" className="champ" inputMode="decimal" placeholder="100" required /><span>ml</span></div>
            )}
          </div>
          <div className="placard-niveau">
            <label htmlFor="pl-niveau">Ce qu&apos;il reste dans le flacon</label>
            <Jauge id="pl-niveau" name="niveau" min={5} max={100} step={5} value={niveau} onChange={setNiveau} format={(v) => (v >= 100 ? 'Neuf' : `${v} %`)} reperes={['Presque vide', 'À moitié', 'Plein']} />
          </div>
        </>
      ) : null}
      <button className="btn btn-noir" type="submit" disabled={!choix}>{choix?.source === 'libre' ? 'Proposer ce parfum' : 'Ajouter au placard'}</button>
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
