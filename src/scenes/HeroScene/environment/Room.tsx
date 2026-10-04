import { environment as settings } from './config';

/** Back wall. Sits just behind the board, which hangs well back from the desk. */
export function Room() {
  return (
    <mesh receiveShadow position={[0, 0, settings.board.position[2] - 0.1]}>
      <planeGeometry args={[40, 24]} />
      <meshStandardMaterial color={settings.colors.wall} roughness={0.95} />
    </mesh>
  );
}
