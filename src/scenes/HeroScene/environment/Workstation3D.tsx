import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  CanvasTexture,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  type Group,
  type Mesh,
  type PointLight,
} from 'three';
import { projectCategories } from '../../../data/projects';
import type { ProjectArchiveController } from '../../ProjectsScene/archiveController';
import { DESK_TOP } from './Desk3D';
import type { CameraState } from './cameraPath';
import { environment as settings } from './config';

const { workstation: station, colors } = settings;
type Vec = [number, number, number];
interface Props {
  screenPlane: RefObject<Group | null>;
  diskTargets: RefObject<Group | null>[];
  controller: ProjectArchiveController;
  glow: { value: number };
  shadows: boolean;
  camera: RefObject<CameraState>;
}

/** Shared, gently rounded unit geometry: detail comes from construction, not polygons. */
export function Workstation3D({
  screenPlane,
  diskTargets,
  controller,
  glow,
  shadows,
  camera,
}: Props) {
  const portrait = useThree((state) => state.size.width / state.size.height < 1.2);
  const rounded = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.045), []);
  const warm = useRef<PointLight>(null);
  const rackLight = useRef<PointLight>(null);
  const surface = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const image = ctx.createImageData(256, 256);
    let seed = 926;
    for (let i = 0; i < image.data.length; i += 4) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const shade = 228 + (seed % 28);
      image.data[i] = image.data[i + 1] = image.data[i + 2] = shade;
      image.data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    return new CanvasTexture(canvas);
  }, []);
  // Soft contact shadow, drawn once into a 128px alpha ramp and reused by the
  // three ground quads below. The workstation stands outside the lamp's cone,
  // so the shadow map gives it nothing to sit in; without this the machine
  // floats. One texture, one material, three quads — no extra lights, no
  // shadow-map work, nothing per frame.
  const contact = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    gradient.addColorStop(0, 'rgba(0,0,0,0.62)');
    gradient.addColorStop(0.55, 'rgba(0,0,0,0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new CanvasTexture(canvas);
  }, []);
  const materials = useMemo(() => {
    const result = new Map<string, MeshStandardMaterial>();
    const tones = [
      colors.computer,
      colors.computerShade,
      '#b7ab91',
      '#544e41',
      '#111311',
      '#6c6658',
      '#aea38a',
      '#807661',
      '#423f32',
      '#6b6453',
      '#8c826c',
      '#554f42',
      '#615b4b',
      '#5e594b',
      '#bbae92',
      '#302b22',
      '#45392a',
      '#393125',
      '#3d3327',
      '#6c5a40',
      '#b09a71',
      '#343731',
      '#232724',
      '#151a17',
      '#858680',
      '#363a36',
      '#bbab8a',
      '#c4b596',
      '#8a3930',
      '#070b09',
      '#a08a62',
      '#b8a17c',
    ];
    const metals: Record<string, number> = {
      '#a08a62': 0.15,
      '#363a36': 0.3,
      '#615b4b': 0.5,
      '#858680': 0.7,
    };
    // One roughness per material role, not one for the whole machine: aged ABS
    // keeps a faint sheen, painted rack steel is smoother, floppy shells and
    // paper labels are dead matte. The difference is most of what separates
    // these parts as materials under a single warm light.
    const roughnessFor = (color: string, metalness: number) => {
      if (metalness) return 0.38;
      if (['#343731', '#232724', '#151a17', '#070b09', '#111311'].includes(color)) return 0.88;
      if (['#b09a71', '#b8a17c', '#c4b596', '#bbab8a', '#8a3930'].includes(color)) return 0.93;
      if (['#302b22', '#45392a', '#393125', '#3d3327', '#6c5a40'].includes(color)) return 0.55;
      if (['#544e41', '#6c6658', '#554f42', '#5e594b', '#423f32'].includes(color)) return 0.84;
      return 0.64;
    };
    for (const color of tones) {
      const metalness = metals[color] ?? 0;
      const roughness = roughnessFor(color, metalness);
      result.set(
        `${color}/${metalness}`,
        new MeshStandardMaterial({
          color,
          roughness,
          metalness,
          map: surface,
          bumpMap: surface,
          // Paper and moulded shells take more tooth than smooth painted steel.
          bumpScale: roughness > 0.85 ? 0.013 : 0.006,
        }),
      );
    }
    return result;
  }, [surface]);
  const lamp = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);
  const glass = useRef<Mesh>(null);
  const keyMesh = useRef<InstancedMesh>(null);
  const disks = useRef<(Group | null)[]>([]);
  // Stepped rows, as a keyboard of this era actually is: the back row sits
  // highest and each row forward drops a little, on top of the whole deck's
  // tilt. Costs nothing — these are instance matrices, not extra meshes.
  const keyPositions = useMemo(() => {
    const positions: Vec[] = [];
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 14; col++) {
        positions.push([
          -1.43 + col * 0.215 + (row % 2) * 0.025,
          0.104 + (3 - row) * 0.013,
          -0.36 + row * 0.205,
        ]);
      }
    return positions;
  }, []);
  useLayoutEffect(() => {
    const matrix = new Matrix4();
    keyPositions.forEach((position, i) => {
      matrix.makeScale(0.188, 0.12, 0.175).setPosition(...position);
      keyMesh.current?.setMatrixAt(i, matrix);
    });
    if (keyMesh.current) keyMesh.current.instanceMatrix.needsUpdate = true;
    return () => {
      rounded.dispose();
      surface.dispose();
      contact.dispose();
      materials.forEach((material) => material.dispose());
    };
  }, [keyPositions, rounded, surface, contact, materials]);
  useFrame(() => {
    const visibility = camera.current.archive;
    if (warm.current) warm.current.intensity = 18 * visibility;
    if (rackLight.current) rackLight.current.intensity = 16 * visibility;
    if (light.current) light.current.intensity = glow.value * station.screen.light * visibility;
    if (lamp.current)
      (lamp.current.material as MeshStandardMaterial).emissiveIntensity =
        glow.value > 0.05 ? (controller.getSnapshot().loading ? 3 : 1.2) : 0;
    if (glass.current)
      (glass.current.material as MeshStandardMaterial).emissiveIntensity = glow.value * 0.045;
    disks.current.forEach((disk, index) => {
      if (!disk) return;
      const row = controller.siblings(controller.projects[index].category).indexOf(index);
      disk.position.y = 0.67 + row * 0.3 + controller.diskLift[index];
      disk.position.z = 0.87 - row * 0.32 + controller.diskLift[index] * 0.35;
    });
  }, -2); // Physical pose first, then CameraRig projects its label in the same frame.

  const part = (position: Vec, size: Vec, color: string = colors.computer, metalness = 0) => {
    const key = `${color}/${metalness}`;
    return (
      <mesh
        geometry={rounded}
        material={materials.get(key)}
        position={position}
        scale={size}
        castShadow={shadows}
        receiveShadow
      />
    );
  };
  return (
    <group
      position={[station.position[0], DESK_TOP, portrait ? 1 : station.position[2]]}
      rotation={[0, station.yaw, 0]}
    >
      {/* Soft warm bounce is confined to this end of the desk; the approved lamp is unchanged. */}
      <pointLight
        ref={warm}
        position={[-1.7, 4, 3]}
        intensity={0}
        distance={8}
        decay={2}
        color="#ffe0b3"
      />
      <pointLight
        ref={rackLight}
        position={[3.8, 3.3, 3.0]}
        intensity={0}
        distance={5}
        decay={2}
        color="#efc992"
      />
      {/* Contact shadows: what actually seats the machine on the wood. */}
      {(
        [
          [
            [0, 0.012, 0.05],
            [4.5, 3.3],
          ],
          [
            [0, 0.011, 2.13],
            [4.2, 1.95],
          ],
        ] as [Vec, [number, number]][]
      ).map(([position, scale], i) => (
        <mesh
          key={`shadow${i}`}
          position={position}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={-1}
        >
          <planeGeometry args={[scale[0], scale[1]]} />
          <meshBasicMaterial map={contact} transparent depthWrite={false} color="#000000" />
        </mesh>
      ))}
      {/* Separate horizontal system unit, seam, faceplate and drive assembly. */}
      {part([0, 0.1, 0], [3.35, 0.19, 2.2], colors.computerShade)}
      {part([0, 0.4, 0], [3.6, 0.55, 2.35])}
      {part([0, 0.4, 1.19], [3.45, 0.43, 0.1], '#b7ab91')}
      {part([0.62, 0.42, 1.25], [1.65, 0.27, 0.055], '#544e41')}
      {part([0.62, 0.43, 1.285], [1.46, 0.07, 0.025], '#111311')}
      {part([1.22, 0.32, 1.29], [0.2, 0.07, 0.03], colors.computerShade)}
      {part([-1.32, 0.4, 1.265], [0.2, 0.22, 0.07], colors.computerShade)}
      <mesh ref={lamp} position={[1.49, 0.43, 1.26]}>
        <boxGeometry args={[0.075, 0.06, 0.03]} />
        <meshStandardMaterial color="#506844" emissive="#91ce56" emissiveIntensity={0} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <group key={`basevent${i}`}>
          {part([-0.9 + i * 0.11, 0.34, 1.255], [0.045, 0.14, 0.018], '#6c6658')}
        </group>
      ))}
      {/* Stand, rear tube housing, shell seam, proud front rim. */}
      {part([0, 0.73, -0.05], [1.8, 0.16, 1.35], colors.computerShade)}
      {part([0, 0.9, -0.17], [1.05, 0.26, 0.9])}
      {part([0, 2.13, -0.26], [3.25, 2.66, 1.84], '#aea38a')}
      {part([0, 2.13, 0.51], [3.51, 2.93, 0.3], '#807661')}
      {part([0, 2.13, 0.75], [3.57, 2.99, 0.39])}
      {/* Recess is built from four sloped-looking rails around the glass, not a painted rectangle. */}
      {part([0, 3.47, 0.995], [3.46, 0.28, 0.31])}
      {part([0, 0.88, 0.995], [3.46, 0.43, 0.31])}
      {part([-1.63, 2.2, 0.995], [0.28, 2.54, 0.31])}
      {part([1.63, 2.2, 0.995], [0.28, 2.54, 0.31])}
      {part([0, 2.2, 0.977], [3.03, 2.33, 0.12], '#423f32')}
      <mesh ref={glass} geometry={rounded} position={[0, 2.2, 1.054]} scale={[2.95, 2.235, 0.15]}>
        <meshStandardMaterial
          color="#09110e"
          roughness={0.16}
          metalness={0.22}
          emissive="#73bb91"
          emissiveIntensity={0}
        />
      </mesh>
      <group ref={screenPlane} position={[0, 2.2, 1.138]} />
      <pointLight
        ref={light}
        position={[0, 2.15, 1.65]}
        color={station.screen.color}
        distance={station.screen.distance}
        intensity={0}
        decay={2}
      />
      {part([-1.07, 0.9, 1.17], [0.7, 0.25, 0.018], '#b8a17c')}
      <group
        ref={diskTargets[controller.projects.length + projectCategories.length]}
        position={[-1.07, 0.9, 1.185]}
      />
      {part([1.27, 0.9, 1.17], [0.14, 0.12, 0.04], '#8c826c')}
      {Array.from({ length: 11 }, (_, i) => (
        <group key={`vent${i}`}>
          {part([-1.642, 2.3 + i * 0.075, -0.43], [0.02, 0.028, 0.91], '#554f42')}
        </group>
      ))}
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((y) => (
          <group key={`screw${x}${y}`}>
            {part([x * 1.67, 2.13 + y * 1.33, 1.15], [0.04, 0.04, 0.015], '#615b4b', 0.5)}
          </group>
        )),
      )}
      {/* One instanced mesh for the raised keys; keyboard is pitched toward the reader. */}
      {!portrait && (
        <group position={[0, 0.21, 2.13]} rotation={[0.1, -0.035, 0]}>
          {part([0, 0, 0], [3.55, 0.2, 1.27])}
          {part([0, 0.105, -0.03], [3.25, 0.025, 1.06], '#5e594b')}
          <instancedMesh
            ref={keyMesh}
            args={[rounded, undefined, keyPositions.length]}
            castShadow={shadows}
            receiveShadow
          >
            <meshStandardMaterial color="#b8ac90" roughness={0.85} />
          </instancedMesh>
          {part([-0.23, 0.12, 0.45], [1.54, 0.12, 0.17], '#bbae92')}
          {[-1.43, -1.2, 0.82, 1.05, 1.28].map((x) => (
            <group key={x}>{part([x, 0.12, 0.45], [0.18, 0.12, 0.17])}</group>
          ))}
        </group>
      )}
      {/* Cable exits behind the keyboard and returns to the system unit. */}
      <mesh position={[1.55, 0.14, 1.53]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.29, 0.025, 6, 20, Math.PI * 1.45]} />
        <meshStandardMaterial color="#24231d" roughness={0.9} />
      </mesh>
      {/* Four physical lanes with stepped supports; every record has a complete disk. */}
      <group
        position={portrait ? [0, 0, 4.2] : station.disks.offset}
        rotation={[0, station.disks.yaw, 0]}
        scale={portrait ? 0.85 : 0.92}
      >
        <mesh position={[0, 0.013, 0.12]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
          <planeGeometry args={[4.1, 3.4]} />
          <meshBasicMaterial map={contact} transparent depthWrite={false} color="#000000" />
        </mesh>
        {part([0, 0.12, 0.12], [3.12, 0.24, 2.28], '#302b22')}
        {Array.from(
          {
            length: Math.max(
              ...projectCategories.map((category) => controller.siblings(category.id).length),
            ),
          },
          (_, row) => (
            <group key={`support${row}`}>
              {part(
                [0, (0.28 + row * 0.3) / 2, 0.87 - row * 0.32],
                [2.94, 0.28 + row * 0.3, 0.25],
                '#302b22',
              )}
            </group>
          ),
        )}
        {part([0, 0.33, 1.25], [3.12, 0.45, 0.14], '#45392a')}
        {part([0, 1.35, -1.02], [3.12, 2.5, 0.12], '#393125')}
        {[-1.52, 1.52].flatMap((x) =>
          Array.from({ length: 5 }, (_, row) => (
            <group key={`${x}/${row}`}>
              {part(
                [x, (0.42 + row * 0.3) / 2, 0.87 - row * 0.32],
                [0.13, 0.42 + row * 0.3, 0.34],
                '#3d3327',
              )}
            </group>
          )),
        )}
        {[-0.76, 0, 0.76].flatMap((x) =>
          Array.from({ length: 5 }, (_, row) => (
            <group key={`${x}/${row}`}>
              {part(
                [x, (0.4 + row * 0.3) / 2, 0.87 - row * 0.32],
                [0.045, 0.4 + row * 0.3, 0.34],
                '#6c5a40',
              )}
            </group>
          )),
        )}
        {projectCategories.map((category, col) => (
          <group key={category.id} position={[-1.14 + col * 0.76, 0, 0]}>
            {part([0, 2.38, -0.91], [0.71, 0.35, 0.055], '#b09a71')}
            <group
              ref={diskTargets[controller.projects.length + col]}
              position={[0, 2.38, -0.878]}
            />
            {controller.siblings(category.id).map((index, row) => (
              <group
                key={controller.projects[index].id}
                ref={(el) => {
                  disks.current[index] = el;
                }}
                position={[0, 0.67 + row * 0.3, 0.87 - row * 0.32]}
                rotation={[-0.08, 0, ((index % 3) - 1) * 0.012]}
              >
                {part([0, 0, 0], [0.7, 0.78, 0.085], index % 3 === 0 ? '#343731' : '#232724')}
                {part([0, -0.04, 0.047], [0.64, 0.58, 0.014], '#151a17')}
                {part([0.07, -0.2, 0.062], [0.34, 0.23, 0.019], '#858680', 0.7)}
                {part([0.15, -0.2, 0.074], [0.08, 0.17, 0.007], '#363a36', 0.3)}
                {part([0, 0.235, 0.059], [0.64, 0.245, 0.02], index % 2 ? '#bbab8a' : '#c4b596')}
                {part([-0.255, 0.369, 0.063], [0.1, 0.025, 0.017], '#8a3930')}
                {part([-0.28, -0.31, 0.06], [0.065, 0.055, 0.02], '#070b09')}
                <group ref={diskTargets[index]} position={[0, 0.235, 0.072]} />
              </group>
            ))}
          </group>
        ))}
        {part([0, 0.34, 1.329], [1.02, 0.27, 0.025], '#a08a62', 0.15)}
        <group
          ref={diskTargets[controller.projects.length + projectCategories.length + 1]}
          position={[0, 0.34, 1.35]}
        />
      </group>
    </group>
  );
}
