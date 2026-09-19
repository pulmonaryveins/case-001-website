import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { EvidenceString, Grain, Paper, PushPin } from '../../components/evidence';
import { dossier as copy } from '../../data/dossier';
import { experience } from '../../data/experience';
import { profile } from '../../data/profile';
import type { Experience } from '../../types/portfolio';
import { AboutPage } from './SubjectFile';
import { DossierPageController } from './pageController';
import styles from './DossierPages.module.css';

interface StackProps {
  controller: DossierPageController;
  /** Straight crossfade instead of a lift: reduced motion, and the stacked file. */
  flat: boolean;
}

/**
 * The right-hand sheets of the open file. The left page is the cover's inside
 * face and is not part of this stack — it never re-renders here.
 *
 * Only a short window of sheets is mounted: page 0 always (the approved
 * opening timeline revealed its contents and must keep those exact targets —
 * remounting it would strand them at their hidden start state), the adjacent
 * pair while scrolling turns between them, the active page, and — briefly —
 * whichever page a direct jump is replacing.
 */
export function DossierPages({ controller, flat }: StackProps) {
  const { base, active, transitionFrom } = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
  );
  const root = useRef<HTMLDivElement>(null);
  const mounted = [...new Set([0, base, base + 1, active, transitionFrom ?? active])]
    .filter((index) => index >= 0 && index < controller.count)
    .sort((a, b) => a - b);
  const key = mounted.join(',');

  useEffect(() => {
    controller.setFlat(flat);
    controller.repaint();
  }, [controller, flat]);

  // Pose is written straight to the DOM on every scrubbed frame; React only
  // re-renders when the mounted window or the owned page changes.
  useLayoutEffect(() => {
    const container = root.current;
    if (!container) return;
    const sheets = [...container.querySelectorAll<HTMLElement>('[data-sheet]')].map((element) => ({
      element,
      index: Number(element.dataset.sheet),
      shade: element.querySelector<HTMLElement>('[data-sheet-shade]'),
      written: '',
    }));

    const paint = () => {
      for (const sheet of sheets) {
        const pose = controller.poseFor(sheet.index);
        const next = `${pose.visible}|${pose.opacity}|${pose.transform}|${pose.order}|${pose.shade}`;
        if (next === sheet.written) continue;
        sheet.written = next;
        const style = sheet.element.style;
        style.visibility = pose.visible ? '' : 'hidden';
        style.transform = pose.transform;
        style.opacity = String(pose.opacity);
        style.zIndex = String(pose.order);
        if (sheet.shade) sheet.shade.style.opacity = String(pose.shade);
      }
    };

    paint();
    return controller.subscribePaint(paint);
  }, [controller, key]);

  return (
    <div className={styles.stack} ref={root} id="dossier-document">
      {mounted.map((index) => (
        <Paper
          key={index}
          className={`${styles.sheet} evidence-light`}
          variant="clean"
          data-sheet={index}
          aria-hidden={index !== active}
          inert={index !== active}
        >
          <PageContent index={index} count={controller.count} />
          <span className={styles.folio} aria-hidden="true">
            {String(index + 1).padStart(2, '0')} / {String(controller.count).padStart(2, '0')}
          </span>
          <span className={styles.shade} data-sheet-shade aria-hidden="true" />
        </Paper>
      ))}
    </div>
  );
}

function PageContent({ index, count }: { index: number; count: number }) {
  if (index === 0) return <AboutPage />;
  if (index === 1) return <EducationPage />;
  const record = experience[index - 2];
  if (!record) return null;
  return <ExperiencePage record={record} number={index - 1} total={count - 2} />;
}

/**
 * Its own full page rather than a card in the corner of the profile: the same
 * typed-form treatment the identification sheet uses, at page scale. Text only —
 * no map, no photograph.
 */
function EducationPage() {
  return (
    <article className={styles.document} aria-labelledby="education-title">
      <p className={styles.kicker}>{copy.education.file}</p>
      <h2 id="education-title" className={styles.title}>
        {copy.education.title}
      </h2>
      {profile.education.map((entry, index) => (
        <section className={styles.record} key={`${entry.institution}-${index}`}>
          <p className={styles.stamped}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            {entry.period}
          </p>
          <dl className={styles.fields}>
            <div>
              <dt>{copy.education.fields.institution}</dt>
              <dd className={styles.lead}>{entry.institution}</dd>
            </div>
            <div>
              <dt>{copy.education.fields.program}</dt>
              <dd>{entry.program}</dd>
            </div>
            <div>
              <dt>{copy.education.fields.period}</dt>
              <dd>{entry.period}</dd>
            </div>
            <div>
              <dt>{copy.education.fields.location}</dt>
              <dd>{entry.location}</dd>
            </div>
          </dl>
          <p className={styles.note}>{copy.education.note}</p>
        </section>
      ))}
    </article>
  );
}

/**
 * One career record per page, from one template. Two prints are attached below
 * the written account — pinned and taped, joined by a short length of string —
 * so the page reads as something an investigator assembled.
 */
function ExperiencePage({
  record,
  number,
  total,
}: {
  record: Experience;
  number: number;
  total: number;
}) {
  const heading = `experience-${record.id}`;
  return (
    <article className={styles.document} aria-labelledby={heading}>
      <p className={styles.kicker}>{copy.experience.file}</p>
      <h2 className={styles.title}>{copy.experience.title}</h2>
      <p className={styles.stamped}>
        <span>{String(number).padStart(2, '0')}</span>
        {record.dateRange}
      </p>
      <h3 className={styles.organization} id={heading}>
        {record.organization}
      </h3>
      <p className={styles.role}>{record.role}</p>
      <p className={styles.description}>{record.description}</p>
      <ul className={styles.highlights}>
        {record.highlights.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <Prints record={record} />
      <h4 className={styles.focusLabel}>{copy.experience.focus}</h4>
      <ul className={styles.focus}>
        {record.focusAreas.map((area, index) => (
          <li key={`${area}-${index}`}>{area}</li>
        ))}
      </ul>
      <p className={styles.counter} aria-hidden="true">
        {String(number).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </p>
    </article>
  );
}

/** Exactly two prints: the first held by a pin, the second by a strip of tape. */
function Prints({ record }: { record: Experience }) {
  return (
    <div className={styles.prints}>
      <EvidenceString
        className={styles.thread}
        from={{ x: 24, y: 4 }}
        to={{ x: 75, y: 3 }}
        sag={10}
        viewBox="0 0 100 100"
      />
      {record.images.map((image, index) => (
        <figure key={index} className={`${styles.print} evidence-light`} data-hold={index}>
          <Grain />
          {index === 0 ? (
            <PushPin className={styles.pin} />
          ) : (
            <span className={styles.tape} aria-hidden="true" />
          )}
          {image.src ? (
            <img
              src={image.src}
              srcSet={image.srcSet}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 70vw, 320px"
            />
          ) : (
            <span className={styles.pending} role="img" aria-label={image.alt}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <small>{copy.experience.imagePending}</small>
            </span>
          )}
          <figcaption>{image.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}

/**
 * Index tabs on the folder edge plus the record counter. Both write through the
 * same controller as scrolling, so the three inputs can never disagree.
 */
export function DossierNavigation({ controller }: { controller: DossierPageController }) {
  const { active, enabled } = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const records = controller.count - 2;
  const onExperience = active >= 2;
  const section = onExperience ? 2 : active;

  return (
    <div
      className={styles.navigation}
      data-enabled={enabled}
      inert={!enabled}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        controller.go(active + (event.key === 'ArrowRight' ? 1 : -1));
      }}
    >
      <nav className={styles.tabs} aria-label={copy.nav.sections}>
        {copy.tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            className={styles.tab}
            aria-pressed={section === index}
            aria-controls="dossier-document"
            onClick={() => controller.go(index)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <nav className={styles.pager} aria-label={copy.nav.pages}>
        <button
          type="button"
          className={styles.step}
          onClick={() => controller.go(active - 1)}
          disabled={active === 0}
          aria-label={copy.nav.previous}
        >
          <span aria-hidden="true">←</span>
        </button>
        <span className={styles.position} aria-live="polite" aria-atomic="true">
          {onExperience
            ? `${copy.tabs[2].label} ${String(active - 1).padStart(2, '0')} / ${String(records).padStart(2, '0')}`
            : copy.tabs[section].label}
        </span>
        <button
          type="button"
          className={styles.step}
          onClick={() => controller.go(active + 1)}
          disabled={active === controller.count - 1}
          aria-label={copy.nav.next}
        >
          <span aria-hidden="true">→</span>
        </button>
      </nav>
    </div>
  );
}
