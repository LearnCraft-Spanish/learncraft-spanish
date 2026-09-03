import type { SrsTallies } from '@domain/functions/srsTallies';
import type { JSX } from 'react';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './QuizProgressHeader.module.scss';

interface QuizProgressHeaderProps {
  /** The desktop context line, e.g. "Lessons 1–111 · 249 due". */
  quizTitle?: string;
  exampleNumber: number;
  quizLength: number;
  srs: boolean;
  tallies?: SrsTallies;
}

/**
 * Position readout, progress track, the desktop context line, and the
 * mobile tally pills. The desktop tally pills flank the card itself — see
 * `TallyPill`.
 */
export function QuizProgressHeader({
  quizTitle,
  exampleNumber,
  quizLength,
  srs,
  tallies,
}: QuizProgressHeaderProps): JSX.Element {
  const percent =
    quizLength > 0 ? Math.min(100, (exampleNumber / quizLength) * 100) : 0;
  const position = `${exampleNumber} / ${quizLength}`;
  const showTallies = srs && tallies !== undefined;

  return (
    <div className={styles.root}>
      <div className={styles.mobileRow}>
        {showTallies && (
          <span
            className={`${styles.miniPill} ${styles.hard}`}
            role="status"
            aria-label={`${tallies.hard} cards graded hard`}
          >
            <Icon name="x" tone="error" size="sm" />
            {tallies.hard}
          </span>
        )}
        <span className={styles.position}>{position}</span>
        {showTallies && (
          <span
            className={`${styles.miniPill} ${styles.easy}`}
            role="status"
            aria-label={`${tallies.easy} cards graded easy`}
          >
            {/* No Icon `success` tone — color forced in `.miniPill.easy svg`. */}
            <Icon name="check" tone="inherit" size="sm" />
            {tallies.easy}
          </span>
        )}
      </div>

      <div className={styles.desktopRow}>
        {quizTitle !== undefined && (
          <div className={styles.context}>
            <Eyebrow as="h2">Quizzing my flashcards</Eyebrow>
            <p className={styles.title}>{quizTitle}</p>
          </div>
        )}
        <span className={styles.positionDesktop}>{position}</span>
      </div>

      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
