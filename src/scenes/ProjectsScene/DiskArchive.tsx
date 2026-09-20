import { useSyncExternalStore } from 'react';
import { archive as copy } from '../../data/archive';
import { projectCategories } from '../../data/projects';
import type { ProjectArchiveController } from './archiveController';
import styles from './DiskArchive.module.css';

/**
 * The physical half of the scene: a rugged archive case standing beside the
 * monitor, its disks split behind four typed category dividers.
 *
 * This is the full archive — every record has a disk here, including the ones
 * the scrolled tour never stops at. Selecting one is a manual choice and the
 * controller latches it, so the tour cannot pull the screen away underneath
 * the reader (see archiveController).
 */
export function DiskArchive({ controller }: { controller: ProjectArchiveController }) {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const active = controller.projects[state.active];
  const disks = controller.siblings(active.category);

  return (
    <div className={styles.case} data-enabled={state.enabled} inert={!state.enabled}>
      <span className={styles.handle} aria-hidden="true" />
      <span className={styles.caseLabel} aria-hidden="true">
        {copy.caseLabel}
      </span>

      <nav className={styles.dividers} aria-label={copy.dividers}>
        {projectCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={styles.divider}
            aria-pressed={category.id === active.category}
            onClick={() => controller.selectCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </nav>

      <ul
        className={styles.disks}
        aria-label={copy.disks}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
          event.preventDefault();
          controller.stepProject(event.key === 'ArrowDown' ? 1 : -1);
        }}
      >
        {disks.map((index) => {
          const project = controller.projects[index];
          const [, number = ''] = project.archiveNumber.split('/');
          return (
            <li key={project.id}>
              <button
                type="button"
                className={styles.disk}
                aria-pressed={index === state.active}
                onClick={() => controller.select(index)}
              >
                <span className={styles.shutter} aria-hidden="true" />
                <span className={styles.sticker}>
                  <span className={styles.title}>{project.title}</span>
                  <span className={styles.subtitle}>— {project.subtitle}</span>
                </span>
                <span className={styles.number} aria-hidden="true">
                  {number.trim()}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.pager}>
        <button
          type="button"
          className={styles.step}
          onClick={() => controller.stepProject(-1)}
          disabled={disks.indexOf(state.active) <= 0}
          aria-label={copy.previousProject}
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          className={styles.step}
          onClick={() => controller.stepProject(1)}
          disabled={disks.indexOf(state.active) >= disks.length - 1}
          aria-label={copy.nextProject}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <p className={styles.note} aria-hidden="true">
        {copy.caseNote}
      </p>
    </div>
  );
}
