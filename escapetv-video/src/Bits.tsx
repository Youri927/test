import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, E, F, H, W, range} from './util';

/**
 * Légende façon bandeau télé : le numéro en or, le titre sur fond os, la phrase en dessous.
 * Elle reste fixe pendant les mouvements de caméra.
 */
export const LowerThird: React.FC<{tag?: string; title: string; text: string; at?: number; out: number; right?: boolean}> = ({tag, title, text, at = 18, out, right = false}) => {
  const f = useCurrentFrame();
  const a = range(f, at, at + 22, 0, 1, E.out);
  const wipe = range(f, at + 8, at + 40, 0, 1, E.inOut);
  const b = range(f, at + 30, at + 60, 0, 1, E.out);
  const gone = range(f, out - 22, out, 1, 0, E.inOut);
  return (
    <div style={{position: 'absolute', ...(right ? {right: 80} : {left: 80}), bottom: 70, maxWidth: 820, opacity: gone, display: 'flex', flexDirection: 'column', alignItems: right ? 'flex-end' : 'flex-start'}}>
      <div style={{display: 'flex', alignItems: 'stretch', boxShadow: '0 20px 50px rgba(0,0,0,.45)'}}>
        {tag ? (
          <div style={{display: 'flex', alignItems: 'center', padding: '0 20px', background: C.gold, color: C.night, fontFamily: F.show, fontWeight: 800, fontStretch: '80%', fontSize: 30, opacity: a, transform: `translateX(${(1 - a) * -20}px)`}}>
            {tag}
          </div>
        ) : null}
        <div style={{padding: '14px 26px 12px', background: C.bone, color: C.night, fontFamily: F.show, fontWeight: 900, fontStretch: '60%', fontSize: 50, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.005em', clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`}}>
          {title}
        </div>
      </div>
      <div style={{marginTop: 10, maxWidth: 760, padding: '14px 20px 16px', background: 'rgba(12, 11, 10, 0.86)', boxShadow: '0 0 0 1px rgba(237,230,218,.1)', fontFamily: F.body, fontSize: 25, lineHeight: 1.42, color: C.bone2, opacity: b, transform: `translateY(${(1 - b) * 12}px)`, textAlign: right ? 'right' : 'left'}}>
        {text}
      </div>
    </div>
  );
};

/** Fond : le noir chaud du labyrinthe, une lueur d'or très légère */
export const Wall: React.FC<{tint?: string}> = ({tint = C.night}) => (
  <AbsoluteFill style={{background: tint}}>
    <AbsoluteFill style={{background: 'radial-gradient(60% 70% at 50% 45%, rgba(226,181,94,.07), transparent 70%)'}} />
  </AbsoluteFill>
);

/** Vignette et grain très légers, par-dessus toute la vidéo */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(90% 90% at 50% 50%, transparent 62%, rgba(0, 0, 0, 0.3) 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.05, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(f / 2) % 8} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * La transition de la vidéo, comme sur le site : un écran cathodique qui s'éteint ou s'allume.
 * level 0 = image entière, 1 = éteint. Vers 1, l'image se réduit à une ligne, puis à un point.
 */
export const Signal: React.FC<{level: number}> = ({level}) => {
  if (level <= 0.001) return null;
  const close = Math.min(1, level / 0.8); // l'image se referme en ligne
  const dot = Math.max(0, (level - 0.8) / 0.2); // la ligne se réduit en point
  const bar = (H / 2) * close;
  const lineW = W * (1 - dot) + 10;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: '#fff', opacity: Math.sin(Math.PI * close) * 0.18}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bar, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bar, background: '#000'}} />
      {close > 0.92 ? (
        <>
          {dot > 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: H / 2 - 30, height: 60, background: '#000'}} /> : null}
          <div style={{position: 'absolute', left: W / 2 - lineW / 2, top: H / 2 - 2, width: lineW, height: 4, borderRadius: 4, background: '#fff', boxShadow: '0 0 24px 6px rgba(255,255,255,.6)', opacity: level >= 0.999 ? 0 : 1}} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** Neige de télévision, très brève : on zappe d'une partie du site à l'autre */
export const Static: React.FC<{at?: number; len?: number}> = ({at = 0, len = 12}) => {
  const f = useCurrentFrame();
  const k = f - at;
  if (k < 0 || k > len) return null;
  const amt = 1 - k / len;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: amt * 0.9}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <filter id={`snow-${at}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.6" numOctaves={1} seed={k % 9} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 1.6 -0.35  0 0 0 1.6 -0.35  0 0 0 1.6 -0.35  0 0 0 0 1" />
        </filter>
        <rect width={W} height={H} filter={`url(#snow-${at})`} />
      </svg>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,.35) 0 2px, transparent 2px 5px)'}} />
    </AbsoluteFill>
  );
};

/** Les incrustations de régie : coins du viseur, voyant REC, caméra, temps restant */
export const Osd: React.FC<{cam?: string; zone?: string; seconds?: number; opacity?: number}> = ({cam = 'CAM 01', zone = 'Vue d’ensemble', seconds = 0, opacity = 1}) => {
  const f = useCurrentFrame();
  const left = Math.max(0, 3600 - Math.floor(seconds));
  const tc = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
  const corner = (pos: React.CSSProperties, bw: string) => <div style={{position: 'absolute', width: 44, height: 44, border: '0 solid rgba(237,230,218,.75)', borderWidth: bw, ...pos}} />;
  const mono: React.CSSProperties = {fontFamily: F.mono, fontWeight: 500, fontSize: 22, letterSpacing: '0.06em', textTransform: 'uppercase'};
  return (
    <AbsoluteFill style={{opacity, pointerEvents: 'none', color: C.bone}}>
      {corner({left: 44, top: 44}, '3px 0 0 3px')}
      {corner({right: 44, top: 44}, '3px 3px 0 0')}
      {corner({left: 44, bottom: 44}, '0 0 3px 3px')}
      {corner({right: 44, bottom: 44}, '0 3px 3px 0')}
      <div style={{position: 'absolute', left: 84, top: 78, display: 'flex', alignItems: 'center', gap: 14, ...mono}}>
        <span style={{width: 16, height: 16, borderRadius: '50%', background: C.rec, opacity: Math.floor(f / 36) % 2 ? 0.2 : 1}} />
        REC
        <span style={{marginLeft: 22, color: C.bone2}}>En direct du labyrinthe</span>
      </div>
      <div style={{position: 'absolute', right: 84, top: 78, display: 'flex', gap: 20, ...mono}}>
        <b style={{fontWeight: 600}}>{cam}</b>
        <span style={{color: C.bone2}}>{zone}</span>
      </div>
      <div style={{position: 'absolute', right: 84, bottom: 78, textAlign: 'right'}}>
        <div style={{...mono, fontSize: 52, letterSpacing: '0.02em'}}>{tc}</div>
        <div style={{...mono, fontSize: 18, color: C.bone2, marginTop: 8}}>temps restant</div>
      </div>
    </AbsoluteFill>
  );
};
