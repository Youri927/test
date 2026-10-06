import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, E, F, H, LABEL, W, range} from './util';

/** Légende en bas : intitulé, titre, phrase. Elle reste fixe pendant les mouvements de caméra. */
export const LowerThird: React.FC<{tag?: string; title: string; text: string; at?: number; out: number; dark?: boolean; right?: boolean}> = ({tag, title, text, at = 18, out, dark = false, right = false}) => {
  const f = useCurrentFrame();
  const a = range(f, at, at + 34, 0, 1, E.out);
  const b = range(f, at + 14, at + 50, 0, 1, E.out);
  const gone = range(f, out - 24, out, 1, 0, E.inOut);
  return (
    <div
      style={{
        position: 'absolute', ...(right ? {right: 72} : {left: 72}), bottom: 64, maxWidth: 720,
        padding: '28px 34px 30px', borderRadius: 22,
        background: dark ? 'rgba(14, 24, 52, 0.95)' : 'rgba(251, 248, 242, 0.97)',
        boxShadow: dark ? '0 0 0 1px rgba(244,239,230,.12), 0 18px 50px rgba(0,0,0,.35)' : `0 0 0 1px ${C.line}, 0 18px 50px rgba(15, 29, 58, 0.16)`,
        color: dark ? C.sand : C.ink,
        opacity: a * gone,
        transform: `translateY(${(1 - a) * 22}px)`,
      }}
    >
      {tag ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, ...LABEL, fontSize: 15}}>
          <ArchGlyph size={20} color={dark ? C.lime : C.ink} />
          <span style={{color: dark ? C.lime : C.ink}}>{tag}</span>
        </div>
      ) : null}
      <div style={{...DISPLAY, fontSize: 54, lineHeight: 0.98, letterSpacing: '-0.035em'}}>{title}</div>
      <div style={{marginTop: 14, fontFamily: F.body, fontSize: 23, lineHeight: 1.45, color: dark ? 'rgba(244,239,230,.74)' : C.grey, opacity: b}}>{text}</div>
    </div>
  );
};

/** Le petit arc des étiquettes du site */
export const ArchGlyph: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size * 0.55} viewBox="0 0 20 11" style={{flex: 'none'}}>
    <path d="M2 10.5V9a8 8 0 0 1 16 0v1.5" fill="none" stroke={color} strokeWidth={2.4} />
  </svg>
);

/** Fond : le sable du midi, avec une lumière douce */
export const Wall: React.FC<{tint?: string}> = ({tint = C.bg}) => (
  <AbsoluteFill style={{background: tint}}>
    <AbsoluteFill style={{background: 'radial-gradient(70% 80% at 50% 40%, rgba(255,255,255,.5), transparent 70%)'}} />
  </AbsoluteFill>
);

/** Vignette et grain très légers, par-dessus toute la vidéo */
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(90% 90% at 50% 50%, transparent 66%, rgba(15, 29, 58, 0.12) 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.045, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(f / 2) % 8} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/* ——— La transition de la vidéo : l'arche du logo ——— */
const BULGE = 400;
const edgeY = (level: number) => H + BULGE - (H + 2 * BULGE) * level;

/** L'arche monte et couvre l'écran (level 0 → 1) */
export const ArchCover: React.FC<{level: number; color: string; edge?: string}> = ({level, color, edge = C.lime}) => {
  if (level <= 0.001) return null;
  const y = edgeY(level);
  const arc = `M0 ${y} A ${W / 2} ${BULGE} 0 0 1 ${W} ${y}`;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d={`${arc} L${W} ${H + 20} L0 ${H + 20} Z`} fill={color} />
        {level < 0.995 ? <path d={arc} fill="none" stroke={edge} strokeWidth={4} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

/** L'arche découvre la scène : la nouvelle image apparaît dans un dôme qui monte (level 0 → 1) */
export const ArchReveal: React.FC<{level: number; color: string; edge?: string}> = ({level, color, edge = C.lime}) => {
  if (level >= 0.999) return null;
  const y = edgeY(level);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d={`M0 -20 L${W} -20 L${W} ${y} A ${W / 2} ${BULGE} 0 0 0 0 ${y} Z`} fill={color} />
        {level > 0.005 ? <path d={`M${W} ${y} A ${W / 2} ${BULGE} 0 0 0 0 ${y}`} fill="none" stroke={edge} strokeWidth={4} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

/** Le logo WAVE (tracé fidèle de leur fichier) : la marque, et le mot */
export const Mark: React.FC<{size: number; sand?: boolean}> = ({size, sand = false}) => (
  <Img src={staticFile(`img/mark-${sand ? 'sand' : 'navy'}.svg`)} style={{width: size, height: (size * 601) / 606, display: 'block'}} />
);
export const Word: React.FC<{width: number; tone?: 'ink' | 'sand' | 'navy'}> = ({width, tone = 'ink'}) => (
  <Img src={staticFile(`img/word-${tone}.svg`)} style={{width, height: (width * 138) / 608, display: 'block'}} />
);

/** Une ligne qui monte derrière son cache, comme les titres du site */
export const Line: React.FC<{shift: number; style?: React.CSSProperties; children: React.ReactNode}> = ({shift, style, children}) => (
  <div style={{overflow: 'hidden', padding: '0.04em 0.1em 0.12em 0', margin: '-0.04em -0.1em -0.12em 0'}}>
    <div style={{transform: `translateY(${shift}%)`, ...style}}>{children}</div>
  </div>
);

/* ——— Un site « gabarit » générique, dessiné (pas un concurrent réel) ——— */
const HERO_WORDS = ['POOL REMODELING', 'POOL RESURFACING', 'CUSTOM POOLS', 'POOL SERVICE', 'BACKYARD OASIS', 'POOL BUILDER', 'POOL REPAIR', 'POOL DESIGN'];

/** Page d'accueil type d'un artisan, en 1440 × 900 : bandeau, photo assombrie, titre en capitales, formulaire, trois cartes */
export const TemplateSite: React.FC<{accent: string; v: number}> = ({accent, v}) => {
  const formLeft = v % 3 === 1;
  const bar = (w: number, h = 14, c = '#CBD0D6') => <div style={{width: w, height: h, borderRadius: 3, background: c}} />;
  return (
    <div style={{position: 'absolute', inset: 0, width: 1440, height: 900, background: '#FFFFFF', fontFamily: 'Arial, Helvetica, sans-serif', overflow: 'hidden'}}>
      <div style={{height: 92, display: 'flex', alignItems: 'center', padding: '0 64px', gap: 18, borderBottom: '1px solid #E6E8EB'}}>
        <div style={{width: 54, height: 54, borderRadius: v % 2 ? 10 : '50%', background: accent, opacity: 0.85}} />
        <div style={{display: 'grid', gap: 8}}>{bar(190, 16, '#2F3A46')}{bar(130, 10, accent)}</div>
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 26}}>
          {bar(80, 10)}{bar(80, 10)}{bar(80, 10)}
          <div style={{padding: '14px 24px', borderRadius: 4, background: accent, color: '#fff', fontWeight: 700, fontSize: 20, letterSpacing: '0.04em'}}>CALL NOW</div>
        </div>
      </div>
      <div style={{position: 'relative', height: 500, background: `linear-gradient(160deg, #56606B, #262E37)`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: -60, right: -60, bottom: -140, height: 300, borderRadius: '50%', background: 'linear-gradient(#4E87A6, #2C5C78)', opacity: 0.55}} />
        <div style={{position: 'absolute', left: 300, top: 110, width: 520, height: 210, background: 'rgba(255,255,255,.06)', clipPath: 'polygon(0 40%, 50% 0, 100% 40%, 100% 100%, 0 100%)'}} />
        <div style={{position: 'absolute', inset: 0, background: 'rgba(10, 14, 20, .35)'}} />
        <div style={{position: 'absolute', ...(formLeft ? {right: 90} : {left: 90}), top: 150, color: '#fff', fontWeight: 800, fontSize: 66, lineHeight: 1.02, letterSpacing: '0.01em', width: 640}}>
          {HERO_WORDS[v % HERO_WORDS.length]}
          <div style={{fontSize: 66}}>ARIZONA</div>
          <div style={{marginTop: 22, display: 'grid', gap: 10}}>{bar(460, 12, 'rgba(255,255,255,.7)')}{bar(380, 12, 'rgba(255,255,255,.7)')}</div>
        </div>
        <div style={{position: 'absolute', ...(formLeft ? {left: 90} : {right: 90}), top: 50, width: 360, padding: 26, background: '#fff', borderRadius: 4, display: 'grid', gap: 14}}>
          <div style={{textAlign: 'center', fontWeight: 800, fontSize: 22, color: '#222'}}>GET A FREE QUOTE</div>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{height: 40, border: '1px solid #C9CDD2', borderRadius: 3}} />)}
          <div style={{height: 46, borderRadius: 3, background: accent}} />
        </div>
      </div>
      <div style={{padding: '40px 90px 0', display: 'grid', justifyItems: 'center', gap: 16}}>
        {bar(320, 22, '#2F3A46')}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26, width: '100%', marginTop: 14}}>
          {[0, 1, 2].map((i) => <div key={i} style={{height: 220, borderRadius: 4, background: 'linear-gradient(#9AA4AE, #6E7884)'}} />)}
        </div>
      </div>
    </div>
  );
};
