import { z } from 'zod';
import { emailSchema, loginTokenSchema } from '../rules/auth.ts';
import { idSchema } from '../rules/common.ts';
import type { ErrorCode } from '../rules/errors.ts';
import {
  categorySchema,
  dishDescriptionSchema,
  dishNameSchema,
  dishSchema,
  menuNameSchema,
  menuStatusSchema,
  positionSchema,
} from '../rules/menu.ts';
import { priceCentsSchema } from '../rules/price.ts';
import { restaurantNameSchema } from '../rules/restaurant.ts';
import {
  assetRefSchema,
  blogArticleSchema,
  categoryResponseSchema,
  dishResponseSchema,
  healthSchema,
  instagramStatusSchema,
  meSchema,
  menuResponseSchema,
  messageSchema,
  restaurantProfileResponseSchema,
} from '../rules/resources.ts';
import { colorHexSchema, fontKeySchema, layoutKeySchema } from '../rules/theme.ts';

/**
 * CONTRAT DE L'API V1 — MM-01, sous-tâche 2.
 *
 * Une seule liste décrit chaque route du serveur :
 *   - ce que l'interface ENVOIE (paramètres, corps de la demande) ;
 *   - ce qu'elle REÇOIT en cas de succès ;
 *   - les ERREURS possibles.
 *
 * Tout est construit avec les règles Zod de la sous-tâche 1 : le contrat ne
 * redéfinit rien, il assemble. Le fichier OpenAPI (docs/openapi.json) est
 * ensuite GÉNÉRÉ à partir d'ici (npm run contrat) : impossible que la
 * documentation et le code racontent deux choses différentes.
 *
 * Toutes les adresses commencent par /api/v1 (« v1 » = version 1 : si l'API
 * change un jour de façon incompatible, on ouvrira /api/v2 sans casser la v1).
 */

/** Description d'une route. */
export type RouteContract = {
  /** Verbe HTTP : GET lit, POST crée, PATCH modifie une partie, DELETE supprime. */
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** Chemin après /api/v1. {id} est un paramètre : /menus/{id} → /menus/3f2b… */
  path: string;
  /** Carte du Kanban qui réalisera cette route. */
  card: string;
  summary: string;
  /** true = il faut être connecté (cookie de session). */
  auth: boolean;
  /** Paramètres dans le chemin, par exemple {id}. */
  params?: z.ZodObject;
  /** Paramètres après « ? » dans l'adresse, par exemple ?token=… */
  query?: z.ZodObject;
  /** Données envoyées dans le corps de la demande (format JSON). */
  body?: z.ZodType;
  /** Envoi d'un fichier (formulaire « multipart ») au lieu de JSON. */
  multipart?: boolean;
  /** Réponse en cas de succès : statut HTTP, description et forme des données. */
  success: { status: number; description: string; schema?: z.ZodType; contentType?: string };
  /** Erreurs possibles (codes décrits dans rules/errors.ts). */
  errors: ErrorCode[];
  /** Avancement réel dans ce projet : « prévu » tant que la route n'est pas codée et testée. */
  state: 'prévu' | 'réalisé';
};

/** Paramètre {id} présent dans beaucoup de routes. */
const idParams = z.object({ id: idSchema });

/**
 * Pour une modification (PATCH), on envoie seulement les champs qui changent.
 * Cette règle refuse une demande vide, qui ne modifierait rien.
 */
const atLeastOneField = <T extends z.ZodObject>(schema: T) =>
  schema.partial().refine((body) => Object.keys(body).length > 0, 'Aucune modification envoyée.');

export const contract = {
  // ---------- Fondations (MM-03) ----------
  'health.get': {
    method: 'GET',
    path: '/health',
    card: 'MM-03',
    summary: 'Vérifier que le serveur et la base de données répondent',
    auth: false,
    success: { status: 200, description: 'Serveur et base disponibles', schema: healthSchema },
    errors: ['INTERNAL'],
    state: 'prévu',
  },

  // ---------- Connexion (MM-04, MM-05, MM-23) ----------
  'auth.requestLink': {
    method: 'POST',
    path: '/auth/request-link',
    card: 'MM-04',
    summary: 'Recevoir un lien de connexion par e-mail (même réponse, que le compte existe ou non)',
    auth: false,
    body: z.object({ email: emailSchema }),
    success: { status: 202, description: 'Demande acceptée', schema: messageSchema },
    errors: ['VALIDATION_ERROR', 'RATE_LIMITED', 'INTERNAL'],
    state: 'prévu',
  },
  'auth.verify': {
    method: 'GET',
    path: '/auth/verify',
    card: 'MM-05',
    summary: 'Valider le lien reçu, créer le compte si besoin et ouvrir la session (cookie)',
    auth: false,
    query: z.object({ token: loginTokenSchema }),
    success: { status: 200, description: 'Connecté ; cookie de session posé', schema: meSchema },
    errors: ['VALIDATION_ERROR', 'LINK_INVALID', 'LINK_EXPIRED', 'LINK_ALREADY_USED', 'RATE_LIMITED'],
    state: 'prévu',
  },
  'auth.logout': {
    method: 'POST',
    path: '/auth/logout',
    card: 'MM-05 / MM-23',
    summary: 'Supprimer la session côté serveur et effacer le cookie',
    auth: true,
    success: { status: 204, description: 'Déconnecté (réponse sans contenu)' },
    errors: ['UNAUTHENTICATED'],
    state: 'prévu',
  },

  // ---------- Compte (spécifications « Mon compte » ; pas encore de carte) ----------
  'me.get': {
    method: 'GET',
    path: '/me',
    card: 'MM-02 / MM-24',
    summary: 'Lire le compte connecté et le profil de son restaurant',
    auth: true,
    success: { status: 200, description: 'Compte connecté', schema: meSchema },
    errors: ['UNAUTHENTICATED'],
    state: 'prévu',
  },
  'me.changeEmail': {
    method: 'PATCH',
    path: '/me',
    card: 'sans carte (spécifications)',
    summary: "Changer d'adresse e-mail : effectif seulement après confirmation de la nouvelle adresse",
    auth: true,
    body: z.object({ email: emailSchema }),
    success: { status: 202, description: 'Lien de confirmation envoyé à la nouvelle adresse', schema: messageSchema },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'RATE_LIMITED'],
    state: 'prévu',
  },
  'me.delete': {
    method: 'DELETE',
    path: '/me',
    card: 'sans carte (spécifications)',
    summary: 'Supprimer le compte, ses sessions, ses menus, son profil et ses fichiers',
    auth: true,
    success: { status: 204, description: 'Compte supprimé' },
    errors: ['UNAUTHENTICATED'],
    state: 'prévu',
  },

  // ---------- Profil du restaurant (MM-17) ----------
  'profile.get': {
    method: 'GET',
    path: '/restaurant-profile',
    card: 'MM-17',
    summary: 'Lire le nom, le logo et les préférences du restaurant connecté',
    auth: true,
    success: { status: 200, description: 'Profil', schema: restaurantProfileResponseSchema },
    errors: ['UNAUTHENTICATED'],
    state: 'prévu',
  },
  'profile.update': {
    method: 'PATCH',
    path: '/restaurant-profile',
    card: 'MM-17',
    summary: 'Modifier le profil (les menus déjà créés gardent leur propre thème)',
    auth: true,
    body: atLeastOneField(
      z.object({
        name: restaurantNameSchema,
        logoAssetId: idSchema.nullable(),
        defaultFontKey: fontKeySchema,
        defaultColor: colorHexSchema,
        defaultLayoutKey: layoutKeySchema,
      }),
    ),
    success: { status: 200, description: 'Profil modifié', schema: restaurantProfileResponseSchema },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'NOT_FOUND'],
    state: 'prévu',
  },

  // ---------- Menus (MM-07) ----------
  'menus.list': {
    method: 'GET',
    path: '/menus',
    card: 'MM-07 / MM-18',
    summary: 'Lister les menus du compte (contenu complet, pour les miniatures)',
    auth: true,
    success: { status: 200, description: 'Menus du compte, du plus récent au plus ancien', schema: z.array(menuResponseSchema) },
    errors: ['UNAUTHENTICATED'],
    state: 'prévu',
  },
  'menus.create': {
    method: 'POST',
    path: '/menus',
    card: 'MM-07',
    summary: 'Créer un brouillon qui recopie les préférences du restaurant',
    auth: true,
    body: z.object({ name: menuNameSchema.optional() }),
    success: { status: 201, description: 'Brouillon créé', schema: menuResponseSchema },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED'],
    state: 'prévu',
  },
  'menus.get': {
    method: 'GET',
    path: '/menus/{id}',
    card: 'MM-07',
    summary: 'Lire un menu complet (catégories et plats dans l’ordre)',
    auth: true,
    params: idParams,
    success: { status: 200, description: 'Menu', schema: menuResponseSchema },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'NOT_FOUND'],
    state: 'prévu',
  },
  'menus.update': {
    method: 'PATCH',
    path: '/menus/{id}',
    card: 'MM-07 / MM-16',
    summary: 'Modifier le nom, le statut (brouillon/prêt) ou le thème du menu',
    auth: true,
    params: idParams,
    body: atLeastOneField(
      z.object({
        name: menuNameSchema,
        status: menuStatusSchema,
        fontKey: fontKeySchema,
        color: colorHexSchema,
        layoutKey: layoutKeySchema,
        logoAssetId: idSchema.nullable(),
      }),
    ),
    success: { status: 200, description: 'Menu modifié', schema: menuResponseSchema },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'NOT_FOUND', 'MENU_NOT_READY'],
    state: 'prévu',
  },
  'menus.delete': {
    method: 'DELETE',
    path: '/menus/{id}',
    card: 'MM-07',
    summary: 'Supprimer un menu avec ses catégories et ses plats',
    auth: true,
    params: idParams,
    success: { status: 204, description: 'Menu supprimé' },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'NOT_FOUND'],
    state: 'prévu',
  },

  // ---------- Catégories (MM-09) ----------
  'categories.create': {
    method: 'POST',
    path: '/menus/{id}/categories',
    card: 'MM-09',
    summary: 'Ajouter une catégorie à la fin du menu',
    auth: true,
    params: idParams,
    body: categorySchema,
    success: { status: 201, description: 'Catégorie créée', schema: categoryResponseSchema },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'NOT_FOUND'],
    state: 'prévu',
  },
  'categories.reorder': {
    method: 'PATCH',
    path: '/menus/{id}/categories/order',
    card: 'MM-09 / MM-14',
    summary: 'Enregistrer le nouvel ordre de toutes les catégories (après glisser-déposer)',
    auth: true,
    params: idParams,
    body: z.object({
      categoryIds: z
        .array(idSchema)
        .min(1, 'La liste des catégories est vide.')
        .refine((ids) => new Set(ids).size === ids.length, 'Une catégorie apparaît deux fois.'),
    }),
    success: { status: 200, description: 'Catégories dans le nouvel ordre', schema: z.array(categoryResponseSchema) },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'NOT_FOUND'],
    state: 'prévu',
  },
  'categories.rename': {
    method: 'PATCH',
    path: '/categories/{id}',
    card: 'MM-09',
    summary: 'Renommer une catégorie',
    auth: true,
    params: idParams,
    body: categorySchema,
    success: { status: 200, description: 'Catégorie renommée', schema: categoryResponseSchema },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'NOT_FOUND'],
    state: 'prévu',
  },
  'categories.delete': {
    method: 'DELETE',
    path: '/categories/{id}',
    card: 'MM-09',
    summary: 'Supprimer une catégorie et ses plats',
    auth: true,
    params: idParams,
    success: { status: 204, description: 'Catégorie supprimée' },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'NOT_FOUND'],
    state: 'prévu',
  },

  // ---------- Plats (MM-12) ----------
  'dishes.create': {
    method: 'POST',
    path: '/categories/{id}/dishes',
    card: 'MM-12',
    summary: 'Ajouter un plat à la fin d’une catégorie (prix en centimes)',
    auth: true,
    params: idParams,
    body: dishSchema,
    success: { status: 201, description: 'Plat créé', schema: dishResponseSchema },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'NOT_FOUND'],
    state: 'prévu',
  },
  'dishes.update': {
    method: 'PATCH',
    path: '/dishes/{id}',
    card: 'MM-12 / MM-14',
    summary: 'Modifier un plat ou sa position dans la catégorie',
    auth: true,
    params: idParams,
    body: atLeastOneField(
      z.object({
        name: dishNameSchema,
        description: dishDescriptionSchema,
        priceCents: priceCentsSchema,
        photoAssetId: idSchema.nullable(),
        position: positionSchema,
      }),
    ),
    success: { status: 200, description: 'Plat modifié', schema: dishResponseSchema },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'NOT_FOUND'],
    state: 'prévu',
  },
  'dishes.delete': {
    method: 'DELETE',
    path: '/dishes/{id}',
    card: 'MM-12',
    summary: 'Supprimer un plat',
    auth: true,
    params: idParams,
    success: { status: 204, description: 'Plat supprimé' },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'NOT_FOUND'],
    state: 'prévu',
  },

  // ---------- Images (MM-13) ----------
  'assets.upload': {
    method: 'POST',
    path: '/assets',
    card: 'MM-13',
    summary: 'Envoyer une image (champ « file ») de type « dish-photo » ou « logo » (champ « kind »)',
    auth: true,
    multipart: true,
    success: { status: 201, description: 'Image vérifiée, optimisée et stockée', schema: assetRefSchema },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'PAYLOAD_TOO_LARGE', 'UNSUPPORTED_MEDIA'],
    state: 'prévu',
  },
  'assets.content': {
    method: 'GET',
    path: '/assets/{id}/content',
    card: 'MM-13',
    summary: 'Afficher une image du compte connecté',
    auth: true,
    params: idParams,
    success: { status: 200, description: 'Le fichier image', contentType: 'image/webp' },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'NOT_FOUND'],
    state: 'prévu',
  },

  // ---------- Export PDF (MM-20) ----------
  'menus.pdf': {
    method: 'POST',
    path: '/menus/{id}/pdf',
    card: 'MM-20',
    summary: 'Générer le PDF A4 d’un menu « prêt » (fabriqué à la demande, non conservé)',
    auth: true,
    params: idParams,
    success: { status: 200, description: 'Le fichier PDF', contentType: 'application/pdf' },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'NOT_FOUND', 'MENU_NOT_READY', 'INTERNAL'],
    state: 'prévu',
  },

  // ---------- Tableau de bord (MM-24) ----------
  'blog.list': {
    method: 'GET',
    path: '/blog/articles',
    card: 'MM-24',
    summary: 'Les trois derniers articles du blog Qwenta (source à fournir par Qwenta)',
    auth: true,
    success: { status: 200, description: 'Articles', schema: z.array(blogArticleSchema) },
    errors: ['UNAUTHENTICATED', 'EXTERNAL_SERVICE'],
    state: 'prévu',
  },

  // ---------- Instagram (MM-25 : connexion seulement ; la publication, MM-25b, reste à définir) ----------
  'instagram.connect': {
    method: 'GET',
    path: '/integrations/instagram/connect',
    card: 'MM-25',
    summary: 'Rediriger vers Instagram pour autoriser Menu Maker (OAuth 2.0)',
    auth: true,
    success: { status: 302, description: 'Redirection vers la page d’autorisation d’Instagram' },
    errors: ['UNAUTHENTICATED'],
    state: 'prévu',
  },
  'instagram.callback': {
    method: 'GET',
    path: '/integrations/instagram/callback',
    card: 'MM-25',
    summary: 'Retour d’Instagram : échanger l’autorisation contre un jeton chiffré en base',
    auth: true,
    query: z.object({ code: z.string().min(1), state: z.string().min(1) }),
    success: { status: 302, description: 'Retour vers l’interface, compte Instagram relié' },
    errors: ['VALIDATION_ERROR', 'UNAUTHENTICATED', 'EXTERNAL_SERVICE'],
    state: 'prévu',
  },
  'instagram.status': {
    method: 'GET',
    path: '/integrations/instagram',
    card: 'MM-25',
    summary: 'Savoir si un compte Instagram professionnel est relié',
    auth: true,
    success: { status: 200, description: 'État de la connexion', schema: instagramStatusSchema },
    errors: ['UNAUTHENTICATED'],
    state: 'prévu',
  },
  'instagram.disconnect': {
    method: 'DELETE',
    path: '/integrations/instagram',
    card: 'MM-25',
    summary: 'Délier le compte Instagram et supprimer son jeton',
    auth: true,
    success: { status: 204, description: 'Compte Instagram délié' },
    errors: ['UNAUTHENTICATED'],
    state: 'prévu',
  },
} satisfies Record<string, RouteContract>;

export type RouteName = keyof typeof contract;
