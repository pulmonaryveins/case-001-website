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
import type { ProjectArchiveController } from '../../ProjectsScene/archiveController';
import { projects, projectCategories } from '../../../data/projects';
import { Workstation3D } from './Workstation3D';
import { environment as settings } from './config';

interface Props {
  overlay: RefObject<HTMLDivElement | null>;
  deskOverlay: RefObject<HTMLDivElement | null>;
  screenOverlay: RefObject<HTMLDivElement | null>;
  diskOverlay: RefObject<HTMLDivElement | null>;
  /** CRT emission; Workstation3D reads it each rendered frame. */
  crtGlow: { value: number };
  archiveController: ProjectArchiveController;
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
  screenOverlay,
  diskOverlay,
  crtGlow,
  archiveController,
  camera,
  invalidateRef,
  tablet,
  animateAtmosphere,
  onReady,
  onFailure,
}: Props) {
  const board = useRef<Group>(null);
  const deskPlane = useRef<Group>(null);
  const screenPlane = useRef<Group>(null);
  const diskTargets = useMemo(
    () =>
      Array.from({ length: projects.length + projectCategories.length + 2 }, () => ({
        current: null as Group | null,
      })),
    [],
  );
  const labelElements = useMemo(
    () => diskTargets.map(() => ({ current: null as HTMLElement | null })),
    [diskTargets],
  );
  useEffect(() => {
    diskOverlay.current?.querySelectorAll<HTMLElement>('[data-archive-label]').forEach((el) => {
      labelElements[Number(el.dataset.archiveLabel)].current = el;
    });
  }, [diskOverlay, labelElements]);
  // Every DOM layer that must read as part of the 3D room, projected by one camera.
  const planes = useMemo<RegisteredPlane[]>(
    () => [
      {
        // No `visible` predicate here, deliberately. The board is a physical
        // object in the room: what the camera can see decides whether it is
        // drawn, never which chapter is active. Gating it on archive progress
        // hid every paper, photo, string and pin the moment the scroll crossed
        // into Scene 06 while the 3D cork kept rendering — the empty-corkboard
        // bug. Overlap with the workstation is prevented spatially instead
        // (see config.workstation / config.board).
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
      {
        element: screenOverlay,
        visible: () => camera.current.archive > 0.6,
        object: screenPlane,
        pixels: settings.workstation.screen.pixels,
        size: settings.workstation.screen.size,
        face: 0,
      },
      ...diskTargets.map((object, index) => ({
        element: labelElements[index],
        visible: () => camera.current.archive > 0.6,
        object,
        pixels: [200, 76] as const,
        size: [0.64, 0.2432] as const,
        face: 0,
      })),
    ],
    [overlay, deskOverlay, screenOverlay, diskTargets, labelElements, camera],
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
        <Workstation3D
          screenPlane={screenPlane}
          diskTargets={diskTargets}
          controller={archiveController}
          camera={camera}
          glow={crtGlow}
          shadows={!tablet}
        />
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
