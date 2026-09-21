import type { JSX } from 'react';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { IconButton } from '@interface/components/general/IconButton/IconButton';
import styles from './AudioQuizProgressHeader.module.scss';

interface AudioQuizProgressHeaderProps {
  /** Tier 1 — quiz category: "Custom Quiz" / "My Flashcards Quiz". */
  eyebrow: string;
  /** Tier 2 — quiz form: "Speaking Quiz" / "Listening Quiz". */
  subtitle: string;
  /** 1-based position in the deck. */
  exampleNumber: number;
  quizLength: number;
  /** Exits the quiz back to quiz setup. */
  onExit: () => void;
}

/**
 * The progress block: two-tier quiz title (category eyebrow + form
 * subtitle — see `domain/functions/quizTitle`), the `12 / 20` counter, the
 * 4px deck bar, and a desktop-only back arrow (parity with
 * `QuizProgressHeader` — mobile keeps no arrow so the counter stays
 * balanced; mobile exit chrome lives elsewhere).
 */
export function AudioQuizProgressHeader({
  eyebrow,
  subtitle,
  exampleNumber,
  quizLength,
  onExit,
}: AudioQuizProgressHeaderProps): JSX.Element {
  const percent =
    quizLength > 0 ? Math.min(100, (exampleNumber / quizLength) * 100) : 0;
  const position = `${exampleNumber} / ${quizLength}`;

  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <div className={styles.leftGroup}>
          {/* Desktop-only — hidden below 769px so the mobile counter stays
           * balanced; same tradeoff as `QuizProgressHeader`. */}
          <span className={styles.backButton}>
            <IconButton
              icon="arrowLeft"
              label="Back to quiz setup"
              onClick={onExit}
              size="sm"
            />
          </span>
          <div className={styles.context}>
            <Eyebrow as="h2">{eyebrow}</Eyebrow>
            <p className={styles.title}>{subtitle}</p>
          </div>
        </div>
        <span className={styles.position}>{position}</span>
      </div>

      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
