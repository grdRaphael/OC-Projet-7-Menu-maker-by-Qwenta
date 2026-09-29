import { z } from 'zod';
import { idSchema } from './common.ts';
import { menuStatusSchema } from './menu.ts';
import { fontKeySchema, layoutKeySchema } from './theme.ts';

/**
 * FORME DES DONNÉES RENVOYÉES PAR L'API — MM-01, sous-tâche 2.
 *
 * Les règles de la sous-tâche 1 décrivent ce qu'on ENVOIE au serveur.
 * Ici, on décrit ce que le serveur RENVOIE : les mêmes données, plus ce que
 * le serveur ajoute lui-même (identifiant, dates, position, adresse de l'image…).
 * L'interface et le serveur partagent ces types : si une réponse change,
 * TypeScript signale immédiatement les écrans à adapter.
 */

/** Date au format standard ISO 8601, par exemple « 2026-09-29T14:30:00.000Z ». */
const isoDate = z.iso.datetime({ offset: true });

/** Le compte connecté. */
export const userSchema = z.object({
  id: idSchema,
  email: z.email(),
  createdAt: isoDate,
});
export type User = z.infer<typeof userSchema>;

/**
 * Une image déjà enregistrée. Son adresse passe par le serveur
 * (/api/v1/assets/…/content), qui vérifie à chaque fois le propriétaire.
 */
export const assetRefSchema = z.object({
  id: idSchema,
  url: z.string(),
  mimeType: z.string(),
  width: z.int(),
  height: z.int(),
});
export type AssetRef = z.infer<typeof assetRefSchema>;

/** Le profil du restaurant. `name` vaut null tant que la première visite n'est pas faite. */
export const restaurantProfileResponseSchema = z.object({
  name: z.string().nullable(),
  logo: assetRefSchema.nullable(),
  defaultFontKey: fontKeySchema,
  defaultColor: z.string(),
  defaultLayoutKey: layoutKeySchema,
  updatedAt: isoDate,
});
export type RestaurantProfile = z.infer<typeof restaurantProfileResponseSchema>;

/** « Qui suis-je ? » : le compte et son restaurant, en une seule réponse. */
export const meSchema = z.object({
  user: userSchema,
  profile: restaurantProfileResponseSchema,
});
export type Me = z.infer<typeof meSchema>;

/** Un plat renvoyé : prix en centimes, position dans sa catégorie, photo éventuelle. */
export const dishResponseSchema = z.object({
  id: idSchema,
  categoryId: idSchema,
  name: z.string(),
  description: z.string(),
  priceCents: z.int(),
  position: z.int(),
  photo: assetRefSchema.nullable(),
});
export type Dish = z.infer<typeof dishResponseSchema>;

/** Une catégorie renvoyée, avec ses plats DANS L'ORDRE. */
export const categoryResponseSchema = z.object({
  id: idSchema,
  menuId: idSchema,
  name: z.string(),
  position: z.int(),
  dishes: z.array(dishResponseSchema),
});
export type Category = z.infer<typeof categoryResponseSchema>;

/** Un menu complet : son thème propre, ses catégories et plats dans l'ordre. */
export const menuResponseSchema = z.object({
  id: idSchema,
  name: z.string(),
  status: menuStatusSchema,
  fontKey: fontKeySchema,
  color: z.string(),
  layoutKey: layoutKeySchema,
  logo: assetRefSchema.nullable(),
  createdAt: isoDate,
  updatedAt: isoDate,
  categories: z.array(categoryResponseSchema),
});
export type Menu = z.infer<typeof menuResponseSchema>;

/** Un article du blog Qwenta (tableau de bord, MM-24). */
export const blogArticleSchema = z.object({
  title: z.string(),
  url: z.string(),
  publishedAt: isoDate,
  excerpt: z.string(),
});
export type BlogArticle = z.infer<typeof blogArticleSchema>;

/** État de la connexion Instagram (MM-25) — jamais le jeton lui-même. */
export const instagramStatusSchema = z.object({
  connected: z.boolean(),
  username: z.string().nullable(),
});

/** Réponse simple avec un message à afficher. */
export const messageSchema = z.object({ message: z.string() });

/** Santé du serveur : il répond, et la base de données aussi. */
export const healthSchema = z.object({ status: z.literal('ok'), database: z.literal('ok') });
