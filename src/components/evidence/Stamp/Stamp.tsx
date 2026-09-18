import styles from './Stamp.module.css';

export interface StampProps {
  text: string;
  rotation?: number;
}

/** Ink-stamp style label, e.g. "CONFIDENTIAL", "CASE SOLVED". */
export function Stamp({ text, rotation = -8 }: StampProps) {
  return (
    <span className={styles.stamp} style={{ ['--stamp-rotation' as string]: `${rotation}deg` }}>
      {text}
    </span>
  );
}
