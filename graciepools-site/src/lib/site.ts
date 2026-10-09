// Coordonnées et faits de Gracie Pools, tels que leur site les donne (voir ANALYSE.md).
export const PHONE = '(407) 866-7486'
export const TEL = 'tel:+14078667486'
export const EMAIL = 'Mike@GraciePools.com'
export const LICENSE = 'CPC1458515'
export const AREAS = ['Altamonte Springs', 'Orlando', 'Winter Park', 'Lake Mary']
export const LYON = 'https://www.lyonfinancial.net/dealer/gracie-pools/'
export const SHEET =
  'https://img1.wsimg.com/blobby/go/3c088145-d2f5-4a3c-b546-e6ddb4ebd919/Barrier%20Reef%20Fiberglass%20Pools%202025%20Model%20Sheet.pdf'

/** « Text pictures of your pool to 407-866-7486 for a free estimate » : le SMS s'ouvre avec un début de message.
 *  « ?&body= » est compris par iOS comme par Android. */
export const sms = (body = 'Hi Gracie Pools, here’s a photo of my pool for a free estimate.') =>
  `sms:+14078667486?&body=${encodeURIComponent(body)}`

/** page Contact de leur site : l'adresse, les deux interlocuteurs, les comtés desservis et les horaires */
export const ADDRESS = { street: '817 Walnut Pl', city: 'Altamonte Springs', region: 'FL', zip: '32701' }
export const COUNTIES = 'Seminole, Orange and Volusia counties'
export const PEOPLE = [
  { role: 'Construction', name: 'Mike Stansfield', email: 'Mike@GraciePools.com' },
  { role: 'Customer service', name: 'Maria Peguero', email: 'Maria@GraciePools.com' },
]
/** jours de la semaine (0 = dimanche) : ouverture et fermeture, en heures */
export const HOURS: { days: string; from?: number; to?: number; idx: number[] }[] = [
  { days: 'Monday – Friday', from: 8, to: 17, idx: [1, 2, 3, 4, 5] },
  { days: 'Saturday', from: 9, to: 17, idx: [6] },
  { days: 'Sunday', idx: [0] },
]
export const hm = (h: number) => (h === 12 ? '12 pm' : h > 12 ? `${h - 12} pm` : `${h} am`)
