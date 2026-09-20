# ProjectsScene — Scene 06, Project Archive

The archival workstation further along the Hero's desk. See root
ARCHITECTURE.md ("How the room works") before changing any of it.

- `archiveController.ts` — canonical state: boot latch, active record, active
  frame, and the scroll-tour / manual-selection reconciliation.
- `archiveTimeline.ts` — appends the chapter to the Hero's single pinned,
  scrubbed stage timeline. Not a ScrollTrigger of its own.
- `ArchiveScreen.tsx` — everything inside the CRT glass (DOM, not a texture).
- `DiskArchive.tsx` — the physical case: four dividers, one disk per record.

The 3D form of the machine lives with the rest of the room, in
`HeroScene/environment/Workstation3D.tsx`.

Content comes from `src/data/projects.ts` and `src/data/archive.ts`. Adding a
record adds a disk; `featured` decides whether the scrolled tour stops at it.
