import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';

let lenisInstance: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;

/**
 * Creates the single Lenis smooth-scroll instance and wires it into GSAP's
 * ticker so ScrollTrigger and Lenis stay in sync on one rAF loop.
 * Call once from app/providers (e.g. a ScrollProvider), never per-scene.
 */
export function createLenis(): Lenis {
  if (lenisInstance) return lenisInstance;

  const lenis = new Lenis({
    autoRaf: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  tickerCallback = (time) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  lenisInstance = lenis;
  return lenis;
}

export function destroyLenis() {
  if (tickerCallback) gsap.ticker.remove(tickerCallback);
  tickerCallback = null;
  lenisInstance?.destroy();
  lenisInstance = null;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
