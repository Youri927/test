import React from 'react';
import './lib/art.js';

type ArtApi = {plane: (i: number, id: string) => string; glyph: (name: string) => string};
const art = (): ArtApi => (window as unknown as {EnhanceArt: ArtApi}).EnhanceArt;

/** Les styles des dessins du site (calques du visage et glyphes) */
export const ART_CSS = `
.edge { fill: none; stroke: rgba(120, 104, 92, 0.42); stroke-width: 1; vector-effect: non-scaling-stroke; }
.is-active .edge { stroke: #2F4A63; stroke-width: 1.4; }
.fill { opacity: 0.94; }
.mk { fill: none; stroke: #2F4A63; stroke-width: 1.3; vector-effect: non-scaling-stroke; }
.mk--dash { stroke-dasharray: 3 6; }
.mk-reveal { fill: none; stroke: #fff; stroke-width: 10; stroke-dasharray: 1; stroke-dashoffset: var(--draw, 0); }
.fiber { fill: none; stroke: #A86E68; stroke-width: 0.9; opacity: 0.6; vector-effect: non-scaling-stroke; }
.fiber--mass { stroke: #8F4D4A; opacity: 0.8; }
.mesh { fill: none; stroke: #7E737B; stroke-width: 0.6; opacity: 0.34; vector-effect: non-scaling-stroke; }
.lig { fill: #7E737B; opacity: 0.7; }
.vec { stroke-width: 1.2; }
.topo { fill: none; stroke: #8C806F; stroke-width: 0.9; opacity: 0.62; vector-effect: non-scaling-stroke; }
`;

/** Un calque du visage (0 surface … 4 structure), en SVG */
export const Plane: React.FC<{i: number; id: string; draw?: number; active?: boolean}> = ({i, id, draw = 0, active}) => (
  <div className={active ? 'is-active' : undefined} style={{position: 'absolute', inset: 0, ['--draw' as string]: draw}} dangerouslySetInnerHTML={{__html: art().plane(i, id).replace('<svg ', '<svg style="width:100%;height:100%;overflow:visible" ')}} />
);
