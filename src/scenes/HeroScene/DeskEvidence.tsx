import { Dossier, Paper } from '../../components/evidence';
import { investigation as content } from '../../data/investigation';
import { DossierNavigation, DossierPages } from '../AboutScene/DossierPages';
import type { DossierPageController } from '../AboutScene/pageController';
import { IdentitySheet } from '../AboutScene/SubjectFile';
import styles from './DeskEvidence.module.css';

interface DeskEvidenceProps {
  layout: 'plane' | 'panel';
  controller: DossierPageController;
  /** Straight page swap instead of a turn: reduced motion, and the flat panel. */
  flat: boolean;
}

/**
 * What lies on the desk where the camera settles: the CASE 0926 dossier
 * (closed on arrival; its contents are the About scene) and one loose
 * document beneath it. Laid out in desk-plane space
 * (1024 x 640 px in 3D; a flat panel in the fallback) and lit through the
 * shared lamp model via `data-lit`.
 *
 * The identification sheet is clipped to the cover, so it stays put for the
 * whole file; only the page well on the right changes.
 */
export function DeskEvidence({ layout, controller, flat }: DeskEvidenceProps) {
  return (
    <div className={styles.desk} data-layout={layout}>
      <Paper
        className={`${styles.looseSheet} ${styles.paper} evidence-light`}
        variant="aged"
        rotation={-6}
        aria-hidden="true"
        data-lit
      />
      <div className={styles.dossierSlot} data-lit>
        <Dossier
          caseNumber={content.caseNumber}
          title={content.dossier.title}
          classification={content.dossier.classification}
          status={content.dossier.status}
          layout={layout === 'panel' ? 'stacked' : 'spread'}
          inside={<IdentitySheet />}
          pages={
            <>
              <DossierPages controller={controller} flat={flat} />
              <DossierNavigation controller={controller} />
            </>
          }
        />
      </div>
    </div>
  );
}
