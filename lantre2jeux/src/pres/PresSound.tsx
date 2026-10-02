import React from 'react';
import {Html5Audio, Sequence, staticFile} from 'remotion';

type Cue = [number, string, number];

// Départs des scènes (images à 60 i/s) : ouverture 0, concept 252, noir 432, affiche 864,
// portes 1152 (Route 66), 1332 (Corleone), 1512 (Alerte Rouge), verdict 1728, cadenas 1908,
// mobile 2160, identité 2448, sortie 2664 (éclair 2844), fin 3024.
const CUES: Cue[] = [
  // ouverture : la torche s'allume en grésillant
  [14, 'ad/click', 0.7],
  [16, 'ad/buzz', 0.32],
  [150, 'shimmer', 0.22],
  [228, 'whoosh', 0.4],
  // concept : la lumière parcourt les étapes
  [252, 'whoosh', 0.3],
  [300, 'shimmer', 0.18],
  [412, 'whip', 0.5],
  // 01 le noir
  [439, 'ad/click', 0.6],
  [441, 'ad/buzz', 0.28],
  [638, 'whoosh', 0.28],
  [846, 'whip', 0.6],
  // 02 l'affiche
  [864, 'whoosh', 0.35],
  [1058, 'boom', 0.35],
  [1086, 'ad/beep', 0.22],
  [1136, 'whip', 0.6],
  // 03 trois portes
  [1152, 'whoosh', 0.35],
  [1184, 'whoosh', 0.45],
  [1206, 'boom', 0.4],
  [1236, 'ad/buzz', 0.3],
  [1318, 'whip', 0.55],
  [1332, 'whoosh', 0.35],
  [1364, 'whoosh', 0.45],
  [1386, 'boom', 0.4],
  [1420, 'shimmer', 0.32],
  [1498, 'whip', 0.55],
  [1512, 'whoosh', 0.35],
  [1566, 'whoosh', 0.45],
  [1590, 'boom', 0.45],
  [1630, 'ad/beep', 0.2],
  [1690, 'ad/beep', 0.2],
  [1714, 'whip', 0.6],
  // 04 le verdict
  [1728, 'whoosh', 0.35],
  [1770, 'tick', 0.3],
  [1776, 'tick', 0.3],
  [1782, 'tick', 0.3],
  [1790, 'tap', 0.35],
  [1894, 'whip', 0.55],
  // 05 le cadenas : deux crans
  [1908, 'whoosh', 0.35],
  [2028, 'ad/ratchet', 0.7],
  [2030, 'ad/click', 0.5],
  [2088, 'ad/ratchet', 0.7],
  [2090, 'ad/click', 0.5],
  [2144, 'whip', 0.6],
  // mobile
  [2160, 'whoosh', 0.4],
  [2262, 'tap', 0.55],
  [2328, 'tap', 0.55],
  [2432, 'whip', 0.55],
  // identité
  [2448, 'whoosh', 0.35],
  ...[0, 1, 2, 3, 4, 5].map((i): Cue => [2452 + i * 4, 'tick', 0.32]),
  [2474, 'whoosh', 0.25],
  [2648, 'whip', 0.55],
  // 06 la sortie : la porte s'ouvre, on traverse la lumière
  [2664, 'whoosh', 0.35],
  [2742, 'boom', 0.35],
  [2766, 'riser', 0.45],
  [2844, 'boom', 0.75],
  [2844, 'shimmer', 0.5],
];

/** Musique originale + effets synchronisés sur l'image */
export const PresSound: React.FC = () => (
  <>
    <Html5Audio src={staticFile('sfx/pres/music.wav')} volume={0.62} />
    {CUES.map(([at, name, vol], i) => (
      <Sequence key={i} from={at} name={`${name} ${at}`}>
        <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
      </Sequence>
    ))}
  </>
);
