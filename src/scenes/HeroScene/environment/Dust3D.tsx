import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
  Vector3,
  type Points,
} from 'three';
import { environment as settings } from './config';

/**
 * Suspended dust, visible only where the lamp cone reaches it. One Points
 * object, one small shader; the spot maths mirrors LightingRig/lighting.ts so
 * the motes agree with every other surface about where the light is.
 */
const { lamp, camera: shot, dust } = settings;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMotion;
  uniform float uScale;
  uniform vec3 uLamp;
  uniform vec3 uDir;
  uniform float uCosOuter;
  uniform float uCosInner;
  uniform float uDecay;
  uniform float uReach;
  attribute vec3 aSeed;
  attribute float aSize;
  varying float vLight;

  void main() {
    vec3 p = position;
    float t = uTime * uMotion;
    // Three incommensurate slow drifts per mote: no visible loop.
    p.x += sin(t * (0.031 + aSeed.x * 0.03) + aSeed.y * 6.2832) * 0.32;
    p.y += sin(t * (0.023 + aSeed.y * 0.025) + aSeed.z * 6.2832) * 0.42;
    p.z += cos(t * (0.027 + aSeed.z * 0.028) + aSeed.x * 6.2832) * 0.28;

    vec3 toMote = p - uLamp;
    float dist = length(toMote);
    float cone = smoothstep(uCosOuter, uCosInner, dot(toMote / dist, uDir));
    // Normalised to full brightness at uReach from the bulb, same decay as the lamp.
    vLight = cone * pow(uReach / dist, uDecay) * (0.25 + 0.75 * aSeed.x * aSeed.x);

    vec4 view = modelViewMatrix * vec4(p, 1.0);
    // Motes the camera travels through fade out before they can fill the lens.
    vLight *= smoothstep(1.6, 4.2, -view.z);
    gl_Position = projectionMatrix * view;
    gl_PointSize = aSize * uScale / -view.z;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vLight;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    float falloff = smoothstep(0.5, 0.05, r);
    gl_FragColor = vec4(uColor, falloff * vLight * uOpacity);
  }
`;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function Dust3D({ count, animate }: { count: number; animate: boolean }) {
  const { gl, size, invalidate } = useThree();
  const { geometry, material } = useMemo(() => {
    const random = rng(926);
    const bulb = new Vector3(...lamp.bulb);
    const dir = new Vector3(...lamp.target).sub(bulb).normalize();
    const cosOuter = Math.cos(lamp.angle);
    const cosInner = Math.cos(lamp.angle * (1 - lamp.penumbra));
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const point = new Vector3();
    // Rejection-sample the volume, biased toward the lit cone so few motes are wasted.
    for (let i = 0; i < count;) {
      point.set(
        dust.volume.min[0] + random() * (dust.volume.max[0] - dust.volume.min[0]),
        dust.volume.min[1] + random() * (dust.volume.max[1] - dust.volume.min[1]),
        dust.volume.min[2] + random() * (dust.volume.max[2] - dust.volume.min[2]),
      );
      const offset = point.clone().sub(bulb);
      const t = Math.min(
        1,
        Math.max(0, (offset.clone().normalize().dot(dir) - cosOuter) / (cosInner - cosOuter)),
      );
      const near = Math.max(0, 1 - offset.length() / dust.reach / 3);
      if (random() > 0.06 + 0.94 * t * near) continue;
      point.toArray(positions, i * 3);
      seeds.set([random(), random(), random()], i * 3);
      sizes[i] = dust.size[0] + Math.pow(random(), 2.5) * (dust.size[1] - dust.size[0]);
      i++;
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('aSeed', new BufferAttribute(seeds, 3));
    geo.setAttribute('aSize', new BufferAttribute(sizes, 1));
    const mat = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMotion: { value: 1 },
        uScale: { value: 1 },
        uLamp: { value: bulb },
        uDir: { value: dir },
        uCosOuter: { value: cosOuter },
        uCosInner: { value: cosInner },
        uDecay: { value: lamp.decay },
        uReach: { value: dust.reach },
        uColor: { value: new Color(lamp.color) },
        uOpacity: { value: dust.opacity },
      },
    });
    return { geometry: geo, material: mat };
  }, [count]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  // Uniform writes go through the rendered object, not the memoised value.
  const points = useRef<Points<BufferGeometry, ShaderMaterial>>(null);

  // Point size in world units -> pixels for the current viewport and DPR.
  useEffect(() => {
    const uniforms = points.current?.material.uniforms;
    if (!uniforms) return;
    const tangent = Math.tan((shot.fov * Math.PI) / 360);
    uniforms.uScale.value = (size.height * gl.getPixelRatio()) / (2 * tangent);
    uniforms.uMotion.value = animate ? 1 : 0;
    invalidate();
  }, [animate, gl, invalidate, material, size.height]);

  // Throttled drift: the scene otherwise renders on demand. Paused off-screen,
  // in background tabs and under reduced motion (motes stay frozen in place).
  useEffect(() => {
    if (!animate) return;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(gl.domElement);
    const timer = window.setInterval(() => {
      if (visible && !document.hidden) invalidate();
    }, 1000 / dust.fps);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, [animate, gl, invalidate]);

  useFrame(({ clock }) => {
    if (points.current) points.current.material.uniforms.uTime.value = clock.elapsedTime;
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}
