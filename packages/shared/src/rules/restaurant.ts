import { z } from 'zod';
import { idSchema, requiredText } from './common.ts';
import { colorHexSchema, DEFAULT_THEME, fontKeySchema, layoutKeySchema } from './theme.ts';

/**
 * RÈGLES DU PROFIL DU RESTAURANT — MM-01 (utilisées par MM-17 et MM-24).
 * Le nom et le logo du restaurant, plus ses préférences de présentation,
 * recopiées dans chaque NOUVEAU menu.
 */

/** Nom du restaurant : obligatoire (demandé à la première visite), 80 caractères maximum. */
export const restaurantNameSchema = requiredText(
  80,
  'Le nom du restaurant est obligatoire.',
  'Le nom du restaurant ne peut pas dépasser 80 caractères.',
);

export const restaurantProfileSchema = z.object({
  name: restaurantNameSchema,
  logoAssetId: idSchema.nullable().default(null), // logo facultatif
  defaultFontKey: fontKeySchema.default(DEFAULT_THEME.fontKey),
  defaultColor: colorHexSchema.default(DEFAULT_THEME.color),
  defaultLayoutKey: layoutKeySchema.default(DEFAULT_THEME.layoutKey),
});
