import { useContext, useSyncExternalStore } from 'react';
import { bakedGrain, GRAIN_GRID, grainTiles, subscribeGrain } from './grainTexture';
import { GrainResolution } from './GrainResolution';
import styles from './Grain.module.css';

export interface GrainProps {
  /** Shared stock; ignored when `src` (e.g. a supplied paper scan) is given. */
  stock?: keyof typeof grainTiles;
  src?: string;
  /** CSS size of one tile on the sheet. Defaults to the stock's tile. */
  tile?: number;
  className?: string;
}

/**
 * Paper grain as an image layer behind a sheet's ink. Only shown inside the
 * projected 3D planes (`[data-grain='layer']`, set once the grain is baked);
 * everywhere else the owner's CSS background tile is used. The owner must be
 * a stacking context; the layer's ::after draws `--grain-finish` so the
 * finish still sits above the grain.
 */
export function Grain({ stock = 'paper', src, tile, className }: GrainProps) {
  const resolution = useContext(GrainResolution);
  const source = src ?? grainTiles[stock].src;
  const size = tile ?? (src ? grainTiles.paper.tile : grainTiles[stock].tile);
  const baked = useSyncExternalStore(subscribeGrain, () => bakedGrain(source, resolution));

  return (
    <span className={[styles.layer, className].filter(Boolean).join(' ')} aria-hidden="true">
      {baked && (
        <img
          className={styles.tile}
          src={baked}
          alt=""
          draggable={false}
          style={{ width: size * GRAIN_GRID }}
        />
      )}
    </span>
  );
}
