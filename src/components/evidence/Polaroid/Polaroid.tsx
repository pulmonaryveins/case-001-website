import type { CSSProperties, ImgHTMLAttributes } from 'react';
import styles from './Polaroid.module.css';

export interface PolaroidProps {
  src: string;
  alt: string;
  caption?: string;
  rotation?: number;
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading'];
  srcSet?: string;
  sizes?: string;
  textureSrc?: string;
}

export function Polaroid({
  src,
  alt,
  caption,
  rotation = 0,
  loading = 'lazy',
  srcSet,
  sizes,
  textureSrc,
}: PolaroidProps) {
  return (
    <figure
      className={styles.polaroid}
      style={
        {
          '--polaroid-rotation': `${rotation}deg`,
          '--photo-paper-texture': textureSrc ? `url("${textureSrc}")` : 'none',
        } as CSSProperties
      }
    >
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        decoding="async"
        className={styles.image}
      />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
