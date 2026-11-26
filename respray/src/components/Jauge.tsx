'use client';
/* La jauge de Respray : une piste arrondie qui se remplit, un bouton rond qui grossit quand on le tient, et une bulle
   qui suit le bouton avec la valeur. Une seule pour tout le site (niveau du flacon, prix du simulateur). */
export function Jauge({id, name, min, max, step, value, onChange, format, couleur = 'var(--accent)', reperes}: {
  id: string;
  name?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  couleur?: string;
  reperes?: string[]; // libellés sous la piste, répartis de gauche à droite
}) {
  const k = (value - min) / (max - min);
  return (
    <div className="jauge" style={{'--k': k, '--jauge-c': couleur} as React.CSSProperties}>
      <output className="jauge-bulle" htmlFor={id} aria-hidden="true">{format(value)}</output>
      <input id={id} name={name} type="range" min={min} max={max} step={step} value={value} aria-valuetext={format(value)} onChange={(e) => onChange(+e.target.value)} />
      {reperes ? <div className="jauge-reperes" aria-hidden="true">{reperes.map((r) => <span key={r}>{r}</span>)}</div> : null}
    </div>
  );
}
