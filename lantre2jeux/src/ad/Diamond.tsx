import React, {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame} from 'remotion';

type V3 = [number, number, number];

/* Taille brillant simplifiée (table, couronne, rondiste, pavillon), calculée une fois. */
const verts: V3[] = [];
const add = (x: number, y: number, z: number) => verts.push([x, y, z]) - 1;
const ring = (n: number, r: number, y: number, off = 0) =>
  Array.from({length: n}, (_, i) => {
    const a = ((i + off) / n) * Math.PI * 2;
    return add(Math.cos(a) * r, y, Math.sin(a) * r);
  });
const T = ring(8, 0.55, 0.42);
const G = ring(16, 1, 0);
const B = ring(16, 1, -0.05);
const R = ring(16, 0.52, -0.5, 0.5);
const CU = add(0, -1.05, 0);
const faces: number[][] = [T.slice()];
for (let i = 0; i < 8; i++) {
  const t0 = T[i];
  const t1 = T[(i + 1) % 8];
  faces.push([t0, t1, G[2 * i + 1]], [t0, G[2 * i + 1], G[2 * i]], [t1, G[(2 * i + 2) % 16], G[2 * i + 1]]);
}
for (let j = 0; j < 16; j++) {
  const j1 = (j + 1) % 16;
  faces.push([G[j], G[j1], B[j1], B[j]], [B[j], B[j1], R[j]], [B[j1], R[j1], R[j]], [R[j], R[j1], CU]);
}
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const normals: V3[] = faces.map((f) => {
  const p = f.map((i) => verts[i]);
  let n = norm(cross(sub(p[1], p[0]), sub(p[2], p[0])));
  const c = p.reduce<V3>((acc, v) => [acc[0] + v[0] / p.length, acc[1] + v[1] / p.length, acc[2] + v[2] / p.length], [0, 0, 0]);
  if (dot(n, sub(c, [0, -0.2, 0])) < 0) n = [-n[0], -n[1], -n[2]];
  return n;
});
const KEY = norm([-0.55, 0.65, 0.55]);
const RIM = norm([0.85, 0.05, 0.35]);
const HK = norm([KEY[0], KEY[1], KEY[2] + 1]);
const HR = norm([RIM[0], RIM[1], RIM[2] + 1]);
const STOPS: [number, number[]][] = [[0, [24, 20, 16]], [0.45, [128, 114, 92]], [0.75, [226, 212, 186]], [1, [255, 252, 244]]];
const ramp = (b: number) => {
  for (let k = 1; k < STOPS.length; k++) {
    if (b <= STOPS[k][0]) {
      const [p0, c0] = STOPS[k - 1];
      const [p1, c1] = STOPS[k];
      const t = (b - p0) / (p1 - p0);
      return c0.map((v, i) => Math.round(v + (c1[i] - v) * t));
    }
  }
  return STOPS[STOPS.length - 1][1];
};
const FIRE = [[255, 220, 160], [214, 238, 255], [255, 236, 200]];

const draw = (ctx: CanvasRenderingContext2D, w: number, t: number, spin: number) => {
  const cx0 = w / 2;
  const cy0 = w * 0.47 + Math.sin(t * 0.9) * w * 0.012;
  const scale = w * 0.33;
  ctx.clearRect(0, 0, w, w);
  const glow = ctx.createRadialGradient(cx0, cy0, 0, cx0, cy0, w * 0.5);
  glow.addColorStop(0, 'rgba(255, 214, 140, 0.30)');
  glow.addColorStop(0.5, 'rgba(226, 174, 82, 0.09)');
  glow.addColorStop(1, 'rgba(226, 174, 82, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, w);
  const ry = spin;
  const tilt = 0.3;
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const cx = Math.cos(tilt);
  const sx = Math.sin(tilt);
  const rot = (v: V3): V3 => {
    const X = v[0] * cy + v[2] * sy;
    const Z = -v[0] * sy + v[2] * cy;
    return [X, v[1] * cx - Z * sx, v[1] * sx + Z * cx];
  };
  const P = verts.map((v) => {
    const r = rot(v);
    const k = 4.5 / (4.5 - r[2]);
    return [cx0 + r[0] * scale * k, cy0 - r[1] * scale * k, r[2]];
  });
  const list = faces
    .map((f, i) => ({f, n: rot(normals[i]), z: f.reduce((a, idx) => a + P[idx][2], 0) / f.length, i}))
    .sort((a, b) => a.z - b.z);
  ctx.lineJoin = 'round';
  for (const {f, n, i} of list) {
    if (n[2] <= 0.02) continue;
    const lam = Math.max(0, dot(n, KEY));
    const sKey = Math.pow(Math.max(0, dot(n, HK)), 38);
    const sRim = Math.pow(Math.max(0, dot(n, HR)), 24);
    const pattern = ((i * 37) % 7) / 6;
    const fire = Math.pow(Math.max(0, Math.sin(t * 1.5 + i * 2.17)), 18);
    const b = Math.max(0, Math.min(1, 0.06 + 0.42 * lam + 0.32 * pattern * (0.4 + lam) + 1.35 * sKey + 0.55 * sRim + 0.45 * fire));
    let col = ramp(b);
    if (fire > 0.2) {
      const fc = FIRE[i % 3];
      const m = Math.min(0.35, fire * 0.4);
      col = col.map((v, k) => Math.round(v + (fc[k] - v) * m));
    }
    ctx.beginPath();
    f.forEach((idx, k) => (k ? ctx.lineTo(P[idx][0], P[idx][1]) : ctx.moveTo(P[idx][0], P[idx][1])));
    ctx.closePath();
    ctx.fillStyle = `rgb(${col[0]}, ${col[1]}, ${col[2]})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 246, 225, ${0.18 + 0.4 * b})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    const glint = sKey + 0.6 * fire;
    if (glint > 0.55) {
      const c = f.reduce((a, idx) => [a[0] + P[idx][0] / f.length, a[1] + P[idx][1] / f.length], [0, 0]);
      const s = Math.min(1.4, glint) * w * 0.05;
      ctx.fillStyle = 'rgba(255, 253, 245, 0.95)';
      ctx.beginPath();
      ctx.moveTo(c[0], c[1] - s);
      ctx.lineTo(c[0] + s * 0.14, c[1] - s * 0.14);
      ctx.lineTo(c[0] + s, c[1]);
      ctx.lineTo(c[0] + s * 0.14, c[1] + s * 0.14);
      ctx.lineTo(c[0], c[1] + s);
      ctx.lineTo(c[0] - s * 0.14, c[1] + s * 0.14);
      ctx.lineTo(c[0] - s, c[1]);
      ctx.lineTo(c[0] - s * 0.14, c[1] - s * 0.14);
      ctx.closePath();
      ctx.fill();
    }
  }
};

/** Le diamant des Corleone, en 3D, piloté par la frame. */
export const Diamond: React.FC<{size: number; spinStart?: number}> = ({size, spinStart = 0}) => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const t = f / 30;
    // rotation qui accélère à l'ouverture de la porte, puis ralentit
    const spin = 1.2 + t * 0.55 + Math.max(0, Math.min(1, (f - spinStart) / 24)) * 1.4;
    draw(ctx, size, t, spin);
  }, [f, size, spinStart]);
  return <canvas ref={ref} width={size} height={size} style={{width: size, height: size, display: 'block'}} />;
};
