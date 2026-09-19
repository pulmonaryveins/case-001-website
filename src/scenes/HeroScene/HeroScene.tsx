import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  bakeGrain,
  EvidenceString,
  Grain,
  GrainResolution,
  grainTiles,
  type GrainJob,
  Paper,
  Polaroid,
  PushPin,
  Stamp,
} from '../../components/evidence';
import { investigation as content } from '../../data/investigation';
import { heroAssets } from '../../data/heroAssets';
import { EnvironmentBoundary } from './environment/EnvironmentBoundary';
import { evidenceLight, type SurfaceName } from './environment/lighting';
import type { CameraState } from './environment/CameraRig';
import { environment as world } from './environment/config';
import { DeskEvidence } from './DeskEvidence';
import {
  addDossierCut,
  addDossierOpening,
  createStackedOpening,
  REVEAL_COMPLETE,
} from '../AboutScene/dossierTimeline';
import { addDossierPages } from '../AboutScene/dossierPagesTimeline';
import { DossierPageController, pageCount, pageScrollLength } from '../AboutScene/pageController';
import { experience } from '../../data/experience';
import { useGSAPContext } from '../../hooks/useGSAPContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { BREAKPOINTS, useMediaQuery } from '../../hooks/useMediaQuery';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import philippinesMap from '../../assets/evidence/location/philippines-map.svg';
import styles from './HeroScene.module.css';

// Supplied paper scans (none yet) are baked alongside the shared stocks.
const scans = [
  ...new Set(
    Object.values(heroAssets.paper)
      .map((material) => material.textureSrc)
      .filter((src): src is string => Boolean(src)),
  ),
];

/**
 * Grain bitmap resolution per projected plane, near its on-screen scale at
 * rest: the board is seen at ~1.2x its 1000px plane, the open dossier at ~2x.
 * Quarter steps keep the bake keys stable; capped to bound GPU memory.
 */
function grainResolutions() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const step = (scale: number) => Math.min(2.5, Math.round(scale * dpr * 4) / 4);
  return { board: step(1.25), desk: step(2) };
}
function grainJobs({ board, desk }: ReturnType<typeof grainResolutions>): GrainJob[] {
  const paper = [grainTiles.paper.src, ...scans];
  return [
    ...paper.map((src) => ({ src, tile: grainTiles.paper.tile, resolution: board })),
    ...paper.map((src) => ({ src, tile: grainTiles.paper.tile, resolution: desk })),
    { ...grainTiles.fiber, resolution: desk },
  ];
}

const HeroEnvironmentCanvas = lazy(() => import('./environment/HeroEnvironmentCanvas'));

// Failure path only (e.g. a stalled chunk): never part of normal sequencing.
const ENVIRONMENT_TIMEOUT_MS = 6000;

// Board-space composition (percent of board width/height). Pins derive from the
// same numbers, so a paper and the pin holding it can never drift apart.
type Placement = { x: number; y: number; w: number };
type Layout = Record<
  'heading' | 'subject' | 'annotation' | 'frontend' | 'uiux' | 'graphic' | 'video' | 'map',
  Placement
>;
const desktopLayout: Layout = {
  heading: { x: 34, y: 3, w: 33 },
  subject: { x: 40, y: 30, w: 21 },
  annotation: { x: 40.5, y: 82, w: 21 },
  frontend: { x: 10.5, y: 28, w: 18.5 },
  uiux: { x: 71, y: 24, w: 19 },
  graphic: { x: 15, y: 62, w: 19 },
  video: { x: 71.5, y: 63.5, w: 18 },
  // Background location sheet in the darker, lamp-far region; evidence overlaps it.
  map: { x: 1.8, y: 7, w: 21 },
};
const mobileLayout: Layout = {
  heading: { x: 7, y: 2.5, w: 80 },
  subject: { x: 26, y: 21, w: 48 },
  annotation: { x: 12, y: 49.5, w: 75 },
  frontend: { x: 5, y: 61, w: 41 },
  uiux: { x: 54, y: 61, w: 41 },
  graphic: { x: 5, y: 79, w: 41 },
  video: { x: 54, y: 79, w: 41 },
  // Omitted on mobile: subject and disciplines keep the space.
  map: { x: 0, y: 0, w: 0 },
};
const placed = ({ x, y, w }: Placement) =>
  ({ '--x': `${x}%`, '--y': `${y}%`, '--w': `${w}%` }) as CSSProperties;
const pinFor = ({ x, y, w }: Placement, drop: number) => ({ x: x + w * 0.52, y: y + drop });
const noteRotation: Record<string, number> = { frontend: -3, uiux: 2.5, graphic: -2, video: 3.5 };
const noteVariant = (id: string) => (id === 'graphic' ? 'torn' : id === 'uiux' ? 'clean' : 'note');

/** Fonts settle paper heights; decoded images avoid evidence popping in mid-intro. */
function waitForContent(board: HTMLElement) {
  const images = [...board.querySelectorAll('img')].map((img) => img.decode().catch(() => {}));
  return Promise.all([
    document.fonts.load('400 1em "Special Elite"'),
    document.fonts.load('500 1em "Caveat"'),
    ...images,
  ]).then(() => document.fonts.ready);
}

/** Position of an element's centre in normalised board space, from layout (ignores transforms). */
function boardPosition(el: HTMLElement, board: HTMLElement): [number, number] {
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  let node: HTMLElement | null = el;
  while (node && node !== board) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return [x / board.clientWidth, y / board.clientHeight];
}

export function HeroScene() {
  const scope = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const deskOverlay = useRef<HTMLDivElement>(null);
  const invalidateRef = useRef<(() => void) | null>(null);
  const introPlayed = useRef(false);
  // Mutable camera state shared with the 3D rig; written only by GSAP (intro + scroll).
  const cameraState = useRef<CameraState>({ push: 0, travel: 0, inspect: 0 });
  const [environmentReady, setEnvironmentReady] = useState(false);
  const [environmentFailed, setEnvironmentFailed] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  // Grain baked into bitmaps: the projected planes then use image layers (see Grain).
  const [grainBaked, setGrainBaked] = useState(false);
  const [grainScale] = useState(grainResolutions);
  const onReady = useCallback(() => setEnvironmentReady(true), []);
  const onFailure = useCallback(() => setEnvironmentFailed(true), []);
  const reducedMotion = useReducedMotion();
  const mobile = useMediaQuery(BREAKPOINTS.mobile);
  const tablet = useMediaQuery(BREAKPOINTS.tablet);
  // One owner for the dossier's right-hand pages: the scrubbed stage, the index
  // tabs and the arrows all resolve through this single controller. Page count
  // follows the data, so a new experience record adds a page by itself.
  const pages = useMemo(() => new DossierPageController(pageCount(experience.length)), []);

  const rendering = mobile || environmentFailed ? 'fallback' : '3d';
  const ready = contentReady && (rendering === 'fallback' || environmentReady);

  useEffect(() => {
    let active = true;
    Promise.all([
      waitForContent(overlay.current!).catch(() => {}),
      // Mobile never projects planes, so it keeps the CSS tiles and skips baking.
      window.matchMedia(BREAKPOINTS.mobile).matches
        ? false
        : bakeGrain(grainJobs(grainScale)).then(
            () => true,
            () => false,
          ),
    ]).then(([, baked]) => {
      if (!active) return;
      setGrainBaked(baked);
      setContentReady(true);
    });
    return () => {
      active = false;
    };
  }, [grainScale]);

  useEffect(() => {
    if (rendering !== '3d' || environmentReady) return;
    const timer = window.setTimeout(onFailure, ENVIRONMENT_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [rendering, environmentReady, onFailure]);

  // Lighting bridge: evaluate the lamp at each evidence group's position on its
  // surface (board or desk). Layout-only inputs, so it only needs recomputing
  // when the composition changes.
  useLayoutEffect(() => {
    if (!contentReady) return;
    const surfaces: [HTMLElement | null, SurfaceName][] = [
      [overlay.current, 'board'],
      [deskOverlay.current, 'desk'],
    ];
    for (const [plane, surface] of surfaces) {
      plane?.querySelectorAll<HTMLElement>('[data-lit]').forEach((el) => {
        const [u, v] = boardPosition(el, plane);
        const light = evidenceLight(u, v, surface);
        el.style.setProperty('--lit', light.lit.toFixed(3));
        el.style.setProperty('--sx', light.sx.toFixed(3));
        el.style.setProperty('--sy', light.sy.toFixed(3));
        el.style.setProperty('--warm', light.warm.toFixed(3));
        el.style.setProperty('--light-angle', `${light.angle.toFixed(1)}deg`);
      });
    }
  }, [rendering, mobile, tablet, contentReady]);

  // One authoritative intro. Initial states are set explicitly, then animated TO
  // known values — nothing depends on computed styles captured at a lucky moment.
  useGSAPContext(scope, () => {
    if (!ready) return;
    const root = scope.current!;
    const seconds = (token: string) => parseFloat(getComputedStyle(root).getPropertyValue(token));
    const invalidate = () => invalidateRef.current?.();
    const q = gsap.utils.selector(root);
    ScrollTrigger.refresh();

    if (introPlayed.current || reducedMotion) {
      cameraState.current.push = 1;
      invalidate();
      if (introPlayed.current) return;
      gsap.set(q('[data-stage]'), { opacity: 0 });
      gsap.to(q('[data-stage]'), {
        opacity: 1,
        duration: seconds('--duration-slow'),
        ease: 'none',
        onComplete: () => {
          introPlayed.current = true;
        },
      });
      return;
    }

    // The 3D atmosphere layer is absent on mobile/fallback; only animate what exists.
    const atmosphere = q('[data-atmosphere]');
    gsap.set(cameraState.current, { push: 0 });
    gsap.set([...atmosphere, ...q('[data-board], [data-connections], [data-hud]')], {
      opacity: 0,
    });
    gsap.set(q('[data-evidence]'), { opacity: 0, '--enter-y': '10px' });
    gsap.set(q('[data-streak]'), { opacity: 0, xPercent: -120 });
    invalidate();

    const intro = gsap
      .timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          introPlayed.current = true;
        },
      })
      .to(
        q('[data-streak]'),
        { opacity: 0.35, xPercent: 160, duration: seconds('--duration-base'), ease: 'power2.in' },
        0,
      )
      .to(q('[data-streak]'), { opacity: 0, duration: seconds('--duration-fast') }, 0.35)
      .to(q('[data-board]'), { opacity: 1, duration: seconds('--duration-slow') }, 0.3)
      .to(
        q('[data-evidence]'),
        { opacity: 1, '--enter-y': '0px', duration: seconds('--duration-slow'), stagger: 0.07 },
        0.42,
      )
      .to(q('[data-connections]'), { opacity: 1, duration: seconds('--duration-slow') }, 0.95)
      .to(q('[data-hud]'), { opacity: 1, duration: seconds('--duration-slow') }, 1.1);
    if (atmosphere.length) {
      intro.to(atmosphere, { opacity: 1, duration: seconds('--duration-scene') }, 0.1).to(
        cameraState.current,
        {
          push: 1,
          duration: seconds('--duration-scene') * 2,
          ease: 'power2.out',
          onUpdate: invalidate,
        },
        0.1,
      );
    }
  }, [ready, reducedMotion]);

  // The pinned stage: board -> desk journey, the dossier opens (About), then
  // its right-hand pages are read one after another.
  // One scrubbed timeline drives the camera state; the rig turns it into a
  // single continuous move and re-projects every DOM plane from the same
  // camera, so evidence stays registered and every step reverses exactly.
  // Timeline units are viewport heights, so each segment keeps its own scroll
  // length. Created on mount (not after readiness) so the pin spacer exists
  // before the browser restores a mid-page scroll position.
  useGSAPContext(scope, () => {
    if (rendering !== '3d') return;
    const root = scope.current!;
    const q = gsap.utils.selector(root);
    const invalidate = () => invalidateRef.current?.();
    const size = tablet ? 'tablet' : 'desktop';
    const journeyLength = world.travel.distance[size];
    const dossierLength = world.travel.dossier[size];
    const pagesLength = pageScrollLength(pages.count);
    const stage = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: () => `+=${window.innerHeight * (journeyLength + dossierLength + pagesLength)}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: invalidate,
      },
    });
    const journey = (f: number) => f * journeyLength;
    const caseStep = (from: string, to: string, at: number, span: number) =>
      stage
        .to(q(`[data-case-step="${from}"]`), { opacity: 0, duration: span }, at)
        .to(q(`[data-case-step="${to}"]`), { opacity: 1, duration: span }, at);
    const dossier = { start: journeyLength, span: dossierLength };

    stage.to(q('[data-scroll-prompt]'), { opacity: 0, duration: journey(0.06) }, journey(0.02));
    if (reducedMotion) {
      // No camera journey: a short fade to dark, cut to the desk, fade back.
      stage
        .to(q('[data-cut]'), { opacity: 1, duration: journey(0.08) }, journey(0.42))
        .to(cameraState.current, { travel: 1, duration: 0.001, onUpdate: invalidate }, journey(0.5))
        .to(q('[data-cut]'), { opacity: 0, duration: journey(0.08) }, journey(0.501));
      caseStep('01', '02', journey(0.5), 0.001);
      addDossierCut(stage, q, dossier, cameraState.current, invalidate);
      caseStep('02', '03', dossier.start + dossier.span * 0.42, 0.001);
    } else {
      stage.to(
        cameraState.current,
        { travel: 1, duration: journeyLength, onUpdate: invalidate },
        0,
      );
      caseStep('01', '02', journey(0.86), journey(0.06));
      addDossierOpening(stage, q, dossier, cameraState.current, invalidate);
      caseStep('02', '03', dossier.start + dossier.span * 0.72, dossier.span * 0.04);
    }
    // Reading the file continues the same scrub: the sheets turn where the
    // opening left off, and tab clicks resolve to positions on this timeline.
    // The navigation tabs arm earlier, right as the opening's own reveal
    // finishes — not at the very end of the segment's trailing hold.
    const revealedAt =
      dossier.start +
      dossier.span * (reducedMotion ? REVEAL_COMPLETE.reduced : REVEAL_COMPLETE.normal);
    const reading = addDossierPages(
      stage,
      pages,
      dossier.start + dossier.span,
      revealedAt,
      reducedMotion,
    );
    // Pin the timeline length to the scroll length so progress maps 1:1.
    stage.set({}, {}, journeyLength + dossierLength + pagesLength);
    return reading.disconnect;
  }, [rendering, tablet, reducedMotion, pages]);

  // Fallback (mobile / no WebGL): no pinned stage. The stacked file opens once
  // it is being read and closes again if the reader scrolls back above it.
  useGSAPContext(scope, () => {
    if (rendering !== 'fallback' || !deskOverlay.current) return;
    const opening = createStackedOpening(deskOverlay.current, reducedMotion);
    ScrollTrigger.create({
      trigger: deskOverlay.current,
      start: 'top 55%',
      onEnter: () => opening.play(),
      onLeaveBack: () => opening.reverse(),
    });
    // No pinned scrub here, so the file's own tabs and arrows are the only way
    // through its pages: they are live as soon as the panel is.
    pages.setEnabled(true);
    return () => pages.setEnabled(false);
  }, [rendering, reducedMotion, pages]);

  const materialStyle = {
    '--hero-cork-texture': `url("${heroAssets.cork}")`,
    '--hero-cork-blend': heroAssets.corkIsPlaceholder ? 'multiply' : 'normal',
    '--hero-tape-image': heroAssets.tape ? `url("${heroAssets.tape}")` : 'none',
  } as CSSProperties;
  // Only the camera-projected planes need image grain; flat layouts keep CSS tiles.
  const grain = rendering === '3d' && grainBaked ? 'layer' : undefined;
  const layout = mobile ? mobileLayout : desktopLayout;
  const pins = content.branches.map((branch) => pinFor(layout[branch.id as keyof Layout], 1));
  const subjectPin = pinFor(layout.subject, 1.4);
  const mapPin = pinFor(layout.map, 1.2);

  return (
    <section
      ref={scope}
      style={materialStyle}
      className={styles.scene}
      aria-labelledby="case-heading"
      data-scene="hero"
      data-rendering={rendering}
      data-intro={ready ? 'ready' : 'pending'}
    >
      <div className={styles.streak} data-streak aria-hidden="true" />
      <header className={styles.hud} data-hud data-stage>
        <span>{content.caseNumber}</span>
        <span>{content.eyebrow}</span>
      </header>
      {rendering === '3d' && (
        <div className={styles.environment} aria-hidden="true" data-atmosphere data-stage>
          <EnvironmentBoundary onFailure={onFailure}>
            <Suspense fallback={null}>
              <HeroEnvironmentCanvas
                overlay={overlay}
                deskOverlay={deskOverlay}
                camera={cameraState}
                invalidateRef={invalidateRef}
                tablet={tablet}
                animateAtmosphere={!reducedMotion}
                onReady={onReady}
                onFailure={onFailure}
              />
            </Suspense>
          </EnvironmentBoundary>
        </div>
      )}
      <div ref={overlay} className={styles.board} data-board data-stage data-grain={grain}>
        <GrainResolution.Provider value={grainScale.board}>
          {!mobile && (
            <Paper
              className={`${styles.mapSheet} ${styles.placed} ${styles.mounted}`}
              style={placed(layout.map)}
              variant="map"
              rotation={-1.2}
              data-evidence
              data-lit
            >
              <span className={styles.mapLabel}>{content.location.label}</span>
              <img
                src={philippinesMap}
                alt={content.location.alt}
                width={600}
                height={1000}
                loading="eager"
                decoding="async"
              />
              <span className={styles.mapCoords}>{content.location.coordinates}</span>
            </Paper>
          )}
          <Paper
            className={`${styles.caseHeading} ${styles.placed} ${styles.flush}`}
            style={placed(layout.heading)}
            variant="document"
            material={heroAssets.paper.document}
            rotation={1.2}
            data-evidence
            data-lit
          >
            <span className={styles.fileTag}>{content.eyebrow}</span>
            <h1 id="case-heading">{content.caseNumber}</h1>
            <span className={styles.subjectLine}>SUBJECT: {content.subject}</span>
            <span className={styles.status}>
              STATUS: <em>{content.status}</em>
            </span>
          </Paper>
          <div
            className={`${styles.subject} ${styles.placed}`}
            style={placed(layout.subject)}
            data-evidence
            data-lit
          >
            <Paper
              className={`${styles.backingUnder} ${styles.stack}`}
              variant="document"
              material={heroAssets.paper.document}
              rotation={-3.5}
              aria-hidden="true"
            />
            <Paper
              className={`${styles.backing} ${styles.flush}`}
              variant="photoBacking"
              material={heroAssets.paper.photoBacking}
              rotation={3}
              aria-hidden="true"
            />
            <div className={styles.photo}>
              <Polaroid
                src={content.photoSrc}
                alt={content.photoAlt}
                caption={content.annotation}
                rotation={-2}
                loading="eager"
                srcSet={content.photoSrcSet}
                sizes="(max-width: 640px) 48vw, (max-width: 1024px) 27vw, 320px"
                textureSrc={heroAssets.paper.photoBacking.textureSrc}
              >
                <Grain />
              </Polaroid>
            </div>
            <span className={styles.subjectTape} aria-hidden="true">
              <Grain tile={128} />
            </span>
            <div className={styles.subjectStamp}>
              <Stamp text={content.subject} rotation={-5} />
            </div>
          </div>
          <ul
            className={styles.evidenceList}
            aria-label="Disciplines connected to the unknown subject"
          >
            {content.branches.map((branch) => (
              <li
                key={branch.id}
                className={`${styles.branch} ${styles.placed} ${styles[branch.id]}`}
                style={placed(layout[branch.id as keyof Layout])}
                data-evidence
                data-lit
              >
                {!mobile && (
                  <figure className={styles.visualEvidence}>
                    <Grain />
                    <img
                      src={branch.evidenceSrc}
                      srcSet={branch.evidenceSrcSet}
                      sizes="(max-width: 1024px) 25vw, 300px"
                      alt={branch.evidenceAlt}
                      loading="eager"
                      decoding="async"
                      width={880}
                      height={660}
                    />
                  </figure>
                )}
                <Paper
                  className={`${styles.note} ${styles.lifted}`}
                  variant={noteVariant(branch.id)}
                  material={heroAssets.paper[noteVariant(branch.id)]}
                  rotation={noteRotation[branch.id]}
                >
                  <span className={styles.evidenceNumber}>EVIDENCE / {branch.number}</span>
                  <h2>{branch.title}</h2>
                  <span className={styles.detail}>{branch.detail}</span>
                </Paper>
              </li>
            ))}
          </ul>
          <div className={styles.connections} data-connections data-lit aria-hidden="true">
            {pins.map((pin, i) => (
              <EvidenceString
                key={content.branches[i].id}
                from={subjectPin}
                to={pin}
                sag={mobile ? 2 : [2.5, -1.5, 3.5, 1][i]}
                viewBox="0 0 100 100"
                className={styles.string}
              />
            ))}
          </div>
          <div className={styles.pins} data-connections data-lit aria-hidden="true">
            {[subjectPin, ...pins, ...(mobile ? [] : [mapPin])].map((pin, i) => (
              <PushPin
                key={i}
                className={styles.pin}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              />
            ))}
          </div>
          <Paper
            className={`${styles.annotation} ${styles.placed} ${styles.flush}`}
            style={placed(layout.annotation)}
            variant="aged"
            material={heroAssets.paper.aged}
            rotation={-2.5}
            data-evidence
            data-lit
          >
            <p>{content.question}</p>
          </Paper>
        </GrainResolution.Provider>
      </div>
      {rendering === '3d' ? (
        <div
          ref={deskOverlay}
          className={styles.deskPlane}
          data-board
          data-stage
          data-grain={grain}
        >
          <GrainResolution.Provider value={grainScale.desk}>
            <DeskEvidence layout="plane" controller={pages} flat={reducedMotion} />
          </GrainResolution.Provider>
        </div>
      ) : (
        <div ref={deskOverlay} className={styles.deskPanel} data-stage>
          <DeskEvidence layout="panel" controller={pages} flat />
        </div>
      )}
      <div className={styles.cut} data-cut aria-hidden="true" />
      <footer className={styles.footer} data-hud data-stage>
        <span>{content.status}</span>
        <p data-scroll-prompt>
          {content.scrollPrompt}
          <span className={styles.scrollLine} aria-hidden="true" />
        </p>
        <span>
          {content.caseNumber} /{' '}
          <span className={styles.caseStep}>
            <span data-case-step="01">01</span>
            <span data-case-step="02">02</span>
            <span data-case-step="03">03</span>
          </span>
        </span>
      </footer>
    </section>
  );
}
