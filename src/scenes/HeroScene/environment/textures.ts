import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three';

/**
 * Seeded procedural materials used until scanned rasters are supplied
 * (see ASSETS.md). Synchronous, so they never delay or pop in after readiness.
 */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(width: number, height: number) {
  const el = document.createElement('canvas');
  el.width = width;
  el.height = height;
  return [el, el.getContext('2d')!] as const;
}

function finish(el: HTMLCanvasElement, repeat: [number, number], color: boolean): Texture {
  const texture = new CanvasTexture(el);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.anisotropy = 8;
  if (color) texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function createCorkTextures() {
  const size = 512;
  const random = rng(926);
  const [el, ctx] = canvas(size, size);
  ctx.fillStyle = '#6e5840';
  ctx.fillRect(0, 0, size, size);
  // Broad warm variation, then three granule scales.
  for (let i = 0; i < 90; i++) {
    const x = random() * size;
    const y = random() * size;
    const r = 20 + random() * 60;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const tone = random() < 0.5 ? '120,88,55' : '150,118,80';
    g.addColorStop(0, `rgba(${tone},0.16)`);
    g.addColorStop(1, `rgba(${tone},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const granules: [number, number, number][] = [
    [9000, 0.6, 1.4],
    [3200, 1.2, 2.4],
    [500, 2, 3.6],
  ];
  for (const [count, min, max] of granules) {
    for (let i = 0; i < count; i++) {
      const light = random() < 0.45;
      const l = light ? 150 + random() * 45 : 60 + random() * 45;
      ctx.fillStyle = `rgba(${l + 12},${l * 0.82},${l * 0.6},${0.25 + random() * 0.4})`;
      const r = min + random() * (max - min);
      ctx.beginPath();
      ctx.ellipse(
        random() * size,
        random() * size,
        r,
        r * (0.6 + random() * 0.4),
        random() * 3.14,
        0,
        6.29,
      );
      ctx.fill();
    }
  }
  // Bump: luminance of the same granules drives roughness relief.
  const [bumpEl, bumpCtx] = canvas(size, size);
  bumpCtx.filter = 'grayscale(1) contrast(1.6)';
  bumpCtx.drawImage(el, 0, 0);
  return {
    map: finish(el, [4, 2.5], true),
    bump: finish(bumpEl, [4, 2.5], false),
  };
}

export function createWoodTexture(
  seed: number,
  tone: [number, number, number],
  repeat: [number, number],
  width = 1024,
) {
  const height = width / 4;
  const random = rng(seed);
  const [el, ctx] = canvas(width, height);
  ctx.fillStyle = `rgb(${tone.join(',')})`;
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 220; i++) {
    const y = random() * height;
    const amp = 1 + random() * 5;
    const freq = 0.002 + random() * 0.01;
    const phase = random() * 6.28;
    const shade = random() < 0.5 ? 0 : 255;
    ctx.strokeStyle = `rgba(${shade},${shade * 0.8},${shade * 0.6},${0.03 + random() * 0.06})`;
    ctx.lineWidth = 0.5 + random() * 2.5;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 16) {
      const yy = y + Math.sin(x * freq + phase) * amp;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  // Restrained wear: a few soft, lighter scuffs.
  for (let i = 0; i < 14; i++) {
    const x = random() * width;
    const y = random() * height;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 40 + random() * 60);
    g.addColorStop(0, 'rgba(255,230,190,0.05)');
    g.addColorStop(1, 'rgba(255,230,190,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }
  return finish(el, repeat, true);
}
