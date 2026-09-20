import { CatmullRomCurve3, Vector3 } from 'three';
import { environment as settings } from './config';

/** Written by GSAP (intro + scroll timelines); read by CameraRig each frame. */
export interface CameraState {
  /** Intro dolly: 0 = pulled back, 1 = settled on the Hero frame. */
  push: number;
  /** Scroll journey: 0 = Hero board, 1 = settled over the dossier. */
  travel: number;
  /** Dossier opening: 0 = desk arrival frame, 1 = leaning in over the open file. */
  inspect: number;
  /** Project archive: 0 = over the dossier, 1 = settled on the workstation. */
  archive: number;
}

const { camera: shot, travel, desk, workstation: station } = settings;
const tangent = Math.tan((shot.fov * Math.PI) / 360);
const scratch = new Vector3();

function fitDistance(width: number, height: number, aspect: number) {
  return Math.max(height / (2 * tangent), width / (2 * tangent * aspect));
}

/** Place `out` on a sphere around `target`: pitch above the desk, yaw around it. */
function orbit(out: Vector3, target: Vector3, pitch: number, yaw: number, distance: number) {
  out
    .set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch))
    .multiplyScalar(distance)
    .add(target);
}

const radians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * One continuous move: Hero pose -> slight push-in -> crane down past the
 * board's lower edge -> settle over the dossier. Position and look-at each
 * follow their own centripetal Catmull-Rom spline so the pitch eases in with
 * the descent instead of snapping. A separate `inspect` blend then leans in
 * over the opened dossier. Points are updated in place (no per-frame
 * allocation); the Hero pose is exactly the pre-existing framing maths.
 */
export class CameraPath {
  private readonly positions = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
  private readonly targets = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
  private readonly positionCurve = new CatmullRomCurve3(this.positions, false, 'centripetal');
  private readonly targetCurve = new CatmullRomCurve3(this.targets, false, 'centripetal');
  private readonly inspectPosition = new Vector3();
  private readonly inspectTarget = new Vector3();
  private readonly archivePosition = new Vector3();
  private readonly archiveTarget = new Vector3();

  update(aspect: number, push: number) {
    const [p0, p1, p2, p3] = this.positions;
    const [t0, t1, t2, t3] = this.targets;
    const narrow = aspect < 1.2;

    // Key 0 — approved Hero frame (unchanged).
    const frameWidth = narrow ? shot.frame.narrowWidth : shot.frame.width;
    const heroDistance =
      fitDistance(frameWidth, shot.frame.height, aspect) * (1 + shot.pullback * (1 - push));
    t0.set(...shot.target);
    p0.set(shot.target[0] + shot.offset[0], shot.target[1] + shot.offset[1], heroDistance);

    // Key 1 — gentle push toward the board, same look-at.
    t1.copy(t0);
    p1.lerpVectors(p0, t0, travel.push);

    // Key 2 — crane down: camera lowers, gaze drops to the board's lower edge / desk back.
    p2.set(...travel.mid.position);
    t2.set(...travel.mid.target);

    // Key 3 — above the dossier, pitched down, framed to the desk composition.
    const arrival = narrow ? desk.narrow : desk;
    const yaw = radians(desk.yaw);
    t3.set(...desk.focus);
    orbit(
      p3,
      t3,
      radians(arrival.pitch),
      yaw,
      fitDistance(arrival.frame.width, arrival.frame.height, aspect),
    );

    // Inspection lean — only reached through `inspect`, after the journey ends.
    const lean = narrow ? desk.inspect.narrow : desk.inspect;
    this.inspectTarget.set(...desk.inspect.shift).add(t3);
    orbit(
      this.inspectPosition,
      this.inspectTarget,
      radians(lean.pitch),
      yaw,
      fitDistance(lean.frame.width, lean.frame.height, aspect),
    );

    // Archive — the same desk, further along it: a near-eye-level look at the
    // workstation. Only reached through `archive`, after the dossier chapter.
    const shot06 = narrow ? station.camera.narrow : station.camera;
    this.archiveTarget.set(...station.camera.focus);
    orbit(
      this.archivePosition,
      this.archiveTarget,
      radians(shot06.pitch),
      radians(station.camera.yaw),
      fitDistance(shot06.frame.width, shot06.frame.height, aspect),
    );
  }

  /**
   * Camera pose for journey `value` (0-1, Hero hold and easing applied), the
   * dossier `inspect` lean (0-1) and the `archive` traverse (0-1). inspect = 0
   * is exactly the desk arrival; archive = 0 is exactly wherever the dossier
   * chapter ended.
   */
  sample(value: number, inspect: number, archive: number, position: Vector3, target: Vector3) {
    const moving = Math.min(1, Math.max(0, (value - travel.hold) / (1 - travel.hold)));
    const eased = 0.5 - 0.5 * Math.cos(Math.PI * moving);
    this.positionCurve.getPoint(eased, position);
    this.targetCurve.getPoint(eased, target);
    if (inspect > 0) {
      position.add(
        scratch.subVectors(this.inspectPosition, this.positions[3]).multiplyScalar(inspect),
      );
      target.add(scratch.subVectors(this.inspectTarget, this.targets[3]).multiplyScalar(inspect));
    }
    // Continues from wherever the dossier left the camera, so the move across
    // the desk is one unbroken travel rather than a cut to a new scene.
    if (archive > 0) {
      position.lerp(this.archivePosition, archive);
      target.lerp(this.archiveTarget, archive);
    }
  }
}
