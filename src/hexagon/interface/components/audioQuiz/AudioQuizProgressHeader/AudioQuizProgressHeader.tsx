import type { JSX } from 'react';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import styles from './AudioQuizProgressHeader.module.scss';

interface AudioQuizProgressHeaderProps {
  /** Tier 1 — quiz category: "Custom Quiz" / "My Flashcards Quiz". */
  eyebrow: string;
  /** Tier 2 — quiz form: "Speaking Quiz" / "Listening Quiz". */
  subtitle: string;
  /** 1-based position in the deck. */
  exampleNumber: number;
  quizLength: number;
}

/**
 * The progress block: two-tier quiz title (category eyebrow + form
 * subtitle — see `domain/functions/quizTitle`), the `12 / 20` counter, and
 * the 4px deck bar. Identical markup on mobile and desktop — the handoff
 * drops the text quiz's per-step rail and any back arrow (the mobile app
 * chrome already carries a "Setup" back control; there is nothing in this
 * header to gate it on).
 */
export function AudioQuizProgressHeader({
  eyebrow,
  subtitle,
  exampleNumber,
  quizLength,
}: AudioQuizProgressHeaderProps): JSX.Element {
  const percent =
    quizLength > 0 ? Math.min(100, (exampleNumber / quizLength) * 100) : 0;
  const position = `${exampleNumber} / ${quizLength}`;

  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <div className={styles.context}>
          <Eyebrow as="h2">{eyebrow}</Eyebrow>
          <p className={styles.title}>{subtitle}</p>
        </div>
        <span className={styles.position}>{position}</span>
      </div>

      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
