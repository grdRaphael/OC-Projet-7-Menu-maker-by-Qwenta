import Fastify, { type FastifyInstance } from 'fastify';
import type { Config } from './config.ts';
import { registerErrorHandler } from './http/errors.ts';
import { systemRoutes } from './routes/system.ts';

/**
 * ASSEMBLAGE DE L'APPLICATION FASTIFY — MM-03, sous-tâche 1.
 *
 * Fastify reçoit les requêtes HTTP (GET /api/v1/…), appelle la bonne
 * fonction et renvoie sa réponse en JSON.
 *
 * Cette fonction CONSTRUIT l'application sans la démarrer : les futurs tests
 * pourront créer une application complète sans ouvrir de port réseau.
 * Le démarrage réel est dans server.ts.
 */
export async function buildApp(deps: { config: Config; logger?: boolean }): Promise<FastifyInstance> {
  const app = Fastify({
    // Journal (log) : une ligne par requête, avec son statut et sa durée.
    logger: deps.logger
      ? {
          level: 'info',
          // Aucun secret dans les journaux : cookies et autorisations sont masqués.
          redact: ['req.headers.cookie', 'req.headers.authorization', 'res.headers["set-cookie"]'],
        }
      : false,
  });

  registerErrorHandler(app);

  // Toutes les routes vivent sous /api/v1 (« v1 » = version 1 de l'API).
  await app.register(systemRoutes, { prefix: '/api/v1' });

  return app;
}
