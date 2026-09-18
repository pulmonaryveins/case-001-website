import type { PaperMaterialAsset, PhysicalImageAsset } from '../types/portfolio';
import subjectFallback from '../assets/photos/unknown-subject.svg';
import portraitFallback from '../assets/photos/subject-portrait-placeholder.svg';
import frontendFallback from '../assets/evidence/frontend-study.svg';
import uiuxFallback from '../assets/evidence/wireframe-study.svg';
import graphicFallback from '../assets/evidence/type-study.svg';
import videoFallback from '../assets/evidence/timeline-study.svg';
import corkFallback from '../assets/textures/cork-grain.svg';

// Local files only. Missing final assets never produce broken URL requests.
// Add the named files below, then restart Vite. No scene restructuring needed.
// AVIF is preferred when both formats are supplied; -small provides a 440w image.
const rasterFiles = import.meta.glob<string>(
  [
    '../assets/textures/cork/cork-texture.{webp,avif}',
    '../assets/textures/wood/desk-wood.{webp,avif}',
    '../assets/textures/paper/{paper-fibers,paper-wear,torn-edge-mask,worn-edge-mask}.{webp,avif}',
    '../assets/props/stationery/{masking-tape}.{webp,avif}',
    '../assets/photos/subject/{subject-obscured,subject-obscured-small}.{webp,avif}',
    '../assets/photos/subject/{subject-portrait,subject-portrait-small}.{webp,avif}',
    '../assets/evidence/frontend/{interface-evidence,interface-evidence-small}.{webp,avif}',
    '../assets/evidence/uiux/{wireframe-evidence,wireframe-evidence-small}.{webp,avif}',
    '../assets/evidence/graphic/{design-evidence,design-evidence-small}.{webp,avif}',
    '../assets/evidence/video/{timeline-evidence,timeline-evidence-small}.{webp,avif}',
  ],
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
);
function raster(path: string): string | undefined {
  return rasterFiles[`../assets/${path}.avif`] ?? rasterFiles[`../assets/${path}.webp`];
}
function image(
  path: string,
  width: number,
  height: number,
  fallback?: string,
): PhysicalImageAsset | undefined {
  const finalSrc = raster(path);
  const src = finalSrc ?? fallback;
  if (!src) return undefined;
  const smallSrc = width > 440 ? raster(`${path}-small`) : undefined;
  return {
    src,
    width,
    height,
    srcSet: finalSrc && smallSrc ? `${smallSrc} 440w, ${finalSrc} ${width}w` : undefined,
  };
}
const fiber = raster('textures/paper/paper-fibers');
const wear = raster('textures/paper/paper-wear');
const tornMask = raster('textures/paper/torn-edge-mask');
const wornMask = raster('textures/paper/worn-edge-mask');
const cork = raster('textures/cork/cork-texture');

export const heroAssets = {
  cork: cork ?? corkFallback,
  corkIsPlaceholder: !cork,
  wood: raster('textures/wood/desk-wood'),
  tape: raster('props/stationery/masking-tape'),
  paper: {
    clean: { textureSrc: fiber },
    aged: { textureSrc: fiber, wearOverlaySrc: wear },
    torn: { textureSrc: fiber, edgeMaskSrc: tornMask, wearOverlaySrc: wear },
    note: { textureSrc: fiber, edgeMaskSrc: wornMask },
    document: { textureSrc: fiber },
    photoBacking: { textureSrc: fiber, edgeMaskSrc: wornMask },
  } satisfies Record<string, PaperMaterialAsset>,
  subject: image('photos/subject/subject-obscured', 800, 880, subjectFallback)!,
  // Identified portrait for the opened dossier (About). Placeholder until supplied.
  portrait: {
    ...image('photos/subject/subject-portrait', 800, 960, portraitFallback)!,
    isPlaceholder: !raster('photos/subject/subject-portrait'),
  },
  evidence: {
    frontend: image('evidence/frontend/interface-evidence', 880, 660, frontendFallback)!,
    uiux: image('evidence/uiux/wireframe-evidence', 880, 660, uiuxFallback)!,
    graphic: image('evidence/graphic/design-evidence', 880, 660, graphicFallback)!,
    video: image('evidence/video/timeline-evidence', 880, 660, videoFallback)!,
  },
};
