import { gsap } from '../../lib/gsap';

/**
 * Canonical state for the right-hand page stack. Every navigation path —
 * scrolling, a tab click, an arrow, a keypress — resolves through this one
 * controller; nothing else is allowed to decide which page is active.
 *
 * Two independent mechanisms write `active`, and they never run at once:
 *   scroll    `syncFromScroll` mirrors the pinned stage's scrub position.
 *             Only ever moves to an ADJACENT page, continuously, because
 *             that is physically what scrolling one page's turn zone means.
 *   direct    `go()` (tab / arrow / keyboard) jumps straight to a target,
 *             any distance, with no sweep through the pages in between.
 * `transitionFrom` is non-null only while a direct jump's brief cosmetic
 * replacement is still playing; `syncFromScroll` no-ops while it is set, so
 * a scrub update arriving mid-click can never fight the click.
 *
 * Two subscriber kinds:
 *   painters  - run on every written frame, write transforms straight to the DOM
 *   listeners - React, notified only when active/enabled changes
 * React must never re-render per frame; see ARCHITECTURE.md performance rules.
 */
export interface PageSnapshot {
  /** Floor of the scroll-scrub position — the lower of the adjacent pair mid-scroll. */
  base: number;
  /** The page the reader currently owns — what tabs, counter and a11y report. */
  active: number;
  /** Navigation is only interactive once the file has finished opening. */
  enabled: boolean;
  /** Non-null only while a direct jump's replacement is still settling. */
  transitionFrom: number | null;
}

export class DossierPageController {
  readonly count: number;
  /** Scroll-scrub position (0..count-1). Written by the pinned stage's tweens. */
  readonly motion = { value: 0 };
  /** 0 -> 1 as the file finishes opening; gates the navigation. */
  readonly gate = { value: 0 };
  /** 0 -> 1 progress of the current direct-jump replacement; cosmetic only. */
  private readonly replace = { value: 0 };
  private replaceTween: gsap.core.Tween | null = null;
  /** Reduced motion, and the stacked mobile panel: no lift, a plain crossfade. */
  private flat = false;

  private snapshot: PageSnapshot = { base: 0, active: 0, enabled: false, transitionFrom: null };
  private listeners = new Set<() => void>();
  private painters = new Set<() => void>();
  private navigate: ((index: number) => void) | null = null;

  constructor(count: number) {
    this.count = count;
  }

  getSnapshot = () => this.snapshot;

  subscribe = (notify: () => void) => {
    this.listeners.add(notify);
    return () => {
      this.listeners.delete(notify);
    };
  };

  subscribePaint = (paint: () => void) => {
    this.painters.add(paint);
    return () => {
      this.painters.delete(paint);
    };
  };

  /**
   * Scroll-driven mode: `navigate` moves the real scroll position to wherever
   * `index` already resolves to on the stage timeline — instantly, never
   * animated — so a tab click and a scroll always agree on where "page N" is.
   * Without it (mobile / fallback, no pinned stage) `go()` sets `motion.value`
   * directly.
   */
  connect(navigate: (index: number) => void) {
    this.navigate = navigate;
    return () => {
      if (this.navigate === navigate) this.navigate = null;
    };
  }

  setFlat(flat: boolean) {
    if (this.flat === flat) return;
    this.flat = flat;
    this.paint();
  }

  /** Fallback layouts have no opening scrub to raise the gate. */
  setEnabled = (enabled: boolean) => {
    this.gate.value = enabled ? 1 : 0;
    this.applyGate();
  };

  /** Bound to the scrubbed gate tween's onUpdate. */
  applyGate = () => {
    const enabled = this.gate.value > 0.5;
    if (enabled !== this.snapshot.enabled) {
      this.snapshot = { ...this.snapshot, enabled };
      this.notify();
    }
  };

  /**
   * Bound to the stage timeline's per-page tweens' onUpdate. Mirrors the
   * scrubbed `motion.value` onto the snapshot — but never while a direct
   * jump's replacement is still settling, so the two can't disagree about
   * which page is active mid-transition.
   */
  syncFromScroll = () => {
    if (this.snapshot.transitionFrom != null) return;
    const value = Math.min(this.count - 1, Math.max(0, this.motion.value));
    const base = Math.floor(value + 1e-7);
    const active = Math.min(this.count - 1, Math.floor(value + 0.5));
    if (base !== this.snapshot.base || active !== this.snapshot.active) {
      this.snapshot = { ...this.snapshot, base, active };
      this.notify();
    }
    this.paint();
  };

  /**
   * Direct navigation: tab, arrow or keyboard. Jumps straight to `index` —
   * never a multi-second sweep through the pages in between — and plays one
   * short, purely cosmetic replacement (see `pose`) from wherever the reader
   * currently is. A second call while one is still settling kills it and
   * retargets cleanly from the page that was actually on screen; it never
   * queues or stacks.
   */
  go = (index: number) => {
    const target = Math.max(0, Math.min(this.count - 1, index));
    const from = this.snapshot.transitionFrom ?? this.snapshot.active;
    if (target === from && this.snapshot.transitionFrom == null) return;
    this.replaceTween?.kill();

    // Set state — and only then move the scroll/motion value — so a
    // synchronous ScrollTrigger.update() inside `navigate` sees
    // transitionFrom already set and skips its own no-op update.
    const settled = target === from;
    this.snapshot = {
      ...this.snapshot,
      base: target,
      active: target,
      transitionFrom: settled ? null : from,
    };
    this.notify();

    if (this.navigate) this.navigate(target);
    else this.motion.value = target;

    if (settled) {
      this.paint();
      return;
    }
    this.replace.value = 0;
    this.replaceTween = gsap.to(this.replace, {
      value: 1,
      // Deliberately slow: long enough to read as one sheet being lifted out
      // and another settling in, not a snap. Reduced motion keeps the short,
      // simple crossfade — never this heavier physical movement.
      duration: this.flat ? 0.15 : 0.78,
      ease: this.flat ? 'power1.out' : 'power2.inOut',
      onUpdate: this.paint,
      onComplete: () => {
        this.replaceTween = null;
        this.snapshot = { ...this.snapshot, transitionFrom: null };
        this.notify();
      },
    });
  };

  /** Force a repaint without moving anything — used when `flat` changes live. */
  repaint = () => this.paint();

  private notify() {
    this.listeners.forEach((notify) => notify());
  }

  private paint = () => {
    this.painters.forEach((paint) => paint());
  };

  /** Pose for sheet `index` right now — the only place any of this reads from. */
  poseFor(index: number): PagePose {
    const { active, transitionFrom } = this.snapshot;
    if (transitionFrom != null) {
      const t = this.replace.value;
      // The very first paint of a jump (t === 0, before the tween has ticked
      // even once) still shows the literal resting page — no transform is
      // ever written before there is actually something to animate.
      if (t === 0) return index === transitionFrom ? RESTING : HIDDEN;
      const pose = this.flat ? flatPose : replacePose;
      if (index === transitionFrom) return pose('outgoing', t);
      if (index === active) return pose('incoming', t);
      return HIDDEN;
    }
    return scrubPose(index, this.motion.value, this.flat, this.count);
  }
}

/**
 * Page order: About, Education, then one page per experience record. The
 * count follows the data — a new record adds a page, renumbers the counter
 * and lengthens the pinned scroll with no other change.
 */
export const pageCount = (records: number) => 2 + records;

/**
 * Pinned scroll budget per page, in viewport heights: a page is read (`hold`)
 * and then turned (`turn`). `initialHold` is the first page's read. This is
 * scroll-distance bookkeeping only — it has no bearing on when the
 * navigation tabs arm (see `dossierPagesTimeline.ts`).
 */
export const paging = { initialHold: 0.3, hold: 0.6, turn: 0.4 };

/** Total scroll length the page stack adds to the pinned stage. */
export function pageScrollLength(count: number) {
  return paging.initialHold + Math.max(0, count - 1) * (paging.turn + paging.hold);
}

/** Timeline position where the turn onto `index` begins (index >= 1). */
export function turnStart(index: number) {
  return paging.initialHold + (index - 1) * (paging.turn + paging.hold);
}

/** Timeline position where `index` sits flat and read — the target of a direct jump. */
export function pageStop(index: number) {
  if (index <= 0) return paging.initialHold / 2;
  return turnStart(index) + paging.turn + paging.hold / 2;
}

export interface PagePose {
  visible: boolean;
  opacity: number;
  transform: string;
  order: number;
  /** Opacity of the sheet's shade overlay — the page above casting onto it. */
  shade: number;
}

/**
 * Literal, empty-transform resting states. Returned by value whenever a sheet
 * is truly at rest (not mid-turn, not mid-jump) — never a mathematically-equal
 * but still-present `translate3d(0,0,0) scale(1) rotate(0)` string. A resting
 * sheet keeps its filter (the lamp response) but carries no transform at all,
 * so the browser has no reason to keep it on its own composited/rasterized
 * layer: a transform present at rest — even an identity one — is exactly the
 * kind of thing that can leave GPU-scaled, softened text sitting under an
 * already fractionally-scaled projected plane.
 */
const RESTING: PagePose = { visible: true, opacity: 1, transform: '', order: 1, shade: 0 };
const HIDDEN: PagePose = { visible: false, opacity: 0, transform: '', order: 0, shade: 0 };

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Fraction of the turn where the outgoing/incoming opacities cross over. Wide
 * enough that the two sheets' motion visibly overlaps (the incoming sheet is
 * already emerging while the outgoing one is still on its way out — not
 * "outgoing finishes, then incoming starts"), but still complementary
 * (outgoing + incoming opacity always sums to 1 inside the band), so it reads
 * as one graceful dissolve between two positions, never two independently
 * fully-opaque pages of text sitting on screen together.
 */
const FADE_LOW = 0.3;
const FADE_HIGH = 0.62;

/**
 * Back-stack replacement, not a page flip: the outgoing sheet lifts a little,
 * shifts a small, fixed pixel distance toward the upper-left and recedes in
 * Z; it never rotates past a couple of degrees and never grows, so it can't
 * read as a giant translucent page hovering over the folder. The incoming
 * sheet only shifts a smaller distance into its resting position. Fixed
 * pixel offsets (not percent) so the motion reads the same regardless of the
 * sheet's own rendered size, matching how every other depth offset in this
 * folder (the spine, the cover's lift) is already expressed.
 * Transform and opacity only; the "shadow" is a cheap opacity-only overlay
 * (see `.shade` in DossierPages.module.css), never an animated box-shadow.
 */
function replacePose(role: 'outgoing' | 'incoming', turn: number): PagePose {
  const t = clamp01(turn);
  if (role === 'outgoing') {
    if (t >= 0.999) return HIDDEN;
    const fade =
      t <= FADE_LOW ? 1 : t >= FADE_HIGH ? 0 : 1 - (t - FADE_LOW) / (FADE_HIGH - FADE_LOW);
    return {
      visible: fade > 0.001,
      opacity: fade,
      transform: `translate3d(${-20 * t}px, ${-13 * t}px, ${10 * t}px) scale(${1 - 0.015 * t}) rotate(${-1.3 * t}deg)`,
      order: t < 0.5 ? 3 : 1,
      shade: Math.sin(t * Math.PI) * 0.12,
    };
  }
  const fade = t <= FADE_LOW ? 0 : t >= FADE_HIGH ? 1 : (t - FADE_LOW) / (FADE_HIGH - FADE_LOW);
  const r = 1 - t;
  return {
    visible: fade > 0.001,
    opacity: fade,
    transform: `translate3d(${r * 12}px, ${r * 9}px, 0) scale(${1 - r * 0.012}) rotate(${r * 0.5}deg)`,
    order: t < 0.5 ? 2 : 3,
    shade: r * 0.09,
  };
}

/** Reduced motion / stacked mobile: a plain, brief crossfade, no transform at all. */
function flatPose(role: 'outgoing' | 'incoming', turn: number): PagePose {
  const t = clamp01(turn);
  if (role === 'outgoing')
    return { visible: t < 1, opacity: 1 - t, transform: '', order: 1, shade: 0 };
  return { visible: t > 0, opacity: t, transform: '', order: 2, shade: 0 };
}

/**
 * Resting/scrubbing pose for sheet `index` from the continuous scroll
 * position. At exact rest (turn === 0, not just close to it) this returns
 * the literal `RESTING`/`HIDDEN` values — see the comment on them above.
 */
function scrubPose(index: number, value: number, flat: boolean, count: number): PagePose {
  const active = Math.min(count - 1, Math.floor(value + 0.5));
  if (flat) return index === active ? RESTING : HIDDEN;
  const base = Math.floor(value + 1e-7);
  const turn = clamp01(value - base);
  if (turn === 0) return index === base ? RESTING : HIDDEN;
  if (index !== base && index !== base + 1) return HIDDEN;
  return replacePose(index === base ? 'outgoing' : 'incoming', turn);
}
