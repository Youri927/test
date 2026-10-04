import day1 from '../public/site/day-1.json';
import day2 from '../public/site/day-2.json';
import day3 from '../public/site/day-3.json';
import day4 from '../public/site/day-4.json';
import day5 from '../public/site/day-5.json';
import phone from '../public/site/phone.json';

/** Un plan filmé (capture/shots.mjs) : 60 images/s, position de défilement et souris image par image */
export type Meta = {
  name: string;
  fps: number;
  frames: number;
  width: number;
  height: number;
  y?: number[];
  mouse: ({x: number; y: number} | null)[];
};

/** Le plan-séquence, dans l'ordre : les plans s'enchaînent sans coupe (la page n'a jamais été rechargée) */
export const DAY: Meta[] = [day1, day2, day3, day4, day5] as unknown as Meta[];
export const PHONE = phone as unknown as Meta;

export const DAY_FRAMES = DAY.reduce((n, m) => n + m.frames, 0);
/** début de chaque plan dans le film (images) */
export const DAY_FROM = DAY.map((_, i) => DAY.slice(0, i).reduce((n, m) => n + m.frames, 0));
/** position de défilement et souris à une image du film */
const flatY = DAY.flatMap((m) => m.y ?? new Array(m.frames).fill(0));
const flatMouse = DAY.flatMap((m) => Array.from({length: m.frames}, (_, i) => m.mouse[i] ?? null));
export const scrollAt = (f: number) => flatY[Math.max(0, Math.min(flatY.length - 1, f))] ?? 0;
export const mouseAt = (f: number) => flatMouse[Math.max(0, Math.min(flatMouse.length - 1, f))] ?? null;
