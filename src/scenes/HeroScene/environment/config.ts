// World units and render budgets. This environment alone owns these values.
type Vec3 = [number, number, number];

export const environment = {
  board: {
    width: 10,
    height: 6.25,
    // Mounted on the wall behind the desk, with 7 units of air between its face
    // and the desk's back edge. DEPTH, not height, is what keeps its evidence
    // clear of the workstation — registered DOM planes have no depth buffer, so
    // anything overlapping the machine paints over it, and the left notes sit
    // directly above the rack in world x. Pushing the board back moves them
    // toward the vanishing point and away from the near rack; lowering it does
    // nothing for that (measured: clearance is -0.106 NDC at z -3.5, +0.032 at
    // z -7.5, unchanged by Y). Brought forward from -7.5 for readability, which
    // a tighter `camera.frame.height` pays for: the separation is now +0.129 NDC
    // at 16:9, three times what the farther board held. The wall and the whole
    // back-of-room set follow the board automatically (Room.tsx).
    position: [0, 1.2, -6.8] as Vec3,
    rotation: [0, -0.02, -0.008] as Vec3,
    faceZ: 0.19,
    pixels: [1000, 625] as const,
  },
  camera: {
    fov: 30,
    // Offset from the framing centre: slightly right and above for mild, natural perspective.
    offset: [0.9, 0.55, 0] as Vec3,
    // Aimed between the desk and the board so all three anchors read: the
    // workstation at the left, the board centre-back (dominant, 58-65% of frame
    // width on desktop), the dossier at the right.
    target: [0.15, 0.3, -4.2] as Vec3,
    // World rectangle that must stay in frame on every aspect ratio. `height`
    // is what sets the distance on wide screens, so it is the lever for board
    // size: 8.4 puts the board at 58% of frame width at 16:9 and 65% at 16:10
    // without moving it forward into the rack.
    frame: { width: 12.8, narrowWidth: 8, height: 8.4 },
    // Portrait cannot hold the board AND the workstation without the board's
    // left notes painting over the rack (measured: no viable configuration at
    // any lift or width). It therefore swings right and drops the machine out
    // of frame entirely — the Projects camera travels to it regardless — which
    // leaves all eight evidence items on screen and clear.
    narrow: { offset: [1.6, 0.55] as [number, number], target: [1.4, 0.4, -3.8] as Vec3 },
    // Intro dolly: starts this fraction further away, settles at 0.
    pullback: 0.06,
  },
  // Scroll journey: board -> desk. One continuous crane/dolly move (CameraRig).
  travel: {
    // Portion of the scroll that holds the approved Hero frame before moving.
    hold: 0.1,
    // Push-in toward the board as a fraction of the Hero camera distance. The
    // closer Hero frame shortens that distance, so the push must shrink with it
    // or key 1 lands behind the mid key and the crane briefly runs backwards.
    push: 0.05,
    // Mid-move key: the crane's dip. Only x and y are authored — its DEPTH is
    // derived (`along`), because a fixed z has to fit between key 1 and the
    // desk arrival at every aspect at once, and that window is barely one world
    // unit wide once the Hero frame is this close. An absolute value that fits
    // 16:9 lands on top of the arrival key at 5:4 and the spline reverses.
    // Portrait needs its own x: its Hero pose has swung right (camera.narrow),
    // so one shared x would swerve left and back again mid-move.
    mid: {
      position: [1.1, -0.2] as [number, number],
      narrow: { position: [3.2, -0.2] as [number, number] },
      along: 0.55,
      target: [1.6, -2.45, 1.4] as Vec3,
    },
    // Pinned scroll length, in viewport heights.
    distance: { desktop: 2.4, tablet: 1.7 },
    // Following pinned length for opening the dossier (About), in viewport heights.
    dossier: { desktop: 2.2, tablet: 1.7 },
  },
  // Desk: the top surface the camera settles over and the plane the dossier DOM lives on.
  desk: {
    top: -3.42,
    // DOM plane lying on the desk (1024 x 640 px); the dossier is composed inside it.
    plane: {
      // RIGHT work area. This is the authoritative dossier position: the
      // interactive folder is DOM composed inside this plane (DeskEvidence ->
      // Dossier), so moving the plane moves the real folder, its hit targets,
      // its lighting and its shadow together. `focus` below must track it.
      center: [3.4, -3.415, 4] as Vec3,
      width: 6.4,
      depth: 4,
      pixels: [1024, 640] as const,
    },
    // Final shot: looking at `focus`, from above and slightly in front (not orthographic).
    focus: [3.45, -3.42, 4.3] as Vec3,
    pitch: 50,
    yaw: 5,
    frame: { width: 5.6, height: 3.7 },
    // Portrait screens: tighter and more top-down so the desk, not the floor, fills frame.
    narrow: { pitch: 62, frame: { width: 3.4, height: 4.6 } },
    // Opened dossier: the detective leans in. Aim shifts left onto the open
    // spread (the cover lands left of the spine) with a slightly steeper, closer view.
    inspect: {
      shift: [-1.05, 0, 0.14] as Vec3,
      pitch: 58,
      frame: { width: 5.3, height: 3.95 },
      narrow: { pitch: 66, frame: { width: 4.55, height: 5 } },
    },
  },
  // Scene 06 is the LEFT work area of one desk: workstation left, evidence
  // board centre-back, dossier right, with ~4.5 world units of bare wood
  // between the rack and the folder. Registered DOM planes have no depth
  // buffer, so anything overlapping the machine on screen paints over it —
  // which is why the board is both farther back and higher, and why these
  // numbers are verified against the projection maths (21:9 through 5:4 plus
  // portrait) rather than eyeballed. Re-check that separation if any of the
  // board, dossier, workstation or camera values move.
  workstation: {
    position: [-7.4, 0, 2.4] as Vec3,
    // Turned toward the reader, who now sits to the machine's right.
    yaw: 0.1,
    screen: {
      // 4:3 tube. `pixels` is the DOM screen's own coordinate space; `size` is
      // the glass in world units, so the two must keep the same ratio.
      pixels: [640, 480] as const,
      size: [2.85, 2.1375] as const,
      color: '#8fe3a0',
      distance: 3,
      light: 0.65,
    },
    disks: {
      offset: [3.95, 0, 0.15] as Vec3,
      // A touch more inward than the monitor so the rack still shows its depth.
      yaw: 0.18,
    },
    // Settles with the monitor at ~46% of the frame and the rack at ~40%, and
    // with the board in shot behind them at every aspect — the archive is
    // still the same room, not a separate black computer scene.
    camera: {
      focus: [-5.6, -1.1, 3.5] as Vec3,
      pitch: 26,
      yaw: 12,
      frame: { width: 9, height: 2.6 },
      // Portrait stacks the rack in front of the monitor (Workstation3D), so it
      // needs a wider frame than the tube alone or the case clips at the sides.
      narrow: { focus: [-7.4, -1.6, 4] as Vec3, pitch: 26, frame: { width: 5.4, height: 7.4 } },
    },
  },
  // Single light story. The DOM lighting bridge (lighting.ts) reads these same values.
  lamp: {
    // Desk lamp forward of the board's upper-right corner; its lower half enters frame.
    bulb: [5.6, 2.6, 3.6] as Vec3,
    // Aimed between the desk and the board, and re-solved whenever the board
    // moves — it is a world point, so it goes stale silently. Keeps the board's
    // gradient running the right way (upper-right brightest, +0.066 over the
    // lower left) with its darkest corner at 0.81, while the dossier holds its
    // approved exposure (0.718 against a 0.714 baseline).
    target: [0, -0.2, -5] as Vec3,
    color: '#ffd6a8',
    intensity: 38,
    // Wide, as a shaded desk lamp is: one cone has to cover both the board on
    // the wall and the desk below it. At the old 1.0 the re-aimed cone reached
    // the board but dropped the dossier outside it entirely.
    angle: 1.4,
    penumbra: 1,
    // Softer than physical so the far-left evidence stays legible.
    decay: 1.25,
    ambient: 0.12,
    // How DOM evidence answers this lamp (lighting.ts): brightness range,
    // tungsten tint near the light, and cast-shadow length per unit elevation.
    response: { litFloor: 0.44, litRange: 0.5, warmth: 0.16, shadowReach: 0.34 },
    fill: 0.3,
  },
  // Suspended dust (Dust3D): lit by the lamp cone only. Sizes are world units.
  dust: {
    count: 120,
    countTablet: 60,
    volume: { min: [-5.5, -3.2, 0.5] as Vec3, max: [7, 4, 9] as Vec3 },
    size: [0.024, 0.085] as [number, number],
    // Distance from the bulb at which a mote reaches full brightness.
    reach: 4.5,
    opacity: 1.3,
    fps: 30,
  },
  // The room set (Room.tsx) is built from these: a floor, a ceiling, three
  // walls and a few pieces of dark office furniture, so the frame never opens
  // onto the clear colour. Everything back there is deliberately close in tone
  // to `wall` — it reads as shape and silhouette, not as detail.
  colors: {
    room: '#080807',
    wall: '#1b1914',
    // A shade darker than the wall, below the dado rail.
    wainscot: '#141209',
    rail: '#2a2318',
    floor: '#171208',
    ceiling: '#100e0a',
    // Filing cabinets and shelf uprights: office steel, not machined metal.
    steel: '#24241f',
    // Box files and spines on the back shelving.
    ledger: '#3b3025',
    plant: '#1d2a1c',
    pot: '#2b2017',
    frame: '#2c2118',
    wood: '#2a1f15',
    metal: '#1a1a18',
    inside: '#e7d7b8',
    fill: '#8d9aa6',
    folder: '#6d5a3f',
    computer: '#d4cbb8',
    computerShade: '#9d927b',
    paper: '#b9ad92',
  },
  dpr: 1.5,
};
