// Tout le texte du site vient de naplescomprehensivedentist.com (relevé le 8 octobre 2026),
// raccourci ou reformulé, jamais inventé. Voir ANALYSE.md.

export const NAME = 'Implant and Comprehensive Dentistry of Naples'
export const PHONE = '(239) 241-2951'
export const PHONE_HREF = 'tel:+12392412951'
export const EMERGENCY = '(239) 663-8771'
export const EMERGENCY_SMS = 'sms:+12396638771'
export const EMAIL = 'ICDentalofNaples@gmail.com'
export const STREET = '4280 Tamiami Trail East'
export const UNIT = 'Unit 201'
export const CITY = 'Naples, FL 34112'
export const MAPS = 'https://www.google.com/maps/search/?api=1&query=4280+Tamiami+Trail+East+Unit+201+Naples+FL+34112'

export const nav = [
  { id: 'implants', label: 'Implants' },
  { id: 'crowns', label: 'Same-day crowns' },
  { id: 'treatments', label: 'Treatments' },
  { id: 'sedation', label: 'Sedation' },
  { id: 'doctor', label: 'Dr. Fakhoury' },
  { id: 'visit', label: 'Visit' },
] as const

/** Horaires : jour de la semaine (0 = dimanche) → heures d'ouverture, ou null */
export const HOURS: { day: string; open: [number, number] | null; label: string }[] = [
  { day: 'Sunday', open: null, label: 'Closed' },
  { day: 'Monday', open: [8, 17], label: '8:00 AM – 5:00 PM' },
  { day: 'Tuesday', open: [8, 17], label: '8:00 AM – 5:00 PM' },
  { day: 'Wednesday', open: [8, 17], label: '8:00 AM – 5:00 PM' },
  { day: 'Thursday', open: [8, 17], label: '8:00 AM – 5:00 PM' },
  { day: 'Friday', open: [8, 17], label: '8:00 AM – 5:00 PM' },
  { day: 'Saturday', open: null, label: 'By appointment only' },
]

/* ---------- Les soins : le texte de leurs pages ---------- */

export type Block = { title?: string; text?: string; list?: [string, string][] }
export type Treatment = { id: string; name: string; short: string; body: Block[] }

export const treatments: Treatment[] = [
  {
    id: 'implants',
    name: 'Dental implants',
    short: 'A permanent solution for missing teeth.',
    body: [
      {
        text: 'Dental implants are artificial tooth roots that provide a permanent base for fixed replacement teeth. Unlike dentures, bridges and crowns, they are a long-term solution for missing teeth, failing teeth or chronic dental problems. They fit, feel and function like natural teeth, which makes them the new standard in tooth replacement.',
      },
      {
        text: 'Dr. Fakhoury uses medical-grade titanium implants that fuse to the living bone of the jaw, a strong, durable anchor for your new teeth: no slippage or movement, no eating difficulties, no need for regular repairs.',
      },
      {
        title: 'Three parts',
        list: [
          ['The implant', 'A screw that attaches to your jaw.'],
          ['The abutment', 'A connector that supports the tooth or teeth.'],
          ['The crown', 'The visible part of the tooth, usually zirconium or porcelain, for durability and looks.'],
        ],
      },
      { title: 'One tooth, several, or a full arch', text: 'Implants can replace a single tooth, multiple teeth, or a full upper and/or lower set of teeth.' },
      { title: 'Worth knowing', text: 'Implants are a more involved process that needs healing time, and they last. For a faster permanent option, a bridge can often be placed in a single day.' },
    ],
  },
  {
    id: 'implant-dentures',
    name: 'Implant-supported dentures',
    short: 'Secure, comfortable dentures anchored by implants.',
    body: [
      {
        text: 'Implant-supported dentures are over-dentures held by dental implants, a comfortable and functional solution for patients with loose or uncomfortable dentures. The implants are anchored firmly in the jaw bone and give the denture a stable base.',
      },
      {
        text: 'Attachments on the underside of the denture connect to the implants. When the denture is placed in the mouth, it snaps onto the implants and stays secure and stable: more comfort, function and confidence than traditional dentures.',
      },
    ],
  },
  {
    id: 'dentures',
    name: 'Dentures and partials',
    short: 'Custom-fit for a natural look.',
    body: [
      {
        text: 'Complete dentures replace all missing teeth and gum tissue, and support the lips, cheeks and face. Partial dentures blend with your remaining natural teeth to replace several missing teeth with one appliance.',
      },
      {
        text: 'Our cosmetic dentures are made with advanced materials and look more like natural teeth than traditional plastic dentures. For more stability, implant-supported dentures snap securely into place, with a better fit and hold than dentures kept in with adhesives.',
      },
    ],
  },
  {
    id: 'bridges',
    name: 'Bridges',
    short: 'Missing teeth replaced by anchoring to the teeth next to them.',
    body: [
      {
        text: 'If you have a missing tooth or a few teeth in a row, and the teeth on either side of the space are stable, a bridge may be for you. It consists of two crowns attached to a solid middle crown that bridges the gap. The middle crown has a smooth underside that is easy to clean with floss. Cemented in place like regular crowns, a bridge is permanent: it is not a removable partial denture.',
      },
      { title: 'Often in one visit', text: 'A bridge is an effective way to replace one or two missing teeth, and Dr. Fakhoury can often create and place it in a single day.' },
      { title: 'Implants as an alternative', text: 'Whenever possible, implants are recommended: a titanium screw acts as the root, topped with an E4D crown. They need healing time, and they last.' },
    ],
  },
  {
    id: 'crowns',
    name: 'Same-day crowns',
    short: 'Designed and milled in the office, placed in one visit.',
    body: [
      {
        text: 'Dr. Fakhoury uses the E4D 3D system to design and mill durable all-porcelain crowns right in the office. No messy impression material, no temporary crown: you leave with a strong, natural-looking permanent crown after one visit.',
      },
      {
        title: 'When a crown helps',
        text: 'If a tooth has deep cracks, a root canal, or little healthy structure left, a crown may be needed. Crowns, or caps, cover the part of the tooth above the gums to protect it, stop cracks from spreading, or reshape it for cosmetic reasons.',
      },
      {
        title: 'Why E4D crowns',
        list: [
          ['Natural-looking', 'The porcelain has the same translucency as natural teeth, in many shades for a precise color match.'],
          ['Strong', 'Twice as strong as metal-filled crowns, even on back teeth, milled from a single block of body-friendly porcelain.'],
          ['Natural-acting', 'One solid block means fewer risks of cracks and flaws, and the porcelain expands much like natural teeth.'],
          ['Accurate', 'Digital scanning, design, milling and fine-tuning give crowns that match and sit precisely.'],
        ],
      },
    ],
  },
  {
    id: 'fillings',
    name: 'Tooth-colored fillings',
    short: 'Restoring teeth damaged by cavities.',
    body: [
      { text: 'Composite fillings, in the color of your teeth, restore teeth damaged by cavities.' },
      { title: 'Preventing the next one', text: 'Regular dental check-ups, proper brushing, flossing and a healthy diet are the keys to preventing cavities.' },
    ],
  },
  {
    id: 'root-canals',
    name: 'Root canals',
    short: 'Treating infected teeth to save them.',
    body: [
      {
        text: 'Inside the root of a tooth is a canal filled with pulp. When the pulp becomes infected, usually through decay or trauma, root canal therapy saves the tooth: the pulp is carefully removed, the inside of the tooth thoroughly cleaned and disinfected, then sealed with a rubber-like material.',
      },
      {
        title: 'Keeping your own tooth',
        text: 'Dr. Fakhoury may then place a crown to protect the tooth, especially if the infection weakened it. The tooth keeps working normally, nourished by the surrounding tissues, and chewing, biting and the position of the teeth next to it are preserved.',
      },
      { title: 'When it cannot be saved', text: 'If the infection is too severe, extraction may be recommended, and Dr. Fakhoury will go over the options to replace the tooth, such as an implant.' },
    ],
  },
  {
    id: 'extractions',
    name: 'Extractions',
    short: 'Removing problematic teeth safely.',
    body: [
      { text: 'Dr. Fakhoury performs both simple and surgical extractions in the office.' },
      { title: 'Simple extractions', text: 'For teeth that are visible in the mouth, under local anesthesia. The tooth is gently loosened with specialized instruments, then removed with controlled, steady pressure.' },
      { title: 'Surgical extractions', text: 'For teeth that are hard to reach, such as teeth broken under the gum line or impacted teeth that have not fully erupted, removed with care and precision.' },
    ],
  },
  {
    id: 'periodontal',
    name: 'Periodontal treatment',
    short: 'Gum health, for overall oral wellness.',
    body: [
      { text: "If you've been diagnosed with gum disease, Dr. Fakhoury tailors the treatment to your needs and to how advanced it is, starting with the least invasive approach." },
      {
        title: 'Scaling and root planing',
        text: "First, a specialized cleaning: our hygienists use an ultrasonic device to remove plaque and tartar from below the gum line and smooth the tooth's surface and root, so the gums can reattach to the tooth.",
      },
      { title: 'Surgical options', text: 'If that is not enough to repair the damage, surgery can stop it from getting worse. Dr. Fakhoury recommends the right procedure based on the tissue and bone around your teeth.' },
    ],
  },
  {
    id: 'sedation',
    name: 'Sedation dentistry',
    short: 'Comfort and ease during dental procedures.',
    body: [
      { text: 'For patients with dental anxiety, from mild to severe, sedation brings a calm, peaceful state and changes the whole experience.' },
      {
        title: 'Three options',
        list: [
          ['Nitrous oxide', '“Laughing gas” helps you relax throughout the procedure.'],
          ['Conscious sedation', 'Nitrous oxide with an amnesic medicine: you relax and won’t remember the procedure.'],
          ['IV sedation', 'Medication given through a vein helps you “sleep” through the procedure.'],
        ],
      },
      {
        title: 'All in the office',
        text: 'Procedures are done in the office. You can leave with temporaries while our on-site lab makes your permanent crowns, bridges or removable appliances, and our lab technician customizes the shade so your new teeth match your own.',
      },
    ],
  },
  {
    id: 'geriatric',
    name: 'Geriatric dentistry',
    short: 'Specialized care for senior patients.',
    body: [
      { text: 'More and more people keep their teeth as they age: dentures are not a normal part of growing older. With a healthy diet and good oral hygiene, there is usually no reason you can’t keep your natural teeth for life.' },
      { text: 'Good oral hygiene also helps protect against serious health problems such as hypertension, cardiovascular disease and diabetes. A healthy mouth goes with a healthy body.' },
    ],
  },
  {
    id: 'cosmetic',
    name: 'Cosmetic dentistry',
    short: 'Veneers, whitening, crowns and bridges.',
    body: [
      { text: 'Porcelain veneers, teeth whitening, porcelain crowns and bridges, and tooth-colored composite fillings.' },
      { text: 'Crowns are designed and milled in the office, and our on-site lab technician matches the shade of your new teeth to your own.' },
    ],
  },
  {
    id: 'fillers',
    name: 'Fillers',
    short: 'Hyaluronic acid to smooth lines and restore volume.',
    body: [
      { text: 'As skin loses its elasticity, laughing or frowning can leave lasting lines. Fillers use hyaluronic acid, a natural substance in the skin that hydrates and adds volume, to smooth wrinkles and fine lines and define the lips.' },
      { text: 'The procedure takes a few minutes, with no downtime. The full effect develops over up to two weeks and lasts six to twelve months.' },
    ],
  },
  {
    id: 'emergency',
    name: 'Emergency care',
    short: 'Extractions, root canals, broken teeth.',
    body: [
      { text: `Text the emergency line, ${EMERGENCY}, and someone will call you. Dr. Fakhoury also offers after-hours emergency care.` },
      { text: 'Extractions, root canals and the repair of broken teeth.' },
    ],
  },
]

export const byId = Object.fromEntries(treatments.map((t) => [t.id, t])) as Record<string, Treatment>

/* ---------- Ce qui vous amène : les soins rangés par situation ---------- */

export type Situation = { id: string; say: string; answer: string; treatments: string[] }

export const situations: Situation[] = [
  { id: 'missing', say: 'A tooth is missing', answer: 'An implant replaces the root and the tooth. A bridge can often be placed in a single day.', treatments: ['implants', 'bridges', 'dentures'] },
  { id: 'dentures', say: 'My dentures are loose', answer: 'Anchored on implants, the denture snaps into place and stays put.', treatments: ['implant-dentures', 'dentures'] },
  { id: 'cracked', say: 'A tooth is cracked or broken', answer: 'A crown protects it. Ours are milled here and placed the same day.', treatments: ['crowns', 'emergency'] },
  { id: 'hurts', say: 'A tooth hurts', answer: 'An infected tooth can often be saved with a root canal, or removed in the office.', treatments: ['root-canals', 'extractions', 'emergency'] },
  { id: 'cavity', say: 'I have a cavity', answer: 'A filling in the color of your teeth restores it.', treatments: ['fillings'] },
  { id: 'gums', say: 'I was told I have gum disease', answer: 'A deep cleaning below the gum line first, surgery only if needed.', treatments: ['periodontal'] },
  { id: 'nervous', say: 'I’m nervous about the dentist', answer: 'Three levels of sedation, from laughing gas to IV sedation.', treatments: ['sedation'] },
  { id: 'later', say: 'I want to keep my teeth for life', answer: 'With good care, losing your teeth is not part of growing older.', treatments: ['geriatric'] },
  { id: 'smile', say: 'I’d like a brighter smile', answer: 'Porcelain veneers, whitening, crowns, and fillers for lines.', treatments: ['cosmetic', 'crowns', 'fillers'] },
  { id: 'emergency', say: 'It’s an emergency', answer: `Text ${EMERGENCY} and someone will call you. Dr. Fakhoury also sees emergencies after hours.`, treatments: ['emergency'] },
]

/* ---------- La couronne en une séance ---------- */

export const usualWay = ['Impression', 'Temporary crown', 'Second appointment', 'Permanent crown'] as const
export const e4dWay = ['Digital scan', 'Design', 'Milling', 'Fitting'] as const

/* ---------- La sédation ---------- */

export const sedationLevels = [
  { id: 'nitrous', name: 'Nitrous oxide', aka: 'Laughing gas', feel: 'Relaxed', text: 'Helps you relax throughout the procedure.' },
  { id: 'conscious', name: 'Conscious sedation', aka: 'Nitrous oxide and an amnesic medicine', feel: 'Relaxed, and you won’t remember', text: 'You relax, and you won’t remember the procedure.' },
  { id: 'iv', name: 'IV sedation', aka: 'Medication through a vein', feel: 'You sleep through it', text: 'Helps you “sleep” through your procedure.' },
] as const

/* ---------- Questions fréquentes (page Contact) ---------- */

export const faq = [
  { q: 'How much does a dental implant cost?', a: 'It varies from one patient to another. Call the office for a personalized consultation.' },
  { q: 'Does insurance cover dental cleanings?', a: 'Most dental insurance plans cover routine cleanings. Check with your provider for the specifics.' },
  { q: 'How can I prevent cavities?', a: 'Regular check-ups, proper brushing, flossing and a healthy diet.' },
]
