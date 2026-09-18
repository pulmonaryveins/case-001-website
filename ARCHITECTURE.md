# CASE 0926 — Architecture

This is the handoff doc between the scaffolding pass (Claude) and per-scene
implementation (Codex). Read this before writing any scene. It records
decisions already made so they don't get re-litigated or drift per scene.

## Stack

React 19 + TypeScript + Vite. GSAP + ScrollTrigger for animation. Lenis for
smooth scroll. Zustand for the one small shared store. Lucide React for
conventional icons only. No router (single-page vertical scroll). No
Three.js / R3F / Framer Motion — not part of this architecture.

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

Scaffolding is complete and verified (typecheck, lint, build all pass).
Next: implement `src/scenes/HeroScene/` per MASTER PROJECT BRIEF section 9
("Hero / Investigation Board"), using the evidence primitives already
built. Once Hero is done, `src/app/App.tsx`'s dev shell gets replaced by
the real scene stack — don't do that until at least Hero + the
Hero→Desk transition exist, so there's no broken in-between state.

Build one scene at a time (see brief section 25). Don't scaffold future
scenes' content ahead of need — the reserved folders/README stubs are
enough until a scene's turn comes.
