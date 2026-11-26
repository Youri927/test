import 'server-only';
import {db, schema} from '@/db';

/* chaque action de l'équipe laisse une ligne : qui, quoi, sur quoi */
export async function noter(membreId: number | null, action: string, cible: string, texte: string) {
  await db.insert(schema.journal).values({membreId, action, cible, texte});
}
