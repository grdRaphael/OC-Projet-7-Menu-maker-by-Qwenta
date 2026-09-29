import { z } from 'zod';

/**
 * RÈGLES DE LA CONNEXION — MM-01 (utilisées par MM-04, MM-05, MM-06).
 * Aucun mot de passe : on se connecte avec un lien reçu par e-mail.
 */

/**
 * Adresse e-mail.
 * - espaces retirés et lettres mises en minuscules : « Chef@Resto.FR » et
 *   « chef@resto.fr » désignent le même compte (« e-mail unique normalisé ») ;
 * - 254 caractères au maximum (limite des adresses e-mail) ;
 * - format vérifié : quelque chose@domaine.extension.
 */
export const emailSchema = z
  .string({ error: "L'adresse e-mail est obligatoire." })
  .trim()
  .toLowerCase()
  .min(1, "L'adresse e-mail est obligatoire.")
  .max(254, "L'adresse e-mail est trop longue.")
  .pipe(z.email('Saisissez une adresse e-mail valide, par exemple nom@restaurant.fr.'));

/**
 * Jeton contenu dans le lien de connexion : 32 octets aléatoires écrits en
 * « base64url » (lettres, chiffres, « - » et « _ »), soit 43 caractères.
 * Un lien tronqué (copié à moitié) est refusé tout de suite.
 */
export const loginTokenSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{43}$/, 'Ce lien de connexion est incomplet ou invalide.');
