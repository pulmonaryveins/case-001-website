import { DESK_TOP } from './Desk3D';
import { environment as settings } from './config';

/**
 * Deliberately restrained desk dressing: one case-file stack toward the back
 * and a single pen beside the dossier. The dossier itself is DOM (see
 * DeskEvidence) so its cover and future contents stay readable.
 */
export function ForegroundProps3D() {
  const sheets = [
    { y: 0.03, color: settings.colors.folder, offset: [0, 0], turn: 0 },
    { y: 0.075, color: settings.colors.paper, offset: [0.06, -0.04], turn: 0.03 },
    { y: 0.11, color: settings.colors.folder, offset: [-0.05, 0.03], turn: -0.04 },
  ];
  return (
    <>
      <group position={[4.3, DESK_TOP, 1.35]} rotation={[0, -0.28, 0]}>
        {sheets.map((sheet, i) => (
          <mesh
            key={i}
            castShadow
            receiveShadow
            position={[sheet.offset[0], sheet.y, sheet.offset[1]]}
            rotation={[0, sheet.turn, 0]}
          >
            <boxGeometry args={[2.3, 0.04, 1.6]} />
            <meshStandardMaterial color={sheet.color} roughness={0.9} />
          </mesh>
        ))}
      </group>
      {/* Fountain pen: lacquered barrel, brass section and clip. */}
      <group position={[3.2, DESK_TOP + 0.04, 4.35]} rotation={[0, 0.55, Math.PI / 2]}>
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
