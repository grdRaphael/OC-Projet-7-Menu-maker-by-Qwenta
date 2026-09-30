# AGENTS.md — Reprise du projet Menu Maker by Qwenta

> Fichier destiné à l'agent IA (Codex, Claude Code ou autre) qui reprend ce projet.
> Lis-le entièrement avant toute action. Il décrit QUI est l'utilisateur, COMMENT
> travailler avec lui, OÙ en est le projet et QUELLE est la prochaine étape.
> Dernière mise à jour : 30/09/2026, MM-03 sous-tâche 3 réalisée (voir le dernier commit).

---

## 1. L'utilisateur et le but

- **Raphaël** suit une formation OpenClassrooms (projet 7 : Menu Maker by Qwenta). Le devoir porte sur la
  planification ; **cette réalisation est personnelle**, pour découvrir les technologies.
- Il est **débutant** : il **ne code pas lui-même**. Tu réalises, tu vérifies, tu expliques.
- **Son livrable, c'est son Kanban Notion.** Signale-lui ce qu'il devrait corriger ou compléter dans les
  cartes (sous-tâches, dépendances, critères, hypothèses). **Ne modifie jamais Notion toi-même.**
- Langue : **français**, simple, sans jargon non expliqué. Vouvoiement dans l'interface du site ; tutoiement
  avec lui dans la conversation.

## 2. Méthode de travail (IMPORTANT, demandée explicitement)

1. **Une seule sous-tâche de carte à la fois**, dans l'ordre du Kanban. Avant de coder : relire la carte dans
   Notion (elle évolue), annoncer la sous-tâche et ce qui va être créé. Après : **s'arrêter** et attendre son
   feu vert (« go », « la suite », « oui »…). Il a dit : « c'est déjà allé trop vite pour moi ».
   Il a accepté de grouper quand il le demande (ex. « fais toutes les règles d'un coup »).
2. **Commentaires pédagogiques en français dans le code** : rôle de chaque bloc, lignes non évidentes, lien
   vers la carte MM-xx, et le « pourquoi ». Il les lit et a dit que c'était « juste parfait ».
3. **Après chaque sous-tâche**, répondre avec :
   - ce qui a été fait (fichiers en liens cliquables) ;
   - **comment l'essayer** (adresse, commande, ce qu'on doit voir) ;
   - **au plus 3 notions** expliquées à partir du code réellement écrit (rôle, problème résolu, fichier,
     effet observable) ; un tableau d'exemples quand une notion résiste ;
   - ce qui a été vérifié, les défauts trouvés et corrigés ;
   - les remarques pour son Kanban ;
   - la prochaine sous-tâche, puis une question pour continuer.
4. **Git : un commit + push par étape**, sur `main`, vers `origin`
   (`git@github.com:grdRaphael/OC-Projet-7-Menu-maker-by-Qwenta.git`, accès SSH déjà configuré).
   Message : `MM-xx · sous-tâche n : résumé` puis une liste à puces. Pousser avec
   `GIT_SSH_COMMAND="ssh -o BatchMode=yes -o ConnectTimeout=15" git push`.
5. **Vérifier avant d'annoncer.** Une compilation réussie ne prouve pas qu'un parcours marche : lancer,
   appeler l'API, faire une capture. Dire honnêtement ce qui est vérifié, simulé, bloqué ou à faire.
   Ne jamais présenter une simulation comme réelle.
6. Poser seulement les questions indispensables ; pour un détail réversible, choisir, documenter, avancer.
7. **Tenir ce fichier à jour** : à la fin de chaque sous-tâche, mettre à jour les sections 5 (état) et 6
   (prochaine étape), ajouter les nouvelles décisions (7), remarques Kanban (8) et pièges (9), et l'inclure
   dans le commit. C'est lui qui permet de reprendre sans tout réexpliquer.

## 3. Sources de référence

| Source | Emplacement |
|---|---|
| Consignes complètes du projet (architecture, règles fonctionnelles, ordre, vérifications) | `/Users/grondinraphael/Documents/Codex/2026-09-26/reg/outputs/prompt-menu-maker-claude-code.md` |
| Contexte + texte des spécifications techniques (Google Docs) + relevé du Kanban | `/Users/grondinraphael/Documents/Codex/2026-09-26/reg/outputs/contexte-menu-maker.md` |
| Kanban Notion (à relire avant chaque carte) | https://app.notion.com/p/3e417d39a5258039a3b8cda195614d1a |
| Figma | https://www.figma.com/design/487bQPFC4q9INNl8ikeDNF — l'accès MCP a atteint le quota du plan Starter le 28/09 ; demander un export PNG si nécessaire |
| **Ancienne version v1** (NE JAMAIS MODIFIER) | `/Users/grondinraphael/Desktop/OPENCLASSROOMS/OC Projet 7 /v1 MM` — son front a été construit d'après Figma |
| **Branche Git locale `reference`** (commit `fa434d5`, non poussée) | Première réalisation rapide de ce projet (jalons 1-2 : connexion par lien e-mail, landing et panneau de connexion repris de la v1, routes menus…). **L'utilisateur autorise à y puiser** (`git checkout reference -- <fichier>`, ou `git show reference:<fichier>`), fichier par fichier, en expliquant et en adaptant. Ne jamais la restaurer en bloc. |

Priorités en cas de contradiction : Google Docs pour les décisions techniques, les cartes pour les tâches et
critères, Figma pour les écrans. Relever la contradiction et proposer un arbitrage.

## 4. Architecture et environnement

Monorepo npm (workspaces) à la racine de ce dossier :

```
packages/shared   règles Zod partagées + contrat de l'API (MM-01)
apps/web          interface : Vite 8, React 19, React Router 8, CSS Modules, Radix Dialog (MM-02)
apps/api          serveur : Fastify 5, TypeScript lancé par tsx, Kysely + pg (MM-03)
compose.yaml      services Docker : PostgreSQL 17 + Adminer
infra/            script d'initialisation de PostgreSQL (crée la base de test)
docs/             openapi.json et contrat-api.html (générés par `npm run contrat`)
```

Stack imposée par ses spécifications (ne pas la remplacer) : React 19, TypeScript, React Router, CSS Modules +
variables CSS, React Hook Form + useFieldArray, Zod partagé, TanStack Query, Radix Dialog, dnd-kit, Fastify,
Node LTS, REST `/api/v1`, OpenAPI, PostgreSQL + migrations, stockage S3, File API + @fastify/multipart + Sharp,
Nodemailer/SMTP (lien de connexion, pas de mot de passe), MenuPreview commun + Playwright pour le PDF A4,
ESLint, Prettier, Vitest, Testing Library, Playwright.

Versions : Node 22.23 installé ; **TypeScript épinglé en ~6.0** (typescript-eslint refuse TS ≥ 6.1) ;
Zod 4 ; Kysely 0.29 (le Migrator s'importe depuis `kysely/migration`).

**Ports** (choisis pour ne pas gêner la v1, qui utilise 3000, 5173, 5432, 8025) :

| Service | Adresse |
|---|---|
| Interface (Vite) | http://localhost:5180 (écoute sur `localhost` seulement, pas `127.0.0.1`) |
| API (Fastify) | http://localhost:3100/api/v1 (l'interface y accède via le proxy Vite `/api`) |
| PostgreSQL | 127.0.0.1:5442 — utilisateur `menumaker`, mot de passe `dev-menumaker`, bases `menumaker` et `menumaker_test` |
| Adminer | http://localhost:8085 — Système PostgreSQL, Serveur `db` |
| Réservés pour la suite | Mailpit 1035 (SMTP) / 8035 (web) pour MM-04 ; stockage S3 8343 pour MM-13 (SeaweedFS : MinIO ne publie plus d'images Docker) |

**Commandes** (à la racine) :

```
npm install              installer
npm run services:up      démarrer PostgreSQL + Adminer (Docker)   | services:down / services:reset (efface)
npm run dev:api          serveur (redémarre à chaque modification ; applique les migrations au démarrage)
npm run dev:web          interface
npm run db:migrate       appliquer les migrations à la main
npm run contrat          vérifier le contrat et régénérer docs/openapi.json + docs/contrat-api.html
npm run essai:regles     essayer toutes les règles Zod (essai:prix : le prix seul)
npm run essai:proprietaire  vérifier les droits avec deux comptes fictifs en base de test
npm run typecheck -w @menu-maker/<shared|web|api>
```

## 5. État d'avancement (suivi repris à zéro le 29/09/2026)

| Carte | État | Détail |
|---|---|---|
| **MM-00** (créée par lui) | **Partielle** — Notion dit « Terminé », c'est faux ici | Fait : dépôt GitHub, workspaces, TypeScript, `.gitignore`, `apps/api/.env.example`. **Reste : ESLint, Prettier, Vitest, `.nvmrc`, README.** |
| **MM-01** | Sous-tâches 1 et 2 faites ; **sous-tâche 3 non faite** | Règles Zod de toutes les données (`packages/shared/src/rules/`), contrat de 29 routes (`contract.ts`, champ `state` prévu/réalisé). Sous-tâche 3 = relecture du contrat par le « développeur front » (lui) : il a choisi de passer. |
| **MM-02** | Faite | Routes publiques/privées, garde `RequireAuth` (GET /api/v1/me : 401 → /connexion ; injoignable → « Le serveur ne répond pas » + Réessayer), charte en variables CSS, Button/Modal/AppLayout, vitrine `/composants` (dev). Redirection vérifiée avec une doublure ; à revérifier avec la vraie route `/me` (MM-05). Sidebar à confronter à Figma dans MM-24. |
| **MM-03** | Sous-tâches 1, 2 et 3 faites ; sous-tâche 4 à faire | Serveur Fastify ; migration `0001_tables_de_base` (users, restaurant_profiles, menus, categories, dishes ; cascade ; `price_cents > 0` ; positions uniques DEFERRABLE) ; `/health` vérifie la base (état « réalisé » dans le contrat) ; Adminer ajouté. Contrôles `ownedMenuId`, `ownedCategory`, `ownedDish` adaptés de `reference`. Essai sur PostgreSQL réel : 18 demandes via Fastify.inject, propriétaire autorisé / étranger et absent refusés (404 identiques), dans les deux sens. Typecheck API réussi. Identités fixées par l’essai, pas de session réelle ; intégration aux routes métier à vérifier lors de MM-07/09/12. |
| MM-04 à MM-26, MM-33 | À faire | — |

Choix volontaires de découpage : les tables de session et de lien e-mail viendront avec MM-04/05 (migration
0002…), la table des images et les colonnes logo/photo avec MM-13. `me.get` n'existe pas encore : la page privée
affiche donc « Le serveur a répondu une erreur (404) », c'est attendu.

## 6. PROCHAINE ÉTAPE

**MM-03, sous-tâche 4 : « Écrire un README qui explique comment lancer le projet, sans y mettre de mot de passe. »**
À rapprocher du README demandé par MM-00. Relire la carte Notion avant de commencer.
Documenter les commandes réellement disponibles et les limites actuelles ; ne pas annoncer lint/tests
Vitest comme disponibles (outillage MM-00 encore à faire). Attendre le feu vert de Raphaël.

## 7. Décisions et hypothèses (à rappeler à l'utilisateur quand elles comptent)

- Contrôle du propriétaire : fonctions réutilisables, à appeler par chaque future route avant accès.
  `ownerId` doit venir de la session vérifiée, jamais du navigateur. Validation UUID dans les futures routes.
  Essai autonome sans Vitest : base locale `menumaker_test`, transaction annulée en fin d’essai même en cas
  d’échec ; aucune route d’essai ajoutée au serveur normal. Aucun changement visible dans l’interface.
- Prix : saisi en euros, stocké en centimes entiers ; « prix positif » = strictement > 0 ; maximum 9 999,99 € (hypothèse).
- Photos : JPEG/PNG/WebP, « 2 Mo » = 2 Mio ; logo : mêmes limites (hypothèse, à confirmer par Qwenta).
- Polices des menus : Epilogue, Work Sans, Georgia (hypothèse : Figma inaccessible). Mises en page : une ou deux colonnes.
- Nom du menu facultatif (date affichée à la place) ; menu « prêt » = au moins une catégorie, aucune vide.
- Longueurs max : plat 80, description 300, catégorie 60, restaurant 80, menu 80. Texte simple nettoyé avec
  `.overwrite` (et non `.transform`) pour que les limites apparaissent dans OpenAPI.
- Élément d'un autre compte → 404. Charte : `#000000` gardé (la v1 avait relevé `#0D0D0D` dans Figma).
  Vert foncé `#2F6B55` ajouté pour les textes/liens (le vert et le brun Qwenta ont un contraste < 4,5).
- Durées prévues (hypothèses) : lien de connexion 15 min, usage unique ; session 30 jours.
- PDF généré à la volée, non stocké (MM-20 prime sur la spec générale). H1/H2 des spécifications = hypothèses du prototype.
- GET /auth/verify : le lien de l'e-mail ouvre une page de l'interface qui appelle ensuite l'API (un antivirus
  qui pré-ouvre les liens ne consomme pas le jeton).

## 8. Remarques Kanban déjà signalées (lui rappeler si pertinent, sans insister)

- MM-03 : préciser « socle du contrôle vérifié avec deux comptes en base ; branchement aux routes
  authentifiées et recette complète lors de MM-05/07/09/12 ». Carte encore en cours, README restant.
- Relecture Notion du 30/09 : MM-06 et MM-17 sont désormais P1 ; MM-24 a ses spécifications ;
  MM-25b est renseignée, MM-25c et MM-26a/b existent. Les remarques anciennes ci-dessous sur ces
  manques sont donc résolues ; relire ces cartes à leur tour.
- « Dépend de » est souvent inversé (ex. MM-01→MM-04, MM-03→MM-33, MM-00→MM-03) : ne garder que les prérequis réels ;
  le nouveau champ « Prérequis » pourrait servir.
- Q1 tranchée dans MM-09 mais encore citée dans MM-10. MM-06 et MM-17 en P2 alors que le parcours P1 en dépend.
- Sans carte : première visite, changement d'e-mail, suppression du compte. MM-25b (publication Instagram) vide.
  MM-24 : spécifications techniques vides. MM-33 (blog) demande une image par article : l'ajouter au contrat.
- MM-02 sous-tâche 1 : deux actions dans une puce. MM-03 : ajouter une sous-tâche « environnement local Docker
  Compose (PostgreSQL, Adminer en développement) » ; une ligne dans la section « Environnements » des spécifications.

## 9. Pièges déjà rencontrés

- Essai propriétaire : `Fastify.inject` vérifie les réponses sans ouvrir de port ; ce n’est pas une
  connexion réelle depuis le navigateur. Dans un environnement restreint, tsx et PostgreSQL peuvent
  demander une exécution hors sandbox (EPERM).
- **zsh** : un `*` non protégé est pris pour un motif de fichiers (`'@menu-maker/shared@*'` entre guillemets).
- **npm workspaces** : le tout premier `npm install --workspace=...` d'un nouveau dossier peut ne rien ajouter ;
  relancer et vérifier avec `npm ls`.
- **React StrictMode** (dev) exécute les effets deux fois : une doublure de test qui compte les appels trompe ;
  un jeton à usage unique doit être protégé par un `useRef`.
- **Vite** écoute sur `localhost` (IPv6) : `127.0.0.1:5180` ne répond pas. Un onglet ouvert avant un changement
  de styles peut nécessiter Cmd + Shift + R.
- **Safari/WebKit** : Tab saute les liens par défaut (réglage « Appuyer sur Tab pour mettre en évidence chaque élément »).
- Radix Dialog sans `Dialog.Trigger` ne rend pas le focus : `Modal.tsx` le mémorise et le rend lui-même.
- Caractères invisibles : ne pas écrire d'espaces insécables littéraux dans le code (utiliser `\s` ou des codes).
- Vérifications visuelles sans installer d'outil dans le projet : Chrome headless
  (`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --screenshot=… URL`) ou
  Playwright installé dans un dossier temporaire hors projet (navigateurs déjà en cache).
- Doublure pour simuler une réponse du serveur : petit serveur Node hors projet sur le port 3100, **arrêté aussitôt
  après** ; toujours dire à l'utilisateur que c'était une doublure.

## 10. Interdits

- Modifier `../v1 MM`, modifier Notion, pousser la branche `reference` sans demande.
- Envoyer un vrai e-mail, publier sur un vrai compte Instagram/Deliveroo sans demande explicite.
- Mettre un secret réel dans Git (les identifiants `dev-…` ne servent qu'aux services locaux).
- Déclarer une carte terminée sans que ses critères soient vérifiés dans CE projet.
- Enchaîner plusieurs sous-tâches sans son accord.
