import * as Dialog from '@radix-ui/react-dialog';
import { useRef, type ReactNode } from 'react';
import styles from './Modal.module.css';

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Phrase lue par le lecteur d'écran à l'ouverture. */
  description?: string;
  children: ReactNode;
};

/**
 * Modale réutilisable (MM-02), construite sur Radix Dialog.
 * Radix gère pour nous : le focus enfermé dans la fenêtre, la touche Échap,
 * et le titre annoncé au lecteur d'écran.
 *
 * Retour du focus : nos modales s'ouvrent depuis n'importe quel bouton (pas
 * un <Dialog.Trigger>), donc Radix ne sait pas où revenir. On mémorise
 * l'élément qui avait le focus à l'ouverture et on le lui rend à la fermeture.
 */
export function Modal({ open, onOpenChange, title, description, children }: ModalProps) {
  const returnFocusRef = useRef<HTMLElement | null>(null);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={styles.content}
          {...(!description && { 'aria-describedby': undefined })}
          onOpenAutoFocus={() => {
            returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusRef.current?.focus();
          }}
        >
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>{title}</Dialog.Title>
            <Dialog.Close className={styles.close} aria-label="Fermer">
              <span aria-hidden="true">×</span>
            </Dialog.Close>
          </div>
          {description && <Dialog.Description className={styles.description}>{description}</Dialog.Description>}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
