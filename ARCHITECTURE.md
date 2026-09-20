# CASE 0926 — Architecture

This is the single source of truth for CASE 0926 — both **what** we're
building (creative direction) and **how** it's implemented (technical
architecture). Read this before writing any scene. It records decisions
already made so they don't get re-litigated or drift per scene.

---

# Creative Direction

## Core Concept

CASE 0926 is a cinematic, scroll-driven detective portfolio.

The visitor is investigating an initially UNKNOWN SUBJECT. As they scroll,
evidence gradually reveals that the subject is a multidisciplinary creative
working across:

- Frontend Development
- UI/UX Design
- Graphic Design
- Video Editing

Narrative progression:

MYSTERY → EVIDENCE → IDENTITY → EXPERIENCE → WORK → CREDENTIALS → CONTACT →
CASE SOLVED

The site should feel like: **"A cinematic investigation that happens to be
a portfolio."** Not: "A normal portfolio with detective styling." The
investigation itself is the storytelling and navigation system.

## Visual Direction

The visual language should feel: serious, mysterious, cinematic,
investigative, noir-inspired, professional, tactile, physical, carefully
composed.

Avoid: horror/Halloween aesthetics, cartoon detective styling,
cyberpunk/neon, excessive sepia, excessive red, steampunk, glassmorphism,
generic SaaS UI, generic card layouts, unnecessary clutter, generic AI
detective aesthetics.

The environment can be detailed while the actual interface remains minimal.

## References

**Primary visual reference:**
[Hamada's Case (Portfolio 2025)](<https://www.behance.net/gallery/229543797/Hamadas-Case-(Portfolio-2025)>)
— inspiration for evidence-board composition, paper/folder treatment,
photographs, red evidence string, push pins, physical layering, handwritten
annotations, investigative storytelling, lighting and shadows. **Do not
directly copy the reference** — CASE 0926 must remain an original
composition.

**Secondary spatial/interaction references:**
[3d.killianherzer.com](https://3d.killianherzer.com/),
[killianherzer.com](https://killianherzer.com/) — inspiration for spatial
storytelling, object interaction, cinematic transitions, physical-media
interaction. These references do NOT mean the site should use real-time
3D everywhere. The project remains DOM/SVG-first for content; the Hero's
physical environment is now explicitly approved for real 3D.

## Physical World System

Portfolio information should appear as physical evidence whenever
practical.

| Content        | Physical form                              |
| -------------- | ------------------------------------------ |
| About          | Subject dossier                            |
| Skills         | Evidence notes / annotations               |
| Education      | Document / record                          |
| Experience     | Evidence timeline                          |
| Projects       | Archive disks read on a CRT workstation    |
| Project images | Photographs / Polaroids / printed evidence |
| Video projects | Archive disks (Video divider)              |
| Video player   | The archive CRT                            |
| Certificates   | Physical documents                         |
| Awards         | Medals / badges                            |
| Contact        | Business card / final case folder          |
| Progress       | Red evidence string / case progress        |
| Navigation     | Subtle case index / investigation HUD      |

Avoid generic digital cards when a physical metaphor makes sense.

## Color / Materials

**Primary environment:** near-black, charcoal, dark neutral brown, muted
gray.
**Paper:** aged cream, off-white.
**Accent — evidence red:** communicates evidence connections, string, push
pins, annotations, stamps, active state, investigation progress. Do not
make the entire interface red.

**Materials:** cork, paper, photographs, folders, masking tape, clips,
string, cardboard, worn desk surfaces. Textures should remain restrained
enough to preserve readability.

## Lighting

Lighting is a major part of the art direction.

**Primary light:** warm tungsten / detective desk lamp.
**Optional secondary light:** subtle cool ambient/moonlight. CRT scenes may
introduce localized cool screen illumination.

Objects within a scene must respect a consistent lighting direction. Use
directional shadows, contact shadows, light falloff, restrained highlights,
overlap, occlusion. Avoid random glows, excessive backdrop blur, constantly
animated shadows, lighting without a believable source. Lighting should
create physical depth.

## Composition / 2.5D Depth

Treat each scene like an After Effects composition. Conceptual hierarchy
(not every scene needs every layer — every layer must have a compositional
purpose):

camera → foreground props → atmosphere → pins/string → photographs →
documents/notes → board/desk objects → environment → background lighting

Create depth through scale, overlap, perspective, shadows, parallax,
lighting, occlusion.

Use 2.5D techniques first: HTML, CSS, SVG, optimized image assets, CSS
perspective, GSAP transforms for content. Three.js/R3F/Drei are approved
specifically for cinematic physical environment rendering in the Hero.
WebGL is not the default for future scenes: use it only when physical 3D
materially improves the experience and that scene's scope calls for it.

## Interaction Philosophy

**Primary interaction:** scroll = investigate.
**Secondary interaction:** click/tap = inspect.
**Hover:** may provide restrained physical feedback only.

Do not require WASD, free camera, mandatory puzzles, hidden required
content, or complicated game controls.

Scrolling may behave like a cinematic camera using: push, pull, pan, slight
tilt, horizontal traversal, diagonal traversal, depth/parallax, focus
illusions. Vertical scroll may drive horizontal/spatial movement.
Transitions should feel like moving through one continuous investigation,
not unrelated webpage sections fading in and out.

Motion should feel deliberate, weighted, restrained, cinematic. Avoid
bouncy SaaS animation, elastic motion, constant floating, excessive cursor
effects, animation for animation's sake. **Stillness is intentional.**

## Red Evidence String

The recurring storytelling device — semantic, not merely decorative.

At the beginning, the unknown subject is connected to Frontend Development,
UI/UX Design, Graphic Design, and Video Editing. As the investigation
progresses, the string may connect identity, experience, projects, creative
disciplines, credentials, progress. By the conclusion, the evidence network
should visually communicate that all of these disciplines belong to the
same person.

## Scene Sequence

**01 — Intro.** Dark opening followed by a short cinematic reveal into CASE 0926.

**02 — Hero / Investigation Board.** Unknown subject at the center of a
cork/evidence board. Four primary evidence branches: Frontend Developer,
UI/UX Designer, Graphic Designer, Video Editor. Use red strings, push pins,
photographs, papers, and investigative annotations. Potential labels: `CASE
0926` / `SUBJECT: UNKNOWN` / `STATUS: UNDER INVESTIGATION`. Purpose is
curiosity, not immediate identity disclosure.

**03 — Board → Desk transition.** Scrolling pushes toward the board and
follows the investigation into the detective workspace. Use restrained
parallax/depth — should feel like continuous camera movement rather than a
section fade.

**04 — Subject Dossier / About.** A physical case folder beneath a tungsten
lamp opens through scroll progress, revealing photograph, name, location,
description, disciplines, skills, education. This is where the unknown
subject becomes identified.

**05 — Experience.** The dossier stays open and the reader goes deeper into
it. Work history is read as further right-hand pages of the same case file,
one record per page, each with its own attached photographic evidence. The
left page remains the subject profile throughout, so the whole section reads
as one continuous physical file rather than a new scene. (This supersedes an
earlier plan for a separate evidence timeline laid across the desk: the file
metaphor already carries the narrative, and closing and re-staging the
dossier broke the continuity the desk arrival establishes.)

**06 — Project Archive.** The camera continues along the same desk to an
archival workstation: a late-80s CRT and, beside it, a rugged disk case whose
disks are split behind four typed dividers — Development, Graphic, Video,
UI/UX. The machine powers on once, and the CRT becomes the project viewer.

Two navigation models coexist deliberately: **scrolling is a curated tour**
through the featured records only (at most three per category, so the section
cannot grow without bound), while **the disks are the full archive** — every
record has one, and picking one is a manual choice the tour must not override.

This supersedes the earlier plan for unopened case folders (06), a separate
opened-folder case file (07) and a separate VHS/CRT video scene (08). Video
records are now a category of the archive rather than their own chapter: the
CRT is already the right player, and a second physical-media scene repeated
the same idea. `components/media/VHS` and `data/videos.ts` are consequently
unused; leave them until a scene actually needs them.

**07 — Awards / Certificates.** Certificates, medals, badges, credentials
appear as physical evidence. Important documents must remain
readable/inspectable.

**08 — Contact.** Final folder containing contact information and a
business card. An old telephone or related desk prop may support the
composition. Possible CTA: `START A NEW CASE` / `START A CONVERSATION`.

**09 — Case Solved.** The final folder closes. Potential copy: `CASE 0926`
/ `INVESTIGATION COMPLETE` / "Thank you for investigating." / "The next
case could be yours." / `GET IN TOUCH`. The environment eventually fades
into darkness.

## Hero Design Foundation

The first implementation milestone is Scene 01 (Intro) + Scene 02 (Hero /
Investigation Board). The Hero establishes the visual system used by later
scenes.

It should contain: unknown central subject, cork/evidence board, four
occupational evidence branches, red evidence strings, push pins, layered
papers, photographs, handwritten annotations, `CASE 0926` identification,
serious cinematic atmosphere, tungsten lighting, physically consistent
shadows, restrained texture/grain, minimal UI, subtle "Scroll to
Investigate" indicator.

After the intro animation finishes, the Hero should become mostly still.
Do not compensate for weak composition with additional animation.

## Responsive Philosophy

**Desktop:** full cinematic composition.
**Tablet:** reduce peripheral props, parallax, decorative layers, shadow
complexity.
**Mobile:** recompose rather than simply shrinking the desktop canvas.
Preserve narrative, primary evidence, readability, interactions. Remove
decorative evidence before meaningful evidence.

## Creative Priority

When making design decisions, prioritize in this order: composition,
lighting, typography, physical layering, storytelling, motion, interaction,
decorative effects.

Performance remains a first-class design requirement — the cinematic
presentation must never make the experience feel sluggish (see Performance
rules, below).

## Codex Working Rule

Before implementing any scene:

1. Read this entire ARCHITECTURE.md.
2. Inspect the current repository implementation.
3. Inspect existing primitives, tokens, utilities, and scene patterns.
4. Follow the current scene-specific prompt.
5. Implement only the requested scene and minimum supporting changes.
6. Do not proactively implement future scenes.
7. Reuse established visual/animation patterns instead of rebuilding them.
8. Preserve the architecture unless the current task genuinely requires an
   extension.
9. Run typecheck, lint, and production build after implementation.
10. Fix errors introduced by the implementation before finishing.

Scene-specific prompts override creative details for that scene, but
should not silently override core architecture/performance constraints.

---

# Technical Architecture

## Stack

React 19 + TypeScript + Vite. GSAP + ScrollTrigger for animation. Lenis for
smooth scroll. Zustand for the one small shared store. Lucide React for
conventional icons only. No router (single-page vertical scroll). No
Three.js + React Three Fiber + Drei for the Hero physical environment,
camera and lighting. HTML/CSS owns readable content and conventional UI;
SVG owns evidence strings. No Framer Motion or competing animation system.

Package manager: npm (package-lock.json is the lockfile of record — don't
introduce yarn/pnpm lockfiles alongside it).

## Folder structure

```
src/
  app/            App shell + providers (ScrollProvider owns Lenis+ScrollTrigger lifecycle)
  components/
    evidence/     Physical evidence primitives (Paper, Folder, Polaroid, PushPin,
                   EvidenceString, Stamp, CaseLabel)
    media/        VHS, CRTScreen
    navigation/   CaseProgress
    ui/           Modal, Button (undecorated, content-first)
  scenes/         One folder per scene (Hero, About, Experience, Projects,
                   Video, Certificates, Contact). Currently reserved —
                   README.md in each folder, no implementation yet.
  data/           Typed content (profile, experience, projects, videos,
                   certificates, socials) — placeholder arrays/objects now,
                   populate as real content becomes available.
  hooks/          useReducedMotion, useMediaQuery, useGSAPContext
  lib/            gsap.ts, lenis.ts, performance.ts — singletons, don't duplicate
  store/          investigationStore.ts (zustand)
  types/          portfolio.ts — the schema data/ conforms to
  styles/         tokens.css, reset.css, globals.css, utilities.css
  assets/         textures, evidence, photos, projects, video, props
```

## CSS approach

**CSS Modules.** Every component gets a co-located `Component.module.css`.
Global tokens live in `src/styles/tokens.css` and are consumed via `var(--*)`
— never hardcode a color, spacing, shadow, z-index, duration, or easing
value in a component file. If a token you need doesn't exist yet, add it to
`tokens.css`, don't inline it.

Three.js world dimensions, PBR material colors and render budgets live in
`HeroScene/environment/config.ts`; these are environment settings rather
than CSS declarations. CSS overlay dimensions match its board pixel plane.

## Hero hybrid environment

Layering: section background → lazy WebGL environment → registered DOM
evidence board → HUD. The decorative canvas ignores pointer events and is
hidden from accessibility APIs. Evidence remains in the original DOM tree,
including headings, photograph, discipline papers, notes, SVG strings and
pins. Important text never becomes a WebGL texture.

`HeroEnvironmentCanvas` composes `CameraRig`, `LightingRig`, `Room`,
`InvestigationBoard3D`, `Desk3D`, `Lamp3D` and `ForegroundProps3D`.
The board body/frame, desk, lamp, folders, cup and pencils are simple PBR
geometry placeholders; no third-party models are downloaded. Existing local
wood/cork raster slots can supply final materials later.

CameraRig projects the board's 1000 × 625 pixel plane using its world matrix
and the perspective camera's view/projection matrices into a CSS matrix3d.
The same projection updates during camera entrance and viewport resize.
The matrix is written straight to `style.transform`: routing it through an
inherited custom property restyled every piece of evidence in the plane on
each camera frame. Because the projection changes the plane's scale, the
compositor re-rasters it while the camera moves, so nothing inside a plane may
use a repeating background image — a tiled background is re-sampled on every
re-raster and dominated scroll frame time. Paper grain inside the planes is a
baked bitmap shown as an `<img>` (`components/evidence/Grain`), and the desk
evidence draws its depth with box-shadows instead of a drop-shadow chain.
GSAP animates the camera inside the shared context lifecycle; resizing
reframes without replaying the entrance. No user camera controls.

One warm, inverse-square spotlight sits just outside the lamp opening and
aims along the shade axis toward the board. A dim cool hemisphere provides
fill. Environmental geometry casts/receives real shadows; DOM papers retain
CSS contact shadows and a matching static light falloff. DOM evidence does
not participate in WebGL shadow maps or depth occlusion.

Rendering is demand-only, invalidated by entrance, resize and scene changes.
Desktop DPR is capped at 1.5 with one 1024px shadow map. Tablet caps DPR at 1,
omits foreground props and disables shadows. Mobile does not mount/import
the canvas and uses the recomposed DOM board. Lazy-load/render/context-loss
failures retain the DOM board. Reduced motion skips the camera entrance.
Textures, geometry and materials follow R3F disposal on unmount.

## Component pattern

Every primitive follows: `ComponentName/ComponentName.tsx` +
`ComponentName.module.css` + `index.ts` barrel. Folder-level `index.ts`
re-exports everything (see `components/evidence/index.ts`). Import from the
folder, not the file: `import { Paper } from '../components/evidence'`.

## Animation pattern

Scene ref → `useGSAPContext(scope, callback)` → local timeline/ScrollTrigger
built inside the callback → auto-reverted on unmount. See
`src/hooks/useGSAPContext.ts` and the example in `src/app/App.tsx`. Do not:

- create a `gsap.timeline()` or `ScrollTrigger.create()` outside this pattern
- instantiate a second Lenis instance (one instance, created in
  `ScrollProvider`, already synced to GSAP's ticker)
- add a raw `scroll` event listener — use ScrollTrigger

## Reduced motion

`useReducedMotion()` is live (responds to OS setting changes, not just
initial load). When it's `true`, scenes must skip cinematic
camera/parallax timelines and fall back to simple opacity fades — content
must still be fully reachable and readable.

## State

`useInvestigationStore` (zustand) holds only: `currentScene`,
`investigationProgress`, `openedProjectId`, `selectedVideoId`,
`discoveredEvidence`. Don't add speculative fields — extend only when a
scene actually needs new shared state, and keep it flat.

## Data

Content lives in `src/data/*.ts`, typed against `src/types/portfolio.ts`.
Scenes read from here — never hardcode copy/case numbers/links directly in
a scene component. Files currently contain empty arrays / placeholder
objects marked `// TODO` — fill in real content as it's built out, without
changing the shape unless the type itself needs to change (update
`types/portfolio.ts` first if so).

## Performance rules

- Animate `transform`/`opacity` only. Never animate `filter`, `blur`,
  `box-shadow`, `width`/`height`, `top`/`left` on a running timeline.
- Videos: `preload="none"` until a tape/video is actively selected, then
  `metadata`. Never autoplay, never preload every tape. See
  `lib/performance.ts` and `components/media/CRTScreen`.
- Use `createLazyObserver()` from `lib/performance.ts` for below-the-fold
  reveals instead of a new `IntersectionObserver` per component.
- Images: prefer AVIF/WebP with responsive `srcset`, `loading="lazy"` by
  default (see `Polaroid`).

## Where Codex starts

Scaffolding is complete and verified.

Before implementing a scene, Codex must read this entire ARCHITECTURE.md,
inspect the current implementation, and then follow the scene-specific
prompt.

Completed milestones:

SCENE 01 — INTRO
SCENE 02 — HERO / INVESTIGATION BOARD
SCENE 03 — BOARD → DESK TRANSITION (ends on the closed dossier)
SCENE 04 — SUBJECT DOSSIER / ABOUT (opens the dossier)
SCENE 05 — EXPERIENCE (read as further pages of the open dossier)
SCENE 06 — PROJECT ARCHIVE (the workstation further along the same desk)

Next milestone: SCENE 07 — AWARDS / CERTIFICATES.

How the room works (read before extending it):

- One pinned, scrubbed GSAP timeline in `HeroScene` drives
  `cameraState.travel` (0 = board, 1 = desk). `environment/cameraPath.ts`
  turns it into a single crane/dolly move; `CameraRig` samples it each frame.
- Readable content stays DOM. Each DOM layer that belongs to the room is a
  `RegisteredPlane` (board, desk) projected by the same camera, so it can't
  drift from the 3D scene in either scroll direction. Add new surfaces as
  planes rather than animating DOM separately.
- The closed dossier is the `Dossier` primitive on the desk plane
  (`DeskEvidence`). Open it there; its type scales with its own width, so it
  renders the same on the desk plane and the mobile panel.
- The open file has two halves with different lifetimes. The left page is the
  identification sheet clipped to the cover (`Dossier`'s `inside` slot), so it
  cannot change while pages turn. The right half is the `pageWell`: a plain,
  unfiltered, `preserve-3d` box that holds a stack of sheets, which is why a
  turning page is foreshortened by the same camera as the cover.
- The page stack is owned by one `DossierPageController`
  (`AboutScene/pageController.ts`). Its `motion.value` is a continuous page
  position appended to the same pinned stage timeline
  (`addDossierPages`), so scrolling, the index tabs and the arrows all resolve
  to one state and reverse scrolling replays turns exactly. Tabs navigate by
  scrolling to the position that already represents that page — never by
  setting state behind the scrub's back. Per-frame page poses are written
  straight to the DOM by a painter; React re-renders only when the integer
  page changes. Page order and count come from the data (About, Education,
  then one page per `experience` record).
- The archive workstation (Scene 06) continues the same pinned timeline and the
  same camera. `cameraState.archive` (0 = wherever the dossier left the camera,
  1 = settled on the workstation) blends toward one more key pose in
  `cameraPath`, so crossing the desk is travel, not a cut. `Workstation3D` owns
  only the physical form — CRT, base, keyboard, disk case — plus a cool point
  light whose intensity follows the controller's `glow`, which is what keeps the
  screen's light in step with the boot and each disk read.
- The CRT screen and the disk case's face are two more `RegisteredPlane`s. All
  archive text, every disk label, the links and the video player stay DOM on
  those planes: readable, focusable, and never a WebGL texture. The planes carry
  `pointer-events: none`; only the archive's own controls re-enable it, and the
  screen's only after it has booted.
- `ProjectsScene/archiveController.ts` owns the chapter's state the way
  `DossierPageController` owns the dossier's. Boot is latched so reverse
  scrolling never replays the power-on. Scroll and manual selection write the
  same `active` record but cannot fight: a manual pick holds the screen until
  the scrubbed tour reaches a _different_ featured slot, at which point the
  reader has demonstrably moved on. Boot and disk-load own separate GSAP
  timelines — sharing one let a fast scroll kill the boot mid-sequence.
- Scene 06 content is generated entirely from `data/projects.ts`: adding a
  record adds a disk, and `featured` decides whether the scrolled tour stops at
  it. Nothing is indexed against a fixed project count.
- DOM lighting on any plane comes from `environment/lighting.ts`
  (`evidenceLight(u, v, surface)`), driven by the same lamp config as three.js.

Build and review one milestone at a time. Do not scaffold or implement
future scene content ahead of need.
