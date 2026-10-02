import React from 'react';
import {ART_CSS, Plane} from '../Art';
import {C, F} from '../util';

const NAMES = ['Surface', 'Volume', 'Motion', 'Support', 'Structure'];

/**
 * La pile des cinq calques du visage, comme sur le site.
 * p : 0 = vue de face, 1 = éclatée. draw : 1 = marques cachées, 0 = dessinées.
 */
export const FaceStack: React.FC<{id: string; x: number; y: number; scale: number; p: number; draw: number; labels?: number; active?: number}> = ({id, x, y, scale, p, draw, labels = 0, active = -1}) => {
  const gap = 96 * p;
  const rx = 60 * p;
  const rz = -32 * p;
  const s = scale * (1 - 0.2 * p);
  const lift = 2 * 96 * Math.sin((60 * Math.PI) / 180) * p * s * 0.9;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', perspective: 1800, perspectiveOrigin: `${x}px ${y - 60}px`}}>
      <style>{ART_CSS}</style>
      <div
        style={{
          position: 'absolute', left: x - 200, top: y - 250, width: 400, height: 500, transformStyle: 'preserve-3d',
          transform: `translateY(${lift}px) scale(${s}) rotateX(${rx}deg) rotateZ(${rz}deg)`,
        }}
      >
        {NAMES.map((name, i) => {
          const k = 4 - i;
          const o = i === 0 ? 1 : Math.min(1, Math.max(0, (p - 0.04) * 4));
          const dim = active >= 0 && i !== active ? 0.4 : 1;
          return (
            <React.Fragment key={name}>
              <div style={{position: 'absolute', inset: 0, transform: `translateZ(${k * gap + k * 0.8}px)`, opacity: o * dim}}>
                <Plane i={i} id={`${id}-${i}`} draw={i === 0 ? draw : 0} active={i === active} />
              </div>
              <div
                style={{
                  position: 'absolute', left: 372, top: 236, display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap',
                  fontFamily: F.body, fontSize: 15, color: i === active ? C.accent : C.ink,
                  transformOrigin: '0 50%',
                  transform: `translateZ(${k * gap}px) rotateZ(${-rz}deg) rotateX(${-rx}deg) scale(${1 / s})`,
                  opacity: labels * (active >= 0 && i !== active ? 0.55 : 1),
                }}
              >
                <span style={{width: i === active ? 56 : 38, height: 1, background: i === active ? C.accent : C.lineStrong}} />
                <span style={{color: C.grey, fontVariantNumeric: 'tabular-nums'}}>{i + 1}</span>
                {name}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
