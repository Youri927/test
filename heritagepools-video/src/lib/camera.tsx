import React, {useId} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ease, EaseFn} from './ease';

export type Cam = {x: number; y: number; s: number; rx: number; ry: number; rz: number};
/** Clé de caméra : l'easing s'applique au segment qui *arrive* sur cette clé. */
export type CamKey = {f: number; ease?: EaseFn} & Partial<Cam>;

const BASE: Cam = {x: 0, y: 0, s: 1, rx: 0, ry: 0, rz: 0};
const PROPS = ['x', 'y', 's', 'rx', 'ry', 'rz'] as const;

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

type RigProps = {
  keys: CamKey[];
  children: React.ReactNode;
  perspective?: number;
  /** multiplicateur du flou de mouvement (0 = off) */
  blur?: number;
  style?: React.CSSProperties;
};

/**
 * Caméra virtuelle : le "monde" (enfants positionnés en coordonnées monde)
 * est transformé pour que le point (x, y) soit au centre de l'écran.
 * Flou de mouvement directionnel calculé depuis la vitesse écran.
 */
export const CameraRig: React.FC<RigProps> = ({keys, children, perspective = 2400, blur = 1, style}) => {
  const frame = useCurrentFrame();
  const id = 'mb' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const c = camAt(keys, frame);
  const p = camAt(keys, frame - 1);

  const dx = (c.x - p.x) * c.s + (c.ry - p.ry) * 18;
  const dy = (c.y - p.y) * c.s - (c.rx - p.rx) * 18;
  const dz = Math.abs(Math.log(c.s / p.s));
  const bx = Math.min(Math.abs(dx) * 0.22 * blur, 70);
  const by = Math.min(Math.abs(dy) * 0.22 * blur, 70);
  const bz = Math.min(dz * 60 * blur, 10);
  const sx = Math.max(bx, bz);
  const sy = Math.max(by, bz);
  const blurOn = sx > 0.6 || sy > 0.6;

  return (
    <AbsoluteFill style={style}>
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
        </filter>
      </svg>
      <AbsoluteFill style={{filter: blurOn ? `url(#${id})` : undefined}}>
        <AbsoluteFill style={{perspective, perspectiveOrigin: '50% 50%', overflow: 'hidden'}}>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 0,
              height: 0,
              transformStyle: 'preserve-3d',
              transform: `rotateX(${c.rx}deg) rotateY(${c.ry}deg) rotateZ(${c.rz}deg) scale(${c.s}) translate(${-c.x}px, ${-c.y}px)`,
            }}
          >
            {children}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Place un élément centré sur (x, y) dans le monde. */
export const Place: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  z?: number;
  transform?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({x, y, w, h, z = 0, transform = '', style, children}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      transformStyle: 'preserve-3d',
      transform: `translateZ(${z}px) ${transform}`,
      ...style,
    }}
  >
    {children}
  </div>
);
