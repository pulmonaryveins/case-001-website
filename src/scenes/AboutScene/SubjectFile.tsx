import { Grain, Paper, Stamp } from '../../components/evidence';
import { investigation as caseFile } from '../../data/investigation';
import { profile } from '../../data/profile';
import styles from './SubjectFile.module.css';

/**
 * Contents of the opened CASE 0926 dossier (About). All copy comes from
 * `data/profile.ts`. Reveal targets are marked with data attributes; their
 * hidden starting states live in CSS so every timeline starts deterministic:
 *   data-reveal="identity" | "profile"   fade/settle in
 *   data-stamp="identified"              the IDENTIFIED stamp landing
 *   data-state="pending" | "identified"  status text swap
 * The board's UNKNOWN verdict never appears here: the dossier is the later
 * narrative state (identified), so its portrait never carries an UNKNOWN
 * stamp underneath — only IDENTIFIED lands.
 */

/** Inside of the cover (left page once open): the identification sheet. */
export function IdentitySheet() {
  return (
    <article className={styles.identity} aria-labelledby="subject-identified">
      <Paper className={`${styles.idSheet} evidence-light`} variant="document" rotation={-1.2}>
        <p className={styles.kicker}>{caseFile.caseNumber} / IDENTIFICATION</p>
        <h2 id="subject-identified" className={styles.idTitle}>
          <span data-state="pending">SUBJECT UNKNOWN</span>
          <span data-state="identified" aria-hidden="true">
            SUBJECT IDENTIFIED
          </span>
        </h2>
        <figure className={`${styles.portrait} evidence-light`} data-portrait>
          <Grain />
          <img
            src={profile.portrait.src}
            alt={profile.portrait.alt}
            width={400}
            height={480}
            loading="eager"
            decoding="async"
          />
          <figcaption>ID PHOTO / {caseFile.caseNumber.replace('CASE ', '')}</figcaption>
        </figure>
        <dl className={styles.fields}>
          <div data-reveal="identity">
            <dt>NAME</dt>
            <dd className={styles.name}>{profile.name}</dd>
          </div>
          <div data-reveal="identity">
            <dt>ROLE</dt>
            <dd>{profile.role}</dd>
          </div>
          <div data-reveal="identity">
            <dt>LOCATION</dt>
            <dd>{profile.location}</dd>
          </div>
          <div>
            <dt>STATUS</dt>
            <dd className={styles.statusValue}>
              <span data-state="pending">IDENTIFICATION PENDING</span>
              <span data-state="identified" aria-hidden="true">
                IDENTIFIED
              </span>
            </dd>
          </div>
        </dl>
        <span className={styles.identifiedStamp} data-stamp="identified" aria-hidden="true">
          <Stamp text="IDENTIFIED" rotation={-8} />
        </span>
      </Paper>
    </article>
  );
}

/**
 * Page 01 of the file (first right-hand page): profile, disciplines, skills.
 * The education record moved to its own page (see DossierPages); nothing else
 * about this page changed, and its `data-reveal` targets are the ones the
 * approved opening timeline animates — new pages must not use that attribute.
 */
export function AboutPage() {
  return (
    <article className={styles.profile} aria-labelledby="subject-profile">
      <p className={styles.kicker}>FILE 0926-A / CONFIRMED</p>
      <h2 id="subject-profile" className={styles.profileTitle}>
        Subject Profile
      </h2>
      <div className={styles.summary} data-reveal="profile">
        {profile.summary.map((sentence) => (
          <p key={sentence}>{sentence}</p>
        ))}
      </div>
      <section data-reveal="profile" aria-labelledby="subject-disciplines">
        <h3 id="subject-disciplines" className={styles.sectionLabel}>
          Primary disciplines
        </h3>
        <ol className={styles.disciplines}>
          {profile.disciplines.map((discipline, i) => (
            <li key={discipline}>
              <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              {discipline}
            </li>
          ))}
        </ol>
      </section>
      <section data-reveal="profile" aria-labelledby="subject-skills">
        <h3 id="subject-skills" className={styles.sectionLabel}>
          Skills / verified
        </h3>
        <dl className={styles.skills}>
          {profile.skills.map((group) => (
            <div key={group.label}>
              <dt>{group.label}</dt>
              <dd>{group.items.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
