import { Grain, Paper, Stamp } from '../../components/evidence';
import { investigation as caseFile } from '../../data/investigation';
import { profile } from '../../data/profile';
import styles from './SubjectFile.module.css';

/**
 * Contents of the opened CASE 0926 dossier (About). All copy comes from
 * `data/profile.ts`. Reveal targets are marked with data attributes; their
 * hidden starting states live in CSS so every timeline starts deterministic:
 *   data-reveal="identity" | "profile"   fade/settle in
 *   data-stamp="unknown" / data-strike   the UNKNOWN verdict, then struck through
 *   data-stamp="identified"              the IDENTIFIED stamp landing
 *   data-state="pending" | "identified"  status text swap
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
          <span className={styles.unknownStamp} data-stamp="unknown" aria-hidden="true">
            <Stamp text="UNKNOWN" rotation={-6} />
            <span className={styles.strike} data-strike />
          </span>
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

/** Top page of the file (right page once open): profile, disciplines, skills, education. */
export function ProfilePages() {
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
      <EducationEvidence />
    </article>
  );
}

/**
 * Secondary evidence after the profile: one administrative education record
 * lying on the lower page. Text only; every value comes from profile data.
 */
function EducationEvidence() {
  return (
    <section className={styles.education} data-reveal="profile" aria-labelledby="subject-education">
      <Paper className={`${styles.educationRecord} evidence-light`} variant="aged" rotation={-0.6}>
        <header className={styles.recordHeader}>
          <h3 id="subject-education" className={styles.recordTitle}>
            Education record
          </h3>
          <p className={styles.kicker}>CASE 0926 / EDUCATION</p>
        </header>
        {profile.education.map((entry) => (
          <dl key={entry.institution} className={styles.record}>
            <div>
              <dt>Institution</dt>
              <dd>{entry.institution}</dd>
            </div>
            <div>
              <dt>Program</dt>
              <dd>{entry.program}</dd>
            </div>
            <div>
              <dt>Period</dt>
              <dd>{entry.period}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{entry.location}</dd>
            </div>
          </dl>
        ))}
      </Paper>
    </section>
  );
}
