'use client';
/* Les mouvements communs à tout le site, chacun pour une raison :
   - la barre de chargement en haut : une page met parfois un instant à arriver, on montre que ça avance ;
   - l'en-tête devient translucide quand on descend : on garde la navigation sans cacher la page ;
   - les chiffres marqués data-compte montent de 0 à leur valeur quand ils arrivent à l'écran. */
import {Suspense, useEffect, useRef} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';

const reduit = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function Barre() {
  const chemin = usePathname();
  const params = useSearchParams();
  const barre = useRef<HTMLDivElement>(null);
  const minuteurs = useRef<number[]>([]);

  const vider = () => { minuteurs.current.forEach(clearTimeout); minuteurs.current = []; };
  const plus = (f: () => void, ms: number) => minuteurs.current.push(window.setTimeout(f, ms));

  // la page est arrivée : la barre se remplit et disparaît
  useEffect(() => {
    const b = barre.current;
    if (!b || b.dataset.etat !== 'charge') { vider(); return; }
    vider();
    b.dataset.etat = 'fin';
    plus(() => { b.dataset.etat = ''; }, 450);
  }, [chemin, params]);

  useEffect(() => {
    const b = barre.current;
    if (!b) return;
    const partir = () => {
      vider();
      b.dataset.etat = '';
      // une navigation instantanée n'affiche rien : la barre n'apparaît qu'après 120 ms
      plus(() => { b.dataset.etat = 'charge'; }, 120);
      plus(() => { b.dataset.etat = ''; }, 12000);
    };
    const clic = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname.startsWith('/photos/')) return;
      if (u.pathname === location.pathname && u.search === location.search) return; // même page, ou simple ancre
      partir();
    };
    const envoi = (e: SubmitEvent) => {
      const f = e.target as HTMLFormElement;
      if (!e.defaultPrevented && (f.method || 'get').toLowerCase() === 'get' && !f.target) partir();
    };
    document.addEventListener('click', clic, true); // en capture : avant que le lien de Next n'annule le clic
    document.addEventListener('submit', envoi);
    window.addEventListener('popstate', partir);
    return () => {
      document.removeEventListener('click', clic, true);
      document.removeEventListener('submit', envoi);
      window.removeEventListener('popstate', partir);
      vider();
    };
  }, []);

  return <div ref={barre} className="barre-nav" aria-hidden="true" />;
}

function useEntete() {
  useEffect(() => {
    let prev = false;
    const lire = () => {
      const bas = scrollY > 6;
      if (bas !== prev) { prev = bas; document.documentElement.toggleAttribute('data-defile', bas); }
    };
    lire();
    addEventListener('scroll', lire, {passive: true});
    return () => removeEventListener('scroll', lire);
  }, []);
}

/* « 1 234 » : on lit le nombre écrit dans l'élément, on part de 0 et on y arrive en ~0,9 s (lent à la fin) */
function useCompteurs() {
  const chemin = usePathname();
  useEffect(() => {
    if (reduit() || !('IntersectionObserver' in window)) return;
    const fmt = new Intl.NumberFormat('fr-FR');
    const o = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      o.unobserve(e.target);
      const el = e.target as HTMLElement;
      const fin = Number((el.dataset.compte || el.textContent || '').replace(/[^\d]/g, ''));
      if (!fin) return;
      const t0 = performance.now();
      const pas = (t: number) => {
        const k = Math.min(1, (t - t0) / 900);
        el.textContent = fmt.format(Math.round(fin * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(pas);
      };
      requestAnimationFrame(pas);
    }), {threshold: 0.6});
    document.querySelectorAll('[data-compte]').forEach((el) => {
      if (!(el as HTMLElement).dataset.compte) (el as HTMLElement).dataset.compte = el.textContent || '';
      o.observe(el);
    });
    return () => o.disconnect();
  }, [chemin]);
}

/* Après l'envoi d'un formulaire (une étape qui se termine : étiquette, dépôt, avis, versements…), la page se met à
   jour, souvent plus courte, et on se retrouve tout en bas. Si c'est le cas, on remonte en douceur vers le bloc où
   l'on était (ou en haut de la page s'il a disparu). Rien ne bouge si l'on n'est pas coincé en bas de page, ni si la
   page va vers une ancre précise. */
function useApresEnvoi() {
  useEffect(() => {
    const envoi = (e: SubmitEvent) => {
      const f = e.target as HTMLFormElement;
      if ((f.getAttribute('method') || 'post').toLowerCase() === 'get') return;
      const bloc = f.closest('section, article, .action-bloc') as HTMLElement | null;
      const ancre = location.hash;
      let fini = false;
      const verifier = () => {
        if (fini || f.isConnected) return;
        fini = true;
        o.disconnect();
        // on laisse la page finir de se dessiner
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (location.hash && location.hash !== ancre) return;
          const enBas = scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
          if (!enBas) return;
          const cible = bloc?.isConnected ? bloc : null;
          const y = cible ? cible.getBoundingClientRect().top + scrollY - 96 : 0;
          if (y < scrollY - 20) scrollTo({top: Math.max(0, y), behavior: reduit() ? 'auto' : 'smooth'});
        }));
      };
      const o = new MutationObserver(verifier);
      o.observe(document.body, {childList: true, subtree: true});
      setTimeout(() => { fini = true; o.disconnect(); }, 20000);
    };
    document.addEventListener('submit', envoi);
    return () => document.removeEventListener('submit', envoi);
  }, []);
}

export function Mouvement() {
  useEntete();
  useCompteurs();
  useApresEnvoi();
  return <Suspense fallback={null}><Barre /></Suspense>;
}

/* un montant qui glisse vers sa nouvelle valeur au lieu de sauter (le « Vous touchez » du formulaire de vente) */
export function Montant({valeur, format}: {valeur: number; format: (n: number) => string}) {
  const ref = useRef<HTMLSpanElement>(null);
  const affiche = useRef(valeur);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const de = affiche.current;
    if (de === valeur || reduit()) { affiche.current = valeur; el.textContent = format(valeur); return; }
    let id = 0;
    const t0 = performance.now();
    const pas = (t: number) => {
      const k = Math.min(1, (t - t0) / 420);
      affiche.current = de + (valeur - de) * (1 - Math.pow(1 - k, 3));
      el.textContent = format(k < 1 ? Math.round(affiche.current * 100) / 100 : valeur);
      if (k < 1) id = requestAnimationFrame(pas);
    };
    id = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(id);
  }, [valeur, format]);
  return <span ref={ref}>{format(valeur)}</span>;
}
