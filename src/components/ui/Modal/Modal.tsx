import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
}

/**
 * Clean, readable lightbox/modal — used for "VIEW ALL EVIDENCE" project
 * galleries and certificate readers. Deliberately undecorated: content
 * legibility takes priority over detective theming here.
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
