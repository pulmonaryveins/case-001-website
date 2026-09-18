import { useLayoutEffect, useMemo, useRef } from 'react';
import { Object3D, type SpotLight } from 'three';
import { environment as settings } from './config';

/** One light story: the tungsten lamp, plus a barely-there cool fill. */
export function LightingRig({ shadows }: { shadows: boolean }) {
  const light = useRef<SpotLight>(null);
  const target = useMemo(() => new Object3D(), []);
  const { lamp } = settings;
  useLayoutEffect(() => {
    target.position.set(...lamp.target);
    target.updateMatrixWorld();
    if (light.current) light.current.target = target;
  }, [lamp.target, target]);
  return (
    <>
      <primitive object={target} />
      <hemisphereLight args={[settings.colors.fill, settings.colors.room, lamp.fill]} />
      <spotLight
        ref={light}
        position={lamp.bulb}
        color={lamp.color}
        intensity={lamp.intensity}
        angle={lamp.angle}
        penumbra={lamp.penumbra}
        decay={lamp.decay}
        distance={0}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={6}
        shadow-camera-near={0.5}
        shadow-camera-far={18}
      />
    </>
  );
}
