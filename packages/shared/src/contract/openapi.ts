import { z } from 'zod';
import { apiErrorSchema, ERROR_STATUS } from '../rules/errors.ts';
import { contract, type RouteContract } from './contract.ts';

/**
 * TRANSFORMER LE CONTRAT EN DOCUMENT OPENAPI 3.1 — MM-01, sous-tâche 2.
 *
 * OpenAPI est un format standard (un gros fichier JSON) qui décrit une API.
 * Beaucoup d'outils savent le lire : pages de documentation, générateurs de
 * tests, clients… Zod sait se traduire en « JSON Schema », le langage de
 * description utilisé par OpenAPI : chaque règle n'est donc écrite qu'une fois.
 */

type Json = Record<string, unknown>;

/**
 * Traduit une règle Zod en JSON Schema.
 * io 'input' = ce qu'on doit ENVOYER (avant nettoyage) ; 'output' = ce qu'on REÇOIT.
 */
const toSchema = (schema: z.ZodType, io: 'input' | 'output'): Json =>
  z.toJSONSchema(schema, { io, unrepresentable: 'any', target: 'draft-2020-12' }) as Json;

// ---------- Contrôles de cohérence du contrat ----------

/**
 * Vérifie que chaque route est complète. Le générateur s'arrête avec la liste
 * des problèmes plutôt que de produire une documentation incomplète.
 */
export function contractProblems(): string[] {
  const problems: string[] = [];
  for (const [name, route] of Object.entries(contract) as [string, RouteContract][]) {
    if (!route.success.description) problems.push(`${name} : réponse de succès non décrite`);
    if (route.errors.length === 0) problems.push(`${name} : aucune erreur prévue`);
    if (route.auth && !route.errors.includes('UNAUTHENTICATED')) {
      problems.push(`${name} : route protégée sans l'erreur UNAUTHENTICATED`);
    }
    if (route.params && !route.errors.includes('NOT_FOUND')) {
      problems.push(`${name} : route avec identifiant sans l'erreur NOT_FOUND`);
    }
    if ((route.body || route.params || route.query) && !route.errors.includes('VALIDATION_ERROR')) {
      problems.push(`${name} : route qui reçoit des données sans l'erreur VALIDATION_ERROR`);
    }
  }
  return problems;
}

// ---------- Construction du document ----------

/** Paramètres du chemin ({id}) et de l'adresse (?token=…). */
function parameters(route: RouteContract): Json[] {
  const list: Json[] = [];
  for (const [where, obj] of [
    ['path', route.params],
    ['query', route.query],
  ] as const) {
    if (!obj) continue;
    for (const [name, schema] of Object.entries(obj.shape)) {
      list.push({ name, in: where, required: true, schema: toSchema(schema as z.ZodType, 'input') });
    }
  }
  return list;
}

/** Décrit une route (une « opération » dans le vocabulaire OpenAPI). */
function operation(name: string, route: RouteContract): Json {
  const responses: Json = {};

  // Réponse de succès : JSON décrit par une règle, ou fichier (PDF, image).
  const success: Json = { description: route.success.description };
  if (route.success.schema) {
    success.content = { 'application/json': { schema: toSchema(route.success.schema, 'output') } };
  } else if (route.success.contentType) {
    success.content = { [route.success.contentType]: { schema: { type: 'string', format: 'binary' } } };
  }
  responses[String(route.success.status)] = success;

  // Erreurs : regroupées par statut HTTP (ex. 410 = lien expiré OU déjà utilisé).
  const byStatus = new Map<number, string[]>();
  for (const code of route.errors) {
    const status = ERROR_STATUS[code];
    byStatus.set(status, [...(byStatus.get(status) ?? []), code]);
  }
  for (const [status, codes] of byStatus) {
    responses[String(status)] = {
      description: `Erreur : ${codes.join(', ')}`,
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } },
    };
  }

  const op: Json = {
    operationId: name,
    summary: route.summary,
    // Regroupe les routes par carte PRINCIPALE dans la page de lecture
    // (« MM-07 / MM-18 » est rangée sous MM-07) ; la liste complète reste dans x-carte.
    tags: [route.card.split(' / ')[0]],
    'x-carte': route.card,
    'x-etat': route.state,
    responses,
  };
  if (route.auth) op.security = [{ sessionCookie: [] }];
  const params = parameters(route);
  if (params.length > 0) op.parameters = params;
  if (route.body) {
    op.requestBody = { required: true, content: { 'application/json': { schema: toSchema(route.body, 'input') } } };
  }
  if (route.multipart) {
    op.requestBody = {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            required: ['file', 'kind'],
            properties: {
              file: { type: 'string', format: 'binary', description: 'JPEG, PNG ou WebP, 2 Mo maximum' },
              kind: { type: 'string', enum: ['dish-photo', 'logo'] },
            },
          },
        },
      },
    };
  }
  return op;
}

/** Le document OpenAPI complet. */
export function buildOpenApiDocument(): Json {
  const paths: Record<string, Json> = {};
  for (const [name, route] of Object.entries(contract) as [string, RouteContract][]) {
    (paths[route.path] ??= {})[route.method.toLowerCase()] = operation(name, route);
  }
  return {
    openapi: '3.1.0',
    info: {
      title: 'Menu Maker by Qwenta — API V1',
      version: '1.0.0',
      description:
        'Contrat de l’API (carte MM-01). Généré depuis packages/shared/src/contract/contract.ts par « npm run contrat ». ' +
        'Chaque route indique sa carte du Kanban et son état (« x-etat » : prévu ou réalisé).',
    },
    servers: [{ url: '/api/v1' }],
    components: {
      securitySchemes: {
        // La session est un cookie « mm_session » posé par le serveur à la connexion (MM-05).
        sessionCookie: { type: 'apiKey', in: 'cookie', name: 'mm_session' },
      },
      schemas: { ApiError: toSchema(apiErrorSchema, 'output') },
    },
    paths,
  };
}
