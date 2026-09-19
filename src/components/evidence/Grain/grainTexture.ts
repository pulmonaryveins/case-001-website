import paperGrainSvg from '../../../assets/textures/paper-grain.svg';
import folderFiberSvg from '../../../assets/textures/folder-fiber.svg';

/** Seamless source tiles and the CSS size one tile covers (matches tokens.css). */
export const grainTiles = {
  paper: { src: paperGrainSvg, tile: 256 },
  fiber: { src: folderFiberSvg, tile: 320 },
} as const;

/**
 * Tiles per side in a baked bitmap. 2 x 256px covers every sheet on the 3D
 * planes (largest ~350 x 450px); a larger sheet stretches the bitmap to cover.
 */
export const GRAIN_GRID = 2;

export interface GrainJob {
  src: string;
  /** CSS size of one tile. */
  tile: number;
  /** Bitmap pixels per CSS pixel, ideally the plane's on-screen scale. */
  resolution: number;
}

const pending = new Map<string, Promise<string>>();
const baked = new Map<string, string>();
const listeners = new Set<() => void>();
const key = (src: string, resolution: number) => `${resolution}|${src}`;

/**
 * Bakes a seamless tile (SVG or raster) into one GRAIN_GRID x GRAIN_GRID
 * bitmap, once per source and resolution, and returns an object URL. On the
 * projected planes this is shown as an <img>: a CSS background tile is
 * re-sampled on every re-raster as the camera changes the plane's scale,
 * which dominated scroll frame time.
 */
function bake({ src, tile, resolution }: GrainJob): Promise<string> {
  const id = key(src, resolution);
  let job = pending.get(id);
  if (!job) {
    job = (async () => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const size = Math.round(tile * resolution);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size * GRAIN_GRID;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('2D canvas unavailable');
      for (let x = 0; x < GRAIN_GRID; x++) {
        for (let y = 0; y < GRAIN_GRID; y++)
          context.drawImage(image, x * size, y * size, size, size);
      }
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Texture encoding failed');
      const url = URL.createObjectURL(blob);
      // Decode now so the first frame that shows it does not stall.
      const check = new Image();
      check.src = url;
      await check.decode();
      baked.set(id, url);
      listeners.forEach((notify) => notify());
      return url;
    })();
    pending.set(id, job);
  }
  return job;
}

/** Bakes every job; the Hero readiness gate awaits this before revealing the planes. */
export function bakeGrain(jobs: readonly GrainJob[]): Promise<void> {
  return Promise.all(jobs.map(bake)).then(() => undefined);
}

export function subscribeGrain(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

export function bakedGrain(src: string, resolution: number): string | undefined {
  return baked.get(key(src, resolution));
}
