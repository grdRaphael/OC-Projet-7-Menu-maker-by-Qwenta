import Fastify, { type FastifyInstance } from 'fastify';
import type { Kysely } from 'kysely';
import type { Config } from './config.ts';
import type { Database } from './db/schema.ts';
import { registerErrorHandler } from './http/errors.ts';
import { systemRoutes } from './routes/system.ts';

// On déclare à TypeScript que chaque application Fastify porte la base (app.db)
// et la configuration (app.config), accessibles depuis toutes les routes.
declare module 'fastify' {
  interface FastifyInstance {
    db: Kysely<Database>;
    config: Config;
  }
}

/**
 * ASSEMBLAGE DE L'APPLICATION FASTIFY — MM-03.
 *
 * Fastify reçoit les requêtes HTTP (GET /api/v1/…), appelle la bonne
 * fonction et renvoie sa réponse en JSON.
 *
 * Cette fonction CONSTRUIT l'application sans la démarrer, en recevant la
 * base et la configuration de l'extérieur : les tests pourront lui donner
 * la base de test au lieu de la base de développement.
 * Le démarrage réel est dans server.ts.
 */
export async function buildApp(deps: {
  db: Kysely<Database>;
  config: Config;
  logger?: boolean;
}): Promise<FastifyInstance> {
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

  // « decorate » accroche la base et la configuration à l'application.
  app.decorate('db', deps.db);
  app.decorate('config', deps.config);

  registerErrorHandler(app);

  // Toutes les routes vivent sous /api/v1 (« v1 » = version 1 de l'API).
  await app.register(systemRoutes, { prefix: '/api/v1' });

  return app;
}
