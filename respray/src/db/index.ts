import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/* une seule connexion par processus, même quand Next recharge le code en développement */
const g = globalThis as unknown as {sql?: ReturnType<typeof postgres>};
const sql = g.sql ?? postgres(process.env.DATABASE_URL!, {max: 5});
if (process.env.NODE_ENV !== 'production') g.sql = sql;

export const db = drizzle(sql, {schema});
export {schema};
