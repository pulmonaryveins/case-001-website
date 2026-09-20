import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh, MeshStandardMaterial, PointLight } from 'three';
import { DESK_TOP } from './Desk3D';
import { environment as settings } from './config';

const { workstation: station, colors } = settings;

interface Props {
  /** Registration target for the CRT's DOM screen. */
  screenPlane: RefObject<Group | null>;
  /** Registration target for the disk archive's DOM face. */
  diskPlane: RefObject<Group | null>;
  /** CRT emission, 0 (off) to ~1.35 (power-on flash). Written by the controller. */
  glow: { value: number };
  shadows: boolean;
}

/**
 * The archival workstation further along the same desk: a late-80s CRT, its
 * base with the drive and power lamp, a keyboard, and the rugged disk case
 * beside it.
 *
 * Sized to sit entirely on the existing desk slab — the machine and the case
 * together occupy the run of desk to the right of the dossier, and nothing
 * overhangs the edge.
 *
 * Only the physical form is 3D. Everything readable — the archive interface
 * and every disk label — is DOM registered onto the two planes exposed here,
 * so text stays sharp, selectable and keyboard-reachable instead of becoming
 * a WebGL texture.
 */
export function Workstation3D({ screenPlane, diskPlane, glow, shadows }: Props) {
  const light = useRef<PointLight>(null);
  const lamp = useRef<Mesh>(null);
  const glass = useRef<Mesh>(null);

  // Demand-driven: the controller invalidates whenever `glow` changes, and this
  // reads it on the frame that follows. No state, no re-render.
  useFrame(() => {
    const value = glow.value;
    if (light.current) light.current.intensity = value * station.screen.light;
    if (lamp.current) {
      const material = lamp.current.material as MeshStandardMaterial;
      material.emissiveIntensity = value > 0.05 ? 2.4 : 0;
    }
    if (glass.current) {
      const material = glass.current.material as MeshStandardMaterial;
      material.emissiveIntensity = value * 0.3;
    }
  });

  return (
    <group
      position={[station.position[0], DESK_TOP, station.position[2]]}
      rotation={[0, station.yaw, 0]}
    >
      {/* ---- Base: drive slot, power lamp ---- */}
      <mesh castShadow={shadows} receiveShadow position={[0, 0.225, 0]}>
        <boxGeometry args={[2.9, 0.45, 2.3]} />
        <meshStandardMaterial color={colors.computer} roughness={0.78} />
      </mesh>
      {/* Drive slot */}
      <mesh position={[0.55, 0.24, 1.17]}>
        <boxGeometry args={[1.1, 0.12, 0.05]} />
        <meshStandardMaterial color="#1b1a17" roughness={0.6} />
      </mesh>
      {/* Power lamp: lit only once the machine is on. */}
      <mesh ref={lamp} position={[-1.1, 0.24, 1.17]}>
        <boxGeometry args={[0.13, 0.08, 0.04]} />
        <meshStandardMaterial color="#2f6b3a" emissive="#5ef08a" emissiveIntensity={0} />
      </mesh>

      {/* ---- Monitor ---- */}
      <mesh castShadow={shadows} receiveShadow position={[0, 1.6, -0.05]}>
        <boxGeometry args={[2.6, 2.3, 2.2]} />
        <meshStandardMaterial color={colors.computer} roughness={0.8} />
      </mesh>
      {/* Bezel: a slightly proud, darker frame around the tube. */}
      <mesh position={[0, 1.65, 1.06]}>
        <boxGeometry args={[2.4, 2.0, 0.12]} />
        <meshStandardMaterial color={colors.computerShade} roughness={0.85} />
      </mesh>
      {/* Glass. The DOM screen sits just in front of this face. */}
      <mesh ref={glass} position={[0, 1.68, 1.13]}>
        <boxGeometry args={[2.06, 1.56, 0.04]} />
        <meshStandardMaterial
          color="#080d0a"
          emissive="#7fd694"
          emissiveIntensity={0}
          roughness={0.18}
          metalness={0.1}
        />
      </mesh>
      {/* Registered DOM screen, tipped back with the tube. */}
      <group ref={screenPlane} position={[0, 1.68, 1.17]} rotation={[station.screen.tilt, 0, 0]} />
      {/* Localized phosphor light: cool, against the warm desk lamp. */}
      <pointLight
        ref={light}
        position={[0, 1.68, 1.9]}
        color={station.screen.color}
        distance={station.screen.distance}
        decay={2}
        intensity={0}
      />

      {/* ---- Keyboard ---- */}
      <group position={[-0.05, 0.07, 2.05]} rotation={[0, 0.05, 0]}>
        <mesh castShadow={shadows} receiveShadow>
          <boxGeometry args={[2.6, 0.14, 0.95]} />
          <meshStandardMaterial color={colors.computer} roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.08, 0.02]}>
          <boxGeometry args={[2.35, 0.03, 0.72]} />
          <meshStandardMaterial color={colors.computerShade} roughness={0.9} />
        </mesh>
      </group>

      {/* ---- Disk archive case ---- */}
      <group position={station.disks.offset} rotation={[0, station.disks.yaw, 0]}>
        <mesh castShadow={shadows} receiveShadow position={[0, 1.0, -0.25]}>
          <boxGeometry args={[1.9, 2.0, 1.7]} />
          <meshStandardMaterial color={colors.metal} roughness={0.62} metalness={0.35} />
        </mesh>
        {/* Lid, hinged open behind the disks. */}
        <mesh castShadow={shadows} position={[0, 2.1, -0.9]} rotation={[-0.42, 0, 0]}>
          <boxGeometry args={[1.9, 1.2, 0.1]} />
          <meshStandardMaterial color={colors.metal} roughness={0.62} metalness={0.35} />
        </mesh>
        {/* Registered DOM face: dividers, disks and their labels. */}
        <group ref={diskPlane} position={[0, 1.0, 0.65]} rotation={[station.disks.tilt, 0, 0]} />
      </group>
    </group>
  );
}
