import type { CameraState } from '../HeroScene/environment/cameraPath';
import type { ProjectArchiveController } from './archiveController';

/**
 * Pinned scroll budget for the archive chapter, in viewport heights. The tour
 * only visits FEATURED records (three per category), so the section's length
 * follows that count rather than the size of the whole archive — the other
 * disks are reached by hand, not by scrolling.
 */
export const archivePaging = {
  /** Camera crossing the desk from the open dossier to the workstation. */
  arrival: 1.3,
  /** Held on the machine while it powers on. */
  boot: 0.9,
  /** Reading time on the first featured record. */
  initialHold: 0.45,
  /** Scroll spent moving between two featured records. */
  advance: 0.26,
  /** Reading time on every subsequent record. */
  hold: 0.42,
  /** Tail after the last record, before the next chapter begins. */
  outro: 0.5,
};

export function archiveScrollLength(featured: number) {
  const steps = Math.max(0, featured - 1);
  return (
    archivePaging.arrival +
    archivePaging.boot +
    archivePaging.initialHold +
    steps * (archivePaging.advance + archivePaging.hold) +
    archivePaging.outro
  );
}

/** Timeline position where the tour begins to move off the first record. */
function tourStart(start: number) {
  return start + archivePaging.arrival + archivePaging.boot + archivePaging.initialHold;
}

/**
 * Appends the project archive to the Hero's single pinned, scrubbed stage
 * timeline — not a timeline or ScrollTrigger of its own. The camera keeps
 * moving along the same desk (`camera.archive`), the machine powers on once
 * (`controller.power` trips the latch), and the scrub then walks the featured
 * tour. Because everything is scrubbed, reverse scrolling replays it exactly
 * and a refresh anywhere in the chapter lands on the matching record.
 */
export function addProjectArchive(
  timeline: gsap.core.Timeline,
  controller: ProjectArchiveController,
  camera: CameraState,
  start: number,
  reduced: boolean,
  invalidate: () => void,
) {
  const featured = controller.featured.length;

  if (reduced) {
    // No camera move: the chapter cuts to the workstation and stays there.
    timeline.to(
      camera,
      { archive: 1, duration: 0.001, onUpdate: invalidate },
      start + archivePaging.arrival * 0.5,
    );
  } else {
    timeline.to(
      camera,
      {
        archive: 1,
        duration: archivePaging.arrival,
        ease: 'sine.inOut',
        onUpdate: invalidate,
      },
      start,
    );
  }

  // Trips at 0.5, shortly before the camera settles, so the tube is already
  // warming as the machine fills the frame.
  timeline.to(
    controller.power,
    {
      value: 1,
      duration: reduced ? 0.001 : archivePaging.arrival * 0.5 + archivePaging.boot,
      ease: 'none',
      onUpdate: controller.applyPower,
    },
    start + archivePaging.arrival * 0.4,
  );

  for (let slot = 1; slot < featured; slot++) {
    const at = tourStart(start) + (slot - 1) * (archivePaging.advance + archivePaging.hold);
    timeline.to(
      controller.tour,
      {
        value: slot,
        duration: reduced ? 0.001 : archivePaging.advance,
        ease: 'none',
        onUpdate: controller.syncFromScroll,
      },
      reduced ? at + archivePaging.advance / 2 : at,
    );
  }

  return { length: archiveScrollLength(featured) };
}
