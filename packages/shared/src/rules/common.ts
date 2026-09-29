import { z } from 'zod';

/**
 * OUTILS COMMUNS AUX RÈGLES — MM-01.
 */

/**
 * Identifiant technique (UUID), par exemple « 3f2b…-…-…-… ».
 * Chaque menu, catégorie, plat ou image en reçoit un, fabriqué par la base.
 */
export const idSchema = z.uuid('Identifiant invalide.');

/** Garde un caractère s'il est lisible (ou tabulation / retour à la ligne). */
function isReadable(character: string): boolean {
  const code = character.codePointAt(0) ?? 0;
  if (code === 9 || code === 10 || code === 13) return true; // tabulation, retours à la ligne
  return code >= 32 && code !== 127; // les codes 0 à 31 et 127 sont des caractères de contrôle invisibles
}

/**
 * Règle de « texte simple » réutilisée pour les noms et descriptions :
 * 1. retire les caractères invisibles (copiés-collés depuis un traitement de texte, par exemple) ;
 * 2. retire les espaces au début et à la fin ;
 * 3. vérifie la longueur maximale.
 * Le texte est gardé tel quel : il sera toujours AFFICHÉ comme du texte,
 * jamais interprété comme du code HTML (protection contre l'injection de code).
 */
export function plainText(max: number, tooLongMessage: string) {
  return z
    .string({ error: 'Ce champ doit être un texte.' })
    .transform((value) => [...value].filter(isReadable).join('').trim())
    .pipe(z.string().max(max, tooLongMessage));
}

/** Même règle, mais le texte ne peut pas être vide. */
export function requiredText(max: number, requiredMessage: string, tooLongMessage: string) {
  return plainText(max, tooLongMessage).pipe(z.string().min(1, requiredMessage));
}
