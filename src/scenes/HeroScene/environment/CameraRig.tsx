import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Matrix4, PerspectiveCamera, Vector3, type Object3D } from 'three';
import { environment as settings } from './config';
import { registrationMatrix } from './registration';
import { CameraPath, type CameraState } from './cameraPath';

export type { CameraState };

/** A DOM layer registered onto a 3D plane: pixel size and the plane's local face. */
export interface RegisteredPlane {
  element: RefObject<HTMLElement | null>;
  object: RefObject<Object3D | null>;
  pixels: readonly [number, number];
  size: readonly [number, number];
  /** Offset of the DOM face along the plane's local +Z. */
  face: number;
}

interface Props {
  planes: RegisteredPlane[];
  state: RefObject<CameraState>;
  invalidateRef: RefObject<(() => void) | null>;
  onReady: () => void;
}

const { camera: shot } = settings;

/**
 * Overlay pixel space (width x height, y down, CSS z toward the viewer) ->
 * plane-local coordinates. CSS z uses the same px scale as x, so a DOM layer
 * lifted 10px sits 10px-worth of world units above the plane.
 */
function pixelMatrix({ pixels, size, face }: RegisteredPlane) {
  return new Matrix4().set(
    size[0] / pixels[0],
    0,
    0,
    -size[0] / 2,
    0,
    -size[1] / pixels[1],
    0,
    size[1] / 2,
    0,
    0,
    size[0] / pixels[0],
    face,
    0,
    0,
    0,
    1,
  );
}

/**
 * CSS matrix3d cannot render a plane that crosses behind the camera, and a
 * fully off-screen plane only costs compositing. Returns false in both cases.
 */
function planeVisible(m: number[], [w, h]: readonly [number, number]) {
  let left = 0;
  let right = 0;
  let above = 0;
  let below = 0;
  for (const [x, y] of [
    [0, 0],
    [w, 0],
    [0, h],
    [w, h],
  ]) {
    const cw = m[3] * x + m[7] * y + m[15];
    if (cw < 0.05) return false;
    const nx = (m[0] * x + m[4] * y + m[12]) / cw;
    const ny = (m[1] * x + m[5] * y + m[13]) / cw;
    if (nx < -1) left++;
    if (nx > 1) right++;
    if (ny > 1) above++;
    if (ny < -1) below++;
  }
  return left < 4 && right < 4 && above < 4 && below < 4;
}

export function CameraRig({ planes, state, invalidateRef, onReady }: Props) {
  const invalidate = useThree((s) => s.invalidate);
  const rendered = useRef(false);
  const reported = useRef(false);
  const written = useRef<string[]>([]);
  const path = useMemo(() => new CameraPath(), []);
  const keyed = useRef({ aspect: 0, push: -1 });
  const scratch = useMemo(
    () => ({
      position: new Vector3(),
      target: new Vector3(),
      clip: new Matrix4(),
      pixels: planes.map(pixelMatrix),
    }),
    [planes],
  );

  useEffect(() => {
    invalidateRef.current = invalidate;
    return () => {
      invalidateRef.current = null;
    };
  }, [invalidate, invalidateRef]);

  // If the environment goes away (e.g. WebGL fails), the DOM layers return to flat layout.
  useEffect(
    () => () => {
      written.current = [];
      planes.forEach(({ element }) => {
        element.current?.style.removeProperty('transform');
        element.current?.style.removeProperty('visibility');
      });
    },
    [planes],
  );

  // Runs on every rendered frame (intro, scroll, resize, dust ticks) but only
  // touches the DOM when a projection actually changed.
  useFrame(({ camera, size, gl }) => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const aspect = size.width / size.height;
    // Key poses depend only on viewport shape and the intro dolly.
    if (aspect !== keyed.current.aspect || state.current.push !== keyed.current.push) {
      keyed.current = { aspect, push: state.current.push };
      path.update(aspect, state.current.push);
    }
    path.sample(
      state.current.travel,
      state.current.inspect,
      state.current.archive,
      scratch.position,
      scratch.target,
    );
    camera.fov = shot.fov;
    camera.aspect = aspect;
    camera.position.copy(scratch.position);
    camera.lookAt(scratch.target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    planes.forEach((plane, i) => {
      const element = plane.element.current;
      const object = plane.object.current;
      if (!element || !object) return;
      object.updateWorldMatrix(true, false);
      scratch.clip
        .copy(camera.projectionMatrix)
        .multiply(camera.matrixWorldInverse)
        .multiply(object.matrixWorld)
        .multiply(scratch.pixels[i]);
      const m = scratch.clip.elements;
      const value = planeVisible(m, plane.pixels)
        ? `matrix3d(${registrationMatrix(m, size.width, size.height).join(',')})`
        : 'hidden';
      if (value === written.current[i]) return;
      written.current[i] = value;
      if (value === 'hidden') {
        element.style.visibility = 'hidden';
      } else {
        element.style.visibility = '';
        // Direct transform write: an inherited custom property here would
        // restyle every piece of evidence in the plane on each camera frame.
        element.style.transform = value;
      }
    });

    // Report on the second frame: the first one compiles shaders and builds the
    // shadow map, which would otherwise stall the start of the intro timeline.
    if (rendered.current && !reported.current) {
      reported.current = true;
      onReady();
    } else if (!rendered.current) {
      rendered.current = true;
      // Static scene: bake the lamp's shadow map once, now that every mesh is mounted.
      gl.shadowMap.needsUpdate = true;
      invalidate();
    }
  }, -1);
  return null;
}
