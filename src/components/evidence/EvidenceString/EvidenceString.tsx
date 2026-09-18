import styles from './EvidenceString.module.css';

export interface EvidenceStringProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  sag?: number;
  className?: string;
}

/**
 * Red connecting string between two evidence points, rendered as a single
 * SVG quadratic curve. Positioned absolutely by the caller (parent must be
 * position:relative and sized to the coordinate space `from`/`to` are in).
 */
export function EvidenceString({ from, to, sag = 20, className }: EvidenceStringProps) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 + sag;

  return (
    <svg
      aria-hidden="true"
      className={[styles.string, className].filter(Boolean).join(' ')}
      preserveAspectRatio="none"
    >
      <path
        d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
        fill="none"
        stroke="var(--color-evidence-red)"
        strokeWidth={2}
      />
    </svg>
  );
}
