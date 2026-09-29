import type { RouteObject } from 'react-router';
import { RequireAuth } from './auth/RequireAuth.tsx';
import { PlaceholderPage } from './pages/PlaceholderPage.tsx';

/**
 * PLAN DES PAGES (ROUTES) — MM-02, sous-tâche 1.
 *
 * Une route associe une adresse à un écran. React Router affiche le bon
 * écran quand l'adresse change, SANS recharger toute la page.
 *
 * Deux familles :
 *   - publiques : accessibles à tout le monde ;
 *   - privées : regroupées sous <RequireAuth />, qui vérifie la connexion
 *     une seule fois pour toutes les pages du groupe.
 */
export const routes: RouteObject[] = [
  // ---------- Pages publiques ----------
  { path: '/', element: <PlaceholderPage title="Menu Maker by Qwenta" card="MM-22 (landing)" /> },
  { path: '/connexion', element: <PlaceholderPage title="Connexion" card="MM-06" /> },

  // ---------- Pages privées ----------
  {
    element: <RequireAuth />, // la garde : sans session, redirection vers /connexion
    children: [
      { path: '/tableau-de-bord', element: <PlaceholderPage title="Tableau de bord" card="MM-24" isPrivate /> },
      { path: '/mes-menus', element: <PlaceholderPage title="Mes menus" card="MM-18" isPrivate /> },
      // :menuId est une partie variable de l'adresse : /menus/3f2b… ouvre le menu 3f2b…
      { path: '/menus/:menuId', element: <PlaceholderPage title="Créer un menu" card="MM-08" isPrivate /> },
      { path: '/mon-restaurant', element: <PlaceholderPage title="Mon restaurant" card="MM-17" isPrivate /> },
      { path: '/mon-compte', element: <PlaceholderPage title="Mon compte" card="(sans carte)" isPrivate /> },
    ],
  },

  // ---------- Toute autre adresse ----------
  { path: '*', element: <PlaceholderPage title="Page introuvable" card="—" /> },
];
