/**
 * Charte graphique — point unique à modifier.
 *
 * ⚠️ PROVISOIRE : le site lantre2jeux-escapegame.com est bloqué par le réseau
 * de l'environnement de build. Couleurs / polices ci-dessous = ambiance
 * "escape game" par défaut, à remplacer par les valeurs exactes du site
 * (logo à déposer dans public/brand/logo.png, voir README).
 */
export const theme = {
  colors: {
    bg: '#0B0807',
    bg2: '#171110',
    surface: '#1D1613',
    surface2: '#271E19',
    line: 'rgba(255, 236, 214, 0.14)',
    text: '#F7EFE6',
    muted: '#BCA996',
    accent: '#F2A23A', // ambre / lumière de torche
    accentDeep: '#C9711C',
    danger: '#E2312B', // rouge alerte
  },
  rooms: {
    route66: {tint: '#2BB5A6', tint2: '#E8553C'},
    corleone: {tint: '#D9B157', tint2: '#7A1E22'},
    alerte: {tint: '#E2312B', tint2: '#3A0B0B'},
  },
  radius: 36,
} as const;

export type Theme = typeof theme;
