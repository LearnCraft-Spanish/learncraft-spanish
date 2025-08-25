import { useStudentFlashcards } from '@application/units/useStudentFlashcards';

import { useQuizMyFlashcards } from '@application/useCases/useQuizMyFlashcards';
import QuizSetupMenu from '@interface/components/QuizSetupMenu';
import { Route, Routes } from 'react-router-dom';
import { Loading } from 'src/components/Loading';
import NoFlashcards from 'src/components/NoFlashcards';
import AudioQuiz from 'src/components/Quizzing/AudioQuiz/AudioQuiz';

import QuizComponent from 'src/components/Quizzing/TextQuiz/QuizComponent';
export default function MyFlashcardsQuiz() {
  const {
    quizLength,
    updateQuizLength,
    quizSetupOptions,
    showQuiz,
    hideQuiz,
    // textQuiz,
    setupQuiz,
    isLoading,
    error,
  } = useQuizMyFlashcards();

  const { audioQuizVariant, autoplay } = quizSetupOptions;

  const { flashcards } = useStudentFlashcards();

  return (
    <div>
      {!!error && <h2>Error Loading Flashcards</h2>}
      {isLoading && <Loading message="Loading Flashcard Data..." />}
      {quizLength === 0 && <NoFlashcards />}
      {!showQuiz && <QuizSetupMenu options={quizSetupOptions} />}
      <Routes>
        <Route
          path="quiz"
          element={flashcards && <QuizComponent hook={textQuiz} />}
        />
        <Route
          path="srsquiz"
          element={
            flashcards && (
              <QuizComponent hook={textQuiz} cleanupFunction={hideQuiz} />
            )
          }
        />
        <Route
          path="audio"
          element={
            flashcards && (
              <AudioQuiz
                examplesToParse={flashcards.filter(
                  (example) => example.example.englishAudio?.length,
                )}
                quizTitle={
                  audioQuizVariant === 'speaking'
                    ? 'My Speaking Quiz'
                    : 'My Listening Quiz'
                }
                autoplay={autoplay}
                audioOrComprehension={audioQuizVariant}
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
