// World units and render budgets. This environment alone owns these values.
type Vec3 = [number, number, number];

export const environment = {
  board: {
    width: 10,
    height: 6.25,
    position: [0, 0.35, 0] as Vec3,
    rotation: [0, -0.02, -0.008] as Vec3,
    faceZ: 0.19,
    pixels: [1000, 625] as const,
  },
  camera: {
    fov: 30,
    // Offset from the framing centre: slightly right and above for mild, natural perspective.
    offset: [0.9, 0.55, 0] as Vec3,
    // Raised with the wider frame so the extra room splits above/below the
    // board and the desk dossier stays out of the Hero shot (intro included).
    target: [0.15, 0.42, 0] as Vec3,
    // World rectangle that must stay in frame on every aspect ratio. Sized to
    // leave ~12% breathing room around the board on desktop (~5% on narrow
    // tablets, which already sit farther back); the journey starts from here.
    frame: { width: 14.15, narrowWidth: 11.6, height: 9.1 },
    // Intro dolly: starts this fraction further away, settles at 0.
    pullback: 0.06,
  },
  // Scroll journey: board -> desk. One continuous crane/dolly move (CameraRig).
  travel: {
    // Portion of the scroll that holds the approved Hero frame before moving.
    hold: 0.1,
    // Push-in toward the board as a fraction of the Hero camera distance.
    push: 0.12,
    // Mid-move key: camera height/depth and where it is looking.
    mid: { position: [1.15, -0.2, 10.6] as Vec3, target: [0.55, -2.45, 0.9] as Vec3 },
    // Pinned scroll length, in viewport heights.
    distance: { desktop: 2.4, tablet: 1.7 },
    // Following pinned length for opening the dossier (About), in viewport heights.
    dossier: { desktop: 2.2, tablet: 1.7 },
  },
  // Desk: the top surface the camera settles over and the plane the dossier DOM lives on.
  desk: {
    top: -3.42,
    // DOM plane lying on the desk (1024 x 640 px); the dossier is composed inside it.
    plane: { center: [1.2, -3.415, 4] as Vec3, width: 6.4, depth: 4, pixels: [1024, 640] as const },
    // Final shot: looking at `focus`, from above and slightly in front (not orthographic).
    focus: [1.25, -3.42, 4.3] as Vec3,
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
  // Scene 06 workstation: further along the same desk, to the right of the
  // dossier. Only the physical form is 3D; the screen and the disk labels are
  // DOM registered onto the two planes below (see Workstation3D).
  workstation: {
    // Sits on the run of desk to the right of the dossier. The desk slab spans
    // x -9..9; the machine (-1.45 local) and the case (+3.5 local) both stay
    // inside it at this position and yaw.
    position: [5.3, 0, 3.4] as Vec3,
    yaw: -0.3,
    screen: {
      // 4:3 tube. `pixels` is the DOM screen's own coordinate space; `size` is
      // the glass in world units, so the two must keep the same ratio.
      pixels: [640, 480] as const,
      size: [2.06, 1.545] as const,
      tilt: -0.045,
      color: '#8fe3a0',
      distance: 7,
      light: 5,
    },
    disks: {
      offset: [2.55, 0, 0.05] as Vec3,
      yaw: -0.2,
      tilt: -0.1,
      pixels: [420, 560] as const,
      size: [1.42, 1.893] as const,
    },
    // Where the camera settles for the archive chapter. Framed to hold the
    // monitor and the case together, at close to desk-eye level.
    camera: {
      focus: [6.3, -2.0, 3.8] as Vec3,
      pitch: 13,
      yaw: 9,
      frame: { width: 6.4, height: 4 },
      narrow: { pitch: 20, frame: { width: 4.4, height: 5.2 } },
    },
  },
  // Single light story. The DOM lighting bridge (lighting.ts) reads these same values.
  lamp: {
    // Desk lamp forward of the board's upper-right corner; its lower half enters frame.
    bulb: [5.6, 2.6, 3.6] as Vec3,
    target: [-0.8, -0.9, 0.2] as Vec3,
    color: '#ffd6a8',
    intensity: 38,
    angle: 1.0,
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
  colors: {
    room: '#080807',
    wall: '#1b1914',
    frame: '#2c2118',
    wood: '#2a1f15',
    metal: '#1a1a18',
    inside: '#e7d7b8',
    fill: '#8d9aa6',
    folder: '#6d5a3f',
    computer: '#c4b79c',
    computerShade: '#9d927b',
    paper: '#b9ad92',
  },
  dpr: 1.5,
};
