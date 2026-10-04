/** Reload-only restoration of the current archive reading position, in timeline units. */
const key = 'case0926.archive-position';
export function readArchivePosition(): number | null {
  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const saved = sessionStorage.getItem(key);
    const value = saved === null ? NaN : Number(saved);
    return navigation?.type === 'reload' && Number.isFinite(value) && value > 0 ? value : null;
  } catch { return null; }
}
export function saveArchivePosition(value: number | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, String(value));
  } catch { /* Storage may be unavailable; ordinary navigation still works. */ }
}
