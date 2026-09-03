import type { UseStudentFlashcardUpdatesReturn } from '@application/units/studentFlashcardUpdates';
import type { TextQuizReturn } from '@application/units/useTextQuiz';
import type { SrsDifficulty } from '@domain/srs';
import type { JSX } from 'react';
import { countSrsTallies } from '@domain/functions/srsTallies';
import Loading from '@interface/components/Loading/Loading';
import PMFPopup from '@interface/components/PMFPopup';
import TextQuizEnd from '@interface/components/Quizzing/general/TextQuizEnd';
import NoDueFlashcards from '@interface/components/Quizzing/TextQuiz/NoDueFlashcards';
import { TextQuizV2 } from '@interface/components/textQuiz/TextQuizV2';
import { setQuizActive } from '@interface/hooks/useQuizChrome';
import { useCallback, useEffect } from 'react';

export interface TextQuizV2ScreenProps {
  quizTitle?: string;
  useTextQuizReturn: TextQuizReturn;
  srsQuizProps?: UseStudentFlashcardUpdatesReturn;
}

/**
 * Drop-in v2 replacement for `TextQuiz`, gated behind
 * `ui.student.textquiz.v2` in `RegularTextQuiz`, `SrsTextQuiz`, and
 * `ReviewMyFlashcardsTextQuiz`. Same props, same loading / no-due / complete
 * states as the legacy screen — only the active-card view is redesigned,
 * via `TextQuizV2`.
 */
export function TextQuizV2Screen({
  useTextQuizReturn,
  quizTitle,
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

  const quizCardActive = !examplesAreLoading && !!quizLength && !isQuizComplete;

  useEffect(() => {
    setQuizActive(quizCardActive);
    return () => setQuizActive(false);
  }, [quizCardActive]);

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
    return <Loading message="Setting up Quiz..." />;
  }

  return (
    <>
      <PMFPopup
        timeToShowPopup={Math.floor(quizLength / 2) === exampleNumber}
      />
      {!quizLength && <NoDueFlashcards />}
      {!!quizLength &&
        (isQuizComplete ? (
          <TextQuizEnd
            isSrsQuiz={!!srsQuizProps}
            restartQuiz={restartQuiz}
            returnToQuizSetup={cleanupFunction}
          />
        ) : (
          <TextQuizV2
            srs={!!srsQuizProps}
            quizTitle={quizTitle}
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
