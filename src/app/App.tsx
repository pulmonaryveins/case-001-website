import { useRef, useState } from 'react';
import { ScrollProvider } from './providers';
import { useGSAPContext } from '../hooks/useGSAPContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { gsap } from '../lib/gsap';
import styles from './App.module.css';

/**
 * Temporary scaffolding-verification shell. Confirms React, global styles,
 * GSAP, ScrollTrigger, Lenis, and reduced-motion detection are wired
 * correctly. Codex replaces this with the real scene stack starting at
 * HeroScene — see ARCHITECTURE.md.
 */
export function App() {
  const boxRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [scrollTriggerFired, setScrollTriggerFired] = useState(false);

  useGSAPContext(sceneRef, () => {
    gsap.to(boxRef.current, {
      x: 120,
      duration: 1.5,
      ease: 'power2.inOut',
      repeat: -1,
      yoyo: true,
      scrollTrigger: {
        trigger: sceneRef.current,
        start: 'top center',
        onEnter: () => setScrollTriggerFired(true),
      },
    });
  });

  return (
    <ScrollProvider>
      <main className={styles.shell}>
        <section className={styles.status}>
          <h1>CASE 0926 — scaffolding shell</h1>
          <ul>
            <li>React: online</li>
            <li>Reduced motion preference: {reducedMotion ? 'reduced' : 'no preference'}</li>
            <li>ScrollTrigger fired: {scrollTriggerFired ? 'yes' : 'scroll down to test'}</li>
          </ul>
        </section>

        <div className={styles.spacer} />

        <section ref={sceneRef} className={styles.scene}>
          <div ref={boxRef} className={styles.box} />
        </section>

        <div className={styles.spacer} />
      </main>
    </ScrollProvider>
  );
}
