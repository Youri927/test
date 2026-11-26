/* Va chercher chez Scento les notes de tout le catalogue (un parfum par seconde, pour ne pas surcharger l'API).
   npm run senteurs */
import 'dotenv/config';
import {db, schema} from '../src/db';
import {rafraichir} from '../src/lib/scento';

(async () => {
  const ps = await db.select({id: schema.parfums.id, nom: schema.parfums.nom}).from(schema.parfums);
  for (const p of ps) {
    try {
      const s = await rafraichir(p.id);
      console.log(s && !s.absent ? '✓' : '–', p.nom, s && !s.absent ? [...(s.tete ?? []), ...(s.coeur ?? []), ...(s.fond ?? []), ...(s.notes ?? [])].join(', ') : '(pas chez Scento)');
    } catch (e) {
      console.log('×', p.nom, (e as Error).message);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  process.exit(0);
})();
