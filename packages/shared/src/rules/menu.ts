import { z } from 'zod';
import { idSchema, plainText, requiredText } from './common.ts';
import { priceCentsSchema, priceEurosInputSchema } from './price.ts';
import { colorHexSchema, fontKeySchema, layoutKeySchema } from './theme.ts';

/**
 * RÈGLES DU MENU, DES CATÉGORIES ET DES PLATS — MM-01.
 * Utilisées par MM-07 à MM-12.
 *
 *   Menu ──┬── Catégorie « Entrées » ──┬── Plat « Tzatziki »
 *          │                           └── Plat « Feta rôtie »
 *          └── Catégorie « Desserts » ──── Plat « Baklava »
 *
 * L'ordre des catégories et des plats est un numéro de « position » (0, 1, 2…).
 */

/** Position dans une liste : entier, à partir de 0. */
export const positionSchema = z.int('La position doit être un nombre entier.').min(0);

// ---------- Plat ----------

/** Nom du plat : obligatoire, 80 caractères maximum. */
export const dishNameSchema = requiredText(
  80,
  'Le nom du plat est obligatoire.',
  'Le nom du plat ne peut pas dépasser 80 caractères.',
);

/** Description : facultative, 300 caractères maximum, texte simple. */
export const dishDescriptionSchema = plainText(300, 'La description ne peut pas dépasser 300 caractères.');

/**
 * Un plat tel qu'il est ENREGISTRÉ : prix en centimes (règle 1 du prix),
 * photo facultative désignée par l'identifiant de l'image (null = pas de photo).
 * `.default(…)` remplit les champs facultatifs absents.
 */
export const dishSchema = z.object({
  name: dishNameSchema,
  description: dishDescriptionSchema.default(''),
  priceCents: priceCentsSchema,
  photoAssetId: idSchema.nullable().default(null),
});
export type DishInput = z.input<typeof dishSchema>;
export type DishData = z.output<typeof dishSchema>;

/**
 * Un plat tel qu'il est SAISI dans le formulaire (MM-11) : le prix est un
 * texte en euros (règle 2 du prix), transformé en centimes à la validation.
 * C'est l'exemple type d'une règle qui en réutilise d'autres.
 */
export const dishFormSchema = z.object({
  name: dishNameSchema,
  description: dishDescriptionSchema,
  price: priceEurosInputSchema,
});

// ---------- Catégorie ----------

/**
 * Nom de catégorie : texte libre saisi au clavier, 60 caractères maximum,
 * renommage autorisé (ce qui tranche la question Q1, comme décrit dans MM-09).
 */
export const categoryNameSchema = requiredText(
  60,
  'Le nom de la catégorie est obligatoire.',
  'Le nom de la catégorie ne peut pas dépasser 60 caractères.',
);

export const categorySchema = z.object({ name: categoryNameSchema });

// ---------- Menu ----------

/** Statut : « brouillon » (incomplet autorisé) ou « prêt » (exportable en PDF). */
export const MENU_STATUSES = ['draft', 'ready'] as const;
export const menuStatusSchema = z.enum(MENU_STATUSES, { error: 'Statut inconnu.' });
export type MenuStatus = z.infer<typeof menuStatusSchema>;

export const MENU_STATUS_LABELS: Record<MenuStatus, string> = { draft: 'Brouillon', ready: 'Prêt' };

/**
 * Nom du menu : FACULTATIF (80 caractères maximum). S'il est vide, l'interface
 * affichera la date de création. Proposition des spécifications, à confirmer.
 */
export const menuNameSchema = plainText(80, 'Le nom du menu ne peut pas dépasser 80 caractères.');

/** Un menu : son nom, son statut et SON thème (copié du restaurant à la création). */
export const menuSchema = z.object({
  name: menuNameSchema.default(''),
  status: menuStatusSchema.default('draft'),
  fontKey: fontKeySchema,
  color: colorHexSchema,
  layoutKey: layoutKeySchema,
  logoAssetId: idSchema.nullable().default(null),
});

// ---------- Règle « prêt » ----------

type MenuContent = { categories: { name: string; dishes: unknown[] }[] };

/**
 * Un brouillon peut être incomplet. Pour passer en « prêt » (exportable),
 * le menu doit avoir au moins une catégorie, et aucune catégorie vide.
 * Renvoie la liste des problèmes à corriger (liste vide = le menu est prêt).
 */
export function menuReadinessProblems(menu: MenuContent): string[] {
  const problems: string[] = [];
  if (menu.categories.length === 0) problems.push('Ajoutez au moins une catégorie.');
  for (const category of menu.categories) {
    if (category.dishes.length === 0) problems.push(`La catégorie « ${category.name} » ne contient aucun plat.`);
  }
  return problems;
}
