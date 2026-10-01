/** Contenu — sources : the-escapers.com, escapegame.fr (oct. 2026). */
export const content = {
  brand: {
    name: "L'Antre 2 Jeux",
    line1: "L'ANTRE",
    line2: '2 JEUX',
    baseline: 'ESCAPE GAME · SOISSONS',
  },
  hook: ['SAUREZ-VOUS', 'VOUS ÉCHAPPER ?'],
  rooms: [
    {
      id: 'route66',
      title: ['ROUTE 66'],
      tag: 'ENQUÊTE',
      pitch: '1958, Nevada. Le FBI enquête sur le diner de Jeff.',
      level: 'INTERMÉDIAIRE',
      levelN: 2,
      rating: 4.6,
    },
    {
      id: 'corleone',
      title: ['LA PLANQUE', 'DES CORLEONE'],
      tag: 'BRAQUAGE',
      pitch: 'Trouvez le diamant avant le retour du clan.',
      level: 'AVANCÉ',
      levelN: 3,
      rating: 4.5,
    },
    {
      id: 'alerte',
      title: ['ALERTE ROUGE'],
      tag: 'MISSION',
      pitch: 'Percez les secrets du KGB et désamorcez la bombe.',
      level: 'EXPERT',
      levelN: 4,
      rating: 4.8,
    },
  ],
  facts: {
    players: '3 à 6 joueurs',
    price: 'Dès 21 €',
    priceSub: '/ joueur',
    rating: "Jusqu'à 4,8/5",
    ratingSub: 'avis joueurs',
  },
  booking: {
    days: [
      {d: 'VEN', n: '16'},
      {d: 'SAM', n: '17'},
      {d: 'DIM', n: '18'},
      {d: 'LUN', n: '19'},
      {d: 'MAR', n: '20'},
    ],
    slots: ['14:00', '15:30', '17:00', '18:30', '20:00', '21:30'],
    summary: '4 joueurs · 25 € / pers.',
  },
  cta: {
    title: ['PRÊTS À RELEVER', 'LE DÉFI ?'],
    button: 'RÉSERVEZ VOTRE MISSION',
    url: 'lantre2jeux-escapegame.com',
    address: '4 av. de Château-Thierry · Soissons',
  },
} as const;

export type Room = (typeof content.rooms)[number];
