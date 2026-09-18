import type { ImgHTMLAttributes } from 'react';
import styles from './Polaroid.module.css';

export interface PolaroidProps {
  src: string;
  alt: string;
  caption?: string;
  rotation?: number;
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading'];
}

export function Polaroid({ src, alt, caption, rotation = 0, loading = 'lazy' }: PolaroidProps) {
  return (
    <figure
      className={styles.polaroid}
      style={{ ['--polaroid-rotation' as string]: `${rotation}deg` }}
    >
      <img src={src} alt={alt} loading={loading} className={styles.image} />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
