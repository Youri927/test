'use client';
/* la note de 1 à 5 : cinq étoiles à toucher (des boutons radio, utilisables au clavier) */
import {useState} from 'react';

const MOTS = ['', 'Décevant', 'Moyen', 'Bien', 'Très bien', 'Parfait'];

export function ChoixNote() {
  const [n, setN] = useState(0);
  const [survol, setSurvol] = useState(0);
  const vu = survol || n;
  return (
    <fieldset className="choix-note">
      <legend>Votre note</legend>
      <div className="choix-note-etoiles" onMouseLeave={() => setSurvol(0)}>
        {[1, 2, 3, 4, 5].map((k) => (
          <label key={k} className={k <= vu ? 'pleine' : ''} onMouseEnter={() => setSurvol(k)}>
            <input type="radio" name="note" value={k} required checked={n === k} onChange={() => setN(k)} />
            <span aria-hidden="true">★</span>
            <span className="vh">{k} sur 5</span>
          </label>
        ))}
        <span className="choix-note-mot" aria-live="polite">{MOTS[vu]}</span>
      </div>
    </fieldset>
  );
}
