import { gsap } from '../../lib/gsap';
import type { Project, ProjectCategory } from '../../types/portfolio';

export type BootStage = 'off' | 'booting' | 'ready';

export interface ArchiveSnapshot {
  boot: BootStage;
  /** Lines of the boot log revealed so far. */
  bootLine: number;
  /** Index into the full archive of the record on screen. */
  active: number;
  /** Index into the active record's images. */
  image: number;
  /** Reading the archive: the disk swap is mid-flight. */
  loading: boolean;
  /** A shorter blip used when only the preview frame changes. */
  refreshing: boolean;
  /** The reader's own selection is currently overriding the scrolled tour. */
  manual: boolean;
  /** Controls are armed (the machine has finished booting). */
  enabled: boolean;
  /** Video records only, and only once the reader asks for it. */
  playing: boolean;
}

/** Terminal lines printed during power-on. Short: this plays once per visit. */
export const BOOT_LOG = [
  'CASE 0926 ARCHIVE SYSTEM',
  'INITIALIZING STORAGE...',
  'CHECKING MEDIA INDEX...',
  'VERIFYING SUBJECT ACCESS...',
  'ARCHIVE FOUND.',
  'ACCESS GRANTED.',
  'LOADING PROJECT RECORDS...',
];

const clamp = (n: number, max: number) => Math.max(0, Math.min(max, n));

/**
 * Canonical state for the project archive workstation.
 *
 * Two things can change what the CRT shows, and they must never fight:
 *
 *   scroll   The pinned stage scrubs `tour.value` across the FEATURED records
 *            (at most three per category). `syncFromScroll` only acts when the
 *            rounded slot actually changes, so a scroll jiggle does nothing.
 *   manual   A disk, a divider or an arrow. This sets `manual` and records the
 *            tour slot it happened on. The scrolled tour then leaves the screen
 *            alone until the reader scrolls far enough to reach a DIFFERENT
 *            slot — at which point they have clearly moved on, and the tour
 *            takes over again. So a manual pick is never yanked away by the
 *            next scroll frame, and the reader is never stuck with it either.
 *
 * Boot is latched: it plays once and never replays on reverse scrolling.
 * Per-frame values (`glow`) are read by the 3D light; React is notified only
 * when something a person can see in the markup actually changes.
 */
export class ProjectArchiveController {
  readonly projects: Project[];
  /** Indices into `projects` that the scrolled tour visits, in category order. */
  readonly featured: number[];
  /** Scrubbed featured slot (0 .. featured.length - 1). */
  readonly tour = { value: 0 };
  /** Scrubbed 0 -> 1 as the workstation comes into frame; trips the boot. */
  readonly power = { value: 0 };
  /** CRT emission, read by the 3D screen light each frame. */
  readonly glow = { value: 0 };

  private snapshot: ArchiveSnapshot = {
    boot: 'off',
    bootLine: 0,
    active: 0,
    image: 0,
    loading: false,
    refreshing: false,
    manual: false,
    enabled: false,
    playing: false,
  };
  private listeners = new Set<() => void>();
  private invalidate: (() => void) | null = null;
  private bootTimeline: gsap.core.Timeline | null = null;
  private loadTimeline: gsap.core.Timeline | null = null;
  private refreshTween: gsap.core.Tween | null = null;
  private booted = false;
  private reduced = false;
  private slot = 0;
  private manualSlot = -1;

  constructor(projects: Project[], categories: readonly ProjectCategory[]) {
    this.projects = projects;
    this.featured = categories.flatMap((category) =>
      projects.reduce<number[]>((found, project, index) => {
        if (project.category === category && project.featured) found.push(index);
        return found;
      }, []),
    );
    this.snapshot.active = this.featured[0] ?? 0;
  }

  getSnapshot = () => this.snapshot;

  subscribe = (notify: () => void) => {
    this.listeners.add(notify);
    return () => {
      this.listeners.delete(notify);
    };
  };

  /** Lets the controller ask the demand-driven renderer for a frame. */
  connect(invalidate: () => void) {
    this.invalidate = invalidate;
    return () => {
      if (this.invalidate === invalidate) this.invalidate = null;
    };
  }

  setReducedMotion(reduced: boolean) {
    this.reduced = reduced;
  }

  get active(): Project {
    return this.projects[this.snapshot.active];
  }

  /** Records sharing the active record's category, for the counter and arrows. */
  siblings(category: ProjectCategory) {
    return this.projects.reduce<number[]>((found, project, index) => {
      if (project.category === category) found.push(index);
      return found;
    }, []);
  }

  /** Bound to the scrubbed power tween: trips the boot once, drives the glow. */
  applyPower = () => {
    if (this.snapshot.boot === 'ready') this.glow.value = Math.max(0.25, this.power.value);
    this.invalidate?.();
    if (this.booted || this.power.value < 0.5) return;
    this.booted = true;
    this.boot();
  };

  /** Bound to the scrubbed tour tween. Only acts when the rounded slot moves. */
  syncFromScroll = () => {
    if (!this.featured.length || this.snapshot.boot === 'off') return;
    const slot = clamp(Math.round(this.tour.value), this.featured.length - 1);
    if (slot === this.slot) return;
    this.slot = slot;
    // A manual pick survives until the reader scrolls on to a different slot.
    if (this.snapshot.manual) {
      if (slot === this.manualSlot) return;
      this.snapshot = { ...this.snapshot, manual: false };
    }
    // Scrolled through the power-on: swap straight to the record so the boot
    // is never interrupted, and let it finish on the right one.
    if (this.snapshot.boot !== 'ready') {
      this.snapshot = { ...this.snapshot, active: this.featured[slot], image: 0, playing: false };
      this.notify();
      return;
    }
    this.load(this.featured[slot]);
  };

  /** Disk, divider or arrow: the reader's choice takes the screen. */
  select = (index: number) => {
    const target = clamp(index, this.projects.length - 1);
    this.manualSlot = this.slot;
    if (target === this.snapshot.active && !this.snapshot.loading) {
      this.snapshot = { ...this.snapshot, manual: true };
      this.notify();
      return;
    }
    this.snapshot = { ...this.snapshot, manual: true };
    this.load(target);
  };

  /** Divider tab: opens that drawer at its first disk. */
  selectCategory = (category: ProjectCategory) => {
    const first = this.projects.findIndex((project) => project.category === category);
    if (first >= 0) this.select(first);
  };

  /** Previous/next disk within the active record's own category. */
  stepProject = (direction: 1 | -1) => {
    const group = this.siblings(this.active.category);
    const at = group.indexOf(this.snapshot.active);
    const next = group[at + direction];
    if (next !== undefined) this.select(next);
  };

  setImage = (index: number) => {
    const count = this.active.images.length;
    if (!count) return;
    const target = clamp(index, count - 1);
    if (target === this.snapshot.image) return;
    this.refreshTween?.kill();
    this.snapshot = { ...this.snapshot, image: target, refreshing: !this.reduced };
    this.notify();
    if (this.reduced) return;
    // Short luminance dip only — the frame is already swapped underneath it.
    this.glow.value = 0.7;
    this.invalidate?.();
    this.refreshTween = gsap.to(this.glow, {
      value: 1,
      duration: 0.22,
      ease: 'power2.out',
      onUpdate: () => this.invalidate?.(),
      onComplete: () => {
        this.refreshTween = null;
        this.snapshot = { ...this.snapshot, refreshing: false };
        this.notify();
      },
    });
  };

  stepImage = (direction: 1 | -1) => {
    const count = this.active.images.length;
    if (count < 2) return;
    this.setImage((this.snapshot.image + direction + count) % count);
  };

  /** Video records: nothing is fetched until this runs. */
  play = () => {
    if (!this.active.video || this.snapshot.playing) return;
    this.snapshot = { ...this.snapshot, playing: true };
    this.notify();
  };

  destroy() {
    this.bootTimeline?.kill();
    this.loadTimeline?.kill();
    this.refreshTween?.kill();
    this.bootTimeline = null;
    this.loadTimeline = null;
    this.refreshTween = null;
  }

  /**
   * Power-on. Roughly 2.2s of terminal, or effectively instant under reduced
   * motion. Latched by `applyPower`, so reverse scrolling never replays it.
   */
  private boot() {
    this.bootTimeline?.kill();
    if (this.reduced) {
      this.glow.value = 1;
      this.snapshot = {
        ...this.snapshot,
        boot: 'ready',
        bootLine: BOOT_LOG.length,
        enabled: true,
      };
      this.notify();
      this.invalidate?.();
      this.syncFromScroll();
      return;
    }
    this.snapshot = { ...this.snapshot, boot: 'booting', bootLine: 0 };
    this.notify();

    const log = { line: 0 };
    const timeline = gsap.timeline({
      onUpdate: () => this.invalidate?.(),
      onComplete: () => {
        this.bootTimeline = null;
        this.snapshot = { ...this.snapshot, boot: 'ready', enabled: true };
        this.notify();
      },
    });
    // Electrical flash, then the tube settles to its working brightness.
    timeline
      .fromTo(this.glow, { value: 0 }, { value: 1.35, duration: 0.14, ease: 'power3.out' }, 0)
      .to(this.glow, { value: 0.62, duration: 0.18, ease: 'power2.inOut' }, 0.14)
      .to(this.glow, { value: 1, duration: 0.5, ease: 'power1.inOut' }, 0.4)
      .to(
        log,
        {
          line: BOOT_LOG.length,
          duration: 1.5,
          ease: `steps(${BOOT_LOG.length})`,
          onUpdate: () => {
            const line = Math.round(log.line);
            if (line === this.snapshot.bootLine) return;
            this.snapshot = { ...this.snapshot, bootLine: line };
            this.notify();
          },
        },
        0.45,
      );
    this.bootTimeline = timeline;
  }

  /**
   * Disk swap: brightness dips, the record is exchanged behind the dip, then
   * the tube comes back. ~0.6s. A second request kills this one and retargets,
   * so rapid clicking can never stack loads or strand `loading`.
   */
  private load(index: number) {
    const target = clamp(index, this.projects.length - 1);
    this.loadTimeline?.kill();
    this.refreshTween?.kill();
    this.refreshTween = null;

    if (this.reduced) {
      this.snapshot = {
        ...this.snapshot,
        active: target,
        image: 0,
        playing: false,
        loading: false,
      };
      this.notify();
      return;
    }

    this.snapshot = { ...this.snapshot, loading: true };
    this.notify();
    const timeline = gsap.timeline({
      onUpdate: () => this.invalidate?.(),
      onComplete: () => {
        this.loadTimeline = null;
        this.snapshot = { ...this.snapshot, loading: false };
        this.notify();
      },
    });
    timeline
      .to(this.glow, { value: 0.5, duration: 0.16, ease: 'power2.in' }, 0)
      .add(() => {
        this.snapshot = { ...this.snapshot, active: target, image: 0, playing: false };
        this.notify();
      }, 0.2)
      .to(this.glow, { value: 1, duration: 0.3, ease: 'power2.out' }, 0.28)
      .to({}, { duration: 0.06 }, 0.54);
    this.loadTimeline = timeline;
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}
