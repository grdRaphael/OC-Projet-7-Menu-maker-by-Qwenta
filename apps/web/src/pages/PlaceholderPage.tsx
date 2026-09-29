import { Link } from 'react-router';

/**
 * PAGE PROVISOIRE — MM-02.
 *
 * Chaque adresse du site existe déjà, mais son vrai contenu viendra avec sa
 * carte. La page le dit clairement : rien n'est simulé.
 *
 * - Page publique : elle fournit elle-même la zone <main> et des liens pour
 *   essayer la navigation.
 * - Page privée : elle s'affiche DANS le layout, qui fournit déjà <main> et la
 *   barre latérale ; une page ne doit contenir qu'un seul <main> (repère
 *   utilisé par les lecteurs d'écran).
 */
export function PlaceholderPage({ title, card, isPrivate }: { title: string; card: string; isPrivate?: boolean }) {
  const content = (
    <>
      <h1>{title}</h1>
      <p>
        Page {isPrivate ? 'privée (réservée aux restaurateurs connectés)' : 'publique'} — contenu à réaliser dans la carte{' '}
        {card}.
      </p>
    </>
  );

  if (isPrivate) return content;

  return (
    <main style={{ padding: 48 }}>
      {content}
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
          {import.meta.env.DEV && (
            <li>
              <Link to="/composants">Composants de base (développement)</Link>
            </li>
          )}
        </ul>
      </nav>
    </main>
  );
}
