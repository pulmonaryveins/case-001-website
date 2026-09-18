import { useEffect, useMemo, type RefObject } from 'react';
import { useTexture } from '@react-three/drei';
import { RepeatWrapping, SRGBColorSpace, type Group, type Texture } from 'three';
import { heroAssets } from '../../../data/heroAssets';
import { environment as settings } from './config';
import { createCorkTextures, createWoodTexture } from './textures';

const { width, height } = settings.board;
const rail = 0.34;
const railDepth = 0.26;

function CorkMaterial({ map, bump }: { map: Texture; bump: Texture }) {
  return (
    <meshStandardMaterial map={map} bumpMap={bump} bumpScale={1.2} roughness={0.96} metalness={0} />
  );
}

function ScannedCork({ src }: { src: string }) {
  const texture = useTexture(src, (loaded) => {
    if (Array.isArray(loaded)) return;
    loaded.colorSpace = SRGBColorSpace;
    loaded.wrapS = loaded.wrapT = RepeatWrapping;
    loaded.repeat.set(4, 2.5);
  });
  return <CorkMaterial map={texture} bump={texture} />;
}

function ProceduralCork() {
  const textures = useMemo(() => createCorkTextures(), []);
  useEffect(
    () => () => {
      textures.map.dispose();
      textures.bump.dispose();
    },
    [textures],
  );
  return <CorkMaterial {...textures} />;
}

export function InvestigationBoard3D({ board }: { board: RefObject<Group | null> }) {
  const frameWood = useMemo(() => createWoodTexture(17, [44, 32, 22], [3, 1]), []);
  useEffect(() => () => frameWood.dispose(), [frameWood]);
  const frame = (
    <meshStandardMaterial map={frameWood} color="#8a7560" roughness={0.62} metalness={0} />
  );
  return (
    <group ref={board} position={settings.board.position} rotation={settings.board.rotation}>
      <mesh receiveShadow position={[0, 0, 0.06]}>
        <boxGeometry args={[width, height, 0.2]} />
        {heroAssets.corkIsPlaceholder ? <ProceduralCork /> : <ScannedCork src={heroAssets.cork} />}
      </mesh>
      {[-1, 1].map((sign) => (
        <mesh
          key={`side-${sign}`}
          castShadow
          receiveShadow
          position={[sign * (width / 2 + rail / 2), 0, railDepth / 2 + 0.02]}
        >
          <boxGeometry args={[rail, height + rail * 2, railDepth]} />
          {frame}
        </mesh>
      ))}
      {[-1, 1].map((sign) => (
        <mesh
          key={`edge-${sign}`}
          castShadow
          receiveShadow
          position={[0, sign * (height / 2 + rail / 2), railDepth / 2 + 0.02]}
        >
          <boxGeometry args={[width, rail, railDepth]} />
          {frame}
        </mesh>
      ))}
    </group>
  );
}
