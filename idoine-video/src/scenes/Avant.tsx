import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Wall, WaterWipe} from '../Bits';
import {BEAT, C, E, F, range} from '../util';

export const AVANT_LEN = 13 * BEAT;

// Titres réels des pages du site actuel, tels que les indexent les moteurs de recherche (voir ANALYSE.md)
const PAGES: [string, string][] = [
  ['pisciniste-a-paris-nous-construisons-la-piscine-haut-de-gamme-de-vos-reves', 'Pisciniste à Paris, nous construisons la piscine haut de gamme de vos rêves'],
  ['constructeur-specialise-de-piscines-et-spas-sur-mesure-a-paris…', 'Constructeur spécialisé de piscines et spas sur mesure à Paris et en région parisienne'],
  ['pisciniste-a-paris-experimente-dans-la-conception…', 'Pisciniste à Paris expérimenté dans la conception et construction de piscines/spas haut de gamme sur-mesure'],
  ['constructeur-de-piscines-de-toit-roof-top…', 'Constructeur de piscines de toit (roof top) d’exceptions haut de gamme à Paris, pour une clientèle exigeante'],
  ['conception-de-piscines-et-spas-de-luxe…', 'Conception de piscines et spas de luxe pour votre Piscine-Hôtel, votre Spa Hôtel ou votre Piscine palace à Paris.'],
  ['conception-de-piscines-dinterieures-haut-de-gamme…', 'Conception de piscines d’intérieures haut de gamme en région parisienne'],
  ['constructeur-de-piscinesspas-haut-de-gamme…', 'Constructeur de piscines/spas haut de gamme pour votre centre de balnéothérapie, votre sauna ou hammam à Paris'],
  ['pisciniste-experimente-dans-la-construction…', 'Pisciniste expérimenté dans la construction de piscines sur-mesure pour votre Wellness à Paris'],
  ['notre-bureau-detude-piscines-et-spas…', 'Notre bureau d’étude piscines et spas répond à vos exigences et vous accompagne tout au long de votre projet.'],
  ['des-architectes-experimentes…', 'Des architectes expérimentés pour la conception de la piscine de vos rêves.'],
];
const REPEAT = /(haut de gamme|sur[ -]mesure|à Paris|Pisciniste|pisciniste|Constructeur|constructeur)/g;

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
            <span style={{position: 'absolute', left: -3, right: -3, top: '8%', bottom: '4%', background: 'rgba(54, 207, 201, .38)', borderRadius: 4, transform: `scaleX(${k})`, transformOrigin: 'left'}} />
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
  const drain = range(f, 0, 50, 1, 0, E.inOut);
  const fill = range(f, AVANT_LEN - 56, AVANT_LEN, 0, 1, E.in);
  const scroll = range(f, 60, 470, 0, -560, E.soft);
  const up = (at: number) => ({opacity: range(f, at, at + 30, 0, 1), transform: `translateY(${range(f, at, at + 40, 22, 0, E.out)}px)`});
  return (
    <AbsoluteFill>
      <Wall tint="#E1E5E3" />
      {/* les titres, empilés comme dans une page de résultats */}
      <div style={{position: 'absolute', left: 860, top: 120, width: 960, transform: `translateY(${scroll}px)`}}>
        {PAGES.map(([slug, t], i) => {
          const at = 40 + i * 22;
          return (
            <div
              key={slug}
              style={{
                marginBottom: 18, padding: '22px 28px 24px', borderRadius: 12, background: '#FBFCFB',
                boxShadow: '0 6px 24px rgba(8, 23, 28, .07)', opacity: range(f, at, at + 26, 0, 1),
                transform: `translateY(${range(f, at, at + 30, 26, 0, E.out)}px)`,
              }}
            >
              <div style={{fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 17, color: '#6A7A7F', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>idoine-piscines.com › {slug}</div>
              <div style={{fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 27, lineHeight: 1.3, color: '#22343A'}}>
                <Title text={t} at={at + 90} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 860, right: 0, top: 0, height: 120, background: 'linear-gradient(#E1E5E3, rgba(225,229,227,0))'}} />
      <div style={{position: 'absolute', left: 860, right: 0, bottom: 0, height: 160, background: 'linear-gradient(rgba(225,229,227,0), #E1E5E3)'}} />

      {/* le constat */}
      <div style={{position: 'absolute', left: 110, top: 150, width: 660}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.body, fontWeight: 600, fontSize: 26, color: C.bassin, ...up(30)}}>
          <span style={{width: 40, height: 2, background: 'currentColor'}} />Avant
        </div>
        <div style={{marginTop: 26, fontFamily: F.display, fontWeight: 300, fontStretch: '122%', fontSize: 64, lineHeight: 1.03, letterSpacing: '-0.02em', color: C.encre, ...up(40)}}>
          Le site actuel parle surtout aux moteurs de recherche.
        </div>
        <div style={{marginTop: 30, fontFamily: F.body, fontSize: 28, lineHeight: 1.5, color: C.gris, ...up(150)}}>
          Dix pages, dix variantes de la même phrase : pisciniste à Paris, haut de gamme, sur mesure.
        </div>
        <div style={{marginTop: 46, borderTop: `1px solid ${C.brume}`}}>
          {[
            ['Les palaces sont rangés dans un portfolio.', 'Le Ritz, le George V, Cheval Blanc, le Bvlgari n’apparaissent pas comme une preuve.', 300],
            ['Ce qui rend Idoine unique n’est pas raconté.', 'Des bassins dans des caves, sous des verrières, sur des toits.', 390],
          ].map(([h, p, at]) => (
            <div key={h as string} style={{padding: '24px 0', borderBottom: `1px solid ${C.brume}`, ...up(at as number)}}>
              <div style={{fontFamily: F.display, fontWeight: 400, fontStretch: '112%', fontSize: 32, color: C.encre}}>{h}</div>
              <div style={{marginTop: 6, fontFamily: F.body, fontSize: 24, lineHeight: 1.45, color: C.gris}}>{p}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, bottom: 46, fontFamily: F.body, fontSize: 19, color: '#7C8B8F', ...up(60)}}>
        Titres des pages du site actuel, tels que les affichent les moteurs de recherche.
      </div>
      <WaterWipe level={Math.max(drain, fill)} />
    </AbsoluteFill>
  );
};
