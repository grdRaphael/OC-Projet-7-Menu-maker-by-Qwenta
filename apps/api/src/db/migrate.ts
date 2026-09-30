import { loadConfig } from '../config.ts';
import { createDatabase, migrateToLatest } from './database.ts';

/**
 * METTRE LA BASE À JOUR — MM-03, sous-tâche 2.
 * Lancer : npm run db:migrate
 * Applique les migrations manquantes, puis ferme la connexion.
 */
const config = loadConfig();
const db = createDatabase(config.DATABASE_URL);
try {
  const applied = await migrateToLatest(db);
  console.log(applied.length > 0 ? `Migrations appliquées : ${applied.join(', ')}` : 'Base déjà à jour.');
} finally {
  await db.destroy();
}
