import {useId} from 'react';

/* Le bouclier « Vérifié par Respray » : un sceau de certification, vert (la couleur réservée à ce qui est vérifié),
   avec une coche dont la fin part en jet de spray, comme le symbole du logo. Le texte tourne lentement autour.
   taille : en pixels ; anime : la coche se trace et le jet part (la première fois qu'on le voit). */
const LOBES = 18;
const bord = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= LOBES * 8; i++) {
    const a = (i / (LOBES * 8)) * Math.PI * 2;
    const r = 57 - 2.6 * (0.5 - 0.5 * Math.cos(a * LOBES));
    pts.push(`${(60 + r * Math.cos(a)).toFixed(2)},${(60 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
})();

export function Bouclier({taille = 96, anime = true, texte = 'VÉRIFIÉ PAR RESPRAY · 6 CONTRÔLES ·'}: {taille?: number; anime?: boolean; texte?: string}) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={`bouclier${anime ? ' bouclier-anime' : ''}`} width={taille} height={taille} viewBox="0 0 120 120" role="img" aria-label="Vérifié par Respray">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3cc483" />
          <stop offset=".55" stopColor="#1a8a52" />
          <stop offset="1" stopColor="#0c5c35" />
        </linearGradient>
        <linearGradient id={`r${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`c${id}`}><path d={bord} /></clipPath>
        <path id={`t${id}`} d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
      </defs>
      <path d={bord} fill={`url(#g${id})`} />
      {/* le reflet qui passe */}
      <g clipPath={`url(#c${id})`}><rect className="bouclier-reflet" x="-60" y="-20" width="40" height="160" fill={`url(#r${id})`} transform="rotate(20 60 60)" /></g>
      <circle cx="60" cy="60" r="51.5" fill="none" stroke="#f6f1e7" strokeOpacity=".35" strokeWidth=".8" />
      <circle cx="60" cy="60" r="38" fill="#0c5c35" fillOpacity=".25" stroke="#f6f1e7" strokeOpacity=".55" strokeWidth="1" />
      <g className="bouclier-texte">
        <text fill="#f6f1e7" fontSize="7.4" fontWeight="700" letterSpacing="1.15" fontFamily="Inter, system-ui, sans-serif">
          <textPath href={`#t${id}`} textLength="286" lengthAdjust="spacing">{texte}</textPath>
        </text>
      </g>
      {/* la coche, puis le jet : 1, 2, 3 points */}
      <path className="bouclier-coche" d="M35 61 L47 73 L66 50" fill="none" stroke="#f6f1e7" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
      <g fill="#f6f1e7" className="bouclier-jet">
        <circle className="b1" cx="73.5" cy="44" r="3.4" />
        <circle className="b2" cx="80.5" cy="37" r="2.5" />
        <circle className="b2" cx="82.5" cy="47.5" r="2.5" />
        <circle className="b3" cx="86.5" cy="30.5" r="1.8" />
        <circle className="b3" cx="89.5" cy="40" r="1.8" />
        <circle className="b3" cx="89" cy="50" r="1.8" />
      </g>
    </svg>
  );
}
