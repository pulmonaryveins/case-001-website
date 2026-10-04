import { useSyncExternalStore } from 'react';
import { archive as copy } from '../../data/archive';
import { projectCategories } from '../../data/projects';
import type { ProjectArchiveController } from './archiveController';
import styles from './DiskArchive.module.css';

/** Semantic labels are projected independently onto their physical disk faces. */
export function DiskArchive({ controller }: { controller: ProjectArchiveController }) {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  return (
    <div className={styles.archive} inert={!state.enabled} aria-label={copy.disks}>
      <span
        data-archive-label={controller.projects.length + projectCategories.length}
        className={styles.plate}
      >
        {copy.inventory}
      </span>
      <span
        data-archive-label={controller.projects.length + projectCategories.length + 1}
        className={styles.plate}
      >
        {copy.inventory}
        <small>{copy.caseLabel}</small>
      </span>
      {projectCategories.map((category, column) => (
        <section key={category.id} className={styles.column}>
          <button
            type="button"
            data-archive-label={controller.projects.length + column}
            className={styles.divider}
            aria-pressed={controller.active.category === category.id}
            onClick={() => controller.selectCategory(category.id)}
          >
            {category.label}
          </button>
          {controller.siblings(category.id).map((index) => {
            const project = controller.projects[index];
            return (
              <button
                type="button"
                key={project.id}
                data-archive-label={index}
                data-disk={index}
                className={styles.disk}
                aria-label={`${project.title}, ${project.archiveNumber}`}
                aria-pressed={state.active === index}
                onPointerEnter={() => controller.hover(index)}
                onPointerLeave={() => controller.hover(-1)}
                onFocus={() => controller.hover(index)}
                onBlur={() => controller.hover(-1)}
                onClick={() => controller.select(index)}
              >
                <span>{project.title.replace(' Project ', ' ')}</span>
                <small>{project.archiveNumber}</small>
              </button>
            );
          })}
        </section>
      ))}
    </div>
  );
}
