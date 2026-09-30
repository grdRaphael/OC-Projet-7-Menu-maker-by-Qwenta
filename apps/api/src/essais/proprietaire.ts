import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { buildApp } from '../app.ts';
import { ownedCategory, ownedDish, ownedMenuId } from '../auth/ownership.ts';
import { loadConfig } from '../config.ts';
import { createDatabase, migrateToLatest } from '../db/database.ts';

/**
 * ESSAI DU CONTRÔLE DU PROPRIÉTAIRE — MM-03, sous-tâche 3.
 * Depuis la racine : npm run essai:proprietaire (PostgreSQL doit être démarré).
 * Vraie base de test, comptes fictifs ; aucune connexion par e-mail simulée.
 * Les routes ci-dessous existent seulement dans cet essai, sans port réseau.
 * Fastify.inject traverse Fastify et son vrai gestionnaire d'erreurs.
 */
const config = loadConfig();
const target = new URL(config.TEST_DATABASE_URL);
// Refuser une base autre que celle réservée aux essais, avant toute migration.
assert.equal(target.pathname, '/menumaker_test', 'Utilisez la base menumaker_test.');
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname), 'Base locale uniquement.');
assert.notEqual(config.NODE_ENV, 'production', 'Essai interdit en production.');
const db = createDatabase(config.TEST_DATABASE_URL);
const rollback = new Error('Annulation volontaire des seules données de cet essai');

try {
  await migrateToLatest(db);
  try {
    // Une transaction groupe les écritures. L'erreur finale les annule toutes,
    // même si une vérification échoue : aucun compte d'essai ne reste en base.
    await db.transaction().execute(async (trx) => {
      const fixtures: Array<{ label: string; userId: string; menuId: string; categoryId: string; dishId: string }> = [];
      for (const label of ['Alice', 'Bob']) {
        const user = await trx.insertInto('users')
          .values({ email: `${label.toLowerCase()}-${randomUUID()}@example.test` })
          .returning('id').executeTakeFirstOrThrow();
        const menu = await trx.insertInto('menus').values({
          owner_id: user.id, name: `Menu de ${label}`, font_key: 'epilogue',
          color: '#000000', layout_key: 'one-column',
        }).returning('id').executeTakeFirstOrThrow();
        const category = await trx.insertInto('categories')
          .values({ menu_id: menu.id, name: 'Plats', position: 0 })
          .returning('id').executeTakeFirstOrThrow();
        const dish = await trx.insertInto('dishes')
          .values({ category_id: category.id, name: 'Plat de démonstration', price_cents: 1250, position: 0 })
          .returning('id').executeTakeFirstOrThrow();
        fixtures.push({ label, userId: user.id, menuId: menu.id, categoryId: category.id, dishId: dish.id });
      }

      for (const owner of fixtures) {
        // Identité fixée par l'essai côté serveur : ce n'est PAS une vraie session.
        const app = await buildApp({ db: trx, config });
        const checks = [
          { kind: 'menu', id: owner.menuId, run: (id: string) => ownedMenuId(trx, owner.userId, id), expected: owner.menuId },
          { kind: 'catégorie', id: owner.categoryId, run: (id: string) => ownedCategory(trx, owner.userId, id), expected: { id: owner.categoryId, menuId: owner.menuId } },
          { kind: 'plat', id: owner.dishId, run: (id: string) => ownedDish(trx, owner.userId, id), expected: { id: owner.dishId, categoryId: owner.categoryId, menuId: owner.menuId } },
        ];
        try {
          for (const [index, check] of checks.entries()) {
            app.get<{ Params: { id: string } }>(`/essai/${index}/:id`, async (request) => ({
              data: await check.run(request.params.id),
            }));
          }
          for (const [index, check] of checks.entries()) {
            const own = await app.inject({ method: 'GET', url: `/essai/${index}/${check.id}` });
            assert.equal(own.statusCode, 200);
            assert.deepEqual(own.json(), { data: check.expected });
            const other = fixtures.find((fixture) => fixture.userId !== owner.userId)!;
            const foreignId = [other.menuId, other.categoryId, other.dishId][index]!;
            for (const id of [foreignId, randomUUID()]) {
              const refused = await app.inject({ method: 'GET', url: `/essai/${index}/${id}` });
              assert.equal(refused.statusCode, 404);
              assert.deepEqual(refused.json(), {
                error: { code: 'NOT_FOUND', message: 'Élément introuvable.' },
              });
            }
            console.log(`✓ ${owner.label} / ${check.kind} : propre = 200 ; autre compte et absent = 404 identiques`);
          }
        } finally {
          await app.close();
        }
      }
      throw rollback;
    });
  } catch (error) {
    // Ne pas masquer une assertion ratée ou une panne de PostgreSQL.
    if (error !== rollback) throw error;
  }
  console.log('18 demandes vérifiées. Données fictives annulées. Sessions et routes métier à venir.');
} finally {
  await db.destroy();
}
