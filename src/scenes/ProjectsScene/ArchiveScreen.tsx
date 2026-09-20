import { useSyncExternalStore } from 'react';
import { VIDEO_PRELOAD_ACTIVE, VIDEO_PRELOAD_IDLE } from '../../lib/performance';
import { projectCategories } from '../../data/projects';
import { archive as copy } from '../../data/archive';
import type { ProjectArchiveController } from './archiveController';
import { BOOT_LOG } from './archiveController';
import styles from './ArchiveScreen.module.css';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Everything printed inside the CRT glass. This is DOM, not a WebGL texture:
 * the archive is the readable part of the scene, so it keeps real text, real
 * buttons and real links, and the tube's character is applied around it as
 * cheap static overlays (see ArchiveScreen.module.css).
 *
 * Project artwork keeps its own colour — only the terminal chrome is phosphor.
 */
export function ArchiveScreen({ controller }: { controller: ProjectArchiveController }) {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const project = controller.projects[state.active];
  const category = projectCategories.find((entry) => entry.id === project.category);
  const group = controller.siblings(project.category);
  const position = group.indexOf(state.active) + 1;
  const booting = state.boot !== 'ready';

  return (
    <div
      className={styles.screen}
      data-boot={state.boot}
      data-loading={state.loading}
      data-refreshing={state.refreshing}
    >
      <div className={styles.phosphor}>
        {booting ? (
          <BootLog lines={state.bootLine} />
        ) : (
          <>
            <header className={styles.header}>
              <span>{copy.header}</span>
              <span className={styles.counter}>
                {pad(position)}/{pad(group.length)}
              </span>
            </header>
            <h2 className={styles.chapter}>
              <span aria-hidden="true">&gt; </span>
              {category?.label ?? project.category} {copy.chapterSuffix}
            </h2>

            <div className={styles.body}>
              <div className={styles.viewer}>
                <Preview controller={controller} />
                <FrameStrip controller={controller} />
              </div>

              <div className={styles.record}>
                <h3 className={styles.title}>
                  {project.title}
                  {project.subtitle ? ` — ${project.subtitle}` : ''}
                </h3>
                {project.isPlaceholder && <p className={styles.unverified}>{copy.unverified}</p>}
                <p className={styles.description}>{project.description}</p>

                {project.tools.length > 0 && (
                  <section className={styles.tools}>
                    <h4>{copy.tools}</h4>
                    <ul>
                      {project.tools.map((tool, index) => (
                        <li key={`${tool}-${index}`}>{tool}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <ul className={styles.meta}>
                  {project.role && (
                    <li>
                      <span>{copy.role}</span>
                      {project.role}
                    </li>
                  )}
                  {project.year && (
                    <li>
                      <span>{copy.year}</span>
                      {project.year}
                    </li>
                  )}
                </ul>

                <div className={styles.links}>
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer noopener">
                      {copy.liveSite}
                    </a>
                  )}
                  {project.repoUrl && (
                    <a href={project.repoUrl} target="_blank" rel="noreferrer noopener">
                      {copy.source}
                    </a>
                  )}
                  {!project.liveUrl && !project.repoUrl && (
                    <p className={styles.noLinks}>{copy.noLinks}</p>
                  )}
                </div>
              </div>
            </div>

            <footer className={styles.footer}>
              <span>{copy.hint}</span>
              <span className={styles.status} role="status">
                {state.loading ? copy.reading : state.manual ? copy.manual : copy.tour}
              </span>
            </footer>
          </>
        )}
      </div>

      {/* Tube character. Static layers: nothing here animates per frame. */}
      <span className={styles.scanlines} aria-hidden="true" />
      <span className={styles.vignette} aria-hidden="true" />
      <span className={styles.interference} aria-hidden="true" />
    </div>
  );
}

function BootLog({ lines }: { lines: number }) {
  return (
    <pre className={styles.boot} aria-live="polite">
      {BOOT_LOG.slice(0, lines).join('\n')}
      {lines > 0 && lines < BOOT_LOG.length ? '\n' : ''}
      {lines >= BOOT_LOG.length ? '' : <span className={styles.caret} aria-hidden="true" />}
    </pre>
  );
}

/** The preview frame: artwork, or the player once a video record is started. */
function Preview({ controller }: { controller: ProjectArchiveController }) {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const project = controller.projects[state.active];
  const image = project.images[state.image];
  const video = project.video;

  if (video && state.playing) {
    return (
      <div className={styles.preview}>
        {/* Loaded only after the reader pressed play; never autoplayed. */}
        <video
          className={styles.video}
          src={video.src}
          poster={video.posterSrc}
          preload={video.src ? VIDEO_PRELOAD_ACTIVE : VIDEO_PRELOAD_IDLE}
          controls
        >
          {video.captionsSrc && (
            <track kind="captions" src={video.captionsSrc} srcLang="en" label="English" default />
          )}
        </video>
      </div>
    );
  }

  return (
    <div className={styles.preview}>
      {image?.src ? (
        <img
          className={styles.art}
          src={image.src}
          srcSet={image.srcSet}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <p className={styles.missing} role="img" aria-label={image?.alt ?? copy.mediaMissing}>
          <span aria-hidden="true">{copy.mediaMissingCode}</span>
          <small>{copy.mediaMissing}</small>
        </p>
      )}
      {video && !state.playing && (
        <button type="button" className={styles.play} onClick={controller.play}>
          {copy.play}
        </button>
      )}
    </div>
  );
}

/** Contact-sheet frame selector: previous, counter, next, plus the frames. */
function FrameStrip({ controller }: { controller: ProjectArchiveController }) {
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const project = controller.projects[state.active];
  const count = project.images.length;
  if (count < 2) return null;

  return (
    <div className={styles.frames}>
      <button
        type="button"
        className={styles.step}
        onClick={() => controller.stepImage(-1)}
        aria-label={copy.previousFrame}
      >
        <span aria-hidden="true">&lt;</span>
      </button>
      <ul className={styles.thumbs}>
        {project.images.map((frame, index) => (
          <li key={index}>
            <button
              type="button"
              className={styles.thumb}
              aria-pressed={index === state.image}
              aria-label={frame.label ?? `${copy.frame} ${pad(index + 1)}`}
              onClick={() => controller.setImage(index)}
            >
              {frame.src ? (
                <img src={frame.src} alt="" loading="lazy" decoding="async" />
              ) : (
                <span aria-hidden="true">{pad(index + 1)}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <span className={styles.frameCount} aria-hidden="true">
        {pad(state.image + 1)} / {pad(count)}
      </span>
      <button
        type="button"
        className={styles.step}
        onClick={() => controller.stepImage(1)}
        aria-label={copy.nextFrame}
      >
        <span aria-hidden="true">&gt;</span>
      </button>
    </div>
  );
}
