import { useEffect, useMemo, type RefObject } from 'react';
import { useTexture } from '@react-three/drei';
import { RepeatWrapping, SRGBColorSpace, type Group, type Texture } from 'three';
import { heroAssets } from '../../../data/heroAssets';
import { environment as settings } from './config';
import { createWoodTexture } from './textures';

export const DESK_TOP = settings.desk.top;

function DeskMaterial({ map }: { map: Texture }) {
  return <meshStandardMaterial map={map} color="#cdb9a2" roughness={0.5} metalness={0} />;
}

function ScannedWood({ src }: { src: string }) {
  const texture = useTexture(src, (loaded) => {
    if (Array.isArray(loaded)) return;
    loaded.colorSpace = SRGBColorSpace;
    loaded.wrapS = loaded.wrapT = RepeatWrapping;
  });
  return <DeskMaterial map={texture} />;
}

function ProceduralWood() {
  // Dark worn walnut; higher resolution than the board frame because the camera lands on it.
  const texture = useMemo(() => createWoodTexture(41, [84, 58, 38], [2.2, 1.4], 2048), []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <DeskMaterial map={texture} />;
}

/**
 * Desk slab plus the invisible plane the dossier DOM is registered onto. The
 * plane lies on the top surface (local +Z = world up, local +Y = toward the wall).
 */
export function Desk3D({ plane }: { plane: RefObject<Group | null> }) {
  return (
    <>
      <mesh receiveShadow position={[0, DESK_TOP - 0.2, 3.4]}>
        <boxGeometry args={[18, 0.4, 6.4]} />
        {heroAssets.wood ? <ScannedWood src={heroAssets.wood} /> : <ProceduralWood />}
      </mesh>
      <group ref={plane} position={settings.desk.plane.center} rotation={[-Math.PI / 2, 0, 0]} />
    </>
  );
}
