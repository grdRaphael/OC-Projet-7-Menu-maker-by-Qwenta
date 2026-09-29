import { z } from 'zod';

/**
 * FORMAT UNIQUE DES ERREURS DE L'API — MM-01, sous-tâche 2.
 *
 * Quelle que soit la route, une erreur ressemble toujours à ceci :
 *
 *   {
 *     "error": {
 *       "code": "VALIDATION_ERROR",                       ← pour le programme
 *       "message": "Certaines informations sont invalides.", ← pour l'utilisateur
 *       "fields": { "priceCents": ["Le prix doit être supérieur à 0 €."] }  ← facultatif
 *     }
 *   }
 *
 * L'interface lit `code` pour décider quoi faire (rediriger vers la connexion,
 * proposer un nouveau lien…) et `fields` pour placer chaque message sous
 * le bon champ du formulaire.
 */

/** Chaque code d'erreur possible, avec le statut HTTP qui l'accompagne. */
export const ERROR_STATUS = {
  VALIDATION_ERROR: 400, //   données refusées par une règle Zod
  LINK_INVALID: 400, //       lien de connexion inconnu ou tronqué
  UNAUTHENTICATED: 401, //    pas connecté (ou session expirée)
  NOT_FOUND: 404, //          n'existe pas… OU appartient à un autre compte (on ne le révèle pas)
  MENU_NOT_READY: 409, //     menu incomplet pour passer « prêt » ou être exporté
  LINK_EXPIRED: 410, //       lien de connexion trop ancien
  LINK_ALREADY_USED: 410, //  lien de connexion déjà utilisé
  PAYLOAD_TOO_LARGE: 413, //  fichier trop lourd
  UNSUPPORTED_MEDIA: 415, //  fichier qui n'est pas une image acceptée
  RATE_LIMITED: 429, //       trop de demandes en peu de temps
  EXTERNAL_SERVICE: 502, //   un service extérieur (Instagram…) a refusé ou ne répond pas
  INTERNAL: 500, //           erreur inattendue (le détail reste dans les journaux du serveur)
} as const;

export type ErrorCode = keyof typeof ERROR_STATUS;
export const ERROR_CODES = Object.keys(ERROR_STATUS) as [ErrorCode, ...ErrorCode[]];

/** La forme d'une réponse d'erreur, décrite avec Zod (elle apparaît aussi dans le contrat). */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.enum(ERROR_CODES),
    message: z.string(),
    fields: z.record(z.string(), z.array(z.string())).optional(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

/**
 * Transforme les erreurs Zod en { champ: [messages] }.
 * C'est ce que le serveur mettra dans `fields` quand une règle refuse des données.
 */
export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_';
    (fields[key] ??= []).push(issue.message);
  }
  return fields;
}
