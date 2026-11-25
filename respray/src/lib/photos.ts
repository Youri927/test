/* Les photos envoyées par les vendeurs. En local, dans un dossier (PHOTOS_DOSSIER) ; en ligne, le même code pourra
   écrire dans un stockage d'objets (S3, R2, Supabase Storage) : seules ces deux fonctions changent. */
import 'server-only';
import {mkdir, writeFile, readFile} from 'fs/promises';
import path from 'path';
import {randomBytes} from 'crypto';

const DOSSIER = path.resolve(process.env.PHOTOS_DOSSIER || './photos-envoyees');
const TYPES: Record<string, string> = {'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif'};
export const TAILLE_MAX = 12 * 1024 * 1024;

export async function enregistrerPhoto(f: File): Promise<string> {
  const ext = TYPES[f.type];
  if (!ext) throw new Error('Format de photo non accepté : JPEG, PNG, WebP ou HEIC.');
  if (f.size > TAILLE_MAX) throw new Error('Une photo dépasse 12 Mo.');
  await mkdir(DOSSIER, {recursive: true});
  const nom = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.${ext}`;
  await writeFile(path.join(DOSSIER, nom), Buffer.from(await f.arrayBuffer()));
  return nom;
}

export async function lirePhoto(nom: string): Promise<{data: Buffer; type: string} | null> {
  if (!/^[a-z0-9]+-[a-f0-9]{12}\.(jpg|png|webp|heic|heif)$/.test(nom)) return null;
  try {
    const data = await readFile(path.join(DOSSIER, nom));
    const ext = nom.split('.').pop()!;
    const type = Object.entries(TYPES).find(([, e]) => e === ext)![0];
    return {data, type};
  } catch {
    return null;
  }
}
