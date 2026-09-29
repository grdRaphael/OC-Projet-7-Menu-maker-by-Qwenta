import { NavLink, Outlet } from 'react-router';
import styles from './AppLayout.module.css';

/** Liens de la navigation principale, dans l'ordre d'affichage. */
const NAV = [
  { to: '/tableau-de-bord', label: 'Tableau de bord' },
  { to: '/mes-menus', label: 'Mes menus' },
  { to: '/mon-restaurant', label: 'Mon restaurant' },
  { to: '/mon-compte', label: 'Mon compte' },
];

/**
 * LAYOUT DE L'ESPACE CONNECTÉ — MM-02, sous-tâche 3.
 * Repris de la branche « reference », simplifié : le nom du restaurant (MM-24)
 * et le bouton « Se déconnecter » (MM-23) seront ajoutés avec leurs cartes,
 * car ils ont besoin du serveur.
 *
 * Structure : barre latérale blanche à gauche, contenu de la page à droite
 * (<Outlet /> = la page privée demandée). La mise en page exacte du Figma
 * (nœud « Dashboard ») sera ajustée dans MM-24.
 *
 * Accessibilité :
 *   - lien « Aller au contenu » en premier, pour sauter la navigation au clavier ;
 *   - <nav aria-label> : le lecteur d'écran annonce « Navigation principale » ;
 *   - NavLink ajoute aria-current="page" au lien actif (« page actuelle »).
 */
export function AppLayout() {
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#contenu">
        Aller au contenu
      </a>

      <aside className={styles.sidebar}>
        <img className={styles.logo} src="/assets/qwenta.svg" alt="Menu Maker by Qwenta" width={138} height={48} />

        <nav aria-label="Navigation principale">
          <ul className={styles.nav}>
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  // Le lien de la page ouverte reçoit en plus le style « actif ».
                  className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.bottom}>
          <ul className={styles.secondary}>
            <li>
              <NavLink to="/mentions-legales" className={styles.smallLink}>
                Mentions légales
              </NavLink>
            </li>
            <li>
              <NavLink to="/confidentialite" className={styles.smallLink}>
                Confidentialité
              </NavLink>
            </li>
          </ul>
        </div>
      </aside>

      <main id="contenu" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
