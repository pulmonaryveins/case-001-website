import type { SceneId } from '../../../store/investigationStore';
import styles from './CaseProgress.module.css';

export interface CaseProgressStep {
  id: SceneId;
  label: string;
}

export interface CaseProgressProps {
  steps: CaseProgressStep[];
  currentIndex: number;
  onSelect?: (step: CaseProgressStep) => void;
}

/**
 * Persistent case-progress indicator — "CASE 0926  03/07  MENU" with a
 * string-styled progress line. Not a conventional navbar; keep it slim.
 */
export function CaseProgress({ steps, currentIndex, onSelect }: CaseProgressProps) {
  return (
    <nav className={styles.bar} aria-label="Investigation progress">
      <span className={styles.caseId}>CASE 0926</span>
      <ol className={styles.steps}>
        {steps.map((step, index) => (
          <li key={step.id}>
            <button
              type="button"
              className={styles.step}
              data-active={index === currentIndex}
              aria-current={index === currentIndex ? 'step' : undefined}
              onClick={() => onSelect?.(step)}
            >
              {step.label}
            </button>
          </li>
        ))}
      </ol>
      <span className={styles.counter}>
        {String(currentIndex + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
      </span>
    </nav>
  );
}
