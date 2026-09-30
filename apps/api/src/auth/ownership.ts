import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.ts';
import { notFound } from '../http/errors.ts';

/**
 * CONTRÔLE DU PROPRIÉTAIRE — MM-03, sous-tâche 3 (adapté de « reference »).
 *
 * Chaque recherche d'un menu, d'une catégorie ou d'un plat
 * remonte jusqu'au compte propriétaire et filtre sur le compte connecté.
 * Si l'élément appartient à quelqu'un d'autre, on répond « introuvable »
 * (404) : on ne révèle même pas qu'il existe.
 *
 * Les futures routes devront appeler ces fonctions AVANT de lire ou modifier
 * les données. ownerId viendra de la session vérifiée (MM-05), jamais d'un
 * identifiant de compte choisi par le navigateur. Ces fonctions ne connectent
 * personne : elles vérifient les droits d'un compte déjà identifié.
 * Les identifiants reçus dans les URL seront validés avec Zod par les routes.
 */

export async function ownedMenuId(db: Kysely<Database>, ownerId: string, menuId: string): Promise<string> {
  // Les DEUX conditions doivent correspondre : connaître l'identifiant ne suffit pas.
  const row = await db
    .selectFrom('menus')
    .select('id')
    .where('id', '=', menuId)
    .where('owner_id', '=', ownerId)
    .executeTakeFirst();
  // Même erreur pour un élément absent ou étranger : aucune existence révélée.
  if (!row) throw notFound();
  return row.id;
}

export async function ownedCategory(
  db: Kysely<Database>,
  ownerId: string,
  categoryId: string,
): Promise<{ id: string; menuId: string }> {
  // Une jointure relie deux tables : la catégorie retrouve son propriétaire via son menu.
  const row = await db
    .selectFrom('categories')
    .innerJoin('menus', 'menus.id', 'categories.menu_id')
    .select(['categories.id', 'categories.menu_id as menuId'])
    .where('categories.id', '=', categoryId)
    .where('menus.owner_id', '=', ownerId)
    .executeTakeFirst();
  if (!row) throw notFound();
  return row;
}

export async function ownedDish(
  db: Kysely<Database>,
  ownerId: string,
  dishId: string,
): Promise<{ id: string; categoryId: string; menuId: string }> {
  // Un plat remonte deux liens : plat → catégorie → menu → compte propriétaire.
  const row = await db
    .selectFrom('dishes')
    .innerJoin('categories', 'categories.id', 'dishes.category_id')
    .innerJoin('menus', 'menus.id', 'categories.menu_id')
    .select(['dishes.id', 'dishes.category_id as categoryId', 'categories.menu_id as menuId'])
    .where('dishes.id', '=', dishId)
    .where('menus.owner_id', '=', ownerId)
    .executeTakeFirst();
  if (!row) throw notFound();
  return row;
}
