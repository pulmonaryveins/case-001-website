import { DESK_TOP } from './Desk3D';
import { environment as settings } from './config';

const { colors } = settings;

/**
 * Desk dressing for the RIGHT work area: a few closed case files stacked behind
 * and beside the CASE 0926 dossier, plus a pen. Environmental only — nothing
 * here is interactive, and none of it carries portfolio content; the dossier
 * itself is DOM (see DeskEvidence) so its cover and pages stay readable.
 *
 * Kept clear of the dossier's own footprint (x 2.4-4.6, z 2.9-5.4) and of the
 * workstation at the far left, so nothing intersects.
 */
export function ForegroundProps3D() {
  /** Closed files: slightly different size, tone, lift and angle each. */
  const files: {
    position: [number, number, number];
    size: [number, number, number];
    turn: number;
    color: string;
  }[] = [
    // Directly behind the dossier — reads as the stack it was pulled from.
    { position: [3.9, 0.03, 1.5], size: [2.5, 0.07, 1.75], turn: -0.19, color: colors.folder },
    { position: [3.78, 0.1, 1.44], size: [2.35, 0.06, 1.62], turn: -0.13, color: colors.paper },
    { position: [3.96, 0.16, 1.56], size: [2.44, 0.05, 1.68], turn: -0.24, color: '#7b6647' },
    // One more set aside to the right, tucked partly out of frame.
    { position: [6.15, 0.035, 3.5], size: [2.3, 0.08, 1.66], turn: 0.31, color: '#5f4e37' },
    { position: [6.05, 0.115, 3.42], size: [2.16, 0.05, 1.55], turn: 0.24, color: colors.paper },
  ];

  return (
    <>
      {files.map((file, i) => (
        <mesh
          key={i}
          castShadow
          receiveShadow
          position={[file.position[0], DESK_TOP + file.position[1], file.position[2]]}
          rotation={[0, file.turn, 0]}
        >
          <boxGeometry args={file.size} />
          <meshStandardMaterial color={file.color} roughness={0.92} />
        </mesh>
      ))}
      {/* Fountain pen: lacquered barrel, brass section and clip. Moved clear of
          the dossier, which now occupies this end of the desk. */}
      <group position={[5.75, DESK_TOP + 0.04, 5.35]} rotation={[0, 0.42, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.05, 20]} />
          <meshStandardMaterial color="#141311" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh castShadow position={[0, -0.62, 0]}>
          <coneGeometry args={[0.035, 0.2, 20]} />
          <meshStandardMaterial color="#9c7a42" roughness={0.35} metalness={0.8} />
        </mesh>
        <mesh position={[0.045, 0.28, 0]}>
          <boxGeometry args={[0.012, 0.36, 0.022]} />
          <meshStandardMaterial color="#9c7a42" roughness={0.35} metalness={0.8} />
        </mesh>
      </group>
    </>
  );
}
