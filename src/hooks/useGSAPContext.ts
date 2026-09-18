import { useLayoutEffect, useRef, type RefObject } from 'react';
import { gsap } from '../lib/gsap';

/**
 * Standard scene animation pattern:
 *   scene ref -> gsap.context(scope) -> local timeline/ScrollTrigger -> cleanup
 *
 * Usage:
 *   const scope = useRef<HTMLDivElement>(null);
 *   useGSAPContext(scope, () => {
 *     gsap.timeline({ scrollTrigger: { trigger: scope.current, ... } })...
 *   });
 *
 * Everything created inside the callback (tweens, timelines, ScrollTriggers)
 * is scoped to `scope` and automatically reverted on unmount — never create
 * a global/unscoped timeline in a scene component.
 */
export function useGSAPContext(
  scope: RefObject<HTMLElement | null>,
  callback: (context: gsap.Context) => void,
  deps: React.DependencyList = [],
) {
  const contextRef = useRef<gsap.Context | null>(null);

  useLayoutEffect(() => {
    // gsap.context invokes `callback` immediately, passing the context
    // itself as the argument — don't reference the `ctx` binding inside it.
    const ctx = gsap.context(callback, scope);
    contextRef.current = ctx;

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return contextRef;
}
