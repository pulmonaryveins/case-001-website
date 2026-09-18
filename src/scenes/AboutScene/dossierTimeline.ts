import { gsap } from '../../lib/gsap';
import type { CameraState } from '../HeroScene/environment/cameraPath';

type Query = (selector: string) => Element[];

interface Segment {
  /** Timeline position where the dossier segment begins (= end of the desk journey). */
  start: number;
  /** Timeline length of the segment. */
  span: number;
}

/**
 * About (Scene 03): open the dossier and identify the subject.
 * Appended to the pinned, scrubbed stage timeline so it continues the exact
 * desk-arrival frame and reverses for free. Every tween goes TO a known value
 * from a start state defined in CSS (see SubjectFile/Dossier modules).
 *
 *   0.00-0.12  hold on the closed file
 *   0.12-0.46  cover swings open on its spine          (--open)
 *   0.15-0.62  camera leans in over the spread         (inspect)
 *   0.40-0.56  identification photo develops           (--develop)
 *   0.56-0.66  name / role / location typed in
 *   0.66-0.71  UNKNOWN struck through
 *   0.71-0.76  IDENTIFIED stamp lands, status swaps
 *   0.76-0.90  profile, disciplines, skills, education settle
 *   0.90-1.00  hold on the open file
 */
export function addDossierOpening(
  timeline: gsap.core.Timeline,
  q: Query,
  { start, span }: Segment,
  camera: CameraState,
  invalidate: () => void,
) {
  const at = (f: number) => start + f * span;
  const len = (f: number) => f * span;
  const dossier = q('[data-dossier]');

  timeline
    .to(dossier, { '--open': 1, duration: len(0.34), ease: 'power2.inOut' }, at(0.12))
    .to(
      camera,
      { inspect: 1, duration: len(0.47), ease: 'sine.inOut', onUpdate: invalidate },
      at(0.15),
    )
    .to(q('[data-portrait]'), { '--develop': 1, duration: len(0.16) }, at(0.4))
    .to(
      q('[data-reveal="identity"]'),
      { opacity: 1, '--enter-y': '0cqw', duration: len(0.05), stagger: len(0.025) },
      at(0.56),
    )
    .to(q('[data-strike]'), { '--strike': 1, duration: len(0.04), ease: 'power1.in' }, at(0.66))
    .to(q('[data-stamp="unknown"]'), { opacity: 0.32, duration: len(0.04) }, at(0.68))
    .to(
      q('[data-stamp="identified"]'),
      { opacity: 0.85, '--land': 1, duration: len(0.035), ease: 'power3.out' },
      at(0.71),
    )
    .to(
      q('[data-state="pending"]'),
      { opacity: 0, attr: { 'aria-hidden': 'true' }, duration: len(0.03) },
      at(0.72),
    )
    .to(
      q('[data-state="identified"]'),
      { opacity: 1, attr: { 'aria-hidden': 'false' }, duration: len(0.03) },
      at(0.73),
    )
    .to(
      q('[data-reveal="profile"]'),
      { opacity: 1, '--enter-y': '0cqw', duration: len(0.06), stagger: len(0.025) },
      at(0.76),
    );
}

/**
 * Reduced motion: no hinge, no lean, no staged reveal. A short fade to dark,
 * the file is open with everything identified, fade back. Still scrubbed, so
 * it reverses exactly.
 */
export function addDossierCut(
  timeline: gsap.core.Timeline,
  q: Query,
  { start, span }: Segment,
  camera: CameraState,
  invalidate: () => void,
) {
  const at = (f: number) => start + f * span;
  const instant = 0.001;
  timeline
    .to(q('[data-cut]'), { opacity: 1, duration: span * 0.08 }, at(0.34))
    .to(q('[data-dossier]'), { '--open': 1, duration: instant }, at(0.42))
    .to(camera, { inspect: 1, duration: instant, onUpdate: invalidate }, at(0.42))
    .to(q('[data-portrait]'), { '--develop': 1, duration: instant }, at(0.42))
    .to(q('[data-reveal]'), { opacity: 1, '--enter-y': '0cqw', duration: instant }, at(0.42))
    .to(q('[data-strike]'), { '--strike': 1, duration: instant }, at(0.42))
    .to(q('[data-stamp="unknown"]'), { opacity: 0.32, duration: instant }, at(0.42))
    .to(q('[data-stamp="identified"]'), { opacity: 0.85, '--land': 1, duration: instant }, at(0.42))
    .to(
      q('[data-state="pending"]'),
      { opacity: 0, attr: { 'aria-hidden': 'true' }, duration: instant },
      at(0.42),
    )
    .to(
      q('[data-state="identified"]'),
      { opacity: 1, attr: { 'aria-hidden': 'false' }, duration: instant },
      at(0.42),
    )
    .to(q('[data-cut]'), { opacity: 0, duration: span * 0.08 }, at(0.422));
}

/**
 * Mobile / fallback (no pinned stage): the stacked file opens once when it is
 * read, and closes again if the reader scrolls back above it. Time-based, not
 * scrubbed, because the desk panel scrolls in normal flow.
 */
export function createStackedOpening(root: Element, reducedMotion: boolean) {
  const q = gsap.utils.selector(root);
  const opening = gsap
    .timeline({ paused: true, defaults: { ease: 'power2.out' } })
    .to(q('[data-dossier]'), { '--open': 1, duration: 1.1, ease: 'power2.inOut' }, 0)
    .to(q('[data-portrait]'), { '--develop': 1, duration: 0.6 }, 0.5)
    .to(
      q('[data-reveal="identity"]'),
      { opacity: 1, '--enter-y': '0cqw', duration: 0.35, stagger: 0.08 },
      0.7,
    )
    .to(q('[data-strike]'), { '--strike': 1, duration: 0.25, ease: 'power1.in' }, 1.05)
    .to(q('[data-stamp="unknown"]'), { opacity: 0.32, duration: 0.3 }, 1.2)
    .to(
      q('[data-stamp="identified"]'),
      { opacity: 0.85, '--land': 1, duration: 0.3, ease: 'power3.out' },
      1.3,
    )
    .to(
      q('[data-state="pending"]'),
      { opacity: 0, attr: { 'aria-hidden': 'true' }, duration: 0.2 },
      1.35,
    )
    .to(
      q('[data-state="identified"]'),
      { opacity: 1, attr: { 'aria-hidden': 'false' }, duration: 0.2 },
      1.4,
    )
    .to(
      q('[data-reveal="profile"]'),
      { opacity: 1, '--enter-y': '0cqw', duration: 0.4, stagger: 0.1 },
      1.45,
    );
  if (reducedMotion) opening.timeScale(20);
  return opening;
}
