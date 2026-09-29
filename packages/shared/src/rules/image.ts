/**
 * RÈGLES DES IMAGES (photos de plats, logo) — MM-01.
 * Utilisées par MM-11 (contrôle immédiat dans le navigateur) et MM-13
 * (contrôle réel côté serveur, qui lit le contenu du fichier).
 *
 * Pas de Zod ici : un fichier n'est pas une donnée texte ou nombre, on
 * vérifie simplement sa taille et son format annoncés.
 */

/** « 2 Mo » compris comme 2 × 1024 × 1024 octets (2 097 152 octets). */
export const DISH_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

/**
 * HYPOTHÈSE : les spécifications disent que la limite et les formats du logo
 * restent à confirmer. En attendant, on applique les mêmes règles qu'aux photos.
 */
export const LOGO_MAX_BYTES = DISH_PHOTO_MAX_BYTES;

/** Formats acceptés. Pas de GIF, ni de SVG (un SVG peut contenir du code). */
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type ImageMimeType = (typeof IMAGE_MIME_TYPES)[number];

/** Valeur pour <input type="file" accept="…"> : le sélecteur de fichiers ne propose que ces formats. */
export const IMAGE_ACCEPT_ATTRIBUTE = IMAGE_MIME_TYPES.join(',');

export type ImageCheck = { ok: true } | { ok: false; message: string };

/**
 * Contrôle rapide d'un fichier choisi, à partir de ce que le navigateur annonce
 * (sa taille et son type). ATTENTION : un fichier peut mentir sur son type ;
 * le serveur revérifiera toujours le vrai contenu (MM-13).
 */
export function checkImageFile(file: { size: number; type: string }, maxBytes = DISH_PHOTO_MAX_BYTES): ImageCheck {
  if (!IMAGE_MIME_TYPES.includes(file.type as ImageMimeType)) {
    return { ok: false, message: 'Format non accepté : choisissez une image JPEG, PNG ou WebP.' };
  }
  if (file.size > maxBytes) {
    return { ok: false, message: `Image trop lourde : ${formatBytes(maxBytes)} maximum.` };
  }
  return { ok: true };
}

/** Taille lisible : 2 097 152 → « 2 Mo » ; 350 000 → « 342 Ko ». */
export function formatBytes(bytes: number): string {
  const mo = bytes / (1024 * 1024);
  if (mo >= 1) return `${Number.isInteger(mo) ? mo : mo.toFixed(1).replace('.', ',')} Mo`;
  return `${Math.ceil(bytes / 1024)} Ko`;
}
