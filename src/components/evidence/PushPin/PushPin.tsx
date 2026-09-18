import type { CSSProperties } from 'react';
import styles from './PushPin.module.css';

export interface PushPinProps {
  color?: 'red' | 'neutral';
  className?: string;
  style?: CSSProperties;
}

/**
 * Purely decorative pin marker. aria-hidden — must never be the sole
 * carrier of information.
 */
export function PushPin({ color = 'red', className, style }: PushPinProps) {
  return (
    <span
      aria-hidden="true"
      style={style}
      className={[styles.pin, color === 'red' ? styles.red : styles.neutral, className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
