import type { FastifyInstance } from 'fastify';
import { sql } from 'kysely';

/**
 * ROUTES DE FONDATION — MM-03.
 *
 * GET /api/v1/health : « le serveur ET la base sont-ils en vie ? ».
 * Le serveur envoie à PostgreSQL la plus petite requête possible (select 1).
 * Si la base ne répond pas, l'erreur remonte et la réponse devient une
 * erreur 500 au format du contrat : on voit tout de suite que la base manque.
 */
export async function systemRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => {
    await sql`select 1`.execute(app.db);
    return { status: 'ok', database: 'ok' } as const;
  });
}
