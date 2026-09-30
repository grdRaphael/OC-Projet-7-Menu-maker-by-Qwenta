import { sql, type Kysely } from 'kysely';

/**
 * MIGRATION 0001 — les 5 tables du modèle de données (MM-03, sous-tâche 2).
 *
 * Une MIGRATION est une étape numérotée qui fait évoluer la base de données.
 * Chacune n'est appliquée qu'une fois ; la base se souvient de celles déjà
 * jouées (table technique « kysely_migration »). Sur une base vide, on rejoue
 * toutes les étapes dans l'ordre et on obtient exactement les mêmes tables.
 *
 * D'autres tables arriveront par de NOUVELLES migrations, sans modifier
 * celle-ci : connexion (sessions, liens e-mail) avec MM-04/MM-05, images et
 * logos avec MM-13.
 *
 *   users ──┬── restaurant_profiles (un profil par compte)
 *           └── menus ── categories ── dishes
 *
 * Mots utiles :
 *   - PRIMARY KEY : l'identifiant unique de chaque ligne ;
 *   - REFERENCES  : lien vers une ligne d'une autre table (« clé étrangère ») ;
 *   - ON DELETE CASCADE : supprimer le « parent » supprime aussi ses « enfants »
 *     (supprimer un menu supprime ses catégories, donc leurs plats) ;
 *   - CHECK : une règle vérifiée par la base elle-même, dernier filet de sécurité
 *     si le serveur oubliait de vérifier.
 */
export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    -- Comptes des restaurateurs. L'e-mail est unique : un compte par adresse.
    CREATE TABLE users (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email       text NOT NULL UNIQUE,
      created_at  timestamptz NOT NULL DEFAULT now()
    );

    -- Profil du restaurant : un seul par compte (la clé EST l'identifiant du compte).
    -- name reste vide (NULL) jusqu'à la première visite. Les préférences sont
    -- recopiées dans chaque NOUVEAU menu.
    CREATE TABLE restaurant_profiles (
      user_id             uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
      name                text,
      default_font_key    text NOT NULL,
      default_color       text NOT NULL,
      default_layout_key  text NOT NULL,
      updated_at          timestamptz NOT NULL DEFAULT now()
    );

    -- Menus. owner_id = le compte propriétaire (base du contrôle d'accès, sous-tâche 3).
    -- Chaque menu garde SA copie du thème (police, couleur, mise en page).
    CREATE TABLE menus (
      id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      name        text NOT NULL DEFAULT '',
      status      text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready')),
      font_key    text NOT NULL,
      color       text NOT NULL,
      layout_key  text NOT NULL,
      created_at  timestamptz NOT NULL DEFAULT now(),
      updated_at  timestamptz NOT NULL DEFAULT now()
    );
    -- Index : retrouve vite « les menus de ce compte, du plus récent au plus ancien ».
    CREATE INDEX menus_owner_idx ON menus (owner_id, created_at DESC);

    -- Catégories d'un menu. position (0, 1, 2…) donne l'ordre d'affichage.
    -- Deux catégories d'un même menu ne peuvent pas avoir la même position ;
    -- DEFERRABLE : la règle est vérifiée en fin d'opération, ce qui permet
    -- d'échanger deux positions (réorganisation, MM-14) sans conflit passager.
    CREATE TABLE categories (
      id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      menu_id   uuid NOT NULL REFERENCES menus (id) ON DELETE CASCADE,
      name      text NOT NULL,
      position  integer NOT NULL CHECK (position >= 0),
      CONSTRAINT categories_menu_position_key UNIQUE (menu_id, position) DEFERRABLE INITIALLY DEFERRED
    );

    -- Plats d'une catégorie. Prix en CENTIMES entiers, strictement positif (règle MM-01).
    CREATE TABLE dishes (
      id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      category_id  uuid NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
      name         text NOT NULL,
      description  text NOT NULL DEFAULT '',
      price_cents  integer NOT NULL CHECK (price_cents > 0),
      position     integer NOT NULL CHECK (position >= 0),
      CONSTRAINT dishes_category_position_key UNIQUE (category_id, position) DEFERRABLE INITIALLY DEFERRED
    );
  `.execute(db);
}

/** Retour en arrière : supprime ces tables (du plus « enfant » au plus « parent »). */
export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP TABLE dishes, categories, menus, restaurant_profiles, users;`.execute(db);
}
