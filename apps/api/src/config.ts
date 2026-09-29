import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

/**
 * CONFIGURATION DU SERVEUR — MM-03, sous-tâche 1 (repris de « reference », réduit).
 *
 * Les réglages viennent des « variables d'environnement » : des valeurs
 * données au programme au démarrage, en dehors du code. C'est là que vivront
 * plus tard les mots de passe (base de données, e-mail) : jamais dans le code,
 * jamais dans Git, jamais envoyés au navigateur.
 *
 * En développement, un fichier apps/api/.env (facultatif, ignoré par Git) peut
 * les fournir. Sans lui, des valeurs locales par défaut s'appliquent.
 * D'autres réglages s'ajouteront avec les sous-tâches suivantes (base, e-mail…).
 */

const envFile = fileURLToPath(new URL('../.env', import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);

const configSchema = z.object({
  /** development (sur ta machine), test (tests automatiques) ou production (en ligne). */
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  /** Port du serveur : 3100, différent de l'ancienne version (3000). */
  API_PORT: z.coerce.number().int().default(3100),
});

export type Config = z.infer<typeof configSchema>;

/** Lit et vérifie la configuration ; s'arrête avec un message clair si une valeur est invalide. */
export function loadConfig(overrides: Record<string, string> = {}): Config {
  const result = configSchema.safeParse({ ...process.env, ...overrides });
  if (!result.success) {
    // On affiche le NOM des variables en cause, jamais leur valeur (elle pourrait être secrète).
    const names = result.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(`Configuration invalide : ${names}`);
  }
  return result.data;
}
