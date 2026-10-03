import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Signal} from '../Bits';
import {BEAT, C, E, F, range} from '../util';

export const AVANT_LEN = 14 * BEAT;

// Titres réels des pages du site actuel, tels que les affichent les moteurs de recherche (voir ../escapetv-site/ANALYSE.md)
const PAGES: [string, string][] = [
  ['escapetv.fr', 'Le labyrinthe du Minotaure - Nouvel Escape Game à LYON'],
  ['› leconcept', 'Le Concept - Escape TV'],
  ['› reservations', 'RÉSERVER - Escape TV'],
  ['› faq', 'FAQ - Escape TV'],
  ['› contact', 'Contactez-nous - Escape TV'],
  ['› corporate', 'Corporate - Escape TV'],
  ['› conditions-generales-de-vente', 'CONDITIONS GÉNÉRALES DE VENTE - Escape ...'],
  ['› 2025 › 05 › 27', 'Escape game et mythologie : le Minotaure, un mythe toujours vivant - Escape TV'],
  ['› 2025 › 05 › 09', 'Que faire à Lyon quand il pleut ? 6 idées d’activités indoor - Escape TV'],
];
const GENERIC = /(Nouvel Escape Game)/g;

const Title: React.FC<{text: string; at: number}> = ({text, at}) => {
  const f = useCurrentFrame();
  const parts = text.split(GENERIC);
  return (
    <span>
      {parts.map((p, i) => {
        if (!p.match(GENERIC)) return <React.Fragment key={i}>{p}</React.Fragment>;
        const k = range(f, at, at + 24, 0, 1, E.out);
        return (
          <span key={i} style={{position: 'relative', whiteSpace: 'nowrap'}}>
            <span style={{position: 'absolute', left: -4, right: -4, top: '8%', bottom: '2%', background: 'rgba(226, 181, 94, .45)', borderRadius: 3, transform: `scaleX(${k})`, transformOrigin: 'left'}} />
            <span style={{position: 'relative'}}>{p}</span>
          </span>
        );
      })}
    </span>
  );
};

/** Avant : ce que montre aujourd'hui le site, à travers les titres de ses pages */
export const Avant: React.FC = () => {
  const f = useCurrentFrame();
  const scroll = range(f, 80, 500, 0, -420, E.soft);
  const up = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 22, 0, E.out)}px)`});
  const on = range(f, 0, 30, 1, 0, E.out);
  const off = range(f, AVANT_LEN - 30, AVANT_LEN, 0, 1, E.in);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <div style={{position: 'absolute', left: 880, top: 110, width: 940, transform: `translateY(${scroll}px)`}}>
        {PAGES.map(([slug, t], i) => {
          const at = 34 + i * 20;
          return (
            <div key={t} style={{marginBottom: 18, padding: '22px 28px 24px', borderRadius: 10, background: '#FFFFFF', boxShadow: '0 6px 24px rgba(23, 22, 26, .06)', opacity: range(f, at, at + 26, 0, 1), transform: `translateY(${range(f, at, at + 30, 26, 0, E.out)}px)`}}>
              <div style={{fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 17, color: '#6F6C74', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{i === 0 ? 'https://escapetv.fr' : `https://escapetv.fr ${slug}`}</div>
              <div style={{fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 27, lineHeight: 1.3, color: '#1F2A6B'}}>
                <Title text={t} at={150} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 880, right: 0, top: 0, height: 110, background: `linear-gradient(${C.paper}, rgba(233,230,225,0))`}} />
      <div style={{position: 'absolute', left: 880, right: 0, bottom: 0, height: 170, background: `linear-gradient(rgba(233,230,225,0), ${C.paper})`}} />

      <div style={{position: 'absolute', left: 110, top: 130, width: 680}}>
        <div style={{display: 'inline-flex', padding: '8px 16px 7px', background: C.ink, color: C.paper, fontFamily: F.show, fontWeight: 800, fontStretch: '80%', fontSize: 26, ...up(24)}}>Avant</div>
        <div style={{marginTop: 26, fontFamily: F.show, fontWeight: 900, fontStretch: '60%', fontSize: 92, lineHeight: 0.9, textTransform: 'uppercase', color: C.ink, ...up(36)}}>
          Un escape game de plus.
        </div>
        <div style={{marginTop: 26, fontFamily: F.body, fontSize: 28, lineHeight: 1.45, color: C.grey, ...up(150)}}>
          Aucun titre ne dit ce qui rend Escape TV unique : c’est le seul escape game filmé de France.
        </div>
        <div style={{marginTop: 40, borderTop: `1px solid rgba(22,21,26,.2)`}}>
          {[
            ['Le concept est sur une page à part.', 'Les six genres qui font Escape TV sont rangés sur la page « Le Concept ».', 290],
            ['La vidéo souvenir est expliquée dans la FAQ et les CGV.', 'C’est pourtant ce que les joueurs emportent et partagent.', 370],
          ].map(([h, p, at]) => (
            <div key={h as string} style={{padding: '20px 0', borderBottom: `1px solid rgba(22,21,26,.2)`, ...up(at as number)}}>
              <div style={{fontFamily: F.show, fontWeight: 700, fontStretch: '80%', fontSize: 31, lineHeight: 1.15, color: C.ink}}>{h}</div>
              <div style={{marginTop: 6, fontFamily: F.body, fontSize: 23, lineHeight: 1.45, color: C.grey}}>{p}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, bottom: 46, fontFamily: F.body, fontSize: 18, color: C.mist, ...up(60)}}>
        Titres des pages du site actuel, tels que les affichent les moteurs de recherche.
      </div>
      <Signal level={Math.max(on, off)} />
    </AbsoluteFill>
  );
};
