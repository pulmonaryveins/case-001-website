export interface PhysicalImageAsset {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
}

export interface PaperMaterialAsset {
  textureSrc?: string;
  edgeMaskSrc?: string;
  wearOverlaySrc?: string;
}

export interface InvestigationIntro {
  caseNumber: string;
  eyebrow: string;
  subject: string;
  status: string;
  question: string;
  annotation: string;
  scrollPrompt: string;
  photoSrc: string;
  photoAlt: string;
  photoSrcSet?: string;
  /** Closed file on the desk; opening it belongs to the About scene. */
  dossier: {
    title: string;
    classification: string;
    status: string;
  };
  /** Country-level only: no city or personal location. */
  location: {
    label: string;
    coordinates: string;
    alt: string;
  };
  branches: {
    id: string;
    number: string;
    title: string;
    detail: string;
    evidenceSrc: string;
    evidenceAlt: string;
    evidenceSrcSet?: string;
  }[];
}

/**
 * Subject dossier (About). Every personal field is a placeholder until real
 * data is supplied in `src/data/profile.ts`; scenes never hardcode it.
 */
export interface Profile {
  name: string;
  role: string;
  location: string;
  /** 2-4 short sentences. */
  summary: string[];
  disciplines: string[];
  skills: SkillGroup[];
  education: EducationEntry[];
  portrait: EvidenceImage;
}

export interface EvidenceImage {
  src: string;
  alt: string;
  isPlaceholder: boolean;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface EducationEntry {
  institution: string;
  program: string;
  period: string;
  /** City-level at most, e.g. "Cebu, Philippines". */
  location: string;
}

/**
 * One chapter of the subject's career. Each entry fills one right-hand dossier
 * page, so the shape is deliberately page-sized: adding an entry adds a page,
 * and nothing in the scene is indexed against a fixed number of them.
 */
export interface Experience {
  id: string;
  organization: string;
  role: string;
  /** Display string, e.g. "September 2023 — Present". */
  dateRange: string;
  description: string;
  /** 2-4 concise responsibility/impact lines. */
  highlights: string[];
  focusAreas: string[];
  /** Exactly two prints attached to the page. */
  images: [ExperienceImage, ExperienceImage];
  /** Sortable values for later; the page prints `dateRange`. */
  startDate?: string;
  endDate?: string | 'present';
}

/** `src` stays optional so a page renders an empty print until an asset exists. */
export interface ExperienceImage {
  src?: string;
  srcSet?: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

/**
 * PROJECT ARCHIVE (Scene 06). The four categories are the four disciplines the
 * investigation has been building toward, and they are also the four physical
 * dividers in the disk case, so the scene is generated entirely from this data:
 * adding a record adds a disk, and marking it `featured` adds it to the scrolled
 * tour. Nothing in the scene is indexed against a fixed number of projects.
 */
export type ProjectCategory = 'development' | 'graphic' | 'video' | 'uiux';

/** `src` stays optional so the CRT prints an archival "media missing" frame. */
export interface ProjectImage {
  src?: string;
  srcSet?: string;
  alt: string;
  /** Short caption printed under the preview, e.g. "Order flow". */
  label?: string;
  width?: number;
  height?: number;
}

/** Never preloaded: the CRT loads a source only once the reader asks to play. */
export interface ProjectVideo {
  src?: string;
  posterSrc?: string;
  /** WebVTT track. Required alongside any real footage. */
  captionsSrc?: string;
}

export interface Project {
  id: string;
  /** Printed on the disk sticker and the CRT header, e.g. "DEV / 01". */
  archiveNumber: string;
  title: string;
  /** Second line of the disk sticker, e.g. "Food Ordering System". */
  subtitle: string;
  category: ProjectCategory;
  /** One or two sentences, printed on the CRT beside the preview. */
  description: string;
  tools: string[];
  images: ProjectImage[];
  /** Present on video records; the CRT becomes the player when asked. */
  video?: ProjectVideo;
  role?: string;
  year?: number;
  liveUrl?: string;
  repoUrl?: string;
  /** Part of the scrolled tour. At most three per category (see projects.ts). */
  featured: boolean;
  /** Demo record: the CRT marks it so placeholder copy is never read as real work. */
  isPlaceholder: boolean;
}

export interface VideoProject {
  id: string;
  tapeNumber: string;
  title: string;
  description: string;
  posterSrc: string;
  videoSrc: string;
  year: number;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  year: number;
  imageSrc: string;
  credentialUrl?: string;
}

export type SocialPlatform = 'email' | 'linkedin' | 'github' | 'behance' | 'other';

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  url: string;
}
