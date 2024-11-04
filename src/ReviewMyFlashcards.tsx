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
import { useActiveStudent } from './hooks/useActiveStudent';
import { useStudentFlashcards } from './hooks/useStudentFlashcards';

export default function MyFlashcardsQuiz() {
  const { flashcardDataQuery } = useStudentFlashcards();
  const { activeStudentQuery } = useActiveStudent();
  const [isSrs, setIsSrs] = useState<boolean>(false);
  const [spanishFirst, setSpanishFirst] = useState<boolean>(false);
  const [customOnly, setCustomOnly] = useState<boolean>(false);
  const [quizLength, setQuizLength] = useState<number>(10);
  const [quizReady, setQuizReady] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  const dataReady =
    activeStudentQuery.isSuccess && flashcardDataQuery.isSuccess;
  const dataError =
    !dataReady && (activeStudentQuery.isError || flashcardDataQuery.isError);
  const dataLoading =
    !dataReady &&
    !dataError &&
    (activeStudentQuery.isLoading || flashcardDataQuery.isLoading);
  const unavailable =
    (activeStudentQuery.isSuccess &&
      !(activeStudentQuery.data?.role === 'student')) ||
    (flashcardDataQuery.isSuccess &&
      !flashcardDataQuery.data?.examples?.length);

  function handleSumbit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setQuizReady(true);

    if (isSrs) {
      navigate('srsquiz');
    } else {
      navigate('quiz');
    }
  }

  function calculateQuizLengthOptions() {
    let currentAllowedExamples = flashcardDataQuery.data?.studentExamples;
    if (isSrs) {
      currentAllowedExamples = currentAllowedExamples?.filter(
        (studentExample) =>
          studentExample.nextReviewDate
            ? new Date(studentExample.nextReviewDate) <= new Date()
            : true,
      );
    }
    if (customOnly) {
      currentAllowedExamples = flashcardDataQuery.data?.studentExamples?.filter(
        (studentExample) => studentExample.coachAdded,
      );
    }
    if (!currentAllowedExamples?.length) {
      return [0];
    }
    const exampleCount = currentAllowedExamples.length;
    const quizLengthOptions = [];
    if (currentAllowedExamples?.length > 10) {
      for (let i = 10; i < exampleCount; i = 5 * Math.floor(i * 0.315)) {
        quizLengthOptions.push(i);
      }
    }
    quizLengthOptions.push(exampleCount);
    return quizLengthOptions;
  }

  const hasCustomExamples = useMemo(() => {
    return flashcardDataQuery.data?.studentExamples?.some(
      (studentExample) => studentExample?.coachAdded,
    );
  }, [flashcardDataQuery.data?.studentExamples]);

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
        <form className="myFlashcardsForm" onSubmit={(e) => handleSumbit(e)}>
          <div className="myFlashcardsFormContentWrapper">
            <h3>Review My Flashcards</h3>
            <div>
              <p>SRS Quiz:</p>
              <label htmlFor="isSrs" className="switch">
                <input
                  type="checkbox"
                  name="Srs"
                  id="isSrs"
                  checked={isSrs}
                  onChange={(e) => setIsSrs(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div>
              <p>Start with Spanish:</p>
              <label htmlFor="spanishFirst" className="switch">
                <input
                  type="checkbox"
                  name="Spanish First"
                  id="spanishFirst"
                  checked={spanishFirst}
                  onChange={(e) => setSpanishFirst(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            {hasCustomExamples && (
              <div>
                <p>Custom Only:</p>
                <label htmlFor="customOnly" className="switch">
                  <input
                    type="checkbox"
                    name="Custom Only"
                    id="customOnly"
                    checked={customOnly}
                    onChange={(e) => setCustomOnly(e.target.checked)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            )}
            <label htmlFor="quizLength">
              <p>Number of Flashcards:</p>
              <select
                name="length"
                id="quizLength"
                onChange={(e) => setQuizLength(Number.parseInt(e.target.value))}
                defaultValue={quizLength}
              >
                {calculateQuizLengthOptions().map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="buttonBox">
            <button
              type="submit"
              disabled={calculateQuizLengthOptions()[0] === 0}
            >
              Start Quiz
            </button>
          </div>
          <div className="buttonBox">
            <MenuButton />
          </div>
        </form>
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
      </Routes>
    </div>
  );
}
