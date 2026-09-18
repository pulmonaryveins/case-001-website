import { useSyncExternalStore } from 'react';

function subscribe(query: string, callback: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

/**
 * Generic media query hook for responsive scene variants
 * (e.g. useMediaQuery('(max-width: 768px)')).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const BREAKPOINTS = {
  mobile: '(max-width: 640px)',
  tablet: '(max-width: 1024px)',
  desktop: '(min-width: 1025px)',
} as const;
