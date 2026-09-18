import type { Profile } from '../types/portfolio';
import { heroAssets } from './heroAssets';

/**
 * SUBJECT DOSSIER — placeholder data.
 * Replace the bracketed values with real information; the About scene reads
 * only from here. Location stays country-level (it confirms the board's
 * LOCATION / PHILIPPINES evidence). No real identity, school or credential is
 * implied by these placeholders.
 */
export const profile: Profile = {
  name: '[SUBJECT NAME]',
  role: '[ROLE / TITLE]',
  location: 'Philippines',
  summary: [
    '[Placeholder: one sentence on who the subject is and what they make.]',
    '[Placeholder: one sentence on how they work across code, design and motion.]',
    '[Placeholder: one sentence on what they are looking for next.]',
  ],
  disciplines: ['Frontend Development', 'UI/UX Design', 'Graphic Design', 'Video Editing'],
  skills: [
    { label: 'Development', items: ['[skill]', '[skill]', '[skill]'] },
    { label: 'Design', items: ['[skill]', '[skill]', '[skill]'] },
    { label: 'Motion', items: ['[skill]', '[skill]'] },
  ],
  education: [
    {
      institution: '[INSTITUTION]',
      program: '[PROGRAM]',
      period: '[PERIOD]',
      location: 'Cebu, Philippines',
    },
  ],
  portrait: {
    src: heroAssets.portrait.src,
    alt: 'Placeholder identification photograph, to be replaced with the subject portrait',
    isPlaceholder: heroAssets.portrait.isPlaceholder,
  },
};
