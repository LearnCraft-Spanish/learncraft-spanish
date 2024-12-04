import type { FormEvent } from 'react';
import React, { useEffect, useMemo, useState } from 'react';

import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import MenuButton from './components/Buttons/MenuButton';
import Loading from './components/Loading';
import QuizComponent from './components/Quiz/QuizComponent';
import AudioBasedReviewCopy from './components/Quiz/AudioBasedReviewCopy';
import { useActiveStudent } from './hooks/useActiveStudent';
import { useStudentFlashcards } from './hooks/useStudentFlashcards';
import { usePMFData } from './hooks/usePMFData';
import QuizSetupMenu from './components/Quiz/QuizSetupMenu';

export default function MyFlashcardsQuiz() {
  const { flashcardDataQuery } = useStudentFlashcards();
  const { activeStudentQuery } = useActiveStudent();
  const { pmfDataQuery } = usePMFData();
  const [isSrs, setIsSrs] = useState<boolean>(false);
  const [spanishFirst, setSpanishFirst] = useState<boolean>(false);
  const [customOnly, setCustomOnly] = useState<boolean>(false);
  const [quizLength, setQuizLength] = useState<number>(10);
  const [quizReady, setQuizReady] = useState<boolean>(false);

  const [quizType, setQuizType] = useState<'standard' | 'audio'>('standard');
  const [audioOrComprehension, setAudioOrComprehension] = useState<
    'audio' | 'comprehension'
  >('audio');
  const [autoplay, setAutoplay] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const dataReady =
    activeStudentQuery.isSuccess && flashcardDataQuery.isSuccess;
  const dataError =
    !dataReady && (activeStudentQuery.isError || flashcardDataQuery.isError);
  const dataLoading =
    !dataReady &&
    !dataError &&
    (activeStudentQuery.isLoading ||
      flashcardDataQuery.isLoading ||
      pmfDataQuery.isLoading);
  const unavailable =
    (activeStudentQuery.isSuccess &&
      !(activeStudentQuery.data?.role === 'student')) ||
    (flashcardDataQuery.isSuccess &&
      !flashcardDataQuery.data?.examples?.length);

  const [examplesToParse, setExamplesToParse] = useState(
    flashcardDataQuery.data?.studentExamples,
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setQuizReady(true);

    if (isSrs) {
      navigate('srsquiz');
    } else if (quizType === 'audio') {
      navigate('audio');
    } else {
      navigate('quiz');
    }
  }

  function makeQuizUnready() {
    setQuizReady(false);
  }

  useEffect(() => {
    if (location.pathname !== '/myflashcards') {
      setQuizReady(true);
    }
  }, [location.pathname]);

  return (
    <div>
      {dataError && <h2>Error Loading Flashcards</h2>}
      {dataLoading && <Loading message="Loading Flashcard Data..." />}
      {unavailable && <Navigate to="/" />}
      {!quizReady && dataReady && (
        <QuizSetupMenu
          examplesToParse={examplesToParse}
          setExamplesToParse={setExamplesToParse}
          isSrs={isSrs}
          setIsSrs={setIsSrs}
          spanishFirst={spanishFirst}
          setSpanishFirst={setSpanishFirst}
          customOnly={customOnly}
          setCustomOnly={setCustomOnly}
          quizLength={quizLength}
          setQuizLength={setQuizLength}
          handleSubmit={handleSubmit}
          quizType={quizType}
          setQuizType={setQuizType}
          autoplay={autoplay}
          setAutoplay={setAutoplay}
          audioOrComprehension={audioOrComprehension}
          setAudioOrComprehension={setAudioOrComprehension}
        />
        // setup menu component goes here
      )}
      <Routes>
        <Route
          path="quiz"
          element={
            flashcardDataQuery.data?.examples && (
              <QuizComponent
                examplesToParse={flashcardDataQuery.data?.examples}
                quizTitle="My Flashcards"
                quizOnlyCollectedExamples
                quizOnlyCustomExamples={customOnly}
                cleanupFunction={() => makeQuizUnready()}
                startWithSpanish={spanishFirst}
                quizLength={quizLength}
              />
            )
          }
        />
        <Route
          path="srsquiz"
          element={
            flashcardDataQuery.data?.examples && (
              <QuizComponent
                examplesToParse={flashcardDataQuery.data?.examples}
                quizTitle="My Flashcards for Today"
                quizOnlyCollectedExamples
                quizOnlyCustomExamples={customOnly}
                cleanupFunction={() => makeQuizUnready()}
                startWithSpanish={spanishFirst}
                quizLength={quizLength}
                isSrsQuiz
              />
            )
          }
        />
        <Route
          path="audio"
          element={
            flashcardDataQuery.data?.examples && (
              <AudioBasedReviewCopy
                examplesToParse={flashcardDataQuery.data?.examples.filter(
                  (example) => example.englishAudio?.length,
                )}
                autoplay={autoplay}
                audioOrComprehension={audioOrComprehension}
                cleanupFunction={() => makeQuizUnready()}
                quizLength={quizLength}
              />
            )
          }
        />
      </Routes>
    </div>
  );
}
