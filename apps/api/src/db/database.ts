import { Kysely, PostgresDialect } from 'kysely';
import { Migrator, type Migration, type MigrationProvider } from 'kysely/migration';
import pg from 'pg';
import * as m0001 from './migrations/0001_tables_de_base.ts';
import type { Database } from './schema.ts';

/**
 * CONNEXION À POSTGRESQL — MM-03, sous-tâche 2.
 *
 * Un « pool » garde quelques connexions ouvertes vers la base et les prête
 * aux requêtes qui arrivent : on évite de se reconnecter à chaque demande.
 * Kysely construit les requêtes SQL ; le pilote « pg » les envoie à PostgreSQL.
 */
export function createDatabase(connectionString: string): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString, max: 10 }) }),
  });
}

/**
 * Liste des migrations, DANS L'ORDRE. Chaque nouvelle étape s'ajoute à la fin.
 * (Liste écrite à la main plutôt que lue dans un dossier : plus simple à suivre.)
 */
const migrations: Record<string, Migration> = {
  '0001_tables_de_base': m0001,
};

const provider: MigrationProvider = { getMigrations: async () => migrations };

/** Applique les migrations pas encore jouées sur cette base ; renvoie leurs noms. */
export async function migrateToLatest(db: Kysely<Database>): Promise<string[]> {
  const migrator = new Migrator({ db, provider });
  const { error, results } = await migrator.migrateToLatest();
  if (error) throw error;
  return (results ?? []).filter((r) => r.status === 'Success').map((r) => r.migrationName);
}
