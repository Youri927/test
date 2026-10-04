// La trajectoire du plan-séquence, partagée par la capture (capture/shots.mjs) et le son (sound/day.mjs) :
// à chaque seconde du film, la position de défilement dans le site (px, ordinateur 1920 × 1080).
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const sine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
export const track = (keys, ease = sine) => (t) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let k = 1; k < keys.length; k++) {
    const [ta, va] = keys[k - 1];
    const [tb, vb, e] = keys[k];
    if (t <= tb) return va + (vb - va) * (e || ease)((t - ta) / (tb - ta));
  }
  return keys[keys.length - 1][1];
};

// lent sur chaque moment, rapide entre deux ; le lever du jour prend son temps ; à la fin, tout se rembobine
export const DAY = [
  [0, 0], [4.6, 0],
  [6.6, 1350, easeInOut], // vers le porche
  [10.6, 1960, sine], // on s'en approche, on entre
  [12.6, 2890, easeInOut], // l'îlot
  [19.0, 2940, sine],
  [20.6, 4400, easeInOut], // le préau se dessine
  [24.4, 4470, sine],
  [26.0, 5560, easeInOut], // le dîner, la carte
  [31.0, 5600, sine],
  [32.2, 6100, easeInOut], // la guinguette s'allume
  [36.8, 6660, sine],
  [38.2, 7600, easeInOut], // le gîte, chambre par chambre
  [42.6, 8060, sine],
  [45.4, 9350, easeInOut], // le jour se lève
  [50.0, 9380, sine],
  [51.4, 11250, easeInOut], // les avis
  [55.0, 11300, sine],
  [61.0, 12300, sine], // (pendant le passage sur mobile)
  [64.0, 0, easeInOut], // retour en arrière
  [68.0, 0],
];
export const DAY_LEN = 68;
export const dayY = track(DAY);

// Sur mobile (390 × 844) : du nom qui se lève à l'îlot, en passant par le porche
export const PHONE = [[0, 0], [1.0, 0], [2.6, 1000, easeInOut], [4.0, 1340, sine], [5.4, 2380, easeInOut], [6.4, 2400, sine]];
export const PHONE_LEN = 6.4;

// Repères du site à cette taille (px) : la guirlande s'allume de 5955 à 6819, le gîte de 7431 à 8054
export const LIGHTS = {garland: [5955, 6819], house: [7431, 8054]};
