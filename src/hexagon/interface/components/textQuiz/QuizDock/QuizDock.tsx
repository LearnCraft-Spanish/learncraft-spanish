import type { SrsDifficulty } from '@domain/srs';
import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './QuizDock.module.scss';

interface QuizDockProps {
  srs: boolean;
  answerShowing: boolean;
  isFirst: boolean;
  /** Non-SRS only. Relabels Next as Finish on the last card. */
  isLast: boolean;
  onGrade: (difficulty: SrsDifficulty) => void;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * The fixed-height dock below the card. Three states: the prompt-side
 * outline, the SRS hard/easy pair, and the non-SRS previous/next pair. Hard,
 * easy, previous, and next are custom buttons rather than the shared
 * `Button` primitive — see the implementation report for why.
 */
export function QuizDock({
  srs,
  answerShowing,
  isFirst,
  isLast,
  onGrade,
  onPrevious,
  onNext,
}: QuizDockProps): JSX.Element {
  return (
    <div className={styles.root}>
      <div className={styles.slot}>
        {!answerShowing ? (
          <div className={styles.placeholder}>
            Flip the card to see the answer
          </div>
        ) : srs ? (
          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.hard}
              onClick={() => onGrade('hard')}
            >
              <Icon name="x" tone="inherit" />
              Hard
            </button>
            <button
              type="button"
              className={styles.easy}
              onClick={() => onGrade('easy')}
            >
              <Icon name="check" tone="inherit" />
              Easy
            </button>
          </div>
        ) : (
          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.previous}
              disabled={isFirst}
              onClick={onPrevious}
            >
              <Icon name="chevronLeft" tone="inherit" />
              Previous
            </button>
            <button type="button" className={styles.next} onClick={onNext}>
              {isLast ? 'Finish' : 'Next'}
              <Icon name="chevronRight" tone="inherit" />
            </button>
          </div>
        )}
      </div>

      {/* Reserved even on the prompt side so the dock's total height never
       * changes between faces — only its visibility toggles. */}
      {srs && (
        <p
          className={styles.swipeCaption}
          style={{ visibility: answerShowing ? 'visible' : 'hidden' }}
        >
          or swipe the card · left hard, right easy
        </p>
      )}
    </div>
  );
}
