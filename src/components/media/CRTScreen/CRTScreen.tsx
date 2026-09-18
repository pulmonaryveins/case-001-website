import { useRef } from 'react';
import { VIDEO_PRELOAD_ACTIVE } from '../../../lib/performance';
import styles from './CRTScreen.module.css';

export interface CRTScreenProps {
  posterSrc: string;
  videoSrc?: string;
  active?: boolean;
}

/**
 * CRT television surface. Video only loads (preload="metadata") once a tape
 * is active/selected — never preload every video up front.
 */
export function CRTScreen({ posterSrc, videoSrc, active = false }: CRTScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className={styles.screen} data-active={active}>
      {active && videoSrc ? (
        <video
          ref={videoRef}
          className={styles.video}
          src={videoSrc}
          poster={posterSrc}
          preload={VIDEO_PRELOAD_ACTIVE}
          controls
        />
      ) : (
        <img className={styles.poster} src={posterSrc} alt="" loading="lazy" />
      )}
    </div>
  );
}
