// Le contenu réel de l'entreprise, relevé sur son site le 9 octobre 2026 (voir ANALYSE.md), vérifié quand c'était possible.
// Les textes sont raccourcis ou reformulés, rien n'est ajouté.

export const site = {
  name: 'Coastal Creations Pools and Lagoons',
  legal: 'Coastal Creations Pools and Lagoons, LLC',
  city: 'Palmetto, FL 34221',
  phone: { label: '(941) 779-7007', href: 'tel:+19417797007', sms: 'sms:+19417797007' },
  phone2: { label: '(941) 405-4069', href: 'tel:+19414054069' },
  email: 'coastalcreationsfla@gmail.com',
  // les deux formulaires de demande de leur compte Jobber, tels quels
  quote: 'https://clienthub.getjobber.com/hubs/992a4611-43c9-4ba3-9195-87993143c24d/public/requests/1141425/new',
  leakRequest: 'https://clienthub.getjobber.com/hubs/992a4611-43c9-4ba3-9195-87993143c24d/public/requests/4739823/new',
  license: 'CPC1461058',
  gas: 'LI45304',
  cpo: 'F4AH6JX',
  bbb: 'https://www.bbb.org/us/fl/palmetto/profile/pool-contractors/coastal-creations-pools-and-lagoons-0653-90458831',
  // le registre officiel des licences de Floride (recherche par numéro)
  dbpr: 'https://www.myfloridalicense.com/wl11.asp',
  angi: 'https://www.angi.com/companylist/us/fl/palmetto/coastal-creations-pools-and-lagoons-reviews-1.htm',
  google: 'https://www.google.com/search?q=Coastal+Creations+Pools+and+Lagoons,+LLC+Reviews',
  instagram: 'https://www.instagram.com/coastalcreationsfl/',
  facebook: 'https://www.facebook.com/CoastalCreationsFLA',
  lyon: 'https://www.lyonfinancial.net/apply/',
  privacy: 'https://www.coastalcreationspoolsandlagoons.com/privacy-policy-1',
}

export const nav = [
  { id: 'build', label: 'New pools' },
  { id: 'renovate', label: 'Renovations' },
  { id: 'leaks', label: 'Leak detection' },
  { id: 'storm', label: 'Storms' },
  { id: 'about', label: 'About' },
]

// le reste de leur liste de services (« Gondolas », peu clair, n'est pas repris : à vérifier avec eux)
export const extras =
  'Pavers, walkways and paver driveways, new lights and skimmers, gas installation and repairs, spillway and wall repairs, outdoor kitchens, grottos, tiki huts, water features and landscaping.'

// Les 11 étapes de leur page « Build Process », regroupées en 7 temps.
// Les photos : la construction neuve au bord d'un canal à Bradenton (leur page Projets) quand la légende le dit ;
// les autres viennent de leur page Build Process, sans lieu précisé.
export type Stage = { id: string; photo: PhotoKey; alt: string; steps: { n: number; name: string; text: string }[]; caption: string }
type PhotoKey = 'b-plan' | 'b-excavation' | 'b-steel' | 'b-gunite' | 'b-deck' | 'b-plaster' | 'pool-canal'
export const stages: Stage[] = [
  {
    id: 'plan',
    photo: 'b-plan',
    alt: 'Engineered plan of a pool, with its dimensions, returns and pipe sizes',
    caption: 'One of our engineered pool plans',
    steps: [
      { n: 1, name: 'Design & planning', text: 'We learn your goals, the way you live and your budget, assess the property and draw a pool that fits the house and the yard.' },
      { n: 2, name: 'Engineering & permits', text: 'Engineered plans go in for approval. We handle the permits, local codes, zoning and safety requirements before work starts.' },
    ],
  },
  {
    id: 'dig',
    photo: 'b-excavation',
    alt: 'A small excavator digging a pool in a backyard on a canal, a crew member checking the layout stakes',
    caption: 'Excavation on a canal-front lot',
    steps: [{ n: 3, name: 'Layout & excavation', text: 'The design is staked out on the ground, then dug to specification for the structural work.' }],
  },
  {
    id: 'steel',
    photo: 'b-steel',
    alt: 'A crew member tying steel rebar inside the forms of the pool',
    caption: 'Bradenton: tying the steel',
    steps: [
      { n: 4, name: 'Steel reinforcement', text: 'A rebar framework runs through the whole structure, so the shell can handle ground movement.' },
      { n: 5, name: 'Plumbing & electrical', text: 'Lines, drains, returns and electrical for filtration, circulation, lighting, and any spa or water feature.' },
    ],
  },
  {
    id: 'shell',
    photo: 'b-gunite',
    alt: 'The finished gunite shell of the pool, with the yard regraded around it',
    caption: 'Bradenton: the gunite shell',
    steps: [{ n: 6, name: 'Shotcrete or gunite shell', text: 'Shotcrete or gunite is sprayed over the steel to form the shell, the foundation of the pool.' }],
  },
  {
    id: 'tile',
    photo: 'b-deck',
    alt: 'Pavers laid around the empty pool, with a raised wall faced in blue tile',
    caption: 'Tile, coping and pavers going in',
    steps: [
      { n: 7, name: 'Tile, coping & features', text: 'Waterline tile, coping, and the features you chose: spa, sun shelf, waterfalls.' },
      { n: 8, name: 'Decking', text: 'Pavers, travertine or concrete around the pool, laid for durability, safety and looks.' },
    ],
  },
  {
    id: 'finish',
    photo: 'b-plaster',
    alt: 'Two crew members troweling fresh blue plaster inside a pool',
    caption: 'Plastering a pool interior',
    steps: [{ n: 9, name: 'Interior finish', text: 'Plaster, quartz or pebble: a smooth, watertight finish that sets the color and texture of the water.' }],
  },
  {
    id: 'water',
    photo: 'pool-canal',
    alt: 'The finished pool under its screen enclosure, with a tiled spillway wall and the canal beyond',
    caption: 'Bradenton: finished, under its screen enclosure',
    steps: [
      { n: 10, name: 'Fill & startup', text: 'The pool is filled, the equipment started, the water balanced and every system checked.' },
      { n: 11, name: 'Final inspection & handover', text: 'Final inspections for code and quality, then a walkthrough of how to run and care for your pool.' },
    ],
  },
]

// Les rénovations, photographiées du même point (leurs pages Accueil, Manatee, Charlotte, Hillsborough).
// Les dates sont celles écrites sur leurs photos.
export type Frame = { photo?: 'ami-before' | 'ami-after' | 'cage-1' | 'b-finish' | 'cage-3' | 'pc-before' | 'pc-after' | 'brandon-before'; video?: 'brandon'; ar: number; label: string; alt: string }
export type Job = { id: string; place: string; kind: string; text: string; frames: Frame[] }
export const jobs: Job[] = [
  {
    id: 'holmes',
    place: 'Holmes Beach, Anna Maria Island',
    kind: 'Vacation rental',
    text: 'A full resurfacing for a smooth, durable finish, new waterline tile, and a spa drain repair for proper operation and safety.',
    frames: [
      { photo: 'ami-before', ar: 1206 / 984, label: 'Before', alt: 'The pool and its raised spa before the renovation, with beige tile' },
      { photo: 'ami-after', ar: 1, label: 'After: new tile and surface', alt: 'The same spa and pool after the renovation, with blue glass waterline tile and a new surface' },
    ],
  },
  {
    id: 'manatee',
    place: 'Manatee County',
    kind: 'Pool under a screen enclosure',
    text: 'Steel, forms and a fresh pour inside the pool, new coping, then a new interior finish.',
    frames: [
      { photo: 'cage-1', ar: 4 / 3, label: 'May 20, 2026', alt: 'The pool drained, with its old stained surface, under the screen enclosure' },
      { photo: 'b-finish', ar: 1000 / 1602, label: 'June 4, 2026', alt: 'Three crew members finishing the new blue interior of the same pool' },
      { photo: 'cage-3', ar: 4 / 3, label: 'June 8, 2026', alt: 'The same pool filled, its new interior under the shadows of the screen enclosure' },
    ],
  },
  {
    id: 'commercial',
    place: 'Port Charlotte',
    kind: 'Commercial pool',
    text: 'A commercial resurfacing in Charlotte County, from the old surface to new plaster.',
    frames: [
      { photo: 'pc-before', ar: 4 / 3, label: 'Before resurfacing', alt: 'The commercial pool drained, its old surface stripped, by the steps and handrail' },
      { photo: 'pc-after', ar: 4 / 3, label: 'New plaster', alt: 'The same pool refilled with its new plaster, steps and handrail in the corner' },
    ],
  },
  {
    id: 'brandon',
    place: 'Brandon',
    kind: 'Resurfacing, completed April 2026',
    text: 'A resurfacing in Hillsborough County: the spa during the work, and the finished pool.',
    frames: [
      { photo: 'brandon-before', ar: 4 / 3, label: 'During the resurfacing', alt: 'The drained spa, with its blue tile, under a white screen enclosure' },
      { video: 'brandon', ar: 9 / 16, label: 'Finished, April 2026', alt: 'Short video of the finished pool and spa in Brandon' },
    ],
  },
]

// Équipement et tempêtes (pages Storm Recovery et Equipment Replacement)
export const equipment = [
  'Full equipment replacement',
  'Raised equipment pads',
  'Pumps, heaters, plumbing and filtration',
  'Custom equipment enclosures',
  'Structural repairs after a storm',
  'Gas installation and repairs',
]
export const storm: { photo: 'storm-1' | 'storm-2' | 'storm-3'; ar: number; label: string; alt: string }[] = [
  { photo: 'storm-1', ar: 670 / 498, label: 'After the storm', alt: 'A kidney-shaped pool under a screen enclosure, its water dark green after the storm' },
  { photo: 'storm-2', ar: 4 / 3, label: 'Drained for repairs', alt: 'The same pool drained, a crew member working on the surface' },
  { photo: 'storm-3', ar: 4 / 3, label: 'Back to blue', alt: 'The same pool refilled with clear blue water' },
]

// À propos (leur page About Us et le BBB)
export const team = [
  { name: 'Owen Kay', role: 'Managing Partner', text: 'Certified Pool & Spa Operator and certified pool contractor.', photo: 'owen' as const },
  { name: 'Alberto Labrada', role: 'Director of Construction', text: 'Certified pool contractor. Leads the design and construction of our new pools.', photo: 'alberto' as const },
]
// les années de métier des associés (leur page), puis la société (BBB : début d'activité le 30 octobre 2023, accréditée le 22 avril 2026)
export const years = [
  { year: '1986', text: 'Renovations' },
  { year: '2011', text: 'Pool maintenance' },
  { year: '2020', text: 'Leak detection' },
  { year: '2021', text: 'Repairs and patio renovations' },
  { year: '2023', text: 'Coastal Creations Pools and Lagoons starts' },
  { year: '2026', text: 'BBB accredited, A+' },
]
export const standards = ['Company uniforms', 'Company-marked vehicles', 'A drug-free workplace', 'Drug and background screening for every employee']

// Enduits Stonescapes de leur page « Pool Surface Colors » (nuanciers du fabricant)
export const finishes = [
  { id: 'f-aqua-cool', name: 'Aqua Cool Mini', tone: 'Light blue' },
  { id: 'f-aqua-blue', name: 'Aqua Blue Mini', tone: 'Medium blue' },
  { id: 'f-aqua-white', name: 'Aqua White', tone: '' },
  { id: 'f-caribbean', name: 'Caribbean Blue Mini', tone: 'Medium blue' },
  { id: 'f-french-gray', name: 'French Gray', tone: 'Light gray to medium blue' },
  { id: 'f-tahoe', name: 'Tahoe Blue', tone: 'Medium blue' },
] as const

// Tarifs de détection de fuites, tels qu'affichés sur leur page (dans une image), avec leurs descriptions
export const leakPrices = { pool: 350, poolSpa: 450, feature: 50, head: 20 }
// leurs quatre méthodes, telles quelles (leur FAQ)
export const leakMethods = ['Hydrophone listening', 'Dye testing', 'Visual inspection', 'Targeted tests']

export const leakAreas = ['the shell', 'skimmers', 'return lines', 'the main drain', 'light niches', 'the tile line', 'spa walls', 'plumbing', 'fittings', 'water features', 'the equipment pad']

// Leur FAQ des fuites, 15 questions, réponses resserrées
export const faq: { q: string; a: string }[] = [
  { q: 'How do I know if my pool has a leak?', a: 'Water dropping faster than normal, wet ground around the pool or the equipment, bubbles from the returns, trouble keeping the pool full, cracks, loose tile, or refilling all the time.' },
  { q: 'Could it just be evaporation?', a: 'Yes. Florida pools lose water to evaporation, more so in hot, sunny, windy or dry weather, and screen cages, waterfalls, spas and water features change how much. If the loss is excessive or happens every day, leak detection is worth it.' },
  { q: 'How much water loss is normal?', a: 'Some loss is normal. If your pool loses more than you would expect, or needs topping off often, have it checked.' },
  { q: 'What is a bucket test?', a: 'Set a bucket on the pool step and fill it to the same level as the pool. If the pool drops more than the bucket, there may be a leak.' },
  { q: 'What areas of the pool can leak?', a: 'The shell, skimmer, return lines, main drain, light niche, tile line, spa wall, plumbing, fittings, water features and the equipment pad.' },
  { q: 'Do you check both the pool and the spa?', a: 'Yes: pool-only systems, pool and spa combinations, and water features. A spa can leak on its own, at the spillway, jets, fittings, drain or plumbing.' },
  { q: 'What leak detection methods do you use?', a: 'Hydrophone listening, dye testing, visual inspection, and targeted tests chosen for your symptoms and the way your pool is set up.' },
  { q: 'Does leak detection include repairs?', a: 'Detection finds the leak. Small epoxy repairs are included; plumbing, structural, tile and larger repairs are quoted separately.' },
  { q: 'Can you repair the leak once you find it?', a: 'Often, yes. We are a licensed pool contractor, so we quote the repair as soon as we find the source. Some leaks call for plumbing, surface, tile or equipment work, or a renovation.' },
  { q: 'Should I schedule leak detection before resurfacing?', a: 'Yes. Resurfacing over a leak that has not been fixed can lead to more damage, more water loss and added cost.' },
  { q: 'Can a pool leak damage my yard or deck?', a: 'Yes. Ongoing water loss can wash out soil, create soft spots, damage decking or pavers, cause erosion and affect the pool structure.' },
  { q: 'What should I tell you before the appointment?', a: 'How much water the pool loses, how often you add water, whether the loss changes with the pump on or off, and any wet, cracked, loose or suspicious areas.' },
  { q: 'Does the pool need to be full?', a: 'Yes, at its normal operating level, so we can check the system and the suspected areas.' },
  { q: 'Do you offer leak detection near me?', a: 'Yes: in Manatee County, Sarasota County and the surrounding communities, along with resurfacing, remodels and new builds.' },
  { q: 'Are you licensed and insured?', a: 'Yes. Pool contractor license CPC1461058 and gas license LI45304.' },
]

// Comtés et villes de leurs pages « Areas We Serve » et de chaque comté, du nord au sud
export const counties: { name: string; towns: string[] }[] = [
  { name: 'Citrus', towns: ['Crystal River', 'Homosassa', 'Beverly Hills', 'Inverness', 'Lecanto'] },
  { name: 'Sumter', towns: ['The Villages', 'Wildwood', 'Bushnell', 'Lake Panasoffkee'] },
  { name: 'Pinellas', towns: ['Clearwater', 'St. Petersburg', 'Largo', 'Pinellas Park', 'Dunedin', 'Tarpon Springs', 'Palm Harbor', 'East Lake', 'Lealman', 'Ridgecrest'] },
  { name: 'Hillsborough', towns: ['Tampa', 'Brandon', 'Riverview', 'Apollo Beach', 'Plant City', 'Temple Terrace', 'Valrico', "Town 'n' Country", 'Carrollwood', 'Lutz', 'Seffner', 'Gibsonton', 'Sun City Center'] },
  { name: 'Polk', towns: ['Lakeland', 'Winter Haven', 'Bartow', 'Lake Wales', 'Poinciana', 'Four Corners', 'Highland City', 'Inwood'] },
  { name: 'Manatee', towns: ['Palmetto', 'Bradenton', 'Lakewood Ranch', 'Parrish', 'Anna Maria Island', 'Holmes Beach', 'Bradenton Beach'] },
  { name: 'Hardee', towns: [] },
  { name: 'Sarasota', towns: ['Sarasota', 'Venice', 'North Port', 'Siesta Key', 'Osprey', 'Nokomis', 'Englewood', 'Gulf Gate Estates', 'Fruitville'] },
  { name: 'DeSoto', towns: [] },
  { name: 'Charlotte', towns: ['Port Charlotte', 'Punta Gorda', 'Englewood', 'Rotonda West'] },
]
