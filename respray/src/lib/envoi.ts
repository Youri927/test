import 'server-only';
/* Les envois en point relais. Tant que le contrat pro Mondial Relay n'est pas signé (ENVOIS_SIMULES=1), les points
   relais, l'étiquette et le suivi sont simulés ; ensuite, ces deux fonctions appelleront l'API Mondial Relay
   (recherche de points relais, création d'expédition), et le suivi arrivera par leur notification. */
import {randomInt} from 'crypto';
import type {Relais} from '@/db/schema';

export const simule = () => process.env.ENVOIS_SIMULES === '1';

const RUES = ['rue de la République', 'avenue Jean-Jaurès', 'rue Victor-Hugo', 'boulevard Gambetta', 'place de la Mairie', 'rue Pasteur'];
const COMMERCES = ['Tabac Presse du Centre', 'Pressing des Lilas', 'Carrefour City', 'Librairie du Marché', 'Fleuriste Les Jardins', 'Cordonnerie Express'];

/* trois points relais près d'un code postal (simulés : toujours les mêmes pour un même code postal) */
export function relaisPres(cp: string): Relais[] {
  if (!/^\d{5}$/.test(cp)) return [];
  const n = Number(cp);
  return [0, 1, 2].map((i) => ({
    id: `${cp}-${i + 1}`,
    nom: COMMERCES[(n + i * 7) % COMMERCES.length],
    adresse: `${((n >> i) % 120) + 1} ${RUES[(n + i * 3) % RUES.length]}`,
    cp,
    ville: simule() ? 'Ville (simulation)' : '',
  }));
}

/* l'étiquette prépayée, adressée au point relais de l'acheteur */
export async function creerEtiquette(): Promise<string> {
  return `MR${randomInt(10_000_000, 99_999_999)}${simule() ? '-SIMU' : ''}`;
}
