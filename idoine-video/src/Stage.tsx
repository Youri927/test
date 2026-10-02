import React from 'react';
import {CamKey, Place} from './lib/camera';
import {Browser, Clip, Phone, browserH, phoneDims, sitePoint} from './Screen';

export type Box = {x: number; y: number; w: number};

export const BrowserAt: React.FC<{b: Box; clip: Clip; glow?: string}> = ({b, clip, glow}) => (
  <Place x={b.x} y={b.y} w={b.w} h={browserH(b.w)}>
    <Browser clip={clip} w={b.w} glow={glow} />
  </Place>
);

export const PhoneAt: React.FC<{x: number; y: number; w: number; clip: Clip; z?: number; transform?: string}> = ({x, y, w, clip, z, transform}) => (
  <Place x={x} y={y} w={w} h={phoneDims(w).h} z={z} transform={transform}>
    <Phone clip={clip} w={w} />
  </Place>
);

/** Clé de caméra cadrée sur un point du site (px CSS du viewport 1440×900) */
export const onSite = (b: Box, sx: number, sy: number, k: Omit<CamKey, 'x' | 'y'>): CamKey => ({...k, ...sitePoint(b, sx, sy)});
