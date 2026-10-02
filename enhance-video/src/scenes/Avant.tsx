import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Sheet, Wall} from '../Bits';
import {BEAT, C, E, F, range} from '../util';
import {AVANT_BG} from './Opening';

export const AVANT_LEN = 13 * BEAT;

// Titres réels des pages du site actuel, tels que les indexent les moteurs de recherche (voir ANALYSE.md)
const PAGES: [string, string][] = [
  ['enhanceplasticsurgery.com', 'Top Plastic Surgeon Beverly Hills & West Hollywood CA'],
  ['› procedure › facial-procedures', 'Facial Plastic Surgery Beverly Hills & West Hollywood'],
  ['› procedure › cosmetic-surgery', 'Cosmetic Surgery Beverly Hills & West Hollywood CA'],
  ['› procedure › face', 'Facial Cosmetic Surgery Beverly Hills & West Hollywood CA'],
  ['› procedure › eyelid-surgery', 'Eyelid Surgery Beverly Hills - Blepharoplasty West Hollywood'],
  ['› procedure › botox', 'Botox Beverly Hills - Xeomin Injection West Hollywood'],
  ['› procedure › rhinoplasty', 'Rhinoplasty Beverly Hills CA - Nose Surgeon West Hollywood'],
  ['› procedure › bone-shaving', 'Jaw Reduction Beverly Hills - V Line Surgery West Hollywood'],
  ['› procedure › breast-augmentation', 'Breast Augmentation Beverly Hills & West Hollywood CA'],
  ['› procedure › thread-lift', 'Thread Lift Beverly Hills & West Hollywood CA'],
];
const REPEAT = /(Beverly Hills|West Hollywood)/g;

const Title: React.FC<{text: string; at: number}> = ({text, at}) => {
  const f = useCurrentFrame();
  const parts = text.split(REPEAT);
  return (
    <span>
      {parts.map((p, i) => {
        if (!p.match(REPEAT)) return <React.Fragment key={i}>{p}</React.Fragment>;
        const k = range(f, at + i * 3, at + i * 3 + 24, 0, 1, E.out);
        return (
          <span key={i} style={{position: 'relative', whiteSpace: 'nowrap'}}>
            <span style={{position: 'absolute', left: -3, right: -3, top: '10%', bottom: '4%', background: 'rgba(47, 74, 99, .2)', borderRadius: 3, transform: `scaleX(${k})`, transformOrigin: 'left'}} />
            <span style={{position: 'relative'}}>{p}</span>
          </span>
        );
      })}
    </span>
  );
};

/** Avant : ce que montre aujourd'hui le site, à travers ses titres de pages */
export const Avant: React.FC = () => {
  const f = useCurrentFrame();
  const scroll = range(f, 70, 480, 0, -620, E.soft);
  const up = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 22, 0, E.out)}px)`});
  return (
    <AbsoluteFill>
      <Wall tint={AVANT_BG} />
      <div style={{position: 'absolute', left: 860, top: 120, width: 960, transform: `translateY(${scroll}px)`}}>
        {PAGES.map(([slug, t], i) => {
          const at = 40 + i * 22;
          return (
            <div key={t} style={{marginBottom: 18, padding: '22px 28px 24px', borderRadius: 10, background: '#FFFFFF', boxShadow: '0 6px 24px rgba(23, 22, 26, .06)', opacity: range(f, at, at + 26, 0, 1), transform: `translateY(${range(f, at, at + 30, 26, 0, E.out)}px)`}}>
              <div style={{fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 17, color: '#6F6C74', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{i === 0 ? slug : `enhanceplasticsurgery.com ${slug}`}</div>
              <div style={{fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 27, lineHeight: 1.3, color: '#1F2A6B'}}>
                <Title text={t} at={at + 90} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 860, right: 0, top: 0, height: 120, background: `linear-gradient(${AVANT_BG}, rgba(236,234,230,0))`}} />
      <div style={{position: 'absolute', left: 860, right: 0, bottom: 0, height: 160, background: `linear-gradient(rgba(236,234,230,0), ${AVANT_BG})`}} />

      <div style={{position: 'absolute', left: 110, top: 140, width: 660}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.body, fontWeight: 500, fontSize: 24, color: C.accent, ...up(30)}}>
          <span style={{width: 30, height: 1.5, background: 'currentColor'}} />Before
        </div>
        <div style={{marginTop: 24, fontFamily: F.display, fontWeight: 300, fontSize: 66, lineHeight: 1.04, letterSpacing: '-0.025em', color: C.ink, ...up(40)}}>
          The current site speaks mostly to search engines.
        </div>
        <div style={{marginTop: 28, fontFamily: F.body, fontSize: 27, lineHeight: 1.5, color: C.grey, ...up(150)}}>
          Almost every page title repeats the same words: Beverly Hills, West Hollywood.
        </div>
        <div style={{marginTop: 44, borderTop: `1px solid ${C.lineStrong}`}}>
          {[
            ['Dr. Lee’s credentials sit on a bio page.', 'Two board certifications, and a pioneer of jawline BOTOX® in North America.', 300],
            ['Thirty treatments, spread across pages.', 'Surgical, non-surgical, spa, face, body: several pages overlap.', 390],
          ].map(([h, p, at]) => (
            <div key={h as string} style={{padding: '22px 0', borderBottom: `1px solid ${C.lineStrong}`, ...up(at as number)}}>
              <div style={{fontFamily: F.display, fontWeight: 400, fontSize: 32, color: C.ink}}>{h}</div>
              <div style={{marginTop: 6, fontFamily: F.body, fontSize: 23, lineHeight: 1.45, color: C.grey}}>{p}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, bottom: 46, fontFamily: F.body, fontSize: 18, color: C.mist, ...up(60)}}>
        Page titles of the current site, as shown by search engines.
      </div>
      <Sheet level={range(f, AVANT_LEN - 52, AVANT_LEN, 0, 1, E.inOut)} />
    </AbsoluteFill>
  );
};
