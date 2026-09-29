import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Action en cours : le bouton est désactivé (évite le double clic) et l'état est annoncé. */
  loading?: boolean;
};

/** Bouton réutilisable (MM-02). Toujours un vrai <button> : clavier et lecteur d'écran fonctionnent d'office. */
export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className,
  children,
  type,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
