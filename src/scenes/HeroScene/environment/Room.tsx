import { environment as settings } from './config';

export function Room() {
  return (
    <mesh receiveShadow position={[0, 0, -0.1]}>
      <planeGeometry args={[40, 24]} />
      <meshStandardMaterial color={settings.colors.wall} roughness={0.95} />
    </mesh>
  );
}
