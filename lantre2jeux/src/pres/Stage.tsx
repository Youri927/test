import React from 'react';
import {CamKey, Place} from '../lib/camera';
import {Browser, Clip, Phone, browserH, phoneDims, sitePoint} from './Screen';
import {E} from './util';

export type Box = {x: number; y: number; w: number};

export const BrowserAt: React.FC<{b: Box; clip: Clip; glow?: string; z?: number; transform?: string}> = ({b, clip, glow, z, transform}) => (
  <Place x={b.x} y={b.y} w={b.w} h={browserH(b.w)} z={z} transform={transform}>
    <Browser clip={clip} w={b.w} glow={glow} />
  </Place>
);

export const PhoneAt: React.FC<{x: number; y: number; w: number; clip: Clip; glow?: string; z?: number; transform?: string}> = ({x, y, w, clip, glow, z, transform}) => (
  <Place x={x} y={y} w={w} h={phoneDims(w).h} z={z} transform={transform}>
    <Phone clip={clip} w={w} glow={glow} />
  </Place>
);

/** Clé de caméra cadrée sur un point du site (px CSS du viewport) */
export const onSite = (b: Box, sx: number, sy: number, k: Omit<CamKey, 'x' | 'y'>): CamKey => ({...k, ...sitePoint(b, sx, sy)});

/** Arrivée en panoramique filé (depuis la gauche) et sortie filée (vers la droite) */
export const whipIn = (k: CamKey, len = 22): CamKey[] => [
  {...k, f: 0, x: (k.x ?? 960) - 520 / (k.s ?? 1), s: (k.s ?? 1) * 1.06, rz: (k.rz ?? 0) - 1.6},
  {...k, f: len, ease: E.out},
];
export const whipOut = (k: CamKey, end: number, len = 16): CamKey[] => [
  {...k, f: end - len},
  {f: end, x: (k.x ?? 960) + 640 / (k.s ?? 1), y: k.y, s: (k.s ?? 1) * 1.07, rz: (k.rz ?? 0) + 1.8, ease: E.in},
];
