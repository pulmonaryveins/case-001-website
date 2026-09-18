import type { ReactNode } from 'react';
import { Paper } from '../Paper';
import { Stamp } from '../Stamp';
import { PaperClip } from '../PaperClip';
import styles from './Dossier.module.css';

export interface DossierProps {
  caseNumber: string;
  title: string;
  classification: string;
  status: string;
  /** Clipped to the inside of the cover (left of the spine once open). */
  inside?: ReactNode;
  /** Top page of the file (right of the spine once open). */
  pages?: ReactNode;
  /**
   * `spread`: cover hinges on the left spine and lands flat to the left (desk).
   * `stacked`: portrait recomposition — cover lifts off the top edge and the
   * inside + pages read top to bottom (mobile).
   */
  layout?: 'spread' | 'stacked';
  className?: string;
}

/**
 * Physical case folder. Presentation only: its open state is the CSS variable
 * `--open` (0 closed -> 1 open) written by the owning scene's timeline, from
 * which rotation, face lighting, lift shadow and page occlusion are derived.
 */
export function Dossier({
  caseNumber,
  title,
  classification,
  status,
  inside,
  pages,
  layout = 'spread',
  className,
}: DossierProps) {
  return (
    <section
      className={[styles.dossier, className].filter(Boolean).join(' ')}
      data-layout={layout}
      data-dossier
      aria-label={`${caseNumber} ${title}`}
    >
      {/* Back panel, spine and cover share one hinge line (the folder's left edge). */}
      <Paper className={`${styles.back} evidence-light`} variant="manila" aria-hidden="true" />
      <div className={styles.pages}>
        <Paper
          className={`${styles.sheet} evidence-light`}
          variant="clean"
          rotation={0.6}
          aria-hidden="true"
        />
        {layout === 'stacked' && inside && (
          <Paper className={`${styles.page} ${styles.insidePage} evidence-light`} variant="manila">
            {inside}
          </Paper>
        )}
        <Paper className={`${styles.page} evidence-light`} variant="clean" rotation={-0.5}>
          {pages}
        </Paper>
        <span className={styles.pagesShade} aria-hidden="true" />
      </div>
      <span className={styles.liftShadow} aria-hidden="true" />
      <span className={styles.spine} aria-hidden="true" />
      <div className={styles.cover}>
        <Paper className={`${styles.face} ${styles.outside} evidence-light`} variant="manila">
          <Paper className={`${styles.label} evidence-light`} variant="clean" rotation={-0.6}>
            <span className={styles.caseNumber}>{caseNumber}</span>
            <span className={styles.title}>{title}</span>
          </Paper>
          <div className={styles.stamp} aria-hidden="true">
            <Stamp text={classification} rotation={-7} />
          </div>
          <p className={styles.status} aria-hidden="true">
            <span>STATUS:</span> {status}
          </p>
        </Paper>
        {layout === 'spread' && (
          <Paper className={`${styles.face} ${styles.inside} evidence-light`} variant="manila">
            {inside}
          </Paper>
        )}
        {/* One clip on the cover's real top edge (not inside a face's padded
            content box): the front loop faces out, the back loop faces in. */}
        <PaperClip side="front" className={styles.clipOutside} />
        {layout === 'spread' && <PaperClip side="back" className={styles.clipInside} />}
      </div>
    </section>
  );
}
