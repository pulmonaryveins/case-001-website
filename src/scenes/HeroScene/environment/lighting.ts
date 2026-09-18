import { environment } from './config';

/**
 * DOM lighting bridge. DOM evidence can't receive WebGL light, so each piece
 * gets the same lamp maths three.js applies to the room (spot cone, cosine,
 * distance falloff) evaluated where it sits on a registered surface. Pure — no DOM.
 */
const { board, desk, lamp } = environment;
type Vec3 = [number, number, number];

/** A DOM plane in the room: its layout axes and facing, in world space. */
interface Surface {
  point: (u: number, v: number) => Vec3;
  normal: Vec3;
  /** World direction of the plane's layout +x (right) and +y (down). */
  right: Vec3;
  down: Vec3;
}

const dot = (a: readonly number[], b: readonly number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const surfaces = {
  board: {
    point: (u, v) => [
      board.position[0] + (u - 0.5) * board.width,
      board.position[1] + (0.5 - v) * board.height,
      board.faceZ,
    ],
    normal: [0, 0, 1],
    right: [1, 0, 0],
    down: [0, -1, 0],
  },
  // Lies on the desk top; layout "up" runs toward the wall.
  desk: {
    point: (u, v) => [
      desk.plane.center[0] + (u - 0.5) * desk.plane.width,
      desk.plane.center[1],
      desk.plane.center[2] + (v - 0.5) * desk.plane.depth,
    ],
    normal: [0, 1, 0],
    right: [1, 0, 0],
    down: [0, 0, 1],
  },
} satisfies Record<string, Surface>;

export type SurfaceName = keyof typeof surfaces;

function cone(cosAngle: number) {
  const outer = Math.cos(lamp.angle);
  const inner = Math.cos(lamp.angle * (1 - lamp.penumbra));
  const t = Math.min(1, Math.max(0, (cosAngle - outer) / (inner - outer)));
  return t * t * (3 - 2 * t);
}

const spotDirection = (() => {
  const d = lamp.target.map((t, i) => t - lamp.bulb[i]);
  const len = Math.hypot(...d);
  return d.map((c) => c / len);
})();

function irradiance(p: Vec3, normal: Vec3) {
  const toPoint = p.map((c, i) => c - lamp.bulb[i]);
  const distance = Math.hypot(...toPoint);
  const dir = toPoint.map((c) => c / distance);
  const cosSurface = Math.max(0, -dot(dir, normal));
  return (cone(dot(dir, spotDirection)) * cosSurface) / distance ** lamp.decay;
}

// Normalised to the brightest point on the board so every surface shares one exposure.
const peak = (() => {
  let max = 0;
  for (let u = 0; u <= 1; u += 0.05)
    for (let v = 0; v <= 1; v += 0.05)
      max = Math.max(max, irradiance(surfaces.board.point(u, v), surfaces.board.normal));
  return max;
})();

export interface EvidenceLight {
  /** Perceptual brightness multiplier for CSS `brightness()`. */
  lit: number;
  /** 0-1 tungsten warmth: stronger near the lamp, neutral in the dark. */
  warm: number;
  /** Shadow offset per px of elevation, in the plane's layout axes (away from the lamp). */
  sx: number;
  sy: number;
  /** CSS gradient angle pointing away from the lamp, for in-sheet falloff. */
  angle: number;
}

export function evidenceLight(
  u: number,
  v: number,
  surfaceName: SurfaceName = 'board',
): EvidenceLight {
  const surface: Surface = surfaces[surfaceName];
  const { response } = lamp;
  const p = surface.point(u, v);
  const direct = Math.min(1, irradiance(p, surface.normal) / peak);
  const perceived = lamp.ambient + (1 - lamp.ambient) * Math.pow(direct, 1 / 2.2);
  const fromLamp = p.map((c, i) => c - lamp.bulb[i]);
  // Shadow length grows with in-plane distance from the lamp over its height above the plane.
  const height = Math.max(0.5, -dot(fromLamp, surface.normal));
  const sx = (dot(fromLamp, surface.right) / height) * response.shadowReach;
  const sy = (dot(fromLamp, surface.down) / height) * response.shadowReach;
  return {
    lit: response.litFloor + response.litRange * perceived,
    warm: response.warmth * Math.pow(direct, 0.8),
    sx,
    sy,
    angle: (Math.atan2(sx, -sy) * 180) / Math.PI,
  };
}
