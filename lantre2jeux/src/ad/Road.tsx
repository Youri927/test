import React, {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame} from 'remotion';

/** Route 66 de nuit : bitume en perspective, tirets qui défilent, reflets du néon. */
export const Road: React.FC<{width: number; height: number}> = ({width, height}) => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const w = width;
    const h = height;
    const vx = w * 0.5;
    ctx.clearRect(0, 0, w, h);
    // bitume
    const asphalt = ctx.createLinearGradient(0, 0, 0, h);
    asphalt.addColorStop(0, '#0a1018');
    asphalt.addColorStop(1, '#151d28');
    ctx.fillStyle = asphalt;
    ctx.beginPath();
    ctx.moveTo(vx - 6, 0);
    ctx.lineTo(vx + 6, 0);
    ctx.lineTo(w * 1.25, h);
    ctx.lineTo(-w * 0.25, h);
    ctx.closePath();
    ctx.fill();
    // reflets des néons sur le bitume mouillé
    const refl = ctx.createRadialGradient(w * 0.62, h * 0.28, 0, w * 0.62, h * 0.28, w * 0.5);
    refl.addColorStop(0, 'rgba(255, 75, 110, 0.22)');
    refl.addColorStop(0.5, 'rgba(61, 240, 216, 0.07)');
    refl.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = refl;
    ctx.fillRect(0, 0, w, h);
    // lignes de rive
    ctx.strokeStyle = 'rgba(255, 210, 120, 0.45)';
    ctx.lineWidth = 3;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(vx + side * 5, 0);
      ctx.lineTo(vx + side * w * 0.68, h);
      ctx.stroke();
    }
    // tirets centraux (projection 1/z)
    const speed = 9;
    const phase = ((f / 30) * speed) % 4;
    ctx.fillStyle = 'rgba(244, 230, 194, 0.92)';
    for (let k = 0; k < 40; k++) {
      const z1 = 1 + k * 4 - phase;
      const z2 = z1 + 1.8;
      if (z1 < 0.6) continue;
      const y1 = h / z1;
      const y2 = h / z2;
      const w1 = 22 / z1;
      const w2 = 22 / z2;
      ctx.globalAlpha = Math.min(1, 0.15 + 1 / z2);
      ctx.beginPath();
      ctx.moveTo(vx - w1, y1);
      ctx.lineTo(vx + w1, y1);
      ctx.lineTo(vx + w2, y2);
      ctx.lineTo(vx - w2, y2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, [f, width, height]);
  return <canvas ref={ref} width={width} height={height} style={{width, height, display: 'block'}} />;
};
