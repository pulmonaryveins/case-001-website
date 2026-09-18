import { Dossier, Paper } from '../../components/evidence';
import { investigation as content } from '../../data/investigation';
import { IdentitySheet, ProfilePages } from '../AboutScene/SubjectFile';
import styles from './DeskEvidence.module.css';

/**
 * What lies on the desk where the camera settles: the CASE 0926 dossier
 * (closed on arrival; its contents are the About scene) and one loose
 * document beneath it. Laid out in desk-plane space
 * (1024 x 640 px in 3D; a flat panel in the fallback) and lit through the
 * shared lamp model via `data-lit`.
 */
export function DeskEvidence({ layout }: { layout: 'plane' | 'panel' }) {
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
          pages={<ProfilePages />}
        />
      </div>
    </div>
  );
}
