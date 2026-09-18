import styles from './PushPin.module.css';

export interface PushPinProps {
  color?: 'red' | 'neutral';
  className?: string;
}

/**
 * Purely decorative pin marker. aria-hidden — must never be the sole
 * carrier of information.
 */
export function PushPin({ color = 'red', className }: PushPinProps) {
  return (
    <span
      aria-hidden="true"
      className={[styles.pin, color === 'red' ? styles.red : styles.neutral, className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
