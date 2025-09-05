import type {
  TextQuizReturn,
  UseSrsReturn,
} from '@application/units/useTextQuiz';
import { MenuButton } from '@interface/components/general/Buttons';
import React, { useCallback, useEffect, useState } from 'react';
import NoDueFlashcards from 'src/components/NoDueFlashcards';
import PMFPopup from 'src/components/PMFPopup/PMFPopup';
import { FlashcardDisplay, QuizButtons, QuizProgress } from '../general';
import { SRSButtons } from '../general/SRSButtons';

export interface TextQuizProps {
  quizTitle?: string;
  examples: ExampleWithVocabulary[];
  cleanupFunction?: () => void;
  srsQuizProps?: UseSrsReturn;
}

export function TextQuiz({
  quizTitle,
  examples,
  startWithSpanish = false,
  srsQuizProps,
  cleanupFunction,
}: TextQuizProps) {
  const {
    exampleNumber,
    quizExample,
    quizLength,
    nextExample,
    previousExample,
    addFlashcard,
    removeFlashcard,
    currentExample,
  } = textQuizHook;

  const [answerShowing, setAnswerShowing] = useState(false);

  const hideAnswer = useCallback(() => {
    setAnswerShowing(false);
  }, []);

  const incrementExample = useCallback(() => {
    nextExample();
    hideAnswer();
  }, [nextExample, hideAnswer]);

  const decrementExample = useCallback(() => {
    previousExample();
    hideAnswer();
  }, [previousExample, hideAnswer]);

  const toggleAnswer = useCallback(() => {
    setAnswerShowing(!answerShowing);
  }, [answerShowing]);

  /*    Keyboard Controls       */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
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
    [decrementExample, incrementExample, toggleAnswer],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <>
      <PMFPopup
        timeToShowPopup={Math.floor(quizLength / 2) === exampleNumber}
      />
      {/* I believe 'NoDueFlashcards' is an artifact of the old quizzing system. nonetheless, we have nothing else to show if there is a quiz with no length, so we will leave it for now. */}
      {!quizLength && <NoDueFlashcards />}
      {!!quizLength && (
        <div className="quiz">
          <QuizProgress
            quizTitle={quizTitle}
            currentExampleNumber={exampleNumber}
            totalExamplesNumber={quizLength}
          />

          <FlashcardDisplay
            quizExample={quizExample}
            addFlashcard={addFlashcard}
            removeFlashcard={removeFlashcard}
            answerShowing={answerShowing}
            toggleAnswer={toggleAnswer}
          />
          <div className="quizButtons">
            {srsQuizProps && currentExample && (
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
                  onClick={cleanupFunction}
                >
                  Back
                </button>
              )}

              <MenuButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
