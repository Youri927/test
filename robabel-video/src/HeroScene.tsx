import React from 'react';
import {Img, staticFile} from 'remotion';
import scene from '../public/hero/hero.json';
import {H, W} from './util';

/**
 * La photo de l'accueil du site, recomposée en plein cadre à partir des mêmes calques (tools/hero.py du site) :
 * la photo lumières éteintes, puis la maison, chaque palmier et la piscine, chacun avec son intensité (0 à 1).
 * Allumés à fond, les calques redonnent la photo d'origine (piscine en violet).
 */
export type Lit = {house: number; palms: number[]; pool: number};

type Layer = {name: string; group: string; x: number; y: number; w: number; h: number};
const layers = scene.layers as Layer[];
const palms = layers.filter((l) => l.group === 'palms');

// cadrage « cover » 16:9 dans la photo 4:3, point de mire un peu sous le milieu (la piscine)
const SW = W;
const SH = (W * scene.height) / scene.width;
const TOP = -(SH - H) * 0.62;

export const HeroScene: React.FC<{lit: Lit; zoom?: number; origin?: [number, number]}> = ({lit, zoom = 1, origin = [0.45, 0.62]}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#071833'}}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: TOP,
        width: SW,
        height: SH,
        transform: `scale(${zoom})`,
        transformOrigin: `${origin[0] * 100}% ${origin[1] * 100}%`,
      }}
    >
      <Img src={staticFile('hero/off-2560.avif')} style={{position: 'absolute', inset: 0, width: SW, height: SH}} />
      {layers
        .filter((l) => l.group !== 'color')
        .map((l) => {
          const o = l.group === 'house' ? lit.house : l.group === 'pool' ? lit.pool : lit.palms[palms.indexOf(l)] ?? 0;
          if (o <= 0.001) return null;
          return (
            <Img
              key={l.name}
              src={staticFile(`hero/${l.name}-2560.avif`)}
              style={{position: 'absolute', left: l.x * SW, top: l.y * SH, width: l.w * SW, height: l.h * SH, opacity: o}}
            />
          );
        })}
    </div>
  </div>
);

export const PALMS = palms.length;
