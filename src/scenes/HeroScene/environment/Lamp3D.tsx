import { useMemo } from 'react';
import { BackSide, DoubleSide, Quaternion, Vector2, Vector3 } from 'three';
import { environment as settings } from './config';

/**
 * Provisional enamel desk-lamp shade. Its bulb sits exactly at the light
 * position used by LightingRig and the DOM lighting bridge. Replace with a
 * vetted lightweight GLB later (keep the bulb at `settings.lamp.bulb`).
 */
const SCALE = 1.35;
// Shade axis leans this far from the light direction toward the viewer, so the
// lit interior reads on screen. The spotlight itself still aims at the board.
const VIEWER_LEAN = 0.42;
const VIEWER = new Vector3(1, 0.4, 15);

// Bottom-to-top: LatheGeometry derives outward normals from this ordering.
const profile = [
  [1.02, -0.2],
  [0.98, -0.16],
  [0.78, 0.02],
  [0.52, 0.24],
  [0.3, 0.48],
  [0.2, 0.6],
  [0.1, 0.62],
].map(([r, y]) => new Vector2(r, y));

export function Lamp3D() {
  const { bulb, target } = settings.lamp;
  const orientation = useMemo(() => {
    const origin = new Vector3(...bulb);
    const toBoard = new Vector3(...target).sub(origin).normalize();
    const toViewer = VIEWER.clone().sub(origin).normalize();
    const axis = toBoard.add(toViewer.multiplyScalar(VIEWER_LEAN)).normalize();
    return new Quaternion().setFromUnitVectors(new Vector3(0, -1, 0), axis);
  }, [bulb, target]);
  const arm = useMemo(() => {
    const neck = new Vector3(0, 0.78 * SCALE, 0)
      .applyQuaternion(orientation)
      .add(new Vector3(...bulb));
    const exit = new Vector3(bulb[0] + 2.4, bulb[1] + 3.6, bulb[2] + 0.4);
    const direction = exit.clone().sub(neck);
    return {
      neck,
      center: neck.clone().add(exit).multiplyScalar(0.5),
      length: direction.length(),
      rotation: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize()),
    };
  }, [bulb, orientation]);
  const enamel = (
    <meshStandardMaterial color="#2f3129" roughness={0.38} metalness={0.25} side={DoubleSide} />
  );
  return (
    <group>
      <group position={bulb} quaternion={orientation} scale={SCALE}>
        <mesh>
          <latheGeometry args={[profile, 48]} />
          {enamel}
        </mesh>
        <mesh scale={0.985}>
          <latheGeometry args={[profile, 48]} />
          <meshStandardMaterial
            color={settings.colors.inside}
            emissive={settings.lamp.color}
            emissiveIntensity={0.7}
            roughness={0.8}
            side={BackSide}
          />
        </mesh>
        {/* Inner lip: directly lit by the bulb, so it glows at the rim. */}
        <mesh position={[0, -0.19, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.0, 0.025, 8, 48]} />
          <meshStandardMaterial
            color={settings.colors.inside}
            emissive={settings.lamp.color}
            emissiveIntensity={1.4}
          />
        </mesh>
        <mesh position={[0, 0.66, 0]}>
          <cylinderGeometry args={[0.13, 0.16, 0.18, 24]} />
          <meshStandardMaterial color={settings.colors.metal} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.2, 24, 16]} />
          <meshBasicMaterial color="#fff1d6" toneMapped={false} />
        </mesh>
      </group>
      <mesh position={arm.neck}>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshStandardMaterial color={settings.colors.metal} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={arm.center} quaternion={arm.rotation}>
        <cylinderGeometry args={[0.06, 0.06, arm.length, 12]} />
        {enamel}
      </mesh>
    </group>
  );
}
