'use client';
/* Les photos d'une annonce. Un clic ouvre la photo en grand : elle grandit depuis sa vignette (on garde le fil de ce
   qu'on regardait), on passe aux suivantes avec les flèches, le clavier ou en glissant, Échap ou un clic à côté
   referme et la photo retourne à sa place. Sans JavaScript, chaque photo reste un lien vers l'image. */
import {useCallback, useEffect, useRef, useState} from 'react';

type Photo = {src: string; alt: string; legende: string};
const reduit = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(.22, .8, .24, 1)';

export function Galerie({photos}: {photos: Photo[]}) {
  const [i, setI] = useState<number | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const grande = useRef<HTMLImageElement>(null);
  const vignettes = useRef<(HTMLImageElement | null)[]>([]);
  const touche = useRef<number | null>(null);

  // la photo part de (ou retourne vers) la vignette : même position, même taille
  const voler = useCallback((k: number, sens: 'ouvre' | 'ferme') => {
    const v = vignettes.current[k];
    const g = grande.current;
    if (!v || !g || reduit()) return Promise.resolve();
    const a = v.getBoundingClientRect();
    const b = g.getBoundingClientRect();
    if (!b.width || !b.height) return Promise.resolve();
    const depart = `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${a.width / b.width}, ${a.height / b.height})`;
    const etapes = [{transform: depart, borderRadius: '14px'}, {transform: 'none', borderRadius: '18px'}];
    return g.animate(sens === 'ouvre' ? etapes : etapes.reverse(), {duration: sens === 'ouvre' ? 480 : 380, easing: EASE, fill: 'both'}).finished.then(() => undefined);
  }, []);

  const ouvrir = (k: number, e: React.MouseEvent) => {
    e.preventDefault();
    setI(k);
  };
  useEffect(() => {
    if (i === null || dlg.current?.open) return;
    dlg.current?.showModal();
    document.documentElement.classList.add('visionneuse-ouverte');
    const g = grande.current;
    const go = () => voler(i, 'ouvre');
    if (g?.complete) go(); else g?.addEventListener('load', go, {once: true});
  }, [i, voler]);

  const fermer = useCallback(async () => {
    if (i === null || !dlg.current) return;
    dlg.current.classList.add('sortie');
    await voler(i, 'ferme');
    dlg.current.classList.remove('sortie');
    dlg.current.close();
  }, [i, voler]);

  const aller = useCallback((d: number) => setI((x) => (x === null ? x : (x + d + photos.length) % photos.length)), [photos.length]);

  // en changeant de photo dans la visionneuse : un glissé court dans le sens du mouvement
  const sens = useRef(0);
  const changer = (d: number) => { sens.current = d; aller(d); };
  useEffect(() => {
    const g = grande.current;
    if (!g || !sens.current || reduit()) return;
    g.getAnimations().forEach((a) => a.cancel());
    g.animate([{opacity: 0, transform: `translateX(${sens.current * 40}px)`}, {opacity: 1, transform: 'none'}], {duration: 320, easing: EASE});
    sens.current = 0;
  }, [i]);

  useEffect(() => {
    if (i === null) return;
    const clavier = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') changer(1);
      if (e.key === 'ArrowLeft') changer(-1);
    };
    addEventListener('keydown', clavier);
    return () => removeEventListener('keydown', clavier);
  });

  const p = i === null ? null : photos[i];
  return (
    <>
      <div className="galerie galerie-reelle">
        {photos.map((ph, k) => (
          <figure key={ph.src} className={k === 0 ? 'grande' : ''}>
            <a href={ph.src} onClick={(e) => ouvrir(k, e)} aria-label={`Agrandir : ${ph.legende}`}>
              <img ref={(el) => { vignettes.current[k] = el; }} className="visuel" src={ph.src} alt={ph.alt} />
            </a>
            <figcaption>{ph.legende}</figcaption>
          </figure>
        ))}
      </div>
      <dialog
        ref={dlg}
        className="visionneuse"
        aria-label="Photos de l'annonce"
        onCancel={(e) => { e.preventDefault(); fermer(); }}
        onClose={() => { setI(null); document.documentElement.classList.remove('visionneuse-ouverte'); }}
        onClick={(e) => { if (e.target === e.currentTarget || (e.target as Element).classList.contains('visionneuse-scene')) fermer(); }}
        onTouchStart={(e) => { touche.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touche.current === null) return;
          const dx = e.changedTouches[0].clientX - touche.current;
          touche.current = null;
          if (Math.abs(dx) > 50) changer(dx < 0 ? 1 : -1);
        }}
      >
        {p ? (
          <>
            <div className="visionneuse-scene"><img ref={grande} src={p.src} alt={p.alt} /></div>
            <p className="visionneuse-legende"><span>{p.legende}</span><span>{(i ?? 0) + 1} / {photos.length}</span></p>
            {photos.length > 1 ? (
              <>
                <button type="button" className="visionneuse-fleche gauche" onClick={() => changer(-1)} aria-label="Photo précédente"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg></button>
                <button type="button" className="visionneuse-fleche droite" onClick={() => changer(1)} aria-label="Photo suivante"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg></button>
              </>
            ) : null}
            <button type="button" className="visionneuse-fermer" onClick={fermer} aria-label="Fermer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
          </>
        ) : null}
      </dialog>
    </>
  );
}
