import { getLenis } from '../../lib/lenis';
import { ScrollTrigger } from '../../lib/gsap';
import {
  DossierPageController,
  paging,
  pageScrollLength,
  pageStop,
  turnStart,
} from './pageController';

/** How long the gate takes to rise once armed — a quick settle, not a reveal. */
const GATE_RISE = 0.16;

/**
 * Appends the right-hand page progression to the Hero's single pinned, scrubbed
 * stage timeline — it is not a timeline or ScrollTrigger of its own. Because it
 * is scrubbed, reverse scrolling replays every turn backwards for free and a
 * refresh at any scroll position lands on the matching page.
 *
 * `start` is the timeline position where reading begins (the page-turning
 * budget: About's hold, then each further page's turn+hold). `revealedAt` is
 * the earlier, separate position where the dossier's own opening reveal has
 * actually finished — the navigation tabs arm there, not at `start`, so they
 * are already live the moment the file is readable rather than only once its
 * trailing hold has fully played out.
 */
export function addDossierPages(
  timeline: gsap.core.Timeline,
  controller: DossierPageController,
  start: number,
  revealedAt: number,
  reduced: boolean,
) {
  const length = pageScrollLength(controller.count);
  const total = start + length;

  timeline.to(
    controller.gate,
    {
      value: 1,
      duration: reduced ? 0.001 : GATE_RISE,
      ease: 'none',
      onUpdate: controller.applyGate,
    },
    revealedAt,
  );

  for (let index = 1; index < controller.count; index++) {
    const at = start + turnStart(index);
    timeline.to(
      controller.motion,
      {
        value: index,
        duration: reduced ? 0.001 : paging.turn,
        ease: 'none',
        onUpdate: controller.syncFromScroll,
      },
      // Reduced motion swaps the sheet at the midpoint of the same scroll
      // budget, so page positions stay identical in both modes.
      reduced ? at + paging.turn / 2 : at,
    );
  }

  // Direct navigation moves the scroll INSTANTLY to the position that already
  // represents that page — never an animated scroll. An animated scroll would
  // sweep the scrub through every page in between (visually indistinguishable
  // from a multi-page flip) and could be interrupted mid-flight by real user
  // scrolling, leaving the controller and the scroll position disagreeing.
  // The controller has already set its own state by the time this runs (see
  // `go()`); this only has to make the real scroll position agree with it.
  const disconnect = controller.connect((index) => {
    const trigger = timeline.scrollTrigger;
    if (!trigger || trigger.end <= trigger.start) return;
    const y = trigger.start + ((start + pageStop(index)) / total) * (trigger.end - trigger.start);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else window.scrollTo({ top: y });
    ScrollTrigger.update();
  });

  return { length, disconnect };
}
