import { z } from 'zod';

/**
 * RÈGLE DU PRIX — carte MM-01 (utilisée plus tard par MM-11 et MM-12).
 *
 * Le restaurateur saisit des euros : « 12,50 ».
 * On enregistre des CENTIMES entiers : 1250.
 *
 * Pourquoi des centimes ? En JavaScript, 0.1 + 0.2 donne 0.30000000000000004 :
 * les nombres à virgule sont parfois arrondis. Un nombre entier, lui, est
 * toujours exact. On ne passe donc jamais par un nombre à virgule.
 */

/** Prix maximal : 9 999,99 €. Hypothèse locale, à confirmer avec Qwenta. */
export const PRICE_MAX_CENTS = 999_999;

/**
 * Règle 1 — le prix ENREGISTRÉ (en centimes).
 * Nombre entier, strictement supérieur à zéro (« prix positif »), plafonné.
 */
export const priceCentsSchema = z
  .number({ error: 'Le prix est obligatoire.' })
  .int('Le prix doit être un nombre entier de centimes.')
  .positive('Le prix doit être supérieur à 0 €.')
  .max(PRICE_MAX_CENTS, 'Le prix ne peut pas dépasser 9 999,99 €.');

/**
 * Forme acceptée pour une saisie en euros : 1 à 4 chiffres, puis
 * éventuellement une virgule (ou un point) et 1 ou 2 chiffres.
 * Exemples valides : « 12 », « 12,5 », « 12,50 », « 12.50 ».
 */
const EUROS_PATTERN = /^(\d{1,4})(?:[.,](\d{1,2}))?$/;

/**
 * Convertit une saisie en euros vers des centimes, en travaillant sur le
 * TEXTE (pas sur un nombre à virgule). Renvoie null si la saisie est illisible.
 * « 12,50 € » → 1250 ; « 12,5 » → 1250 ; « 8 » → 800.
 */
export function parseEurosToCents(input: string): number | null {
  const cleaned = input.replace(/[\s€]/g, ''); // retire les espaces et le symbole €
  const match = EUROS_PATTERN.exec(cleaned);
  if (!match) return null;
  const euros = Number(match[1]); // partie avant la virgule
  const cents = Number((match[2] ?? '').padEnd(2, '0')); // « 5 » → « 50 »
  return euros * 100 + cents;
}

/**
 * Règle 2 — le prix SAISI dans le formulaire (texte en euros).
 * Elle vérifie la saisie, la transforme en centimes, puis applique la règle 1.
 * Le même message d'erreur s'affichera dans l'interface et côté serveur.
 */
export const priceEurosInputSchema = z
  .string()
  .trim()
  .min(1, 'Le prix est obligatoire.')
  .refine((value) => !value.startsWith('-'), 'Le prix ne peut pas être négatif.')
  .transform((value, ctx) => {
    const cents = parseEurosToCents(value);
    if (cents === null) {
      ctx.addIssue({ code: 'custom', message: 'Saisissez un prix comme 12,50.' });
      return z.NEVER;
    }
    return cents;
  })
  .pipe(priceCentsSchema);

/** Pour l'affichage : 1250 → « 12,50 € ». */
export function formatCents(cents: number): string {
  const euros = Math.floor(cents / 100);
  const rest = String(cents % 100).padStart(2, '0');
  return `${euros},${rest} €`;
}
