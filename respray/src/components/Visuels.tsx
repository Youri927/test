/* Les visuels repris du prototype : une photo de l'exemple (avec le trait du niveau), et la porte « Vendre » où la brume
   part de la buse du flacon, en cône de points comme le symbole du logo. */
import {DEMO, DEMO_PARFUM, LEGENDES, demoSrc} from '@/lib/demo';

export function PhotoDemo({vue = 'face', id = DEMO.id, classe = ''}: {vue?: string; id?: string; classe?: string}) {
  const alt = `Exemple : ${DEMO_PARFUM.nom}, ${LEGENDES[vue]}`;
  if (vue === 'niveau') {
    return (
      <span className={`visuel visuel-niveau ${classe}`} role="img" aria-label={`${alt} : environ ${DEMO.niveau} %`}>
        <img src={demoSrc('niveau', id)} alt="" width={600} height={750} decoding="async" />
        <i className="niveau-trait" />
        <b className="niveau-pastille">{DEMO.niveau} %</b>
      </span>
    );
  }
  return <img className={`visuel ${classe}`} src={demoSrc(vue, id)} alt={alt} width={600} height={750} decoding="async" loading="lazy" />;
}

const BUSE = {x: 0.48, y: 0.449}; // la buse du flacon de la porte (tools/porte-vendre/construire.py)
export function Vaporise() {
  const bx = BUSE.x * 600;
  const by = BUSE.y * 800;
  const gouttes: React.ReactNode[] = [];
  for (let rang = 0; rang < 6; rang++) {
    for (let j = 0; j <= rang; j++) {
      const dx = -(30 + rang * 34);
      const dy = (j - rang / 2) * (11 + rang * 3);
      gouttes.push(<circle key={`${rang}-${j}`} cx={bx.toFixed(1)} cy={by.toFixed(1)} r={(6 - rang * 0.7).toFixed(2)} style={{'--dx': `${dx}px`, '--dy': `${dy.toFixed(1)}px`, '--d': `${(rang * 0.12 + j * 0.05).toFixed(2)}s`} as React.CSSProperties} />);
    }
  }
  return (
    <div className="vaporise" aria-hidden="true">
      <img className="v-clair" src="/demo/vendre.webp" alt="" width={600} height={800} decoding="async" />
      <img className="v-sombre" src="/demo/vendre-sombre.webp" alt="" width={600} height={800} decoding="async" loading="lazy" />
      <svg className="brume" viewBox="0 0 600 800">{gouttes}</svg>
    </div>
  );
}

export const Ico = ({n, c = ''}: {n: keyof typeof ICO; c?: string}) => <svg className={`ico ${c}`} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{__html: ICO[n]}} />;
export const ICO = {
  photo: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  cadenas: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  loupe: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  croix: '<path d="M6 6l12 12M18 6L6 18"/>',
  fleche: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  cloche: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4"/>',
  soleil: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  thermo: '<path d="M10 4.5a2 2 0 0 1 4 0V14a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
  goutte: '<path d="M12 3.5s6 6.5 6 10.5a6 6 0 0 1-12 0c0-4 6-10.5 6-10.5z"/>',
  boite: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
  retour: '<path d="M9 7L4 12l5 5"/><path d="M4 12h11a5 5 0 0 1 0 10h-2"/>',
  euro: '<path d="M17 6.5A7 7 0 1 0 17 17.5M4 10.5h9M4 13.5h9"/>',
};
