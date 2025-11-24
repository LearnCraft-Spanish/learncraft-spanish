import type {
  UseSrsReturn,
  UseTextQuizProps,
} from '@application/units/useTextQuiz';
import { useTextQuiz } from '@application/units/useTextQuiz';
import { MenuButton } from '@interface/components/general/Buttons';
import Loading from '@interface/components/Loading/Loading';
import {
  FlashcardDisplay,
  QuizButtons,
  QuizProgress,
} from '@interface/components/Quizzing/general';
import { SRSButtons } from '@interface/components/Quizzing/general/SRSButtons';
import TextQuizEnd from '@interface/components/Quizzing/general/TextQuizEnd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import NoDueFlashcards from 'src/components/NoDueFlashcards';
import PMFPopup from 'src/components/PMFPopup/PMFPopup';

export interface TextQuizComponentProps {
  quizTitle?: string;
  textQuizProps: UseTextQuizProps;
  srsQuizProps?: UseSrsReturn;
  showSrsButtons?: boolean;
}

export function TextQuiz({
  quizTitle,
  textQuizProps,
  srsQuizProps,
  showSrsButtons = true,
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
  } = useTextQuiz(textQuizProps);

  const [getHelpIsOpen, setGetHelpIsOpen] = useState(false);

  const [answerShowing, setAnswerShowing] = useState(false);

  const hideAnswer = useCallback(() => {
    setAnswerShowing(false);
  }, []);

  const incrementExample = useCallback(() => {
    // If SRS quiz and current example hasn't been reviewed, mark as viewed
    if (srsQuizProps && currentExample) {
      const hasBeenReviewed = srsQuizProps.hasExampleBeenReviewed(
        currentExample.id,
      );
      if (!hasBeenReviewed) {
        srsQuizProps.handleReviewExample(currentExample.id, 'viewed');
      }
    }
    nextExample();
    hideAnswer();
    setGetHelpIsOpen(false);
  }, [nextExample, hideAnswer, srsQuizProps, currentExample]);

  const decrementExample = useCallback(() => {
    previousExample();
    hideAnswer();
    setGetHelpIsOpen(false);
  }, [previousExample, hideAnswer]);

  const toggleAnswer = useCallback(() => {
    setAnswerShowing(!answerShowing);
  }, [answerShowing]);

  // Enhanced cleanup function that flushes SRS batch before cleanup
  const enhancedCleanupFunction = useCallback(async () => {
    if (srsQuizProps?.flushBatch) {
      await srsQuizProps.flushBatch();
    }
    if (cleanupFunction) {
      cleanupFunction();
    }
  }, [srsQuizProps, cleanupFunction]);

  // Store srsQuizProps in a ref to avoid recreating the effect
  const srsQuizPropsRef = useRef(srsQuizProps);
  srsQuizPropsRef.current = srsQuizProps;

  // Flush batch when quiz completes
  useEffect(() => {
    if (isQuizComplete && srsQuizPropsRef.current?.flushBatch) {
      void srsQuizPropsRef.current.flushBatch();
    }
  }, [isQuizComplete]); // Only depend on isQuizComplete

  /*    Keyboard Controls       */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (isQuizComplete) return; // prevent keyboard controls when quiz is complete

      if (event.key === 'ArrowRight' || event.key === 'd') {
        incrementExample();
      } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        decrementExample();
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
    [decrementExample, incrementExample, toggleAnswer, isQuizComplete],
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
            returnToQuizSetup={() => {
              void enhancedCleanupFunction();
            }}
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
              {srsQuizProps && currentExample && showSrsButtons && (
                <SRSButtons
                  hasExampleBeenReviewed={srsQuizProps.hasExampleBeenReviewed(
                    currentExample.id,
                  )}
                  handleReviewExample={(difficulty: 'easy' | 'hard') =>
                    srsQuizProps.handleReviewExample(
                      currentExample.id,
                      difficulty,
                    )
                  }
                  isExampleReviewPending={srsQuizProps.isExampleReviewPending(
                    currentExample.id,
                  )}
                  answerShowing={answerShowing}
                  incrementExampleNumber={incrementExample}
                />
              )}
              <QuizButtons
                decrementExample={decrementExample}
                incrementExample={incrementExample}
                firstExample={exampleNumber === 1}
                lastExample={exampleNumber === quizLength}
              />
              <div className="buttonBox">
                {/* if cleanupFunction is a function, show a back button */}
                {!!cleanupFunction && (
                  <button
                    type="button"
                    className="linkButton"
                    onClick={() => {
                      void enhancedCleanupFunction();
                    }}
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
