/* Les tâches automatiques : le cron du serveur appelle cette adresse toutes les 15 minutes, avec
   « Authorization: Bearer $TACHES_SECRET ». */
import {NextResponse} from 'next/server';
import {taches} from '@/lib/commandes';

export async function GET(req: Request) {
  if (!process.env.TACHES_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.TACHES_SECRET}`) return NextResponse.json({erreur: 'non'}, {status: 401});
  return NextResponse.json({fait: await taches()});
}
