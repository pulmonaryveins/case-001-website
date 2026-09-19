import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { PaperMaterialAsset } from '../../../types/portfolio';
import { Grain } from '../Grain';
import styles from './Paper.module.css';

export interface PaperProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  aged?: boolean;
  rotation?: number;
  treatment?: 'clean' | 'worn' | 'torn';
  variant?: 'clean' | 'aged' | 'torn' | 'note' | 'document' | 'photoBacking' | 'map' | 'manila';
  material?: PaperMaterialAsset;
}

/**
 * Base physical paper surface. Other evidence primitives (labels, notes,
 * dossier pages) compose on top of this rather than reimplementing texture
 * and shadow.
 */
export function Paper({
  children,
  aged = false,
  rotation = 0,
  treatment = 'clean',
  variant,
  material,
  className,
  style,
  ...rest
}: PaperProps) {
  const resolvedVariant =
    variant ??
    (treatment === 'torn' ? 'torn' : aged ? 'aged' : treatment === 'worn' ? 'note' : 'clean');
  const materialStyle = {
    ...style,
    '--paper-rotation': `${rotation}deg`,
    // Omitted when no scan is supplied, so the shared grain token applies.
    ...(material?.textureSrc && { '--paper-texture': `url("${material.textureSrc}")` }),
    '--paper-edge-mask': material?.edgeMaskSrc ? `url("${material.edgeMaskSrc}")` : 'none',
    '--paper-wear-image': material?.wearOverlaySrc ? `url("${material.wearOverlaySrc}")` : 'none',
  } as CSSProperties;
  // Image-based stocks get a Grain layer (used on the 3D planes); map stock is gradient-only.
  const grained = resolvedVariant !== 'map';
  return (
    <div
      className={[styles.paper, styles[resolvedVariant], className].filter(Boolean).join(' ')}
      style={materialStyle}
      {...rest}
    >
      <div
        className={[styles.surface, grained && styles.grained].filter(Boolean).join(' ')}
        data-masked={Boolean(material?.edgeMaskSrc)}
      >
        {grained && (
          <Grain
            stock={resolvedVariant === 'manila' ? 'fiber' : 'paper'}
            src={material?.textureSrc}
          />
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
