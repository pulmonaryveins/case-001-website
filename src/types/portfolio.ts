export interface Profile {
  name: string;
  role: string;
  location: string;
  summary: string;
  disciplines: string[];
  skills: string[];
  education: EducationEntry[];
  photoSrc: string;
}

export interface EducationEntry {
  institution: string;
  credential: string;
  startYear: number;
  endYear: number | 'present';
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string | 'present';
  description: string;
  highlights: string[];
}

export type ProjectCategory = 'coding' | 'uiux' | 'graphic-design';

export interface ProjectImage {
  src: string;
  alt: string;
  label?: string;
}

export interface Project {
  id: string;
  caseNumber: string;
  title: string;
  category: ProjectCategory;
  year: number;
  description: string;
  role: string;
  tools: string[];
  status: 'completed' | 'in-progress' | 'archived';
  previewImage: string;
  images: ProjectImage[];
  liveUrl?: string;
  repoUrl?: string;
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
