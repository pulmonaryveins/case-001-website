import styles from './PaperClip.module.css';

export interface PaperClipProps {
  /**
   * Which side of the gripped edge this face shows:
   * `front` — the long outer loop, its free end on the surface, rising over the edge;
   * `back`  — the short inner loop that comes down behind the edge.
   * Mount `front` on one face and `back` on the other face of the same sheet.
   */
  side: 'front' | 'back';
  className?: string;
}

/*
 * One wire, drawn in edge coordinates: the gripped edge is the line y = 10.
 * Everything above it is the bend in the air over the edge (identical on both
 * sides); everything below it lies on that side's surface.
 */
const wire = {
  front: 'M4 20V56a6 6 0 0 0 12 0V6a4 4 0 0 0-8 0v4',
  back: 'M16 10V6a4 4 0 0 0-8 0v40a3.5 3.5 0 0 0 7 0V18',
};
const highlight = {
  front: 'M16 14v38',
  back: 'M8 14v30',
};

/**
 * A steel paper clip gripping an edge, seen from one side. Place the component
 * so its top 10/64 sits above the edge it grips (see `.clip` translate).
 */
export function PaperClip({ side, className }: PaperClipProps) {
  return (
    <svg
      className={[styles.clip, className].filter(Boolean).join(' ')}
      viewBox="0 0 20 64"
      data-side={side}
      aria-hidden="true"
    >
      <path className={styles.wire} d={wire[side]} />
      <path className={styles.highlight} d={highlight[side]} />
    </svg>
  );
}
