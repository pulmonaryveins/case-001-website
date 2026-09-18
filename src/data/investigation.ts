import type { InvestigationIntro } from '../types/portfolio';
import { heroAssets } from './heroAssets';
export const investigation: InvestigationIntro = {
  caseNumber: 'CASE 0926',
  eyebrow: 'CREATIVE INVESTIGATION / OPEN FILE',
  subject: 'UNKNOWN',
  status: 'UNDER INVESTIGATION',
  question: 'Different disciplines. Same person?',
  annotation: 'Same mind. Different tools?',
  scrollPrompt: 'SCROLL TO INVESTIGATE',
  // Replace with the final obscured portrait, keeping identity concealed.
  photoSrc: heroAssets.subject.src,
  photoSrcSet: heroAssets.subject.srcSet,
  photoAlt: 'Unidentified subject silhouette in a dark photograph',
  dossier: {
    title: 'SUBJECT DOSSIER',
    classification: 'CONFIDENTIAL',
    status: 'IDENTIFICATION PENDING',
  },
  location: {
    label: 'LOCATION / PHILIPPINES',
    // Geographic centre of the country, not a personal location.
    coordinates: '12.88° N  121.77° E',
    alt: 'Dark map of the Philippine archipelago: Luzon, the Visayas and Mindanao',
  },
  branches: [
    {
      id: 'frontend',
      number: '01',
      title: 'Frontend Developer',
      detail: 'STRUCTURE / INTERACTION',
      evidenceSrc: heroAssets.evidence.frontend.src,
      evidenceSrcSet: heroAssets.evidence.frontend.srcSet,
      evidenceAlt: 'Placeholder interface structure and code study, not a portfolio project',
    },
    {
      id: 'uiux',
      number: '02',
      title: 'UI/UX Designer',
      detail: 'BEHAVIOR / EXPERIENCE',
      evidenceSrc: heroAssets.evidence.uiux.src,
      evidenceSrcSet: heroAssets.evidence.uiux.srcSet,
      evidenceAlt: 'Placeholder wireframe and user flow study',
    },
    {
      id: 'graphic',
      number: '03',
      title: 'Graphic Designer',
      detail: 'FORM / COMMUNICATION',
      evidenceSrc: heroAssets.evidence.graphic.src,
      evidenceSrcSet: heroAssets.evidence.graphic.srcSet,
      evidenceAlt: 'Placeholder typography and color study',
    },
    {
      id: 'video',
      number: '04',
      title: 'Video Editor',
      detail: 'SEQUENCE / NARRATIVE',
      evidenceSrc: heroAssets.evidence.video.src,
      evidenceSrcSet: heroAssets.evidence.video.srcSet,
      evidenceAlt: 'Placeholder editing timeline and frame sequence',
    },
  ],
};
