/**
 * Shared performance guardrails. Scene/media components should route
 * through these instead of ad-hoc IntersectionObserver / video-loading
 * logic, so behavior stays consistent across the site.
 */

/**
 * Creates a single reusable IntersectionObserver-based lazy trigger.
 * Prefer this over a new observer per component instance.
 */
export function createLazyObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = { rootMargin: '200px 0px', threshold: 0.1 },
): IntersectionObserver {
  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, options);
}

/**
 * Video elements must never bulk-preload. Only the active/selected video
 * (e.g. an inserted VHS tape) should load beyond metadata.
 */
export const VIDEO_PRELOAD_IDLE = 'none' as const;
export const VIDEO_PRELOAD_ACTIVE = 'metadata' as const;
