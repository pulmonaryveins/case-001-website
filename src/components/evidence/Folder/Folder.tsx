import type { ReactNode } from 'react';
import { useState } from 'react';
import styles from './Folder.module.css';

export interface FolderProps {
  label: string;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Case folder that opens to reveal content (dossier, contact card, etc.).
 * Uncontrolled by default; pass `open`/`onOpenChange` to drive it from a
 * GSAP timeline or ScrollTrigger instead of internal state.
 */
export function Folder({ label, children, open, onOpenChange }: FolderProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;

  const toggle = () => {
    const next = !isOpen;
    setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div className={styles.folder} data-open={isOpen}>
      <button type="button" className={styles.tab} onClick={toggle} aria-expanded={isOpen}>
        {label}
      </button>
      <div className={styles.contents} hidden={!isOpen}>
        {children}
      </div>
    </div>
  );
}
