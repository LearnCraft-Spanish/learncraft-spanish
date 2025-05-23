import type { DisplayOrder, Flashcard } from 'src/types/interfaceDefinitions';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import MenuButton from 'src/components/Buttons/MenuButton';
import NoDueFlashcards from 'src/components/NoDueFlashcards';
import PMFPopup from 'src/components/PMFPopup/PMFPopup';
import { fisherYatesShuffle } from 'src/functions/fisherYatesShuffle';
import { useActiveStudent } from 'src/hooks/UserData/useActiveStudent';
import { useStudentFlashcards } from 'src/hooks/UserData/useStudentFlashcards';
import QuizProgress from '../QuizProgress';
import FlashcardDisplay from './FlashcardDisplay';
import QuizButtons from './QuizButtons';
import SRSQuizButtons from './SRSButtons';

interface QuizComponentProps {
  quizTitle: string;
  examplesToParse: readonly Flashcard[];
  startWithSpanish?: boolean;
  quizOnlyCollectedExamples?: boolean;
  quizOnlyCustomExamples?: boolean;
  isSrsQuiz?: boolean;
  cleanupFunction?: () => void;
  quizLength?: number;
}

export default function QuizComponent({
  quizTitle,
  examplesToParse,
  startWithSpanish = false,
  quizOnlyCollectedExamples = false,
  isSrsQuiz = false,
  quizOnlyCustomExamples = false,
  cleanupFunction,
  quizLength = 100,
}: QuizComponentProps) {
  const location = useLocation();
  const { activeStudentQuery } = useActiveStudent();
  const { flashcardDataQuery, exampleIsCollected, exampleIsCustom } =
    useStudentFlashcards();

  // Orders the examples from the quiz-examples set, examples refer to the data itself.
  const initialDisplayOrder = useRef<DisplayOrder[]>([]);
  const [displayOrder, setDisplayOrder] = useState<DisplayOrder[]>([]);
  const [displayOrderReady, setDisplayOrderReady] = useState(false);

  // Interactive states within the Quiz
  const [answerShowing, setAnswerShowing] = useState(false);
  const [currentExampleNumber, setCurrentExampleNumber] = useState(1);
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  // currentExample should never be undefined... how to prevent?
  const currentExample = examplesToParse.find((example) => {
    const currentRecordId = displayOrder[currentExampleNumber - 1]?.recordId;
    const exampleRecordId = example.recordId;
    return currentRecordId === exampleRecordId;
  });

  // will need to second pass these variables:
  const spanishShowing = startWithSpanish !== answerShowing;

  const isMainLocation = location.pathname.split('/').length < 2;

  function hideAnswer() {
    setAnswerShowing(false);
  }

  const toggleAnswer = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.currentTime = 0;
    }
    setPlaying(false);
    setAnswerShowing(!answerShowing);
  }, [answerShowing]);

  /*      Audio Component Section       */

  const spanishAudioUrl = currentExample?.spanishAudioLa || undefined;
  const englishAudioUrl = currentExample?.englishAudio || undefined;

  const activeAudio: string | undefined = spanishShowing
    ? spanishAudioUrl
    : englishAudioUrl;

  function spanishAudio() {
    return (
      spanishAudioUrl && (
        <audio
          ref={currentAudio}
          src={spanishAudioUrl}
          onEnded={() => setPlaying(false)}
        />
      )
    );
  }

  function englishAudio() {
    return (
      englishAudioUrl && (
        <audio
          ref={currentAudio}
          src={englishAudioUrl}
          onEnded={() => setPlaying(false)}
        />
      )
    );
  }

  const questionAudio = startWithSpanish ? spanishAudio : englishAudio;
  const answerAudio = startWithSpanish ? englishAudio : spanishAudio;

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
    if (!(spanishAudioUrl || englishAudioUrl)) {
      return;
    }
    if (playing) {
      pauseCurrentAudio();
    } else {
      playCurrentAudio();
    }
  }, [
    spanishAudioUrl,
    englishAudioUrl,
    playing,
    pauseCurrentAudio,
    playCurrentAudio,
  ]);

  /*     Increment/Decrement Through Examples       */
  const incrementExampleNumber = useCallback(() => {
    if (currentExampleNumber < displayOrder.length) {
      const newExampleNumber = currentExampleNumber + 1;
      setCurrentExampleNumber(newExampleNumber);
    } else {
      setCurrentExampleNumber(displayOrder.length);
    }
    hideAnswer();
    setPlaying(false);
  }, [currentExampleNumber, displayOrder]);

  const decrementExampleNumber = useCallback(() => {
    if (currentExampleNumber > 1) {
      setCurrentExampleNumber(currentExampleNumber - 1);
    } else {
      setCurrentExampleNumber(1);
    }
    hideAnswer();
    setPlaying(false);
  }, [currentExampleNumber]);

  function onRemove() {
    if (quizOnlyCollectedExamples || isSrsQuiz) {
      const quizLength = displayOrder.length;
      if (currentExampleNumber >= quizLength) {
        setCurrentExampleNumber(quizLength - 1);
      }
    } else {
      incrementExampleNumber();
    }
  }

  // Filter for reviewing only "My Flashcards"
  const filterIfCollectedOnly = useCallback(
    (displayOrderArray: DisplayOrder[]) => {
      if (quizOnlyCollectedExamples || isSrsQuiz) {
        const filteredList = displayOrderArray.filter((item) =>
          exampleIsCollected(item.recordId),
        );
        return filteredList;
      } else {
        return displayOrderArray;
      }
    },
    [quizOnlyCollectedExamples, isSrsQuiz, exampleIsCollected],
  );

  const filterIfCustomOnly = useCallback(
    (displayOrderArray: DisplayOrder[]) => {
      if (quizOnlyCustomExamples) {
        const filteredList = displayOrderArray.filter((item) =>
          exampleIsCustom(item.recordId),
        );
        return filteredList;
      } else {
        return displayOrderArray;
      }
    },
    [quizOnlyCustomExamples, exampleIsCustom],
  );

  // Further filter for only SRS examples
  const getStudentExampleFromExampleId = useCallback(
    (exampleId: number) => {
      // Foreign Key lookup, form data in backend
      const relatedStudentExample =
        flashcardDataQuery.data?.studentExamples.find(
          (element) => element.relatedExample === exampleId,
        );
      return relatedStudentExample;
    },
    [flashcardDataQuery.data?.studentExamples],
  );

  const getDueDateFromExampleId = useCallback(
    (exampleId: number) => {
      const relatedStudentExample = getStudentExampleFromExampleId(exampleId);
      if (!relatedStudentExample) {
        return '';
      }
      const dueDate = relatedStudentExample.nextReviewDate;
      return dueDate;
    },
    [getStudentExampleFromExampleId],
  );

  const filterByDueExamples = useCallback(
    (displayOrder: DisplayOrder[]) => {
      if (!isSrsQuiz) {
        return displayOrder;
      }
      if (!flashcardDataQuery.data) {
        return [];
      }
      const isBeforeToday = (dateArg: string) => {
        const today = new Date();
        const reviewDate = new Date(dateArg);
        if (reviewDate >= today) {
          return false;
        }
        return true;
      };

      const newDisplayOrder = displayOrder.filter((displayOrder) =>
        isBeforeToday(getDueDateFromExampleId(displayOrder.recordId)),
      );
      return newDisplayOrder;
    },
    [getDueDateFromExampleId, isSrsQuiz, flashcardDataQuery.data],
  );

  const currentFlashcardIsValid = currentExample !== undefined;

  // Randomizes the order of the quiz examples for display
  // Runs only once to prevent re-scrambling while in use. Mutations handled elsewhere.
  useEffect(() => {
    if (examplesToParse.length > 0 && !displayOrderReady && quizLength) {
      // Create a basic map of the flashcard objects with recordId and isCollected properties

      const exampleOrder: DisplayOrder[] = examplesToParse.map((example) => {
        return {
          recordId: example.recordId,
        };
      });

      // Randomize the order of the examples
      const shuffledOrder = fisherYatesShuffle(exampleOrder);

      // If collectedOnly or SRS, filter out uncollected examples
      const filteredByCollected = filterIfCollectedOnly(shuffledOrder);

      // If SRS, filter out examples not due for review
      const filteredByDueDate = filterByDueExamples(filteredByCollected);

      // If customOnly, filter out non-custom examples
      const filteredByCustom = filterIfCustomOnly(filteredByDueDate);

      // Limit the number of examples to the quizLength
      const limitedOrder = filteredByCustom.slice(0, quizLength);

      // Display the limited order if any are left
      if (limitedOrder.length > 0) {
        initialDisplayOrder.current = limitedOrder;
        setDisplayOrderReady(true);
      }
    }
  }, [
    examplesToParse,
    displayOrderReady,
    quizLength,
    filterIfCollectedOnly,
    filterIfCustomOnly,
    filterByDueExamples,
  ]);

  // Defines the actual list of items displayed as a mutable subset of the previous
  useEffect(() => {
    const filteredByCollected = filterIfCollectedOnly(
      initialDisplayOrder.current,
    );
    setDisplayOrder(filteredByCollected);
  }, [filterIfCollectedOnly]);

  /*    Keyboard Controls       */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'd') {
        incrementExampleNumber();
      } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        decrementExampleNumber();
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
    [
      incrementExampleNumber,
      decrementExampleNumber,
      toggleAnswer,
      togglePlaying,
    ],
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
        timeToShowPopup={
          Math.floor(displayOrder.length / 2) === currentExampleNumber
        }
      />
      {displayOrderReady &&
        !!initialDisplayOrder.current.length &&
        !displayOrder.length && <Navigate to=".." />}
      {!displayOrder.length && !!examplesToParse.length && isSrsQuiz && (
        <NoDueFlashcards />
      )}
      {!!displayOrder.length && (
        <div className="quiz">
          <QuizProgress
            currentExampleNumber={currentExampleNumber}
            totalExamplesNumber={displayOrder.length}
            quizTitle={quizTitle}
          />
          {answerShowing ? answerAudio() : questionAudio()}
          {currentFlashcardIsValid && (
            <FlashcardDisplay
              example={currentExample}
              isStudent={activeStudentQuery.data?.role === 'student'}
              incrementExampleNumber={incrementExampleNumber}
              onRemove={onRemove}
              answerShowing={answerShowing}
              toggleAnswer={toggleAnswer}
              togglePlaying={togglePlaying}
              playing={playing}
              audioActive={activeAudio}
              startWithSpanish={startWithSpanish}
            />
          )}
          <div className="quizButtons">
            {isSrsQuiz && currentFlashcardIsValid && (
              <SRSQuizButtons
                currentExample={currentExample}
                answerShowing={answerShowing}
                incrementExampleNumber={incrementExampleNumber}
              />
            )}
            <QuizButtons
              decrementExample={decrementExampleNumber}
              incrementExample={incrementExampleNumber}
              firstExample={currentExampleNumber === 1}
              lastExample={currentExampleNumber === displayOrder.length}
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
