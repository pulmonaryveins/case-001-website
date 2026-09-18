import styles from './CaseLabel.module.css';

export interface CaseLabelProps {
  caseNumber: string;
  title: string;
}

/** Torn-paper style label used on folders, tapes, and archive tiles. */
export function CaseLabel({ caseNumber, title }: CaseLabelProps) {
  return (
    <div className={styles.label}>
      <span className={styles.caseNumber}>{caseNumber}</span>
      <span className={styles.title}>{title}</span>
    </div>
  );
}
