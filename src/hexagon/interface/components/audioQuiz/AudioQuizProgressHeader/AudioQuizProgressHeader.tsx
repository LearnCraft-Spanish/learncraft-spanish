import type { JSX } from 'react';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import styles from './AudioQuizProgressHeader.module.scss';

interface AudioQuizProgressHeaderProps {
  /** `"Speaking quiz · my flashcards"` / `"Listening quiz · my flashcards"`. */
  quizName: string;
  /** 1-based position in the deck. */
  exampleNumber: number;
  quizLength: number;
}

/**
 * The progress block: quiz-name eyebrow, the `12 / 20` counter, and the 4px
 * deck bar. Identical markup on mobile and desktop — the handoff drops the
 * text quiz's per-step rail, the desktop lesson-range subtitle, and any
 * back arrow (the mobile app chrome already carries a "Setup" back
 * control; there is nothing in this header to gate it on).
 */
export function AudioQuizProgressHeader({
  quizName,
  exampleNumber,
  quizLength,
}: AudioQuizProgressHeaderProps): JSX.Element {
  const percent =
    quizLength > 0 ? Math.min(100, (exampleNumber / quizLength) * 100) : 0;
  const position = `${exampleNumber} / ${quizLength}`;

  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <Eyebrow as="h2">{quizName}</Eyebrow>
        <span className={styles.position}>{position}</span>
      </div>

      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
