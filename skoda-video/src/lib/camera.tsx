import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ease, EaseFn} from './ease';

/**
 * Caméra 2D seulement (pas de perspective, pas de rotation, pas de flou de mouvement) : le « monde » est un seul calque
 * composité (will-change), déplacé et mis à l'échelle d'un bloc. Le navigateur, son contenu filmé et le curseur bougent
 * donc ensemble, au sous-pixel près : rien ne tremble ni ne saute d'un pixel à l'autre.
 * Le monde est dessiné en grand (le navigateur fait 1850 px) et la caméra ne fait que réduire (échelle ≤ 1) : l'image
 * reste nette à tous les cadrages.
 */
export type Cam = {x: number; y: number; s: number};
/** Clé de caméra : l'easing s'applique au segment qui *arrive* sur cette clé. */
export type CamKey = {f: number; ease?: EaseFn} & Partial<Cam>;

const BASE: Cam = {x: 0, y: 0, s: 1};
const PROPS = ['x', 'y', 's'] as const;

const resolve = (keys: CamKey[]) => {
  let prev: Cam = {...BASE};
  return keys.map((k) => {
    const cam = {...prev};
    for (const p of PROPS) if (k[p] !== undefined) cam[p] = k[p] as number;
    prev = cam;
    return {f: k.f, ease: k.ease ?? ease.inOut, cam};
  });
};

export const camAt = (keys: CamKey[], frame: number): Cam => {
  const r = resolve(keys);
  if (frame <= r[0].f) return r[0].cam;
  for (let i = 1; i < r.length; i++) {
    if (frame <= r[i].f) {
      const a = r[i - 1].cam;
      const b = r[i].cam;
      const t = r[i].ease((frame - r[i - 1].f) / (r[i].f - r[i - 1].f));
      const out = {} as Cam;
      for (const p of PROPS) {
        // zoom interpolé en log : vitesse perçue constante
        out[p] = p === 's' ? Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * t) : a[p] + (b[p] - a[p]) * t;
      }
      return out;
    }
  }
  return r[r.length - 1].cam;
};

/** Caméra : le point (x, y) du monde est au centre de l'image, à l'échelle s */
export const CameraRig: React.FC<{keys: CamKey[]; children: React.ReactNode}> = ({keys, children}) => {
  const frame = useCurrentFrame();
  const c = camAt(keys, frame);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 540,
          width: 0,
          height: 0,
          transformOrigin: '0 0',
          transform: `translate3d(${(-c.x * c.s).toFixed(3)}px, ${(-c.y * c.s).toFixed(3)}px, 0) scale(${c.s.toFixed(5)})`,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Place un élément centré sur (x, y) dans le monde. */
export const Place: React.FC<{x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({x, y, w, h, style, children}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, ...style}}>{children}</div>
);
