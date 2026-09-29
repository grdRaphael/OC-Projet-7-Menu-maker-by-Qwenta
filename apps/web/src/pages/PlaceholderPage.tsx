import { Link } from 'react-router';

/**
 * PAGE PROVISOIRE — MM-02, sous-tâche 1.
 *
 * Chaque adresse du site existe déjà, mais son vrai contenu viendra avec sa
 * carte. La page le dit clairement : rien n'est simulé.
 * Les liens en bas servent à essayer la navigation entre les pages.
 */
export function PlaceholderPage({ title, card, isPrivate }: { title: string; card: string; isPrivate?: boolean }) {
  return (
    <main>
      <h1>{title}</h1>
      <p>
        Page {isPrivate ? 'privée (réservée aux restaurateurs connectés)' : 'publique'} — contenu à réaliser dans la carte{' '}
        {card}.
      </p>
      <nav aria-label="Pages de base">
        <ul>
          <li>
            <Link to="/">Accueil (landing)</Link>
          </li>
          <li>
            <Link to="/connexion">Connexion</Link>
          </li>
          <li>
            <Link to="/tableau-de-bord">Tableau de bord (privée)</Link>
          </li>
          <li>
            <Link to="/mes-menus">Mes menus (privée)</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
