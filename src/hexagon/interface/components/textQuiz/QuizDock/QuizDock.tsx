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
 * The dock below the card. Previous/Next stay on both faces. On an SRS quiz
 * the prompt-side placeholder holds the same row Hard/Easy take on the
 * answer side, directly above Previous/Next, so grading does not shift the
 * card or the nav row. Hard, easy, previous, and next are custom buttons
 * rather than the shared `Button` primitive — see the implementation report
 * for why.
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
  const nextLabel = !srs && isLast ? 'Finish' : 'Next';

  return (
    <div className={styles.root}>
      {srs && (
        <div className={styles.slot}>
          {!answerShowing ? (
            <div className={styles.placeholder}>
              Flip the card to see the answer
            </div>
          ) : (
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
          )}
        </div>
      )}

      <div className={styles.slot}>
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
            {nextLabel}
            <Icon name="chevronRight" tone="inherit" />
          </button>
        </div>
      </div>
    </div>
  );
}
