import type { TextQuizReturn } from 'src/hexagon/application/units/useTextQuiz';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MenuButton from 'src/components/Buttons/MenuButton';
import NoDueFlashcards from 'src/components/NoDueFlashcards';
import PMFPopup from 'src/components/PMFPopup/PMFPopup';
import QuizProgress from '../QuizProgress';
import FlashcardDisplay from './FlashcardDisplay';
import QuizButtons from './QuizButtons';

interface QuizComponentProps {
  hook: TextQuizReturn;
  cleanupFunction?: () => void;
}

export default function QuizComponent({
  hook,
  cleanupFunction,
}: QuizComponentProps) {
  const {
    exampleNumber,
    quizExample,
    quizLength,
    nextExample,
    previousExample,
    addFlashcard,
    removeFlashcard,
  } = hook;

  const location = useLocation();
  const isMainLocation = location.pathname.split('/').length < 2;

  const [answerShowing, setAnswerShowing] = useState(false);
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  function hideAnswer() {
    setAnswerShowing(false);
  }

  function incrementExample() {
    nextExample();
    hideAnswer();
  }

  function decrementExample() {
    previousExample();
    hideAnswer();
  }

  const toggleAnswer = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.currentTime = 0;
    }
    setPlaying(false);
    setAnswerShowing(!answerShowing);
  }, [answerShowing]);

  const playCurrentAudio = useCallback(() => {
    if (currentAudio.current?.duration) {
      currentAudio.current.play();
      setPlaying(true);
    }
  }, [currentAudio]);

  const pauseCurrentAudio = useCallback(() => {
    if (currentAudio.current?.duration) {
      currentAudio.current.pause();
      setPlaying(false);
    }
  }, [currentAudio]);

  const togglePlaying = useCallback(() => {
    if (!quizExample.question.audioUrl || !quizExample.answer.audioUrl) {
      return;
    }
    if (playing) {
      pauseCurrentAudio();
    } else {
      playCurrentAudio();
    }
  }, [
    quizExample.question.audioUrl,
    quizExample.answer.audioUrl,
    playing,
    pauseCurrentAudio,
    playCurrentAudio,
  ]);

  /*    Keyboard Controls       */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
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
      } else if (event.key === ' ') {
        event.preventDefault();
        togglePlaying();
      }
    },
    [nextExample, previousExample, toggleAnswer, togglePlaying],
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
      {!quizLength && <NoDueFlashcards />}
      {!!quizLength && (
        <div className="quiz">
          <QuizProgress
            currentExampleNumber={exampleNumber}
            totalExamplesNumber={quizLength}
          />
          {answerShowing
            ? quizExample.answer.audioUrl
            : quizExample.question.audioUrl}

          <FlashcardDisplay
            quizExample={quizExample}
            addFlashcard={addFlashcard}
            removeFlashcard={removeFlashcard}
            answerShowing={answerShowing}
            toggleAnswer={toggleAnswer}
            togglePlaying={togglePlaying}
            playing={playing}
          />
          <div className="quizButtons">
            {/* TODO: Add SRS buttons */}
            {/*srsQuiz && (
              <SRSQuizButtons
                currentExample={quizExample}
                answerShowing={answerShowing}
                incrementExampleNumber={nextExample}
              />
            )*/}
            <QuizButtons
              decrementExample={decrementExample}
              incrementExample={incrementExample}
              firstExample={exampleNumber === 1}
              lastExample={exampleNumber === quizLength}
            />
            <div className="buttonBox">
              {!isMainLocation && (
                <Link className="linkButton" to=".." onClick={cleanupFunction}>
                  Back
                </Link>
              )}
              <MenuButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
