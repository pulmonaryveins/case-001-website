import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping, PCFShadowMap, type Group } from 'three';
import { CameraRig, type CameraState, type RegisteredPlane } from './CameraRig';
import { LightingRig } from './LightingRig';
import { InvestigationBoard3D } from './InvestigationBoard3D';
import { Room } from './Room';
import { Desk3D } from './Desk3D';
import { Lamp3D } from './Lamp3D';
import { ForegroundProps3D } from './ForegroundProps3D';
import { Dust3D } from './Dust3D';
import { environment as settings } from './config';

interface Props {
  overlay: RefObject<HTMLDivElement | null>;
  deskOverlay: RefObject<HTMLDivElement | null>;
  camera: RefObject<CameraState>;
  invalidateRef: RefObject<(() => void) | null>;
  tablet: boolean;
  animateAtmosphere: boolean;
  onReady: () => void;
  onFailure: () => void;
}

export default function HeroEnvironmentCanvas({
  overlay,
  deskOverlay,
  camera,
  invalidateRef,
  tablet,
  animateAtmosphere,
  onReady,
  onFailure,
}: Props) {
  const board = useRef<Group>(null);
  const deskPlane = useRef<Group>(null);
  // Every DOM layer that must read as part of the 3D room, projected by one camera.
  const planes = useMemo<RegisteredPlane[]>(
    () => [
      {
        element: overlay,
        object: board,
        pixels: settings.board.pixels,
        size: [settings.board.width, settings.board.height],
        face: settings.board.faceZ,
      },
      {
        element: deskOverlay,
        object: deskPlane,
        pixels: settings.desk.plane.pixels,
        size: [settings.desk.plane.width, settings.desk.plane.depth],
        face: 0,
      },
    ],
    [overlay, deskOverlay],
  );
  const canvas = useRef<HTMLCanvasElement | null>(null);
  useEffect(
    () => () => {
      canvas.current?.removeEventListener('webglcontextlost', onFailure);
    },
    [onFailure],
  );
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, tablet ? 1 : settings.dpr]}
      shadows={tablet ? false : { type: PCFShadowMap }}
      camera={{ fov: settings.camera.fov, near: 0.5, far: 60, position: [0, 0, 20] }}
      gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
        // Static geometry: CameraRig bakes the shadow map once, dust frames reuse it.
        gl.shadowMap.autoUpdate = false;
        canvas.current = gl.domElement;
        gl.domElement.addEventListener('webglcontextlost', onFailure, { once: true });
      }}
    >
      <color attach="background" args={[settings.colors.room]} />
      {/* One boundary: readiness is reported only after every material has resolved. */}
      <Suspense fallback={null}>
        <LightingRig shadows={!tablet} />
        <Room />
        <InvestigationBoard3D board={board} />
        <Desk3D plane={deskPlane} />
        <Lamp3D />
        {!tablet && <ForegroundProps3D />}
        <Dust3D
          count={tablet ? settings.dust.countTablet : settings.dust.count}
          animate={animateAtmosphere}
        />
        <CameraRig planes={planes} state={camera} invalidateRef={invalidateRef} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
