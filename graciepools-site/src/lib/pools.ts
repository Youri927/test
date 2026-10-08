// Les modèles Barrier Reef que Gracie Pools présente sur son site, avec les mesures de la fiche officielle 2025
// (« Barrier Reef Fiberglass Pools 2025 Model Sheet », hébergée sur graciepools.com).
// Les volumes viennent des pages modèles de leur site, seulement quand les dimensions de la carte correspondent à la fiche.
// Les dessins vus de dessus (src/data/drawings.json) viennent de la même fiche : voir tools/drawings.py.
import drawings from '@/data/drawings.json'
import type { PhotoId } from '@/lib/photos'

export type Family = 'rectangular' | 'freeform' | 'kidney' | 'plunge' | 'roman' | 'spa'
export type DrawingId = keyof typeof drawings

export type Size = {
  /** longueur et largeur, en pouces */
  l: number
  w: number
  shallow?: number
  deep?: number
  /** volume approximatif, en gallons */
  gal?: number
  /** ce que la fiche ajoute : banquette, entrée, couloir de nage */
  extra?: [string, string][]
  /** libellé du choix quand la taille ne suffit pas à distinguer (avec ou sans banquette) */
  label?: string
  drawing?: DrawingId
}

export type Model = {
  id: string
  name: string
  families: Family[]
  drawing: DrawingId
  sizes: Size[]
  note?: string
  photo?: PhotoId
}

/** pieds et pouces → pouces */
const ft = (f: number, i = 0) => f * 12 + i

export const FAMILIES: { id: Family | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'rectangular', label: 'Rectangular' },
  { id: 'freeform', label: 'Free form' },
  { id: 'kidney', label: 'Kidney' },
  { id: 'plunge', label: 'Plunge' },
  { id: 'roman', label: 'Roman' },
  { id: 'spa', label: 'Spas & sundecks' },
]

export const MODELS: Model[] = [
  // ——— rectangulaires ———
  {
    id: 'laguna',
    name: 'Laguna',
    families: ['rectangular'],
    drawing: 'laguna',
    photo: 'laguna',
    sizes: [
      { l: ft(29), w: ft(13, 9), shallow: ft(3, 5), deep: ft(5, 10.5), gal: 12200 },
      { l: ft(23), w: ft(11, 3), shallow: ft(3, 5.5), deep: ft(5, 1.5), gal: 7400 },
    ],
  },
  {
    id: 'grande',
    name: 'Grande',
    families: ['rectangular'],
    drawing: 'grande',
    sizes: [
      { l: ft(29), w: ft(13, 9), shallow: ft(3, 5), deep: ft(5, 10.5), gal: 12200 },
      { l: ft(23), w: ft(11, 3), shallow: ft(3, 5.5), deep: ft(5, 1.5), gal: 7400 },
    ],
  },
  {
    id: 'bondi',
    name: 'Bondi',
    families: ['rectangular'],
    drawing: 'bondi',
    note: 'U.S. Patent #10,472,839',
    sizes: [
      { l: ft(40), w: ft(15, 9), shallow: ft(3, 8), deep: ft(6, 3), extra: [['Walk-in', '11′']] },
      { l: ft(35), w: ft(15, 9), shallow: ft(3, 6), deep: ft(6, 1.5), extra: [['Walk-in', '8′']] },
    ],
  },
  {
    id: 'whitsunday',
    name: 'Whitsunday',
    families: ['rectangular'],
    drawing: 'whitsunday',
    sizes: [
      { l: ft(40), w: ft(15, 8), shallow: ft(3, 6), deep: ft(6, 10), gal: 22000 },
      { l: ft(35), w: ft(15, 8), shallow: ft(3, 6), deep: ft(6, 4), gal: 18000 },
      { l: ft(31), w: ft(15, 8), shallow: ft(3, 6), deep: ft(6, 1), gal: 15000 },
    ],
  },
  {
    id: 'whitsunday-deep',
    name: 'Whitsunday Deep',
    families: ['rectangular'],
    drawing: 'whitsunday-deep',
    sizes: [{ l: ft(40), w: ft(15, 8), shallow: ft(3, 6), deep: ft(8, 6), gal: 28350 }],
  },
  {
    id: 'whitsunday-slim',
    name: 'Whitsunday Slim',
    families: ['rectangular'],
    drawing: 'whitsunday-slim',
    sizes: [{ l: ft(36), w: ft(14), shallow: ft(3, 5), deep: ft(6, 2), gal: 16650 }],
  },
  {
    id: 'whitsunday-lounger',
    name: 'Whitsunday Lounger',
    families: ['rectangular'],
    drawing: 'whitsunday-lounger',
    sizes: [
      { l: ft(35), w: ft(15, 8), shallow: ft(3, 6), deep: ft(6, 4), gal: 17800, extra: [['Lounger', '9′ × 5′ 3″']] },
      { l: ft(31), w: ft(15, 8), shallow: ft(3, 6), deep: ft(6, 1), gal: 14700, extra: [['Lounger', '9′ × 5′ 3″']] },
    ],
  },
  {
    id: 'sydney-harbour',
    name: 'Sydney Harbour',
    families: ['rectangular'],
    drawing: 'sydney-harbour',
    note: 'Swim lane 9′ 4″ wide',
    sizes: [
      { l: ft(40), w: ft(16), shallow: ft(3, 6), deep: ft(6, 6), gal: 17500, extra: [['Loungers', '9′ ½″ × 5′ 7″ and 11′ 11″ × 5′ 7″']] },
      { l: ft(35), w: ft(16), shallow: ft(3, 6), deep: ft(6, 1), gal: 13987, extra: [['Loungers', '9′ ½″ × 5′ 7″ and 8′ 8¾″ × 5′ 7″']] },
    ],
  },
  {
    id: 'outback-dundee',
    name: 'Outback Dundee',
    families: ['rectangular'],
    drawing: 'outback-dundee',
    sizes: [
      { l: ft(30), w: ft(14), shallow: ft(3, 8), deep: ft(5, 10), gal: 12400, label: 'Without lounger', drawing: 'outback-dundee' },
      { l: ft(30), w: ft(14), shallow: ft(3, 8), deep: ft(5, 10), gal: 12400, label: 'With lounger', drawing: 'outback-dundee-lounger', extra: [['Lounger', '8′ 6″ × 4′ 6″']] },
    ],
  },
  {
    id: 'outback-lounger',
    name: 'Outback Lounger',
    families: ['rectangular'],
    drawing: 'outback-lounger',
    sizes: [
      { l: ft(30), w: ft(14), shallow: ft(4, 3), deep: ft(4, 3), label: '14′ wide', extra: [['Lounger', '6′ × 14′'], ['Bottom', 'Flat']] },
      { l: ft(30), w: ft(11, 3), shallow: ft(4, 3), deep: ft(4, 3), label: '11′ 3″ wide', extra: [['Lounger', '6′ × 11′ 3″'], ['Bottom', 'Flat']] },
    ],
  },
  {
    id: 'coral-cay',
    name: 'Coral Cay Plunge',
    families: ['rectangular', 'plunge'],
    drawing: 'coral-cay-30',
    note: 'New for 2025',
    sizes: [
      { l: ft(30), w: ft(11, 3), shallow: ft(3, 6), deep: ft(5, 3), gal: 9125, drawing: 'coral-cay-30' },
      { l: ft(26), w: ft(9, 6), shallow: ft(3, 6), deep: ft(5, 1.5), drawing: 'coral-cay-26' },
      { l: ft(20), w: ft(9, 6), shallow: ft(3, 6), deep: ft(4, 9.75), drawing: 'coral-cay-26' },
    ],
  },
  {
    id: 'escape',
    name: 'Escape Plunge',
    families: ['rectangular', 'plunge'],
    drawing: 'escape',
    photo: 'escape-ocean',
    note: 'Wide swim lane, optional swim jets',
    sizes: [{ l: ft(17), w: ft(8, 6), shallow: ft(4, 7), deep: ft(4, 7), gal: 3400 }],
  },
  // ——— formes libres ———
  {
    id: 'billabong-cove',
    name: 'Billabong Cove',
    families: ['freeform'],
    drawing: 'billabong-cove',
    photo: 'cove-california',
    sizes: [{ l: ft(35, 3.125), w: ft(16), shallow: ft(3, 4), deep: ft(6, 5), extra: [['Lounger', '7′ 4″']] }],
  },
  {
    id: 'billabong-splash',
    name: 'Billabong Splash',
    families: ['freeform'],
    drawing: 'billabong-splash',
    sizes: [{ l: ft(27), w: ft(13), shallow: ft(3, 7), deep: ft(5, 6), extra: [['Lounger', '6′']] }],
  },
  {
    id: 'coral-sea',
    name: 'Coral Sea',
    families: ['freeform'],
    drawing: 'coral-sea',
    sizes: [
      { l: ft(40), w: ft(15, 2), shallow: ft(3, 7), deep: ft(6, 9.5), gal: 19200 },
      { l: ft(35), w: ft(15, 2), shallow: ft(3, 7), deep: ft(6, 4), gal: 16000 },
      { l: ft(31, 2), w: ft(15, 2), shallow: ft(4), deep: ft(6, 4), gal: 13700 },
    ],
  },
  {
    id: 'coral-sea-lounger',
    name: 'Coral Sea Lounger',
    families: ['freeform'],
    drawing: 'coral-sea-lounger',
    sizes: [
      { l: ft(35), w: ft(15, 2), shallow: ft(3, 7), deep: ft(6, 4), gal: 15800, extra: [['Lounger', '9′ × 6′ 5″']] },
      { l: ft(31, 2), w: ft(15, 2), shallow: ft(4), deep: ft(6, 4), gal: 13400, extra: [['Lounger', '9′ × 6′ 5″']] },
    ],
  },
  {
    id: 'southport',
    name: 'Southport',
    families: ['freeform'],
    drawing: 'southport',
    sizes: [{ l: ft(28), w: ft(14, 1), shallow: ft(3, 7), deep: ft(6), gal: 11500 }],
  },
  {
    id: 'sudbury',
    name: 'Sudbury',
    families: ['freeform'],
    drawing: 'sudbury',
    sizes: [
      { l: ft(29), w: ft(14, 4), shallow: ft(3, 11.5), deep: ft(5, 11.5), gal: 13800 },
      { l: ft(25), w: ft(14, 4), shallow: ft(3, 11.5), deep: ft(5, 7.5), gal: 11500 },
    ],
  },
  // ——— haricots ———
  {
    id: 'oyster',
    name: 'Oyster',
    families: ['kidney'],
    drawing: 'oyster',
    photo: 'oyster-arctic',
    sizes: [
      { l: ft(30), w: ft(14, 9), shallow: ft(3, 4), deep: ft(6, 3), gal: 11000 },
      { l: ft(27), w: ft(13, 7), shallow: ft(3, 5.5), deep: ft(5, 6), gal: 8600 },
    ],
  },
  {
    id: 'opal',
    name: 'Opal',
    families: ['kidney'],
    drawing: 'opal',
    sizes: [{ l: ft(21, 2), w: ft(11, 4), shallow: ft(3, 8), deep: ft(5), gal: 5000 }],
  },
  {
    id: 'crispin',
    name: 'Crispin Plunge',
    families: ['kidney', 'plunge'],
    drawing: 'crispin',
    sizes: [{ l: ft(16, 6), w: ft(10), shallow: ft(3, 11), deep: ft(3, 11), gal: 3100 }],
  },
  {
    id: 'pixie',
    name: 'Pixie Plunge',
    families: ['kidney', 'plunge'],
    drawing: 'pixie',
    sizes: [{ l: ft(16, 6), w: ft(10), shallow: ft(3, 11), deep: ft(3, 11), gal: 3100 }],
  },
  // ——— romaine ———
  {
    id: 'milano',
    name: 'Milano',
    families: ['roman'],
    drawing: 'milano',
    photo: 'milano',
    sizes: [{ l: ft(23), w: ft(11), shallow: ft(4, 4.5), deep: ft(4, 4.5) }],
  },
  // ——— spas et plages immergées ———
  { id: 'resort-spa', name: 'Resort Spa', families: ['spa'], drawing: 'resort-spa', sizes: [{ l: ft(15, 8), w: ft(8, 10), deep: ft(3, 2) }] },
  { id: 'capri-spa', name: 'Capri Spa', families: ['spa'], drawing: 'capri-spa', sizes: [{ l: ft(14), w: ft(6), deep: ft(3) }] },
  { id: 'cube-spa', name: 'Cube Spa', families: ['spa'], drawing: 'cube-spa', sizes: [{ l: ft(9), w: ft(9), deep: ft(3) }] },
  { id: 'horseshoe-spa', name: 'Horseshoe Spa', families: ['spa'], drawing: 'horseshoe-spa', sizes: [{ l: ft(9, 6), w: ft(9, 3), deep: ft(3, 3) }] },
  { id: 'pixie-sundeck', name: 'Pixie Sundeck', families: ['spa'], drawing: 'pixie-sundeck', sizes: [{ l: ft(16, 6), w: ft(10), deep: 10 }] },
  { id: 'cube-sundeck', name: 'Cube Sundeck', families: ['spa'], drawing: 'cube-sundeck', sizes: [{ l: ft(9), w: ft(9), deep: 10 }] },
  { id: 'horseshoe-sundeck', name: 'Horseshoe Sundeck', families: ['spa'], drawing: 'horseshoe-sundeck', sizes: [{ l: ft(9, 6), w: ft(9, 3), deep: 10 }] },
]

export const POOLS = MODELS.filter((m) => !m.families.includes('spa'))

export const modelById = (id: string) => MODELS.find((m) => m.id === id) ?? MODELS[0]

export const drawingOf = (m: Model, size: Size) => drawings[size.drawing ?? m.drawing]

/* ——— Coloris : la texture d'eau et la pastille de gelcoat de la fiche, et une teinte pour l'interface ——— */

export type FinishId = 'aquamarine' | 'arctic' | 'california' | 'evening-sky' | 'sandstone' | 'ocean'

export const FINISHES: { id: FinishId; name: string; tint: string; deep: string }[] = [
  { id: 'aquamarine', name: 'Aquamarine Shimmer', tint: '#0187bc', deep: '#00618a' },
  { id: 'arctic', name: 'Arctic Shimmer', tint: '#5fb2c8', deep: '#2f7f94' },
  { id: 'california', name: 'California Shimmer', tint: '#2f98cc', deep: '#1a6e9a' },
  { id: 'evening-sky', name: 'Evening Sky Shimmer', tint: '#5688a2', deep: '#3a647a' },
  { id: 'sandstone', name: 'Sandstone Shimmer', tint: '#6eb1ae', deep: '#3d7e7b' },
  { id: 'ocean', name: 'Ocean Shimmer', tint: '#1b4f9c', deep: '#143a73' },
]

export const finishById = (id: FinishId) => FINISHES.find((f) => f.id === id) ?? FINISHES[2]

/* ——— Mesures ——— */

const FRACTIONS: Record<string, string> = { '0.125': '⅛', '0.25': '¼', '0.5': '½', '0.75': '¾' }

/** 425.125 → « 35′ 5⅛″ » ; 120 → « 10′ » ; 10 → « 10″ » */
export function feet(inches: number) {
  const f = Math.floor(inches / 12 + 1e-9)
  const rest = Math.round((inches - f * 12) * 1000) / 1000
  const whole = Math.floor(rest)
  const frac = FRACTIONS[String(Math.round((rest - whole) * 1000) / 1000)] ?? ''
  const inch = rest ? `${whole || ''}${frac}″` : ''
  if (!f) return inch
  return inch ? `${f}′ ${inch}` : `${f}′`
}

export const gallons = (g: number) => `${g.toLocaleString('en-US')}`

/** libellé court d'une taille dans un modèle : la longueur, sauf si le modèle précise autre chose */
export const sizeLabel = (s: Size) => s.label ?? feet(s.l)

export function depthRange(s: Size) {
  if (s.shallow === undefined) return s.deep !== undefined ? feet(s.deep) : '—'
  if (s.deep === undefined || s.deep === s.shallow) return `${feet(s.shallow)} flat`
  return `${feet(s.shallow)} – ${feet(s.deep)}`
}
