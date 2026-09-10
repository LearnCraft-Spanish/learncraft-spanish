import type { JSX } from 'react';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { Link } from 'react-router-dom';
import styles from './TextQuizEndV2.module.scss';

export interface TextQuizEndV2Props {
  isSrsQuiz: boolean;
  restartQuiz: () => void;
  returnToQuizSetup: () => void;
}

/**
 * Quiz-complete screen for text quizzes, redesigned to match the v2 visual
 * language (`AudioQuizEndV2` / `TextQuizV2` tokens). Distinct from the legacy
 * `TextQuizEnd` (untouched, still used by the v1 text quiz) — this is the v2
 * screen, gated behind `ui.student.textquiz.v2` same as `TextQuizV2`.
 *
 * Behavior matches legacy `TextQuizEnd`: SRS quizzes hide restart and show
 * due-for-review copy; non-SRS quizzes offer restart + return to setup.
 */
export function TextQuizEndV2({
  isSrsQuiz,
  restartQuiz,
  returnToQuizSetup,
}: TextQuizEndV2Props): JSX.Element {
  const { flashcardsDueForReview } = useStudentFlashcards();
  const dueCount = flashcardsDueForReview?.length ?? 0;
  const hasDueFlashcards = dueCount > 0;

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <Eyebrow as="h2">{isSrsQuiz ? 'SRS quiz' : 'Text quiz'}</Eyebrow>
        <p className={styles.heading}>
          {isSrsQuiz ? 'SRS Quiz Complete!' : 'Quiz Complete!'}
        </p>
        <p className={styles.body}>
          Congratulations! You've completed the quiz.
          {isSrsQuiz
            ? hasDueFlashcards
              ? ' Click "Return to Quiz Setup" to start a new SRS quiz.'
              : ' Come back tomorrow for another review!'
            : ' If you would like to retake the quiz, click "Restart Quiz".'}
        </p>
        {!isSrsQuiz && (
          <p className={styles.body}>
            If you would like to create a new quiz, click "Return to Quiz
            Setup".
          </p>
        )}

        {!isSrsQuiz && (
          <button
            type="button"
            className={styles.primary}
            onClick={restartQuiz}
          >
            Restart Quiz
          </button>
        )}
        <button
          type="button"
          className={isSrsQuiz ? styles.primary : styles.secondary}
          onClick={returnToQuizSetup}
        >
          Return to Quiz Setup
        </button>
        <Link className={styles.homeLink} to="/">
          Back to Home
        </Link>
      </div>

      {isSrsQuiz && hasDueFlashcards && (
        <div className={styles.navyCard}>
          <Eyebrow as="h2" tone="onDark">
            Still due for review
          </Eyebrow>
          <p className={styles.dueCount}>
            {dueCount} flashcard{dueCount === 1 ? '' : 's'}
          </p>
          <p className={styles.navyBody}>
            Click "Return to Quiz Setup" to start a new SRS quiz with the cards
            that are still due.
          </p>
        </div>
      )}

      {isSrsQuiz && !hasDueFlashcards && (
        <div className={styles.whiteCard}>
          <Eyebrow as="h2">All caught up</Eyebrow>
          <p className={styles.body}>
            You've completed all the flashcards that are due for review. Come
            back tomorrow for another review!
          </p>
        </div>
      )}
    </div>
  );
}
