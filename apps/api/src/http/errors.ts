import type { FastifyError, FastifyInstance } from 'fastify';
import { ERROR_STATUS, fieldErrors, type ApiError, type ErrorCode } from '@menu-maker/shared';
import type { z } from 'zod';

/**
 * ERREURS DU SERVEUR — MM-03, sous-tâche 1 (repris de « reference »).
 *
 * Toutes les erreurs sortent au format décidé dans le contrat (MM-01) :
 *   { "error": { "code": "...", "message": "...", "fields": {...} } }
 */

/** Erreur prévue par le contrat (données invalides, introuvable…), levée volontairement par le code. */
export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}

/** Raccourci pour « introuvable » (utilisé aussi pour ce qui appartient à un autre compte). */
export const notFound = () => new AppError('NOT_FOUND', 'Élément introuvable.');

/**
 * Vérifie des données reçues avec une règle Zod partagée (safeParse).
 * Si elles sont invalides, on s'arrête là avec une erreur 400 qui liste les
 * champs fautifs : aucun traitement ne démarre sur des données douteuses.
 */
export function parseWith<S extends z.ZodType>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError('VALIDATION_ERROR', 'Certaines informations sont invalides.', fieldErrors(result.error));
  }
  return result.data;
}

/** Branche la traduction de TOUTE erreur vers le format du contrat, sans jamais exposer de détail interne. */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError | AppError, request, reply) => {
    let body: ApiError;
    if (error instanceof AppError) {
      // Erreur prévue : on renvoie son code, son message et, si besoin, les champs en cause.
      body = { error: { code: error.code, message: error.message, ...(error.fields && { fields: error.fields }) } };
    } else if (error.statusCode === 429) {
      body = { error: { code: 'RATE_LIMITED', message: 'Trop de demandes. Réessayez dans quelques minutes.' } };
    } else if (error.statusCode === 413) {
      body = { error: { code: 'PAYLOAD_TOO_LARGE', message: 'Fichier trop lourd.' } };
    } else if (error.statusCode && error.statusCode < 500) {
      // Demande mal formée détectée par Fastify lui-même (JSON cassé, par exemple).
      body = { error: { code: 'VALIDATION_ERROR', message: 'Requête invalide.' } };
    } else {
      // Erreur imprévue : le détail va dans le journal du serveur, jamais dans la réponse.
      request.log.error({ err: error }, 'Erreur inattendue');
      body = { error: { code: 'INTERNAL', message: 'Une erreur inattendue est survenue. Réessayez.' } };
    }
    reply.status(ERROR_STATUS[body.error.code]).send(body);
  });

  // Adresse inconnue : même format, code NOT_FOUND.
  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Route inconnue.' } } satisfies ApiError);
  });
}
