import { buildApp } from './app.ts';
import { loadConfig } from './config.ts';
import { createDatabase, migrateToLatest } from './db/database.ts';

/**
 * DÉMARRAGE DU SERVEUR — MM-03.
 * Lancer : npm run dev:api  → http://localhost:3100/api/v1/health
 * Prérequis : la base Docker démarrée (npm run services:up).
 */
const config = loadConfig();
const db = createDatabase(config.DATABASE_URL);

// Avant d'accepter la moindre requête, la base est mise au bon niveau :
// les migrations manquantes sont appliquées automatiquement.
await migrateToLatest(db);

const app = await buildApp({ db, config, logger: true });

// 127.0.0.1 : le serveur n'est joignable que depuis cet ordinateur.
await app.listen({ port: config.API_PORT, host: '127.0.0.1' });

// Arrêt propre (Ctrl + C) : on termine les requêtes en cours, puis on ferme les connexions à la base.
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, async () => {
    await app.close();
    await db.destroy();
    process.exit(0);
  });
}
