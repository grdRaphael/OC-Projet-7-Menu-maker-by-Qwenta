import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { routes } from './routes.tsx';

/**
 * POINT DE DÉPART DE L'INTERFACE — MM-02, sous-tâche 1.
 *
 * 1. createBrowserRouter : fabrique le « routeur » à partir du plan des pages ;
 *    il lit l'adresse du navigateur et choisit l'écran à afficher.
 * 2. createRoot(...).render : React prend la main sur <div id="root"> (index.html).
 * 3. StrictMode : en développement, React vérifie certaines erreurs courantes
 *    (il exécute par exemple deux fois certains effets pour les repérer).
 */
const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
