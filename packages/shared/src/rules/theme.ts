import { z } from 'zod';

/**
 * RÈGLES DU THÈME D'UN MENU (police, couleur, mise en page) — MM-01.
 * Utilisées par MM-15, MM-16 et MM-17.
 *
 * Rappel métier : chaque menu garde SA copie du thème. Changer les
 * préférences du restaurant ne modifie pas les menus déjà créés.
 */

/**
 * Polices proposées. On enregistre une « clé » courte (« epilogue »), pas
 * le nom d'affichage : le nom peut changer sans casser les menus existants.
 * HYPOTHÈSE : liste à confirmer dans Figma (écran « Créer un menu_font »),
 * inaccessible au moment de l'écriture.
 */
export const FONT_KEYS = ['epilogue', 'work-sans', 'georgia'] as const;
export const fontKeySchema = z.enum(FONT_KEYS, { error: 'Police non proposée.' });
export type FontKey = z.infer<typeof fontKeySchema>;

/** Noms affichés dans l'interface pour chaque clé de police. */
export const FONT_LABELS: Record<FontKey, string> = {
  epilogue: 'Epilogue',
  'work-sans': 'Work Sans',
  georgia: 'Georgia (classique)',
};

/** Mises en page : « une colonne ou deux colonnes » (MM-16). */
export const LAYOUT_KEYS = ['une-colonne', 'deux-colonnes'] as const;
export const layoutKeySchema = z.enum(LAYOUT_KEYS, { error: 'Mise en page non proposée.' });
export type LayoutKey = z.infer<typeof layoutKeySchema>;

export const LAYOUT_LABELS: Record<LayoutKey, string> = {
  'une-colonne': 'Une colonne',
  'deux-colonnes': 'Deux colonnes',
};

/**
 * Couleur au format #RRGGBB (ex. « #1F3A5F »), enregistrée en majuscules
 * pour que « #1f3a5f » et « #1F3A5F » soient considérées comme identiques.
 */
export const colorHexSchema = z
  .string({ error: 'La couleur est obligatoire.' })
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Choisissez une couleur au format #RRGGBB.')
  .transform((value) => value.toUpperCase());

/** Un thème complet : les trois choix ensemble. */
export const menuThemeSchema = z.object({
  fontKey: fontKeySchema,
  color: colorHexSchema,
  layoutKey: layoutKeySchema,
});
export type MenuTheme = z.infer<typeof menuThemeSchema>;

/** Thème appliqué tant que le restaurateur n'a rien choisi. */
export const DEFAULT_THEME: MenuTheme = { fontKey: 'epilogue', color: '#000000', layoutKey: 'une-colonne' };

// ---------- Contraste (accessibilité) ----------

/** Le menu s'imprime sur une feuille blanche : le contraste se mesure contre le blanc. */
export const MENU_SHEET_BACKGROUND = '#FFFFFF';

/** Seuil WCAG 2.2 niveau AA pour du texte courant : 4,5 pour 1. */
export const MIN_TEXT_CONTRAST = 4.5;

/** Luminosité perçue d'une composante (rouge, vert ou bleu), selon la formule WCAG. */
function channelLuminance(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Luminosité perçue d'une couleur #RRGGBB, de 0 (noir) à 1 (blanc). */
function relativeLuminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  return (
    0.2126 * channelLuminance((n >> 16) & 0xff) + // rouge
    0.7152 * channelLuminance((n >> 8) & 0xff) + //  vert (l'œil y est le plus sensible)
    0.0722 * channelLuminance(n & 0xff) //           bleu
  );
}

/**
 * Rapport de contraste entre deux couleurs, de 1 (identiques) à 21 (noir sur blanc).
 * MM-16 : avertir le restaurateur si la couleur choisie est trop pâle pour être lue.
 */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}
