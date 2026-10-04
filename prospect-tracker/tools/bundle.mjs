// Assemble la fonction en un seul fichier, à coller dans l'éditeur de fonctions du tableau de bord Supabase.
// node tools/bundle.mjs → supabase/mail-tracker.un-seul-fichier.ts
import {readFileSync, writeFileSync} from 'node:fs';

const dir = new URL('../supabase/functions/mail-tracker/', import.meta.url);
const read = (f) => readFileSync(new URL(f, dir), 'utf8');
const dropLocalImports = (s) => s.replace(/^import (type )?\{[^}]*\} from '\.\/[a-z]+\.ts';\n/gm, '');
const out = [
  '// Prospect Tracker : fonction « mail-tracker » en un seul fichier (assemblée par tools/bundle.mjs).',
  '// Tableau de bord Supabase → Edge Functions → mail-tracker → coller ce fichier à la place de index.ts.',
  '// Désactiver « Verify JWT », et ajouter le secret TRACKER_TOKEN.',
  '',
  read('logic.ts'),
  dropLocalImports(read('handler.ts')),
  dropLocalImports(read('index.ts')),
].join('\n');
writeFileSync(new URL('../supabase/mail-tracker.un-seul-fichier.ts', import.meta.url), out);
console.log('✓ supabase/mail-tracker.un-seul-fichier.ts');
