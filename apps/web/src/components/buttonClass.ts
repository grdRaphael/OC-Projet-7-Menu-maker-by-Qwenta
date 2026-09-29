import styles from './Button.module.css';

/** Classes du style bouton, pour un lien (<Link>) qui doit ressembler à un bouton. */
export function buttonClass(variant: 'primary' | 'secondary' = 'primary', extra?: string): string {
  return [styles.button, styles[variant], extra].filter(Boolean).join(' ');
}
