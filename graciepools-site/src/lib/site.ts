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
