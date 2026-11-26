'use client';
/* L'ambiance reprise du prototype : les éléments marqués data-revele / data-anime apparaissent quand ils entrent à
   l'écran (classe « vu »), et le bouton clair / sombre de l'en-tête (le choix est gardé dans le navigateur). */
import {useCallback, useEffect, useRef, useState, type RefObject} from 'react';
import {usePathname} from 'next/navigation';

export function Apparitions() {
  const chemin = usePathname();
  useEffect(() => {
    const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduit || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js-anime');
    // data-revele : apparaît une fois ; data-anime : son animation se rejoue à chaque retour à l'écran
    const vu = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          const rejoue = e.target.hasAttribute('data-anime');
          if (e.isIntersecting) {
            e.target.classList.add('vu');
            if (!rejoue) vu.unobserve(e.target);
          } else if (rejoue && e.boundingClientRect.top > 0) {
            // on est remonté au-dessus : l'animation repartira de zéro en redescendant
            e.target.classList.remove('vu');
          }
        }),
      {rootMargin: '0px 0px -8% 0px'},
    );
    const suivis = new WeakSet<Element>();
    const observer = (racine: ParentNode) => racine.querySelectorAll('[data-revele]:not(.vu), [data-anime]').forEach((el) => { if (!suivis.has(el)) { suivis.add(el); vu.observe(el); } });
    observer(document);
    // ce qui arrive plus tard (filtre, navigation) est observé aussi
    const m = new MutationObserver(() => observer(document));
    m.observe(document.body, {childList: true, subtree: true});
    return () => {
      vu.disconnect();
      m.disconnect();
    };
  }, [chemin]);
  return null;
}

const CLE = 'respray-theme';
export function BoutonTheme() {
  const [sombre, setSombre] = useState(false);
  useEffect(() => {
    const s = matchMedia('(prefers-color-scheme: dark)');
    const lire = () => setSombre((document.documentElement.dataset.theme || (s.matches ? 'sombre' : 'clair')) === 'sombre');
    lire();
    s.addEventListener('change', lire);
    return () => s.removeEventListener('change', lire);
  }, []);
  const basculer = () => {
    const t = sombre ? 'clair' : 'sombre';
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem(CLE, t);
    } catch {}
    setSombre(!sombre);
  };
  const libelle = sombre ? 'Passer en clair' : 'Passer en sombre';
  return (
    <button className="theme" type="button" aria-pressed={sombre} aria-label={libelle} title={libelle} onClick={basculer}>
      <svg className="ico ico-lune" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
      <svg className="ico ico-soleil" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></svg>
    </button>
  );
}

/* posé dans <head> : applique le thème choisi avant l'affichage, sans clignotement */
export const SCRIPT_THEME = `try{var t=localStorage.getItem('${CLE}');if(t==='clair'||t==='sombre')document.documentElement.dataset.theme=t}catch(e){}`;

/* Une animation en étapes qui se joue UNE fois : elle avance seulement quand l'élément est bien à l'écran (au moins
   « seuil » de sa hauteur), s'arrête sur la dernière étape, et ne repart de zéro que si l'on remonte au-dessus de
   l'élément puis qu'on redescend dessus. Un choix à la main met en pause quelques secondes. */
export function useUnePasse(ref: RefObject<HTMLElement | null>, n: number, duree: number, {seuil = 0.5, pause = 5000} = {}) {
  const [i, setI] = useState(0);
  const enPause = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let visible = false;
    const o = new IntersectionObserver(([e]) => {
      visible = e.intersectionRatio >= seuil || (e.isIntersecting && e.intersectionRect.height >= innerHeight * 0.6);
      if (!e.isIntersecting && e.boundingClientRect.top > 0) setI(0); // remonté au-dessus : on repartira de zéro
    }, {threshold: [0, 0.25, seuil, 0.75, 1]});
    o.observe(el);
    const t = setInterval(() => {
      if (visible && !document.hidden && Date.now() > enPause.current) setI((x) => (x + 1 < n ? x + 1 : x));
    }, duree);
    return () => { o.disconnect(); clearInterval(t); };
  }, [ref, n, duree, seuil]);
  const choisir = useCallback((k: number) => { enPause.current = Date.now() + pause; setI(k); }, [pause]);
  return [i, choisir] as const;
}
