import React from 'react';
import {CamKey, Place} from './lib/camera';
import {Browser, Clip, Phone, browserH, phoneDims, sitePoint} from './Screen';
import {H, W} from './util';

export type Box = {x: number; y: number; w: number};

export const BrowserAt: React.FC<{b: Box; clip?: Clip; path?: string; dark?: boolean; transform?: string; children?: React.ReactNode}> = ({b, clip, path, dark, transform, children}) => (
  <Place x={b.x} y={b.y} w={b.w} h={browserH(b.w)} transform={transform}>
    <Browser clip={clip} w={b.w} path={path} dark={dark}>{children}</Browser>
  </Place>
);

export const PhoneAt: React.FC<{x: number; y: number; w: number; clip: Clip; z?: number; transform?: string}> = ({x, y, w, clip, z, transform}) => (
  <Place x={x} y={y} w={w} h={phoneDims(w).h} z={z} transform={transform}>
    <Phone clip={clip} w={w} />
  </Place>
);

/** Clé de caméra cadrée sur un point du site (px CSS du viewport 1440×900) */
export const onSite = (b: Box, sx: number, sy: number, k: Omit<CamKey, 'x' | 'y'>): CamKey => ({...k, ...sitePoint(b, sx, sy)});

/**
 * Clé de caméra rapprochée sur un point du site, bornée pour que le cadre reste dans le navigateur :
 * tant que le zoom ne suffit pas à remplir l'image dans un sens, le navigateur reste centré dans ce sens.
 */
export const focus = (b: Box, sx: number, sy: number, k: Omit<CamKey, 'x' | 'y'> & {s: number}): CamKey => {
  const p = sitePoint(b, sx, sy);
  const hw = W / 2 / k.s;
  const hh = H / 2 / k.s;
  const left = b.x - b.w / 2;
  const right = b.x + b.w / 2;
  const top = b.y - browserH(b.w) / 2;
  const bottom = b.y + browserH(b.w) / 2;
  const x = 2 * hw >= right - left ? b.x : Math.min(right - hw, Math.max(left + hw, p.x));
  const y = 2 * hh >= bottom - top ? b.y : Math.min(bottom - hh, Math.max(top + hh, p.y));
  return {...k, x, y};
};

/** Marge entre le bord de l'image et le navigateur rangé de côté, puis entre le navigateur et la légende */
export const ASIDE = {margin: 56, gap: 40} as const;

/**
 * Clé de caméra qui fait de la place à une légende : le navigateur, un peu réduit et entier, se range contre un bord,
 * la légende prend l'autre côté (`side` : le côté de la légende). Voir asideWidth pour la largeur de la légende.
 */
export const aside = (b: Box, side: 'left' | 'right', k: Omit<CamKey, 'x' | 'y'> & {s: number}): CamKey => {
  const half = (b.w / 2) * k.s;
  const center = side === 'right' ? ASIDE.margin + half : W - ASIDE.margin - half;
  return {...k, x: b.x - (center - W / 2) / k.s, y: b.y};
};

/** Largeur d'une légende posée à côté du navigateur rangé (la légende est à 64 px du bord) */
export const asideWidth = (b: Box, s: number) => Math.floor(W - ASIDE.margin - b.w * s - ASIDE.gap - 64);
/** Distance au bas de l'image du bas du navigateur rangé : la légende s'aligne dessus */
export const asideBottom = (b: Box, s: number) => Math.round(H / 2 - (browserH(b.w) * s) / 2);
