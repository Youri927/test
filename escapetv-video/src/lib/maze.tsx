import React, {useMemo} from 'react';

/* Le labyrinthe du site (même algorithme et même graine que src/maze.js du site),
   rendu en SVG et animé image par image : l'équipe, le Minotaure, le trésor. */

const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Maze = {cols: number; rows: number; cells: Uint8Array; center: [number, number]; rand: () => number};

function build(cols: number, rows: number, seed: number): Maze {
  const rand = rng(seed);
  const cells = new Uint8Array(cols * rows).fill(15);
  const seen = new Uint8Array(cols * rows);
  const idx = (x: number, y: number) => y * cols + x;
  const D: [number, number, number, number][] = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];
  const stack: [number, number][] = [[0, rows - 1]];
  seen[idx(0, rows - 1)] = 1;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const opts = D.filter(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      return nx >= 0 && ny >= 0 && nx < cols && ny < rows && !seen[idx(nx, ny)];
    });
    if (!opts.length) { stack.pop(); continue; }
    const [dx, dy, a, b] = opts[Math.floor(rand() * opts.length)];
    const nx = x + dx, ny = y + dy;
    cells[idx(x, y)] &= ~a;
    cells[idx(nx, ny)] &= ~b;
    seen[idx(nx, ny)] = 1;
    stack.push([nx, ny]);
  }
  for (let k = 0; k < cols * rows * 0.08; k++) {
    const x = 1 + Math.floor(rand() * (cols - 2));
    const y = 1 + Math.floor(rand() * (rows - 2));
    const [dx, dy, a, b] = D[Math.floor(rand() * 4)];
    cells[idx(x, y)] &= ~a;
    cells[idx(x + dx, y + dy)] &= ~b;
  }
  const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
  for (let y = cy - 1; y <= cy + 1; y++) {
    for (let x = cx - 1; x <= cx + 1; x++) {
      if (y > cy - 1) { cells[idx(x, y)] &= ~1; cells[idx(x, y - 1)] &= ~4; }
      if (x > cx - 1) { cells[idx(x, y)] &= ~8; cells[idx(x - 1, y)] &= ~2; }
    }
  }
  return {cols, rows, cells, center: [cx, cy], rand};
}

function path(m: Maze, from: [number, number], to: [number, number]): [number, number][] {
  const {cols, rows, cells} = m;
  const prev = new Int32Array(cols * rows).fill(-1);
  const start = from[1] * cols + from[0];
  const goal = to[1] * cols + to[0];
  const q = [start];
  prev[start] = start;
  const D: [number, number, number][] = [[0, -1, 1], [1, 0, 2], [0, 1, 4], [-1, 0, 8]];
  while (q.length) {
    const c = q.shift() as number;
    if (c === goal) break;
    const x = c % cols, y = (c / cols) | 0;
    for (const [dx, dy, w] of D) {
      if (cells[c] & w) continue;
      const n = (y + dy) * cols + (x + dx);
      if (prev[n] !== -1) continue;
      prev[n] = c;
      q.push(n);
    }
  }
  const out: [number, number][] = [];
  for (let c = goal; c !== start; c = prev[c]) { if (c < 0) return [from]; out.push([c % cols, (c / cols) | 0]); }
  out.push(from);
  return out.reverse();
}

/** Une longue route enchaînée d'objectifs en objectifs, puis la position le long de cette route */
function route(m: Maze, start: [number, number], first: [number, number] | null, legs: number) {
  let cell = start;
  const pts: [number, number][] = [start];
  for (let l = 0; l < legs; l++) {
    const target: [number, number] = l === 0 && first ? first : [Math.floor(m.rand() * m.cols), Math.floor(m.rand() * m.rows)];
    const p = path(m, cell, target);
    pts.push(...p.slice(1));
    cell = target;
  }
  return pts;
}
const along = (pts: [number, number][], d: number): [number, number] => {
  const i = Math.min(pts.length - 2, Math.floor(d));
  const t = Math.min(1, d - i);
  const a = pts[i], b = pts[i + 1] || a;
  return [a[0] + (b[0] - a[0]) * t + 0.5, a[1] + (b[1] - a[1]) * t + 0.5];
};

export const useMaze = (cols = 25, rows = 15, seed = 7) =>
  useMemo(() => {
    const m = build(cols, rows, seed);
    const team = route(m, [0, rows - 1], m.center, 8);
    const beast = route(m, [cols - 1, 0], null, 10);
    let d = '';
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const c = m.cells[y * cols + x];
        if (c & 1) d += `M${x} ${y}h1`;
        if (c & 8) d += `M${x} ${y}v1`;
        if (y === rows - 1 && c & 4) d += `M${x} ${y + 1}h1`;
        if (x === cols - 1 && c & 2) d += `M${x + 1} ${y}v1`;
      }
    }
    return {m, team, beast, walls: d};
  }, [cols, rows, seed]);

/**
 * Le plan vu d'en haut, dessiné à `cell` px par case, au temps `t` (secondes).
 * Mêmes vitesses que sur le site : l'équipe 1,6 case/s, le Minotaure 1,25 case/s.
 */
export const MazeView: React.FC<{t: number; cell: number; opacity?: number; id: string}> = ({t, cell, opacity = 1, id}) => {
  const {m, team, beast, walls} = useMaze();
  const W = m.cols * cell, H = m.rows * cell;
  const [tx, ty] = along(team, t * 1.6);
  const [bx, by] = along(beast, t * 1.25);
  const pulse = 0.75 + 0.25 * Math.sin(t * 2.2);
  const [cx, cy] = [m.center[0] + 0.5, m.center[1] + 0.5];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${m.cols} ${m.rows}`} style={{position: 'absolute', left: -W / 2, top: -H / 2, opacity, overflow: 'visible'}}>
      <defs>
        <radialGradient id={`${id}-gold`}>
          <stop offset="0" stopColor="#E2B55E" stopOpacity={0.55 * pulse} />
          <stop offset="1" stopColor="#E2B55E" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-heat`}>
          <stop offset="0" stopColor="#FFD68C" stopOpacity="0.95" />
          <stop offset="0.25" stopColor="#FF703C" stopOpacity="0.75" />
          <stop offset="0.6" stopColor="#B0281E" stopOpacity="0.28" />
          <stop offset="1" stopColor="#781414" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-floor`}>
          <stop offset="0" stopColor="rgb(48,40,30)" stopOpacity="0.55" />
          <stop offset="1" stopColor="rgb(12,11,10)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={m.cols / 2} cy={m.rows / 2} rx={m.cols * 0.7} ry={m.rows * 0.9} fill={`url(#${id}-floor)`} />
      <circle cx={cx} cy={cy} r={2.6} fill={`url(#${id}-gold)`} />
      <rect x={cx - 0.22} y={cy - 0.22} width={0.44} height={0.44} fill="#E2B55E" transform={`rotate(45 ${cx} ${cy})`} />
      <circle cx={bx} cy={by} r={2.1 + 0.15 * Math.sin(t * 5)} fill={`url(#${id}-heat)`} style={{mixBlendMode: 'screen'}} />
      <path d={walls} stroke="rgba(237,230,218,.62)" strokeWidth={0.07} strokeLinecap="square" fill="none" />
      {[0, 1, 2, 3].map((i) => {
        const a = t * 1.8 + i * 1.57;
        return <circle key={i} cx={tx + Math.cos(a) * 0.16} cy={ty + Math.sin(a) * 0.16} r={0.07} fill="#EDE6DA" />;
      })}
      {[[3, 2], [9, 10], [18, 4], [21, 12], [6, 7]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x + 0.5} cy={y + 0.5} r={0.24} fill="none" stroke="rgba(226,181,94,.7)" strokeWidth={0.03} />
      ))}
    </svg>
  );
};
