import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import SHEETDATA from '../sheet.json';
import {Caption, Line} from '../Bits';
import {CameraRig, type CamKey} from '../lib/camera';
import {FeetGrid, Pool} from '../Pool';
import {lineup} from '../lineup';
import {SHEET} from '../beats.ts';
import {pre} from '../timeline';
import {BODY, C, DISPLAY, E, F, H, TNUM, W, feet, range} from '../util';

// la page 2 de la fiche (834 × 654 pt), affichée à K px par point dans le monde de la caméra
const K = 2.3;
const PAGE = {w: SHEETDATA.page[0] * K, h: SHEETDATA.page[1] * K};
const BOXES = SHEETDATA.boxes as Record<string, number[]>;
// la note de la fiche : « Measurements are approximate and not to scale. » (pdftotext -bbox)
const NOTE = {x: 547.5 * K, y: 577 * K, w: 75 * K, h: 16 * K};

// la caméra : le haut de la fiche, la note, puis la page entière (fixe à partir de SHEET.pull + 34)
const FULL = {x: PAGE.w / 2, y: PAGE.h / 2, s: 0.7};
const KEYS = (p: number): CamKey[] => [
  {f: 0, x: 760, y: 360, s: 1.06},
  {f: p + SHEET.note - 20, x: 800, y: 390, s: 1.1, ease: E.sine},
  {f: p + SHEET.note + 40, x: NOTE.x + NOTE.w / 2, y: NOTE.y + NOTE.h / 2, s: 1.75, ease: E.soft},
  {f: p + SHEET.pull, x: NOTE.x + NOTE.w / 2 + 8, y: NOTE.y + NOTE.h / 2 + 4, s: 1.8, ease: E.sine},
  {f: p + SHEET.pull + 34, ...FULL, ease: E.inOut},
];

// la gamme, à l'échelle, sous le titre
const LINE = lineup({left: 170, top: 318, width: 1580, rows: 4, gap: 3.4, rowGap: 52});

/** Point du monde (px de la page affichée) → point de l'écran, caméra fixe sur la page entière */
const toScreen = (x: number, y: number) => ({x: (x - FULL.x) * FULL.s + W / 2, y: (y - FULL.y) * FULL.s + H / 2});

/**
 * La fiche : la fiche Barrier Reef 2025 que leur site propose en PDF ; la caméra lit la note « not to scale » ;
 * puis les dessins se détachent de la page et se rangent à l'échelle, sur une grille en pieds, en prenant la vraie eau.
 */
export const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  const p = pre('Sheet');
  const t = f - p;
  const keys = KEYS(p);
  const dim = range(t, SHEET.lift, SHEET.lift + 34, 0, 1, E.inOut);
  const noteP = range(t, SHEET.note + 30, SHEET.note + 62, 0, 1, E.out);
  const shift = (at: number) => range(t, at, at + 46, 118, 0, E.out);
  const up = (at: number) => ({opacity: range(t, at, at + 30, 0, 1), transform: `translateY(${range(t, at, at + 40, 18, 0, E.out)}px)`});
  return (
    <AbsoluteFill style={{background: C.white}}>
      {/* la page, dans le monde de la caméra */}
      <CameraRig keys={keys} blur={0.4}>
        <div style={{position: 'absolute', left: 0, top: 0, width: PAGE.w, height: PAGE.h, boxShadow: '0 30px 90px rgba(10, 26, 36, 0.22)', background: '#fff', opacity: 1 - dim}}>
          <Img src={staticFile('img/sheet.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
          {/* la note, mesurée */}
          {noteP > 0 ? (
            <>
              <div style={{position: 'absolute', left: NOTE.x, top: NOTE.y, width: NOTE.w, height: NOTE.h, background: 'rgba(8, 148, 252, 0.18)', mixBlendMode: 'multiply', opacity: noteP * (1 - dim)}} />
              <svg width={NOTE.w} height={NOTE.h} style={{position: 'absolute', left: NOTE.x, top: NOTE.y, overflow: 'visible', opacity: 1 - dim}}>
                <rect width={NOTE.w} height={NOTE.h} rx={3} fill="none" stroke={C.azure} strokeWidth={1.6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - noteP} />
                <line x1={0} x2={NOTE.w * noteP} y1={-6} y2={-6} stroke={C.azure} strokeWidth={1.2} />
                <line x1={0} x2={0} y1={-9} y2={-3} stroke={C.azure} strokeWidth={1.2} />
                <line x1={NOTE.w} x2={NOTE.w} y1={-9} y2={-3} stroke={C.azure} strokeWidth={1.2} opacity={noteP > 0.95 ? 1 : 0} />
              </svg>
            </>
          ) : null}
        </div>
      </CameraRig>

      {/* la grille en pieds de la gamme */}
      <FeetGrid w={W} h={H} ppf={LINE.ppf} x0={170} y0={318} opacity={0.8 * range(t, SHEET.lift + 30, SHEET.lift + 90)} />

      {/* les 23 dessins : de leur place sur la page à leur place dans la gamme, à l'échelle, en prenant la vraie eau */}
      {t >= SHEET.lift - 1
        ? LINE.placed.map((it) => {
            const b = BOXES[it.drawing];
            if (!b) return null;
            const a0 = toScreen(b[0] * K, b[1] * K);
            const w0 = b[2] * K * FULL.s;
            const h0 = b[3] * K * FULL.s;
            const start = SHEET.lift + 10 + it.k * SHEET.landStep;
            const q = E.inOut(range(t, start, start + 54));
            // un léger arc : le dessin se soulève de la page avant de se poser
            const lift = Math.sin(Math.PI * q) * 26;
            const x = a0.x + (it.x - a0.x) * q;
            const y = a0.y + (it.y - a0.y) * q - lift;
            const w = w0 + (it.w - w0) * q;
            const h = h0 + (it.h - h0) * q;
            const water = range(q, 0.3, 1, 0, 1, E.sine);
            const label = range(t, start + 50, start + 74);
            return (
              <React.Fragment key={it.model.id}>
                <div style={{position: 'absolute', left: x, top: y, width: w, height: h, filter: lift > 1 ? `drop-shadow(0 ${lift * 0.5}px ${lift * 0.7}px rgba(10, 26, 36, ${0.12 * Math.sin(Math.PI * q)}))` : undefined}}>
                  <Pool drawing={it.drawing} w={w} h={h} ppf={LINE.ppf * (w / it.w)} water={water} lines={false} drift={t * 0.05} />
                </div>
                {label > 0 ? (
                  <div style={{position: 'absolute', left: it.x, top: it.y + it.h + 8, width: Math.max(it.w, 90), opacity: label, fontFamily: F.sans, lineHeight: 1.15}}>
                    <div style={{fontSize: 14, fontWeight: 650, color: C.ink, whiteSpace: 'nowrap'}}>{it.model.name}</div>
                    <div style={{fontSize: 13, fontWeight: 500, color: C.inkSoft, ...TNUM}}>{feet(it.lft * 12)}</div>
                  </div>
                ) : null}
              </React.Fragment>
            );
          })
        : null}

      {/* l'échelle graphique, comme sur un plan : 0, 10, 20 pieds */}
      <ScaleBar ppf={LINE.ppf} right={W - 170} top={258} p={range(t, SHEET.title + 30, SHEET.title + 70, 0, 1, E.out)} />

      {/* le titre */}
      <div style={{position: 'absolute', left: 170, top: 92, ...DISPLAY, fontSize: 112, color: C.ink}}>
        <Line shift={shift(SHEET.title)}>Every model, drawn to scale</Line>
      </div>
      <div style={{position: 'absolute', left: 174, top: 222, ...BODY, fontSize: 27, color: C.inkSoft, ...up(SHEET.title + 26)}}>
        Barrier Reef’s own drawings, at each model’s listed length and width, on one grid in feet.
      </div>

      <Caption title="Their best page is a PDF" text="Barrier Reef’s 2025 model sheet: every model and its measurements. The drawings are not to scale." at={p + 24} out={p + SHEET.pull + 10} width={660} />
    </AbsoluteFill>
  );
};

/** Échelle graphique de 20 pieds, en cinq segments alternés, chiffres 0, 10 et 20 ft */
const ScaleBar: React.FC<{ppf: number; right: number; top: number; p: number}> = ({ppf, right, top, p}) => {
  const len = 20 * ppf;
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: right - len, top, width: len, height: 40, opacity: p}}>
      <div style={{position: 'absolute', left: 0, top: 18, width: len, height: 7, border: `1.5px solid ${C.ink}`, boxSizing: 'border-box', clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>
        {[0, 1, 2, 3].map((k) => (
          <div key={k} style={{position: 'absolute', left: k * 5 * ppf, top: 0, width: 5 * ppf, height: '100%', background: k % 2 ? 'transparent' : C.ink}} />
        ))}
      </div>
      {[0, 10, 20].map((v) => (
        <div key={v} style={{position: 'absolute', left: v * ppf, top: -6, transform: 'translateX(-50%)', fontFamily: F.sans, fontSize: 15, fontWeight: 600, color: C.ink, ...TNUM}}>
          {v === 20 ? '20 ft' : v}
        </div>
      ))}
    </div>
  );
};
