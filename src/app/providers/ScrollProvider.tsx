import { useEffect, type ReactNode } from 'react';
import { registerGsap, ScrollTrigger } from '../../lib/gsap';
import { createLenis, destroyLenis } from '../../lib/lenis';
import { useReducedMotion } from '../../hooks/useReducedMotion';

registerGsap();

export interface ScrollProviderProps {
  children: ReactNode;
}

/**
 * Owns the single Lenis + ScrollTrigger lifecycle for the whole app. Mount
 * once at the root (see App.tsx) — scenes must never create their own Lenis
 * instance or global scroll listener.
 */
export function ScrollProvider({ children }: ScrollProviderProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    createLenis();
    return () => {
      destroyLenis();
    };
  }, [reducedMotion]);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  return <>{children}</>;
}
