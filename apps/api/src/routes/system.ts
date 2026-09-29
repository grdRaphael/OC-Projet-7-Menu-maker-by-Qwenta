import type { FastifyInstance } from 'fastify';

/**
 * ROUTES DE FONDATION — MM-03, sous-tâche 1.
 *
 * GET /api/v1/health : « le serveur est-il en vie ? ».
 * Pour l'instant il répond seulement pour lui-même. À la sous-tâche 2, il
 * vérifiera aussi la base de données et répondra { status, database },
 * comme prévu dans le contrat.
 */
export async function systemRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async () => ({ status: 'ok' as const }));
}
