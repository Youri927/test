// Tous les textes du site. Repris ou raccourcis depuis tampadeckingandpools.com (voir ANALYSE.md) :
// rien n'est inventé, les chiffres et les noms viennent de leurs pages.
import type { PhotoId } from '@/lib/photos'

export const PHONE = '813-695-1458'
export const PHONE_HREF = 'tel:+18136951458'
export const EMAIL = 'mark@tampadeckingandpools.com'

export const nav = [
  { id: 'layers', label: 'Services' },
  { id: 'work', label: 'Work' },
  { id: 'surfaces', label: 'Surfaces' },
  { id: 'cost', label: 'Pricing' },
  { id: 'about', label: 'About' },
  { id: 'areas', label: 'Areas' },
] as const

export const hero = {
  line1: 'From the deck',
  line2: 'to the deep end',
  intro: 'Pool resurfacing, tile, coping and new decks across Tampa Bay. Family and veteran owned, in Tampa for 30 years.',
  caption: 'Raised stone spa with two spillovers',
}

export type LayerId = 'deck' | 'coping' | 'tile' | 'finish'

export const layers: {
  id: LayerId
  tab: string
  title: string
  text: string
  facts?: string[]
  options: string[]
  photo: PhotoId
  alt: string
}[] = [
  {
    id: 'deck',
    tab: 'Deck',
    title: 'Pool decks',
    text: 'Poured, stamped, stained or coated concrete, pavers, travertine and custom stonework. Most deck resurfacing jobs take 2 to 5 days.',
    facts: [
      'Decorative coatings in over 1,500 colors, or a custom match',
      'Crack, mold, mildew, stain and oil resistant',
      'Spray knockdown texture stays 30% cooler underfoot',
    ],
    options: ['Decorative', 'Stamped', 'Stained', 'Travertine', 'Slate', 'Flagstone', 'Limestone', 'Sandstone', 'Granite', 'Pavers', 'Brick'],
    photo: 'layer-deck',
    alt: 'Pool deck in a grey decorative coating with a tile pattern, under a screened lanai',
  },
  {
    id: 'coping',
    tab: 'Coping',
    title: 'Coping',
    text: 'The border of your pool. New coping is the perfect complement to a new finish, and nothing changes the look of a pool quite like it.',
    options: ['Concrete', 'Bullnose brick', 'Safety grip', 'Flagstone', 'Custom stonework'],
    photo: 'layer-coping',
    alt: 'Curved coping and a paver deck around the pool steps',
  },
  {
    id: 'tile',
    tab: 'Tile',
    title: 'Waterline tile',
    text: 'Glass, stone or glazed tile, in the latest designs and the most popular colors. Any time you resurface, we recommend replacing the waterline tile too.',
    options: ['Glass', 'Stone', 'Glazed'],
    photo: 'layer-tile',
    alt: 'Raised spa wrapped in blue tile',
  },
  {
    id: 'finish',
    tab: 'Finish',
    title: 'Interior finish',
    text: 'Stained, pitting or delaminating? A new quartz or pebble finish gives your pool a fresh look, and replastering means a new warranty.',
    options: ['PebbleTec®', 'PebbleSheen®', 'PebbleFina®', 'Diamond Brite®', 'StoneScapes®', 'QuartzScapes®', 'White plaster', 'Glass bead'],
    photo: 'layer-finish',
    alt: 'Pebble finish with lines of glass tile',
  },
]

// Galerie : ce que l'on voit sur chaque photo, sans adresse ni lieu.
export const work: { id: PhotoId; alt: string }[] = [
  { id: 'w-1179', alt: 'Freeform pool with a travertine deck, a raised spa and a pavilion' },
  { id: 'w-4803', alt: 'Geometric pool and spa with a grey flagstone-pattern deck' },
  { id: 'w-0993', alt: 'Rock waterfall inside a screened enclosure' },
  { id: 'w-8916', alt: 'Brick coping and glass tile accents on the pool steps' },
  { id: 'w-1164', alt: 'Stone fireplace under a cedar pergola' },
  { id: 'w-1175', alt: 'Round spa wrapped in river rock, spilling into the pool' },
  { id: 'w-2169', alt: 'Sand-colored deck with a tile pattern along the pool' },
  { id: 'w-1217', alt: 'Geometric pool with bubblers on the sun shelf and a paver deck' },
  { id: 'w-1196', alt: 'Raised spa finished in blue tile' },
  { id: 'w-2687', alt: 'Rock waterfall in a landscaped backyard' },
  { id: 'w-5186', alt: 'Kidney-shaped pool with a grey flagstone-pattern deck' },
  { id: 'w-shot', alt: 'Screened pool with a grey flagstone-pattern deck' },
  { id: 'w-0964', alt: 'Kidney-shaped pool with a rock waterfall and a paver deck' },
  { id: 'w-1203', alt: 'Geometric pool with a sun shelf and a light paver deck' },
  { id: 'w-1168', alt: 'Outdoor kitchen pavilion with a brick bar' },
]

export const surfaces: { id: PhotoId; name: string; text: string; where: string; alt: string }[] = [
  { id: 's-pebble', name: 'Pebble finish', text: 'More beautiful and more durable than plaster, for a little more.', where: 'Inside the pool', alt: 'Close-up of a pebble pool finish under water' },
  { id: 's-glass', name: 'Glass tile', text: 'Glass, stone or glazed, in the newest styles. It makes a pool pop.', where: 'Waterline, spas, accents', alt: 'Blue glass tile on a raised spa' },
  { id: 's-river', name: 'River rock', text: 'Along with pavers, one of our specialties.', where: 'Spas, walls, water features', alt: 'River rock wall of a round spa' },
  { id: 's-trav', name: 'Travertine', text: 'Natural stone, one of the most popular deck styles.', where: 'Decks and patios', alt: 'Travertine tiles on a covered patio' },
  { id: 's-pavers', name: 'Pavers', text: 'Laid, cleaned and sealed. Reseal every two to three years.', where: 'Decks, patios, walkways', alt: 'Tumbled concrete pavers on a patio' },
  { id: 's-flag', name: 'Coating, flagstone pattern', text: 'Over 1,500 colors. Nonskid, fade resistant and cool to the touch.', where: 'Pool decks, patios, walkways', alt: 'Grey decorative coating with a flagstone pattern and blue accents' },
  { id: 's-tile', name: 'Coating, tile pattern', text: 'A garden hose cleans it in minutes.', where: 'Pool decks, lanais, garage floors', alt: 'Grey decorative coating with a large tile pattern' },
  { id: 's-compass', name: 'Custom designs', text: 'Like this compass rose, set into a decorative coating.', where: 'Patios, entries, pool decks', alt: 'Compass rose set into a sand-colored decorative coating' },
]

export const cost = {
  scaleMax: 12000,
  rows: [
    { label: 'Plaster', from: 4000, to: 7000, note: 'The most affordable, with more upkeep over time' },
    { label: 'Pebble', from: 6000, to: 9000, note: 'More beautiful and more durable' },
    { label: 'Tile or high-end finishes', from: 8000, to: 10000, plus: true, note: 'The most luxurious, longest-lasting surface' },
  ],
  quartz: 'Quartz sits in between: more durable and stain resistant than plaster.',
  factors: ['The size and shape of your pool', 'The finish you choose', 'Repairs needed before resurfacing', 'Extras like new tile or coping'],
}

export const sealing = [
  { name: 'Inspect', text: 'We check the surface for repairs and cleaning needs.' },
  { name: 'Power wash', text: 'Commercial-grade equipment lifts dirt, algae and old residue.' },
  { name: 'Re-sand the joints', text: 'Polymeric sand in loose joints, if needed, steadies the pavers and stops weeds.' },
  { name: 'Let it dry', text: 'The pavers must be completely dry for the sealer to bond.', time: '24 to 48 h' },
  { name: 'Seal', text: 'Two coats, sprayed or rolled, in a natural matte or a glossy wet look.' },
  { name: 'Cure', text: 'Light foot traffic is fine after a day. Wait longer for furniture and cars.', time: '24 h' },
]

export const about = {
  title: 'Part of Tampa for 30 years, and here to stay',
  story:
    'We started out caring for pools. After looking after so many of them, we saw that a lot of maintenance problems can be prevented by good design. So today we remodel: resurfacing, tile and coping, decks and decorative concrete.',
  promise:
    'We have all heard stories of startup pool companies collecting a check and never finishing the job. We have been part of this community for 30 years, and we are not going anywhere.',
  facts: ['Veteran owned', 'Christian owned', 'Family business'],
  caption: 'Mark Haskins, founder, with his wife',
}

export const reviews = [
  {
    name: 'Robert Essex',
    stars: 5,
    quote: 'If you are thinking about a pool, decorative concrete or deck restoration, do not waste your time calling anyone else. Call the true professionals at Tampa Decking!',
  },
  {
    name: 'Anthony Sacks',
    quote: 'Honest and reliable service. Quick and friendly too. I would not hesitate to recommend this team for any job.',
  },
]

export const cities = [
  'Tampa', 'New Tampa', "Town 'n' Country", 'Carrollwood', 'Westchase', 'Odessa', 'Zephyrhills', 'Dade City',
  'Seffner', 'Valrico', 'Brandon', 'Riverview', 'Plant City', 'Oldsmar', 'Temple Terrace', "Land O' Lakes",
  'Lutz', 'New Port Richey', 'Port Richey', 'Tarpon Springs', 'East Lake', 'Hudson', 'Wesley Chapel',
]

// Déroulé d'un chantier (page « Swimming Pool Remodeling Hillsborough County »)
export const nextSteps = [
  { name: 'Free consultation', text: 'We visit your pool, listen, and give you a no-obligation estimate.' },
  { name: 'Design and planning', text: 'We help you choose the materials and upgrades that fit your style and budget.' },
  { name: 'The work', text: 'Our crew remodels, with a focus on quality and efficiency.' },
  { name: 'Final inspection', text: 'We check everything carefully and handle the touch-ups.' },
]

export const projectTypes = ['Pool resurfacing', 'Tile and coping', 'Pool deck', 'Decorative concrete', 'Paver sealing', 'Pressure washing', 'Something else']
