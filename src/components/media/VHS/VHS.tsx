import styles from './VHS.module.css';

export interface VHSProps {
  tapeNumber: string;
  title: string;
  onSelect?: () => void;
  selected?: boolean;
}

/**
 * A selectable VHS tape. Selecting it is the trigger a scene wires to the
 * "insert into VCR" GSAP timeline — this component only renders the tape
 * and reports intent, it does not own playback state.
 */
export function VHS({ tapeNumber, title, onSelect, selected = false }: VHSProps) {
  return (
    <button type="button" className={styles.tape} onClick={onSelect} aria-pressed={selected}>
      <span className={styles.tapeNumber}>{tapeNumber}</span>
      <span className={styles.title}>{title}</span>
    </button>
  );
}
