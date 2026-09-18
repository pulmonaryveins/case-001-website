import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/**
 * Registers GSAP plugins exactly once. Import this in main.tsx before
 * anything else touches ScrollTrigger.
 */
export function registerGsap() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export { gsap, ScrollTrigger };
