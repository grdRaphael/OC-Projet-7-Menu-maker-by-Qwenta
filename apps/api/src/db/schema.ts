import type { ColumnType, Generated, Selectable } from 'kysely';

/**
 * DESCRIPTION TYPESCRIPT DES TABLES — MM-03, sous-tâche 2.
 *
 * Elle recopie, en TypeScript, les tables créées par les migrations.
 * Kysely s'en sert pour vérifier chaque requête : une faute de frappe dans un
 * nom de colonne (« prce_cents ») devient une erreur AVANT l'exécution.
 *
 * À mettre à jour à chaque nouvelle migration.
 *   - Generated<T> : valeur fournie par la base (identifiant, valeur par défaut) ;
 *   - ColumnType<lu, à la création, à la modification> : types différents selon l'opération.
 */

/** Date de création : fournie par la base, jamais modifiée ensuite. */
type CreatedAt = ColumnType<Date, Date | undefined, never>;
/** Date de mise à jour : fournie par la base à la création, modifiable ensuite. */
type UpdatedAt = ColumnType<Date, Date | undefined, Date>;

export interface UsersTable {
  id: Generated<string>;
  email: string;
  created_at: CreatedAt;
}

export interface RestaurantProfilesTable {
  user_id: string;
  name: string | null;
  default_font_key: string;
  default_color: string;
  default_layout_key: string;
  updated_at: UpdatedAt;
}

export interface MenusTable {
  id: Generated<string>;
  owner_id: string;
  name: Generated<string>;
  status: Generated<'draft' | 'ready'>;
  font_key: string;
  color: string;
  layout_key: string;
  created_at: CreatedAt;
  updated_at: UpdatedAt;
}

export interface CategoriesTable {
  id: Generated<string>;
  menu_id: string;
  name: string;
  position: number;
}

export interface DishesTable {
  id: Generated<string>;
  category_id: string;
  name: string;
  description: Generated<string>;
  price_cents: number;
  position: number;
}

/** La base entière : nom de table → description de ses colonnes. */
export interface Database {
  users: UsersTable;
  restaurant_profiles: RestaurantProfilesTable;
  menus: MenusTable;
  categories: CategoriesTable;
  dishes: DishesTable;
}

export type UserRow = Selectable<UsersTable>;
