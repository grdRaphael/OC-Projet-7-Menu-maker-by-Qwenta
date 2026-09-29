import { Navigate, Outlet, useLocation } from 'react-router';
import { useSession } from './useSession.ts';

/**
 * GARDE DES PAGES PRIVÉES — MM-02, sous-tâche 1.
 *
 * Elle entoure toutes les pages réservées aux restaurateurs connectés :
 *   - personne n'est connecté → redirection vers /connexion, en retenant la
 *     page demandée (pour y revenir après la connexion) ;
 *   - serveur injoignable → message et bouton « Réessayer » ;
 *   - connecté → la page demandée s'affiche (<Outlet /> = « la page enfant »).
 *
 * ATTENTION : cette garde protège l'AFFICHAGE, pas les données. La vraie
 * protection est côté serveur, qui vérifie la session à chaque demande (MM-03).
 */
export function RequireAuth() {
  const session = useSession();
  const location = useLocation();

  if (session.status === 'loading') {
    // role="status" : un lecteur d'écran annonce ce message.
    return <p role="status">Chargement de votre espace…</p>;
  }

  if (session.status === 'unavailable') {
    return (
      <div role="alert">
        <p>{session.message} Réessayez dans un instant.</p>
        <button type="button" onClick={session.retry}>
          Réessayer
        </button>
      </div>
    );
  }

  if (session.status === 'disconnected') {
    // « replace » : la page refusée ne reste pas dans l'historique du bouton « Retour ».
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
