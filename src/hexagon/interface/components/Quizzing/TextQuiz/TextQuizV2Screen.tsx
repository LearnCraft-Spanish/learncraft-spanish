import type { UseStudentFlashcardUpdatesReturn } from '@application/units/studentFlashcardUpdates';
import type { TextQuizReturn } from '@application/units/useTextQuiz';
import type { SrsDifficulty } from '@domain/srs';
import type { JSX } from 'react';
import { countSrsTallies } from '@domain/functions/srsTallies';
import Loading from '@interface/components/Loading/Loading';
import PMFPopup from '@interface/components/PMFPopup';
import NoDueFlashcards from '@interface/components/Quizzing/TextQuiz/NoDueFlashcards';
import { TextQuizEndV2 } from '@interface/components/textQuiz/TextQuizEndV2';
import { TextQuizV2 } from '@interface/components/textQuiz/TextQuizV2';
import { setMobileStackOverride } from '@interface/hooks/useMobileStackChrome';
import { useCallback, useEffect } from 'react';
import styles from './TextQuizV2Screen.module.scss';

export interface TextQuizV2ScreenProps {
  /** Desktop context tier 1, e.g. "Custom Quiz" / "My Flashcards Quiz" /
   * "Official Quizzes" — see `domain/functions/quizTitle`. */
  eyebrow?: string;
  /** Desktop context tier 2, e.g. "Text Quiz" or (Official) the course +
   * quiz number. */
  subtitle?: string;
  useTextQuizReturn: TextQuizReturn;
  srsQuizProps?: UseStudentFlashcardUpdatesReturn;
}

/**
 * Drop-in v2 replacement for `TextQuiz`, gated behind the student UI
 * version in `RegularTextQuiz`, `SrsTextQuiz`, and
 * `ReviewMyFlashcardsTextQuiz`. Same props, same loading / no-due / complete
 * states as the legacy screen — the active-card view is redesigned via
 * `TextQuizV2`, and the complete state via `TextQuizEndV2`.
 */
export function TextQuizV2Screen({
  useTextQuizReturn,
  eyebrow,
  subtitle,
  srsQuizProps,
}: TextQuizV2ScreenProps): JSX.Element {
  const {
    examplesAreLoading,
    exampleNumber,
    quizExample,
    quizLength,
    nextExample,
    previousExample,
    currentExample,
    addPendingRemoveProps,
    cleanupFunction,
    isQuizComplete,
    restartQuiz,
    vocabInfoHook,
    answerShowing,
    toggleAnswer,
    getHelpIsOpen,
    setGetHelpIsOpen,
  } = useTextQuizReturn;

  useEffect(() => {
    if (subtitle === undefined) {
      return undefined;
    }
    setMobileStackOverride({ title: subtitle, onBack: cleanupFunction });
    return () => setMobileStackOverride(null);
  }, [subtitle, cleanupFunction]);

  // Mirrors `SRSButtons.handleReviewAndIncrementExample`: grading and
  // advancing are one action in the v2 dock (button, swipe, or arrow key).
  const handleGrade = useCallback(
    (difficulty: SrsDifficulty) => {
      if (!srsQuizProps || !currentExample) {
        return;
      }
      srsQuizProps.handleReviewExample(currentExample.id, difficulty);
      nextExample();
    },
    [srsQuizProps, currentExample, nextExample],
  );

  if (examplesAreLoading) {
    return (
      <div className={styles.loadingRoot}>
        <Loading message="Setting up Quiz..." />
      </div>
    );
  }

  return (
    <>
      <PMFPopup
        timeToShowPopup={Math.floor(quizLength / 2) === exampleNumber}
      />
      {!quizLength && <NoDueFlashcards />}
      {!!quizLength &&
        (isQuizComplete ? (
          <TextQuizEndV2
            isSrsQuiz={!!srsQuizProps}
            restartQuiz={restartQuiz}
            returnToQuizSetup={cleanupFunction}
          />
        ) : (
          <TextQuizV2
            srs={!!srsQuizProps}
            eyebrow={eyebrow}
            subtitle={subtitle}
            exampleNumber={exampleNumber}
            quizLength={quizLength}
            quizExample={quizExample}
            answerShowing={answerShowing}
            toggleAnswer={toggleAnswer}
            getHelpIsOpen={getHelpIsOpen}
            setGetHelpIsOpen={setGetHelpIsOpen}
            vocabInfoHook={vocabInfoHook}
            addPendingRemoveProps={addPendingRemoveProps}
            onPrevious={previousExample}
            onNext={nextExample}
            onGrade={srsQuizProps ? handleGrade : undefined}
            tallies={
              srsQuizProps
                ? countSrsTallies(srsQuizProps.examplesReviewedResults)
                : undefined
            }
            onExit={cleanupFunction}
          />
        ))}
    </>
  );
}
