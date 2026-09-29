/**
 * GÉNÉRER LE CONTRAT — MM-01, sous-tâche 2.
 *
 * Lancer :  npm run contrat
 *
 * 1. vérifie que chaque route du contrat est complète ;
 * 2. écrit docs/openapi.json (le contrat au format standard OpenAPI) ;
 * 3. écrit docs/contrat-api.html, une page à ouvrir dans le navigateur pour
 *    lire le contrat confortablement (outil Swagger UI).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildOpenApiDocument, contractProblems } from '../src/contract/openapi.ts';

const docsDir = fileURLToPath(new URL('../../../docs/', import.meta.url));

// 1. Contrôle : on refuse de produire une documentation incomplète.
const problems = contractProblems();
if (problems.length > 0) {
  console.error('Contrat incomplet :');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

// 2. Le fichier OpenAPI.
const document = buildOpenApiDocument();
mkdirSync(docsDir, { recursive: true });
writeFileSync(`${docsDir}openapi.json`, `${JSON.stringify(document, null, 2)}\n`);

// 3. La page de lecture. Le contrat est inclus DANS la page : elle s'ouvre
//    d'un double-clic, sans serveur. Swagger UI est chargé depuis internet
//    (version fixée, 5.33.0) : la page a besoin d'une connexion.
const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Menu Maker — contrat de l'API V1</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.33.0/swagger-ui.css" />
  </head>
  <body>
    <div id="contrat"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.33.0/swagger-ui-bundle.js"></script>
    <script>
      // Page générée par « npm run contrat » : ne pas modifier à la main.
      SwaggerUIBundle({ spec: ${JSON.stringify(document)}, dom_id: '#contrat', docExpansion: 'list' });
    </script>
  </body>
</html>
`;
writeFileSync(`${docsDir}contrat-api.html`, html);

const routes = Object.values(document.paths as Record<string, object>).reduce<number>(
  (total, operations) => total + Object.keys(operations).length,
  0,
);
console.log(`Contrat vérifié : ${routes} routes.`);
console.log(`  → docs/openapi.json`);
console.log(`  → docs/contrat-api.html (à ouvrir dans le navigateur)`);
