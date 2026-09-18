import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Paper.module.css';

export interface PaperProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  aged?: boolean;
  rotation?: number;
}

/**
 * Base physical paper surface. Other evidence primitives (labels, notes,
 * dossier pages) compose on top of this rather than reimplementing texture
 * and shadow.
 */
export function Paper({
  children,
  aged = false,
  rotation = 0,
  className,
  style,
  ...rest
}: PaperProps) {
  return (
    <div
      className={[styles.paper, aged && styles.aged, className].filter(Boolean).join(' ')}
      style={{ ...style, ['--paper-rotation' as string]: `${rotation}deg` }}
      {...rest}
    >
      {children}
    </div>
  );
}
