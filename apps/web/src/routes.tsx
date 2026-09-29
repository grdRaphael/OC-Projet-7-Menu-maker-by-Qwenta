import type { RouteObject } from 'react-router';
import { RequireAuth } from './auth/RequireAuth.tsx';
import { AppLayout } from './components/AppLayout.tsx';
import { ComponentsDemo } from './pages/ComponentsDemo.tsx';
import { PlaceholderPage } from './pages/PlaceholderPage.tsx';

/**
 * PLAN DES PAGES (ROUTES) — MM-02.
 *
 * Une route associe une adresse à un écran. React Router affiche le bon
 * écran quand l'adresse change, SANS recharger toute la page.
 *
 * Deux familles :
 *   - publiques : accessibles à tout le monde ;
 *   - privées : regroupées sous <RequireAuth /> (vérifie la connexion) puis
 *     <AppLayout /> (barre latérale), écrits une seule fois pour toutes.
 */
export const routes: RouteObject[] = [
  // ---------- Pages publiques ----------
  { path: '/', element: <PlaceholderPage title="Menu Maker by Qwenta" card="MM-22 (landing)" /> },
  { path: '/connexion', element: <PlaceholderPage title="Connexion" card="MM-06" /> },
  { path: '/mentions-legales', element: <PlaceholderPage title="Mentions légales" card="MM-22 (texte à fournir par Qwenta)" /> },
  { path: '/confidentialite', element: <PlaceholderPage title="Confidentialité" card="MM-22 (texte à fournir par Qwenta)" /> },

  // Vitrine des composants : ajoutée seulement en développement (import.meta.env.DEV vaut false en production).
  ...(import.meta.env.DEV ? [{ path: '/composants', element: <ComponentsDemo /> }] : []),

  // ---------- Pages privées ----------
  {
    element: <RequireAuth />, // 1. la garde : sans session, redirection vers /connexion
    children: [
      {
        element: <AppLayout />, // 2. la structure : barre latérale + zone de contenu
        children: [
          { path: '/tableau-de-bord', element: <PlaceholderPage title="Tableau de bord" card="MM-24" isPrivate /> },
          { path: '/mes-menus', element: <PlaceholderPage title="Mes menus" card="MM-18" isPrivate /> },
          // :menuId est une partie variable de l'adresse : /menus/3f2b… ouvre le menu 3f2b…
          { path: '/menus/:menuId', element: <PlaceholderPage title="Créer un menu" card="MM-08" isPrivate /> },
          { path: '/mon-restaurant', element: <PlaceholderPage title="Mon restaurant" card="MM-17" isPrivate /> },
          { path: '/mon-compte', element: <PlaceholderPage title="Mon compte" card="(sans carte)" isPrivate /> },
        ],
      },
    ],
  },

  // ---------- Toute autre adresse ----------
  { path: '*', element: <PlaceholderPage title="Page introuvable" card="—" /> },
];
