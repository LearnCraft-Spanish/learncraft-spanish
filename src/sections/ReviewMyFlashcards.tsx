import { useQuizMyFlashcards } from '@application/useCases/useQuizMyFlashcards';

import { Loading } from 'src/components/Loading';
import NoFlashcards from 'src/components/NoFlashcards';
import AudioQuiz from 'src/components/Quizzing/AudioQuiz/AudioQuiz';
import QuizComponent from 'src/components/Quizzing/TextQuiz/QuizComponent';
import QuizSetupMenu from 'src/components/Quizzing/TextQuiz/QuizSetupMenu';

export default function MyFlashcardsQuiz() {
  const {
    quizLength,
    updateQuizLength,
    quizSetupOptions,
    showQuiz,
    hideQuiz,
    textQuiz,
    setupQuiz,
    isLoading,
    error,
  } = useQuizMyFlashcards();

  return (
    <div>
      {!!error && <h2>Error Loading Flashcards</h2>}
      {isLoading && <Loading message="Loading Flashcard Data..." />}
      {textQuiz.quizLength === 0 && <NoFlashcards />}
      {!showQuiz && <QuizSetupMenu options={quizSetupOptions} />}
      <Routes>
        <Route
          path="quiz"
          element={
            flashcardDataQuery.data?.examples && (
              <QuizComponent hook={textQuiz} />
            )
          }
        />
        <Route
          path="srsquiz"
          element={
            flashcardDataQuery.data?.examples && (
              <QuizComponent hook={textQuiz} cleanupFunction={hideQuiz} />
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
