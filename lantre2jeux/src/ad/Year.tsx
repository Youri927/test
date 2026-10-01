import React, {useLayoutEffect, useRef} from 'react';
import {random, useCurrentFrame} from 'remotion';
import {F} from './theme';

const DIGITS = Array.from({length: 10}, (_, i) => i);

/** Compteur mécanique : `cols` = position (flottante) de chaque colonne, 0 → 9. */
export const Year: React.FC<{cols: number[]; size: number; color: string; secret?: number; glow?: string}> = ({
  cols,
  size,
  color,
  secret = 0,
  glow = 'rgba(255, 198, 110, 0.28)',
}) => (
  <div
    style={{
      position: 'relative',
      display: 'inline-flex',
      fontFamily: F.display,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1,
      color,
      fontVariantNumeric: 'tabular-nums',
      filter: `drop-shadow(0 0 ${Math.round(size * 0.18)}px ${glow})`,
    }}
  >
    {cols.map((v, i) => (
      <span key={i} style={{display: 'inline-flex', height: '1em', overflow: 'hidden', opacity: i >= 2 ? 1 - secret : 1}}>
        <span style={{display: 'flex', flexDirection: 'column', transform: `translateY(${-v}em)`}}>
          {DIGITS.map((d) => (
            <span key={d} style={{display: 'block', height: '1em', textAlign: 'center'}}>
              {d}
            </span>
          ))}
        </span>
      </span>
    ))}
    {secret > 0 ? <Mosaic opacity={secret} /> : null}
  </div>
);

/** Date classée secrète : les deux derniers chiffres pixelisés en mosaïque rouge. */
const COLS = 8;
const ROWS = 8;
const cache = new Map<string, number[]>();
const coverage = (digits: string) => {
  const hit = cache.get(digits);
  if (hit) return hit;
  const probe = document.createElement('canvas');
  probe.width = 160;
  probe.height = 160;
  const ctx = probe.getContext('2d', {willReadFrequently: true});
  if (!ctx) return new Array(COLS * ROWS).fill(0);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 168px ${F.display}`;
  ctx.fillText(digits, 80, 88);
  const data = ctx.getImageData(0, 0, 160, 160).data;
  const out: number[] = [];
  const cw = 160 / COLS;
  const ch = 160 / ROWS;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let sum = 0;
      let n = 0;
      for (let y = Math.floor(r * ch); y < (r + 1) * ch; y += 2) {
        for (let x = Math.floor(c * cw); x < (c + 1) * cw; x += 2) {
          sum += data[(y * 160 + x) * 4 + 3];
          n++;
        }
      }
      out.push(sum / n / 255);
    }
  }
  cache.set(digits, out);
  return out;
};

const Mosaic: React.FC<{opacity: number}> = ({opacity}) => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const digits = String(10 + Math.floor(random(`mz-${Math.floor(f / 5)}`) * 90));
    const cov = coverage(digits);
    for (let i = 0; i < cov.length; i++) {
      const k = Math.min(1, Math.max(0, cov[i] * 0.85 + (random(`mj-${Math.floor(f / 2)}-${i}`) - 0.5) * 0.24));
      const r = Math.round(58 + (255 - 58) * k);
      const g = Math.round(14 + (70 - 14) * k * k);
      const b = Math.round(20 + (52 - 20) * k * k);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(i % COLS, Math.floor(i / COLS), 1, 1);
    }
  }, [f]);
  return (
    <canvas
      ref={ref}
      width={COLS}
      height={ROWS}
      style={{position: 'absolute', left: '50%', top: '0.03em', width: '50%', height: '0.97em', imageRendering: 'pixelated', opacity}}
    />
  );
};
