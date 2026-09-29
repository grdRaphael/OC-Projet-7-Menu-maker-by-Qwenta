import { buildApp } from './app.ts';
import { loadConfig } from './config.ts';

/**
 * DÉMARRAGE DU SERVEUR — MM-03, sous-tâche 1.
 * Lancer : npm run dev:api  → http://localhost:3100/api/v1/health
 */
const config = loadConfig();
const app = await buildApp({ config, logger: true });

// 127.0.0.1 : le serveur n'est joignable que depuis cet ordinateur.
await app.listen({ port: config.API_PORT, host: '127.0.0.1' });

// Arrêt propre (Ctrl + C) : on termine les requêtes en cours avant de quitter.
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, async () => {
    await app.close();
    process.exit(0);
  });
}
