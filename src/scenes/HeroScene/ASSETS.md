# Hero material assets

The current asset folder contains SVG placeholders only. The reference image is art direction, not a background or a source of personal/portfolio imagery. Final photographic realism depends on supplied materials and real work.

`src/data/heroAssets.ts` is the asset manifest. Add files at the paths below (relative to `src/assets/`), restart Vite, and rebuild for deployment. `.avif` can replace `.webp` at the same basename; AVIF wins when both exist. Missing entries use existing lightweight fallbacks and do not request nonexistent URLs. No assets are fetched remotely.

| Required final asset  | Recommended path                            | Approximate dimensions | Notes                                                                                   |
| --------------------- | ------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| Cork material         | `textures/cork/cork-texture.webp`           | 512 x 512              | Seamless, neutral photograph/scan; no baked lamp lighting                               |
| Paper fibers          | `textures/paper/paper-fibers.webp`          | 512 x 512              | Subtle neutral paper scan shared across variants                                        |
| Paper wear overlay    | `textures/paper/paper-wear.webp`            | 512 x 512              | Optional alpha stain/crease scan; sparse wear                                           |
| Torn paper alpha mask | `textures/paper/torn-edge-mask.webp`        | 768 x 1024             | Optional scanned contour; opaque interior and transparent outside; protect text margins |
| Worn paper alpha mask | `textures/paper/worn-edge-mask.webp`        | 768 x 1024             | Optional restrained corner damage, distinct from torn contour                           |
| Desk wood material    | `textures/wood/desk-wood.webp`              | 1024 x 256             | Horizontal material crop; lit by the 3D lamp                                            |
| Masking tape cutout   | `props/stationery/masking-tape.webp`        | 320 x 80               | Alpha cutout, nearly flat lighting                                                      |
| Anonymous portrait    | `photos/subject/subject-obscured.webp`      | 800 x 880              | Real supplied portrait with identity obscured; no fake person                           |
| Frontend evidence     | `evidence/frontend/interface-evidence.webp` | 880 x 660              | Real interface/code crop                                                                |
| UI/UX evidence        | `evidence/uiux/wireframe-evidence.webp`     | 880 x 660              | Real wireframe/prototype/interface sketch                                               |
| Graphic evidence      | `evidence/graphic/design-evidence.webp`     | 880 x 660              | Real poster/type/branding crop                                                          |
| Video evidence        | `evidence/video/timeline-evidence.webp`     | 880 x 660              | Real editing timeline/frame/contact sheet                                               |

For subject and evidence images, optionally add `-small.webp`/`-small.avif` at 440 pixels wide and the same aspect ratio. The manifest builds `srcset` automatically. Update the image descriptions in `src/data/investigation.ts` when real evidence replaces placeholders. If source dimensions differ, update the manifest dimensions (used for image attributes and responsive source widths).

Paper supports `clean`, `aged`, `torn`, `note`, `document`, and `photoBacking`. `material` accepts `textureSrc`, `edgeMaskSrc`, and `wearOverlaySrc`. A mask applies to the inner surface; the directional shadow belongs to the outer wrapper. Set `--paper-padding` for document margins. Legacy `aged`/`treatment` props remain supported. Masks should use alpha, not grayscale luminance. Distinct palette, finish, margins, crease and edge treatment remain even without final scans. An extra material can be assigned per document in the manifest without rewriting Paper.

The physical environment uses Three.js/R3F. Board, frame, desk, lamp and one case-file stack are real geometry; there are no GLB models yet. The lamp (`environment/Lamp3D.tsx`) is a provisional enamel shade and should be replaced by a lightweight GLB with its bulb kept at `environment.lamp.bulb`. The earlier pencil cup was removed (it clipped below frame). Until scans are supplied, cork and wood use seeded procedural canvas textures (`environment/textures.ts`); a supplied `cork-texture`/`desk-wood` raster replaces them automatically.

Lighting has one source of truth: `environment.lamp` in `environment/config.ts`. The spotlight uses it, and so does the DOM lighting bridge (`environment/lighting.ts`), which evaluates the same cone, cosine and falloff at each evidence group's board position and writes `--lit`, `--sx` and `--sy`. Each piece's `--elev` (flush paper, lifted note, photo, tape, pin) turns those into a brightness and a shadow cast away from the lamp. Move the lamp and the papers follow.

DOM papers are projected onto the cork through CameraRig's plane homography (board space is a fixed 1000 x 625 px overlay; layout lives in `HeroScene.tsx` as percentages, and pins are derived from the same numbers). DOM always renders above the canvas, so 3D foreground objects must not cross evidence in screen space.

Initialization is gated: nothing is visible until fonts and board images are decoded and, on desktop, the canvas has rendered twice (the first frame compiles shaders). Then one GSAP timeline sets explicit initial states and animates to known values, including the camera dolly. Tablet drops shadows and props and caps DPR at 1. Mobile never mounts WebGL. A 6 s failure timeout switches to the DOM fallback.

**Paper material.** Every `Paper` layers a shared static tile (`textures/paper-grain.svg`: mottling, fibres, fine grain; seamless, rasterised once) under its finish, adds ~1px lamp-facing (upper/right) and shaded (lower/left) edges plus faint edge wear, and a sheen/falloff gradient oriented by `--light-angle`. A supplied `paper-fibers` scan replaces the tile. Inside the projected 3D planes the tile is baked once into a bitmap and shown as an image layer behind the ink (`Grain`), because a repeating background is re-sampled every time the camera changes the plane's scale; flat layouts (mobile, WebGL fallback) keep the CSS tile. Palette tokens in `tokens.css`: document, clean, aged, note, photo, backing, map.

**Elevation.** `--elev-*` tokens (flush tape 0.35, paper 1.1, note 2, photo 3.2, stack 4.2, pin 2.6) feed one filter chain per piece: sheet edge, then contact shadow, then a cast shadow displaced away from the lamp. Upper pieces cast onto the pieces beneath, which is what makes the stacks read.

**Location map.** `evidence/location/philippines-map.svg` (22 KB) comes from Natural Earth 1:10m admin-0 (public domain, via `world-atlas`): Mercator projection, 2-degree graticule, with islands under 9 px² dropped and simplified at 0.8 px. It is generated offline; the generator isn't in the repo, so regenerate with `world-atlas` + `topojson-client`. It is country-level only, mounted as a dark `Paper variant="map"` in the lamp-far left region beneath the discipline evidence, and omitted on mobile. It is an `<img>`, so the existing readiness gate decodes it before the intro.

**Dust.** `environment/Dust3D.tsx` is one `Points` (120 motes, 60 on tablet) with a small shader. Each mote is lit by the same spot cone and decay as the lamp, so motes outside the light vanish. Drift is slow and incommensurate, driven at 30 fps by `invalidate`, paused off-screen and in hidden tabs, and frozen under reduced motion. Because geometry is static, the shadow map is baked once (`shadowMap.autoUpdate = false`), and CameraRig only writes the board registration when it changes. Limitation: DOM always sits above the canvas, so dust in front of the board is hidden behind papers.

**Board → desk journey.** The Hero section is pinned for 2.4 viewport heights on desktop (1.7 on tablet). The scrubbed timeline moves `travel` through: a hold (first 10%), then push-in, crane down past the board's lower edge, and a settle over the dossier (a steeper, tighter shot on portrait screens). The desk plane (`environment.desk.plane`) carries the dossier DOM. Planes that are fully off-screen, or would cross behind the camera, are hidden rather than projected. The dossier is placed so it starts just below the Hero frame. Reduced motion: the same pin, with a fade-to-dark cut at the midpoint instead of camera travel. Mobile and fallback: no pin; the desk panel follows the board in normal flow.

**Subject dossier opening.** The Scene 04 segment follows the desk arrival in that same pinned timeline (2.2 viewport heights on desktop, 1.7 on tablet). `Dossier` uses a DOM `preserve-3d` hinge: its cover rotates from the left spine while the inside face and top page remain crisp HTML. The registered desk plane carries the CSS z column, so the cover retains camera perspective as it lifts. The opening exposes placeholders from `data/profile.ts`; replace only those bracketed values and the portrait asset slot when real information is supplied. On mobile or WebGL fallback, the same content recomposes into an in-flow stacked dossier, played/reversed by its panel ScrollTrigger. Reduced motion uses a reversible fade cut rather than hinge or camera movement.

**Subject dossier (About).** The folder is DOM in true 3D on the desk plane. `--open` drives:

- the cover hinging on the left spine;
- each face's lamp response;
- the lift shadow and page shade.

Back panel, spine crease and cover share one hinge line. One steel paper clip grips the cover's top edge near the spine together with the identification sheet inside. `PaperClip side="front"` (outer loop) is on the outside face and `side="back"` (inner loop) is on the inside face; both draw the same bend above the edge, so it reads as one clip turning with the cover. Nested sheets keep their own shadows but are not re-lit, and each Paper declares its own material.

Education is a text-only administrative record (`profile.education`), with location as text.

Replaceable slots:

- `photos/subject/subject-portrait.{avif,webp}` (identification photo);
- all copy and fields in `src/data/profile.ts`.

Suggested texture budgets: 30-80 KB per tile and 80-180 KB per evidence image. No final raster or model assets have been supplied; the environment geometry is deliberately provisional. Future scenes and Hero-to-Desk movement remain outside this milestone.
