import type { Project, ProjectCategory } from '../types/portfolio';

/**
 * PROJECT ARCHIVE — demo capacity, five disks per category.
 *
 * Only what was actually supplied is written as real content: the development
 * record names, and the one description provided with them. Every other record
 * is an obvious placeholder carrying `isPlaceholder: true`, which the CRT prints
 * as an UNVERIFIED banner so demo copy can never be mistaken for real work. No
 * client, company, metric, award or outcome is invented here.
 *
 * Replacing a record is the only step needed to publish real work: the disk
 * case, the scrolled tour, the counters and the category dividers are all
 * generated from this array.
 */

/** Divider order in the case, and the order the scrolled tour visits them. */
export const projectCategories: { id: ProjectCategory; label: string; code: string }[] = [
  { id: 'development', label: 'Development', code: 'DEV' },
  { id: 'graphic', label: 'Graphic', code: 'GFX' },
  { id: 'video', label: 'Video', code: 'VID' },
  { id: 'uiux', label: 'UI/UX', code: 'UIX' },
];

/** Three preview slots per record; no assets supplied yet. */
const pendingImages = (subject: string) => [
  { alt: `Placeholder for the first ${subject} preview frame`, label: 'Frame 01' },
  { alt: `Placeholder for the second ${subject} preview frame`, label: 'Frame 02' },
  { alt: `Placeholder for the third ${subject} preview frame`, label: 'Frame 03' },
];

const PENDING =
  '[Placeholder: one or two sentences describing this record. Replace before publishing.]';

export const projects: Project[] = [
  // ---------------- DEVELOPMENT ----------------
  {
    id: 'dev-lamoy',
    archiveNumber: 'DEV / 01',
    title: 'Lamoy',
    subtitle: 'Food Ordering System',
    category: 'development',
    description:
      'An intuitive platform for browsing and ordering authentic local Filipino dishes with modern design.',
    tools: ['React', 'Tailwind CSS', 'NeonDB'],
    images: pendingImages('Lamoy'),
    featured: true,
    isPlaceholder: false,
  },
  {
    id: 'dev-orgaflow',
    archiveNumber: 'DEV / 02',
    title: 'OrgaFlow',
    subtitle: 'Event Management System',
    category: 'development',
    description: PENDING,
    tools: ['[tool]', '[tool]', '[tool]'],
    images: pendingImages('OrgaFlow'),
    featured: true,
    isPlaceholder: true,
  },
  {
    id: 'dev-taskmate',
    archiveNumber: 'DEV / 03',
    title: 'TaskMate',
    subtitle: 'Productivity App',
    category: 'development',
    description: PENDING,
    tools: ['[tool]', '[tool]'],
    images: pendingImages('TaskMate'),
    featured: true,
    isPlaceholder: true,
  },
  {
    id: 'dev-pixelpress',
    archiveNumber: 'DEV / 04',
    title: 'PixelPress',
    subtitle: 'Blog Platform',
    category: 'development',
    description: PENDING,
    tools: ['[tool]', '[tool]'],
    images: pendingImages('PixelPress'),
    featured: false,
    isPlaceholder: true,
  },
  {
    id: 'dev-studyhub',
    archiveNumber: 'DEV / 05',
    title: 'StudyHub',
    subtitle: 'Learning Management',
    category: 'development',
    description: PENDING,
    tools: ['[tool]', '[tool]'],
    images: pendingImages('StudyHub'),
    featured: false,
    isPlaceholder: true,
  },

  // ---------------- GRAPHIC ----------------
  {
    id: 'gfx-01',
    archiveNumber: 'GFX / 01',
    title: 'Graphic Project 01',
    subtitle: '[Poster / identity]',
    category: 'graphic',
    description: PENDING,
    tools: ['[tool]', '[tool]'],
    images: pendingImages('graphic project 01'),
    featured: true,
    isPlaceholder: true,
  },
  {
    id: 'gfx-02',
    archiveNumber: 'GFX / 02',
    title: 'Graphic Project 02',
    subtitle: '[Branding]',
    category: 'graphic',
    description: PENDING,
    tools: ['[tool]', '[tool]'],
    images: pendingImages('graphic project 02'),
    featured: true,
    isPlaceholder: true,
  },
  {
    id: 'gfx-03',
    archiveNumber: 'GFX / 03',
    title: 'Graphic Project 03',
    subtitle: '[Campaign artwork]',
    category: 'graphic',
    description: PENDING,
    tools: ['[tool]', '[tool]'],
    images: pendingImages('graphic project 03'),
    featured: true,
    isPlaceholder: true,
  },
  {
    id: 'gfx-04',
    archiveNumber: 'GFX / 04',
    title: 'Graphic Project 04',
    subtitle: '[Illustration]',
    category: 'graphic',
    description: PENDING,
    tools: ['[tool]'],
    images: pendingImages('graphic project 04'),
    featured: false,
    isPlaceholder: true,
  },
  {
    id: 'gfx-05',
    archiveNumber: 'GFX / 05',
    title: 'Graphic Project 05',
    subtitle: '[Social artwork]',
    category: 'graphic',
    description: PENDING,
    tools: ['[tool]'],
    images: pendingImages('graphic project 05'),
    featured: false,
    isPlaceholder: true,
  },

  // ---------------- VIDEO ----------------
  {
    id: 'vid-01',
    archiveNumber: 'VID / 01',
    title: 'Video Project 01',
    subtitle: '[Short form edit]',
    category: 'video',
    description: PENDING,
    tools: ['[tool]', '[tool]'],
    images: pendingImages('video project 01'),
    video: {},
    featured: true,
    isPlaceholder: true,
  },
  {
    id: 'vid-02',
    archiveNumber: 'VID / 02',
    title: 'Video Project 02',
    subtitle: '[Promotional edit]',
    category: 'video',
    description: PENDING,
    tools: ['[tool]', '[tool]'],
    images: pendingImages('video project 02'),
    video: {},
    featured: true,
    isPlaceholder: true,
  },
  {
    id: 'vid-03',
    archiveNumber: 'VID / 03',
    title: 'Video Project 03',
    subtitle: '[Narrative edit]',
    category: 'video',
    description: PENDING,
    tools: ['[tool]'],
    images: pendingImages('video project 03'),
    video: {},
    featured: true,
    isPlaceholder: true,
  },
  {
    id: 'vid-04',
    archiveNumber: 'VID / 04',
    title: 'Video Project 04',
    subtitle: '[Motion graphics]',
    category: 'video',
    description: PENDING,
    tools: ['[tool]'],
    images: pendingImages('video project 04'),
    video: {},
    featured: false,
    isPlaceholder: true,
  },
  {
    id: 'vid-05',
    archiveNumber: 'VID / 05',
    title: 'Video Project 05',
    subtitle: '[Title sequence]',
    category: 'video',
    description: PENDING,
    tools: ['[tool]'],
    images: pendingImages('video project 05'),
    video: {},
    featured: false,
    isPlaceholder: true,
  },

  // ---------------- UI/UX ----------------
  {
    id: 'uix-01',
    archiveNumber: 'UIX / 01',
    title: 'UI/UX Project 01',
    subtitle: '[Product interface study]',
    category: 'uiux',
    description: PENDING,
    tools: ['[tool]', '[tool]'],
    images: pendingImages('UI/UX project 01'),
    featured: true,
    isPlaceholder: true,
  },
  {
    id: 'uix-02',
    archiveNumber: 'UIX / 02',
    title: 'UI/UX Project 02',
    subtitle: '[Mobile app study]',
    category: 'uiux',
    description: PENDING,
    tools: ['[tool]', '[tool]'],
    images: pendingImages('UI/UX project 02'),
    featured: true,
    isPlaceholder: true,
  },
  {
    id: 'uix-03',
    archiveNumber: 'UIX / 03',
    title: 'UI/UX Project 03',
    subtitle: '[Design system]',
    category: 'uiux',
    description: PENDING,
    tools: ['[tool]'],
    images: pendingImages('UI/UX project 03'),
    featured: true,
    isPlaceholder: true,
  },
  {
    id: 'uix-04',
    archiveNumber: 'UIX / 04',
    title: 'UI/UX Project 04',
    subtitle: '[Wireframe set]',
    category: 'uiux',
    description: PENDING,
    tools: ['[tool]'],
    images: pendingImages('UI/UX project 04'),
    featured: false,
    isPlaceholder: true,
  },
  {
    id: 'uix-05',
    archiveNumber: 'UIX / 05',
    title: 'UI/UX Project 05',
    subtitle: '[Research summary]',
    category: 'uiux',
    description: PENDING,
    tools: ['[tool]'],
    images: pendingImages('UI/UX project 05'),
    featured: false,
    isPlaceholder: true,
  },
];
