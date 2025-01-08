import React, { useEffect, useState } from 'react';

import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import Loading from '../components/Loading';
import QuizComponent from '../components/Quizzing/TextQuiz/QuizComponent';
import AudioQuiz from '../components/Quizzing/AudioQuiz/AudioQuiz';
import { useActiveStudent } from '../hooks/useActiveStudent';
import { useStudentFlashcards } from '../hooks/useStudentFlashcards';
import { usePMFData } from '../hooks/usePMFData';
import QuizSetupMenu from '../components/Quizzing/TextQuiz/QuizSetupMenu';

export default function MyFlashcardsQuiz() {
  const { flashcardDataQuery } = useStudentFlashcards();
  const { activeStudentQuery } = useActiveStudent();
  const { pmfDataQuery } = usePMFData();

  const examplesToParse = flashcardDataQuery.data?.studentExamples;
  // Quiz Setup
  const [quizReady, setQuizReady] = useState<boolean>(false);
  const [quizType, setQuizType] = useState<'text' | 'audio'>('text');
  const [quizLength, setQuizLength] = useState<number>(10);
  const [customOnly, setCustomOnly] = useState<boolean>(false);
  const [isSrs, setIsSrs] = useState<boolean>(true);
  const [spanishFirst, setSpanishFirst] = useState<boolean>(false);
  const [audioOrComprehension, setAudioOrComprehension] = useState<
    'audio' | 'comprehension'
  >('audio');
  const [autoplay, setAutoplay] = useState(true);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setQuizReady(true);
    if (quizType === 'audio') {
      navigate('audio');
    } else {
      if (isSrs) {
        navigate('srsquiz');
      } else {
        navigate('quiz');
      }
    }
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
          handleSubmit={handleSubmit}
          quizType={quizType}
          setQuizType={setQuizType}
          quizLength={quizLength}
          setQuizLength={setQuizLength}
          customOnly={customOnly}
          setCustomOnly={setCustomOnly}
          isSrs={isSrs}
          setIsSrs={setIsSrs}
          spanishFirst={spanishFirst}
          setSpanishFirst={setSpanishFirst}
          autoplay={autoplay}
          setAutoplay={setAutoplay}
          audioOrComprehension={audioOrComprehension}
          setAudioOrComprehension={setAudioOrComprehension}
        />
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
                cleanupFunction={() => setQuizReady(false)}
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
                cleanupFunction={() => setQuizReady(false)}
                startWithSpanish={spanishFirst}
                quizLength={quizLength}
                isSrsQuiz={isSrs}
              />
            )
          }
        />
        <Route
          path="audio"
          element={
            flashcardDataQuery.data?.examples && (
              <AudioQuiz
                examplesToParse={flashcardDataQuery.data?.examples.filter(
                  (example) => example.englishAudio?.length,
                )}
                quizTitle={
                  audioOrComprehension === 'audio'
                    ? 'My Audio Quiz'
                    : 'My Comprehension Quiz'
                }
                autoplay={autoplay}
                audioOrComprehension={audioOrComprehension}
                cleanupFunction={() => setQuizReady(false)}
                quizLength={quizLength}
                myFlashcardsQuiz
              />
            )
          }
        />
      </Routes>
    </div>
  );
}
