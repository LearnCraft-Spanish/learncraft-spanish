import type { UseStudentFlashcardUpdatesReturn } from '@application/units/studentFlashcardUpdates';
import type { TextQuizReturn } from '@application/units/useTextQuiz';
import type { SrsDifficulty } from '@domain/srs';
import { MenuButton } from '@interface/components/general/Buttons';
import Loading from '@interface/components/Loading/Loading';
import {
  FlashcardDisplay,
  QuizButtons,
  QuizProgress,
} from '@interface/components/Quizzing/general';
import { SRSButtons } from '@interface/components/Quizzing/general/SRSButtons';
import TextQuizEnd from '@interface/components/Quizzing/general/TextQuizEnd';
import NoDueFlashcards from '@interface/components/Quizzing/TextQuiz/NoDueFlashcards';
import React, { useCallback, useEffect } from 'react';
import PMFPopup from 'src/components/PMFPopup/PMFPopup';

export interface TextQuizComponentProps {
  quizTitle?: string;
  useTextQuizReturn: TextQuizReturn;
  srsQuizProps?: UseStudentFlashcardUpdatesReturn;
}

/**
 * TextQuiz component
 * Note: This is the base level TextQuiz. It should not be used directly. Instead, use the RegularTextQuiz, ReviewMyFlashcardsTextQuiz, or SrsTextQuiz components.
 * @param props - props
 * @param props.useTextQuizReturn - The return object from the useTextQuiz hook
 * @param props.quizTitle - The title of the quiz (optional)
 * @param props.srsQuizProps - The return object from the useStudentFlashcardUpdates hook (optional)
 */
export function TextQuiz({
  useTextQuizReturn,
  quizTitle,
  srsQuizProps,
}: TextQuizComponentProps) {
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

    answerShowing,
    toggleAnswer,

    getHelpIsOpen,
    setGetHelpIsOpen,
  } = useTextQuizReturn;

  /*    Keyboard Controls       */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (isQuizComplete) return; // prevent keyboard controls when quiz is complete

      if (event.key === 'ArrowRight' || event.key === 'd') {
        nextExample();
      } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        previousExample();
      } else if (
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'w' ||
        event.key === 's'
      ) {
        event.preventDefault();
        toggleAnswer();
      }
    },
    [previousExample, nextExample, toggleAnswer, isQuizComplete],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  if (examplesAreLoading) {
    return <Loading message="Setting up Quiz..." />;
  }
  return (
    <>
      <PMFPopup
        timeToShowPopup={Math.floor(quizLength / 2) === exampleNumber}
      />
      {/* I believe 'NoDueFlashcards' is an artifact of the old quizzing system. nonetheless, we have nothing else to show if there is a quiz with no length, so we will leave it for now. */}
      {!quizLength && <NoDueFlashcards />}
      {!!quizLength &&
        (isQuizComplete ? (
          <TextQuizEnd
            isSrsQuiz={!!srsQuizProps}
            restartQuiz={restartQuiz}
            returnToQuizSetup={cleanupFunction}
          />
        ) : (
          <div className="quiz">
            {/* {srsQuizProps ? (
            <SRSQuizProgress
              quizTitle={quizTitle}
              totalExamplesNumber={quizLength}
            />
          ) : ( */}
            <QuizProgress
              quizTitle={quizTitle}
              currentExampleNumber={exampleNumber}
              totalExamplesNumber={quizLength}
            />
            {/* )} */}

            <FlashcardDisplay
              quizExample={quizExample}
              answerShowing={answerShowing}
              toggleAnswer={toggleAnswer}
              addPendingRemoveProps={addPendingRemoveProps}
              getHelpIsOpen={getHelpIsOpen}
              setGetHelpIsOpen={setGetHelpIsOpen}
            />
            <div className="quizButtons">
              {srsQuizProps && currentExample && (
                <SRSButtons
                  hasExampleBeenReviewed={srsQuizProps.hasExampleBeenReviewed(
                    currentExample.id,
                  )}
                  handleReviewExample={(difficulty: SrsDifficulty) =>
                    srsQuizProps.handleReviewExample(
                      currentExample.id,
                      difficulty,
                    )
                  }
                  answerShowing={answerShowing}
                  incrementExampleNumber={nextExample}
                />
              )}
              <QuizButtons
                decrementExample={previousExample}
                incrementExample={nextExample}
                firstExample={exampleNumber === 1}
                lastExample={exampleNumber === quizLength}
              />
              <div className="buttonBox">
                {/* if cleanupFunction is a function, show a back button */}
                {!!cleanupFunction && (
                  <button
                    type="button"
                    className="linkButton"
                    onClick={cleanupFunction}
                  >
                    Back
                  </button>
                )}

                <MenuButton />
              </div>
            </div>
          </div>
        ))}
    </>
  );
}
