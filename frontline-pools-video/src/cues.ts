/**
 * Les repères des bruitages, partagés par src/PresSound.tsx (aperçu dans Remotion) et sound/mix.mjs (bande-son finale).
 * Chaque repère : [image, bruitage, volume].
 */
export type Cue = [number, string, number];
export type ClickClip = [string, string, number, number, number];

// les clics filmés, replacés sur la ligne de temps du montage (scène, plan, image de départ, vitesse, volume)
export const CLICK_CLIPS: ClickClip[] = [
  ['Service area', 'dAreas', 0, 1.3, 0.3],
  ['Free estimate', 'dEstimate', 0, 1.4, 0.3],
  ['Mobile', 'mMenu', 0, 0.9, 0.22],
];
// la saisie du formulaire (secondes du plan filmé), jouée à 1,4×
const TYPING: [number, number][] = [[3.5, 4.1], [4.5, 5.4], [5.9, 6.9], [7.3, 8.2], [9.5, 10.9]];

export const cues = (START: Record<string, number>, LEN: Record<string, number>, clicks: (clip: string) => number[]): Cue[] => {
  const tileAt = [START['Today'] - 52, START['Today'] + 2, START['Turn'] - 52, START['First impression'] - 52, START['Mobile'] - 52, START['Mobile'] + 2, START['End'] - 52];
  const whips = ['What we rebuild', 'Recent work', 'Equipment', 'Reviews', 'License & financing', 'Service area', 'Free estimate'].map((n) => START[n] - 12);
  const typing: Cue[] = TYPING.flatMap(([a, b]) => {
    const out: Cue[] = [];
    for (let s = a; s < b; s += 0.1) out.push([Math.round(START['Free estimate'] + (s * 60) / 1.4), 'tap', 0.05]);
    return out;
  });
  const clickCues: Cue[] = CLICK_CLIPS.flatMap(([scene, clip, from, rate, vol]) =>
    clicks(clip)
      .map((c) => Math.round(START[scene] + (c - from) / rate))
      .filter((f) => f >= START[scene] && f < START[scene] + LEN[scene])
      .map((f): Cue => [f, 'tap', vol]));
  return [
    [8, 'air', 0.22],
    ...tileAt.map((f): Cue => [f, 'tiles', 0.42]),
    // la photo d'accueil qui se pose en mosaïque sur le site
    [START['First impression'] + 22, 'tiles', 0.3],
    ...whips.map((f): Cue => [f, 'whoosh', 0.4]),
    [START['End'] + 160, 'air', 0.26],
    ...typing,
    ...clickCues,
  ];
};
