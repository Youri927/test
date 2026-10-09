// L'entreprise, d'après son propre site (custompoolsbyrobabel.com, relevé le 9 octobre 2026).
export const site = {
  name: 'Custom Pools by Rob Abel',
  phone: { display: '850-362-POOL', digits: '850-362-7665', tel: '+18503627665' },
  email: 'custompoolsbyrobabel@gmail.com',
  address: { street: '323 Racetrack Road', city: 'Fort Walton Beach', state: 'FL', zip: '32547' },
  // « MON - SUN: 7:00 AM – 3:00 PM »
  hours: { days: 'Monday to Sunday', time: '7 am – 3 pm' },
  towns: ['Destin', 'Santa Rosa Beach', '30A', 'Fort Walton Beach', 'Niceville'],
  counties: 'Walton and Okaloosa counties',
  financing: 'https://www.lyonfinancial.net/',
  maps: 'https://www.google.com/maps/search/?api=1&query=323+Racetrack+Road+Fort+Walton+Beach+FL+32547',
} as const

export const nav = [
  { id: 'pools', label: 'Pools' },
  { id: 'pump-room', label: 'Pump room' },
  { id: 'backyard', label: 'Around the water' },
  { id: 'how', label: 'New or existing' },
  { id: 'contact', label: 'Contact' },
] as const
