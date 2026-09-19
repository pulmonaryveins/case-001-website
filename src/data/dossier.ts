/**
 * Printed furniture of the opened case file: file codes, section titles and
 * the labels on its index tabs. Page *content* comes from `profile.ts` and
 * `experience.ts`; this is only what is typed on the stationery.
 */
export const dossier = {
  tabs: [
    { id: 'about', label: 'About' },
    { id: 'education', label: 'Education' },
    { id: 'experience', label: 'Experience' },
  ],
  education: {
    file: 'FILE 0926-B / EDUCATION',
    title: 'Education record',
    fields: {
      institution: 'Institution',
      program: 'Program',
      period: 'Period',
      location: 'Location',
    },
    note: '[Placeholder: supporting detail on the programme, focus or coursework.]',
  },
  experience: {
    file: 'FILE 0926-C / EXPERIENCE',
    title: 'Experience',
    focus: 'Key focus areas',
    imagePending: 'Image to be supplied',
  },
  nav: {
    sections: 'Dossier sections',
    pages: 'Dossier pages',
    previous: 'Previous page',
    next: 'Next page',
  },
};
