/**
 * Convert a plane-to-clip matrix into a CSS homography. No DOM or renderer required.
 * The z column is carried through too, so DOM children using `preserve-3d`
 * (e.g. a folder cover hinging off the desk) project with true perspective.
 * Flat DOM (z = 0) is unaffected by it.
 */
export function registrationMatrix(m: readonly number[], width: number, height: number): number[] {
  const denominator = m[15];
  if (Math.abs(denominator) < 1e-8) throw new Error('Plane is outside the camera projection');
  const x = width / (2 * denominator);
  const y = height / (2 * denominator);
  return [
    (m[0] + m[3]) * x,
    (-m[1] + m[3]) * y,
    0,
    m[3] / denominator,
    (m[4] + m[7]) * x,
    (-m[5] + m[7]) * y,
    0,
    m[7] / denominator,
    (m[8] + m[11]) * x,
    (-m[9] + m[11]) * y,
    1,
    m[11] / denominator,
    (m[12] + m[15]) * x,
    (-m[13] + m[15]) * y,
    0,
    1,
  ];
}
